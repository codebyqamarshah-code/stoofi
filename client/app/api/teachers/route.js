import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Teacher } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const [staffTeachers, teachers] = await Promise.all([
      Staff.find({ role: { $regex: /teacher/i } }).lean(),
      Teacher.find({}).lean()
    ]);

    const combined = [];
    const seen = new Set();

    staffTeachers.forEach(s => {
      const id = String(s._id);
      seen.add(id);
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
        department: s.department || 'Academics'
      });
    });

    teachers.forEach(t => {
      const id = String(t._id);
      if (!seen.has(id)) {
        seen.add(id);
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
          department: t.department || 'Academics'
        });
      }
    });

    return NextResponse.json({ success: true, data: combined });
  } catch (err) {
    console.error('API /teachers error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
