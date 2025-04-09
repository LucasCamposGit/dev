// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}', // If using Pages Router
      './components/**/*.{js,ts,jsx,tsx,mdx}', // If using separate components folder
      './app/**/*.{js,ts,jsx,tsx,mdx}', // Include App Router directory
    ],
    theme: {
      extend: {
         colors: {
             // Define custom colors based on the original CSS if needed
             'twitter-blue': '#1d9bf0',
             'note-bg': '#15202b',
             'note-card-bg': '#192734',
             'note-card-hover': '#22303f',
             'note-border': '#38444d',
             'note-text-dim': '#8899a6',
         },
        // You can extend other theme properties like spacing, fonts, etc.
      },
    },
    plugins: [],
  };
  