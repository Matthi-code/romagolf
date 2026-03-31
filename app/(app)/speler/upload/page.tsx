"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { getSeasonFromDate, getPlayStyle } from "@/lib/utils/season";

type Step = "photo" | "analyzing" | "review" | "saving" | "done";

interface HoleEdit {
  hole: number;
  par: string;
  si: string;
  rob_score: string;
  rob_putts: string;
  mat_score: string;
  mat_putts: string;
}

interface ScorecardData {
  course_name: string | null;
  loop: string;
  holes_played: number;
  speler_naam: string | null;
  speler_score: number | null;
  speler_stableford: number | null;
  speler_putts: number | null;
  marker_naam: string | null;
  marker_score: number | null;
  marker_stableford: number | null;
  marker_putts: number | null;
  hole_scores?: {
    hole: number;
    par?: number;
    si?: number;
    speler_score: number | null;
    speler_putts: number | null;
    marker_score: number | null;
    marker_putts: number | null;
  }[];
}

interface WeatherData {
  temperature_c: number;
  wind_kmh: number;
  precipitation_mm: number;
  weather_code: number;
  weather_desc: string;
  weather_icon: string;
}

// Default par + SI voor Bergvliet
const BERGVLIET_A = [
  { hole: 1, par: 4, si: 11 }, { hole: 2, par: 5, si: 3 }, { hole: 3, par: 3, si: 17 },
  { hole: 4, par: 4, si: 7 }, { hole: 5, par: 4, si: 1 }, { hole: 6, par: 3, si: 15 },
  { hole: 7, par: 4, si: 5 }, { hole: 8, par: 5, si: 9 }, { hole: 9, par: 4, si: 13 },
];
const BERGVLIET_B = [
  { hole: 10, par: 4, si: 12 }, { hole: 11, par: 3, si: 18 }, { hole: 12, par: 4, si: 4 },
  { hole: 13, par: 4, si: 2 }, { hole: 14, par: 5, si: 8 }, { hole: 15, par: 3, si: 16 },
  { hole: 16, par: 5, si: 14 }, { hole: 17, par: 4, si: 6 }, { hole: 18, par: 3, si: 10 },
];

function getDefaultHoles(loop: string): HoleEdit[] {
  const holes = loop === "1-9" ? BERGVLIET_A : loop === "10-18" ? BERGVLIET_B : [...BERGVLIET_A, ...BERGVLIET_B];
  return holes.map((h) => ({
    hole: h.hole,
    par: h.par.toString(),
    si: h.si.toString(),
    rob_score: "",
    rob_putts: "",
    mat_score: "",
    mat_putts: "",
  }));
}

export default function UploadPage() {
  const router = useRouter();
  const { session } = usePlayer();
  const [step, setStep] = useState<Step>("photo");
  const [error, setError] = useState("");
  const [rawResponse, setRawResponse] = useState("");

  // Form data
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00");
  const [season, setSeason] = useState(() => getSeasonFromDate(new Date().toISOString().split("T")[0]).season);
  const [seasonType, setSeasonType] = useState<"zomer" | "winter">(() => getSeasonFromDate(new Date().toISOString().split("T")[0]).type);

  // Scorecard data
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [robScore, setRobScore] = useState<string>("");
  const [robStb, setRobStb] = useState<string>("");
  const [robPutts, setRobPutts] = useState<string>("");
  const [robHcp, setRobHcp] = useState<string>("");
  const [matthiScore, setMatthiScore] = useState<string>("");
  const [matthiStb, setMatthiStb] = useState<string>("");
  const [matthiPutts, setMatthiPutts] = useState<string>("");
  const [matthiHcp, setMatthiHcp] = useState<string>("");
  const [loop, setLoop] = useState("10-18");
  const [holesPlayed, setHolesPlayed] = useState("9");
  const [notes, setNotes] = useState("");
  const [winner, setWinner] = useState<"matthi" | "rob" | "gelijk">("gelijk");

  // Hole scores
  const [holes, setHoles] = useState<HoleEdit[]>(() => getDefaultHoles("10-18"));

  // Weather
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Update holes als lus verandert
  useEffect(() => {
    // Alleen resetten als er geen AI data is
    if (!scorecard?.hole_scores) {
      setHoles(getDefaultHoles(loop));
    }
  }, [loop, scorecard]);

  function handleSeasonChange(newSeason: string) {
    setSeason(newSeason);
    const type = newSeason.toLowerCase().startsWith("zomer") ? "zomer" as const : "winter" as const;
    setSeasonType(type);
  }

  function updateHole(index: number, field: keyof HoleEdit, value: string) {
    setHoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function recalcTotals() {
    const robTotal = holes.reduce((sum, h) => sum + (h.rob_score ? parseInt(h.rob_score) : 0), 0);
    const matTotal = holes.reduce((sum, h) => sum + (h.mat_score ? parseInt(h.mat_score) : 0), 0);
    const robPuttsTotal = holes.reduce((sum, h) => sum + (h.rob_putts ? parseInt(h.rob_putts) : 0), 0);
    const matPuttsTotal = holes.reduce((sum, h) => sum + (h.mat_putts ? parseInt(h.mat_putts) : 0), 0);
    const hasRob = holes.some((h) => h.rob_score);
    const hasMat = holes.some((h) => h.mat_score);
    if (hasRob) { setRobScore(robTotal.toString()); setRobPutts(robPuttsTotal.toString()); }
    if (hasMat) { setMatthiScore(matTotal.toString()); setMatthiPutts(matPuttsTotal.toString()); }
    // Auto-determine winner
    if (hasRob && hasMat) {
      setWinner(matTotal < robTotal ? "matthi" : robTotal < matTotal ? "rob" : "gelijk");
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("analyzing");
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const mediaType = file.type || "image/jpeg";

        const res = await fetch("/api/upload/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: base64, media_type: mediaType }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Kon scorekaart niet lezen");
          setRawResponse(data.raw || "");
          setStep("review");
          return;
        }

        setScorecard(data);
        setRobScore(data.speler_score?.toString() || "");
        setRobStb(data.speler_stableford?.toString() || "");
        setRobPutts(data.speler_putts?.toString() || "");
        setRobHcp(data.speler_hcp?.toString() || "");
        setMatthiScore(data.marker_score?.toString() || "");
        setMatthiStb(data.marker_stableford?.toString() || "");
        setMatthiPutts(data.marker_putts?.toString() || "");
        setMatthiHcp(data.marker_hcp?.toString() || "");
        setLoop(data.loop || "10-18");
        setHolesPlayed(data.holes_played?.toString() || "9");

        // Vul hole scores in vanuit AI
        if (data.hole_scores && data.hole_scores.length > 0) {
          const defaultHoles = getDefaultHoles(data.loop || "10-18");
          const aiHoles = data.hole_scores.map((h: ScorecardData["hole_scores"] extends (infer T)[] | undefined ? T : never) => {
            const def = defaultHoles.find((d) => d.hole === h.hole);
            return {
              hole: h.hole,
              par: h.par?.toString() || def?.par || "",
              si: h.si?.toString() || def?.si || "",
              rob_score: h.speler_score?.toString() || "",
              rob_putts: h.speler_putts?.toString() || "",
              mat_score: h.marker_score?.toString() || "",
              mat_putts: h.marker_putts?.toString() || "",
            };
          });
          setHoles(aiHoles);
        } else {
          setHoles(getDefaultHoles(data.loop || "10-18"));
        }

        // Auto-determine winner
        if (data.speler_score != null && data.marker_score != null) {
          setWinner(data.marker_score < data.speler_score ? "matthi" : data.speler_score < data.marker_score ? "rob" : "gelijk");
        }

        setStep("review");
        fetchWeather();
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Fout bij uploaden");
      setStep("photo");
    }
  }

  async function fetchWeather() {
    setWeatherLoading(true);
    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      const data = await res.json();
      if (res.ok) setWeather(data);
    } catch { /* ignore */ }
    setWeatherLoading(false);
  }

  async function handleSave() {
    setStep("saving");

    try {
      const playStyle = getPlayStyle(seasonType);

      // Bouw hole_scores vanuit de editable holes
      const holeScores = holes
        .filter((h) => h.rob_score || h.mat_score)
        .map((h) => ({
          hole: h.hole,
          par: h.par ? parseInt(h.par) : null,
          si: h.si ? parseInt(h.si) : null,
          speler_score: h.rob_score ? parseInt(h.rob_score) : null,
          speler_putts: h.rob_putts ? parseInt(h.rob_putts) : null,
          marker_score: h.mat_score ? parseInt(h.mat_score) : null,
          marker_putts: h.mat_putts ? parseInt(h.mat_putts) : null,
        }));

      const res = await fetch("/api/rounds/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          start_time: time || null,
          season,
          season_type: seasonType,
          play_style: playStyle,
          loop,
          holes_played: parseInt(holesPlayed),
          notes,
          rob_score: robScore ? parseInt(robScore) : null,
          rob_stableford: robStb ? parseInt(robStb) : null,
          rob_putts: robPutts ? parseInt(robPutts) : null,
          rob_hcp: robHcp ? parseFloat(robHcp) : null,
          matthi_score: matthiScore ? parseInt(matthiScore) : null,
          matthi_stableford: matthiStb ? parseInt(matthiStb) : null,
          matthi_putts: matthiPutts ? parseInt(matthiPutts) : null,
          matthi_hcp: matthiHcp ? parseFloat(matthiHcp) : null,
          winner,
          weather,
          hole_scores: holeScores.length > 0 ? holeScores : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Opslaan mislukt");
        setStep("review");
        return;
      }

      setStep("done");
    } catch {
      setError("Opslaan mislukt");
      setStep("review");
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-bold text-navy">Upload</h2>

      {/* Step: Photo */}
      {step === "photo" && (
        <div className="space-y-4">
          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  const s = getSeasonFromDate(e.target.value);
                  setSeason(s.season);
                  setSeasonType(s.type);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tijdstip</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
              />
            </div>
          </div>

          {/* Season override */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Seizoen</label>
            <select
              value={season}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
            >
              <option value="Zomer 2026">Zomer 2026</option>
              <option value="Winter 25-26">Winter 25-26</option>
              <option value="Zomer 2025">Zomer 2025</option>
              <option value="Winter 24-25">Winter 24-25</option>
              <option value="Zomer 2024">Zomer 2024</option>
            </select>
          </div>

          {/* Photo upload */}
          <div className="relative">
            <label className="block bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer active:bg-sand transition-colors">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <span className="text-3xl block mb-2">📷</span>
              <span className="text-sm font-medium text-gray-600">
                Foto maken of kiezen
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                Maak een foto van de scorekaart
              </span>
            </label>
          </div>

          {/* Manual entry option */}
          <button
            onClick={() => { setScorecard(null); setStep("review"); fetchWeather(); }}
            className="w-full py-2.5 text-sm text-gray-500 underline"
          >
            Of voer handmatig in
          </button>
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="w-10 h-10 border-3 border-matthi border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-gray-700">Scorekaart wordt gelezen...</p>
          <p className="text-xs text-gray-400 mt-1">Dit duurt een paar seconden</p>
        </div>
      )}

      {/* Step: Review & Edit */}
      {step === "review" && (
        <div className="space-y-4">
          {error && (
            <div className="bg-rob-light rounded-xl p-3 text-sm text-rob">
              {error}
              {rawResponse && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Raw AI response</summary>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{rawResponse}</pre>
                </details>
              )}
            </div>
          )}

          {/* Seizoen + datum */}
          <div className="bg-white rounded-xl p-3 shadow-card">
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Datum</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    const s = getSeasonFromDate(e.target.value);
                    setSeason(s.season);
                    setSeasonType(s.type);
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Tijdstip</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Seizoen</label>
                <select
                  value={season}
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium"
                >
                  <option value="Zomer 2026">Zomer 2026</option>
                  <option value="Winter 25-26">Winter 25-26</option>
                  <option value="Zomer 2025">Zomer 2025</option>
                  <option value="Winter 24-25">Winter 24-25</option>
                  <option value="Zomer 2024">Zomer 2024</option>
                </select>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-1.5">
              {seasonType === "zomer" ? "Strokeplay — laagste score wint" : "Matchplay — meeste holes gewonnen"}
            </p>
          </div>

          {/* Weer badge */}
          {weather && (
            <div className="bg-white rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Weer</span>
              <span className="text-sm">
                {weather.weather_icon} {weather.temperature_c}°C · {weather.wind_kmh} km/h wind
                {weather.precipitation_mm > 0 && ` · ${weather.precipitation_mm}mm regen`}
              </span>
            </div>
          )}
          {weatherLoading && (
            <div className="bg-white rounded-xl p-3 flex items-center justify-center">
              <span className="text-xs text-gray-400">Weer ophalen...</span>
            </div>
          )}

          {/* Lus & holes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Lus</label>
              <select
                value={loop}
                onChange={(e) => { setLoop(e.target.value); setHolesPlayed(e.target.value === "1-18" ? "18" : "9"); }}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
              >
                <option value="1-9">Lus A (1-9)</option>
                <option value="10-18">Lus B (10-18)</option>
                <option value="1-18">Volledig (1-18)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Rob HCP</label>
                <input
                  type="number"
                  step="0.1"
                  value={robHcp}
                  onChange={(e) => setRobHcp(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-center font-mono"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Mat HCP</label>
                <input
                  type="number"
                  step="0.1"
                  value={matthiHcp}
                  onChange={(e) => setMatthiHcp(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-center font-mono"
                  placeholder="-"
                />
              </div>
            </div>
          </div>

          {/* Scorekaart per hole */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-4 py-2 border-b border-sand">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Scores per hole</p>
            </div>
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="text-[9px] text-gray-400 uppercase tracking-wider border-b border-sand">
                  <th className="px-1 py-1.5 text-center">Hole</th>
                  <th className="py-1.5 text-center">Par</th>
                  <th className="py-1.5 text-center text-rob">Rob</th>
                  <th className="py-1.5 text-center text-gray-300">putts</th>
                  <th className="py-1.5 text-center text-matthi">Mat</th>
                  <th className="py-1.5 text-center text-gray-300">putts</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {holes.map((h, i) => (
                  <tr key={h.hole} className="border-b border-sand/50">
                    <td className="px-1 py-1 text-center text-gray-500 font-body">{h.hole}</td>
                    <td className="py-1 text-center text-gray-400">{h.par}</td>
                    <td className="py-0.5 px-1">
                      <input
                        type="number"
                        value={h.rob_score}
                        onChange={(e) => updateHole(i, "rob_score", e.target.value)}
                        className="w-full text-center font-mono text-sm bg-rob-light/20 rounded py-1"
                        placeholder="-"
                      />
                    </td>
                    <td className="py-0.5 px-1">
                      <input
                        type="number"
                        value={h.rob_putts}
                        onChange={(e) => updateHole(i, "rob_putts", e.target.value)}
                        className="w-full text-center font-mono text-xs bg-gray-50 rounded py-1"
                        placeholder="-"
                      />
                    </td>
                    <td className="py-0.5 px-1">
                      <input
                        type="number"
                        value={h.mat_score}
                        onChange={(e) => updateHole(i, "mat_score", e.target.value)}
                        className="w-full text-center font-mono text-sm bg-matthi-light/20 rounded py-1"
                        placeholder="-"
                      />
                    </td>
                    <td className="py-0.5 px-1">
                      <input
                        type="number"
                        value={h.mat_putts}
                        onChange={(e) => updateHole(i, "mat_putts", e.target.value)}
                        className="w-full text-center font-mono text-xs bg-gray-50 rounded py-1"
                        placeholder="-"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-sand">
              <button
                onClick={recalcTotals}
                className="text-xs text-accent font-medium"
              >
                Totalen herberekenen
              </button>
            </div>
          </div>

          {/* Totalen */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rob totalen */}
            <div className="bg-white rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rob" />
                <span className="font-medium text-xs">Rob</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Score</label>
                  <input type="number" value={robScore} onChange={(e) => setRobScore(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-bold font-mono" placeholder="-" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Stb</label>
                  <input type="number" value={robStb} onChange={(e) => setRobStb(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-mono" placeholder="-" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Putts</label>
                  <input type="number" value={robPutts} onChange={(e) => setRobPutts(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-mono" placeholder="-" />
                </div>
              </div>
            </div>

            {/* Matthi totalen */}
            <div className="bg-white rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-matthi" />
                <span className="font-medium text-xs">Matthi</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Score</label>
                  <input type="number" value={matthiScore} onChange={(e) => setMatthiScore(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-bold font-mono" placeholder="-" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Stb</label>
                  <input type="number" value={matthiStb} onChange={(e) => setMatthiStb(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-mono" placeholder="-" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 uppercase block mb-0.5">Putts</label>
                  <input type="number" value={matthiPutts} onChange={(e) => setMatthiPutts(e.target.value)}
                    className="w-full px-1 py-1.5 rounded-lg border border-gray-200 text-xs text-center font-mono" placeholder="-" />
                </div>
              </div>
            </div>
          </div>

          {/* Winner */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Winnaar</label>
            <div className="grid grid-cols-3 gap-2">
              {(["matthi", "rob", "gelijk"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWinner(w)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    winner === w
                      ? w === "matthi" ? "bg-matthi text-white"
                        : w === "rob" ? "bg-rob text-white"
                        : "bg-gray-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {w === "matthi" ? "Matthi" : w === "rob" ? "Rob" : "Gelijk"}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Opmerking</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bijzonderheden van deze ronde..."
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm resize-none h-20"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-navy text-white text-lg font-semibold active:scale-[0.98] transition-transform"
          >
            Ronde opslaan
          </button>

          <button
            onClick={() => { setStep("photo"); setError(""); setScorecard(null); }}
            className="w-full py-2 text-sm text-gray-500"
          >
            Annuleren
          </button>
        </div>
      )}

      {/* Step: Saving */}
      {step === "saving" && (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="w-10 h-10 border-3 border-matthi border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-gray-700">Opslaan...</p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="bg-white rounded-2xl p-10 text-center space-y-4">
          <span className="text-4xl block">✅</span>
          <p className="font-display text-xl font-bold text-navy">Ronde opgeslagen!</p>
          {weather && (
            <p className="text-sm text-gray-500">
              {weather.weather_icon} {weather.temperature_c}°C · {weather.weather_desc}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => { setStep("photo"); setScorecard(null); setError(""); setNotes(""); setWeather(null); setHoles(getDefaultHoles(loop)); }}
              className="px-6 py-2.5 rounded-xl bg-sand-dark text-sm font-medium text-gray-700"
            >
              Nog een ronde
            </button>
            <button
              onClick={() => router.push("/competitie/scorekaarten")}
              className="px-6 py-2.5 rounded-xl bg-matthi text-sm font-medium text-white"
            >
              Bekijk scorekaarten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
