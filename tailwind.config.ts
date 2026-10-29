import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        canvas: "#ECEFF5",
        ink: { DEFAULT: "#1B1F3B", soft: "#4A5072", muted: "#8A90AD", faint: "#B9BED3" },
        brand: { 50: "#F1EFFE", 100: "#E4E0FD", 200: "#C9C1FB", 300: "#A99CF6", 400: "#8B7BF0", 500: "#6C5CE7", 600: "#5847D1", 700: "#4636AE", 800: "#352985", 900: "#241C5C" },
        coral: "#FF7A6B",
        mint: "#2EC4A0",
        sun: "#FFB547",
      },
      boxShadow: {
        neu: "9px 9px 22px rgba(163,172,199,0.55), -9px -9px 22px rgba(255,255,255,0.95)",
        "neu-sm": "5px 5px 12px rgba(163,172,199,0.5), -5px -5px 12px rgba(255,255,255,0.95)",
        "neu-inset": "inset 5px 5px 12px rgba(163,172,199,0.5), inset -5px -5px 12px rgba(255,255,255,0.95)",
        "neu-inset-sm": "inset 3px 3px 7px rgba(163,172,199,0.45), inset -3px -3px 7px rgba(255,255,255,0.9)",
        glass: "0 8px 32px rgba(76,70,140,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
        glow: "0 10px 30px -6px rgba(108,92,231,0.55)",
      },
      borderRadius: { "4xl": "2rem" },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { float: "float 9s ease-in-out infinite", shimmer: "shimmer 1.6s infinite" },
    },
  },
  plugins: [],
};
export default config;
