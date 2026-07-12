import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyAssets = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [users, setUsers] = useState([]);
  const [transferData, setTransferData] = useState({ toUserId: '', reason: '' });

  const { user } = useAuth();

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const fetchMyAssets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/allocations/my');
      setAllocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (allocationId) => {
    if (!window.confirm('Are you sure you want to return this asset?')) return;
    
    try {
      await axios.post(`http://localhost:5000/api/allocations/${allocationId}/return`);
      fetchMyAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning asset');
    }
  };

  const openTransferModal = async (assetId) => {
    setSelectedAssetId(assetId);
    setTransferData({ toUserId: '', reason: '' });
    setShowTransferModal(true);
    
    // Fetch users if not already fetched
    if (users.length === 0) {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        // Filter out current user
        setUsers(res.data.filter(u => u.id !== user.id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/transfers', {
        assetId: selectedAssetId,
        toUserId: transferData.toUserId,
        reason: transferData.reason
      });
      setShowTransferModal(false);
      alert('Transfer request submitted successfully. Awaiting approval.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting transfer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Assets</h1>
            <p className="text-gray-400 mt-1">Resources currently assigned to you</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading your assets...</div>
        ) : allocations.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-xl text-center">
            <h3 className="text-xl text-white font-medium mb-2">No Assets Allocated</h3>
            <p className="text-gray-400">You currently have no resources assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allocations.map(alloc => (
              <div key={alloc.id} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{alloc.asset.name}</h3>
                    <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{alloc.asset.assetTag}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Category: {alloc.asset.category?.name}</p>
                  <p className="text-xs text-gray-500">Allocated on: {new Date(alloc.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-black/20 flex justify-between space-x-2">
                  <button 
                    onClick={() => handleReturn(alloc.id)}
                    className="flex-1 px-3 py-2 bg-orange-600/80 hover:bg-orange-500 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Return
                  </button>
                  <button 
                    onClick={() => openTransferModal(alloc.asset.id)}
                    className="flex-1 px-3 py-2 bg-purple-600/80 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Transfer Request Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Request Transfer</h3>
              <form onSubmit={submitTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transfer To</label>
                  <select 
                    required
                    value={transferData.toUserId}
                    onChange={(e) => setTransferData({...transferData, toUserId: e.target.value})}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">-- Select Employee --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                  <textarea 
                    value={transferData.reason}
                    onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="Why are you transferring this asset?"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg transition-colors"
                  >
                    Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssets;
