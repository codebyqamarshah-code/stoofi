import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { forwardedTo, forwardDate, forwardRemarks } = await req.json();
    if (!forwardedTo || !String(forwardedTo).trim()) {
      return NextResponse.json({ success: false, message: 'Forward target is required.' }, { status: 400 });
    }
    const updated = await PostalReceive.findByIdAndUpdate(
      id,
      { forwardedTo: String(forwardedTo).trim(), forwardDate, forwardRemarks: forwardRemarks || '', status: 'Forwarded' },
      { new: true }
    ).select('-file').lean();
    if (!updated) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Item forwarded successfully' });
  } catch (error) {
    console.error('API /postal-receive/[id]/forward error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
