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

## 2026-03-29 — cmux browser commando's

**Situatie:**
`open` command opent externe browser, niet cmux interne browser.

**Oplossing:**
Gebruik `/Applications/cmux.app/Contents/Resources/bin/cmux browser open <url>` voor de interne browser. Skill opgeslagen in `~/.claude/skills/cmux-browser.md`.
