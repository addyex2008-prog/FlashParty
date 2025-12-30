import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (例如 .env 檔案或 Vercel 環境變數)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 為了相容你現有的 geminiService.ts 使用的 process.env.API_KEY
      // 在 Vercel Settings 中設定 API_KEY 環境變數即可
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})