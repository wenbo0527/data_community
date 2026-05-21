/**
 * 子应用共享构建配置
 * 提供统一的 Code Splitting 策略和性能优化
 */
import type { BuildOptions } from 'vite'

/**
 * 共享的构建配置
 */
export const sharedBuildConfig: BuildOptions = {
  outDir: 'dist',
  sourcemap: false,
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]',
      
      /**
       * Code Splitting 策略
       */
      manualChunks(id) {
        // Arco Design UI 库单独拆分
        if (id.includes('@arco-design')) {
          return 'arco-design'
        }
        
        // ECharts 单独拆分（如果使用）
        if (id.includes('echarts')) {
          return 'echarts'
        }
        
        // Vue 生态单独拆分
        if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
          return 'vue-vendor'
        }
        
        // 其他第三方库
        if (id.includes('node_modules')) {
          return 'vendor'
        }
      }
    }
  },
  
  // 压缩配置
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // 生产环境移除 console
      drop_debugger: true
    }
  },
  
  // chunk 大小警告
  chunkSizeWarningLimit: 500
}

/**
 * 生成特定于应用的构建配置
 * @param appName 应用名称
 * @param base 基础路径
 */
export function createBuildConfig(appName: string, base: string): BuildOptions {
  return {
    ...sharedBuildConfig,
    // 可以在这里覆盖特定配置
  }
}
