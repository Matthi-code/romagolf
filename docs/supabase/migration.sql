-- Vrijmigo database migratie
-- Voer uit in Supabase SQL editor

-- 1. PLAYERS
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text not null default '#888888',
  hcp_current numeric(4,1),
  is_active   boolean default true,
  created_at  timestamptz default now()
);

insert into players (name, color, hcp_current) values
  ('Rob',    '#c0392b', 15.4),
  ('Matthi', '#1a6b3c', 19.9)
on conflict (name) do nothing;

-- 2. COURSES
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  latitude    numeric(8,4),
  longitude   numeric(8,4),
  is_default  boolean default false,
  created_at  timestamptz default now()
);

insert into courses (name, location, latitude, longitude, is_default) values
  ('Landgoed Bergvliet', 'Oosterhout', 51.6419, 4.8652, true)
on conflict do nothing;

-- 3. COURSE HOLES
create table if not exists course_holes (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references courses(id) on delete cascade,
  hole_number integer not null,
  par         integer not null,
  si          integer not null,
  loop        text not null,
  unique(course_id, hole_number)
);

-- Seed Bergvliet holes
do $$
declare
  bergvliet_id uuid;
begin
  select id into bergvliet_id from courses where name = 'Landgoed Bergvliet';

  insert into course_holes (course_id, hole_number, par, si, loop) values
    -- Lus A (1-9)
    (bergvliet_id, 1,  3, 11, '1-9'),
    (bergvliet_id, 2,  4, 13, '1-9'),
    (bergvliet_id, 3,  5,  3, '1-9'),
    (bergvliet_id, 4,  3, 15, '1-9'),
    (bergvliet_id, 5,  4,  5, '1-9'),
    (bergvliet_id, 6,  3, 17, '1-9'),
    (bergvliet_id, 7,  5,  7, '1-9'),
    (bergvliet_id, 8,  4,  9, '1-9'),
    (bergvliet_id, 9,  5,  1, '1-9'),
    -- Lus B (10-18)
    (bergvliet_id, 10, 4, 12, '10-18'),
    (bergvliet_id, 11, 3, 18, '10-18'),
    (bergvliet_id, 12, 4,  4, '10-18'),
    (bergvliet_id, 13, 4,  2, '10-18'),
    (bergvliet_id, 14, 5,  8, '10-18'),
    (bergvliet_id, 15, 3, 16, '10-18'),
    (bergvliet_id, 16, 5, 14, '10-18'),
    (bergvliet_id, 17, 4,  6, '10-18'),
    (bergvliet_id, 18, 3, 10, '10-18')
  on conflict (course_id, hole_number) do nothing;
end $$;

-- 4. ROUNDS
create table if not exists rounds (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid references courses(id),
  date                date not null,
  start_time          time,
  season              text not null,
  season_type         text not null check (season_type in ('zomer', 'winter')),
  play_style          text not null check (play_style in ('strokeplay', 'matchplay')),
  loop                text not null check (loop in ('1-9', '10-18', '1-18')),
  holes_played        integer not null check (holes_played in (8, 9, 18)),
  is_competition      boolean default false,
  is_qualifying       boolean default false,
  notes               text,
  scorecard_image_url text,
  uploaded_by         uuid references players(id),
  imported_from_excel boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_rounds_season    on rounds(season);
create index if not exists idx_rounds_date      on rounds(date desc);
create index if not exists idx_rounds_comp      on rounds(is_competition);
create index if not exists idx_rounds_course    on rounds(course_id);

-- 5. ROUND PLAYERS
create table if not exists round_players (
  id                uuid primary key default gen_random_uuid(),
  round_id          uuid references rounds(id) on delete cascade,
  player_id         uuid references players(id),
  role              text check (role in ('speler', 'marker')),
  gross_score       integer,
  stableford_points integer,
  putts_total       integer,
  putts_per_hole    numeric(4,2),
  matchplay_points  integer,
  hcp_at_time       numeric(4,1),
  is_winner         boolean default false,
  is_draw           boolean default false,
  unique(round_id, player_id)
);

create index if not exists idx_rp_player on round_players(player_id);
create index if not exists idx_rp_round  on round_players(round_id);

-- 6. HOLE SCORES
create table if not exists hole_scores (
  id                uuid primary key default gen_random_uuid(),
  round_id          uuid references rounds(id) on delete cascade,
  player_id         uuid references players(id),
  hole_number       integer not null,
  par               integer not null,
  si                integer not null,
  gross_score       integer,
  putts             integer,
  stableford_points integer,
  matchplay_result  text check (matchplay_result in ('won', 'lost', 'halved')),
  unique(round_id, player_id, hole_number)
);

-- 7. WEATHER
create table if not exists weather (
  id               uuid primary key default gen_random_uuid(),
  round_id         uuid references rounds(id) on delete cascade unique,
  temperature_c    numeric(4,1),
  wind_kmh         numeric(5,1),
  precipitation_mm numeric(5,1),
  weather_code     integer,
  weather_desc     text,
  weather_icon     text,
  fetched_at       timestamptz default now()
);

-- 8. ADVICE
create table if not exists advice (
  id           uuid primary key default gen_random_uuid(),
  player_id    uuid references players(id),
  round_id     uuid references rounds(id),
  advice_type  text not null check (advice_type in ('auto', 'kort', 'middel', 'uitgebreid')),
  content      text not null,
  season       text,
  created_at   timestamptz default now()
);

create index if not exists idx_advice_player on advice(player_id);
create index if not exists idx_advice_round  on advice(round_id);

-- 9. VIEW: v_round_summary
create or replace view v_round_summary as
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
  r.is_qualifying,
  r.notes,
  r.imported_from_excel,
  c.name      as course_name,
  c.location  as course_location,
  c.latitude  as course_lat,
  c.longitude as course_lon,
  -- Matthi
  rp_m.gross_score          as matthi_score,
  rp_m.stableford_points    as matthi_stb,
  rp_m.putts_total          as matthi_putts,
  rp_m.putts_per_hole       as matthi_putts_per_hole,
  rp_m.matchplay_points     as matthi_mp,
  rp_m.hcp_at_time          as matthi_hcp,
  rp_m.is_winner            as matthi_wins,
  rp_m.is_draw              as matthi_draw,
  -- Rob
  rp_r.gross_score          as rob_score,
  rp_r.stableford_points    as rob_stb,
  rp_r.putts_total          as rob_putts,
  rp_r.putts_per_hole       as rob_putts_per_hole,
  rp_r.matchplay_points     as rob_mp,
  rp_r.hcp_at_time          as rob_hcp,
  rp_r.is_winner            as rob_wins,
  rp_r.is_draw              as rob_draw,
  -- Gelijkspel
  (coalesce(rp_m.is_draw, false) or coalesce(rp_r.is_draw, false)) as is_draw,
  -- Winnaar label
  case
    when rp_m.is_winner then 'matthi'
    when rp_r.is_winner then 'rob'
    else 'gelijk'
  end as winner,
  -- Weer
  w.temperature_c,
  w.wind_kmh,
  w.precipitation_mm,
  w.weather_desc,
  w.weather_icon
from rounds r
left join courses c on r.course_id = c.id
left join round_players rp_m on rp_m.round_id = r.id
  and rp_m.player_id = (select id from players where name = 'Matthi' limit 1)
left join round_players rp_r on rp_r.round_id = r.id
  and rp_r.player_id = (select id from players where name = 'Rob' limit 1)
left join weather w on w.round_id = r.id
order by r.date desc;

-- 10. RLS
alter table players      enable row level security;
alter table courses      enable row level security;
alter table course_holes enable row level security;
alter table rounds       enable row level security;
alter table round_players enable row level security;
alter table hole_scores  enable row level security;
alter table weather      enable row level security;
alter table advice       enable row level security;

create policy "public read players"       on players       for select using (true);
create policy "public read courses"       on courses       for select using (true);
create policy "public read course_holes"  on course_holes  for select using (true);
create policy "public read rounds"        on rounds        for select using (true);
create policy "public read round_players" on round_players for select using (true);
create policy "public read hole_scores"   on hole_scores   for select using (true);
create policy "public read weather"       on weather       for select using (true);
create policy "public read advice"        on advice        for select using (true);
