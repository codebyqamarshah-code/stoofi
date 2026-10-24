import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AcademicSession } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET() {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const sessions = await AcademicSession.find().sort({ year: -1 }).lean();
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, year, startDate, endDate, isCurrent, status } = body;
    if (!name || !year) return NextResponse.json({ success: false, message: 'Name and Year are required.' }, { status: 400 });
    if (isCurrent) {
      await AcademicSession.updateMany({}, { $set: { isCurrent: false } });
    }
    const s = await AcademicSession.create({
      name: name.trim(),
      year: parseInt(year, 10),
      startDate: startDate || '',
      endDate: endDate || '',
      isCurrent: !!isCurrent,
      status: status || 'Active'
    });
    return NextResponse.json({ success: true, data: s }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
