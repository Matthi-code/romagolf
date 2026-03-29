# Databronnen

> Overzicht van databronnen voor appromagolf.

---

## 📊 Bronnen Overzicht

| Bron | Type | Kosten | Frequentie |
|------|------|--------|------------|
| [Bron 1] | API | €[X]/call | Real-time |
| [Bron 2] | File | Gratis | Dagelijks |
| [Bron 3] | Database | €[X]/maand | - |

---

## 🔌 API Bronnen

### [Bron Naam]

| Aspect | Waarde |
|--------|--------|
| URL | `https://api.example.com` |
| Auth | API Key |
| Rate Limit | [X] calls/minuut |
| Kosten | €[X] per call |
| Documentatie | [Link] |

**Endpoints:**

| Endpoint | Beschrijving |
|----------|--------------|
| GET /resource | [Beschrijving] |

**Voorbeeld Response:**

```json
{
  "data": {...}
}
```

---

## 📁 File Bronnen

### [Bron Naam]

| Aspect | Waarde |
|--------|--------|
| Formaat | CSV / JSON / XML |
| Locatie | [URL of pad] |
| Update frequentie | [Dagelijks/Wekelijks/etc] |
| Grootte | ~[X] MB |

**Schema:**

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| [kolom1] | string | [Beschrijving] |
| [kolom2] | integer | [Beschrijving] |

---

## 🔄 Data Pipeline

```
[Bron 1] ──┐
           ├──→ [Transformatie] ──→ [Database] ──→ [API/Frontend]
[Bron 2] ──┘
```

### Stappen

1. **Extract:** Data ophalen van bronnen
2. **Transform:** Cleaning, normalisatie, verrijking
3. **Load:** Opslaan in database
4. **Serve:** Beschikbaar maken via API

---

## ⚠️ Data Kwaliteit

| Check | Beschrijving | Frequentie |
|-------|--------------|------------|
| Completeness | Geen missende verplichte velden | Per import |
| Validity | Data voldoet aan schema | Per import |
| Freshness | Data is niet ouder dan [X] uur | Continu |

---

## 🔐 Privacy & Compliance

- [ ] Geen PII opslaan
- [ ] Data retention policy: [X] dagen
- [ ] GDPR compliant
- [ ] Logging van data toegang
