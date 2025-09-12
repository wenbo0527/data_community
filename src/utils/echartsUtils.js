/**
 * ECharts 安全初始化工具函数
 * 基于Arco Design规范，解决DOM尺寸为0时的初始化警告问题
 * 
 * 设计原则：
 * 1. 遵循Arco Design的组件生命周期
 * 2. 支持响应式设计和主题切换
 * 3. 提供完整的错误处理和日志记录
 * 4. 兼容Vue 3 Composition API
 */
import * as echarts from 'echarts'
import { nextTick } from 'vue'

/**
 * 安全初始化ECharts实例 - 基于Arco Design规范
 * @param {HTMLElement|Ref} container - 图表容器元素或Vue ref
 * @param {Object} options - 初始化选项
 * @param {string} options.theme - 主题名称，支持Arco Design主题
 * @param {string} options.renderer - 渲染器类型 'canvas' | 'svg'
 * @param {number} options.width - 强制指定宽度
 * @param {number} options.height - 强制指定高度
 * @param {number} maxRetries - 最大重试次数
 * @param {number} retryDelay - 重试延迟时间(ms)
 * @returns {Promise<echarts.ECharts>} ECharts实例
 */
export async function safeInitECharts(container, options = {}, maxRetries = 15, retryDelay = 50) {
  // 等待Vue的DOM更新
  await nextTick()
  
  return new Promise((resolve, reject) => {
    let retryCount = 0
    
    const getContainer = () => {
      // 支持Vue ref
      return container?.value || container
    }
    
    const tryInit = async () => {
      const containerEl = getContainer()
      
      if (!containerEl) {
        reject(new Error('ECharts容器元素不存在'))
        return
      }
      
      // 等待DOM完全渲染
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      // 检查容器尺寸和可见性
      const rect = containerEl.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(containerEl)
      const isVisible = computedStyle.display !== 'none' && 
                       computedStyle.visibility !== 'hidden' &&
                       computedStyle.opacity !== '0'
      
      const hasValidSize = rect.width > 0 && rect.height > 0
      
      if (hasValidSize && isVisible) {
        try {
          // 基于Arco Design的默认配置
          const defaultOptions = {
            renderer: 'canvas',
            width: options.width || rect.width,
            height: options.height || rect.height,
            locale: 'ZH'
          }
          
          // 支持Arco Design主题
          const theme = options.theme || getArcoTheme()
          
          const chart = echarts.init(containerEl, theme, {
            ...defaultOptions,
            ...options
          })
          
          // 设置默认的Arco Design样式
          setArcoChartDefaults(chart)
          
          console.log(`✅ ECharts初始化成功，容器尺寸: ${rect.width}x${rect.height}，主题: ${theme}`)
          resolve(chart)
        } catch (error) {
          console.error('❌ ECharts初始化失败:', error)
          reject(error)
        }
      } else {
        retryCount++
        if (retryCount <= maxRetries) {
          const reason = !hasValidSize ? `尺寸为0 (${rect.width}x${rect.height})` : '容器不可见'
          console.warn(`⚠️ ECharts容器${reason}，第${retryCount}次重试`)
          setTimeout(tryInit, retryDelay)
        } else {
          const errorMsg = `ECharts初始化失败：容器问题，已重试${maxRetries}次`
          console.error(`❌ ${errorMsg}`)
          reject(new Error(errorMsg))
        }
      }
    }
    
    tryInit()
  })
}

/**
 * 获取当前Arco Design主题
 * @returns {string} 主题名称
 */
function getArcoTheme() {
  // 检查是否为暗色主题
  const isDark = document.body.getAttribute('arco-theme') === 'dark' ||
                 document.documentElement.getAttribute('data-theme') === 'dark' ||
                 window.matchMedia('(prefers-color-scheme: dark)').matches
  
  return isDark ? 'dark' : undefined
}

/**
 * 设置Arco Design默认样式
 * @param {echarts.ECharts} chart - 图表实例
 */
function setArcoChartDefaults(chart) {
  // 设置默认的Arco Design颜色主题
  const arcoColors = [
    '#165DFF', '#14C9C9', '#F7BA1E', '#F53F3F', '#722ED1',
    '#EB0AA4', '#3491FA', '#00D0B6', '#FFAB00', '#FB7299'
  ]
  
  // 应用默认配置
  chart.setOption({
    color: arcoColors,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif'
    },
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut'
  }, false)
}

/**
 * 检查容器是否准备就绪
 * @param {HTMLElement} container - 容器元素
 * @returns {boolean} 是否准备就绪
 */
export function isContainerReady(container) {
  if (!container) return false
  
  const rect = container.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(container)
  
  return (
    rect.width > 0 && 
    rect.height > 0 && 
    computedStyle.display !== 'none' && 
    computedStyle.visibility !== 'hidden'
  )
}

/**
 * 等待容器准备就绪
 * @param {HTMLElement} container - 容器元素
 * @param {number} timeout - 超时时间(ms)
 * @returns {Promise<boolean>} 是否准备就绪
 */
export function waitForContainer(container, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    const check = () => {
      if (isContainerReady(container)) {
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        resolve(false)
      } else {
        requestAnimationFrame(check)
      }
    }
    
    check()
  })
}

/**
 * 批量初始化多个ECharts实例
 * @param {Array} configs - 配置数组，每个配置包含 {container, options, name}
 * @returns {Promise<Object>} 返回包含所有图表实例的对象
 */
export async function batchInitECharts(configs) {
  const results = {}
  const promises = configs.map(async (config) => {
    try {
      const chart = await safeInitECharts(config.container, config.options)
      results[config.name] = chart
      console.log(`${config.name} 图表初始化成功`)
    } catch (error) {
      console.error(`${config.name} 图表初始化失败:`, error)
      results[config.name] = null
    }
  })
  
  await Promise.allSettled(promises)
  return results
}

/**
 * 安全销毁ECharts实例
 * @param {echarts.ECharts} chart - 图表实例
 * @param {string} name - 图表名称（用于日志）
 */
export function safeDisposeChart(chart, name = '图表') {
  if (chart && !chart.isDisposed()) {
    try {
      chart.dispose()
      console.log(`${name} 实例已销毁`)
    } catch (error) {
      console.error(`${name} 销毁失败:`, error)
    }
  }
}

/**
 * 图表容器尺寸变化监听器
 * @param {HTMLElement} container - 容器元素
 * @param {echarts.ECharts} chart - 图表实例
 * @param {Function} callback - 尺寸变化回调函数
 * @returns {ResizeObserver} 返回ResizeObserver实例，用于清理
 */
export function createChartResizeObserver(container, chart, callback) {
  if (!window.ResizeObserver) {
    console.warn('浏览器不支持ResizeObserver，使用window.resize事件')
    
    const handleResize = () => {
      if (chart && !chart.isDisposed()) {
        chart.resize()
        if (callback) callback()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return {
      disconnect: () => window.removeEventListener('resize', handleResize)
    }
  }
  
  // 🔧 修复：添加防抖处理和循环检测，避免ResizeObserver循环错误
  let resizeTimer = null
  let isResizing = false
  let resizeCount = 0
  let lastResizeTime = 0
  
  const resizeObserver = new ResizeObserver((entries) => {
    try {
      const now = Date.now()
      
      // 防止过于频繁的调用
      if (now - lastResizeTime < 16) {
        return
      }
      
      // 检测循环调用
      if (isResizing) {
        resizeCount++
        if (resizeCount > 10) {
          console.warn('🔄 ResizeObserver 循环调用检测，暂停处理')
          return
        }
      } else {
        resizeCount = 0
      }
      
      isResizing = true
      lastResizeTime = now
      
      // 清除之前的定时器
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      
      // 使用防抖处理，避免频繁触发
      resizeTimer = setTimeout(() => {
        try {
          if (chart && !chart.isDisposed()) {
            chart.resize()
            if (callback) callback()
          }
        } catch (error) {
          console.error('Chart resize error:', error)
        } finally {
          isResizing = false
          resizeCount = 0
        }
      }, 32) // 增加防抖时间到32ms
    } catch (error) {
      console.error('ResizeObserver error:', error)
      isResizing = false
    }
  })
  
  resizeObserver.observe(container)
  
  // 返回增强的observer，包含清理定时器和状态的功能
  return {
    ...resizeObserver,
    disconnect: () => {
      try {
        if (resizeTimer) {
          clearTimeout(resizeTimer)
          resizeTimer = null
        }
        // 重置状态变量
        isResizing = false
        resizeCount = 0
        lastResizeTime = 0
        
        resizeObserver.disconnect()
        console.log('📊 ResizeObserver 已清理')
      } catch (error) {
        console.error('ResizeObserver disconnect error:', error)
      }
    }
  }
}

/**
 * Vue 3 组合式函数 - ECharts集成
 * 基于Arco Design规范的ECharts使用方案
 * @param {Object} options - 配置选项
 * @returns {Object} 返回图表相关的响应式数据和方法
 */
export function useECharts(options = {}) {
  const { ref, onMounted, onUnmounted, watch } = require('vue')
  
  const chartRef = ref(null)
  const chartInstance = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  /**
   * 初始化图表
   * @param {Object} chartOptions - ECharts配置选项
   */
  const initChart = async (chartOptions = {}) => {
    if (!chartRef.value) {
      error.value = '图表容器未找到'
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      // 如果已存在实例，先销毁
      if (chartInstance.value) {
        safeDisposeChart(chartInstance.value)
      }
      
      // 安全初始化
      chartInstance.value = await safeInitECharts(chartRef.value, options)
      
      // 设置图表配置
      if (chartOptions && Object.keys(chartOptions).length > 0) {
        chartInstance.value.setOption(chartOptions, true)
      }
      
      // 创建尺寸监听器
      const resizeObserver = createChartResizeObserver(
        chartRef.value, 
        chartInstance.value,
        () => console.log('📊 图表尺寸已调整')
      )
      
      // 保存监听器引用以便清理
      chartInstance.value._resizeObserver = resizeObserver
      
    } catch (err) {
      error.value = err.message
      console.error('❌ 图表初始化失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新图表配置
   * @param {Object} newOptions - 新的配置选项
   * @param {boolean} notMerge - 是否不合并配置
   */
  const updateChart = (newOptions, notMerge = false) => {
    if (chartInstance.value && !chartInstance.value.isDisposed()) {
      chartInstance.value.setOption(newOptions, notMerge)
    }
  }
  
  /**
   * 显示加载状态
   * @param {Object} loadingOptions - 加载配置
   */
  const showLoading = (loadingOptions = {}) => {
    if (chartInstance.value && !chartInstance.value.isDisposed()) {
      chartInstance.value.showLoading('default', {
        text: '加载中...',
        color: '#165DFF',
        textColor: '#86909C',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0,
        ...loadingOptions
      })
    }
  }
  
  /**
   * 隐藏加载状态
   */
  const hideLoading = () => {
    if (chartInstance.value && !chartInstance.value.isDisposed()) {
      chartInstance.value.hideLoading()
    }
  }
  
  /**
   * 清理资源
   */
  const cleanup = () => {
    if (chartInstance.value) {
      // 清理尺寸监听器
      if (chartInstance.value._resizeObserver) {
        chartInstance.value._resizeObserver.disconnect()
      }
      
      // 销毁图表实例
      safeDisposeChart(chartInstance.value, '组合式函数图表')
      chartInstance.value = null
    }
  }
  
  // 组件卸载时清理资源
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    chartRef,
    chartInstance,
    loading,
    error,
    initChart,
    updateChart,
    showLoading,
    hideLoading,
    cleanup
  }
}