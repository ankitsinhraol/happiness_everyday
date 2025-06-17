import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { sender_id, receiver_id, content } = body;

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id,
            receiver_id,
            content,
            read: false,
          },
        ]);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      const user1 = searchParams.get("user1");
      const user2 = searchParams.get("user2");

      if (!user1 || !user2) {
        return new Response(JSON.stringify({ error: "Missing user1 or user2 parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
        .order("created_at", { ascending: true });

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
