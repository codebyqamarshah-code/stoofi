import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Class } from '@/lib/models';

const STANDARD_COLLEGE_CLASSES = [
  'BS Psychology',
  'BS RIT',
  'DPT',
  'FSC Dental',
  'FSC NURSING',
  'FSC OTT'
];

export async function GET() {
  try {
    await connectDB();
    let classes = await Class.find({}).sort({ name: 1 }).lean();
    if (!classes || classes.length === 0) {
      // Seed standard college classes if completely empty
      const seeded = [];
      for (const name of STANDARD_COLLEGE_CLASSES) {
        const created = await Class.create({ name, sections: ['A', 'B', 'C', 'D'] });
        seeded.push(created);
      }
      return NextResponse.json({ success: true, data: seeded });
    }
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error('API /class GET error:', error);
    return NextResponse.json({
      success: true,
      data: STANDARD_COLLEGE_CLASSES.map(name => ({ name, sections: ['A', 'B', 'C', 'D', 'E'] }))
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Class name is required.' }, { status: 400 });
    }

    const sections = Array.isArray(body.sections) ? body.sections.map(s => String(s).trim()).filter(Boolean) : ['A'];

    // Check if class with same name already exists
    const existing = await Class.findOne({ name: { $regex: '^' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', $options: 'i' } });
    if (existing) {
      // Update sections if needed
      existing.sections = [...new Set([...(existing.sections || []), ...sections])];
      await existing.save();
      return NextResponse.json({ success: true, data: existing, message: 'Class updated with new sections.' });
    }

    const newClass = await Class.create({
      name,
      sections: sections.length > 0 ? sections : ['A']
    });

    return NextResponse.json({
      success: true,
      data: newClass,
      message: 'Class created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /class POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create class.' }, { status: 500 });
  }
}
