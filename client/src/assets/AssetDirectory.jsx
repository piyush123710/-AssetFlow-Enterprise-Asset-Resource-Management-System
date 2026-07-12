import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AllocateModal from './AllocateModal';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Asset Directory</h1>
            <p className="text-gray-400 mt-1">Browse and search organization resources</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
              Dashboard
            </Link>
            {canManage && (
              <Link to="/assets/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg">
                + Register Asset
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <input 
            type="text" 
            placeholder="Search by name, tag, or serial..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
          />
          <select 
            value={categoryId} 
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset Tag</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading assets...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No assets found matching criteria.</td></tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{asset.assetTag}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                      <td className="px-6 py-4 text-gray-400">{asset.category?.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-400">{asset.location || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          asset.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                          asset.status === 'ALLOCATED' ? 'bg-yellow-500/20 text-yellow-400' :
                          asset.status === 'MAINTENANCE' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors mr-3">View</button>
                        {canManage && asset.status === 'AVAILABLE' && (
                          <button 
                            onClick={() => setAllocatingAsset(asset)}
                            className="text-green-400 hover:text-green-300 transition-colors mr-3"
                          >
                            Allocate
                          </button>
                        )}
                        {canManage && <button className="text-gray-400 hover:text-white transition-colors">Edit</button>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="bg-black/20 p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing {(meta.currentPage - 1) * meta.itemsPerPage + 1} to {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} of {meta.totalItems} entries
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

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
