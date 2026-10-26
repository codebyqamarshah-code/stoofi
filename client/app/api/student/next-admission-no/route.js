import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { extractYear, previewNextAdmissionNumber } from '@/lib/admissionSequence.service';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year = extractYear(searchParams.get('year') || searchParams.get('admissionDate'));
    const preview = await previewNextAdmissionNumber(year);
    const admStr = typeof preview === 'object' ? (preview?.admissionNumber || preview?.nextAdmissionNo || `ADM${String(year).slice(-2)}0001`) : preview;

    return NextResponse.json({
      success: true,
      nextAdmissionNo: admStr,
      admissionNo: admStr,
      year
    });
  } catch (error) {
    const fallbackYear = new Date().getFullYear();
    const fallbackAdm = `ADM${String(fallbackYear).slice(-2)}0001`;
    return NextResponse.json({
      success: true,
      nextAdmissionNo: fallbackAdm,
      admissionNo: fallbackAdm,
      year: fallbackYear
    });
  }
}
