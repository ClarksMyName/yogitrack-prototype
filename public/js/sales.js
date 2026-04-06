const saleIdSelect = document.getElementById("saleId");
const customerIdInput = document.getElementById("customerId");
const packageIdInput = document.getElementById("packageId");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const amountPaidInput = document.getElementById("amountPaid");

let salesData = [];

async function loadSales() {
  try {
    const response = await fetch("/data/sales.json");
    if (!response.ok) throw new Error("Failed to load sales data");

    salesData = await response.json();
    populateSalesDropdown();
  } catch (error) {
    console.error("Error loading sales:", error);
  }
}

function populateSalesDropdown() {
  saleIdSelect.innerHTML = '<option value="">-- Select Sale --</option>';

  salesData.forEach(sale => {
    const option = document.createElement("option");
    option.value = sale.saleId;
    option.textContent = `Sale ${sale.saleId}`;
    saleIdSelect.appendChild(option);
  });
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return "";
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function displaySaleDetails(saleId) {
  const selectedSale = salesData.find(sale => String(sale.saleId) === String(saleId));

  if (!selectedSale) {
    clearSaleForm();
    return;
  }

  customerIdInput.value = selectedSale.customerId || "";
  packageIdInput.value = selectedSale.Package?.packageId || "";
  startDateInput.value = formatDateForInput(selectedSale.Package?.["start date"]);
  endDateInput.value = formatDateForInput(selectedSale.Package?.["end date"]);
  amountPaidInput.value = selectedSale.Package?.["amount paid"] ?? "";
}

function clearSaleForm() {
  customerIdInput.value = "";
  packageIdInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  amountPaidInput.value = "";
}

saleIdSelect.addEventListener("change", function () {
  displaySaleDetails(this.value);
});

document.addEventListener("DOMContentLoaded", loadSales);