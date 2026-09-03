import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data, filename) => {
  if (!data || !data.length) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (data, headers, title, filename) => {
  if (!data || !data.length) return;
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  doc.autoTable({
    head: [headers],
    body: data.map(item => headers.map(header => item[header])),
    startY: 20
  });
  doc.save(`${filename}.pdf`);
};

export const printData = (data, headers, title) => {
  if (!data || !data.length) return;
  let printWindow = window.open('', '', 'height=600,width=800');
  let tableHtml = `<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${data.map(item => `<tr>${headers.map(h => `<td>${item[h] !== undefined && item[h] !== null ? item[h] : ''}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>`;
  
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>body{font-family: Arial, sans-serif; padding: 20px;} th{text-align: left; background: #eee;} h1{text-align: center;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(`<h1>${title}</h1>`);
  printWindow.document.write(tableHtml);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
