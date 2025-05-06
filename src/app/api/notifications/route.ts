import { NextResponse } from 'next/server';
import { Notification, notifications } from './types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Filter notifications for the specified user
    const userNotifications = notifications.filter(
      notification => notification.assignedTo.email === userEmail
    );

    return NextResponse.json(userNotifications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const notification: Notification = {
      _id: Math.random().toString(36).substr(2, 9),
      taskId: body.taskId,
      title: body.title,
      description: body.description,
      assignedTo: body.assignedTo,
      assignedBy: body.assignedBy,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      priority: body.priority,
      dueDate: body.dueDate
    };

    // Add to our in-memory store
    notifications.push(notification);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
