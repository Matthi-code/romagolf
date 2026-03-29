"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
interface Photo {
  id: string;
  round_id: string | null;
  url: string;
  caption: string | null;
  created_at: string;
}

interface RoundOption {
  id: string;
  date: string;
  season: string;
  loop: string;
  holes_played: number;
}

function getPhotoSeason(createdAt: string): string {
  const d = new Date(createdAt);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  if (month >= 4 && month <= 10) return `Zomer ${year}`;
  if (month >= 11) return `Winter ${year}-${String(year + 1).slice(2)}`;
  return `Winter ${year - 1}-${String(year).slice(2)}`;
}

export default function FotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [rounds, setRounds] = useState<RoundOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string>("vandaag");
  const [selectedSeason, setSelectedSeason] = useState<string>("Zomer 2026");
  const [caption, setCaption] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [editPhotoRound, setEditPhotoRound] = useState("");
  const [editPhotoCaption, setEditPhotoCaption] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [{ data: photoData }, { data: roundData }] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("v_round_summary").select("id, date, season, loop, holes_played").eq("is_competition", true).order("date", { ascending: false }),
      ]);
      setPhotos(photoData || []);
      setRounds(roundData || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const isVandaag = selectedRound === "vandaag";
    const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    const finalCaption = isVandaag
      ? (caption.trim() ? `${today} — ${caption.trim()}` : today)
      : caption.trim();

    const formData = new FormData();
    formData.append("file", file);
    if (selectedRound && !isVandaag) formData.append("round_id", selectedRound);
    if (finalCaption) formData.append("caption", finalCaption);

    const res = await fetch("/api/photos/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.ok) {
      // Refresh
      const { data: updated } = await supabase.from("photos").select("*").order("created_at", { ascending: false });
      setPhotos(updated || []);
      setCaption("");
      setSelectedRound("vandaag");
      setShowUpload(false);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  }

  function getRoundLabel(roundId: string) {
    const r = rounds.find((rd) => rd.id === roundId);
    if (!r) return "";
    return `${formatDate(r.date)} · ${r.loop}`;
  }

  // Bepaal het actieve seizoen (meest recente seizoen met rondes)
  const activeSeason = rounds.length > 0 ? rounds[0].season : "Zomer 2026";

  // Seizoen per foto: gekoppelde ronde > actief seizoen voor recente foto's > berekend
  function photoSeason(p: Photo): string {
    if (p.round_id) {
      const r = rounds.find((rd) => rd.id === p.round_id);
      if (r) return r.season;
    }
    // Recente foto's (laatste 30 dagen) krijgen het actieve seizoen
    const daysSinceUpload = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpload < 30) return activeSeason;
    return getPhotoSeason(p.created_at);
  }

  const photoSeasons = Array.from(new Set(photos.map(photoSeason))).sort().reverse();

  const filteredPhotos = selectedSeason === "alle"
    ? photos
    : photos.filter((p) => photoSeason(p) === selectedSeason);

  if (loading) {
    return <div className="space-y-3 animate-pulse"><div className="h-12 bg-white rounded-xl" /><div className="h-48 bg-white rounded-xl" /></div>;
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Foto's">
        <div className="flex gap-2">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white/80 font-medium"
          >
            {photoSeasons.map((s) => <option key={s} value={s}>{s}</option>)}
            {photoSeasons.length > 1 && (
              <>
                <option disabled>───</option>
                <option value="alle">Alle seizoenen</option>
              </>
            )}
          </select>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/80 border border-gray-200 text-gray-600"
          >
            {showUpload ? "×" : "+"}
          </button>
        </div>
      </PageHeader>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-white rounded-xl p-3 shadow-card space-y-2">
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 font-medium"
          >
            <option value="vandaag">Vandaag op de baan</option>
            <option disabled>───</option>
            {rounds.slice(0, 20).map((r) => (
              <option key={r.id} value={r.id}>
                {formatDate(r.date)} — {r.loop} · {r.holes_played}h
              </option>
            ))}
            <option disabled>───</option>
            <option value="">Geen flight gekoppeld</option>
          </select>
          <input
            type="text"
            placeholder="Bijschrift (optioneel)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full input-underline text-sm"
          />
          <label className={`block w-full text-center py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
            uploading ? "bg-gray-100 text-gray-400" : "bg-accent text-white active:scale-[0.98]"
          }`}>
            {uploading ? "Uploaden..." : "Foto toevoegen"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* Gallery grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-card">
          <p className="text-2xl mb-2">📷</p>
          <p className="text-gray-400 text-sm">Nog geen foto's</p>
          <p className="text-[10px] text-gray-300 mt-1">Upload je eerste foto hierboven</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {filteredPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setExpanded(expanded === photo.id ? null : photo.id)}
              className="aspect-square bg-cover bg-center relative"
              style={{ backgroundImage: `url(${photo.url})` }}
            >
              {photo.round_id && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 py-0.5 truncate">
                  {getRoundLabel(photo.round_id)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Expanded photo with swipe */}
      {expanded && (() => {
        const idx = filteredPhotos.findIndex((p) => p.id === expanded);
        const photo = filteredPhotos[idx];
        if (!photo) return null;

        function handleSwipe(e: React.TouchEvent) {
          const touch = e.changedTouches[0];
          const startX = (e.target as HTMLElement).dataset.startX;
          if (!startX) return;
          const diff = touch.clientX - parseFloat(startX);
          if (Math.abs(diff) < 50) return;
          if (diff < 0 && idx < filteredPhotos.length - 1) {
            setExpanded(filteredPhotos[idx + 1].id);
          } else if (diff > 0 && idx > 0) {
            setExpanded(filteredPhotos[idx - 1].id);
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Close + edit + counter */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/50 text-xs font-mono">{idx + 1} / {filteredPhotos.length}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditPhotoRound(photo.round_id || "");
                    setEditPhotoCaption(photo.caption || "");
                    setEditingPhoto(!editingPhoto);
                  }}
                  className="text-white/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => { setExpanded(null); setEditingPhoto(false); }} className="text-white/70 text-2xl leading-none">&times;</button>
              </div>
            </div>

            {/* Photo */}
            <div
              className="flex-1 flex items-center justify-center px-4"
              onTouchStart={(e) => {
                const el = e.currentTarget;
                el.dataset.startX = e.touches[0].clientX.toString();
              }}
              onTouchEnd={(e) => handleSwipe(e)}
            >
              <img src={photo.url} alt="" className="max-w-full max-h-[65vh] rounded-xl object-contain" />
            </div>

            {/* Edit panel */}
            {editingPhoto && (
              <div className="mx-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2">
                <select
                  value={editPhotoRound}
                  onChange={(e) => setEditPhotoRound(e.target.value)}
                  className="w-full text-xs border border-white/20 rounded-lg px-2.5 py-2 bg-white/10 text-white font-medium"
                >
                  <option value="" className="text-gray-800">Geen flight</option>
                  {rounds.slice(0, 20).map((r) => (
                    <option key={r.id} value={r.id} className="text-gray-800">
                      {formatDate(r.date)} — {r.loop} · {r.holes_played}h
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editPhotoCaption}
                  onChange={(e) => setEditPhotoCaption(e.target.value)}
                  placeholder="Bijschrift"
                  className="w-full text-xs border border-white/20 rounded-lg px-2.5 py-2 bg-white/10 text-white placeholder:text-white/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!confirm("Foto verwijderen?")) return;
                      setSavingPhoto(true);
                      await fetch("/api/photos/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: photo.id, action: "delete" }),
                      });
                      const next = filteredPhotos[idx + 1] || filteredPhotos[idx - 1];
                      setPhotos(photos.filter((p) => p.id !== photo.id));
                      setExpanded(next?.id || null);
                      setEditingPhoto(false);
                      setSavingPhoto(false);
                    }}
                    className="text-xs text-red-400 px-3 py-1.5"
                  >
                    Verwijderen
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => setEditingPhoto(false)} className="text-xs text-white/50 px-3 py-1.5">Annuleren</button>
                  <button
                    disabled={savingPhoto}
                    onClick={async () => {
                      setSavingPhoto(true);
                      await fetch("/api/photos/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: photo.id, action: "update", round_id: editPhotoRound, caption: editPhotoCaption }),
                      });
                      setPhotos(photos.map((p) => p.id === photo.id ? { ...p, round_id: editPhotoRound || null, caption: editPhotoCaption || null } : p));
                      setEditingPhoto(false);
                      setSavingPhoto(false);
                    }}
                    className="text-xs text-white bg-accent px-4 py-1.5 rounded-full font-medium"
                  >
                    {savingPhoto ? "..." : "Opslaan"}
                  </button>
                </div>
              </div>
            )}

            {/* Caption + nav dots */}
            <div className="px-4 pb-6 pt-3">
              {!editingPhoto && photo.caption && <p className="text-white text-sm text-center">{photo.caption}</p>}
              {!editingPhoto && photo.round_id && (
                <p className="text-white/50 text-xs text-center mt-1">{getRoundLabel(photo.round_id)}</p>
              )}
              {/* Nav arrows */}
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => idx > 0 && setExpanded(filteredPhotos[idx - 1].id)}
                  className={`text-white text-2xl px-4 py-1 ${idx === 0 ? "opacity-20" : "opacity-70"}`}
                >
                  ‹
                </button>
                <div className="flex gap-1">
                  {filteredPhotos.slice(Math.max(0, idx - 3), idx + 4).map((p, i) => (
                    <span
                      key={p.id}
                      className={`rounded-full ${p.id === expanded ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => idx < filteredPhotos.length - 1 && setExpanded(filteredPhotos[idx + 1].id)}
                  className={`text-white text-2xl px-4 py-1 ${idx === filteredPhotos.length - 1 ? "opacity-20" : "opacity-70"}`}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
