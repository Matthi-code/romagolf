# Vrijmigo — Technische Architectuur

## Stack

| Laag | Technologie | Reden |
|------|-------------|-------|
| Frontend | Next.js 14 (App Router) | SSR, mobile-first, Vercel-ready |
| Styling | Tailwind CSS | Snel, responsive, geen aparte CSS files |
| Database | Supabase (PostgreSQL) | EU Frankfurt, RLS, realtime, Storage |
| Bestandsopslag | Supabase Storage | Scorekaart foto's |
| AI scorekaart | Anthropic Claude Vision (claude-sonnet-4-20250514) | Kaart uitlezen |
| AI advies | Anthropic Claude (claude-sonnet-4-20250514) | Spelersadvies genereren |
| Weerdata | Open-Meteo API | Gratis, geen key, historisch + actueel |
| Hosting | Vercel | Gratis tier, automatische deploys |
| Auth | Simpele wachtwoordcode + naam kiezen | Geen accounts nodig |

---

## Projectstructuur

```
vrijmigo/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login + naam kiezen
│   ├── (app)/
│   │   ├── layout.tsx                # Bottom nav + context
│   │   ├── speler/
│   │   │   ├── page.tsx              # Speler dashboard
│   │   │   ├── rondes/
│   │   │   │   ├── page.tsx          # Mijn rondes lijst
│   │   │   │   └── [id]/page.tsx     # Ronde detail
│   │   │   ├── statistieken/
│   │   │   │   └── page.tsx          # Speler statistieken
│   │   │   ├── advies/
│   │   │   │   └── page.tsx          # AI advies (3 niveaus)
│   │   │   └── upload/
│   │   │       └── page.tsx          # Scorekaart uploaden
│   │   └── competitie/
│   │       ├── page.tsx              # Seizoensstand
│   │       ├── head-to-head/
│   │       │   └── page.tsx          # H2H vergelijking
│   │       ├── historie/
│   │       │   └── page.tsx          # Alle seizoenen
│   │       └── logboek/
│   │           └── page.tsx          # Notities + grappige stats
├── components/
│   ├── ui/                           # Herbruikbare UI componenten
│   │   ├── WinBar.tsx
│   │   ├── SeasonDropdown.tsx
│   │   ├── WeatherBadge.tsx
│   │   ├── PlayerAvatar.tsx
│   │   └── StatCard.tsx
│   ├── rounds/
│   │   ├── RoundCard.tsx
│   │   ├── RoundDetail.tsx
│   │   └── ScoreDisplay.tsx
│   ├── stats/
│   │   ├── HcpChart.tsx
│   │   ├── PuttsChart.tsx
│   │   └── WinStreakCard.tsx
│   └── upload/
│       ├── PhotoCapture.tsx
│       ├── ScorecardPreview.tsx
│       └── WeatherFetcher.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── queries.ts                # Herbruikbare queries
│   ├── anthropic/
│   │   ├── vision.ts                 # Scorekaart uitlezen
│   │   └── advice.ts                 # Advies genereren
│   ├── weather/
│   │   └── open-meteo.ts             # Weerdata ophalen
│   ├── stats/
│   │   ├── player-stats.ts           # Spelerstats berekeningen
│   │   ├── competition-stats.ts      # Competitiestats
│   │   └── funny-stats.ts            # Grappige statistieken
│   └── utils/
│       ├── season.ts                 # Seizoen helpers
│       └── scorecard.ts              # Scorekaart helpers
├── types/
│   └── index.ts                      # TypeScript types
├── hooks/
│   ├── usePlayer.ts                  # Huidige speler context
│   ├── useRounds.ts                  # Rondes ophalen
│   └── useStats.ts                   # Stats berekeningen
└── scripts/
    └── seed-historical-data.ts       # Import 153 historische rondes
```

---

## Authenticatie flow

```
1. Gebruiker opent app
2. Geen sessie → redirect naar /login
3. Wachtwoord invullen ("vrijmigo")
4. Naam kiezen: Matthi / Rob
5. Keuze: Mijn spel / Competitie
6. Sessie opgeslagen in localStorage:
   { playerId, playerName, environment }
7. Bij elke route: check sessie → redirect als geen sessie
```

---

## Scorekaart upload flow

```
1. Gebruiker kiest foto (camera of galerij)
2. Frontend: basis64 encode
3. POST /api/upload/analyze
   Body: { image_base64, date, time, course_hint }
4. Server: stuur naar Claude Vision API
   Prompt: zie PRD sectie 7
5. Claude retourneert JSON:
   {
     course_name, loop, play_style,
     speler: { naam, score, stableford, putts, hole_scores[] },
     marker: { naam, score, stableford, putts, hole_scores[] }
   }
6. Frontend toont preview + bevestigingsscherm
7. Gebruiker vult aan: opmerking, eventuele correcties
8. POST /api/weather
   Body: { date, time, lat, lon }
9. Open-Meteo retourneert weerdata
10. POST /api/rounds/save
    Body: { round_data, players_data, weather_data }
11. Supabase: insert rounds + round_players + hole_scores + weather
12. Trigger: genereer automatisch kort AI-advies
13. Redirect naar ronde detail
```

---

## AI Vision prompt (uitgebreid)

```
Dit is een scorekaart van een golfbaan in Nederland.
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
  "speler_score": totaal bruto slagen,
  "speler_stableford": totaal stableford punten,
  "speler_putts": totaal putts of null,
  "marker_naam": "naam of null",
  "marker_score": totaal bruto slagen,
  "marker_stableford": totaal stableford punten,
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
}
```

---

## AI Advies generatie

### Automatisch kort advies (na elke ronde)

```typescript
// lib/anthropic/advice.ts
async function generateAutoAdvice(
  playerName: string,
  currentRound: RoundSummary,
  recentRounds: RoundSummary[],  // laatste 10 rondes
  seasonAvg: PlayerSeasonStats
): Promise<string> {
  const prompt = `
Je bent een golf-coach die ${playerName} analyseert.

Huidige ronde:
- Datum: ${currentRound.date}
- Baan: ${currentRound.course}
- Score: ${currentRound.score} slagen (${currentRound.holes} holes)
- Putts: ${currentRound.putts} (gem ${currentRound.puttsPerHole}/hole)
- Weer: ${currentRound.weather}
- Gewonnen: ${currentRound.won ? 'ja' : 'nee'}

Seizoensgemiddelde:
- Gem slagen/hole: ${seasonAvg.avgPerHole}
- Gem putts/hole: ${seasonAvg.avgPuttsPerHole}
- Win%: ${seasonAvg.winPct}%

Geef 2-3 korte, concrete bullets in het Nederlands.
Focus op wat opvalt in deze specifieke ronde t.o.v. het gemiddelde.
Wees direct en specifiek, geen algemeenheden.
  `;
}
```

---

## Weerdata (Open-Meteo)

```typescript
// lib/weather/open-meteo.ts
async function fetchWeather(
  date: string,      // YYYY-MM-DD
  time: string,      // HH:MM
  lat: number,       // 51.6419
  lon: number        // 4.8652
): Promise<WeatherData> {
  const hour = parseInt(time.split(':')[0]);
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation,windspeed_10m,weathercode` +
    `&start_date=${date}&end_date=${date}` +
    `&timezone=Europe/Amsterdam`;
  // ...
}
```

---

## Seizoen helpers

```typescript
// lib/utils/season.ts

function getSeasonFromDate(date: string): { season: string, type: 'zomer' | 'winter' } {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  // Zomer: april (4) t/m november (11)
  // Winter: november (11) t/m maart (3) van het volgende jaar
  if (month >= 4 && month <= 10) {
    return { season: `Zomer ${year}`, type: 'zomer' };
  } else if (month === 11) {
    return { season: `Winter ${year}-${String(year+1).slice(2)}`, type: 'winter' };
  } else {
    // jan, feb, mrt
    return { season: `Winter ${year-1}-${String(year).slice(2)}`, type: 'winter' };
  }
}

function getPlayStyle(seasonType: 'zomer' | 'winter'): 'strokeplay' | 'matchplay' {
  return seasonType === 'zomer' ? 'strokeplay' : 'matchplay';
}
```

---

## Grappige statistieken

```typescript
// lib/stats/funny-stats.ts

interface FunnyStat {
  label: string;
  value: string;
  player?: string;
  date?: string;
  notes?: string;
}

function generateFunnyStats(rounds: RoundSummary[]): FunnyStat[] {
  return [
    worstRoundEver(rounds),
    longestWinStreak(rounds),
    mostPuttsInRound(rounds),
    ruudEffect(rounds),       // resultaten als Ruud meespeelt
    mostWindyWin(rounds),     // beste prestatie bij >25 km/h wind
    mostLopsidedResult(rounds), // grootste scoreverschil
    // etc.
  ];
}
```

---

## Environment variabelen

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=xxx
APP_PASSWORD=vrijmigo
```

---

## Deployment (Vercel)

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build

# Deploy
vercel deploy --prod
```

Vercel env variabelen instellen via dashboard of CLI:
```bash
vercel env add ANTHROPIC_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add APP_PASSWORD
```
