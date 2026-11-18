import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const { loginEnabled } = body;

    const student = await Student.findByIdAndUpdate(
      id,
      {
        loginEnabled: !!loginEnabled,
        status: loginEnabled ? 'Active' : 'Inactive'
      },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    // Sync to associated User document(s) so authentication is immediately updated
    const userOr = [];
    if (student.user) userOr.push({ _id: student.user });
    userOr.push({ referenceId: student._id });
    if (student.email) userOr.push({ email: student.email.toLowerCase() });
    if (student.admissionNo) userOr.push({ username: student.admissionNo.toLowerCase() });
    if (student.rollNo) userOr.push({ username: student.rollNo.toLowerCase() });

    if (userOr.length > 0) {
      await User.updateMany(
        { $or: userOr },
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
      data: student,
      message: `Student login permission ${loginEnabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
