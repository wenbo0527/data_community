import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(async () => {
  let logPlugin: any = null
  try {
    const mod = await import('../../vite-plugins/logServerPlugin.js')
    logPlugin = (mod as any)?.logServerPlugin?.()
  } catch {
    logPlugin = null
  }

  const plugins = [vue(), viteMockServe({
    mockPath: path.resolve(__dirname, 'src/mock'),
    enable: true
  })]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { host: '0.0.0.0', port: Number(process.env.DMT_PORT || process.env.PORT) || 5181, strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../../src/mock/shared')
      }
    },
    base: '/dmt/'
  }
})
