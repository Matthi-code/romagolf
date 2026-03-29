# 📋 Project Brief

> Vrijmigo — persoonlijke golf-webapp voor Matthi en Rob.

---

## Project Overzicht

| Aspect | Waarde |
|--------|--------|
| **Naam** | Vrijmigo (appromagolf) |
| **Type** | web |
| **Doel** | prototype |
| **Tijdlijn** | 2-4 weken |
| **Gestart** | 2026-03-29 |

---

## Beschrijving

Een persoonlijke golf-webapp voor twee spelers: **Matthi** en **Rob**. Ze spelen op Landgoed Bergvliet in Oosterhout. De app combineert:

1. **Spelersomgeving** — persoonlijk dashboard, statistieken, AI-advies per speler
2. **Competitie-omgeving** — onderlinge stand, head-to-head, anekdotes

Scorekaarten worden gefotografeerd en via Claude Vision automatisch uitgelezen. Weerdata wordt automatisch opgehaald via Open-Meteo.

---

## Development Aanpak

| Aspect | Waarde |
|--------|--------|
| **Stijl** | Vibe coding |
| **Begeleiding** | Co-pilot |
| **Ralph Wiggum** | ❌ Disabled |

---

## Tech Stack

| Component | Keuze |
|-----------|-------|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Database** | Supabase (PostgreSQL, EU Frankfurt) |
| **AI** | Anthropic Claude Vision (claude-sonnet-4-20250514) |
| **Weerdata** | Open-Meteo API (gratis, geen key) |
| **Styling** | Tailwind CSS |
| **Hosting** | Vercel |
| **Auth** | Simpel wachtwoord + naam kiezen |

---

## Deployment

| Aspect | Waarde |
|--------|--------|
| **Target** | Vercel |
| **Dev poort** | 3000 |

---

## Spelers

| Speler | Rol op scorekaart | Kleur |
|--------|-------------------|-------|
| Matthi | Marker (rechts) | Groen (#1a6b3c) |
| Rob | Speler (links) | Rood (#c0392b) |

---

## Golfbaan

- **Naam:** Landgoed Bergvliet
- **Locatie:** Oosterhout
- **Coördinaten:** lat 51.6419, lon 4.8652
- **Lus A:** holes 1-9, par 36
- **Lus B:** holes 10-18, par 35

---

## Historische Data

153 rondes van april 2024 t/m maart 2026, beschikbaar in `docs/seed-data/rounds.json`.

| Seizoen | Rondes | Winnaar |
|---------|--------|---------|
| Zomer 2024 | 48 | Matthi (26-20, 2 gelijk) |
| Winter 24-25 | 24 | Matthi (11-10, 3 gelijk) |
| Zomer 2025 | 61 | Matthi (30-24, 7 gelijk) |
| Winter 25-26 | 20 | Matthi (12-6, 2 gelijk) |
| **Totaal** | **153** | **Matthi (79-60, 14 gelijk)** |

---

## Notities

- Seizoenen: Zomer (apr-nov) = strokeplay, Winter (nov-mrt) = matchplay
- Putts altijd uitdrukken als putts_per_hole voor eerlijke vergelijking
- Mobile-first — primair op telefoon gebruikt (op de baan)
- Veel historische data mist putts, stableford en weerdata
