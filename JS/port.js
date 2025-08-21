// JS/port.js
(() => {
  // log so you can confirm it loads
  console.log("port.js loaded");

  const container = document.querySelector('.tf-accordion');
  if (!container) return; // nothing to do if the accordion isn't on this page

  container.addEventListener('click', (e) => {
    const summary = e.target.closest('summary');
    if (!summary || !container.contains(summary)) return;

    const details = summary.parentElement;
    // Wait for the native toggle to set details.open, then close siblings
    requestAnimationFrame(() => {
      if (details.open) {
        container.querySelectorAll('details[open]').forEach(d => {
          if (d !== details) d.open = false;
        });
      }
    });
  });
})();
