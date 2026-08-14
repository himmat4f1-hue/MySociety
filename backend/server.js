const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { setupGuestCleanupJob } = require('./utils/cleanupGuestSandboxes');

// Initialize database connection
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

setupGuestCleanupJob();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'MySociety API running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dev', require('./routes/devRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
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
app.use('/api/gate-passes', require('./routes/gatePassRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/supplies', require('./routes/supplyRoutes'));
app.use('/api/leases', require('./routes/leaseRoutes'));
app.use('/api/flat-owners', require('./routes/flatOwnerRoutes'));
app.use('/api/family-members', require('./routes/familyMemberRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/home-services', require('./routes/homeServiceRoutes'));
app.use('/api/role-checklists', require('./routes/roleChecklistRoutes'));
app.use('/api/agenda-items', require('./routes/agendaItemRoutes'));
app.use('/api/meeting-attendance', require('./routes/meetingAttendanceRoutes'));
app.use('/api/committee-votes', require('./routes/committeeVoteRoutes'));
app.use('/api/management-votes', require('./routes/managementVoteRoutes'));
app.use('/api/society-structure', require('./routes/societyStructureRoutes'));
app.use('/api/rules', require('./routes/ruleRoutes'));
app.use('/api/service-providers', require('./routes/serviceProviderContactRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/amenity-usage', require('./routes/amenityUsageLogRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/insurance', require('./routes/insurancePolicyRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/support-tickets', require('./routes/supportTicketRoutes'));
app.use('/api/legal-compliance', require('./routes/legalComplianceRoutes'));
app.use('/api/audit-log', require('./routes/activityLogRoutes'));
app.use('/api/utility-readings', require('./routes/utilityReadingRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MySociety API server running on port ${PORT}`));
