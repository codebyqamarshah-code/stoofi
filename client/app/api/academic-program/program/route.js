import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Program, AcademicCategory } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET(req) {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const { searchParams } = new URL(req.url);
    const query = {};
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    if (categoryId) query.category = categoryId;
    if (status) query.status = status;

    const programs = await Program.find(query)
      .populate('category', 'name code')
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, qualificationName, category, department, description, academicPattern, defaultDuration, totalStages, stageType, status } = body;
    if (!name || !code || !category) {
      return NextResponse.json({ success: false, message: 'Name, Code, and Category are required.' }, { status: 400 });
    }
    const catDoc = await AcademicCategory.findById(category);
    const prog = await Program.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      qualificationName: qualificationName || '',
      category,
      categoryName: catDoc ? catDoc.name : '',
      department: department || 'Academics',
      description: description || '',
      academicPattern: academicPattern || 'Annual',
      defaultDuration: defaultDuration || '2 Years',
      totalStages: totalStages || 2,
      stageType: stageType || 'Part',
      status: status || 'Active'
    });
    return NextResponse.json({ success: true, data: prog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
