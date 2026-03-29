# 🗺️ Roadmap

> Planning en fasering van Vrijmigo.

---

## Project Doel

Golf-webapp voor Matthi en Rob: scores bijhouden, competitie volgen, AI-advies ontvangen.

---

## Status

| Fase | Status |
|------|--------|
| Fase 0: Planning & Setup | 🟡 Actief |
| Fase 1: Database & Seed | ⬜ Todo |
| Fase 2: Login & Navigatie | ⬜ Todo |
| Fase 3: Core Pagina's | ⬜ Todo |
| Fase 4: Upload & AI | ⬜ Todo |
| Fase 5: Statistieken & Polish | ⬜ Todo |

---

## Fase 0: Planning & Setup ← HUIDIGE FASE

- [x] PRD geschreven
- [x] Datamodel ontworpen
- [x] Architectuur bepaald
- [x] Migration SQL klaar
- [x] Seed data (153 rondes) klaar
- [x] CLAUDE.md, PROJECT_BRIEF, SPEC, ROADMAP ingevuld
- [ ] Next.js project initialiseren
- [ ] Supabase project aanmaken
- [ ] Environment variabelen instellen (.env.local)

---

## Fase 1: Database & Seed

- [ ] Supabase migration uitvoeren (docs/supabase/migration.sql)
- [ ] Seed data importeren (153 rondes via seed script)
- [ ] Supabase client configureren (lib/supabase/client.ts + server.ts)
- [ ] Basis queries testen (v_round_summary view)

**Checkpoint:** Data opvraagbaar via Supabase client

---

## Fase 2: Login & Navigatie

- [ ] Login pagina (wachtwoord "vrijmigo")
- [ ] Naam kiezen (Matthi / Rob)
- [ ] Omgeving kiezen (Mijn spel / Competitie)
- [ ] Sessie opslag (localStorage)
- [ ] Bottom navigation bar
- [ ] Layout met auth check + redirect
- [ ] usePlayer hook

**Checkpoint:** Inloggen werkt, navigatie zichtbaar, sessie blijft behouden

---

## Fase 3: Core Pagina's

- [ ] **Competitiestand** — seizoensstand, winsbalk, dropdown seizoen filter
- [ ] **Spelerdashboard** — laatste rondes, quick stats, HCP
- [ ] **Rondeslijst** — alle rondes met seizoen/lus filter
- [ ] **Ronde detail** — volledig overzicht incl. putts, weer, opmerking
- [ ] Seizoen helpers (lib/utils/season.ts)

**Checkpoint:** Alle leespagina's werken met echte data

---

## Fase 4: Upload & AI

- [ ] Foto uploaden (camera of galerij)
- [ ] Claude Vision API integratie (scorekaart uitlezen)
- [ ] Preview + bevestigingsscherm
- [ ] Weerdata ophalen (Open-Meteo)
- [ ] Ronde opslaan naar Supabase
- [ ] Automatisch kort AI-advies na opslaan
- [ ] AI-advies pagina (3 niveaus)

**Checkpoint:** Volledige upload flow werkt end-to-end

---

## Fase 5: Statistieken & Polish

- [ ] Putts analyse (per lus, seizoen, trend)
- [ ] Slagen/hole statistieken
- [ ] HCP grafiek (zomerseizoenen)
- [ ] Head-to-head vergelijking
- [ ] Grappige statistieken / logboek
- [ ] Error handling & loading states
- [ ] Vercel deployment

**Checkpoint:** App volledig bruikbaar en gedeployed

---

## Backlog / Nice-to-have

- [ ] Weer-invloed analyse (wind, regen vs scores)
- [ ] Tijdstip analyse (ochtend vs middag)
- [ ] "Ruud-effect" statistiek
- [ ] Hole-voor-hole analyse
- [ ] Meerdere golfbanen ondersteunen
- [ ] Push notificaties
- [ ] Scorekaart foto opslaan in Supabase Storage

---

## Afgerond

_Voltooide fasen worden hier naartoe verplaatst._
