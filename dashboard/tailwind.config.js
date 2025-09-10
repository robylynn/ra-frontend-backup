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
        "r2-black": "#1E2128",
        "r2-red-300": "#FF6C6C",
        "r2-gray-300": "#D9D9D9",
        "r2-yellow-500": "#FFEE52",
        "r2-purple-500": "#7b32a8",
        "r2-dark-background-300": "#434751",
        "r2-dark-background-400": "#333944",
        "r2-dark-background-500": "#262A37",
        "r2-dark-modal-subtext": "oklch(87.2% 0.01 258.338)",
        "r2-dark-modal-header": "oklch(96.7% 0.003 264.542)"
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideOut: { // NEW KEYFRAME for sliding out
          '0%': { opacity: '1', transform: 'translateY(0) translateX(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px) translateX(100%)' }, // Slide right and fade out
        },
        jiggle: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
      },
      animation: {
        'loading_spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards', // 'fade-in' is the utility class name
        'slide-out': 'slideOut 0.3s ease-in forwards', // NEW ANIMATION for sliding out
        'jiggle': 'jiggle 0.5s ease-in-out forwards',
      }
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
