"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { getSeasonFromDate, getPlayStyle } from "@/lib/utils/season";

type Step = "photo" | "analyzing" | "review" | "saving" | "done";

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
}

interface WeatherData {
  temperature_c: number;
  wind_kmh: number;
  precipitation_mm: number;
  weather_code: number;
  weather_desc: string;
  weather_icon: string;
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
  const [matthiScore, setMatthiScore] = useState<string>("");
  const [matthiStb, setMatthiStb] = useState<string>("");
  const [matthiPutts, setMatthiPutts] = useState<string>("");
  const [loop, setLoop] = useState("10-18");
  const [holesPlayed, setHolesPlayed] = useState("9");
  const [notes, setNotes] = useState("");
  const [winner, setWinner] = useState<"matthi" | "rob" | "gelijk">("gelijk");

  // Weather
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  function handleSeasonChange(newSeason: string) {
    setSeason(newSeason);
    const type = newSeason.toLowerCase().startsWith("zomer") ? "zomer" as const : "winter" as const;
    setSeasonType(type);
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
        setMatthiScore(data.marker_score?.toString() || "");
        setMatthiStb(data.marker_stableford?.toString() || "");
        setMatthiPutts(data.marker_putts?.toString() || "");
        setLoop(data.loop || "10-18");
        setHolesPlayed(data.holes_played?.toString() || "9");

        // Auto-determine winner: strokeplay = laagste netto score (bruto - HCP) wint
        if (data.speler_score != null && data.marker_score != null) {
          setWinner(data.marker_score < data.speler_score ? "matthi" : data.speler_score < data.marker_score ? "rob" : "gelijk");
        }

        setStep("review");

        // Fetch weather in background
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
          rob_hcp: null,
          matthi_score: matthiScore ? parseInt(matthiScore) : null,
          matthi_stableford: matthiStb ? parseInt(matthiStb) : null,
          matthi_putts: matthiPutts ? parseInt(matthiPutts) : null,
          matthi_hcp: null,
          winner,
          weather,
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
                onChange={(e) => setLoop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
              >
                <option value="1-9">Lus A (1-9)</option>
                <option value="10-18">Lus B (10-18)</option>
                <option value="1-18">Volledig (1-18)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Holes</label>
              <select
                value={holesPlayed}
                onChange={(e) => setHolesPlayed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm"
              >
                <option value="9">9 holes</option>
                <option value="18">18 holes</option>
              </select>
            </div>
          </div>

          {/* Rob scores */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-rob" />
              <span className="font-medium text-sm">Rob</span>
              <span className="text-xs text-gray-400">(Speler)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Score</label>
                <input
                  type="number"
                  value={robScore}
                  onChange={(e) => setRobScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center font-bold"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Stableford</label>
                <input
                  type="number"
                  value={robStb}
                  onChange={(e) => setRobStb(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Putts</label>
                <input
                  type="number"
                  value={robPutts}
                  onChange={(e) => setRobPutts(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center"
                  placeholder="-"
                />
              </div>
            </div>
          </div>

          {/* Matthi scores */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-matthi" />
              <span className="font-medium text-sm">Matthi</span>
              <span className="text-xs text-gray-400">(Marker)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Score</label>
                <input
                  type="number"
                  value={matthiScore}
                  onChange={(e) => setMatthiScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center font-bold"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Stableford</label>
                <input
                  type="number"
                  value={matthiStb}
                  onChange={(e) => setMatthiStb(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Putts</label>
                <input
                  type="number"
                  value={matthiPutts}
                  onChange={(e) => setMatthiPutts(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center"
                  placeholder="-"
                />
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
          <p className="font-display font-display text-xl font-bold text-navy">Ronde opgeslagen!</p>
          {weather && (
            <p className="text-sm text-gray-500">
              {weather.weather_icon} {weather.temperature_c}°C · {weather.weather_desc}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => { setStep("photo"); setScorecard(null); setError(""); setNotes(""); setWeather(null); }}
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
