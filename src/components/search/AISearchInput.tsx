import React from 'react';
import { Search, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface AISearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

const AISearchInput: React.FC<AISearchInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onSearch,
  placeholder = "Search vendors...",
  className = "",
}) => {
  return (
    <motion.div 
      className={`relative w-full ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full py-4 px-5 pr-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        
        <div className="absolute right-0 flex items-center gap-2 mr-4">
          <button
            type="button"
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Voice search"
          >
            <Mic size={18} />
          </button>
          
          <button
            type="button"
            onClick={onSearch}
            className="p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
      
      <motion.div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 rounded-full opacity-70"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.7, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.div>
  );
};

export default AISearchInput;