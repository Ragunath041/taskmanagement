'use client';

import { useState } from 'react';

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

interface TaskNotificationProps {
  notification: TaskNotification;
  onAccept: (taskId: string) => void;
  onReject: (taskId: string) => void;
}

export default function TaskNotification({ notification, onAccept, onReject }: TaskNotificationProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept(notification.taskId);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject(notification.taskId);
    setIsProcessing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
            {notification.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>
            )}
          </div>
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
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <span>From: {notification.assignedBy.name || notification.assignedBy.email}</span>
            {notification.dueDate && (
              <span className="ml-3">Due: {formatDate(notification.dueDate)}</span>
            )}
          </div>
          <span>{formatDate(notification.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          {notification.status === 'pending' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center"
                title="Accept Task"
              >
                <span className="mr-1">✓</span> Accept
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center"
                title="Reject Task"
              >
                <span className="mr-1">✕</span> Reject
              </button>
            </div>
          )}
          {notification.status === 'accepted' && (
            <span className="text-sm font-medium text-green-600 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Accepted
            </span>
          )}
          {notification.status === 'rejected' && (
            <span className="text-sm font-medium text-red-600 flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
              Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
