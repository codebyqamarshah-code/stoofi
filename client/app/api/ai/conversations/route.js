import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AIConversation, AIMessage, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) return null;
    return await User.findById(decoded.id).select('-password').lean();
  } catch (err) {
    return null;
  }
}

/**
 * GET /api/ai/conversations
 * List recent conversations
 */
export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const filter = user?._id ? { userId: user._id } : {};

    const conversations = await AIConversation.find(filter)
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    const mapped = conversations.map(c => ({
      _id: c._id.toString(),
      title: c.title,
      role: c.role,
      pinned: c.pinned,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    return NextResponse.json({
      success: true,
      conversations: mapped,
      data: mapped
    });
  } catch (error) {
    console.error('AI conversations GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/conversations
 * Create a new conversation
 */
export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));

    const conv = await AIConversation.create({
      userId: user?._id || null,
      title: body?.title || 'New Conversation',
      role: user?.role || 'Super Admin'
    });

    return NextResponse.json({
      success: true,
      conversation: {
        _id: conv._id.toString(),
        title: conv.title,
        role: conv.role,
        createdAt: conv.createdAt
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
