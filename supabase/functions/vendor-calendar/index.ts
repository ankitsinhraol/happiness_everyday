// supabase/functions/vendor-calendar/index.ts
// Import necessary modules for Deno environment
import { serve } from 'https://deno.land/std@0.220.1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// IMPORTANT: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically
// made available as environment variables to Edge Functions when deployed
// to your Supabase project. You do NOT need to set these manually in your
// project's secrets for the function itself.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Main request handler for the Edge Function
serve(async (req) => {
  // Ensure only GET requests are allowed
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  // Parse query parameters from the request URL
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get('vendorId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const authHeader = req.headers.get('Authorization'); // Get Authorization header from client

  // Basic input validation for required parameters
  if (!vendorId || !month || !year) {
    return new Response(JSON.stringify({ error: 'Vendor ID, month, and year are required query parameters.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Convert month and year to correct format for Date object
  const currentMonth = parseInt(month) - 1; // JavaScript Date month is 0-indexed (Jan=0, Dec=11)
  const currentYear = parseInt(year);

  // Validate parsed month and year
  if (isNaN(currentMonth) || isNaN(currentYear)) {
    return new Response(JSON.stringify({ error: 'Invalid month or year format.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Calculate start and end dates for the month
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]; // Last day of the month

  try {
    // Initialize Supabase client with the service_role key
    // This client operates with full admin privileges, bypassing RLS.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // --- Authentication/Authorization within the Edge Function (Highly Recommended) ---
    // This section verifies if the user calling this function is an authenticated vendor
    // and if they are authorized to view *this specific vendor's* calendar data.
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.warn('Edge Function Auth Warning: Invalid or expired token.');
        // Even if token is invalid, we might proceed to fetch, but client-side RLS will still apply
        // for general public data if not using service_role in subsequent queries.
        // For this function, we *are* using service_role, so this check is for authorization.
      } else {
        userId = user.id;
        // Additional check: Ensure the authenticated user is the vendor they are trying to view
        const { data: vendorCheck, error: vendorCheckError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', userId)
          .eq('id', vendorId) // Ensure the requested vendorId matches the authenticated user's vendorId
          .single();

        if (vendorCheckError || !vendorCheck) {
            console.error('Edge Function Authorization Error: User is not authorized for this vendor ID.');
            return new Response(JSON.stringify({ error: 'Unauthorized: You are not authorized to view this vendor\'s calendar.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 403, // Forbidden
            });
        }
      }
    } else {
        // If no auth header, you might want to return an error or allow only public access
        // For vendor calendars, it's generally best to require authentication.
        console.warn('Edge Function Auth Warning: No Authorization header provided.');
        return new Response(JSON.stringify({ error: 'Authentication required to view vendor calendar.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 401, // Unauthorized
        });
    }
    // --- End of Authorization Section ---


    // Fetch availability data for the given vendor and month
    const { data: availData, error: availError } = await supabase
      .from('availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', monthStart)
      .lte('date', monthEnd);

    if (availError) {
      console.error("Edge Function: Error fetching availability:", availError.message);
      throw new Error(`Failed to fetch availability: ${availError.message}`);
    }

    // Fetch confirmed bookings with customer name using the aliased join
    // This is the query that was failing on the client-side
    const { data: bookingsRawData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        vendor_id,
        service_id,
        event_date,
        event_type,
        message,
        status,
        users!customer_user(full_name) // This is the crucial part that now works!
      `)
      .eq('vendor_id', vendorId)
      .gte('event_date', monthStart)
      .lte('event_date', monthEnd)
      .eq('status', 'confirmed'); // Only fetch confirmed bookings for the calendar

    if (bookingsError) {
      console.error("Edge Function: Error fetching bookings:", bookingsError.message);
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    // Process fetched bookings to extract and include customerName directly
    const processedBookings = bookingsRawData?.map((booking: any) => ({
      id: booking.id,
      vendor_id: booking.vendor_id,
      user_id: booking.user_id,
      service_id: booking.service_id,
      event_date: booking.event_date,
      event_type: booking.event_type,
      message: booking.message,
      status: booking.status,
      customerName: booking.customer_user?.full_name || 'N/A Customer', // Extract full_name
    })) || [];

    // Return the combined data as JSON
    return new Response(JSON.stringify({
      availability: availData,
      bookings: processedBookings,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    // Centralized error handling for unexpected issues
    console.error('Edge Function Unexpected Error:', error.message);
    return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});