import { NextResponse } from 'next/server';
import { Task, tasks } from './types';

// Define the Task type
export interface Task {
  _id: string;
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
  status: 'todo' | 'inprogress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

// In-memory store for tasks (replace with database in production)
export let tasks: Task[] = [];

export async function GET() {
  try {
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization');
    
    // Create task in backend
    const taskResponse = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify(body)
    });

    if (!taskResponse.ok) {
      throw new Error('Failed to create task');
    }

    const task = await taskResponse.json();
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
