// src/components/VendorCalendar.tsx
// src/components/VendorCalendar.tsx

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X, Clock,
    Plus, CalendarRange, User, Calendar as EventCalendarIcon, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../services/supabase.ts'; // Keep this for authentication and updates
import { useAuth } from '../../contexts/AuthContext.tsx';
import { toast } from 'sonner';

// Type for availability entries from Supabase
interface VendorAvailability {
    id: string;
    vendor_id: string;
    date: string; // Stored as ISO string 'YYYY-MM-DD'
    status: 'available' | 'unavailable';
    created_at?: string;
    updated_at?: string;
}

// Type for booking entries from Supabase (simplified for display)
interface Booking {
    id: string;
    vendor_id: string;
    user_id: string;
    service_id: string | null;
    event_date: string;
    event_type: string;
    message: string;
    customerName?: string; // This will be obtained from 'users.name' via Edge Function
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at?: string;
}

const VendorCalendar: React.FC = () => {
    const { user, isVendor, isLoading: authLoading } = useAuth();
    const [vendorId, setVendorId] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [availabilityType, setAvailabilityType] = useState<'available' | 'unavailable'>('available');

    const [availabilityData, setAvailabilityData] = useState<VendorAvailability[]>([]);
    const [bookingsData, setBookingsData] = useState<Booking[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get Supabase URL from environment variables for Edge Function calls
    // Ensure VITE_SUPABASE_URL is set in your .env or .env.local file
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // This is the correct base URL for the functions, including the 'v1' API version.
    // The specific function name will be appended to this.
    const supabaseFunctionsBaseUrl = `${supabaseUrl}/functions/v1/`;


    // --- Effect to fetch vendor_id and then calendar data (availability & bookings) using Edge Function ---
    useEffect(() => {
        const fetchCalendarData = async () => {
            if (authLoading) return; // Wait for auth loading to complete

            // IMPORTANT: Get the user's session token for authorization
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("Supabase Session Error:", sessionError?.message || "No active session.");
                setError("Authentication required to view your calendar. Please log in.");
                setLoading(false);
                return;
            }

            if (!user || !isVendor) {
                setError("You must be logged in as a vendor to manage your calendar.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Fetch the vendor_id using the logged-in user's auth.uid()
                // This part still uses the client-side Supabase client as it's a simple lookup
                const { data: vendorData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (vendorError || !vendorData) {
                    console.error("Error fetching vendor ID:", vendorError?.message);
                    setError("Could not retrieve your vendor profile. Please ensure it's set up correctly in the dashboard.");
                    setLoading(false);
                    return;
                }

                const currentVendorId = vendorData.id;
                setVendorId(currentVendorId);

                // Define month boundaries for fetching data
                const monthParam = currentDate.getMonth() + 1; // Month for API is 1-indexed
                const yearParam = currentDate.getFullYear();

                // 2. Call the Edge Function to fetch combined availability and bookings data
                const edgeFunctionUrl = `${supabaseFunctionsBaseUrl}vendor-calendar?vendorId=${currentVendorId}&month=${monthParam}&year=${yearParam}`;

                const response = await fetch(edgeFunctionUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`, // <-- Use session.access_token here
                        // 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY!, // Often not strictly necessary for functions with auth header, but doesn't hurt.
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching calendar data via Edge Function: HTTP error! status:', response.status, errorData.error);
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const { availability, bookings } = await response.json();

                setAvailabilityData(availability || []);
                setBookingsData(bookings || []);

            } catch (err: any) {
                console.error('Error fetching calendar data via Edge Function:', err.message);
                setError(`Failed to load calendar data: ${err.message}. Please check your Edge Function logs.`);
                setAvailabilityData([]);
                setBookingsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendarData();
    }, [currentDate, user, isVendor, authLoading, supabaseUrl, supabaseFunctionsBaseUrl]); // Added supabaseUrl and supabaseFunctionsBaseUrl to dependencies

    // --- Calendar Navigation ---
    const prevMonth = () => {
        setCurrentDate(prev => subMonths(prev, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1));
        setSelectedDate(null);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        const currentStatus = getDateStatus(date);
        if (currentStatus !== 'unset') {
            setAvailabilityType(currentStatus);
        } else {
            setAvailabilityType('available');
        }
    };

    // --- Update Availability in Supabase (still client-side) ---
    const handleUpdateAvailability = async () => {
        if (!selectedDate || !vendorId) {
            toast.error('Please select a date and ensure your vendor profile is loaded.');
            return;
        }

        setLoading(true);
        setError(null);
        const dateToUpdate = format(selectedDate, 'yyyy-MM-dd');

        try {
            const existingEntry = availabilityData.find(a => a.date === dateToUpdate && a.vendor_id === vendorId);

            if (existingEntry) {
                const { error: updateError } = await supabase
                    .from('availability')
                    .update({ status: availabilityType })
                    .eq('id', existingEntry.id)
                    .eq('vendor_id', vendorId);

                if (updateError) throw updateError;
                toast.success(`Availability updated to ${availabilityType} for ${format(selectedDate, 'MMM d,yyyy')}`);
            } else {
                const { error: insertError } = await supabase
                    .from('availability')
                    .insert({
                        vendor_id: vendorId,
                        date: dateToUpdate,
                        status: availabilityType,
                    });

                if (insertError) throw insertError;
                toast.success(`Availability set to ${availabilityType} for ${format(selectedDate, 'MMM d,yyyy')}`);
            }

            // After update, refetch data via Edge Function to ensure consistency
            const monthParam = currentDate.getMonth() + 1;
            const yearParam = currentDate.getFullYear();

            // IMPORTANT: Get the updated session for refetching
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error("Could not retrieve user session for refetch. Please log in again.");
            }

            const edgeFunctionUrl = `${supabaseFunctionsBaseUrl}vendor-calendar?vendorId=${vendorId}&month=${monthParam}&year=${yearParam}`;

            const response = await fetch(edgeFunctionUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`, // <-- Use session.access_token here again
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const { availability, bookings } = await response.json();
            setAvailabilityData(availability || []);
            setBookingsData(bookings || []);

            setShowAvailabilityModal(false);
        } catch (err: any) {
            console.error('Error saving availability or refetching:', err.message);
            setError(`Failed to save availability: ${err.message}`);
            toast.error(`Failed to save availability: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    // Generate days for current month for calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Helper to get a date's availability status from fetched data
    const getDateStatus = (date: Date): 'available' | 'unavailable' | 'unset' => {
        const dateString = format(date, 'yyyy-MM-dd');
        const entry = availabilityData.find(item => item.date === dateString);
        return entry ? entry.status : 'unset';
    };

    // Helper to find booking for a specific date from fetched data
    const getBookingForDate = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        return bookingsData.find(booking => booking.event_date === dateString);
    };

    // Find booking for currently selected date (for details panel)
    const selectedBooking = selectedDate
        ? getBookingForDate(selectedDate)
        : null;

    // --- Render Loading/Error States ---
    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-3">Loading calendar data...</p>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Availability Calendar</h2>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAvailabilityModal(true)}
                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedDate}
                    >
                        <Plus size={16} />
                        <span>Set Availability</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Calendar Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <CalendarIcon size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h3>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Render empty cells for days before the 1st of the month */}
                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-14"></div>
                        ))}

                        {days.map((day, i) => {
                            const dateStatus = getDateStatus(day);
                            const hasBooking = getBookingForDate(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());

                            let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white';

                            if (dateStatus === 'available') {
                                bgClass = 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30';
                            } else if (dateStatus === 'unavailable') {
                                bgClass = 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30';
                            }

                            if (hasBooking) {
                                bgClass = 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/30';
                            }

                            if (isToday) {
                                bgClass += ' border-2 border-orange-400 dark:border-orange-600';
                            }

                            if (isSelected) {
                                bgClass += ' ring-2 ring-purple-600 dark:ring-purple-400';
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDateClick(day)}
                                    className={`rounded-lg p-1 h-14 flex flex-col items-center justify-center transition cursor-pointer ${bgClass}`}
                                >
                                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                                    {hasBooking && (
                                        <div className="w-4 h-1 mt-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Not Set</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Available</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Unavailable</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Booked</span>
                        </div>
                    </div>
                </div>
                {/* Calender grid ends */}

                {/* Selected Date Info Panel */}
                {selectedDate && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Set Availability for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </h3>

                        {selectedBooking ? (
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 mb-2">
                                    <CalendarRange size={16} />
                                    <h4 className="font-medium">Booking Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <User size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.customerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <EventCalendarIcon size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Event Type</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.event_type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Message</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{selectedBooking.message || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                                        View Booking Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {getDateStatus(selectedDate) === 'available' ? (
                                        <span className="flex items-center text-green-600 dark:text-green-400">
                                            <Check size={16} className="mr-1" /> Marked as available
                                        </span>
                                    ) : getDateStatus(selectedDate) === 'unavailable' ? (
                                        <span className="flex items-center text-red-600 dark:text-red-400">
                                            <X size={16} className="mr-1" /> Marked as unavailable
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                                            <Clock size={16} className="mr-1" /> Availability not set
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowAvailabilityModal(true)}
                                    className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    <Plus size={16} />
                                    <span>Update Availability</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* calender div ends here */}

            {/* Availability Modal */}
            {showAvailabilityModal && selectedDate && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Set Availability for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Are you available on this date?
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAvailabilityType('available')}
                                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                                        availabilityType === 'available'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    disabled={loading}
                                >
                                    <Check size={16} />
                                    <span>Available</span>
                                </button>
                                <button
                                    onClick={() => setAvailabilityType('unavailable')}
                                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                                        availabilityType === 'unavailable'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    disabled={loading}
                                >
                                    <X size={16} />
                                    <span>Unavailable</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowAvailabilityModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateAvailability}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Save Availability
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VendorCalendar;