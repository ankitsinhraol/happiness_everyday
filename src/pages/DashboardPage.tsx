import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarRange, ClipboardList, MessageCircle, Clock, Settings, 
  Star, Heart, LogOut, ChevronRight, Check, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Dashboard Components
import UserBookings from '../components/dashboard/UserBookings';
import UserMessages from '../components/dashboard/UserMessages';
import UserProfile from '../components/dashboard/UserProfile';
import UserSettings from '../components/dashboard/UserSettings';
import UserFavorites from '../components/dashboard/UserFavorites';
import UserReviews from '../components/dashboard/UserReviews';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dashboard links
  const dashboardLinks = [
    { path: '/dashboard', label: 'My Bookings', icon: <CalendarRange size={20} /> },
    { path: '/dashboard/messages', label: 'Messages', icon: <MessageCircle size={20} /> },
    { path: '/dashboard/reviews', label: 'My Reviews', icon: <Star size={20} /> },
    { path: '/dashboard/favorites', label: 'Favorites', icon: <Heart size={20} /> },
    { path: '/dashboard/profile', label: 'Profile', icon: <ClipboardList size={20} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };
  
  // Close sidebar when changing routes on mobile
  const handleNavClick = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
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
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<UserBookings />} />
              <Route path="/messages" element={<UserMessages />} />
              <Route path="/reviews" element={<UserReviews />} />
              <Route path="/favorites" element={<UserFavorites />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/settings" element={<UserSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;