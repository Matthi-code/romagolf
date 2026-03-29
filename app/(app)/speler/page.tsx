"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import { supabase } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils/format";
import type { RoundSummary } from "@/types";

interface Stats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
  avgScore: string;
  lastHcp: number | null;
  avgPuttsPerHole: string;
  bestScore: number | null;
  bestScoreDate: string;
}

export default function SpelerDashboard() {
  const { session } = usePlayer();
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("alle");
  const [stats, setStats] = useState<Stats>({
    wins: 0, losses: 0, draws: 0, total: 0,
    currentStreak: 0, streakType: "none",
    avgScore: "-", lastHcp: null, avgPuttsPerHole: "-",
    bestScore: null, bestScoreDate: "",
  });
  const [loading, setLoading] = useState(true);

  const name = "matthi" as "matthi" | "rob";

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .order("date", { ascending: false });

      if (!data) { setLoading(false); return; }
      setAllRounds(data);
      const uniqueSeasons = Array.from(new Set(data.map((r) => r.season)));
      setSeasons(uniqueSeasons);
      setLoading(false);
    }
    if (name) load();
  }, [name]);

  // Recalculate stats when filter changes
  const filtered = selectedSeason === "alle" ? allRounds : allRounds.filter((r) => r.season === selectedSeason);
  const recentRounds = filtered.slice(0, 5);

  useEffect(() => {
    if (allRounds.length === 0) return;
    const data = filtered;

    const comp = data.filter((r) => r.is_competition);
    let wins = 0, losses = 0, draws = 0;
    comp.forEach((r) => {
      if (r.winner === name) wins++;
      else if (r.winner === "gelijk") draws++;
      else losses++;
    });

    let streak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const r of comp) {
      if (streak === 0) {
        if (r.winner === name) { streakType = "win"; streak = 1; }
        else if (r.winner !== "gelijk") { streakType = "loss"; streak = 1; }
        else break;
      } else {
        if (streakType === "win" && r.winner === name) streak++;
        else if (streakType === "loss" && r.winner !== name && r.winner !== "gelijk") streak++;
        else break;
      }
    }

    const scoreKey = name === "matthi" ? "matthi_score" : "rob_score";
    const nineHoleScores = data
      .filter((r) => r.holes_played === 9 && r[scoreKey] != null)
      .map((r) => ({ score: r[scoreKey] as number, date: r.date }));
    const avgScore = nineHoleScores.length > 0
      ? (nineHoleScores.reduce((a, b) => a + b.score, 0) / nineHoleScores.length).toFixed(1) : "-";

    let bestScore: number | null = null;
    let bestScoreDate = "";
    for (const s of nineHoleScores) {
      if (bestScore === null || s.score < bestScore) { bestScore = s.score; bestScoreDate = s.date; }
    }

    const hcpKey = name === "matthi" ? "matthi_hcp" : "rob_hcp";
    const latestHcp = data.find((r) => r[hcpKey] != null);
    const lastHcp = latestHcp ? (latestHcp[hcpKey] as number) : null;

    const puttsKey = name === "matthi" ? "matthi_putts_per_hole" : "rob_putts_per_hole";
    const puttsValues = data.filter((r) => r[puttsKey] != null).map((r) => r[puttsKey] as number);
    const avgPutts = puttsValues.length > 0
      ? (puttsValues.reduce((a, b) => a + b, 0) / puttsValues.length).toFixed(1) : "-";

    setStats({ wins, losses, draws, total: comp.length, currentStreak: streak, streakType, avgScore, lastHcp, avgPuttsPerHole: avgPutts, bestScore, bestScoreDate });
  }, [filtered, allRounds, name, selectedSeason]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-28 bg-white rounded-2xl" />
        <div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white rounded-xl" />)}</div>
      </div>
    );
  }

  const scoreKey = name === "matthi" ? "matthi_score" : "rob_score";
  const oppScoreKey = name === "matthi" ? "rob_score" : "matthi_score";

  return (
    <div className="space-y-3">
      {/* Season filter */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Mijn spel</h2>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white font-medium"
        >
          <option value="alle">Alle seizoenen</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Hero — zalmroze achtergrond */}
      <div className="bg-accent-light rounded-xl p-4 border border-accent/20">
        <p className="text-accent-dark text-[10px] uppercase tracking-[0.15em] mb-2">
          Matthi
        </p>
        <div className="flex items-end gap-6">
          {stats.lastHcp != null && (
            <div>
              <p className="text-3xl font-mono font-bold text-navy">{stats.lastHcp}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">Handicap</p>
            </div>
          )}
          <div>
            <p className="text-3xl font-mono font-bold text-navy">{stats.avgScore}</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">Gem. 9h</p>
          </div>
          {stats.avgPuttsPerHole !== "-" && (
            <div>
              <p className="text-3xl font-mono font-bold text-navy">{stats.avgPuttsPerHole}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">Putts/h</p>
            </div>
          )}
        </div>
      </div>

      {/* Win/loss row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-xl p-2 text-center shadow-card">
          <p className="text-xl font-mono font-bold text-matthi">{stats.wins}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Won</p>
        </div>
        <div className="bg-white rounded-xl p-2 text-center shadow-card">
          <p className="text-xl font-mono font-bold text-rob">{stats.losses}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Verloren</p>
        </div>
        <div className="bg-white rounded-xl p-2 text-center shadow-card">
          <p className="text-xl font-mono font-bold text-gray-300">{stats.draws}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Gelijk</p>
        </div>
        <div className="bg-white rounded-xl p-2 text-center shadow-card">
          {stats.currentStreak > 0 ? (
            <>
              <p className={`text-xl font-mono font-bold ${stats.streakType === "win" ? "text-matthi" : "text-rob"}`}>{stats.currentStreak}x</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">{stats.streakType === "win" ? "Streak" : "Slecht"}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-mono font-bold text-gray-200">—</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Streak</p>
            </>
          )}
        </div>
      </div>

      {/* Best score — zalmroze */}
      {stats.bestScore != null && (
        <div className="bg-accent-light rounded-xl p-3 flex items-center justify-between border border-accent/20">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-accent-dark">Beste 9h score</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(stats.bestScoreDate)}</p>
          </div>
          <p className="text-3xl font-mono font-bold text-navy">{stats.bestScore}</p>
        </div>
      )}

      {/* Laatste rondes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Laatste rondes</h3>
          <Link href="/speler/rondes" className="text-[11px] text-accent font-medium">Alles &rarr;</Link>
        </div>
        <div className="space-y-1.5">
          {recentRounds.map((r) => {
            const myScore = r[scoreKey] as number | null;
            const oppScore = r[oppScoreKey] as number | null;
            const won = r.winner === name;
            const draw = r.winner === "gelijk";
            return (
              <Link
                key={r.id}
                href={`/speler/rondes/${r.id}`}
                className={`block bg-white rounded-xl p-3 shadow-card border-l-[3px] card-interactive ${
                  won ? "border-matthi" : draw ? "border-gray-200" : "border-rob"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-700">{formatDateShort(r.date)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Lus <span className="font-mono">{r.loop}</span> · <span className="font-mono">{r.holes_played}</span>h
                      {r.weather_icon && ` ${r.weather_icon}`}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-lg text-gray-800">
                    {myScore ?? "—"}
                    <span className="text-gray-200 text-sm mx-1.5">–</span>
                    <span className="text-gray-400 text-base">{oppScore ?? "—"}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        {recentRounds.length === 0 && (
          <div className="bg-white rounded-xl p-6 text-center shadow-card">
            <p className="text-gray-400 text-sm">Geen rondes gevonden</p>
          </div>
        )}
      </div>
    </div>
  );
}
