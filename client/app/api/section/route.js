import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Section } from '@/lib/models';

const STANDARD_SECTIONS = ['A', 'B', 'C', 'D', 'Rose', 'Tulip', 'Lotus'];

export async function GET() {
  try {
    await connectDB();
    const sections = await Section.find({}).sort({ name: 1 }).lean();
    if (sections && sections.length > 0) {
      return NextResponse.json({ success: true, data: sections });
    }
    return NextResponse.json({
      success: true,
      data: STANDARD_SECTIONS.map(name => ({ name, capacity: 40 }))
    });
  } catch (error) {
    console.error('API /section error:', error);
    return NextResponse.json({
      success: true,
      data: STANDARD_SECTIONS.map(name => ({ name, capacity: 40 }))
    });
  }
}
