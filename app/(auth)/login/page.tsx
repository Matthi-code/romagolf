"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";

const BG_IMAGES = [
  "/images/hero-bergvliet.jpg",
  "/images/golden-fairway.jpg",
  "/images/sunset-drive.jpg",
  "/images/dawn-mist.jpg",
  "/images/winter-sun.jpg",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = usePlayer();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    setBgIndex(Math.floor(Math.random() * BG_IMAGES.length));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.toLowerCase() === "vrijmigo") {
      login({ environment: "competitie" });
      router.push("/competitie");
    } else {
      setError("Verkeerd wachtwoord");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: `url(${BG_IMAGES[bgIndex]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-dark-green/95 via-dark-green/40 to-dark-green/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold text-white tracking-tight">
            vrijmigo<span className="text-accent">.</span>
          </h1>
          <p className="text-white/40 text-xs mt-2 tracking-widest uppercase">
            Landgoed Bergvliet · Oosterhout
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-lg placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
            autoFocus
          />
          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white text-dark-green text-lg font-semibold active:scale-[0.98] transition-transform"
          >
            Inloggen
          </button>
        </form>
      </div>
    </main>
  );
}
