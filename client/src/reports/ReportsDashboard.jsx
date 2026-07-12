import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// Simple CSV export utility
const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const ReportsDashboard = () => {
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // Mock data for charts (in a real app, you'd fetch this from the backend)
  const assetStatusData = [
    { name: 'AVAILABLE', value: 45 },
    { name: 'ALLOCATED', value: 80 },
    { name: 'MAINTENANCE', value: 12 },
    { name: 'RETIRED', value: 5 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const maintenanceCostData = [
    { month: 'Jan', cost: 1200 },
    { month: 'Feb', cost: 800 },
    { month: 'Mar', cost: 2100 },
    { month: 'Apr', cost: 450 },
    { month: 'May', cost: 1500 },
    { month: 'Jun', cost: 950 },
  ];

  const handleExportAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await axios.get('http://localhost:5000/api/reports/assets');
      exportToCSV(res.data, 'assets_report.csv');
    } catch (err) {
      alert('Error exporting assets');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleExportMaintenance = async () => {
    setLoadingMaintenance(true);
    try {
      const res = await axios.get('http://localhost:5000/api/reports/maintenance');
      exportToCSV(res.data, 'maintenance_report.csv');
    } catch (err) {
      alert('Error exporting maintenance');
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleExportAudits = async () => {
    setLoadingAudits(true);
    try {
      const res = await axios.get('http://localhost:5000/api/reports/audits');
      exportToCSV(res.data, 'audits_report.csv');
    } catch (err) {
      alert('Error exporting audits');
    } finally {
      setLoadingAudits(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
            <p className="text-gray-400 mt-1">Export organizational data and view insights</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Distribution */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Asset Distribution by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maintenance Costs */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Monthly Maintenance Costs ($)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Exports Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Data Exports (CSV)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-black/20 rounded-xl p-6 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">Assets Report</h4>
              <p className="text-sm text-gray-400 mb-6 flex-1">Complete list of all registered assets, including their categories, locations, and current statuses.</p>
              <button 
                onClick={handleExportAssets}
                disabled={loadingAssets}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loadingAssets ? 'Exporting...' : 'Export Assets CSV'}
              </button>
            </div>

            <div className="bg-black/20 rounded-xl p-6 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">Maintenance Log</h4>
              <p className="text-sm text-gray-400 mb-6 flex-1">Historical records of all maintenance requests, resolutions, and associated repair costs.</p>
              <button 
                onClick={handleExportMaintenance}
                disabled={loadingMaintenance}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loadingMaintenance ? 'Exporting...' : 'Export Maintenance CSV'}
              </button>
            </div>

            <div className="bg-black/20 rounded-xl p-6 border border-white/10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">Audit Results</h4>
              <p className="text-sm text-gray-400 mb-6 flex-1">Detailed results from all compliance audit cycles, including items marked missing or damaged.</p>
              <button 
                onClick={handleExportAudits}
                disabled={loadingAudits}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loadingAudits ? 'Exporting...' : 'Export Audits CSV'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsDashboard;
