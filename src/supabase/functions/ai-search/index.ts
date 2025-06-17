import { createClient } from '@supabase/supabase-js';
import { ParsedEvent, SearchFilters } from '../../../types/supabase';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// For demo, this is a simple regex-based implementation
// In a real app, you would use a more sophisticated approach with OpenAI
const parseSearchQuery = (query: string): SearchFilters => {
  const filters: SearchFilters = {};
  
  // Extract location
  const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'jaipur', 'kolkata'];
  for (const city of cities) {
    if (query.toLowerCase().includes(city)) {
      filters.location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  
  // Extract event type
  const eventTypes = ['wedding', 'birthday', 'corporate', 'anniversary', 'engagement'];
  for (const type of eventTypes) {
    if (query.toLowerCase().includes(type)) {
      filters.eventType = type.charAt(0).toUpperCase() + type.slice(1);
      break;
    }
  }
  
  // Extract vendor type
  const vendorTypes = ['catering', 'photographer', 'venue', 'decoration', 'music', 'cake'];
  for (const type of vendorTypes) {
    if (query.toLowerCase().includes(type)) {
      let vendorType = type;
      // Normalize some types
      if (type === 'photographer') vendorType = 'photography';
      
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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  
  try {
    const { query, userId } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Parse the search query
    const parsedFilters = parseSearchQuery(query);
    
    // Create a response object
    const result: ParsedEvent = {
      filters: parsedFilters,
      originalQuery: query,
    };
    
    // Log the query to the database
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await supabaseAdmin
        .from('ai_query_log')
        .insert({
          user_id: userId || null,
          query_text: query,
          ai_parsed_data: result,
        });
    }
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});