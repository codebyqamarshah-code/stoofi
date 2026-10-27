import * as XLSX from 'xlsx';

/**
 * Export data array to Excel (.xlsx) file
 * @param {Array<Object>} data
 * @param {string} fileName
 * @param {string} sheetName
 */
export function exportToExcel(data, fileName = 'Accounts_Export', sheetName = 'Sheet1') {
  if (!data || !data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export data array to CSV file
 * @param {Array<Object>} data
 * @param {string} fileName
 */
export function exportToCSV(data, fileName = 'Accounts_Export') {
  if (!data || !data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format currency in Pakistani Rupees (PKR)
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
