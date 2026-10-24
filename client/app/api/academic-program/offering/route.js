import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProgramOffering, Program, Affiliation, Campus, AcademicSession, Batch } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET(req) {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const { searchParams } = new URL(req.url);
    const query = {};

    const categoryId = searchParams.get('categoryId');
    const programId = searchParams.get('programId');
    const campusId = searchParams.get('campusId');
    const sessionYear = searchParams.get('sessionYear');
    const onlyActive = searchParams.get('onlyActive');

    if (categoryId) query.categoryId = categoryId;
    if (programId) query.programId = programId;
    if (campusId) query.campusId = campusId;
    if (sessionYear) query.sessionYear = parseInt(sessionYear, 10);
    
    if (onlyActive === 'true') {
      query.status = 'Approved';
      query.isActive = true;
    }

    const offerings = await ProgramOffering.find(query)
      .populate('programId')
      .populate('categoryId')
      .populate('campusId')
      .populate('affiliationId')
      .populate('sessionId')
      .sort({ sessionYear: -1, programName: 1 })
      .lean();

    return NextResponse.json({ success: true, data: offerings });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      programId, 
      campusId, 
      affiliationId, 
      sessionId, 
      curriculumVersion, 
      seatCapacity, 
      admissionStartDate, 
      admissionEndDate, 
      feePlan, 
      documentRequirements, 
      dynamicFieldSchema,
      status 
    } = body;

    if (!programId || !affiliationId) {
      return NextResponse.json({ success: false, message: 'Program and Affiliation are required.' }, { status: 400 });
    }

    const [prog, aff, camp, sess] = await Promise.all([
      Program.findById(programId),
      Affiliation.findById(affiliationId),
      campusId ? Campus.findById(campusId) : Campus.findOne(),
      sessionId ? AcademicSession.findById(sessionId) : AcademicSession.findOne({ isCurrent: true })
    ]);

    if (!prog) return NextResponse.json({ success: false, message: 'Selected program does not exist.' }, { status: 404 });
    if (!aff) return NextResponse.json({ success: false, message: 'Selected affiliation does not exist.' }, { status: 404 });

    if (aff.authorizationStatus !== 'Approved') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot create offering: Affiliation "${aff.name}" is not approved (Status: ${aff.authorizationStatus}).` 
      }, { status: 400 });
    }

    const sessionYear = sess?.year || new Date().getFullYear();
    const title = `${prog.name} — ${sess?.name || sessionYear} (${aff.name})`;

    const offering = await ProgramOffering.create({
      title,
      programId: prog._id,
      programName: prog.name,
      programCode: prog.code,
      categoryId: prog.category,
      categoryName: prog.categoryName,
      campusId: camp?._id,
      campusName: camp?.name || 'Main Campus',
      affiliationId: aff._id,
      affiliationName: aff.name,
      sessionId: sess?._id,
      sessionName: sess?.name || `${sessionYear}-${sessionYear + 2}`,
      sessionYear,
      curriculumVersion: curriculumVersion || 'Standard v1.0',
      duration: prog.defaultDuration,
      academicPattern: prog.academicPattern,
      stageType: prog.stageType,
      totalStages: prog.totalStages,
      admissionStartDate: admissionStartDate || '',
      admissionEndDate: admissionEndDate || '',
      seatCapacity: parseInt(seatCapacity, 10) || 60,
      feePlan: feePlan || {
        admissionFee: 5000,
        tuitionFeePerTerm: 25000,
        registrationFee: 3000,
        labPracticalFee: 2000,
        examFee: 2000,
        libraryFee: 1000,
        totalEstimate: 38000,
        installmentsAllowed: true,
        installmentsCount: 2
      },
      documentRequirements: documentRequirements || [
        { name: 'Student Photograph', key: 'photo', required: true },
        { name: 'Student CNIC or B-Form', key: 'cnicFront', required: true },
        { name: 'Father / Guardian CNIC', key: 'cnicBack', required: true },
        { name: 'Matric / SSC Certificate & Marksheet', key: 'qualificationDocument', required: true }
      ],
      dynamicFieldSchema: dynamicFieldSchema || [],
      status: status || 'Approved',
      isActive: true
    });

    await Batch.create({
      name: `${prog.code} ${sessionYear} - Morning`,
      code: `${prog.code}-${String(sessionYear).slice(-2)}M`,
      offeringId: offering._id,
      programId: prog._id,
      shift: 'Morning',
      capacity: offering.seatCapacity,
      currentEnrolled: 0,
      sections: ['A', 'B'],
      status: 'Active'
    });

    return NextResponse.json({ success: true, data: offering }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
