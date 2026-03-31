import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { playerName, parStats, totalAvgPutts, insights, season, roundCount } = await req.json();

    const statsText = parStats
      .map((p: { par: number; overPar: number | null; avgPutts: number | null; count: number }) =>
        `Par ${p.par}: gemiddeld +${p.overPar?.toFixed(1) ?? "?"} over par, ${p.avgPutts?.toFixed(1) ?? "?"} putts/hole (${p.count} holes gespeeld)`
      )
      .join("\n");

    const insightsText = insights
      .map((i: { text: string; type: string }) => `${i.type === "strong" ? "Sterk" : "Verbeterpunt"}: ${i.text}`)
      .join("\n");

    const prompt = `Je bent een grappige golfcoach die advies geeft aan amateur golfers. Je bent eerlijk maar altijd bemoedigend en humoristisch. Denk aan een mix van een strenge maar liefdevolle trainer en een stand-up comedian.

Speler: ${playerName}
Seizoen: ${season || "onbekend"}
Aantal rondes: ${roundCount || "onbekend"}
Gemiddeld putts per hole: ${totalAvgPutts?.toFixed(1) ?? "onbekend"}

Statistieken per par-type:
${statsText}

Analyse:
${insightsText}

Geef een kort advies (max 3-4 zinnen) dat:
- Specifiek ingaat op de sterkste en zwakste punten
- Een concrete tip bevat
- Humoristisch is maar niet gemeen
- In het Nederlands is
- Eindigt met een grappige one-liner

Geef ALLEEN het advies, geen intro of afsluiting.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const advice = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "Geen advies beschikbaar.";

    // Save to database
    const supabase = createServerClient();
    const { data: players } = await supabase.from("players").select("id, name");
    const player = players?.find((p) => p.name === playerName);

    if (player) {
      await supabase.from("advice").insert({
        player_id: player.id,
        advice_type: "auto",
        content: advice,
        season: season || null,
      });
    }

    return NextResponse.json({ advice });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI advies mislukt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerName = searchParams.get("player");

    const supabase = createServerClient();
    const { data: players } = await supabase.from("players").select("id, name");
    const player = players?.find((p) => p.name === playerName);

    if (!player) return NextResponse.json({ advice: [] });

    const { data } = await supabase
      .from("advice")
      .select("id, content, season, created_at")
      .eq("player_id", player.id)
      .eq("advice_type", "auto")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({ advice: data || [] });
  } catch {
    return NextResponse.json({ advice: [] });
  }
}
