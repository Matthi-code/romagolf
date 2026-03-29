import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

const VISION_PROMPT = `Dit is een scorekaart van een golfbaan in Nederland.
Lees alle gegevens zorgvuldig uit en geef ALLEEN een JSON object terug.

De scorekaart heeft deze kolommen (van links naar rechts):
- Hole nummer
- Par
- Afstandskolommen (verschillende tees, negeer deze)
- SI (stroke index)
- Speler: score (bruto slagen), stable (stableford punten)
- Marker: score (bruto slagen), stable (stableford punten)

Let op:
- Rob is bijna altijd de Speler (linkerkolommen)
- Matthi is bijna altijd de Marker (rechterkolommen)
- Maar lees de namen van de kaart als die zichtbaar zijn
- De totaalrij staat onderaan (Out / In / Tot)
- Putts staan soms als klein getal naast de score

Geef dit JSON terug (geen markdown, geen uitleg):
{
  "course_name": "naam van de baan als zichtbaar, anders null",
  "loop": "1-9" of "10-18" of "1-18",
  "holes_played": getal,
  "speler_naam": "naam of null",
  "speler_score": totaal bruto slagen of null,
  "speler_stableford": totaal stableford punten of null,
  "speler_putts": totaal putts of null,
  "marker_naam": "naam of null",
  "marker_score": totaal bruto slagen of null,
  "marker_stableford": totaal stableford punten of null,
  "marker_putts": totaal putts of null,
  "hole_scores": [
    {
      "hole": getal,
      "par": getal,
      "speler_score": getal of null,
      "speler_putts": getal of null,
      "marker_score": getal of null,
      "marker_putts": getal of null
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
