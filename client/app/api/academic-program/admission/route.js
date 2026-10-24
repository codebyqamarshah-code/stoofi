import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  Student, 
  StudentEnrollment, 
  ProgramOffering, 
  Batch, 
  FeePayment,
  FeesInvoice 
} from '@/lib/models';
import { 
  extractYear, 
  generateAdmissionNumber, 
  generateRollNumber, 
  generateStudentCode 
} from '@/lib/admissionSequence.service';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const firstName = String(body.firstName || '').trim();
    if (!firstName) {
      return NextResponse.json({ success: false, message: 'Student First Name is required.' }, { status: 400 });
    }

    const offeringId = body.offeringId;
    if (!offeringId) {
      return NextResponse.json({ success: false, message: 'Please select an academic Program Offering.' }, { status: 400 });
    }

    const offering = await ProgramOffering.findById(offeringId)
      .populate('programId')
      .populate('affiliationId');

    if (!offering) {
      return NextResponse.json({ success: false, message: 'Selected program offering was not found.' }, { status: 404 });
    }
    if (offering.status !== 'Approved' || offering.isActive === false) {
      return NextResponse.json({ 
        success: false, 
        message: `Offering "${offering.title}" is not available for admission (Status: ${offering.status}).` 
      }, { status: 400 });
    }

    if (offering.seatCapacity && offering.enrolledCount >= offering.seatCapacity) {
      if (!body.allowCapacityOverride) {
        return NextResponse.json({ 
          success: false, 
          message: `Program offering has reached full capacity (${offering.enrolledCount}/${offering.seatCapacity} seats).` 
        }, { status: 400 });
      }
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

    // Atomic Year-Based Identifiers
    const admGen = await generateAdmissionNumber(admissionYear);
    const rollGen = await generateRollNumber(admissionYear);
    const officialAdmissionNo = admGen.admissionNumber;
    const officialRollNo = rollGen.rollNumber;

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
        status: 'Active'
      };

      student = await Student.create(studentData);
    }

    const feePlan = offering.feePlan || {};
    const totalFee = feePlan.totalEstimate || 38000;
    const concessionAmount = parseFloat(body.concessionAmount || 0) || 0;
    const netPayable = Math.max(0, totalFee - concessionAmount);

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
        admissionFee: feePlan.admissionFee || 5000,
        tuitionFee: feePlan.tuitionFeePerTerm || 25000,
        registrationFee: feePlan.registrationFee || 3000,
        labFee: feePlan.labPracticalFee || 2000,
        examFee: feePlan.examFee || 2000,
        libraryFee: feePlan.libraryFee || 1000,
        totalFee,
        concessionAmount,
        concessionReason: body.concessionReason || '',
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
      const challanNo = enrollment.feeStructureSnapshot.challanNumber;
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
          { head: 'Admission Fee', amount: feePlan.admissionFee || 5000 },
          { head: 'Tuition Fee', amount: feePlan.tuitionFeePerTerm || 25000 },
          { head: 'Registration Fee', amount: feePlan.registrationFee || 3000 },
          { head: 'Laboratory / Practical Fee', amount: feePlan.labPracticalFee || 2000 },
          { head: 'Examination Fee', amount: feePlan.examFee || 2000 },
          { head: 'Library Fee', amount: feePlan.libraryFee || 1000 }
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
