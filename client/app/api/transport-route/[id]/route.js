import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TransportRoute } from '@/lib/models';

export const dynamic = 'force-dynamic';

// GET /api/transport-route/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const route = await TransportRoute.findById(id).lean();
    if (!route) return NextResponse.json({ success: false, message: 'Route not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: route });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/transport-route/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    if (!body.title || String(body.title).trim() === '') {
      return NextResponse.json({ success: false, message: 'Route title is required.' }, { status: 400 });
    }
    const updateData = {
      title: String(body.title).trim(),
      fare: Number(body.fare) || 0,
      description: body.description || ''
    };
    if (Array.isArray(body.stops)) {
      updateData.stops = body.stops;
    }
    const updated = await TransportRoute.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Route not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Route updated successfully.' });
  } catch (error) {
    console.error('API /transport-route/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/transport-route/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await TransportRoute.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Route not found.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Route deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
