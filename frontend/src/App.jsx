import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman']}><Residents /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman']}><Units /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman']}><Finance /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman']}><Visitors /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute roles={['admin', 'secretary', 'chairman', 'accountant']}><Documents /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
      <Route path="/voting" element={<ProtectedRoute><Voting /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
      <Route path="/camera-requests" element={<ProtectedRoute roles={['admin', 'security', 'secretary', 'chairman', 'resident']}><CameraRequests /></ProtectedRoute>} />
      <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
      <Route path="/investments" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman']}><Investments /></ProtectedRoute>} />
      <Route path="/funds" element={<ProtectedRoute><Funds /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin', 'accountant', 'secretary', 'chairman']}><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
