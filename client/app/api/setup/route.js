import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminSetup } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const all = searchParams.get('all') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));

    const query = {};
    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { type: regex }, { description: regex }];
    }
    if (type && type !== 'All' && type.trim()) {
      query.type = type.trim();
    }
    if (status && status !== 'All' && status.trim()) {
      query.status = status.trim();
    }

    if (all) {
      const data = await AdminSetup.find(query).sort({ type: 1, name: 1 }).lean();
      return NextResponse.json({ success: true, data });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AdminSetup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminSetup.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /setup GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch setup data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { type, name, description, status } = body;

    if (!type || !type.trim()) {
      return NextResponse.json({ success: false, message: 'Category type is required' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Item name is required' }, { status: 400 });
    }

    const existing = await AdminSetup.findOne({
      type: type.trim(),
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existing) {
      return NextResponse.json({ success: false, message: `"${name.trim()}" already exists in "${type.trim()}"` }, { status: 400 });
    }

    const created = await AdminSetup.create({
      type: type.trim(),
      name: name.trim(),
      description: (description || '').trim(),
      status: status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Setup item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /setup POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create setup item' }, { status: 500 });
  }
}
