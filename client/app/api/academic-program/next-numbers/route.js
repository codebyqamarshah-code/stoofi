import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { extractYear, previewNextAdmissionNumber, previewNextRollNumber } from '@/lib/admissionSequence.service';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year = extractYear(searchParams.get('year') || searchParams.get('admissionDate'));
    const [nextAdmissionNumber, nextRollNumber] = await Promise.all([
      previewNextAdmissionNumber(year),
      previewNextRollNumber(year)
    ]);

    return NextResponse.json({
      success: true,
      year,
      nextAdmissionNumber,
      nextRollNumber
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
