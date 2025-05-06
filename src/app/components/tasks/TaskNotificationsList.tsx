'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import TaskNotification from './TaskNotification';
import { useRouter } from 'next/navigation';

interface TaskNotification {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  assignedBy: {
    email: string;
    name?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export default function TaskNotificationsList() {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our frontend interface
        const transformedNotifications = data.map((notification: any) => ({
          _id: notification._id,
          taskId: notification.task._id,
          title: notification.task.title,
          description: notification.task.description,
          assignedBy: {
            email: notification.sender.email,
            name: notification.sender.name
          },
          status: notification.task.status,
          createdAt: notification.createdAt,
          dueDate: notification.task.dueDate,
          priority: notification.task.priority
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleAccept = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notif =>
          notif.taskId === taskId
            ? { ...notif, status: 'accepted' }
            : notif
        ));
        
        // Refresh the tasks list to show the new task
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to accept task:', error);
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notif =>
          notif.taskId === taskId
            ? { ...notif, status: 'rejected' }
            : notif
        ));
      }
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto bg-white rounded-lg shadow-lg p-4">
      <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <h3 className="text-lg font-semibold">Task Notifications</h3>
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No new notifications</p>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/tasks')}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              View All Tasks
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <TaskNotification
              key={notification._id}
              notification={notification}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
