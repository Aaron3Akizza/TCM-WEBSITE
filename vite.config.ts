import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base must be '/' for Vercel (root deployment).
  // GitHub Pages sub-path base '/TYM-WEBSITE/' was the root cause of the 404.
  base: '/',
})
