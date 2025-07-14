import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 不清空dist目录，保留HTML和其他静态资源
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab/newtab.ts'),
        popup: resolve(__dirname, 'src/popup/popup.ts'),
        background: resolve(__dirname, 'src/background/background.ts')
      },
      output: {
        entryFileNames: '[name]/[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    sourcemap: true,
    target: 'es2020'
  },
  define: {
    // 定义全局变量，避免Chrome扩展API问题
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['octokit']
  }
}) 