"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils/format";
import type { RoundSummary } from "@/types";

interface SeasonStanding {
  season: string;
  matthi: number;
  rob: number;
  gelijk: number;
  matthiAvgScore: string;
  robAvgScore: string;
  matthiAvgPutts: string;
  robAvgPutts: string;
  totalRounds: number;
}

const HEADER_IMAGES = [
  "/images/fairway.jpg",
  "/images/sunset-drive.jpg",
  "/images/golden-fairway.jpg",
  "/images/dawn-mist.jpg",
  "/images/waterhole.jpg",
  "/images/green-flag.jpg",
  "/images/summer-tee.jpg",
];

export default function CompetitieStand() {
  const [standings, setStandings] = useState<SeasonStanding[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchief, setShowArchief] = useState(false);
  const [headerImg] = useState(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .eq("is_competition", true)
        .order("date", { ascending: false });

      if (data) {
        setAllRounds(data);

        const bySeasonMap = new Map<string, { matthi: number; rob: number; gelijk: number; matthiScores: number[]; robScores: number[]; matthiPutts: number[]; robPutts: number[] }>();
        data.forEach((r) => {
          if (!bySeasonMap.has(r.season)) {
            bySeasonMap.set(r.season, { matthi: 0, rob: 0, gelijk: 0, matthiScores: [], robScores: [], matthiPutts: [], robPutts: [] });
          }
          const s = bySeasonMap.get(r.season)!;
          if (r.winner === "matthi") s.matthi++;
          else if (r.winner === "rob") s.rob++;
          else s.gelijk++;
          if (r.matthi_score != null && r.holes_played === 9) s.matthiScores.push(r.matthi_score);
          if (r.rob_score != null && r.holes_played === 9) s.robScores.push(r.rob_score);
          if (r.matthi_putts_per_hole != null) s.matthiPutts.push(r.matthi_putts_per_hole);
          if (r.rob_putts_per_hole != null) s.robPutts.push(r.rob_putts_per_hole);
        });

        const all = Array.from(bySeasonMap.entries()).map(([season, s]) => ({
          season,
          matthi: s.matthi, rob: s.rob, gelijk: s.gelijk,
          totalRounds: s.matthi + s.rob + s.gelijk,
          matthiAvgScore: s.matthiScores.length > 0 ? (s.matthiScores.reduce((a, b) => a + b, 0) / s.matthiScores.length).toFixed(1) : "-",
          robAvgScore: s.robScores.length > 0 ? (s.robScores.reduce((a, b) => a + b, 0) / s.robScores.length).toFixed(1) : "-",
          matthiAvgPutts: s.matthiPutts.length > 0 ? (s.matthiPutts.reduce((a, b) => a + b, 0) / s.matthiPutts.length).toFixed(1) : "-",
          robAvgPutts: s.robPutts.length > 0 ? (s.robPutts.reduce((a, b) => a + b, 0) / s.robPutts.length).toFixed(1) : "-",
        }));

        setStandings(all);
        const zomer2026 = all.find(s => s.season === "Zomer 2026");
        setSelectedSeason(zomer2026 ? "Zomer 2026" : all[0]?.season || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const current = standings.find((s) => s.season === selectedSeason);
  const total = current ? current.matthi + current.rob + current.gelijk : 0;
  const leader = current
    ? current.matthi > current.rob ? "matthi" : current.rob > current.matthi ? "rob" : "gelijk"
    : "gelijk";
  const seasonRounds = allRounds.filter(r => r.season === selectedSeason);

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-28 bg-white rounded-xl" /><div className="h-40 bg-white rounded-xl" /></div>;
  }

  return (
    <div className="space-y-3">
      {/* Header met transparante foto */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${headerImg})` }} />
        <div className="absolute inset-0 bg-white/65" />
        <div className="relative px-4 py-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">Competitie</h2>
          <div className="flex gap-2">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white/80 font-medium"
            >
              {standings.map((s) => <option key={s.season} value={s.season}>{s.season}</option>)}
            </select>
            <button
              onClick={() => setShowArchief(!showArchief)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/80 border border-gray-200 text-gray-600"
            >
              {showArchief ? "×" : "Archief"}
            </button>
          </div>
        </div>
      </div>

      {/* Archief */}
      {showArchief && (
        <div className="bg-white rounded-xl overflow-hidden shadow-card">
          {standings.map((s) => {
            const sLeader = s.matthi > s.rob ? "matthi" : s.rob > s.matthi ? "rob" : "gelijk";
            const active = s.season === selectedSeason;
            return (
              <button
                key={s.season}
                className={`w-full px-3 py-2 flex justify-between items-center border-b border-sand last:border-0 active:bg-sand ${active ? "bg-sand" : ""}`}
                onClick={() => { setSelectedSeason(s.season); setShowArchief(false); }}
              >
                <div className="flex items-center gap-2">
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  <span className={`text-sm ${active ? "font-bold text-navy" : "text-gray-600"}`}>{s.season}</span>
                  <span className="text-[10px] text-gray-400"><span className="font-mono">{s.totalRounds}</span> rondes</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                  <span className={sLeader === "matthi" ? "text-matthi" : "text-gray-500"}>{s.matthi}</span>
                  <span className="text-gray-300 text-xs">-</span>
                  <span className={sLeader === "rob" ? "text-rob" : "text-gray-500"}>{s.rob}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {current && (
        <>
          {/* Score card */}
          <div className="card-highlight rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className={`text-4xl font-mono font-bold ${leader === "matthi" ? "text-matthi" : "text-navy"}`}>{current.matthi}</p>
                <p className="text-gray-500 text-xs mt-0.5">Mat</p>
              </div>
              <div className="text-gray-300">vs</div>
              <div>
                <p className={`text-4xl font-mono font-bold ${leader === "rob" ? "text-rob" : "text-navy"}`}>{current.rob}</p>
                <p className="text-gray-500 text-xs mt-0.5">Rob</p>
              </div>
            </div>
            {current.gelijk > 0 && <p className="text-gray-400 text-[10px] mt-1"><span className="font-mono">{current.gelijk}</span>x gelijk</p>}

            {/* Win bar */}
            <div className="flex h-5 rounded-full overflow-hidden mt-3">
              {current.matthi > 0 && <div className="bg-matthi flex items-center justify-center text-white text-[10px] font-mono font-bold" style={{ width: `${(current.matthi / total) * 100}%` }}>{current.matthi}</div>}
              {current.gelijk > 0 && <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-mono" style={{ width: `${(current.gelijk / total) * 100}%` }}>{current.gelijk}</div>}
              {current.rob > 0 && <div className="bg-rob flex items-center justify-center text-white text-[10px] font-mono font-bold" style={{ width: `${(current.rob / total) * 100}%` }}>{current.rob}</div>}
            </div>
          </div>

          {/* Statistieken voor geselecteerd seizoen */}
          <div className="bg-white rounded-xl p-3 shadow-card">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Gemiddelden {selectedSeason}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-1"></th>
                  <th className="text-center pb-1 text-matthi">Mat</th>
                  <th className="text-center pb-1 text-rob">Rob</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-t border-sand">
                  <td className="py-1.5 text-gray-500 font-body text-xs">Score (9h)</td>
                  <td className="py-1.5 text-center font-bold text-navy">{current.matthiAvgScore}</td>
                  <td className="py-1.5 text-center font-bold text-navy">{current.robAvgScore}</td>
                </tr>
                {(current.matthiAvgPutts !== "-" || current.robAvgPutts !== "-") && (
                  <tr className="border-t border-sand">
                    <td className="py-1.5 text-gray-500 font-body text-xs">Putts/hole</td>
                    <td className="py-1.5 text-center font-bold text-navy">{current.matthiAvgPutts}</td>
                    <td className="py-1.5 text-center font-bold text-navy">{current.robAvgPutts}</td>
                  </tr>
                )}
                <tr className="border-t border-sand">
                  <td className="py-1.5 text-gray-500 font-body text-xs">Win %</td>
                  <td className="py-1.5 text-center font-bold text-navy">{total > 0 ? Math.round((current.matthi / total) * 100) : 0}%</td>
                  <td className="py-1.5 text-center font-bold text-navy">{total > 0 ? Math.round((current.rob / total) * 100) : 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rondes — 1 compacte regel per ronde, klikbaar */}
          {seasonRounds.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                Wedstrijden <span className="font-mono">{seasonRounds.length}</span>
              </p>
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                {seasonRounds.map((r, i) => (
                  <Link
                    key={r.id}
                    href={`/speler/rondes/${r.id}`}
                    className={`flex items-center px-3 py-2 card-interactive ${
                      i > 0 ? "border-t border-sand" : ""
                    }`}
                  >
                    {/* Winnaar indicator */}
                    <span className={`w-1 h-8 rounded-full mr-3 shrink-0 ${
                      r.winner === "matthi" ? "bg-matthi" : r.winner === "rob" ? "bg-rob" : "bg-gray-200"
                    }`} />

                    {/* Datum + starttijd */}
                    <span className="w-20 shrink-0 flex flex-col">
                      <span className="text-sm font-medium text-gray-700 leading-tight">{formatDateShort(r.date)}</span>
                      {r.start_time && <span className="text-[9px] font-mono text-gray-300 leading-tight">{String(r.start_time).substring(0, 5)}</span>}
                    </span>

                    {/* Lus info */}
                    <span className="text-[10px] text-gray-400 shrink-0 flex flex-col leading-tight">
                      <span className="font-mono">{r.loop}</span>
                      <span className="font-mono text-[9px] text-gray-300">{r.holes_played}h</span>
                    </span>

                    {/* Weer: icoon + temp, tijdbalk eronder */}
                    {(r.weather_icon || r.start_time) && (
                      <span className="shrink-0 w-12 flex flex-col items-center gap-0.5 mx-1">
                        <span className="flex items-center gap-0.5">
                          {r.weather_icon && <span className="text-[10px] leading-none">{r.weather_icon}</span>}
                          {r.temperature_c != null && <span className="text-[9px] font-mono text-gray-400 leading-none">{r.temperature_c}°</span>}
                        </span>
                        {r.start_time && (() => {
                          const hour = parseInt(String(r.start_time).substring(0, 2), 10);
                          const pct = Math.max(0, Math.min(100, ((hour - 6) / 14) * 100));
                          return (
                            <span className="relative w-10 h-1" title={String(r.start_time).substring(0, 5)}>
                              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200" />
                              <span
                                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 border border-white shadow-sm"
                                style={{ left: `calc(${pct}% - 3px)` }}
                              />
                            </span>
                          );
                        })()}
                      </span>
                    )}

                    {/* Scores: Matthi - Rob */}
                    <span className="flex-1 text-right font-mono text-sm">
                      <span className={`font-bold ${r.winner === "matthi" ? "text-matthi" : "text-gray-600"}`}>{r.matthi_score ?? "-"}</span>
                      <span className="text-gray-300 mx-1">–</span>
                      <span className={`font-bold ${r.winner === "rob" ? "text-rob" : "text-gray-600"}`}>{r.rob_score ?? "-"}</span>
                    </span>

                    {/* Putts */}
                    <span className="text-[10px] text-gray-400 font-mono w-20 text-right shrink-0">
                      {r.matthi_putts != null && r.rob_putts != null
                        ? `${r.matthi_putts}p–${r.rob_putts}p`
                        : ""
                      }
                    </span>

                    {/* Chevron */}
                    <span className="text-accent ml-2 text-sm font-bold">›</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {seasonRounds.length === 0 && (
            <div className="bg-white rounded-xl p-6 text-center shadow-card">
              <p className="text-gray-400 text-sm">Nog geen wedstrijden dit seizoen</p>
            </div>
          )}
        </>
      )}

      {/* Foto footer */}
      <div
        className="w-full aspect-[16/7] rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${HEADER_IMAGES[(HEADER_IMAGES.indexOf(headerImg) + 3) % HEADER_IMAGES.length]})` }}
      />
    </div>
  );
}
