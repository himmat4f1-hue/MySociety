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
import Finance from './pages/Finance';
import FinancialStatements from './pages/FinancialStatements';
import Visitors from './pages/Visitors';
import Complaints from './pages/Complaints';
import Maintenance from './pages/Maintenance';
import Notices from './pages/Notices';
import Amenities from './pages/Amenities';
import Documents from './pages/Documents';
import Meetings from './pages/Meetings';
import Voting from './pages/Voting';
import Emergency from './pages/Emergency';
// CameraRequests page retired - merged into Complaints & Requests (category="Camera")
import Policies from './pages/Policies';
import Investments from './pages/Investments';
import Funds from './pages/Funds';
import CelebrationDonation from './pages/CelebrationDonation';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import GatePasses from './pages/GatePasses';
import Shifts from './pages/Shifts';
import Tasks from './pages/Tasks';
import Supplies from './pages/Supplies';
import Leases from './pages/Leases';
import Pets from './pages/Pets';
import FlatOwners from './pages/FlatOwners';
import FamilyMembers from './pages/FamilyMembers';
import Vehicles from './pages/Vehicles';
import HomeServices from './pages/HomeServices';
import RoleChecklistPage from './pages/RoleChecklistPage';
import Rules from './pages/Rules';
import ServiceProviders from './pages/ServiceProviders';
import Parking from './pages/Parking';
import Inventory from './pages/Inventory';
import InsurancePolicies from './pages/InsurancePolicies';
import FeedbackPage from './pages/Feedback';
import SupportTickets from './pages/SupportTickets';
import LegalCompliancePage from './pages/LegalCompliance';
import AuditLog from './pages/AuditLog';
import UtilityReadings from './pages/UtilityReadings';
// MeetingAttendancePage & AgendaItems retired - consolidated into the
// Meetings page itself (per-meeting cards + detail view with voting).
import Elections from './pages/Elections';
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
      <Route path="/app/financial-statements" element={<ProtectedRoute roles={['accountant', 'secretary', 'chairman', 'treasurer']}><FinancialStatements /></ProtectedRoute>} />
      <Route path="/app/visitors" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'tenant']}><Visitors /></ProtectedRoute>} />
      <Route path="/app/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/app/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/app/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="/app/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
      <Route path="/app/documents" element={<ProtectedRoute roles={['secretary', 'chairman', 'accountant', 'treasurer', 'committee_member']}><Documents /></ProtectedRoute>} />
      <Route path="/app/meetings" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Meetings /></ProtectedRoute>} />
      <Route path="/app/voting" element={<ProtectedRoute roles={['resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Voting /></ProtectedRoute>} />
      <Route path="/app/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
      {/* Camera Requests merged into Complaints & Requests - old links still land somewhere sensible */}
      <Route path="/app/camera-requests" element={<Navigate to="/app/complaints" replace />} />
      <Route path="/app/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
      <Route path="/app/investments" element={<ProtectedRoute roles={['accountant', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Investments /></ProtectedRoute>} />
      <Route path="/app/funds" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Funds /></ProtectedRoute>} />
      <Route path="/app/celebration-donation" element={<ProtectedRoute roles={['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><CelebrationDonation /></ProtectedRoute>} />
      <Route path="/app/reports" element={<ProtectedRoute roles={['accountant', 'secretary', 'chairman', 'treasurer']}><Reports /></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute roles={['secretary', 'chairman']}><Settings /></ProtectedRoute>} />
      <Route path="/app/society-structure" element={<ProtectedRoute roles={['chairman', 'secretary']}><SocietyStructure /></ProtectedRoute>} />
      <Route path="/app/gate-passes" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'resident', 'tenant']}><GatePasses /></ProtectedRoute>} />
      <Route path="/app/shifts" element={<ProtectedRoute roles={['security', 'secretary', 'chairman', 'housekeeping']}><Shifts /></ProtectedRoute>} />
      <Route path="/app/tasks" element={<ProtectedRoute roles={['secretary', 'chairman', 'housekeeping']}><Tasks /></ProtectedRoute>} />
      <Route path="/app/supplies" element={<ProtectedRoute roles={['secretary', 'chairman', 'housekeeping']}><Supplies /></ProtectedRoute>} />
      <Route path="/app/leases" element={<ProtectedRoute roles={['secretary', 'chairman', 'committee_member', 'tenant']}><Leases /></ProtectedRoute>} />
      <Route path="/app/pets" element={<ProtectedRoute roles={['security', 'resident', 'secretary', 'chairman', 'committee_member', 'tenant']}><Pets /></ProtectedRoute>} />
      <Route path="/app/flat-owners" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><FlatOwners /></ProtectedRoute>} />
      <Route path="/app/family-members" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><FamilyMembers /></ProtectedRoute>} />
      <Route path="/app/vehicles" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><Vehicles /></ProtectedRoute>} />
      <Route path="/app/home-services" element={<ProtectedRoute roles={['secretary', 'chairman', 'resident', 'tenant']}><HomeServices /></ProtectedRoute>} />
      <Route path="/app/role-checklist" element={<ProtectedRoute><RoleChecklistPage /></ProtectedRoute>} />
      <Route path="/app/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
      <Route path="/app/service-providers" element={<ProtectedRoute><ServiceProviders /></ProtectedRoute>} />
      <Route path="/app/parking" element={<ProtectedRoute><Parking /></ProtectedRoute>} />
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
      <Route path="/app/elections" element={<ProtectedRoute roles={['secretary', 'chairman', 'treasurer', 'committee_member', 'resident', 'tenant']}><Elections /></ProtectedRoute>} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
