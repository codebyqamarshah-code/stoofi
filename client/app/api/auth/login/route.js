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

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      },
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js API Login Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
