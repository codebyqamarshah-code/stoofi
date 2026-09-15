import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in MongoDB Atlas
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanEmail }
      ]
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please check your email or register first.' },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'Active') {
      return NextResponse.json(
        { success: false, message: 'Account is inactive. Please contact administrator.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Fetch role-specific profile data
    let profileData = {};
    try {
      if (user.role === 'Teacher' && user.referenceId) {
        const { Teacher } = await import('@/lib/models');
        const teacher = await Teacher.findById(user.referenceId);
        if (teacher) {
          profileData = {
            assignedClass: teacher.assignedClass || '',
            assignedSection: teacher.assignedSection || '',
            subjects: teacher.subjects || []
          };
        }
      } else if (user.role === 'Student' && user.referenceId) {
        const { Student } = await import('@/lib/models');
        const student = await Student.findById(user.referenceId);
        if (student) {
          profileData = {
            className: student.className || '',
            section: student.section || '',
            admissionNo: student.admissionNo || '',
            subjects: student.subjects || []
          };
        }
      }
    } catch (profileErr) {
      console.error('Profile fetch error:', profileErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        fullName: user.fullName || user.username,
        name: user.fullName || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        referenceId: user.referenceId || null,
        ...profileData
      },
      token
    }, { status: 200 });

    response.cookies.set('token', token, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Next.js API Login Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
