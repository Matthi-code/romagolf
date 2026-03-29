import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

const VISION_PROMPT = `Dit is een scorekaart van een golfbaan in Nederland (Landgoed Bergvliet).
Lees alle gegevens ZEER ZORGVULDIG uit en geef ALLEEN een JSON object terug.

De scorekaart heeft deze kolommen (van links naar rechts):
- Hole nummer (10-18 of 1-9)
- Par
- Afstandskolommen met gekleurde headers (geel/blauw/rood/oranje) — NEGEER deze compleet
- SI (stroke index)
- Speler kolom: handgeschreven score
- Stable kolom: stableford punten van speler
- Marker kolom: handgeschreven score
- Stable kolom: stableford punten van marker

BELANGRIJK — Hoe scores zijn geschreven:
- De SCORE is het GROTE handgeschreven getal (bijv. 7, 4, 6, 5)
- De PUTTS staan als KLEIN superscript getal NAAST of BOVEN de score (bijv. 7³ = score 7, putts 3)
- Soms staan putts in een apart kleiner vakje naast de score
- De score is ALTIJD het grotere getal, putts is ALTIJD het kleinere getal ernaast
- Scores voor 9 holes liggen typisch tussen 3 en 8 per hole
- Putts per hole liggen typisch tussen 1 en 3

VERWAR SCORES NIET MET AFSTANDEN:
- Afstanden zijn 3-cijferige getallen (bijv. 306, 285, 171) in de gekleurde kolommen — NEGEER deze
- Scores zijn 1-cijferige getallen (3-8) in de Speler/Marker kolommen

Spelers:
- Rob is bijna altijd de Speler (links) — lees de naam bovenaan als die zichtbaar is
- Matthi is bijna altijd de Marker (rechts)
- HCP staat soms bovenaan naast de naam (bijv. "26.2" of "16.8")

De totaalrij staat onderaan (In/Out/Tot). Lees het totaal bruto slagen en putts uit.

Geef dit JSON terug (geen markdown, geen uitleg):
{
  "course_name": "naam van de baan als zichtbaar, anders null",
  "loop": "1-9" of "10-18" of "1-18",
  "holes_played": getal,
  "speler_naam": "naam of null",
  "speler_hcp": HCP getal of null,
  "speler_score": totaal bruto slagen of null,
  "speler_stableford": totaal stableford punten of null,
  "speler_putts": totaal putts of null,
  "marker_naam": "naam of null",
  "marker_hcp": HCP getal of null,
  "marker_score": totaal bruto slagen of null,
  "marker_stableford": totaal stableford punten of null,
  "marker_putts": totaal putts of null,
  "hole_scores": [
    {
      "hole": getal,
      "par": getal,
      "si": getal,
      "speler_score": bruto slagen (het GROTE getal),
      "speler_putts": putts (het KLEINE getal ernaast),
      "marker_score": bruto slagen (het GROTE getal),
      "marker_putts": putts (het KLEINE getal ernaast)
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const { image_base64, media_type } = await req.json();

    if (!image_base64) {
      return NextResponse.json({ error: "Geen afbeelding ontvangen" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: media_type || "image/jpeg",
                data: image_base64,
              },
            },
            {
              type: "text",
              text: VISION_PROMPT,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Geen tekst ontvangen van AI" }, { status: 500 });
    }

    // Parse JSON from response
    let parsed;
    try {
      const jsonStr = textBlock.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        error: "Kon scorekaart niet lezen",
        raw: textBlock.text,
      }, { status: 422 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    console.error("Vision API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
