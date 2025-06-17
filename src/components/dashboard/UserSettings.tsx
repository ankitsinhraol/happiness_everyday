import React, { useState } from 'react';
import { Save, Lock, Bell, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const UserSettings: React.FC = () => {
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    smsBookings: false,
    smsMessages: false
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePassword(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (changePassword.newPassword !== changePassword.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (changePassword.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // In a real app, you would update the password in Supabase Auth here
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form
      setChangePassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    }
  };
  
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, you would update notification settings in Supabase here
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update notification settings.');
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'delete my account') {
      toast.error('Please type "delete my account" to confirm');
      return;
    }
    
    try {
      // In a real app, you would delete the user account in Supabase here
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Account deleted successfully.');
      // Redirect to home page or logout
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
      
      <div className="space-y-8">
        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lock size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
            Security Settings
          </h3>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={changePassword.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={changePassword.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={changePassword.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
            >
              <Save size={18} className="mr-2" />
              Update Password
            </button>
          </form>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
            Notification Settings
          </h3>
          
          <form onSubmit={handleNotificationSubmit}>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailBookings"
                      checked={notificationSettings.emailBookings}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Booking updates and confirmations</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailMessages"
                      checked={notificationSettings.emailMessages}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">New messages from vendors</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailMarketing"
                      checked={notificationSettings.emailMarketing}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Marketing emails and promotions</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">SMS Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="smsBookings"
                      checked={notificationSettings.smsBookings}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Booking updates and confirmations</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="smsMessages"
                      checked={notificationSettings.smsMessages}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">New messages from vendors</span>
                  </label>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save Preferences
            </button>
          </form>
        </div>
        
        {/* Delete Account */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-900">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <Trash2 size={18} className="mr-2" />
            Delete Account
          </h3>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-start mb-3">
                <AlertTriangle size={18} className="text-red-600 dark:text-red-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-red-800 dark:text-red-300 text-sm">
                  To confirm deletion, please type "delete my account" in the field below.
                </p>
              </div>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-red-300 dark:border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 dark:bg-red-900/30 dark:text-white mb-3"
                placeholder='Type "delete my account"'
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                  disabled={deleteConfirmText !== 'delete my account'}
                >
                  <Trash2 size={16} className="mr-2" />
                  Permanently Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;