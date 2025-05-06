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