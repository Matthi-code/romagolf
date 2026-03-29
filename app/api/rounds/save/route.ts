import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      date, start_time, season, season_type, play_style, loop, holes_played,
      notes, rob_score, rob_stableford, rob_putts, rob_hcp,
      matthi_score, matthi_stableford, matthi_putts, matthi_hcp,
      winner, weather,
    } = body;

    const supabase = createServerClient();

    // Get player IDs
    const { data: players } = await supabase.from("players").select("id, name");
    if (!players) return NextResponse.json({ error: "Geen spelers" }, { status: 500 });

    const matthi = players.find((p) => p.name === "Matthi");
    const rob = players.find((p) => p.name === "Rob");
    if (!matthi || !rob) return NextResponse.json({ error: "Spelers niet gevonden" }, { status: 500 });

    // Get course
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("is_default", true)
      .single();
    if (!course) return NextResponse.json({ error: "Geen baan gevonden" }, { status: 500 });

    const isCompetition = rob_score != null && matthi_score != null;
    const isDraw = winner === "gelijk";

    // Insert round
    const { data: newRound, error: roundErr } = await supabase
      .from("rounds")
      .insert({
        course_id: course.id,
        date,
        start_time: start_time || null,
        season,
        season_type,
        play_style,
        loop,
        holes_played,
        is_competition: isCompetition,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (roundErr) return NextResponse.json({ error: roundErr.message }, { status: 500 });

    // Insert Matthi
    if (matthi_score != null || matthi_hcp != null) {
      await supabase.from("round_players").insert({
        round_id: newRound.id,
        player_id: matthi.id,
        role: "marker",
        gross_score: matthi_score,
        stableford_points: matthi_stableford,
        putts_total: matthi_putts,
        putts_per_hole: matthi_putts && holes_played ? +(matthi_putts / holes_played).toFixed(2) : null,
        hcp_at_time: matthi_hcp,
        is_winner: winner === "matthi",
        is_draw: isDraw,
      });
    }

    // Insert Rob
    if (rob_score != null || rob_hcp != null) {
      await supabase.from("round_players").insert({
        round_id: newRound.id,
        player_id: rob.id,
        role: "speler",
        gross_score: rob_score,
        stableford_points: rob_stableford,
        putts_total: rob_putts,
        putts_per_hole: rob_putts && holes_played ? +(rob_putts / holes_played).toFixed(2) : null,
        hcp_at_time: rob_hcp,
        is_winner: winner === "rob",
        is_draw: isDraw,
      });
    }

    // Insert weather if available
    if (weather) {
      await supabase.from("weather").insert({
        round_id: newRound.id,
        temperature_c: weather.temperature_c,
        wind_kmh: weather.wind_kmh,
        precipitation_mm: weather.precipitation_mm,
        weather_code: weather.weather_code,
        weather_desc: weather.weather_desc,
        weather_icon: weather.weather_icon,
      });
    }

    return NextResponse.json({ id: newRound.id, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Opslaan mislukt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
