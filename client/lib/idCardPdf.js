import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { PAK_ROYAL_COLLEGE_LOGO } from './pakRoyalCollegeLogo.js';
import { PAK_ROYAL_SIGNATURE_GOLD } from './signatureImage.js';
import { formatDateDMY, getPublicVerificationUrl, formatStudentRollNo, getPhotoUrl } from './utils.js';

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
 * Safely crops, auto-straightens, and resizes any image to the exact target aspect ratio (cover mode, center-top focus)
 * with transparent rounded corners so that the photo never bleeds outside the photo frame box in PDF.
 */
async function getCoverCroppedImageDataUrl(imageSrc, targetAspectRatio = 0.8, cornerRadiusRatio = 0.092) {
  if (!imageSrc || typeof window === 'undefined') return imageSrc;

  return new Promise((resolve) => {
    const processImage = async () => {
      try {
        let source = null;

        // Auto-straighten using createImageBitmap if supported (handles EXIF orientation)
        if (typeof createImageBitmap === 'function' && typeof fetch === 'function') {
          try {
            if (imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) {
              const res = await fetch(imageSrc);
              const blob = await res.blob();
              source = await createImageBitmap(blob, { imageOrientation: 'from-image' });
            }
          } catch {
            source = null;
          }
        }

        if (!source) {
          source = await new Promise((resImg, rejImg) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resImg(img);
            img.onerror = () => rejImg(new Error('Image failed to load'));
            img.src = imageSrc;
          });
        }

        const iw = source.naturalWidth || source.width;
        const ih = source.naturalHeight || source.height;
        if (!iw || !ih) return resolve(imageSrc);

        const currentRatio = iw / ih;

        const canvas = document.createElement('canvas');
        const canvasW = 600;
        const canvasH = Math.round(canvasW / targetAspectRatio);
        canvas.width = canvasW;
        canvas.height = canvasH;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        let sx = 0, sy = 0, sWidth = iw, sHeight = ih;

        if (currentRatio > targetAspectRatio) {
          // Source is wider than target box (e.g. 16:9 landscape): crop horizontally (keep center)
          sWidth = ih * targetAspectRatio;
          sx = (iw - sWidth) / 2;
          sy = 0;
        } else {
          // Source is taller than target box: crop vertically (keep upper 12% for face)
          sHeight = iw / targetAspectRatio;
          sx = 0;
          sy = Math.max(0, (ih - sHeight) * 0.12);
        }

        // Clear canvas with full transparency
        ctx.clearRect(0, 0, canvasW, canvasH);

        // Apply smooth rounded corner clipping mask
        if (cornerRadiusRatio > 0) {
          const radius = Math.round(canvasW * cornerRadiusRatio);
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(0, 0, canvasW, canvasH, radius);
          } else {
            ctx.moveTo(radius, 0);
            ctx.lineTo(canvasW - radius, 0);
            ctx.quadraticCurveTo(canvasW, 0, canvasW, radius);
            ctx.lineTo(canvasW, canvasH - radius);
            ctx.quadraticCurveTo(canvasW, canvasH, canvasW - radius, canvasH);
            ctx.lineTo(radius, canvasH);
            ctx.quadraticCurveTo(0, canvasH, 0, canvasH - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
          }
          ctx.clip();
        }

        // Draw the auto-straightened, cropped image within the rounded mask
        ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, canvasW, canvasH);

        // Export as PNG so outside corner pixels remain 100% transparent in PDF!
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        resolve(imageSrc);
      }
    };

    processImage();
  });
}

/**
 * Internal helper to draw a single card on current jsPDF page
 */
async function renderSingleCardPDF(doc, rec, schoolSetting, isHorizontal, designStyle) {
  const width = isHorizontal ? 85.6 : 54;
  const height = isHorizontal ? 53.98 : 85.6;

  const schoolName = schoolSetting?.schoolName || 'PAK ROYAL COLLEGE SHARAQPUR';
  const schoolAddress = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';
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
  const rawPhoto = rec.studentPhoto || rec.photo || rec.staffPhoto || rec.avatar;
  const photo = getPhotoUrl(rawPhoto) || (typeof rawPhoto === 'string' && rawPhoto.trim() ? rawPhoto.trim() : null);

  // Generate unique scannable verification QR Code pointing directly to public verify portal
  let qrDataUrl = null;
  try {
    const rawId = rec.admissionNo || rec.rollNo || rec.staffNo || (rec._id ? String(rec._id) : '') || admNo || rollNo || 'PRC260001';
    const identifier = String(rawId).trim();
    const qrPayload = getPublicVerificationUrl(identifier);

    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
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

  // Card Outer Border (Sharp rectangular corners for PVC printing)
  doc.setDrawColor(primaryR, primaryG, primaryB);
  doc.setLineWidth(0.8);
  doc.rect(1.5, 1.5, width - 3, height - 3, 'S');

  if (!isHorizontal) {
    // ════════════════════════════════════════════════════════
    // ── VERTICAL CARD (PAK ROYAL COLLEGE) ──
    // ════════════════════════════════════════════════════════

    // Header Banner (Clean, no punch slot)
    const headerY = 2.2;
    const headerH = 17.5;
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(2.2, headerY, width - 4.4, headerH, 'F');

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

    // Render Student Photo (Aspect-ratio preserving cover crop with transparent rounded corners)
    let photoRendered = false;
    if (photo && (photo.startsWith('data:') || photo.startsWith('blob:') || photo.startsWith('http') || photo.startsWith('/'))) {
      try {
        const targetRatio = photoW / photoH;
        const croppedPhoto = await getCoverCroppedImageDataUrl(photo, targetRatio, photoR / photoW);
        const format = croppedPhoto.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(croppedPhoto, format, photoX, photoY, photoW, photoH);
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
    // ── HORIZONTAL CARDS (FRONT & BACK 1:1 WITH OFFICIAL DESIGN) ──
    // ════════════════════════════════════════════════════════

    const navyR = 10, navyG = 37, navyB = 68;      // #0a2544 Deep Royal Navy
    const goldR = 212, goldG = 175, goldB = 55;    // #d4af37 Gold Accent
    const slateR = 100, slateG = 116, slateB = 139;// Slate Muted
    const textDarkR = 10, textDarkG = 37, textDarkB = 68; // Navy Text

    const formattedRoll = formatStudentRollNo(rollNo);
    const displayClass = `${className} ${section ? `(${String(section).replace(/^Section\s*/i, '')})` : ''}`.trim();
    const sessionYear = rec.academicYear || '2026–2027';

    // ────────────────────────────────────────────────────────
    // PAGE 1: FRONT SIDE
    // ────────────────────────────────────────────────────────

    // Outer card border (Sharp rectangular corners for PVC printing)
    doc.setDrawColor(navyR, navyG, navyB);
    doc.setLineWidth(0.6);
    doc.rect(1.0, 1.0, width - 2.0, height - 2.0, 'S');

    // Header Stripe (Deep Royal Navy #0a2544)
    doc.setFillColor(navyR, navyG, navyB);
    doc.rect(1.0, 1.0, width - 2.0, 11.2, 'F');
    doc.rect(1.0, 6.0, width - 2.0, 6.2, 'F');

    // Diagonal Translucent Stripes on Right Half (Matching Web Preview Exactly)
    try {
      if (typeof doc.GState === 'function') {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.18 }));
        doc.setFillColor(255, 255, 255);
        doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
        doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
        doc.restoreGraphicsState();
      } else {
        doc.setFillColor(35, 62, 95);
        doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
        doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
      }
    } catch (e) {
      doc.setFillColor(35, 62, 95);
      doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
      doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
      doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
      doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
    }

    // Circular white ring & Crest Logo
    const logoX = 3.2;
    const logoY = 2.0;
    const logoSize = 8.5;
    doc.setFillColor(255, 255, 255);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, (logoSize / 2) + 0.3, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, (logoSize / 2) + 0.6, 'S');

    try {
      if (PAK_ROYAL_COLLEGE_LOGO) {
        doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', logoX, logoY, logoSize, logoSize);
      }
    } catch (e) {}

    // Institutional Title & Subtitle in Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.text('PAK ROYAL COLLEGE', 14.0, 5.5);

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.2);
    doc.text('Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura', 14.0, 9.2);

    // Gold divider line beneath header
    doc.setDrawColor(goldR, goldG, goldB);
    doc.setLineWidth(0.5);
    doc.line(1.0, 12.2, width - 1.0, 12.2);

    // Left Column: Photo Panel (Grey-Blue #f0f4f8)
    const leftPanelW = 27.0;
    doc.setFillColor(240, 244, 248);
    doc.rect(1.0, 12.5, leftPanelW, 35.0, 'F');

    // Photo Box: 19.5mm x 24.5mm with rounded corners & dark navy border
    const photoW = 19.5;
    const photoH = 24.5;
    const photoX = 4.75;
    const photoY = 14.8;
    const photoR = 1.8;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(photoX, photoY, photoW, photoH, photoR, photoR, 'F');

    // Render Student Photo (Aspect-ratio preserving cover crop with transparent rounded corners)
    let photoRendered = false;
    if (photo && (photo.startsWith('data:') || photo.startsWith('blob:') || photo.startsWith('http') || photo.startsWith('/'))) {
      try {
        const targetRatio = photoW / photoH;
        const croppedPhoto = await getCoverCroppedImageDataUrl(photo, targetRatio, photoR / photoW);
        const format = croppedPhoto.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(croppedPhoto, format, photoX, photoY, photoW, photoH);
        photoRendered = true;
      } catch (err) {
        photoRendered = false;
      }
    }

    if (!photoRendered) {
      doc.setTextColor(navyR, navyG, navyB);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text((rec.firstName || name).charAt(0).toUpperCase(), photoX + photoW / 2, photoY + 16, { align: 'center' });
    }

    // Navy border on top of photo
    doc.setDrawColor(navyR, navyG, navyB);
    doc.setLineWidth(0.5);
    doc.roundedRect(photoX, photoY, photoW, photoH, photoR, photoR, 'S');

    // Label under photo: STUDENT
    doc.setTextColor(navyR, navyG, navyB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.text('S T U D E N T', 14.5, 43.5, { align: 'center' });

    // Right Column: Student Details
    const rightX = 31.0;
    doc.setTextColor(navyR, navyG, navyB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.4);
    doc.text('STUDENT IDENTITY CARD', rightX, 16.5);

    // Full Student Name (Bold Navy)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(textDarkR, textDarkG, textDarkB);
    doc.text(name.slice(0, 24), rightX, 21.0);

    // Hairline divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(rightX, 22.6, width - 3.0, 22.6);

    // Father's Name Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.8);
    doc.setTextColor(slateR, slateG, slateB);
    doc.text("FATHER'S NAME", rightX, 25.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(15, 23, 42);
    doc.text(String(fatherName || '—').slice(0, 26), rightX, 29.0);

    // Class / Programme Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.8);
    doc.setTextColor(slateR, slateG, slateB);
    doc.text('CLASS / PROGRAMME', rightX, 33.0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(navyR, navyG, navyB);
    doc.text(displayClass.slice(0, 26), rightX, 36.4);

    // Roll No & Session Info Box
    const boxX = rightX;
    const boxY = 38.8;
    const boxW = width - 34.0;
    const boxH = 7.5;

    doc.setFillColor(237, 242, 247);
    doc.roundedRect(boxX, boxY, boxW, boxH, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, boxY, boxW, boxH, 1.5, 1.5, 'S');

    // Left inside capsule: ROLL NO.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.4);
    doc.setTextColor(slateR, slateG, slateB);
    doc.text('ROLL NO.', boxX + 2.5, boxY + 3.0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(navyR, navyG, navyB);
    doc.text(formattedRoll, boxX + 2.5, boxY + 6.2);

    // Center divider inside capsule
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(boxX + boxW / 2, boxY + 1.2, boxX + boxW / 2, boxY + boxH - 1.2);

    // Right inside capsule: SESSION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.4);
    doc.setTextColor(slateR, slateG, slateB);
    doc.text('SESSION', boxX + boxW / 2 + 2.5, boxY + 3.0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(navyR, navyG, navyB);
    doc.text(sessionYear, boxX + boxW / 2 + 2.5, boxY + 6.2);

    // Footer Bar (Front)
    const footerY = height - 6.5;
    const footerH = 5.5;
    doc.setFillColor(navyR, navyG, navyB);
    doc.rect(1.0, footerY, width - 2.0, footerH, 'F');

    // Gold accent tab on top-left of footer
    doc.setFillColor(goldR, goldG, goldB);
    doc.rect(3.0, footerY, 8.0, 0.6, 'F');

    // Left: Website
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.0);
    doc.setTextColor(241, 245, 249);
    doc.text('www.pakroyalcollege.edu.pk', 3.0, footerY + 3.8);

    // Right: Phone Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(251, 191, 36);
    doc.text('03 111 444 810', width - 3.0, footerY + 3.8, { align: 'right' });


    // ────────────────────────────────────────────────────────
    // PAGE 2: BACK SIDE
    // ────────────────────────────────────────────────────────
    doc.addPage([width, height], 'landscape');

    // Outer card border (Sharp rectangular corners for PVC printing)
    doc.setDrawColor(navyR, navyG, navyB);
    doc.setLineWidth(0.6);
    doc.rect(1.0, 1.0, width - 2.0, height - 2.0, 'S');

    // Header Stripe (Deep Royal Navy #0a2544)
    doc.setFillColor(navyR, navyG, navyB);
    doc.rect(1.0, 1.0, width - 2.0, 11.2, 'F');
    doc.rect(1.0, 6.0, width - 2.0, 6.2, 'F');

    // Diagonal Translucent Stripes on Right Half (Matching Web Preview Exactly)
    try {
      if (typeof doc.GState === 'function') {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.18 }));
        doc.setFillColor(255, 255, 255);
        doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
        doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
        doc.restoreGraphicsState();
      } else {
        doc.setFillColor(35, 62, 95);
        doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
        doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
        doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
      }
    } catch (e) {
      doc.setFillColor(35, 62, 95);
      doc.triangle(57.4, 1.0, 70.0, 1.0, 53.2, 12.2, 'F');
      doc.triangle(57.4, 1.0, 53.2, 12.2, 42.8, 12.2, 'F');
      doc.triangle(72.1, 1.0, 84.6, 1.0, 65.8, 12.2, 'F');
      doc.triangle(72.1, 1.0, 65.8, 12.2, 55.3, 12.2, 'F');
    }

    // Left Crest Logo in Back Header
    doc.setFillColor(255, 255, 255);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, (logoSize / 2) + 0.3, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, (logoSize / 2) + 0.6, 'S');

    try {
      if (PAK_ROYAL_COLLEGE_LOGO) {
        doc.addImage(PAK_ROYAL_COLLEGE_LOGO, 'PNG', logoX, logoY, logoSize, logoSize);
      }
    } catch (e) {}

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.text('PAK ROYAL COLLEGE', 14.0, 5.5);

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.1);
    const backHeaderAddrLines = doc.splitTextToSize('Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura', 45);
    doc.text(backHeaderAddrLines, 14.0, 8.2);

    // Right of Back Header: Gold Authorized Signature m. umer w
    try {
      if (PAK_ROYAL_SIGNATURE_GOLD) {
        doc.addImage(PAK_ROYAL_SIGNATURE_GOLD, 'PNG', width - 24.0, 2.0, 18.0, 4.0);
      }
    } catch (e) {}

    // Horizontal line separator under signature
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(width - 24.0, 6.6, width - 4.0, 6.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.2);
    doc.setTextColor(226, 232, 240);
    doc.text('Authorized signature', width - 14.0, 9.2, { align: 'center' });

    // Gold divider line beneath header
    doc.setDrawColor(goldR, goldG, goldB);
    doc.setLineWidth(0.5);
    doc.line(1.0, 12.2, width - 1.0, 12.2);

    // Left Body Column: Instructions & If Found Address (Compact, tight professional spacing)
    const backLeftX = 3.5;
    doc.setTextColor(navyR, navyG, navyB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.text('CARDHOLDER INFORMATION', backLeftX, 16.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.7);
    doc.setTextColor(51, 65, 85);
    doc.text('This card is non-transferable.', backLeftX, 19.0);
    doc.text('Carry it while on college premises.', backLeftX, 21.6);
    doc.text('Report loss to the college office.', backLeftX, 24.2);

    // Hairline divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(backLeftX, 26.2, 52.0, 26.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.4);
    doc.setTextColor(slateR, slateG, slateB);
    doc.text('IF FOUND, PLEASE RETURN TO', backLeftX, 29.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(navyR, navyG, navyB);
    doc.text('Pak Royal College', backLeftX, 32.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.3);
    doc.setTextColor(71, 85, 105);
    const returnAddrLines = doc.splitTextToSize('Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura', 48);
    doc.text(returnAddrLines, backLeftX, 34.6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.2);
    doc.setTextColor(navyR, navyG, navyB);
    doc.text('Contact: 03 111 444 810', backLeftX, 39.2);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(3.2);
    doc.setTextColor(148, 163, 184);
    doc.text('Property of Pak Royal College.', backLeftX, 42.8);

    // Right Body Column: Scannable QR Code Panel
    const qrBoxX = 56.0;
    const qrBoxY = 14.5;
    const qrBoxW = 26.0;
    const qrBoxH = 31.0;

    doc.setFillColor(240, 244, 248);
    doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 2.0, 2.0, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 2.0, 2.0, 'S');

    const qrSize = 16.5;
    const qrX = qrBoxX + (qrBoxW - qrSize) / 2;
    const qrY = qrBoxY + 2.5;

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    }

    doc.setTextColor(navyR, navyG, navyB);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.6);
    doc.text('SCAN STUDENT QR', qrBoxX + qrBoxW / 2, qrBoxY + qrSize + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.0);
    doc.text(formattedRoll, qrBoxX + qrBoxW / 2, qrBoxY + qrSize + 9.0, { align: 'center' });

    // Footer Bar (Back)
    doc.setFillColor(navyR, navyG, navyB);
    doc.rect(1.0, footerY, width - 2.0, footerH, 'F');

    // Gold accent tab on top-left of footer
    doc.setFillColor(goldR, goldG, goldB);
    doc.rect(3.0, footerY, 8.0, 0.6, 'F');

    // Left: Website
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.0);
    doc.setTextColor(241, 245, 249);
    doc.text('www.pakroyalcollege.edu.pk', 3.0, footerY + 3.8);

    // Right: Phone Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(251, 191, 36);
    doc.text('03 111 444 810', width - 3.0, footerY + 3.8, { align: 'right' });
  }
}
