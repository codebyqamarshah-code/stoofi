import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AIConversation, AIMessage } from '@/lib/models';

/**
 * GET /api/ai/conversations/[id]
 * Fetch messages for a specific conversation
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const [conversation, messages] = await Promise.all([
      AIConversation.findById(id).lean(),
      AIMessage.find({ conversationId: id }).sort({ createdAt: 1 }).lean()
    ]);

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found.' },
        { status: 404 }
      );
    }

    const mappedMessages = messages.map(m => ({
      id: m._id.toString(),
      _id: m._id.toString(),
      role: m.role,
      content: m.content,
      navAction: m.navAction,
      createdAt: m.createdAt
    }));

    const mappedConv = {
      _id: conversation._id.toString(),
      title: conversation.title,
      role: conversation.role,
      createdAt: conversation.createdAt
    };

    return NextResponse.json({
      success: true,
      conversation: mappedConv,
      messages: mappedMessages,
      data: {
        conversation: mappedConv,
        messages: mappedMessages
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/conversations/[id]
 * Rename a conversation
 */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const conv = await AIConversation.findByIdAndUpdate(
      id,
      { $set: { title: body.title || 'Untitled Chat' } },
      { new: true }
    );

    if (!conv) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        _id: conv._id.toString(),
        title: conv.title
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/conversations/[id]
 * Delete a conversation and all its messages
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    await Promise.all([
      AIConversation.findByIdAndDelete(id),
      AIMessage.deleteMany({ conversationId: id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
