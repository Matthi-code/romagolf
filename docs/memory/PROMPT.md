# PROMPT.md — appromagolf

> **🤖 Voor Ralph Wiggum autonome loops**
> Gegenereerd door `/spec-interview` op basis van SPEC.md
>
> Start met: `/ralph-wiggum:ralph-loop "Lees docs/memory/PROMPT.md en volg alle instructies" --max-iterations 25 --completion-promise "DONE"`

---

## Doel

_[Korte, duidelijke beschrijving van wat er gebouwd moet worden - één zin]_

---

## Completion Promise

Zeg **"DONE"** wanneer:
- Alle taken in Fase 1-5 zijn afgerond
- Happy path werkt volledig
- Geen errors in console/logs
- README.md is bijgewerkt met setup instructies

---

## Context

| Aspect | Waarde |
|--------|--------|
| **Project** | appromagolf |
| **Type** | data |
| **Doel** | _[Prototype/Demo/MVP/Production]_ |
| **Stack** | Python |
| **Database** | _[SQLite/PostgreSQL/geen]_ |

---

## Taken (in volgorde)

### Fase 1: Setup ⚙️
- [ ] Project structuur aanmaken
- [ ] Dependencies installeren
- [ ] Environment configuratie (.env.example)
- [ ] Database setup (schema/migraties)
- [ ] Basis health check endpoint (als API)
- [ ] Development server draait

**Checkpoint:** `curl localhost:8000/health` werkt (of app start)

### Fase 2: Data Layer 💾
_[Per entiteit uit SPEC.md:]_

- [ ] Model/schema voor _[Entiteit 1]_
- [ ] Model/schema voor _[Entiteit 2]_
- [ ] Model/schema voor _[Entiteit 3]_
- [ ] Relaties tussen entiteiten
- [ ] Seed data voor development

**Checkpoint:** Kan data opslaan en ophalen

### Fase 3: Core Features 🎯
_[Must Have features uit SPEC.md:]_

- [ ] _[Feature 1]_
  - Route/endpoint: _[...]_
  - Logica: _[...]_
- [ ] _[Feature 2]_
  - Route/endpoint: _[...]_
  - Logica: _[...]_  
- [ ] _[Feature 3]_
  - Route/endpoint: _[...]_
  - Logica: _[...]_

**Checkpoint:** Core acties werken

### Fase 4: UI/Routes 🎨
_[Indien web/saas:]_

- [ ] Layout met navigation
- [ ] Homepage/dashboard
- [ ] Lijst pagina (_[entiteit]_)
- [ ] Detail/edit pagina
- [ ] Forms met validatie feedback
- [ ] Basis styling (functioneel, niet fancy)

**Checkpoint:** Gebruiker kan complete flow doorlopen

### Fase 5: Afronding ✅
- [ ] Error handling voor happy path
- [ ] Input validatie (server-side)
- [ ] Loading states (indien UI)
- [ ] README.md met:
  - [ ] Installatie instructies
  - [ ] Environment variabelen
  - [ ] Hoe te starten
- [ ] Handmatige test van complete flow

**Checkpoint:** Alles werkt, README is duidelijk

---

## Constraints ⛔

**Wat mag NIET:**
_[Uit SPEC.md constraints:]_
- _[Constraint 1]_
- _[Constraint 2]_
- _[Constraint 3]_

**Wat is NIET in scope (bewust overslaan):**
_[Nice to Have uit SPEC.md:]_
- _[Feature X]_
- _[Feature Y]_
- _[Optimalisatie Z]_

---

## Bij Twijfel 🤔

1. **Check SPEC.md** — daar staan de details
2. **Check DECISIONS.md** — misschien is dit al besloten
3. **Kies de simpelste oplossing** — KISS principe
4. **Vraag de gebruiker** — via AskUserQuestionTool

```
Voorbeeld vraag:
"Voor [feature X] zijn er twee opties:
A) [optie A] - simpeler maar minder flexibel
B) [optie B] - complexer maar uitbreidbaar
Welke past beter bij dit project?"
```

---

## Verificatie Checklist

Voordat je "DONE" zegt:

- [ ] Fase 1 compleet — project runt
- [ ] Fase 2 compleet — data layer werkt
- [ ] Fase 3 compleet — core features werken
- [ ] Fase 4 compleet — UI/routes werken (indien relevant)
- [ ] Fase 5 compleet — polish en docs
- [ ] Happy path getest
- [ ] Geen console errors
- [ ] README.md bijgewerkt

---

## Referenties

| Document | Gebruik |
|----------|---------|
| `docs/memory/SPEC.md` | Gedetailleerde specificaties |
| `docs/memory/PROJECT_BRIEF.md` | Project context en tech stack |
| `docs/memory/DECISIONS.md` | Log belangrijke beslissingen hier |
| `docs/memory/LEARNINGS.md` | Log technische gotchas hier |

---

*Gegenereerd: 2026-03-29*
