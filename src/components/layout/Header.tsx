import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDarkMode } from '../../hooks/useDarkMode.ts';
import Logo from '../ui/Logo.tsx';


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isVendor, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect on header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Determine the correct dashboard path for customers ---
  // You need to replace '/your-correct-customer-dashboard-path'
  

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-800 shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">AllInEvent</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            Search
          </Link>
          {user ? (
            <>
              <Link
                // --- MODIFIED LINE FOR DESKTOP NAVIGATION ---
                to={isVendor ? "/vendor-dashboard" : "/customer-dashboard"}
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                {isVendor ? "Vendor Dashboard" : "CustomerDashboard"} {/* Optional: change text for clarity */}
              </Link>
              <button
                onClick={logout}
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Register
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            aria-label="Open menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg md:hidden">
            <nav className="flex flex-col p-4">
              <Link
                to="/"
                className="py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                Home
              </Link>
              <Link
                to="/search"
                className="py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                Search
              </Link>
              {user ? (
                <>
                  <Link
                    // --- MODIFIED LINE FOR MOBILE NAVIGATION ---
                    to={isVendor ? "/vendor-dashboard" : "/customer-dashboard"}
                    className="py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    {isVendor ? "Vendor Dashboard" : "My Dashboard"} {/* Optional: change text for clarity */}
                  </Link>
                  <button
                    onClick={logout}
                    className="py-2 text-left text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="py-2 px-4 my-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition inline-block w-fit"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;