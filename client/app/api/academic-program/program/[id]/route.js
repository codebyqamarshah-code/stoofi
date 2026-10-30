import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Program, ProgramOffering, AcademicCategory } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.category && typeof body.category === 'object' && body.category._id) {
      body.category = String(body.category._id);
    }

    if (body.category && mongoose.Types.ObjectId.isValid(body.category)) {
      const cat = await AcademicCategory.findById(body.category);
      if (cat) body.categoryName = cat.name;
    } else if (body.category === '' || body.category === null || !body.category) {
      delete body.category;
    }

    const prog = await Program.findByIdAndUpdate(id, body, { new: true });
    if (!prog) return NextResponse.json({ success: false, message: 'Program not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: prog });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const count = await ProgramOffering.countDocuments({ programId: id });
    if (count > 0) {
      return NextResponse.json({ success: false, message: `Cannot delete: ${count} offerings exist for this program.` }, { status: 400 });
    }
    await Program.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Program deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
