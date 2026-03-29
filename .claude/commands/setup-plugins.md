---
description: Installeer de aanbevolen Claude Code plugins voor dit project
---

# Setup Plugins

Dit project gebruikt de volgende plugins:

## Automatisch installeren

Run deze commands in volgorde:

### 1. Voeg de officiële Anthropic marketplace toe
```
/plugin marketplace add anthropics/claude-plugins-official
```

### 2. Installeer ralph-wiggum voor autonome loops
```
/plugin install ralph-wiggum@claude-plugins-official
```

### 3. Herstart Claude Code
```bash
exit
claude
```

### 4. Verifieer installatie
```
/plugin list
```

Je zou `ralph-wiggum` in de lijst moeten zien.

## Test

```
/ralph-wiggum:ralph-loop "Zeg hallo en output DONE" --max-iterations 2 --completion-promise "DONE"
```

## Andere nuttige plugins

Optioneel kun je ook installeren:

```
/plugin install frontend-skills@claude-plugins-official
/plugin install code-review@claude-plugins-official
```
