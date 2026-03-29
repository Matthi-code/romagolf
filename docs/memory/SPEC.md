# Specificatie: appromagolf

> **Wordt ingevuld door `/spec-interview` command**
> Dit is het referentie document voor WAT je bouwt.

---

## Overzicht

_[Eén zin die beschrijft wat de app doet]_

---

## Context

| Aspect | Waarde |
|--------|--------|
| **Type** | _[uit PROJECT_BRIEF.md]_ |
| **Doel** | _[prototype/demo/mvp/production]_ |
| **Primaire gebruiker** | _[alleen jij / klein team / klanten / publiek]_ |
| **Auth vereist** | _[ja/nee]_ |

---

## Core Functionaliteit

### Type
_[CRUD / Dashboard / Integratie / Automatie / E-commerce / Content]_

### Hoofdacties (wat kan de gebruiker doen?)
1. _[Actie 1]_
2. _[Actie 2]_
3. _[Actie 3]_
4. _[Actie 4]_
5. _[Actie 5]_

---

## User Flow (Happy Path)

```
[Stap 1] → [Stap 2] → [Stap 3] → [Eindresultaat]
```

_Voorbeeld:_
```
Open app → Selecteer klant → Maak factuur → Voeg regels toe → Genereer PDF → Download
```

---

## Data Model

### Entiteiten

| Entiteit | Beschrijving | Belangrijke velden |
|----------|--------------|-------------------|
| _[Naam]_ | _[Wat is het]_ | _[veld1, veld2, ...]_ |
| _[Naam]_ | _[Wat is het]_ | _[veld1, veld2, ...]_ |
| _[Naam]_ | _[Wat is het]_ | _[veld1, veld2, ...]_ |

### Relaties

```
[Entiteit A] 1──N [Entiteit B] N──M [Entiteit C]
```

_Voorbeeld:_
```
Client 1──N Invoice 1──N LineItem
                │
                └──1 PDF
```

---

## Features

### 🔴 Must Have (MVP)
_Zonder deze features is het geen werkende app_

- [ ] _[Feature 1]_
- [ ] _[Feature 2]_
- [ ] _[Feature 3]_

### 🟡 Should Have (v1.1)
_Belangrijk maar niet blocking voor eerste versie_

- [ ] _[Feature 4]_
- [ ] _[Feature 5]_

### 🟢 Nice to Have (later)
_Bewust NIET bouwen in deze iteratie_

- [ ] _[Feature 6]_
- [ ] _[Feature 7]_

---

## Constraints (wat mag NIET)

| Constraint | Reden |
|------------|-------|
| _[Ongeldige data opslaan]_ | _[Altijd valideren]_ |
| _[Hard delete]_ | _[Soft delete, data bewaren]_ |
| _[Geen error handling]_ | _[Graceful errors]_ |

---

## Edge Cases

| Situatie | Verwacht gedrag |
|----------|-----------------|
| _[Lege input]_ | _[Toon validatie error]_ |
| _[Duplicate]_ | _[Blokkeer of waarschuw]_ |
| _[Niet gevonden]_ | _[404 met duidelijke melding]_ |

---

## Technische Context

_Uit PROJECT_BRIEF.md:_

| Component | Keuze |
|-----------|-------|
| Backend | _[stack]_ |
| Database | _[db]_ |
| Frontend | _[frontend]_ |

---

## Open Vragen

_Zaken die nog uitgezocht moeten worden:_

- [ ] _[Vraag 1]_
- [ ] _[Vraag 2]_

---

*Laatst bijgewerkt: 2026-03-29*
