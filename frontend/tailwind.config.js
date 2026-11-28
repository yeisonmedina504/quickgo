/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ESTO ACTIVA EL MODO OSCURO MANUAL
  theme: {
    extend: {
      colors: {
        // Colores exactos de tu Design System QuickGo
        asfalto: {
          DEFAULT: '#12171F',
          2: '#232C38',
        },
        papel: '#F6F5F1',
        ambar: {
          DEFAULT: '#F5A800',
          claro: '#FFF1CC',
          hover: '#E09A00',
        },
        ruta: '#166B40',
        alerta: '#B93228',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Archivo', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}