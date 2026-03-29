import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { round_id, holes } = await req.json();

  if (!round_id || !holes) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const { data: players } = await supabase.from("players").select("id, name");
  const nameToId = new Map(players?.map((p) => [p.name, p.id]) || []);

  // Update individuele hole scores
  for (const h of holes) {
    const playerId = nameToId.get(h.player_name);
    if (!playerId) continue;

    const updates: Record<string, number | null> = {};
    if (h.gross_score !== undefined) updates.gross_score = h.gross_score;
    if (h.putts !== undefined) updates.putts = h.putts;

    await supabase
      .from("hole_scores")
      .update(updates)
      .eq("round_id", round_id)
      .eq("player_id", playerId)
      .eq("hole_number", h.hole_number);
  }

  // Herbereken totalen per speler
  const playerEntries = Array.from(nameToId.entries());
  for (const [name, playerId] of playerEntries) {
    const { data: holeData } = await supabase
      .from("hole_scores")
      .select("gross_score, putts")
      .eq("round_id", round_id)
      .eq("player_id", playerId);

    if (!holeData || holeData.length === 0) continue;

    const totalScore = holeData.reduce((sum, h) => sum + (h.gross_score ?? 0), 0);
    const totalPutts = holeData.reduce((sum, h) => sum + (h.putts ?? 0), 0);
    const holesWithScore = holeData.filter((h) => h.gross_score != null).length;
    const holesWithPutts = holeData.filter((h) => h.putts != null).length;

    const rpUpdates: Record<string, number | null> = {};
    if (holesWithScore > 0) rpUpdates.gross_score = totalScore;
    if (holesWithPutts > 0) {
      rpUpdates.putts_total = totalPutts;
      rpUpdates.putts_per_hole = Math.round((totalPutts / holesWithPutts) * 100) / 100;
    }

    await supabase
      .from("round_players")
      .update(rpUpdates)
      .eq("round_id", round_id)
      .eq("player_id", playerId);
  }

  return NextResponse.json({ ok: true });
}
