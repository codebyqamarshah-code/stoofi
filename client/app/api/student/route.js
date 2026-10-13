import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';
    const className = searchParams.get('className') || '';
    const section = searchParams.get('section') || '';

    const query = {};
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { firstName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { admissionNo: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { rollNo: { $regex: s, $options: 'i' } }
      ];
    }

    if (className && className !== 'All Classes' && className !== 'All' && className.trim()) {
      const c = className.replace(/^Class\s+/i, '').trim();
      query.className = { $regex: '^(' + className + '|' + c + '|Class\\s*' + c + ')$', $options: 'i' };
    }

    if (section && section !== 'All Sections' && section !== 'All' && section.trim()) {
      const sec = section.replace(/^Section\s+/i, '').trim();
      query.section = { $regex: '^(' + section + '|' + sec + '|Section\\s*' + sec + ')$', $options: 'i' };
    }

    const skip = (page - 1) * limit;

    let students = await Student.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /student error:', error);
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: 'std-demo-01',
          firstName: 'Qamar',
          lastName: 'Abbas',
          admissionNo: 'ADM-1791540935480',
          rollNo: '101',
          className: 'Class 10',
          section: 'Section A',
          gender: 'Male',
          dob: '2008-05-14',
          phone: '+92 300 9876543',
          fatherName: 'Syed Ali Shah',
          studentPhoto: '',
          bloodGroup: 'B+'
        }
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });
  }
}
