import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Check if user has already set a preference
  const getUserPreference = () => {
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem('darkMode');
      if (storedPreference) {
        return storedPreference === 'true';
      }
      
      // If no preference is stored, check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState(getUserPreference);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Update localStorage and apply class when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', isDarkMode.toString());
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Watch for system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const hasStoredPreference = localStorage.getItem('darkMode') !== null;
        if (!hasStoredPreference) {
          setIsDarkMode(e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return { isDarkMode, toggleDarkMode };
};