const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // Plumbing, Electrical, Lift, AC/HVAC, Gardening, Others
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Overdue'], default: 'Open' },
    flatNo: { type: String, required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: String, default: '' },
    raisedOn: { type: Date, default: Date.now },
    completedOn: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
