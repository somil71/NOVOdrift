import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0D0D0D",
        "bg-card": "#1A1A1A",
        "bg-surface": "#2C2C2C",
        "accent-gold": "#E8C068",
        "accent-blue": "#4F8EF7",
        "text-primary": "#FFFFFF",
        "text-muted": "#999999",
        border: "#333333",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
