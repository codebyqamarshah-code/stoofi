import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClassRoom } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    let rooms = await ClassRoom.find({}).sort({ roomNo: 1 }).lean();
    if (!rooms || rooms.length === 0) {
      const defaultRooms = [
        { roomNo: 'Room 101', capacity: 40 },
        { roomNo: 'Room 102', capacity: 45 },
        { roomNo: 'Lab A', capacity: 30 },
        { roomNo: 'Lab B', capacity: 35 }
      ];
      const seeded = [];
      for (const r of defaultRooms) {
        const item = await ClassRoom.create(r);
        seeded.push(item);
      }
      return NextResponse.json({ success: true, data: seeded });
    }
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error('API /classroom GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const roomNo = String(body.roomNo || '').trim();
    const capacity = parseInt(body.capacity, 10) || 40;

    if (!roomNo) {
      return NextResponse.json({ success: false, message: 'Room number is required.' }, { status: 400 });
    }

    const created = await ClassRoom.create({ roomNo, capacity });
    return NextResponse.json({
      success: true,
      data: created,
      message: 'Classroom created successfully.'
    }, { status: 201 });
  } catch (error) {
    console.error('API /classroom POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create classroom.' }, { status: 500 });
  }
}
