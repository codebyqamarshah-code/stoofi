import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Staff } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) {
      return new Response(null, { status: 404 });
    }

    let staff = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      staff = await Staff.findById(id).select('staffPhoto photo').lean();
    }
    if (!staff) {
      staff = await Staff.findOne({
        $or: [
          { staffNo: id },
          { email: id }
        ]
      }).select('staffPhoto photo').lean();
    }

    if (!staff) {
      return new Response(null, { status: 404 });
    }

    const raw = staff.staffPhoto || staff.photo;
    if (!raw || typeof raw !== 'string') {
      return new Response(null, { status: 404 });
    }

    const trimmed = raw.trim();

    // 1. Data URI format (data:image/jpeg;base64,...)
    if (trimmed.startsWith('data:')) {
      const match = trimmed.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        const mimeType = match[1] || 'image/jpeg';
        const buffer = Buffer.from(match[2], 'base64');
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            'Content-Length': String(buffer.length)
          }
        });
      }
    }

    // 2. Pure base64 format without data: prefix
    if (/^[A-Za-z0-9+/=]{100,}/.test(trimmed)) {
      const mimeType = trimmed.startsWith('/9j/') ? 'image/jpeg' : (trimmed.startsWith('iVBORw') ? 'image/png' : 'image/jpeg');
      const buffer = Buffer.from(trimmed, 'base64');
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          'Content-Length': String(buffer.length)
        }
      });
    }

    // 3. Absolute URL redirect
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return NextResponse.redirect(trimmed, { status: 302 });
    }

    return new Response(null, { status: 404 });
  } catch (err) {
    console.error('Error in /api/staff/[id]/photo:', err);
    return new Response(null, { status: 500 });
  }
}
