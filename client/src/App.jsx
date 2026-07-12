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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
