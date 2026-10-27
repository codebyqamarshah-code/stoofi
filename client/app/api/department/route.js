import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Department } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const departments = await Department.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('API /department GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Department name is required' }, { status: 400 });
    }

    const created = await Department.create({
      name: String(body.name).trim(),
      description: String(body.description || '').trim()
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Department created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /department POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create department' }, { status: 500 });
  }
}
