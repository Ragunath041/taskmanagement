import express from 'express';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';

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

// Get all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'email name')
      .populate({
        path: 'task',
        select: 'title description status priority dueDate assignedTo assignedBy'
      });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark notifications as seen
router.post('/mark-seen', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, seen: false },
      { seen: true }
    );
    res.json({ message: 'Notifications marked as seen' });
  } catch (error) {
    console.error('Error marking notifications as seen:', error);
    res.status(500).json({ error: 'Error updating notifications' });
  }
});

export default router; 