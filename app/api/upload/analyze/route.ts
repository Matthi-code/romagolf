import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

const VISION_PROMPT = `Dit is een scorekaart van een golfbaan in Nederland (Landgoed Bergvliet).
Lees alle gegevens ZEER ZORGVULDIG uit en geef ALLEEN een JSON object terug.

STAP 1 — LEES EERST DE HEADER (bovenste rij):
De header bevat gedrukte kolomnamen en handgeschreven tekst erboven/erin.
Kijk naar de rechterhelft van de header waar "Speler" en "Marker" staat:
- Bij de kolom "Speler" staat een handgeschreven "R" (Rob). LINKS van deze R staat een decimaal getal — dit is Rob's HCP (bijv. 16,2 of 15,4)
- Bij de kolom "Marker" staat een handgeschreven "M" (Matthi). LINKS van deze M staat een decimaal getal — dit is Matthi's HCP (bijv. 19,9 of 20,1)
- HCP waarden zijn getallen als 16,2 of 19,9 — NIET de datum (die heeft een / erin)
- Rob's HCP ligt ALTIJD tussen 10 en 20 (rond 16). Als je 26,2 leest is dat waarschijnlijk 16,2
- Matthi's HCP ligt rond 20
- Dit is VERPLICHT om uit te lezen. Kijk er goed naar.

STAP 2 — KOLOMMEN op de scorekaart (van links naar rechts):
- Hole nummer (10-18 of 1-9)
- Par
- Afstandskolommen met gekleurde headers (geel/blauw/rood/oranje) — NEGEER deze compleet
- SI (stroke index)
- Kolom 1: Rob SLAGEN (het grote handgeschreven getal)
- Kolom 2: Rob PUTTS (het kleine getal ernaast, soms superscript)
- Kolom 3: Matthi SLAGEN (het grote handgeschreven getal)
- Kolom 4: Matthi PUTTS (het kleine getal ernaast, soms superscript)

STAP 3 — HOE SCORES ZIJN GESCHREVEN:
- Per hole staan er 2 getallen per speler: een GROOT getal (slagen) en een KLEIN getal (putts)
- Voorbeeld: "7³" of "7 3" = score 7 slagen, 3 putts
- Slagen per hole liggen typisch tussen 3 en 9
- Putts per hole liggen typisch tussen 1 en 3
- Lees voor ELKE speler BEIDE getallen uit: slagen EN putts

VERWAR SCORES NIET MET AFSTANDEN:
- Afstanden zijn 3-cijferige getallen (bijv. 306, 285) in de gekleurde kolommen — NEGEER deze
- Scores zijn 1-cijferige getallen (3-9) in de handgeschreven kolommen

De totaalrij staat onderaan (In/Out/Tot). Tel de slagen en putts op.

Geef dit JSON terug (geen markdown, geen uitleg):
{
  "course_name": "naam van de baan als zichtbaar, anders null",
  "loop": "1-9" of "10-18" of "1-18",
  "holes_played": getal,
  "speler_naam": "Rob",
  "speler_hcp": Rob's HCP getal of null,
  "speler_score": Rob totaal bruto slagen of null,
  "speler_stableford": Rob totaal stableford of null,
  "speler_putts": Rob totaal putts of null,
  "marker_naam": "Matthi",
  "marker_hcp": Matthi's HCP getal of null,
  "marker_score": Matthi totaal bruto slagen of null,
  "marker_stableford": Matthi totaal stableford of null,
  "marker_putts": Matthi totaal putts of null,
  "hole_scores": [
    {
      "hole": getal,
      "par": getal,
      "si": getal,
      "speler_score": Rob slagen (GROOT getal),
      "speler_putts": Rob putts (KLEIN getal),
      "marker_score": Matthi slagen (GROOT getal),
      "marker_putts": Matthi putts (KLEIN getal)
    }
  ],
  "opmerking": "Korte opmerking over de ronde, ALLEEN als er iets opvalt: een bijzonder goede of slechte hole, een enorm verschil, een opmerkelijk patroon, of iets grappigs. Mag humoristisch zijn maar niet geforceerd. null als er niets bijzonders is."
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
