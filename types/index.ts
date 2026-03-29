export interface Player {
  id: string;
  name: string;
  color: string;
  hcp_current: number | null;
  is_active: boolean;
}

export interface Session {
  environment: "competitie";
}

export interface RoundSummary {
  id: string;
  date: string;
  start_time: string | null;
  season: string;
  season_type: "zomer" | "winter";
  play_style: "strokeplay" | "matchplay";
  loop: string;
  holes_played: number;
  is_competition: boolean;
  is_qualifying: boolean;
  notes: string | null;
  imported_from_excel: boolean;
  course_name: string;
  course_location: string;
  matthi_score: number | null;
  matthi_stb: number | null;
  matthi_putts: number | null;
  matthi_putts_per_hole: number | null;
  matthi_mp: number | null;
  matthi_hcp: number | null;
  matthi_wins: boolean;
  matthi_draw: boolean;
  rob_score: number | null;
  rob_stb: number | null;
  rob_putts: number | null;
  rob_putts_per_hole: number | null;
  rob_mp: number | null;
  rob_hcp: number | null;
  rob_wins: boolean;
  rob_draw: boolean;
  is_draw: boolean;
  winner: "matthi" | "rob" | "gelijk";
  temperature_c: number | null;
  wind_kmh: number | null;
  precipitation_mm: number | null;
  weather_desc: string | null;
  weather_icon: string | null;
}
