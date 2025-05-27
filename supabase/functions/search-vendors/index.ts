import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || "";
    const vendorType = searchParams.get("vendorType") || "";
    const budget = searchParams.get("budget") || "";

    let query = supabase
      .from("vendors")
      .select(`
        id,
        user_id,
        business_name,
        city,
        phone,
        email,
        description,
        logo_url,
        website,
        services:services (
          id,
          type,
          min_price,
          max_price,
          description,
          event_types_supported
        )
      `);

    if (location.trim() !== "") {
      query = query.ilike("city", `%${location.trim()}%`);
    }

    if (vendorType.trim() !== "") {
      query = query.or(`services.type.ilike.%${vendorType.trim()}%`);
    }

    if (budget.trim() !== "") {
      const budgetNum = parseInt(budget, 10);
      if (!isNaN(budgetNum)) {
        query = query.lte("services.max_price", budgetNum);
      }
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
