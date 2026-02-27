import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        // hash-base/readable-stream 등 CJS 패키지가 require('buffer'), require('stream') 시
        // 실제 폴리필 모듈을 받을 수 있도록 명시적으로 포함
        include: ['buffer', 'stream', 'events', 'util', 'string_decoder'],
        protocolImports: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // 최신 Dart Sass API: includePaths → loadPaths
          loadPaths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'src/styles'),
          ],
          // @import → @use 마이그레이션 전까지 deprecation 경고 억제
          silenceDeprecations: ['import'],
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        mode === 'production' ? 'production' : 'development'
      ),
    },
    build: {
      outDir: 'build',
      sourcemap: mode === 'development',
    },
    optimizeDeps: {
      // 자체 readable-stream을 번들한 CJS 패키지를 Vite가 사전 번들링하도록 강제
      // → Buffer 폴리필 주입 전에 실행되는 문제 해결
      include: ['hash-base', 'md5.js', 'create-hash', 'create-hmac', 'ripemd160'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      port: 9020,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  }
})
