# Vrijmigo — Product Requirements Document

## 1. Projectoverzicht

Vrijmigo is een persoonlijke golf-webapp voor Matthi en Rob, gebouwd rondom hun onderlinge competitie op Landgoed Bergvliet in Oosterhout. De app combineert een **spelersomgeving** (persoonlijke statistieken en AI-advies per speler) met een **competitie-omgeving** (onderlinge stand, head-to-head, anekdotes).

Scorekaarten worden gefotografeerd en via Claude Vision automatisch uitgelezen. Weerdata wordt automatisch opgehaald via Open-Meteo.

---

## 2. Gebruikers

| Speler | Rol | Kleur |
|--------|-----|-------|
| Matthi | Marker (rechterkolommen op kaart) | Groen (#1a6b3c) |
| Rob | Speler (linkerkolommen op kaart) | Rood (#c0392b) |

- Nieuwe spelers (Ruud, Derin, etc.) kunnen handmatig worden toegevoegd
- Login: één gedeeld wachtwoord (`vrijmigo`), daarna naam kiezen
- Na naam kiezen: keuze tussen **Mijn spel** of **Competitie**

---

## 3. Scorekaart structuur

### Landgoed Bergvliet, Oosterhout (coördinaten: 51.6419, 4.8652)

#### Lus A (holes 1-9) — Out — Par 36
| Hole | Par | SI |
|------|-----|----|
| 1 | 3 | 11 |
| 2 | 4 | 13 |
| 3 | 5 | 3 |
| 4 | 3 | 15 |
| 5 | 4 | 5 |
| 6 | 3 | 17 |
| 7 | 5 | 7 |
| 8 | 4 | 9 |
| 9 | 5 | 1 |

#### Lus B (holes 10-18) — In — Par 35
| Hole | Par | SI |
|------|-----|----|
| 10 | 4 | 12 |
| 11 | 3 | 18 |
| 12 | 4 | 4 |
| 13 | 4 | 2 |
| 14 | 5 | 8 |
| 15 | 3 | 16 |
| 16 | 5 | 14 |
| 17 | 4 | 6 |
| 18 | 3 | 10 |

### Kolomindeling scorekaart
- **Linkerkolommen (Speler)**: Rob — bruto score + putts per hole
- **Rechterkolommen (Marker)**: Matthi — bruto score + putts per hole
- Rob schrijft bijna altijd, maar dit kan wisselen — AI leest de namen van de kaart
- Stableford-punten staan naast elke score op de kaart

---

## 4. Seizoenen en spelwijze

| Seizoen | Periode | Spelwijze | Scoring |
|---------|---------|-----------|---------|
| Zomer | April – november | Strokeplay | Bruto slagen + stableford + putts |
| Winter | November – maart | Matchplay | Matchplay punten per hole + putts |

- HCP wordt alleen geregistreerd in zomerseizoenen (Golf.nl qualifying)
- Winterseizoenen: matchplay score bepaalt de dagwinnaar
- Zomerseizoenen: stableford / bruto slagen bepaalt de dagwinnaar

### Seizoensoverzicht (historisch)
| Seizoen | Rondes | Winnaar |
|---------|--------|---------|
| Zomer 2024 | 48 | Matthi (26-20, 2 gelijk) |
| Winter 24-25 | 24 | Matthi (11-10, 3 gelijk) |
| Zomer 2025 | 61 | Matthi (30-24, 7 gelijk) |
| Winter 25-26 | 20 | Matthi (12-6, 2 gelijk) |
| **Totaal** | **153** | **Matthi (79-60, 14 gelijk)** |

---

## 5. Omgevingen

### 5.1 Spelersomgeving (Mijn spel)

Persoonlijk dashboard per speler. Toont ALLE rondes van die speler, inclusief solo rondes.

#### Schermen
1. **Dashboard** — eigen HCP, laatste rondes, quick stats
2. **Mijn rondes** — alle rondes gefilterd op seizoen/baan, solo gemarkeerd
3. **Statistieken** — putts, slagen/hole, lus-voorkeur, weer, tijdstip
4. **AI-advies** — automatisch na elke ronde + op verzoek, 3 niveaus
5. **Uploaden** — foto → AI → bevestigen → opslaan

#### Statistieken per speler
- Gemiddeld slagen per hole (totaal, per lus, per seizoen)
- Putts per hole (totaal, per lus, per seizoen, trend over tijd)
- Vergelijking putts Matthi vs Rob
- Putts bij bepaald weer (wind >20 km/h vs kalm, regen vs droog)
- Resultaten ochtend (voor 12:00) vs middag (na 12:00)
- Prestaties per lus (1-9 vs 10-18)
- HCP verloop (zomerseizoenen)
- Winst% per seizoen

### 5.2 Competitie-omgeving

Toont ALLEEN rondes waarbij beide spelers samen hebben gespeeld.

#### Schermen
1. **Stand** — huidige seizoensstand, wie leidt, winsbalk M vs R
2. **Head-to-head** — vergelijking per lus, per spelwijze, historisch
3. **Historie** — alle seizoenen, dropdown filter
4. **Logboek** — notities & anekdotes per ronde + grappige statistieken

#### Grappige statistieken (automatisch gegenereerd)
- Slechtste ronde ooit (per speler)
- Langste reeks overwinningen
- Meeste putts in één ronde
- Beste prestatie bij slecht weer
- Meest gespeelde lus
- "Ruud-effect": resultaten wanneer Ruud meespeelt

---

## 6. Ronde-opmerkingen

Elke ronde kan een vrije tekstopmerking bevatten, geschreven door de speler die uploadt. Dit is vergelijkbaar met de notities in de Excel-bestanden (bv. "Dankzij tante El..", "Samen 18h gespeeld waarvan 9x par", etc.).

- Zichtbaar in ronde-detail, rondeslijst (ingekort), en logboek
- Speler kan opmerking toevoegen bij uploaden én achteraf bewerken
- Opmerking is zichtbaar voor beide spelers

---

## 7. Scorekaart uploaden

### Flow
1. Foto maken of uploaden
2. Tijdstip invullen (verplicht voor weerdata)
3. Datum bevestigen (automatisch vandaag, aanpasbaar)
4. Claude Vision leest uit:
   - Golfbaan naam (AI probeert, speler bevestigt)
   - Lus (1-9 / 10-18 / 1-18)
   - Per speler: naam, totaalscore, stableford, putts
   - Hole-voor-hole scores als leesbaar
5. Weerdata automatisch ophalen via Open-Meteo (datum + tijdstip + coördinaten)
6. Speler vult aan: opmerking, eventuele correcties
7. Bevestigen → opslaan

### AI Vision prompt (kern)
Lees de scorekaart uit. Geef JSON terug met: golfbaan, lus, spelwijze (matchplay/strokeplay), speler_naam, speler_score, speler_stableford, speler_putts, marker_naam, marker_score, marker_stableford, marker_putts, hole_scores array.

---

## 8. AI-advies

### Automatisch (na elke ronde)
Kort advies van 2-3 bullets direct na opslaan, zichtbaar op het dashboard.

### Op verzoek (3 niveaus)
| Niveau | Inhoud |
|--------|--------|
| Kort | 2-3 bullets: wat ging goed, wat kan beter |
| Middel | Paragraaf: trend laatste 10 rondes, patroon gesignaleerd |
| Uitgebreid | Volledig rapport: putts, lus, weer, tijdstip, verbeterpunten, concrete oefentips |

### Analyse-dimensies
- Putts per hole (te veel/weinig t.o.v. eigen gemiddelde)
- Slagen/hole trend (verbetering of verslechtering)
- Prestaties per lus (welke lus ligt beter en waarom)
- Weer-invloed (wind, regen, temperatuur)
- Tijdstip (ochtend vs middag)
- Vergelijking met eigen historische data

---

## 9. Weerdata

- API: Open-Meteo (gratis, geen key vereist)
- Coördinaten Bergvliet: lat 51.6419, lon 4.8652
- Velden: temperatuur, windsnelheid, neerslag, weercode
- Historisch beschikbaar → retroactief op te halen voor bestaande rondes
- Weerpictogram + omschrijving (Zonnig / Bewolkt / Regen / Wind / Mist / Sneeuw)

---

## 10. Golfbanen

- Standaard: Landgoed Bergvliet, Oosterhout
- Uitbreidbaar naar andere banen in de toekomst
- Per baan: naam, locatie, coördinaten (voor weerdata), par-indeling per hole
- AI leest baannaam van kaart, speler bevestigt

---

## 11. Niet in scope (v1)

- Push notificaties
- Live scoring tijdens de ronde
- Integratie met Golf.nl API
- Meerdere competities / groepen
- Publieke profielpagina's
