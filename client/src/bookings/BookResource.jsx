import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-8 relative z-10"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit mb-1">Book a Resource</h1>
              <p className="text-gray-400 text-sm">Reserve a shared asset (e.g. conference room, projector)</p>
            </div>
            <Link to="/dashboard" className="mt-6 md:mt-0">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Resource</label>
                  <select 
                    required
                    value={formData.assetId}
                    onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all shadow-inner"
                  >
                    <option value="" className="bg-slate-900">-- Choose a shared asset --</option>
                    {sharedAssets.map(asset => (
                      <option key={asset.id} value={asset.id} className="bg-slate-900">{asset.name} ({asset.assetTag})</option>
                    ))}
                  </select>
                  {sharedAssets.length === 0 && (
                    <p className="text-xs text-amber-500 mt-2 flex items-center">
                      <span className="mr-1">⚠️</span> No shared resources are currently available.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                    <Input 
                      type="datetime-local" 
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                    <Input 
                      type="datetime-local" 
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Purpose of Booking</label>
                  <textarea 
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="flex w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all shadow-inner placeholder:text-slate-500"
                    placeholder="e.g. Quarterly Team Meeting"
                    rows="3"
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !formData.assetId}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                >
                  {loading ? 'Submitting...' : 'Request Booking'}
                </Button>
              </form>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default BookResource;
