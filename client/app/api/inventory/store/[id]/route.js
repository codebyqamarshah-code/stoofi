import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemStore, StockMovement, InventoryItem } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const store = await ItemStore.findById(id).lean();
    if (!store) return NextResponse.json({ success: false, message: 'Store not found.' }, { status: 404 });

    // Fetch items and stock stored in this store
    const movements = await StockMovement.aggregate([
      { $match: { storeId: store._id } },
      {
        $group: {
          _id: '$itemId',
          itemName: { $first: '$itemName' },
          net: { $sum: '$netQuantity' }
        }
      },
      { $match: { net: { $gt: 0 } } }
    ]);

    // Fetch recent 10 transactions in this store
    const recentMovements = await StockMovement.find({ storeId: store._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        stockItems: movements,
        recentMovements
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const store = await ItemStore.findById(id);
    if (!store) return NextResponse.json({ success: false, message: 'Store not found.' }, { status: 404 });

    if (body.name || body.storeName) {
      const newName = String(body.name || body.storeName).trim();
      const dup = await ItemStore.findOne({
        _id: { $ne: id },
        name: { $regex: `^${newName}$`, $options: 'i' }
      });
      if (dup) {
        return NextResponse.json({ success: false, message: 'Another store with this name already exists.' }, { status: 400 });
      }
      store.name = newName;
      // Sync storeName in InventoryItem.storeStock
      await InventoryItem.updateMany(
        { 'storeStock.storeId': id },
        { $set: { 'storeStock.$.storeName': newName } }
      );
    }

    if (body.code !== undefined) store.code = String(body.code).trim().toUpperCase();
    if (body.location !== undefined) store.location = body.location;
    if (body.managerName !== undefined) store.managerName = body.managerName;
    if (body.contactNumber !== undefined) store.contactNumber = body.contactNumber;
    if (body.description !== undefined) store.description = body.description;
    if (body.status !== undefined) store.status = body.status;

    await store.save();

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Store updated successfully.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if store has any historical stock movements or current stock
    const movementCount = await StockMovement.countDocuments({ storeId: id });
    if (movementCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete store: It has ${movementCount} historical inventory transactions. Please deactivate the store instead.`
      }, { status: 400 });
    }

    const deleted = await ItemStore.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Store not found.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Store deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
