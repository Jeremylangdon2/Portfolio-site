// JS/fic.js — Accordion Kanban board
(function () {
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
  const EXCLUDE_FIELDS = new Set(["Contributors", "Ticket Owner"]);
  const SUMMARY_KEYS   = new Set(["Tickets", "Type", "Status"]);

  const PREFERRED_FIELD_ORDER = [
    "User Stories",
    "Background",
    "Problem to Solve",
    "Task Goals",
    "Task Scope",
    "Expected Outcomes",
    "Supported Use Cases",
    "Acceptance Criteria",
    "Sprint",
    "Function",
    "Consulted",
    "Created",
    "Due",
    "Priority"
  ];

  // -----------------------------
  // Load data
  // -----------------------------
  async function loadData() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
      }
    } catch (_) {}

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
      return `<${type}>${items.map(item => `<li>${escapeHTML(String(item))}</li>`).join("")}</${type}>`;
    }
    return "";
  }

  function sectionHTML(title, value) {
    const body = renderValueAsHTML(value);
    if (!body) return "";
    return `<div class="ticket-section"><h3>${escapeHTML(title)}</h3>${body}</div>`;
  }

  // Builds the accordion body shown when <details> is open
  function ticketBodyHTML(t) {
    const metaBits = [];
    if (t["Type"])    metaBits.push(`<strong>${escapeHTML(t["Type"])}</strong>`);
    if (t["Sprint"])  metaBits.push(escapeHTML(t["Sprint"]));
    if (t["Created"]) metaBits.push(escapeHTML(t["Created"]));
    const metaLine = metaBits.length
      ? `<p class="ticket-meta-line">${metaBits.join(" · ")}</p>`
      : "";

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
      .sort((a, b) => a.localeCompare(b))
      .map(k => sectionHTML(k, t[k]))
      .join("");

    return `<div class="ticket-body">${metaLine}${preferred}${others}</div>`;
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

    const cleaned = data
      .filter(t => (t["Ticket Owner"] || "").trim() !== "Tech Fleet")
      .map(t => {
        const copy = { ...t };
        for (const k of EXCLUDE_FIELDS) delete copy[k];
        return copy;
      });

    const groups = {};
    for (const row of cleaned) {
      const title  = (row["Tickets"] || "").trim();
      const status = (row["Status"]  || "").trim();
      if (!title || HIDE_STATUSES.has(status)) continue;
      (groups[status] ||= []).push(row);
    }

    for (const status of ORDER) {
      const rows = groups[status];
      if (!rows || !rows.length) continue;

      const column = document.createElement("section");
      column.className = "kanban-column";
      column.setAttribute("aria-label", status);

      const head = document.createElement("header");
      head.className = "kanban-col-head";
      head.textContent = status === "Sprint In Progress" ? "Sprint 2 In Progress" : status;
      column.appendChild(head);

      const body = document.createElement("div");
      body.className = "kanban-col-body";

      for (const t of rows) {
        const card = document.createElement("article");
        card.className = "kanban-card";

        const details = document.createElement("details");

        const summary = document.createElement("summary");
        summary.innerHTML =
          `${t["Type"] ? `<span class="type">${escapeHTML(t["Type"])}</span>` : ""}` +
          `<span class="title">${escapeHTML(t["Tickets"] || "")}</span>`;
        details.appendChild(summary);

        // Accordion body — visible when expanded
        details.insertAdjacentHTML("beforeend", ticketBodyHTML(t));

        card.appendChild(details);
        body.appendChild(card);
      }

      column.appendChild(body);
      root.appendChild(column);
    }
  }

  // -----------------------------
  // Init
  // -----------------------------
  (async function init() {
    const data = await loadData();
    if (!data.length) {
      console.warn("fic.js: No Kanban data found. Check that data/fic.json is reachable.");
      return;
    }
    renderBoard(data);
  })();
})();
