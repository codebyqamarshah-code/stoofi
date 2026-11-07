import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, AssignedIncident, BehaviourIncident } from '@/lib/models';

export const dynamic = 'force-dynamic';

const SEED_INCIDENTS_TEMPLATES = [
  { title: 'Academic Excellence & High Test Score', point: 10, pointType: 'positive', remarks: 'Highest scorer in term evaluation' },
  { title: 'Helpful Peer & Good Classroom Conduct', point: 5, pointType: 'positive', remarks: 'Assisted classmates with laboratory assignments' },
  { title: 'Perfect Attendance & Punctuality Award', point: 10, pointType: 'positive', remarks: '100% attendance during previous month' },
  { title: 'Outstanding Sportsmanship & Activity Participation', point: 5, pointType: 'positive', remarks: 'Represented college in inter-college sports event' },
  { title: 'Late Arrival / Unexcused Tardiness', point: -3, pointType: 'negative', remarks: 'Arrived after morning assembly three times' },
  { title: 'Disruptive Classroom Behaviour', point: -5, pointType: 'negative', remarks: 'Talking during class lecture repeatedly' },
  { title: 'Uniform & Dress Code Violation', point: -2, pointType: 'negative', remarks: 'Improper student uniform / missing badge' }
];

// GET /api/behaviour/reports/student?className=...&section=...&search=...
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || searchParams.get('class') || '';
    const section = searchParams.get('section') || '';
    const search = (searchParams.get('search') || '').trim();

    // 1. Check if AssignedIncident has any data. If 0, auto-seed realistic demo incidents for first few students
    const incidentCount = await AssignedIncident.countDocuments();
    if (incidentCount === 0) {
      const topStudents = await Student.find({ status: { $ne: 'Inactive' } }).limit(10).lean();
      if (topStudents.length > 0) {
        const seededIncidents = [];
        const todayStr = new Date().toISOString().split('T')[0];

        topStudents.forEach((stu, idx) => {
          const studentName = stu.name || stu.studentName || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'Student';
          const template = SEED_INCIDENTS_TEMPLATES[idx % SEED_INCIDENTS_TEMPLATES.length];

          seededIncidents.push({
            studentId: String(stu._id),
            studentName,
            admissionNo: stu.admissionNo || `ADM${idx + 100}`,
            className: stu.className || 'FSC OTT',
            section: stu.section || 'A',
            incidentTitle: template.title,
            point: template.point,
            pointType: template.pointType,
            incidentDate: todayStr,
            assignedBy: 'School Administration',
            remarks: template.remarks
          });

          // Add a second incident for first 2 students to demonstrate multi-incident students
          if (idx < 2) {
            const secondTemplate = SEED_INCIDENTS_TEMPLATES[(idx + 1) % SEED_INCIDENTS_TEMPLATES.length];
            seededIncidents.push({
              studentId: String(stu._id),
              studentName,
              admissionNo: stu.admissionNo || `ADM${idx + 100}`,
              className: stu.className || 'FSC OTT',
              section: stu.section || 'A',
              incidentTitle: secondTemplate.title,
              point: secondTemplate.point,
              pointType: secondTemplate.pointType,
              incidentDate: todayStr,
              assignedBy: 'Principal Office',
              remarks: secondTemplate.remarks
            });
          }
        });

        if (seededIncidents.length > 0) {
          await AssignedIncident.insertMany(seededIncidents);
        }
      }
    }

    // 2. Fetch all students from Student model
    const studentQuery = {};
    if (className && className !== 'All Classes' && className !== 'All') {
      studentQuery.className = { $regex: className.replace(/^Class\s+/i, '').trim(), $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All') {
      studentQuery.section = { $regex: section.replace(/^Section\s+/i, '').trim(), $options: 'i' };
    }
    if (search) {
      studentQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }

    let students = await Student.find(studentQuery)
      .select('name studentName firstName lastName admissionNo className section studentPhoto photo')
      .lean();

    // 3. Fetch all assigned incidents
    const incidents = await AssignedIncident.find().lean();
    const incidentMapByStudent = {};

    incidents.forEach((inc) => {
      const key = inc.studentId || inc.admissionNo || inc.studentName;
      if (!incidentMapByStudent[key]) {
        incidentMapByStudent[key] = [];
      }
      incidentMapByStudent[key].push(inc);
      // Also map by admissionNo if present
      if (inc.admissionNo && inc.admissionNo !== key) {
        if (!incidentMapByStudent[inc.admissionNo]) {
          incidentMapByStudent[inc.admissionNo] = [];
        }
        incidentMapByStudent[inc.admissionNo].push(inc);
      }
    });

    // 4. Build comprehensive directory list
    let reportData = [];

    if (students.length > 0) {
      reportData = students.map((stu) => {
        const studentName = stu.name || stu.studentName || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'Student';
        const admNo = stu.admissionNo || '-';
        const stuIncidents = incidentMapByStudent[String(stu._id)] || incidentMapByStudent[admNo] || [];

        // Deduplicate incidents by _id
        const uniqueIncidents = [];
        const seenIds = new Set();
        stuIncidents.forEach((item) => {
          const id = String(item._id);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            uniqueIncidents.push(item);
          }
        });

        let positivePoints = 0;
        let negativePoints = 0;

        uniqueIncidents.forEach((inc) => {
          const pt = Number(inc.point) || 0;
          if (pt > 0) {
            positivePoints += pt;
          } else {
            negativePoints += pt;
          }
        });

        const totalScore = positivePoints + negativePoints;

        return {
          studentId: String(stu._id),
          studentName,
          admissionNo: admNo,
          className: stu.className || 'FSC OTT',
          section: stu.section || 'A',
          photo: stu.studentPhoto || stu.photo || '',
          totalIncidents: uniqueIncidents.length,
          positivePoints,
          negativePoints,
          totalScore,
          incidentsList: uniqueIncidents.map((i) => ({
            _id: String(i._id),
            incidentTitle: i.incidentTitle,
            point: i.point,
            pointType: i.pointType,
            incidentDate: i.incidentDate,
            remarks: i.remarks || '',
            assignedBy: i.assignedBy || 'Administration'
          }))
        };
      });
    } else {
      // Fallback: If no students in Student collection matching query, compile from incidents
      const incidentMap = {};
      incidents.forEach((inc) => {
        const key = inc.admissionNo || inc.studentName;
        if (!incidentMap[key]) {
          incidentMap[key] = {
            studentId: inc.studentId,
            studentName: inc.studentName,
            admissionNo: inc.admissionNo,
            className: inc.className,
            section: inc.section,
            totalIncidents: 0,
            positivePoints: 0,
            negativePoints: 0,
            totalScore: 0,
            incidentsList: []
          };
        }
        incidentMap[key].totalIncidents += 1;
        const pt = Number(inc.point) || 0;
        if (pt > 0) incidentMap[key].positivePoints += pt;
        else incidentMap[key].negativePoints += pt;
        incidentMap[key].totalScore += pt;
        incidentMap[key].incidentsList.push(inc);
      });
      reportData = Object.values(incidentMap);
    }

    // Sort: Students with incidents first (by totalScore desc), then clean record students
    reportData.sort((a, b) => {
      if (b.totalIncidents !== a.totalIncidents) {
        return b.totalIncidents - a.totalIncidents;
      }
      return b.totalScore - a.totalScore;
    });

    return NextResponse.json({
      success: true,
      data: reportData,
      total: reportData.length
    });
  } catch (err) {
    console.error('API /behaviour/reports/student GET error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
