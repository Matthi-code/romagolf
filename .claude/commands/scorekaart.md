De gebruiker heeft een foto van een scorekaart geüpload. Volg dit proces:

## 1. Lees de scorekaart

Analyseer de foto en lees uit:
- Datum (staat meestal bovenaan)
- Lus (1-9 of 10-18 of 1-18)
- Aantal holes
- Per speler: naam, bruto score per hole, putts per hole (klein getal rechtsboven de score), stableford, HCP
- Rob = Speler (linkerkolommen), Matthi = Marker (rechterkolommen)

## 2. Toon samenvatting en vraag bevestiging

Toon een tabel met:
- Hole-voor-hole scores + putts
- Totalen (bruto, stableford, putts)
- Wie wint (laagste NETTO score = bruto gecorrigeerd voor HCP)
- Vraag: "Klopt dit? Correcties?"

## 3. Na bevestiging: opslaan in Supabase

Gebruik de Supabase service role key uit .env.local om op te slaan:
- `rounds` tabel (datum, seizoen, lus, holes, is_competition)
- `round_players` tabel (scores, putts, stableford, HCP, winnaar)
- `hole_scores` tabel (score + putts per hole per speler)
- `weather` tabel (haal op via Open-Meteo API voor datum + Bergvliet coördinaten)

Seizoen bepalen:
- Vraag de gebruiker welk seizoen, suggereer op basis van datum
- Zomer = strokeplay, Winter = matchplay

## 4. Genereer kort advies

Na opslaan, geef 2-3 korte bullets per speler:
- Wat viel op in deze ronde?
- Vergelijk met hun gemiddelde (query uit v_round_summary)
- Putts: beter of slechter dan gemiddeld?

## 5. Update bevestigen

Zeg: "Ronde opgeslagen! [datum] [lus] — [winnaar] wint. Stand [seizoen]: Matthi X - Rob Y"

## Belangrijke regels

- Winnaar bij strokeplay = laagste NETTO score (bruto - HCP slagen)
- Putts altijd uitlezen (klein getal rechtsboven de score)
- HCP staat meestal bovenaan bij de spelernamen
- Bergvliet coördinaten voor weer: lat 51.6419, lon 4.8652
- Supabase credentials staan in .env.local
