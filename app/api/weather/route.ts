import { NextResponse } from "next/server";

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: "Zonnig", icon: "☀️" },
  1: { desc: "Overwegend helder", icon: "🌤️" },
  2: { desc: "Half bewolkt", icon: "⛅" },
  3: { desc: "Bewolkt", icon: "☁️" },
  45: { desc: "Mistig", icon: "🌫️" },
  48: { desc: "Rijpmist", icon: "🌫️" },
  51: { desc: "Lichte motregen", icon: "🌦️" },
  53: { desc: "Motregen", icon: "🌦️" },
  55: { desc: "Zware motregen", icon: "🌧️" },
  61: { desc: "Lichte regen", icon: "🌦️" },
  63: { desc: "Regen", icon: "🌧️" },
  65: { desc: "Zware regen", icon: "🌧️" },
  71: { desc: "Lichte sneeuw", icon: "🌨️" },
  73: { desc: "Sneeuw", icon: "❄️" },
  75: { desc: "Zware sneeuw", icon: "❄️" },
  80: { desc: "Regenbuien", icon: "🌦️" },
  81: { desc: "Zware buien", icon: "🌧️" },
  95: { desc: "Onweer", icon: "⛈️" },
};

export async function POST(req: Request) {
  try {
    const { date, time, lat = 51.6419, lon = 4.8652 } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "Datum is verplicht" }, { status: 400 });
    }

    const hour = time ? parseInt(time.split(":")[0]) : 10;

    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,precipitation,windspeed_10m,weathercode` +
      `&start_date=${date}&end_date=${date}` +
      `&timezone=Europe/Amsterdam`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.hourly) {
      return NextResponse.json({ error: "Geen weerdata beschikbaar" }, { status: 404 });
    }

    const idx = Math.min(hour, data.hourly.time.length - 1);
    const weatherCode = data.hourly.weathercode[idx];
    const info = WEATHER_CODES[weatherCode] || { desc: "Onbekend", icon: "🌡️" };

    return NextResponse.json({
      temperature_c: data.hourly.temperature_2m[idx],
      wind_kmh: data.hourly.windspeed_10m[idx],
      precipitation_mm: data.hourly.precipitation[idx],
      weather_code: weatherCode,
      weather_desc: info.desc,
      weather_icon: info.icon,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Weerdata fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
