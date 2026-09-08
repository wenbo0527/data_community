/**
 * 画布UI优化方案
 * 针对桌面端用户体验的全面优化
 */

// 1. 现代化设计系统
export const DesignTokens = {
  // 颜色系统
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#bae0ff',
      300: '#7cc4fa',
      400: '#36a3f7',
      500: '#1677ff', // 主色
      600: '#0958d9',
      700: '#003eb3',
      800: '#002c8c',
      900: '#001d66'
    },
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#f0f0f0',
      300: '#d9d9d9',
      400: '#bfbfbf',
      500: '#8c8c8c',
      600: '#595959',
      700: '#434343',
      800: '#262626',
      900: '#1f1f1f'
    },
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1677ff'
  },
  
  // 间距系统
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px'
  },
  
  // 圆角系统
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    xxl: '16px',
    round: '50%'
  },
  
  // 阴影系统
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    hover: '0 8px 25px -8px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 3px rgba(22, 119, 255, 0.2)'
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // 动画系统
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

// 2. 节点类型配置优化
export const NodeTypeConfig = {
  start: {
    label: '开始',
    icon: '🚀',
    color: '#1677ff',
    gradient: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
    category: 'trigger'
  },
  'audience-split': {
    label: '人群分流',
    icon: '👥',
    color: '#ff4d4f',
    gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
    category: 'logic'
  },
  'event-split': {
    label: '事件分流',
    icon: '⚡',
    color: '#faad14',
    gradient: 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)',
    category: 'logic'
  },
  'ab-test': {
    label: 'A/B测试',
    icon: '🧪',
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
    category: 'logic'
  },
  sms: {
    label: '短信触达',
    icon: '💬',
    color: '#13c2c2',
    gradient: 'linear-gradient(135deg, #13c2c2 0%, #5cdbd3 100%)',
    category: 'action'
  },
  'ai-call': {
    label: 'AI外呼',
    icon: '🤖',
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
    category: 'action'
  },
  'manual-call': {
    label: '人工外呼',
    icon: '📞',
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)',
    category: 'action'
  },
  wait: {
    label: '等待',
    icon: '⏱️',
    color: '#8c8c8c',
    gradient: 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
    category: 'logic'
  },
  end: {
    label: '结束',
    icon: '🏁',
    color: '#595959',
    gradient: 'linear-gradient(135deg, #595959 0%, #8c8c8c 100%)',
    category: 'trigger'
  }
}

// 3. 工具栏配置优化
export const ToolbarConfig = {
  groups: [
    {
      id: 'zoom',
      label: '缩放控制',
      items: [
        { id: 'zoom-in', label: '放大', icon: 'plus', shortcut: 'Ctrl++' },
        { id: 'zoom-out', label: '缩小', icon: 'minus', shortcut: 'Ctrl+-' },
        { id: 'zoom-fit', label: '适应画布', icon: 'fullscreen', shortcut: 'Ctrl+F' },
        { id: 'zoom-reset', label: '重置缩放', icon: 'refresh', shortcut: 'Ctrl+0' }
      ]
    },
    {
      id: 'layout',
      label: '布局控制',
      items: [
        { id: 'auto-layout', label: '自动布局', icon: 'sort', shortcut: 'Ctrl+L' },
        { id: 'align-horizontal', label: '水平对齐', icon: 'align-horizontal' },
        { id: 'align-vertical', label: '垂直对齐', icon: 'align-vertical' },
        { id: 'distribute', label: '均匀分布', icon: 'distribute' }
      ]
    },
    {
      id: 'edit',
      label: '编辑操作',
      items: [
        { id: 'undo', label: '撤销', icon: 'undo', shortcut: 'Ctrl+Z' },
        { id: 'redo', label: '重做', icon: 'redo', shortcut: 'Ctrl+Y' },
        { id: 'copy', label: '复制', icon: 'copy', shortcut: 'Ctrl+C' },
        { id: 'paste', label: '粘贴', icon: 'paste', shortcut: 'Ctrl+V' }
      ]
    },
    {
      id: 'view',
      label: '视图控制',
      items: [
        { id: 'grid', label: '网格', icon: 'grid', toggle: true },
        { id: 'minimap', label: '缩略图', icon: 'minimap', toggle: true },
        { id: 'ruler', label: '标尺', icon: 'ruler', toggle: true }
      ]
    }
  ]
}

// 4. 交互状态配置
export const InteractionStates = {
  default: {
    cursor: 'default',
    nodeHover: {
      transform: 'translateY(-2px)',
      boxShadow: DesignTokens.shadows.hover
    }
  },
  dragging: {
    cursor: 'grabbing',
    nodeOpacity: 0.8
  },
  connecting: {
    cursor: 'crosshair',
    previewLine: {
      stroke: DesignTokens.colors.primary[500],
      strokeWidth: 2,
      strokeDasharray: '5,5'
    }
  },
  selecting: {
    cursor: 'crosshair',
    selectionBox: {
      fill: 'rgba(22, 119, 255, 0.1)',
      stroke: DesignTokens.colors.primary[500],
      strokeWidth: 1
    }
  }
}

// 5. 响应式断点
export const Breakpoints = {
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1536px',
  xxl: '1920px'
}

// 6. 可访问性配置
export const AccessibilityConfig = {
  focusRing: {
    outline: `2px solid ${DesignTokens.colors.primary[500]}`,
    outlineOffset: '2px'
  },
  highContrast: {
    enabled: false,
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#00ff00',
      secondary: '#ffff00'
    }
  },
  reducedMotion: {
    enabled: false,
    animations: {
      duration: '0ms',
      easing: 'linear'
    }
  }
}

// 7. UI优化配置
// 提供现代化的用户体验优化方案

// 动画配置
export const ANIMATION_CONFIG = {
  // 节点动画
  NODE: {
    // 节点添加动画
    ADD: {
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // 弹性效果
      keyframes: [
        { transform: 'scale(0) rotate(180deg)', opacity: 0, offset: 0 },
        { transform: 'scale(1.1) rotate(0deg)', opacity: 0.8, offset: 0.7 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 1 }
      ]
    },
    
    // 节点删除动画
    REMOVE: {
      duration: 300,
      easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      keyframes: [
        { transform: 'scale(1)', opacity: 1, offset: 0 },
        { transform: 'scale(1.1)', opacity: 0.8, offset: 0.3 },
        { transform: 'scale(0) rotate(-180deg)', opacity: 0, offset: 1 }
      ]
    },
    
    // 节点悬停动画
    HOVER: {
      duration: 200,
      easing: 'ease-out',
      transform: 'scale(1.05)',
      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))'
    },
    
    // 节点选中动画
    SELECT: {
      duration: 300,
      easing: 'ease-out',
      keyframes: [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(1.1)', offset: 0.5 },
        { transform: 'scale(1.05)', offset: 1 }
      ]
    },
    
    // 节点拖拽动画
    DRAG: {
      duration: 150,
      easing: 'ease-out',
      transform: 'scale(1.1) rotate(2deg)',
      filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))',
      zIndex: 1000
    }
  },
  
  // 连线动画
  EDGE: {
    // 连线创建动画
    ADD: {
      duration: 600,
      easing: 'ease-out',
      strokeDasharray: '5,5',
      strokeDashoffset: 100,
      keyframes: [
        { strokeDashoffset: 100, opacity: 0, offset: 0 },
        { strokeDashoffset: 0, opacity: 0.8, offset: 0.8 },
        { strokeDashoffset: 0, opacity: 1, offset: 1 }
      ]
    },
    
    // 连线删除动画
    REMOVE: {
      duration: 300,
      easing: 'ease-in',
      keyframes: [
        { opacity: 1, strokeWidth: 2, offset: 0 },
        { opacity: 0.5, strokeWidth: 4, offset: 0.5 },
        { opacity: 0, strokeWidth: 0, offset: 1 }
      ]
    },
    
    // 连线悬停效果
    HOVER: {
      duration: 200,
      easing: 'ease-out',
      strokeWidth: 3,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
    }
  },
  
  // 预览线动画
  PREVIEW: {
    // 预览线显示动画
    SHOW: {
      duration: 300,
      easing: 'ease-out',
      strokeDasharray: '8,4',
      keyframes: [
        { opacity: 0, strokeDashoffset: 20, offset: 0 },
        { opacity: 0.8, strokeDashoffset: 0, offset: 1 }
      ]
    },
    
    // 预览线隐藏动画
    HIDE: {
      duration: 200,
      easing: 'ease-in',
      keyframes: [
        { opacity: 0.8, offset: 0 },
        { opacity: 0, offset: 1 }
      ]
    },
    
    // 预览线脉冲动画
    PULSE: {
      duration: 1500,
      easing: 'ease-in-out',
      iterationCount: 'infinite',
      keyframes: [
        { opacity: 0.6, strokeWidth: 2, offset: 0 },
        { opacity: 1, strokeWidth: 3, offset: 0.5 },
        { opacity: 0.6, strokeWidth: 2, offset: 1 }
      ]
    }
  }
}

// 交互反馈配置
export const INTERACTION_CONFIG = {
  // 悬停反馈
  HOVER: {
    // 节点悬停
    NODE: {
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      showTooltip: true,
      tooltipDelay: 500,
      highlightConnections: true
    },
    
    // 连线悬停
    EDGE: {
      cursor: 'pointer',
      transition: 'all 0.2s ease-out',
      showTooltip: true,
      tooltipDelay: 300
    },
    
    // 端口悬停
    PORT: {
      cursor: 'crosshair',
      transition: 'all 0.15s ease-out',
      scale: 1.5,
      showConnectionPreview: true
    }
  },
  
  // 拖拽反馈
  DRAG: {
    // 节点拖拽
    NODE: {
      cursor: 'grabbing',
      opacity: 0.8,
      showSnapGuides: true,
      snapDistance: 20,
      magneticSnap: true
    },
    
    // 连线拖拽
    EDGE: {
      cursor: 'grabbing',
      showDropZones: true,
      highlightValidTargets: true,
      invalidTargetFeedback: true
    }
  },
  
  // 选择反馈
  SELECTION: {
    // 单选
    SINGLE: {
      showBoundingBox: true,
      showHandles: true,
      enableKeyboardShortcuts: true
    },
    
    // 多选
    MULTIPLE: {
      showGroupBoundingBox: true,
      enableBatchOperations: true,
      showSelectionCount: true
    }
  }
}

// 视觉反馈配置
export const VISUAL_FEEDBACK = {
  // 状态指示
  STATUS: {
    // 节点状态
    NODE: {
      NORMAL: { opacity: 1 },
      HOVER: { opacity: 1, transform: 'scale(1.05)' },
      SELECTED: { opacity: 1, transform: 'scale(1.05)' },
      DISABLED: { opacity: 0.5, filter: 'grayscale(100%)' },
      ERROR: { 
        animation: 'shake 0.5s ease-in-out',
        borderColor: '#ff4d4f',
        borderWidth: 2
      },
      SUCCESS: {
        animation: 'pulse 0.6s ease-in-out',
        filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))'
      }
    },
    
    // 连线状态
    EDGE: {
      NORMAL: { opacity: 0.8 },
      HOVER: { opacity: 1, strokeWidth: 3 },
      SELECTED: { opacity: 1, strokeWidth: 3 },
      INVALID: { 
        stroke: '#ff4d4f',
        strokeDasharray: '5,5',
        animation: 'dash 1s linear infinite'
      }
    }
  },
  
  // 加载状态
  LOADING: {
    NODE: {
      overlay: true,
      spinner: true,
      opacity: 0.6,
      message: '加载中...'
    },
    
    CANVAS: {
      backdrop: true,
      spinner: true,
      message: '正在加载画布...'
    }
  },
  
  // 错误提示
  ERROR: {
    TOAST: {
      duration: 4000,
      position: 'top-right',
      showIcon: true,
      closable: true
    },
    
    INLINE: {
      showIcon: true,
      color: '#ff4d4f',
      backgroundColor: '#fff2f0',
      borderColor: '#ffccc7'
    }
  }
}

// 性能优化配置
export const PERFORMANCE_CONFIG = {
  // 渲染优化
  RENDERING: {
    // 虚拟化
    VIRTUALIZATION: {
      enabled: true,
      threshold: 100, // 超过100个节点启用虚拟化
      bufferSize: 20  // 缓冲区大小
    },
    
    // 批量更新
    BATCHING: {
      enabled: true,
      batchSize: 50,
      debounceTime: 16 // 约60fps
    },
    
    // LOD (Level of Detail)
    LOD: {
      enabled: true,
      levels: [
        { scale: 0.1, detail: 'minimal' },   // 极小缩放时只显示基本形状
        { scale: 0.5, detail: 'reduced' },   // 小缩放时减少细节
        { scale: 1.0, detail: 'full' }       // 正常缩放时显示全部细节
      ]
    }
  },
  
  // 内存优化
  MEMORY: {
    // 对象池
    OBJECT_POOL: {
      enabled: true,
      maxSize: 1000,
      recycleThreshold: 0.8
    },
    
    // 缓存策略
    CACHE: {
      nodeStyles: true,
      edgeStyles: true,
      layoutResults: true,
      maxCacheSize: 500
    }
  },
  
  // 事件优化
  EVENTS: {
    // 防抖
    DEBOUNCE: {
      resize: 100,
      scroll: 16,
      mousemove: 16
    },
    
    // 节流
    THROTTLE: {
      drag: 16,
      zoom: 16,
      pan: 16
    }
  }
}

export default {
  DesignTokens,
  NodeTypeConfig,
  ToolbarConfig,
  InteractionStates,
  Breakpoints,
  AccessibilityConfig,
  ANIMATION_CONFIG,
  INTERACTION_CONFIG,
  VISUAL_FEEDBACK,
  PERFORMANCE_CONFIG
}