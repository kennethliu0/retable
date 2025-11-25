// State variables
let isSelecting = false;
let hoveredTable = null;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSelection") {
    startSelectionMode();
  }
});

function startSelectionMode() {
  if (isSelecting) return;
  isSelecting = true;
  document.body.classList.add("tt-selection-mode");

  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
  document.addEventListener("click", handleClick, { capture: true });
  document.addEventListener("keydown", handleEsc);
}

function stopSelectionMode() {
  isSelecting = false;
  document.body.classList.remove("tt-selection-mode");

  if (hoveredTable) {
    hoveredTable.classList.remove("tt-highlight");
    hoveredTable = null;
  }

  document.removeEventListener("mouseover", handleMouseOver);
  document.removeEventListener("mouseout", handleMouseOut);
  document.removeEventListener("click", handleClick, { capture: true });
  document.removeEventListener("keydown", handleEsc);
}

function handleMouseOver(e) {
  const table = e.target.closest("table");
  if (table && table !== hoveredTable) {
    if (hoveredTable) hoveredTable.classList.remove("tt-highlight");
    hoveredTable = table;
    hoveredTable.classList.add("tt-highlight");
  }
}

function handleMouseOut(e) {
  const table = e.target.closest("table");
  if (table && !table.contains(e.relatedTarget)) {
    table.classList.remove("tt-highlight");
    if (hoveredTable === table) hoveredTable = null;
  }
}

function handleClick(e) {
  if (!isSelecting) return;

  const table = e.target.closest("table");
  if (table) {
    e.preventDefault();
    e.stopPropagation();
    stopSelectionMode();
    tameTable(table);
  } else {
    stopSelectionMode();
  }
}

function handleEsc(e) {
  if (e.key === "Escape") {
    stopSelectionMode();
  }
}

// --- Taming Logic ---

function tameTable(table) {
  if (table.classList.contains("tt-tamed")) return;
  table.classList.add("tt-tamed");

  const headerRow = findHeaderRow(table);
  if (!headerRow) {
    console.warn("Retable: Could not find a header row.");
    return;
  }

  // Inject Filter Row
  injectFilterRow(table, headerRow);
}

function findHeaderRow(table) {
  const thead = table.querySelector("thead");
  if (thead && thead.rows.length > 0) {
    return thead.rows[thead.rows.length - 1];
  }

  const firstRow = table.querySelector("tr");
  if (firstRow && !firstRow.closest("tfoot")) {
    return firstRow;
  }

  return null;
}

function injectFilterRow(table, headerRow) {
  const filterRow = document.createElement("tr");
  filterRow.classList.add("tt-filter-row");

  // Find the maximum number of cells in any row of the table
  const allRows = table.querySelectorAll("tr");
  let maxColumns = 0;
  allRows.forEach((row) => {
    if (row.cells.length > maxColumns) {
      maxColumns = row.cells.length;
    }
  });

  // Get header cells for placeholder text
  const headerCells = headerRow.querySelectorAll("th, td");

  // Create one filter input for EACH column
  for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
    const cell = document.createElement("td");

    // Get header text for placeholder (if header cell exists for this column)
    const headerCell = headerCells[colIndex];
    const headerText = headerCell ? headerCell.textContent.trim() : "";

    // Filter input
    const input = document.createElement("input");
    input.type = "text";
    const placeholderText = headerText
      ? `Filter ${headerText.substring(0, 12)}${
          headerText.length > 12 ? "..." : ""
        }`
      : `Filter col ${colIndex + 1}`;
    input.placeholder = placeholderText;
    input.classList.add("tt-filter-input");
    input.dataset.colIndex = colIndex;
    input.addEventListener("input", () => applyFilters(table));

    cell.appendChild(input);
    filterRow.appendChild(cell);
  }

  headerRow.parentNode.insertBefore(filterRow, headerRow.nextSibling);
}

function applyFilters(table) {
  const inputs = Array.from(table.querySelectorAll(".tt-filter-input"));

  // Build a list of active column filters - one filter per column
  const activeFilters = inputs
    .map((input) => ({
      text: input.value.toLowerCase().trim(),
      colIndex: parseInt(input.dataset.colIndex),
    }))
    .filter((f) => f.text.length > 0);

  const rows = getBodyRows(table);

  rows.forEach((row) => {
    let shouldShow = true;

    // Check each active filter against its specific column
    for (const filter of activeFilters) {
      const cell = row.cells[filter.colIndex];

      if (cell) {
        const cellText = cell.textContent.toLowerCase().trim();
        if (!cellText.includes(filter.text)) {
          shouldShow = false;
          break;
        }
      } else {
        // Column doesn't exist in this row
        shouldShow = false;
        break;
      }
    }

    row.style.display = shouldShow ? "" : "none";
  });
}

function getBodyRows(table) {
  const allRows = Array.from(table.querySelectorAll("tr"));

  return allRows.filter((row) => {
    const inThead = row.closest("thead");
    const inTfoot = row.closest("tfoot");
    const isFilterRow = row.classList.contains("tt-filter-row");

    return !inThead && !inTfoot && !isFilterRow;
  });
}
