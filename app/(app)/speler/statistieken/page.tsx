"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface HoleScore {
  hole_number: number;
  par: number;
  gross_score: number;
  putts: number | null;
  player_name: string;
  round_date: string;
  season: string;
  holes_played: number;
}

const SCORE_COLORS: Record<string, string> = {
  "Eagle": "#f59e0b",
  "Birdie": "#22c55e",
  "Par": "#60a5fa",
  "Bogey": "#ef4444",
  "Dbl Bogey+": "#991b1b",
};

const SCORE_ORDER = ["Eagle", "Birdie", "Par", "Bogey", "Dbl Bogey+"];

function classifyScore(gross: number, par: number): string {
  const diff = gross - par;
  if (diff <= -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  return "Dbl Bogey+";
}

// Bergvliet hole distances (gele tee)
const HOLE_DISTANCES: Record<number, number> = {
  1: 151, 2: 332, 3: 499, 4: 200, 5: 339, 6: 166, 7: 486, 8: 376, 9: 512,
  10: 306, 11: 171, 12: 360, 13: 384, 14: 515, 15: 188, 16: 479, 17: 329, 18: 135,
};

export default function StatistiekenPage() {
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Get players map
      const { data: players } = await supabase.from("players").select("id, name");
      const pm = new Map(players?.map((p: { id: string; name: string }) => [p.id, p.name]) || []);

      // Get all rounds with seasons
      const { data: rounds } = await supabase
        .from("v_round_summary")
        .select("id, season, season_type, date, holes_played, is_competition")
        .eq("is_competition", true)
        .order("date", { ascending: true });

      if (!rounds || rounds.length === 0) { setLoading(false); return; }

      const roundMap = new Map(rounds.map((r) => [r.id, r]));
      const roundIds = rounds.map((r) => r.id);

      // Get all hole scores for these rounds
      const { data: holes } = await supabase
        .from("hole_scores")
        .select("hole_number, par, gross_score, putts, player_id, round_id")
        .in("round_id", roundIds)
        .not("gross_score", "is", null);

      if (holes) {
        const mapped: HoleScore[] = holes.map((h: { hole_number: number; par: number; gross_score: number; putts: number | null; player_id: string; round_id: string }) => {
          const round = roundMap.get(h.round_id);
          return {
            hole_number: h.hole_number,
            par: h.par,
            gross_score: h.gross_score,
            putts: h.putts,
            player_name: pm.get(h.player_id) || "?",
            round_date: round?.date || "",
            season: round?.season || "",
            holes_played: round?.holes_played || 9,
          };
        });
        setHoleScores(mapped);

        const uniqueSeasons = Array.from(new Set(rounds.map((r) => r.season))).reverse();
        setSeasons(uniqueSeasons);
        const current = uniqueSeasons.find((s) => s === "Zomer 2026") || uniqueSeasons[0];
        setSelectedSeason(current);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = holeScores.filter((h) => {
    if (selectedSeason === "alle") return true;
    return h.season === selectedSeason;
  });

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-28 bg-white rounded-xl" /><div className="h-48 bg-white rounded-xl" /></div>;
  }

  // Score distribution per player
  function getDistribution(playerName: string) {
    const playerHoles = filtered.filter((h) => h.player_name === playerName);
    const counts: Record<string, number> = {};
    SCORE_ORDER.forEach((s) => (counts[s] = 0));
    playerHoles.forEach((h) => {
      const cat = classifyScore(h.gross_score, h.par);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = playerHoles.length;
    return { counts, total };
  }

  const matthiDist = getDistribution("Matthi");
  const robDist = getDistribution("Rob");

  // Par average per player
  function getParAverage(playerName: string) {
    const playerHoles = filtered.filter((h) => h.player_name === playerName);
    const parGroups: Record<number, number[]> = { 3: [], 4: [], 5: [] };
    playerHoles.forEach((h) => {
      if (parGroups[h.par]) parGroups[h.par].push(h.gross_score);
    });
    return Object.entries(parGroups).map(([par, scores]) => ({
      par: Number(par),
      avg: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
      count: scores.length,
    }));
  }

  const matthiParAvg = getParAverage("Matthi");
  const robParAvg = getParAverage("Rob");

  // Best/worst rounds
  function getBestWorst(playerName: string) {
    const playerScores = filtered.filter((h) => h.player_name === playerName);
    const roundTotals = new Map<string, { score: number; date: string; holes: number }>();
    playerScores.forEach((h) => {
      const key = h.round_date;
      const existing = roundTotals.get(key);
      if (existing) {
        existing.score += h.gross_score;
        existing.holes++;
      } else {
        roundTotals.set(key, { score: h.gross_score, date: h.round_date, holes: 1 });
      }
    });

    const nineHoles = Array.from(roundTotals.values()).filter((r) => r.holes >= 8 && r.holes <= 10);
    const best9 = nineHoles.length > 0 ? nineHoles.reduce((a, b) => a.score < b.score ? a : b) : null;
    const worst9 = nineHoles.length > 0 ? nineHoles.reduce((a, b) => a.score > b.score ? a : b) : null;

    return { best9, worst9 };
  }

  const matthiBW = getBestWorst("Matthi");
  const robBW = getBestWorst("Rob");

  // Golf kilometers
  const allRoundDates = new Set(filtered.map((h) => h.round_date + "|" + h.player_name));
  const roundHoles = new Map<string, number[]>();
  filtered.forEach((h) => {
    const key = h.round_date;
    if (!roundHoles.has(key)) roundHoles.set(key, []);
    const holes = roundHoles.get(key)!;
    if (!holes.includes(h.hole_number)) holes.push(h.hole_number);
  });

  let totalMeters = 0;
  roundHoles.forEach((holes) => {
    holes.forEach((holeNum) => {
      totalMeters += HOLE_DISTANCES[holeNum] || 0;
    });
  });
  const golfKm = Math.round(totalMeters / 100) / 10;

  const hasData = filtered.length > 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Statistieken">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white/80 font-medium"
        >
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
          <option disabled>───</option>
          <option value="alle">Alle seizoenen</option>
        </select>
      </PageHeader>

      {!hasData ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-card">
          <p className="text-gray-400 text-sm">Nog geen hole-by-hole data voor deze periode</p>
          <p className="text-[10px] text-gray-300 mt-1">Upload scorekaarten met hole scores om statistieken te zien</p>
        </div>
      ) : (
        <>
          {/* Scores Donut - Matthi & Rob naast elkaar */}
          <div className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Score verdeling</p>
            <div className="grid grid-cols-2 gap-4">
              <ScoreDonut name="Matthi" dist={matthiDist} color="#1a6b3c" />
              <ScoreDonut name="Rob" dist={robDist} color="#c0392b" />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
              {SCORE_ORDER.map((cat) => (
                <span key={cat} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SCORE_COLORS[cat] }} />
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Par gemiddelde */}
          {matthiParAvg.some((p) => p.avg !== null) && (
            <div className="bg-white rounded-xl p-4 shadow-card">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Par gemiddelde</p>
              <div className="space-y-2">
                {[3, 4, 5].map((par) => {
                  const mAvg = matthiParAvg.find((p) => p.par === par)?.avg;
                  const rAvg = robParAvg.find((p) => p.par === par)?.avg;
                  const maxVal = Math.max(par + 3, mAvg || 0, rAvg || 0);
                  return (
                    <div key={par} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-navy w-10">Par {par}</span>
                      <div className="flex-1 space-y-1">
                        {mAvg !== null && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-matthi"
                                style={{ width: `${(mAvg! / maxVal) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-matthi w-8 text-right">{mAvg}</span>
                          </div>
                        )}
                        {rAvg !== null && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-rob"
                                style={{ width: `${(rAvg! / maxVal) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-rob w-8 text-right">{rAvg}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-[9px] text-gray-300 mt-2">Lager = beter</p>
            </div>
          )}

          {/* Beste/slechtste ronde */}
          {(matthiBW.best9 || robBW.best9) && (
            <div className="bg-white rounded-xl p-4 shadow-card">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Aantal slagen (9 holes)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-1">Beste ronde</p>
                  {matthiBW.best9 && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-matthi">{matthiBW.best9.score}</span>
                      <span className="text-[10px] text-gray-400">Mat</span>
                    </div>
                  )}
                  {robBW.best9 && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-rob">{robBW.best9.score}</span>
                      <span className="text-[10px] text-gray-400">Rob</span>
                    </div>
                  )}
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-1">Slechtste ronde</p>
                  {matthiBW.worst9 && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-matthi">{matthiBW.worst9.score}</span>
                      <span className="text-[10px] text-gray-400">Mat</span>
                    </div>
                  )}
                  {robBW.worst9 && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold text-rob">{robBW.worst9.score}</span>
                      <span className="text-[10px] text-gray-400">Rob</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Golfkilometers */}
          {golfKm > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-card">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Golfkilometers</p>
              <p className="text-[10px] text-gray-400 mb-1">Minimale afstand gelopen op de golfbaan</p>
              <p className="text-3xl font-mono font-bold text-matthi">{golfKm.toLocaleString("nl-NL")} km</p>
              <p className="text-[9px] text-gray-300 mt-1">Berekend op basis van afslag → hole afstand (gele tee, Bergvliet)</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScoreDonut({ name, dist, color }: { name: string; dist: { counts: Record<string, number>; total: number }; color: string }) {
  const data = SCORE_ORDER
    .filter((cat) => dist.counts[cat] > 0)
    .map((cat) => ({ name: cat, value: dist.counts[cat] }));

  if (dist.total === 0) {
    return (
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color }}>-</p>
        <p className="text-[10px] text-gray-300">{name}</p>
      </div>
    );
  }

  const bogeyPct = dist.total > 0
    ? Math.round(((dist.counts["Bogey"] + dist.counts["Dbl Bogey+"]) / dist.total) * 100 * 10) / 10
    : 0;

  return (
    <div className="text-center">
      <p className="text-xs font-semibold mb-1" style={{ color }}>{name}</p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={130}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={1}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={SCORE_COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-navy">{bogeyPct}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mt-1">
        {SCORE_ORDER.map((cat) => (
          dist.counts[cat] > 0 && (
            <div key={cat} className="flex justify-between">
              <span className="text-gray-400">{cat}</span>
              <span className="font-mono font-medium text-navy">{dist.counts[cat]}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
