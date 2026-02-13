/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3e2723", // Leather
          foreground: "#f4e4bc", // Parchment
        },
        secondary: {
          DEFAULT: "#f4e4bc", // Parchment
          foreground: "#3e2723", // Leather
        },
        accent: {
          DEFAULT: "#d4af37", // Gold
          foreground: "#3e2723",
        },
        destructive: {
          DEFAULT: "#800000", // Crimson
          foreground: "#f4e4bc",
        },
        muted: {
          DEFAULT: "#a1887f",
          foreground: "#3e2723",
        },
        popover: {
          DEFAULT: "#f4e4bc",
          foreground: "#3e2723",
        },
        card: {
          DEFAULT: "#f4e4bc",
          foreground: "#3e2723",
        },
        rpg: {
          parchment: "#f4e4bc",
          leather: "#3e2723",
          gold: "#d4af37",
          crimson: "#800000",
          ink: "#2c2c2c",
        },
      },
      boxShadow: {
        soft: "0 10px 15px -3px rgba(62, 39, 35, 0.1), 0 4px 6px -2px rgba(62, 39, 35, 0.1)",
        glow: "0 0 15px -2px rgba(212, 175, 55, 0.6)", // Gold glow
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        rpg: ["Cinzel", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
