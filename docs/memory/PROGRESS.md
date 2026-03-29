# 📊 Voortgang

> Houdt bij waar we zijn in het project en wat de volgende stappen zijn.

---

## Huidige Status

| Aspect | Waarde |
|--------|--------|
| **Fase** | Fase 5: Productie |
| **Focus** | App is live op Vercel, alle kernfunctionaliteit werkt |
| **Blokkade** | Vercel Deployment Protection uitschakelen voor publieke toegang |
| **Laatste update** | 2026-03-29 |

---

## Volgende Stap

1. Vercel Deployment Protection uitschakelen (dashboard > settings)
2. Next.js upgraden naar nieuwste versie
3. Geüploade foto's gebruiken als random foto's op andere pagina's
4. Scorekaart foto-upload koppelen aan ronde (via /scorekaart command of upload flow)
5. Custom domein overwegen (bijv. romagolf.nl)

---

## Sessie Historie

### 2026-03-29 — Sessie 2: Van prototype naar productie

**Gedaan:**
- Login vereenvoudigd: alleen wachtwoord → direct naar competitie (geen naam/omgeving keuze)
- Competitie pagina verbeterd: weericoon + temperatuur, daglicht-balkje, starttijd onder datum
- Scorekaart: bogey/dbl bogey+ gesplitst met eigen kleuren, birdie als rondje met ring, eagle met amber achtergrond, par wit
- Scorekaart bewerkbaar: slagen, putts per hole + totalen (HCP, score, putts) + datum/starttijd
- Head-to-Head pagina gebouwd: vergelijkingstabel, win per lus (3 kolommen), records met links naar scorekaarten, weer-effect, hole-level records (beste/slechtste hole, meeste putts)
- Trends pagina gebouwd: score verloop (met gemiddelde lijn + filters), cumulatieve winst, HCP verloop, putts per hole, dag/tijd analyse
- Logboek pagina: opmerkingen uit rondes, seizoenfilter, compacte tabelrijen
- Foto's pagina: gallery grid, upload (camera/galerij), flight koppeling, swipe viewer, bewerken/verwijderen
- Hamburger menu in header + bottom nav
- Consistente PageHeader component op alle pagina's
- Rob's HCP gefixed (26.2 → 16.2)
- Vercel deployment: live op romagolf.vercel.app
- Recharts geïnstalleerd voor grafieken
- Supabase Storage bucket + photos tabel aangemaakt

**Beslissingen:**
- App alleen voor competitie (geen speler-omgeving meer)
- "Mat" in compacte kolommen, "Matthi" voluit in score-blokken en H2H
- Stableford weghalen (niet relevant voor winnaar bepaling)

**Volgende sessie:**
- Deployment Protection uitschakelen
- Next.js upgrade
- Foto's integreren als random achtergronden
- Eventueel custom domein

### 2026-03-29 — Sessie 1: Van nul naar werkende app

**Gedaan:**
- Next.js 14 project opgezet met TypeScript, Tailwind, Supabase
- Database migratie uitgevoerd + 153 historische rondes geïmporteerd
- Eerste ronde Zomer 2026 ingevoerd: Rob wint (47-54, netto)
- Login flow, app layout, speler dashboard, rondeslijst, ronde detail
- Competitie stand, upload flow, /scorekaart command
- Design: zalmgolf.nl stijl, Fraunces + Inter + JetBrains Mono fonts
- 14 Bergvliet foto's in public/images
