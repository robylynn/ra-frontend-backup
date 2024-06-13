/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  // purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/reusable_components/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/reusable_components/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.{jsx,svg,tsx,html}",
    "./src/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "light-background-image":
          "url('/backgrounds/light_background_image.png')",
        "dark-background-image":
          "url('/backgrounds/dark_background_image.jpeg')",
        "dark-background-gradient":
          "bg-zinc-200 bg-gradient-to-br from-slate-700/50 to-purple-900/50",
      },
      colors: {
        "light-box-background": "#A0AEC842",
        "r2-dark-text-color": "#A7B0C2",
        "r2-green-300": "#BCE1B9",
        "r2-green-500": "#64DB62",
        "r2-white": "#ECECEC",
        "r2-red-300": "#FF6C6C",
        "r2-gray-300": "#D9D9D9",
        "r2-yellow-500": "#FFEE52",
        "r2-purple-500": "#7b32a8",
        "r2-dark-background-300": "#434751",
        "r2-dark-background-400": "#333944",
        "r2-dark-background-500": "#262A37",
      },
    },
    fontSize: {
      xs: ["10px", "14px"],
      sm: ["14px", "20px"],
      base: ["16px", "24px"],
      lg: ["20px", "28px"],
      xl: ["24px", "32px"],
    },
  },
  plugins: [],
};
