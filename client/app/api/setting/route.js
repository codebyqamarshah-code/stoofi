import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/lib/models';

const OFFICIAL_COLLEGE_ADDRESS = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = {
        schoolName: 'Pak Royal College Sharaqpur',
        schoolCode: 'PRC-001',
        phone: '03 111 444 810',
        email: 'info@pakroyalcollege.edu.pk',
        address: OFFICIAL_COLLEGE_ADDRESS,
        schoolLogo: '/pak-royal-college-logo.png'
      };
    } else {
      setting.address = OFFICIAL_COLLEGE_ADDRESS;
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('API /setting error:', error);
    return NextResponse.json({
      success: true,
      data: {
        schoolName: 'Pak Royal College Sharaqpur',
        schoolCode: 'PRC-001',
        phone: '03 111 444 810',
        email: 'info@pakroyalcollege.edu.pk',
        address: OFFICIAL_COLLEGE_ADDRESS,
        schoolLogo: '/pak-royal-college-logo.png'
      }
    });
  }
}
