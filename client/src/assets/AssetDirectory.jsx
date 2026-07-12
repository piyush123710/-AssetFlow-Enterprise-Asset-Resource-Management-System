import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AllocateModal from './AllocateModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const AssetDirectory = () => {
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [allocatingAsset, setAllocatingAsset] = useState(null);

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status && { status }),
        ...(categoryId && { categoryId })
      });
      const res = await axios.get(`http://localhost:5000/api/assets?${params.toString()}`);
      setAssets(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-8 relative z-10"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit mb-1">Asset Directory</h1>
            <p className="text-gray-400 text-sm">Browse and search organization resources</p>
          </div>
          <div className="flex space-x-4 mt-6 md:mt-0">
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            {canManage && (
              <Link to="/assets/register">
                <Button>+ Register Asset</Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="p-5 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Input 
              type="text" 
              placeholder="Search by name, tag, or serial..."
              value={search}
              onChange={handleSearchChange}
              className="flex-1"
            />
          <select 
            value={categoryId} 
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="flex h-11 w-full md:w-48 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all shadow-inner"
          >
            <option value="" className="bg-slate-900">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="flex h-11 w-full md:w-48 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all shadow-inner"
            >
              <option value="" className="bg-slate-900">All Statuses</option>
              <option value="AVAILABLE" className="bg-slate-900">AVAILABLE</option>
              <option value="ALLOCATED" className="bg-slate-900">ALLOCATED</option>
              <option value="MAINTENANCE" className="bg-slate-900">MAINTENANCE</option>
              <option value="RETIRED" className="bg-slate-900">RETIRED</option>
            </select>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden p-0 border-0">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-gray-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-5">Asset Tag</th>
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading assets...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No assets found matching criteria.</td></tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono">{asset.assetTag}</Badge>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                      <td className="px-6 py-4 text-gray-400">{asset.category?.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-400">{asset.location || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          asset.status === 'AVAILABLE' ? 'success' :
                          asset.status === 'ALLOCATED' ? 'warning' :
                          asset.status === 'MAINTENANCE' ? 'destructive' :
                          'secondary'
                        }>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-400 hover:text-indigo-300 transition-colors mr-4 font-medium opacity-0 group-hover:opacity-100">View</button>
                        {canManage && asset.status === 'AVAILABLE' && (
                          <button 
                            onClick={() => setAllocatingAsset(asset)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors mr-4 font-medium opacity-0 group-hover:opacity-100"
                          >
                            Allocate
                          </button>
                        )}
                        {canManage && <button className="text-gray-400 hover:text-white transition-colors font-medium opacity-0 group-hover:opacity-100">Edit</button>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="bg-black/20 p-5 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing <span className="text-white font-medium">{(meta.currentPage - 1) * meta.itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)}</span> of <span className="text-white font-medium">{meta.totalItems}</span> entries
              </div>
              <div className="flex space-x-2">
                <Button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </Card>
        </motion.div>

      </motion.div>

      {allocatingAsset && (
        <AllocateModal 
          asset={allocatingAsset} 
          onClose={() => setAllocatingAsset(null)}
          onAllocated={() => {
            setAllocatingAsset(null);
            fetchAssets();
          }}
        />
      )}
    </div>
  );
};

export default AssetDirectory;
