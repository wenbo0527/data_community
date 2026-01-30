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

  const indexRedirect = {
    name: 'index-redirect',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/index') {
          res.statusCode = 301
          res.setHeader('Location', '/')
          res.end()
          return
        }
        next()
      })
    }
  }

  const plugins = [vue(), indexRedirect]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { host: '0.0.0.0', port: 5181, strictPort: true },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
  }
})
