import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './dashboard/Dashboard';
import Departments from './organization/Departments';
import Employees from './organization/Employees';
import Categories from './organization/Categories';
import RegisterAsset from './assets/RegisterAsset';
import AssetDirectory from './assets/AssetDirectory';
import MyAssets from './assets/MyAssets';
import TransferRequests from './assets/TransferRequests';
import BookResource from './bookings/BookResource';
import MyBookings from './bookings/MyBookings';
import BookingApprovals from './bookings/BookingApprovals';
import MaintenanceRequest from './maintenance/MaintenanceRequest';
import MaintenanceQueue from './maintenance/MaintenanceQueue';
import AuditCycles from './audits/AuditCycles';
import AuditExecution from './audits/AuditExecution';
import ReportsDashboard from './reports/ReportsDashboard';
import ActivityLogs from './activity/ActivityLogs';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/assets" element={<AssetDirectory />} />
            <Route path="/assets/register" element={<RegisterAsset />} />
            <Route path="/assets/my-assets" element={<MyAssets />} />
            <Route path="/assets/transfers" element={<TransferRequests />} />
            <Route path="/bookings/book" element={<BookResource />} />
            <Route path="/bookings/my" element={<MyBookings />} />
            <Route path="/bookings/approvals" element={<BookingApprovals />} />
            <Route path="/maintenance/request" element={<MaintenanceRequest />} />
            <Route path="/maintenance/queue" element={<MaintenanceQueue />} />
            <Route path="/audits" element={<AuditCycles />} />
            <Route path="/audits/:id" element={<AuditExecution />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/activity" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
