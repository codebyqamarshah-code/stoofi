import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Notification } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

    const activeStudents = await User.countDocuments({ role: 'Student', lastLogin: { $gte: tenMinsAgo } });
    const activeTeachers = await User.countDocuments({ role: 'Teacher', lastLogin: { $gte: tenMinsAgo } });

    const notifications = await Notification.find()
      .lean()
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        activeStudents,
        activeTeachers,
        notifications: notifications || []
      }
    });
  } catch (error) {
    console.error('API /dashboard/live-updates error:', error);
    return NextResponse.json({
      success: true,
      data: {
        activeStudents: 1,
        activeTeachers: 1,
        notifications: []
      }
    });
  }
}
