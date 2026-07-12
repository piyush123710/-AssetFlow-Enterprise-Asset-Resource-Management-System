import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegisterAsset = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccessData(null);
    try {
      const response = await axios.post('http://localhost:5000/api/assets/register', data);
      setSuccessData(response.data);
      reset(); // clear form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Register New Asset</h1>
            <p className="text-gray-400 mt-1">Add a new resource to the organization</p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Asset Name</label>
                  <input 
                    type="text" 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="MacBook Pro M3"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select 
                    {...register('categoryId', { required: 'Category is required' })}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                  <input 
                    type="text" 
                    {...register('serialNumber')}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="SN-12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Purchase Date</label>
                  <input 
                    type="date" 
                    {...register('purchaseDate')}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    {...register('cost')}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="1999.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
                  <select 
                    {...register('condition')}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input 
                    type="text" 
                    {...register('location')}
                    className="w-full px-4 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500"
                    placeholder="HQ - Room 402"
                  />
                </div>

                <div className="flex items-center space-x-3 mt-8">
                  <input 
                    type="checkbox" 
                    {...register('isShared')}
                    className="h-5 w-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-black/20"
                  />
                  <label className="text-sm font-medium text-gray-300">This is a shared resource (bookable)</label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>

          {/* Success Banner / QR Code */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
            {successData ? (
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Registered Successfully!</h3>
                <p className="text-gray-400 mb-6">Asset Tag: <strong className="text-white">{successData.assetTag}</strong></p>
                
                <div className="bg-white p-2 rounded-xl inline-block mb-4">
                  <img src={successData.qrCodeUrl} alt="Asset QR Code" className="w-48 h-48" />
                </div>
                
                <p className="text-xs text-gray-500">Scan QR to view asset details</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                <p>Register an asset to generate its unique Tag & QR Code.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterAsset;
