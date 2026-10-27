import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, Teacher, Staff } from '@/lib/models';

const DEFAULT_DEPARTMENTS = [
  'Operation Theatre & Surgical Department',
  'Radiologic & Diagnostic Imaging Lab',
  'Clinical Psychology Department',
  'Dental Technology & Materials Lab',
  'Nursing & Midwifery Simulation Center',
  'Doctor of Physical Therapy (DPT) Rehab Ward',
  'Examinations, Registration & Board Cell',
  'Campus Administration & Finance Wing',
  'Central College Library & E-Resource Hub',
  'Hostel & Student Residence Administration'
];

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'Department';
    const search = (searchParams.get('search') || '').trim();

    let results = [];

    if (type === 'Student') {
      const q = {};
      if (search) {
        q.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { rollNo: { $regex: search, $options: 'i' } },
          { registrationNo: { $regex: search, $options: 'i' } },
          { class: { $regex: search, $options: 'i' } }
        ];
      }
      const students = await Student.find(q)
        .select('firstName lastName rollNo class section email phone')
        .limit(50)
        .lean();

      results = students.map(s => {
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
        return {
          id: s._id,
          name: fullName || 'Student',
          details: `Roll: ${s.rollNo || 'N/A'} • Class: ${s.class || ''} (${s.section || 'A'})`,
          department: s.class || 'Student Body'
        };
      });
    } else if (type === 'Teacher') {
      const q = {};
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }
      const teachers = await Teacher.find(q)
        .select('name designation department email phone')
        .limit(50)
        .lean();

      results = teachers.map(t => ({
        id: t._id,
        name: t.name,
        details: `${t.designation || 'Faculty'} • Dept: ${t.department || 'Academic'}`,
        department: t.department || 'Academic Faculty'
      }));
    } else if (type === 'Staff') {
      const q = {};
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }
      const staffList = await Staff.find(q)
        .select('name designation department email phone role')
        .limit(50)
        .lean();

      results = staffList.map(s => ({
        id: s._id,
        name: s.name,
        details: `${s.designation || s.role || 'Staff'} • ${s.department || 'Administration'}`,
        department: s.department || 'Administration'
      }));
    } else {
      // Department
      let names = [];
      try {
        const distinctDepts = await Staff.distinct('department');
        names = distinctDepts.filter(Boolean);
      } catch (e) {
        names = [];
      }
      const merged = Array.from(new Set([...names, ...DEFAULT_DEPARTMENTS]));
      let filtered = merged;
      if (search) {
        filtered = filtered.filter(n => n.toLowerCase().includes(search.toLowerCase()));
      }

      results = filtered.map(name => ({
        id: name,
        name,
        details: 'Institutional Department / Facility',
        department: name
      }));
    }

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('API /inventory/recipients GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
