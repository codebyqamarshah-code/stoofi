import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Campus } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET() {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const campuses = await Campus.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: campuses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, address, phone, email, status, isMainCampus } = body;
    if (!name || !code) return NextResponse.json({ success: false, message: 'Name and Code are required.' }, { status: 400 });
    const c = await Campus.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address || '',
      phone: phone || '',
      email: email || '',
      status: status || 'Active',
      isMainCampus: !!isMainCampus
    });
    return NextResponse.json({ success: true, data: c }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
