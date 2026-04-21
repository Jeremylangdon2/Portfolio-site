document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = Array.from(document.querySelectorAll(".toc a"));
  if (!tocLinks.length) return;

  const sectionIds = tocLinks
    .map(a => a.getAttribute("href").replace("#", ""))
    .filter(Boolean);

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function activateLink() {
    const offset = 160;
    let current = sections[0]?.id;

    sections.forEach(section => {
      if (window.scrollY + offset >= section.offsetTop) {
        current = section.id;
      }
    });

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      current = sections[sections.length - 1]?.id;
    }

    tocLinks.forEach(link => {
      const target = link.getAttribute("href").slice(1);
      link.classList.toggle("active", target === current);
    });
  }

  // Instant jump — no smooth scroll on TOC clicks
  tocLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "instant" });
      }
      activateLink();
    });
  });

  window.addEventListener("scroll", activateLink, { passive: true });
  activateLink();
});
