import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSeededStaffRecords } from '@/lib/reportsSeed.service';

export async function GET(req) {
  try {
    await connectDB();

    const staffList = getSeededStaffRecords();

    const departmentMap = {};

    staffList.forEach(s => {
      const dept = s.department || 'General Administration';
      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          name: dept,
          hod: s.role.toLowerCase().includes('principal') || s.role.toLowerCase().includes('director') || s.designation.toLowerCase().includes('head') ? s.name : '',
          totalStaff: 0,
          totalSalary: 0,
          staffMembers: []
        };
      }
      departmentMap[dept].totalStaff += 1;
      departmentMap[dept].totalSalary += s.basicSalary;
      departmentMap[dept].staffMembers.push({
        staffId: s.staffId,
        name: s.name,
        designation: s.designation,
        role: s.role
      });
      if (!departmentMap[dept].hod && (s.designation.toLowerCase().includes('lead') || s.designation.toLowerCase().includes('senior'))) {
        departmentMap[dept].hod = s.name;
      }
    });

    const departments = Object.values(departmentMap).map(d => ({
      ...d,
      hod: d.hod || d.staffMembers[0]?.name || 'Department Lead',
      avgSalary: Math.round(d.totalSalary / d.totalStaff)
    }));

    const totalStaff = staffList.length;
    const totalDepartments = departments.length;
    const totalPayroll = staffList.reduce((acc, s) => acc + s.basicSalary, 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalStaff,
        totalDepartments,
        totalPayroll,
        avgDepartmentStrength: (totalStaff / totalDepartments).toFixed(1)
      },
      data: departments
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
