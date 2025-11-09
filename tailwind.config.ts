import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: 'rgb(10, 10, 15)',
          secondary: 'rgb(17, 17, 24)',
          tertiary: 'rgb(23, 23, 31)',
          hover: 'rgb(29, 29, 39)',
          active: 'rgb(35, 35, 47)',
        },
        // Surface colors
        surface: {
          DEFAULT: 'rgb(23, 23, 31)',
          hover: 'rgb(29, 29, 39)',
          active: 'rgb(35, 35, 47)',
        },
        // Border colors
        border: {
          DEFAULT: 'rgb(42, 42, 53)',
          hover: 'rgb(58, 58, 72)',
          focus: 'rgb(91, 91, 214)',
        },
        // Text colors
        text: {
          primary: 'rgb(230, 230, 239)',
          secondary: 'rgb(153, 153, 168)',
          tertiary: 'rgb(107, 107, 122)',
          inverse: 'rgb(10, 10, 15)',
        },
        // Brand colors
        brand: {
          50: '#f4f4ff',
          100: '#e8e8ff',
          200: '#d4d4ff',
          300: '#b3b3ff',
          400: '#8686ff',
          500: '#5b5bd6',
          600: '#4747b8',
          700: '#36369a',
          800: '#27277a',
          900: '#1c1c5c',
        },
        // Accent colors
        accent: {
          50: '#e6fcff',
          100: '#ccf9ff',
          200: '#99f3ff',
          300: '#66ebff',
          400: '#33e3ff',
          500: '#00d9ff',
          600: '#00b8d9',
          700: '#0097b3',
          800: '#00768c',
          900: '#005566',
        },
        // Success colors
        success: {
          50: '#e6fff5',
          100: '#ccffeb',
          200: '#99ffd6',
          300: '#66ffc2',
          400: '#33ffad',
          500: '#00e699',
          600: '#00bf80',
          700: '#009966',
          800: '#00734d',
          900: '#004d33',
        },
        // Warning colors
        warning: {
          50: '#fffbeb',
          100: '#fff5cc',
          200: '#ffeb99',
          300: '#ffe066',
          400: '#ffd633',
          500: '#ffcc00',
          600: '#d9ad00',
          700: '#b38f00',
          800: '#8c7000',
          900: '#665200',
        },
        // Error colors
        error: {
          50: '#ffebee',
          100: '#ffccd4',
          200: '#ff99a9',
          300: '#ff667e',
          400: '#ff3353',
          500: '#ff0033',
          600: '#d9002b',
          700: '#b30024',
          800: '#8c001c',
          900: '#660014',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
        glow: '0 0 20px rgb(91 91 214 / 0.3)',
        'glow-accent': '0 0 20px rgb(0 217 255 / 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
