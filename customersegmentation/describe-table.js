document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("describe-table");
  if (!container) return;

  fetch("describe.json")
    .then((response) => response.json())
    .then((data) => {
      const stats = ["count", "mean", "std", "min", "25%", "50%", "75%", "max"];
      const columns = Object.keys(data);

      let html = '<table class="describe-table"><thead><tr><th></th>';

      // header row
      for (const col of columns) {
        html += `<th>${col}</th>`;
      }
      html += "</tr></thead><tbody>";

      // body rows
      for (const stat of stats) {
        html += `<tr><th>${stat}</th>`;
        for (const col of columns) {
          const raw = data[col][stat];
          let val = raw;

          // Round only mean and std to 3 decimal places
          if ((stat === "mean" || stat === "std") && typeof raw === "number") {
            val = raw.toFixed(3);
          }

          html += `<td>${val}</td>`;
        }
        html += "</tr>";
      }

      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
      container.textContent = "Could not load summary statistics.";
    });
});
