import { NextResponse } from 'next/server';

export interface Notification {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  assignedTo: {
    email: string;
    name?: string;
  };
  assignedBy: {
    email: string;
    name?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// In-memory store for notifications (replace with database in production)
export let notifications: Notification[] = [];

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
      assignedTo: body.assignedTo, // Now matches the Task interface
      assignedBy: body.assignedBy, // Now matches the Task interface
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
