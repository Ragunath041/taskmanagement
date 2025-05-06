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