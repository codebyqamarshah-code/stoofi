import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
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
      data: students || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /student GET error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      className, 
      section, 
      rollNo, 
      admissionNo, 
      fatherName, 
      phone, 
      gender, 
      bloodGroup, 
      dob, 
      studentPhoto,
      cardTemplate
    } = body;

    if (!firstName || !firstName.trim()) {
      return NextResponse.json({ success: false, message: 'Student first name is required' }, { status: 400 });
    }

    const count = await Student.countDocuments();
    const cleanAdmNo = admissionNo && admissionNo.trim() 
      ? admissionNo.trim() 
      : `ADM-${Date.now()}`;
    const cleanRollNo = rollNo && rollNo.trim() 
      ? rollNo.trim() 
      : String(100 + count + 1);

    const student = await Student.create({
      firstName: firstName.trim(),
      lastName: (lastName || '').trim(),
      className: className || 'Class 10',
      section: section || 'Section A',
      admissionNo: cleanAdmNo,
      rollNo: cleanRollNo,
      fatherName: fatherName || '',
      phone: phone || '',
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'B+',
      dob: dob || '2008-01-01',
      studentPhoto: studentPhoto || '',
      cardTemplate: cardTemplate || 'stoofi-emerald',
      status: 'Active'
    });

    return NextResponse.json({
      success: true,
      data: student,
      message: 'Student ID card created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /student POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating student ID card' }, { status: 500 });
  }
}
