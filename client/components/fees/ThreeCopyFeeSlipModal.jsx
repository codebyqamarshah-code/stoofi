'use client';

import React, { useState } from 'react';
import { Printer, Download, X, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateDMY } from '@/lib/utils';
import { jsPDF } from 'jspdf';

const COPIES = [
  { num: '1', label: 'Student Copy' },
  { num: '2', label: 'Bank Copy' },
  { num: '3', label: 'College Copy' }
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatBillingMonthLabel(ym) {
  if (!ym) {
    const now = new Date();
    return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  }
  const parts = String(ym).split('-');
  if (parts.length === 2) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    if (m >= 0 && m < 12 && y > 1900) {
      return `${MONTH_NAMES[m]} ${y}`;
    }
  }
  return ym;
}

export function numberToWordsPKR(num) {
  const n = Math.round(Math.abs(Number(num) || 0));
  if (n === 0) return 'Zero Rupees Only.';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const twoDigits = (val) => {
    if (val < 20) return ones[val];
    const t = Math.floor(val / 10);
    const o = val % 10;
    return `${tens[t]}${o ? ' ' + ones[o] : ''}`;
  };

  const threeDigits = (val) => {
    const h = Math.floor(val / 100);
    const rem = val % 100;
    let res = '';
    if (h > 0) res += `${ones[h]} Hundred`;
    if (rem > 0) res += `${res ? ' ' : ''}${twoDigits(rem)}`;
    return res;
  };

  let remaining = n;
  const parts = [];

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crore > 0) parts.push(`${threeDigits(crore)} Crore`);

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakh > 0) parts.push(`${twoDigits(lakh)} Lakh`);

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousand > 0) parts.push(`${twoDigits(thousand)} Thousand`);

  if (remaining > 0) parts.push(threeDigits(remaining));

  return `${parts.join(' ')} Rupees Only.`;
}

function BarcodeGraphic({ code = '31428' }) {
  const bars = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2];
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-stretch h-6 gap-[1.5px] bg-white px-1 py-0.5">
        {bars.map((w, idx) => (
          <div
            key={idx}
            className="bg-black"
            style={{ width: `${w * 1.3}px`, height: '100%' }}
          />
        ))}
      </div>
      <span className="text-[8px] font-mono tracking-widest text-zinc-700 leading-none mt-0.5">
        *{code}*
      </span>
    </div>
  );
}

async function loadImageDataUrl(url) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 200;
          canvas.height = img.naturalHeight || 200;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (_) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch (_) {
      resolve(null);
    }
  });
}

export default function ThreeCopyFeeSlipModal({
  isOpen,
  onClose,
  slipData,
  schoolSetting
}) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !slipData) return null;

  const challanNo =
    slipData.challanNo ||
    slipData.invoiceNo?.replace(/^INV-\d+-/i, '') ||
    slipData._id?.slice(-5)?.toUpperCase() ||
    '31428';

  const issueDateDMY = formatDateDMY(slipData.date || new Date());
  const dueDateDMY = slipData.dueDate
    ? formatDateDMY(slipData.dueDate)
    : formatDateDMY(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));

  const billingMonthLabel = formatBillingMonthLabel(slipData.billingMonth);
  const studentName = slipData.student || slipData.studentName || 'Student';
  const fatherName = slipData.fatherName || '—';
  const admissionNo = slipData.admissionNo || 'N/A';
  const rollNo = slipData.rollNo || '';
  const regRollDisplay = rollNo && rollNo !== '—' ? `${admissionNo} / ${rollNo}` : admissionNo;
  const classDisplay = slipData.className || '—';

  let feeItems = [];
  if (Array.isArray(slipData.feeItems) && slipData.feeItems.length > 0) {
    feeItems = slipData.feeItems.filter((it) => it && (it.head || Number(it.amount) > 0));
  } else {
    // Synthesize structured fee heads from slipData / student fields if present
    const adm = Number(slipData.feeAdmission ?? slipData.admissionFee ?? 0);
    const tui = Number(slipData.feeTuition ?? slipData.tuitionFee ?? 0);
    const tra = Number(slipData.feeTransport ?? slipData.transportFee ?? 0);
    const sec = Number(slipData.feeSecurity ?? slipData.securityDeposit ?? 0);
    const exm = Number(slipData.feeExam ?? slipData.examFee ?? 0);
    const oth = Number(slipData.feeOther ?? slipData.labFee ?? 0);

    if (adm > 0) feeItems.push({ head: 'Admission Fee', amount: adm });
    if (tui > 0) feeItems.push({ head: slipData.feeCriteria === 'Semester' ? 'Semester Tuition Fee' : (slipData.feeCriteria === 'Annual' ? 'Annual Tuition Fee' : 'Monthly Tuition Fee'), amount: tui });
    if (tra > 0) feeItems.push({ head: 'Transport Fee', amount: tra });
    if (sec > 0) feeItems.push({ head: 'Security Deposit (Refundable)', amount: sec });
    if (exm > 0) feeItems.push({ head: 'Examination Fee', amount: exm });
    if (oth > 0) feeItems.push({ head: 'Lab / Library Fee', amount: oth });

    if (feeItems.length === 0) {
      feeItems.push({
        head: slipData.feeType || 'Monthly Tuition Fee',
        amount: Number(slipData.amount) || 0
      });
    }
  }

  const grossAmount = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || Number(slipData.amount) || 0;
  const waiver = Number(slipData.waiver || slipData.concessionDiscount || 0);
  const fine = Number(slipData.fine) || 0;
  const netReceivable = Math.max(0, grossAmount - waiver + fine);
  const paidAmount = Number(slipData.paid) || 0;
  const balanceAmount =
    slipData.balance !== undefined
      ? Number(slipData.balance) || 0
      : Math.max(0, netReceivable - paidAmount);

  const statusUpper = String(slipData.status || (balanceAmount <= 0 && paidAmount > 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid')).toUpperCase();
  const amountInWords = numberToWordsPKR(netReceivable);
  const printTimestamp = `${formatDateDMY(new Date())} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const collegeName = 'PAK ROYAL COLLEGE';
  const accountSubtitle =
    schoolSetting?.bankAccountTitle ||
    'PAK ROYAL COLLEGE OFFICIAL FEE COLLECTION ACCOUNT';
  const campusAddress =
    'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';

  // Print ONLY the 3-Copy Slip in a clean A4 Landscape window
  const handlePrintSlip = () => {
    const printEl = document.getElementById('pak-royal-three-copy-slip');
    if (!printEl) {
      window.print();
      return;
    }

    const origin = window.location.origin;
    const htmlContent = printEl.innerHTML.replace(/src="\//g, `src="${origin}/`);

    const printWin = window.open('', '_blank', 'width=1200,height=800');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Fee Challan Slip - ${studentName} (${challanNo})</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 landscape;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #000000;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 287mm; margin: 0 auto;">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 450);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Download crisp A4 Landscape 3-Copy Fee Slip PDF
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const badgeDataUrl = await loadImageDataUrl('/pak-royal-badge.png');
      const pageW = 297;
      const pageH = 210;
      const marginX = 6;
      const marginY = 6;
      const usableW = pageW - marginX * 2;
      const colW = usableW / 3;

      COPIES.forEach((copy, idx) => {
        const x0 = marginX + idx * colW;
        const pad = 3.5;
        const cx = x0 + pad;
        const cw = colW - pad * 2;

        // Dashed vertical cut line between copies
        if (idx < 2) {
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.35);
          doc.setLineDashPattern([2, 2], 0);
          doc.line(x0 + colW, marginY, x0 + colW, pageH - marginY);
          doc.setLineDashPattern([], 0);
        }

        let y = marginY + 4;

        // Copy Number & Copy Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(copy.num, cx, y + 1);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(copy.label, cx + 5.5, y);

        // Simulated Barcode on top right
        const barStartX = cx + cw - 28;
        const barPattern = [0.8, 0.4, 1.2, 0.4, 0.8, 0.4, 0.4, 1.2, 0.8, 0.4, 0.8, 1.2, 0.4, 0.8, 0.4, 1.1, 0.5, 0.8];
        let bx = barStartX;
        doc.setFillColor(0, 0, 0);
        barPattern.forEach((bw, bIdx) => {
          if (bIdx % 2 === 0) {
            doc.rect(bx, y - 4, bw, 5.5, 'F');
          }
          bx += bw + 0.45;
        });

        y += 5;

        // Pak Royal College Badge & Header
        if (badgeDataUrl) {
          try {
            doc.addImage(badgeDataUrl, 'PNG', cx, y, 13, 13);
          } catch (_) {}
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(8, 74, 134);
        doc.text(collegeName, cx + cw / 2 + 4, y + 3.8, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.0);
        doc.setTextColor(40, 40, 40);
        const addrLines = doc.splitTextToSize(campusAddress, cw - 15);
        doc.text(addrLines, cx + cw / 2 + 4, y + 7.0, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(70, 70, 70);
        doc.text(accountSubtitle, cx + cw / 2 + 4, y + 11.8, { align: 'center' });

        y += 15.5;

        // Main Bordered Table Box
        const boxTop = y;
        doc.setDrawColor(20, 20, 20);
        doc.setLineWidth(0.35);

        // Row 1: Challan No & Status
        const rowH = 5.6;
        doc.rect(cx, y, cw, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`Challan No.  ${challanNo}`, cx + 1.8, y + 3.9);
        doc.setFontSize(7);
        doc.text(`[${statusUpper}]`, cx + cw - 1.8, y + 3.9, { align: 'right' });
        y += rowH;

        // Row 2: Billing Month & Due Date
        doc.rect(cx, y, cw, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.text(`Month: ${billingMonthLabel}`, cx + 1.8, y + 3.9);
        doc.text(`Due Date: ${dueDateDMY}`, cx + cw - 1.8, y + 3.9, { align: 'right' });
        y += rowH;

        // Row 3: Reg./Roll No & Issue Date
        doc.rect(cx, y, cw, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.text(`Reg./Roll No: ${regRollDisplay}`, cx + 1.8, y + 3.9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${issueDateDMY}`, cx + cw - 1.8, y + 3.9, { align: 'right' });
        y += rowH;

        // Row 4: Student Name
        doc.rect(cx, y, cw, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`Name: ${studentName}`, cx + 1.8, y + 3.9);
        y += rowH;

        // Row 5: Father Name & Class
        doc.rect(cx, y, cw, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(`Father: ${fatherName}`, cx + 1.8, y + 3.9);
        doc.text(`Class: ${classDisplay}`, cx + cw - 1.8, y + 3.9, { align: 'right' });
        y += rowH;

        // Fee Heads Header
        const amtColW = 24;
        const headColW = cw - amtColW;
        doc.setFillColor(242, 244, 247);
        doc.rect(cx, y, cw, rowH, 'FD');
        doc.line(cx + headColW, y, cx + headColW, y + rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('Head', cx + 1.8, y + 3.9);
        doc.text('Amount (Rs.)', cx + cw - 1.8, y + 3.9, { align: 'right' });
        y += rowH;

        // Fee Items Area (fixed height body like bank challan)
        const itemsAreaH = 42;
        doc.rect(cx, y, cw, itemsAreaH);
        doc.line(cx + headColW, y, cx + headColW, y + itemsAreaH);

        let itemY = y + 4.2;
        feeItems.forEach((it) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.text(String(it.head || 'Fee'), cx + 1.8, itemY);
          doc.setFont('helvetica', 'bold');
          doc.text(Number(it.amount || 0).toLocaleString(), cx + cw - 1.8, itemY, { align: 'right' });
          doc.setDrawColor(225, 225, 225);
          doc.line(cx, itemY + 1.4, cx + cw, itemY + 1.4);
          itemY += 5.4;
        });
        doc.setDrawColor(20, 20, 20);
        y += itemsAreaH;

        // Summary Rows: Waiver, Fine, Paid, Balance
        const summaryRows = [
          ...(waiver > 0 ? [{ label: 'Scholarship / Discount', val: `-${waiver.toLocaleString()}` }] : []),
          { label: 'Late Fee / Fine', val: fine > 0 ? `+${fine.toLocaleString()}` : '0' },
          { label: 'Amount Paid', val: paidAmount.toLocaleString() },
          { label: 'Balance Due', val: balanceAmount.toLocaleString() }
        ];

        summaryRows.forEach((sr) => {
          const sRowH = 5;
          doc.rect(cx, y, cw, sRowH);
          doc.line(cx + headColW, y, cx + headColW, y + sRowH);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.8);
          doc.text(sr.label, cx + 1.8, y + 3.5);
          doc.setFont('helvetica', 'bold');
          doc.text(`Rs. ${sr.val}`, cx + cw - 1.8, y + 3.5, { align: 'right' });
          y += sRowH;
        });

        // Total Receivable Shaded Row
        const totalRowH = 6.5;
        doc.setFillColor(215, 220, 228);
        doc.rect(cx, y, cw, totalRowH, 'FD');
        doc.line(cx + headColW, y, cx + headColW, y + totalRowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('Total Receivable', cx + 1.8, y + 4.4);
        doc.text(`Rs. ${netReceivable.toLocaleString()}`, cx + cw - 1.8, y + 4.4, { align: 'right' });
        y += totalRowH;

        // Outer thicker border around table
        doc.setLineWidth(0.45);
        doc.rect(cx, boxTop, cw, y - boxTop);
        doc.setLineWidth(0.3);

        // In Words
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        const wordsLines = doc.splitTextToSize(`In Words: ${amountInWords}`, cw);
        doc.text(wordsLines, cx, y);
        y += wordsLines.length * 3.5 + 2.5;

        // Depositor Lines
        const depFields = [
          { label: 'Mode of Deposit:', value: slipData.paymentMethod || 'Cash / Bank' },
          { label: "Depositor's Name & CNIC:", value: '' },
          { label: 'Tel/Mobile No.:', value: '' },
          { label: 'Signature of Depositor:', value: '' }
        ];

        depFields.forEach((df) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.3);
          doc.text(df.label, cx, y);
          const labelW = 30;
          if (df.value) {
            doc.setFont('helvetica', 'bold');
            doc.text(df.value, cx + labelW + 2, y - 0.4);
          }
          doc.line(cx + labelW, y + 0.6, cx + cw, y + 0.6);
          y += 5.2;
        });

        // Terms / Notice Paragraph
        y += 1;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.3);
        doc.setTextColor(60, 60, 60);
        const noticeText =
          'This Challan form / Deposit Slip is valid for Cash or Bank Deposit at the designated counter. Please ensure you receive a stamped and signed receipt before leaving the fee counter.';
        const noticeLines = doc.splitTextToSize(noticeText, cw);
        doc.text(noticeLines, cx, y);

        // Signatures at bottom
        const sigY = pageH - marginY - 7;
        doc.setDrawColor(40, 40, 40);
        doc.line(cx, sigY - 3, cx + 28, sigY - 3);
        doc.line(cx + cw - 28, sigY - 3, cx + cw, sigY - 3);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(20, 20, 20);
        doc.text('Cashier / Officer', cx, sigY);
        doc.text('Authorized Signatory', cx + cw, sigY, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(90, 90, 90);
        doc.text('Pak Royal College Official Slip', cx, sigY + 3.5);
        doc.text(`Print Date: ${printTimestamp}`, cx + cw, sigY + 3.5, { align: 'right' });
      });

      const safeName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Fee_Slip_${admissionNo}_${safeName}_${challanNo}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to download PDF. You can also use Print Slip -> Save as PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-[1180px] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="px-5 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/pak-royal-badge.png"
              alt="Pak Royal College"
              className="h-8 w-8 object-contain"
            />
            <div>
              <h3 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                Pak Royal College — 3-Copy Official Fee Challan / Slip
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    statusUpper === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : statusUpper === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {statusUpper}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                1. Student Copy &bull; 2. Bank Copy &bull; 3. College Copy ({billingMonthLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white text-xs font-bold h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? 'Downloading PDF...' : 'Download Slip (PDF)'}
            </Button>

            <Button
              onClick={handlePrintSlip}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print 3-Copy Slip
            </Button>

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-200/70 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable 3-Copy Slip Container */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto bg-zinc-100/70 flex-1">
          <div
            id="pak-royal-three-copy-slip"
            className="bg-white text-black mx-auto shadow-md border border-zinc-300 p-4 min-w-[980px] max-w-[1120px]"
          >
            <div className="grid grid-cols-3">
              {COPIES.map((copy, copyIdx) => (
                <div
                  key={copy.num}
                  className={`px-3.5 py-2 flex flex-col justify-between ${
                    copyIdx < 2 ? 'border-r-2 border-dashed border-zinc-500' : ''
                  }`}
                >
                  <div>
                    {/* Top Row: Copy Number + Title + Barcode */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black leading-none text-zinc-950">
                          {copy.num}
                        </span>
                        <span className="text-xs font-bold text-zinc-800 tracking-tight">
                          {copy.label}
                        </span>
                      </div>
                      <BarcodeGraphic code={challanNo} />
                    </div>

                    {/* College Header with Pak Royal College Badge */}
                    <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-zinc-300">
                      <img
                        src="/pak-royal-badge.png"
                        alt="Pak Royal College Badge"
                        className="h-12 w-12 object-contain shrink-0"
                      />
                      <div className="flex-1 text-center">
                        <div className="text-xs font-black uppercase tracking-tight text-[#084A86] leading-tight">
                          {collegeName}
                        </div>
                        <div className="text-[9.5px] font-bold text-zinc-800 leading-tight mt-0.5">
                          {campusAddress}
                        </div>
                        <div className="text-[8.5px] font-semibold text-zinc-600 uppercase leading-tight mt-0.5">
                          {accountSubtitle}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                            statusUpper === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              : statusUpper === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-800 border-amber-400'
                              : 'bg-rose-50 text-rose-800 border-rose-400'
                          }`}
                        >
                          {statusUpper}
                        </span>
                      </div>
                    </div>

                    {/* Main Boxed Challan Info & Fee Breakdown */}
                    <div className="border-2 border-zinc-900 text-[11px]">
                      {/* Challan No & Month */}
                      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-900 font-bold bg-zinc-50/70">
                        <span>Challan No. {challanNo}</span>
                        <span className="text-[10px] uppercase text-[#084A86] font-extrabold">
                          {billingMonthLabel}
                        </span>
                      </div>

                      {/* Issue Date & Due Date */}
                      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-900 text-[10.5px]">
                        <span>
                          <strong>Issue Date:</strong> {issueDateDMY}
                        </span>
                        <span>
                          <strong>Due Date:</strong> {dueDateDMY}
                        </span>
                      </div>

                      {/* Reg / Roll No */}
                      <div className="px-2 py-1 border-b border-zinc-900">
                        <strong>Reg./Roll No:</strong>{' '}
                        <span className="font-mono font-bold">{regRollDisplay}</span>
                      </div>

                      {/* Student Name */}
                      <div className="px-2 py-1 border-b border-zinc-900">
                        <strong>Name:</strong>{' '}
                        <span className="font-bold uppercase">{studentName}</span>
                      </div>

                      {/* Father Name & Class */}
                      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-900 text-[10.5px]">
                        <span className="truncate pr-1">
                          <strong>Father:</strong> {fatherName}
                        </span>
                        <span className="font-bold shrink-0">
                          {classDisplay}
                        </span>
                      </div>

                      {/* Fee Heads Table */}
                      <table className="w-full border-collapse text-[10.5px]">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-100 font-extrabold">
                            <th className="text-left px-2 py-1 border-r border-zinc-900">
                              Head
                            </th>
                            <th className="text-right px-2 py-1 w-24">
                              Amount (Rs.)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeItems.map((item, iIdx) => (
                            <tr key={iIdx} className="border-b border-zinc-200">
                              <td className="px-2 py-1 border-r border-zinc-900 font-medium text-zinc-900">
                                {item.head}
                              </td>
                              <td className="px-2 py-1 text-right font-mono font-bold text-zinc-950">
                                {Number(item.amount || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}

                          {/* Blank filler rows to maintain classic bank challan height */}
                          {Array.from({ length: Math.max(1, 5 - feeItems.length) }).map((_, emptyIdx) => (
                            <tr key={`filler-${emptyIdx}`} className="h-5">
                              <td className="px-2 border-r border-zinc-900" />
                              <td className="px-2" />
                            </tr>
                          ))}

                          {/* Summary Rows */}
                          {waiver > 0 && (
                            <tr className="border-t border-zinc-900 border-b border-zinc-300 bg-amber-50/50">
                              <td className="px-2 py-0.5 border-r border-zinc-900 font-semibold text-amber-900">
                                Scholarship / Discount
                              </td>
                              <td className="px-2 py-0.5 text-right font-mono font-bold text-amber-900">
                                -Rs. {waiver.toLocaleString()}
                              </td>
                            </tr>
                          )}
                          <tr className={`${waiver > 0 ? '' : 'border-t border-zinc-900'} border-b border-zinc-300`}>
                            <td className="px-2 py-0.5 border-r border-zinc-900 font-semibold">
                              Late Fee / Fine
                            </td>
                            <td className="px-2 py-0.5 text-right font-mono">
                              {fine > 0 ? `+${fine.toLocaleString()}` : '—'}
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-300">
                            <td className="px-2 py-0.5 border-r border-zinc-900 font-semibold">
                              Payment Received
                            </td>
                            <td className="px-2 py-0.5 text-right font-mono font-bold text-emerald-800">
                              Rs. {paidAmount.toLocaleString()}
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-900">
                            <td className="px-2 py-0.5 border-r border-zinc-900 font-semibold">
                              Remaining Balance
                            </td>
                            <td className="px-2 py-0.5 text-right font-mono font-bold text-rose-700">
                              Rs. {balanceAmount.toLocaleString()}
                            </td>
                          </tr>

                          {/* Shaded Total Row */}
                          <tr className="bg-zinc-200 font-extrabold text-xs">
                            <td className="px-2 py-1.5 border-r border-zinc-900 text-zinc-950">
                              Total Receivable
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono text-zinc-950">
                              Rs. {netReceivable.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Amount In Words */}
                    <div className="mt-2 text-[10.5px] font-extrabold text-zinc-950 leading-snug">
                      In Words: {amountInWords}
                    </div>

                    {/* Depositor Details Lines */}
                    <div className="mt-2.5 space-y-2 text-[10px] text-zinc-900">
                      <div className="flex items-end gap-1.5">
                        <span className="shrink-0 font-semibold w-28">Mode of Deposit:</span>
                        <div className="flex-1 border-b border-zinc-800 font-bold px-1 leading-tight">
                          {slipData.paymentMethod || 'Cash / Bank'}
                        </div>
                      </div>
                      <div className="flex items-end gap-1.5">
                        <span className="shrink-0 font-semibold w-28">Depositor&apos;s Name &amp; CNIC:</span>
                        <div className="flex-1 border-b border-zinc-800 h-3.5" />
                      </div>
                      <div className="flex items-end gap-1.5">
                        <span className="shrink-0 font-semibold w-28">Tel/Mobile No.:</span>
                        <div className="flex-1 border-b border-zinc-800 h-3.5" />
                      </div>
                      <div className="flex items-end gap-1.5">
                        <span className="shrink-0 font-semibold w-28">Signature of Depositor:</span>
                        <div className="flex-1 border-b border-zinc-800 h-3.5" />
                      </div>
                    </div>

                    {/* Terms & Urdu Notice */}
                    <p className="mt-2.5 text-[8.5px] text-zinc-700 leading-tight text-justify">
                      This Challan form / Deposit Slip is for Cash or Bank Fee Deposit at the designated counter only. Stamp &amp; computer generated receipt should be obtained before leaving the counter; please verify complete student and fee details.
                    </p>
                    <p
                      dir="rtl"
                      className="mt-1 text-[9px] font-semibold text-zinc-800 text-center leading-snug"
                    >
                      فیس جمع کرواتے وقت طالب علم کا نام، رول نمبر اور کل رقم ضرور چیک کریں اور کاؤنٹر چھوڑنے سے پہلے رسید حاصل کریں۔
                    </p>
                  </div>

                  {/* Bottom Signatures & Print Date */}
                  <div className="mt-5 pt-2">
                    <div className="flex items-center justify-between text-[9.5px] font-bold text-zinc-900">
                      <div className="border-t border-zinc-800 pt-0.5 w-28 text-center">
                        Cashier / Officer
                      </div>
                      <div className="border-t border-zinc-800 pt-0.5 w-28 text-center">
                        Authorized Signatory
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-zinc-600 mt-1.5 pt-1 border-t border-zinc-200">
                      <span className="font-semibold">Pak Royal College Official Slip</span>
                      <span>Print Date: {printTimestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
