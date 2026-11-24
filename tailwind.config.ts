import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wint: "#39BDAA", teal: { DEFAULT: "#176B68", deep: "#124C4A" },
        mint: { DEFAULT: "#DDF5EF", pale: "#EFF9F6" }, sky: "#EAF3F8",
        charcoal: "#252D32", ink: "#17252A", muted: "#68757A", soft: "#F4F6F7", line: "#E1E7E8",
        ok: "#239B70", warn: "#E6A23C", bad: "#D94F4F",
      },
      fontFamily: {
        head: ["'Manrope Variable'", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(23,37,42,.04), 0 4px 16px rgba(23,37,42,.05)", pop: "0 12px 40px rgba(23,37,42,.14)" },
      borderRadius: { xl2: "18px" },
    },
  },
  plugins: [],
} satisfies Config;
