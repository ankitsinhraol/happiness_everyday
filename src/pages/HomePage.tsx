import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarRange, Star, Clock, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AISearchInput from '../components/search/AISearchInput';
import Logo from '../components/ui/Logo';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = () => {
    // Store the search query in sessionStorage for the search results page
    sessionStorage.setItem('lastSearchQuery', searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] bg-gradient-to-b from-purple-100 to-white dark:from-gray-800 dark:to-gray-900 flex items-center">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Find Perfect Event <span className="text-purple-600 dark:text-purple-400">Vendors</span> with AI
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
                  Discover and book the best event vendors in your area with our AI-powered search. Just describe what you need in simple words.
                </p>
                
                <div className="max-w-2xl">
                  <AISearchInput 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onSearch={handleSearch}
                    placeholder="Try: 'Wedding photographer in Mumbai under 50k'"
                  />
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 transition"
                    onClick={() => setSearchQuery("Wedding catering in Delhi under 40k")}
                  >
                    Wedding catering
                  </button>
                  <button
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 transition"
                    onClick={() => setSearchQuery("Corporate event venue in Bangalore for 200 people")}
                  >
                    Corporate venues
                  </button>
                  <button
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 transition"
                    onClick={() => setSearchQuery("Birthday photographer in Mumbai around 15k")}
                  >
                    Birthday photographer
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="w-full md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <img 
                  src="https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg" 
                  alt="Event Planning"
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-4 text-white">
                  <p className="text-sm font-semibold">Featured Vendors</p>
                  <div className="flex mt-2 gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Logo size={16} />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Logo size={16} />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Logo size={16} />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <p className="text-xs">+42</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How AllInEvent Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Finding and booking the perfect event vendors has never been easier.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-4 w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <Search className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Describe Your Needs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simply type what you're looking for in plain language. Our AI understands your requirements.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-4 w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Browse Matches</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get intelligent matches based on your location, budget, and event type filtered by AI.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-4 w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                <CalendarRange className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check Availability</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View vendor profiles, reviews, and check real-time availability on their calendars.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book Instantly</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contact and book vendors directly through the platform. It's that simple!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find the perfect vendor for your next event
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Catering", image: "https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg" },
              { name: "Photography", image: "https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg" },
              { name: "Venues", image: "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg" },
              { name: "Decor", image: "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg" },
              { name: "Music", image: "https://images.pexels.com/photos/2444860/pexels-photo-2444860.jpeg" },
              { name: "Transportation", image: "https://images.pexels.com/photos/2036544/pexels-photo-2036544.jpeg" },
            ].map((category, index) => (
              <motion.div
                key={index}
                className="relative rounded-xl overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => {
                  setSearchQuery(`${category.name} for event`);
                  handleSearch();
                }}
              >
                <div className="aspect-square">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-white font-medium p-4">{category.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied users who found their perfect event vendors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Singh",
                role: "Bride",
                text: "AllInEvent helped me find the perfect wedding photographer and caterer with just one search. I didn't have to spend hours comparing vendors!",
                rating: 5,
              },
              {
                name: "Raj Mehta",
                role: "Corporate Event Planner",
                text: "The AI search is incredibly accurate. I described my corporate event needs, and it matched me with vendors that perfectly fit our requirements and budget.",
                rating: 5,
              },
              {
                name: "Ananya Sharma",
                role: "Birthday Party Host",
                text: "Finding a last-minute venue and decorator for my son's birthday was so easy with AllInEvent. The availability calendar feature saved me so much time!",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 dark:bg-purple-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Are You an Event Vendor?
              </h2>
              <p className="text-xl text-purple-100 mb-6 max-w-xl">
                Join our platform to reach more clients and grow your business. Our CRM tools make it easy to manage your bookings.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
                onClick={() => navigate('/register?type=vendor')}
              >
                Register as Vendor
              </motion.button>
            </div>
            
            <div className="md:w-1/2 flex justify-end">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm"
                >
                  <div className="flex items-center mb-4">
                    <RefreshCw className="text-purple-600 dark:text-purple-400 mr-3" size={20} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Vendor Dashboard</h3>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">New Bookings</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">12</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-4">
                    <div className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                      <p className="font-semibold text-gray-900 dark:text-white">₹48,000</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
                      <p className="font-semibold text-gray-900 dark:text-white">4.8 ★</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg text-sm">
                    Go to Dashboard
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;