/**
 * 综合测试脚本 - 验证PreviewLineSystem修复效果
 * 测试所有关键功能和错误处理机制
 */

const path = require('path');

// 模拟依赖模块
class MockEventManager {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error.message);
        }
      });
    }
  }
}

class MockConfigManager {
  constructor(config = {}) {
    this.config = config;
  }
  
  get(key, defaultValue) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }
  
  set(key, value) {
    const keys = key.split('.');
    let target = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    
    target[keys[keys.length - 1]] = value;
  }
}

class MockStateManager {
  constructor() {
    this.state = {};
  }
  
  getState(key) {
    const keys = key.split('.');
    let value = this.state;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  setState(key, value) {
    const keys = key.split('.');
    let target = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    
    target[keys[keys.length - 1]] = value;
  }
}

class MockPreviewLineRenderer {
  constructor() {
    this.dependencies = {};
  }
  
  setPositionCalculator(calculator) {
    this.dependencies.positionCalculator = calculator;
  }
  
  setCollisionDetector(detector) {
    this.dependencies.collisionDetector = detector;
  }
  
  setBranchLabelUtils(utils) {
    this.dependencies.branchLabelUtils = utils;
  }
  
  setPerformanceOptimizer(optimizer) {
    this.dependencies.performanceOptimizer = optimizer;
  }
  
  setCacheManager(manager) {
    this.dependencies.cacheManager = manager;
  }
  
  async createPreviewLine(config) {
    return {
      id: config.id || `line_${Date.now()}`,
      ...config
    };
  }
  
  async updatePreviewLine(id, updates) {
    return true;
  }
  
  async deletePreviewLine(id) {
    return true;
  }
}

class MockPositionCalculator {
  setCacheManager(manager) {
    this.cacheManager = manager;
  }
  
  async batchSyncPositions(ids) {
    return true;
  }
}

class MockCollisionDetector {
  setCacheManager(manager) {
    this.cacheManager = manager;
  }
  
  async optimizeOverlappingPreviewLines(lines) {
    return lines;
  }
}

class MockBranchAnalyzer {
  setGeometryUtils(utils) {
    this.geometryUtils = utils;
  }
  
  setBranchLabelUtils(utils) {
    this.branchLabelUtils = utils;
  }
  
  setCacheManager(manager) {
    this.cacheManager = manager;
  }
  
  async analyzeBranchStructure(lines, options) {
    return {
      totalLines: lines.length,
      branches: [],
      analysis: 'mock_analysis'
    };
  }
}

class MockPerformanceOptimizer {
  startBatch() {
    this.batchMode = true;
  }
  
  endBatch() {
    this.batchMode = false;
  }
}

class MockCacheManager {
  constructor() {
    this.cache = new Map();
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  set(key, value) {
    this.cache.set(key, value);
  }
}

class MockRouterConfigManager {
  constructor(options) {
    this.options = options;
    this.layoutEngine = null;
  }
  
  setLayoutEngine(engine) {
    this.layoutEngine = engine;
  }
  
  async updateLayoutDirection(direction) {
    return true;
  }
}

// 模拟静态工具类
const MockGeometryUtils = {
  calculateDistance: (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  },
  
  calculateAngle: (p1, p2) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
};

const MockValidationUtils = {
  validatePreviewLineConfig: (config) => {
    return {
      isValid: config && typeof config === 'object',
      errors: []
    };
  }
};

const MockBranchLabelUtils = {
  generateLabel: (branch) => {
    return `Branch_${Date.now()}`;
  }
};

// 设置模块路径映射
const moduleMap = {
  '../event/EventManager': MockEventManager,
  '../config/ConfigManager': MockConfigManager,
  '../state/StateManager': MockStateManager,
  '../renderer/PreviewLineRenderer': MockPreviewLineRenderer,
  '../calculator/PositionCalculator': MockPositionCalculator,
  '../detector/CollisionDetector': MockCollisionDetector,
  '../analyzer/BranchAnalyzer': MockBranchAnalyzer,
  '../optimizer/PerformanceOptimizer': MockPerformanceOptimizer,
  '../cache/CacheManager': MockCacheManager,
  '../router/RouterConfigManager': MockRouterConfigManager,
  '../geometry/GeometryUtils': MockGeometryUtils,
  '../validation/ValidationUtils': MockValidationUtils,
  '../branch/BranchLabelUtils': MockBranchLabelUtils
};

// 模拟require函数
const originalRequire = require;
require = function(id) {
  if (moduleMap[id]) {
    return moduleMap[id];
  }
  return originalRequire(id);
};

// 导入PreviewLineSystem
const PreviewLineSystem = originalRequire('./src/utils/preview-line/PreviewLineSystem.js');

// 测试函数
async function runComprehensiveTests() {
  console.log('🚀 开始综合测试...');
  
  const testResults = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // 测试1: 基本初始化
  try {
    console.log('\n📋 测试1: 基本初始化');
    const system = new PreviewLineSystem({
      enabledModules: {
        renderer: true,
        positionCalculator: true,
        collisionDetector: true,
        branchAnalyzer: true,
        performanceOptimizer: true,
        cacheManager: true,
        validation: true
      }
    });
    
    await system.init();
    
    if (system.isInitialized) {
      console.log('✅ 初始化成功');
      testResults.passed++;
    } else {
      throw new Error('初始化失败');
    }
  } catch (error) {
    console.error('❌ 初始化测试失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`初始化测试: ${error.message}`);
  }
  
  // 测试2: 布局引擎设置
  try {
    console.log('\n📋 测试2: 布局引擎设置');
    const system = new PreviewLineSystem();
    await system.init();
    
    const mockLayoutEngine = {
      name: 'MockLayoutEngine',
      version: '1.0.0'
    };
    
    const result = system.setLayoutEngine(mockLayoutEngine);
    
    if (result && system.isLayoutEngineReady()) {
      console.log('✅ 布局引擎设置成功');
      testResults.passed++;
    } else {
      throw new Error('布局引擎设置失败');
    }
  } catch (error) {
    console.error('❌ 布局引擎测试失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`布局引擎测试: ${error.message}`);
  }
  
  // 测试3: 预览线操作
  try {
    console.log('\n📋 测试3: 预览线操作');
    const system = new PreviewLineSystem({
      enabledModules: {
        renderer: true,
        validation: true
      }
    });
    await system.init();
    
    // 创建预览线
    const lineConfig = {
      id: 'test_line_1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 100 },
      style: { color: '#ff0000' }
    };
    
    const createdLine = await system.createPreviewLine(lineConfig);
    
    if (createdLine && createdLine.id === 'test_line_1') {
      console.log('✅ 预览线创建成功');
      
      // 更新预览线
      const updateResult = await system.updatePreviewLine('test_line_1', {
        style: { color: '#00ff00' }
      });
      
      if (updateResult) {
        console.log('✅ 预览线更新成功');
        
        // 删除预览线
        const deleteResult = await system.deletePreviewLine('test_line_1');
        
        if (deleteResult) {
          console.log('✅ 预览线删除成功');
          testResults.passed++;
        } else {
          throw new Error('预览线删除失败');
        }
      } else {
        throw new Error('预览线更新失败');
      }
    } else {
      throw new Error('预览线创建失败');
    }
  } catch (error) {
    console.error('❌ 预览线操作测试失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`预览线操作测试: ${error.message}`);
  }
  
  // 测试4: 错误处理机制
  try {
    console.log('\n📋 测试4: 错误处理机制');
    const system = new PreviewLineSystem();
    await system.init();
    
    // 测试undefined error处理
    let errorHandled = false;
    system.on('system:error', (errorInfo) => {
      if (errorInfo.error instanceof Error) {
        errorHandled = true;
      }
    });
    
    // 触发一个undefined error
    system.handleError(undefined, 'test_context');
    
    if (errorHandled) {
      console.log('✅ undefined error处理正确');
      testResults.passed++;
    } else {
      throw new Error('undefined error处理失败');
    }
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`错误处理测试: ${error.message}`);
  }
  
  // 测试5: 模块依赖验证
  try {
    console.log('\n📋 测试5: 模块依赖验证');
    const system = new PreviewLineSystem({
      enabledModules: {
        renderer: true,
        positionCalculator: true,
        collisionDetector: true,
        branchAnalyzer: true,
        performanceOptimizer: true,
        cacheManager: true,
        validation: true
      }
    });
    
    await system.init();
    
    // 检查所有模块是否正确初始化
    const modules = [
      'eventManager', 'configManager', 'stateManager',
      'renderer', 'positionCalculator', 'collisionDetector',
      'branchAnalyzer', 'performanceOptimizer', 'cacheManager',
      'geometryUtils', 'validationUtils', 'branchLabelUtils',
      'routerConfigManager'
    ];
    
    let allModulesReady = true;
    const missingModules = [];
    
    for (const module of modules) {
      if (!system[module]) {
        allModulesReady = false;
        missingModules.push(module);
      }
    }
    
    if (allModulesReady) {
      console.log('✅ 所有模块依赖正确初始化');
      testResults.passed++;
    } else {
      throw new Error(`缺少模块: ${missingModules.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ 模块依赖验证失败:', error.message);
    testResults.failed++;
    testResults.errors.push(`模块依赖验证: ${error.message}`);
  }
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 错误详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过！PreviewLineSystem修复成功！');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步修复。');
  }
  
  return testResults;
}

// 运行测试
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveTests };