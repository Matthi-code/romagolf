import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { round_id } = await req.json();

  if (!round_id) {
    return NextResponse.json({ error: "round_id is verplicht" }, { status: 400 });
  }

  // Verwijder in juiste volgorde (foreign keys)
  await supabase.from("hole_scores").delete().eq("round_id", round_id);
  await supabase.from("round_players").delete().eq("round_id", round_id);
  await supabase.from("weather").delete().eq("round_id", round_id);

  const { error } = await supabase.from("rounds").delete().eq("id", round_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
