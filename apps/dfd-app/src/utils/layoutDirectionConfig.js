/**
 * 布局方向配置管理器
 * 统一管理不同布局方向的配置和切换
 */

import { VERTICAL_LAYOUT_CONFIG } from './verticalLayoutConfig.js'
import { HORIZONTAL_LAYOUT_CONFIG } from './horizontalLayoutConfig.js'

/**
 * 布局方向枚举
 * 🔧 清理：专注于垂直和水平布局，移除不完整的布局类型
 */
export const LAYOUT_DIRECTIONS = {
  VERTICAL: 'vertical',     // 从上到下（主要布局方向）
  HORIZONTAL: 'horizontal'  // 从左到右（备用布局方向）
  // 🔧 已移除：径向布局和网格布局暂不支持
}

/**
 * 布局方向配置映射
 * 🔧 清理：移除不完整的径向布局和网格布局，专注垂直布局
 */
export const LAYOUT_DIRECTION_CONFIGS = {
  [LAYOUT_DIRECTIONS.VERTICAL]: VERTICAL_LAYOUT_CONFIG,
  [LAYOUT_DIRECTIONS.HORIZONTAL]: HORIZONTAL_LAYOUT_CONFIG
  // 🔧 已移除：径向布局和网格布局的不完整实现
  // 这些布局方向暂时不支持，避免引起混淆和错误
}

/**
 * 默认布局方向
 */
export const DEFAULT_LAYOUT_DIRECTION = LAYOUT_DIRECTIONS.VERTICAL

/**
 * 布局方向管理器
 */
export class LayoutDirectionManager {
  constructor(initialDirection = DEFAULT_LAYOUT_DIRECTION) {
    this.currentDirection = initialDirection
    this.listeners = new Set()
  }

  /**
   * 获取当前布局方向
   * @returns {string} 当前布局方向
   */
  getCurrentDirection() {
    return this.currentDirection
  }

  /**
   * 设置布局方向
   * @param {string} direction - 新的布局方向
   * @returns {boolean} 是否设置成功
   */
  setDirection(direction) {
    if (!LAYOUT_DIRECTION_CONFIGS[direction]) {
      console.warn(`[LayoutDirectionManager] 不支持的布局方向: ${direction}`)
      return false
    }

    const oldDirection = this.currentDirection
    this.currentDirection = direction

    console.log(`[LayoutDirectionManager] 布局方向已切换: ${oldDirection} -> ${direction}`)

    // 通知监听器
    this.notifyListeners(direction, oldDirection)
    
    return true
  }

  /**
   * 获取当前布局配置
   * @returns {Object} 当前布局配置
   */
  getCurrentConfig() {
    return LAYOUT_DIRECTION_CONFIGS[this.currentDirection]
  }

  /**
   * 获取指定方向的布局配置
   * @param {string} direction - 布局方向
   * @returns {Object|null} 布局配置
   */
  getConfig(direction) {
    return LAYOUT_DIRECTION_CONFIGS[direction] || null
  }

  /**
   * 获取所有支持的布局方向
   * @returns {Array} 支持的布局方向列表
   */
  getSupportedDirections() {
    return Object.keys(LAYOUT_DIRECTION_CONFIGS)
  }

  /**
   * 检查是否支持指定的布局方向
   * @param {string} direction - 布局方向
   * @returns {boolean} 是否支持
   */
  isDirectionSupported(direction) {
    return !!LAYOUT_DIRECTION_CONFIGS[direction]
  }

  /**
   * 添加方向变化监听器
   * @param {Function} listener - 监听器函数
   */
  addDirectionChangeListener(listener) {
    this.listeners.add(listener)
  }

  /**
   * 移除方向变化监听器
   * @param {Function} listener - 监听器函数
   */
  removeDirectionChangeListener(listener) {
    this.listeners.delete(listener)
  }

  /**
   * 通知所有监听器
   * @param {string} newDirection - 新方向
   * @param {string} oldDirection - 旧方向
   */
  notifyListeners(newDirection, oldDirection) {
    this.listeners.forEach(listener => {
      try {
        listener(newDirection, oldDirection)
      } catch (error) {
        console.error('[LayoutDirectionManager] 监听器执行错误:', error)
      }
    })
  }

  /**
   * 切换到下一个布局方向
   * @returns {string} 新的布局方向
   */
  switchToNext() {
    const directions = this.getSupportedDirections()
    const currentIndex = directions.indexOf(this.currentDirection)
    const nextIndex = (currentIndex + 1) % directions.length
    const nextDirection = directions[nextIndex]
    
    this.setDirection(nextDirection)
    return nextDirection
  }

  /**
   * 重置为默认布局方向
   */
  reset() {
    this.setDirection(DEFAULT_LAYOUT_DIRECTION)
  }

  /**
   * 获取布局方向的显示名称
   * @param {string} direction - 布局方向
   * @returns {string} 显示名称
   */
  getDirectionDisplayName(direction) {
    const displayNames = {
      [LAYOUT_DIRECTIONS.VERTICAL]: '从上到下',
      [LAYOUT_DIRECTIONS.HORIZONTAL]: '从左到右',
      [LAYOUT_DIRECTIONS.RADIAL]: '径向布局',
      [LAYOUT_DIRECTIONS.GRID]: '网格布局'
    }
    return displayNames[direction] || direction
  }

  /**
   * 获取所有布局方向的选项
   * @returns {Array} 布局方向选项数组
   */
  getDirectionOptions() {
    return this.getSupportedDirections().map(direction => ({
      value: direction,
      label: this.getDirectionDisplayName(direction),
      config: this.getConfig(direction)
    }))
  }
}

/**
 * 全局布局方向管理器实例
 */
export const globalLayoutDirectionManager = new LayoutDirectionManager()

/**
 * 获取当前布局方向配置的便捷函数
 * @returns {Object} 当前布局配置
 */
export function getCurrentLayoutConfig() {
  return globalLayoutDirectionManager.getCurrentConfig()
}

/**
 * 设置全局布局方向的便捷函数
 * @param {string} direction - 布局方向
 * @returns {boolean} 是否设置成功
 */
export function setGlobalLayoutDirection(direction) {
  return globalLayoutDirectionManager.setDirection(direction)
}

/**
 * 获取当前布局方向的便捷函数
 * @returns {string} 当前布局方向
 */
export function getCurrentLayoutDirection() {
  return globalLayoutDirectionManager.getCurrentDirection()
}