"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RoundSummary } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area,
} from "recharts";

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

export default function TrendsPage() {
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [photoIdx] = useState(() => Math.floor(Math.random() * PHOTOS.length));
  const [photo2Idx] = useState(() => Math.floor(Math.random() * PHOTOS.length));
  const [showMatthi, setShowMatthi] = useState(true);
  const [showRob, setShowRob] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showAvg, setShowAvg] = useState(true);
  const [pShowMatthi, setPShowMatthi] = useState(true);
  const [pShowRob, setPShowRob] = useState(true);
  const [pShowScore, setPShowScore] = useState(true);
  const [pShowAvg, setPShowAvg] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .eq("is_competition", true)
        .order("date", { ascending: true });
      if (data && data.length > 0) {
        setAllRounds(data);
        const uniqueSeasons = Array.from(new Set(data.map((r) => r.season))).reverse();
        setSeasons(uniqueSeasons);
        const current = uniqueSeasons.find((s) => s === "Zomer 2026") || uniqueSeasons[0];
        setSelectedSeason(current);
      }
      setLoading(false);
    }
    load();
  }, []);

  const rounds = allRounds.filter((r) => {
    if (selectedSeason === "alle") return true;
    if (selectedSeason === "alle-zomers") return r.season_type === "zomer";
    if (selectedSeason === "alle-winters") return r.season_type === "winter";
    return r.season === selectedSeason;
  });

  const isMultiSeason = selectedSeason === "alle" || selectedSeason === "alle-zomers" || selectedSeason === "alle-winters";
  const lineWidth = isMultiSeason ? 1.5 : 2.5;
  const dotSize = isMultiSeason ? 1.5 : 3;
  const strokeDash = isMultiSeason ? "4 2" : undefined;

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-28 bg-white rounded-xl" /><div className="h-48 bg-white rounded-xl" /></div>;
  }

  // --- Score verloop met voortschrijdend gemiddelde ---
  const scoreRounds = rounds.filter((r) => r.matthi_score != null || r.rob_score != null);

  function movingAvg(values: (number | null)[], window: number): (number | null)[] {
    return values.map((_, i) => {
      const slice = values.slice(Math.max(0, i - window + 1), i + 1).filter((v): v is number => v != null);
      return slice.length > 0 ? Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 10) / 10 : null;
    });
  }

  const matthiAvgs = movingAvg(scoreRounds.map((r) => r.matthi_score), 3);
  const robAvgs = movingAvg(scoreRounds.map((r) => r.rob_score), 3);

  const scoreData = scoreRounds.map((r, i) => ({
    date: new Date(r.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
    Matthi: r.matthi_score,
    Rob: r.rob_score,
    "Matthi gem": matthiAvgs[i],
    "Rob gem": robAvgs[i],
    winner: r.winner,
  }));

  // --- Putts per hole verloop ---
  const puttsRounds = rounds.filter((r) => r.matthi_putts_per_hole != null || r.rob_putts_per_hole != null);
  const matthiPuttsAvgs = movingAvg(puttsRounds.map((r) => r.matthi_putts_per_hole), 3);
  const robPuttsAvgs = movingAvg(puttsRounds.map((r) => r.rob_putts_per_hole), 3);
  const puttsData = puttsRounds.map((r, i) => ({
    date: new Date(r.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
    Matthi: r.matthi_putts_per_hole,
    Rob: r.rob_putts_per_hole,
    "Matthi gem": matthiPuttsAvgs[i],
    "Rob gem": robPuttsAvgs[i],
  }));

  // --- HCP verloop ---
  const hcpData = rounds
    .filter((r) => r.matthi_hcp != null || r.rob_hcp != null)
    .map((r) => ({
      date: new Date(r.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      Matthi: r.matthi_hcp,
      Rob: r.rob_hcp,
    }));

  // --- Dag/tijd analyse ---
  const buckets = new Map<string, { matthiScores: number[]; robScores: number[] }>();

  rounds.forEach((r) => {
    if (!r.start_time) return;
    const hour = parseInt(String(r.start_time).substring(0, 2), 10);
    const dayOfWeek = new Date(r.date + "T00:00:00").getDay();
    const isSunday = dayOfWeek === 0;
    let bucket: string;

    if (isSunday) {
      bucket = "Zo ochtend";
    } else if (hour < 12) {
      bucket = "Ochtend";
    } else if (hour < 17) {
      bucket = "Middag";
    } else {
      bucket = "Avond";
    }

    if (!buckets.has(bucket)) buckets.set(bucket, { matthiScores: [], robScores: [] });
    const b = buckets.get(bucket)!;
    if (r.matthi_score != null) b.matthiScores.push(r.matthi_score);
    if (r.rob_score != null) b.robScores.push(r.rob_score);
  });

  const dayTimeData: { label: string; matthi: number; rob: number; count: number }[] = [];
  const bucketOrder = ["Zo ochtend", "Ochtend", "Middag", "Avond"];
  bucketOrder.forEach((label) => {
    const b = buckets.get(label);
    if (b && (b.matthiScores.length > 0 || b.robScores.length > 0)) {
      const avg = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((a, c) => a + c, 0) / arr.length) * 10) / 10 : 0;
      dayTimeData.push({
        label,
        matthi: avg(b.matthiScores),
        rob: avg(b.robScores),
        count: Math.max(b.matthiScores.length, b.robScores.length),
      });
    }
  });

  // --- Win trend (cumulatief) ---
  let matthiCum = 0;
  let robCum = 0;
  const winTrend = rounds.map((r) => {
    if (r.winner === "matthi") matthiCum++;
    if (r.winner === "rob") robCum++;
    return {
      date: new Date(r.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      Matthi: matthiCum,
      Rob: robCum,
    };
  });


  return (
    <div className="space-y-4">
      <PageHeader title="Trends">
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
      <p className="text-[10px] text-gray-400 uppercase tracking-wider -mt-2">{rounds.length} wedstrijden</p>

      {rounds.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-card">
          <p className="text-gray-400 text-sm">Nog geen data voor deze periode</p>
        </div>
      ) : (
        <>
          {/* Score verloop */}
          {scoreData.length >= 2 && (
            <div className="bg-white rounded-xl p-3 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score verloop</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowMatthi(!showMatthi)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      showMatthi ? "bg-matthi text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Matthi
                  </button>
                  <button
                    onClick={() => setShowRob(!showRob)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      showRob ? "bg-rob text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Rob
                  </button>
                  <span className="w-px h-4 bg-gray-200 mx-0.5" />
                  <button
                    onClick={() => setShowScore(!showScore)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      showScore ? "bg-navy text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Score
                  </button>
                  <button
                    onClick={() => setShowAvg(!showAvg)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      showAvg ? "bg-accent text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Gem
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
                    domain={["dataMin - 3", "dataMax + 3"]}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ece8df", padding: "8px 12px" }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  {showMatthi && showScore && (
                    <Line type="monotone" dataKey="Matthi" stroke="#1a6b3c" strokeWidth={lineWidth} strokeDasharray={strokeDash} dot={{ r: dotSize, fill: "#1a6b3c", strokeWidth: 1, stroke: "#fff" }} />
                  )}
                  {showMatthi && showAvg && (
                    <Line type="monotone" dataKey="Matthi gem" stroke="#1a6b3c" strokeWidth={1} strokeDasharray="6 3" dot={false} strokeOpacity={0.4} />
                  )}
                  {showRob && showScore && (
                    <Line type="monotone" dataKey="Rob" stroke="#c0392b" strokeWidth={lineWidth} strokeDasharray={strokeDash} dot={{ r: dotSize, fill: "#c0392b", strokeWidth: 1, stroke: "#fff" }} />
                  )}
                  {showRob && showAvg && (
                    <Line type="monotone" dataKey="Rob gem" stroke="#c0392b" strokeWidth={1} strokeDasharray="6 3" dot={false} strokeOpacity={0.4} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="w-5 h-0.5 bg-gray-400 rounded" /> score
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="w-5 h-0.5 bg-gray-300 rounded border-dashed" style={{ borderTop: "1px dashed #9ca3af" }} /> gem (3)
                </span>
              </div>
            </div>
          )}

          {/* Cumulatieve winst */}
          {winTrend.length >= 2 && (
            <div className="bg-white rounded-xl p-3 shadow-card">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Cumulatieve winst</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={winTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }} width={30} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ece8df" }} />
                  <Area type="monotone" dataKey="Matthi" stroke="#1a6b3c" fill="#1a6b3c" fillOpacity={isMultiSeason ? 0.08 : 0.15} strokeWidth={isMultiSeason ? 1 : 2} />
                  <Area type="monotone" dataKey="Rob" stroke="#c0392b" fill="#c0392b" fillOpacity={isMultiSeason ? 0.08 : 0.15} strokeWidth={isMultiSeason ? 1 : 2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-3 h-3 bg-matthi/20 border border-matthi rounded" />Matthi</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-3 h-3 bg-rob/20 border border-rob rounded" />Rob</span>
              </div>
            </div>
          )}

          {/* HCP verloop */}
          {hcpData.length >= 2 && (() => {
            const visibleHcp: number[] = [];
            hcpData.forEach((d) => {
              if (showMatthi && d.Matthi != null) visibleHcp.push(d.Matthi);
              if (showRob && d.Rob != null) visibleHcp.push(d.Rob);
            });
            const hcpMin = visibleHcp.length > 0 ? Math.floor(Math.min(...visibleHcp) - 1) : 0;
            const hcpMax = visibleHcp.length > 0 ? Math.ceil(Math.max(...visibleHcp) + 1) : 40;

            return (
              <div className="bg-white rounded-xl p-3 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">HCP verloop</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowMatthi(!showMatthi)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                        showMatthi ? "bg-matthi text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      Matthi
                    </button>
                    <button
                      onClick={() => setShowRob(!showRob)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                        showRob ? "bg-rob text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      Rob
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={hcpData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }} domain={[hcpMin, hcpMax]} width={40} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ece8df" }} />
                    {showMatthi && (
                      <Line type="monotone" dataKey="Matthi" stroke="#1a6b3c" strokeWidth={1} dot={{ r: 2, fill: "#1a6b3c", strokeWidth: 1, stroke: "#fff" }} />
                    )}
                    {showRob && (
                      <Line type="monotone" dataKey="Rob" stroke="#c0392b" strokeWidth={1} dot={{ r: 2, fill: "#c0392b", strokeWidth: 1, stroke: "#fff" }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-[9px] text-gray-300 mt-1">Lager = beter</p>
              </div>
            );
          })()}

          {/* Putts per hole */}
          {puttsData.length >= 2 && (
            <div className="bg-white rounded-xl p-3 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Putts per hole</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPShowMatthi(!pShowMatthi)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      pShowMatthi ? "bg-matthi text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Matthi
                  </button>
                  <button
                    onClick={() => setPShowRob(!pShowRob)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      pShowRob ? "bg-rob text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Rob
                  </button>
                  <span className="w-px h-4 bg-gray-200 mx-0.5" />
                  <button
                    onClick={() => setPShowScore(!pShowScore)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      pShowScore ? "bg-navy text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Score
                  </button>
                  <button
                    onClick={() => setPShowAvg(!pShowAvg)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      pShowAvg ? "bg-accent text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Gem
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={puttsData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }} domain={[1, 3]} width={35} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ece8df" }} />
                  {pShowMatthi && pShowScore && (
                    <Line type="monotone" dataKey="Matthi" stroke="#1a6b3c" strokeWidth={lineWidth} strokeDasharray={strokeDash} dot={{ r: dotSize, fill: "#1a6b3c", strokeWidth: 1, stroke: "#fff" }} />
                  )}
                  {pShowMatthi && pShowAvg && (
                    <Line type="monotone" dataKey="Matthi gem" stroke="#1a6b3c" strokeWidth={1} strokeDasharray="6 3" dot={false} strokeOpacity={0.4} />
                  )}
                  {pShowRob && pShowScore && (
                    <Line type="monotone" dataKey="Rob" stroke="#c0392b" strokeWidth={lineWidth} strokeDasharray={strokeDash} dot={{ r: dotSize, fill: "#c0392b", strokeWidth: 1, stroke: "#fff" }} />
                  )}
                  {pShowRob && pShowAvg && (
                    <Line type="monotone" dataKey="Rob gem" stroke="#c0392b" strokeWidth={1} strokeDasharray="6 3" dot={false} strokeOpacity={0.4} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                <span className="text-[9px] text-gray-300">Lager = beter</span>
                <span className="text-[9px] text-gray-300">Gem = voortschrijdend gem. (3 rondes)</span>
              </div>
            </div>
          )}

          {/* Dag/tijd analyse */}
          {dayTimeData.length >= 2 && (
            <div className="bg-white rounded-xl p-3 shadow-card">
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Wanneer spelen jullie het best?</p>
                <p className="text-[9px] text-gray-300 mt-0.5">Gem. score per dagdeel · lager = beter</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dayTimeData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }} domain={["dataMin - 2", "dataMax + 2"]} width={35} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #ece8df" }}
                    formatter={(value) => [Number(value).toFixed(1), ""]}
                  />
                  <Bar dataKey="matthi" name="Matthi" fill="#1a6b3c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rob" name="Rob" fill="#c0392b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-1">
                {dayTimeData.map((d) => (
                  <span key={d.label} className="text-[9px] text-gray-300 font-mono">{d.label}: {d.count}x</span>
                ))}
              </div>
            </div>
          )}

          {/* Foto footer */}
          <div
            className="w-full aspect-[16/7] rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${PHOTOS[photo2Idx]})` }}
          />
        </>
      )}
    </div>
  );
}
