import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Staff } from '@/lib/models';
import { verifyToken, verifyHmacSignature } from '@/lib/jwt-secret';

export const dynamic = 'force-dynamic';

/**
 * Validates request authorization using centralized server-only secret:
 * 1. Logged-in session cookie `token`
 * 2. Logged-in `Authorization: Bearer <token>`
 * 3. Cryptographic time-limited HMAC signature `?sig=<hex>&exp=<timestamp>`
 * 4. Signed JWT `?verify_token=<jwt>` issued specifically for this target staff ID
 * 
 * STRICT: If JWT_SECRET is unconfigured, or if credentials/signature are invalid/expired, fails closed with 401.
 */
function isAuthorized(req, targetId) {
  try {
    // 1. Check logged-in user session cookie (standard browser dashboard)
    const cookieToken = req.cookies?.get('token')?.value;
    if (cookieToken) {
      try {
        verifyToken(cookieToken);
        return true;
      } catch (_) {}
    }

    // 2. Check Authorization header (API / mobile requests)
    const authHeader = req.headers?.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const headerToken = authHeader.substring(7).trim();
      try {
        verifyToken(headerToken);
        return true;
      } catch (_) {}
    }

    // 3. Cryptographic time-limited HMAC signature check for verified public QR card scanning
    const sig = req.nextUrl?.searchParams?.get('sig');
    const exp = req.nextUrl?.searchParams?.get('exp');
    if (sig && exp && targetId) {
      if (verifyHmacSignature('staff_photo', targetId, exp, sig)) {
        return true;
      }
    }

    // 4. Time-limited signed token specifically for public QR verification
    const verifyTokenParam = req.nextUrl?.searchParams?.get('verify_token');
    if (verifyTokenParam) {
      try {
        const decoded = verifyToken(verifyTokenParam);
        if (decoded && (decoded.sub === targetId || decoded.targetId === targetId || decoded.staffNo === targetId)) {
          return true;
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error('Staff photo authorization verification failure:', err.message);
    return false;
  }

  return false;
}

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) {
      return new Response(null, { status: 404 });
    }

    if (!isAuthorized(req, id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized: Valid authentication token or cryptographic QR verification signature required' 
        },
        { status: 401 }
      );
    }

    await connectDB();

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
            'Cache-Control': 'private, no-transform, max-age=3600',
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
          'Cache-Control': 'private, no-transform, max-age=3600',
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
