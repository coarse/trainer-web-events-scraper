import { getSupabaseClient } from "../_shared/supabase.ts";

export default async function saveToDb(row: {
  id: number;
  event_url: string;
  shop_name: string;
  fee: number;
  capacity: number;
  reg_end: string;
}) {
  console.log("[saveEvent] inserting row");

  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("websites")
    .insert(row)
    .select("*")
    .single()
    .throwOnError();

  console.log("[saveWebsite] inserted with id:", data?.id);
  return data;
}
