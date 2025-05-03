'use client'

import React, { useEffect, useState, useCallback } from 'react'
import TaskCard from '../tasks/TaskCard'
import TaskForm from '../tasks/TaskForm'
import Navbar from '../navigation/Navbar'

interface Task {
  _id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'completed'
  assignedTo: string
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [error, setError] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
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
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      setError('Failed to load tasks')
    }
  }, [onLogout])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreateTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
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

      if (!response.ok) throw new Error('Failed to create task')
      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
      setError('Failed to create task')
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

      const response = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
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

      if (!response.ok) throw new Error('Failed to update task')
      const updatedTask = await response.json()
      
      setTasks(tasks.map((task) =>
        task._id === editingTask._id ? updatedTask : task
      ))
      setEditingTask(null)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to update task:', error)
      setError('Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        onLogout()
        return
      }

      if (!response.ok) throw new Error('Failed to delete task')
      setTasks(tasks.filter(task => task._id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
      setError('Failed to delete task')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filter.status === 'all' || task.status === filter.status
    const matchesPriority = filter.priority === 'all' || task.priority === filter.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Task Dashboard</h1>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Task
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
              <button
                className="absolute top-0 bottom-0 right-0 px-4"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              className="p-2 border rounded-md flex-grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="p-2 border rounded-md"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option key="all" value="all">All Status</option>
              <option key="todo" value="todo">Todo</option>
              <option key="in-progress" value="in-progress">In Progress</option>
              <option key="completed" value="completed">Completed</option>
            </select>
            <select
              className="p-2 border rounded-md"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            >
              <option key="all" value="all">All Priority</option>
              <option key="low" value="low">Low</option>
              <option key="medium" value="medium">Medium</option>
              <option key="high" value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No tasks found
            </div>
          )}
        </div>

        {isFormOpen && (
          <TaskForm
            task={editingTask || undefined}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingTask(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
