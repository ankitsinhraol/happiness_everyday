// src/components/vendor/VendorBookings.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Check, X, AlertCircle, MessageCircle,
  User, Phone, Mail, MapPin, Search, Filter, ChevronDown, Star 
} from 'lucide-react';
import { supabase } from '../../services/supabase.ts'; // Make sure this path is correct for your project
import { useAuth } from '../../contexts/AuthContext.tsx'; // Import useAuth
import { toast } from 'sonner'; // Import toast for notifications

// Define a type for your booking data to ensure type safety
// This reflects the structure we expect from the Supabase query (booking data + joined user & service data)
interface BookingData {
  id: string;
  user_id: string;
  vendor_id: string;
  event_start_datetime: string;
  event_end_datetime: string;
  event_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined';
  guests: number;
  location: string;
  total_amount: number;
  message: string | null;
  created_at: string;
  users: { name: string; email: string; } | null;
  service: { type: string; } | null;
}

const VendorBookings: React.FC = () => {
  const { user, vendorProfile } = useAuth(); // Get user and vendorProfile from auth context

  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]); // State to hold fetched bookings
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // No longer needs a hardcoded CURRENT_VENDOR_ID
  // We will use vendorProfile?.id from useAuth()

  // useEffect to fetch bookings when the component mounts or vendorId changes
  useEffect(() => {
    const fetchBookings = async () => {
      // Ensure vendorProfile is loaded before attempting to fetch bookings
      if (!user || !vendorProfile?.id) {
        setLoading(false);
        setError("Vendor profile not loaded. Cannot fetch bookings.");
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        // Corrected select query with the service join
        const { data, error: supabaseError } = await supabase
          .from('bookings')
          .select('id, user_id, vendor_id, event_start_datetime, event_end_datetime, event_type, status, guests, location, total_amount, message, created_at, users(name, email), service:services!service_id(type)')
          .eq('vendor_id', vendorProfile.id)
          .order('event_start_datetime', { ascending: true });

        if (supabaseError) {
          console.error('Error fetching bookings:', supabaseError);
          setError('Failed to fetch bookings. Please try again.');
          toast.error('Failed to fetch bookings.');
        } else if (data) {
          setBookings(data as unknown as BookingData[]);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Unexpected error fetching bookings:', err);
        setError('An unexpected error occurred.');
        toast.error('An unexpected error occurred.'); // Using toast
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Setup real-time subscription for new bookings and updates (optional but recommended)
    const bookingSubscription = supabase
      .channel('vendor_bookings_channel_V2') // Use a distinct channel name
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, payload => {
        // Check if the new booking is for the current vendor
        if (payload.new.vendor_id === vendorProfile?.id) {
          toast.info("New booking received!");
          fetchBookings(); // Re-fetch to get updated list, including joined data
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, payload => {
        // Check if the updated booking is for the current vendor
        if (payload.new.vendor_id === vendorProfile?.id) {
          toast.info(`Booking ${payload.new.id.substring(0, 8)}... status updated!`);
          // Optimistically update the state for immediate UI feedback
          setBookings(prev => prev.map(booking =>
            booking.id === payload.new.id ? { ...booking, ...payload.new } as BookingData : booking
          ));
        }
      })
      .subscribe();

    return () => {
      bookingSubscription.unsubscribe(); // Cleanup subscription on component unmount
    };

  }, [user, vendorProfile]); // Re-run if user or vendorProfile changes

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <X size={16} className="text-red-500" />;
      case 'declined':
        return <X size={16} className="text-red-500" />;
      case 'completed':
        return <Check size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateTimeString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
  };

  const formatTimeRange = (startDateTimeString: string, endDateTimeString: string) => {
    const startOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const endOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    const startTime = new Date(startDateTimeString).toLocaleTimeString('en-US', startOptions);
    const endTime = new Date(endDateTimeString).toLocaleTimeString('en-US', endOptions);

    return `${startTime} - ${endTime}`;
  };

  const handleAcceptBooking = async (id: string) => {
    setLoading(true); // Indicate loading for action
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', id);

      if (error) {
        console.error('Error accepting booking:', error);
        toast.error('Failed to accept booking. Please try again.'); // Using toast
      } else {
        // Update the state to reflect the change immediately
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === id ? { ...booking, status: 'confirmed' } : booking
          )
        );
        toast.success('Booking accepted successfully!'); // Using toast
      }
    } catch (err) {
      console.error('Error during accept:', err);
      toast.error('An unexpected error occurred while accepting booking.'); // Using toast
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeclineBooking = async (id: string) => {
    setLoading(true); // Indicate loading for action
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined' }) // Set status to 'declined'
        .eq('id', id);

      if (error) {
        console.error('Error declining booking:', error);
        toast.error('Failed to decline booking. Please try again.'); // Using toast
      } else {
        // Update the state to reflect the change immediately
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === id ? { ...booking, status: 'declined' } : booking
          )
        );
        toast.success('Booking declined successfully!'); // Using toast
      }
    } catch (err) {
      console.error('Error during decline:', err);
      toast.error('An unexpected error occurred while declining booking.'); // Using toast
    } finally {
      setLoading(false); // End loading
    }
  };

  const toggleBookingDetails = (id: string) => {
    setSelectedBooking(selectedBooking === id ? null : id);
  };

  // Filter bookings based on the active tab and current status
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      // "Upcoming" should probably mean confirmed bookings that are in the future
      return booking.status === 'confirmed' && new Date(booking.event_start_datetime) >= new Date();
    } else { // activeTab === 'pending'
      return booking.status === 'pending';
    }
  }).sort((a, b) => {
    // Sort upcoming by earliest date, pending by created_at (most recent first)
    if (activeTab === 'upcoming') {
      return new Date(a.event_start_datetime).getTime() - new Date(b.event_start_datetime).getTime();
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              className="py-2 pl-9 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white w-44 md:w-64"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          </div>

          <button type="button" aria-label="Filter bookings" className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <Filter size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'upcoming'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Pending Requests ({bookings.filter(b => b.status === 'pending').length})
        </button>
      </div>

      {loading && <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading bookings...</div>}
      {error && <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {booking.event_type} {booking.service?.type && `(${booking.service.type})`} {/* Display service type */}
                        </h3>
                        <div className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                          {getStatusIcon(booking.status)}
                          <span className="ml-2 text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Booked by <span className="font-medium text-gray-900 dark:text-white">{booking.users?.name}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptBooking(booking.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            disabled={loading} // Disable buttons during action
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineBooking(booking.id)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
                            disabled={loading} // Disable buttons during action
                          >
                            Decline
                          </button>
                        </>
                      )}
                      <button
                        className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-sm flex items-center"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Message
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(booking.event_start_datetime)} • {formatTimeRange(booking.event_start_datetime, booking.event_end_datetime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Guests</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{booking.guests} people</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{booking.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">₹{booking.total_amount.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => toggleBookingDetails(booking.id)}
                      className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition"
                    >
                      {selectedBooking === booking.id ? 'Hide Details' : 'View Details'}
                      <ChevronDown
                        size={16}
                        className={`ml-1 transition-transform duration-200 ${
                          selectedBooking === booking.id ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {selectedBooking === booking.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Customer Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-sm text-gray-800 dark:text-gray-200">{booking.users?.name}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-sm text-gray-800 dark:text-gray-200">{booking.users?.email}</span>
                            </div>
                            {/* If your users table has a 'phone' column, you can add it here and in the select query */}
                            {/* {booking.users.phone && (
                                <div className="flex items-center">
                                    <Phone size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">{booking.users.phone}</span>
                                </div>
                            )} */}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Booking Details</h4>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">Customer Message:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.message || 'No message provided.'}</p>
                          </div>

                          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Booking received: {new Date(booking.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="mb-4">
                <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {activeTab === 'upcoming' ? (
                    <Calendar size={32} className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Clock size={32} className="text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No {activeTab === 'upcoming' ? 'confirmed' : 'pending'} bookings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeTab === 'upcoming'
                  ? "You don't have any confirmed bookings at the moment."
                  : "You don't have any pending booking requests."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;