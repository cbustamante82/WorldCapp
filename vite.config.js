import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración base de Vite para el proyecto WorldCapp
// NOTA: NO usar basicSsl ni HTTPS — cambiaría el origen y vaciaría IndexedDB.
// El login desde IP de red requiere aceptar el contexto inseguro;
// el check de isSecureContext en LoginView/RegisterView muestra un error claro.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,   // escucha en 0.0.0.0 → accesible desde la red local
    open: true,
  },
})
