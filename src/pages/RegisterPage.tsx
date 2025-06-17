import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL params for vendor type
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'vendor') {
      setRole('vendor');
    }
  }, [location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await register(email, password, name, role);
      
      if (error) {
        setError(error.message || 'Failed to register. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
        {/* Image Section */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: `url('https://images.pexels.com/photos/7172698/pexels-photo-7172698.jpeg')` }}>
          <div className="h-full bg-gradient-to-r from-purple-900/60 to-purple-700/40 flex flex-col justify-between p-8">
            <div>
              <h2 className="text-white text-3xl font-bold">
                {role === 'vendor' ? 'Grow Your Business' : 'Plan Amazing Events'}
              </h2>
              <p className="text-purple-100 mt-2">
                {role === 'vendor' 
                  ? 'Join our network of top event vendors and reach more clients' 
                  : 'Sign up to find the perfect vendors for your events'
                }
              </p>
            </div>
            <div className="text-white">
              <p className="mb-4 text-lg">Why choose AllInEvent:</p>
              <ul className="space-y-2">
                {role === 'vendor' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>Get discovered by more potential clients</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>Manage all your bookings in one place</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>Built-in calendar and CRM tools</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>AI-powered vendor search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>Find vendors that match your exact needs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>Verified vendor reviews</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <motion.div 
          className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 md:p-12"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {role === 'vendor'
                ? 'Register as a vendor to showcase your services'
                : 'Sign up to start planning your next event'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a:
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  className={`flex-1 py-2.5 px-4 text-sm font-medium transition ${
                    role === 'customer'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setRole('customer')}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 px-4 text-sm font-medium transition ${
                    role === 'vendor'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setRole('vendor')}
                >
                  Vendor
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {role === 'vendor' ? 'Business Name' : 'Full Name'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {role === 'vendor' ? <Building size={18} /> : <User size={18} />}
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder={role === 'vendor' ? 'Your Business Name' : 'Your Full Name'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 flex justify-center items-center gap-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition mt-6 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800 dark:hover:text-purple-300">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;