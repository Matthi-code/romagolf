export function getSeasonFromDate(date: string): {
  season: string;
  type: "zomer" | "winter";
} {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  // Zomer: maart (3) t/m oktober (10) — strokeplay
  // Winter: november (11) t/m februari (2) — matchplay
  // NB: Matthi en Rob starten het zomerseizoen al in maart
  if (month >= 3 && month <= 10) {
    return { season: `Zomer ${year}`, type: "zomer" };
  } else if (month >= 11) {
    return {
      season: `Winter ${year}-${String(year + 1).slice(2)}`,
      type: "winter",
    };
  } else {
    // januari, februari
    return {
      season: `Winter ${year - 1}-${String(year).slice(2)}`,
      type: "winter",
    };
  }
}

export function getCurrentSeason(): string {
  const today = new Date().toISOString().slice(0, 10);
  return getSeasonFromDate(today).season;
}

export function getPlayStyle(
  seasonType: "zomer" | "winter"
): "strokeplay" | "matchplay" {
  return seasonType === "zomer" ? "strokeplay" : "matchplay";
}
