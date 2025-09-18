/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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
