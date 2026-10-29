import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findById(id).select('studentPhoto photo').lean();
    if (!student) {
      return new NextResponse(null, { status: 404 });
    }

    const raw = student.studentPhoto || student.photo;
    if (!raw || typeof raw !== 'string') {
      return new NextResponse(null, { status: 404 });
    }

    const trimmed = raw.trim();
    if (trimmed.startsWith('data:')) {
      const match = trimmed.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        const mimeType = match[1] || 'image/jpeg';
        const buffer = Buffer.from(match[2], 'base64');
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            'Content-Length': String(buffer.length)
          }
        });
      }
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return NextResponse.redirect(trimmed, { status: 302 });
    }

    return new NextResponse(null, { status: 404 });
  } catch (err) {
    return new NextResponse(null, { status: 500 });
  }
}
