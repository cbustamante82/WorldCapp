/** @type {import('tailwindcss').Config} */
// Tokens de diseño del álbum: paleta "papel Panini" + acentos Mundial 2026.
// Convención: clases utilitarias; los colores se exponen también como variables CSS en index.css.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base "papel" del álbum
        paper: '#f4f0e6',
        'paper-deep': '#e9e3d2',
        ink: '#171513',
        'ink-soft': '#4a443c',
        // Verde cancha (sección/marca)
        pitch: {
          DEFAULT: '#0e7a43',
          dark: '#0a5c32',
          light: '#16a35a',
        },
        // Acentos multicolor Mundial 2026
        accent: {
          pink: '#e6007e',
          blue: '#1f6feb',
          gold: '#f2b705',
          red: '#d62828',
        },
        // Hueco de lámina vacío
        slot: '#dcd5c4',
        'slot-line': '#bdb39c',
      },
      fontFamily: {
        // Tipografía display condensada tipo póster deportivo + cuerpo grotesco legible
        display: ['Anton', 'Impact', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // Sombra de lámina pegada (relieve de cromo)
        sticker: '0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 14px -6px rgba(0,0,0,0.45)',
        // Hundido del hueco vacío
        slot: 'inset 0 2px 6px rgba(0,0,0,0.18)',
      },
      backgroundImage: {
        'paper-grain':
          "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.025) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.025) 0, transparent 40%)",
      },
    },
  },
  plugins: [],
}
