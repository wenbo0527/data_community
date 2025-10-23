/**
 * 预览线系统统一导出
 * 提供所有预览线相关模块的统一入口
 */

// 主系统
export { default as PreviewLineSystem, getPreviewLineSystem, resetPreviewLineSystem } from './PreviewLineSystem.js';

// 核心模块
export { default as EventManager } from './events/EventManager.js';
export { default as StateManager } from './state/StateManager.js';
export { default as ConfigManager } from './core/ConfigManager.js';

// 渲染器模块
export { default as PreviewLineRenderer } from './renderers/PreviewLineRenderer.js';
export { default as StyleRenderer } from './renderers/StyleRenderer.js';

// 算法模块
export { default as PositionCalculator } from './algorithms/PositionCalculator.js';
export { default as CollisionDetector } from './algorithms/CollisionDetector.js';
export { default as BranchAnalyzer } from './algorithms/BranchAnalyzer.js';

// 工具类模块
export { default as GeometryUtils } from './utils/GeometryUtils.js';
export { default as ValidationUtils } from './utils/ValidationUtils.js';
export { default as BranchLabelUtils } from './utils/BranchLabelUtils.js';

// 性能优化模块
export { default as PerformanceOptimizer } from './performance/PerformanceOptimizer.js';
export { default as CacheManager } from './performance/CacheManager.js';

// 便捷创建函数
export function createPreviewLineSystem(options = {}) {
  return getPreviewLineSystem(options);
}

// 模块版本信息
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// 模块信息
export const MODULE_INFO = {
  name: 'PreviewLineSystem',
  version: VERSION,
  buildDate: BUILD_DATE,
  description: '预览线系统 - 提供完整的预览线管理、渲染和优化功能',
  author: 'Preview Line Team',
  modules: {
    core: ['EventManager', 'StateManager', 'ConfigManager'],
    renderers: ['PreviewLineRenderer', 'StyleRenderer'],
    algorithms: ['PositionCalculator', 'CollisionDetector', 'BranchAnalyzer'],
    utils: ['GeometryUtils', 'ValidationUtils', 'BranchLabelUtils'],
    performance: ['PerformanceOptimizer', 'CacheManager']
  }
};

// 默认配置
export const DEFAULT_CONFIG = {
  // 系统配置
  system: {
    autoInit: true,
    enableDebug: false,
    enableStats: true,
    enableEvents: true
  },
  
  // 启用的模块
  enabledModules: {
    renderer: true,
    collision: true,
    position: true,
    branch: true,
    performance: true,
    cache: true,
    validation: true
  },
  
  // 渲染配置
  rendering: {
    enableBatching: true,
    batchSize: 50,
    frameRate: 60,
    enableOptimization: true,
    enableCaching: true
  },
  
  // 性能配置
  performance: {
    virtualization: {
      enabled: false,
      threshold: 1000
    },
    debounce: {
      render: 16,
      resize: 100
    }
  }
};

// 工具函数
export const utils = {
  /**
   * 合并配置
   * @param {Object} defaultConfig - 默认配置
   * @param {Object} userConfig - 用户配置
   * @returns {Object} 合并后的配置
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    Object.keys(userConfig).forEach(key => {
      if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
        merged[key] = this.mergeConfig(merged[key] || {}, userConfig[key]);
      } else {
        merged[key] = userConfig[key];
      }
    });
    
    return merged;
  },
  
  /**
   * 验证配置
   * @param {Object} config - 配置对象
   * @returns {Object} 验证结果
   */
  validateConfig(config) {
    const errors = [];
    const warnings = [];
    
    // 基本结构验证
    if (!config || typeof config !== 'object') {
      errors.push('配置必须是对象');
      return { valid: false, errors, warnings };
    }
    
    // 系统配置验证
    if (config.system) {
      if (typeof config.system.autoInit !== 'undefined' && typeof config.system.autoInit !== 'boolean') {
        errors.push('system.autoInit 必须是布尔值');
      }
      
      if (typeof config.system.enableDebug !== 'undefined' && typeof config.system.enableDebug !== 'boolean') {
        errors.push('system.enableDebug 必须是布尔值');
      }
    }
    
    // 渲染配置验证
    if (config.rendering) {
      if (config.rendering.batchSize && (typeof config.rendering.batchSize !== 'number' || config.rendering.batchSize <= 0)) {
        errors.push('rendering.batchSize 必须是正数');
      }
      
      if (config.rendering.frameRate && (typeof config.rendering.frameRate !== 'number' || config.rendering.frameRate <= 0 || config.rendering.frameRate > 120)) {
        errors.push('rendering.frameRate 必须是 1-120 之间的数字');
      }
    }
    
    // 性能配置验证
    if (config.performance && config.performance.virtualization) {
      if (config.performance.virtualization.threshold && 
          (typeof config.performance.virtualization.threshold !== 'number' || config.performance.virtualization.threshold <= 0)) {
        errors.push('performance.virtualization.threshold 必须是正数');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },
  
  /**
   * 获取模块依赖关系
   * @returns {Object} 依赖关系图
   */
  getModuleDependencies() {
    return {
      PreviewLineSystem: {
        dependencies: ['EventManager', 'StateManager', 'ConfigManager', 'PreviewLineRenderer'],
        optional: ['PerformanceOptimizer', 'CacheManager']
      },
      PreviewLineRenderer: {
        dependencies: ['StyleRenderer'],
        optional: ['PositionCalculator', 'CollisionDetector', 'BranchLabelUtils']
      },
      CollisionDetector: {
        dependencies: [],
        optional: ['PositionCalculator', 'CacheManager']
      },
      BranchAnalyzer: {
        dependencies: ['GeometryUtils'],
        optional: ['PositionCalculator', 'CollisionDetector', 'BranchLabelUtils']
      },
      ValidationUtils: {
        dependencies: ['GeometryUtils'],
        optional: []
      },
      BranchLabelUtils: {
        dependencies: ['GeometryUtils'],
        optional: ['StyleRenderer', 'ConfigManager']
      }
    };
  },
  
  /**
   * 检查浏览器兼容性
   * @returns {Object} 兼容性检查结果
   */
  checkBrowserCompatibility() {
    const features = {
      es6: typeof Symbol !== 'undefined',
      promises: typeof Promise !== 'undefined',
      weakMap: typeof WeakMap !== 'undefined',
      requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
      performance: typeof performance !== 'undefined' && typeof performance.now === 'function',
      localStorage: (() => {
        try {
          const test = '__test__';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      })()
    };
    
    const supported = Object.values(features).every(Boolean);
    const missing = Object.keys(features).filter(key => !features[key]);
    
    return {
      supported,
      features,
      missing,
      recommendations: missing.length > 0 ? [
        '建议使用现代浏览器 (Chrome 60+, Firefox 55+, Safari 12+)',
        '考虑添加 polyfill 支持旧浏览器'
      ] : []
    };
  }
};

// 预设配置
export const presets = {
  /**
   * 开发环境配置
   */
  development: {
    system: {
      enableDebug: true,
      enableStats: true
    },
    rendering: {
      enableOptimization: false,
      enableCaching: false
    },
    performance: {
      monitoring: {
        enabled: true,
        interval: 1000
      }
    },
    debug: {
      enabled: true,
      level: 'debug',
      showBounds: true,
      showFPS: true
    }
  },
  
  /**
   * 生产环境配置
   */
  production: {
    system: {
      enableDebug: false,
      enableStats: false
    },
    rendering: {
      enableOptimization: true,
      enableCaching: true,
      batchSize: 100
    },
    performance: {
      virtualization: {
        enabled: true,
        threshold: 500
      },
      monitoring: {
        enabled: false
      }
    },
    debug: {
      enabled: false
    }
  },
  
  /**
   * 高性能配置
   */
  highPerformance: {
    rendering: {
      enableOptimization: true,
      enableCaching: true,
      batchSize: 200,
      frameRate: 30
    },
    performance: {
      virtualization: {
        enabled: true,
        threshold: 200
      },
      debounce: {
        render: 32,
        resize: 200
      },
      memory: {
        enableGC: true,
        gcInterval: 10000
      }
    }
  },
  
  /**
   * 最小配置
   */
  minimal: {
    enabledModules: {
      renderer: true,
      collision: false,
      position: true,
      branch: false,
      performance: false,
      cache: false,
      validation: false
    },
    rendering: {
      enableBatching: false,
      enableOptimization: false,
      enableCaching: false
    }
  }
};

// 快捷创建函数
export function createDevelopmentSystem(options = {}) {
  const config = utils.mergeConfig(DEFAULT_CONFIG, presets.development);
  return new PreviewLineSystem(utils.mergeConfig(config, options));
}

export function createProductionSystem(options = {}) {
  const config = utils.mergeConfig(DEFAULT_CONFIG, presets.production);
  return new PreviewLineSystem(utils.mergeConfig(config, options));
}

export function createHighPerformanceSystem(options = {}) {
  const config = utils.mergeConfig(DEFAULT_CONFIG, presets.highPerformance);
  return new PreviewLineSystem(utils.mergeConfig(config, options));
}

export function createMinimalSystem(options = {}) {
  const config = utils.mergeConfig(DEFAULT_CONFIG, presets.minimal);
  return new PreviewLineSystem(utils.mergeConfig(config, options));
}

// 调试工具
export const debug = {
  /**
   * 启用全局调试
   */
  enableGlobalDebug() {
    if (typeof window !== 'undefined') {
      window.PreviewLineSystemDebug = {
        getDefaultInstance: getPreviewLineSystem,
        utils,
        presets,
        MODULE_INFO
      };
      console.log('预览线系统调试模式已启用，可通过 window.PreviewLineSystemDebug 访问');
    }
  },
  
  /**
   * 禁用全局调试
   */
  disableGlobalDebug() {
    if (typeof window !== 'undefined' && window.PreviewLineSystemDebug) {
      delete window.PreviewLineSystemDebug;
      console.log('预览线系统调试模式已禁用');
    }
  },
  
  /**
   * 获取系统信息
   * @param {PreviewLineSystem} system - 系统实例
   * @returns {Object} 系统信息
   */
  getSystemInfo(system) {
    if (!system) {
      return { error: '系统实例不存在' };
    }
    
    return {
      initialized: system.initialized,
      destroyed: system.destroyed,
      moduleStatus: system.getModuleStatus(),
      stats: system.getPerformanceStats(),
      config: system.getConfig(),
      state: system.getState()
    };
  }
};

// 自动启用调试模式（仅在开发环境）
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  debug.enableGlobalDebug();
}