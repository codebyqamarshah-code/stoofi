import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const hasSuperAdmin = await User.exists({ role: 'Super Admin' });
    const hasAdmin = await User.exists({ role: 'Admin' });

    return NextResponse.json({
      success: true,
      hasSuperAdmin: Boolean(hasSuperAdmin),
      hasAdmin: Boolean(hasAdmin)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
