// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";

const KEYWORDS = ["pre-release", "premier", "great", "ultra", "master"];

Deno.serve(() => {
  const supabase = getSupabaseClient();

  for (const keyword of KEYWORDS) {
    supabase.functions.invoke("browse-by-keyword", {
      body: {
        keyword,
      },
    });
  }

  const data = {
    message: `Fetching the ff. keywords: ${KEYWORDS.join(", ")}`,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});
