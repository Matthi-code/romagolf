# Databronnen

> Overzicht van databronnen voor Vrijmigo.

---

## 📊 Bronnen Overzicht

| Bron | Type | Kosten | Frequentie |
|------|------|--------|------------|
| Scorekaart foto's | Upload (Claude Vision) | ~$0.01/foto | Per ronde |
| Open-Meteo | API | Gratis | Per ronde |
| Historische Excel/JSON | File | Gratis | Eenmalig (seed) |

---

## 🔌 API Bronnen

### Anthropic Claude Vision

| Aspect | Waarde |
|--------|--------|
| Model | claude-sonnet-4-20250514 |
| Auth | API Key (ANTHROPIC_API_KEY) |
| Gebruik | Scorekaart foto's uitlezen |
| Output | JSON met scores, spelers, putts |

### Open-Meteo

| Aspect | Waarde |
|--------|--------|
| URL | `https://api.open-meteo.com/v1/forecast` |
| Auth | Geen (gratis, geen key) |
| Rate Limit | Redelijk — geen strikte limiet |
| Gebruik | Weerdata per ronde (temp, wind, neerslag) |
| Coördinaten | lat 51.6419, lon 4.8652 (Bergvliet, Oosterhout) |
| Historisch | Ja — retroactief beschikbaar |

---

## 📁 File Bronnen

### Historische rondes (rounds.json)

| Aspect | Waarde |
|--------|--------|
| Formaat | JSON |
| Locatie | docs/seed-data/rounds.json |
| Records | 153 rondes (april 2024 – maart 2026) |
| Eenmalig | Ja — import via seed script |

**Datakwaliteit:**
- Vroege rondes missen putts en stableford data
- Winterrondes hebben soms geen scores (alleen matchplay resultaat)
- Sommige rondes hebben 8 holes i.p.v. 9
- Geen weerdata of tijdstippen in historische data

---

## 🔄 Data Flow

```
Scorekaart foto ──→ Claude Vision ──→ JSON scores ──→ Supabase
                                           │
Open-Meteo ──────────────────────────→ Weerdata ──→ Supabase
                                           │
Historische JSON ──→ Seed script ──────────────────→ Supabase
```
