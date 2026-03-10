/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C8973A',
          dark: '#E8C06A',
        },
      },
      fontFamily: {
        'lora': ['Lora_400Regular'],
        'lora-semibold': ['Lora_600SemiBold'],
        'poppins': ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
      },
    },
  },
  plugins: [],
};
