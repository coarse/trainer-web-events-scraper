// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { getFormattedCurrentDate, getTodayMidnight } from "../_shared/date.ts";
import { getId } from "../_shared/regex.ts";

const BASE_URL = "https://asia.pokemon-card.com";

interface Data {
  keyword: string;
}

Deno.serve(async (req) => {
  const { keyword }: Data = await req.json();
  const startDate = getFormattedCurrentDate();
  let pageNo = 1;
  const ids: string[] = [];

  while (true) {
    const pageUrl = new URL(
      `/ph/event-search/search/?pageNo=${pageNo}&keyword=${keyword}&startDate=${startDate}`,
      BASE_URL,
    );
    const res = await fetch(pageUrl);
    if (!res.ok) break;

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) break;

    const events = [...doc.querySelectorAll("ul.eventList > a")].map((node) => {
      const link = node.getAttribute("href") ?? "";
      return link ? getId(link).toString() : "";
    }).filter(Boolean);

    if (events.length === 0) break;

    ids.push(...events);
    pageNo++;
  }

  const supabase = getSupabaseClient();
  const todayMidnight = getTodayMidnight();
  const { data: existingEvents } = await supabase.from("events").select("id")
    .gte("date", todayMidnight.toISOString()).contains("tags", [keyword]);
  const existingEventIds = existingEvents?.map(({ id }) => id);
  console.log("existing events for keyword", keyword, ":", existingEvents);

  const filteredIds = ids.filter((id) =>
    !existingEventIds?.includes(parseInt(id, 10))
  );

  for (const id of filteredIds) {
    supabase.functions.invoke("save-event", {
      body: {
        id,
        tag: keyword,
      },
    });
  }

  const data = {
    ids: filteredIds,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});
