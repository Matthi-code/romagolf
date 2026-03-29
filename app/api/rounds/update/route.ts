import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { round_id, player_name, hcp, gross_score, putts_total, stableford_points } = body;

  // Zoek player_id
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("name", player_name)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Speler niet gevonden" }, { status: 404 });
  }

  // Update round_players
  const updates: Record<string, number | null> = {};
  if (hcp !== undefined) updates.hcp_at_time = hcp;
  if (gross_score !== undefined) updates.gross_score = gross_score;
  if (stableford_points !== undefined) updates.stableford_points = stableford_points;
  if (putts_total !== undefined) {
    updates.putts_total = putts_total;
    // Haal holes_played op voor putts_per_hole berekening
    const { data: round } = await supabase
      .from("rounds")
      .select("holes_played")
      .eq("id", round_id)
      .single();
    if (round && putts_total != null) {
      updates.putts_per_hole = Math.round((putts_total / round.holes_played) * 100) / 100;
    }
  }

  const { error } = await supabase
    .from("round_players")
    .update(updates)
    .eq("round_id", round_id)
    .eq("player_id", player.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
