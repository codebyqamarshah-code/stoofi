import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('API /dashboard/events GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, audience, eventFor, date, startDate, endDate, location, description, category, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Event title is required' }, { status: 400 });
    }

    const aud = audience || eventFor || 'All';
    const sDate = startDate || date || new Date().toISOString().split('T')[0];
    const eDate = endDate || sDate;

    const event = await Event.create({
      title: title.trim(),
      eventFor: aud,
      audience: aud,
      category: category || 'Event',
      startDate: sDate,
      endDate: eDate,
      date: sDate,
      location: location || 'Main Campus',
      description: description || '',
      status: status || 'Upcoming'
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error('API /dashboard/events POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating event' }, { status: 500 });
  }
}
