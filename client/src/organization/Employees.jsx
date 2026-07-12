import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/departments')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole });
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6">
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Directory</h1>
          <p className="text-gray-400 mt-1">Manage personnel and roles</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/20 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{emp.name}</td>
                      <td className="px-6 py-4">{emp.email}</td>
                      <td className="px-6 py-4">{emp.department?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <select
                            value={emp.role}
                            onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                            className="bg-black/30 border border-gray-600 rounded-lg text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                            <option value="ASSET_MANAGER">ASSET MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs font-semibold">
                            {emp.role}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Employees;
