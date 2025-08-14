/**
 * 吸附配置管理
 * 提供吸附距离、坐标系统配置和动态配置调整功能
 */

// ===== 吸附距离配置 =====
export const SNAP_DISTANCES = {
  NODE_MOVE_SNAP: 20,      // 节点移动吸附距离
  DRAG_HINT_SNAP: 30,      // 拖拽提示吸附距离
  PREVIEW_LINE_SNAP: 15,   // 预览线吸附距离
  GRID_SNAP: 10            // 网格吸附距离
}

// ===== 坐标系统配置 =====
export const COORDINATE_SYSTEM_CONFIG = {
  precision: 1,             // 坐标精度（小数位数）
  maxCoordinate: 999999,    // 最大坐标值
  minCoordinate: -999999,   // 最小坐标值
  transformTolerance: 5,    // 坐标转换容差
  cacheEnabled: true,       // 是否启用缓存
  cacheTTL: 5000           // 缓存生存时间（毫秒）
}

// ===== 配置管理器 =====
export class SnapConfigManager {
  constructor(customConfig = {}) {
    this.config = {
      distances: { ...SNAP_DISTANCES },
      coordinateSystem: { ...COORDINATE_SYSTEM_CONFIG },
      ...customConfig
    }
  }

  get(path) {
    const keys = path.split('.')
    let value = this.config
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }
    
    return value
  }

  set(path, value) {
    const keys = path.split('.')
    let current = this.config
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  merge(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      distances: {
        ...this.config.distances,
        ...(newConfig.distances || {})
      },
      coordinateSystem: {
        ...this.config.coordinateSystem,
        ...(newConfig.coordinateSystem || {})
      }
    }
  }
}

// ===== 配置验证 =====
export function validateSnapConfig(config = {}) {
  const errors = []
  const mergedConfig = {
    distances: { ...SNAP_DISTANCES },
    coordinateSystem: { ...COORDINATE_SYSTEM_CONFIG },
    ...config
  }

  // 验证距离配置
  const distances = mergedConfig.distances
  if (distances) {
    Object.entries(distances).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        errors.push(`Invalid distance value for ${key}: ${value}`)
      }
    })
  }

  // 验证坐标系统配置
  const coordSystem = mergedConfig.coordinateSystem
  if (coordSystem) {
    if (typeof coordSystem.precision !== 'number' || coordSystem.precision < 0) {
      errors.push(`Invalid precision: ${coordSystem.precision}`)
    }
    
    if (typeof coordSystem.maxCoordinate !== 'number') {
      errors.push(`Invalid maxCoordinate: ${coordSystem.maxCoordinate}`)
    }
    
    if (typeof coordSystem.minCoordinate !== 'number') {
      errors.push(`Invalid minCoordinate: ${coordSystem.minCoordinate}`)
    }
    
    if (coordSystem.maxCoordinate <= coordSystem.minCoordinate) {
      errors.push('maxCoordinate must be greater than minCoordinate')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: mergedConfig
  }
}

// ===== 动态配置调整 =====
export function adjustConfigForContext(context) {
  const {
    nodeCount = 0,
    zoomLevel = 1,
    deviceType = 'desktop',
    canvasSize = { width: 1920, height: 1080 }
  } = context

  let adjustedConfig = { ...SNAP_DISTANCES }

  // 根据节点数量调整
  if (nodeCount > 100) {
    // 大量节点时减少吸附距离以提高性能
    adjustedConfig.NODE_MOVE_SNAP *= 0.7
    adjustedConfig.DRAG_HINT_SNAP *= 0.7
  }

  // 根据缩放级别调整
  if (zoomLevel > 2) {
    // 高缩放级别时进一步减少吸附距离
    adjustedConfig.NODE_MOVE_SNAP *= 0.6
    adjustedConfig.DRAG_HINT_SNAP *= 0.6
  } else if (zoomLevel < 0.5) {
    // 低缩放级别时增加吸附距离
    adjustedConfig.NODE_MOVE_SNAP *= 1.5
    adjustedConfig.DRAG_HINT_SNAP *= 1.5
  }

  // 根据设备类型调整
  if (deviceType === 'mobile') {
    // 移动设备增加吸附距离以便于触摸操作
    adjustedConfig.NODE_MOVE_SNAP *= 1.3
    adjustedConfig.DRAG_HINT_SNAP *= 1.3
  }

  // 根据画布大小调整
  const canvasArea = canvasSize.width * canvasSize.height
  if (canvasArea > 2000000) { // 大画布
    adjustedConfig.NODE_MOVE_SNAP *= 1.2
    adjustedConfig.DRAG_HINT_SNAP *= 1.2
  }

  // 确保调整后的值在合理范围内
  Object.keys(adjustedConfig).forEach(key => {
    adjustedConfig[key] = Math.max(5, Math.min(50, adjustedConfig[key]))
  })

  return adjustedConfig
}

// ===== 预设配置 =====
export const PRESET_CONFIGS = {
  // 高精度配置
  HIGH_PRECISION: {
    distances: {
      NODE_MOVE_SNAP: 10,
      DRAG_HINT_SNAP: 15,
      PREVIEW_LINE_SNAP: 8,
      GRID_SNAP: 5
    },
    coordinateSystem: {
      precision: 2,
      transformTolerance: 2
    }
  },
  
  // 性能优化配置
  PERFORMANCE: {
    distances: {
      NODE_MOVE_SNAP: 30,
      DRAG_HINT_SNAP: 40,
      PREVIEW_LINE_SNAP: 25,
      GRID_SNAP: 20
    },
    coordinateSystem: {
      precision: 0,
      transformTolerance: 10,
      cacheEnabled: true,
      cacheTTL: 10000
    }
  },
  
  // 移动设备配置
  MOBILE: {
    distances: {
      NODE_MOVE_SNAP: 35,
      DRAG_HINT_SNAP: 45,
      PREVIEW_LINE_SNAP: 30,
      GRID_SNAP: 25
    }
  }
}

// ===== 默认导出 =====
export default {
  SNAP_DISTANCES,
  COORDINATE_SYSTEM_CONFIG,
  SnapConfigManager,
  validateSnapConfig,
  adjustConfigForContext,
  PRESET_CONFIGS
}