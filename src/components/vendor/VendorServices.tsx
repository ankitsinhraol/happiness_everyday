import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, DollarSign, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner'; // Ensure you have sonner installed (npm install sonner)

// Define the Service type to match your database schema
// Note: created_at will be handled by Supabase default now()
interface Service {
  id: string; // UUID from Supabase
  vendor_id: string; // Foreign key to vendors.id
  type: string;
  min_price: number;
  max_price: number;
  description: string;
  event_types_supported: string[]; // This maps to text[] in PostgreSQL
  created_at?: string; // Optional, will be automatically set by DB
}

const VendorServices: React.FC = () => {
  const { user, isVendor, isLoading: authLoading } = useAuth(); // Get user context
  const [vendorId, setVendorId] = useState<string | null>(null); // State to store the fetched vendor ID

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Services data from Supabase
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading state for fetching services
  const [error, setError] = useState<string | null>(null); // Error state for fetch/mutate operations

  // Form state for adding/editing service
  const [formData, setFormData] = useState({
    type: '',
    min_price: 0,
    max_price: 0,
    description: '',
    event_types_supported: [] as string[],
  });

  // --- Effect to fetch vendor_id and then services ---
  useEffect(() => {
    const getAndFetchServices = async () => {
      if (authLoading) return; // Wait for authentication to load

      if (!user || !isVendor) {
        setError("You must be logged in as a vendor to manage services.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        // 1. Fetch the vendor_id using the logged-in user's auth.uid()
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id') // We only need the ID from the vendors table
          .eq('user_id', user.id) // Link via the user's UUID (auth.uid())
          .single();

        if (vendorError || !vendorData) {
          console.error("Error fetching vendor ID:", vendorError?.message);
          setError("Could not retrieve your vendor profile. Please ensure it's set up correctly in the dashboard.");
          setLoading(false);
          return;
        }

        const currentVendorId = vendorData.id;
        setVendorId(currentVendorId); // Store the fetched vendorId

        // 2. Now fetch services for this specific vendor_id
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*') // Select all columns for the services
          .eq('vendor_id', currentVendorId) // Filter by the current vendor's ID
          .order('created_at', { ascending: false }); // Order by creation date

        if (servicesError) {
          console.error('Error fetching services:', servicesError.message);
          setError('Failed to load services.');
          setServices([]); // Clear services on error
        } else {
          setServices(servicesData || []); // Set fetched services
        }
      } catch (err: any) {
        console.error('Unexpected error during service fetch:', err.message);
        setError('An unexpected error occurred while loading services.');
      } finally {
        setLoading(false); // End loading
      }
    };

    getAndFetchServices();
  }, [user, isVendor, authLoading]); // Re-run effect if these dependencies change

  // --- Form Handlers ---
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      type: service.type,
      min_price: service.min_price,
      max_price: service.max_price,
      description: service.description,
      event_types_supported: [...service.event_types_supported], // Copy array to prevent direct mutation
    });
    setShowAddModal(true);
  };

  const handleAddService = () => {
    setFormData({
      type: '',
      min_price: 0,
      max_price: 0,
      description: '',
      event_types_supported: [],
    });
    setEditingService(null); // Clear any editing state
    setShowAddModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleEventTypeToggle = (eventType: string) => {
    setFormData(prev => {
      const exists = prev.event_types_supported.includes(eventType);
      let newTypes;

      if (exists) {
        newTypes = prev.event_types_supported.filter(type => type !== eventType);
      } else {
        newTypes = [...prev.event_types_supported, eventType];
      }

      return { ...prev, event_types_supported: newTypes };
    });
  };

  // --- Submit Add/Edit Service to Supabase ---
  const handleSubmit = async () => {
    // Form validation
    if (!formData.type || formData.min_price <= 0 || formData.max_price <= 0 || !formData.description || formData.event_types_supported.length === 0) {
      toast.error('Please fill in all required fields and ensure prices are positive.');
      return;
    }

    if (formData.min_price > formData.max_price) {
      toast.error('Minimum price cannot be greater than maximum price.');
      return;
    }

    if (!vendorId) {
      toast.error('Vendor profile not loaded. Please try again or contact support.');
      return;
    }

    setLoading(true); // Start loading for API call
    setError(null); // Clear previous errors

    try {
      if (editingService) {
        // --- Update existing service in Supabase ---
        const { error: updateError } = await supabase
          .from('services')
          .update({
            type: formData.type,
            min_price: formData.min_price,
            max_price: formData.max_price,
            description: formData.description,
            event_types_supported: formData.event_types_supported,
          })
          .eq('id', editingService.id) // Update by service ID
          .eq('vendor_id', vendorId); // Crucial for RLS: ensure vendor owns this service

        if (updateError) throw updateError;
        toast.success('Service updated successfully!');

      } else {
        // --- Add new service to Supabase ---
        const { error: insertError } = await supabase
          .from('services')
          .insert({
            vendor_id: vendorId, // Use the fetched vendorId to link the service
            type: formData.type,
            min_price: formData.min_price,
            max_price: formData.max_price,
            description: formData.description,
            event_types_supported: formData.event_types_supported,
          });

        if (insertError) throw insertError;
        toast.success('Service added successfully!');
      }

      // Re-fetch the services to update the UI with the latest data from the database
      const { data: updatedServices, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setServices(updatedServices || []);

      // Reset form state and close modal
      setShowAddModal(false);
      setEditingService(null);
      setFormData({ type: '', min_price: 0, max_price: 0, description: '', event_types_supported: [] });

    } catch (err: any) {
      console.error('Error saving service:', err.message);
      setError(`Failed to save service: ${err.message}`);
      toast.error(`Failed to save service: ${err.message}`);
    } finally {
      setLoading(false); // End loading for API call
    }
  };

  // --- Delete Service from Supabase ---
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      setShowDeleteConfirm(null); // Hide confirmation modal
      return;
    }
    if (!vendorId) {
      toast.error('Vendor profile not loaded. Cannot delete service.');
      setShowDeleteConfirm(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('vendor_id', vendorId); // Crucial for RLS: ensure vendor owns the service

      if (deleteError) throw deleteError;
      toast.success('Service deleted successfully!');
      // Optimistic UI update: remove the deleted service from local state
      setServices(services.filter(s => s.id !== serviceId));
    } catch (err: any) {
      console.error('Error deleting service:', err.message);
      setError(`Failed to delete service: ${err.message}`);
      toast.error(`Failed to delete service: ${err.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null); // Hide confirmation modal
    }
  };

  // --- Render Logic ---
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading services...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
        <AlertTriangle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>

        <button
          onClick={handleAddService}
          className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !vendorId} // Disable if loading or vendorId not yet available
        >
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center col-span-full">
            <div className="mb-4">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                <DollarSign size={32} className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your services to showcase what you offer to potential customers.
            </p>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddService}
              disabled={loading || !vendorId}
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 relative group"
            >
              <div className="absolute right-4 top-4 flex opacity-0 group-hover:opacity-100 transition gap-1">
                <button
                  onClick={() => handleEditService(service)}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Edit service"
                  disabled={loading}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(service.id)}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete service"
                  disabled={loading}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {service.type}
              </h3>

              <div className="flex items-center mb-3">
                <DollarSign size={16} className="text-purple-600 dark:text-purple-400 mr-1" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ₹{service.min_price} - ₹{service.max_price} per plate
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {service.description}
              </p>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Available for event types:</p>
                <div className="flex flex-wrap gap-2">
                  {service.event_types_supported.map((type, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 py-1 px-2 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === service.id && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={16} className="mr-2" />
                    <p>Are you sure you want to delete this service?</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Vegetarian Menu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Price (₹)
                  </label>
                  <input
                    type="number"
                    id="min_price"
                    name="min_price"
                    value={formData.min_price}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Min price"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Price (₹)
                  </label>
                  <input
                    type="number"
                    id="max_price"
                    name="max_price"
                    value={formData.max_price}
                    onChange={handleNumberChange}
                    min={formData.min_price} // Ensure max price is >= min price
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Max price"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Describe your service"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Types Supported
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Party', 'Festival', 'Other'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.event_types_supported.includes(type)}
                        onChange={() => handleEventTypeToggle(type)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
                {formData.event_types_supported.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">Please select at least one event type.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {editingService ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Update Service
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add Service
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VendorServices;