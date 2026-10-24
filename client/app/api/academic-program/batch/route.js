import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Batch, ProgramOffering } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = {};
    const offeringId = searchParams.get('offeringId');
    const status = searchParams.get('status');
    if (offeringId) query.offeringId = offeringId;
    if (status) query.status = status;

    const batches = await Batch.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, offeringId, shift, startDate, endDate, capacity, roomNumber, coordinatorName, sections, status } = body;
    if (!name || !offeringId) return NextResponse.json({ success: false, message: 'Name and Offering are required.' }, { status: 400 });

    const off = await ProgramOffering.findById(offeringId);
    if (!off) return NextResponse.json({ success: false, message: 'Offering not found.' }, { status: 404 });

    const batch = await Batch.create({
      name: name.trim(),
      code: code ? code.trim() : `${off.programCode}-B`,
      offeringId,
      programId: off.programId,
      shift: shift || 'Morning',
      startDate: startDate || '',
      endDate: endDate || '',
      capacity: parseInt(capacity, 10) || off.seatCapacity,
      currentEnrolled: 0,
      roomNumber: roomNumber || '',
      coordinatorName: coordinatorName || '',
      sections: sections && Array.isArray(sections) && sections.length ? sections : ['A'],
      status: status || 'Active'
    });

    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
