import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Short Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo size={32} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AllInEvent</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-xs">
              Your AI-powered platform for finding and booking event vendors with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">For Customers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Find Vendors
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Your Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?type=vendor" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Join as Vendor
                </Link>
              </li>
              <li>
                <Link to="/vendor-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor-resources" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Vendor Resources
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Pricing & Plans
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>© {currentYear} AllInEvent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;