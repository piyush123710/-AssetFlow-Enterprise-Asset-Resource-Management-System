import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TransferRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transfers');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/transfers/${id}`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing transfer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Transfer Requests</h1>
            <p className="text-gray-400 mt-1">Review and approve asset transfers</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">From User</th>
                  <th className="px-6 py-4 font-medium">To User</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No transfer requests found.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{req.asset.name}</div>
                        <div className="text-xs font-mono text-blue-400">{req.asset.assetTag}</div>
                      </td>
                      <td className="px-6 py-4">{req.fromUser.name}</td>
                      <td className="px-6 py-4">{req.toUser.name}</td>
                      <td className="px-6 py-4 italic text-gray-400 max-w-xs truncate">{req.reason || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {req.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleResponse(req.id, 'APPROVED')}
                              className="text-green-400 hover:text-green-300 transition-colors mr-3 font-medium"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleResponse(req.id, 'REJECTED')}
                              className="text-red-400 hover:text-red-300 transition-colors font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status !== 'PENDING' && (
                          <span className="text-xs text-gray-500">
                            By: {req.approvedBy?.name || 'Unknown'}
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
    </div>
  );
};

export default TransferRequests;
