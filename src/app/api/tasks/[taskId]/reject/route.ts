import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const token = request.headers.get('Authorization');
    
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': token || ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to reject task');
    }

    const task = await response.json();
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error rejecting task:', error);
    return NextResponse.json(
      { error: 'Failed to reject task' },
      { status: 500 }
    );
  }
}
