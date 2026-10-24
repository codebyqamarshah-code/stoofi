import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { extractYear, previewNextAdmissionNumber } from '@/lib/admissionSequence.service';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year = extractYear(searchParams.get('year') || searchParams.get('admissionDate'));
    const nextAdmissionNo = await previewNextAdmissionNumber(year);

    return NextResponse.json({
      success: true,
      nextAdmissionNo,
      year
    });
  } catch (error) {
    const fallbackYear = new Date().getFullYear();
    return NextResponse.json({
      success: true,
      nextAdmissionNo: `ADM-${fallbackYear}-0001`,
      year: fallbackYear
    });
  }
}
