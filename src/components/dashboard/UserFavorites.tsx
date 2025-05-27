import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Calendar, DollarSign, Trash2 } from 'lucide-react';

const UserFavorites: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock favorites data - in a real app, this would come from Supabase
  const mockFavorites = [
    {
      id: '1',
      vendor: {
        id: '101',
        name: 'Royal Caterers',
        image: 'https://images.pexels.com/photos/5779787/pexels-photo-5779787.jpeg',
        city: 'Mumbai',
        rating: 4.8,
        reviews: 124,
        minPrice: 700,
        maxPrice: 1500,
        services: ['Catering', 'Buffet', 'Live Counters'],
      },
      dateSaved: '2023-08-12',
    },
    {
      id: '2',
      vendor: {
        id: '102',
        name: 'ClickPerfect Photography',
        image: 'https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg',
        city: 'Delhi',
        rating: 4.9,
        reviews: 89,
        minPrice: 15000,
        maxPrice: 50000,
        services: ['Photography', 'Videography', 'Photo Booth'],
      },
      dateSaved: '2023-08-10',
    },
    {
      id: '3',
      vendor: {
        id: '103',
        name: 'Grand Celebrations Venue',
        image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
        city: 'Hyderabad',
        rating: 4.6,
        reviews: 42,
        minPrice: 50000,
        maxPrice: 200000,
        services: ['Venue', 'Catering', 'Decoration'],
      },
      dateSaved: '2023-08-05',
    },
  ];
  
  const removeFavorite = (id: string) => {
    // In a real app, you would remove this favorite in Supabase
    console.log(`Removing favorite ${id}`);
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Favorites</h2>
      
      {mockFavorites.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {mockFavorites.map((favorite) => (
            <motion.div
              key={favorite.id}
              variants={item}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition group"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-40 md:h-auto relative">
                  <img 
                    src={favorite.vendor.image} 
                    alt={favorite.vendor.name}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                    onClick={() => navigate(`/vendors/${favorite.vendor.id}`)}
                  />
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => removeFavorite(favorite.id)}
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition"
                      aria-label="Remove from favorites"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition"
                        onClick={() => navigate(`/vendors/${favorite.vendor.id}`)}
                      >
                        {favorite.vendor.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{favorite.vendor.city}</span>
                        <span className="mx-1 text-gray-400 dark:text-gray-600">•</span>
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{favorite.vendor.rating}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({favorite.vendor.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>Saved on {new Date(favorite.dateSaved).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3 mb-4">
                    {favorite.vendor.services.map((service, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price Range:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                        ₹{favorite.vendor.minPrice.toLocaleString()} - ₹{favorite.vendor.maxPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => removeFavorite(favorite.id)}
                        className="px-3 py-1.5 text-sm flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                      <button 
                        onClick={() => navigate(`/vendors/${favorite.vendor.id}`)}
                        className="px-3 py-1.5 text-sm flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                      >
                        <DollarSign size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Heart size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't saved any vendors to your favorites list yet.
          </p>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            onClick={() => navigate('/')}
          >
            Explore Vendors
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFavorites;