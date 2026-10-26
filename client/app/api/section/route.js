import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Section } from '@/lib/models';

const STANDARD_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export async function GET() {
  try {
    await connectDB();
    let sections = await Section.find({}).sort({ name: 1 }).lean();
    if (!sections || sections.length === 0) {
      const seeded = [];
      for (const name of STANDARD_SECTIONS) {
        const item = await Section.create({ name, capacity: 40 });
        seeded.push(item);
      }
      return NextResponse.json({ success: true, data: seeded });
    }
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('API /section GET error:', error);
    return NextResponse.json({
      success: true,
      data: STANDARD_SECTIONS.map(name => ({ name, capacity: 40 }))
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Section name is required.' }, { status: 400 });
    }

    const capacity = parseInt(body.capacity, 10) || 40;

    const existing = await Section.findOne({ name: { $regex: '^' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', $options: 'i' } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Section with this name already exists.' }, { status: 400 });
    }

    const newSection = await Section.create({ name, capacity });
    return NextResponse.json({
      success: true,
      data: newSection,
      message: 'Section created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /section POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create section.' }, { status: 500 });
  }
}
