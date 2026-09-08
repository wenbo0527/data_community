/**
 * 吸附功能配置文件
 * 
 * 统一管理所有吸附相关的配置、阈值和常量
 * 基于坐标系分析的最佳实践配置
 */

// ===== 1. 基础吸附配置 =====

/**
 * 吸附距离配置
 * 所有距离单位为像素(px)
 */
export const SNAP_DISTANCES = {
  // 节点移动吸附距离（逻辑坐标系）
  NODE_MOVE_SNAP: 80,
  
  // 拖拽点吸附距离（逻辑坐标系）
  DRAG_HINT_SNAP: 50,
  
  // 预览线端点吸附距离（逻辑坐标系）
  PREVIEW_LINE_SNAP: 80,
  
  // 高亮提示距离（对应坐标系）
  HIGHLIGHT_DISTANCE: 100,
  
  // 精确吸附距离（用于精确定位）
  PRECISE_SNAP: 30,
  
  // 连接线吸附距离
  CONNECTION_SNAP: 60
}

/**
 * 坐标系配置
 */
export const COORDINATE_SYSTEM_CONFIG = {
  // 坐标修正容差
  CORRECTION_TOLERANCE: 5,
  
  // 坐标验证缓存TTL（毫秒）
  VALIDATION_CACHE_TTL: 1000,
  
  // 坐标转换精度
  TRANSFORM_PRECISION: 2,
  
  // DOM坐标与逻辑坐标的最大允许偏差
  MAX_COORDINATE_DEVIATION: 10
}

// ===== 2. 性能优化配置 =====

/**
 * 性能优化相关配置
 */
export const PERFORMANCE_CONFIG = {
  // 批量处理配置
  BATCH_PROCESSING: {
    // 批量处理大小
    BATCH_SIZE: 50,
    
    // 批量处理间隔（毫秒）
    BATCH_INTERVAL: 16
  },
  
  // 缓存配置
  CACHE: {
    // 坐标验证缓存TTL
    COORDINATE_VALIDATION_TTL: 1000,
    
    // 节点位置缓存TTL
    NODE_POSITION_TTL: 500,
    
    // 吸附结果缓存TTL
    SNAP_RESULT_TTL: 200
  },
  
  // 防抖配置
  DEBOUNCE: {
    // 节点移动防抖延迟
    NODE_MOVE_DELAY: 16,
    
    // 吸附检测防抖延迟
    SNAP_DETECTION_DELAY: 8,
    
    // 高亮更新防抖延迟
    HIGHLIGHT_UPDATE_DELAY: 32
  },
  
  // 节流配置
  THROTTLE: {
    // 坐标验证节流间隔
    COORDINATE_VALIDATION_INTERVAL: 50,
    
    // 吸附计算节流间隔
    SNAP_CALCULATION_INTERVAL: 16
  }
}

// ===== 3. 视觉效果配置 =====

/**
 * 吸附视觉效果配置
 */
export const VISUAL_EFFECTS_CONFIG = {
  // 高亮样式
  HIGHLIGHT_STYLES: {
    // 节点高亮
    NODE_HIGHLIGHT: {
      stroke: '#52c41a',
      strokeWidth: 3,
      filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))',
      transition: 'all 0.2s ease-in-out'
    },
    
    // 拖拽点高亮
    DRAG_HINT_HIGHLIGHT: {
      stroke: '#ff4d4f',
      strokeWidth: 3,
      fill: 'rgba(255, 77, 79, 0.1)',
      scale: 1.2,
      transition: 'all 0.15s ease-in-out'
    },
    
    // 预览线高亮
    PREVIEW_LINE_HIGHLIGHT: {
      stroke: '#1890ff',
      strokeWidth: 3,
      strokeDasharray: '5,5',
      opacity: 0.8
    }
  },
  
  // 动画配置
  ANIMATIONS: {
    // 吸附动画持续时间
    SNAP_DURATION: 200,
    
    // 高亮动画持续时间
    HIGHLIGHT_DURATION: 150,
    
    // 连接动画持续时间
    CONNECTION_DURATION: 300,
    
    // 缓动函数
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // 颜色配置
  COLORS: {
    // 成功吸附颜色
    SUCCESS_SNAP: '#52c41a',
    
    // 警告吸附颜色
    WARNING_SNAP: '#fa8c16',
    
    // 错误吸附颜色
    ERROR_SNAP: '#ff4d4f',
    
    // 信息吸附颜色
    INFO_SNAP: '#1890ff',
    
    // 默认吸附颜色
    DEFAULT_SNAP: '#d9d9d9'
  }
}

// ===== 4. 调试配置 =====

/**
 * 调试和日志配置
 */
export const DEBUG_CONFIG = {
  // 是否启用调试模式
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  
  // 日志级别
  LOG_LEVEL: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
  },
  
  // 当前日志级别
  CURRENT_LOG_LEVEL: process.env.NODE_ENV === 'development' ? 3 : 1,
  
  // 调试可视化
  VISUAL_DEBUG: {
    // 是否显示坐标网格
    SHOW_COORDINATE_GRID: false,
    
    // 是否显示吸附范围
    SHOW_SNAP_RANGES: false,
    
    // 是否显示坐标修正信息
    SHOW_COORDINATE_CORRECTIONS: false,
    
    // 是否显示性能指标
    SHOW_PERFORMANCE_METRICS: false
  },
  
  // 性能监控
  PERFORMANCE_MONITORING: {
    // 是否启用性能监控
    ENABLED: process.env.NODE_ENV === 'development',
    
    // 监控采样率
    SAMPLE_RATE: 0.1,
    
    // 性能阈值（毫秒）
    THRESHOLDS: {
      COORDINATE_VALIDATION: 5,
      SNAP_DETECTION: 10,
      HIGHLIGHT_UPDATE: 3
    }
  }
}

// ===== 5. 特殊场景配置 =====

/**
 * 特殊场景的配置
 */
export const SPECIAL_SCENARIOS_CONFIG = {
  // 大量节点场景
  LARGE_GRAPH: {
    // 节点数量阈值
    NODE_COUNT_THRESHOLD: 100,
    
    // 优化策略
    OPTIMIZATION_STRATEGIES: {
      // 使用空间索引
      USE_SPATIAL_INDEX: true,
      
      // 限制吸附检测范围
      LIMIT_DETECTION_RANGE: true,
      
      // 使用LOD（细节层次）
      USE_LOD: true,
      
      // 批量处理大小调整
      BATCH_SIZE_MULTIPLIER: 2
    }
  },
  
  // 高缩放级别场景
  HIGH_ZOOM: {
    // 缩放级别阈值
    ZOOM_THRESHOLD: 2.0,
    
    // 吸附距离调整系数
    SNAP_DISTANCE_MULTIPLIER: 0.5,
    
    // 高亮效果调整
    HIGHLIGHT_SCALE_FACTOR: 0.8
  },
  
  // 低缩放级别场景
  LOW_ZOOM: {
    // 缩放级别阈值
    ZOOM_THRESHOLD: 0.5,
    
    // 吸附距离调整系数
    SNAP_DISTANCE_MULTIPLIER: 2.0,
    
    // 简化视觉效果
    SIMPLIFIED_VISUALS: true
  },
  
  // 移动设备场景
  MOBILE_DEVICE: {
    // 触摸吸附距离调整
    TOUCH_SNAP_MULTIPLIER: 1.5,
    
    // 减少动画效果
    REDUCED_ANIMATIONS: true,
    
    // 简化高亮效果
    SIMPLIFIED_HIGHLIGHTS: true
  }
}

// ===== 6. 配置验证和工具函数 =====

/**
 * 配置验证函数
 */
export function validateSnapConfig() {
  const errors = []
  
  // 验证吸附距离
  Object.entries(SNAP_DISTANCES).forEach(([key, value]) => {
    if (typeof value !== 'number' || value <= 0) {
      errors.push(`Invalid snap distance for ${key}: ${value}`)
    }
  })
  
  // 验证坐标系配置
  if (COORDINATE_SYSTEM_CONFIG.CORRECTION_TOLERANCE <= 0) {
    errors.push('Correction tolerance must be positive')
  }
  
  // 验证性能配置
  if (PERFORMANCE_CONFIG.BATCH_PROCESSING.BATCH_SIZE <= 0) {
    errors.push('Batch size must be positive')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 获取当前环境的配置
 */
export function getEnvironmentConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    // 开发环境启用更多调试功能
    debug: {
      ...DEBUG_CONFIG,
      ENABLE_DEBUG: isDevelopment,
      VISUAL_DEBUG: {
        ...DEBUG_CONFIG.VISUAL_DEBUG,
        SHOW_COORDINATE_GRID: isDevelopment,
        SHOW_SNAP_RANGES: isDevelopment
      }
    },
    
    // 生产环境优化性能
    performance: {
      ...PERFORMANCE_CONFIG,
      CACHE: {
        ...PERFORMANCE_CONFIG.CACHE,
        // 生产环境延长缓存时间
        COORDINATE_VALIDATION_TTL: isProduction ? 2000 : 1000,
        NODE_POSITION_TTL: isProduction ? 1000 : 500
      }
    },
    
    // 根据环境调整视觉效果
    visual: {
      ...VISUAL_EFFECTS_CONFIG,
      ANIMATIONS: {
        ...VISUAL_EFFECTS_CONFIG.ANIMATIONS,
        // 生产环境可能需要更快的动画
        SNAP_DURATION: isProduction ? 150 : 200,
        HIGHLIGHT_DURATION: isProduction ? 100 : 150
      }
    }
  }
}

/**
 * 动态调整配置
 */
export function adjustConfigForContext(context) {
  const { nodeCount, zoomLevel, deviceType, canvasSize } = context
  const adjustedConfig = { ...SNAP_DISTANCES }
  
  // 根据节点数量调整
  if (nodeCount > SPECIAL_SCENARIOS_CONFIG.LARGE_GRAPH.NODE_COUNT_THRESHOLD) {
    Object.keys(adjustedConfig).forEach(key => {
      adjustedConfig[key] *= 0.8 // 减少吸附距离以提高性能
    })
  }
  
  // 根据缩放级别调整
  if (zoomLevel > SPECIAL_SCENARIOS_CONFIG.HIGH_ZOOM.ZOOM_THRESHOLD) {
    Object.keys(adjustedConfig).forEach(key => {
      adjustedConfig[key] *= SPECIAL_SCENARIOS_CONFIG.HIGH_ZOOM.SNAP_DISTANCE_MULTIPLIER
    })
  } else if (zoomLevel < SPECIAL_SCENARIOS_CONFIG.LOW_ZOOM.ZOOM_THRESHOLD) {
    Object.keys(adjustedConfig).forEach(key => {
      adjustedConfig[key] *= SPECIAL_SCENARIOS_CONFIG.LOW_ZOOM.SNAP_DISTANCE_MULTIPLIER
    })
  }
  
  // 根据设备类型调整
  if (deviceType === 'mobile') {
    Object.keys(adjustedConfig).forEach(key => {
      adjustedConfig[key] *= SPECIAL_SCENARIOS_CONFIG.MOBILE_DEVICE.TOUCH_SNAP_MULTIPLIER
    })
  }
  
  return adjustedConfig
}

/**
 * 日志工具函数
 */
export function createLogger(module) {
  const logLevel = DEBUG_CONFIG.CURRENT_LOG_LEVEL
  
  return {
    error: (message, data) => {
      if (logLevel >= DEBUG_CONFIG.LOG_LEVEL.ERROR) {
        console.error(`[${module}] ${message}`, data)
      }
    },
    warn: (message, data) => {
      if (logLevel >= DEBUG_CONFIG.LOG_LEVEL.WARN) {
        console.warn(`[${module}] ${message}`, data)
      }
    },
    info: (message, data) => {
      if (logLevel >= DEBUG_CONFIG.LOG_LEVEL.INFO) {
        console.info(`[${module}] ${message}`, data)
      }
    },
    debug: (message, data) => {
      if (logLevel >= DEBUG_CONFIG.LOG_LEVEL.DEBUG) {
        console.log(`[${module}] ${message}`, data)
      }
    },
    trace: (message, data) => {
      if (logLevel >= DEBUG_CONFIG.LOG_LEVEL.TRACE) {
        console.trace(`[${module}] ${message}`, data)
      }
    }
  }
}

// ===== 7. 导出默认配置 =====

/**
 * 默认配置对象
 */
export const DEFAULT_SNAP_CONFIG = {
  distances: SNAP_DISTANCES,
  coordinateSystem: COORDINATE_SYSTEM_CONFIG,
  performance: PERFORMANCE_CONFIG,
  visual: VISUAL_EFFECTS_CONFIG,
  debug: DEBUG_CONFIG,
  specialScenarios: SPECIAL_SCENARIOS_CONFIG
}

/**
 * 配置管理器类
 */
export class SnapConfigManager {
  constructor(customConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_SNAP_CONFIG, customConfig)
    this.logger = createLogger('SnapConfigManager')
    
    // 验证配置
    const validation = validateSnapConfig()
    if (!validation.isValid) {
      this.logger.error('Configuration validation failed:', validation.errors)
    }
  }
  
  /**
   * 合并配置
   */
  mergeConfig(defaultConfig, customConfig) {
    return {
      ...defaultConfig,
      ...customConfig,
      distances: { ...defaultConfig.distances, ...customConfig.distances },
      coordinateSystem: { ...defaultConfig.coordinateSystem, ...customConfig.coordinateSystem },
      performance: { ...defaultConfig.performance, ...customConfig.performance },
      visual: { ...defaultConfig.visual, ...customConfig.visual },
      debug: { ...defaultConfig.debug, ...customConfig.debug }
    }
  }
  
  /**
   * 获取配置值
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config)
  }
  
  /**
   * 设置配置值
   */
  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.config)
    target[lastKey] = value
    
    this.logger.debug(`Configuration updated: ${path} = ${value}`)
  }
  
  /**
   * 获取环境特定配置
   */
  getEnvironmentConfig() {
    return getEnvironmentConfig()
  }
  
  /**
   * 根据上下文调整配置
   */
  adjustForContext(context) {
    const adjustedDistances = adjustConfigForContext(context)
    return {
      ...this.config,
      distances: adjustedDistances
    }
  }
}

// 创建默认配置管理器实例
export const snapConfigManager = new SnapConfigManager()