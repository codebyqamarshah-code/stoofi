import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt-secret';

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

    // 1. Find user in User model (by email or username)
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanEmail }
      ]
    }).select('+password');

    // 2. If not found directly, check if this is a student logging in with admissionNo, rollNo, or email
    let studentRef = null;
    if (!user) {
      const { Student } = await import('@/lib/models');
      studentRef = await Student.findOne({
        $or: [
          { admissionNo: new RegExp(`^${cleanEmail}$`, 'i') },
          { rollNo: new RegExp(`^${cleanEmail}$`, 'i') },
          { email: cleanEmail }
        ]
      }).lean();

      if (studentRef) {
        // Find existing linked user account
        const userOr = [];
        if (studentRef.user) userOr.push({ _id: studentRef.user });
        userOr.push({ referenceId: studentRef._id });
        if (studentRef.email) userOr.push({ email: studentRef.email.toLowerCase() });
        if (studentRef.admissionNo) userOr.push({ username: studentRef.admissionNo.toLowerCase() });

        user = await User.findOne({ $or: userOr }).select('+password');

        // If no user record exists yet for this student, auto-create one
        if (!user) {
          const defaultPassword = password.trim();
          const newUsername = (studentRef.admissionNo || studentRef.rollNo || studentRef.name || 'student').toLowerCase().replace(/\s+/g, '_');
          const newEmail = studentRef.email || `${(studentRef.admissionNo || studentRef._id).toString().toLowerCase()}@pakroyalcollege.edu.pk`;
          user = await User.create({
            username: newUsername,
            email: newEmail,
            password: defaultPassword,
            fullName: studentRef.name || studentRef.studentName || `${studentRef.firstName || ''} ${studentRef.lastName || ''}`.trim(),
            role: 'Student',
            status: studentRef.status === 'Inactive' || studentRef.loginEnabled === false ? 'Inactive' : 'Active',
            referenceId: studentRef._id,
            roleModel: 'Student',
            avatar: studentRef.studentPhoto || studentRef.photo || ''
          });
          user = await User.findById(user._id).select('+password');
          await Student.findByIdAndUpdate(studentRef._id, { user: user._id });
        }
      }
    }

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

    // Check pending approval
    if (user.status === 'Pending') {
      return NextResponse.json(
        {
          success: false,
          isAccessDenied: true,
          isPendingApproval: true,
          message: 'Permission Denied: Your account is pending Super Admin approval. You do not have permission to open the dashboard yet. Please wait until the Super Admin activates your account.'
        },
        { status: 403 }
      );
    }

    // Check account status and login permission (both on User, Staff, and Student models)
    let isLoginBlocked = user.status !== 'Active' || user.loginEnabled === false;

    if (!isLoginBlocked && user.role === 'Student') {
      const { Student } = await import('@/lib/models');
      const studentId = user.referenceId || studentRef?._id;
      if (studentId) {
        const studentDoc = await Student.findById(studentId).select('status loginEnabled').lean();
        if (studentDoc && (studentDoc.status === 'Inactive' || studentDoc.loginEnabled === false)) {
          isLoginBlocked = true;
        }
      }
    }

    if (!isLoginBlocked && (user.role === 'Teacher' || user.role === 'Staff' || user.role === 'Admin') && user.email) {
      const { Staff } = await import('@/lib/models');
      const staffDoc = await Staff.findOne({ email: user.email.toLowerCase() }).select('status loginEnabled').lean();
      if (staffDoc && (staffDoc.status === 'Inactive' || staffDoc.loginEnabled === false)) {
        isLoginBlocked = true;
      }
    }

    if (isLoginBlocked) {
      return NextResponse.json(
        {
          success: false,
          isAccessDenied: true,
          message: 'Access Denied: Your login access has been disabled by the Super Admin. You cannot open the dashboard.'
        },
        { status: 403 }
      );
    }

    // Generate JWT token using validated server secret
    const token = signToken(
      { id: user._id, role: user.role },
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
        canDelete: user.email?.toLowerCase() !== 'pakroyalcollege@gmail.com' && user.canDelete !== false,
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

    const isDbOrNetworkIssue =
      error.message?.includes('SSL') ||
      error.message?.includes('tlsv1 alert') ||
      error.message?.includes('buffering timed out') ||
      error.message?.includes('Mongo') ||
      error.message?.includes('ServerSelectionError') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ECONNRESET') ||
      error.message?.includes('ETIMEDOUT') ||
      error.name === 'MongooseServerSelectionError';

    if (isDbOrNetworkIssue) {
      return NextResponse.json(
        {
          success: false,
          isMaintenance: true,
          errorType: 'DATABASE_MAINTENANCE',
          message: 'Database is currently performing a brief cloud synchronization. Please wait a moment and try again.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Login failed. Please verify your credentials.' },
      { status: 500 }
    );
  }
}
