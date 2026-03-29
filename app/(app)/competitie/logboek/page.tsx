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
];

export default function LogboekPage() {
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [photoIdx] = useState(() => Math.floor(Math.random() * PHOTOS.length));

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("v_round_summary")
        .select("*")
        .eq("is_competition", true)
        .not("notes", "is", null)
        .order("date", { ascending: false });

      const filtered = (data || []).filter((r) => r.notes && r.notes.trim().length > 0);
      setAllRounds(filtered);

      const uniqueSeasons = Array.from(new Set(filtered.map((r) => r.season)));
      setSeasons(uniqueSeasons);
      const current = uniqueSeasons.find((s) => s === "Zomer 2026") || uniqueSeasons[0] || "";
      setSelectedSeason(current);
      setLoading(false);
    }
    load();
  }, []);

  const rounds = selectedSeason === "alle"
    ? allRounds
    : allRounds.filter((r) => r.season === selectedSeason);

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-12 bg-white rounded-xl" /><div className="h-40 bg-white rounded-xl" /></div>;
  }

  function formatDateShort(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Logboek">
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white/80 font-medium"
        >
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
          {seasons.length > 1 && (
            <>
              <option disabled>───</option>
              <option value="alle">Alle seizoenen</option>
            </>
          )}
        </select>
      </PageHeader>

      {rounds.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center shadow-card">
          <p className="text-gray-400 text-sm">Geen opmerkingen</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{rounds.length} opmerkingen</p>
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {rounds.map((r, i) => (
              <Link
                key={r.id}
                href={`/speler/rondes/${r.id}`}
                className={`flex items-start px-3 py-1.5 card-interactive ${
                  i > 0 ? "border-t border-sand" : ""
                }`}
              >
                <span className={`w-1 h-4 rounded-full mr-2 mt-0.5 shrink-0 ${
                  r.winner === "matthi" ? "bg-matthi" : r.winner === "rob" ? "bg-rob" : "bg-gray-200"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-navy">{formatDateShort(r.date)}</span>
                    <span className="text-[9px] text-gray-400 font-mono">{r.matthi_score}–{r.rob_score}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 italic truncate">{r.notes}</p>
                </div>
                <span className="text-accent text-sm font-bold ml-1 shrink-0">›</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Foto footer */}
      <div
        className="w-full aspect-[16/7] rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${PHOTOS[photoIdx]})` }}
      />
    </div>
  );
}
