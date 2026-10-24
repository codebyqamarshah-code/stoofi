const AcademicCategory = require('../models/AcademicCategory');
const Affiliation = require('../models/Affiliation');
const Campus = require('../models/Campus');
const AcademicSession = require('../models/AcademicSession');
const Program = require('../models/Program');
const ProgramOffering = require('../models/ProgramOffering');
const Batch = require('../models/Batch');
const ClassModel = require('../models/Class');

async function ensureAcademicHierarchySeeded() {
  try {
    // 1. Ensure Categories exist
    const categoryCount = await AcademicCategory.countDocuments();
    let categories = [];
    if (categoryCount === 0) {
      categories = await AcademicCategory.create([
        {
          name: 'Intermediate / F.Sc',
          code: 'INTER',
          description: 'Higher Secondary School Certificate programs (Pre-Medical, OTT, Nursing, Dental, FA)',
          applicableStageType: 'Part',
          displayOrder: 1,
          status: 'Active'
        },
        {
          name: 'BS / Undergraduate',
          code: 'BS',
          description: '4-Year Bachelor of Science degrees (BS Psychology, BS RIT, BS DPT, BS CS)',
          applicableStageType: 'Semester',
          displayOrder: 2,
          status: 'Active'
        },
        {
          name: 'ADP (Associate Degree)',
          code: 'ADP',
          description: '2-Year Associate Degree Programs affiliated with universities',
          applicableStageType: 'Semester',
          displayOrder: 3,
          status: 'Active'
        },
        {
          name: 'Diploma & Allied Health',
          code: 'DIP',
          description: 'Professional medical & technical diplomas (B Category Pharmacy, LHV, CMW)',
          applicableStageType: 'Part',
          displayOrder: 4,
          status: 'Active'
        },
        {
          name: 'Certificate Courses',
          code: 'CERT',
          description: 'Short-duration clinical, computer, and vocational certifications',
          applicableStageType: 'Module',
          displayOrder: 5,
          status: 'Active'
        }
      ]);
    } else {
      categories = await AcademicCategory.find().lean();
    }

    const catMap = {};
    categories.forEach(c => { catMap[c.code] = c; });

    // 2. Ensure Campuses exist
    const campusCount = await Campus.countDocuments();
    let mainCampus = null;
    if (campusCount === 0) {
      mainCampus = await Campus.create({
        name: 'Main Campus - Sharaqpur Sharif',
        code: 'MC-01',
        address: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura',
        phone: '03 111 444 810',
        email: 'info@pakroyalcollege.edu.pk',
        status: 'Active',
        isMainCampus: true
      });
    } else {
      mainCampus = await Campus.findOne({ isMainCampus: true }) || await Campus.findOne();
    }

    // 3. Ensure Affiliations exist
    const affCount = await Affiliation.countDocuments();
    let affiliations = [];
    if (affCount === 0) {
      affiliations = await Affiliation.create([
        {
          name: 'Punjab Board of Technical Education (PBTE)',
          code: 'PBTE',
          type: 'Technical Board',
          approvalReference: 'PBTE/REG/2024/7712',
          verificationEvidence: 'Authorized Govt Technical Exam Board',
          validityFrom: '2020-01-01',
          validityTo: '2030-12-31',
          contactPerson: 'Secretary PBTE Lahore',
          contactPhone: '042-99260276',
          contactEmail: 'info@pbte.edu.pk',
          authorizationStatus: 'Approved',
          isActive: true
        },
        {
          name: 'Board of Intermediate & Secondary Education (BISE) Lahore',
          code: 'BISE-LHR',
          type: 'Board of Intermediate & Secondary Education',
          approvalReference: 'BISE/REC/2022/4119',
          validityFrom: '2020-01-01',
          validityTo: '2030-12-31',
          authorizationStatus: 'Approved',
          isActive: true
        },
        {
          name: 'University of the Punjab (PU)',
          code: 'PU',
          type: 'University',
          approvalReference: 'PU/AFF/2023/8821',
          validityFrom: '2021-01-01',
          validityTo: '2028-12-31',
          authorizationStatus: 'Approved',
          isActive: true
        },
        {
          name: 'Pharmacy Council of Pakistan (PCP)',
          code: 'PCP',
          type: 'Council',
          approvalReference: 'PCP/REC/2021/3390',
          validityFrom: '2020-01-01',
          validityTo: '2030-12-31',
          authorizationStatus: 'Approved',
          isActive: true
        },
        {
          name: 'Pakistan Nursing & Midwifery Council (PNMC)',
          code: 'PNMC',
          type: 'Council',
          approvalReference: 'PNMC/APP/2022/1908',
          validityFrom: '2020-01-01',
          validityTo: '2030-12-31',
          authorizationStatus: 'Approved',
          isActive: true
        }
      ]);
    } else {
      affiliations = await Affiliation.find().lean();
    }

    const affMap = {};
    affiliations.forEach(a => { affMap[a.code] = a; });

    // 4. Ensure Sessions exist
    const sessionCount = await AcademicSession.countDocuments();
    let currentSession = null;
    if (sessionCount === 0) {
      const s26 = await AcademicSession.create({
        name: '2026-2028',
        year: 2026,
        startDate: '2026-08-01',
        endDate: '2028-06-30',
        isCurrent: true,
        status: 'Active'
      });
      await AcademicSession.create([
        { name: '2025-2027', year: 2025, startDate: '2025-08-01', endDate: '2027-06-30', isCurrent: false, status: 'Active' },
        { name: '2024-2026', year: 2024, startDate: '2024-08-01', endDate: '2026-06-30', isCurrent: false, status: 'Active' },
        { name: '2023-2025', year: 2023, startDate: '2023-08-01', endDate: '2025-06-30', isCurrent: false, status: 'Active' }
      ]);
      currentSession = s26;
    } else {
      currentSession = await AcademicSession.findOne({ isCurrent: true }) || await AcademicSession.findOne({ year: 2026 }) || await AcademicSession.findOne();
    }

    // 5. Ensure Programs exist
    const programCount = await Program.countDocuments();
    let programs = [];
    if (programCount === 0) {
      const pData = [
        {
          name: 'F.Sc Operation Theater Technology (OTT)',
          code: 'FSC-OTT',
          qualificationName: 'Higher Secondary School Certificate (HSSC Allied Health)',
          category: catMap['INTER']?._id,
          categoryName: 'Intermediate / F.Sc',
          department: 'Allied Health Sciences',
          academicPattern: 'Annual',
          defaultDuration: '2 Years',
          totalStages: 2,
          stageType: 'Part',
          status: 'Active'
        },
        {
          name: 'F.Sc Nursing (Medical Assistant)',
          code: 'FSC-NUR',
          qualificationName: 'Higher Secondary School Certificate (Nursing Track)',
          category: catMap['INTER']?._id,
          categoryName: 'Intermediate / F.Sc',
          department: 'Nursing & Health Sciences',
          academicPattern: 'Annual',
          defaultDuration: '2 Years',
          totalStages: 2,
          stageType: 'Part',
          status: 'Active'
        },
        {
          name: 'F.Sc Dental Hygiene & Technology',
          code: 'FSC-DEN',
          qualificationName: 'Higher Secondary School Certificate (Dental Track)',
          category: catMap['INTER']?._id,
          categoryName: 'Intermediate / F.Sc',
          department: 'Dental Sciences',
          academicPattern: 'Annual',
          defaultDuration: '2 Years',
          totalStages: 2,
          stageType: 'Part',
          status: 'Active'
        },
        {
          name: 'BS Psychology',
          code: 'BS-PSY',
          qualificationName: 'Bachelor of Science in Psychology (4 Years HEC Recognized)',
          category: catMap['BS']?._id,
          categoryName: 'BS / Undergraduate',
          department: 'Social Sciences',
          academicPattern: 'Semester',
          defaultDuration: '4 Years',
          totalStages: 8,
          stageType: 'Semester',
          status: 'Active'
        },
        {
          name: 'BS Radiography & Imaging Technology (RIT)',
          code: 'BS-RIT',
          qualificationName: 'Bachelor of Science in RIT',
          category: catMap['BS']?._id,
          categoryName: 'BS / Undergraduate',
          department: 'Medical Imaging Sciences',
          academicPattern: 'Semester',
          defaultDuration: '4 Years',
          totalStages: 8,
          stageType: 'Semester',
          status: 'Active'
        },
        {
          name: 'BS Doctor of Physical Therapy (DPT)',
          code: 'BS-DPT',
          qualificationName: 'Doctor of Physical Therapy (5 Years)',
          category: catMap['BS']?._id,
          categoryName: 'BS / Undergraduate',
          department: 'Rehabilitation Sciences',
          academicPattern: 'Semester',
          defaultDuration: '5 Years',
          totalStages: 10,
          stageType: 'Semester',
          status: 'Active'
        },
        {
          name: 'BS Computer Science (BS CS)',
          code: 'BS-CS',
          qualificationName: 'Bachelor of Science in Computer Science',
          category: catMap['BS']?._id,
          categoryName: 'BS / Undergraduate',
          department: 'Information Technology',
          academicPattern: 'Semester',
          defaultDuration: '4 Years',
          totalStages: 8,
          stageType: 'Semester',
          status: 'Active'
        },
        {
          name: 'ADP Computer Science & Web Dev',
          code: 'ADP-CS',
          qualificationName: 'Associate Degree in Computer Science (2 Years)',
          category: catMap['ADP']?._id,
          categoryName: 'ADP (Associate Degree)',
          department: 'Information Technology',
          academicPattern: 'Semester',
          defaultDuration: '2 Years',
          totalStages: 4,
          stageType: 'Semester',
          status: 'Active'
        },
        {
          name: 'B Category Pharmacy Technician',
          code: 'B-PHARM',
          qualificationName: 'Pharmacy Technician Diploma (Pharmacy Council)',
          category: catMap['DIP']?._id,
          categoryName: 'Diploma & Allied Health',
          department: 'Pharmaceutical Sciences',
          academicPattern: 'Annual',
          defaultDuration: '2 Years',
          totalStages: 2,
          stageType: 'Part',
          status: 'Active'
        },
        {
          name: 'Lady Health Visitor (LHV)',
          code: 'LHV-DIP',
          qualificationName: 'LHV Diploma (Nursing Council)',
          category: catMap['DIP']?._id,
          categoryName: 'Diploma & Allied Health',
          department: 'Nursing & Maternal Health',
          academicPattern: 'Annual',
          defaultDuration: '2 Years',
          totalStages: 2,
          stageType: 'Part',
          status: 'Active'
        },
        {
          name: 'Community Midwife (CMW)',
          code: 'CMW-DIP',
          qualificationName: 'CMW Certified Diploma',
          category: catMap['DIP']?._id,
          categoryName: 'Diploma & Allied Health',
          department: 'Maternal & Child Health',
          academicPattern: 'Modular',
          defaultDuration: '18 Months',
          totalStages: 3,
          stageType: 'Module',
          status: 'Active'
        }
      ];
      programs = await Program.create(pData);
    } else {
      programs = await Program.find().lean();
    }

    // 6. Ensure Program Offerings exist
    const offeringCount = await ProgramOffering.countDocuments();
    let offerings = [];
    if (offeringCount === 0) {
      const offDocs = [];
      for (const prog of programs) {
        let aff = affMap['PBTE'];
        if (prog.code.startsWith('BS-') || prog.code.startsWith('ADP-')) {
          aff = affMap['PU'];
        } else if (prog.code === 'B-PHARM') {
          aff = affMap['PCP'];
        } else if (prog.code === 'LHV-DIP' || prog.code === 'CMW-DIP') {
          aff = affMap['PNMC'];
        }

        const feeEstimate = prog.code.startsWith('BS-') ? 48000 : 38000;
        const tuition = prog.code.startsWith('BS-') ? 35000 : 25000;

        offDocs.push({
          title: `${prog.name} — Session ${currentSession?.name || '2026-2028'} (${aff?.name || 'Approved Board'})`,
          programId: prog._id,
          programName: prog.name,
          programCode: prog.code,
          categoryId: prog.category,
          categoryName: prog.categoryName,
          campusId: mainCampus?._id,
          campusName: mainCampus?.name || 'Main Campus - Sharaqpur Sharif',
          affiliationId: aff?._id,
          affiliationName: aff?.name || 'Punjab Board of Technical Education (PBTE)',
          sessionId: currentSession?._id,
          sessionName: currentSession?.name || '2026-2028',
          sessionYear: currentSession?.year || 2026,
          curriculumVersion: 'Scheme 2026 v1.0',
          duration: prog.defaultDuration || '2 Years',
          academicPattern: prog.academicPattern || 'Annual',
          stageType: prog.stageType || 'Part',
          totalStages: prog.totalStages || 2,
          admissionStartDate: '2026-06-01',
          admissionEndDate: '2026-11-30',
          seatCapacity: 60,
          enrolledCount: 0,
          feePlan: {
            admissionFee: 5000,
            tuitionFeePerTerm: tuition,
            registrationFee: 3000,
            labPracticalFee: 2000,
            examFee: 2000,
            libraryFee: 1000,
            totalEstimate: feeEstimate,
            installmentsAllowed: true,
            installmentsCount: 2
          },
          documentRequirements: [
            { name: 'Student Photograph', key: 'photo', required: true, description: 'Passport size blue background photo' },
            { name: 'Student CNIC or B-Form', key: 'cnicFront', required: true, description: 'Front side scan/photo of CNIC or B-Form' },
            { name: 'Father / Guardian CNIC', key: 'cnicBack', required: true, description: 'Copy of Father/Guardian CNIC' },
            { name: 'Matric / SSC Certificate & Marksheet', key: 'qualificationDocument', required: true, description: 'Attested copy of Matric result card' },
            { name: 'Character / School Leaving Certificate', key: 'previousSchoolDocument', required: false, description: 'Original character certificate from previous institution' }
          ],
          status: 'Approved',
          isActive: true
        });
      }

      offerings = await ProgramOffering.create(offDocs);
    } else {
      offerings = await ProgramOffering.find().lean();
    }

    // 7. Ensure Batches exist for each offering
    for (const off of offerings) {
      const bCount = await Batch.countDocuments({ offeringId: off._id });
      if (bCount === 0) {
        await Batch.create({
          name: `${off.programCode} 2026 - Morning`,
          code: `${off.programCode}-26M`,
          offeringId: off._id,
          programId: off.programId,
          shift: 'Morning',
          startDate: '2026-08-15',
          endDate: '2028-06-30',
          capacity: off.seatCapacity || 60,
          currentEnrolled: 0,
          sections: ['A', 'B'],
          status: 'Active'
        });
      }
    }

    return true;
  } catch (err) {
    console.error('Academic hierarchy seed error:', err.message);
    return false;
  }
}

module.exports = { ensureAcademicHierarchySeeded };
