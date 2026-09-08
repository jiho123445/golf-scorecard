import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Firebase SDK가 번들 대부분을 차지하므로 별도 청크로 분리해
        // 앱 코드만 바뀌었을 때 사용자가 Firebase 청크를 다시 받지 않도록 한다.
        manualChunks(id: string) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase'
          }
        },
      },
    },
  },
})
