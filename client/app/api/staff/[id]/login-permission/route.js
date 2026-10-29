import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { loginEnabled } = body;

    const staff = await Staff.findByIdAndUpdate(id, { loginEnabled }, { new: true });
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
    }

    if (staff.email) {
      await User.findOneAndUpdate(
        { email: staff.email.toLowerCase() },
        { active: loginEnabled !== false }
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      data: staff,
      message: `Login permission ${loginEnabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
