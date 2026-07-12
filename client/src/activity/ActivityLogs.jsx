import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/activity?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'text-green-400 bg-green-400/10';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'text-red-400 bg-red-400/10';
    if (action.includes('UPDATE') || action.includes('RESOLVE') || action.includes('APPROVE')) return 'text-blue-400 bg-blue-400/10';
    if (action.includes('REPORT') || action.includes('AUDIT')) return 'text-orange-400 bg-orange-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Activity Logs</h1>
            <p className="text-gray-400 mt-1">Audit trail of all actions performed in AssetFlow</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        {/* Timeline */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl min-h-[500px]">
          {loading && logs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No activity logs found.</div>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{log.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      <pre className="whitespace-pre-wrap font-sans bg-black/20 p-3 rounded-lg border border-white/5 mt-2">
                        {log.details}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ActivityLogs;
