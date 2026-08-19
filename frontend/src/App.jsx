import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import ContactUs from './pages/public/ContactUs';
import PlansOffers from './pages/public/PlansOffers';
import Login from './pages/Login';
import SeedDatabase from './pages/SeedDatabase';

import Dashboard from './pages/Dashboard';
import MyDues from './pages/MyDues';
import ListPropertyForSale from './pages/ListPropertyForSale';
import Residents from './pages/Residents';
import Units from './pages/Units';
import Finance from './pages/FinanceHub';
import Visitors from './pages/VisitorsHub';
import Complaints from './pages/Complaints';
import Maintenance from './pages/Maintenance';
import Notices from './pages/Notices';
import Amenities from './pages/Amenities';
import Meetings from './pages/Meetings';
import Voting from './pages/VotingHub';
import Emergency from './pages/Emergency';
// CameraRequests page retired - merged into Complaints & Requests (category="Camera")
import CelebrationDonation from './pages/CelebrationDonation';
import Settings from './pages/Settings';
import Shifts from './pages/Shifts';
import Tasks from './pages/Tasks';
import Supplies from './pages/Supplies';
import Leases from './pages/Leases';
import Pets from './pages/Pets';
import FlatOwners from './pages/FlatOwners';
import FamilyMembers from './pages/FamilyMembers';
import Vehicles from './pages/VehiclesHub';
import HomeServices from './pages/HomeServices';
import RoleChecklistPage from './pages/RoleChecklistPage';
import Rules from './pages/GovernanceHub';
import ServiceProviders from './pages/ServiceProviders';
import Inventory from './pages/Inventory';
import InsurancePolicies from './pages/InsurancePolicies';
import FeedbackPage from './pages/Feedback';
import SupportTickets from './pages/SupportTickets';
import LegalCompliancePage from './pages/LegalCompliance';
import AuditLog from './pages/AuditLog';
import UtilityReadings from './pages/UtilityReadings';
// MeetingAttendancePage & AgendaItems retired - consolidated into the
// Meetings page itself (per-meeting cards + detail view with voting).
// Elections merged into Voting & Elections (VotingHub) - no separate import.
import SocietyStructure from './pages/SocietyStructure';

function App() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/plans" element={<PlansOffers />} />
      <Route path="/login" element={<Login />} />
      <Route path="/seed-database" element={<SeedDatabase />} />

      {/* Protected app (multi-tenant, under /app) */}
      <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/my-dues" element={<ProtectedRoute roles={['resident', 'tenant']}><MyDues /></ProtectedRoute>} />
      <Route path="/app/list-property" element={<ProtectedRoute roles={['resident', 'tenant']}><ListPropertyForSale /></ProtectedRoute>} />
      <Route path="/app/residents" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Residents /></ProtectedRoute>} />
      <Route path="/app/units" element={<ProtectedRoute roles={['secretary', 'chairman']}><Units /></ProtectedRoute>} />
      <Route path="/app/finance" element={<ProtectedRoute roles={['accountant', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Finance /></ProtectedRoute>} />
      {/* Financial Statements, Investments & Assets, and Reports merged into
          the Finance page as tabs - old links redirect there. */}
      <Route path="/app/financial-statements" element={<Navigate to="/app/finance" replace />} />
      <Route path="/app/investments" element={<Navigate to="/app/finance" replace />} />
      <Route path="/app/reports" element={<Navigate to="/app/finance" replace />} />
      <Route path="/app/visitors" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'resident', 'tenant']}><Visitors /></ProtectedRoute>} />
      {/* Gate Passes merged into Visitors as a tab - old links redirect there. */}
      <Route path="/app/gate-passes" element={<Navigate to="/app/visitors" replace />} />
      <Route path="/app/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/app/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/app/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="/app/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
      <Route path="/app/meetings" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Meetings /></ProtectedRoute>} />
      <Route path="/app/voting" element={<ProtectedRoute roles={['resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Voting /></ProtectedRoute>} />
      {/* Elections merged into Voting as a tab - old links redirect there. */}
      <Route path="/app/elections" element={<Navigate to="/app/voting" replace />} />
      <Route path="/app/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
      {/* Camera Requests merged into Complaints & Requests - old links still land somewhere sensible */}
      <Route path="/app/camera-requests" element={<Navigate to="/app/complaints" replace />} />
      {/* Society Policies and Documents merged into "Rules, Policies &
          Documents" (still at /app/rules) as tabs - old links redirect there. */}
      <Route path="/app/policies" element={<Navigate to="/app/rules" replace />} />
      <Route path="/app/documents" element={<Navigate to="/app/rules" replace />} />
      {/* "Funds" and the old separate "Celebration & Donation" menu were
          merged into one - CelebrationDonation.jsx already manages
          Celebration-type funds end-to-end, so a second generic Funds CRUD
          page was redundant. /app/funds is now the merged page's path;
          /app/celebration-donation redirects here for anyone with an old
          bookmark/link. */}
      <Route path="/app/funds" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><CelebrationDonation /></ProtectedRoute>} />
      <Route path="/app/celebration-donation" element={<Navigate to="/app/funds" replace />} />
      <Route path="/app/settings" element={<ProtectedRoute roles={['secretary', 'chairman']}><Settings /></ProtectedRoute>} />
      <Route path="/app/society-structure" element={<ProtectedRoute roles={['chairman', 'secretary']}><SocietyStructure /></ProtectedRoute>} />
      <Route path="/app/shifts" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'housekeeping']}><Shifts /></ProtectedRoute>} />
      <Route path="/app/tasks" element={<ProtectedRoute roles={['secretary', 'chairman', 'housekeeping']}><Tasks /></ProtectedRoute>} />
      <Route path="/app/supplies" element={<ProtectedRoute roles={['secretary', 'chairman', 'housekeeping']}><Supplies /></ProtectedRoute>} />
      <Route path="/app/leases" element={<ProtectedRoute roles={['secretary', 'chairman', 'committee_member', 'tenant']}><Leases /></ProtectedRoute>} />
      <Route path="/app/pets" element={<ProtectedRoute roles={['security', 'resident', 'secretary', 'chairman', 'committee_member', 'tenant']}><Pets /></ProtectedRoute>} />
      <Route path="/app/flat-owners" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><FlatOwners /></ProtectedRoute>} />
      <Route path="/app/family-members" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><FamilyMembers /></ProtectedRoute>} />
      <Route path="/app/vehicles" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant', 'housekeeping']}><Vehicles /></ProtectedRoute>} />
      {/* Parking merged into Vehicle Data as a tab - old links redirect there. */}
      <Route path="/app/parking" element={<Navigate to="/app/vehicles" replace />} />
      <Route path="/app/home-services" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><HomeServices /></ProtectedRoute>} />
      <Route path="/app/role-checklist" element={<ProtectedRoute><RoleChecklistPage /></ProtectedRoute>} />
      <Route path="/app/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
      <Route path="/app/service-providers" element={<ProtectedRoute><ServiceProviders /></ProtectedRoute>} />
      <Route path="/app/inventory" element={<ProtectedRoute roles={['secretary', 'chairman', 'treasurer', 'committee_member']}><Inventory /></ProtectedRoute>} />
      <Route path="/app/insurance" element={<ProtectedRoute roles={['secretary', 'chairman', 'treasurer', 'committee_member']}><InsurancePolicies /></ProtectedRoute>} />
      <Route path="/app/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="/app/support-tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
      <Route path="/app/legal-compliance" element={<ProtectedRoute roles={['secretary', 'chairman', 'treasurer', 'committee_member']}><LegalCompliancePage /></ProtectedRoute>} />
      <Route path="/app/audit-log" element={<ProtectedRoute roles={['secretary', 'chairman']}><AuditLog /></ProtectedRoute>} />
      <Route path="/app/utility-readings" element={<ProtectedRoute roles={['secretary', 'chairman', 'treasurer', 'committee_member']}><UtilityReadings /></ProtectedRoute>} />
      {/* Meeting Attendance & Agenda Items merged into Meetings - old links redirect there */}
      <Route path="/app/meeting-attendance" element={<Navigate to="/app/meetings" replace />} />
      <Route path="/app/agenda-items" element={<Navigate to="/app/meetings" replace />} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
