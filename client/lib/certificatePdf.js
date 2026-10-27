import { jsPDF } from 'jspdf';
import * as jspdfLib from 'jspdf';
import QRCode from 'qrcode';
import { PAK_ROYAL_COLLEGE_LOGO } from './pakRoyalCollegeLogo.js';
import { PAK_ROYAL_SIGNATURE_DARK, PAK_ROYAL_SIGNATURE_GOLD } from './signatureImage.js';
import { getPublicVerificationUrl, formatStudentRollNo } from './utils.js';

function createPdfDoc(options) {
  const Constructor = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default || jsPDF;
  return new Constructor(options);
}

/**
 * Downloads a high-resolution, landscape A4 (297mm x 210mm) Certificate PDF
 * Ultra-professional layout matching institutional diplomas & merit certificates.
 */
export const downloadCertificatePDF = async (student, template = {}, schoolSetting = null) => {
  if (!student) return;

  const doc = createPdfDoc({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4' // 297mm x 210mm
  });

  await renderCertificateToDoc(doc, student, template, schoolSetting);

  const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || student.studentName || 'Student';
  const cleanFileName = `${stName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
  doc.save(cleanFileName);
};

/**
 * Batch Download Multiple Certificates into a single PDF
 */
export const downloadBatchCertificatesPDF = async (studentsList, template = {}, schoolSetting = null) => {
  if (!studentsList || studentsList.length === 0) return;

  const doc = createPdfDoc({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  for (let idx = 0; idx < studentsList.length; idx++) {
    const st = studentsList[idx];
    if (idx > 0) {
      doc.addPage('a4', 'landscape');
    }
    await renderCertificateToDoc(doc, st, template, schoolSetting);
  }

  doc.save(`Pak_Royal_College_Certificates_${studentsList.length}.pdf`);
};

async function renderCertificateToDoc(doc, student, template, schoolSetting) {
  const width = 297;
  const height = 210;

  const styleId = template.themeStyle || 'classic-gold';
  const schoolName = schoolSetting?.schoolName || 'PAK ROYAL COLLEGE';
  const schoolAddress = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';
  const schoolPhone = schoolSetting?.phone || '+92 311 1444810';

  const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || student.studentName || 'Muhammad Rayyan';
  const fName = student.fatherName || 'Tariq Mehmood';
  const admNo = student.admissionNo || 'ADM-2026-101';
  const rollNo = formatStudentRollNo(student.rollNo || student.admissionNo || 'PRC0021');
  const clsName = student.className || 'FSC OTT';
  const secName = student.section || 'A';
  const certDate = student.certificateDate || student.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const certNo = student.certificateNumber || `PRC-CERT-${(student.admissionNo || '2026').replace(/\D/g, '') || Date.now().toString().slice(-6)}`;

  // Color Palettes
  let primaryColor = [180, 83, 9]; // Amber 700 (Gold)
  let secondaryColor = [217, 119, 6]; // Amber 600
  let darkTextColor = [30, 27, 20];

  if (styleId === 'stoofi-emerald') {
    primaryColor = [4, 120, 87]; // Emerald 700
    secondaryColor = [5, 150, 105];
    darkTextColor = [10, 30, 20];
  } else if (styleId === 'royal-navy' || styleId === 'academic-navy') {
    primaryColor = [12, 74, 110]; // Sky 900
    secondaryColor = [3, 105, 161];
    darkTextColor = [10, 20, 35];
  } else if (styleId === 'crimson-merit') {
    primaryColor = [185, 28, 28]; // Rose 700
    secondaryColor = [225, 29, 72];
    darkTextColor = [35, 10, 15];
  } else if (styleId === 'minimal-tech' || styleId === 'dark-slate') {
    primaryColor = [39, 39, 42]; // Zinc 800
    secondaryColor = [82, 82, 91];
    darkTextColor = [15, 15, 15];
  }

  // 1. Certificate Background & Outer Border
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // Outer Decorative Border
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2.5);
  doc.rect(8, 8, width - 16, height - 16);

  // Inner Fine Double Border
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.6);
  doc.rect(12, 12, width - 24, height - 24);

  // Corner Ornaments
  const cornerSize = 7;
  const corners = [
    [14, 14],
    [width - 14 - cornerSize, 14],
    [14, height - 14 - cornerSize],
    [width - 14 - cornerSize, height - 14 - cornerSize]
  ];
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  corners.forEach(([cx, cy]) => {
    doc.rect(cx, cy, cornerSize, cornerSize, 'F');
  });

  // 2. School Header (if enabled)
  let currentY = 22;
  if (template.showSchoolHeader !== false) {
    try {
      doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', width / 2 - 8, currentY - 7, 16, 16);
      currentY += 13;
    } catch (_) {
      currentY += 2;
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(schoolName.toUpperCase(), width / 2, currentY, { align: 'center' });

    currentY += 4.5;
    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${schoolAddress} | Ph: ${schoolPhone}`, width / 2, currentY, { align: 'center' });

    currentY += 3.5;
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(width / 2 - 45, currentY, width / 2 + 45, currentY);
    currentY += 7.5;
  } else {
    currentY += 8;
  }

  // 3. Certificate Title & Ribbon
  const titleText = template.headerTitle || template.title || 'CERTIFICATE OF ACADEMIC EXCELLENCE';
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text(titleText.toUpperCase(), width / 2, currentY, { align: 'center' });

  currentY += 5.5;
  const subtitleText = template.headerSubtitle || 'TO WHOM IT MAY CONCERN';
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(subtitleText.toUpperCase(), width / 2, currentY, { align: 'center' });

  // 4. Recipient Intro
  currentY += 9;
  doc.setTextColor(120, 120, 120);
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.text('This is to proudly certify that', width / 2, currentY, { align: 'center' });

  // 5. Student Name
  currentY += 10.5;
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(23);
  doc.text(stName, width / 2, currentY, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(stName);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - nameWidth / 2 - 5, currentY + 2, width / 2 + nameWidth / 2 + 5, currentY + 2);

  // 6. Bio Information Badges (Respecting toggles)
  currentY += 8.5;
  const bioParts = [];
  if (template.showFatherName !== false && fName && fName !== '-') {
    bioParts.push(`S/D of: ${fName}`);
  }
  if (template.showClass !== false && clsName && clsName !== '-') {
    bioParts.push(`Class: ${clsName}${template.showSection !== false && secName && secName !== '-' ? ` (${secName})` : ''}`);
  }
  if (template.showAdmissionNo !== false && admNo && admNo !== '-') {
    bioParts.push(`Adm No: ${admNo}`);
  }
  if (template.showRollNo !== false && rollNo && rollNo !== '-') {
    bioParts.push(`Roll No: ${rollNo}`);
  }
  if (template.showDob !== false && student.dob) {
    bioParts.push(`DOB: ${student.dob}`);
  }

  if (bioParts.length > 0) {
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(bioParts.join('  |  '), width / 2, currentY, { align: 'center' });
    currentY += 6.5;
  } else {
    currentY += 4;
  }

  // 7. Certificate Body Text
  let rawBody = template.templateBody || 'Has demonstrated exemplary conduct, scholastic dedication, and outstanding character during their enrollment in this academic institution. We wish them success in all future pursuits.';
  rawBody = rawBody
    .split('[student_name]').join(stName)
    .split('{{studentName}}').join(stName)
    .split('[father_name]').join(fName)
    .split('{{fatherName}}').join(fName)
    .split('[admission_no]').join(admNo)
    .split('{{admissionNumber}}').join(admNo)
    .split('[roll_no]').join(rollNo)
    .split('{{rollNumber}}').join(rollNo)
    .split('[class_name]').join(clsName)
    .split('{{class}}').join(clsName)
    .split('[section]').join(secName)
    .split('{{section}}').join(secName)
    .split('[school_name]').join(schoolName)
    .split('[certificate_date]').join(certDate)
    .split('[issue_date]').join(certDate);

  doc.setTextColor(50, 50, 50);
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  const splitBody = doc.splitTextToSize(rawBody, 220);
  doc.text(splitBody, width / 2, currentY, { align: 'center', lineHeightFactor: 1.35 });

  // 8. Footer & Signatories
  const footerY = height - 32;

  // Left Signatory (Date of Issue)
  if (template.showSignatureLeft !== false) {
    const leftX = 40;
    if (template.showIssueDate !== false) {
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(certDate, leftX, footerY, { align: 'center' });
    }
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(leftX - 22, footerY + 2, leftX + 22, footerY + 2);

    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(template.footerLeft || 'Date of Issue', leftX, footerY + 6.5, { align: 'center' });
  }

  // Center: Official Embossed Seal Graphic + Scannable QR Code
  const sealX = width / 2;
  const sealY = footerY;

  if (template.showQrBarcode !== false) {
    try {
      const identifier = String(student.admissionNo || student.rollNo || student._id || 'PRC0021').trim();
      const qrPayload = getPublicVerificationUrl(identifier);
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 256,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' }
      });
      const qrSize = 17;
      doc.addImage(qrDataUrl, 'PNG', sealX - qrSize / 2, sealY - 14, qrSize, qrSize);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('SCAN TO VERIFY CREDENTIAL', sealX, sealY + 6, { align: 'center' });
      doc.setFont('courier', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(90, 90, 90);
      doc.text(certNo, sealX, sealY + 9.5, { align: 'center' });
    } catch (_) {
      // Fallback seal
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(sealX, sealY - 4, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'bold');
      doc.setFontSize(6.5);
      doc.text('OFFICIAL SEAL', sealX, sealY - 3, { align: 'center' });
    }
  } else if (template.showSeal !== false) {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(sealX, sealY - 4, 11, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.circle(sealX, sealY - 4, 9.5, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(6.5);
    doc.text('OFFICIAL', sealX, sealY - 5.5, { align: 'center' });
    doc.text('SEAL', sealX, sealY - 2.5, { align: 'center' });
  }

  // Right Signatory (Principal Signature & Stamp)
  if (template.showSignatureRight !== false) {
    const rightX = width - 42;
    const signImage = styleId === 'classic-gold' ? PAK_ROYAL_SIGNATURE_GOLD : PAK_ROYAL_SIGNATURE_DARK;
    let signatureRendered = false;
    try {
      doc.addImage(signImage, 'PNG', rightX - 18, footerY - 11, 36, 10);
      signatureRendered = true;
    } catch (_) {
      signatureRendered = false;
    }

    if (!signatureRendered) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.text('M. Umer', rightX, footerY - 2, { align: 'center' });
    }

    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.6);
    doc.line(rightX - 22, footerY + 2, rightX + 22, footerY + 2);

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.text('M. UMER', rightX, footerY + 6, { align: 'center' });

    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(template.footerRight || 'Principal / Authorized Seal', rightX, footerY + 9.5, { align: 'center' });
  }
}
