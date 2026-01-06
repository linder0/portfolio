import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js ecosystem into its own chunk for better caching
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // MediaPipe in its own chunk (loaded on-demand)
          'mediapipe': ['@mediapipe/tasks-vision'],
        },
      },
    },
  },
})
