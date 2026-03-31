# 📊 Voortgang

> Houdt bij waar we zijn in het project en wat de volgende stappen zijn.

---

## Huidige Status

| Aspect | Waarde |
|--------|--------|
| **Fase** | Fase 5: Productie |
| **Focus** | Features uitbreiden + goedkeuringsflow |
| **Blokkade** | Geen — Vision prompt meerdere keren verbeterd, moet getest worden |
| **Laatste update** | 2026-04-01 |

---

## Volgende Stap

1. **Scorekaart goedkeuring** — marker keurt speler goed, ronde telt pas mee na akkoord
2. **Vision prompt testen** — HCP + scores/putts uitlezing is verbeterd, valideren met nieuwe upload
3. **Stableford punten** weer tonen
4. **HCP verloop grafiek** zoals golf.nl
5. Next.js upgraden
6. Foto's als achtergronden

---

## Deployment Info

| Aspect | Waarde |
|--------|--------|
| **Vercel project** | `prj_Lca1ye2Gq868l27yGn5Yb8HzyAII` |
| **Vercel URL** | https://romagolf.vercel.app |
| **GitHub repo** | `Matthi-code/romagolf` |
| **Auto-deploy** | Ja, push naar `main` → automatische deploy |
| **Deployment Protection** | Uitgeschakeld (publiek toegankelijk) |

---

## Sessie Historie

### 2026-04-01 — Sessie 6: Features, AI Coach, golf.nl koppeling

**Gedaan:**
- Seizoen fix: maart = Zomer + seizoen aanpasbaar in upload review stap
- Vision prompt 3x verbeterd: kolommen expliciet, HCP uitlezing, Rob/Matthi hints
- Golf.nl doorsturen: "Open golf.nl" + "Kopieer" knoppen (upload + ronde detail)
- Spelersprofiel op H2H: sterke/zwakke punten per speler (berekend, geen AI kosten)
- AI Coach advies per speler: humoristisch, opgeslagen in DB, historie met datum
- AI Coach overlay: tik voor groot + eerdere adviezen, ververs-knopje
- Scorekaart foto opslaan bij upload + bekijken op ronde detail (thumbnail + fullscreen)
- Upload: foto kiezen uit galerij (niet alleen camera)
- AI opmerking bij scorekaart uitlezing (humoristisch als er reden voor is)
- Golf.nl API onderzoek: geen publieke API, OutSystems backend, webapp is beste optie
- Bergvliet hole-lengtes (gele tee) ingebakken voor golfkilometers
- Ideeën gelogd: golf.nl koppeling, scorekaart goedkeuring

**Volgende sessie:**
- Scorekaart goedkeuring bouwen
- Vision prompt testen met nieuwe upload
- Stableford + HCP grafiek

### 2026-03-31 — Sessie 5: Statistieken pagina

**Gedaan:**
- Statistieken pagina gebouwd (`/speler/statistieken`): scores donut, par gemiddelde, beste/slechtste ronde, golfkilometers
- Bergvliet hole-lengtes (gele tee) ingebakken voor golfkilometers berekening
- Stats tab toegevoegd aan competitie bottom nav (vervangt Foto's)
- Par gemiddelde: namen in kleur (Matthi groen, Rob rood) + "Lager = beter" duidelijker
- Scorekaart foto's Bergvliet uitgelezen: alle par/SI/afstanden voor 18 holes

**Data:**
- Slechts 1 ronde met hole-by-hole data in DB — meer rondes uploaden voor zinvolle statistieken
- Bergvliet gele tee: Out 3061m, In 2867m, Totaal 5928m (par 71)

**Volgende sessie:**
- AI scorekaart uitlezing fixen (prioriteit 1)
- Meer rondes uploaden voor betere statistieken
- E-Golf inspiratie: meer stats toevoegen (HCP verloop verbeterd, meest bezochte banen)

### 2026-03-30 — Sessie 4: Upload flow + AI scorekaart herkenning

**Gedaan:**
- Hole-by-hole invoervelden op upload pagina (9 of 18 rijen)
- Bergvliet par/SI defaults per lus ingebakken
- AI vult holes in bij foto-upload, handmatig invoeren ook mogelijk
- HCP velden toegevoegd aan upload flow
- Delete functionaliteit voor rondes (knop + API)
- AI prompt verbeterd met specifiekere instructies
- Env vars correct ingesteld op Vercel (waren nog `xxx`)

**Blokkade:**
- AI leest putts (kleine superscript getallen) correct maar zet ze in score-veld
- Grote handgeschreven scores worden niet herkend
- Moet opgelost worden met betere prompt of twee-staps analyse

**Volgende sessie:**
- AI scorekaart uitlezing fixen (prioriteit 1)
- Next.js upgrade
- Foto's als achtergronden

### 2026-03-29 — Sessie 3: Scorekaarten pagina + stableford + deployment fix

**Gedaan:**
- Stableford punten tonen en bewerkbaar op ronde detail pagina
- Scorekaarten overzicht pagina (`/competitie/scorekaarten`) met upload knop
- Hamburger menu + bottom nav uitgebreid met Scorekaarten
- Vercel gekoppeld aan GitHub repo `Matthi-code/romagolf`
- Succesvol gedeployed naar productie
- Beslissing "stableford niet tonen" herzien → nu wel zichtbaar

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
