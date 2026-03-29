---
description: Interview voor nieuw project setup - bepaalt werkwijze en configuratie
---

# Project Interview

Interview de gebruiker met AskUserQuestionTool om het project op te zetten.
Sla antwoorden op en genereer PROJECT_BRIEF.md aan het einde.

---

## Fase 1: Project Intent

### Vraag 1.1: Wat is het doel van dit project?
header: "Doel"
multiSelect: false
options:
  - label: "Prototype"
    description: "Snel werkend krijgen, code kwaliteit secundair, exploreren"
  - label: "Demo"
    description: "Visueel indrukwekkend, mock data OK, happy path only"
  - label: "MVP"
    description: "Eerste echte versie, basis features, echte gebruikers"
  - label: "Production"
    description: "Volledig af, tests, security, monitoring, schaalbaarheid"

### Vraag 1.2: Wat voor type project is dit?
header: "Type"
multiSelect: false
options:
  - label: "Web app"
    description: "Frontend-focused, UI/UX belangrijk"
  - label: "API"
    description: "Backend service, endpoints, data processing"
  - label: "SaaS"
    description: "Web app + auth + betalingen + multi-tenant"
  - label: "Data"
    description: "Analyse, ETL, dashboards, rapportages"
  - label: "Automation"
    description: "Scripts, bots, scheduled jobs, integraties"

### Vraag 1.3: Hoeveel tijd heb je voor dit project?
header: "Tijdlijn"
multiSelect: false
options:
  - label: "1-2 dagen"
    description: "Vibe coding sessie, snel resultaat"
  - label: "1 week"
    description: "Klein project, enkele features"
  - label: "2-4 weken"
    description: "Medium project, meerdere iteraties"
  - label: "Langer"
    description: "Uitgebreide roadmap nodig"

---

## Fase 2: Development Style

### Vraag 2.1: Welke development aanpak wil je gebruiken?
header: "Aanpak"
multiSelect: false
options:
  - label: "Ralph Wiggum loops"
    description: "Claude werkt autonoom door, jij reviewt achteraf"
  - label: "KISS-TDD"
    description: "Test-driven, kleine stappen, quality first"
  - label: "Vibe coding"
    description: "Snel itereren, testen en refactor later"
  - label: "Hybrid"
    description: "Start vibe, refactor met tests als het werkt"

### Vraag 2.2: Hoeveel begeleiding wil je geven?
header: "Autonomie"
multiSelect: false
options:
  - label: "Autopilot"
    description: "Claude beslist zelf, jij reviewt resultaat"
  - label: "Co-pilot"
    description: "Claude stelt voor, jij keurt goed"
  - label: "Manual"
    description: "Jij geeft instructies, Claude voert uit"

---

## Fase 3: Tech Stack

### Vraag 3.1: Welke backend?
header: "Backend"
multiSelect: false
options:
  - label: "Python + FastAPI"
    description: "Jouw standaard stack, async, modern"
  - label: "Python + Django"
    description: "Batteries included, admin panel"
  - label: "Node.js"
    description: "Express, Hono, of Fastify"
  - label: "Geen backend"
    description: "Static site of externe API's"

### Vraag 3.2: Welke database?
header: "Database"
multiSelect: false
options:
  - label: "SQLite"
    description: "Simpel, geen setup, goed voor prototype/MVP"
  - label: "PostgreSQL"
    description: "Productie-ready, via Docker of remote"
  - label: "MySQL"
    description: "Bestaande setup of hosting vereiste"
  - label: "Geen"
    description: "Stateless, file-based, of externe service"


### Vraag 3.3: Welke frontend? (alleen bij Web/SaaS)
header: "Frontend"
multiSelect: false
options:
  - label: "HTMX + Jinja"
    description: "Server-side rendering, minimale JS"
  - label: "React / Next.js"
    description: "Component-based, SPA of SSR"
  - label: "Astro"
    description: "Content sites, partial hydration"
  - label: "Plain HTML"
    description: "Simpel, geen framework"

---

## Fase 4: Infrastructure

### Vraag 4.1: Waar moet dit draaien?
header: "Deploy"
multiSelect: false
options:
  - label: "Alleen lokaal"
    description: "Development only, geen deployment"
  - label: "OrbStack/Docker"
    description: "Container lokaal draaien"
  - label: "Eigen server"
    description: "VPS, homelab, of kantoor server"
  - label: "Cloud platform"
    description: "Vercel, Railway, Fly.io, etc."

### Vraag 4.2: Welke productie server? (alleen bij "Eigen server")
header: "Server"
multiSelect: false
options:
  - label: "192.168.1.67"
    description: "Jouw standaard productie server"
  - label: "Andere"
    description: "Specificeer IP of hostname"
  - label: "Nog niet bekend"
    description: "Later configureren"

---

## Na het Interview: Genereer Output

### 1. Schrijf naar docs/memory/PROJECT_BRIEF.md

```markdown
# Project Brief: appromagolf

## Meta
- **Doel:** [antwoord 1.1]
- **Type:** [antwoord 1.2]
- **Tijdlijn:** [antwoord 1.3]
- **Aangemaakt:** [datum]

## Development Style
- **Aanpak:** [antwoord 2.1]
- **Autonomie:** [antwoord 2.2]
- **Ralph Wiggum:** [✅ als 2.1 = "Ralph Wiggum loops", anders ❌]

## Tech Stack
- **Backend:** [antwoord 3.1]
- **Database:** [antwoord 3.2]
- **Frontend:** [antwoord 3.3 of "N.v.t."]

## Infrastructure
- **Target:** [antwoord 4.1]
- **Server:** [antwoord 4.2 indien "Eigen server", anders "N.v.t."]

## Beschrijving
[Vraag de gebruiker om een korte beschrijving als die nog niet gegeven is]

## Notities
[Ruimte voor extra context uit het gesprek]
```

### 2. Update CLAUDE.md configuratie

Zoek en vervang in CLAUDE.md op basis van antwoorden:

| Setting | Waarde |
|---------|--------|
| `RALPH_WIGGUM_ENABLED` | true als 2.1 = "Ralph Wiggum loops" |
| `KISS_TDD_ENABLED` | true als 2.1 = "KISS-TDD" |
| `AUTONOMY_LEVEL` | autopilot / copilot / manual (uit 2.2) |
| `PROD_SERVER` | IP uit 4.2 of "niet geconfigureerd" |

### 3. Toon samenvatting en volgende stap

```
✅ Project Interview Compleet!

📋 Samenvatting:
- Doel: [1.1]
- Type: [1.2] 
- Aanpak: [2.1]
- Stack: [3.1] + [3.2] + [3.3]
- Deploy: [4.1]

📁 Bestanden bijgewerkt:
- docs/memory/PROJECT_BRIEF.md ✓
- CLAUDE.md configuratie ✓

🚀 Volgende stap:
[Als Ralph Wiggum enabled:]
→ Run `/spec-interview` om PROMPT.md te genereren voor autonome development

[Anders:]
→ Run `/spec-interview` om SPEC.md te maken
→ Of begin direct met `/develop`
```
