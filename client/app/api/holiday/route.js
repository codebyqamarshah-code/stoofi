import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const list = await Event.find({ category: 'Holiday' }).sort({ startDate: -1, date: -1 }).lean();
    const formatted = list.map(ev => {
      const from = ev.startDate || ev.date || new Date().toISOString().split('T')[0];
      const to = ev.endDate || from;
      let days = 1;
      try {
        const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
        days = diff > 0 ? diff : 1;
      } catch (_) {}

      return {
        id: ev._id.toString(),
        _id: ev._id.toString(),
        title: ev.title,
        fromDate: from,
        toDate: to,
        days,
        description: ev.description || '',
        status: ev.status || 'Upcoming'
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('API /holiday GET error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    let body = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {
        title: formData.get('title'),
        fromDate: formData.get('fromDate'),
        toDate: formData.get('toDate'),
        description: formData.get('description'),
      };
    } else {
      body = await req.json();
    }

    const { title, fromDate, toDate, description } = body;
    if (!title || !String(title).trim()) {
      return NextResponse.json({ success: false, message: 'Holiday title is required' }, { status: 400 });
    }

    const sDate = fromDate || new Date().toISOString().split('T')[0];
    const eDate = toDate || sDate;

    const event = await Event.create({
      title: String(title).trim(),
      category: 'Holiday',
      audience: 'All',
      eventFor: 'All',
      startDate: sDate,
      endDate: eDate,
      date: sDate,
      description: description || '',
      status: 'Upcoming'
    });

    let days = 1;
    try {
      const diff = Math.ceil((new Date(eDate) - new Date(sDate)) / (1000 * 60 * 60 * 24)) + 1;
      days = diff > 0 ? diff : 1;
    } catch (_) {}

    return NextResponse.json({
      success: true,
      data: {
        id: event._id.toString(),
        _id: event._id.toString(),
        title: event.title,
        fromDate: sDate,
        toDate: eDate,
        days,
        description: event.description || '',
        status: event.status
      },
      message: 'Holiday created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('API /holiday POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error creating holiday' }, { status: 500 });
  }
}
