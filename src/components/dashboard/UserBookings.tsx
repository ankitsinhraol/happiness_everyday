import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, X, AlertCircle, MapPin, ChevronRight } from 'lucide-react';

const UserBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'pending'>('upcoming');
  
  // Mock bookings data - in a real app, this would come from Supabase
  const mockBookings = {
    upcoming: [
      {
        id: '1',
        vendor: {
          id: '101',
          name: 'Royal Caterers',
          image: 'https://images.pexels.com/photos/5779787/pexels-photo-5779787.jpeg',
          city: 'Mumbai'
        },
        date: '2025-09-15',
        eventType: 'Wedding',
        status: 'confirmed',
        time: '6:00 PM - 10:00 PM',
        guests: 150,
        totalAmount: 75000,
      },
      {
        id: '2',
        vendor: {
          id: '102',
          name: 'ClickPerfect Photography',
          image: 'https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg',
          city: 'Delhi'
        },
        date: '2025-09-15',
        eventType: 'Wedding',
        status: 'confirmed',
        time: '4:00 PM - 9:00 PM',
        guests: 150,
        totalAmount: 35000,
      }
    ],
    pending: [
      {
        id: '3',
        vendor: {
          id: '103',
          name: 'Grand Celebrations Venue',
          image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
          city: 'Hyderabad'
        },
        date: '2025-10-20',
        eventType: 'Corporate Event',
        status: 'pending',
        time: '9:00 AM - 5:00 PM',
        guests: 80,
        totalAmount: 120000,
      }
    ],
    past: [
      {
        id: '4',
        vendor: {
          id: '104',
          name: 'Melody Makers',
          image: 'https://images.pexels.com/photos/2444860/pexels-photo-2444860.jpeg',
          city: 'Chennai'
        },
        date: '2023-07-10',
        eventType: 'Birthday Party',
        status: 'completed',
        time: '7:00 PM - 11:00 PM',
        guests: 40,
        totalAmount: 15000,
        hasReviewed: true,
      },
      {
        id: '5',
        vendor: {
          id: '105',
          name: 'Sweet Delights Bakery',
          image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg',
          city: 'Pune'
        },
        date: '2023-06-25',
        eventType: 'Anniversary',
        status: 'completed',
        time: '6:00 PM - 10:00 PM',
        guests: 25,
        totalAmount: 8000,
        hasReviewed: false,
      }
    ]
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <X size={16} className="text-red-500" />;
      case 'completed':
        return <Check size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'upcoming'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-3 px-5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'past'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Past
        </button>
      </div>
      
      {/* Bookings List */}
      <div className="space-y-4">
        {mockBookings[activeTab].length > 0 ? (
          mockBookings[activeTab].map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-32 md:h-auto">
                  <img 
                    src={booking.vendor.image} 
                    alt={booking.vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 
                        className="text-xl font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition"
                        onClick={() => navigate(`/vendors/${booking.vendor.id}`)}
                      >
                        {booking.vendor.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <MapPin size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{booking.vendor.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      {getStatusIcon(booking.status)}
                      <span className="ml-2 text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(booking.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Event Type</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{booking.eventType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3 md:mt-0">
                      {activeTab === 'past' && !booking.hasReviewed && (
                        <button 
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition flex items-center"
                        >
                          <Star size={16} className="mr-2" />
                          Write Review
                        </button>
                      )}
                      <button 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition flex items-center"
                        onClick={() => navigate(`/vendors/${booking.vendor.id}`)}
                      >
                        View Details
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="mb-4">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                {activeTab === 'upcoming' ? (
                  <Calendar size={32} className="text-gray-500 dark:text-gray-400" />
                ) : activeTab === 'pending' ? (
                  <Clock size={32} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <Check size={32} className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming bookings. Start planning your next event!"
                : activeTab === 'pending'
                ? "You don't have any pending booking requests."
                : "You don't have any past bookings."
              }
            </p>
            {(activeTab === 'upcoming' || activeTab === 'pending') && (
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                onClick={() => navigate('/')}
              >
                Find Vendors
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;