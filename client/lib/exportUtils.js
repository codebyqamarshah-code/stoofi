import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Clean & Format Excel (.xlsx) Export
 * - Calculates auto-width for each column so no text is truncated.
 * - Standardizes headers and formats data cleanly.
 */
export const exportToExcel = (data, filename = 'Export', sheetName = 'Data') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Create worksheet from JSON
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths based on maximum content length
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map((key) => {
    let maxLen = key.toString().length;
    for (let i = 0; i < data.length; i++) {
      const val = data[i][key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);
        if (strVal.length > maxLen) {
          maxLen = Math.min(strVal.length, 50); // Cap at 50 chars for clean columns
        }
      }
    }
    return { wch: Math.max(maxLen + 3, 12) }; // Minimum 12 width, padding +3
  });

  ws['!cols'] = colWidths;

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Download .xlsx
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/**
 * Export to CSV with UTF-8 BOM
 * Ensures special characters, Urdu, and accents display properly in Microsoft Excel.
 */
export const exportToCSV = (data, filename = 'Export') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  // Prepend UTF-8 BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Export to PDF with Stoofi ERP Header & Styling
 * Polymorphic: handles (data, headers, title, filename) or (data, filename, title)
 */
export const exportToPDF = (data, headersOrFilename, titleOrHeaders, maybeFilename) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  let headers = [];
  let title = 'STOOFI ERP - DATA REPORT';
  let filename = 'Report';

  if (Array.isArray(headersOrFilename)) {
    headers = headersOrFilename;
    title = typeof titleOrHeaders === 'string' ? titleOrHeaders : 'STOOFI ERP REPORT';
    filename = maybeFilename || 'Export';
  } else if (typeof headersOrFilename === 'string') {
    filename = headersOrFilename;
    title = typeof titleOrHeaders === 'string' ? titleOrHeaders : filename.replace(/_/g, ' ').toUpperCase();
    headers = Object.keys(data[0] || {});
  } else {
    headers = Object.keys(data[0] || {});
    title = 'STOOFI ERP REPORT';
    filename = 'Export';
  }

  if (!headers || headers.length === 0) {
    headers = Object.keys(data[0] || {});
  }

  const doc = new jsPDF({
    orientation: headers.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Stoofi Branded Top Banner
  doc.setFillColor(9, 9, 11); // Black / zinc-950
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('STOOFI SCHOOL MANAGEMENT ERP', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const nowStr = new Date().toLocaleString();
  doc.text(`Generated: ${nowStr}`, doc.internal.pageSize.getWidth() - 14, 11, { align: 'right' });

  // Document Title
  doc.setTextColor(24, 24, 27);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 113, 122);
  doc.text(`Total Records: ${data.length}`, 14, 34);

  // Table
  doc.autoTable({
    head: [headers],
    body: data.map(item => headers.map(header => (item[header] !== undefined && item[header] !== null ? String(item[header]) : '-'))),
    startY: 38,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [39, 39, 42],
      lineColor: [228, 228, 231],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Print Utility with Stoofi ERP Official Layout
 * Polymorphic: handles printData(title, data) or printData(data, headers, title)
 */
export const printData = (arg1, arg2, arg3) => {
  let data = [];
  let headers = [];
  let title = 'STOOFI SCHOOL ERP REPORT';

  if (Array.isArray(arg1)) {
    data = arg1;
    headers = Array.isArray(arg2) ? arg2 : Object.keys(data[0] || {});
    title = typeof arg3 === 'string' ? arg3 : 'STOOFI ERP - OFFICIAL REPORT';
  } else if (typeof arg1 === 'string' && Array.isArray(arg2)) {
    title = arg1;
    data = arg2;
    headers = Array.isArray(arg3) ? arg3 : Object.keys(data[0] || {});
  } else {
    data = Array.isArray(arg2) ? arg2 : [];
    headers = Object.keys(data[0] || {});
    title = typeof arg1 === 'string' ? arg1 : 'STOOFI ERP REPORT';
  }

  if (!data || !data.length) {
    alert('No data available to print.');
    return;
  }

  const printWindow = window.open('', '_blank', 'height=700,width=950');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups for this site to print.');
    return;
  }

  const dateStr = new Date().toLocaleString();

  const tableHtml = `
    <table class="report-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map((item, idx) => `
          <tr>
            <td style="text-align: center; color: #71717a; font-weight: bold;">${idx + 1}</td>
            ${headers.map(h => `<td>${item[h] !== undefined && item[h] !== null && String(item[h]).trim() !== '' ? item[h] : '-'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - Stoofi ERP</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #09090b;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 11px;
          }
          .header-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #09090b;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand-title {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .brand-subtitle {
            font-size: 10px;
            color: #52525b;
            margin: 2px 0 0 0;
          }
          .meta-info {
            text-align: right;
            font-size: 10px;
            color: #52525b;
          }
          .meta-info strong {
            color: #09090b;
          }
          .report-heading {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 12px;
            text-transform: uppercase;
            color: #18181b;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          .report-table th {
            background-color: #18181b;
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #18181b;
            text-transform: uppercase;
            font-size: 9.5px;
            letter-spacing: 0.5px;
          }
          .report-table td {
            padding: 7px 10px;
            border: 1px solid #e4e4e7;
          }
          .report-table tr:nth-child(even) {
            background-color: #fafafa;
          }
          .footer-note {
            margin-top: 24px;
            border-top: 1px solid #e4e4e7;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #71717a;
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <div>
            <h1 class="brand-title">STOOFI SCHOOL MANAGEMENT ERP</h1>
            <p class="brand-subtitle">Official Student & Institutional Academic Records</p>
          </div>
          <div class="meta-info">
            <div>Printed on: <strong>${dateStr}</strong></div>
            <div>Total Records: <strong>${data.length}</strong></div>
          </div>
        </div>

        <div class="report-heading">${title}</div>

        ${tableHtml}

        <div class="footer-note">
          <span>Official Document generated via Stoofi ERP.</span>
          <span>Confidential &copy; ${new Date().getFullYear()} Stoofi PRO.</span>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Trigger print after resources load
  setTimeout(() => {
    printWindow.print();
  }, 400);
};
