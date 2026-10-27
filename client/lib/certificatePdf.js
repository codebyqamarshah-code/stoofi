import jsPDF from 'jspdf';
import { PAK_ROYAL_COLLEGE_LOGO } from './pakRoyalCollegeLogo.js';
import { PAK_ROYAL_SIGNATURE_DARK, PAK_ROYAL_SIGNATURE_GOLD } from './signatureImage.js';

/**
 * Downloads a high-resolution, landscape A4 (297mm x 210mm) Certificate PDF
 * Ultra-professional layout matching institutional diplomas & merit certificates.
 */
export const downloadCertificatePDF = (student, template = {}, schoolSetting = null) => {
  if (!student) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4' // 297mm x 210mm
  });

  renderCertificateToDoc(doc, student, template, schoolSetting);

  const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || student.studentName || 'Student';
  const cleanFileName = `${stName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
  doc.save(cleanFileName);
};

/**
 * Batch Download Multiple Certificates into a single PDF
 */
export const downloadBatchCertificatesPDF = (studentsList, template = {}, schoolSetting = null) => {
  if (!studentsList || studentsList.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  studentsList.forEach((st, idx) => {
    if (idx > 0) {
      doc.addPage('a4', 'landscape');
    }
    renderCertificateToDoc(doc, st, template, schoolSetting);
  });

  doc.save(`Stoofi_Certificates_Batch_${studentsList.length}.pdf`);
};

function renderCertificateToDoc(doc, student, template, schoolSetting) {
  const width = 297;
  const height = 210;

  const styleId = template.themeStyle || 'classic-gold';
  const schoolName = schoolSetting?.schoolName || 'Pak Royal College Sharaqpur';
  const schoolAddress = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  const stName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || student.studentName || 'Student Name';
  const fName = student.fatherName || '-';
  const admNo = student.admissionNo || '-';
  const rollNo = student.rollNo || '-';
  const clsName = student.className || '-';
  const secName = student.section || '-';
  const certDate = student.certificateDate || student.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const certNo = student.certificateNumber || `STO-CERT-${Date.now().toString().slice(-6)}`;

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
  let currentY = 20;
  if (template.showSchoolHeader !== false) {
    try {
      doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', width / 2 - 7, currentY - 5, 14, 14);
      currentY += 12;
    } catch (_) {
      currentY += 2;
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text(schoolName.toUpperCase(), width / 2, currentY, { align: 'center' });

    currentY += 4.5;
    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${schoolAddress} | Ph: ${schoolPhone}`, width / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(width / 2 - 40, currentY, width / 2 + 40, currentY);
    currentY += 8;
  } else {
    currentY += 8;
  }

  // 3. Certificate Title & Ribbon
  const titleText = template.headerTitle || template.title || 'CERTIFICATE OF EXCELLENCE';
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(titleText.toUpperCase(), width / 2, currentY, { align: 'center' });

  currentY += 6;
  const subtitleText = template.headerSubtitle || 'TO WHOM IT MAY CONCERN';
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(subtitleText.toUpperCase(), width / 2, currentY, { align: 'center' });

  // 4. Recipient Intro
  currentY += 10;
  doc.setTextColor(120, 120, 120);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.text('This is to proudly certify that', width / 2, currentY, { align: 'center' });

  // 5. Student Name
  currentY += 11;
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.text(stName, width / 2, currentY, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(stName);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - nameWidth / 2 - 5, currentY + 2, width / 2 + nameWidth / 2 + 5, currentY + 2);

  // 6. Bio Information Badges (Respecting toggles)
  currentY += 9;
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
    doc.setFontSize(8.5);
    doc.text(bioParts.join('  |  '), width / 2, currentY, { align: 'center' });
    currentY += 7;
  } else {
    currentY += 4;
  }

  // 7. Certificate Body Text
  let rawBody = template.templateBody || 'Has demonstrated exemplary conduct, scholastic dedication, and outstanding character during their enrollment in this academic institution. We wish them success in all future pursuits.';
  rawBody = rawBody
    .split('[student_name]').join(stName)
    .split('[father_name]').join(fName)
    .split('[admission_no]').join(admNo)
    .split('[roll_no]').join(rollNo)
    .split('[class_name]').join(clsName)
    .split('[section]').join(secName)
    .split('[school_name]').join(schoolName)
    .split('[certificate_date]').join(certDate)
    .split('[issue_date]').join(certDate);

  doc.setTextColor(50, 50, 50);
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  const splitBody = doc.splitTextToSize(rawBody, 220);
  doc.text(splitBody, width / 2, currentY, { align: 'center', lineHeightFactor: 1.4 });

  // 8. Footer & Signatories
  const footerY = height - 34;

  // Left Signatory (Date of Issue)
  if (template.showSignatureLeft !== false) {
    const leftX = 35;
    if (template.showIssueDate !== false) {
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(certDate, leftX, footerY, { align: 'center' });
    }
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(leftX - 25, footerY + 2, leftX + 25, footerY + 2);

    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(template.footerLeft || 'Date of Issue', leftX, footerY + 7, { align: 'center' });
  }

  // Center: Official Embossed Seal Graphic (if enabled)
  if (template.showSeal !== false) {
    const sealX = width / 2;
    const sealY = footerY + 2;
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

    if (template.showQrBarcode !== false) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(certNo, sealX, footerY + 13, { align: 'center' });
    }
  } else if (template.showSignatureCenter !== false) {
    const centerX = width / 2;
    doc.setTextColor(40, 40, 40);
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('Academic Coordinator', centerX, footerY, { align: 'center' });
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(centerX - 25, footerY + 2, centerX + 25, footerY + 2);

    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(template.footerCenter || 'Class In-Charge', centerX, footerY + 7, { align: 'center' });
  }

  // Right Signatory (Principal Signature & Stamp)
  if (template.showSignatureRight !== false) {
    const rightX = width - 38;
    const signImage = theme === 'classic-gold' ? PAK_ROYAL_SIGNATURE_GOLD : PAK_ROYAL_SIGNATURE_DARK;
    let signatureRendered = false;
    try {
      doc.addImage(signImage, 'PNG', rightX - 16, footerY - 8, 32, 8);
      signatureRendered = true;
    } catch (_) {
      signatureRendered = false;
    }

    if (!signatureRendered) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.text('Principal Signature', rightX, footerY - 1, { align: 'center' });
    }

    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.6);
    doc.line(rightX - 25, footerY + 1, rightX + 25, footerY + 1);

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.text('M. UMER', rightX, footerY + 5, { align: 'center' });

    doc.setTextColor(110, 110, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(template.footerRight || 'Principal / Authorized Seal', rightX, footerY + 8.5, { align: 'center' });
  }
}
