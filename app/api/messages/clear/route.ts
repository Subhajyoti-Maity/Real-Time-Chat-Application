import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId } = await request.json();

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: 'userId and targetUserId are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const filter = {
      $or: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ],
      deletedForEveryone: { $ne: true }
    };

    const result = await Message.updateMany(filter, {
      $addToSet: { deletedFor: userId }
    });

    return NextResponse.json({
      message: 'Chat cleared successfully',
      matchedCount: result.matchedCount ?? 0,
      modifiedCount: result.modifiedCount ?? 0
    });
  } catch (error) {
    console.error('❌ Error clearing chat:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat. Please try again.' },
      { status: 500 }
    );
  }
}
