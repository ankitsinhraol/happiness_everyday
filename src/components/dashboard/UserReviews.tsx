import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';

const UserReviews: React.FC = () => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Mock reviews data - in a real app, this would come from Supabase
  const mockReviews = [
    {
      id: '1',
      vendor: {
        id: '104',
        name: 'Melody Makers',
        image: 'https://images.pexels.com/photos/2444860/pexels-photo-2444860.jpeg',
        city: 'Chennai',
      },
      booking: {
        id: '4',
        eventType: 'Birthday Party',
        date: '2023-07-10',
      },
      rating: 5,
      text: 'The DJ was amazing! Everyone had a great time dancing to the music. The song selection was perfect and they were very responsive to requests. Would definitely hire them again for future events.',
      date: '2023-07-15',
      verified: true,
    },
    {
      id: '2',
      vendor: {
        id: '105',
        name: 'Sweet Delights Bakery',
        image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg',
        city: 'Pune',
      },
      booking: {
        id: '5',
        eventType: 'Anniversary',
        date: '2023-06-25',
      },
      rating: 4,
      text: 'The cake was beautiful and tasted great. Everyone loved it. The only reason I\'m giving 4 stars instead of 5 is because it was delivered a bit later than scheduled, but it arrived in perfect condition.',
      date: '2023-06-28',
      verified: true,
    },
  ];
  
  const deleteReview = (id: string) => {
    // In a real app, you would delete the review in Supabase
    console.log(`Deleting review ${id}`);
    setShowDeleteConfirm(null);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Reviews</h2>
      
      {mockReviews.length > 0 ? (
        <motion.div 
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {mockReviews.map((review) => (
            <motion.div
              key={review.id}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/6 flex md:flex-col items-center">
                  <img 
                    src={review.vendor.image} 
                    alt={review.vendor.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer"
                    onClick={() => navigate(`/vendors/${review.vendor.id}`)}
                  />
                  <div className="ml-4 md:ml-0 md:mt-2 text-center">
                    <h3 
                      className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition"
                      onClick={() => navigate(`/vendors/${review.vendor.id}`)}
                    >
                      {review.vendor.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.vendor.city}</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}
                          />
                        ))}
                        {review.verified && (
                          <div className="ml-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle size={14} className="mr-1" />
                            Verified Stay
                          </div>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        <span>Reviewed on {formatDate(review.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/reviews/edit/${review.id}`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
                        aria-label="Edit review"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(review.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        aria-label="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 dark:text-gray-200 mb-3">{review.text}</p>
                  
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg">
                    <span className="font-medium">Event: </span>
                    {review.booking.eventType} on {formatDate(review.booking.date)}
                  </div>
                  
                  {showDeleteConfirm === review.id && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
                      <p className="mb-2">Are you sure you want to delete this review? This action cannot be undone.</p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Star size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't written any reviews for vendors you've used.
          </p>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            onClick={() => navigate('/dashboard')}
          >
            View Your Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default UserReviews;