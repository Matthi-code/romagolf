# CLAUDE.md — Instructies voor Claude CLI

Dit bestand vertelt Claude CLI alles wat het moet weten over het Vrijmigo project.

---

## Wat is Vrijmigo?

Een persoonlijke golf-webapp voor twee spelers: **Matthi** en **Rob**. Ze spelen op Landgoed Bergvliet in Oosterhout (lat: 51.6419, lon: 4.8652). De app heeft twee omgevingen:

1. **Spelersomgeving** — persoonlijk dashboard, stats, AI-advies per speler
2. **Competitie-omgeving** — onderlinge stand, head-to-head, anekdotes

Lees altijd de volgende documenten bij het starten van een taak:
- `PRD.md` — volledige product requirements
- `DATAMODEL.md` — database schema
- `ARCHITECTUUR.md` — technische structuur en stack

---

## Kernregels

### Seizoenen en spelwijze
- **Zomer** (april–november) = **strokeplay** — bruto slagen + stableford + HCP
- **Winter** (november–maart) = **matchplay** — gewonnen holes tellen
- Gebruik altijd `lib/utils/season.ts` om seizoen en spelwijze te bepalen

### Spelers
- **Rob** = Speler-kolom op scorekaart (links), kleur `#c0392b`
- **Matthi** = Marker-kolom op scorekaart (rechts), kleur `#1a6b3c`
- Rob schrijft bijna altijd, maar AI leest namen van de kaart

### Statistieken
- **Spelerstats** = ALLE rondes van die speler (solo + samen)
- **Competitiestats** = ALLEEN rondes waar beide spelers aanwezig waren (`is_competition = true`)
- Putts altijd uitdrukken als `putts_per_hole` voor eerlijke vergelijking (9 vs 18 holes)

### Golfbaan
- Standaardbaan: Landgoed Bergvliet, Oosterhout
- Coördinaten voor weerdata: lat 51.6419, lon 4.8652
- Altijd golfbaannaam bijhouden per ronde (uitbreidbaar naar andere banen)

---

## Tech stack (gebruik altijd dit)

- **Framework**: Next.js 14 met App Router
- **Database**: Supabase (queries via `lib/supabase/`)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) via `lib/anthropic/`
- **Weerdata**: Open-Meteo (gratis, geen key) via `lib/weather/`
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

---

## Authenticatie

Simpel systeem — geen echte auth:
1. Wachtwoord `vrijmigo` → toegang
2. Naam kiezen → speler context
3. Sessie in localStorage: `{ playerId, playerName, environment }`

Gebruik `hooks/usePlayer.ts` voor de huidige speler in components.

---

## Patronen

### Supabase query
```typescript
import { createServerClient } from '@/lib/supabase/server';

const supabase = createServerClient();
const { data, error } = await supabase
  .from('v_round_summary')
  .select('*')
  .order('date', { ascending: false });
```

### API route voor AI
```typescript
// app/api/upload/analyze/route.ts
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();

export async function POST(req: Request) {
  const { image_base64 } = await req.json();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: [...] }]
  });
}
```

### Seizoen bepalen
```typescript
import { getSeasonFromDate, getPlayStyle } from '@/lib/utils/season';

const { season, type } = getSeasonFromDate('2025-06-15');
// → { season: 'Zomer 2025', type: 'zomer' }
const playStyle = getPlayStyle(type);
// → 'strokeplay'
```

---

## Historische data

In `seed-data/rounds.json` staan alle 153 historische rondes (april 2024 – maart 2026).

Importeer met:
```bash
npx ts-node scripts/seed-historical-data.ts
```

Schema van elk historisch record:
```json
{
  "date": "2024-04-03",
  "season": "Zomer 2024",
  "lus": "10-18",
  "holes": 9,
  "matthi_score": 57,
  "rob_score": 56,
  "matthi_stb": null,
  "rob_stb": null,
  "matthi_putts": null,
  "rob_putts": null,
  "hcp_matthi": 23.6,
  "hcp_rob": 14.3,
  "winner": "matthi",
  "notes": null
}
```

---

## UI/UX richtlijnen

- **Mobile-first** — de app wordt primair op telefoon gebruikt (op de baan)
- Bottom navigation bar met 4-5 tabs
- Groen (`#1a6b3c`) als primaire kleur voor Matthi, rood (`#c0392b`) voor Rob
- Zandkleur (`#f5f0e8`) als achtergrond
- Donkere header (`#0d2818`) op dashboards
- Seizoen altijd selecteerbaar via dropdown (niet horizontale scroll-tabs)
- Putts altijd tonen als `X putts (Y/hole)` formaat

---

## Wat nog gebouwd moet worden

Prioriteit volgorde:

1. **Database setup** — Supabase schema aanmaken + seed data
2. **Seed script** — 153 historische rondes importeren
3. **Login flow** — wachtwoord + naam kiezen + omgeving kiezen
4. **Competitie stand** — seizoensstand pagina
5. **Spelerdashboard** — persoonlijk overzicht
6. **Rondeslijst** — met filter, seizoen dropdown, putts zichtbaar
7. **Ronde detail** — volledig overzicht incl. putts/hole, weer, opmerking
8. **Upload flow** — foto → Vision → bevestigen → opslaan
9. **Weerdata** — automatisch ophalen bij upload
10. **Statistieken** — putts analyse, slagen/hole, lus-voorkeur
11. **AI advies** — automatisch kort + op verzoek 3 niveaus
12. **Grappige stats** — logboek pagina
13. **HCP grafiek** — beide spelers
14. **Head-to-head** — competitie vergelijking

---

## Veelgemaakte fouten om te vermijden

- Nooit `putts_total` direct vergelijken tussen 9 en 18 holes — gebruik altijd `putts_per_hole`
- Winter = matchplay → geen slagen/hole vergelijking tonen in competitiestats
- HCP alleen tonen bij zomerseizoenen (is null bij winter)
- `is_competition` is false bij solo rondes — nooit in competitiestats meenemen
- Bergvliet is in Oosterhout, niet Zevenbergen
- Lus A = holes 1-9, Lus B = holes 10-18
