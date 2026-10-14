import jsPDF from 'jspdf';

/**
 * Generates an official, printable ID Card PDF (Standard CR80 54mm x 86mm badge format)
 * Contains ONLY the card content, badges, school header, student/staff bio, and verification seal.
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

  const schoolName = schoolSetting?.schoolName || 'STOOFI PUBLIC SCHOOL';
  const schoolAddress = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';
  const schoolPhone = schoolSetting?.phone || '+92 300 1234567';

  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
  const role = rec.role || (rec.admissionNo ? 'Student' : 'Staff');
  const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
  const rollNo = rec.rollNo || '101';
  const className = rec.className || 'Class 10';
  const section = rec.section || 'A';
  const fatherName = rec.fatherName || 'Guardian';
  const bloodGroup = rec.bloodGroup || 'B+';
  const phone = rec.phone || rec.mobile || schoolPhone;
  const designation = rec.designation || 'Senior Faculty';
  const department = rec.department || 'Academics';

  // Card Outer Border
  doc.setDrawColor(8, 74, 134); // Stoofi Primary Blue
  doc.setLineWidth(0.8);
  doc.roundedRect(1.5, 1.5, width - 3, height - 3, 3, 3, 'S');

  if (!isHorizontal) {
    // ── VERTICAL BADGE LAYOUT ──
    // Header Banner
    doc.setFillColor(8, 74, 134);
    doc.roundedRect(2, 2, width - 4, 16, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('OFFICIAL IDENTITY CARD', width / 2, 5.5, { align: 'center' });

    doc.setFontSize(8.5);
    doc.text(schoolName.toUpperCase().slice(0, 26), width / 2, 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(schoolAddress.slice(0, 36), width / 2, 14, { align: 'center' });

    // Photo Box Placeholder
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(8, 74, 134);
    doc.setLineWidth(0.5);
    doc.roundedRect((width - 18) / 2, 20, 18, 18, 9, 9, 'FD');

    // Initial avatar inside photo box
    doc.setTextColor(8, 74, 134);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(name.charAt(0).toUpperCase(), width / 2, 31.5, { align: 'center' });

    // Name & Role Badge
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(name.slice(0, 22), width / 2, 42, { align: 'center' });

    doc.setFillColor(224, 242, 254);
    doc.roundedRect((width - 24) / 2, 43.5, 24, 4.5, 2, 2, 'F');
    doc.setTextColor(3, 105, 161);
    doc.setFontSize(6.5);
    doc.text(role.toUpperCase(), width / 2, 46.8, { align: 'center' });

    // Details Grid Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(4, 50, width - 8, 25, 2, 2, 'FD');

    doc.setFontSize(6);
    let y = 54;
    const addRow = (label, val, valColor = [15, 23, 42]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 6, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(valColor[0], valColor[1], valColor[2]);
      doc.text(String(val).slice(0, 20), width - 6, y, { align: 'right' });
      y += 4.5;
    };

    if (role === 'Student') {
      addRow('Admission No:', admNo);
      addRow('Class & Sec:', `${className} (${section})`, [8, 74, 134]);
      addRow('Roll Number:', rollNo);
      addRow('Father Name:', fatherName);
      addRow('Blood Group:', bloodGroup, [225, 29, 72]);
    } else {
      addRow('Staff ID:', admNo);
      addRow('Designation:', designation, [8, 74, 134]);
      addRow('Department:', department);
      addRow('Emergency:', phone);
      addRow('Blood Group:', bloodGroup, [225, 29, 72]);
    }

    // Footer Bar
    doc.setFillColor(241, 245, 249);
    doc.rect(2, height - 7.5, width - 4, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105);
    doc.text('VERIFIED INSTITUTIONAL BADGE', 5, height - 4);
    doc.text('PRINCIPAL SEAL & SIGN', width - 5, height - 4, { align: 'right' });

  } else {
    // ── HORIZONTAL CARD LAYOUT ──
    // Header
    doc.setFillColor(8, 74, 134);
    doc.roundedRect(2, 2, width - 4, 12, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(schoolName.toUpperCase().slice(0, 36), width / 2, 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(schoolAddress.slice(0, 48), width / 2, 11, { align: 'center' });

    // Left: Photo
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(8, 74, 134);
    doc.roundedRect(5, 17, 18, 22, 2, 2, 'FD');
    doc.setTextColor(8, 74, 134);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(name.charAt(0).toUpperCase(), 14, 30, { align: 'center' });

    // Right: Info
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(name.slice(0, 26), 26, 20);

    doc.setFontSize(6);
    let hy = 24.5;
    const addHRow = (label, val) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 26, hy);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(val).slice(0, 24), 48, hy);
      hy += 3.8;
    };

    if (role === 'Student') {
      addHRow('Adm No:', admNo);
      addHRow('Class & Sec:', `${className} (${section})`);
      addHRow('Roll No:', rollNo);
      addHRow('Father:', fatherName);
      addHRow('Blood Group:', bloodGroup);
    } else {
      addHRow('Staff ID:', admNo);
      addHRow('Designation:', designation);
      addHRow('Department:', department);
      addHRow('Emergency:', phone);
    }

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(2, height - 7, width - 4, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105);
    doc.text('OFFICIAL VERIFIED SMART CARD', 5, height - 3.5);
    doc.text('AUTHORIZED SIGNATURE', width - 5, height - 3.5, { align: 'right' });
  }

  // Save the PDF
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
    if (index > 0) doc.addPage([width, height], isHorizontal ? 'landscape' : 'portrait');

    const schoolName = schoolSetting?.schoolName || 'STOOFI PUBLIC SCHOOL';
    const schoolAddress = schoolSetting?.address || 'Main Campus, Lahore, Pakistan';
    const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
    const role = rec.role || (rec.admissionNo ? 'Student' : 'Staff');
    const admNo = rec.admissionNo || rec.staffNo || 'ADM-2026-001';
    const rollNo = rec.rollNo || '101';
    const className = rec.className || 'Class 10';
    const section = rec.section || 'A';
    const fatherName = rec.fatherName || 'Guardian';
    const bloodGroup = rec.bloodGroup || 'B+';

    // Outer border
    doc.setDrawColor(8, 74, 134);
    doc.setLineWidth(0.8);
    doc.roundedRect(1.5, 1.5, width - 3, height - 3, 3, 3, 'S');

    // Header
    doc.setFillColor(8, 74, 134);
    doc.roundedRect(2, 2, width - 4, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('OFFICIAL IDENTITY CARD', width / 2, 5.5, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text(schoolName.toUpperCase().slice(0, 26), width / 2, 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(schoolAddress.slice(0, 36), width / 2, 14, { align: 'center' });

    // Photo Box Placeholder
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(8, 74, 134);
    doc.roundedRect((width - 18) / 2, 20, 18, 18, 9, 9, 'FD');
    doc.setTextColor(8, 74, 134);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(name.charAt(0).toUpperCase(), width / 2, 31.5, { align: 'center' });

    // Name & Role Badge
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(name.slice(0, 22), width / 2, 42, { align: 'center' });

    doc.setFillColor(224, 242, 254);
    doc.roundedRect((width - 24) / 2, 43.5, 24, 4.5, 2, 2, 'F');
    doc.setTextColor(3, 105, 161);
    doc.setFontSize(6.5);
    doc.text(role.toUpperCase(), width / 2, 46.8, { align: 'center' });

    // Details Grid Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(4, 50, width - 8, 25, 2, 2, 'FD');

    doc.setFontSize(6);
    let y = 54;
    const addRow = (label, val, valColor = [15, 23, 42]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 6, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(valColor[0], valColor[1], valColor[2]);
      doc.text(String(val).slice(0, 20), width - 6, y, { align: 'right' });
      y += 4.5;
    };

    addRow('Admission No:', admNo);
    addRow('Class & Sec:', `${className} (${section})`, [8, 74, 134]);
    addRow('Roll Number:', rollNo);
    addRow('Father Name:', fatherName);
    addRow('Blood Group:', bloodGroup, [225, 29, 72]);

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(2, height - 7.5, width - 4, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(71, 85, 105);
    doc.text('VERIFIED INSTITUTIONAL BADGE', 5, height - 4);
    doc.text('PRINCIPAL SEAL & SIGN', width - 5, height - 4, { align: 'right' });
  });

  doc.save(`Stoofi_ID_Cards_Batch_${recordsList.length}.pdf`);
};
