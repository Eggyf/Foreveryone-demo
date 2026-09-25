import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El puerto se fija de forma explicita. Si queda libre, Vite lo pasaria a otro
// (5174, 5175...) y el CORS del backend dejaria de permitir el origen del
// frontend. Se mantiene strictPort para que un conflicto avise en lugar de
// arrancar en otro puerto sin avisar.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
