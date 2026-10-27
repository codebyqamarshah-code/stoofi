import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { InventoryItem, ItemCategory } from '@/lib/models';
import { seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const category = searchParams.get('category') || searchParams.get('categoryId');
    const status = searchParams.get('status');
    const stockStatus = searchParams.get('stockStatus'); // 'In Stock' | 'Low Stock' | 'Out of Stock'

    const query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'All' && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        query.categoryName = { $regex: category, $options: 'i' };
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { unit: { $regex: search, $options: 'i' } }
      ];
    }

    let items = await InventoryItem.find(query).sort({ createdAt: -1 }).lean();

    // Compute stock status & filter if requested
    items = items.map(item => {
      const stock = Number(item.totalStock) || 0;
      const min = Number(item.minStock) || 0;
      let computedStatus = 'In Stock';
      if (stock <= 0) computedStatus = 'Out of Stock';
      else if (stock <= min) computedStatus = 'Low Stock';

      return {
        ...item,
        stockStatus: computedStatus
      };
    });

    if (stockStatus && stockStatus !== 'All' && stockStatus !== 'all') {
      items = items.filter(it => it.stockStatus === stockStatus);
    }

    // Dynamic stats
    const all = await InventoryItem.find({}).select('totalStock minStock status').lean();
    const stats = {
      totalItems: all.length,
      activeItems: all.filter(i => i.status === 'Active').length,
      inStock: all.filter(i => (Number(i.totalStock) || 0) > (Number(i.minStock) || 0)).length,
      lowStock: all.filter(i => (Number(i.totalStock) || 0) > 0 && (Number(i.totalStock) || 0) <= (Number(i.minStock) || 0)).length,
      outOfStock: all.filter(i => (Number(i.totalStock) || 0) <= 0).length,
      totalUnitsOnHand: all.reduce((sum, i) => sum + (Number(i.totalStock) || 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
      stats
    });
  } catch (error) {
    console.error('API /inventory/item GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || body.itemName || '').trim();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Item name is required.' }, { status: 400 });
    }

    let categoryId = body.categoryId;
    let categoryName = body.categoryName || '';

    // If categoryId given, lookup name; if name given, lookup or fallback
    if (categoryId) {
      const cat = await ItemCategory.findById(categoryId);
      if (cat) categoryName = cat.name;
    } else if (categoryName) {
      let cat = await ItemCategory.findOne({ name: { $regex: `^${categoryName}$`, $options: 'i' } });
      if (!cat) {
        cat = await ItemCategory.create({ name: categoryName, code: 'CAT-GEN' });
      }
      categoryId = cat._id;
      categoryName = cat.name;
    } else {
      // Default category
      const firstCat = await ItemCategory.findOne({});
      if (firstCat) {
        categoryId = firstCat._id;
        categoryName = firstCat.name;
      }
    }

    if (!categoryId) {
      return NextResponse.json({ success: false, message: 'Please select a valid item category.' }, { status: 400 });
    }

    let code = String(body.code || body.itemCode || '').trim().toUpperCase();
    if (!code) {
      const count = await InventoryItem.countDocuments();
      const prefix = categoryName.slice(0, 3).toUpperCase() || 'ITM';
      code = `ITM-${prefix}-${String(count + 1).padStart(3, '0')}`;
    } else {
      const existing = await InventoryItem.findOne({ code });
      if (existing) {
        return NextResponse.json({ success: false, message: 'An item with this code already exists.' }, { status: 400 });
      }
    }

    const created = await InventoryItem.create({
      name,
      code,
      barcode: body.barcode || '',
      categoryId,
      categoryName,
      unit: body.unit || 'Pcs',
      description: body.description || '',
      minStock: body.minStock !== undefined ? Number(body.minStock) : 10,
      unitCost: body.unitCost !== undefined ? Number(body.unitCost) : 0,
      sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : 0,
      totalStock: 0,
      storeStock: [],
      status: body.status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Inventory Item created successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/item POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
