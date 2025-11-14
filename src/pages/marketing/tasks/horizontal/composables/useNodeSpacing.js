import { ref, computed } from 'vue'

// 斐波那契数列
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

// 黄金比例
const GOLDEN_RATIO = 1.618033988749895

/**
 * 节点间距计算组合式函数
 * 基于斐波那契数列和黄金比例实现自适应间距
 */
export function useNodeSpacing() {
  
  /**
   * 获取斐波那契数列中的值
   * @param {number} index - 索引位置
   * @returns {number} 斐波那契数值
   */
  function getFibonacciValue(index) {
    if (index < 0) return FIBONACCI_SEQUENCE[0]
    if (index >= FIBONACCI_SEQUENCE.length) return FIBONACCI_SEQUENCE[FIBONACCI_SEQUENCE.length - 1]
    return FIBONACCI_SEQUENCE[index]
  }
  
  /**
   * 基于黄金比例计算间距
   * @param {number} baseValue - 基础值
   * @param {number} level - 层级（影响倍数）
   * @returns {number} 计算后的间距值
   */
  function getFibonacciSpacing(baseValue, level = 1) {
    const fibIndex = Math.floor(level)
    const fibValue = getFibonacciValue(fibIndex)
    const result = baseValue * Math.pow(GOLDEN_RATIO, level - 1) * (fibValue / FIBONACCI_SEQUENCE[4])
    
    // 确保误差在±5%以内
    const baseResult = baseValue * Math.pow(GOLDEN_RATIO, level - 1)
    const tolerance = 0.05
    const minValue = baseResult * (1 - tolerance)
    const maxValue = baseResult * (1 + tolerance)
    
    return Math.max(minValue, Math.min(maxValue, result))
  }
  
  /**
   * 计算节点间距
   * @param {string} nodeType - 节点类型
   * @param {number} contentLines - 内容行数
   * @param {string} size - 节点尺寸 (S/M/L/XL)
   * @returns {Object} 间距配置对象
   */
  function calculateSpacing(nodeType, contentLines, size = 'M') {
    // 基础间距配置
    const baseSpacing = {
      S: { multiplier: 0.8, header: 8, content: 6, line: 20 },
      M: { multiplier: 1.0, header: 12, content: 12, line: 32 },
      L: { multiplier: 1.2, header: 16, content: 16, line: 36 },
      XL: { multiplier: 1.5, header: 20, content: 20, line: 40 }
    }
    
    const sizeConfig = baseSpacing[size] || baseSpacing.M
    const multiplier = sizeConfig.multiplier
    
    // 基于黄金比例计算各元素间距
    const headerPadding = getFibonacciSpacing(sizeConfig.header, 1)
    const contentPadding = getFibonacciSpacing(sizeConfig.content, 1.5)
    const lineHeight = getFibonacciSpacing(sizeConfig.line, 2)
    
    // 计算内容区域高度
    const contentHeight = contentPadding * 2 + contentLines * lineHeight
    
    // 计算节点总高度
    const headerHeight = 36 * multiplier // 标题区域高度
    const totalHeight = headerHeight + contentHeight
    
    // 端口间距计算
    const portSpacing = lineHeight / 2 // 端口对齐到行中点
    const portOffsets = []
    
    for (let i = 0; i < contentLines; i++) {
      const offset = headerHeight + contentPadding + i * lineHeight + portSpacing
      portOffsets.push(offset)
    }
    
    // 输入端口位置（内容区域中心）
    const inputPortOffset = headerHeight + contentPadding + (contentHeight - contentPadding * 2) / 2
    
    return {
      header: {
        height: headerHeight,
        padding: headerPadding
      },
      content: {
        padding: contentPadding,
        height: contentHeight,
        lineHeight: lineHeight
      },
      ports: {
        input: inputPortOffset,
        outputs: portOffsets,
        spacing: portSpacing
      },
      total: {
        height: totalHeight,
        width: 280 * multiplier // 基础宽度280px
      }
    }
  }
  
  /**
   * 计算响应式间距
   * @param {number} viewportWidth - 视口宽度
   * @param {number} viewportHeight - 视口高度
   * @returns {Object} 响应式间距配置
   */
  function calculateResponsiveSpacing(viewportWidth, viewportHeight) {
    // 基于视口尺寸计算缩放因子
    const baseWidth = 1440 // 基准宽度
    const baseHeight = 900 // 基准高度
    
    const widthScale = Math.min(1.2, Math.max(0.8, viewportWidth / baseWidth))
    const heightScale = Math.min(1.2, Math.max(0.8, viewportHeight / baseHeight))
    
    // 使用黄金比例调和平均值
    const goldenScale = (widthScale * GOLDEN_RATIO + heightScale) / (GOLDEN_RATIO + 1)
    
    return {
      scale: goldenScale,
      widthScale,
      heightScale,
      spacingMultiplier: Math.pow(goldenScale, 0.5) // 平方根确保变化更平缓
    }
  }
  
  /**
   * 验证间距是否符合规范
   * @param {Object} spacing - 间距配置
   * @returns {Object} 验证结果
   */
  function validateSpacing(spacing) {
    const errors = []
    const warnings = []
    
    // 验证最小行高
    if (spacing.content.lineHeight < 24) {
      errors.push(`行高 ${spacing.content.lineHeight}px 小于最小要求 24px`)
    }
    
    // 验证黄金比例
    const headerToContentRatio = spacing.header.height / spacing.content.height
    const idealRatio = 1 / GOLDEN_RATIO
    const ratioError = Math.abs(headerToContentRatio - idealRatio) / idealRatio
    
    if (ratioError > 0.05) {
      warnings.push(`头部与内容区域比例偏差 ${(ratioError * 100).toFixed(1)}%，超过 ±5% 标准`)
    }
    
    // 验证端口间距
    if (spacing.ports.outputs.length > 0) {
      const portSpacing = spacing.ports.spacing
      const lineHeight = spacing.content.lineHeight
      const portSpacingError = Math.abs(portSpacing - lineHeight / 2) / (lineHeight / 2)
      
      if (portSpacingError > 0.05) {
        warnings.push(`端口间距偏差 ${(portSpacingError * 100).toFixed(1)}%，建议对齐到行中点`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      ratio: headerToContentRatio,
      ratioError: ratioError * 100
    }
  }
  
  return {
    getFibonacciSpacing,
    calculateSpacing,
    calculateResponsiveSpacing,
    validateSpacing,
    GOLDEN_RATIO,
    FIBONACCI_SEQUENCE
  }
}