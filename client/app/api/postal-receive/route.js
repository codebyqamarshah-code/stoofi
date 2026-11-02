import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostalReceive } from '@/lib/models';
import { parseRequestBody, nextSequentialId } from '@/lib/parseRequestBody';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    // Exclude heavy base64 attachment from list payload (served on demand via view/detail)
    const data = await PostalReceive.find().select('-file').sort({ createdAt: -1 }).lean();
    const withFlag = await PostalReceive.find({ file: { $exists: true, $ne: '' } }).select('_id').lean();
    const hasFile = new Set(withFlag.map(d => String(d._id)));
    return NextResponse.json({
      success: true,
      data: data.map(d => ({ ...d, hasFile: hasFile.has(String(d._id)) }))
    });
  } catch (error) {
    console.error('API /postal-receive GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await parseRequestBody(req);
    if (!body.fromTitle && !body.senderName) {
      return NextResponse.json({ success: false, message: 'Sender name is required.' }, { status: 400 });
    }
    const receiveId = body.receiveId || await nextSequentialId(PostalReceive, 'receiveId', 'PR');
    const created = await PostalReceive.create({ ...body, receiveId });
    const { file, ...safe } = created.toObject();
    return NextResponse.json({
      success: true,
      data: { ...safe, hasFile: Boolean(file) },
      message: 'Postal receive recorded successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /postal-receive POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
