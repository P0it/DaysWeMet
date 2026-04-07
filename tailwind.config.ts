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
        background: "#FAFAFE",
        surface: "#FFFFFF",
        primary: "#7C6CF0",
        "primary-light": "#A99BF5",
        "primary-pale": "#EEEAFD",
        "primary-dark": "#5B4EC9",
        accent: "#FF6B8A",
        "accent-light": "#FF9EB2",
        "text-primary": "#1A1A2E",
        "text-secondary": "#6E6E80",
        "text-muted": "#B0B0C0",
        border: "#EBEBF0",
      },
      borderRadius: {
        card: "20px",
        button: "14px",
        cell: "16px",
        pill: "50px",
      },
      fontFamily: {
        sans: ['"Inter"', '"Nanum Gothic"', "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        heartbeat: "heartbeat 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.15)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.1)" },
          "60%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
