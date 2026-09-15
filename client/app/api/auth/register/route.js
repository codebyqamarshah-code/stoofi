import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Student, Staff, Teacher } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      username,
      email,
      password,
      role,
      fullName,
      address,
      fatherName,
      phone,
      dob,
      joiningDate,
      studentClass,
      section,
      cnic,
      picture
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const finalRole = role || 'Student';

    // Enforce single Super Admin
    if (finalRole === 'Super Admin') {
      const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
      if (existingSuperAdmin) {
        return NextResponse.json(
          { success: false, message: 'Super Admin is already registered. Only one Super Admin account is allowed.' },
          { status: 400 }
        );
      }
    }

    // Enforce single Admin
    if (finalRole === 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, message: 'Admin is already registered. Only one Admin account is allowed.' },
          { status: 400 }
        );
      }
    }

    // Map roleModel
    let roleModel = undefined;
    if (finalRole === 'Student') roleModel = 'Student';
    else if (finalRole === 'Teacher') roleModel = 'Teacher';
    else if (finalRole === 'Parent') roleModel = 'Parent';
    else if (['Accountant', 'Librarian', 'Staff', 'Super Admin', 'Admin'].includes(finalRole)) roleModel = 'Staff';

    // Safe unique username
    const nameParts = (fullName || username || '').trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';
    const uniqueUsername = username || `${firstName}_${Date.now().toString().slice(-4)}`;

    // Create User Document
    const user = await User.create({
      username: uniqueUsername,
      email: cleanEmail,
      password,
      role: finalRole,
      ...(roleModel ? { roleModel } : {}),
      status: 'Active',
      avatar: picture || ''
    });

    let referenceId = null;

    // Save into specific collection
    if (finalRole === 'Student') {
      const student = await Student.create({
        user: user._id,
        firstName,
        lastName,
        phone: phone || '',
        currentAddress: address || '',
        fatherName: fatherName || '',
        dob: dob || new Date().toISOString().split('T')[0],
        className: studentClass || '1',
        section: section || 'A',
        academicYear: `${new Date().getFullYear()} [Jan-Dec]`,
        admissionNo: 'ADM-' + Date.now(),
        gender: 'Male',
        studentPhoto: picture || ''
      });
      referenceId = student._id;
    } else if (finalRole === 'Teacher') {
      const teacher = await Teacher.create({
        user: user._id,
        firstName,
        lastName,
        email: cleanEmail,
        phone: phone || '',
        joiningDate: joiningDate || Date.now(),
        cnic: cnic || '',
        avatar: picture || '',
        gender: 'Male'
      });
      referenceId = teacher._id;
    } else if (roleModel === 'Staff') {
      const staff = await Staff.create({
        user: user._id,
        firstName,
        lastName,
        email: cleanEmail,
        phone: phone || '',
        role: finalRole,
        cnic: cnic || '',
        joiningDate: joiningDate || Date.now()
      });
      referenceId = staff._id;
    }

    if (referenceId) {
      user.referenceId = referenceId;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Next.js API Register Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
