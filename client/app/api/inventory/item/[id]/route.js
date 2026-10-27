import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { InventoryItem, ItemCategory, StockMovement } from '@/lib/models';
import { recalculateItemStock } from '@/lib/inventoryService';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await InventoryItem.findById(id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });

    // Recent stock movements for this item
    const recentMovements = await StockMovement.find({ itemId: item._id })
      .sort({ date: -1 })
      .limit(15)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...item,
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

    const item = await InventoryItem.findById(id);
    if (!item) return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });

    if (body.name || body.itemName) item.name = String(body.name || body.itemName).trim();
    if (body.code || body.itemCode) {
      const newCode = String(body.code || body.itemCode).trim().toUpperCase();
      const dup = await InventoryItem.findOne({ _id: { $ne: id }, code: newCode });
      if (dup) return NextResponse.json({ success: false, message: 'Another item with this code already exists.' }, { status: 400 });
      item.code = newCode;
    }
    if (body.barcode !== undefined) item.barcode = body.barcode;
    if (body.categoryId) {
      item.categoryId = body.categoryId;
      const cat = await ItemCategory.findById(body.categoryId);
      if (cat) item.categoryName = cat.name;
    }
    if (body.unit !== undefined) item.unit = body.unit;
    if (body.description !== undefined) item.description = body.description;
    if (body.minStock !== undefined) item.minStock = Number(body.minStock);
    if (body.unitCost !== undefined) item.unitCost = Number(body.unitCost);
    if (body.sellingPrice !== undefined) item.sellingPrice = Number(body.sellingPrice);
    if (body.status !== undefined) item.status = body.status;

    await item.save();

    // Reconcile stock
    await recalculateItemStock(item._id);

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Item updated successfully.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Data Integrity Check: Cannot delete if movements exist
    const movementCount = await StockMovement.countDocuments({ itemId: id });
    if (movementCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete item: It has ${movementCount} recorded stock movements. Please deactivate the item instead.`
      }, { status: 400 });
    }

    const deleted = await InventoryItem.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Item not found.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
