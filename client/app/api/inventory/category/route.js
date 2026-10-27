import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemCategory, InventoryItem } from '@/lib/models';
import { seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const categories = await ItemCategory.find(query).sort({ createdAt: -1 }).lean();

    // Calculate actual item counts per category
    const itemCounts = await InventoryItem.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    itemCounts.forEach(c => { countMap[String(c._id)] = c.count; });

    const dataWithCounts = categories.map(cat => ({
      ...cat,
      itemCount: countMap[String(cat._id)] || 0
    }));

    return NextResponse.json({
      success: true,
      data: dataWithCounts,
      total: dataWithCounts.length
    });
  } catch (error) {
    console.error('API /inventory/category GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || body.categoryName || '').trim();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required.' }, { status: 400 });
    }

    // Check unique name
    const existing = await ItemCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A category with this name already exists.' }, { status: 400 });
    }

    let code = String(body.code || '').trim().toUpperCase();
    if (!code) {
      // Auto-generate code
      const initials = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      const count = await ItemCategory.countDocuments();
      code = `CAT-${initials || 'ITM'}-${String(count + 1).padStart(2, '0')}`;
    }

    const created = await ItemCategory.create({
      name,
      code,
      description: body.description || '',
      status: body.status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Item Category created successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/category POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
