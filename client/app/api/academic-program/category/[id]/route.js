import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AcademicCategory, Program } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const cat = await AcademicCategory.findByIdAndUpdate(id, body, { new: true });
    if (!cat) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: cat });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const count = await Program.countDocuments({ category: id });
    if (count > 0) {
      return NextResponse.json({ success: false, message: `Cannot delete: ${count} programs are linked to this category.` }, { status: 400 });
    }
    await AcademicCategory.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
