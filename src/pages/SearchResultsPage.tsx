import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Filter, MapPin, Calendar, Star, DollarSign } from 'lucide-react';
import AISearchInput from '../components/search/AISearchInput';
import { supabase } from '../services/supabase';
import { Vendor, SearchFilters } from '../types/supabase';
import { parseSearchQuery } from '../utils/aiSearch';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const queryParam = params.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Mock function to simulate AI parsing
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      // Parse the search query to extract filters
      const parsedFilters = await parseSearchQuery(searchQuery);
      setFilters(parsedFilters);
      
      // In a real implementation, we would use these filters to query Supabase
      // For demo purposes, we'll just fetch all vendors
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          services(*),
          vendor_images(*)
        `)
        .limit(10);
        
      if (error) throw error;
      
      setVendors(data as unknown as Vendor[]);
    } catch (error) {
      console.error('Search error:', error);
      // In a real app, we would handle this error properly
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (queryParam) {
      handleSearch();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);
  
  // For demo purposes, we'll use mock data
  const mockVendors = [
    {
      id: '1',
      business_name: 'Royal Caterers',
      city: 'Mumbai',
      description: 'Exquisite catering for all your special events, from weddings to corporate gatherings.',
      rating: 4.8,
      reviews: 124,
      min_price: 25000,
      max_price: 100000,
      services: ['Catering', 'Buffet', 'Live Counters'],
      image: 'https://images.pexels.com/photos/5779787/pexels-photo-5779787.jpeg',
    },
    {
      id: '2',
      business_name: 'ClickPerfect Photography',
      city: 'Delhi',
      description: 'Capture your special moments with our professional photography and videography services.',
      rating: 4.9,
      reviews: 89,
      min_price: 15000,
      max_price: 50000,
      services: ['Photography', 'Videography', 'Photo Booth'],
      image: 'https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg',
    },
    {
      id: '3',
      business_name: 'Floral Dreams',
      city: 'Bangalore',
      description: 'Transform your event space with our stunning floral arrangements and decorations.',
      rating: 4.7,
      reviews: 67,
      min_price: 10000,
      max_price: 60000,
      services: ['Decoration', 'Floral Arrangements', 'Lighting'],
      image: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg',
    },
    {
      id: '4',
      business_name: 'Grand Celebrations Venue',
      city: 'Hyderabad',
      description: 'A luxurious venue for your wedding, corporate event, or special celebration.',
      rating: 4.6,
      reviews: 42,
      min_price: 50000,
      max_price: 200000,
      services: ['Venue', 'Catering', 'Decoration'],
      image: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
    },
    {
      id: '5',
      business_name: 'Melody Makers',
      city: 'Chennai',
      description: 'Professional DJs and live music performers to keep your guests entertained.',
      rating: 4.5,
      reviews: 38,
      min_price: 8000,
      max_price: 35000,
      services: ['DJ', 'Live Band', 'Sound System'],
      image: 'https://images.pexels.com/photos/2444860/pexels-photo-2444860.jpeg',
    },
    {
      id: '6',
      business_name: 'Sweet Delights Bakery',
      city: 'Pune',
      description: 'Delicious cakes and desserts for birthdays, weddings, and all special occasions.',
      rating: 4.9,
      reviews: 112,
      min_price: 3000,
      max_price: 20000,
      services: ['Cakes', 'Desserts', 'Custom Orders'],
      image: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg',
    },
  ];
  
  const handleSubmitSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitSearch();
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <AISearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onSearch={handleSubmitSearch}
            placeholder="Search for vendors, venues, services..."
          />
        </div>
        
        {/* AI Search Interpretation */}
        {queryParam && !loading && (
          <div className="mb-8 max-w-4xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              We understood your search as:
            </h2>
            <div className="flex flex-wrap gap-3">
              {filters.location && (
                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 py-1 px-3 rounded-full text-sm flex items-center">
                  <MapPin size={14} className="mr-1" /> {filters.location}
                </div>
              )}
              {filters.eventType && (
                <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 py-1 px-3 rounded-full text-sm flex items-center">
                  <Calendar size={14} className="mr-1" /> {filters.eventType} Event
                </div>
              )}
              {filters.vendorType && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-1 px-3 rounded-full text-sm flex items-center">
                  <Star size={14} className="mr-1" /> {filters.vendorType}
                </div>
              )}
              {filters.budget?.max && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 py-1 px-3 rounded-full text-sm flex items-center">
                  <DollarSign size={14} className="mr-1" /> Under ₹{filters.budget.max.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <Filter size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              
              {/* Filter Categories */}
              <div className="space-y-5">
                {/* Vendor Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Type</h4>
                  <div className="space-y-2">
                    {['Catering', 'Photography', 'Venue', 'Decoration', 'Music', 'Cake'].map(type => (
                      <label key={type} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h4>
                  <div className="space-y-2">
                    {['Under ₹10,000', '₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000 - ₹100,000', 'Above ₹100,000'].map(range => (
                      <label key={range} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          {rating}+ <Star size={12} className="inline-block mb-0.5 ml-0.5 fill-yellow-500 text-yellow-500" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</h4>
                  <div className="space-y-2">
                    {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'].map(city => (
                      <label key={city} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <button className="w-full py-2 mt-6 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded font-medium text-sm">
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : mockVendors.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mockVendors.length} vendors found
                  </h2>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Sort by:</span>
                    <select className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded py-1 px-2">
                      <option>Relevance</option>
                      <option>Price (Low to High)</option>
                      <option>Price (High to Low)</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>
                
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {mockVendors.map((vendor, index) => (
                    <motion.div
                      key={vendor.id}
                      variants={itemVariants}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-48 md:h-auto">
                          <img 
                            src={vendor.image} 
                            alt={vendor.business_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{vendor.business_name}</h3>
                            <div className="flex items-center">
                              <Star size={16} className="text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{vendor.rating}</span>
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({vendor.reviews})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <MapPin size={16} className="text-gray-500 dark:text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{vendor.city}</span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                            {vendor.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {vendor.services.map((service, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-1 px-2 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Price Range: </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ₹{vendor.min_price.toLocaleString()} - ₹{vendor.max_price.toLocaleString()}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => navigate(`/vendors/${vendor.id}`)}
                              className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-300 transition"
                            >
                              View Details <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <div className="mb-4">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Search size={32} className="text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No vendors found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We couldn't find any vendors matching your search criteria. Try adjusting your filters or search for something else.
                </p>
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;