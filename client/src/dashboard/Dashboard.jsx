import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Notifications from '../components/Notifications';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon, color }) => (
  <Card className="hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
    <CardContent className="p-6 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-500"></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-2 font-outfit">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-black/20`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard/stats'),
          axios.get('http://localhost:5000/api/dashboard/charts')
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-10 relative z-10"
      >
        
        {/* Top Header Card */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-center bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="w-full lg:w-auto mb-6 lg:mb-0">
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit mb-1">AssetFlow Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Welcome back, <span className="font-semibold text-white">{user?.name || 'User'}</span> 
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs ml-3 font-medium uppercase tracking-wider border border-indigo-500/20">{user?.role}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
            <Link to="/assets/register" className="shrink-0">
              <Button className="bg-indigo-600 hover:bg-indigo-500">+ Register</Button>
            </Link>
            <Link to="/bookings/book" className="shrink-0">
              <Button className="bg-violet-600 hover:bg-violet-500">Book</Button>
            </Link>
            <Link to="/maintenance/request" className="shrink-0">
              <Button className="bg-orange-600 hover:bg-orange-500">Maintenance</Button>
            </Link>
            
            <div className="h-8 w-px bg-white/10 shrink-0 mx-1"></div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Notifications />
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs (Single Line) */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar border-b border-white/5">
          {[
            { name: 'Directory', path: '/employees' },
            { name: 'Categories', path: '/categories' },
            { name: 'All Assets', path: '/assets' },
            { name: 'My Assets', path: '/assets/my-assets' },
            { name: 'Transfers', path: '/assets/transfers' },
            { name: 'My Bookings', path: '/bookings/my' },
            { name: 'Approvals', path: '/bookings/approvals' },
            { name: 'Maintenance Queue', path: '/maintenance/queue' },
            { name: 'Audits', path: '/audits' },
            { name: 'Reports', path: '/reports' },
            { name: 'Activity', path: '/activity' }
          ].map((link) => (
            <Link key={link.name} to={link.path} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 shrink-0">
              {link.name}
            </Link>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}><StatCard title="Assets Available" value={stats?.availableAssets || 0} color="from-blue-600 to-blue-400 text-white" icon={<span className="text-xl">📦</span>} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Assets Allocated" value={stats?.allocatedAssets || 0} color="from-emerald-600 to-emerald-400 text-white" icon={<span className="text-xl">👤</span>} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Maintenance Today" value={stats?.maintenanceToday || 0} color="from-orange-600 to-orange-400 text-white" icon={<span className="text-xl">🔧</span>} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Pending Bookings" value={stats?.pendingBookings || 0} color="from-violet-600 to-violet-400 text-white" icon={<span className="text-xl">📅</span>} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Upcoming Returns" value={stats?.upcomingReturns || 0} color="from-amber-500 to-yellow-400 text-white" icon={<span className="text-xl">⏳</span>} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Pending Transfers" value={stats?.pendingTransfers || 0} color="from-cyan-600 to-cyan-400 text-white" icon={<span className="text-xl">🔄</span>} /></motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pie Chart */}
          <motion.div variants={itemVariants}>
            <Card className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 font-outfit">Assets by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.assetsByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(charts?.assetsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-6 font-outfit">Department Assets</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.departmentAssets || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    cursor={{fill: '#374151', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  />
                  <Bar dataKey="assets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </motion.div>

          {/* Line Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 font-outfit">Maintenance Requests (6 Months)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.maintenanceGraph || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={3} dot={{r: 6, fill: '#1f2937', stroke: '#ef4444', strokeWidth: 2}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
