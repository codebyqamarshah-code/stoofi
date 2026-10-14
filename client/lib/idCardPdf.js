import jsPDF from 'jspdf';

/**
 * Generates an official, printable ID Card PDF (Standard CR80 54mm x 86mm badge format)
 * Ultra-professional layout matching real institutional lanyard and horizontal badges.
 * Contains ONLY the card content, badges, school header, student/staff bio, barcode, and verification seal.
 */
export const downloadIdCardPDF = (rec, schoolSetting = null, designStyle = 'stoofi-emerald') => {
  if (!rec) return;

  const isHorizontal = designStyle === 'classic-navy';
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const doc = new jsPDF({
    orientation: isHorizontal ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width, height]
  });

  renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle);

  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Student';
  const cleanFileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_ID_Card.pdf`;
  doc.save(cleanFileName);
};

/**
 * Batch Download Multiple Cards into a Single PDF Document
 */
export const downloadBatchIdCardsPDF = (recordsList, schoolSetting = null, designStyle = 'stoofi-emerald') => {
  if (!recordsList || recordsList.length === 0) return;

  const isHorizontal = designStyle === 'classic-navy';
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const doc = new jsPDF({
    orientation: isHorizontal ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width, height]
  });

  recordsList.forEach((rec, index) => {
    if (index > 0) {
      doc.addPage([width, height], isHorizontal ? 'landscape' : 'portrait');
    }
    renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle);
  });

  doc.save(`Stoofi_ID_Cards_Batch_${recordsList.length}.pdf`);
};

/**
 * Internal helper to draw a single card on current jsPDF page
 */
function renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle) {
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const schoolName = schoolSetting?.schoolName || 'STOOFI PUBLIC SCHOOL & COLLEGE';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Main Campus, Model Town, Lahore';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
  const role = rec.role || (rec.admissionNo ? 'Student' : 'Staff');
  const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
  const rollNo = rec.rollNo || '101';
  const className = rec.className || 'Class 10';
  const section = rec.section || 'A';
  const fatherName = rec.fatherName || 'Syed Ali Shah';
  const dob = rec.dob || '14/05/2008';
  const phone = rec.phone || rec.mobile || rec.guardianPhone || schoolPhone;
  const designation = rec.designation || 'Senior Faculty';
  const department = rec.department || 'Academics';
  const photo = rec.studentPhoto || rec.photo || rec.staffPhoto;

  // Theme primary color configuration
  let primaryR = 8, primaryG = 74, primaryB = 134; // Stoofi Blue
  if (designStyle === 'stoofi-emerald') {
    primaryR = 5; primaryG = 150; primaryB = 105; // Emerald
  } else if (designStyle === 'royal-purple') {
    primaryR = 109; primaryG = 40; primaryB = 217; // Royal Purple
  } else if (designStyle === 'dark-slate') {
    primaryR = 24; primaryG = 24; primaryB = 27; // Obsidian Dark
  } else if (designStyle === 'crimson-gold') {
    primaryR = 159; primaryG = 18; primaryB = 57; // Crimson
  }

  // Card Outer Border
  doc.setDrawColor(primaryR, primaryG, primaryB);
  doc.setLineWidth(0.8);
  doc.roundedRect(1.5, 1.5, width - 3, height - 3, 3, 3, 'S');

  if (!isHorizontal) {
    // ════════════════════════════════════════════════════════
    // ── VERTICAL LANYARD BADGE (Matching User Reference Image 2) ──
    // ════════════════════════════════════════════════════════

    // Lanyard Clip Cutout (Punch slot representation)
    doc.setFillColor(226, 232, 240);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect((width - 12) / 2, 2.5, 12, 2, 1, 1, 'FD');

    // Header Banner
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.roundedRect(2, 5.5, width - 4, 15, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('OFFICIAL IDENTITY BADGE', width / 2, 9, { align: 'center' });

    doc.setFontSize(7.5);
    doc.text(schoolName.toUpperCase().slice(0, 28), width / 2, 13.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(226, 232, 240);
    doc.text(schoolAddress.slice(0, 36), width / 2, 17.5, { align: 'center' });

    // Portrait Rounded-Rectangular Photo Box (22mm x 26mm, r: 2.5mm)
    const photoW = 21;
    const photoH = 25;
    const photoX = (width - photoW) / 2;
    const photoY = 22;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.setLineWidth(0.6);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2.5, 2.5, 'FD');

    // Render Student Photo or Initials Placeholder
    let photoRendered = false;
    if (photo && (photo.startsWith('data:image') || photo.startsWith('blob:') || photo.startsWith('http'))) {
      try {
        const format = photo.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(photo, format, photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
        photoRendered = true;
      } catch (err) {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text((rec.firstName || name).charAt(0).toUpperCase(), width / 2, photoY + 16, { align: 'center' });
    }

    // Name & Role Badge
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(name.slice(0, 22).toUpperCase(), width / 2, 51, { align: 'center' });

    doc.setFillColor(236, 253, 245);
    doc.roundedRect((width - 24) / 2, 52.5, 24, 4.2, 2, 2, 'F');
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.setFontSize(6);
    doc.text(role.toUpperCase(), width / 2, 55.5, { align: 'center' });

    // Details Grid Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(3.5, 58, width - 7, 20, 2, 2, 'FD');

    doc.setFontSize(5.2);
    let y = 61.5;
    const addRow = (label, val, valColor = [15, 23, 42]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 5.5, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(valColor[0], valColor[1], valColor[2]);
      doc.text(String(val).slice(0, 20), width - 5.5, y, { align: 'right' });
      y += 3.6;
    };

    if (role === 'Student') {
      addRow('ID No:', admNo);
      addRow('Class & Sec:', `${className} (${section})`, [primaryR, primaryG, primaryB]);
      addRow('Roll Number:', rollNo);
      addRow('DOB:', dob);
      if (fatherName) addRow('Guardian:', fatherName);
    } else {
      addRow('Staff ID:', admNo);
      addRow('Designation:', designation, [primaryR, primaryG, primaryB]);
      addRow('Department:', department);
      addRow('Emergency:', phone);
    }

    // Realistic Barcode Lines (Bottom Left)
    const barY = height - 6.5;
    const barWidths = [0.4, 0.2, 0.5, 0.2, 0.4, 0.2, 0.2, 0.5, 0.4, 0.2, 0.5, 0.2, 0.4, 0.2, 0.3];
    let curX = 4;
    doc.setFillColor(30, 41, 59);
    barWidths.forEach(w => {
      doc.rect(curX, barY - 1.5, w, 3.2, 'F');
      curX += w + 0.25;
    });

    // Principal Signature (Bottom Right)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(4.8);
    doc.setTextColor(51, 65, 85);
    doc.text('Principal Signature', width - 4, barY + 0.5, { align: 'right' });

  } else {
    // ════════════════════════════════════════════════════════
    // ── HORIZONTAL CARD (Matching User Reference Image 3) ──
    // ════════════════════════════════════════════════════════

    // Header Stripe
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.roundedRect(2, 2, width - 4, 11, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(schoolName.toUpperCase().slice(0, 36), width / 2, 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(226, 232, 240);
    doc.text(schoolAddress.slice(0, 48), width / 2, 10, { align: 'center' });

    // Left: Photo Box (18mm x 22mm)
    const photoW = 18;
    const photoH = 22;
    const photoX = 5;
    const photoY = 16;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.setLineWidth(0.5);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'FD');

    let photoRendered = false;
    if (photo && (photo.startsWith('data:image') || photo.startsWith('blob:') || photo.startsWith('http'))) {
      try {
        const format = photo.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(photo, format, photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
        photoRendered = true;
      } catch (err) {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text((rec.firstName || name).charAt(0).toUpperCase(), photoX + photoW / 2, photoY + 14, { align: 'center' });
    }

    // Barcode under Photo
    const barY = photoY + photoH + 2;
    const barWidths = [0.4, 0.2, 0.5, 0.2, 0.4, 0.2, 0.2, 0.5, 0.4, 0.2, 0.5, 0.2, 0.4];
    let curX = photoX + 1;
    doc.setFillColor(30, 41, 59);
    barWidths.forEach(w => {
      doc.rect(curX, barY, w, 2.8, 'F');
      curX += w + 0.25;
    });

    // Right: Student ID Card Gold Pill
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(26, 15.5, 26, 4, 1.5, 1.5, 'F');
    doc.setTextColor(120, 53, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('STUDENT ID CARD', 39, 18.3, { align: 'center' });

    // Name
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(name.slice(0, 26).toUpperCase(), 26, 23.5);

    // Detail rows
    doc.setFontSize(5.5);
    let hy = 27.5;
    const addHRow = (label, val, highlight = false) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 26, hy);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(highlight ? primaryR : 15, highlight ? primaryG : 23, highlight ? primaryB : 42);
      doc.text(String(val).slice(0, 24), 46, hy);
      hy += 3.6;
    };

    if (role === 'Student') {
      addHRow('ID No:', admNo);
      addHRow('Class & Sec:', `${className} (${section})`, true);
      addHRow('Roll No:', rollNo);
      addHRow('DOB:', dob);
      addHRow('Emergency:', phone);
    } else {
      addHRow('Staff ID:', admNo);
      addHRow('Designation:', designation, true);
      addHRow('Department:', department);
      addHRow('Emergency:', phone);
    }

    // Footer Bar
    doc.setFillColor(241, 245, 249);
    doc.rect(2, height - 6.5, width - 4, 4.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(71, 85, 105);
    doc.text('OFFICIAL VERIFIED BADGE', 5, height - 3.5);
    doc.text('AUTHORIZED SIGNATURE', width - 5, height - 3.5, { align: 'right' });
  }
}
