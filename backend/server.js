const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'MySociety API running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/amenities', require('./routes/amenityRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/emergencies', require('./routes/emergencyRoutes'));
app.use('/api/camera-requests', require('./routes/cameraRequestRoutes'));
app.use('/api/policies', require('./routes/policyRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/funds', require('./routes/fundRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MySociety API server running on port ${PORT}`));
