import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b1e",
        tide: "#0f766e",
        sand: "#f7f1e8",
        coral: "#ef7a5d",
        sky: "#dff2f3"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(15, 118, 110, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

