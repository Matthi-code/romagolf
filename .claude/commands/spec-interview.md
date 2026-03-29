---
description: Interview voor feature specificatie - genereert SPEC.md en PROMPT.md
---

# Spec Interview

Lees eerst `docs/memory/PROJECT_BRIEF.md` voor context over het project type, 
de gekozen aanpak en tech stack.

Interview de gebruiker met AskUserQuestionTool over WAT de app moet doen.
Genereer daarna SPEC.md en (indien Ralph Wiggum enabled) PROMPT.md.

---

## Fase 1: Core Concept

### Vraag 1.1: Beschrijf in één zin wat de app doet
header: "Concept"
[Vrije tekst - gebruik "Other" optie]
Voorbeeld: "Een factuur generator voor Nederlandse ZZP'ers"

### Vraag 1.2: Wat is de core functionaliteit?
header: "Core"
multiSelect: false
options:
  - label: "CRUD"
    description: "Data beheren (create, read, update, delete)"
  - label: "Integratie"
    description: "Systemen koppelen, data syncen"
  - label: "Dashboard"
    description: "Data visualiseren, rapportages"
  - label: "Automatie"
    description: "Taken automatiseren, workflows"
  - label: "E-commerce"
    description: "Verkopen, checkout, betalingen"
  - label: "Content"
    description: "Blog, CMS, documentatie"

### Vraag 1.3: Wie gaat dit gebruiken?
header: "Users"
multiSelect: false
options:
  - label: "Alleen jij"
    description: "Personal tool, geen auth nodig"
  - label: "Klein team"
    description: "< 10 users, simpele auth"
  - label: "Klanten"
    description: "Externe gebruikers, registratie nodig"
  - label: "Publiek"
    description: "Iedereen, mogelijk anoniem"

---

## Fase 2: Features & Data

### Vraag 2.1: Wat zijn de 3-5 belangrijkste acties die een gebruiker kan doen?
header: "Acties"
multiSelect: true

Suggesties per core type (uit 1.2):
- **CRUD:** Toevoegen, Bekijken, Bewerken, Verwijderen, Zoeken, Filteren, Exporteren
- **Dashboard:** Filteren, Exporteren, Vergelijken, Delen, Printen
- **E-commerce:** Bekijken, In cart, Afrekenen, Bestelling volgen, Review plaatsen
- **Automatie:** Starten, Stoppen, Schedulen, Logs bekijken, Configureren
- **Integratie:** Connecten, Syncen, Mappen, Monitoren

Altijd toevoegen: "Other" optie voor custom acties

### Vraag 2.2: Welke 'dingen' moet de app onthouden? (entiteiten)
header: "Data"
multiSelect: true

Suggesties per type:
- **Altijd:** Users (als auth nodig)
- **CRUD:** Items, Categories, Tags
- **E-commerce:** Products, Orders, Customers, Payments
- **Dashboard:** Reports, Filters, Datasets
- **Automation:** Jobs, Schedules, Logs

Altijd toevoegen: "Other" optie


### Vraag 2.3: Hoe hangen deze dingen samen?
header: "Relaties"

Voor elk paar entiteiten uit 2.2, vraag:
"Hoe hangt [Entity A] samen met [Entity B]?"
options:
  - label: "One-to-many"
    description: "1 [A] heeft meerdere [B]s (bijv: 1 user → meerdere orders)"
  - label: "Many-to-many"
    description: "[A]s en [B]s kunnen meerdere van elkaar hebben"
  - label: "One-to-one"
    description: "1 [A] heeft precies 1 [B]"
  - label: "Geen relatie"
    description: "Deze hangen niet direct samen"

---

## Fase 3: User Flow & Constraints

### Vraag 3.1: Beschrijf de happy path (belangrijkste flow)
header: "Flow"
[Vrije tekst of guided stappen]

Voorbeeld format:
"Gebruiker [actie 1] → [actie 2] → [actie 3] → [eindresultaat]"

### Vraag 3.2: Wat mag absoluut NIET gebeuren?
header: "Constraints"
multiSelect: true
options:
  - label: "Ongeldige data opslaan"
    description: "Alles moet gevalideerd worden"
  - label: "Acties zonder bevestiging"
    description: "Destructieve acties vragen confirmation"
  - label: "Ongeauthenticeerde toegang"
    description: "Alles achter login (als auth nodig)"
  - label: "Hard delete"
    description: "Soft delete only, data nooit echt weg"
  - label: "Onversleutelde secrets"
    description: "Wachtwoorden/keys altijd encrypted"
  - label: "Geen error handling"
    description: "Graceful errors, nooit crashes tonen"

---

## Fase 4: Prioritering

### Vraag 4.1: Wat MOET er in voor de eerste versie? (Must Have)
header: "Must"
multiSelect: true
[Toon lijst van features uit 2.1 + entiteiten uit 2.2]

"Zonder deze features is het geen werkende app"

### Vraag 4.2: Wat is belangrijk maar niet blocking? (Should Have)  
header: "Should"
multiSelect: true
[Toon overige items]

"Dit komt in v1.1"

### Vraag 4.3: Wat is nice-to-have voor later?
header: "Nice"
multiSelect: true
[Toon overige items + ruimte voor nieuwe ideeën]

"Dit bouwen we nu expliciet NIET"

---

## Na het Interview: Genereer Output

### 1. Schrijf docs/memory/SPEC.md

```markdown
# SPEC.md — appromagolf

## Overzicht
[Antwoord 1.1 - één zin beschrijving]

## Context
- **Type:** [uit PROJECT_BRIEF.md]
- **Doel:** [uit PROJECT_BRIEF.md]  
- **Doelgroep:** [Antwoord 1.3]
- **Authenticatie:** [Afgeleid: "Geen" als 1.3 = "Alleen jij", anders "Vereist"]

## Features

### Must Have (MVP)
[Bullet list van antwoorden 4.1]

### Should Have (v1.1)
[Bullet list van antwoorden 4.2]

### Nice to Have (later)
[Bullet list van antwoorden 4.3]

## Data Model

### Entiteiten
[Per entiteit uit 2.2:]

**[Entiteit Naam]**
- Beschrijving: [afgeleid uit context]
- Relaties: [uit 2.3]
- Velden: [suggereer op basis van type, vraag bevestiging]

### Relatie Diagram (tekst)
```
[Genereer ASCII diagram op basis van 2.3]
User 1──N Order N──M Product
```

## User Flows

### Happy Path
[Antwoord 3.1]

### Alternatieve Flows
[Suggereer op basis van features, vraag of relevant]

## Constraints & Regels
[Antwoorden 3.2 als bullet list]

## Technische Context
[Kopieer relevante info uit PROJECT_BRIEF.md]
- Backend: [stack]
- Database: [db]
- Frontend: [frontend]
```


### 2. Schrijf docs/memory/PROMPT.md (alleen als Ralph Wiggum enabled)

Check PROJECT_BRIEF.md: als "Ralph Wiggum: ✅", genereer ook PROMPT.md:

```markdown
# PROMPT.md — appromagolf

## Doel
[Antwoord 1.1 - één zin beschrijving]

## Completion Promise
Zeg "DONE" wanneer alle taken hieronder volledig zijn afgerond en werkend.

## Context
- Stack: [uit PROJECT_BRIEF.md]
- Database: [uit PROJECT_BRIEF.md]
- Doel: [uit PROJECT_BRIEF.md - Prototype/Demo/MVP/Production]

## Taken

### Fase 1: Project Setup
- [ ] Project structuur opzetten volgens stack
- [ ] Database schema maken met tabellen: [entiteiten uit 2.2]
- [ ] Basis configuratie en dependencies
- [ ] Development server werkend

### Fase 2: Data Layer
[Per entiteit uit Must Have:]
- [ ] Model/schema voor [entiteit]
- [ ] CRUD operaties voor [entiteit]
- [ ] Validatie voor [entiteit]

### Fase 3: Core Features (Must Have)
[Per feature uit 4.1:]
- [ ] [Feature naam]
  - Endpoint/route: [suggestie]
  - UI: [indien van toepassing]
  - Tests: [indien KISS-TDD of Production doel]

### Fase 4: API/Routes
[Genereer lijst van endpoints op basis van acties uit 2.1]
- [ ] GET /[resource] - lijst ophalen
- [ ] POST /[resource] - nieuwe aanmaken
- [ ] GET /[resource]/{id} - detail ophalen
- [ ] PUT /[resource]/{id} - updaten
- [ ] DELETE /[resource]/{id} - verwijderen

### Fase 5: UI (indien Web/SaaS)
- [ ] Layout/navigation
- [ ] Lijst pagina's
- [ ] Detail/edit pagina's
- [ ] Forms met validatie

### Fase 6: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Basis styling
- [ ] README.md updaten

## Constraints (niet overtreden!)
[Antwoorden 3.2]

## Niet in scope (NIET bouwen)
[Items uit 4.3 - Nice to Have]

## Bij twijfel
- Kies de simpelste oplossing
- Vraag via AskUserQuestionTool als kritieke keuze
- Log beslissingen in docs/memory/DECISIONS.md
```

### 3. Toon samenvatting en volgende stap

```
✅ Spec Interview Compleet!

📋 Gegenereerde bestanden:
- docs/memory/SPEC.md ✓ (referentie document)
[Als Ralph Wiggum enabled:]
- docs/memory/PROMPT.md ✓ (voor autonome loops)

📊 Overzicht:
- Core: [1.2]
- Entiteiten: [aantal uit 2.2]
- Must Have features: [aantal uit 4.1]
- Should Have features: [aantal uit 4.2]
- Constraints: [aantal uit 3.2]

🚀 Volgende stap:

[Als Ralph Wiggum enabled:]
Start autonome development met:
```
/ralph-wiggum:ralph-loop "Lees docs/memory/PROMPT.md en volg alle instructies" --max-iterations 25 --completion-promise "DONE"
```

[Als KISS-TDD:]
Start test-driven development:
```
/develop
```

[Als Vibe coding:]
Begin gewoon te bouwen! SPEC.md is je referentie:
```
cat docs/memory/SPEC.md
```
```

---

## Tips voor gebruik

1. **Wees specifiek** in je antwoorden - hoe meer detail, hoe beter de output
2. **Kies "Other"** als geen optie past - vrije tekst is OK
3. **Must Have klein houden** - liever 3 features goed dan 10 half
4. **Happy path eerst** - edge cases komen later

## Gerelateerde Commands

- `/interview` - Project setup (HOE)
- `/develop` - Start development workflow
- `/ralph` - Ralph Wiggum loop instructies
- `/status` - Check huidige voortgang
