/**
 * Portfolio Chat Widget
 *
 * Embeds a floating chat bubble into any HTML page.
 * Usage:
 *   <script src="widget.js" data-worker-url="https://your-worker.workers.dev"></script>
 *
 * No dependencies. No frameworks.
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────

  const script = document.currentScript;
  const WORKER_URL = script?.dataset?.workerUrl;
  const PAGE_CONTEXT = script?.dataset?.pageContext || document.title || 'portfolio';

  if (!WORKER_URL) {
    console.error('[ChatWidget] Missing data-worker-url attribute on <script> tag.');
    return;
  }

  // Conversation history sent to the Worker on every request for multi-turn context.
  // Each entry: { role: 'user' | 'assistant', content: string }
  const history = [];

  // ── Build DOM ────────────────────────────────────────────────────────────────

  const root = document.createElement('div');
  root.id = 'cw-root';
  root.innerHTML = `
    <button id="cw-bubble" aria-label="Open chat" title="Chat with me">
      <svg id="cw-icon-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
      </svg>
      <svg id="cw-icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style="display:none">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <div id="cw-panel" role="dialog" aria-label="Chat" aria-hidden="true">
      <div id="cw-header">
        <span id="cw-header-title">Ask me anything</span>
        <button id="cw-close-btn" aria-label="Close chat">✕</button>
      </div>
      <div id="cw-messages" aria-live="polite" aria-atomic="false"></div>
      <div id="cw-input-row">
        <textarea
          id="cw-input"
          placeholder="Type a message…"
          rows="1"
          aria-label="Message input"
          maxlength="2000"
        ></textarea>
        <button id="cw-send" aria-label="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // Grab element references after inserting into DOM
  const bubble    = document.getElementById('cw-bubble');
  const panel     = document.getElementById('cw-panel');
  const iconOpen  = document.getElementById('cw-icon-open');
  const iconClose = document.getElementById('cw-icon-close');
  const closeBtn  = document.getElementById('cw-close-btn');
  const messages  = document.getElementById('cw-messages');
  const input     = document.getElementById('cw-input');
  const sendBtn   = document.getElementById('cw-send');

  // ── Panel open / close ───────────────────────────────────────────────────────

  let isOpen = false;

  function openPanel() {
    isOpen = true;
    panel.classList.add('cw-open');
    panel.setAttribute('aria-hidden', 'false');
    iconOpen.style.display  = 'none';
    iconClose.style.display = '';
    input.focus();

    // Show welcome message on first open
    if (messages.children.length === 0) {
      appendMessage('assistant', "Hi! I'm here to answer questions about my background and work. What would you like to know?");
    }
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('cw-open');
    panel.setAttribute('aria-hidden', 'true');
    iconOpen.style.display  = '';
    iconClose.style.display = 'none';
  }

  bubble.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // ── Message rendering ────────────────────────────────────────────────────────

  /**
   * Append a chat bubble to the message list.
   * @param {'user'|'assistant'} role
   * @param {string} text
   * @returns {HTMLElement} the created bubble element
   */
  function renderMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<strong>$1</strong>')
      .replace(/^# (.+)$/gm, '<strong>$1</strong>')
      .replace(/^\* (.+)$/gm, '• $1')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `cw-msg cw-msg-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble';
    if (role === 'assistant') {
      bubble.innerHTML = renderMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  /** Show an animated typing indicator while waiting for the API response. */
  function showTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'cw-msg cw-msg-assistant';
    wrap.id = 'cw-typing';
    wrap.innerHTML = `
      <div class="cw-bubble cw-typing-indicator">
        <span></span><span></span><span></span>
      </div>`;
    messages.appendChild(wrap);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('cw-typing');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Auto-resize textarea ─────────────────────────────────────────────────────

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // ── Send logic ───────────────────────────────────────────────────────────────

  let isSending = false;

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    appendMessage('user', text);
    showTypingIndicator();

    try {
      const response = await fetch(`${WORKER_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, page: PAGE_CONTEXT }),
      });

      hideTypingIndicator();

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        appendMessage('assistant', err.error || 'Something went wrong. Please try again.');
        return;
      }

      const { reply } = await response.json();

      // Update history for multi-turn context
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: reply });

      appendMessage('assistant', reply);
    } catch (err) {
      hideTypingIndicator();
      appendMessage('assistant', 'Network error — please check your connection and try again.');
      console.error('[ChatWidget] fetch error:', err);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  // Send on Enter (Shift+Enter inserts newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
