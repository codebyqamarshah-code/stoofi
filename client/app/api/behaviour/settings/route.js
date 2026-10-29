import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BehaviourSetting } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    let settings = await BehaviourSetting.findOne().lean();
    if (!settings) {
      settings = {
        commentOption: 'Optional',
        viewOption: 'Student & Parent',
        viewIncidentInStudentPortal: true,
        viewIncidentInParentPortal: true,
        viewIncidentInTeacherPortal: true,
        notifyParentsOnNegative: true,
        warningLetterThreshold: -15,
        awardCertificateThreshold: 30
      };
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const updated = await BehaviourSetting.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: updated, message: 'Settings saved successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
