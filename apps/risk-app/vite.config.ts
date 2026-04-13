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
      // 子应用名称，与主应用注册时一致
      name: 'risk-app',
      // 是否开启热更新
      hot: true,
    }),
    indexRedirect,
    viteMockServe({
      mockPath: path.resolve(__dirname, '../../src/mock/risk-scope'),
      enable: true,
    })
  ]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { 
      host: '0.0.0.0', 
      port: 5176, 
      strictPort: true,
      // Qiankun 需要关闭 strictPort 以便主应用访问
    },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    base: '/risk/'
  }
})
