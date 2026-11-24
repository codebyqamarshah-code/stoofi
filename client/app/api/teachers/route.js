import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher, User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const [staffTeachers, teachers, userTeachers] = await Promise.all([
      Staff.find({ role: { $regex: /teacher/i } }).lean(),
      Teacher.find({}).lean(),
      User.find({ role: 'Teacher' }).lean()
    ]);

    const combined = [];
    const seen = new Set();
    const userStatusMap = new Map();

    userTeachers.forEach(u => {
      if (u.email) {
        userStatusMap.set(u.email.toLowerCase().trim(), {
          status: u.status,
          loginEnabled: u.loginEnabled,
          _id: String(u._id)
        });
      }
    });

    staffTeachers.forEach(s => {
      const email = (s.email || '').toLowerCase().trim();
      const id = String(s._id);
      seen.add(id);
      if (email) seen.add(email);
      const userMeta = email ? userStatusMap.get(email) : null;
      const status = userMeta?.status || s.status || 'Active';
      combined.push({
        ...s,
        id,
        _id: id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Teacher',
        plainName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Teacher',
        phone: s.mobile || s.phone || '',
        mobile: s.mobile || s.phone || '',
        role: 'Teacher',
        designation: s.designation || 'Teacher',
        department: s.department || 'Academics',
        status,
        loginEnabled: userMeta?.loginEnabled ?? (status === 'Active')
      });
    });

    teachers.forEach(t => {
      const email = (t.email || '').toLowerCase().trim();
      const id = String(t._id);
      if (!seen.has(id) && (!email || !seen.has(email))) {
        seen.add(id);
        if (email) seen.add(email);
        const userMeta = email ? userStatusMap.get(email) : null;
        const status = userMeta?.status || t.status || 'Active';
        combined.push({
          ...t,
          id,
          _id: id,
          name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Teacher',
          plainName: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || 'Teacher',
          phone: t.mobile || t.phone || '',
          mobile: t.mobile || t.phone || '',
          role: 'Teacher',
          designation: t.designation || 'Senior Faculty',
          department: t.department || 'Academics',
          status,
          loginEnabled: userMeta?.loginEnabled ?? (status === 'Active')
        });
      }
    });

    // Also include any registered user with role 'Teacher' not yet in Teacher or Staff
    userTeachers.forEach(u => {
      const email = (u.email || '').toLowerCase().trim();
      const id = String(u._id);
      if (!seen.has(id) && (!email || !seen.has(email))) {
        seen.add(id);
        if (email) seen.add(email);
        combined.push({
          _id: id,
          id,
          name: u.fullName || u.username || 'Teacher',
          plainName: u.fullName || u.username || 'Teacher',
          firstName: u.firstName || u.fullName || 'Teacher',
          lastName: u.lastName || '',
          email: u.email,
          phone: u.phone || '',
          mobile: u.phone || '',
          role: 'Teacher',
          designation: 'Teacher',
          department: 'Academics',
          status: u.status || 'Pending',
          loginEnabled: u.loginEnabled ?? (u.status === 'Active')
        });
      }
    });

    return NextResponse.json({ success: true, data: combined });
  } catch (err) {
    console.error('API /teachers error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, teacherId, email, status } = body;
    const targetStatus = status || 'Active';
    const isLoginEnabled = targetStatus === 'Active';

    const conditions = [];
    if (id || teacherId) conditions.push({ _id: id || teacherId });
    if (email) conditions.push({ email: email.toLowerCase().trim() });

    if (conditions.length === 0) {
      return NextResponse.json({ success: false, message: 'Teacher ID or Email is required.' }, { status: 400 });
    }

    // Update across all models
    await Promise.all([
      Teacher.updateMany({ $or: conditions }, { $set: { status: targetStatus } }),
      Staff.updateMany({ $or: conditions }, { $set: { status: targetStatus, loginEnabled: isLoginEnabled } }),
      User.updateMany({ $or: conditions }, { $set: { status: targetStatus, loginEnabled: isLoginEnabled } })
    ]);

    return NextResponse.json({
      success: true,
      message: `Teacher status successfully updated to ${targetStatus}.`,
      data: { status: targetStatus, loginEnabled: isLoginEnabled }
    });
  } catch (err) {
    console.error('API /teachers PUT error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
