"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { formatDateFull } from "@/lib/utils/format";
import type { RoundSummary } from "@/types";

const THUMB_IMAGES = [
  "/images/fairway.jpg",
  "/images/sunset-drive.jpg",
  "/images/golden-fairway.jpg",
  "/images/dawn-mist.jpg",
  "/images/waterhole.jpg",
  "/images/green-flag.jpg",
  "/images/summer-tee.jpg",
];

interface HoleScore {
  hole_number: number;
  par: number;
  si: number;
  gross_score: number | null;
  putts: number | null;
  player_name: string;
}

interface SeasonAvg {
  robAvg: number | null;
  matthiAvg: number | null;
  robPuttsAvg: number | null;
  matthiPuttsAvg: number | null;
}

export default function RondeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [round, setRound] = useState<RoundSummary | null>(null);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [seasonAvg, setSeasonAvg] = useState<SeasonAvg>({ robAvg: null, matthiAvg: null, robPuttsAvg: null, matthiPuttsAvg: null });
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);
  const [thumbIdx] = useState(() => Math.floor(Math.random() * THUMB_IMAGES.length));
  const [thumbExpanded, setThumbExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editRobHcp, setEditRobHcp] = useState("");
  const [editMatHcp, setEditMatHcp] = useState("");
  const [editRobScore, setEditRobScore] = useState("");
  const [editMatScore, setEditMatScore] = useState("");
  const [editRobPutts, setEditRobPutts] = useState("");
  const [editMatPutts, setEditMatPutts] = useState("");
  const [editRobStb, setEditRobStb] = useState("");
  const [editMatStb, setEditMatStb] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingHoles, setEditingHoles] = useState(false);
  const [holeEdits, setHoleEdits] = useState<Map<string, string>>(new Map());
  const [savingHoles, setSavingHoles] = useState(false);
  const [editingHero, setEditingHero] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [savingHero, setSavingHero] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const id = params.id as string;

      const { data: roundData } = await supabase
        .from("v_round_summary").select("*").eq("id", id).single();

      if (roundData) {
        setRound(roundData);
        setNote(roundData.notes || "");

        const { data: seasonRounds } = await supabase
          .from("v_round_summary")
          .select("rob_score, matthi_score, rob_putts_per_hole, matthi_putts_per_hole, holes_played")
          .eq("season", roundData.season).eq("is_competition", true);

        if (seasonRounds) {
          const r9 = seasonRounds.filter((r) => r.holes_played === 9);
          const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
          setSeasonAvg({
            robAvg: avg(r9.filter((r) => r.rob_score != null).map((r) => r.rob_score!)),
            matthiAvg: avg(r9.filter((r) => r.matthi_score != null).map((r) => r.matthi_score!)),
            robPuttsAvg: avg(seasonRounds.filter((r) => r.rob_putts_per_hole != null).map((r) => r.rob_putts_per_hole!)),
            matthiPuttsAvg: avg(seasonRounds.filter((r) => r.matthi_putts_per_hole != null).map((r) => r.matthi_putts_per_hole!)),
          });
        }
      }

      const { data: holes } = await supabase
        .from("hole_scores").select("hole_number, par, si, gross_score, putts, player_id")
        .eq("round_id", id).order("hole_number");

      if (holes && holes.length > 0) {
        const { data: players } = await supabase.from("players").select("id, name");
        const pm = new Map(players?.map((p) => [p.id, p.name]) || []);
        setHoleScores(holes.map((h) => ({ ...h, player_name: pm.get(h.player_id) || "?" })));
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function saveNote() {
    if (!round) return;
    setNoteSaving(true);
    await supabase.from("rounds").update({ notes: note || null }).eq("id", round.id);
    setNoteSaving(false);
    setNoteEditing(false);
    setRound({ ...round, notes: note || null });
  }

  function startEdit() {
    if (!round) return;
    setEditRobHcp(round.rob_hcp?.toString() ?? "");
    setEditMatHcp(round.matthi_hcp?.toString() ?? "");
    setEditRobScore(round.rob_score?.toString() ?? "");
    setEditMatScore(round.matthi_score?.toString() ?? "");
    setEditRobPutts(round.rob_putts?.toString() ?? "");
    setEditMatPutts(round.matthi_putts?.toString() ?? "");
    setEditRobStb(round.rob_stb?.toString() ?? "");
    setEditMatStb(round.matthi_stb?.toString() ?? "");
    setEditing(true);
  }

  async function saveEdit() {
    if (!round) return;
    setSaving(true);

    const updates = [
      {
        round_id: round.id,
        player_name: "Rob",
        hcp: editRobHcp ? parseFloat(editRobHcp) : null,
        gross_score: editRobScore ? parseInt(editRobScore) : null,
        putts_total: editRobPutts ? parseInt(editRobPutts) : null,
        stableford_points: editRobStb ? parseInt(editRobStb) : null,
      },
      {
        round_id: round.id,
        player_name: "Matthi",
        hcp: editMatHcp ? parseFloat(editMatHcp) : null,
        gross_score: editMatScore ? parseInt(editMatScore) : null,
        putts_total: editMatPutts ? parseInt(editMatPutts) : null,
        stableford_points: editMatStb ? parseInt(editMatStb) : null,
      },
    ];

    for (const u of updates) {
      await fetch("/api/rounds/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
    }

    // Refresh data
    const { data: updated } = await supabase
      .from("v_round_summary").select("*").eq("id", round.id).single();
    if (updated) setRound(updated);

    setSaving(false);
    setEditing(false);
  }

  function startHoleEdit() {
    const edits = new Map<string, string>();
    holeScores.forEach((h) => {
      const prefix = `${h.hole_number}-${h.player_name}`;
      edits.set(`${prefix}-score`, h.gross_score?.toString() ?? "");
      edits.set(`${prefix}-putts`, h.putts?.toString() ?? "");
    });
    setHoleEdits(edits);
    setEditingHoles(true);
  }

  function setHoleEdit(key: string, value: string) {
    setHoleEdits((prev) => new Map(prev).set(key, value));
  }

  async function saveHoleEdits() {
    if (!round) return;
    setSavingHoles(true);

    const holes: { hole_number: number; player_name: string; gross_score: number | null; putts: number | null }[] = [];
    const processed = new Set<string>();

    holeEdits.forEach((_, key) => {
      const [holeStr, player, field] = key.split("-");
      const holeKey = `${holeStr}-${player}`;
      if (processed.has(holeKey)) return;
      processed.add(holeKey);

      const scoreVal = holeEdits.get(`${holeKey}-score`) ?? "";
      const puttsVal = holeEdits.get(`${holeKey}-putts`) ?? "";
      holes.push({
        hole_number: parseInt(holeStr),
        player_name: player,
        gross_score: scoreVal ? parseInt(scoreVal) : null,
        putts: puttsVal ? parseInt(puttsVal) : null,
      });
    });

    await fetch("/api/rounds/update-holes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round_id: round.id, holes }),
    });

    // Refresh hole scores
    const { data: updatedHoles } = await supabase
      .from("hole_scores")
      .select("hole_number, par, si, gross_score, putts, player_id")
      .eq("round_id", round.id)
      .order("hole_number");

    if (updatedHoles) {
      const { data: players } = await supabase.from("players").select("id, name");
      const pm = new Map(players?.map((p) => [p.id, p.name]) || []);
      setHoleScores(updatedHoles.map((h) => ({ ...h, player_name: pm.get(h.player_id) || "?" })));
    }

    // Refresh ronde totalen
    const { data: updatedRound } = await supabase
      .from("v_round_summary").select("*").eq("id", round.id).single();
    if (updatedRound) setRound(updatedRound);

    setSavingHoles(false);
    setEditingHoles(false);
  }

  function startHeroEdit() {
    if (!round) return;
    setEditDate(round.date);
    setEditTime(round.start_time ? String(round.start_time).substring(0, 5) : "");
    setEditingHero(true);
  }

  async function saveHeroEdit() {
    if (!round) return;
    setSavingHero(true);
    await supabase.from("rounds").update({
      date: editDate,
      start_time: editTime || null,
    }).eq("id", round.id);

    const { data: updated } = await supabase
      .from("v_round_summary").select("*").eq("id", round.id).single();
    if (updated) setRound(updated);
    setSavingHero(false);
    setEditingHero(false);
  }

  function scoreTdClass(score: number | null, par: number): string {
    if (score == null) return "";
    const d = score - par;
    if (d <= -2) return "bg-amber-200";
    if (d === -1) return "bg-green-100";
    if (d === 0) return "";
    if (d === 1) return "bg-rob-light";
    return "bg-red-200";
  }

  function scoreCell(score: number | null, par: number) {
    if (score == null) return <span className="text-gray-300">—</span>;
    const d = score - par;
    if (d <= -2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-amber-500 text-amber-900 font-bold text-xs">
          {score}
        </span>
      );
    }
    if (d === -1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-green-500 text-green-900 font-bold text-xs">
          {score}
        </span>
      );
    }
    if (d === 0) return <span className="text-gray-700">{score}</span>;
    if (d === 1) return <span className="text-rob">{score}</span>;
    return <span className="text-red-800 font-semibold">{score}</span>;
  }

  if (loading) return <div className="space-y-3 animate-pulse"><div className="h-24 bg-white rounded-xl" /><div className="h-32 bg-white rounded-xl" /></div>;
  if (!round) return <div className="p-8 text-center text-gray-400">Ronde niet gevonden</div>;

  const holesByNumber = new Map<number, { rob: HoleScore | null; matthi: HoleScore | null }>();
  holeScores.forEach((h) => {
    if (!holesByNumber.has(h.hole_number)) holesByNumber.set(h.hole_number, { rob: null, matthi: null });
    const e = holesByNumber.get(h.hole_number)!;
    if (h.player_name === "Rob") e.rob = h; else e.matthi = h;
  });
  const sortedHoles = Array.from(holesByNumber.entries()).sort((a, b) => a[0] - b[0]);

  function scoreBg(score: number | null, par: number): string {
    if (score == null) return "";
    const d = score - par;
    if (d <= -2) return "eagle";
    if (d === -1) return "birdie";
    if (d === 0) return "bg-green-100 text-green-800";
    if (d === 1) return "bg-rob-light text-rob";
    return "bg-red-200 text-red-800 font-semibold";
  }

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="text-sm text-navy">&larr; Terug</button>

      {/* Compacte hero — zalmroze */}
      <div className="bg-accent-light rounded-xl border border-accent/20 flex overflow-hidden">
        <div className="flex-1 p-4">
          <p className="text-accent-dark text-[9px] uppercase tracking-[0.15em]">{round.course_name}</p>
          {!editingHero ? (
            <>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-display text-xl font-bold text-navy">{formatDateFull(round.date)}</p>
                <button onClick={startHeroEdit} className="text-accent">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Lus <span className="font-mono">{round.loop}</span> · <span className="font-mono">{round.holes_played}</span>h · {round.play_style}
                {round.start_time && ` · ${String(round.start_time).substring(0, 5)}`}
              </p>
            </>
          ) : (
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-gray-400 uppercase">Datum</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                    className="w-full input-underline text-sm font-mono" />
                </div>
                <div className="w-24">
                  <label className="text-[9px] text-gray-400 uppercase">Starttijd</label>
                  <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)}
                    className="w-full input-underline text-sm font-mono" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingHero(false)} className="text-xs text-gray-400 px-3 py-1">Annuleren</button>
                <button onClick={saveHeroEdit} disabled={savingHero} className="text-xs text-white bg-accent px-4 py-1 rounded-full font-medium">
                  {savingHero ? "..." : "Opslaan"}
                </button>
              </div>
            </div>
          )}
          {round.weather_desc && !editingHero && (
            <p className="text-gray-400 text-xs mt-1">
              {round.weather_icon} <span className="font-mono">{round.temperature_c}°C</span>
              {round.wind_kmh != null && <> · <span className="font-mono">{round.wind_kmh}</span> km/h</>}
            </p>
          )}
        </div>
        <button
          onClick={() => setThumbExpanded(!thumbExpanded)}
          className="w-28 shrink-0 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(${THUMB_IMAGES[thumbIdx]})` }}
        />
      </div>

      {/* Expanded thumbnail */}
      {thumbExpanded && (
        <button
          onClick={() => setThumbExpanded(false)}
          className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${THUMB_IMAGES[thumbIdx]})` }}
        />
      )}

      {/* Score card — compact, geen grote cirkels */}
      <div className="card-highlight rounded-xl p-4 relative">
        {!editing ? (
          <>
            <button
              onClick={startEdit}
              className="absolute top-3 right-3 text-accent/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <div className="grid grid-cols-3 text-center items-end">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rob</p>
                <p className="text-4xl font-mono font-bold text-navy">{round.rob_score ?? "—"}</p>
                {round.rob_hcp != null && <p className="text-[10px] text-accent font-mono mt-0.5">HCP {round.rob_hcp}</p>}
              </div>
              <div className="flex flex-col items-center gap-1 pb-2">
                <p className="text-[10px] text-gray-300">vs</p>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  round.winner === "rob" ? "bg-rob/10 text-rob" : round.winner === "matthi" ? "bg-matthi/10 text-matthi" : "bg-gray-100 text-gray-400"
                }`}>
                  {round.winner === "rob" ? "Rob wint" : round.winner === "matthi" ? "Mat wint" : "Gelijk"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Matthi</p>
                <p className="text-4xl font-mono font-bold text-navy">{round.matthi_score ?? "—"}</p>
                {round.matthi_hcp != null && <p className="text-[10px] text-accent font-mono mt-0.5">HCP {round.matthi_hcp}</p>}
              </div>
            </div>

            {/* Putts */}
            {(round.rob_putts != null || round.matthi_putts != null) && (
              <div className="grid grid-cols-3 text-center mt-3 pt-3 border-t border-accent/20 text-xs">
                <div>
                  {round.rob_putts != null && <p className="text-gray-400 font-mono">{round.rob_putts} putts ({round.rob_putts_per_hole}/h)</p>}
                </div>
                <div className="text-[9px] text-gray-300 uppercase flex flex-col justify-center">
                  <span>Putts</span>
                </div>
                <div>
                  {round.matthi_putts != null && <p className="text-gray-400 font-mono">{round.matthi_putts} putts ({round.matthi_putts_per_hole}/h)</p>}
                </div>
              </div>
            )}

            {/* Stableford */}
            {(round.rob_stb != null || round.matthi_stb != null) && (
              <div className="grid grid-cols-3 text-center mt-2 pt-2 border-t border-accent/10 text-xs">
                <div>
                  {round.rob_stb != null && <p className="text-gray-400 font-mono">{round.rob_stb} stb</p>}
                </div>
                <div className="text-[9px] text-gray-300 uppercase flex flex-col justify-center">
                  <span>Stableford</span>
                </div>
                <div>
                  {round.matthi_stb != null && <p className="text-gray-400 font-mono">{round.matthi_stb} stb</p>}
                </div>
              </div>
            )}

          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center">Rob</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Slagen</label>
                    <input type="number" value={editRobScore} onChange={(e) => setEditRobScore(e.target.value)}
                      className="w-full input-underline text-center font-mono text-lg" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Putts</label>
                    <input type="number" value={editRobPutts} onChange={(e) => setEditRobPutts(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">HCP</label>
                    <input type="number" step="0.1" value={editRobHcp} onChange={(e) => setEditRobHcp(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Stableford</label>
                    <input type="number" value={editRobStb} onChange={(e) => setEditRobStb(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center">Matthi</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Slagen</label>
                    <input type="number" value={editMatScore} onChange={(e) => setEditMatScore(e.target.value)}
                      className="w-full input-underline text-center font-mono text-lg" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Putts</label>
                    <input type="number" value={editMatPutts} onChange={(e) => setEditMatPutts(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">HCP</label>
                    <input type="number" step="0.1" value={editMatHcp} onChange={(e) => setEditMatHcp(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase">Stableford</label>
                    <input type="number" value={editMatStb} onChange={(e) => setEditMatStb(e.target.value)}
                      className="w-full input-underline text-center font-mono" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-accent/20">
              <button onClick={() => setEditing(false)} className="text-xs text-gray-400 px-3 py-1">
                Annuleren
              </button>
              <button onClick={saveEdit} disabled={saving} className="text-xs text-white bg-accent px-4 py-1 rounded-full font-medium">
                {saving ? "..." : "Opslaan"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Vergelijking seizoensgemiddelde */}
      {(seasonAvg.robAvg != null || seasonAvg.matthiAvg != null) && (
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
            Vergelijking {round.season}
          </p>
          <div className="space-y-1.5 text-sm">
            {round.rob_score != null && seasonAvg.robAvg != null && round.holes_played === 9 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Rob score vs gem.</span>
                <span><span className="font-mono font-medium text-navy">{round.rob_score}</span> <span className="text-gray-300 text-xs">vs</span> <span className="font-mono text-gray-400">{seasonAvg.robAvg.toFixed(1)}</span></span>
              </div>
            )}
            {round.matthi_score != null && seasonAvg.matthiAvg != null && round.holes_played === 9 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mat score vs gem.</span>
                <span><span className="font-mono font-medium text-navy">{round.matthi_score}</span> <span className="text-gray-300 text-xs">vs</span> <span className="font-mono text-gray-400">{seasonAvg.matthiAvg.toFixed(1)}</span></span>
              </div>
            )}
            {round.rob_putts_per_hole != null && seasonAvg.robPuttsAvg != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Rob putts/h vs gem.</span>
                <span><span className="font-mono font-medium text-navy">{round.rob_putts_per_hole}</span> <span className="text-gray-300 text-xs">vs</span> <span className="font-mono text-gray-400">{seasonAvg.robPuttsAvg.toFixed(1)}</span></span>
              </div>
            )}
            {round.matthi_putts_per_hole != null && seasonAvg.matthiPuttsAvg != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mat putts/h vs gem.</span>
                <span><span className="font-mono font-medium text-navy">{round.matthi_putts_per_hole}</span> <span className="text-gray-300 text-xs">vs</span> <span className="font-mono text-gray-400">{seasonAvg.matthiPuttsAvg.toFixed(1)}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scorekaart */}
      {sortedHoles.length > 0 && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-2 border-b border-sand flex items-center justify-between">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Scorekaart</p>
            {!editingHoles ? (
              <button onClick={startHoleEdit} className="text-accent">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingHoles(false)} className="text-[11px] text-gray-400">Annuleren</button>
                <button onClick={saveHoleEdits} disabled={savingHoles} className="text-[11px] text-white bg-accent px-3 py-0.5 rounded-full font-medium">
                  {savingHoles ? "..." : "Opslaan"}
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-sm table-fixed border-separate" style={{ borderSpacing: "0 1px" }}>
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="text-[9px] text-gray-400 uppercase tracking-wider">
                <th className="px-2 py-1.5 text-left">Hole</th>
                <th className="py-1.5 text-center">Par</th>
                <th className="py-1.5 text-center">SI</th>
                <th className="py-1.5 text-center text-rob">Rob</th>
                <th className="py-1.5 text-center text-gray-300 font-normal lowercase">putts</th>
                <th className="py-1.5 text-center text-matthi">Mat</th>
                <th className="py-1.5 text-center text-gray-300 font-normal lowercase">putts</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {sortedHoles.map(([n, s]) => {
                const par = s.rob?.par || s.matthi?.par || 0;
                return (
                  <tr key={n}>
                    <td className="px-2 py-1 font-body text-gray-500">{n}</td>
                    <td className="py-1 text-center text-gray-400">{par}</td>
                    <td className="py-1 text-center text-gray-300 text-xs">{s.rob?.si || s.matthi?.si}</td>
                    {editingHoles ? (
                      <>
                        <td className="py-0.5 text-center"><input type="number" value={holeEdits.get(`${n}-Rob-score`) ?? ""} onChange={(e) => setHoleEdit(`${n}-Rob-score`, e.target.value)} className="w-full text-center font-mono text-sm bg-rob-light/30 rounded py-0.5" /></td>
                        <td className="py-0.5 text-center"><input type="number" value={holeEdits.get(`${n}-Rob-putts`) ?? ""} onChange={(e) => setHoleEdit(`${n}-Rob-putts`, e.target.value)} className="w-full text-center font-mono text-xs bg-gray-50 rounded py-0.5" /></td>
                        <td className="py-0.5 text-center"><input type="number" value={holeEdits.get(`${n}-Matthi-score`) ?? ""} onChange={(e) => setHoleEdit(`${n}-Matthi-score`, e.target.value)} className="w-full text-center font-mono text-sm bg-matthi-light/30 rounded py-0.5" /></td>
                        <td className="py-0.5 text-center"><input type="number" value={holeEdits.get(`${n}-Matthi-putts`) ?? ""} onChange={(e) => setHoleEdit(`${n}-Matthi-putts`, e.target.value)} className="w-full text-center font-mono text-xs bg-gray-50 rounded py-0.5" /></td>
                      </>
                    ) : (
                      <>
                        <td className={`py-1 text-center ${scoreTdClass(s.rob?.gross_score ?? null, par)}`}>{scoreCell(s.rob?.gross_score ?? null, par)}</td>
                        <td className="py-1 text-center text-gray-300 text-xs">{s.rob?.putts ?? ""}</td>
                        <td className={`py-1 text-center ${scoreTdClass(s.matthi?.gross_score ?? null, par)}`}>{scoreCell(s.matthi?.gross_score ?? null, par)}</td>
                        <td className="py-1 text-center text-gray-300 text-xs">{s.matthi?.putts ?? ""}</td>
                      </>
                    )}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-navy/10 font-bold">
                <td className="px-2 py-1.5 font-body text-gray-500">Tot</td>
                <td className="py-1.5 text-center text-gray-400">{sortedHoles.reduce((sum, [, s]) => sum + (s.rob?.par || s.matthi?.par || 0), 0)}</td>
                <td></td>
                <td className="py-1.5 text-center text-rob">{round.rob_score ?? "—"}</td>
                <td className="py-1.5 text-center text-gray-400 text-xs">{round.rob_putts ?? ""}</td>
                <td className="py-1.5 text-center text-matthi">{round.matthi_score ?? "—"}</td>
                <td className="py-1.5 text-center text-gray-400 text-xs">{round.matthi_putts ?? ""}</td>
              </tr>
            </tbody>
          </table>
          <div className="px-3 py-1.5 border-t border-sand flex gap-3 text-[8px] text-gray-400">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-200 ring-2 ring-amber-500 mr-0.5" />Eagle+</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-100 ring-2 ring-green-500 mr-0.5" />Birdie</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded bg-rob-light mr-0.5" />Bogey</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded bg-red-200 mr-0.5" />Dbl+</span>
          </div>
        </div>
      )}

      {/* Golf.nl doorsturen */}
      {round && holeScores.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏌️</span>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Doorsturen naar golf.nl</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="https://mijn.golf.nl/mijn-spel/scores"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-[#00875a] text-white text-xs font-medium text-center active:scale-[0.98] transition-transform"
            >
              Open golf.nl
            </a>
            <button
              onClick={() => {
                if (!round) return;
                const robHoles = holeScores.filter(h => h.player_name === "Rob");
                const matHoles = holeScores.filter(h => h.player_name === "Matthi");
                const lines = robHoles.map((rh) => {
                  const mh = matHoles.find(m => m.hole_number === rh.hole_number);
                  return `${rh.hole_number}: Rob ${rh.gross_score ?? "-"} (${rh.putts ?? "-"}p) · Mat ${mh?.gross_score ?? "-"} (${mh?.putts ?? "-"}p)`;
                });
                const text = `Bergvliet ${round.loop} · ${round.date}\nRob: ${round.rob_score} (HCP ${round.rob_hcp ?? "-"})\nMatthi: ${round.matthi_score} (HCP ${round.matthi_hcp ?? "-"})\n\n${lines.join("\n")}`;
                navigator.clipboard.writeText(text).then(() => alert("Scores gekopieerd!")).catch(() => {});
              }}
              className="py-2 px-3 rounded-xl bg-gray-100 text-xs font-medium text-gray-600 active:scale-[0.98] transition-transform"
            >
              Kopieer
            </button>
          </div>
        </div>
      )}

      {/* Verwijderen */}
      <button
        onClick={async () => {
          if (!round || !confirm("Weet je zeker dat je deze ronde wilt verwijderen?")) return;
          setDeleting(true);
          await fetch("/api/rounds/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ round_id: round.id }),
          });
          router.push("/competitie/scorekaarten");
        }}
        disabled={deleting}
        className="w-full py-2.5 text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        {deleting ? "Verwijderen..." : "Ronde verwijderen"}
      </button>

      {/* Opmerking */}
      <div className="bg-white rounded-xl p-3 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Opmerking</p>
          {!noteEditing && (
            <button onClick={() => setNoteEditing(true)} className="text-accent/50">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        {noteEditing ? (
          <div className="space-y-2">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hoe was de ronde?"
              className="w-full input-underline text-sm resize-none h-16" autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setNoteEditing(false); setNote(round.notes || ""); }} className="text-xs text-gray-400 px-3 py-1">Annuleren</button>
              <button onClick={saveNote} disabled={noteSaving} className="text-xs text-white bg-accent px-4 py-1 rounded-full font-medium">
                {noteSaving ? "..." : "Opslaan"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">{round.notes || "Geen opmerking"}</p>
        )}
      </div>
    </div>
  );
}
