import { SearchFilters, AISearchResult } from '../types/supabase';

// Function to parse search query to extract filters
// This is a mock implementation - in a real app, we would use OpenAI API
export const parseSearchQuery = async (query: string): Promise<SearchFilters> => {
  // In a real implementation, this would call an OpenAI API endpoint
  // For demo purposes, we'll use a simple parsing logic
  
  const filters: SearchFilters = {};
  
  // Extract location
  const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'jaipur', 'kolkata', 'ahmedabad', 'surat'];
  for (const city of cities) {
    if (query.toLowerCase().includes(city)) {
      filters.location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  
  // Extract event type
  const eventTypes = ['wedding', 'birthday', 'corporate', 'anniversary', 'engagement', 'party'];
  for (const type of eventTypes) {
    if (query.toLowerCase().includes(type)) {
      filters.eventType = type.charAt(0).toUpperCase() + type.slice(1);
      break;
    }
  }
  
  // Extract vendor type
  const vendorTypes = ['catering', 'photographer', 'venue', 'decoration', 'music', 'cake', 'caterer', 'decorator'];
  for (const type of vendorTypes) {
    if (query.toLowerCase().includes(type)) {
      let vendorType = type;
      // Normalize some types
      if (type === 'caterer') vendorType = 'catering';
      if (type === 'photographer') vendorType = 'photography';
      if (type === 'decorator') vendorType = 'decoration';
      
      filters.vendorType = vendorType.charAt(0).toUpperCase() + vendorType.slice(1);
      break;
    }
  }
  
  // Extract budget
  const budgetMatch = query.match(/(\d+)k/i);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1]) * 1000;
    filters.budget = { max: budget };
  }
  
  // More complex budget matches
  const underMatch = query.match(/under\s+(?:Rs\.?|₹)?(\d+)(?:,(\d+))?/i);
  if (underMatch) {
    const amount = underMatch[2] 
      ? parseInt(underMatch[1] + underMatch[2]) 
      : parseInt(underMatch[1]);
    filters.budget = { max: amount };
  }
  
  return filters;
};

// Function to log AI query for analytics and training
export const logAIQuery = async (query: string, result: AISearchResult, userId?: string) => {
  // In a real app, we would log this to Supabase for analytics and future training
  console.log('Logged AI query:', { query, result, userId });
};