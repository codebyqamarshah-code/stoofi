import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['Received', 'Forwarded', 'In Process', 'Completed'];

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, completedDate, completedBy, completionRemarks } = await req.json();
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value.' }, { status: 400 });
    }
    const update = { status };
    if (status === 'Completed') {
      update.completedDate = completedDate;
      update.completedBy = completedBy || '';
      update.completionRemarks = completionRemarks || '';
    }
    const updated = await PostalReceive.findByIdAndUpdate(id, update, { new: true }).select('-file').lean();
    if (!updated) return NextResponse.json({ success: false, message: 'Postal receive not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Status updated successfully' });
  } catch (error) {
    console.error('API /postal-receive/[id]/status error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
