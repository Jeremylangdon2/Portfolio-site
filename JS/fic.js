// JS/fic.js
// - Loads data from /data/fic.json (preferred) or falls back to <script id="kanban-data">.
// - Respects your updated JSON: strings, arrays (bullets), or {type:"ol"|"ul", items:[...]}.
// - Renders a horizontally scrollable Kanban.
// - Clicking a card opens a scrollable modal showing full ticket details.
// - Hides "Complete (Disneyland)" statuses; strips Contributors/Ticket Owner; filters out owner "Tech Fleet".

(function () {
  // -----------------------------
  // Config
  // -----------------------------
  const DATA_URL = "data/fic.json";
  const ORDER = [
    "Writing Requirements",
    "Reviewing with Team",
    "Sprint Planning",
    "Planned",
    "Sprint In Progress",
    "Client Review",
    "Backlog",
    "Intake",
    "Blocked"
  ];
  const HIDE_STATUSES = new Set(["Complete 🙌 (Disneyland)", "Complete (Disneyland)"]);
  const EXCLUDE_FIELDS = new Set(["Contributors", "Ticket Owner"]); // removed entirely in UI
  const SUMMARY_KEYS   = new Set(["Tickets", "Type", "Status"]);    // shown in headers only

  // Put the long-form sections in the order you want in the modal.
  const PREFERRED_FIELD_ORDER = [
    "User Stories",
    "Background",
    "Problem to Solve",
    "Task Goals",
    "Task Scope",
    "Expected Outcomes",
    "Supported Use Cases",
    "Acceptance Criteria",
    // meta fields you still want visible in modal (optional)
    "Sprint",
    "Function",
    "Consulted",
    "Created",
    "Due",
    "Priority"
  ];

  // Global list of tickets in render order for modal lookup
  const __KANBAN_ROWS__ = [];

  // -----------------------------
  // Load data
  // -----------------------------
  async function loadData() {
    // Try external file first
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
      }
    } catch (_) { /* fall back */ }

    // Fallback to inline script block
    const raw = document.getElementById("kanban-data");
    if (!raw) return [];
    try {
      return JSON.parse(raw.textContent || "[]");
    } catch (e) {
      console.error("Invalid JSON in #kanban-data:", e);
      return [];
    }
  }

  // -----------------------------
  // Utilities
  // -----------------------------
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[s]));
  }

  function linkify(text) {
    return String(text).replace(
      /\b((?:https?:\/\/|mailto:)[^\s<]+)\b/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  // Accepts:
  // - string  => paragraph
  // - array   => bullets (<ul>)
  // - object  => { type: "ol"|"ul", items: [...] }
  function renderValueAsHTML(value) {
    if (value == null) return "";
    if (typeof value === "string") {
      const v = value.trim();
      if (!v) return "";
      return `<p>${linkify(escapeHTML(v))}</p>`;
    }
    if (Array.isArray(value)) {
      if (!value.length) return "";
      return `<ul>${value.map(item => `<li>${escapeHTML(String(item))}</li>`).join("")}</ul>`;
    }
    if (typeof value === "object") {
      const items = Array.isArray(value.items) ? value.items : [];
      if (!items.length) return "";
      const type = (value.type || "ul").toLowerCase() === "ol" ? "ol" : "ul";
      const lis  = items.map(item => `<li>${escapeHTML(String(item))}</li>`).join("");
      return `<${type}>${lis}</${type}>`;
    }
    return "";
  }

  function sectionHTML(title, value) {
    const body = renderValueAsHTML(value);
    if (!body) return "";
    return `<h3>${escapeHTML(title)}</h3>${body}`;
  }

  function ticketToModalHTML(t) {
    // Header line with quick meta
    const metaBits = [];
    if (t["Type"])   metaBits.push(`<strong>${escapeHTML(t["Type"])}</strong>`);
    if (t["Status"]) metaBits.push(escapeHTML(t["Status"]));
    if (t["Sprint"]) metaBits.push(escapeHTML(t["Sprint"]));
    if (t["Created"])metaBits.push(escapeHTML(t["Created"]));
    const metaLine = metaBits.length ? `<p style="opacity:.7;margin:.1rem 0 .8rem 0">${metaBits.join(" · ")}</p>` : "";

    // Preferred sections first, then any others present (alphabetically)
    const preferred = PREFERRED_FIELD_ORDER
      .filter(k => t[k] !== undefined && !EXCLUDE_FIELDS.has(k) && !SUMMARY_KEYS.has(k))
      .map(k => sectionHTML(k, t[k]))
      .join("");

    const others = Object.keys(t)
      .filter(k =>
        !SUMMARY_KEYS.has(k) &&
        !EXCLUDE_FIELDS.has(k) &&
        !PREFERRED_FIELD_ORDER.includes(k) &&
        t[k] !== undefined
      )
      .sort((a,b) => a.localeCompare(b))
      .map(k => sectionHTML(k, t[k]))
      .join("");

    return `
      <h2 id="ficModalTitle" style="margin:0 0 .5rem 0;font-weight:900">
        ${escapeHTML(t["Tickets"] || "")}
      </h2>
      ${metaLine}
      ${preferred}${others}
    `;
  }

  // -----------------------------
  // Modal controls
  // -----------------------------
  function openModal(html) {
    const modal   = document.getElementById("ficModal");
    const content = document.getElementById("ficModalContent");
    if (!modal || !content) return;
    content.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const btn = modal.querySelector(".fic-modal__close");
    if (btn) btn.focus();
  }

  function closeModal() {
    const modal = document.getElementById("ficModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  // -----------------------------
  // Render Kanban
  // -----------------------------
  function renderBoard(data) {
    const root = document.getElementById("kanban-root");
    if (!root) {
      console.error("#kanban-root not found");
      return;
    }
    root.textContent = "";
    __KANBAN_ROWS__.length = 0;

    // Clean per requirements
    const cleaned = data
      .filter(t => (t["Ticket Owner"] || "").trim() !== "Tech Fleet") // drop Tech Fleet tickets entirely
      .map(t => {
        const copy = { ...t };
        for (const k of EXCLUDE_FIELDS) delete copy[k];
        return copy;
      });

    // Group by Status (skip hidden statuses)
    const groups = {};
    for (const row of cleaned) {
      const title  = (row["Tickets"] || "").trim();
      const status = (row["Status"]  || "").trim();
      if (!title || HIDE_STATUSES.has(status)) continue;
      (groups[status] ||= []).push(row);
    }

    // Render columns in desired order
    for (const status of ORDER) {
      const rows = groups[status];
      if (!rows || !rows.length) continue;

      const column = document.createElement("section");
      column.className = "kanban-column";
      column.setAttribute("aria-label", status);

      const head = document.createElement("header");
      head.className = "kanban-col-head";
      head.innerHTML = `${escapeHTML(status)} <span class="count">${rows.length}</span>`;
      column.appendChild(head);

      const body = document.createElement("div");
      body.className = "kanban-col-body";

      for (const t of rows) {
        const card = document.createElement("article");
        card.className = "kanban-card";

        // Summary preview (title + optional type)
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML =
          `${t["Type"] ? `<span class="type">${escapeHTML(t["Type"])}</span>` : ""}` +
          `<span class="title">${escapeHTML(t["Tickets"] || "")}</span>`;
        summary.setAttribute("role", "button");
        summary.setAttribute("aria-expanded", "false");
        summary.tabIndex = 0;
        details.appendChild(summary);

        // Optional small meta preview (keep light)
        const meta = document.createElement("div");
        meta.className = "meta";
        if (t["Sprint"])   meta.innerHTML += `<div><strong>Sprint:</strong> ${escapeHTML(t["Sprint"])}</div>`;
        if (t["Function"]) meta.innerHTML += `<div><strong>Function:</strong> ${escapeHTML(t["Function"])}</div>`;
        if (t["Created"])  meta.innerHTML += `<div><strong>Created:</strong> ${escapeHTML(t["Created"])}</div>`;
        if (meta.innerHTML) details.appendChild(meta);

        card.appendChild(details);

        // Track index for modal
        const ticketIndex = __KANBAN_ROWS__.push(t) - 1;
        card.setAttribute("data-ticket-index", String(ticketIndex));

        body.appendChild(card);
      }

      column.appendChild(body);
      root.appendChild(column);
    }
  }

  // -----------------------------
  // Event wiring
  // -----------------------------
  function wireEvents() {
    // Open modal when a card (or its summary) is clicked
    document.addEventListener("click", function (e) {
      const card = e.target.closest(".kanban-card");
      if (!card) return;
      const idx = card.getAttribute("data-ticket-index");
      if (idx == null) return;

      e.preventDefault();
      e.stopPropagation();

      const t = __KANBAN_ROWS__[Number(idx)];
      if (!t) return;

      openModal(ticketToModalHTML(t));
    });

    // Close modal (overlay or ×)
    document.addEventListener("click", function (e) {
      if (e.target && e.target.hasAttribute("data-close")) {
        e.preventDefault();
        closeModal();
      }
    });

    // ESC to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  (async function init() {
    wireEvents();
    const data = await loadData();
    if (!data.length) {
      console.warn("fic.js: No Kanban data found.");
      return;
    }
    renderBoard(data);
  })();
})();
