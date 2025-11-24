document.addEventListener("DOMContentLoaded", () => {
  // Use the main section headings as "section starts"
  const sections = [
  document.getElementById("start"),
  document.getElementById("overview"),
  document.getElementById("eda"),
  document.getElementById("clustering"),
  document.getElementById("profiling"),
  document.getElementById("business"),
  document.getElementById("summary")
].filter(Boolean);

  const tocLinks = document.querySelectorAll(".toc a");

  function activateLink() {
    const offset = 160; // how far from top before we "enter" a section
    let current = sections[0]?.id;

    sections.forEach(section => {
      if (window.scrollY + offset >= section.offsetTop) {
        current = section.id;
      }
    });

      // If we're at (or very near) the bottom of the page, force "summary"
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    current = "summary";
  }


   // ...inside activateLink stays the same...

  tocLinks.forEach(link => {
    const target = link.getAttribute("href").slice(1);
    link.classList.toggle("active", target === current);
  });
}

let scrollTimeout;

window.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(activateLink, 120);
});

window.addEventListener("load", activateLink);
});