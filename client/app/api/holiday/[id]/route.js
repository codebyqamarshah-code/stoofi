import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Holiday not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('API /holiday/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error deleting holiday' }, { status: 500 });
  }
}
