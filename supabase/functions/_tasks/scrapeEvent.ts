import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { randomIntegerBetween } from "jsr:@std/random";
import { getCapacity, getDate, getId } from "../_shared/regex.ts";
import { sleep } from "../_shared/utils.ts";

export default async function scrapeEvent(url: string, tag: string) {
  console.log("[scrapeEvent] fetching", url);

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

  // between 1000ms and 3000ms, in increments of 100ms
  const delay = 1000 + (randomIntegerBetween(0, 20) * 100);
  await sleep(delay);

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const html = await res.text();
  const document = new DOMParser().parseFromString(html, "text/html");

  if (!document) throw new Error(`Page seems to be empty - ${url}`);

  const id = getId(url);
  const event_url = url;
  const date = getDate(
    document.querySelector("p.eventDate")?.innerText.trim() ?? "",
  );
  const shop_name =
    document.querySelector("#host > header > p.name")?.innerText ?? "-";

  let fee = 0, capacity = 0;
  const eventOverviewRows = document.querySelectorAll(
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

  const time = document.querySelector("#entry > div.lotterySchedule > time")
    ?.getAttribute("datetime");
  const reg_end = Boolean(time)
    ? `${time?.replace(" ", "T")}+08:00`
    : new Date(0).toISOString();

  return {
    id,
    event_url,
    date,
    shop_name,
    fee,
    capacity,
    reg_end,
    tags: [tag],
  };
}
