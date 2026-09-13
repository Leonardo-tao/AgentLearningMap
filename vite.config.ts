import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { apiMiddleware } from './server/api.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'progress-api',
      configureServer(server) {
        server.middlewares.use('/api', (req, res, next) => apiMiddleware(req, res, next))
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  base: './',
})
