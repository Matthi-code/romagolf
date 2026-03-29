---
description: Voeg features toe aan SPEC.md met versioning
---

# Spec Uitbreiden

**Doel:** Features toevoegen aan de project spec zodat deze altijd compleet is voor rebuilds.

## Stap 1: Lees Huidige Staat

1. **LEES** `docs/SPEC.md`
2. **NOTEER:** huidige versie, laatste features

## Stap 2: Verzamel Input

### Als GEEN argument gegeven:

```
📝 **Spec Uitbreiden**

Huidige versie: [X.X]
Laatste toegevoegde features: [lijst]

**Welke features wil je toevoegen?**
> [wacht op input]

**Waarom/business context?** (optioneel, druk Enter om over te slaan)
> [wacht op input]
```

### Als WEL argument gegeven ($ARGUMENTS):

Gebruik het argument als feature beschrijving, ga direct naar Stap 3.

## Stap 3: Update SPEC.md

1. **Verhoog versienummer** (1.2 → 1.3)
2. **Update "Laatste Update"** met huidige datum
3. **Voeg nieuwe sectie toe:**

```markdown
### Toegevoegd (vX.X)
- [nieuwe feature 1]
- [nieuwe feature 2]
```

4. **Update Versie Historie tabel**

## Stap 4: Bevestiging

```
✅ **Spec bijgewerkt**

📄 docs/SPEC.md
   Versie: [oude] → [nieuw]
   
🆕 **Toegevoegd:**
- [feature 1]
- [feature 2]

💡 **Rebuild prompt** (kopieer voor ralph-loop):
Bouw alle features uit docs/SPEC.md. Focus op sectie "Toegevoegd (vX.X)".
Bestaande code integreren, niet herbouwen. DONE wanneer klaar.
```

## Als SPEC.md niet bestaat

```
⚠️ docs/SPEC.md bestaat nog niet.

Wil je eerst een spec maken met /spec-interview?
Of zal ik een lege SPEC.md template aanmaken?
```
