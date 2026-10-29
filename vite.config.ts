import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/store-floor-planner/', // served from https://hansentim.github.io/store-floor-planner/
  plugins: [react()],
})
