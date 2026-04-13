import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'path'
import qiankun from 'vite-plugin-qiankun'

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

  const plugins = [
    vue(), 
    qiankun({
      name: 'mkt-app',
      hot: true,
    }),
    indexRedirect,
    viteMockServe({
      mockPath: path.resolve(__dirname, '../../src/mock/mkt-scope'),
      enable: false,
    })
  ]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { 
      host: '0.0.0.0', 
      port: 5177, 
      strictPort: true,
    },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    base: '/mkt/'
  }
})
