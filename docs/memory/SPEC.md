# Specificatie: Vrijmigo

> Golf-webapp voor score bijhouden en onderlinge competitie tussen Matthi en Rob.

---

## Overzicht

Vrijmigo is een mobile-first golf-webapp waarmee twee spelers hun scores bijhouden, scorekaarten uploaden via foto (Claude Vision), en hun onderlinge competitie volgen met statistieken en AI-advies.

---

## Context

| Aspect | Waarde |
|--------|--------|
| **Type** | web |
| **Doel** | prototype |
| **Primaire gebruiker** | Matthi en Rob (2 spelers) |
| **Auth vereist** | Simpel wachtwoord + naam kiezen |

---

## Core Functionaliteit

### Type
Dashboard + CRUD + AI-integratie

### Hoofdacties
1. **Scorekaart uploaden** — foto → Claude Vision → bevestigen → opslaan
2. **Rondes bekijken** — lijst met filters op seizoen, lus, speler
3. **Competitiestand volgen** — seizoensstand, wie leidt, winsbalk
4. **Statistieken bekijken** — putts, slagen/hole, HCP verloop, weer-invloed
5. **AI-advies ontvangen** — automatisch na ronde + op verzoek (3 niveaus)

---

## User Flow (Happy Path)

```
Login (wachtwoord) → Naam kiezen → Kies omgeving (Mijn spel / Competitie)
  ├─ Mijn spel → Dashboard → Rondes / Stats / Advies / Upload
  └─ Competitie → Stand → Head-to-head / Historie / Logboek
```

### Upload flow
```
Foto maken → Tijdstip invullen → Claude Vision leest uit → Preview → Correcties → Weer ophalen → Opslaan → Auto-advies
```

---

## Data Model

### Entiteiten

| Entiteit | Beschrijving | Belangrijke velden |
|----------|--------------|-------------------|
| players | Spelers | name, color, hcp_current |
| courses | Golfbanen | name, location, lat/lon |
| course_holes | Par/SI per hole | hole_number, par, si, loop |
| rounds | Gespeelde rondes | date, season, play_style, loop, holes_played, is_competition |
| round_players | Score per speler per ronde | gross_score, stableford, putts, hcp, is_winner |
| hole_scores | Score per hole (optioneel) | hole_number, gross_score, putts |
| weather | Weerdata per ronde | temp, wind, neerslag, beschrijving |
| advice | AI-adviezen | advice_type (auto/kort/middel/uitgebreid), content |

### Relaties

```
players 1──N round_players N──1 rounds 1──1 weather
                │                    │
                └──N hole_scores     └──N advice
courses 1──N course_holes
courses 1──N rounds
```

---

## Features

### 🔴 Must Have (MVP)
- [x] Database schema + migratie (klaar in docs/supabase/migration.sql)
- [x] Seed data 153 rondes (klaar in docs/seed-data/rounds.json)
- [ ] Login flow (wachtwoord + naam + omgeving kiezen)
- [ ] Competitiestand (seizoensstand pagina)
- [ ] Spelerdashboard (persoonlijk overzicht)
- [ ] Rondeslijst (met seizoen filter)
- [ ] Ronde detail pagina

### 🟡 Should Have (v1.1)
- [ ] Scorekaart upload via foto (Claude Vision)
- [ ] Weerdata ophalen (Open-Meteo)
- [ ] Statistieken (putts, slagen/hole, lus-voorkeur)
- [ ] AI-advies (automatisch + op verzoek)

### 🟢 Nice to Have (later)
- [ ] Grappige statistieken / logboek
- [ ] HCP grafiek
- [ ] Head-to-head vergelijking
- [ ] Hole-voor-hole analyse
- [ ] Meerdere golfbanen ondersteunen

---

## Constraints

| Constraint | Reden |
|------------|-------|
| Putts altijd als putts_per_hole vergelijken | 9 vs 18 holes eerlijk vergelijken |
| Winter = matchplay stats only | Geen slagen/hole in competitiestats tonen |
| HCP alleen bij zomerseizoenen | Is null bij winter |
| is_competition check | Solo rondes nooit in competitiestats |
| Mobile-first | App wordt op de baan gebruikt |

---

## Edge Cases

| Situatie | Verwacht gedrag |
|----------|-----------------|
| Null putts/stableford | Graceful tonen: "-" of "n.b." |
| 8 holes gespeeld | Accepteren (komt voor in data) |
| Solo ronde | Markeer, niet in competitiestats |
| Winterronde zonder scores | Alleen matchplay resultaat tonen |
| Foto niet leesbaar | Handmatig invoeren als fallback |

---

## Technische Context

| Component | Keuze |
|-----------|-------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | Supabase (PostgreSQL) |
| AI | Claude Vision (claude-sonnet-4-20250514) |
| Weer | Open-Meteo API |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

## UI/UX Richtlijnen

- Mobile-first, bottom navigation (4-5 tabs)
- Matthi = groen (#1a6b3c), Rob = rood (#c0392b)
- Achtergrond: zandkleur (#f5f0e8)
- Header: donkergroen (#0d2818)
- Seizoen selecteerbaar via dropdown
- Putts tonen als "X putts (Y/hole)"

---

*Laatst bijgewerkt: 2026-03-29*
