import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Liquid UI custom component classes used dynamically
    "card", "card-flat", "page-shell", "page-header", "page-title", "page-subtitle",
    "btn", "btn-primary", "btn-secondary", "btn-danger", "btn-gold", "btn-sm", "btn-lg", "btn-icon",
    "input", "input-error", "label", "field-error", "select",
    "badge", "badge-draft", "badge-submitted", "badge-approved", "badge-amendment",
    "badge-published", "badge-active", "badge-inactive", "badge-danger",
    "data-table", "table-wrap",
    "alert", "alert-error", "alert-success", "alert-warning", "alert-info",
    "sidebar", "sidebar-brand", "sidebar-nav-item",
    "stat-card", "stat-icon", "section-title",
    "empty-state", "empty-state-icon", "empty-state-title", "empty-state-body",
    "skeleton", "pw-rule", "pw-rule.met", "pw-rule.unmet",
    "glass", "glass-dark", "bg-school-gradient", "bg-gold-gradient",
    "scrollbar-hide", "text-balance",
    // Dynamic bg/text colours from JS
    { pattern: /^(bg|text|border)-(teal|amber|emerald|red|blue|slate|purple|yellow)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  "#f0fafa",
          100: "#cceff0",
          200: "#99dfe2",
          300: "#5dc5ca",
          400: "#2fa5ac",
          500: "#1a8891",
          600: "#156e76",
          700: "#105862",
          800: "#0d4a53",
          900: "#0a3a42",
          950: "#0D5E6E",
        },
        gold: {
          50:  "#fdf9ec",
          100: "#f9efca",
          200: "#f3de90",
          300: "#edcb55",
          400: "#e8bb2f",
          500: "#d4a017",
          600: "#B8860B",
          700: "#966909",
          800: "#7c5208",
          900: "#68430a",
          950: "#3d2504",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm:      "0.375rem",
        md:      "0.5rem",
        lg:      "0.75rem",
        xl:      "1rem",
        "2xl":   "1.5rem",
      },
      boxShadow: {
        card:      "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 4px 12px 0 rgb(0 0 0 / 0.05)",
        "card-md": "0 4px 16px 0 rgb(0 0 0 / 0.08), 0 1px 4px 0 rgb(0 0 0 / 0.04)",
        "card-lg": "0 8px 32px 0 rgb(0 0 0 / 0.10), 0 2px 8px 0 rgb(0 0 0 / 0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1"   },
          "50%":      { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in":        "fade-in 150ms ease-out",
        "slide-up":       "slide-up 200ms ease-out",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
