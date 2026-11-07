import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TransportRoute } from '@/lib/models';

export const dynamic = 'force-dynamic';

const DEFAULT_SEEDED_ROUTES = [
  {
    title: 'Campus to Sharqpur Sharif City Center',
    fare: 1500,
    description: 'Main campus to Sharqpur Sharif bus stop via Lal Puli',
    stops: [
      { name: 'Pak Royal College Campus', lat: 31.7167, lng: 73.9851 },
      { name: 'Lal Puli Chowk', lat: 31.7190, lng: 73.9890 },
      { name: 'Sharqpur General Bus Stand', lat: 31.7250, lng: 73.9950 }
    ],
    isActive: true
  },
  {
    title: 'Campus to Jaranwala Road Interchange',
    fare: 2000,
    description: 'Direct route along Jaranwala Road',
    stops: [
      { name: 'Pak Royal College Campus', lat: 31.7167, lng: 73.9851 },
      { name: 'Mandi Faizabad Mor', lat: 31.7050, lng: 73.9650 },
      { name: 'Jaranwala Toll Plaza', lat: 31.6900, lng: 73.9400 }
    ],
    isActive: true
  },
  {
    title: 'Campus to Sheikhupura City Main Stand',
    fare: 2500,
    description: 'Connecting campus to central Sheikhupura district hub',
    stops: [
      { name: 'Pak Royal College Campus', lat: 31.7167, lng: 73.9851 },
      { name: 'Bhikhi Road Junction', lat: 31.7100, lng: 73.9780 },
      { name: 'Hiran Minar Chowk', lat: 31.7300, lng: 73.9850 },
      { name: 'Sheikhupura General Bus Stand', lat: 31.7131, lng: 73.9783 }
    ],
    isActive: true
  },
  {
    title: 'Campus to Faizpur Interchange M2',
    fare: 2200,
    description: 'Route towards Motorway M2 Faizpur Interchange',
    stops: [
      { name: 'Pak Royal College Campus', lat: 31.7167, lng: 73.9851 },
      { name: 'Kot Abdul Malik', lat: 31.6500, lng: 74.1500 },
      { name: 'Faizpur Interchange (M2)', lat: 31.6300, lng: 74.2000 }
    ],
    isActive: true
  },
  {
    title: 'Campus to Shahdara Metro Station',
    fare: 3000,
    description: 'Long-distance college route to Lahore Shahdara hub',
    stops: [
      { name: 'Pak Royal College Campus', lat: 31.7167, lng: 73.9851 },
      { name: 'Begum Kot Chowk', lat: 31.6250, lng: 74.2600 },
      { name: 'Shahdara Metro Terminal', lat: 31.6210, lng: 74.2830 }
    ],
    isActive: true
  }
];

// GET /api/transport-route
export async function GET() {
  try {
    await connectDB();
    let count = await TransportRoute.countDocuments();
    if (count === 0) {
      await TransportRoute.insertMany(DEFAULT_SEEDED_ROUTES);
    }
    const routes = await TransportRoute.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: routes });
  } catch (error) {
    console.error('API /transport-route GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/transport-route
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.title || String(body.title).trim() === '') {
      return NextResponse.json({ success: false, message: 'Route title is required.' }, { status: 400 });
    }
    const route = await TransportRoute.create({
      title: String(body.title).trim(),
      fare: Number(body.fare) || 0,
      description: body.description || '',
      stops: Array.isArray(body.stops) && body.stops.length > 0 ? body.stops : [
        { name: 'Campus Origin', lat: 31.7167, lng: 73.9851 },
        { name: String(body.title).trim(), lat: 31.7167 + 0.015, lng: 73.9851 + 0.015 }
      ],
      isActive: true
    });
    return NextResponse.json({ success: true, data: route }, { status: 201 });
  } catch (error) {
    console.error('API /transport-route POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
