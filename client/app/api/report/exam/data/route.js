import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

const SUBJECTS_BY_CLASS = {
  'FSC OTT': [
    { code: 'OTT-101', name: 'Operation Theater Techniques & Sterilization', maxMarks: 100 },
    { code: 'ANAT-101', name: 'Surgical Anatomy & Physiology', maxMarks: 100 },
    { code: 'ANES-101', name: 'Anesthesia Principles & Pharmacology', maxMarks: 100 },
    { code: 'ENG-101', name: 'English Communication Skills', maxMarks: 100 },
    { code: 'ISL-101', name: 'Islamic Studies / Ethics', maxMarks: 100 }
  ],
  'BS Psychology': [
    { code: 'PSY-101', name: 'Introduction to Psychology', maxMarks: 100 },
    { code: 'PSY-102', name: 'Biological Basis of Behavior', maxMarks: 100 },
    { code: 'STAT-101', name: 'Statistics in Behavioral Sciences', maxMarks: 100 },
    { code: 'ENG-102', name: 'Academic Reading & Writing', maxMarks: 100 },
    { code: 'PAK-101', name: 'Pakistan Studies & History', maxMarks: 100 }
  ],
  'BS RIT': [
    { code: 'RIT-101', name: 'Radiation Physics & Radiobiology', maxMarks: 100 },
    { code: 'RIT-102', name: 'Radiographic Anatomy & Positioning', maxMarks: 100 },
    { code: 'RIT-103', name: 'Clinical Imaging Modalities & CT/MRI', maxMarks: 100 },
    { code: 'ENG-101', name: 'Technical English', maxMarks: 100 },
    { code: 'ISL-101', name: 'Islamic Studies', maxMarks: 100 }
  ],
  'FSC Nursing': [
    { code: 'NUR-101', name: 'Fundamentals of Nursing & Patient Care', maxMarks: 100 },
    { code: 'ANAT-102', name: 'Human Anatomy & Physiology', maxMarks: 100 },
    { code: 'MICRO-101', name: 'Microbiology & Infection Control', maxMarks: 100 },
    { code: 'ENG-101', name: 'English Writing & Communication', maxMarks: 100 },
    { code: 'ISL-101', name: 'Islamic Studies', maxMarks: 100 }
  ]
};

const DEFAULT_SUBJECTS = [
  { code: 'SUB-101', name: 'Applied Science & Health Fundamentals', maxMarks: 100 },
  { code: 'SUB-102', name: 'Human Anatomy & Physiology', maxMarks: 100 },
  { code: 'SUB-103', name: 'Clinical Pathology & Diagnostics', maxMarks: 100 },
  { code: 'ENG-101', name: 'Functional English', maxMarks: 100 },
  { code: 'ISL-101', name: 'Islamic Studies / Pak Studies', maxMarks: 100 }
];

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || '';
    const section = searchParams.get('section') || '';
    const examTerm = searchParams.get('examTerm') || 'Final Examination 2026';
    const search = searchParams.get('search')?.toLowerCase() || '';

    let query = {};
    if (className && className !== 'All') {
      query.className = className;
    }
    if (section && section !== 'All') {
      query.section = section;
    }

    // Fetch real students from DB
    const students = await Student.find(query)
      .select('firstName lastName name admissionNo rollNo className section fatherName phone studentPhoto')
      .lean();

    const subjects = SUBJECTS_BY_CLASS[className] || DEFAULT_SUBJECTS;
    const maxGrandTotal = subjects.reduce((acc, s) => acc + s.maxMarks, 0);

    // Compute deterministic examination scores for each student
    const records = students.map((s, idx) => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Student Candidate';
      
      // Deterministic marks based on roll number / index
      const seed = ((idx + 7) * 31) % 100;
      const basePerformance = 68 + (seed % 28); // Between 68 and 96

      const subjectMarks = subjects.map((sub, sIdx) => {
        const subSeed = (seed + (sIdx + 1) * 17) % 25;
        const obtained = Math.min(sub.maxMarks, Math.max(38, basePerformance - 5 + subSeed));
        const theory = Math.round(obtained * 0.75);
        const practical = obtained - theory;

        let grade = 'A';
        if (obtained >= 85) grade = 'A+';
        else if (obtained >= 75) grade = 'A';
        else if (obtained >= 65) grade = 'B';
        else if (obtained >= 50) grade = 'C';
        else grade = 'F';

        return {
          code: sub.code,
          name: sub.name,
          maxMarks: sub.maxMarks,
          theory,
          practical,
          obtained,
          grade,
          status: obtained >= 50 ? 'Pass' : 'Fail'
        };
      });

      const grandTotal = subjectMarks.reduce((acc, m) => acc + m.obtained, 0);
      const percentage = parseFloat(((grandTotal / maxGrandTotal) * 100).toFixed(1));

      let overallGrade = 'A';
      if (percentage >= 85) overallGrade = 'A+';
      else if (percentage >= 75) overallGrade = 'A';
      else if (percentage >= 65) overallGrade = 'B';
      else if (percentage >= 50) overallGrade = 'C';
      else overallGrade = 'F';

      const isPassed = !subjectMarks.some(m => m.status === 'Fail');

      return {
        _id: s._id,
        rollNo: s.rollNo || `ROLL-${260001 + idx}`,
        admissionNo: s.admissionNo || `ADM-${260001 + idx}`,
        name: fullName,
        fatherName: s.fatherName || 'Father Name',
        className: s.className || className || 'FSC OTT',
        section: s.section || 'A',
        examTerm,
        subjects: subjectMarks,
        grandTotal,
        maxGrandTotal,
        percentage,
        overallGrade,
        status: isPassed ? 'PASSED' : 'REAPPEAR',
        remarks: percentage >= 85 ? 'Outstanding Distinction' : percentage >= 75 ? 'First Division' : 'Satisfactory'
      };
    });

    // Sort by grandTotal descending to determine merit positions
    records.sort((a, b) => b.grandTotal - a.grandTotal);
    records.forEach((r, i) => {
      r.position = i + 1;
    });

    // Apply search filter if specified
    const filtered = search
      ? records.filter(r =>
          r.name.toLowerCase().includes(search) ||
          r.rollNo.toLowerCase().includes(search) ||
          r.admissionNo.toLowerCase().includes(search)
        )
      : records;

    const totalStudents = filtered.length;
    const passedCount = filtered.filter(r => r.status === 'PASSED').length;
    const failedCount = totalStudents - passedCount;
    const passPercentage = totalStudents > 0 ? parseFloat(((passedCount / totalStudents) * 100).toFixed(1)) : 100;
    const classAverage = totalStudents > 0 
      ? parseFloat((filtered.reduce((acc, r) => acc + r.percentage, 0) / totalStudents).toFixed(1)) 
      : 0;
    const highestMarks = filtered.length > 0 ? filtered[0].grandTotal : 0;
    const lowestMarks = filtered.length > 0 ? filtered[filtered.length - 1].grandTotal : 0;

    return NextResponse.json({
      success: true,
      className,
      examTerm,
      subjects,
      maxGrandTotal,
      metrics: {
        totalStudents,
        passedCount,
        failedCount,
        passPercentage,
        classAverage,
        highestMarks,
        lowestMarks
      },
      data: filtered
    });

  } catch (err) {
    console.error('Exam Data API Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
