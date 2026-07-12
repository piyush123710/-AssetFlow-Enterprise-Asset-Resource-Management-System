import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/departments', formData);
      setShowModal(false);
      setFormData({ name: '' });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating department');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Departments</h1>
            <p className="text-gray-400 mt-1">Manage organization departments</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              + Add Department
            </button>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/20 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Head</th>
                  <th className="px-6 py-4 font-medium">Employees</th>
                  {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{dept.name}</td>
                    <td className="px-6 py-4">{dept.head?.name || <span className="text-gray-500 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs font-semibold">
                        {dept._count?.users || 0}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      </td>
                    )}
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                      No departments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Create Department</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="e.g. Engineering"
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg transition-colors"
                  >
                    Save
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

export default Departments;
