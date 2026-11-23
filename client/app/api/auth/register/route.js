import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Student, Staff, Teacher, AccountantInvitation } from '@/lib/models';
import { signToken } from '@/lib/jwt-secret';

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
      picture,
      employeeId,
      schoolName,
      invitationCode,
      // Teacher specific
      assignedClass,
      assignedSection,
      teacherSubjects,
      // Student specific
      studentSubjects,
      // New fields – University affiliation & session
      universityName,
      affiliationStart,
      affiliationEnd,
      sessionStartYear,
      sessionEndYear
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

    // Accountant Security Workflow (Invitation code or Admin approval required)
    let accountStatus = 'Active';
    let validInvitation = null;

    if (finalRole === 'Accountant') {
      if (invitationCode && invitationCode.trim()) {
        const cleanCode = invitationCode.trim();
        // Check database invitation or default system passkey
        validInvitation = await AccountantInvitation.findOne({
          code: cleanCode,
          isUsed: false
        });

        if (!validInvitation && cleanCode !== 'STOOFI-ACC-2026') {
          return NextResponse.json(
            { success: false, message: 'Invalid or already used Accountant Invitation Code. Please contact School Admin.' },
            { status: 400 }
          );
        }
        accountStatus = 'Active';
      } else {
        // Without an authorized invitation code, account is created in Pending status requiring Admin approval
        accountStatus = 'Pending';
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

    const resolvedFullName = fullName ? fullName.trim() : (username || `${firstName} ${lastName}`).trim();

    // Create User Document
    const user = await User.create({
      fullName: resolvedFullName,
      username: uniqueUsername,
      email: cleanEmail,
      password,
      role: finalRole,
      ...(roleModel ? { roleModel } : {}),
      status: accountStatus,
      loginEnabled: accountStatus === 'Active',
      avatar: picture || '',
      schoolName: schoolName || 'Main Campus',
      employeeId: employeeId || '',
      // New affiliation fields
      universityAffiliation: {
        universityName: universityName?.trim(),
        affiliationStart: affiliationStart ? new Date(affiliationStart) : undefined,
        affiliationEnd:   affiliationEnd   ? new Date(affiliationEnd)   : undefined
      }
    });

    if (validInvitation) {
      validInvitation.isUsed = true;
      validInvitation.usedBy = user._id;
      await validInvitation.save().catch(() => {});
    }

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
        studentPhoto: picture || '',
        subjects: Array.isArray(studentSubjects) ? studentSubjects : []
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
        gender: 'Male',
        assignedClass: assignedClass || '',
        assignedSection: assignedSection || '',
        subjects: Array.isArray(teacherSubjects) ? teacherSubjects : []
      });
      referenceId = teacher._id;
    } else if (roleModel === 'Staff') {
      const staff = await Staff.create({
        user: user._id,
        staffNo: employeeId || `ACC-${Date.now().toString().slice(-4)}`,
        firstName,
        lastName,
        email: cleanEmail,
        phone: phone || '',
        role: finalRole,
        department: finalRole === 'Accountant' ? 'Accounts & Finance' : 'Administration',
        designation: finalRole === 'Accountant' ? 'Accountant' : 'Staff Member',
        cnic: cnic || '',
        joiningDate: joiningDate || Date.now(),
        status: accountStatus
      });
      referenceId = staff._id;
    }

    if (referenceId) {
      user.referenceId = referenceId;
      await user.save();
    }

    // Validate affiliation dates
    if (affiliationStart && affiliationEnd && new Date(affiliationStart) > new Date(affiliationEnd)) {
      return NextResponse.json(
        { success: false, message: 'Affiliation start date must be before end date.' },
        { status: 400 }
      );
    }
    // Validate academic session length (max 2 years)
    if (sessionEndYear - sessionStartYear > 2) {
      return NextResponse.json(
        { success: false, message: 'Academic session cannot be longer than 2 years.' },
        { status: 400 }
      );
    }

    if (accountStatus === 'Pending') {
      return NextResponse.json({
        success: true,
        message: 'Accountant registration submitted successfully! Your account is pending Admin approval before activation.',
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: 'Pending'
        }
      }, { status: 201 });
    }

    const token = signToken(
      { id: user._id, role: user.role },
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful!',
      data: {
        _id: user._id,
        fullName: user.fullName || user.username,
        name: user.fullName || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    }, { status: 201 });

    response.cookies.set('token', token, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Next.js API Register Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
