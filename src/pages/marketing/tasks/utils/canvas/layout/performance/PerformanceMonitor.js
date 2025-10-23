/**
 * 性能监控器
 * 负责布局性能的监控、统计和报告生成
 */

export class PerformanceMonitor {
  constructor(config = {}) {
    this.enabled = config.enabled !== false; // 默认启用
    this.maxRecords = config.maxRecords || 100; // 最大记录数
    this.records = []; // 性能记录
    this.currentSessions = new Map(); // 当前进行中的会话
    this.thresholds = {
      warning: config.warningThreshold || 1000, // 警告阈值（毫秒）
      error: config.errorThreshold || 3000, // 错误阈值（毫秒）
      ...config.thresholds
    };
    
    console.log(`📊 [性能监控器] 初始化完成，最大记录数: ${this.maxRecords}`);
  }

  /**
   * 开始性能监控会话
   * @param {string} sessionId - 会话标识符
   * @param {Object} metadata - 会话元数据
   * @returns {Object} 会话信息
   */
  startSession(sessionId, metadata = {}) {
    if (!this.enabled) {
      return null;
    }

    const session = {
      id: sessionId,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      metadata: {
        nodeCount: 0,
        edgeCount: 0,
        layoutType: 'unknown',
        ...metadata
      },
      phases: new Map(), // 各阶段的性能数据
      markers: [], // 性能标记点
      memoryUsage: this.getMemoryUsage()
    };

    this.currentSessions.set(sessionId, session);
    console.log(`🚀 [性能监控器] 开始会话: ${sessionId}`, metadata);
    
    return session;
  }

  /**
   * 结束性能监控会话
   * @param {string} sessionId - 会话标识符
   * @param {Object} result - 执行结果
   * @returns {Object} 性能记录
   */
  endSession(sessionId, result = {}) {
    if (!this.enabled) {
      return null;
    }

    const session = this.currentSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ [性能监控器] 未找到会话: ${sessionId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - session.startTime;
    
    const record = {
      sessionId,
      startTime: session.startTime,
      endTime,
      duration,
      timestamp: session.startTimestamp,
      metadata: session.metadata,
      phases: Object.fromEntries(session.phases),
      markers: session.markers,
      memoryUsage: {
        start: session.memoryUsage,
        end: this.getMemoryUsage()
      },
      result: {
        success: result.success !== false,
        error: result.error || null,
        ...result
      },
      performance: this.calculatePerformanceMetrics(session, duration)
    };

    // 添加到记录中
    this.addRecord(record);
    
    // 清理当前会话
    this.currentSessions.delete(sessionId);
    
    // 检查性能阈值
    this.checkThresholds(record);
    
    console.log(`🏁 [性能监控器] 结束会话: ${sessionId}, 耗时: ${duration.toFixed(2)}ms`);
    
    return record;
  }

  /**
   * 标记性能阶段开始
   * @param {string} sessionId - 会话标识符
   * @param {string} phaseName - 阶段名称
   * @param {Object} metadata - 阶段元数据
   */
  markPhaseStart(sessionId, phaseName, metadata = {}) {
    if (!this.enabled) {
      return;
    }

    const session = this.currentSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ [性能监控器] 未找到会话: ${sessionId}`);
      return;
    }

    const phaseData = {
      name: phaseName,
      startTime: performance.now(),
      metadata
    };

    session.phases.set(phaseName, phaseData);
    console.log(`📍 [性能监控器] 阶段开始: ${sessionId} -> ${phaseName}`);
  }

  /**
   * 标记性能阶段结束
   * @param {string} sessionId - 会话标识符
   * @param {string} phaseName - 阶段名称
   * @param {Object} result - 阶段结果
   */
  markPhaseEnd(sessionId, phaseName, result = {}) {
    if (!this.enabled) {
      return;
    }

    const session = this.currentSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ [性能监控器] 未找到会话: ${sessionId}`);
      return;
    }

    const phaseData = session.phases.get(phaseName);
    if (!phaseData) {
      console.warn(`⚠️ [性能监控器] 未找到阶段: ${phaseName}`);
      return;
    }

    const endTime = performance.now();
    phaseData.endTime = endTime;
    phaseData.duration = endTime - phaseData.startTime;
    phaseData.result = result;

    console.log(`🏁 [性能监控器] 阶段结束: ${sessionId} -> ${phaseName}, 耗时: ${phaseData.duration.toFixed(2)}ms`);
  }

  /**
   * 添加性能标记点
   * @param {string} sessionId - 会话标识符
   * @param {string} markerName - 标记名称
   * @param {Object} data - 标记数据
   */
  addMarker(sessionId, markerName, data = {}) {
    if (!this.enabled) {
      return;
    }

    const session = this.currentSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ [性能监控器] 未找到会话: ${sessionId}`);
      return;
    }

    const marker = {
      name: markerName,
      time: performance.now(),
      relativeTime: performance.now() - session.startTime,
      data
    };

    session.markers.push(marker);
    console.log(`📌 [性能监控器] 添加标记: ${sessionId} -> ${markerName}`);
  }

  /**
   * 添加性能记录
   * @param {Object} record - 性能记录
   */
  addRecord(record) {
    this.records.push(record);
    
    // 如果超过最大记录数，删除最旧的记录
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }
  }

  /**
   * 计算性能指标
   * @param {Object} session - 会话数据
   * @param {number} totalDuration - 总耗时
   * @returns {Object} 性能指标
   */
  calculatePerformanceMetrics(session, totalDuration) {
    const phases = Object.fromEntries(session.phases);
    const phaseMetrics = {};
    
    // 计算各阶段性能指标
    for (const [phaseName, phaseData] of Object.entries(phases)) {
      if (phaseData.duration !== undefined) {
        phaseMetrics[phaseName] = {
          duration: phaseData.duration,
          percentage: (phaseData.duration / totalDuration) * 100
        };
      }
    }

    // 计算整体性能指标
    const nodeCount = session.metadata.nodeCount || 0;
    const edgeCount = session.metadata.edgeCount || 0;
    const totalElements = nodeCount + edgeCount;

    return {
      totalDuration,
      phases: phaseMetrics,
      throughput: {
        elementsPerSecond: totalElements > 0 ? (totalElements / (totalDuration / 1000)) : 0,
        nodesPerSecond: nodeCount > 0 ? (nodeCount / (totalDuration / 1000)) : 0,
        edgesPerSecond: edgeCount > 0 ? (edgeCount / (totalDuration / 1000)) : 0
      },
      efficiency: {
        timePerElement: totalElements > 0 ? totalDuration / totalElements : 0,
        timePerNode: nodeCount > 0 ? totalDuration / nodeCount : 0,
        timePerEdge: edgeCount > 0 ? totalDuration / edgeCount : 0
      }
    };
  }

  /**
   * 检查性能阈值
   * @param {Object} record - 性能记录
   */
  checkThresholds(record) {
    const duration = record.duration;
    
    if (duration > this.thresholds.error) {
      console.error(`🚨 [性能监控器] 性能错误: ${record.sessionId}, 耗时: ${duration.toFixed(2)}ms (阈值: ${this.thresholds.error}ms)`);
    } else if (duration > this.thresholds.warning) {
      console.warn(`⚠️ [性能监控器] 性能警告: ${record.sessionId}, 耗时: ${duration.toFixed(2)}ms (阈值: ${this.thresholds.warning}ms)`);
    }
  }

  /**
   * 获取内存使用情况
   * @returns {Object} 内存使用数据
   */
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * 生成性能报告
   * @param {Object} options - 报告选项
   * @returns {Object} 性能报告
   */
  generateReport(options = {}) {
    const {
      timeRange = 3600000, // 默认1小时
      includeDetails = false,
      groupBy = null
    } = options;

    const now = Date.now();
    const filteredRecords = this.records.filter(record => 
      now - record.timestamp <= timeRange
    );

    if (filteredRecords.length === 0) {
      return {
        summary: { totalSessions: 0 },
        records: []
      };
    }

    // 计算统计数据
    const durations = filteredRecords.map(r => r.duration);
    const successfulRecords = filteredRecords.filter(r => r.result.success);
    
    const summary = {
      totalSessions: filteredRecords.length,
      successfulSessions: successfulRecords.length,
      failedSessions: filteredRecords.length - successfulRecords.length,
      successRate: filteredRecords.length > 0 ? (successfulRecords.length / filteredRecords.length) : 0,
      performance: {
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        medianDuration: this.calculateMedian(durations)
      },
      timeRange: {
        start: Math.min(...filteredRecords.map(r => r.timestamp)),
        end: Math.max(...filteredRecords.map(r => r.timestamp)),
        duration: timeRange
      }
    };

    const report = {
      summary,
      thresholds: this.thresholds,
      generatedAt: now
    };

    if (includeDetails) {
      report.records = filteredRecords;
    }

    if (groupBy) {
      report.groupedData = this.groupRecords(filteredRecords, groupBy);
    }

    return report;
  }

  /**
   * 计算中位数
   * @param {Array} values - 数值数组
   * @returns {number} 中位数
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  /**
   * 按指定字段分组记录
   * @param {Array} records - 记录数组
   * @param {string} field - 分组字段
   * @returns {Object} 分组结果
   */
  groupRecords(records, field) {
    const groups = {};
    
    records.forEach(record => {
      const key = this.getNestedValue(record, field) || 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });

    return groups;
  }

  /**
   * 获取嵌套对象的值
   * @param {Object} obj - 对象
   * @param {string} path - 路径（如 'metadata.layoutType'）
   * @returns {*} 值
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 清空性能记录
   */
  clearRecords() {
    this.records = [];
    console.log(`🧹 [性能监控器] 性能记录已清空`);
  }

  /**
   * 获取当前活跃会话
   * @returns {Array} 活跃会话列表
   */
  getActiveSessions() {
    return Array.from(this.currentSessions.values());
  }

  /**
   * 强制结束所有活跃会话
   */
  forceEndAllSessions() {
    const sessionIds = Array.from(this.currentSessions.keys());
    sessionIds.forEach(sessionId => {
      this.endSession(sessionId, { success: false, error: 'Force ended' });
    });
    console.log(`🛑 [性能监控器] 强制结束所有会话，共 ${sessionIds.length} 个`);
  }

  /**
   * 启用性能监控
   */
  enable() {
    this.enabled = true;
    console.log(`✅ [性能监控器] 已启用`);
  }

  /**
   * 禁用性能监控
   */
  disable() {
    this.enabled = false;
    console.log(`❌ [性能监控器] 已禁用`);
  }

  /**
   * 设置性能阈值
   * @param {Object} thresholds - 新的阈值配置
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log(`⚡ [性能监控器] 阈值已更新:`, this.thresholds);
  }

  /**
   * 销毁性能监控器
   */
  destroy() {
    this.forceEndAllSessions();
    this.clearRecords();
    this.enabled = false;
    console.log(`💥 [性能监控器] 已销毁`);
  }
}
export default PerformanceMonitor;
