import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Designation } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const designations = await Designation.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: designations
    });
  } catch (error) {
    console.error('API /designation GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch designations' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Designation name is required' }, { status: 400 });
    }

    const created = await Designation.create({
      name: String(body.name).trim(),
      departmentId: String(body.departmentId || ''),
      department: String(body.department || '').trim(),
      description: String(body.description || '').trim()
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Designation created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /designation POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create designation' }, { status: 500 });
  }
}
