import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, StudentEnrollment, FeesInvoice } from '@/lib/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cleanDateStr = (val) => {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const dd = String(val.getUTCDate()).padStart(2, '0');
    const mm = String(val.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = val.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  const str = String(val).trim();
  if (!str || str === '—' || str === '-' || str === 'null' || str === 'undefined') return '';

  const excelSerialToDMY = (serial) => {
    if (serial >= 1000 && serial <= 80000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + serial * msPerDay);
      if (!isNaN(date.getTime()) && date.getUTCFullYear() > 1900 && date.getUTCFullYear() < 2100) {
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = date.getUTCFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return null;
  };

  if (/^\d{4,6}(\.\d+)?$/.test(str)) {
    const conv = excelSerialToDMY(Math.floor(parseFloat(str)));
    if (conv) return conv;
  }

  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (n > 2100 && n <= 80000) {
        const conv = excelSerialToDMY(n);
        if (conv) return conv;
      }
    }
  }

  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const yyyy = isoMatch[1];
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const dd = dmyMatch[1].padStart(2, '0');
    const mm = dmyMatch[2].padStart(2, '0');
    const yyyy = dmyMatch[3];
    return `${dd}/${mm}/${yyyy}`;
  }

  return str;
};

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    const studentObj = { ...student };

    // If student lacks stored fee details, fallback-populate from StudentEnrollment or FeesInvoice
    if (studentObj.feeTuition === undefined && studentObj.feeGross === undefined) {
      try {
        const enr = await StudentEnrollment.findOne({ studentId: id }).lean();
        if (enr?.feeStructureSnapshot) {
          const snap = enr.feeStructureSnapshot;
          studentObj.feeAdmission = snap.admissionFee || 0;
          studentObj.feeTuition = snap.tuitionFee || 0;
          studentObj.feeSecurity = snap.securityDeposit || 0;
          studentObj.feeExam = snap.examFee || 0;
          studentObj.feeOther = snap.labFee || 0;
          studentObj.feeGross = snap.totalFee || 0;
          studentObj.concessionDiscount = snap.concessionAmount || 0;
          studentObj.concessionReason = snap.concessionReason || '';
          studentObj.netPayable = snap.netPayable || 0;
          studentObj.feeNetPayable = snap.netPayable || 0;
        } else {
          const inv = await FeesInvoice.findOne({
            $or: [
              { studentId: id },
              ...(studentObj.admissionNo ? [{ admissionNo: studentObj.admissionNo }] : [])
            ]
          }).sort({ createdAt: -1 }).lean();

          if (inv) {
            studentObj.feeGross = inv.amount || 0;
            studentObj.concessionDiscount = inv.waiver || 0;
            studentObj.netPayable = inv.balance || 0;
            studentObj.feeNetPayable = inv.balance || 0;
            if (Array.isArray(inv.feeItems)) {
              inv.feeItems.forEach(item => {
                const h = (item.head || '').toLowerCase();
                if (h.includes('admission')) studentObj.feeAdmission = item.amount;
                else if (h.includes('tuition')) studentObj.feeTuition = item.amount;
                else if (h.includes('security')) studentObj.feeSecurity = item.amount;
                else if (h.includes('exam')) studentObj.feeExam = item.amount;
                else if (h.includes('lab') || h.includes('other')) studentObj.feeOther = item.amount;
              });
            }
          }
        }
      } catch (_) {}
    }

    const formatted = {
      ...studentObj,
      dob: cleanDateStr(student.dob),
      admissionDate: cleanDateStr(student.admissionDate),
      joiningDate: cleanDateStr(student.joiningDate)
    };

    return NextResponse.json(
      { success: true, data: formatted },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('API /student/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const dataObj = { ...body };

    // Normalize emergencyContact if sent as an object
    if (dataObj.emergencyContact && typeof dataObj.emergencyContact === 'object') {
      if (!dataObj.emergencyContactPhone) dataObj.emergencyContactPhone = dataObj.emergencyContact.phone || '';
      if (!dataObj.emergencyContactName) dataObj.emergencyContactName = dataObj.emergencyContact.name || '';
      if (!dataObj.emergencyContactRelation) dataObj.emergencyContactRelation = dataObj.emergencyContact.relationship || dataObj.emergencyContact.relation || '';
      dataObj.emergencyContact = dataObj.emergencyContact.phone || dataObj.emergencyContact.name || '';
    }

    // Keep studentPhoto and photo synchronized
    if (dataObj.studentPhoto || dataObj.photo) {
      const p = dataObj.studentPhoto || dataObj.photo;
      dataObj.studentPhoto = p;
      dataObj.photo = p;
    }

    // Clean up empty ObjectId / optional fields
    if (!dataObj.studentGroup || dataObj.studentGroup === '' || dataObj.studentGroup === 'undefined' || dataObj.studentGroup === 'null') {
      delete dataObj.studentGroup;
    }
    if (!dataObj.classId || dataObj.classId === '' || dataObj.classId === 'undefined' || dataObj.classId === 'null') {
      delete dataObj.classId;
    }

    // Parse Full Name if single name field was submitted
    if (dataObj.name || dataObj.fullName || dataObj.studentName) {
      const rawName = String(dataObj.studentName || dataObj.fullName || dataObj.name).trim();
      if (!dataObj.firstName) dataObj.firstName = rawName;
    }
    if (dataObj.firstName && (!dataObj.lastName || !dataObj.lastName.trim())) {
      const parts = String(dataObj.firstName).trim().split(/\s+/);
      if (parts.length > 1) {
        dataObj.firstName = parts[0];
        dataObj.lastName = parts.slice(1).join(' ');
      }
    }

    // Keep studentName, name, and fullName in sync
    const computedName = [dataObj.firstName, dataObj.lastName].filter(Boolean).join(' ').trim();
    if (computedName) {
      dataObj.studentName = dataObj.studentName || computedName;
      dataObj.name = dataObj.name || computedName;
      dataObj.fullName = dataObj.fullName || computedName;
    }

    // Sync father/mother/guardian
    if (dataObj.fatherName || dataObj.fatherPhone || dataObj.fatherCnic || dataObj.fatherOccupation) {
      dataObj.father = {
        name: dataObj.fatherName || dataObj.father?.name || '',
        phone: dataObj.fatherPhone || dataObj.father?.phone || '',
        cnic: dataObj.fatherCnic || dataObj.father?.cnic || '',
        occupation: dataObj.fatherOccupation || dataObj.father?.occupation || ''
      };
    }

    // Fee calculations and payload normalization
    const hasFeeData = 
      dataObj.feeAdmission !== undefined ||
      dataObj.feeTuition !== undefined ||
      dataObj.feeSecurity !== undefined ||
      dataObj.feeExam !== undefined ||
      dataObj.feeOther !== undefined ||
      dataObj.concessionType !== undefined ||
      dataObj.concessionValue !== undefined ||
      dataObj.netPayable !== undefined ||
      dataObj.feeGross !== undefined ||
      dataObj.feePlan !== undefined;

    if (hasFeeData) {
      const admissionFee = Number(dataObj.feeAdmission ?? dataObj.feePlan?.admissionFee ?? 0) || 0;
      const tuitionFee = Number(dataObj.feeTuition ?? dataObj.feePlan?.tuitionFee ?? 0) || 0;
      const securityDeposit = Number(dataObj.feeSecurity ?? dataObj.feePlan?.securityDeposit ?? 0) || 0;
      const examFee = Number(dataObj.feeExam ?? dataObj.feePlan?.examFee ?? 0) || 0;
      const labFee = Number(dataObj.feeOther ?? dataObj.feePlan?.labFee ?? 0) || 0;
      const computedGross = admissionFee + tuitionFee + securityDeposit + examFee + labFee;
      const grossTotal = Number(dataObj.feeGross ?? dataObj.feePlan?.grossTotal ?? computedGross) || computedGross;

      const concessionType = dataObj.concessionType || dataObj.feePlan?.concessionType || 'None';
      const concessionVal = Number(dataObj.concessionValue ?? dataObj.feePlan?.concessionValue ?? 0) || 0;
      let concessionDiscount = Number(dataObj.concessionDiscount ?? dataObj.feePlan?.concessionDiscount ?? 0) || 0;
      if (concessionType === 'Percentage' && concessionVal > 0) {
        concessionDiscount = Math.round((grossTotal * concessionVal) / 100);
      } else if (concessionType === 'Fixed' && concessionVal > 0) {
        concessionDiscount = Math.min(concessionVal, grossTotal);
      }

      const netPayable = Math.max(0, grossTotal - concessionDiscount);

      dataObj.feeAdmission = admissionFee;
      dataObj.feeTuition = tuitionFee;
      dataObj.feeSecurity = securityDeposit;
      dataObj.feeExam = examFee;
      dataObj.feeOther = labFee;
      dataObj.feeGross = grossTotal;
      dataObj.concessionType = concessionType;
      dataObj.concessionValue = concessionVal;
      dataObj.concessionDiscount = concessionDiscount;
      dataObj.netPayable = netPayable;
      dataObj.feeNetPayable = netPayable;
      dataObj.feePlan = {
        admissionFee,
        tuitionFee,
        securityDeposit,
        examFee,
        labFee,
        grossTotal,
        concessionType,
        concessionValue: concessionVal,
        concessionDiscount,
        netPayable,
        generateInvoice: dataObj.generateInvoice !== false,
        invoiceNotes: dataObj.invoiceNotes || ''
      };
    }

    const updated = await Student.findByIdAndUpdate(id, dataObj, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    // Synchronize FeesInvoice and StudentEnrollment whenever fees are provided
    if (hasFeeData) {
      try {
        const admissionFee = Number(updated.feeAdmission) || 0;
        const tuitionFee = Number(updated.feeTuition) || 0;
        const securityDeposit = Number(updated.feeSecurity) || 0;
        const examFee = Number(updated.feeExam) || 0;
        const labFee = Number(updated.feeOther) || 0;
        const grossTotal = Number(updated.feeGross) || (admissionFee + tuitionFee + securityDeposit + examFee + labFee);
        const concessionDiscount = Number(updated.concessionDiscount) || 0;
        const netPayable = Math.max(0, grossTotal - concessionDiscount);

        const feeItems = [
          { head: 'Admission Fee', amount: admissionFee },
          { head: 'Tuition Fee', amount: tuitionFee },
          { head: 'Security Deposit', amount: securityDeposit },
          { head: 'Exam Fee', amount: examFee },
          { head: 'Lab / Other Fee', amount: labFee }
        ].filter(item => item.amount > 0);

        if (feeItems.length === 0 && grossTotal > 0) {
          feeItems.push({ head: 'Tuition Fee', amount: grossTotal });
        }

        // Find existing unpaid/partial invoice for this student, or latest invoice
        let invoice = await FeesInvoice.findOne({
          $or: [
            { studentId: updated._id },
            ...(updated.admissionNo ? [{ admissionNo: updated.admissionNo }] : [])
          ],
          status: { $in: ['Unpaid', 'Partial', 'UNPAID', 'PARTIAL'] }
        }).sort({ createdAt: -1 });

        if (!invoice) {
          invoice = await FeesInvoice.findOne({
            $or: [
              { studentId: updated._id },
              ...(updated.admissionNo ? [{ admissionNo: updated.admissionNo }] : [])
            ]
          }).sort({ createdAt: -1 });
        }

        const studentDisplayName = updated.fullName || updated.studentName || `${updated.firstName} ${updated.lastName || ''}`.trim();
        const admNo = updated.admissionNo || '0001';
        const admissionYear = updated.academicYear || String(new Date().getFullYear());

        if (invoice) {
          const paid = Number(invoice.paid) || 0;
          const fine = Number(invoice.fine) || 0;
          const newBalance = Math.max(0, (grossTotal + fine) - (paid + concessionDiscount));
          const newStatus = newBalance === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');

          invoice.amount = grossTotal;
          invoice.waiver = concessionDiscount;
          invoice.balance = newBalance;
          invoice.status = newStatus;
          if (feeItems.length > 0) invoice.feeItems = feeItems;
          invoice.student = studentDisplayName;
          invoice.fatherName = updated.fatherName || invoice.fatherName || '';
          invoice.rollNo = updated.rollNo || invoice.rollNo || '';
          invoice.admissionNo = admNo;
          invoice.className = updated.className || invoice.className || '';
          invoice.section = updated.section || invoice.section || 'A';
          if (dataObj.invoiceNotes) invoice.note = dataObj.invoiceNotes;
          await invoice.save();
        } else if (grossTotal > 0) {
          const billingMonth = `${admissionYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 15);
          const challanNo = `CHL-${admissionYear}-${String(admNo).replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

          await FeesInvoice.create({
            invoiceNo: `INV-${admissionYear}-${admNo.slice(-4) || '0001'}`,
            challanNo,
            billingMonth,
            dueDate,
            studentId: updated._id,
            student: studentDisplayName,
            fatherName: updated.fatherName || '',
            rollNo: updated.rollNo || '',
            admissionNo: admNo,
            className: updated.className || 'General',
            section: updated.section || 'A',
            feeType: 'Tuition & Academic Fees',
            feeItems: feeItems.length > 0 ? feeItems : [{ head: 'Tuition Fee', amount: grossTotal }],
            amount: grossTotal,
            waiver: concessionDiscount,
            fine: 0,
            paid: 0,
            balance: netPayable,
            paymentMethod: 'Cash',
            note: dataObj.invoiceNotes || `Fee structure updated for ${studentDisplayName}`,
            status: netPayable === 0 ? 'Paid' : 'Unpaid',
            date: new Date()
          });
        }

        // Also sync StudentEnrollment fee snapshot
        await StudentEnrollment.updateMany(
          { studentId: updated._id },
          {
            $set: {
              'feeStructureSnapshot.admissionFee': admissionFee,
              'feeStructureSnapshot.tuitionFee': tuitionFee,
              'feeStructureSnapshot.securityDeposit': securityDeposit,
              'feeStructureSnapshot.labFee': labFee,
              'feeStructureSnapshot.examFee': examFee,
              'feeStructureSnapshot.totalFee': grossTotal,
              'feeStructureSnapshot.concessionAmount': concessionDiscount,
              'feeStructureSnapshot.netPayable': netPayable,
              financeStatus: netPayable === 0 ? 'Clear' : 'Partially Paid'
            }
          }
        ).catch(() => {});
      } catch (errSync) {
        console.error('Error synchronizing student fee invoice:', errSync);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('API /student/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('API /student/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete student' }, { status: 500 });
  }
}
