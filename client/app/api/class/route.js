import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Class } from '@/lib/models';

const STANDARD_CLASSES = [
  'Playgroup', 'Nursery', 'KG', 'Prep',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

export async function GET() {
  try {
    await connectDB();
    const classes = await Class.find({}).sort({ name: 1 }).lean();
    if (classes && classes.length > 0) {
      return NextResponse.json({ success: true, data: classes });
    }
    return NextResponse.json({
      success: true,
      data: STANDARD_CLASSES.map(name => ({ name, sections: ['A', 'B', 'C'] }))
    });
  } catch (error) {
    console.error('API /class error:', error);
    return NextResponse.json({
      success: true,
      data: STANDARD_CLASSES.map(name => ({ name, sections: ['A', 'B', 'C'] }))
    });
  }
}
