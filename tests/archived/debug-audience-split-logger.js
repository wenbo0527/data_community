/**
 * 人群分流节点预览线调试日志器
 * 提供详细的调试信息和错误日志输出功能
 */

// 日志级别定义
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// 日志颜色定义
const LogColors = {
  ERROR: '\x1b[31m', // 红色
  WARN: '\x1b[33m',  // 黄色
  INFO: '\x1b[36m',  // 青色
  DEBUG: '\x1b[32m', // 绿色
  TRACE: '\x1b[37m', // 白色
  RESET: '\x1b[0m'   // 重置
};

// 人群分流节点调试日志器
class AudienceSplitDebugLogger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || LogLevel.INFO;
    this.enableColors = options.enableColors !== false;
    this.enableTimestamp = options.enableTimestamp !== false;
    this.enableStackTrace = options.enableStackTrace || false;
    this.logHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
    
    // 性能监控
    this.performanceMetrics = {
      previewLineCreation: [],
      positionCalculation: [],
      branchValidation: []
    };
  }
  
  /**
   * 格式化日志消息
   */
  formatMessage(level, category, message, data = null) {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    const color = this.enableColors ? LogColors[level] : '';
    const reset = this.enableColors ? LogColors.RESET : '';
    
    let formattedMessage = `${color}[${level}]${reset}`;
    
    if (timestamp) {
      formattedMessage += ` ${timestamp}`;
    }
    
    formattedMessage += ` [${category}] ${message}`;
    
    if (data) {
      formattedMessage += '\n' + this.formatData(data);
    }
    
    return formattedMessage;
  }
  
  /**
   * 格式化数据对象
   */
  formatData(data) {
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  }
  
  /**
   * 记录日志
   */
  log(level, category, message, data = null) {
    if (this.getLogLevelValue(level) > this.logLevel) {
      return;
    }
    
    const formattedMessage = this.formatMessage(level, category, message, data);
    console.log(formattedMessage);
    
    // 保存到历史记录
    this.logHistory.push({
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    });
    
    // 限制历史记录大小
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
    
    // 如果是错误级别且启用堆栈跟踪
    if (level === 'ERROR' && this.enableStackTrace) {
      console.trace('Stack trace:');
    }
  }
  
  /**
   * 获取日志级别数值
   */
  getLogLevelValue(level) {
    return LogLevel[level] || LogLevel.INFO;
  }
  
  /**
   * 错误日志
   */
  error(category, message, data = null) {
    this.log('ERROR', category, message, data);
  }
  
  /**
   * 警告日志
   */
  warn(category, message, data = null) {
    this.log('WARN', category, message, data);
  }
  
  /**
   * 信息日志
   */
  info(category, message, data = null) {
    this.log('INFO', category, message, data);
  }
  
  /**
   * 调试日志
   */
  debug(category, message, data = null) {
    this.log('DEBUG', category, message, data);
  }
  
  /**
   * 跟踪日志
   */
  trace(category, message, data = null) {
    this.log('TRACE', category, message, data);
  }
  
  /**
   * 记录性能指标
   */
  recordPerformance(category, operation, duration, metadata = {}) {
    const record = {
      timestamp: Date.now(),
      operation,
      duration,
      metadata
    };
    
    if (this.performanceMetrics[category]) {
      this.performanceMetrics[category].push(record);
    }
    
    this.debug('PERFORMANCE', `${category}.${operation} took ${duration}ms`, metadata);
  }
  
  /**
   * 获取性能统计
   */
  getPerformanceStats(category) {
    const records = this.performanceMetrics[category] || [];
    if (records.length === 0) {
      return null;
    }
    
    const durations = records.map(r => r.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
      count: records.length,
      total,
      average: avg,
      min,
      max,
      recent: records.slice(-10) // 最近10条记录
    };
  }
  
  /**
   * 导出日志历史
   */
  exportLogs(filter = null) {
    let logs = this.logHistory;
    
    if (filter) {
      logs = logs.filter(log => {
        if (filter.level && log.level !== filter.level) return false;
        if (filter.category && log.category !== filter.category) return false;
        if (filter.since && log.timestamp < filter.since) return false;
        if (filter.until && log.timestamp > filter.until) return false;
        return true;
      });
    }
    
    return logs;
  }
  
  /**
   * 清空日志历史
   */
  clearLogs() {
    this.logHistory = [];
    this.performanceMetrics = {
      previewLineCreation: [],
      positionCalculation: [],
      branchValidation: []
    };
  }
}

// 人群分流节点专用调试方法
class AudienceSplitDebugger {
  constructor(logger = null) {
    this.logger = logger || new AudienceSplitDebugLogger();
  }
  
  /**
   * 调试节点信息
   */
  debugNodeInfo(node, context = 'UNKNOWN') {
    const startTime = performance.now();
    
    this.logger.info('NODE_INFO', `调试节点信息 - ${context}`, {
      nodeId: node?.id,
      nodeType: node?.getData?.()?.type || node?.type,
      position: { x: node?.x, y: node?.y },
      size: { width: node?.width, height: node?.height },
      hasGetData: typeof node?.getData === 'function',
      dataKeys: node?.getData ? Object.keys(node.getData()) : 'N/A'
    });
    
    const nodeData = node?.getData?.() || {};
    
    // 调试配置状态
    this.debugConfigurationState(nodeData, node?.id);
    
    // 调试分支信息
    this.debugBranchInfo(nodeData, node?.id);
    
    const duration = performance.now() - startTime;
    this.logger.recordPerformance('nodeInfo', 'debugNodeInfo', duration, { context, nodeId: node?.id });
  }
  
  /**
   * 调试配置状态
   */
  debugConfigurationState(nodeData, nodeId) {
    const configInfo = {
      isConfigured: nodeData.isConfigured,
      hasConfig: !!nodeData.config,
      hasCrowdLayers: !!(nodeData.crowdLayers && nodeData.crowdLayers.length > 0),
      crowdLayerCount: nodeData.crowdLayers?.length || 0,
      hasBranches: !!(nodeData.branches && nodeData.branches.length > 0),
      branchCount: nodeData.branches?.length || 0
    };
    
    if (!configInfo.isConfigured) {
      this.logger.warn('CONFIG_STATE', `节点未配置 - ${nodeId}`, configInfo);
    } else {
      this.logger.info('CONFIG_STATE', `节点已配置 - ${nodeId}`, configInfo);
    }
    
    // 检查配置一致性
    if (configInfo.isConfigured && !configInfo.hasCrowdLayers && !configInfo.hasBranches) {
      this.logger.error('CONFIG_INCONSISTENCY', `配置状态不一致 - ${nodeId}`, {
        message: '节点标记为已配置但缺少人群层或分支信息',
        ...configInfo
      });
    }
  }
  
  /**
   * 调试分支信息
   */
  debugBranchInfo(nodeData, nodeId) {
    const branches = nodeData.branches || [];
    const crowdLayers = nodeData.crowdLayers || [];
    
    this.logger.debug('BRANCH_INFO', `分支信息详情 - ${nodeId}`, {
      branchCount: branches.length,
      crowdLayerCount: crowdLayers.length,
      branches: branches.map(b => ({
        id: b.id,
        label: b.label,
        type: b.type,
        isDefault: b.isDefault
      })),
      crowdLayers: crowdLayers.map(l => ({
        id: l.id,
        name: l.name,
        conditionCount: l.conditions?.length || 0
      }))
    });
    
    // 验证分支和人群层的一致性
    if (crowdLayers.length > 0 && branches.length > 0) {
      const expectedBranchCount = crowdLayers.length + 1; // +1 for 未命中分支
      if (branches.length !== expectedBranchCount) {
        this.logger.warn('BRANCH_INCONSISTENCY', `分支数量与人群层不匹配 - ${nodeId}`, {
          crowdLayerCount: crowdLayers.length,
          branchCount: branches.length,
          expectedBranchCount
        });
      }
    }
  }
  
  /**
   * 调试预览线创建过程
   */
  debugPreviewLineCreation(node, branches, options = {}) {
    const startTime = performance.now();
    const nodeId = node?.id;
    
    this.logger.info('PREVIEW_CREATION', `开始预览线创建 - ${nodeId}`, {
      nodeId,
      branchCount: branches?.length || 0,
      options,
      timestamp: Date.now()
    });
    
    // 调试每个分支的创建过程
    if (branches && branches.length > 0) {
      branches.forEach((branch, index) => {
        this.debugBranchPreviewCreation(node, branch, index, branches.length);
      });
    } else {
      this.logger.warn('PREVIEW_CREATION', `无分支信息，跳过预览线创建 - ${nodeId}`);
    }
    
    const duration = performance.now() - startTime;
    this.logger.recordPerformance('previewLineCreation', 'debugPreviewLineCreation', duration, {
      nodeId,
      branchCount: branches?.length || 0
    });
  }
  
  /**
   * 调试单个分支预览线创建
   */
  debugBranchPreviewCreation(node, branch, index, totalBranches) {
    const nodeId = node?.id;
    
    this.logger.debug('BRANCH_PREVIEW', `分支预览线创建 - ${nodeId}`, {
      nodeId,
      branchId: branch?.id,
      branchLabel: branch?.label,
      branchIndex: index,
      totalBranches,
      branchType: branch?.type,
      isDefault: branch?.isDefault
    });
  }
  
  /**
   * 调试位置计算
   */
  debugPositionCalculation(node, branch, branchIndex, result) {
    const startTime = performance.now();
    const nodeId = node?.id;
    
    const calculationData = {
      nodeId,
      branchId: branch?.id,
      branchIndex,
      nodePosition: { x: node?.x, y: node?.y },
      nodeSize: { width: node?.width, height: node?.height },
      calculatedPosition: result,
      isValidResult: !!(result && typeof result.x === 'number' && typeof result.y === 'number')
    };
    
    if (calculationData.isValidResult) {
      this.logger.debug('POSITION_CALC', `位置计算成功 - ${nodeId}`, calculationData);
    } else {
      this.logger.error('POSITION_CALC', `位置计算失败 - ${nodeId}`, calculationData);
    }
    
    const duration = performance.now() - startTime;
    this.logger.recordPerformance('positionCalculation', 'debugPositionCalculation', duration, {
      nodeId,
      branchId: branch?.id,
      success: calculationData.isValidResult
    });
  }
  
  /**
   * 调试连接检查
   */
  debugConnectionCheck(node, branchId, hasConnection) {
    const nodeId = node?.id;
    
    this.logger.debug('CONNECTION_CHECK', `连接检查 - ${nodeId}`, {
      nodeId,
      branchId,
      hasConnection,
      checkResult: hasConnection ? '已有连接' : '无连接'
    });
    
    if (hasConnection) {
      this.logger.info('CONNECTION_CHECK', `跳过已连接分支 - ${nodeId}`, {
        nodeId,
        branchId,
        reason: '分支已有真实连接'
      });
    }
  }
  
  /**
   * 调试错误情况
   */
  debugError(category, error, context = {}) {
    this.logger.error(category, error.message || String(error), {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now()
    });
  }
  
  /**
   * 生成调试报告
   */
  generateDebugReport() {
    const report = {
      timestamp: new Date().toISOString(),
      logSummary: {
        total: this.logger.logHistory.length,
        byLevel: {}
      },
      performanceStats: {},
      recentErrors: [],
      recentWarnings: []
    };
    
    // 统计日志级别
    this.logger.logHistory.forEach(log => {
      report.logSummary.byLevel[log.level] = (report.logSummary.byLevel[log.level] || 0) + 1;
    });
    
    // 性能统计
    Object.keys(this.logger.performanceMetrics).forEach(category => {
      const stats = this.logger.getPerformanceStats(category);
      if (stats) {
        report.performanceStats[category] = stats;
      }
    });
    
    // 最近的错误和警告
    const recentLogs = this.logger.logHistory.slice(-50);
    report.recentErrors = recentLogs.filter(log => log.level === 'ERROR');
    report.recentWarnings = recentLogs.filter(log => log.level === 'WARN');
    
    return report;
  }
  
  /**
   * 打印调试报告
   */
  printDebugReport() {
    const report = this.generateDebugReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 人群分流节点调试报告');
    console.log('='.repeat(60));
    
    console.log('\n📈 日志统计:');
    console.log(`  总日志数: ${report.logSummary.total}`);
    Object.entries(report.logSummary.byLevel).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });
    
    console.log('\n⚡ 性能统计:');
    Object.entries(report.performanceStats).forEach(([category, stats]) => {
      console.log(`  ${category}:`);
      console.log(`    操作次数: ${stats.count}`);
      console.log(`    平均耗时: ${stats.average.toFixed(2)}ms`);
      console.log(`    最小耗时: ${stats.min}ms`);
      console.log(`    最大耗时: ${stats.max}ms`);
    });
    
    if (report.recentErrors.length > 0) {
      console.log('\n❌ 最近错误:');
      report.recentErrors.slice(-5).forEach(error => {
        console.log(`  [${error.category}] ${error.message}`);
      });
    }
    
    if (report.recentWarnings.length > 0) {
      console.log('\n⚠️ 最近警告:');
      report.recentWarnings.slice(-5).forEach(warning => {
        console.log(`  [${warning.category}] ${warning.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// 创建全局调试器实例
const globalDebugger = new AudienceSplitDebugger();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AudienceSplitDebugLogger,
    AudienceSplitDebugger,
    LogLevel,
    globalDebugger
  };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.AudienceSplitDebugLogger = AudienceSplitDebugLogger;
  window.AudienceSplitDebugger = AudienceSplitDebugger;
  window.audienceSplitDebugger = globalDebugger;
}

// 使用示例
function demonstrateDebugger() {
  console.log('🎯 人群分流节点调试器演示');
  console.log('='.repeat(40));
  
  const debugger = new AudienceSplitDebugger();
  
  // 模拟节点
  const mockNode = {
    id: 'audience-split-demo',
    x: 200,
    y: 150,
    width: 120,
    height: 60,
    getData: () => ({
      type: 'audience-split',
      isConfigured: true,
      crowdLayers: [
        { id: 'layer1', name: '高价值用户', conditions: [] }
      ],
      branches: [
        { id: 'branch-1', label: '高价值用户', type: 'audience' },
        { id: 'branch-2', label: '未命中人群', type: 'audience', isDefault: true }
      ]
    })
  };
  
  // 调试节点信息
  debugger.debugNodeInfo(mockNode, 'DEMO');
  
  // 调试预览线创建
  const branches = mockNode.getData().branches;
  debugger.debugPreviewLineCreation(mockNode, branches);
  
  // 调试位置计算
  branches.forEach((branch, index) => {
    const position = { x: 200 + index * 80, y: 250 };
    debugger.debugPositionCalculation(mockNode, branch, index, position);
  });
  
  // 生成报告
  setTimeout(() => {
    debugger.printDebugReport();
  }, 100);
}

// 自动演示
if (typeof require !== 'undefined' && require.main === module) {
  demonstrateDebugger();
}