import { computed } from 'vue'

// 颜色系统
const COLOR_PALETTE = {
  primary: '#14B8A6',
  secondary: '#4C78FF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // 中性色
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
}

// 字体系统
const TYPOGRAPHY_SYSTEM = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '15px',
    xl: '16px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.6
  }
}

// 动画系统
const ANIMATION_SYSTEM = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    custom: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

/**
 * 节点样式组合式函数
 * 提供完整的样式系统支持
 */
export function useNodeStyling() {
  
  /**
   * 获取基础节点样式
   * @param {string} size - 节点尺寸 (S/M/L/XL)
   * @returns {Object} 基础样式对象
   */
  function getNodeStyles(size = 'M') {
    const sizeMultipliers = {
      S: 0.8,
      M: 1.0,
      L: 1.2,
      XL: 1.5
    }
    
    const multiplier = sizeMultipliers[size] || 1.0
    
    return {
      // 基础尺寸
      width: `${280 * multiplier}px`,
      minHeight: `${96 * multiplier}px`,
      borderRadius: `${8 * multiplier}px`,
      
      // 边框样式
      border: `1px solid ${COLOR_PALETTE.gray[300]}`,
      
      // 背景样式
      backgroundColor: COLOR_PALETTE.gray[50],
      
      // 阴影样式
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      
      // 过渡动画
      transition: `all ${ANIMATION_SYSTEM.duration.normal} ${ANIMATION_SYSTEM.easing.custom}`,
      
      // 字体设置
      fontFamily: TYPOGRAPHY_SYSTEM.fontFamily.sans.join(', '),
      fontSize: TYPOGRAPHY_SYSTEM.fontSize.sm,
      lineHeight: TYPOGRAPHY_SYSTEM.lineHeight.normal
    }
  }
  
  /**
   * 获取状态样式
   * @param {Object} states - 状态对象
   * @returns {Object} 状态样式对象
   */
  function getStateStyles(states = {}) {
    const { isSelected, isHovered, isDisabled, isDragging } = states
    
    const styles = {}
    
    // 选中状态
    if (isSelected) {
      styles.borderColor = COLOR_PALETTE.secondary
      styles.borderWidth = '2px'
      styles.boxShadow = `0 8px 16px ${COLOR_PALETTE.secondary}26` // 15% 透明度
    }
    
    // 悬停状态
    if (isHovered) {
      styles.borderColor = COLOR_PALETTE.gray[400]
      styles.borderWidth = '2px'
      styles.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
      styles.transform = 'translateY(-1px)'
    }
    
    // 禁用状态
    if (isDisabled) {
      styles.opacity = '0.5'
      styles.cursor = 'not-allowed'
      styles.pointerEvents = 'none'
    }
    
    // 拖拽状态
    if (isDragging) {
      styles.opacity = '0.8'
      styles.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
      styles.transform = 'rotate(2deg) scale(1.02)'
    }
    
    return styles
  }
  
  /**
   * 获取排版样式
   * @param {string} nodeType - 节点类型
   * @param {string} size - 节点尺寸
   * @returns {Object} 排版样式对象
   */
  function getTypographyStyles(nodeType, size = 'M') {
    const sizeMultipliers = {
      S: 0.85,
      M: 1.0,
      L: 1.15,
      XL: 1.3
    }
    
    const multiplier = sizeMultipliers[size] || 1.0
    
    return {
      // 标题样式
      title: {
        fontSize: `${parseFloat(TYPOGRAPHY_SYSTEM.fontSize.sm) * multiplier}px`,
        fontWeight: TYPOGRAPHY_SYSTEM.fontWeight.semibold,
        color: COLOR_PALETTE.gray[900],
        lineHeight: TYPOGRAPHY_SYSTEM.lineHeight.tight
      },
      
      // 内容样式
      content: {
        fontSize: `${parseFloat(TYPOGRAPHY_SYSTEM.fontSize.sm) * multiplier}px`,
        fontWeight: TYPOGRAPHY_SYSTEM.fontWeight.normal,
        color: COLOR_PALETTE.gray[700],
        lineHeight: TYPOGRAPHY_SYSTEM.lineHeight.normal
      },
      
      // 图标样式
      icon: {
        fontSize: `${parseFloat(TYPOGRAPHY_SYSTEM.fontSize.xs) * multiplier}px`,
        fontWeight: TYPOGRAPHY_SYSTEM.fontWeight.bold,
        color: COLOR_PALETTE.gray[50],
        textAlign: 'center',
        lineHeight: '1'
      }
    }
  }
  
  /**
   * 获取节点类型特定样式
   * @param {string} nodeType - 节点类型
   * @returns {Object} 类型特定样式
   */
  function getNodeTypeStyles(nodeType) {
    const typeStyles = {
      // 开始节点
      start: {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.primary,
        iconBackgroundColor: COLOR_PALETTE.primary
      },
      
      // 人群分流
      'crowd-split': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.secondary,
        iconBackgroundColor: COLOR_PALETTE.secondary
      },
      
      // 事件分流
      'event-split': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.warning,
        iconBackgroundColor: COLOR_PALETTE.warning
      },
      
      // AB实验
      'ab-test': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.success,
        iconBackgroundColor: COLOR_PALETTE.success
      },
      
      // AI外呼
      'ai-call': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.primary,
        iconBackgroundColor: COLOR_PALETTE.primary
      },
      
      // 短信触达
      'sms': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.secondary,
        iconBackgroundColor: COLOR_PALETTE.secondary
      },
      
      // 人工外呼
      'manual-call': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.warning,
        iconBackgroundColor: COLOR_PALETTE.warning
      },
      
      // 等待节点
      'wait': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.gray[400],
        iconBackgroundColor: COLOR_PALETTE.gray[600]
      },
      
      // 权益节点
      'benefit': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.success,
        iconBackgroundColor: COLOR_PALETTE.success
      },
      
      // 结束节点
      'end': {
        backgroundColor: COLOR_PALETTE.gray[50],
        borderColor: COLOR_PALETTE.error,
        iconBackgroundColor: COLOR_PALETTE.error
      }
    }
    
    return typeStyles[nodeType] || typeStyles.start
  }
  
  /**
   * 获取响应式样式
   * @param {number} viewportWidth - 视口宽度
   * @param {number} viewportHeight - 视口高度
   * @returns {Object} 响应式样式对象
   */
  function getResponsiveStyles(viewportWidth, viewportHeight) {
    // 基准尺寸
    const baseWidth = 1440
    const baseHeight = 900
    
    // 计算缩放因子
    const widthScale = Math.min(1.2, Math.max(0.8, viewportWidth / baseWidth))
    const heightScale = Math.min(1.2, Math.max(0.8, viewportHeight / baseHeight))
    
    // 使用调和平均值确保平滑缩放
    const scale = (widthScale + heightScale) / 2
    
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      fontSize: `${13 * scale}px`
    }
  }
  
  /**
   * 获取CSS自定义属性
   * @returns {Object} CSS变量对象
   */
  function getCSSCustomProperties() {
    return {
      // 颜色变量
      '--node-primary': COLOR_PALETTE.primary,
      '--node-secondary': COLOR_PALETTE.secondary,
      '--node-success': COLOR_PALETTE.success,
      '--node-warning': COLOR_PALETTE.warning,
      '--node-error': COLOR_PALETTE.error,
      
      // 中性色变量
      '--node-gray-50': COLOR_PALETTE.gray[50],
      '--node-gray-100': COLOR_PALETTE.gray[100],
      '--node-gray-200': COLOR_PALETTE.gray[200],
      '--node-gray-300': COLOR_PALETTE.gray[300],
      '--node-gray-400': COLOR_PALETTE.gray[400],
      '--node-gray-500': COLOR_PALETTE.gray[500],
      '--node-gray-600': COLOR_PALETTE.gray[600],
      '--node-gray-700': COLOR_PALETTE.gray[700],
      '--node-gray-800': COLOR_PALETTE.gray[800],
      '--node-gray-900': COLOR_PALETTE.gray[900],
      
      // 动画变量
      '--node-transition-fast': ANIMATION_SYSTEM.duration.fast,
      '--node-transition-normal': ANIMATION_SYSTEM.duration.normal,
      '--node-transition-slow': ANIMATION_SYSTEM.duration.slow,
      '--node-transition-easing': ANIMATION_SYSTEM.easing.custom,
      
      // 排版变量
      '--node-font-family': TYPOGRAPHY_SYSTEM.fontFamily.sans.join(', '),
      '--node-font-size-sm': TYPOGRAPHY_SYSTEM.fontSize.sm,
      '--node-font-weight-semibold': TYPOGRAPHY_SYSTEM.fontWeight.semibold
    }
  }
  
  return {
    getNodeStyles,
    getStateStyles,
    getTypographyStyles,
    getNodeTypeStyles,
    getResponsiveStyles,
    getCSSCustomProperties,
    COLOR_PALETTE,
    TYPOGRAPHY_SYSTEM,
    ANIMATION_SYSTEM
  }
}