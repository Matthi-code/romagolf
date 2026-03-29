# 📋 Project Brief

> Dit document beschrijft het project en de gekozen aanpak.
> **Wordt ingevuld door `/interview` command** — Run dit eerst!

---

## Project Overzicht

| Aspect | Waarde |
|--------|--------|
| **Naam** | appromagolf |
| **Type** | _[web/api/saas/data/automation]_ |
| **Doel** | _[prototype/demo/mvp/production]_ |
| **Tijdlijn** | _[1-2 dagen / 1 week / 2-4 weken / langer]_ |
| **Gestart** | 2026-03-29 |

---

## Beschrijving

App waarin we de scores bijhouden van de golfwedstrijden

---

## Development Aanpak

| Aspect | Waarde |
|--------|--------|
| **Stijl** | _[Ralph Wiggum loops / KISS-TDD / vibe coding / hybrid]_ |
| **Begeleiding** | _[autopilot / co-pilot / manual]_ |
| **Ralph Wiggum** | _[✅ Enabled / ❌ Disabled]_ |

### Wat betekent dit?

| Stijl | Beschrijving |
|-------|--------------|
| **Ralph Wiggum loops** | Claude werkt autonoom door taken heen, jij reviewt achteraf |
| **KISS-TDD** | Test-driven development, kleine stappen, quality first |
| **Vibe coding** | Snel itereren, testen en refactor later |
| **Hybrid** | Start vibe, refactor met tests als het werkt |

| Begeleiding | Beschrijving |
|-------------|--------------|
| **Autopilot** | Claude beslist zelf bij twijfel, jij reviewt resultaat |
| **Co-pilot** | Claude stelt opties voor, jij kiest |
| **Manual** | Jij geeft expliciete instructies |

---

## Tech Stack

| Component | Keuze |
|-----------|-------|
| **Backend** | _[Python+FastAPI / Python+Django / Node.js / geen]_ |
| **Database** | _[SQLite / PostgreSQL / MySQL / geen]_ |
| **Frontend** | _[HTMX+Jinja / React+Next.js / Astro / Plain HTML / n.v.t.]_ |

---

## Deployment

| Aspect | Waarde |
|--------|--------|
| **Target** | _[lokaal / OrbStack / eigen server / cloud]_ |
| **Productie server** | geen |
| **Dev poort** | 8000 |

---

## Configuratie (voor CLAUDE.md)

```
RALPH_WIGGUM_ENABLED=false
KISS_TDD_ENABLED=false
AUTONOMY_LEVEL=copilot
```

---

## 🎯 Volgende Stappen

> **Dit document is nog niet ingevuld?**
> Run `/interview` om te starten!

> **Na het invullen:**
>
> 1. Run `/spec-interview` om WAT je gaat bouwen te definiëren
> 2. Dit genereert:
>    - `SPEC.md` — referentie document (menselijk leesbaar)
>    - `PROMPT.md` — input voor Ralph Wiggum (als enabled)
> 3. Start development:
>    - Ralph: `/ralph-wiggum:ralph-loop "Lees docs/memory/PROMPT.md"`
>    - Normaal: `/develop`

---

## Notities

_Aanvullende context uit het interview:_

- 
