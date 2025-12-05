document.querySelectorAll("pre").forEach((block) => {
  // Create button
  const btn = document.createElement("button");
  btn.className = "code-toggle-btn";

  // Start with code hidden
  let visible = false;
  block.classList.add("collapsed");
  btn.innerHTML = `Show Code <span class="arrow-down"></span>`;

  // Insert button BEFORE the <pre>
  block.parentNode.insertBefore(btn, block);

  btn.addEventListener("click", () => {
    visible = !visible;
    block.classList.toggle("collapsed", !visible);

    if (visible) {
      btn.innerHTML = `Hide Code <span class="arrow-up"></span>`;
    } else {
      btn.innerHTML = `Show Code <span class="arrow-down"></span>`;
    }
  });
});
