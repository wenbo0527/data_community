/**
 * 配置相关类型定义
 * 提供统一布局引擎中配置相关的类型约束和文档
 */

import { LayoutAlgorithmType, LayoutDirection } from './LayoutTypes.js';

/**
 * 配置级别枚举
 * @typedef {string} ConfigLevel
 */
export const ConfigLevel = {
  /** 全局配置 */
  GLOBAL: 'global',
  /** 布局配置 */
  LAYOUT: 'layout',
  /** 算法配置 */
  ALGORITHM: 'algorithm',
  /** 节点配置 */
  NODE: 'node',
  /** 边配置 */
  EDGE: 'edge',
  /** 性能配置 */
  PERFORMANCE: 'performance',
  /** 用户配置 */
  USER: 'user'
};

/**
 * 配置类型枚举
 * @typedef {string} ConfigType
 */
export const ConfigType = {
  /** 布局配置 */
  LAYOUT: 'layout',
  /** 性能配置 */
  PERFORMANCE: 'performance',
  /** 样式配置 */
  STYLE: 'style',
  /** 交互配置 */
  INTERACTION: 'interaction',
  /** 动画配置 */
  ANIMATION: 'animation',
  /** 调试配置 */
  DEBUG: 'debug'
};

/**
 * 配置状态枚举
 * @typedef {string} ConfigStatus
 */
export const ConfigStatus = {
  /** 默认状态 */
  DEFAULT: 'default',
  /** 自定义状态 */
  CUSTOM: 'custom',
  /** 临时状态 */
  TEMPORARY: 'temporary',
  /** 锁定状态 */
  LOCKED: 'locked',
  /** 无效状态 */
  INVALID: 'invalid'
};

/**
 * 布局配置类型定义
 * @typedef {Object} LayoutConfig
 * @property {LayoutAlgorithmType} algorithm - 布局算法
 * @property {LayoutDirection} direction - 布局方向
 * @property {Object} spacing - 间距配置
 * @property {number} spacing.node - 节点间距
 * @property {number} spacing.layer - 层级间距
 * @property {number} spacing.edge - 边间距
 * @property {Object} alignment - 对齐配置
 * @property {string} alignment.horizontal - 水平对齐
 * @property {string} alignment.vertical - 垂直对齐
 * @property {Object} constraints - 约束配置
 * @property {Object} constraints.canvas - 画布约束
 * @property {number} constraints.canvas.minWidth - 最小宽度
 * @property {number} constraints.canvas.minHeight - 最小高度
 * @property {number} constraints.canvas.maxWidth - 最大宽度
 * @property {number} constraints.canvas.maxHeight - 最大高度
 * @property {Object} constraints.node - 节点约束
 * @property {number} constraints.node.minSize - 最小尺寸
 * @property {number} constraints.node.maxSize - 最大尺寸
 * @property {Object} optimization - 优化配置
 * @property {boolean} optimization.enabled - 是否启用优化
 * @property {string[]} optimization.strategies - 优化策略
 * @property {number} optimization.maxIterations - 最大迭代次数
 * @property {Object} animation - 动画配置
 * @property {boolean} animation.enabled - 是否启用动画
 * @property {number} animation.duration - 动画时长
 * @property {string} animation.easing - 缓动函数
 */
export const LayoutConfigType = {
  algorithm: 'LayoutAlgorithmType',
  direction: 'LayoutDirection',
  spacing: {
    node: 'number',
    layer: 'number',
    edge: 'number'
  },
  alignment: {
    horizontal: 'string',
    vertical: 'string'
  },
  constraints: {
    canvas: {
      minWidth: 'number',
      minHeight: 'number',
      maxWidth: 'number',
      maxHeight: 'number'
    },
    node: {
      minSize: 'number',
      maxSize: 'number'
    }
  },
  optimization: {
    enabled: 'boolean',
    strategies: 'string[]',
    maxIterations: 'number'
  },
  animation: {
    enabled: 'boolean',
    duration: 'number',
    easing: 'string'
  }
};

/**
 * 性能配置类型定义
 * @typedef {Object} PerformanceConfig
 * @property {Object} cache - 缓存配置
 * @property {boolean} cache.enabled - 是否启用缓存
 * @property {number} cache.maxSize - 最大缓存大小
 * @property {number} cache.ttl - 缓存生存时间
 * @property {string} cache.strategy - 缓存策略
 * @property {Object} debounce - 防抖配置
 * @property {boolean} debounce.enabled - 是否启用防抖
 * @property {number} debounce.delay - 防抖延迟
 * @property {string[]} debounce.events - 防抖事件
 * @property {Object} throttle - 节流配置
 * @property {boolean} throttle.enabled - 是否启用节流
 * @property {number} throttle.interval - 节流间隔
 * @property {string[]} throttle.events - 节流事件
 * @property {Object} monitoring - 监控配置
 * @property {boolean} monitoring.enabled - 是否启用监控
 * @property {string[]} monitoring.metrics - 监控指标
 * @property {number} monitoring.sampleRate - 采样率
 * @property {Object} optimization - 优化配置
 * @property {boolean} optimization.lazyLoading - 懒加载
 * @property {boolean} optimization.virtualScrolling - 虚拟滚动
 * @property {number} optimization.batchSize - 批处理大小
 */
export const PerformanceConfigType = {
  cache: {
    enabled: 'boolean',
    maxSize: 'number',
    ttl: 'number',
    strategy: 'string'
  },
  debounce: {
    enabled: 'boolean',
    delay: 'number',
    events: 'string[]'
  },
  throttle: {
    enabled: 'boolean',
    interval: 'number',
    events: 'string[]'
  },
  monitoring: {
    enabled: 'boolean',
    metrics: 'string[]',
    sampleRate: 'number'
  },
  optimization: {
    lazyLoading: 'boolean',
    virtualScrolling: 'boolean',
    batchSize: 'number'
  }
};

/**
 * 样式配置类型定义
 * @typedef {Object} StyleConfig
 * @property {Object} theme - 主题配置
 * @property {string} theme.name - 主题名称
 * @property {Object} theme.colors - 颜色配置
 * @property {string} theme.colors.primary - 主色
 * @property {string} theme.colors.secondary - 辅色
 * @property {string} theme.colors.background - 背景色
 * @property {string} theme.colors.text - 文本色
 * @property {Object} theme.fonts - 字体配置
 * @property {string} theme.fonts.family - 字体族
 * @property {string} theme.fonts.size - 字体大小
 * @property {string} theme.fonts.weight - 字体粗细
 * @property {Object} node - 节点样式配置
 * @property {Object} node.default - 默认样式
 * @property {Object} node.selected - 选中样式
 * @property {Object} node.hovered - 悬停样式
 * @property {Object} edge - 边样式配置
 * @property {Object} edge.default - 默认样式
 * @property {Object} edge.selected - 选中样式
 * @property {Object} edge.hovered - 悬停样式
 */
export const StyleConfigType = {
  theme: {
    name: 'string',
    colors: {
      primary: 'string',
      secondary: 'string',
      background: 'string',
      text: 'string'
    },
    fonts: {
      family: 'string',
      size: 'string',
      weight: 'string'
    }
  },
  node: {
    default: 'Object',
    selected: 'Object',
    hovered: 'Object'
  },
  edge: {
    default: 'Object',
    selected: 'Object',
    hovered: 'Object'
  }
};

/**
 * 交互配置类型定义
 * @typedef {Object} InteractionConfig
 * @property {Object} selection - 选择配置
 * @property {boolean} selection.enabled - 是否启用选择
 * @property {boolean} selection.multiple - 是否支持多选
 * @property {string} selection.mode - 选择模式
 * @property {Object} drag - 拖拽配置
 * @property {boolean} drag.enabled - 是否启用拖拽
 * @property {string[]} drag.targets - 拖拽目标
 * @property {Object} drag.constraints - 拖拽约束
 * @property {Object} zoom - 缩放配置
 * @property {boolean} zoom.enabled - 是否启用缩放
 * @property {number} zoom.min - 最小缩放比例
 * @property {number} zoom.max - 最大缩放比例
 * @property {number} zoom.step - 缩放步长
 * @property {Object} pan - 平移配置
 * @property {boolean} pan.enabled - 是否启用平移
 * @property {Object} pan.constraints - 平移约束
 * @property {Object} keyboard - 键盘配置
 * @property {boolean} keyboard.enabled - 是否启用键盘
 * @property {Object} keyboard.shortcuts - 快捷键配置
 */
export const InteractionConfigType = {
  selection: {
    enabled: 'boolean',
    multiple: 'boolean',
    mode: 'string'
  },
  drag: {
    enabled: 'boolean',
    targets: 'string[]',
    constraints: 'Object'
  },
  zoom: {
    enabled: 'boolean',
    min: 'number',
    max: 'number',
    step: 'number'
  },
  pan: {
    enabled: 'boolean',
    constraints: 'Object'
  },
  keyboard: {
    enabled: 'boolean',
    shortcuts: 'Object'
  }
};

/**
 * 动画配置类型定义
 * @typedef {Object} AnimationConfig
 * @property {boolean} enabled - 是否启用动画
 * @property {Object} layout - 布局动画配置
 * @property {boolean} layout.enabled - 是否启用布局动画
 * @property {number} layout.duration - 动画时长
 * @property {string} layout.easing - 缓动函数
 * @property {Object} interaction - 交互动画配置
 * @property {boolean} interaction.enabled - 是否启用交互动画
 * @property {number} interaction.duration - 动画时长
 * @property {string} interaction.easing - 缓动函数
 * @property {Object} transition - 过渡动画配置
 * @property {boolean} transition.enabled - 是否启用过渡动画
 * @property {number} transition.duration - 动画时长
 * @property {string} transition.easing - 缓动函数
 * @property {Object} effects - 特效配置
 * @property {boolean} effects.shadow - 阴影效果
 * @property {boolean} effects.glow - 发光效果
 * @property {boolean} effects.pulse - 脉冲效果
 */
export const AnimationConfigType = {
  enabled: 'boolean',
  layout: {
    enabled: 'boolean',
    duration: 'number',
    easing: 'string'
  },
  interaction: {
    enabled: 'boolean',
    duration: 'number',
    easing: 'string'
  },
  transition: {
    enabled: 'boolean',
    duration: 'number',
    easing: 'string'
  },
  effects: {
    shadow: 'boolean',
    glow: 'boolean',
    pulse: 'boolean'
  }
};

/**
 * 调试配置类型定义
 * @typedef {Object} DebugConfig
 * @property {boolean} enabled - 是否启用调试
 * @property {string} level - 调试级别
 * @property {Object} logging - 日志配置
 * @property {boolean} logging.enabled - 是否启用日志
 * @property {string} logging.level - 日志级别
 * @property {string[]} logging.categories - 日志分类
 * @property {Object} visualization - 可视化配置
 * @property {boolean} visualization.enabled - 是否启用可视化
 * @property {boolean} visualization.showBounds - 显示边界
 * @property {boolean} visualization.showGrid - 显示网格
 * @property {boolean} visualization.showMetrics - 显示指标
 * @property {Object} profiling - 性能分析配置
 * @property {boolean} profiling.enabled - 是否启用性能分析
 * @property {string[]} profiling.metrics - 分析指标
 * @property {number} profiling.sampleRate - 采样率
 */
export const DebugConfigType = {
  enabled: 'boolean',
  level: 'string',
  logging: {
    enabled: 'boolean',
    level: 'string',
    categories: 'string[]'
  },
  visualization: {
    enabled: 'boolean',
    showBounds: 'boolean',
    showGrid: 'boolean',
    showMetrics: 'boolean'
  },
  profiling: {
    enabled: 'boolean',
    metrics: 'string[]',
    sampleRate: 'number'
  }
};

/**
 * 配置项类型定义
 * @typedef {Object} ConfigItem
 * @property {string} key - 配置键
 * @property {*} value - 配置值
 * @property {string} type - 配置类型
 * @property {ConfigLevel} level - 配置级别
 * @property {ConfigStatus} status - 配置状态
 * @property {*} defaultValue - 默认值
 * @property {Object} validation - 验证规则
 * @property {string} description - 配置描述
 * @property {Object} metadata - 元数据
 * @property {Date} metadata.createdAt - 创建时间
 * @property {Date} metadata.updatedAt - 更新时间
 * @property {string} metadata.version - 版本号
 */
export const ConfigItemType = {
  key: 'string',
  value: 'any',
  type: 'string',
  level: 'ConfigLevel',
  status: 'ConfigStatus',
  defaultValue: 'any',
  validation: 'Object',
  description: 'string',
  metadata: {
    createdAt: 'Date',
    updatedAt: 'Date',
    version: 'string'
  }
};

/**
 * 配置组类型定义
 * @typedef {Object} ConfigGroup
 * @property {string} id - 组ID
 * @property {string} name - 组名称
 * @property {string} description - 组描述
 * @property {ConfigItem[]} items - 配置项列表
 * @property {ConfigLevel} level - 配置级别
 * @property {Object} metadata - 元数据
 */
export const ConfigGroupType = {
  id: 'string',
  name: 'string',
  description: 'string',
  items: 'ConfigItem[]',
  level: 'ConfigLevel',
  metadata: 'Object'
};

/**
 * 配置变更事件类型定义
 * @typedef {Object} ConfigChangeEvent
 * @property {string} type - 事件类型
 * @property {string} key - 配置键
 * @property {*} oldValue - 旧值
 * @property {*} newValue - 新值
 * @property {ConfigLevel} level - 配置级别
 * @property {Date} timestamp - 时间戳
 * @property {Object} metadata - 事件元数据
 */
export const ConfigChangeEventType = {
  type: 'string',
  key: 'string',
  oldValue: 'any',
  newValue: 'any',
  level: 'ConfigLevel',
  timestamp: 'Date',
  metadata: 'Object'
};

/**
 * 配置验证规则类型定义
 * @typedef {Object} ConfigValidationRule
 * @property {string} type - 验证类型
 * @property {*} constraint - 约束条件
 * @property {string} message - 错误消息
 * @property {Function} validator - 自定义验证函数
 */
export const ConfigValidationRuleType = {
  type: 'string',
  constraint: 'any',
  message: 'string',
  validator: 'Function'
};

/**
 * 配置类型验证工具类
 */
export class ConfigTypeValidator {
  /**
   * 验证配置项
   * @param {*} configItem - 待验证的配置项
   * @returns {boolean} 是否有效
   */
  static isValidConfigItem(configItem) {
    return configItem &&
           typeof configItem.key === 'string' &&
           configItem.key.length > 0 &&
           typeof configItem.type === 'string' &&
           Object.values(ConfigLevel).includes(configItem.level) &&
           Object.values(ConfigStatus).includes(configItem.status);
  }

  /**
   * 验证布局配置
   * @param {*} layoutConfig - 待验证的布局配置
   * @returns {boolean} 是否有效
   */
  static isValidLayoutConfig(layoutConfig) {
    return layoutConfig &&
           typeof layoutConfig.algorithm === 'string' &&
           typeof layoutConfig.direction === 'string' &&
           layoutConfig.spacing &&
           typeof layoutConfig.spacing.node === 'number' &&
           layoutConfig.spacing.node >= 0 &&
           typeof layoutConfig.spacing.layer === 'number' &&
           layoutConfig.spacing.layer >= 0;
  }

  /**
   * 验证性能配置
   * @param {*} performanceConfig - 待验证的性能配置
   * @returns {boolean} 是否有效
   */
  static isValidPerformanceConfig(performanceConfig) {
    return performanceConfig &&
           performanceConfig.cache &&
           typeof performanceConfig.cache.enabled === 'boolean' &&
           typeof performanceConfig.cache.maxSize === 'number' &&
           performanceConfig.cache.maxSize > 0;
  }

  /**
   * 验证样式配置
   * @param {*} styleConfig - 待验证的样式配置
   * @returns {boolean} 是否有效
   */
  static isValidStyleConfig(styleConfig) {
    return styleConfig &&
           styleConfig.theme &&
           typeof styleConfig.theme.name === 'string' &&
           styleConfig.theme.colors &&
           typeof styleConfig.theme.colors.primary === 'string';
  }

  /**
   * 验证交互配置
   * @param {*} interactionConfig - 待验证的交互配置
   * @returns {boolean} 是否有效
   */
  static isValidInteractionConfig(interactionConfig) {
    return interactionConfig &&
           interactionConfig.selection &&
           typeof interactionConfig.selection.enabled === 'boolean' &&
           interactionConfig.drag &&
           typeof interactionConfig.drag.enabled === 'boolean';
  }

  /**
   * 验证动画配置
   * @param {*} animationConfig - 待验证的动画配置
   * @returns {boolean} 是否有效
   */
  static isValidAnimationConfig(animationConfig) {
    return animationConfig &&
           typeof animationConfig.enabled === 'boolean' &&
           animationConfig.layout &&
           typeof animationConfig.layout.enabled === 'boolean' &&
           typeof animationConfig.layout.duration === 'number' &&
           animationConfig.layout.duration >= 0;
  }

  /**
   * 验证调试配置
   * @param {*} debugConfig - 待验证的调试配置
   * @returns {boolean} 是否有效
   */
  static isValidDebugConfig(debugConfig) {
    return debugConfig &&
           typeof debugConfig.enabled === 'boolean' &&
           typeof debugConfig.level === 'string' &&
           debugConfig.logging &&
           typeof debugConfig.logging.enabled === 'boolean';
  }
}

/**
 * 配置工具函数
 */
export class ConfigUtils {
  /**
   * 创建默认布局配置
   * @returns {LayoutConfig} 默认布局配置
   */
  static createDefaultLayoutConfig() {
    return {
      algorithm: 'hierarchical',
      direction: 'top-to-bottom',
      spacing: {
        node: 50,
        layer: 100,
        edge: 20
      },
      alignment: {
        horizontal: 'center',
        vertical: 'top'
      },
      constraints: {
        canvas: {
          minWidth: 100,
          minHeight: 100,
          maxWidth: 10000,
          maxHeight: 10000
        },
        node: {
          minSize: 20,
          maxSize: 500
        }
      },
      optimization: {
        enabled: true,
        strategies: ['layer-alignment', 'edge-crossing-reduction'],
        maxIterations: 100
      },
      animation: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      }
    };
  }

  /**
   * 创建默认性能配置
   * @returns {PerformanceConfig} 默认性能配置
   */
  static createDefaultPerformanceConfig() {
    return {
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000, // 5分钟
        strategy: 'lru'
      },
      debounce: {
        enabled: true,
        delay: 100,
        events: ['resize', 'scroll']
      },
      throttle: {
        enabled: true,
        interval: 16, // 60fps
        events: ['mousemove', 'drag']
      },
      monitoring: {
        enabled: false,
        metrics: ['layout-time', 'render-time', 'memory-usage'],
        sampleRate: 0.1
      },
      optimization: {
        lazyLoading: true,
        virtualScrolling: false,
        batchSize: 100
      }
    };
  }

  /**
   * 合并配置
   * @param {Object} defaultConfig - 默认配置
   * @param {Object} userConfig - 用户配置
   * @returns {Object} 合并后的配置
   */
  static mergeConfig(defaultConfig, userConfig) {
    if (!userConfig) return { ...defaultConfig };
    
    const merged = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (userConfig.hasOwnProperty(key)) {
        if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key]) && userConfig[key] !== null) {
          merged[key] = this.mergeConfig(merged[key] || {}, userConfig[key]);
        } else {
          merged[key] = userConfig[key];
        }
      }
    }
    
    return merged;
  }

  /**
   * 验证配置值
   * @param {*} value - 配置值
   * @param {ConfigValidationRule[]} rules - 验证规则
   * @returns {Object} 验证结果 {valid: boolean, errors: string[]}
   */
  static validateConfigValue(value, rules) {
    const errors = [];
    
    for (const rule of rules) {
      let isValid = true;
      
      switch (rule.type) {
        case 'required':
          isValid = value !== null && value !== undefined && value !== '';
          break;
        case 'type':
          isValid = typeof value === rule.constraint;
          break;
        case 'min':
          isValid = typeof value === 'number' && value >= rule.constraint;
          break;
        case 'max':
          isValid = typeof value === 'number' && value <= rule.constraint;
          break;
        case 'range':
          isValid = typeof value === 'number' && value >= rule.constraint.min && value <= rule.constraint.max;
          break;
        case 'enum':
          isValid = Array.isArray(rule.constraint) && rule.constraint.includes(value);
          break;
        case 'custom':
          isValid = typeof rule.validator === 'function' && rule.validator(value);
          break;
      }
      
      if (!isValid) {
        errors.push(rule.message || `Validation failed for rule: ${rule.type}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * 默认导出所有配置类型定义
 */
export default {
  ConfigLevel,
  ConfigType,
  ConfigStatus,
  LayoutConfigType,
  PerformanceConfigType,
  StyleConfigType,
  InteractionConfigType,
  AnimationConfigType,
  DebugConfigType,
  ConfigItemType,
  ConfigGroupType,
  ConfigChangeEventType,
  ConfigValidationRuleType,
  ConfigTypeValidator,
  ConfigUtils
};