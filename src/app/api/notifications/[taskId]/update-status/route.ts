import { NextResponse } from 'next/server';
import { notifications } from '../../types';

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const body = await request.json();
    const { status } = body;

    // Find and update the notification
    const notificationIndex = notifications.findIndex(n => n.taskId === taskId);
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification status
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      status: status as 'pending' | 'accepted' | 'rejected'
    };

    return NextResponse.json({ 
      message: 'Notification status updated successfully',
      notification: notifications[notificationIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification status' },
      { status: 500 }
    );
  }
}
