const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    area: { type: String, required: true }, // Lobby, Tower A Corridor, Club House, Garden, etc.
    assignedTo: { type: String, default: '' },
    frequency: { type: String, enum: ['Daily', 'Weekly', 'One-time'], default: 'Daily' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    dueDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
