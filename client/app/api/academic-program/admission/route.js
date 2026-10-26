import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  Student, 
  StudentEnrollment, 
  ProgramOffering, 
  Batch, 
  FeePayment,
  FeesInvoice,
  Class
} from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';
import { 
  extractYear, 
  generateAdmissionNumber, 
  generateRollNumber, 
  generateStudentCode 
} from '@/lib/admissionSequence.service';

export async function POST(req) {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();

    const body = await req.json();

    const firstName = String(body.firstName || '').trim();
    if (!firstName) {
      return NextResponse.json({ success: false, message: 'Student First Name is required.' }, { status: 400 });
    }

    const offeringId = body.offeringId;
    let offering = null;
    if (offeringId) {
      offering = await ProgramOffering.findById(offeringId)
        .populate('programId')
        .populate('affiliationId');
    }

    if (!offering && (body.programId || body.className || body.programName)) {
      offering = await ProgramOffering.findOne({
        $or: [
          ...(body.programId ? [{ programId: body.programId }] : []),
          ...(body.className ? [{ programName: { $regex: '^' + String(body.className).trim() + '$', $options: 'i' } }] : []),
          ...(body.programName ? [{ programName: { $regex: '^' + String(body.programName).trim() + '$', $options: 'i' } }] : [])
        ]
      }).populate('programId').populate('affiliationId');
    }

    if (!offering) {
      offering = await ProgramOffering.findOne({ status: 'Approved' })
        .populate('programId')
        .populate('affiliationId');
    }

    if (!offering) {
      offering = await ProgramOffering.findOne()
        .populate('programId')
        .populate('affiliationId');
    }

    if (!offering) {
      // Fallback: create default offering if none exists
      offering = await ProgramOffering.create({
        programName: body.className || 'FSC OTT',
        programCode: 'FSC-OTT',
        categoryName: 'Intermediate / F.Sc',
        campusName: 'Main Campus',
        sessionName: 'Session 2026-2027',
        sessionYear: new Date().getFullYear(),
        status: 'Approved',
        isActive: true,
        seatCapacity: 100,
        enrolledCount: 0
      });
    } else if (offering.status !== 'Approved' || offering.isActive === false) {
      offering.status = 'Approved';
      offering.isActive = true;
      await offering.save().catch(() => {});
    }

    const admissionDate = body.admissionDate || new Date().toISOString().split('T')[0];
    const admissionYear = extractYear(body.admissionYear || admissionDate);

    let batch = null;
    if (body.batchId) {
      batch = await Batch.findById(body.batchId);
    }
    if (!batch) {
      batch = await Batch.findOne({ offeringId: offering._id, status: 'Active' });
    }

    const sectionName = body.sectionName || body.section || (batch?.sections?.[0]) || 'A';
    const shift = body.shift || batch?.shift || 'Morning';

    let student = null;
    let isExistingStudent = false;

    if (body.studentId && body.studentId !== 'new') {
      student = await Student.findById(body.studentId);
      if (student) isExistingStudent = true;
    }

    if (!student && body.cnic && body.cnic.trim()) {
      student = await Student.findOne({ cnic: body.cnic.trim() });
      if (student) isExistingStudent = true;
    }

    if (student) {
      const existingEnrollment = await StudentEnrollment.findOne({
        studentId: student._id,
        offeringId: offering._id,
        batchId: batch?._id,
        enrollmentStatus: { $in: ['Active', 'Pending'] }
      });

      if (existingEnrollment && !body.allowReadmission) {
        return NextResponse.json({
          success: false,
          message: `This student is already actively enrolled in this program offering (${offering.programName}).`
        }, { status: 400 });
      }
    }

    // Atomic Year-Based Identifiers or User-Entered Custom Numbers
    let officialAdmissionNo = body.admissionNo && String(body.admissionNo).trim();
    if (!officialAdmissionNo) {
      const admGen = await generateAdmissionNumber(admissionYear);
      officialAdmissionNo = admGen.admissionNumber;
    }

    let officialRollNo = body.rollNo && String(body.rollNo).trim();
    if (!officialRollNo) {
      const rollGen = await generateRollNumber(admissionYear);
      officialRollNo = rollGen.rollNumber;
    }

    if (isExistingStudent && student) {
      student.phone = body.phone || student.phone;
      student.whatsapp = body.whatsapp || student.whatsapp;
      student.email = body.email || student.email;
      student.currentAddress = body.currentAddress || student.currentAddress;
      student.activeEnrollmentCount = (student.activeEnrollmentCount || 1) + 1;

      student.className = offering.programName;
      student.section = sectionName;
      student.admissionNo = officialAdmissionNo;
      student.rollNo = officialRollNo;
      student.academicYear = String(admissionYear);

      await student.save();
    } else {
      const codeGen = await generateStudentCode(admissionYear);
      const studentCode = codeGen.studentCode;

      const studentData = {
        studentCode,
        firstName,
        lastName: body.lastName || '',
        gender: body.gender || 'Male',
        dob: body.dob || '2005-01-01',
        religion: body.religion || 'Islam',
        caste: body.caste || '',
        bloodGroup: body.bloodGroup || 'B+',
        nationality: body.nationality || 'Pakistani',
        cnic: body.cnic ? body.cnic.trim() : undefined,
        bForm: body.bForm ? body.bForm.trim() : undefined,
        studentPhoto: body.studentPhoto || body.photo || '',
        phone: body.phone ? body.phone.trim() : '',
        whatsapp: body.whatsapp ? body.whatsapp.trim() : (body.phone ? body.phone.trim() : ''),
        email: body.email ? body.email.trim().toLowerCase() : undefined,
        currentAddress: body.currentAddress || body.address || '',
        permanentAddress: body.permanentAddress || body.address || '',
        city: body.city || 'Sharaqpur Sharif',
        emergencyContactName: body.emergencyContactName || body.guardianName || '',
        emergencyContactPhone: body.emergencyContactPhone || body.guardianPhone || '',
        emergencyContactRelation: body.emergencyContactRelation || body.guardianRelation || 'Guardian',
        fatherName: body.fatherName || '',
        fatherPhone: body.fatherPhone || '',
        fatherOccupation: body.fatherOccupation || '',
        fatherCnic: body.fatherCnic || '',
        motherName: body.motherName || '',
        motherPhone: body.motherPhone || '',
        guardianName: body.guardianName || body.fatherName || '',
        guardianRelation: body.guardianRelation || 'Father',
        guardianPhone: body.guardianPhone || body.fatherPhone || '',
        guardianAddress: body.guardianAddress || body.currentAddress || '',
        guardianCnic: body.guardianCnic || body.fatherCnic || '',
        guardianOccupation: body.guardianOccupation || body.fatherOccupation || '',
        isPermanentProfile: true,
        activeEnrollmentCount: 1,

        className: offering.programName,
        section: sectionName,
        admissionNo: officialAdmissionNo,
        rollNo: officialRollNo,
        admissionDate,
        joiningDate: body.joiningDate || admissionDate,
        academicYear: String(admissionYear),
        type: body.type || 'Regular',
        status: 'Active',
        cardTemplate: 'classic-navy',
        cardLayout: 'horizontal',
        themeStyle: 'classic-navy'
      };

      student = await Student.create(studentData);
    }

    // Auto-sync Class collection
    try {
      const clsExists = await Class.findOne({ name: { $regex: '^' + offering.programName.trim() + '$', $options: 'i' } });
      if (!clsExists) {
        await Class.create({ name: offering.programName.trim(), sections: [sectionName, 'A', 'B'] });
      }
    } catch (_) {}

    const incomingFee = body.feePlan || {};
    const offeringFee = offering.feePlan || offering.feeStructure || {};

    const admissionFee = incomingFee.admissionFee !== undefined ? parseFloat(incomingFee.admissionFee) || 0 : (parseFloat(offeringFee.admissionFee) || 5000);
    const tuitionFee = incomingFee.tuitionFee !== undefined ? parseFloat(incomingFee.tuitionFee) || 0 : (parseFloat(offeringFee.tuitionFeePerTerm || offeringFee.tuitionFee) || 25000);
    const securityDeposit = incomingFee.securityDeposit !== undefined ? parseFloat(incomingFee.securityDeposit) || 0 : (parseFloat(offeringFee.securityDeposit) || 0);
    const examFee = incomingFee.examFee !== undefined ? parseFloat(incomingFee.examFee) || 0 : (parseFloat(offeringFee.examFee) || 2000);
    const labFee = incomingFee.labFee !== undefined ? parseFloat(incomingFee.labFee) || 0 : (parseFloat(offeringFee.labFee || offeringFee.labPracticalFee) || 1000);

    const totalFee = incomingFee.grossTotal !== undefined ? parseFloat(incomingFee.grossTotal) || 0 : (admissionFee + tuitionFee + securityDeposit + examFee + labFee);
    const concessionAmount = parseFloat(incomingFee.concessionDiscount || body.concessionAmount || 0) || 0;
    const netPayable = incomingFee.netPayable !== undefined ? parseFloat(incomingFee.netPayable) || 0 : Math.max(0, totalFee - concessionAmount);

    const enrollment = await StudentEnrollment.create({
      studentId: student._id,
      studentCode: student.studentCode,
      studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
      offeringId: offering._id,
      programId: offering.programId,
      categoryId: offering.categoryId,
      campusId: offering.campusId,
      affiliationId: offering.affiliationId,
      sessionId: offering.sessionId,
      batchId: batch?._id,
      programName: offering.programName,
      programCode: offering.programCode,
      categoryName: offering.categoryName,
      campusName: offering.campusName,
      affiliationName: offering.affiliationName,
      sessionName: offering.sessionName,
      batchName: batch?.name || 'Main Batch',
      sectionName,
      shift,
      admissionYear,
      admissionDate,
      admissionNumber: officialAdmissionNo,
      rollNumber: officialRollNo,
      applicationStatus: 'Accepted',
      enrollmentStatus: 'Active',
      externalRegistrationStatus: 'Not Submitted',
      financeStatus: netPayable === 0 ? 'Clear' : 'Partially Paid',
      academicStage: offering.stageType === 'Part' ? 'Part I' : 'Semester 1',
      admissionType: body.admissionType || 'Regular',

      previousQualifications: Array.isArray(body.previousQualifications) ? body.previousQualifications : [],
      dynamicFields: body.dynamicFields || {},
      documents: Array.isArray(body.documents) ? body.documents : [],

      feeStructureSnapshot: {
        admissionFee,
        tuitionFee,
        registrationFee: 0,
        labFee,
        examFee,
        libraryFee: 0,
        totalFee,
        concessionAmount,
        concessionReason: body.concessionReason || incomingFee.invoiceNotes || '',
        concessionApprovedBy: 'Administrator',
        netPayable,
        challanGenerated: true,
        challanNumber: `CHL-${admissionYear}-${String(officialAdmissionNo).replace(/\D/g, '')}`
      },

      history: [{
        action: 'Admission Approved & Enrolled',
        fromStatus: 'Draft',
        toStatus: 'Active',
        actor: 'Administrator',
        timestamp: new Date(),
        reason: 'Online Admission Form Submission'
      }]
    });

    await ProgramOffering.findByIdAndUpdate(offering._id, { $inc: { enrolledCount: 1 } });
    if (batch?._id) {
      await Batch.findByIdAndUpdate(batch._id, { $inc: { currentEnrolled: 1 } });
    }

    let invoice = null;
    try {
      const challanNo = enrollment.feeStructureSnapshot?.challanNumber || `CHL-${admissionYear}-${String(officialAdmissionNo).replace(/\D/g, '')}`;
      const billingMonth = `${admissionYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      invoice = await FeesInvoice.create({
        invoiceNo: `INV-${admissionYear}-${officialAdmissionNo.slice(-4)}`,
        challanNo,
        billingMonth,
        dueDate,
        studentId: student._id,
        student: `${student.firstName} ${student.lastName || ''}`.trim(),
        fatherName: student.fatherName || '',
        rollNo: officialRollNo,
        admissionNo: officialAdmissionNo,
        className: offering.programName,
        section: sectionName,
        feeType: 'Admission & Term Fee',
        feeItems: [
          { head: 'Admission Fee', amount: admissionFee },
          { head: 'Tuition Fee', amount: tuitionFee },
          { head: 'Security Deposit', amount: securityDeposit },
          { head: 'Laboratory / Practical Fee', amount: labFee },
          { head: 'Examination Fee', amount: examFee }
        ],
        amount: totalFee,
        waiver: concessionAmount,
        fine: 0,
        paid: 0,
        balance: netPayable,
        paymentMethod: 'Cash',
        note: `Initial Admission Fee Challan for ${offering.programName}`,
        status: 'Unpaid',
        date: new Date()
      });
    } catch (invErr) {
      console.warn('Invoice generation warning (Next.js):', invErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Student admission successfully created and enrolled!',
      admissionNo: officialAdmissionNo,
      rollNo: officialRollNo,
      studentCode: student.studentCode,
      studentId: student._id,
      data: {
        student,
        enrollment,
        invoice,
        admissionNumber: officialAdmissionNo,
        rollNumber: officialRollNo,
        isExistingStudent
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Admission creation error (Next.js):', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to complete admission.' }, { status: 500 });
  }
}
