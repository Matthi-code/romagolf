---
description: Checkpoint & refresh - sla op en herstart met frisse context
---

# Session Refresh

**Doel:** Mid-session checkpoint — sla voortgang op en herlaad memory voor frisse context.

## Stap 1: OPSLAAN

### Update PROGRESS.md
```markdown
## [DATUM] — Checkpoint

**Gedaan tot nu toe:**
- [wat is afgerond]
- [waar je mee bezig was]

**Volgende stap:**
- [concrete actie om mee verder te gaan]
```

### Check andere memory bestanden
```
□ DECISIONS.md — ongelogde beslissingen?
□ LEARNINGS.md — technische inzichten ontdekt?
□ IDEAS.md — ideeën opgedaan?
```

## Stap 2: HERLADEN

1. **LEES** `docs/memory/PROGRESS.md` (net bijgewerkt)
2. **SCAN** `docs/memory/DECISIONS.md` (laatste 3)
3. **LEES** `.claude/skills/` directory

## Stap 3: OUTPUT

```
🔄 **Session Refresh**

📝 **Opgeslagen:**
- [samenvatting wat vastgelegd]

📍 **Status na refresh:**
| | |
|-----------------|----------------------------------------|
| Laatste update  | [nu] |
| Fase            | [huidige fase] |
| Status          | [waar we zijn] |

➡️ **Volgende stap:** [concrete actie]

Klaar om verder te gaan!
```

## Wanneer gebruiken

- Na lange sessie met veel context
- Als je merkt dat Claude "afdwaalt"
- Voor je aan een nieuwe taak binnen dezelfde sessie begint
- Als sanity check tussendoor
