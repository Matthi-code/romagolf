"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { usePlayer } from "@/hooks/usePlayer";
import { formatDateShort } from "@/lib/utils/format";
import type { RoundSummary } from "@/types";

export default function RondesPage() {
  const { session } = usePlayer();
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("alle");
  const [loading, setLoading] = useState(true);

  const name = "matthi" as "matthi" | "rob";

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .order("date", { ascending: false });

      if (data) {
        setRounds(data);
        const uniqueSeasons = Array.from(new Set(data.map((r) => r.season)));
        setSeasons(uniqueSeasons);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    selectedSeason === "alle"
      ? rounds
      : rounds.filter((r) => r.season === selectedSeason);

  const scoreKey = name === "matthi" ? "matthi_score" : "rob_score";
  const oppScoreKey = name === "matthi" ? "rob_score" : "matthi_score";
  const puttsKey = name === "matthi" ? "matthi_putts_per_hole" : "rob_putts_per_hole";
  const hcpKey = name === "matthi" ? "matthi_hcp" : "rob_hcp";

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-8 w-32 bg-sand-dark rounded" />
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-18 bg-white rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Rondes</h2>
          <p className="text-gray-400 text-xs"><span className="font-mono">{filtered.length}</span> rondes</p>
        </div>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white font-medium"
        >
          <option value="alle">Alle seizoenen</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        {filtered.map((r) => {
          const myScore = r[scoreKey] as number | null;
          const oppScore = r[oppScoreKey] as number | null;
          const putts = r[puttsKey] as number | null;
          const hcp = r[hcpKey] as number | null;
          const won = r.winner === name;
          const draw = r.winner === "gelijk";

          return (
            <Link
              href={`/speler/rondes/${r.id}`}
              key={r.id}
              className={`block bg-white rounded-xl p-3 shadow-card border-l-[3px] card-interactive ${
                won ? "border-matthi" : draw ? "border-gray-200" : "border-rob"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-700">
                      {formatDateShort(r.date)}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sand text-gray-500 font-medium uppercase tracking-wide">
                      {r.play_style === "strokeplay" ? "str" : "mp"}
                    </span>
                    {r.weather_icon && <span className="text-sm">{r.weather_icon}</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Lus <span className="font-mono">{r.loop}</span> · <span className="font-mono">{r.holes_played}</span>h
                    {hcp != null && <> · HCP <span className="font-mono">{hcp}</span></>}
                    {putts != null && <> · <span className="font-mono">{putts.toFixed(1)}</span> p/h</>}
                  </p>
                  {r.notes && (
                    <p className="text-[11px] text-gray-400 mt-1 italic line-clamp-1">{r.notes}</p>
                  )}
                </div>
                <div className="text-right pl-3 shrink-0">
                  <p className="font-mono font-bold text-lg text-gray-800">
                    {myScore ?? "—"}
                    <span className="text-gray-200 text-sm mx-1.5">–</span>
                    <span className="text-gray-400 text-base">{oppScore ?? "—"}</span>
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-card">
          <p className="text-2xl mb-2">🏌️</p>
          <p className="text-gray-500 font-medium">Geen rondes gevonden</p>
          <p className="text-xs text-gray-400 mt-1">Tijd om de baan op te gaan!</p>
        </div>
      )}
    </div>
  );
}
