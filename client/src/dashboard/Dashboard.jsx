import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AssetFlow Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'User'} ({user?.role})</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Assets Available</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">124</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Assets Allocated</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">86</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
