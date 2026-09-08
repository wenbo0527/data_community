/**
 * 预览线样式管理器
 * 统一管理所有预览线的颜色、样式和配置
 */
export class PreviewLineStyleManager {
  constructor() {
    // 默认样式配置
    this.defaultStyles = {
      // 预览线基础样式
      preview: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        strokeOpacity: 0.8,
        targetMarker: {
          name: 'classic',
          size: 8,
          fill: '#1890ff',
          stroke: '#1890ff'
        }
      },
      // 分支预览线样式
      branchPreview: {
        stroke: '#52c41a',
        strokeWidth: 2,
        strokeDasharray: '3,3',
        strokeOpacity: 0.7,
        targetMarker: {
          name: 'classic',
          size: 6,
          fill: '#52c41a',
          stroke: '#52c41a'
        }
      },
      // 高亮预览线样式（拖拽时）
      highlight: {
        stroke: '#ff4d4f',
        strokeWidth: 3,
        strokeDasharray: '8,4',
        strokeOpacity: 1,
        targetMarker: {
          name: 'classic',
          size: 10,
          fill: '#ff4d4f',
          stroke: '#ff4d4f'
        }
      },
      // 吸附预览线样式
      snap: {
        stroke: '#faad14',
        strokeWidth: 3,
        strokeDasharray: '10,5',
        strokeOpacity: 0.9,
        targetMarker: {
          name: 'classic',
          size: 9,
          fill: '#faad14',
          stroke: '#faad14'
        }
      }
    }
    
    // 当前激活的样式主题
    this.currentTheme = 'default'
    
    // 样式主题配置
    this.themes = {
      default: JSON.parse(JSON.stringify(this.defaultStyles)),
      dark: this.createDarkTheme(),
      colorful: this.createColorfulTheme(),
      minimal: this.createMinimalTheme()
    }
    
    // 样式变更监听器
    this.listeners = new Set()
  }
  
  /**
   * 创建深色主题样式
   */
  createDarkTheme() {
    return {
      preview: {
        stroke: '#177ddc',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        strokeOpacity: 0.9,
        targetMarker: {
          name: 'classic',
          size: 8,
          fill: '#177ddc',
          stroke: '#177ddc'
        }
      },
      branchPreview: {
        stroke: '#389e0d',
        strokeWidth: 2,
        strokeDasharray: '3,3',
        strokeOpacity: 0.8,
        targetMarker: {
          name: 'classic',
          size: 6,
          fill: '#389e0d',
          stroke: '#389e0d'
        }
      },
      highlight: {
        stroke: '#cf1322',
        strokeWidth: 3,
        strokeDasharray: '8,4',
        strokeOpacity: 1,
        targetMarker: {
          name: 'classic',
          size: 10,
          fill: '#cf1322',
          stroke: '#cf1322'
        }
      },
      snap: {
        stroke: '#d48806',
        strokeWidth: 3,
        strokeDasharray: '10,5',
        strokeOpacity: 0.9,
        targetMarker: {
          name: 'classic',
          size: 9,
          fill: '#d48806',
          stroke: '#d48806'
        }
      }
    }
  }
  
  /**
   * 创建彩色主题样式
   */
  createColorfulTheme() {
    return {
      preview: {
        stroke: '#722ed1',
        strokeWidth: 2,
        strokeDasharray: '6,4',
        strokeOpacity: 0.8,
        targetMarker: {
          name: 'classic',
          size: 8,
          fill: '#722ed1',
          stroke: '#722ed1'
        }
      },
      branchPreview: {
        stroke: '#13c2c2',
        strokeWidth: 2,
        strokeDasharray: '4,2',
        strokeOpacity: 0.7,
        targetMarker: {
          name: 'classic',
          size: 6,
          fill: '#13c2c2',
          stroke: '#13c2c2'
        }
      },
      highlight: {
        stroke: '#eb2f96',
        strokeWidth: 3,
        strokeDasharray: '12,6',
        strokeOpacity: 1,
        targetMarker: {
          name: 'classic',
          size: 10,
          fill: '#eb2f96',
          stroke: '#eb2f96'
        }
      },
      snap: {
        stroke: '#fa8c16',
        strokeWidth: 3,
        strokeDasharray: '8,3',
        strokeOpacity: 0.9,
        targetMarker: {
          name: 'classic',
          size: 9,
          fill: '#fa8c16',
          stroke: '#fa8c16'
        }
      }
    }
  }
  
  /**
   * 创建简约主题样式
   */
  createMinimalTheme() {
    return {
      preview: {
        stroke: '#8c8c8c',
        strokeWidth: 1,
        strokeDasharray: '4,4',
        strokeOpacity: 0.6,
        targetMarker: {
          name: 'classic',
          size: 6,
          fill: '#8c8c8c',
          stroke: '#8c8c8c'
        }
      },
      branchPreview: {
        stroke: '#bfbfbf',
        strokeWidth: 1,
        strokeDasharray: '2,2',
        strokeOpacity: 0.5,
        targetMarker: {
          name: 'classic',
          size: 4,
          fill: '#bfbfbf',
          stroke: '#bfbfbf'
        }
      },
      highlight: {
        stroke: '#595959',
        strokeWidth: 2,
        strokeDasharray: '6,3',
        strokeOpacity: 0.8,
        targetMarker: {
          name: 'classic',
          size: 8,
          fill: '#595959',
          stroke: '#595959'
        }
      },
      snap: {
        stroke: '#434343',
        strokeWidth: 2,
        strokeDasharray: '8,4',
        strokeOpacity: 0.7,
        targetMarker: {
          name: 'classic',
          size: 7,
          fill: '#434343',
          stroke: '#434343'
        }
      }
    }
  }
  
  /**
   * 获取指定类型的预览线样式
   * @param {string} type - 样式类型 (preview, branchPreview, highlight, snap)
   * @param {string} theme - 主题名称，默认使用当前主题
   * @returns {Object} 样式配置对象
   */
  getStyle(type = 'preview', theme = null) {
    const currentTheme = theme || this.currentTheme
    const themeStyles = this.themes[currentTheme] || this.themes.default
    
    if (!themeStyles[type]) {
      console.warn(`[PreviewLineStyleManager] 未找到样式类型: ${type}，使用默认预览线样式`)
      return themeStyles.preview || this.defaultStyles.preview
    }
    
    return { ...themeStyles[type] }
  }
  
  /**
   * 设置当前主题
   * @param {string} theme - 主题名称
   */
  setTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`[PreviewLineStyleManager] 未找到主题: ${theme}，保持当前主题`)
      return false
    }
    
    const oldTheme = this.currentTheme
    this.currentTheme = theme
    
    console.log(`[PreviewLineStyleManager] 主题已切换: ${oldTheme} -> ${theme}`)
    
    // 通知所有监听器主题已变更
    this.notifyListeners('theme-changed', { oldTheme, newTheme: theme })
    
    return true
  }
  
  /**
   * 获取当前主题名称
   */
  getCurrentTheme() {
    return this.currentTheme
  }
  
  /**
   * 获取所有可用主题
   */
  getAvailableThemes() {
    return Object.keys(this.themes)
  }
  
  /**
   * 自定义样式配置
   * @param {string} type - 样式类型
   * @param {Object} styleConfig - 样式配置
   * @param {string} theme - 目标主题，默认为当前主题
   */
  setCustomStyle(type, styleConfig, theme = null) {
    const targetTheme = theme || this.currentTheme
    
    if (!this.themes[targetTheme]) {
      console.warn(`[PreviewLineStyleManager] 主题不存在: ${targetTheme}`)
      return false
    }
    
    // 合并样式配置
    this.themes[targetTheme][type] = {
      ...this.themes[targetTheme][type],
      ...styleConfig
    }
    
    console.log(`[PreviewLineStyleManager] 自定义样式已设置:`, {
      theme: targetTheme,
      type,
      config: styleConfig
    })
    
    // 通知监听器样式已更新
    this.notifyListeners('style-updated', { theme: targetTheme, type, config: styleConfig })
    
    return true
  }
  
  /**
   * 重置主题为默认样式
   * @param {string} theme - 要重置的主题名称
   */
  resetTheme(theme = null) {
    const targetTheme = theme || this.currentTheme
    
    if (targetTheme === 'default') {
      // 深拷贝默认样式以确保完全重置
      this.themes.default = JSON.parse(JSON.stringify(this.defaultStyles))
    } else if (targetTheme === 'dark') {
      this.themes.dark = this.createDarkTheme()
    } else if (targetTheme === 'colorful') {
      this.themes.colorful = this.createColorfulTheme()
    } else if (targetTheme === 'minimal') {
      this.themes.minimal = this.createMinimalTheme()
    }
    
    console.log(`[PreviewLineStyleManager] 主题已重置: ${targetTheme}`)
    
    // 通知监听器主题已重置
    this.notifyListeners('theme-reset', { theme: targetTheme })
    
    return true
  }
  
  /**
   * 添加样式变更监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener)
      return true
    }
    return false
  }
  
  /**
   * 移除样式变更监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    return this.listeners.delete(listener)
  }
  
  /**
   * 通知所有监听器
   * @param {string} event - 事件类型
   * @param {Object} data - 事件数据
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('[PreviewLineStyleManager] 监听器执行失败:', error)
      }
    })
  }
  
  /**
   * 应用样式到边对象
   * @param {Object} edge - X6边对象
   * @param {string} type - 样式类型
   * @param {string} theme - 主题名称
   */
  applyStyleToEdge(edge, type = 'preview', theme = null) {
    if (!edge || typeof edge.setAttrs !== 'function') {
      console.warn('[PreviewLineStyleManager] 无效的边对象')
      return false
    }
    
    const style = this.getStyle(type, theme)
    
    try {
      // 应用线条样式
      edge.setAttrs({
        line: {
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          strokeDasharray: style.strokeDasharray,
          strokeOpacity: style.strokeOpacity
        }
      })
      
      // 应用箭头样式
      if (style.targetMarker) {
        edge.setAttrs({
          line: {
            targetMarker: {
              name: style.targetMarker.name,
              size: style.targetMarker.size,
              fill: style.targetMarker.fill,
              stroke: style.targetMarker.stroke
            }
          }
        })
      }
      
      console.log(`[PreviewLineStyleManager] 样式已应用到边:`, {
        edgeId: edge.id,
        type,
        theme: theme || this.currentTheme
      })
      
      return true
    } catch (error) {
      console.error('[PreviewLineStyleManager] 应用样式失败:', error)
      return false
    }
  }
  
  /**
   * 应用样式（applyStyleToEdge的别名，保持向后兼容）
   * @param {Object} edge - X6边对象
   * @param {string} type - 样式类型
   * @param {string} theme - 主题名称
   */
  applyStyle(edge, type = 'preview', theme = null) {
    return this.applyStyleToEdge(edge, type, theme)
  }
  
  /**
   * 获取样式的CSS类名
   * @param {string} type - 样式类型
   * @param {string} theme - 主题名称
   */
  getStyleClassName(type = 'preview', theme = null) {
    const currentTheme = theme || this.currentTheme
    return `preview-line-${currentTheme}-${type}`
  }
  
  /**
   * 获取样式配置（getStyle的别名，保持向后兼容）
   * @param {string} theme - 主题名称，默认使用当前主题
   * @returns {Object} 主题的完整样式配置对象
   */
  getStyleConfig(theme = null) {
    const currentTheme = theme || this.currentTheme
    const themeStyles = this.themes[currentTheme] || this.themes.default
    return { ...themeStyles }
  }

  /**
   * 更新自定义样式配置
   * @param {Object} styleConfig - 样式配置对象
   */
  updateCustomStyle(styleConfig) {
    // 创建或更新custom主题
    if (!this.themes.custom) {
      this.themes.custom = { ...this.themes.default }
    }
    
    // 更新preview样式
    this.themes.custom.preview = {
      ...this.themes.custom.preview,
      stroke: styleConfig.stroke,
      strokeWidth: styleConfig.strokeWidth,
      strokeDasharray: styleConfig.strokeDasharray,
      strokeOpacity: styleConfig.opacity,
      targetMarker: {
        ...this.themes.custom.preview.targetMarker,
        fill: styleConfig.targetMarker?.fill || styleConfig.stroke,
        stroke: styleConfig.targetMarker?.stroke || styleConfig.stroke
      }
    }
    
    console.log('[PreviewLineStyleManager] 自定义样式已更新:', styleConfig)
    
    // 通知监听器样式已更新
    this.notifyListeners('custom-style-updated', styleConfig)
    
    return true
  }

  /**
   * 重置为默认样式
   */
  resetToDefault() {
    this.currentTheme = 'default'
    // 重置所有主题为初始状态
    this.themes = {
      default: { ...this.defaultStyles },
      dark: this.createDarkTheme(),
      colorful: this.createColorfulTheme(),
      minimal: this.createMinimalTheme()
    }
    
    console.log('[PreviewLineStyleManager] 已重置为默认样式')
    
    // 通知监听器已重置
    this.notifyListeners('reset-to-default', { theme: 'default' })
    
    return true
  }

  /**
   * 导出当前配置
   */
  exportConfig() {
    return {
      currentTheme: this.currentTheme,
      themes: JSON.parse(JSON.stringify(this.themes))
    }
  }
  
  /**
   * 导入配置
   * @param {Object} config - 配置对象
   */
  importConfig(config) {
    try {
      if (config.currentTheme && this.themes[config.currentTheme]) {
        this.currentTheme = config.currentTheme
      }
      
      if (config.themes) {
        // 合并主题配置
        Object.keys(config.themes).forEach(themeName => {
          if (this.themes[themeName]) {
            this.themes[themeName] = {
              ...this.themes[themeName],
              ...config.themes[themeName]
            }
          }
        })
      }
      
      console.log('[PreviewLineStyleManager] 配置导入成功')
      
      // 通知监听器配置已导入
      this.notifyListeners('config-imported', config)
      
      return true
    } catch (error) {
      console.error('[PreviewLineStyleManager] 配置导入失败:', error)
      return false
    }
  }
}

// 创建全局单例实例
export const previewLineStyleManager = new PreviewLineStyleManager()

// 默认导出
export default previewLineStyleManager