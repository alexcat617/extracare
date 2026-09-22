import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages project site: https://alexcat617.github.io/extracare/ */
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/extracare/' : '/',
  plugins: [react(), tailwindcss()],
}))
