# Vrijmigo — Datamodel (Supabase / PostgreSQL)

## Overzicht tabellen

```
players
courses
rounds
round_players
hole_scores
weather
advice
```

---

## Tabellen

### players
Spelers die in de app actief zijn.

```sql
create table players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,          -- 'Matthi', 'Rob', 'Ruud', 'Derin'
  color       text not null default '#888',  -- hex kleur in UI
  hcp_current numeric(4,1),                  -- meest recente handicap
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Seed data
insert into players (name, color, hcp_current) values
  ('Rob',    '#c0392b', 15.4),
  ('Matthi', '#1a6b3c', 19.9);
```

---

### courses
Golfbanen. Uitbreidbaar voor toekomstige banen.

```sql
create table courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                 -- 'Landgoed Bergvliet'
  location    text,                          -- 'Oosterhout'
  latitude    numeric(8,4),                  -- 51.6419
  longitude   numeric(8,4),                  -- 4.8652
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- Seed data
insert into courses (name, location, latitude, longitude, is_default) values
  ('Landgoed Bergvliet', 'Oosterhout', 51.6419, 4.8652, true);
```

---

### course_holes
Par en SI per hole per baan.

```sql
create table course_holes (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references courses(id) on delete cascade,
  hole_number integer not null,   -- 1-18
  par         integer not null,   -- 3, 4 of 5
  si          integer not null,   -- stroke index 1-18
  loop        text not null,      -- '1-9' of '10-18'
  unique(course_id, hole_number)
);

-- Seed data Bergvliet Lus A (1-9)
-- hole, par, si
-- 1, 3, 11
-- 2, 4, 13
-- 3, 5, 3
-- 4, 3, 15
-- 5, 4, 5
-- 6, 3, 17
-- 7, 5, 7
-- 8, 4, 9
-- 9, 5, 1

-- Seed data Bergvliet Lus B (10-18)
-- 10, 4, 12
-- 11, 3, 18
-- 12, 4, 4
-- 13, 4, 2
-- 14, 5, 8
-- 15, 3, 16
-- 16, 5, 14
-- 17, 4, 6
-- 18, 3, 10
```

---

### rounds
Eén rij per gespeelde ronde.

```sql
create table rounds (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references courses(id),
  date            date not null,
  start_time      time,                      -- tijdstip van de ronde
  season          text not null,             -- 'Zomer 2024', 'Winter 25-26', etc.
  season_type     text not null,             -- 'zomer' of 'winter'
  play_style      text not null,             -- 'strokeplay' of 'matchplay'
  loop            text not null,             -- '1-9', '10-18', '1-18'
  holes_played    integer not null,          -- 9 of 18
  is_competition  boolean default false,     -- true als beide vaste spelers meespeelden
  is_qualifying   boolean default false,     -- solo qualifying ronde
  notes           text,                      -- vrije opmerking van de uploader
  scorecard_image_url text,                  -- opgeslagen in Supabase Storage
  uploaded_by     uuid references players(id),
  imported_from_excel boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Index voor snelle queries
create index on rounds(season);
create index on rounds(date desc);
create index on rounds(is_competition);
```

---

### round_players
Scores per speler per ronde. Meerdere rijen per ronde (één per speler).

```sql
create table round_players (
  id              uuid primary key default gen_random_uuid(),
  round_id        uuid references rounds(id) on delete cascade,
  player_id       uuid references players(id),
  role            text,                      -- 'speler' of 'marker' (van de scorekaart)
  
  -- Strokeplay velden
  gross_score     integer,                   -- bruto slagen totaal
  stableford_points integer,                 -- stableford punten totaal
  putts_total     integer,                   -- totaal putts
  putts_per_hole  numeric(4,2),              -- gemiddeld putts per gespeelde hole
  
  -- Matchplay velden
  matchplay_points integer,                  -- gewonnen holes
  
  -- HCP (alleen zomerseizoenen)
  hcp_at_time     numeric(4,1),              -- handicap op moment van spelen
  
  -- Resultaat
  is_winner       boolean default false,     -- dagwinnaar
  is_draw         boolean default false,     -- gelijkspel
  
  unique(round_id, player_id)
);

create index on round_players(player_id);
create index on round_players(round_id);
```

---

### hole_scores
Optioneel: score per hole per speler. Wordt ingevuld als de kaart duidelijk leesbaar is.

```sql
create table hole_scores (
  id              uuid primary key default gen_random_uuid(),
  round_id        uuid references rounds(id) on delete cascade,
  player_id       uuid references players(id),
  hole_number     integer not null,          -- 1-18
  par             integer not null,          -- par van deze hole
  si              integer not null,          -- stroke index
  gross_score     integer,                   -- bruto slagen op deze hole
  putts           integer,                   -- putts op deze hole
  stableford_points integer,                 -- stableford punten
  matchplay_result text,                     -- 'won', 'lost', 'halved' (winterseizoen)
  
  unique(round_id, player_id, hole_number)
);
```

---

### weather
Weerdata per ronde, opgehaald via Open-Meteo.

```sql
create table weather (
  id              uuid primary key default gen_random_uuid(),
  round_id        uuid references rounds(id) on delete cascade unique,
  temperature_c   numeric(4,1),              -- graden Celsius
  wind_kmh        numeric(5,1),              -- windsnelheid km/h
  precipitation_mm numeric(5,1),             -- neerslag mm
  weather_code    integer,                   -- WMO weather code
  weather_desc    text,                      -- 'Zonnig', 'Bewolkt', 'Regen', etc.
  weather_icon    text,                      -- emoji of icon code
  fetched_at      timestamptz default now()
);
```

---

### advice
AI-gegenereerde adviezen per speler per ronde of per periode.

```sql
create table advice (
  id              uuid primary key default gen_random_uuid(),
  player_id       uuid references players(id),
  round_id        uuid references rounds(id), -- null = seizoensrapport
  advice_type     text not null,             -- 'kort', 'middel', 'uitgebreid', 'auto'
  content         text not null,             -- de gegenereerde tekst
  season          text,                      -- voor seizoensrapporten
  created_at      timestamptz default now()
);

create index on advice(player_id);
create index on advice(round_id);
```

---

## Views

### v_round_summary
Handige view voor het dashboard en rondeslijst.

```sql
create view v_round_summary as
select
  r.id,
  r.date,
  r.start_time,
  r.season,
  r.season_type,
  r.play_style,
  r.loop,
  r.holes_played,
  r.is_competition,
  r.notes,
  c.name as course_name,
  c.location as course_location,
  -- Matthi
  rp_m.gross_score    as matthi_score,
  rp_m.stableford_points as matthi_stb,
  rp_m.putts_total    as matthi_putts,
  rp_m.putts_per_hole as matthi_putts_per_hole,
  rp_m.matchplay_points as matthi_mp,
  rp_m.hcp_at_time    as matthi_hcp,
  rp_m.is_winner      as matthi_wins,
  -- Rob
  rp_r.gross_score    as rob_score,
  rp_r.stableford_points as rob_stb,
  rp_r.putts_total    as rob_putts,
  rp_r.putts_per_hole as rob_putts_per_hole,
  rp_r.matchplay_points as rob_mp,
  rp_r.hcp_at_time    as rob_hcp,
  rp_r.is_winner      as rob_wins,
  -- Gelijkspel
  (rp_m.is_draw or rp_r.is_draw) as is_draw,
  -- Weer
  w.temperature_c,
  w.wind_kmh,
  w.weather_desc,
  w.weather_icon
from rounds r
left join courses c on r.course_id = c.id
left join round_players rp_m on rp_m.round_id = r.id
  and rp_m.player_id = (select id from players where name = 'Matthi')
left join round_players rp_r on rp_r.round_id = r.id
  and rp_r.player_id = (select id from players where name = 'Rob')
left join weather w on w.round_id = r.id
order by r.date desc;
```

---

## RLS (Row Level Security)

Alle tabellen zijn publiek leesbaar (app gebruikt gedeeld wachtwoord). Schrijfrechten via service role key in de backend.

```sql
-- Lees-toegang voor alle tabellen
alter table players enable row level security;
alter table rounds enable row level security;
alter table round_players enable row level security;
alter table hole_scores enable row level security;
alter table weather enable row level security;
alter table advice enable row level security;
alter table courses enable row level security;

create policy "public read" on players for select using (true);
create policy "public read" on rounds for select using (true);
create policy "public read" on round_players for select using (true);
create policy "public read" on hole_scores for select using (true);
create policy "public read" on weather for select using (true);
create policy "public read" on advice for select using (true);
create policy "public read" on courses for select using (true);
```

---

## Belangrijke business rules

1. `rounds.play_style` volgt altijd uit het seizoen: winter = matchplay, zomer = strokeplay
2. `rounds.is_competition` = true als zowel Matthi als Rob een `round_players` rij hebben
3. `round_players.putts_per_hole` = putts_total / holes_played (berekend bij opslaan)
4. HCP wordt alleen ingevuld bij zomerseizoenen (qualifying rondes)
5. Bij matchplay: winnaar = speler met meeste gewonnen holes; gelijkspel als gelijk
6. Bij strokeplay: winnaar = speler met beste netto/stableford score
7. Solo rondes (is_competition = false) tellen mee voor spelerstats, niet voor competitiestats
