import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarRange, ClipboardList, MessageCircle, BarChart, Settings, 
  Image, LogOut, Check, Menu, X, Plus, Calendar, Clock, DollarSign,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

// Dashboard Components
import VendorBookings from '../components/vendor/VendorBookings.tsx';
import VendorCalendar from '../components/vendor/VendorCalendar.tsx';
import VendorServices from '../components/vendor/VendorServices.tsx';
import VendorGallery from '../components/vendor/VendorGallery.tsx';
import VendorMessages from '../components/vendor/VendorMessages.tsx';
import VendorProfile from '../components/vendor/VendorProfile.tsx';
import VendorAnalytics from '../components/vendor/VendorAnalytics.tsx';
import VendorSettings from '../components/vendor/VendorSettings.tsx';
import VendorReviews from '../components/vendor/VendorReviews.tsx';
import VendorFavorites from '../components/vendor/VendorFavorites.tsx';
import { Star, Heart } from 'lucide-react';

const VendorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dashboard links
  const dashboardLinks = [
    { path: '/vendor-dashboard', label: 'Bookings', icon: <CalendarRange size={20} /> },
    { path: '/vendor-dashboard/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { path: '/vendor-dashboard/services', label: 'Services', icon: <ClipboardList size={20} /> },
    { path: '/vendor-dashboard/gallery', label: 'Gallery', icon: <Image size={20} /> },
    { path: '/vendor-dashboard/messages', label: 'Messages', icon: <MessageCircle size={20} /> },
    { path: '/vendor-dashboard/analytics', label: 'Analytics', icon: <BarChart size={20} /> },
    { path: '/vendor-dashboard/profile', label: 'Profile', icon: <Building size={20} /> },
    { path: '/vendor-dashboard/reviews', label: 'Reviews', icon: <Star size={20} /> },
    { path: '/vendor-dashboard/favorites', label: 'Favorites', icon: <Heart size={20} /> },
    { path: '/vendor-dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/vendor-dashboard') {
      return location.pathname === '/vendor-dashboard';
    }
    return location.pathname.startsWith(path);
  };
  
  // Close sidebar when changing routes on mobile
  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };
  
  // Mock data for dashboard stats
  const stats = [
    { label: 'Total Bookings', value: '48', icon: <CalendarRange size={20} className="text-purple-600 dark:text-purple-400" /> },
    { label: 'Pending Requests', value: '12', icon: <Clock size={20} className="text-amber-600 dark:text-amber-400" /> },
    { label: 'Revenue this Month', value: '₹86,500', icon: <DollarSign size={20} className="text-green-600 dark:text-green-400" /> },
    { label: 'Avg. Rating', value: '4.8', icon: <Check size={20} className="text-teal-600 dark:text-teal-400" /> },
  ];
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Sidebar */}
          <aside className={`
            md:w-64 shrink-0 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'block' : 'hidden md:block'}
          `}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
                  {user?.name?.charAt(0) || 'V'}
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Vendor'}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vendor Account</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition
                      ${isActive(link.path)
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.label}</span>
                    {isActive(link.path) && (
                      <span className="ml-auto">
                        <Check size={16} />
                      </span>
                    )}
                  </Link>
                ))}
                
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Log Out</span>
                </button>
              </nav>
              
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/vendors/preview"
                  className="flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  View Public Profile
                </Link>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {location.pathname === '/vendor-dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Routes>
              <Route index element={<VendorBookings />} />
              <Route path="calendar" element={<VendorCalendar />} />
              <Route path="services" element={<VendorServices />} />
              <Route path="gallery" element={<VendorGallery />} />
              <Route path="messages" element={<VendorMessages />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="reviews" element={<VendorReviews />} />
              <Route path="favorites" element={<VendorFavorites />} />
              <Route path="settings" element={<VendorSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
