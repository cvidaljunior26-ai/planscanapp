import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./app/**/*.{ts,tsx}","./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        primary: { DEFAULT: "#3B1F6E", md: "#5B3A9E", lt: "#EDE9FF", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#2ECC9A", lt: "#E0FBF3", foreground: "#0F9970" },
        background: "#F2F0FF",
        card: { DEFAULT: "#FFFFFF", foreground: "#1A1040" },
        border: "#E4E0F8",
        muted: { DEFAULT: "#F1F0F8", foreground: "#7968A0" },
        destructive: { DEFAULT: "#EF4444", foreground: "#FFFFFF" },
        warn: { DEFAULT: "#F59E0B", lt: "#FEF3C7" },
        sub: "#7968A0",
        textMain: "#1A1040",
      },
      borderRadius: { lg: "16px", md: "12px", sm: "8px" },
      fontFamily: { sans: ["Nunito", "sans-serif"] },
      boxShadow: { card: "0 4px 20px rgba(59,31,110,0.10)", "card-lg": "0 8px 40px rgba(59,31,110,0.14)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: { "accordion-down": "accordion-down 0.2s ease-out", "accordion-up": "accordion-up 0.2s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
