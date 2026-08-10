import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyDues from './pages/MyDues';
import Residents from './pages/Residents';
import Units from './pages/Units';
import Finance from './pages/Finance';
import Visitors from './pages/Visitors';
import Complaints from './pages/Complaints';
import Maintenance from './pages/Maintenance';
import Notices from './pages/Notices';
import Amenities from './pages/Amenities';
import Documents from './pages/Documents';
import Meetings from './pages/Meetings';
import Voting from './pages/Voting';
import Emergency from './pages/Emergency';
import CameraRequests from './pages/CameraRequests';
import Policies from './pages/Policies';
import Investments from './pages/Investments';
import Funds from './pages/Funds';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import GatePasses from './pages/GatePasses';
import Shifts from './pages/Shifts';
import Tasks from './pages/Tasks';
import Supplies from './pages/Supplies';
import Leases from './pages/Leases';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-dues" element={<ProtectedRoute roles={['resident', 'tenant']}><MyDues /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Residents /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman']}><Units /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Finance /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'tenant']}><Visitors /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman', 'accountant', 'treasurer', 'committee_member']}><Documents /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute roles={['admin', 'security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Meetings /></ProtectedRoute>} />
      <Route path="/voting" element={<ProtectedRoute roles={['admin', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Voting /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
      <Route path="/camera-requests" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'resident', 'treasurer', 'committee_member', 'tenant']}><CameraRequests /></ProtectedRoute>} />
      <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
      <Route path="/investments" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member']}><Investments /></ProtectedRoute>} />
      <Route path="/funds" element={<ProtectedRoute roles={['admin', 'security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant']}><Funds /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman', 'treasurer']}><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
      <Route path="/gate-passes" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'resident', 'tenant']}><GatePasses /></ProtectedRoute>} />
      <Route path="/shifts" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'housekeeping']}><Shifts /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman', 'housekeeping']}><Tasks /></ProtectedRoute>} />
      <Route path="/supplies" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman', 'housekeeping']}><Supplies /></ProtectedRoute>} />
      <Route path="/leases" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman', 'committee_member', 'tenant']}><Leases /></ProtectedRoute>} />

      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
