"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import type { RoundSummary } from "@/types";

const PHOTOS = [
  "/images/fairway.jpg",
  "/images/sunset-drive.jpg",
  "/images/golden-fairway.jpg",
  "/images/dawn-mist.jpg",
  "/images/waterhole.jpg",
  "/images/green-flag.jpg",
  "/images/summer-tee.jpg",
  "/images/hero-bergvliet.jpg",
  "/images/winter-sun.jpg",
];

interface LoopStats {
  loop: string;
  matthi: number;
  rob: number;
  gelijk: number;
}

interface Streak {
  player: "matthi" | "rob";
  count: number;
  from: string;
  to: string;
}

interface HoleRecord {
  hole_number: number;
  par: number;
  gross_score: number;
  putts: number | null;
  player_name: string;
  round_date: string;
  round_id: string;
  season: string;
  season_type: string;
}

export default function HeadToHeadPage() {
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx] = useState(() => Math.floor(Math.random() * PHOTOS.length));
  const [holeRecords, setHoleRecords] = useState<HoleRecord[]>([]);
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({});
  const [aiHistory, setAiHistory] = useState<Record<string, string[]>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiExpanded, setAiExpanded] = useState<string | null>(null);

  // Restore AI advice from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai-coach-advice");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.current) setAiAdvice(parsed.current);
        if (parsed.history) setAiHistory(parsed.history);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .eq("is_competition", true)
        .order("date", { ascending: true });

      if (data && data.length > 0) {
        setAllRounds(data);
        const uniqueSeasons = Array.from(new Set(data.map((r) => r.season)));
        const current = uniqueSeasons.find((s) => s === "Zomer 2026") || uniqueSeasons[uniqueSeasons.length - 1];
        setSeasons(uniqueSeasons.reverse());
        setSelectedSeason(current);
        setRounds(data.filter((r) => r.season === current));

        // Hole-level records laden
        const roundIds = data.map((r) => r.id);
        const { data: holes } = await supabase
          .from("hole_scores")
          .select("hole_number, par, gross_score, putts, player_id, round_id")
          .in("round_id", roundIds);

        if (holes && holes.length > 0) {
          const { data: players } = await supabase.from("players").select("id, name");
          const pm = new Map(players?.map((p: { id: string; name: string }) => [p.id, p.name]) || []);
          const roundInfoMap = new Map(data.map((r) => [r.id, { date: r.date, season: r.season, season_type: r.season_type }]));

          const mapped: HoleRecord[] = holes
            .filter((h) => h.gross_score != null)
            .map((h) => ({
              hole_number: h.hole_number,
              par: h.par,
              gross_score: h.gross_score!,
              putts: h.putts,
              player_name: pm.get(h.player_id) || "?",
              round_date: roundInfoMap.get(h.round_id)?.date || "",
              round_id: h.round_id,
              season: roundInfoMap.get(h.round_id)?.season || "",
              season_type: roundInfoMap.get(h.round_id)?.season_type || "",
            }));
          setHoleRecords(mapped);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedSeason === "alle") {
      setRounds(allRounds);
    } else if (selectedSeason === "alle-zomers") {
      setRounds(allRounds.filter((r) => r.season_type === "zomer"));
    } else if (selectedSeason === "alle-winters") {
      setRounds(allRounds.filter((r) => r.season_type === "winter"));
    } else if (selectedSeason) {
      setRounds(allRounds.filter((r) => r.season === selectedSeason));
    }
  }, [selectedSeason, allRounds]);

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-28 bg-white rounded-xl" /><div className="h-40 bg-white rounded-xl" /></div>;
  }

  if (allRounds.length === 0) {
    return (
      <div className="space-y-3">
        <PageHeader title="Head-to-Head" />
        <div className="bg-white rounded-xl p-8 text-center shadow-card">
          <p className="text-gray-400 text-sm">Nog geen wedstrijden</p>
        </div>
      </div>
    );
  }

  // --- Win per lus ---
  const loopMap = new Map<string, { matthi: number; rob: number; gelijk: number }>();
  rounds.forEach((r) => {
    if (!loopMap.has(r.loop)) loopMap.set(r.loop, { matthi: 0, rob: 0, gelijk: 0 });
    const s = loopMap.get(r.loop)!;
    if (r.winner === "matthi") s.matthi++;
    else if (r.winner === "rob") s.rob++;
    else s.gelijk++;
  });
  const loopStats: LoopStats[] = Array.from(loopMap.entries())
    .map(([loop, s]) => ({ loop, ...s }))
    .sort((a, b) => a.loop.localeCompare(b.loop));

  // --- Langste winstreak ---
  function calcStreaks(): Streak[] {
    const streaks: Streak[] = [];
    let current: Streak | null = null;

    rounds.forEach((r) => {
      if (r.winner === "matthi" || r.winner === "rob") {
        if (current && current.player === r.winner) {
          current.count++;
          current.to = r.date;
        } else {
          if (current) streaks.push(current);
          current = { player: r.winner, count: 1, from: r.date, to: r.date };
        }
      } else {
        if (current) streaks.push(current);
        current = null;
      }
    });
    if (current) streaks.push(current);
    return streaks.sort((a, b) => b.count - a.count);
  }

  const streaks = calcStreaks();
  const topStreak = streaks[0] || null;
  const matthiStreak = streaks.find((s) => s.player === "matthi");
  const robStreak = streaks.find((s) => s.player === "rob");

  // --- Grootste & kleinste verschil ---
  const scoreDiffs = rounds
    .filter((r) => r.matthi_score != null && r.rob_score != null)
    .map((r) => ({ round: r, diff: Math.abs(r.matthi_score! - r.rob_score!) }))
    .sort((a, b) => b.diff - a.diff);

  const biggestDiff = scoreDiffs[0] ?? null;
  const closestMatch = scoreDiffs[scoreDiffs.length - 1] ?? null;

  // --- Hole records (gefilterd op seizoen) ---
  const filteredHoles = holeRecords.filter((h) => {
    if (selectedSeason === "alle") return true;
    if (selectedSeason === "alle-zomers") return h.season_type === "zomer";
    if (selectedSeason === "alle-winters") return h.season_type === "winter";
    return h.season === selectedSeason;
  });

  const bestHole = filteredHoles.length > 0
    ? filteredHoles.reduce((best, h) => (h.gross_score - h.par) < (best.gross_score - best.par) ? h : best)
    : null;
  const worstHole = filteredHoles.length > 0
    ? filteredHoles.reduce((worst, h) => (h.gross_score - h.par) > (worst.gross_score - worst.par) ? h : worst)
    : null;
  const holesWithPutts = filteredHoles.filter((h) => h.putts != null && h.putts > 0);
  const mostPutts = holesWithPutts.length > 0
    ? holesWithPutts.reduce((most, h) => h.putts! > most.putts! ? h : most)
    : null;

  // --- Birdies & eagles per speler ---
  const matthiHoles = filteredHoles.filter((h) => h.player_name === "Matthi");
  const robHoles = filteredHoles.filter((h) => h.player_name === "Rob");
  const countBirdies = (holes: HoleRecord[]) => holes.filter((h) => h.gross_score - h.par === -1).length;
  const countEagles = (holes: HoleRecord[]) => holes.filter((h) => h.gross_score - h.par <= -2).length;
  const matthiBirdies = countBirdies(matthiHoles);
  const robBirdies = countBirdies(robHoles);
  const matthiEagles = countEagles(matthiHoles);
  const robEagles = countEagles(robHoles);
  const totalBirdies = matthiBirdies + robBirdies;
  const totalEagles = matthiEagles + robEagles;

  const countByPar = (holes: HoleRecord[], diff: number) => holes.filter((h) => h.gross_score - h.par === diff).length;
  const countByParPlus = (holes: HoleRecord[], minDiff: number) => holes.filter((h) => h.gross_score - h.par >= minDiff).length;
  const matthiPars = countByPar(matthiHoles, 0);
  const robPars = countByPar(robHoles, 0);
  const matthiBogeys = countByPar(matthiHoles, 1);
  const robBogeys = countByPar(robHoles, 1);
  const matthiDblBogeys = countByPar(matthiHoles, 2);
  const robDblBogeys = countByPar(robHoles, 2);
  const matthiTriplePlus = countByParPlus(matthiHoles, 3);
  const robTriplePlus = countByParPlus(robHoles, 3);

  // --- Minste slagen (beste ronde) met round_id ---
  const matthiRoundScores = rounds.filter((r) => r.matthi_score != null && r.holes_played === 9).map((r) => ({ score: r.matthi_score!, id: r.id, date: r.date }));
  const robRoundScores = rounds.filter((r) => r.rob_score != null && r.holes_played === 9).map((r) => ({ score: r.rob_score!, id: r.id, date: r.date }));
  const matthiLowest = matthiRoundScores.length > 0 ? matthiRoundScores.reduce((best, r) => r.score < best.score ? r : best) : null;
  const robLowest = robRoundScores.length > 0 ? robRoundScores.reduce((best, r) => r.score < best.score ? r : best) : null;
  const matthiHighest = matthiRoundScores.length > 0 ? matthiRoundScores.reduce((worst, r) => r.score > worst.score ? r : worst) : null;
  const robHighest = robRoundScores.length > 0 ? robRoundScores.reduce((worst, r) => r.score > worst.score ? r : worst) : null;

  function scoreToPar(score: number, par: number): string {
    const d = score - par;
    if (d === 0) return "par";
    if (d === -1) return "birdie";
    if (d === -2) return "eagle";
    if (d <= -3) return "albatros";
    if (d === 1) return "bogey";
    if (d === 2) return "dbl bogey";
    return `+${d}`;
  }

  // --- Weer invloed ---
  const warmRounds = rounds.filter((r) => r.temperature_c != null && r.temperature_c >= 18);
  const koudRounds = rounds.filter((r) => r.temperature_c != null && r.temperature_c < 12);
  function winCount(arr: RoundSummary[], player: string) {
    return arr.filter((r) => r.winner === player).length;
  }

  // --- Gem. score ---
  const matthiScores = rounds.filter((r) => r.matthi_score != null && r.holes_played === 9).map((r) => r.matthi_score!);
  const robScores = rounds.filter((r) => r.rob_score != null && r.holes_played === 9).map((r) => r.rob_score!);
  const matthiAvg = matthiScores.length > 0 ? (matthiScores.reduce((a, b) => a + b, 0) / matthiScores.length) : null;
  const robAvg = robScores.length > 0 ? (robScores.reduce((a, b) => a + b, 0) / robScores.length) : null;

  // --- Beste ronde ---
  const matthiBest = matthiScores.length > 0 ? Math.min(...matthiScores) : null;
  const robBest = robScores.length > 0 ? Math.min(...robScores) : null;

  function formatDateShort(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Head-to-Head">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white/80 font-medium"
        >
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
          <option disabled>───</option>
          <option value="alle-zomers">Alle zomers</option>
          <option value="alle-winters">Alle winters</option>
          <option value="alle">Alle seizoenen</option>
        </select>
      </PageHeader>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider -mt-1">{rounds.length} wedstrijden</p>

      {/* Scorevergelijking */}
      <div className="bg-white rounded-xl p-3 shadow-card">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Vergelijking</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] text-gray-400 uppercase tracking-wider">
              <th className="text-left pb-1"></th>
              <th className="text-center pb-1 text-matthi">Matthi</th>
              <th className="text-center pb-1 text-rob">Rob</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t border-sand">
              <td className="py-1.5 text-gray-500 font-body text-xs">Gem. score</td>
              <td className={`py-1.5 text-center font-bold ${matthiAvg != null && robAvg != null && matthiAvg < robAvg ? "text-matthi" : "text-navy"}`}>
                {matthiAvg?.toFixed(1) ?? "-"}
              </td>
              <td className={`py-1.5 text-center font-bold ${robAvg != null && matthiAvg != null && robAvg < matthiAvg ? "text-rob" : "text-navy"}`}>
                {robAvg?.toFixed(1) ?? "-"}
              </td>
            </tr>
            <tr className="border-t border-sand">
              <td className="py-1.5 text-gray-500 font-body text-xs">Beste ronde</td>
              <td className="py-1.5 text-center">
                {matthiLowest ? (
                  <Link href={`/speler/rondes/${matthiLowest.id}`} className={`font-bold font-mono ${matthiBest != null && robBest != null && matthiBest < robBest ? "text-matthi" : "text-navy"}`}>
                    {matthiLowest.score} <span className="text-accent text-[10px]">›</span>
                  </Link>
                ) : "-"}
              </td>
              <td className="py-1.5 text-center">
                {robLowest ? (
                  <Link href={`/speler/rondes/${robLowest.id}`} className={`font-bold font-mono ${robBest != null && matthiBest != null && robBest < matthiBest ? "text-rob" : "text-navy"}`}>
                    {robLowest.score} <span className="text-accent text-[10px]">›</span>
                  </Link>
                ) : "-"}
              </td>
            </tr>
            <tr className="border-t border-sand">
              <td className="py-1.5 text-gray-500 font-body text-xs">Langste streak</td>
              <td className={`py-1.5 text-center font-bold ${matthiStreak && robStreak && matthiStreak.count > robStreak.count ? "text-matthi" : "text-navy"}`}>
                {matthiStreak?.count ?? 0}x
              </td>
              <td className={`py-1.5 text-center font-bold ${robStreak && matthiStreak && robStreak.count > matthiStreak.count ? "text-rob" : "text-navy"}`}>
                {robStreak?.count ?? 0}x
              </td>
            </tr>
            {totalBirdies > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Birdies</td>
                <td className={`py-1.5 text-center font-bold ${matthiBirdies > robBirdies ? "text-matthi" : "text-navy"}`}>
                  {matthiBirdies}
                </td>
                <td className={`py-1.5 text-center font-bold ${robBirdies > matthiBirdies ? "text-rob" : "text-navy"}`}>
                  {robBirdies}
                </td>
              </tr>
            )}
            {totalEagles > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Eagles</td>
                <td className={`py-1.5 text-center font-bold ${matthiEagles > robEagles ? "text-matthi" : "text-navy"}`}>
                  {matthiEagles}
                </td>
                <td className={`py-1.5 text-center font-bold ${robEagles > matthiEagles ? "text-rob" : "text-navy"}`}>
                  {robEagles}
                </td>
              </tr>
            )}
            {(matthiPars + robPars) > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Pars</td>
                <td className={`py-1.5 text-center font-bold ${matthiPars > robPars ? "text-matthi" : "text-navy"}`}>
                  {matthiPars}
                </td>
                <td className={`py-1.5 text-center font-bold ${robPars > matthiPars ? "text-rob" : "text-navy"}`}>
                  {robPars}
                </td>
              </tr>
            )}
            {(matthiBogeys + robBogeys) > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Bogeys</td>
                <td className={`py-1.5 text-center font-bold ${matthiBogeys < robBogeys ? "text-matthi" : "text-navy"}`}>
                  {matthiBogeys}
                </td>
                <td className={`py-1.5 text-center font-bold ${robBogeys < matthiBogeys ? "text-rob" : "text-navy"}`}>
                  {robBogeys}
                </td>
              </tr>
            )}
            {(matthiDblBogeys + robDblBogeys) > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Dbl bogey</td>
                <td className={`py-1.5 text-center font-bold ${matthiDblBogeys < robDblBogeys ? "text-matthi" : "text-navy"}`}>
                  {matthiDblBogeys}
                </td>
                <td className={`py-1.5 text-center font-bold ${robDblBogeys < matthiDblBogeys ? "text-rob" : "text-navy"}`}>
                  {robDblBogeys}
                </td>
              </tr>
            )}
            {(matthiTriplePlus + robTriplePlus) > 0 && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Triple+</td>
                <td className={`py-1.5 text-center font-bold ${matthiTriplePlus < robTriplePlus ? "text-matthi" : "text-navy"}`}>
                  {matthiTriplePlus}
                </td>
                <td className={`py-1.5 text-center font-bold ${robTriplePlus < matthiTriplePlus ? "text-rob" : "text-navy"}`}>
                  {robTriplePlus}
                </td>
              </tr>
            )}
            {(matthiHighest || robHighest) && (
              <tr className="border-t border-sand">
                <td className="py-1.5 text-gray-500 font-body text-xs">Slechtste ronde</td>
                <td className="py-1.5 text-center">
                  {matthiHighest ? (
                    <Link href={`/speler/rondes/${matthiHighest.id}`} className={`font-bold font-mono ${matthiHighest && robHighest && matthiHighest.score > robHighest.score ? "text-rob" : "text-navy"}`}>
                      {matthiHighest.score} <span className="text-accent text-[10px]">›</span>
                    </Link>
                  ) : "-"}
                </td>
                <td className="py-1.5 text-center">
                  {robHighest ? (
                    <Link href={`/speler/rondes/${robHighest.id}`} className={`font-bold font-mono ${robHighest && matthiHighest && robHighest.score > matthiHighest.score ? "text-rob" : "text-navy"}`}>
                      {robHighest.score} <span className="text-accent text-[10px]">›</span>
                    </Link>
                  ) : "-"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Win per lus */}
      {loopStats.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-card">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Win per lus</p>
          <div className={`grid gap-3 ${loopStats.length >= 3 ? "grid-cols-3" : loopStats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {loopStats.map((ls) => {
              const total = ls.matthi + ls.rob + ls.gelijk;
              const leader = ls.matthi > ls.rob ? "matthi" : ls.rob > ls.matthi ? "rob" : "gelijk";
              return (
                <div key={ls.loop} className="text-center">
                  <p className="font-mono text-[10px] text-gray-400 mb-1">{ls.loop}</p>
                  <div className="flex items-center justify-center gap-1 font-mono text-sm font-bold">
                    <span className={leader === "matthi" ? "text-matthi" : "text-gray-500"}>{ls.matthi}</span>
                    <span className="text-gray-200 text-xs">-</span>
                    <span className={leader === "rob" ? "text-rob" : "text-gray-500"}>{ls.rob}</span>
                  </div>
                  {ls.gelijk > 0 && <p className="text-[9px] text-gray-300 font-mono">{ls.gelijk}x gelijk</p>}
                  <div className="flex h-2 rounded-full overflow-hidden mt-1">
                    {ls.matthi > 0 && (
                      <div className="bg-matthi" style={{ width: `${(ls.matthi / total) * 100}%` }} />
                    )}
                    {ls.gelijk > 0 && (
                      <div className="bg-gray-200" style={{ width: `${(ls.gelijk / total) * 100}%` }} />
                    )}
                    {ls.rob > 0 && (
                      <div className="bg-rob" style={{ width: `${(ls.rob / total) * 100}%` }} />
                    )}
                  </div>
                  <p className="text-[9px] text-gray-300 font-mono mt-0.5">{total}x</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Records */}
      <div className="bg-white rounded-xl p-3 shadow-card">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Records</p>
        <div className="space-y-2 text-sm">
          {topStreak && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Langste streak</span>
              <span>
                <span className={`font-bold font-mono ${topStreak.player === "matthi" ? "text-matthi" : "text-rob"}`}>
                  {topStreak.count}x {topStreak.player === "matthi" ? "Matthi" : "Rob"}
                </span>
                <span className="text-gray-300 text-[10px] ml-1">
                  {formatDateShort(topStreak.from)}–{formatDateShort(topStreak.to)}
                </span>
              </span>
            </div>
          )}
          {biggestDiff && (
            <Link href={`/speler/rondes/${biggestDiff.round.id}`} className="flex justify-between items-center border-t border-sand pt-2">
              <span className="text-gray-500 text-xs">Grootste verschil</span>
              <span className="flex items-center gap-1">
                <span className="font-bold font-mono text-navy">{biggestDiff.diff} slagen</span>
                <span className="text-gray-300 text-[10px]">{formatDateShort(biggestDiff.round.date)}</span>
                <span className="text-accent text-sm font-bold">›</span>
              </span>
            </Link>
          )}
          {closestMatch && closestMatch.diff <= 2 && (
            <Link href={`/speler/rondes/${closestMatch.round.id}`} className="flex justify-between items-center border-t border-sand pt-2">
              <span className="text-gray-500 text-xs">Spannendste</span>
              <span className="flex items-center gap-1">
                <span className="font-bold font-mono text-navy">
                  {closestMatch.diff === 0 ? "Gelijk!" : `${closestMatch.diff} slag`}
                </span>
                <span className="text-gray-300 text-[10px]">{formatDateShort(closestMatch.round.date)}</span>
                <span className="text-accent text-sm font-bold">›</span>
              </span>
            </Link>
          )}
          {bestHole && (bestHole.gross_score - bestHole.par) < 0 && (
            <Link href={`/speler/rondes/${bestHole.round_id}`} className="flex justify-between items-center border-t border-sand pt-2">
              <span className="text-gray-500 text-xs">Beste hole</span>
              <span className="flex items-center gap-1">
                <span className={`font-bold font-mono ${bestHole.player_name === "Matthi" ? "text-matthi" : "text-rob"}`}>
                  {scoreToPar(bestHole.gross_score, bestHole.par)}
                </span>
                <span className="text-gray-400 text-[10px]">
                  {bestHole.player_name} · h{bestHole.hole_number}
                </span>
                <span className="text-accent text-sm font-bold">›</span>
              </span>
            </Link>
          )}
          {worstHole && (worstHole.gross_score - worstHole.par) > 1 && (
            <Link href={`/speler/rondes/${worstHole.round_id}`} className="flex justify-between items-center border-t border-sand pt-2">
              <span className="text-gray-500 text-xs">Slechtste hole</span>
              <span className="flex items-center gap-1">
                <span className="font-bold font-mono text-rob">
                  {scoreToPar(worstHole.gross_score, worstHole.par)}
                </span>
                <span className="text-gray-400 text-[10px]">
                  {worstHole.player_name} · h{worstHole.hole_number}
                </span>
                <span className="text-accent text-sm font-bold">›</span>
              </span>
            </Link>
          )}
          {mostPutts && mostPutts.putts! >= 3 && (
            <Link href={`/speler/rondes/${mostPutts.round_id}`} className="flex justify-between items-center border-t border-sand pt-2">
              <span className="text-gray-500 text-xs">Meeste putts</span>
              <span className="flex items-center gap-1">
                <span className="font-bold font-mono text-navy">
                  {mostPutts.putts} putts
                </span>
                <span className="text-gray-400 text-[10px]">
                  {mostPutts.player_name} · h{mostPutts.hole_number}
                </span>
                <span className="text-accent text-sm font-bold">›</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Weer invloed */}
      {(warmRounds.length >= 2 || koudRounds.length >= 2) && (
        <div className="bg-white rounded-xl p-3 shadow-card">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Weer-effect</p>
          <div className="space-y-2 text-sm">
            {warmRounds.length >= 2 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Warm (18°+)</span>
                <span className="font-mono text-xs">
                  <span className={`font-bold ${winCount(warmRounds, "matthi") > winCount(warmRounds, "rob") ? "text-matthi" : "text-navy"}`}>
                    Matthi {winCount(warmRounds, "matthi")}
                  </span>
                  <span className="text-gray-300 mx-1">–</span>
                  <span className={`font-bold ${winCount(warmRounds, "rob") > winCount(warmRounds, "matthi") ? "text-rob" : "text-navy"}`}>
                    {winCount(warmRounds, "rob")} Rob
                  </span>
                </span>
              </div>
            )}
            {koudRounds.length >= 2 && (
              <div className="flex justify-between items-center border-t border-sand pt-2">
                <span className="text-gray-500 text-xs">Koud (&lt;12°)</span>
                <span className="font-mono text-xs">
                  <span className={`font-bold ${winCount(koudRounds, "matthi") > winCount(koudRounds, "rob") ? "text-matthi" : "text-navy"}`}>
                    Matthi {winCount(koudRounds, "matthi")}
                  </span>
                  <span className="text-gray-300 mx-1">–</span>
                  <span className={`font-bold ${winCount(koudRounds, "rob") > winCount(koudRounds, "matthi") ? "text-rob" : "text-navy"}`}>
                    {winCount(koudRounds, "rob")} Rob
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spelersprofiel — Sterke & Zwakke punten */}
      {filteredHoles.length >= 9 && (() => {
        function analyzePlayer(name: string) {
          const ph = filteredHoles.filter((h) => h.player_name === name);
          if (ph.length < 9) return null;

          const byPar: Record<number, { scores: number[]; putts: number[] }> = { 3: { scores: [], putts: [] }, 4: { scores: [], putts: [] }, 5: { scores: [], putts: [] } };
          ph.forEach((h) => {
            if (byPar[h.par]) {
              byPar[h.par].scores.push(h.gross_score);
              if (h.putts != null) byPar[h.par].putts.push(h.putts);
            }
          });

          const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
          const parStats = [3, 4, 5].map((par) => ({
            par,
            avgScore: avg(byPar[par].scores),
            avgPutts: avg(byPar[par].putts),
            overPar: avg(byPar[par].scores) != null ? avg(byPar[par].scores)! - par : null,
            count: byPar[par].scores.length,
          }));

          const totalAvgPutts = avg(ph.filter((h) => h.putts != null).map((h) => h.putts!));

          // Bepaal sterke en zwakke punten
          const insights: { text: string; type: "strong" | "weak" }[] = [];

          // Sorteer par-types op over-par (laagst = sterkst)
          const sorted = parStats.filter((p) => p.overPar != null && p.count >= 2).sort((a, b) => a.overPar! - b.overPar!);
          if (sorted.length >= 2) {
            const best = sorted[0];
            const worst = sorted[sorted.length - 1];

            const parLabel = (p: number) => p === 3 ? "korte holes (par 3)" : p === 4 ? "middelange holes (par 4)" : "lange holes (par 5)";
            const gameLabel = (p: number) => p === 3 ? "kort spel" : p === 4 ? "allround spel" : "lang spel";

            if (best.overPar! < worst.overPar! - 0.3) {
              insights.push({ text: `Sterk op ${parLabel(best.par)} (+${best.overPar!.toFixed(1)}) — goed ${gameLabel(best.par)}`, type: "strong" });
              insights.push({ text: `Verbeterpunt: ${parLabel(worst.par)} (+${worst.overPar!.toFixed(1)})`, type: "weak" });
            }
          }

          // Putting analyse
          if (totalAvgPutts != null) {
            if (totalAvgPutts <= 1.8) {
              insights.push({ text: `Sterke putter (gem. ${totalAvgPutts.toFixed(1)} putts/hole)`, type: "strong" });
            } else if (totalAvgPutts >= 2.3) {
              insights.push({ text: `Putting is verbeterpunt (gem. ${totalAvgPutts.toFixed(1)} putts/hole)`, type: "weak" });
            }
          }

          // Par5 met weinig putts maar hoge score = approach probleem
          const par5 = parStats.find((p) => p.par === 5);
          if (par5 && par5.avgPutts != null && par5.overPar != null && par5.avgPutts <= 2.0 && par5.overPar >= 2.0) {
            insights.push({ text: `Lang spel kost slagen — putting is niet het probleem op par 5`, type: "weak" });
          }

          // Par3 met veel putts = green reading / approach
          const par3 = parStats.find((p) => p.par === 3);
          if (par3 && par3.avgPutts != null && par3.avgPutts >= 2.3) {
            insights.push({ text: `Veel putts op par 3 (${par3.avgPutts.toFixed(1)}/hole) — green niet goed bereikt?`, type: "weak" });
          }

          return { parStats, insights, totalAvgPutts };
        }

        const matthiProfile = analyzePlayer("Matthi");
        const robProfile = analyzePlayer("Rob");

        if (!matthiProfile && !robProfile) return null;

        return (
          <div className="bg-white rounded-xl p-3 shadow-card">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Spelersprofiel</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Matthi", profile: matthiProfile, color: "text-matthi" },
                { name: "Rob", profile: robProfile, color: "text-rob" },
              ].map(({ name, profile, color }) => profile && (
                <div key={name}>
                  <p className={`text-xs font-semibold ${color} mb-1.5`}>{name}</p>
                  <div className="space-y-1">
                    {profile.insights.length > 0 ? profile.insights.map((ins, i) => (
                      <p key={i} className="text-[10px] text-gray-600 leading-tight">
                        <span className={ins.type === "strong" ? "text-green-600" : "text-amber-600"}>
                          {ins.type === "strong" ? "+" : "−"}
                        </span>{" "}
                        {ins.text}
                      </p>
                    )) : (
                      <p className="text-[10px] text-gray-400">Meer rondes nodig voor analyse</p>
                    )}
                  </div>
                  {/* Compact par stats */}
                  <div className="mt-2 space-y-0.5">
                    {profile.parStats.filter((p) => p.count >= 1).map((p) => (
                      <div key={p.par} className="flex items-center gap-1 text-[9px] font-mono text-gray-400">
                        <span className="w-7">Par{p.par}</span>
                        <span className="w-8 text-right text-gray-600 font-medium">+{p.overPar?.toFixed(1) ?? "-"}</span>
                        <span className="w-10 text-right">{p.avgPutts?.toFixed(1) ?? "-"}p</span>
                        <span className="text-gray-300">({p.count}x)</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Advies */}
                  {aiAdvice[name] ? (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={async () => {
                            setAiLoading((prev) => ({ ...prev, [name]: true }));
                            try {
                              const res = await fetch("/api/ai-advice", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ playerName: name, parStats: profile.parStats, totalAvgPutts: profile.totalAvgPutts, insights: profile.insights }),
                              });
                              const data = await res.json();
                              if (data.advice) {
                                const oldAdvice = aiAdvice[name];
                                const newHistory = { ...aiHistory, [name]: [...(aiHistory[name] || []), oldAdvice] };
                                const newCurrent = { ...aiAdvice, [name]: data.advice };
                                setAiAdvice(newCurrent);
                                setAiHistory(newHistory);
                                try { localStorage.setItem("ai-coach-advice", JSON.stringify({ current: newCurrent, history: newHistory })); } catch {}
                              }
                            } catch { /* ignore */ }
                            setAiLoading((prev) => ({ ...prev, [name]: false }));
                          }}
                          disabled={aiLoading[name]}
                          className="text-[9px] text-amber-500 font-medium"
                        >
                          {aiLoading[name] ? "..." : "Ververs"}
                        </button>
                      </div>
                      <button
                        onClick={() => setAiExpanded(aiExpanded === name ? null : name)}
                        className="w-full bg-amber-50 rounded-lg p-2 text-left active:scale-[0.99] transition-transform"
                      >
                        <p className="text-[10px] text-gray-600 leading-relaxed italic line-clamp-2">{aiAdvice[name]}</p>
                        <p className="text-[9px] text-amber-500 mt-0.5">Tik voor groter</p>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        setAiLoading((prev) => ({ ...prev, [name]: true }));
                        try {
                          const res = await fetch("/api/ai-advice", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ playerName: name, parStats: profile.parStats, totalAvgPutts: profile.totalAvgPutts, insights: profile.insights }),
                          });
                          const data = await res.json();
                          if (data.advice) {
                            const newCurrent = { ...aiAdvice, [name]: data.advice };
                            setAiAdvice(newCurrent);
                            try { localStorage.setItem("ai-coach-advice", JSON.stringify({ current: newCurrent, history: aiHistory })); } catch {}
                          }
                        } catch { /* ignore */ }
                        setAiLoading((prev) => ({ ...prev, [name]: false }));
                      }}
                      disabled={aiLoading[name]}
                      className="mt-2 w-full py-1.5 rounded-lg bg-amber-50 text-[10px] font-medium text-amber-700 active:scale-[0.98] transition-transform"
                    >
                      {aiLoading[name] ? "Coach denkt na..." : "AI Coach advies"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-300 mt-2 text-center">Gebaseerd op {filteredHoles.length / 2} holes per speler</p>

            {/* Expanded AI advies overlay */}
            {aiExpanded && aiAdvice[aiExpanded] && (
              <div
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
                onClick={() => setAiExpanded(null)}
              >
                <div
                  className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-3 max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏌️</span>
                    <div>
                      <p className="font-display text-lg font-bold text-navy">AI Coach</p>
                      <p className={`text-xs font-semibold ${aiExpanded === "Matthi" ? "text-matthi" : "text-rob"}`}>{aiExpanded}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">{aiAdvice[aiExpanded]}</p>
                  {/* Eerdere adviezen */}
                  {aiHistory[aiExpanded] && aiHistory[aiExpanded].length > 0 && (
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Eerdere adviezen</p>
                      {[...aiHistory[aiExpanded]].reverse().map((prev, i) => (
                        <p key={i} className="text-xs text-gray-400 leading-relaxed italic">{prev}</p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setAiExpanded(null)}
                    className="w-full py-2.5 rounded-xl bg-sand text-sm font-medium text-gray-600"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Foto */}
      <div
        className="w-full aspect-[16/7] rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${PHOTOS[photoIdx]})` }}
      />
    </div>
  );
}
