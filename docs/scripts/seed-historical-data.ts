/**
 * seed-historical-data.ts
 *
 * Importeert 153 historische rondes vanuit rounds.json naar Supabase.
 * Run met: npx ts-node scripts/seed-historical-data.ts
 *
 * Vereisten:
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HistoricalRound {
  date: string;
  season: string;
  lus: string;
  holes: number;
  matthi_score: number | null;
  rob_score: number | null;
  matthi_stb: number | null;
  rob_stb: number | null;
  matthi_putts: number | null;
  rob_putts: number | null;
  hcp_matthi: number | null;
  hcp_rob: number | null;
  winner: 'matthi' | 'rob' | 'gelijk';
  notes: string | null;
  course: string;
}

function getSeasonType(season: string): 'zomer' | 'winter' {
  return season.toLowerCase().startsWith('zomer') ? 'zomer' : 'winter';
}

function getPlayStyle(seasonType: string): 'strokeplay' | 'matchplay' {
  return seasonType === 'zomer' ? 'strokeplay' : 'matchplay';
}

async function main() {
  console.log('🏌️  Vrijmigo — Historische data import');
  console.log('=========================================\n');

  // 1. Haal speler IDs op
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, name');

  if (playersError || !players?.length) {
    console.error('❌ Geen spelers gevonden. Voer eerst de database migraties uit.');
    process.exit(1);
  }

  const matthi = players.find(p => p.name === 'Matthi');
  const rob = players.find(p => p.name === 'Rob');

  if (!matthi || !rob) {
    console.error('❌ Matthi en/of Rob niet gevonden in players tabel.');
    process.exit(1);
  }

  console.log(`✅ Spelers gevonden: Matthi (${matthi.id}), Rob (${rob.id})`);

  // 2. Haal Bergvliet course ID op
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name')
    .eq('name', 'Landgoed Bergvliet')
    .single();

  if (!courses) {
    console.error('❌ Landgoed Bergvliet niet gevonden in courses tabel.');
    process.exit(1);
  }

  const courseId = courses.id;
  console.log(`✅ Baan gevonden: Landgoed Bergvliet (${courseId})\n`);

  // 3. Laad historische data
  const dataPath = path.join(__dirname, '../seed-data/rounds.json');
  const rawData: HistoricalRound[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📂 ${rawData.length} historische rondes geladen\n`);

  // 4. Importeer per ronde
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const round of rawData) {
    try {
      const seasonType = getSeasonType(round.season);
      const playStyle = getPlayStyle(seasonType);
      const isCompetition = (round.matthi_score !== null || round.hcp_matthi !== null) &&
                             (round.rob_score !== null);

      // Insert round
      const { data: newRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          course_id: courseId,
          date: round.date,
          start_time: null,
          season: round.season,
          season_type: seasonType,
          play_style: playStyle,
          loop: round.lus,
          holes_played: round.holes,
          is_competition: isCompetition,
          is_qualifying: false,
          notes: round.notes,
          imported_from_excel: true,
        })
        .select('id')
        .single();

      if (roundError) {
        console.error(`❌ Fout bij ronde ${round.date}:`, roundError.message);
        errors++;
        continue;
      }

      const roundId = newRound.id;

      // Insert Matthi round_player
      if (round.matthi_score !== null || round.hcp_matthi !== null) {
        const matthi_wins = round.winner === 'matthi';
        const is_draw = round.winner === 'gelijk';

        await supabase.from('round_players').insert({
          round_id: roundId,
          player_id: matthi.id,
          role: 'marker',
          gross_score: round.matthi_score,
          stableford_points: round.matthi_stb,
          putts_total: round.matthi_putts,
          putts_per_hole: round.matthi_putts && round.holes
            ? round.matthi_putts / round.holes
            : null,
          hcp_at_time: round.hcp_matthi,
          is_winner: matthi_wins,
          is_draw: is_draw,
        });
      }

      // Insert Rob round_player
      if (round.rob_score !== null) {
        const rob_wins = round.winner === 'rob';
        const is_draw = round.winner === 'gelijk';

        await supabase.from('round_players').insert({
          round_id: roundId,
          player_id: rob.id,
          role: 'speler',
          gross_score: round.rob_score,
          stableford_points: round.rob_stb,
          putts_total: round.rob_putts,
          putts_per_hole: round.rob_putts && round.holes
            ? round.rob_putts / round.holes
            : null,
          hcp_at_time: round.hcp_rob,
          is_winner: rob_wins,
          is_draw: is_draw,
        });
      }

      imported++;
      if (imported % 10 === 0) {
        console.log(`  ✓ ${imported}/${rawData.length} rondes geïmporteerd...`);
      }

    } catch (err) {
      console.error(`❌ Onverwachte fout bij ${round.date}:`, err);
      errors++;
    }
  }

  console.log('\n=========================================');
  console.log(`✅ Import klaar!`);
  console.log(`   Geïmporteerd: ${imported}`);
  console.log(`   Overgeslagen: ${skipped}`);
  console.log(`   Fouten:       ${errors}`);
}

main().catch(console.error);
