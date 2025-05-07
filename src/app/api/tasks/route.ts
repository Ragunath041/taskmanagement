import { NextResponse } from 'next/server';
import { Task } from './types';

// Get the API URL from environment variable
import { API_URL } from '@/app/config';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/tasks`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    
    const tasks = await response.json();
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
    
    const taskResponse = await fetch(`${API_URL}/api/tasks`, {
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
