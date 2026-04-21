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

// Fix only the Duplicate Check code block
const duplicateBlock = document.querySelector("#duplicate-code");

if (duplicateBlock) {
  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";

  // Insert wrapper before the code block
  duplicateBlock.parentNode.insertBefore(wrapper, duplicateBlock);

  // Move code block inside wrapper
  wrapper.appendChild(duplicateBlock);

  // Find the auto-created toggle button for this pre
  const btn = wrapper.querySelector(".code-toggle-btn");

  if (btn) {
    // Move button ABOVE the code block
    wrapper.insertBefore(btn, duplicateBlock);
  }
}
