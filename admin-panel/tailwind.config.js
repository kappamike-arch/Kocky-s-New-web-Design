/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          primary: '#2563eb',
          secondary: '#64748b',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
}
