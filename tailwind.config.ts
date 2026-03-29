import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        matthi: {
          DEFAULT: "#1a6b3c",
          light: "#e8f5ee",
          dark: "#145a30",
        },
        rob: {
          DEFAULT: "#c0392b",
          light: "#fce8e6",
          dark: "#a93226",
        },
        sand: {
          DEFAULT: "#f7f5f0",
          dark: "#ece8df",
        },
        navy: "#1a2744",
        "dark-green": "#0f1f15",
        fairway: "#2d8a56",
        accent: {
          DEFAULT: "#e8855a",
          light: "#fef3ee",
          dark: "#d4724a",
        },
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
