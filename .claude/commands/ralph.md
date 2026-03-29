---
description: Start een Ralph Wiggum autonome loop (eerst plugin installeren met /setup-plugins)
---

# Ralph Loop Starten

## Vereiste
Zorg dat de ralph-wiggum plugin is geïnstalleerd. Run `/setup-plugins` als dat nog niet gedaan is.

## Gebruik

Lees de `PROMPT.md` file in de huidige directory en voer de instructies uit tot completie.

```
/ralph-wiggum:ralph-loop "Lees PROMPT.md en volg alle instructies. Output <promise>DONE</promise> als alles werkt." --max-iterations 20 --completion-promise "DONE"
```

## Parameters

- `--max-iterations N`: Maximum aantal iteraties (safety net)
- `--completion-promise "TEXT"`: Stop als deze tekst in output verschijnt

## Tips

1. Maak altijd een `PROMPT.md` file met je instructies
2. Stel `--max-iterations` in als safety net
3. Werk in een git-tracked directory (revert mogelijk)
4. Gebruik `<promise>DONE</promise>` syntax in je completion criteria
