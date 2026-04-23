/**
 * ECharts 工具函数
 */

/**
 * 安全初始化 ECharts 实例
 */
export function safeInitECharts(
  container: HTMLElement,
  options?: echarts.EChartsOption
): echarts.ECharts | null {
  if (!container) {
    console.warn('[ECharts] Container is null')
    return null
  }
  
  try {
    const chart = echarts.init(container)
    if (options) {
      chart.setOption(options)
    }
    return chart
  } catch (error) {
    console.error('[ECharts] Failed to init:', error)
    return null
  }
}

/**
 * 安全销毁 ECharts 实例
 */
export function safeDisposeChart(chart: echarts.ECharts | null): void {
  if (chart) {
    try {
      chart.dispose()
    } catch (error) {
      console.error('[ECharts] Failed to dispose:', error)
    }
  }
}

/**
 * 安全更新 ECharts 配置
 */
export function safeSetOption(
  chart: echarts.ECharts | null,
  options: echarts.EChartsOption
): void {
  if (chart) {
    try {
      chart.setOption(options, { notMerge: true })
    } catch (error) {
      console.error('[ECharts] Failed to set option:', error)
    }
  }
}

export default { safeInitECharts, safeDisposeChart, safeSetOption }
