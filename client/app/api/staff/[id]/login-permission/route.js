import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const { loginEnabled } = body;

    const staff = await Staff.findByIdAndUpdate(
      id,
      {
        loginEnabled: !!loginEnabled,
        status: loginEnabled ? 'Active' : 'Inactive'
      },
      { new: true }
    );
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
    }

    if (staff.email) {
      await User.updateMany(
        { email: staff.email.toLowerCase() },
        {
          $set: {
            status: loginEnabled ? 'Active' : 'Inactive',
            loginEnabled: !!loginEnabled
          }
        }
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
