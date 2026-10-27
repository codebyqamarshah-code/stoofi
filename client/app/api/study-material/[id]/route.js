import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const item = await Content.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Study material not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('API /study-material/[id] GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existing = await Content.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Study material not found.' }, { status: 404 });
    }

    // Update mutable fields
    if (body.title !== undefined) existing.title = String(body.title).trim();
    if (body.contentType !== undefined) existing.contentType = body.contentType;
    if (body.description !== undefined) existing.description = body.description;
    if (body.availableFor !== undefined) existing.availableFor = body.availableFor;
    if (body.availAdmin !== undefined) existing.availAdmin = Boolean(body.availAdmin);
    if (body.availStudent !== undefined) existing.availStudent = Boolean(body.availStudent);
    if (body.className !== undefined) existing.className = body.className;
    if (body.section !== undefined) existing.section = body.section;
    if (body.subject !== undefined) existing.subject = body.subject;
    if (body.academicSession !== undefined) existing.academicSession = body.academicSession;
    if (body.publishDate !== undefined) existing.publishDate = new Date(body.publishDate);
    if (body.dueDate !== undefined) existing.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.status !== undefined) existing.status = body.status;
    if (body.category !== undefined) existing.category = body.category;
    if (body.version !== undefined) existing.version = body.version;
    if (body.totalMarks !== undefined) existing.totalMarks = Number(body.totalMarks);
    if (body.passingMarks !== undefined) existing.passingMarks = Number(body.passingMarks);
    if (body.sourceUrl !== undefined) existing.sourceUrl = body.sourceUrl;
    
    // File update if provided
    if (body.fileUrl) {
      existing.fileUrl = body.fileUrl;
      if (body.fileName) existing.fileName = body.fileName;
      if (body.fileType) existing.fileType = body.fileType;
      if (body.fileSize) existing.fileSize = body.fileSize;
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      data: existing,
      message: 'Study material updated successfully.'
    });
  } catch (error) {
    console.error('API /study-material/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  // Alias PATCH to same update logic
  return PUT(req, { params });
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Content.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Study material not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Study material deleted successfully.'
    });
  } catch (error) {
    console.error('API /study-material/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
