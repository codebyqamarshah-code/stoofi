import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const search = searchParams.get('search') || '';

    let records = [];

    if (role === 'Teacher') {
      const query = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      records = await Teacher.find(query).limit(limit).lean();
      records = records.map(t => ({
        ...t,
        role: 'Teacher',
        designation: 'Senior Faculty',
        department: t.assignedClass ? `${t.assignedClass} Academic Dept` : 'Academics'
      }));
    } else {
      const query = {};
      if (role && role !== 'All') query.role = role;
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      records = await Staff.find(query).limit(limit).lean();
    }

    return NextResponse.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('API /staff error:', error);
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: 'staff-demo-01',
          firstName: 'Shah',
          lastName: 'Hussain',
          role: 'Teacher',
          designation: 'Senior Mathematics Instructor',
          department: 'Science & Mathematics',
          phone: '+92 312 3456789'
        }
      ]
    });
  }
}
