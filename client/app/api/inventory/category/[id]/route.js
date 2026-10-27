import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemCategory, InventoryItem } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const cat = await ItemCategory.findById(id).lean();
    if (!cat) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: cat });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const cat = await ItemCategory.findById(id);
    if (!cat) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });

    if (body.name || body.categoryName) {
      const newName = String(body.name || body.categoryName).trim();
      // Check unique if name changed
      const dup = await ItemCategory.findOne({
        _id: { $ne: id },
        name: { $regex: `^${newName}$`, $options: 'i' }
      });
      if (dup) {
        return NextResponse.json({ success: false, message: 'Another category already has this name.' }, { status: 400 });
      }
      cat.name = newName;
      // Sync categoryName to items using this category
      await InventoryItem.updateMany({ categoryId: id }, { categoryName: newName });
    }

    if (body.code !== undefined) cat.code = String(body.code).trim().toUpperCase();
    if (body.description !== undefined) cat.description = body.description;
    if (body.status !== undefined) cat.status = body.status;

    await cat.save();

    return NextResponse.json({
      success: true,
      data: cat,
      message: 'Category updated successfully.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Data Integrity Check: Cannot delete category if items are linked!
    const itemCount = await InventoryItem.countDocuments({ categoryId: id });
    if (itemCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete: ${itemCount} items are linked to this category. Please deactivate the category or reassign its items first.`
      }, { status: 400 });
    }

    const deleted = await ItemCategory.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
