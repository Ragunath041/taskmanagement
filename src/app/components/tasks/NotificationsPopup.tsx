'use client';

import { useEffect, useRef } from 'react';
import TaskNotification from './TaskNotification';

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
}

interface NotificationsPopupProps {
  notifications: TaskNotification[];
  onClose: () => void;
  onAccept: (taskId: string) => void;
  onReject: (taskId: string) => void;
}

export default function NotificationsPopup({ notifications, onClose, onAccept, onReject }: NotificationsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed top-16 right-4 z-50 w-96" ref={popupRef}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Task Notifications</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div key={notification._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      {notification.priority && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {notification.priority}
                        </span>
                      )}
                    </div>
                    {notification.description && (
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        From: {notification.assignedBy.name || notification.assignedBy.email}
                      </div>
                      {notification.dueDate && (
                        <div>
                          Due: {new Date(notification.dueDate).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </div>
                      )}
                      <div>
                        {new Date(notification.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </div>
                    </div>
                    {notification.status === 'pending' && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => onAccept(notification.taskId)}
                          className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Accept Task
                        </button>
                        <button
                          onClick={() => onReject(notification.taskId)}
                          className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Reject Task
                        </button>
                      </div>
                    )}
                    {notification.status === 'accepted' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted
                      </span>
                    )}
                    {notification.status === 'rejected' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
