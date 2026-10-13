import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = {
        schoolName: 'Stoofi Public School & College',
        schoolCode: 'STOOFI-001',
        phone: '+92 300 1234567',
        email: 'info@stoofi.com',
        address: 'Main Campus, Model Town, Lahore, Pakistan',
        schoolLogo: ''
      };
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('API /setting error:', error);
    return NextResponse.json({
      success: true,
      data: {
        schoolName: 'Stoofi Public School & College',
        schoolCode: 'STOOFI-001',
        phone: '+92 300 1234567',
        email: 'info@stoofi.com',
        address: 'Main Campus, Model Town, Lahore, Pakistan',
        schoolLogo: ''
      }
    });
  }
}
