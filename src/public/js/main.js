// redirect to login page when token expired
(function checkAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    localStorage.clear();
    window.location.href = "/";
  }
})();

// table sorting
document.addEventListener("click", function (e) {
  const th = e.target.closest("th.sortable");
  if (!th) return;

  const table = th.closest("table");
  const tbody = table.querySelector("tbody");
  const columnIndex = Array.from(th.parentNode.children).indexOf(th);

  const ascending = th.dataset.order !== "asc";

  // reset headers
  th.parentNode.querySelectorAll("th").forEach((h) => {
    h.dataset.order = "";
  });
  th.dataset.order = ascending ? "asc" : "desc";

  const rows = Array.from(tbody.rows);

  rows.sort((a, b) => {
    const cellA = a.cells[columnIndex];
    const cellB = b.cells[columnIndex];

    const valA = getSortValue(cellA);
    const valB = getSortValue(cellB);

    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  rows.forEach((row) => tbody.appendChild(row));
});

function getSortValue(td) {
  if (td.dataset.sortValue) {
    return td.dataset.sortValue.replace(/\s+/g, " ").trim().toLowerCase();
  }

  return td.textContent
    .replace(/[\t\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Global loader
(function injectGlobalLoader() {
  if (document.getElementById("globalLoader")) return;

  const loader = document.createElement("div");
  loader.id = "globalLoader";
  loader.className = "global-loader d-none";
  loader.setAttribute("aria-hidden", "true");

  loader.innerHTML = `<div class="spinner"></div>`;

  document.body.appendChild(loader);
})();

const GlobalLoader = (function () {
  const loader = document.getElementById("globalLoader");
  let requestCount = 0;

  function show() {
    requestCount++;
    loader.classList.remove("d-none");
  }

  function hide() {
    requestCount--;
    if (requestCount <= 0) {
      requestCount = 0;
      loader.classList.add("d-none");
    }
  }

  return {
    show,
    hide,
  };
})();
