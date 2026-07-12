import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const MaintenanceRequest = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    issueDescription: '',
    estimatedCost: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Ideally fetch all assets for admin, or just allocated assets for employee.
        // For simplicity in this demo, let's fetch all assets so we can select one.
        const res = await axios.get('http://localhost:5000/api/assets?limit=100');
        setAssets(res.data.data);
        
        // If an asset ID was passed via state (e.g. from directory), pre-select it
        if (location.state?.assetId) {
          setFormData(prev => ({ ...prev, assetId: location.state.assetId }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssets();
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/maintenance', formData);
      alert('Maintenance request submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error reporting issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Report Issue</h1>
            <p className="text-gray-400 mt-1">Log a maintenance request for a broken or faulty asset</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
              <select 
                required
                value={formData.assetId}
                onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">-- Choose an asset --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag}) - Status: {asset.status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Issue Description</label>
              <textarea 
                required
                value={formData.issueDescription}
                onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                placeholder="Describe what is wrong with the asset..."
                rows="4"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Cost (Optional)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                placeholder="e.g. 150.00"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.assetId || !formData.issueDescription}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Maintenance Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default MaintenanceRequest;
