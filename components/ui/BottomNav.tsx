"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";

const spelerTabs = [
  { href: "/speler", label: "Dashboard", icon: "📊" },
  { href: "/speler/rondes", label: "Rondes", icon: "📋" },
  { href: "/speler/statistieken", label: "Stats", icon: "📈" },
  { href: "/speler/upload", label: "Upload", icon: "📷" },
];

const competitieTabs = [
  { href: "/competitie", label: "Stand", icon: "🏆" },
  { href: "/competitie/scorekaarten", label: "Scores", icon: "📋" },
  { href: "/competitie/head-to-head", label: "H2H", icon: "⚔️" },
  { href: "/competitie/historie", label: "Trends", icon: "📈" },
  { href: "/speler/statistieken", label: "Stats", icon: "📊" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { session } = usePlayer();

  const tabs = session?.environment === "competitie" ? competitieTabs : spelerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-dark pb-safe z-30">
      <div className="flex justify-around items-center h-12 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/speler" && tab.href !== "/competitie" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                active
                  ? "text-navy font-semibold"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
