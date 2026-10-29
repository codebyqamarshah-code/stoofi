import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AssignedIncident } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const className = searchParams.get('className') || searchParams.get('class');
    const section = searchParams.get('section');

    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (className && className !== 'All Classes' && className !== 'All') {
      filter.className = { $regex: className.replace(/^Class\s+/i, '').trim(), $options: 'i' };
    }
    if (section && section !== 'All Sections' && section !== 'All') {
      filter.section = { $regex: section.replace(/^Section\s+/i, '').trim(), $options: 'i' };
    }

    const assigned = await AssignedIncident.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: assigned || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.studentId || !body.incidentTitle) {
      return NextResponse.json({ success: false, message: 'Student and Incident details are required.' }, { status: 400 });
    }

    const created = await AssignedIncident.create({
      studentId: String(body.studentId),
      studentName: body.studentName || 'Student',
      admissionNo: body.admissionNo || '',
      className: body.className || '',
      section: body.section || '',
      incidentId: body.incidentId,
      incidentTitle: body.incidentTitle,
      point: Number(body.point) || 0,
      pointType: body.pointType || (Number(body.point) < 0 ? 'negative' : 'positive'),
      incidentDate: body.incidentDate || new Date().toISOString().split('T')[0],
      assignedBy: body.assignedBy || 'School Administration',
      remarks: body.remarks || ''
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Incident assigned to student successfully'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
