import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { title, audience, eventFor, date, startDate, endDate, location, description, category, status } = body;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    if (title !== undefined) event.title = title.trim();
    if (audience !== undefined || eventFor !== undefined) {
      event.audience = audience || eventFor;
      event.eventFor = audience || eventFor;
    }
    if (category !== undefined) event.category = category;
    if (startDate !== undefined) event.startDate = startDate;
    if (endDate !== undefined) event.endDate = endDate;
    if (date !== undefined) {
      event.date = date;
      if (!startDate) event.startDate = date;
      if (!endDate) event.endDate = date;
    }
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;
    if (status !== undefined) event.status = status;

    await event.save();
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('API /dashboard/events/[id] PUT error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error updating event' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('API /dashboard/events/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error deleting event' }, { status: 500 });
  }
}
