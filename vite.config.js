import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  base: '/interactive-map-visualization-demo-/',
  build: {
    outDir: 'docs'
  },
  plugins: [vue()]
})
