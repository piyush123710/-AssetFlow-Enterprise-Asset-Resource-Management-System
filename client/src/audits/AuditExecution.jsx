import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const AuditExecution = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  useEffect(() => {
    fetchAudit();
  }, [id]);

  const fetchAudit = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/audits/${id}`);
      setAudit(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    try {
      // Get all assets to add to audit
      const res = await axios.get('http://localhost:5000/api/assets?limit=100');
      // Filter out assets already in this audit
      const existingAssetIds = audit.items.map(i => i.assetId);
      const filtered = res.data.data.filter(a => !existingAssetIds.includes(a.id));
      setAvailableAssets(filtered);
      setShowAddModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    try {
      await axios.post(`http://localhost:5000/api/audits/${id}/items`, { assetId: selectedAssetId });
      setShowAddModal(false);
      setSelectedAssetId('');
      fetchAudit(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding asset to audit');
    }
  };

  const updateItemStatus = async (itemId, status) => {
    const notes = window.prompt(`Enter notes for marking as ${status} (Optional):`, "");
    if (notes === null) return; // cancelled

    try {
      await axios.put(`http://localhost:5000/api/audits/items/${itemId}`, { status, notes });
      fetchAudit();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating audit item');
    }
  };

  if (loading) return <div className="text-white text-center p-12">Loading...</div>;
  if (!audit) return <div className="text-white text-center p-12">Audit not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <Link to="/audits" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">&larr; Back to Audits</Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">{audit.name}</h1>
            <p className="text-gray-400 mt-1">Status: <span className="text-blue-400 font-semibold">{audit.status}</span></p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
              onClick={openAddModal}
              disabled={audit.status !== 'IN_PROGRESS'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50"
            >
              + Add Asset to Audit
            </button>
          </div>
        </div>

        {/* Audit Items Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">System Location</th>
                  <th className="px-6 py-4 font-medium">System Status</th>
                  <th className="px-6 py-4 font-medium">Audit Status</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                  <th className="px-6 py-4 font-medium text-right">Auditor Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {audit.items.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No assets have been added to this audit cycle yet.</td></tr>
                ) : (
                  audit.items.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{item.asset.name}</div>
                        <div className="text-xs font-mono text-blue-400">{item.asset.assetTag}</div>
                      </td>
                      <td className="px-6 py-4">{item.asset.location || '-'}</td>
                      <td className="px-6 py-4">{item.asset.status}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          item.status === 'PENDING' ? 'bg-gray-500/20 text-gray-400' :
                          item.status === 'FOUND' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'MISSING' ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400' // DAMAGED
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 italic text-gray-400 max-w-xs truncate">{item.notes || '-'}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => updateItemStatus(item.id, 'FOUND')}
                          className="text-green-400 hover:text-green-300 transition-colors mr-3 font-medium"
                        >
                          Found
                        </button>
                        <button 
                          onClick={() => updateItemStatus(item.id, 'MISSING')}
                          className="text-red-400 hover:text-red-300 transition-colors mr-3 font-medium"
                        >
                          Missing
                        </button>
                        <button 
                          onClick={() => updateItemStatus(item.id, 'DAMAGED')}
                          className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                        >
                          Damaged
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Add Asset to Audit</h3>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
                  <select 
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">-- Choose Asset --</option>
                    {availableAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg transition-colors"
                  >
                    Add to Audit
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

export default AuditExecution;
