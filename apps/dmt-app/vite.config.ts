import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(async () => {
  let logPlugin: any = null
  try {
    const mod = await import('../../vite-plugins/logServerPlugin.js')
    logPlugin = (mod as any)?.logServerPlugin?.()
  } catch {
    logPlugin = null
  }

  const plugins = [vue()]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { host: '0.0.0.0', port: 5181, strictPort: true },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    base: '/dmt/'
  }
})