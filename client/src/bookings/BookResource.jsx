import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const BookResource = () => {
  const [sharedAssets, setSharedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/shared-assets');
        setSharedAssets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/bookings', formData);
      alert('Booking requested successfully!');
      navigate('/bookings/my');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Book a Resource</h1>
            <p className="text-gray-400 mt-1">Reserve a shared asset (e.g. conference room, projector)</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg">
            Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Resource</label>
              <select 
                required
                value={formData.assetId}
                onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">-- Choose a shared asset --</option>
                {sharedAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>
                ))}
              </select>
              {sharedAssets.length === 0 && (
                <p className="text-xs text-yellow-500 mt-2">No shared resources are currently available.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Purpose of Booking</label>
              <textarea 
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                placeholder="e.g. Quarterly Team Meeting"
                rows="3"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.assetId}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request Booking'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default BookResource;
