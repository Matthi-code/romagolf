# 📋 Beslissingen

> Architectuur en design beslissingen met onderbouwing.

---

## Template

```markdown
## [DATUM] — [Korte titel]

**Vraag:** 
Wat was de keuze die gemaakt moest worden?

**Besluit:**
Wat is er gekozen?

**Waarom:**
- Reden 1
- Reden 2

**Afgewezen alternatieven:**
- Alternatief A — waarom niet

**Impact:**
Welke bestanden/systemen worden beïnvloed?
```

---

## Beslissingen

### 2026-03-29 — Project Template

**Vraag:** Welke structuur gebruiken voor het project?

**Besluit:** Claude-template met memory systeem, skills en commands.

**Waarom:**
- Consistente werkwijze
- Context behoud tussen sessies
- Herbruikbaar voor andere projecten

**Impact:** Hele project structuur

---

### 2026-03-29 — Tech Stack: Next.js/TypeScript/Supabase

**Vraag:** Welke tech stack gebruiken? CLAUDE.md root zei Python, docs beschreven Next.js.

**Besluit:** Next.js 14 (App Router) + TypeScript + Supabase + Tailwind CSS + Vercel

**Waarom:**
- Alle gedetailleerde docs (PRD, Architectuur, Datamodel, migration.sql) zijn geschreven voor deze stack
- Seed script en Supabase queries zijn al in TypeScript
- Mobile-first webapp past perfect bij Next.js + Vercel
- Python zou volledige herschrijving van alle docs vereisen

**Afgewezen alternatieven:**
- Python + FastAPI — zou alle voorbereide docs onbruikbaar maken
- Python + Django — overkill voor 2-speler app

**Impact:** CLAUDE.md root geüpdatet, PROJECT_BRIEF, SPEC, ROADMAP ingevuld

---

### 2026-03-29 — Design: zalmgolf.nl geïnspireerd

**Vraag:** Welke visuele stijl voor de app?

**Besluit:** Zalmgolf.nl stijl: clean, wit, compact, zalmroze accenten, monospace cijfers.

**Waarom:**
- Gebruiker vindt zalmgolf.nl mooi en professioneel
- Clean typografie-gedreven design past bij golf
- Zalmroze is warmer en uitnodigender dan donkerblauw
- Monospace cijfers (JetBrains Mono) geven scores een professioneel tabellarisch gevoel

**Afgewezen alternatieven:**
- Donkerblauwe/navy hero cards met foto-overlays — te zwaar en donker
- Grote ronde avatars (R/M cirkels) — te groot, namen voluit schrijven

**Impact:** Alle pagina's behalve login

---

### 2026-03-29 — Winnaar bepaling: netto score

**Vraag:** Hoe wordt de winnaar bepaald bij strokeplay?

**Besluit:** Laagste netto score (bruto gecorrigeerd voor HCP) wint.

**Waarom:**
- Strokeplay = slagen tellen, maar gecorrigeerd voor handicap
- Stableford wordt genoteerd maar is niet bepalend voor winnaar

**Impact:** Upload flow, /scorekaart command, winnaar-logica

---

### 2026-03-29 — App vereenvoudigd: alleen competitie

**Vraag:** Moet de app speler-specifieke omgevingen ondersteunen?

**Besluit:** Nee — app is alleen voor de competitie. Geen naam selectie, geen speler/competitie omgeving keuze. Login = wachtwoord → direct naar competitie.

**Waarom:**
- App is alleen voor Rob en Matthi samen
- Competitie pagina toont altijd beide spelers
- Speler-specifieke dashboards zijn overbodig voor 2 gebruikers

**Afgewezen alternatieven:**
- Naam selectie behouden — onnodige stap
- Aparte speler-omgeving — te complex voor de use case

**Impact:** Login flow, layout, Session type vereenvoudigd

---

### 2026-03-29 — Stableford niet tonen

**Besluit:** ~~Nee, stableford weglaten uit de UI.~~ → **Herzien**: Stableford wordt nu wel getoond en bewerkbaar op de scorekaart pagina (sessie 3, 2026-03-29).

**Impact:** Ronde detail pagina — stableford zichtbaar na putts + bewerkbaar in edit-modus
