import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AccountantInvitation, User } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const invitations = await AccountantInvitation.find()
      .populate('usedBy', 'fullName email username status')
      .sort({ createdAt: -1 })
      .lean();

    const pendingAccountants = await User.find({
      role: 'Accountant',
      status: 'Pending'
    }).select('-password').lean();

    return NextResponse.json({
      success: true,
      invitations,
      pendingAccountants
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const body = await req.json();
    const { email, schoolName, action, userId } = body;

    // Handle approving a pending accountant directly
    if (action === 'APPROVE_USER' && userId) {
      const user = await User.findById(userId);
      if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      user.status = 'Active';
      user.loginEnabled = true;
      await user.save();
      return NextResponse.json({ success: true, message: `Accountant ${user.fullName} approved and activated!` });
    }

    if (action === 'REJECT_USER' && userId) {
      const user = await User.findById(userId);
      if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      user.status = 'Inactive';
      user.loginEnabled = false;
      await user.save();
      return NextResponse.json({ success: true, message: `Accountant registration rejected.` });
    }

    // Otherwise generate an invitation code
    const generatedCode = `ACC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;
    const inv = await AccountantInvitation.create({
      code: generatedCode,
      email: (email || '').trim().toLowerCase(),
      schoolName: schoolName || 'Main Campus',
      createdBy: auth.user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return NextResponse.json({
      success: true,
      message: 'Accountant invitation token created successfully.',
      data: inv
    }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
