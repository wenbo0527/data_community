import * as echarts from 'echarts'
import { nextTick } from 'vue'

export async function safeInitECharts(container: any, options: any = {}, maxRetries = 15, retryDelay = 50) {
  await nextTick()
  return new Promise<echarts.ECharts>((resolve, reject) => {
    let retryCount = 0
    const getContainer = () => container?.value || container
    const tryInit = async () => {
      let el: any = getContainer()
      if (!el) { reject(new Error('ECharts容器元素不存在')); return }
      if (typeof el === 'string') {
        const found = document.querySelector(el)
        el = found || el
      }
      if (el && el.$el) el = el.$el
      const hasRectFn = el && typeof el.getBoundingClientRect === 'function'
      if (!hasRectFn) { reject(new Error('ECharts容器类型错误')); return }
      await new Promise(res => requestAnimationFrame(res))
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
      const hasSize = rect.width > 0 && rect.height > 0
      if (hasSize && isVisible) {
        try {
          const defaultOptions = { renderer: 'canvas', width: options.width || rect.width, height: options.height || rect.height, locale: 'ZH' }
          const theme = (document.body.getAttribute('arco-theme') === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : undefined
          const chart = echarts.init(el, theme, { ...defaultOptions, ...options })
          chart.setOption({ color: ['#165DFF','#14C9C9','#F7BA1E','#F53F3F','#722ED1','#EB0AA4','#3491FA','#00D0B6','#FFAB00','#FB7299'], backgroundColor: 'transparent', textStyle: { fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif' }, animation: true, animationDuration: 300, animationEasing: 'cubicOut' }, false)
          resolve(chart)
        } catch (err) {
          reject(err as any)
        }
      } else {
        retryCount++
        if (retryCount <= maxRetries) setTimeout(tryInit, retryDelay)
        else reject(new Error(`ECharts初始化失败：容器问题，已重试${maxRetries}次`))
      }
    }
    tryInit()
  })
}

export function isContainerReady(container: HTMLElement) {
  if (!container) return false
  const rect = container.getBoundingClientRect()
  const style = window.getComputedStyle(container)
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
}

export function waitForContainer(container: HTMLElement, timeout = 5000) {
  return new Promise<boolean>((resolve) => {
    const start = Date.now()
    const check = () => {
      if (isContainerReady(container)) resolve(true)
      else if (Date.now() - start > timeout) resolve(false)
      else requestAnimationFrame(check)
    }
    check()
  })
}

export async function safeDisposeChart(chart: echarts.ECharts | null) {
  try { chart?.dispose() } catch {}
}
