---
description: Start development workflow met KISS-TDD checklist
---

# Development Starten

> Volledige principes staan in `.claude/skills/development.md` — die zijn ALTIJD actief.

---

## 📋 Pre-flight Checklist

```
□ Memory gelezen?
  → docs/memory/PROGRESS.md (waar waren we?)
  → docs/memory/LEARNINGS.md (bekende valkuilen)
  
□ Scope helder?
  → Wat is de KLEINSTE werkende versie?
  → Opsplitsen in sub-taken?

□ Agent gekozen?
  → 🎨 UX Designer | ⚙️ Backend | 🧪 Tester | 🔧 DevOps | 📊 Data

□ Externe kennis opgehaald?
  → Context7 voor library docs
  → Bestaande code gecheckt
```

---

## 🚀 Execution Checklist

```
□ Bestaande tests draaien VOOR je begint
  → Alles groen? Dan door.

□ Test schrijven (TDD)
  → Wat moet het doen?
  → Test faalt (nog geen code)

□ Minimale implementatie
  → Net genoeg om test te laten slagen
  → KISS: Keep It Simple

□ Test slaagt
  → Groen? Commit.
  → Rood? Fix eerst.

□ Refactor indien nodig
  → Code opschonen
  → Tests blijven groen
```

---

## 🐳 Environment Checklist

```
□ LOKAAL werkend? (OrbStack)
  → Code runt
  → Tests slagen
  → Handmatig getest

□ CONTAINER werkend? (indien nodig)
  → docker-compose build ✓
  → docker-compose up -d ✓
  → Services draaien ✓

□ PRODUCTIE? (alleen na vraag)
  → "Wil je deployen naar geen?"
```

---

## ✅ Afronding Checklist

```
□ Alle tests groen
□ Code is leesbaar
□ Geen console errors

□ Memory bijgewerkt:
  → PROGRESS.md (wat gedaan, volgende stap)
  → LEARNINGS.md (nieuwe inzichten?)
  → DECISIONS.md (architectuur keuzes?)
  → IDEAS.md (ideeën opgedaan?)

□ Resultaat gemeld:
  ✅ [Taak] voltooid
  📁 Gewijzigd: [bestanden]
  🧪 Tests: [x] passing
```

---

## 🚀 Deploy Vraag

Als alles klaar is, vraag:

```
Wil je dit deployen naar productie?

Server: geen

[Ja] → Start deployment
[Nee] → Klaar, blijft op development
```
