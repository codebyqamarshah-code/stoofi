import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { PAK_ROYAL_COLLEGE_LOGO } from './pakRoyalCollegeLogo';
import { formatDateDMY, getPublicVerificationUrl } from './utils';

/**
 * Generates an official, printable ID Card PDF (Standard CR80 54mm x 86mm badge format)
 * Ultra-professional layout for Pak Royal College Sharaqpur.
 * Contains the official crest badge, college header, student/staff bio, scannable QR verification code, and principal signature.
 */
export const downloadIdCardPDF = async (rec, schoolSetting = null, designStyle = 'stoofi-emerald') => {
  if (!rec) return;

  const isHorizontal = designStyle === 'classic-navy';
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const doc = new jsPDF({
    orientation: isHorizontal ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width, height]
  });

  await renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle);

  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Student';
  const cleanFileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_ID_Card.pdf`;
  doc.save(cleanFileName);
};

/**
 * Batch Download Multiple Cards into a Single PDF Document
 */
export const downloadBatchIdCardsPDF = async (recordsList, schoolSetting = null, designStyle = 'stoofi-emerald') => {
  if (!recordsList || recordsList.length === 0) return;

  const isHorizontal = designStyle === 'classic-navy';
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const doc = new jsPDF({
    orientation: isHorizontal ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width, height]
  });

  for (let index = 0; index < recordsList.length; index++) {
    if (index > 0) {
      doc.addPage([width, height], isHorizontal ? 'landscape' : 'portrait');
    }
    await renderSingleCardPDF(doc, recordsList[index], schoolSetting, isHorizontal, designStyle);
  }

  doc.save(`Pak_Royal_College_ID_Cards_Batch_${recordsList.length}.pdf`);
};

/**
 * Internal helper to draw a single card on current jsPDF page
 */
async function renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle) {
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const schoolName = schoolSetting?.schoolName || 'PAK ROYAL COLLEGE SHARAQPUR';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Sharaqpur Sharif, Sheikhupura, Punjab';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Muhammad Abdullah';
  const role = rec.role || (rec.admissionNo ? 'Student' : 'Staff');
  const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
  const rollNo = rec.rollNo || 'FSCNurs010';
  const className = rec.className || 'FSC NURSING';
  const section = rec.section || 'A';
  const fatherName = rec.fatherName || 'Syed Ali Shah';
  const dob = formatDateDMY(rec.dob || '2010-03-01');
  const phone = rec.phone || rec.mobile || rec.guardianPhone || schoolPhone;
  const designation = rec.designation || 'Senior Faculty';
  const department = rec.department || 'Academics';
  const photo = rec.studentPhoto || rec.photo || rec.staffPhoto;

  // Generate unique scannable verification QR Code pointing directly to public verify portal
  let qrDataUrl = null;
  try {
    const identifier = admNo || rollNo || rec._id || 'PRC260001';
    const qrPayload = getPublicVerificationUrl(identifier);

    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#084A86',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QR Code generation failed:', err);
  }

  // Theme primary color configuration
  let primaryR = 5, primaryG = 150, primaryB = 105; // Emerald
  if (designStyle === 'classic-navy') {
    primaryR = 8; primaryG = 74; primaryB = 134; // Royal Navy Blue
  } else if (designStyle === 'royal-purple') {
    primaryR = 109; primaryG = 40; primaryB = 217;
  } else if (designStyle === 'dark-slate') {
    primaryR = 24; primaryG = 24; primaryB = 27;
  } else if (designStyle === 'crimson-gold') {
    primaryR = 159; primaryG = 18; primaryB = 57;
  }

  // Card Outer Border
  doc.setDrawColor(primaryR, primaryG, primaryB);
  doc.setLineWidth(0.8);
  doc.roundedRect(1.5, 1.5, width - 3, height - 3, 3, 3, 'S');

  if (!isHorizontal) {
    // ════════════════════════════════════════════════════════
    // ── VERTICAL CARD (PAK ROYAL COLLEGE) ──
    // ════════════════════════════════════════════════════════

    // Header Banner (Clean, no punch slot)
    const headerY = 2.2;
    const headerH = 17.5;
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.roundedRect(2.2, headerY, width - 4.4, headerH, 2.5, 2.5, 'F');

    // Official Pak Royal College Circular Badge (Logo)
    const logoSize = 13;
    const logoX = 4;
    const logoY = headerY + (headerH - logoSize) / 2;
    try {
      if (PAK_ROYAL_COLLEGE_LOGO) {
        doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', logoX, logoY, logoSize, logoSize);
      }
    } catch (err) {
      console.warn('Could not add logo to ID Card PDF:', err);
    }

    // Header College Title Text beside logo
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PAK ROYAL COLLEGE', 19, headerY + 6.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(253, 224, 71); // Gold accent
    doc.text('SHARAQPUR', 19, headerY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(226, 232, 240);
    doc.text('AFFILIATED & REGISTERED', 19, headerY + 15);

    // Photo Box Configuration (22mm x 26mm, rounded r: 2.5mm)
    const photoW = 22;
    const photoH = 26;
    const photoX = (width - photoW) / 2;
    const photoY = 22;
    const photoR = 2.5;

    // Fill white/light slate background for photo box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(photoX, photoY, photoW, photoH, photoR, photoR, 'F');

    // Render Student Photo
    let photoRendered = false;
    if (photo && (photo.startsWith('data:image') || photo.startsWith('blob:') || photo.startsWith('http'))) {
      try {
        const format = photo.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(photo, format, photoX, photoY, photoW, photoH);
        photoRendered = true;
      } catch (err) {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      // Placeholder with Initial Letter
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text((rec.firstName || name).charAt(0).toUpperCase(), width / 2, photoY + 17, { align: 'center' });
    }

    // DRAW THE BORDER ON TOP OF THE PHOTO!
    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.setLineWidth(0.8);
    doc.roundedRect(photoX, photoY, photoW, photoH, photoR, photoR, 'S');

    // Name & Role Badge
    const nameY = photoY + photoH + 3.8; // 51.8
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(name.slice(0, 24).toUpperCase(), width / 2, nameY, { align: 'center' });

    // Role Pill Badge
    const badgeY = nameY + 1.8; // 53.6
    const badgeW = 24;
    const badgeH = 4;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect((width - badgeW) / 2, badgeY, badgeW, badgeH, 2, 2, 'F');
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.setFontSize(5.8);
    doc.text(role.toUpperCase(), width / 2, badgeY + 2.9, { align: 'center' });

    // Details Grid Box
    const boxY = badgeY + badgeH + 1.8; // 59.4
    const boxH = 16.5;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(3.5, boxY, width - 7, boxH, 2, 2, 'FD');

    doc.setFontSize(5);
    let y = boxY + 3.1;
    const addRow = (label, val, valColor = [15, 23, 42]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 5.5, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(valColor[0], valColor[1], valColor[2]);
      doc.text(String(val).slice(0, 22), width - 5.5, y, { align: 'right' });
      y += 3.1;
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

    // Unique Scannable Verification QR Code (Bottom Left)
    const qrSize = 8.8;
    const qrX = 3.5;
    const qrY = height - qrSize - 2;

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.8);
      doc.setTextColor(71, 85, 105);
      doc.text('SCAN TO VERIFY', qrX + qrSize + 1.5, qrY + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(3.4);
      doc.setTextColor(100, 116, 139);
      doc.text(admNo, qrX + qrSize + 1.5, qrY + 6.8);
    }

    // Principal Signature (Bottom Right)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(4.8);
    doc.setTextColor(51, 65, 85);
    doc.text('Principal Signature', width - 4, qrY + 6.8, { align: 'right' });

  } else {
    // ════════════════════════════════════════════════════════
    // ── HORIZONTAL CARD (Matching User Reference Image 3) ──
    // ════════════════════════════════════════════════════════

    // Header Stripe (Blue top bar)
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.roundedRect(1.5, 1.5, width - 3, 11, 2, 2, 'F');

    // Add logo to horizontal header
    try {
      if (PAK_ROYAL_COLLEGE_LOGO) {
        doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', 3.5, 2.3, 9.4, 9.4);
      }
    } catch (e) {}

    // Institutional Title & Subtitle in Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('INSTITUTIONAL IDENTITY CARD', 15, 6.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.setTextColor(253, 224, 71); // Amber/Gold accent
    doc.text('Main Campus, Model Town, Lahore', 15, 9.8);

    // Session on Right of Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.8);
    doc.setTextColor(226, 232, 240);
    doc.text('SESSION', width - 4.5, 5.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(253, 224, 71);
    doc.text('2026–2027', width - 4.5, 9.2, { align: 'right' });

    // Gold/Yellow divider line beneath header
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.4);
    doc.line(1.5, 12.5, width - 1.5, 12.5);

    // Left: Photo Box (20mm x 25mm)
    const photoW = 20;
    const photoH = 25;
    const photoX = 4.5;
    const photoY = 15;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2.5, 2.5, 'F');

    let photoRendered = false;
    if (photo && (photo.startsWith('data:image') || photo.startsWith('blob:') || photo.startsWith('http'))) {
      try {
        const format = photo.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(photo, format, photoX, photoY, photoW, photoH);
        photoRendered = true;
      } catch (err) {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text((rec.firstName || name).charAt(0).toUpperCase(), photoX + photoW / 2, photoY + 16, { align: 'center' });
    }

    // Border on top of photo
    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.setLineWidth(0.6);
    doc.roundedRect(photoX, photoY, photoW, photoH, 2.5, 2.5, 'S');

    // Middle: Student Details
    // Gold Student Pass Pill Badge
    const badgeX = 27.5;
    const badgeY = 15;
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(badgeX, badgeY, 32, 4, 1.5, 1.5, 'F');
    doc.setTextColor(120, 53, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.text(`${role.toUpperCase()} IDENTITY PASS`, badgeX + 16, badgeY + 2.8, { align: 'center' });

    // Full Name
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(name.slice(0, 24).toUpperCase(), badgeX, badgeY + 8.5);

    // Detail rows (ID, Class, Roll No, Guardian, Contact)
    doc.setFontSize(5.2);
    let hy = badgeY + 12.2;
    const addHRow = (label, val, highlight = false) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, badgeX, hy);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(highlight ? primaryR : 15, highlight ? primaryG : 23, highlight ? primaryB : 42);
      doc.text(String(val).slice(0, 22), badgeX + 14, hy);
      hy += 3.3;
    };

    if (role === 'Student') {
      addHRow('ID No:', admNo);
      addHRow('Class:', `${className} ${section ? `(${section})` : ''}`, true);
      addHRow('Roll No:', rollNo);
      addHRow('Guardian:', fatherName || 'Father');
      addHRow('Contact:', phone);
    } else {
      addHRow('Staff ID:', admNo);
      addHRow('Designation:', designation, true);
      addHRow('Department:', department);
      addHRow('Emergency:', phone);
    }

    // Right: Vertical Divider & Real Scannable Verification QR Code (Right Side!)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(67, 16, 67, 43);

    const qrSize = 13.5;
    const qrX = 69.5;
    const qrY = 16.5;

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    }

    // QR Verification Labels under QR Code on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.2);
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.text('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 2.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.6);
    doc.setTextColor(148, 163, 184);
    doc.text(admNo, qrX + qrSize / 2, qrY + qrSize + 5.2, { align: 'center' });

    // Bottom Footer Bar
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(1.5, height - 6.5, width - 3, 5, 'F');
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.3);
    doc.line(1.5, height - 6.5, width - 1.5, height - 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.setTextColor(241, 245, 249);
    doc.text('pakroyalcollege.edu.pk', 4.5, height - 3.2);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5);
    doc.setTextColor(253, 224, 71);
    doc.text('Authorized Signature', width - 4.5, height - 3.2, { align: 'right' });
  }
}
