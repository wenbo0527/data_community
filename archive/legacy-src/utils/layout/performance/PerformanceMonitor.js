/**
 * 性能监控器
 * 提供布局引擎的性能监控和分析功能
 */

/**
 * 性能监控器类
 */
class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableMetrics: true,
      enableTiming: true,
      enableMemory: true,
      maxHistorySize: 1000,
      reportInterval: 5000, // 5秒
      warningThresholds: {
        executionTime: 1000, // 1秒
        memoryUsage: 50 * 1024 * 1024, // 50MB
        cacheHitRate: 0.8 // 80%
      },
      autoReport: false,
      ...options
    };
    
    // 性能指标存储
    this.metrics = {
      layoutExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      maxExecutionTime: 0,
      minExecutionTime: Infinity,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      errorCount: 0,
      warningCount: 0
    };
    
    // 历史记录
    this.history = {
      executions: [],
      memory: [],
      cache: [],
      errors: []
    };
    
    // 当前执行的任务
    this.activeTasks = new Map();
    
    // 性能标记
    this.marks = new Map();
    
    // 报告定时器
    if (this.options.autoReport) {
      this.reportTimer = setInterval(() => {
        this.generateReport();
      }, this.options.reportInterval);
    }
    
    // 事件监听器
    this.listeners = new Map();
  }
  
  /**
   * 开始性能测量
   */
  startMeasure(taskId, metadata = {}) {
    if (!this.options.enableTiming) {
      return null;
    }
    
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const task = {
      id: taskId,
      startTime,
      startMemory,
      metadata,
      marks: []
    };
    
    this.activeTasks.set(taskId, task);
    
    // 创建性能标记
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${taskId}-start`);
    }
    
    return task;
  }
  
  /**
   * 添加性能标记
   */
  mark(taskId, markName, data = {}) {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return false;
    }
    
    const markTime = performance.now();
    const mark = {
      name: markName,
      time: markTime,
      relativeTime: markTime - task.startTime,
      data
    };
    
    task.marks.push(mark);
    
    // 创建浏览器性能标记
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${taskId}-${markName}`);
    }
    
    return mark;
  }
  
  /**
   * 开始计时（startTiming的别名）
   */
  startTiming(taskId, metadata = {}) {
    return this.startMeasure(taskId, metadata);
  }

  /**
   * 结束计时（endTiming的别名）
   */
  endTiming(taskId, result = {}) {
    return this.endMeasure(taskId, result);
  }

  /**
   * 结束性能测量
   */
  endMeasure(taskId, result = {}) {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return null;
    }
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const executionTime = endTime - task.startTime;
    const memoryDelta = endMemory - task.startMemory;
    
    // 创建性能标记
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${taskId}-end`);
      
      // 创建性能测量
      try {
        performance.measure(taskId, `${taskId}-start`, `${taskId}-end`);
      } catch (e) {
        // 忽略测量错误
      }
    }
    
    // 更新指标
    this.updateMetrics(executionTime, memoryDelta, result);
    
    // 创建执行记录
    const execution = {
      id: taskId,
      startTime: task.startTime,
      endTime,
      executionTime,
      startMemory: task.startMemory,
      endMemory,
      memoryDelta,
      marks: task.marks,
      metadata: task.metadata,
      result,
      timestamp: Date.now()
    };
    
    // 添加到历史记录
    this.addToHistory('executions', execution);
    
    // 检查警告阈值
    this.checkThresholds(execution);
    
    // 移除活动任务
    this.activeTasks.delete(taskId);
    
    // 触发事件
    this.emit('measureComplete', execution);
    
    return execution;
  }
  
  /**
   * 记录缓存命中
   */
  recordCacheHit(key, data = {}) {
    this.metrics.cacheHits++;
    this.updateCacheHitRate();
    
    const record = {
      type: 'hit',
      key,
      data,
      timestamp: Date.now()
    };
    
    this.addToHistory('cache', record);
    this.emit('cacheHit', record);
  }
  
  /**
   * 记录缓存未命中
   */
  recordCacheMiss(key, data = {}) {
    this.metrics.cacheMisses++;
    this.updateCacheHitRate();
    
    const record = {
      type: 'miss',
      key,
      data,
      timestamp: Date.now()
    };
    
    this.addToHistory('cache', record);
    this.emit('cacheMiss', record);
  }
  
  /**
   * 记录错误
   */
  recordError(error, context = {}) {
    this.metrics.errorCount++;
    
    const errorRecord = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: Date.now()
    };
    
    this.addToHistory('errors', errorRecord);
    this.emit('error', errorRecord);
  }
  
  /**
   * 记录警告
   */
  recordWarning(message, context = {}) {
    this.metrics.warningCount++;
    
    const warningRecord = {
      message,
      context,
      timestamp: Date.now()
    };
    
    this.emit('warning', warningRecord);
  }
  
  /**
   * 更新性能指标
   */
  updateMetrics(executionTime, memoryDelta, result) {
    this.metrics.layoutExecutions++;
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.layoutExecutions;
    
    if (executionTime > this.metrics.maxExecutionTime) {
      this.metrics.maxExecutionTime = executionTime;
    }
    
    if (executionTime < this.metrics.minExecutionTime) {
      this.metrics.minExecutionTime = executionTime;
    }
    
    // 更新内存使用
    const currentMemory = this.getMemoryUsage();
    this.metrics.memoryUsage = currentMemory;
    
    if (currentMemory > this.metrics.peakMemoryUsage) {
      this.metrics.peakMemoryUsage = currentMemory;
    }
    
    // 记录内存历史
    this.addToHistory('memory', {
      usage: currentMemory,
      delta: memoryDelta,
      timestamp: Date.now()
    });
  }
  
  /**
   * 更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? this.metrics.cacheHits / total : 0;
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (!this.options.enableMemory) {
      return 0;
    }
    
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    return 0;
  }
  
  /**
   * 检查警告阈值
   */
  checkThresholds(execution) {
    const { warningThresholds } = this.options;
    
    // 检查执行时间
    if (execution.executionTime > warningThresholds.executionTime) {
      this.recordWarning(`Execution time exceeded threshold: ${execution.executionTime}ms`, {
        taskId: execution.id,
        threshold: warningThresholds.executionTime,
        actual: execution.executionTime
      });
    }
    
    // 检查内存使用
    if (execution.endMemory > warningThresholds.memoryUsage) {
      this.recordWarning(`Memory usage exceeded threshold: ${execution.endMemory} bytes`, {
        taskId: execution.id,
        threshold: warningThresholds.memoryUsage,
        actual: execution.endMemory
      });
    }
    
    // 检查缓存命中率
    if (this.metrics.cacheHitRate < warningThresholds.cacheHitRate) {
      this.recordWarning(`Cache hit rate below threshold: ${this.metrics.cacheHitRate}`, {
        threshold: warningThresholds.cacheHitRate,
        actual: this.metrics.cacheHitRate
      });
    }
  }
  
  /**
   * 添加到历史记录
   */
  addToHistory(type, record) {
    const history = this.history[type];
    if (!history) {
      return;
    }
    
    history.push(record);
    
    // 限制历史记录大小
    if (history.length > this.options.maxHistorySize) {
      history.splice(0, history.length - this.options.maxHistorySize);
    }
  }
  
  /**
   * 生成性能报告
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      summary: {
        totalExecutions: this.metrics.layoutExecutions,
        averageExecutionTime: this.metrics.averageExecutionTime,
        cacheEfficiency: this.metrics.cacheHitRate,
        memoryEfficiency: this.getMemoryEfficiency(),
        errorRate: this.getErrorRate()
      },
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations()
    };
    
    this.emit('report', report);
    return report;
  }
  
  /**
   * 计算趋势
   */
  calculateTrends() {
    const recentExecutions = this.history.executions.slice(-50); // 最近50次执行
    
    if (recentExecutions.length < 2) {
      return null;
    }
    
    const executionTimes = recentExecutions.map(e => e.executionTime);
    const memoryUsages = recentExecutions.map(e => e.endMemory);
    
    return {
      executionTime: {
        trend: this.calculateTrend(executionTimes),
        average: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        variance: this.calculateVariance(executionTimes)
      },
      memoryUsage: {
        trend: this.calculateTrend(memoryUsages),
        average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        variance: this.calculateVariance(memoryUsages)
      }
    };
  }
  
  /**
   * 计算趋势方向
   */
  calculateTrend(values) {
    if (values.length < 2) {
      return 'stable';
    }
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }
  
  /**
   * 计算方差
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
  
  /**
   * 获取内存效率
   */
  getMemoryEfficiency() {
    if (this.metrics.peakMemoryUsage === 0) {
      return 1;
    }
    
    return Math.max(0, 1 - (this.metrics.memoryUsage / this.metrics.peakMemoryUsage));
  }
  
  /**
   * 获取错误率
   */
  getErrorRate() {
    if (this.metrics.layoutExecutions === 0) {
      return 0;
    }
    
    return this.metrics.errorCount / this.metrics.layoutExecutions;
  }
  
  /**
   * 生成优化建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    // 执行时间建议
    if (this.metrics.averageExecutionTime > this.options.warningThresholds.executionTime) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average execution time is high, consider optimizing algorithms or enabling caching'
      });
    }
    
    // 缓存命中率建议
    if (this.metrics.cacheHitRate < this.options.warningThresholds.cacheHitRate) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Cache hit rate is low, consider adjusting cache strategy or size'
      });
    }
    
    // 内存使用建议
    if (this.metrics.memoryUsage > this.options.warningThresholds.memoryUsage) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Memory usage is high, consider implementing memory cleanup or optimization'
      });
    }
    
    // 错误率建议
    if (this.getErrorRate() > 0.05) { // 5%错误率
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Error rate is high, investigate and fix recurring issues'
      });
    }
    
    return recommendations;
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      metrics: { ...this.metrics },
      activeTasks: this.activeTasks.size,
      historySize: {
        executions: this.history.executions.length,
        memory: this.history.memory.length,
        cache: this.history.cache.length,
        errors: this.history.errors.length
      },
      trends: this.calculateTrends()
    };
  }

  /**
   * 获取性能报告
   */
  getReport() {
    return {
      ...this.getStats(),
      recommendations: this.generateRecommendations(),
      timestamp: Date.now()
    };
  }
  
  /**
   * 获取历史记录
   */
  getHistory(type, limit = null) {
    const history = this.history[type] || [];
    return limit ? history.slice(-limit) : [...history];
  }
  
  /**
   * 清除历史记录
   */
  clearHistory(type = null) {
    if (type) {
      if (this.history[type]) {
        this.history[type] = [];
      }
    } else {
      this.history = {
        executions: [],
        memory: [],
        cache: [],
        errors: []
      };
    }
  }
  
  /**
   * 重置指标
   */
  resetMetrics() {
    this.metrics = {
      layoutExecutions: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      maxExecutionTime: 0,
      minExecutionTime: Infinity,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      errorCount: 0,
      warningCount: 0
    };
  }
  
  /**
   * 事件监听
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
  
  /**
   * 移除事件监听
   */
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in performance monitor event listener:', error);
        }
      });
    }
  }
  
  /**
   * 导出数据
   */
  exportData() {
    return {
      metrics: this.metrics,
      history: this.history,
      options: this.options,
      timestamp: Date.now()
    };
  }
  
  /**
   * 导入数据
   */
  importData(data) {
    if (data.metrics) {
      this.metrics = { ...this.metrics, ...data.metrics };
    }
    
    if (data.history) {
      Object.keys(data.history).forEach(type => {
        if (this.history[type]) {
          this.history[type] = [...this.history[type], ...data.history[type]];
          
          // 限制历史记录大小
          if (this.history[type].length > this.options.maxHistorySize) {
            this.history[type] = this.history[type].slice(-this.options.maxHistorySize);
          }
        }
      });
    }
  }
  
  /**
   * 销毁监控器
   */
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    
    this.activeTasks.clear();
    this.marks.clear();
    this.listeners.clear();
    this.clearHistory();
  }
}

export { PerformanceMonitor };
export default PerformanceMonitor;