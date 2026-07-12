import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';


const Signup = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden p-10 border border-white/10 relative z-10 my-8"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight font-outfit">Create Account</h2>
          <p className="text-gray-400 mt-3 text-sm font-medium">Join AssetFlow as an Employee</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide group-focus-within:text-indigo-400 transition-colors">Full Name</label>
            <Input 
              type="text" 
              {...register('name', { required: 'Name is required' })}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name.message}</p>}
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide group-focus-within:text-indigo-400 transition-colors">Email Address</label>
            <Input 
              type="email" 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-2">{errors.email.message}</p>}
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide group-focus-within:text-indigo-400 transition-colors">Password</label>
            <Input 
              type="password" 
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs mt-2">{errors.password.message}</p>}
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide group-focus-within:text-indigo-400 transition-colors">Confirm Password</label>
            <Input 
              type="password" 
              {...register('confirmPassword', { 
                validate: value => value === password || 'Passwords do not match'
              })}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-2">{errors.confirmPassword.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6"
            size="lg"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
