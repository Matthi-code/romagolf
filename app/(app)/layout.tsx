"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import BottomNav from "@/components/ui/BottomNav";

const menuItems = [
  { href: "/competitie", label: "Stand", icon: "🏆" },
  { href: "/competitie/scorekaarten", label: "Scorekaarten", icon: "📋" },
  { href: "/competitie/head-to-head", label: "Head-to-Head", icon: "⚔️" },
  { href: "/competitie/historie", label: "Trends", icon: "📈" },
  { href: "/competitie/logboek", label: "Logboek", icon: "📝" },
  { href: "/competitie/fotos", label: "Foto's", icon: "📷" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = usePlayer();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  // Sluit menu bij navigatie
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-2 border-matthi border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-navy text-white sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/competitie" className="font-display text-xl font-semibold tracking-tight">
            vrijmigo<span className="text-accent">.</span>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1"
          >
            <span className={`w-5 h-0.5 bg-white/80 rounded transition-transform ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`w-5 h-0.5 bg-white/80 rounded transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-0.5 bg-white/80 rounded transition-transform ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-4 top-full mt-1 w-52 bg-white rounded-xl shadow-card-hover z-50 overflow-hidden border border-sand-dark">
              {menuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-sand font-semibold text-navy"
                        : "text-gray-600 hover:bg-sand/50"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
                  </Link>
                );
              })}
              <hr className="border-sand-dark" />
              <button
                onClick={() => { logout(); router.push("/login"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-sand/50 transition-colors"
              >
                <span className="text-base">👋</span>
                <span>Uitloggen</span>
              </button>
            </div>
          </>
        )}
      </header>

      <main className="px-4 py-3 max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
