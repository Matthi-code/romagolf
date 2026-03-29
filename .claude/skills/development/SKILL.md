---
name: development
description: KISS-TDD development principes, agents, MCP servers, testing workflow
---

# Development Skill

> Deze principes zijn ALTIJD van toepassing bij development werk.

---

## 🎯 KISS-TDD Principes

Bij ELKE development taak, pas deze principes toe:

### K — Keep It Simple
- Geen onnodige complexiteit
- Splits grote taken op in kleine, specifieke delen
- Eén ding per keer
- Kleine, gefocuste functies/componenten
- Code moet begrijpbaar zijn voor je toekomstige zelf

### I — Incremental Steps
- Werk in kleine iteraties
- Test na elke wijziging
- Commit werkende states
- Niet te veel tegelijk veranderen

### S — Safe Changes
- Run bestaande tests VOORDAT je begint
- Backwards compatible waar mogelijk
- Bij twijfel: vraag eerst
- Breek geen bestaande functionaliteit

### S — Succeed Before Proceeding
- Pas door naar volgende stap als huidige WERKT
- Geen half werk achterlaten
- Tests moeten slagen
- Handmatige verificatie indien nodig

---

## 🤖 Agent Specialisaties

Kies de juiste specialist voor de taak:

| Agent | Wanneer | Raadpleegt |
|-------|---------|------------|
| 🎨 **UX Designer** | UI, layouts, styling, gebruikerservaring | Ontwerp docs, design system |
| ⚙️ **Backend Dev** | API's, database, business logic | Context7, specs |
| 🧪 **Tester** | Tests schrijven, edge cases, validatie | Playwright, Puppeteer |
| 🔧 **DevOps** | Docker, deployment, infrastructuur | Desktop-Commander |
| 📊 **Data** | Queries, transformaties, analyse | Desktop-Commander |

### UX Designer Instructies
Bij UI/Frontend taken:
1. LEES eerst ontwerp documentatie indien aanwezig
2. Houd het SIMPEL — geen overdesign
3. Mobile-first approach
4. Toegankelijkheid (a11y) meenemen
5. Consistente spacing, kleuren, typography

### Parallel Execution
Onafhankelijke taken kunnen parallel draaien:
- Backend API + Frontend componenten (tegen mock)
- Unit tests + Integration tests
- Database migratie + Documentatie

---

## 🔧 MCP Servers & Capabilities

| MCP Server | Doel | Wanneer Gebruiken |
|------------|------|-------------------|
| **Context7** | Library documentatie | API specs, best practices, changelogs |
| **Desktop-Commander** | Systeem operaties | File management, scripts, deployment |
| **Playwright** | E2E browser testing | UI tests, screenshots, user flows |
| **Puppeteer** | Browser automatie | Scraping, PDF generatie, performance |
| **Serena** | Memory management | Kennis opslaan/ophalen tussen sessies |

### Context7 Gebruik
- ALTIJD raadplegen voordat je een library gebruikt
- Check voor breaking changes bij versie updates
- Zoek best practices voordat je zelf iets bouwt

---

## 🐳 Development Environment Flow

### Volgorde: Lokaal → Container → Productie

```
STAP 1: LOKAAL (OrbStack)
────────────────────────
Ontwikkel ZONDER Docker eerst:
- source .venv/bin/activate (Python)
- npm run dev (Node)
- Tests draaien lokaal
✓ Door wanneer: code werkt + tests slagen

STAP 2: CONTAINER (Docker via OrbStack)  
───────────────────────────────────────
Containerize pas als lokaal werkt:
- docker-compose build
- docker-compose up -d
- docker-compose logs -f
✓ Door wanneer: build OK + services draaien + tests slagen

STAP 3: PRODUCTIE
─────────────────
ALLEEN na expliciete goedkeuring gebruiker!
- Vraag ALTIJD: "Deploy naar productie?"
```

### Docker Commands
```bash
docker-compose build          # Build
docker-compose up -d          # Start
docker-compose logs -f        # Logs
docker-compose down           # Stop
docker-compose build [svc]    # Rebuild specifiek
```

---

## 🧪 Testing Strategie

### TDD Workflow (ALTIJD)
```
1. Schrijf EERST de test (wat moet het doen?)
2. Run test → FAIL (nog geen implementatie)
3. Schrijf MINIMALE code om test te laten slagen
4. Run test → PASS
5. Refactor indien nodig
6. Commit
```

### Test Tools per Type

| Test Type | Tool | Command |
|-----------|------|---------|
| Unit tests | pytest / jest | `pytest tests/` |
| API tests | pytest + httpx | `pytest tests/api/` |
| E2E tests | Playwright | `npx playwright test` |
| Browser tests | Puppeteer | Via MCP |

### Wat ALTIJD Testen
- Happy path (normale flow)
- Edge cases (grensgevallen)
- Error handling (foutafhandeling)
- Input validatie

---

## 📝 Memory Updates

### Na ELKE development sessie
```
docs/memory/PROGRESS.md — wat is gedaan, volgende stap
```

### Bij nieuwe inzichten
```
docs/memory/LEARNINGS.md — technische ontdekkingen, gotchas
```

### Bij architectuur keuzes
```
docs/memory/DECISIONS.md — wat gekozen, waarom, alternatieven
```

### Bij ideeën tijdens development
```
docs/memory/IDEAS.md — verbeteringen, refactor mogelijkheden
```

---

## ⚠️ Belangrijke Regels

1. **Memory eerst** — Lees ALTIJD PROGRESS.md en LEARNINGS.md voordat je begint
2. **Niet opnieuw uitvinden** — Check Context7 en bestaande code eerst
3. **Klein houden** — Liever 3 kleine commits dan 1 grote
4. **Tests verplicht** — Geen code zonder tests
5. **Vraag bij twijfel** — Liever een vraag teveel dan een fout
6. **Documenteer** — Wat niet gedocumenteerd is, bestaat niet
