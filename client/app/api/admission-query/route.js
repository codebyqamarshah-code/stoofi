import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdmissionQuery } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (source && source !== 'All') {
      query.source = source;
    }

    const data = await AdmissionQuery.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /admission-query GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch admission queries' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    const created = await AdmissionQuery.create({
      name: String(body.name).trim(),
      phone: String(body.phone || '').trim(),
      source: String(body.source || '').trim(),
      status: body.status || 'Interested',
      queryDate: body.queryDate ? new Date(body.queryDate) : new Date(),
      lastFollowUpDate: body.lastFollowUpDate ? new Date(body.lastFollowUpDate) : undefined,
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : undefined,
      notes: String(body.notes || '').trim()
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Admission query saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /admission-query POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to save admission query' }, { status: 500 });
  }
}
