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
    const classes = await Class.find({}).sort({ name: 1 }).lean();
    if (classes && classes.length > 0) {
      // Filter out legacy school classes
      const filtered = classes.filter(c => !/^(playgroup|play group|pg|play|nursery|kg|prep|class\s*\d+|grade\s*\d+)$/i.test(c.name));
      if (filtered.length > 0) {
        return NextResponse.json({ success: true, data: filtered });
      }
    }
    return NextResponse.json({
      success: true,
      data: STANDARD_COLLEGE_CLASSES.map(name => ({ name, sections: ['A', 'B', 'C', 'D', 'E'] }))
    });
  } catch (error) {
    console.error('API /class error:', error);
    return NextResponse.json({
      success: true,
      data: STANDARD_COLLEGE_CLASSES.map(name => ({ name, sections: ['A', 'B', 'C', 'D', 'E'] }))
    });
  }
}
