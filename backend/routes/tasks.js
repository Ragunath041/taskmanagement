import express from 'express';
import Task from '../models/Task.js';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find tasks that are either:
    // 1. Created by the current user
    // 2. Assigned to the current user and accepted (status is 'inprogress' or 'completed')
    const tasks = await Task.find({
      $or: [
        { 'assignedBy.email': currentUser.email },
        {
          'assignedTo.email': currentUser.email,
          status: { $in: ['inprogress', 'completed'] }
        }
      ]
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Get pending tasks for the authenticated user
router.get('/pending', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const tasks = await Task.find({
      'assignedTo.email': currentUser.email,
      status: 'pending'
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    res.status(500).json({ error: 'Error fetching pending tasks' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;
    
    // Validate required fields
    if (!title || !description || !dueDate || !assignedTo?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get current user info
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the assigned user
    const assignedUser = await User.findOne({ email: assignedTo.email });
    if (!assignedUser) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    // Create task with pending status
    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: 'pending', // Set initial status as pending
      assignedTo: {
        email: assignedUser.email,
        name: assignedUser.name
      },
      assignedBy: {
        email: currentUser.email,
        name: currentUser.name
      },
      user: req.userId
    });

    await task.save();

    // Create notification for the assigned user
    const message = `${currentUser.name || currentUser.email} assigned a task to you`;
    await Notification.create({
      recipient: assignedUser._id,
      sender: req.userId,
      task: task._id,
      message,
      seen: false
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    
    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const prevAssignedTo = task.assignedTo;
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    // If assignedTo changed and is not the creator, create notification
    if (assignedTo && assignedTo.email !== prevAssignedTo.email) {
      const recipientUser = await User.findOne({ email: assignedTo.email });
      if (recipientUser) {
        const currentUser = await User.findById(req.userId);
        const message = `${currentUser?.name || currentUser?.email} assigned a task to you`;
        await Notification.create({
          recipient: recipientUser._id,
          sender: req.userId,
          task: task._id,
          message,
          seen: false
        });
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Accept task
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the current user is the assigned user
    const currentUser = await User.findById(req.userId);
    if (task.assignedTo.email !== currentUser.email) {
      return res.status(403).json({ error: 'Not authorized to accept this task' });
    }

    // Update task status to inprogress
    task.status = 'inprogress';
    await task.save();

    // Create notification for the task creator
    const creatorUser = await User.findOne({ email: task.assignedBy.email });
    if (creatorUser) {
      await Notification.create({
        recipient: creatorUser._id,
        sender: req.userId,
        task: task._id,
        message: `${currentUser.name || currentUser.email} has accepted your task`,
        seen: false
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({ error: 'Error accepting task' });
  }
});

// Reject task
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the current user is the assigned user
    const currentUser = await User.findById(req.userId);
    if (task.assignedTo.email !== currentUser.email) {
      return res.status(403).json({ error: 'Not authorized to reject this task' });
    }

    // Update task status to rejected
    task.status = 'rejected';
    await task.save();

    // Create notification for the task creator
    const creatorUser = await User.findOne({ email: task.assignedBy.email });
    if (creatorUser) {
      await Notification.create({
        recipient: creatorUser._id,
        sender: req.userId,
        task: task._id,
        message: `${currentUser.name || currentUser.email} has rejected your task`,
        seen: false
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({ error: 'Error rejecting task' });
  }
});

// Mark task as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the current user is the assigned user
    const currentUser = await User.findById(req.userId);
    if (task.assignedTo.email !== currentUser.email) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    // Update task status to completed
    task.status = 'completed';
    await task.save();

    // Create notification for the task creator
    const creatorUser = await User.findOne({ email: task.assignedBy.email });
    if (creatorUser) {
      await Notification.create({
        recipient: creatorUser._id,
        sender: req.userId,
        task: task._id,
        message: `${currentUser.name || currentUser.email} has completed your task`,
        seen: false
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Error completing task' });
  }
});

export default router;
