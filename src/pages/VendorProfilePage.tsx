import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import {
  MapPin, Mail, Phone, Calendar, Star, DollarSign, Globe, Clock,
  ChevronLeft, ChevronRight, MessageCircle, Share2, Heart,
  CheckCircle2, XCircle, Camera, Building, Shield
} from 'lucide-react'; // Removed 'Check' and 'X' since status will be derived
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'; // Added getDaysInMonth, startOfMonth, getDay
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabase.ts'; // Ensure this path is correct!

// Define interfaces for your Supabase table structures
interface Service {
  id: string;
  vendor_id: string; //
  type: string;
  min_price: number;
  max_price: number;
  description: string;
  event_types_supported: string[];
}

interface Review {
  id: string;
  user_id: string;
  vendor_id: string; //
  booking_id: string;
  rating: number;
  review_text: string; // Changed from 'text' to 'review_text'
  created_at: string; // Using string for timestamp, parse to Date if needed
}

interface AvailabilityRecord {
  id: string;
  vendor_id: string; //
  date: string; // ISO date string e.g., 'YYYY-MM-DD'
  status: 'available' | 'booked' | 'pending' | string; // Assuming common statuses
  created_at: string;
}

interface VendorImage {
  id: string;
  vendor_id: string; //
  image_url: string; //
  caption: string | null; //
  created_at: string;
}

// Updated VendorData interface based on your 'vendors' table and joins
interface VendorData {
  id: string;
  user_id: string;
  business_name: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  
  // Joined relationships (these will be arrays of the respective types)
  services: Service[];
  reviews: Review[];
  vendor_images: VendorImage[]; // From the 'vendor_images' table
}

const VendorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Assuming useAuth provides user data

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for calendar
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed month
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [monthAvailability, setMonthAvailability] = useState<AvailabilityRecord[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Function to calculate average rating
  const calculateAverageRating = (reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  // Main data fetching for vendor profile
  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError('Vendor ID not found in URL.');
        setLoading(false);
        return;
      }

      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select(`
            id,
            user_id,
            business_name,
            city,
            phone,
            email,
            description,
            logo_url,
            website,
            created_at,
            services (id, vendor_id, type, min_price, max_price, description, event_types_supported),
            reviews (id, user_id, vendor_id, booking_id, rating, review_text, created_at),
            vendor_images (id, vendor_id, image_url, caption)
          `)
          .eq('id', id)
          .single();

        if (vendorError) {
          console.error('Error fetching vendor:', vendorError);
          throw new Error('Failed to load vendor profile.');
        }

        if (!vendorData) {
          setError('Vendor not found.');
          setLoading(false);
          return;
        }

        setVendor(vendorData as VendorData); // Type assertion for initial load

        // Initialize currentImageIndex safely if images exist
        if (vendorData.vendor_images && vendorData.vendor_images.length > 0) {
            setCurrentImageIndex(0);
        }

      } catch (err: any) {
        console.error('Full fetch error:', err);
        setError(err.message || 'An unexpected error occurred while loading the vendor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  // Fetch availability for the current month/year displayed in the calendar
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;
      setAvailabilityLoading(true);
      try {
        // Construct the start and end dates for the month
        const startDate = format(startOfMonth(new Date(calendarYear, calendarMonth)), 'yyyy-MM-dd');
        const endDate = format(new Date(calendarYear, calendarMonth, getDaysInMonth(new Date(calendarYear, calendarMonth))), 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .eq('vendor_id', id)
          .gte('date', startDate) // Greater than or equal to start of month
          .lte('date', endDate); // Less than or equal to end of month

        if (error) {
          console.error('Error fetching availability:', error);
          setMonthAvailability([]);
        } else {
          setMonthAvailability(data || []);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setMonthAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (activeTab === 'availability') { // Only fetch if availability tab is active
        fetchAvailability();
    }
  }, [id, calendarMonth, calendarYear, activeTab]); // Re-fetch when month/year or tab changes

  const handlePrevImage = () => {
    if (!vendor || !vendor.vendor_images || vendor.vendor_images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? vendor.vendor_images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!vendor || !vendor.vendor_images || vendor.vendor_images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === vendor.vendor_images.length - 1 ? 0 : prev + 1
    );
  };

  const handleContact = () => {
    if (user) {
      setShowContactForm(true);
    } else {
      // Redirect to login, then back to this vendor profile
      navigate(`/login?redirect=/vendor/${id}`);
    }
  };

  const handleSubmitMessage = () => {
    // In a real app, this would create a message or booking request in Supabase
    alert('Your message has been sent to the vendor. They will contact you shortly.');
    setShowContactForm(false);
    setMessage('');
  };

  // Calendar rendering logic
  const firstDayOfMonthIndex = getDay(startOfMonth(new Date(calendarYear, calendarMonth))); // 0 for Sunday, 6 for Saturday
  const totalDaysInMonth = getDaysInMonth(new Date(calendarYear, calendarMonth));
  const daysInCalendar = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading vendor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Vendor not found.</p>
      </div>
    );
  }

  const averageRating = calculateAverageRating(vendor.reviews);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition"
        >
          <ChevronLeft size={18} /> Back to results
        </button>

        {/* Gallery Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden h-64 md:h-96">
          {vendor.vendor_images && vendor.vendor_images.length > 0 ? (
            <img
              src={vendor.vendor_images[currentImageIndex].image_url} // Use image_url
              alt={vendor.vendor_images[currentImageIndex].caption || vendor.business_name} // Use caption or business_name
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full object-cover bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No images available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Navigation Arrows (only if images exist) */}
          {vendor.vendor_images && vendor.vendor_images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image Counter (only if images exist) */}
          {vendor.vendor_images && vendor.vendor_images.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white rounded-full px-3 py-1 text-sm">
              {currentImageIndex + 1} / {vendor.vendor_images.length}
            </div>
          )}

          {/* Title and Rating Badge */}
          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-white">{vendor.business_name}</h1>
              {/* Assuming 'verified' status is either derived or not present in your schema */}
              {/* For now, removing the checkmark icon as 'verified' column is not in 'vendors' */}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="ml-1 text-white font-medium">{averageRating === 0 ? 'N/A' : averageRating}</span>
                <span className="ml-1 text-white/80">({vendor.reviews?.length || 0} reviews)</span>
              </div>
              <span className="w-1 h-1 bg-white/80 rounded-full"></span>
              <div className="flex items-center text-white/80">
                <MapPin size={14} className="mr-1" />
                {vendor.city}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition" aria-label="Share vendor profile">
              <Share2 size={18} />
            </button>
            <button className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition" aria-label="Save to favorites">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {vendor.vendor_images && vendor.vendor_images.length > 0 && vendor.vendor_images.map((img, index) => (
            <button
              key={img.id}
              className={`relative flex-shrink-0 h-16 w-24 rounded-md overflow-hidden ${
                index === currentImageIndex ? 'ring-2 ring-purple-600' : ''
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img
                src={img.image_url}
                alt={img.caption || `Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-purple-600/20 border border-purple-600 rounded-md"></div>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Details */}
          <div className="w-full md:w-2/3">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                {['overview', 'services', 'reviews', 'availability'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                      activeTab === tab
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About {vendor.business_name}</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{vendor.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* These details (established, team_size, verified, price range) are not directly in your 'vendors' table.
                        You'll need to decide if these should be added to the 'vendors' table, derived, or removed.
                        For now, I'm adapting them based on closest available data or placeholder.
                        'Established' and 'Team Size' are removed as they are not in schema.
                        'Verified' status is removed as not in schema.
                    */}
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Camera size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio</p>
                        <p className="font-medium text-gray-900 dark:text-white">{vendor.vendor_images?.length || 0} Photos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Price Range</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vendor.services && vendor.services.length > 0 ? (
                            `₹${Math.min(...vendor.services.map(s => s.min_price))} - ₹${Math.max(...vendor.services.map(s => s.max_price))}` //
                          ) : (
                            'N/A'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* You don't have an 'address' column in 'vendors', using city for now. */}
                      <div className="flex items-center gap-2">
                        <MapPin className="text-gray-500 dark:text-gray-400" size={18} />
                        <span className="text-gray-800 dark:text-gray-200">{vendor.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="text-gray-500 dark:text-gray-400" size={18} />
                        <span className="text-gray-800 dark:text-gray-200">{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-gray-500 dark:text-gray-400" size={18} />
                        <span className="text-gray-800 dark:text-gray-200">{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="text-gray-500 dark:text-gray-400" size={18} />
                        <a href={vendor.website || '#'} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                          {vendor.website?.replace(/^https?:\/\//, '') || 'N/A'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Services Offered</h2>

                  {vendor.services && vendor.services.length > 0 ? (
                    <div className="space-y-6">
                      {vendor.services.map((service) => (
                        <div
                          key={service.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition"
                        >
                          <div className="flex justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{service.type}</h3>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ₹{service.min_price} - ₹{service.max_price}
                              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1"></span>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">{service.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {service.event_types_supported && service.event_types_supported.map((type, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">No services listed yet.</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Reviews</h2>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium text-gray-900 dark:text-white">{averageRating === 0 ? 'N/A' : averageRating}</span>
                      <span className="mx-1 text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{vendor.reviews?.length || 0} reviews</span>
                    </div>
                  </div>

                  {vendor.reviews && vendor.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {vendor.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                {/* Assuming you don't store customer name directly in reviews, using a generic initial */}
                                {review.user_id?.substring(0, 1).toUpperCase() || 'U'}
                              </div>
                              <div className="ml-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">User {review.user_id?.substring(0, 8)}...</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {format(new Date(review.created_at), 'MMMM d, yyyy')}
                                  {/* eventType is not in your review table, consider adding if needed */}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-2">{review.review_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">No reviews yet.</p>
                  )}
                </div>
              )}

              {/* Availability Tab */}
              {activeTab === 'availability' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Check Availability</h2>

                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Select a date to check availability and request a booking.
                    </p>

                    {/* Month/Year Navigation */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            aria-label="Previous month"
                            onClick={() => {
                                setCalendarMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
                                if (calendarMonth === 0) setCalendarYear(prevYear => prevYear - 1);
                            }}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {format(new Date(calendarYear, calendarMonth, 1), 'MMMM yyyy')}
                        </h3>
                        <button
                            aria-label="Next month"
                            onClick={() => {
                                setCalendarMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
                                if (calendarMonth === 11) setCalendarYear(prevYear => prevYear + 1);
                            }}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    {availabilityLoading ? (
                        <p className="text-center text-gray-600 dark:text-gray-400">Loading availability...</p>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-7 gap-2 text-center">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div
                                key={i}
                                className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                            >
                                {day}
                            </div>
                            ))}

                            {/* Empty placeholders for days before the 1st */}
                            {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-12"></div>
                            ))}

                            {/* Calendar Days */}
                            {daysInCalendar.map((day) => {
                            const date = new Date(calendarYear, calendarMonth, day);
                            const isoDate = format(date, 'yyyy-MM-dd');
                            const availabilityForDay = monthAvailability.find(rec => rec.date === isoDate); //
                            const status = availabilityForDay?.status; //
                            const isPastDate = date < new Date() && date.toDateString() !== new Date().toDateString(); // Check for past dates

                            let classes = "rounded-md h-12 flex items-center justify-center p-1 text-sm ";
                            
                            if (isPastDate) {
                                classes += "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60";
                            } else if (status === 'booked') { //
                                classes += "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 cursor-not-allowed";
                            } else if (status === 'available') { //
                                classes += "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40";
                            } else {
                                // Default: not explicitly available or booked, consider it 'enquire'
                                classes += "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700";
                            }

                            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                                classes += " ring-2 ring-purple-600 dark:ring-purple-400";
                            }

                            return (
                                <div
                                key={day}
                                className={classes}
                                onClick={() => {
                                    if (!isPastDate && status !== 'booked') {
                                    setSelectedDate(date);
                                    }
                                }}
                                >
                                {day}
                                </div>
                            );
                            })}
                        </div>

                        <div className="flex gap-4 mt-4 text-sm">
                            <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Available</span>
                            </div>
                            <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Booked</span>
                            </div>
                            <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                            <span className="text-gray-700 dark:text-gray-300">Enquire</span>
                            </div>
                        </div>
                        </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Calendar className="mr-2 text-purple-600 dark:text-purple-400" size={18} />
                        Selected Date: {format(selectedDate, 'MMMM d, yyyy')}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                        This date is {
                          monthAvailability.find(rec => rec.date === format(selectedDate, 'yyyy-MM-dd'))?.status === 'available'
                          ? 'available'
                          : 'tentative'
                        }. Contact the vendor to confirm booking.
                      </p>
                      <button
                        onClick={handleContact}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
                      >
                        <MessageCircle size={18} className="mr-2" />
                        Contact for Booking
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="w-full md:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact {vendor.business_name}</h2>

              {showContactForm ? (
                <div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your event, date, number of guests, and any specific requirements..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitMessage}
                      disabled={!message.trim()}
                      className={`flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ${
                        !message.trim() ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-500 dark:text-gray-400" size={18} />
                      <span className="text-gray-800 dark:text-gray-200">
                        Responds within 24 hours (estimation)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-500 dark:text-gray-400" size={18} />
                      <span className="text-gray-800 dark:text-gray-200">
                        Check availability calendar
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-gray-500 dark:text-gray-400" size={18} />
                      <span className="text-gray-800 dark:text-gray-200">
                        {vendor.services && vendor.services.length > 0 ? (
                            `Starting at ₹${Math.min(...vendor.services.map(s => s.min_price))}`
                        ) : (
                            'Price info N/A'
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleContact}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Contact Vendor
                  </button>

                  <div className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                    No commitment, just an inquiry
                  </div>
                </div>
              )}
            </div>

            {/* Event Planning Tips */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Event Planning Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Book 3-6 months in advance for best availability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ask for sample menus and tasting options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Discuss dietary restrictions and special requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-2 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Confirm staff, setup and cleanup details</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;