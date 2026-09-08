/**
 * 图表渲染工具类
 * 提供统一的图表渲染接口和配置
 */

class ChartRenderer {
  constructor() {
    this.charts = new Map()
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          enabled: true
        }
      }
    }
  }

  /**
   * 渲染饼图
   * @param {HTMLElement} container - 容器元素
   * @param {Array} data - 数据数组
   * @param {Object} options - 配置选项
   */
  renderPieChart(container, data, options = {}) {
    if (!container) {
      console.error('Chart container not found')
      return null
    }

    const chartConfig = {
      type: 'pie',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: this.generateColors(data.length),
          borderWidth: 1
        }]
      },
      options: {
        ...this.defaultOptions,
        ...options
      }
    }

    return this.createChart(container, chartConfig)
  }

  /**
   * 渲染柱状图
   * @param {HTMLElement} container - 容器元素
   * @param {Array} data - 数据数组
   * @param {Object} options - 配置选项
   */
  renderBarChart(container, data, options = {}) {
    if (!container) {
      console.error('Chart container not found')
      return null
    }

    const chartConfig = {
      type: 'bar',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          label: options.label || '数量',
          data: data.map(item => item.value),
          backgroundColor: this.generateColors(data.length, 0.6),
          borderColor: this.generateColors(data.length),
          borderWidth: 1
        }]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        ...options
      }
    }

    return this.createChart(container, chartConfig)
  }

  /**
   * 渲染折线图
   * @param {HTMLElement} container - 容器元素
   * @param {Array} data - 数据数组
   * @param {Object} options - 配置选项
   */
  renderLineChart(container, data, options = {}) {
    if (!container) {
      console.error('Chart container not found')
      return null
    }

    const chartConfig = {
      type: 'line',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          label: options.label || '趋势',
          data: data.map(item => item.value),
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        ...options
      }
    }

    return this.createChart(container, chartConfig)
  }

  /**
   * 渲染环形图
   * @param {HTMLElement} container - 容器元素
   * @param {Array} data - 数据数组
   * @param {Object} options - 配置选项
   */
  renderDoughnutChart(container, data, options = {}) {
    if (!container) {
      console.error('Chart container not found')
      return null
    }

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: this.generateColors(data.length),
          borderWidth: 2,
          cutout: '60%'
        }]
      },
      options: {
        ...this.defaultOptions,
        ...options
      }
    }

    return this.createChart(container, chartConfig)
  }

  /**
   * 创建图表实例
   * @param {HTMLElement} container - 容器元素
   * @param {Object} config - 图表配置
   */
  createChart(container, config) {
    try {
      // 如果容器已有图表，先销毁
      const existingChart = this.charts.get(container)
      if (existingChart) {
        existingChart.destroy()
      }

      // 创建canvas元素
      let canvas = container.querySelector('canvas')
      if (!canvas) {
        canvas = document.createElement('canvas')
        container.appendChild(canvas)
      }

      // 模拟Chart.js创建图表
      const chart = {
        canvas,
        config,
        data: config.data,
        options: config.options,
        update: () => {
          console.log('Chart updated')
        },
        destroy: () => {
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas)
          }
          this.charts.delete(container)
        },
        resize: () => {
          console.log('Chart resized')
        }
      }

      // 存储图表实例
      this.charts.set(container, chart)

      // 渲染图表到canvas
      this.renderToCanvas(canvas, config)

      return chart
    } catch (error) {
      console.error('Failed to create chart:', error)
      return null
    }
  }

  /**
   * 渲染图表到canvas
   * @param {HTMLCanvasElement} canvas - canvas元素
   * @param {Object} config - 图表配置
   */
  renderToCanvas(canvas, config) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸
    canvas.width = canvas.offsetWidth || 400
    canvas.height = canvas.offsetHeight || 300

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 简单的图表渲染示例
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#1890ff'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${config.type.toUpperCase()} Chart`, canvas.width / 2, canvas.height / 2)

    // 绘制数据点（简化版）
    if (config.data && config.data.datasets && config.data.datasets[0]) {
      const dataset = config.data.datasets[0]
      const data = dataset.data || []
      
      ctx.fillStyle = '#52c41a'
      ctx.font = '12px Arial'
      
      data.forEach((value, index) => {
        const x = (canvas.width / (data.length + 1)) * (index + 1)
        const y = canvas.height - 50
        
        ctx.fillRect(x - 10, y - value * 2, 20, value * 2)
        ctx.fillStyle = '#000'
        ctx.fillText(value.toString(), x, y + 20)
        ctx.fillStyle = '#52c41a'
      })
    }
  }

  /**
   * 生成颜色数组
   * @param {number} count - 颜色数量
   * @param {number} alpha - 透明度
   */
  generateColors(count, alpha = 1) {
    const colors = [
      `rgba(24, 144, 255, ${alpha})`,   // 蓝色
      `rgba(82, 196, 26, ${alpha})`,    // 绿色
      `rgba(250, 140, 22, ${alpha})`,   // 橙色
      `rgba(245, 34, 45, ${alpha})`,    // 红色
      `rgba(114, 46, 209, ${alpha})`,   // 紫色
      `rgba(19, 194, 194, ${alpha})`,   // 青色
      `rgba(255, 197, 61, ${alpha})`,   // 黄色
      `rgba(135, 208, 104, ${alpha})`,  // 浅绿色
    ]

    const result = []
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length])
    }
    return result
  }

  /**
   * 销毁所有图表
   */
  destroyAll() {
    this.charts.forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    this.charts.clear()
  }

  /**
   * 销毁指定容器的图表
   * @param {HTMLElement} container - 容器元素
   */
  destroyChart(container) {
    const chart = this.charts.get(container)
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy()
    }
  }

  /**
   * 更新图表数据
   * @param {HTMLElement} container - 容器元素
   * @param {Object} newData - 新数据
   */
  updateChart(container, newData) {
    const chart = this.charts.get(container)
    if (chart) {
      chart.data = newData
      if (typeof chart.update === 'function') {
        chart.update()
      }
      // 重新渲染
      this.renderToCanvas(chart.canvas, { ...chart.config, data: newData })
    }
  }

  /**
   * 获取图表实例
   * @param {HTMLElement} container - 容器元素
   */
  getChart(container) {
    return this.charts.get(container)
  }
}

// 创建单例实例
const chartRenderer = new ChartRenderer()

export default chartRenderer