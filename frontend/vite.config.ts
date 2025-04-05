import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      buffer: 'buffer/',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util/',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
    },
    dedupe: ['eventemitter3', 'viem'],
    mainFields: ['browser', 'module', 'main'],
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto',
      defaultIsModuleExports: true,
    },
    rollupOptions: {
      plugins: [],
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    cors: true,
    hmr: {
      overlay: true,
    },
    fs: {
      allow: [
        '..',
      ],
      strict: false
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '01a6-111-235-226-130.ngrok-free.app',
      '.ngrok-free.app',
    ],
  },
  preview: {
    host: true,
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'styled-components',
      'eventemitter3',
      'viem',
      'buffer',
      'process',
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        bigint: true 
      },
      define: {
        global: 'globalThis',
      },
      resolveExtensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
    'process.version': '"v16.0.0"',
  },
})