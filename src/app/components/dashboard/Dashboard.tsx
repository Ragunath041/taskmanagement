'use client'

import React, { useEffect, useState, useCallback } from 'react'
import TaskCard from '../tasks/TaskCard'
import TaskForm from '../tasks/TaskForm'
import Navbar from '../navigation/Navbar'
import TaskNotificationsList from '../tasks/TaskNotificationsList'
import { API_URL } from '../../config'
import { toast } from 'react-toastify'

interface Task {
  _id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'inprogress' | 'completed' | 'rejected'
  assignedTo: {
    email: string
    name?: string
  }
  assignedBy: {
    email: string
    name?: string
  }
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    dueDate: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [error, setError] = useState('')

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) throw new Error('Failed to fetch user info')
      const userData = await response.json()
      setCurrentUserEmail(userData.email)
    } catch (error) {
      console.error('Failed to load user info:', error)
      toast.error('Failed to load user info')
      setError('Failed to load user info')
    }
  }

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      
      const filteredTasks = data.filter((task: Task) => {
        const isCreatedByMe = task.assignedBy.email === currentUserEmail
        const isAssignedToMe = task.assignedTo.email === currentUserEmail
        const isAccepted = task.status === 'inprogress' || task.status === 'completed'
        
        return isCreatedByMe || (isAssignedToMe && isAccepted)
      })
      
      setTasks(filteredTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks')
      setError('Failed to load tasks')
    }
  }, [onLogout, currentUserEmail])

  useEffect(() => {
    if (currentUserEmail) {
      fetchTasks()
    }
  }, [currentUserEmail, fetchTasks])

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const handleCreateTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setIsFormOpen(false)
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create task')
      setError(error instanceof Error ? error.message : 'Failed to create task')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleUpdateTask = async (taskData: Omit<Task, '_id'>) => {
    if (!editingTask) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`${API_URL}/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update task')
      }

      const updatedTask = await response.json()
      
      setTasks(tasks.map((task) =>
        task._id === editingTask._id ? updatedTask : task
      ))
      setEditingTask(null)
      setIsFormOpen(false)
      toast.success('Task updated successfully')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update task')
      setError(error instanceof Error ? error.message : 'Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }

      setTasks(tasks.filter(task => task._id !== id))
      toast.success('Task deleted successfully')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete task')
      setError(error instanceof Error ? error.message : 'Failed to delete task')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filter.status === 'all' || task.status === filter.status
    const matchesPriority = filter.priority === 'all' || task.priority === filter.priority
    
    const taskDueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let matchesDueDate = true;
    if (filter.dueDate !== 'all') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (filter.dueDate) {
        case 'today':
          matchesDueDate = taskDueDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          matchesDueDate = taskDueDate.toDateString() === tomorrow.toDateString();
          break;
        case 'thisWeek':
          matchesDueDate = taskDueDate >= today && taskDueDate <= nextWeek;
          break;
        case 'overdue':
          matchesDueDate = taskDueDate < today && task.status !== 'completed' && task.status !== 'rejected';
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate
  })

  // Separate tasks into assigned and created
  const assignedTasks = filteredTasks.filter(task => 
    task.assignedTo.email === currentUserEmail && 
    task.assignedBy.email !== currentUserEmail
  )

  const createdTasks = filteredTasks.filter(task => 
    task.assignedBy.email === currentUserEmail
  )

  // Get overdue tasks (due date is in the past and not completed)
  const overdueTasks = filteredTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
    return dueDate < today && task.status !== 'completed' && task.status !== 'rejected';
  });

  const handleTaskSubmit = editingTask ? handleUpdateTask : handleCreateTask

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} onTaskUpdate={fetchTasks} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Task Dashboard</h1>
              <button
                onClick={() => {
                  setEditingTask(null)
                  setIsFormOpen(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError('')}
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex space-x-4 mb-4">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={filter.dueDate}
                onChange={(e) => setFilter({ ...filter, dueDate: e.target.value })}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Due Dates</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="thisWeek">Due This Week</option>
                <option value="overdue">Overdue</option>
              </select>

              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded px-3 py-1 flex-1"
              />
            </div>

            {/* Overdue Tasks Section */}
            {overdueTasks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-red-600">⚠️ Overdue Tasks</h2>
                <div className="grid gap-4">
                  {overdueTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      currentUserEmail={currentUserEmail}
                      onTaskUpdate={fetchTasks}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Tasks Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Assigned to Me</h2>
              <div className="grid gap-4">
                {assignedTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    currentUserEmail={currentUserEmail}
                    onTaskUpdate={fetchTasks}
                  />
                ))}
                {assignedTasks.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No tasks assigned to you
                  </div>
                )}
              </div>
            </div>

            {/* Created Tasks Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Created by Me</h2>
              <div className="grid gap-4">
                {createdTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    currentUserEmail={currentUserEmail}
                    onTaskUpdate={fetchTasks}
                  />
                ))}
                {createdTasks.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No tasks created by you
                  </div>
                )}
              </div>
            </div>
          </div>

          {isFormOpen && (
            <TaskForm
              task={editingTask || undefined}
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingTask(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
