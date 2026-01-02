fetch("customersegmentation/extraalearn_sample.json")
  .then(res => res.json())
  .then(data => {
    // Match the SAME pattern as the working case study
    const section = document.querySelector(".describe-table-section");
    if (!section) return;

    const table = document.createElement("table");
    table.className = "describe-table";

    // header
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    data.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    // body
    const tbody = document.createElement("tbody");
    data.rows.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Clear existing content INSIDE the section (like describe-table.js does)
    section.querySelector("pre code").innerHTML = "";
    section.querySelector("pre code").appendChild(table);
  });
