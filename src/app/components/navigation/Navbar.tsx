'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL } from '@/app/config';
import NotificationsPopup from '../tasks/NotificationsPopup';

interface TaskNotification {
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
  message: string;
  seen: boolean;
}

interface NavbarProps {
  onLogout: () => void;
  onTaskUpdate?: () => void;
}

export default function Navbar({ onLogout, onTaskUpdate }: NavbarProps) {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Transform the data to match our frontend interface
          const transformedNotifications = data
            .filter((notification: any) => notification.task) // Filter out notifications with null task
            .map((notification: any) => ({
              _id: notification._id,
              taskId: notification.task._id,
              title: notification.task.title,
              description: notification.task.description,
              assignedTo: notification.task.assignedTo,
              assignedBy: notification.task.assignedBy,
              status: notification.task.status,
              createdAt: notification.createdAt,
              priority: notification.task.priority,
              dueDate: notification.task.dueDate,
              message: notification.message,
              seen: notification.seen
            }));

          // Sort notifications by createdAt in descending order (newest first)
          transformedNotifications.sort((a: TaskNotification, b: TaskNotification) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setNotifications(transformedNotifications);
          // Count only pending tasks as unseen
          setUnseenCount(transformedNotifications.filter((n: TaskNotification) => 
            n.status === 'pending' && !n.seen
          ).length);
        } else if (res.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access to notifications');
          onLogout();
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    // Initial fetch
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [onLogout]);

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
  };

  const handleAcceptTask = async (taskId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh notifications after accepting
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const transformedNotifications = data
            .filter((notification: any) => notification.task)
            .map((notification: any) => ({
              _id: notification._id,
              taskId: notification.task._id,
              title: notification.task.title,
              description: notification.task.description,
              assignedTo: notification.task.assignedTo,
              assignedBy: notification.task.assignedBy,
              status: notification.task.status,
              createdAt: notification.createdAt,
              priority: notification.task.priority,
              dueDate: notification.task.dueDate,
              message: notification.message,
              seen: notification.seen
            }));
          setNotifications(transformedNotifications);
          setUnseenCount(transformedNotifications.filter((n: TaskNotification) => 
            n.status === 'pending' && !n.seen
          ).length);

          // Trigger dashboard update
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        }
      }
    } catch (error) {
      console.error('Failed to accept task:', error);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh notifications after rejecting
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const transformedNotifications = data
            .filter((notification: any) => notification.task)
            .map((notification: any) => ({
              _id: notification._id,
              taskId: notification.task._id,
              title: notification.task.title,
              description: notification.task.description,
              assignedTo: notification.task.assignedTo,
              assignedBy: notification.task.assignedBy,
              status: notification.task.status,
              createdAt: notification.createdAt,
              priority: notification.task.priority,
              dueDate: notification.task.dueDate,
              message: notification.message,
              seen: notification.seen
            }));
          setNotifications(transformedNotifications);
          setUnseenCount(transformedNotifications.filter((n: TaskNotification) => 
            n.status === 'pending' && !n.seen
          ).length);

          // Trigger dashboard update
          if (onTaskUpdate) {
            onTaskUpdate();
          }
        }
      }
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Task Manager</h1>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleBellClick}
              className="relative p-2 mr-2 focus:outline-none"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unseenCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unseenCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationsPopup 
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onAccept={handleAcceptTask}
                onReject={handleRejectTask}
              />
            )}
            <button
              onClick={onLogout}
              className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
