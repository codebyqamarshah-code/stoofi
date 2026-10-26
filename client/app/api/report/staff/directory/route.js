import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff } from '@/lib/models';
import { getSeededStaffRecords } from '@/lib/reportsSeed.service';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const staffList = getSeededStaffRecords();

    let records = staffList.map((s, idx) => ({
      staffId: s.staffId,
      name: s.name,
      fatherName: s.fatherName || 'Muhammad Akram',
      gender: idx % 4 === 1 ? 'Female' : 'Male',
      role: s.role,
      designation: s.designation,
      department: s.department,
      qualification: s.qualification || 'M.Phil / Master Degree',
      joiningDate: s.joiningDate,
      experienceYears: 4 + (idx % 8),
      basicSalary: s.basicSalary,
      contractType: idx % 3 === 0 ? 'Permanent' : 'Contractual',
      phone: s.phone,
      email: s.email,
      emergencyContact: `+92 300 ${2345000 + idx}`,
      status: 'Active'
    }));

    if (department && department !== 'All') {
      records = records.filter(r => r.department.toLowerCase().includes(department.toLowerCase()));
    }

    if (role && role !== 'All') {
      records = records.filter(r => r.role.toLowerCase().includes(role.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.staffId.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      );
    }

    const totalStaff = records.length;
    const teachingStaff = records.filter(r => r.role.toLowerCase().includes('teacher') || r.role.toLowerCase().includes('faculty') || r.designation.toLowerCase().includes('instructor') || r.designation.toLowerCase().includes('lecturer')).length;
    const adminStaff = totalStaff - teachingStaff;
    const totalPayrollBudget = records.reduce((sum, r) => sum + r.basicSalary, 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalStaff,
        teachingStaff,
        adminStaff,
        totalPayrollBudget
      },
      data: records
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
