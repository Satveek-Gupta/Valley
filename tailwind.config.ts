import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          violet: "#7C3AED",
          "violet-dark": "#6322D6",
          "violet-light": "#9353FF",
          lime: "#C6F135",
          "lime-dark": "#A6D51D",
          orange: "#FF5A36",
          blue: "#2F6FED",
          ink: "#0A0A0A",
          surface: "#F4F4F5",
          "surface-dark": "#18181B",
          border: "#E4E4E7",
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "sans-serif"],
        displayAlt: ["var(--font-archivo-black)", "sans-serif"],
        sans: ["var(--font-archivo)", "sans-serif"],
      },
      letterSpacing: {
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
