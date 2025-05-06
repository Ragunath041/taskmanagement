import { useState } from 'react';
import { API_URL } from '../../config';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'completed' | 'rejected';
  assignedTo: {
    email: string;
    name?: string;
  };
  assignedBy: {
    email: string;
    name?: string;
  };
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  currentUserEmail: string;
  onTaskUpdate?: () => void;
}

export default function TaskCard({ task, onEdit, onDelete, currentUserEmail, onTaskUpdate }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'inprogress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  const handleAccept = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/tasks/${task._id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept task');
      }

      // Refresh the page to show updated task status
      window.location.reload();
    } catch (error) {
      console.error('Error accepting task:', error);
      setError('Failed to accept task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/tasks/${task._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject task');
      }

      // Refresh the page to show updated task status
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting task:', error);
      setError('Failed to reject task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/tasks/${task._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      // Trigger task update in parent component
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    } finally {
      setIsLoading(false);
    }
  };

  const isAssignedToCurrentUser = task.assignedTo.email === currentUserEmail;
  const showAcceptRejectButtons = isAssignedToCurrentUser && task.status === 'todo';
  const showCompleteCheckbox = isAssignedToCurrentUser && 
    (task.status === 'inprogress' || task.status === 'todo');

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md mb-2">
          {error}
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start space-x-3">
          {showCompleteCheckbox && (
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={handleComplete}
              disabled={isLoading}
              className="mt-1.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          )}
          <div>
            <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            {task.assignedBy && (
              <p className="text-sm text-gray-600">
                Assigned by: {task.assignedBy.name || task.assignedBy.email}
              </p>
            )}
            {task.assignedTo && (
              <p className="text-sm text-gray-600">
                Assigned to: {task.assignedTo.name || task.assignedTo.email}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status}
          </span>
          {showAcceptRejectButtons ? (
            <div className="flex space-x-2">
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className={`text-gray-600 mb-2 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
        {task.description}
      </p>
      <p className="text-sm text-gray-500">
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </p>
    </div>
  );
}
