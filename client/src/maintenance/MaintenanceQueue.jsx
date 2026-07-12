import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MaintenanceQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [showModal, setShowModal] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveData, setResolveData] = useState({ resolutionNotes: '', actualCost: '' });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/maintenance');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResolveModal = (id) => {
    setResolvingId(id);
    setResolveData({ resolutionNotes: '', actualCost: '' });
    setShowModal(true);
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/maintenance/${resolvingId}/resolve`, resolveData);
      setShowModal(false);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving issue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance Queue</h1>
            <p className="text-gray-400 mt-1">Manage and resolve reported asset issues</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
              Dashboard
            </Link>
            <Link to="/maintenance/request" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors shadow-lg">
              Report Issue
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Reported By</th>
                  <th className="px-6 py-4 font-medium">Issue</th>
                  <th className="px-6 py-4 font-medium">Est. Cost</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading queue...</td></tr>
                ) : queue.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No maintenance requests found.</td></tr>
                ) : (
                  queue.map(req => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{req.asset.name}</div>
                        <div className="text-xs font-mono text-blue-400">{req.asset.assetTag}</div>
                      </td>
                      <td className="px-6 py-4">{req.reporter?.name}</td>
                      <td className="px-6 py-4 italic text-gray-400 max-w-xs truncate">{req.issueDescription}</td>
                      <td className="px-6 py-4">{req.estimatedCost ? `$${req.estimatedCost}` : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          req.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                          req.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {req.status !== 'COMPLETED' ? (
                          <button 
                            onClick={() => openResolveModal(req.id)}
                            className="text-green-400 hover:text-green-300 transition-colors mr-3 font-medium"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Resolved by {req.resolver?.name}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Resolve Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Resolve Maintenance Issue</h3>
              <form onSubmit={handleResolve} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Notes</label>
                  <textarea 
                    required
                    value={resolveData.resolutionNotes}
                    onChange={(e) => setResolveData({...resolveData, resolutionNotes: e.target.value})}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="Describe how the issue was fixed..."
                    rows="4"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Actual Cost (Optional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={resolveData.actualCost}
                    onChange={(e) => setResolveData({...resolveData, actualCost: e.target.value})}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="e.g. 125.50"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg transition-colors"
                  >
                    Mark as Resolved
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

export default MaintenanceQueue;
