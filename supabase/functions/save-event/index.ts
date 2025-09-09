// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { getCapacity, getDate } from "../_shared/regex.ts";

const BASE_URL = "https://asia.pokemon-card.com";

function getEventUrl(id: string) {
  return new URL(`/ph/event-search/${id}`, BASE_URL);
}

interface Event {
  id: string;
  tag: string;
}

Deno.serve(async (req) => {
  const event: Event = await req.json();
  const url = getEventUrl(event.id);
  const res = await fetch(url);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) return new Response("Failed to parse", { status: 500 });

  const id = event.id;
  const event_url = url.toString();
  const rawEventDate = doc.querySelector("p.eventDate")?.innerText.trim() ?? "";
  const date = getDate(rawEventDate);
  const shop_name = doc.querySelector("#host > header > p.name")?.innerText ??
    "-";

  let fee = 0, capacity = 0;
  const eventOverviewRows = doc.querySelectorAll(
    "#outline > table > tbody > tr",
  );
  for (const row of eventOverviewRows) {
    const label = (row.querySelector("th")?.innerText ?? "").trim();
    const value = (row.querySelector("td")?.innerText ?? "").trim();

    if (label === "Registration Fee") {
      fee = parseInt(value, 10);
    }

    if (label === "Capacity") {
      capacity = getCapacity(value);
    }
  }

  const time = doc.querySelector("#entry > div.lotterySchedule > time")
    ?.getAttribute("datetime");
  const reg_end = Boolean(time)
    ? `${time?.replace(" ", "T")}+08:00`
    : new Date(0).toISOString();

  const row = {
    id,
    event_url,
    date,
    shop_name,
    fee,
    capacity,
    reg_end,
    tags: [event.tag],
  };

  // Save to database
  const supabase = getSupabaseClient();
  const { data: insertData, error } = await supabase.from("events").insert(row);

  const data = {
    message: error ? "An error occuredd" : insertData,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});
