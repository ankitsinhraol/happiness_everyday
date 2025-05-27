import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { customer_id, vendor_id, service_type, event_date, event_type, message } = body;

      const { data, error } = await supabase
        .from("vendor_bookings")
        .insert([
          {
            customer_id,
            vendor_id,
            service_type,
            event_date,
            event_type,
            message,
            status: "pending",
          },
        ]);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // TODO: Notify vendor via dashboard or other means

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const vendor_id = searchParams.get("vendor_id");
      const customer_id = searchParams.get("customer_id");

      let query = supabase.from("vendor_bookings").select("*");

      if (vendor_id) {
        query = query.eq("vendor_id", vendor_id);
      }
      if (customer_id) {
        query = query.eq("customer_id", customer_id);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
