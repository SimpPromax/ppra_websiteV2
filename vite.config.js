import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // or true - allows network access
    port: 5173,       // your desired port
    strictPort: false, // optional: set to true to exit if port is in use
  }
})