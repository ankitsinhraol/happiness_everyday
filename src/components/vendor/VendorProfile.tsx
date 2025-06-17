import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const VendorProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState({
    business_name: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    website: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchVendorProfile();
  }, [user]);

  const fetchVendorProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('vendors')
        .update(vendor)
        .eq('user_id', user.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vendor profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Business Profile</h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isEditing ? (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 size={16} className="mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Business Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={vendor.business_name}
                  onChange={(e) => setVendor({ ...vendor, business_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Building2 size={20} className="mr-2 text-gray-500" />
                  {vendor.business_name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={vendor.email}
                  onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Mail size={20} className="mr-2 text-gray-500" />
                  {vendor.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={vendor.phone}
                  onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Phone size={20} className="mr-2 text-gray-500" />
                  {vendor.phone}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={vendor.city}
                  onChange={(e) => setVendor({ ...vendor, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <MapPin size={20} className="mr-2 text-gray-500" />
                  {vendor.city}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={vendor.website || ''}
                  onChange={(e) => setVendor({ ...vendor, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <Globe size={20} className="mr-2 text-gray-500" />
                  {vendor.website ? (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                      {vendor.website}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Business Description
          </label>
          {isEditing ? (
            <textarea
              value={vendor.description}
              onChange={(e) => setVendor({ ...vendor, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {vendor.description || 'No description provided.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;