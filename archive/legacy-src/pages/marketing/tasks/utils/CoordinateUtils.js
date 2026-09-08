/**
 * 坐标转换工具类
 * 提供画布坐标系统相关的转换和计算功能
 * 消除降级逻辑，确保单一功能实现
 */

/**
 * 坐标转换工具类
 */
export class CoordinateUtils {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {number} options.canvasWidth - 画布宽度
   * @param {number} options.canvasHeight - 画布高度
   * @param {number} options.scale - 缩放比例
   */
  constructor(options = {}) {
    this.canvasWidth = options.canvasWidth || 1920
    this.canvasHeight = options.canvasHeight || 1080
    this.scale = options.scale || 1
    this.offsetX = options.offsetX || 0
    this.offsetY = options.offsetY || 0
  }

  /**
   * 屏幕坐标转画布坐标
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   * @returns {Object} 画布坐标 {x, y}
   */
  screenToCanvas(screenX, screenY) {
    if (typeof screenX !== 'number' || typeof screenY !== 'number') {
      throw new Error('坐标参数必须为数字类型')
    }

    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale
    }
  }

  /**
   * 画布坐标转屏幕坐标
   * @param {number} canvasX - 画布X坐标
   * @param {number} canvasY - 画布Y坐标
   * @returns {Object} 屏幕坐标 {x, y}
   */
  canvasToScreen(canvasX, canvasY) {
    if (typeof canvasX !== 'number' || typeof canvasY !== 'number') {
      throw new Error('坐标参数必须为数字类型')
    }

    return {
      x: canvasX * this.scale + this.offsetX,
      y: canvasY * this.scale + this.offsetY
    }
  }

  /**
   * 计算两点之间的距离
   * @param {Object} point1 - 第一个点 {x, y}
   * @param {Object} point2 - 第二个点 {x, y}
   * @returns {number} 距离
   */
  calculateDistance(point1, point2) {
    if (!this.isValidPoint(point1) || !this.isValidPoint(point2)) {
      throw new Error('点坐标格式无效')
    }

    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 计算两点之间的角度
   * @param {Object} point1 - 起始点 {x, y}
   * @param {Object} point2 - 结束点 {x, y}
   * @returns {number} 角度（弧度）
   */
  calculateAngle(point1, point2) {
    if (!this.isValidPoint(point1) || !this.isValidPoint(point2)) {
      throw new Error('点坐标格式无效')
    }

    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.atan2(dy, dx)
  }

  /**
   * 计算矩形的中心点
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {Object} 中心点 {x, y}
   */
  getRectCenter(rect) {
    if (!this.isValidRect(rect)) {
      throw new Error('矩形参数格式无效')
    }

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }
  }

  /**
   * 检查点是否在矩形内
   * @param {Object} point - 点 {x, y}
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {boolean} 是否在矩形内
   */
  isPointInRect(point, rect) {
    if (!this.isValidPoint(point) || !this.isValidRect(rect)) {
      return false
    }

    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height
  }

  /**
   * 检查两个矩形是否重叠
   * @param {Object} rect1 - 第一个矩形
   * @param {Object} rect2 - 第二个矩形
   * @returns {boolean} 是否重叠
   */
  isRectsOverlap(rect1, rect2) {
    if (!this.isValidRect(rect1) || !this.isValidRect(rect2)) {
      return false
    }

    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y)
  }

  /**
   * 计算节点的连接点坐标
   * @param {Object} nodeRect - 节点矩形
   * @param {string} direction - 连接方向 ('top', 'right', 'bottom', 'left')
   * @returns {Object} 连接点坐标 {x, y}
   */
  getNodeConnectionPoint(nodeRect, direction) {
    if (!this.isValidRect(nodeRect)) {
      throw new Error('节点矩形参数无效')
    }

    const center = this.getRectCenter(nodeRect)
    
    switch (direction) {
      case 'top':
        return { x: center.x, y: nodeRect.y }
      case 'right':
        return { x: nodeRect.x + nodeRect.width, y: center.y }
      case 'bottom':
        return { x: center.x, y: nodeRect.y + nodeRect.height }
      case 'left':
        return { x: nodeRect.x, y: center.y }
      default:
        throw new Error(`不支持的连接方向: ${direction}`)
    }
  }

  /**
   * 计算贝塞尔曲线控制点
   * @param {Object} startPoint - 起始点
   * @param {Object} endPoint - 结束点
   * @param {number} curvature - 曲率 (0-1)
   * @returns {Object} 控制点 {cp1: {x, y}, cp2: {x, y}}
   */
  calculateBezierControlPoints(startPoint, endPoint, curvature = 0.5) {
    if (!this.isValidPoint(startPoint) || !this.isValidPoint(endPoint)) {
      throw new Error('起始点或结束点坐标无效')
    }

    if (curvature < 0 || curvature > 1) {
      throw new Error('曲率值必须在0-1之间')
    }

    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const offset = distance * curvature

    return {
      cp1: {
        x: startPoint.x + offset,
        y: startPoint.y
      },
      cp2: {
        x: endPoint.x - offset,
        y: endPoint.y
      }
    }
  }

  /**
   * 更新坐标系统参数
   * @param {Object} options - 新的配置选项
   */
  updateCoordinateSystem(options) {
    if (options.canvasWidth !== undefined) {
      this.canvasWidth = options.canvasWidth
    }
    if (options.canvasHeight !== undefined) {
      this.canvasHeight = options.canvasHeight
    }
    if (options.scale !== undefined) {
      this.scale = options.scale
    }
    if (options.offsetX !== undefined) {
      this.offsetX = options.offsetX
    }
    if (options.offsetY !== undefined) {
      this.offsetY = options.offsetY
    }
  }

  /**
   * 验证点坐标格式
   * @param {Object} point - 点坐标
   * @returns {boolean} 是否有效
   */
  isValidPoint(point) {
    return point &&
           typeof point.x === 'number' &&
           typeof point.y === 'number' &&
           !isNaN(point.x) &&
           !isNaN(point.y)
  }

  /**
   * 验证矩形格式
   * @param {Object} rect - 矩形
   * @returns {boolean} 是否有效
   */
  isValidRect(rect) {
    return rect &&
           typeof rect.x === 'number' &&
           typeof rect.y === 'number' &&
           typeof rect.width === 'number' &&
           typeof rect.height === 'number' &&
           !isNaN(rect.x) &&
           !isNaN(rect.y) &&
           !isNaN(rect.width) &&
           !isNaN(rect.height) &&
           rect.width >= 0 &&
           rect.height >= 0
  }

  /**
   * 获取当前坐标系统状态
   * @returns {Object} 坐标系统状态
   */
  getCoordinateSystemState() {
    return {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      scale: this.scale,
      offsetX: this.offsetX,
      offsetY: this.offsetY
    }
  }
}

/**
 * 创建坐标工具实例
 * @param {Object} options - 配置选项
 * @returns {CoordinateUtils} 坐标工具实例
 */
export function createCoordinateUtils(options) {
  return new CoordinateUtils(options)
}

/**
 * 默认坐标工具实例
 */
export const defaultCoordinateUtils = new CoordinateUtils()