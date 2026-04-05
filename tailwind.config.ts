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
        background: "#1F1B18",
        surface: "#2A2420",
        "surface-elevated": "#352E28",
        primary: "#E6B98A",
        "primary-muted": "#D8A47F",
        accent: "#FFB86B",
        "text-primary": "#F5EDE6",
        "text-secondary": "#A89888",
        "text-muted": "#6B5D52",
        border: "#3D352E",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        cell: "12px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "zoom-in": "zoomIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
