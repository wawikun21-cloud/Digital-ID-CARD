/** @type {import('tailwindcss').Config} */
import path from 'path';

export default {
  content: [path.join(__dirname, 'client/index.html'), path.join(__dirname, 'client/src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: {
        ink: '#2A0A12',
        'maroon-light': '#7A2136',
        paper: '#FBF9F6',
        cream: '#F3EDE3',
        gold: '#B08D57',
        line: '#E4DDD3',
        'ink-soft': '#6B5C58',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        card: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
