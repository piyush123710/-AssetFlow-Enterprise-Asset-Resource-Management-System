import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllocateModal = ({ asset, onClose, onAllocated }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/allocations', {
        assetId: asset.id,
        userId: selectedUserId
      });
      onAllocated();
    } catch (err) {
      alert(err.response?.data?.message || 'Error allocating asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">Allocate Asset</h3>
          <p className="text-gray-400 text-sm mb-6">Assigning <strong className="text-white">{asset.name}</strong> ({asset.assetTag}) to an employee.</p>
          
          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Employee</label>
              <select 
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">-- Choose Employee --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !selectedUserId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Allocating...' : 'Allocate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AllocateModal;
