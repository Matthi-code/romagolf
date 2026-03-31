# 📚 Learnings

> Technische inzichten, gotchas en workarounds.

---

## 2026-03-29 — Next.js dev server cache corrupt

**Situatie:**
Na veel file-wijzigingen gaf de dev server 404 op CSS/JS chunks.

**Oplossing:**
`rm -rf .next` en dev server herstarten. De `.next` cache raakt corrupt bij snelle opeenvolgende wijzigingen.

**Gotcha:**
Altijd `rm -rf .next` doen als chunks 404 geven, niet alleen de server herstarten.

---

## 2026-03-29 — TypeScript Set spread in Next.js

**Situatie:**
`[...new Set(data.map(...))]` gaf een TypeScript error in Next.js build.

**Oplossing:**
Gebruik `Array.from(new Set(...))` i.p.v. spread operator op Set.

---

## 2026-03-29 — Supabase RLS write access

**Situatie:**
Met anon key kun je alleen lezen (RLS policies zijn "public read" only).

**Oplossing:**
Gebruik service_role key voor alle schrijfoperaties (insert rounds, players, etc). De anon key is voor de frontend (lezen). Service role key alleen server-side gebruiken.

---

## 2026-03-29 — Vercel Deployment Protection

**Situatie:**
App deployed op Vercel maar telefoon toont Vercel login i.p.v. de app.

**Oplossing:**
Ga naar Vercel Dashboard > Project Settings > Deployment Protection en schakel "Standard Protection" uit voor productie. Anders moeten bezoekers eerst inloggen bij Vercel.

---

## 2026-03-29 — Vercel .vercelignore

**Situatie:**
Deploy faalde met "File size limit exceeded" door node_modules en .playwright-mcp (225MB).

**Oplossing:**
Maak `.vercelignore` aan met `node_modules`, `.next`, `.git`, `.playwright-mcp`. Vercel installeert dependencies zelf.

---

## 2026-03-29 — Seizoen berekening maart

**Situatie:**
Maart valt technisch in "Winter" (maand < 4), maar het zomerseizoen was al gestart.

**Oplossing:**
Voor foto's en filters: gebruik het meest recente seizoen met rondes als "actief seizoen" i.p.v. puur op maand te berekenen. Recente items (< 30 dagen) krijgen het actieve seizoen.

---

## 2026-03-30 — AI scorekaart uitlezing: score vs putts verwisseling

**Situatie:**
Claude Vision leest scorekaart foto's maar verwart scores met putts. De handgeschreven scorekaart heeft grote getallen (score, bijv. 7) met kleine superscript getallen (putts, bijv. ³). De AI leest alleen de kleine getallen en zet die in het score-veld.

**Poging 1:** Prompt verduidelijkt met "groot getal = score, klein = putts" → putts kwamen in score-veld
**Poging 2:** Prompt nog specifieker → zelfde probleem, nu scores in Rob/Mat kolommen maar putts leeg

**Mogelijke oplossingen:**
1. Twee-staps analyse: eerst alle getallen per cel identificeren, dan toewijzen
2. Prompt die expliciet vraagt: "per hole, noem BEIDE getallen die je ziet"
3. Lagere temperature of andere model parameters
4. Expliciet voorbeeld geven in de prompt van hoe "7³" gelezen moet worden

**Gotcha:**
De AI heeft moeite met het onderscheiden van handgeschreven scores en putts die dicht bij elkaar staan op de fysieke scorekaart.

---

## 2026-04-01 — Vision prompt: HCP uitlezing vereist prioriteit

**Situatie:**
Claude Vision slaat HCP waarden over als de instructie te ver in de prompt staat. De AI focust op scores en negeert de header.

**Oplossing:**
HCP uitlezing als STAP 1 (allereerste instructie) met concrete hints: Rob HCP altijd 10-20, Matthi rond 20. Bij 26.2 → waarschijnlijk 16.2.

**Gotcha:**
Zet de belangrijkste extractie-instructies BOVENAAN de Vision prompt, niet na de kolom-beschrijvingen. De AI leest de prompt sequentieel en geeft prioriteit aan het begin.

---

## 2026-04-01 — Golf.nl heeft geen publieke API

**Situatie:**
Onderzocht of we scores automatisch naar golf.nl kunnen doorsturen.

**Bevinding:**
Golf.nl draait op OutSystems met een API Service Layer, maar die is alleen voor gecertificeerde clubsoftware-leveranciers (15 partijen). Geen publieke API. De React Native app (com.ngf.mijngolf) gebruikt interne endpoints. Garmin/Arccos integreren via USGA, niet via golf.nl.

**Oplossing:**
"Open golf.nl" knop die mijn.golf.nl opent + "Kopieer" knop voor snel overtypen. Contact app@golf.nl voor eventueel partnerschap.

---

## 2026-03-29 — cmux browser commando's

**Situatie:**
`open` command opent externe browser, niet cmux interne browser.

**Oplossing:**
Gebruik `/Applications/cmux.app/Contents/Resources/bin/cmux browser open <url>` voor de interne browser. Skill opgeslagen in `~/.claude/skills/cmux-browser.md`.
