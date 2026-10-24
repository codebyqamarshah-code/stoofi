import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AcademicCategory, Program } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET() {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const categories = await AcademicCategory.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, description, applicableStageType, displayOrder, status } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Name and Code are required.' }, { status: 400 });
    }
    const cat = await AcademicCategory.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      applicableStageType: applicableStageType || 'Semester',
      displayOrder: displayOrder || 0,
      status: status || 'Active'
    });
    return NextResponse.json({ success: true, data: cat }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
