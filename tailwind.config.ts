import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0D0D11",
          light: "#1A1A22",
          dark: "#070709",
          muted: "#71717A",
        },
        paper: "#F8F8F5",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#EAD485",
          dark: "#A68008",
          soft: "#FDF8EA",
          metallic: "#C59B27",
        },
        teal: {
          DEFAULT: "#D4AF37", // mapped to Royal Gold for consistent theme
          dark: "#AA820A",   // deep antique gold
          soft: "#FDF7E7",   // champagne soft
        },
        amber: {
          DEFAULT: "#C59B27",
          soft: "#FFF9EA",
        },
        alert: { DEFAULT: "#E11D48", soft: "#FFE4E6" },
        ok: { DEFAULT: "#16A34A", soft: "#DCFCE7" },
      },
      fontFamily: { sans: ['"Schibsted Grotesk"', '"Plus Jakarta Sans"', "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
