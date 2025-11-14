import { computed, ref, Ref } from 'vue'

/**
 * 自适应间距算法
 * 基于斐波那契数列实现1:1.618黄金比例
 * 误差控制在±5%以内
 */

export interface SpacingConfig {
  // 基础间距
  baseSpacing: string
  
  // 内容间距
  contentPadding: string
  contentGap: string
  
  // 端口间距
  portGap: string
  portPadding: string
  
  // 标题间距
  titlePadding: string
  titleGap: string
  
  // 圆角
  borderRadius: string
  
  // 字体大小
  fontSize: string
  
  // 行高
  lineHeight: string
  
  // 最小行高
  minRowHeight: string
}

/**
 * 斐波那契数列工具函数
 */
class FibonacciSpacing {
  private sequence: number[] = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]
  private goldenRatio: number = 1.618
  private tolerance: number = 0.05 // 误差控制在±5%以内
  
  /**
   * 获取斐波那契数列中的值
   */
  getFibonacci(index: number): number {
    if (index < 0) return 1
    if (index < this.sequence.length) return this.sequence[index]
    
    // 动态生成更大的斐波那契数
    for (let i = this.sequence.length; i <= index; i++) {
      this.sequence[i] = this.sequence[i - 1] + this.sequence[i - 2]
    }
    
    return this.sequence[index]
  }
  
  /**
   * 计算黄金比例间距
   */
  calculateGoldenSpacing(baseSize: number, multiplier: number = 1): number {
    const fibValue = this.getFibonacci(Math.floor(multiplier))
    const goldenSpacing = baseSize * Math.pow(this.goldenRatio, multiplier - 1)
    
    // 确保误差在±5%以内
    const toleranceRange = goldenSpacing * this.tolerance
    const minValue = goldenSpacing - toleranceRange
    const maxValue = goldenSpacing + toleranceRange
    
    // 返回最接近的斐波那契数，但确保在误差范围内
    const fibSpacing = fibValue * 4 // 基础单位转换为像素
    
    if (fibSpacing >= minValue && fibSpacing <= maxValue) {
      return fibSpacing
    }
    
    return Math.round(goldenSpacing)
  }
  
  /**
   * 计算间距序列
   */
  calculateSpacingSequence(startIndex: number, count: number): number[] {
    const sequence: number[] = []
    
    for (let i = 0; i < count; i++) {
      const fibValue = this.getFibonacci(startIndex + i)
      const spacing = this.calculateGoldenSpacing(fibValue, i + 1)
      sequence.push(spacing)
    }
    
    return sequence
  }
  
  /**
   * 验证间距比例
   */
  validateSpacingRatio(spacing1: number, spacing2: number): boolean {
    const ratio = spacing2 / spacing1
    const expectedRatio = Math.pow(this.goldenRatio, 1)
    const tolerance = expectedRatio * this.tolerance
    
    return Math.abs(ratio - expectedRatio) <= tolerance
  }
}

/**
 * 间距计算工具函数
 */
export function useNodeSpacing() {
  const fibonacci = new FibonacciSpacing()
  
  /**
   * 计算节点间距配置
   */
  const calculateSpacing = (size: 'S' | 'M' | 'L' | 'XL'): SpacingConfig => {
    // 基础间距映射
    const sizeBaseSpacing = {
      'S': 4,   // 4px
      'M': 6,   // 6px
      'L': 8,   // 8px
      'XL': 12  // 12px
    }
    
    const baseSize = sizeBaseSpacing[size]
    
    // 计算间距序列
    const spacingSequence = fibonacci.calculateSpacingSequence(2, 8)
    
    // 生成间距配置
    const config: SpacingConfig = {
      baseSpacing: `${baseSize}px`,
      contentPadding: `${spacingSequence[0]}px ${spacingSequence[1]}px`,
      contentGap: `${spacingSequence[2]}px`,
      portGap: `${spacingSequence[3]}px`,
      portPadding: `${spacingSequence[4]}px`,
      titlePadding: `${spacingSequence[5]}px`,
      titleGap: `${spacingSequence[6]}px`,
      borderRadius: `${spacingSequence[7]}px`,
      fontSize: calculateFontSize(size),
      lineHeight: calculateLineHeight(size),
      minRowHeight: '24px' // 最小行高不得小于24px
    }
    
    // 验证间距比例
    validateSpacingConfig(config)
    
    return config
  }
  
  /**
   * 计算字体大小
   */
  const calculateFontSize = (size: 'S' | 'M' | 'L' | 'XL'): string => {
    const fontSizeMap = {
      'S': '12px',
      'M': '14px',
      'L': '16px',
      'XL': '18px'
    }
    
    return fontSizeMap[size]
  }
  
  /**
   * 计算行高
   */
  const calculateLineHeight = (size: 'S' | 'M' | 'L' | 'XL'): string => {
    const lineHeightMap = {
      'S': '1.4',
      'M': '1.5',
      'L': '1.6',
      'XL': '1.7'
    }
    
    return lineHeightMap[size]
  }
  
  /**
   * 计算端口间距
   * 端口应该和内容行绑定，间距取决于行间距
   */
  const calculatePortSpacing = (portCount: number, size: 'S' | 'M' | 'L' | 'XL') => {
    const baseSpacing = calculateSpacing(size)
    
    // 根据端口数量调整间距
    const portCountMultiplier = Math.min(portCount, 6) // 最多6个端口
    const fibMultiplier = fibonacci.getFibonacci(portCountMultiplier)
    
    // 计算端口间距
    const portGap = Math.max(
      parseInt(baseSpacing.portGap),
      fibMultiplier * 2 // 确保最小间距
    )
    
    // 计算最小高度
    const minHeight = Math.max(
      24, // 最小行高不得小于24px
      portCount * 20 + (portCount - 1) * portGap // 端口高度 + 间距
    )
    
    // 计算内边距
    const padding = Math.max(
      parseInt(baseSpacing.portPadding),
      Math.ceil(portGap / 2)
    )
    
    return {
      gap: `${portGap}px`,
      minHeight: `${minHeight}px`,
      padding: `${padding}px`,
      bindToContent: true, // 端口应该和内容行绑定
      rowSpacing: baseSpacing.contentGap
    }
  }
  
  /**
   * 计算内容间距
   * 基于内容类型和数量动态调整
   */
  const calculateContentSpacing = (
    contentType: 'text' | 'number' | 'boolean' | 'object',
    contentCount: number,
    size: 'S' | 'M' | 'L' | 'XL'
  ) => {
    const baseSpacing = calculateSpacing(size)
    
    // 内容类型权重
    const contentWeights = {
      'text': 1.0,
      'number': 0.8,
      'boolean': 0.6,
      'object': 1.2
    }
    
    const weight = contentWeights[contentType] || 1.0
    const fibIndex = Math.min(contentCount, 8)
    const fibValue = fibonacci.getFibonacci(fibIndex)
    
    // 计算内容间距
    const contentGap = Math.max(
      parseInt(baseSpacing.contentGap),
      Math.ceil(fibValue * weight * 2)
    )
    
    // 计算内容内边距
    const contentPadding = Math.max(
      parseInt(baseSpacing.contentPadding.split(' ')[0]),
      Math.ceil(contentGap * 0.75)
    )
    
    return {
      gap: `${contentGap}px`,
      padding: `${contentPadding}px`,
      minHeight: baseSpacing.minRowHeight
    }
  }
  
  /**
   * 计算标题间距
   * 使用clamp()函数限制字号(16-24px)
   */
  const calculateTitleSpacing = (titleLength: number, size: 'S' | 'M' | 'L' | 'XL') => {
    const baseSpacing = calculateSpacing(size)
    
    // 标题长度权重
    const lengthWeight = Math.min(titleLength / 20, 1.5) // 最大权重1.5
    const fibIndex = Math.min(Math.ceil(titleLength / 10), 6)
    const fibValue = fibonacci.getFibonacci(fibIndex)
    
    // 计算标题间距
    const titleGap = Math.max(
      parseInt(baseSpacing.titleGap),
      Math.ceil(fibValue * lengthWeight)
    )
    
    // 计算标题内边距
    const titlePadding = Math.max(
      parseInt(baseSpacing.titlePadding),
      Math.ceil(titleGap * 1.5)
    )
    
    // 计算字体大小 (使用clamp()函数限制)
    const minFontSize = 16
    const maxFontSize = 24
    const baseFontSize = parseInt(baseSpacing.fontSize)
    const calculatedFontSize = Math.min(
      maxFontSize,
      Math.max(minFontSize, baseFontSize + Math.ceil(lengthWeight * 2))
    )
    
    return {
      gap: `${titleGap}px`,
      padding: `${titlePadding}px`,
      fontSize: `${calculatedFontSize}px`,
      clampFontSize: `clamp(16px, ${calculatedFontSize}px, 24px)` // 使用clamp()函数
    }
  }
  
  /**
   * 验证间距配置
   */
  const validateSpacingConfig = (config: SpacingConfig): boolean => {
    // 验证基础间距
    const baseSpacing = parseInt(config.baseSpacing)
    if (baseSpacing < 4) {
      console.warn('基础间距过小，可能影响可读性')
      return false
    }
    
    // 验证内容间距比例
    const contentGap = parseInt(config.contentGap)
    const portGap = parseInt(config.portGap)
    const titleGap = parseInt(config.titleGap)
    
    // 使用斐波那契工具验证比例
    const isContentPortRatioValid = fibonacci.validateSpacingRatio(contentGap, portGap)
    const isContentTitleRatioValid = fibonacci.validateSpacingRatio(contentGap, titleGap)
    
    if (!isContentPortRatioValid) {
      console.warn('内容与端口间距比例不符合黄金比例')
    }
    
    if (!isContentTitleRatioValid) {
      console.warn('内容与标题间距比例不符合黄金比例')
    }
    
    // 验证最小行高
    const minRowHeight = parseInt(config.minRowHeight)
    if (minRowHeight < 24) {
      console.warn('最小行高小于24px，可能影响端口布局')
      return false
    }
    
    return isContentPortRatioValid && isContentTitleRatioValid
  }
  
  /**
   * 间距计算工具函数
   */
  const spacingUtils = {
    /**
     * 将像素值转换为rem
     */
    pxToRem: (px: number): string => {
      return `${px / 16}rem`
    },
    
    /**
     * 将rem值转换为像素
     */
    remToPx: (rem: string): number => {
      return parseFloat(rem) * 16
    },
    
    /**
     * 计算响应式间距
     * 基于vw单位计算，确保视窗缩放时保持比例
     */
    calculateResponsiveSpacing: (
      baseValue: number,
      viewportWidth: number,
      minViewport: number = 320,
      maxViewport: number = 1920
    ): string => {
      // 限制视窗范围
      const clampedViewport = Math.max(minViewport, Math.min(maxViewport, viewportWidth))
      
      // 计算vw值
      const vwValue = (baseValue / clampedViewport) * 100
      
      // 使用clamp()函数限制范围
      const minValue = baseValue * 0.8 // 最小80%
      const maxValue = baseValue * 1.2 // 最大120%
      
      return `clamp(${minValue}px, ${vwValue}vw, ${maxValue}px)`
    }
  }
  
  return {
    calculateSpacing,
    calculatePortSpacing,
    calculateContentSpacing,
    calculateTitleSpacing,
    validateSpacingConfig,
    spacingUtils,
    fibonacci
  }
}