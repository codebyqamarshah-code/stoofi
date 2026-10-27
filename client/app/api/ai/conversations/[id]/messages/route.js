import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AIMessage } from '@/lib/models';

/**
 * DELETE /api/ai/conversations/[id]/messages
 * Clear all messages in a conversation
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    await AIMessage.deleteMany({ conversationId: id });

    return NextResponse.json({
      success: true,
      message: 'Messages cleared successfully.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
