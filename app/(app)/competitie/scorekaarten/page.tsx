"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils/format";
import type { RoundSummary } from "@/types";

export default function ScorекaartenPage() {
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("alle");
  const [loading, setLoading] = useState(true);

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
      {/* Header + Upload knop */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Scorekaarten</h2>
          <p className="text-gray-400 text-xs"><span className="font-mono">{filtered.length}</span> rondes</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Upload knop */}
      <Link
        href="/speler/upload"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white font-medium text-sm active:scale-[0.98] transition-transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nieuwe scorekaart
      </Link>

      {/* Rondes lijst */}
      <div className="space-y-1.5">
        {filtered.map((r) => {
          const won = r.winner === "matthi";
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
                    {r.rob_hcp != null && <> · HCP <span className="font-mono">{r.rob_hcp}</span>/<span className="font-mono">{r.matthi_hcp}</span></>}
                    {r.rob_stb != null && <> · Stb <span className="font-mono">{r.rob_stb}</span>/<span className="font-mono">{r.matthi_stb}</span></>}
                  </p>
                  {r.notes && (
                    <p className="text-[11px] text-gray-400 mt-1 italic line-clamp-1">{r.notes}</p>
                  )}
                </div>
                <div className="text-right pl-3 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[9px] text-rob uppercase">Rob</span>
                    <span className="font-mono font-bold text-lg text-gray-800">{r.rob_score ?? "—"}</span>
                    <span className="text-gray-200 text-sm mx-0.5">–</span>
                    <span className="font-mono font-bold text-lg text-gray-800">{r.matthi_score ?? "—"}</span>
                    <span className="text-[9px] text-matthi uppercase">Mat</span>
                  </div>
                  {(r.rob_putts != null || r.matthi_putts != null) && (
                    <p className="text-[10px] text-gray-300 font-mono mt-0.5">
                      {r.rob_putts_per_hole ?? "—"}/{r.matthi_putts_per_hole ?? "—"} p/h
                    </p>
                  )}
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
          <p className="text-xs text-gray-400 mt-1">Upload een scorekaart om te beginnen!</p>
        </div>
      )}
    </div>
  );
}
