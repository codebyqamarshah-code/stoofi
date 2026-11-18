import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { verifyToken } from '@/lib/jwt-secret';

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. No token provided.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    userObj.canDelete = userObj.email?.toLowerCase() !== 'pakroyalcollege@gmail.com' && userObj.canDelete !== false;

    return NextResponse.json({
      success: true,
      data: userObj
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. No token provided.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const body = await req.json();

    const updates = {};
    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.avatar !== undefined) updates.avatar = body.avatar;
    if (body.picture !== undefined) updates.avatar = body.picture;
    if (body.phone !== undefined) updates.phone = body.phone;

    const user = await User.findByIdAndUpdate(decoded.id, updates, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    // Sync avatar to Staff and Teacher collections
    const newAvatar = updates.avatar;
    if (newAvatar && user.email) {
      const emailLower = user.email.toLowerCase();
      const { Staff, Teacher } = await import('@/lib/models');
      await Staff.updateMany(
        { email: emailLower },
        { $set: { photo: newAvatar, staffPhoto: newAvatar } }
      ).catch(() => null);
      await Teacher.updateMany(
        { email: emailLower },
        { $set: { photo: newAvatar, avatar: newAvatar } }
      ).catch(() => null);
    }

    const userObj = user.toObject ? user.toObject() : { ...user._doc };
    userObj.canDelete = userObj.email?.toLowerCase() !== 'pakroyalcollege@gmail.com' && userObj.canDelete !== false;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: userObj
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}
