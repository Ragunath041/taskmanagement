import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'todo', 'inprogress', 'completed', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String
    }
  },
  assignedBy: {
    email: {
    type: String,
    required: true
    },
    name: {
      type: String
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Task', taskSchema);
