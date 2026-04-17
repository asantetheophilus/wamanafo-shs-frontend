import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Colours ───────────────────────────────────────
      colors: {
        // Primary: deep teal
        teal: {
          50:  "#f0fafa",
          100: "#cceff0",
          200: "#99dfe2",
          300: "#5dc5ca",
          400: "#2fa5ac",
          500: "#1a8891",
          600: "#156e76",
          700: "#105862",  // primary mid
          800: "#0d4a53",
          900: "#0a3a42",
          950: "#0D5E6E",  // primary brand
        },
        // Accent: warm gold
        gold: {
          50:  "#fdf9ec",
          100: "#f9efca",
          200: "#f3de90",
          300: "#edcb55",
          400: "#e8bb2f",
          500: "#d4a017",
          600: "#B8860B",  // accent brand
          700: "#966909",
          800: "#7c5208",
          900: "#68430a",
          950: "#3d2504",
        },
        // Semantic: use standard Tailwind slate for neutrals
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "Consolas", "monospace"],
      },

      // ── Score / Status Badge ────────────────────────────────
      // Custom border-radius values used by score entry grid
      borderRadius: {
        DEFAULT: "0.5rem",
        sm:      "0.375rem",
        md:      "0.5rem",
        lg:      "0.75rem",
        xl:      "1rem",
        "2xl":   "1.5rem",
      },

      // ── Shadows ─────────────────────────────────────────────
      boxShadow: {
        card:   "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
      },

      // ── Animation ───────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)"   },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1"   },
          "50%":       { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in":       "fade-in 150ms ease-out",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
