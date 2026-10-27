import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemStore, StockMovement } from '@/lib/models';
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
        { location: { $regex: search, $options: 'i' } },
        { managerName: { $regex: search, $options: 'i' } }
      ];
    }

    const stores = await ItemStore.find(query).sort({ createdAt: -1 }).lean();

    // Calculate item count and total stock quantity stored in each store
    const storeStats = await StockMovement.aggregate([
      {
        $group: {
          _id: { storeId: '$storeId', itemId: '$itemId' },
          net: { $sum: '$netQuantity' }
        }
      },
      {
        $match: { net: { $gt: 0 } }
      },
      {
        $group: {
          _id: '$_id.storeId',
          itemCount: { $sum: 1 },
          totalQuantity: { $sum: '$net' }
        }
      }
    ]);

    const statMap = {};
    storeStats.forEach(s => {
      statMap[String(s._id)] = {
        itemCount: s.itemCount,
        totalQuantity: s.totalQuantity
      };
    });

    const dataWithStats = stores.map(store => {
      const st = statMap[String(store._id)] || { itemCount: 0, totalQuantity: 0 };
      return {
        ...store,
        itemCount: st.itemCount,
        totalStockQuantity: st.totalQuantity
      };
    });

    return NextResponse.json({
      success: true,
      data: dataWithStats,
      total: dataWithStats.length
    });
  } catch (error) {
    console.error('API /inventory/store GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || body.storeName || '').trim();
    const location = String(body.location || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Store name is required.' }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ success: false, message: 'Store location is required.' }, { status: 400 });
    }

    const existing = await ItemStore.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A store with this name already exists.' }, { status: 400 });
    }

    let code = String(body.code || '').trim().toUpperCase();
    if (!code) {
      const count = await ItemStore.countDocuments();
      code = `STR-${String(count + 1).padStart(2, '0')}`;
    }

    const created = await ItemStore.create({
      name,
      code,
      location,
      managerName: body.managerName || 'Store Incharge',
      contactNumber: body.contactNumber || '',
      description: body.description || '',
      status: body.status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Item Store created successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/store POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
