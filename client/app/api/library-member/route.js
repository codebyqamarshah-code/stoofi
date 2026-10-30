import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LibraryMember } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const memberType = searchParams.get('type') || searchParams.get('memberType');

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }
    if (memberType && memberType !== 'ALL') {
      query.memberType = new RegExp(`^${memberType}$`, 'i');
    }

    const members = await LibraryMember.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('API /library-member GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch library members' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Member name is required' }, { status: 400 });
    }

    const created = await LibraryMember.create({
      ...body,
      name: String(body.name).trim(),
      memberId: body.memberId || `LIB-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return NextResponse.json({ success: true, data: created, message: 'Library member created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /library-member POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create library member' }, { status: 500 });
  }
}
