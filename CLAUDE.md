# appromagolf — Claude Code Instructies

## 🚨 EERSTE ACTIE BIJ NIEUWE SESSIE

**VOORDAT je de gebruiker antwoordt, MOET je dit doen:**

1. **LEES NU** het bestand `docs/memory/PROGRESS.md`
2. **LEES** de laatste 3 entries in `docs/memory/DECISIONS.md`
3. **LEES** `.claude/skills/` — deze zijn ALTIJD actief

### Als PROGRESS.md aangeeft "Fase 0: Planning" (NIEUW PROJECT):

```
📍 **Nieuw Project — Planning Nodig**

Dit is de eerste sessie voor dit project.

**Project:** appromagolf
**Beschrijving:** [uit PROJECT_BRIEF.md]

Ik ga eerst de PROJECT_BRIEF.md lezen en dan samen met jou 
een roadmap opstellen. Heb je nog aanvullende context of 
prioriteiten voordat we beginnen?
```

→ **Lees dan ook** `docs/memory/PROJECT_BRIEF.md`
→ **Maak een voorstel** voor fasen en taken in ROADMAP.md
→ **Vraag goedkeuring** voordat je de roadmap definitief maakt

### Als het een BESTAAND project is (normale sessie):

```
📍 **Sessie Herstel**
Laatste sessie: [datum uit PROGRESS.md]
Status: [huidige status]
Volgende stap: [uit PROGRESS.md]

Gaan we hiermee verder, of heb je iets anders?
```

**Dit is geen suggestie — dit is verplicht bij ELKE nieuwe chat.**

---

## 🔴 BIJ ARCHITECTUUR BESLISSINGEN

Als er een keuze wordt gemaakt over technologie, structuur, of aanpak:

1. **VRAAG ALTIJD:** "Dit is een belangrijke keuze. Zal ik dit vastleggen in `docs/memory/DECISIONS.md`?"
2. **BIJ "JA":** Log met formaat: vraag, besluit, waarom, afgewezen alternatieven

---

## 🔴 BIJ EINDE SESSIE

Als de gebruiker stopt, afsluit, of je vermoedt dat de sessie eindigt:

1. **VRAAG:** "Zal ik de voortgang bijwerken in `docs/memory/PROGRESS.md`?"
2. **BIJ "JA":** Update met wat gedaan is en volgende stap

---

## 📁 DOCUMENT HIËRARCHIE

### Laag 1: Memory (DYNAMISCH) — Lees ALTIJD

| Bestand | Doel | Wanneer Lezen | Wanneer Updaten |
|---------|------|---------------|-----------------|
| `docs/memory/PROGRESS.md` | Huidige status, volgende stap | **ELKE sessie start** | **ELKE sessie einde** |
| `docs/memory/PROJECT_BRIEF.md` | Project beschrijving, context | **Eerste sessie** | Bij scope wijziging |
| `docs/memory/ROADMAP.md` | Alle fasen + taken per fase | Bij "wat moet ik doen?" | Bij fase overgang |
| `docs/memory/DECISIONS.md` | Architectuur keuzes + waarom | Bij start (scan) | Bij belangrijke beslissing |
| `docs/memory/LEARNINGS.md` | Technische gotchas | Bij relevante taak | Bij nieuwe ontdekking |
| `docs/memory/IDEAS.md` | Ideeën, brainstorms, AI-suggesties | Bij brainstorm/planning | Bij nieuw idee (ook eigen!) |

### Laag 1b: Skills (ALTIJD ACTIEF)

| Skill | Doel | Wanneer Actief |
|-------|------|----------------|
| `.claude/skills/development.md` | KISS-TDD principes, agents, MCP servers, testing | **ALTIJD bij development taken** |
| `.claude/skills/content-research-writer.md` | Research, outlining, citations, section feedback | **Bij content/documentatie taken** |
| `.claude/skills/frontend-design.md` | Distinctive UI/UX, geen generic AI aesthetics | **Bij frontend/UI taken** |
| `.claude/skills/mollie-integration.md` | Dutch/European payments (iDEAL, Bancontact) | **Bij Mollie payment integratie** |
| `.claude/skills/stripe-integration.md` | Global payments (Cards, PayPal, Klarna) | **Bij Stripe payment integratie** |
| `.claude/skills/skill-creator.md` | Meta-skill voor nieuwe skills maken | **Bij skill development** |

> ⚠️ Skills zijn GEEN commands — ze zijn altijd actief op de achtergrond en bepalen HOE je werkt.

---

## 📋 PROJECT OVERZICHT

**Project:** appromagolf
**Beschrijving:** App waarin we de scores bijhouden van de golfwedstrijden
**Type:** web
**Gestart:** 2026-03-29

---

## ⚙️ DEVELOPMENT CONFIGURATIE

> Deze waarden worden ingesteld door `/interview` command

```
# Aanpak (uit /interview vraag 2.1)
RALPH_WIGGUM_ENABLED=false    # true = autonome loops
KISS_TDD_ENABLED=false        # true = test-driven development
VIBE_CODING_ENABLED=true      # true = snel itereren

# Begeleiding (uit /interview vraag 2.2)
AUTONOMY_LEVEL=copilot        # autopilot | copilot | manual

# Project doel (uit /interview vraag 1.1)
PROJECT_GOAL=prototype        # prototype | demo | mvp | production
```

### Gedrag per configuratie

| Als... | Dan... |
|--------|--------|
| `RALPH_WIGGUM_ENABLED=true` | Gebruik PROMPT.md voor autonome loops |
| `KISS_TDD_ENABLED=true` | Schrijf tests VOOR implementatie |
| `AUTONOMY_LEVEL=autopilot` | Maak keuzes zelf, rapporteer achteraf |
| `AUTONOMY_LEVEL=copilot` | Stel opties voor, wacht op keuze |
| `AUTONOMY_LEVEL=manual` | Wacht altijd op expliciete instructies |
| `PROJECT_GOAL=prototype` | Focus op werkend, niet op perfect |
| `PROJECT_GOAL=production` | Volledige tests, error handling, security |

---

## 🔧 TECH STACK

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL, EU Frankfurt)
- **AI**: Anthropic Claude Vision (claude-sonnet-4-20250514)
- **Weerdata**: Open-Meteo API (gratis, geen key)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Auth**: Simpel wachtwoord + naam kiezen (geen echte auth)

---

## 🤖 MCP SERVERS & AGENTS

### Beschikbare MCP Servers

| MCP Server | Doel | Gebruik |
|------------|------|---------|
| **1Password** | Credential management | API keys, secrets, database wachtwoorden |
| **Context7** | Library documentatie ophalen | API specs, best practices |
| **Desktop-Commander** | Systeem operaties, file management | Scripts, deployment, file ops |
| **Playwright** | E2E testing, browser automatie | UI tests, screenshots, flows |
| **Puppeteer** | Browser automatie, PDF generatie | Scraping, PDF tests |

### Agent Rollen

| Agent | Specialisatie | Raadpleegt |
|-------|--------------|------------|
| 🎨 **UX Designer** | UI, layouts, styling, UX | Ontwerp docs, design system |
| ⚙️ **Backend Dev** | API's, database, logic | Context7, specs |
| 🧪 **Tester** | Tests, validatie | Playwright, Puppeteer |
| 🔧 **DevOps** | Docker, deployment | Desktop-Commander |
| 📊 **Data** | Queries, analyse | Desktop-Commander |

---

## 🐳 DEVELOPMENT ENVIRONMENT

### Workflow: Lokaal → Container → Productie

| Fase | Omgeving | Tools | Wanneer door? |
|------|----------|-------|---------------|
| 1 | **Lokaal** | OrbStack, venv/npm | Code werkt + tests slagen |
| 2 | **Container** | Docker via OrbStack | Build OK + services draaien |
| 3 | **Productie** | Remote server | Na expliciete goedkeuring |

### Configuratie

```
PROJECT_DIR=/users/matthi/Claude/app.romagolf
PROD_SERVER=Vercel
DEV_PORT=3000
TEST_COMMAND=npm test
```

---

## 🔀 BESLISBOOM: WELK DOCUMENT LEZEN?

```
START
  │
  ├─ "Dit is een nieuw project" / Fase 0
  │   └─→ docs/memory/PROJECT_BRIEF.md → maak ROADMAP
  │
  ├─ "Waar waren we gebleven?"
  │   └─→ docs/memory/PROGRESS.md
  │
  ├─ "Wat is de volgende stap/taak?"
  │   └─→ docs/memory/ROADMAP.md (huidige fase)
  │
  ├─ "Waarom kozen we X?"
  │   └─→ docs/memory/DECISIONS.md
  │
  ├─ "Ik heb een idee" / "Brainstorm"
  │   └─→ docs/memory/IDEAS.md (voeg toe!)
  │
  ├─ "Start development" / "Bouw feature X"
  │   └─→ /develop command (KISS-TDD workflow)
  │
  └─ "Technisch probleem"
      └─→ docs/memory/LEARNINGS.md + Context7
```

---

## 🧠 MEMORY SYSTEEM — VERPLICHTE ACTIES

### Bij START van sessie
```
1. LEES docs/memory/PROGRESS.md
2. SCAN docs/memory/DECISIONS.md (laatste 3)
3. LEES .claude/skills/ (altijd actief)
4. ZEG: "Laatste sessie: [datum]. We waren bezig met: [X]. 
         Volgende stap: [Y]. Doorgaan?"
```

### TIJDENS sessie
```
Bij ELKE belangrijke beslissing:
  → VRAAG: "Dit is een architectuur keuze. Zal ik loggen in DECISIONS.md?"
  → LOG met: vraag, besluit, waarom, afgewezen alternatieven

Bij ELKE technische ontdekking:
  → LOG direct in docs/memory/LEARNINGS.md

Bij EIGEN IDEEËN of verbetervoorstellen:
  → VOEG TOE aan docs/memory/IDEAS.md met Bron: "AI"
  → MELD: "Ik heb een idee toegevoegd aan IDEAS.md: [korte beschrijving]"
```

### Bij EINDE van sessie
```
1. UPDATE docs/memory/PROGRESS.md
2. CHECK: Zijn er beslissingen/learnings die nog niet gelogd zijn?
3. BEVESTIG: "Memory bijgewerkt ✅ Volgende sessie: [X]"
```

---

## 📋 SLASH COMMANDS

### 🆕 Project Setup (AskUserQuestionTool)
| Command | Actie |
|---------|-------|
| `/interview` | Project interview - bepaal HOE we werken (type, stack, aanpak) |
| `/spec-interview` | Spec interview - bepaal WAT we bouwen (features, data model) |

### Sessie Management
| Command | Actie |
|---------|-------|
| `/start` | Forceer sessie start routine |
| `/klaar` | Forceer sessie einde routine |
| `/status` | Snelle status check |
| `/refresh` | Mid-session checkpoint + herlaad memory |
| `/vraag` | Toon laatste vraag/opdracht |

### Development
| Command | Actie |
|---------|-------|
| `/develop` | Start KISS-TDD development workflow |
| `/ralph` | Instructies voor Ralph Wiggum autonome loops |
| `/setup-plugins` | Installeer aanbevolen plugins (ralph-wiggum) |

### Documentatie
| Command | Actie |
|---------|-------|
| `/beslissing` | Log een beslissing |
| `/geleerd` | Log een learning |
| `/idee` | Bekijk ideeën overzicht |
| `/idee [tekst]` | Voeg idee toe + AI geeft suggesties |

---

## 🔌 PLUGINS

Dit project is geconfigureerd voor de volgende plugins:

### Ralph Wiggum (Autonome Loops)

Voor langlopende taken die meerdere iteraties nodig hebben.

**Eerste keer setup:**
```
/setup-plugins
```

**Gebruik:**
```
/ralph-wiggum:ralph-loop "Lees PROMPT.md en volg instructies" --max-iterations 20 --completion-promise "DONE"
```

> ⚠️ Herstart Claude Code na installatie van plugins!

---

## 🔄 AUTO-FOOTER (OPTIONEEL)

> **Zet op `true` als je wilt dat Claude je vraag herhaalt aan het einde van elk antwoord.**
> Handig bij meerdere projecten/sessies tegelijk.

```
AUTO_FOOTER_ENABLED=true
```

### Wanneer AUTO_FOOTER_ENABLED=true

Eindig elk antwoord met:

```
---
📝 **Jouw vraag was:**
> [de originele vraag/opdracht]
```

### Handmatig activeren

Zeg: "Zet auto-footer aan" of "Herhaal mijn vraag aan het einde"

### Handmatig uitschakelen

Zeg: "Zet auto-footer uit" of "Stop met vraag herhalen"

---

## 🔗 BESTANDEN OVERZICHT

```
/users/matthi/Claude//appromagolf/
│
├── CLAUDE.md                    ← JE BENT HIER
│
├── .claude/
│   ├── settings.json            ← Plugin configuratie (ralph-wiggum)
│   ├── commands/                ← Slash commands
│   │   ├── interview.md         ← 🆕 Project setup interview (HOE)
│   │   ├── spec-interview.md    ← 🆕 Feature interview (WAT)
│   │   ├── start.md
│   │   ├── klaar.md
│   │   ├── status.md
│   │   ├── beslissing.md
│   │   ├── geleerd.md
│   │   ├── idee.md
│   │   ├── develop.md
│   │   ├── vraag.md
│   │   ├── refresh.md
│   │   ├── setup-plugins.md     ← Plugin installatie instructies
│   │   └── ralph.md             ← Ralph Wiggum loop instructies
│   │
│   └── skills/                  ← Altijd actief
│       └── development.md
│
└── docs/
    └── memory/
        ├── PROJECT_BRIEF.md     ← project beschrijving & context
        ├── SPEC.md              ← 🆕 functionele specificatie (WAT)
        ├── PROMPT.md            ← 🆕 Ralph Wiggum instructies
        ├── PROGRESS.md          ← waar zijn we
        ├── ROADMAP.md           ← alle fasen + taken
        ├── DECISIONS.md         ← waarom keuzes
        ├── LEARNINGS.md         ← technische kennis
        └── IDEAS.md             ← ideeën & brainstorms
```

---

**Project:** appromagolf
**Type:** web
**Aangemaakt:** 2026-03-29
**Template versie:** 1.0
