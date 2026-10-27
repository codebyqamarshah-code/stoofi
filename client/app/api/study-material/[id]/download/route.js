import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const item = await Content.findByIdAndUpdate(
      id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, message: 'Resource not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      downloadsCount: item.downloadsCount,
      fileUrl: item.fileUrl || item.sourceUrl,
      fileName: item.fileName || 'download',
      message: 'Download registered.'
    });
  } catch (error) {
    console.error('API /study-material/[id]/download error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
