import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        tide: "#2563EB",
        sand: "#F1F5F9",
        coral: "#EF4444",
        sky: "#DBEAFE"
      },
      boxShadow: {
        glow: "0 20px 40px rgba(37, 99, 235, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
