import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  
  /**
   * Only set the base path for production builds. During development, we want to use the root path for easier local testing.
   * This allows us to serve the app correctly both in development and when deployed to GitHub Pages.
   */
  base: command === 'build' ? '/Garden-of-Liberation/' : '/',
  plugins: [react()],
  
  // Three.js 최적화
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber', 
      '@react-three/drei',
      '@react-three/postprocessing',
      'postprocessing',
      'gsap',
      'draco3d'
    ],
    exclude: ['three-stdlib']
  },
  
  // 3D 모델 파일들을 에셋으로 인식
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.wasm'],
  
  // 개발 서버 설정
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: ['..']  // 상위 폴더 접근 허용 (모델 파일용)
    }
  },
  
  // 빌드 최적화
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          postprocessing: ['@react-three/postprocessing', 'postprocessing'],
          animation: ['gsap']
        }
      }
    },
    // 큰 3D 모델 파일 경고 해제
    chunkSizeWarningLimit: 2000
  },

  // 개발 중 소스맵 최적화
  esbuild: {
    target: 'esnext'
  }

}))