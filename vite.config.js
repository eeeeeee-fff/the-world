import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  base: '/the-world/',
  build: {
    outDir: 'docs'
  },
  plugins: [vue()]
})
