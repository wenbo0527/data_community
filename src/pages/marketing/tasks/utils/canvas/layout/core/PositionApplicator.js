/**
 * 位置应用器
 * 负责将计算出的位置应用到图节点上，并处理位置变化的动画和验证
 */
export class PositionApplicator {
  constructor(config = {}) {
    this.config = {
      enableAnimation: config.enableAnimation !== false,
      animationDuration: config.animationDuration || 300,
      enableValidation: config.enableValidation !== false,
      enableBoundsCheck: config.enableBoundsCheck !== false,
      minNodeDistance: config.minNodeDistance || 50,
      maxPositionChange: config.maxPositionChange || 1000,
      ...config
    };
    
    // 应用统计
    this.stats = {
      totalApplications: 0,
      successfulApplications: 0,
      failedApplications: 0,
      animatedApplications: 0,
      validationErrors: 0,
      boundsViolations: 0,
      lastApplicationTime: null,
      averageApplicationTime: 0
    };
    
    // 位置历史记录
    this.positionHistory = new Map();
    this.maxHistorySize = config.maxHistorySize || 10;
  }

  /**
   * 应用位置到图节点
   * @param {Object} graph - X6图实例
   * @param {Map} positions - 位置映射 (nodeId -> {x, y})
   * @param {Object} options - 应用选项
   * @returns {Object} 应用结果
   */
  async applyPositions(graph, positions, options = {}) {
    console.log(`📍 [位置应用器] 开始应用位置 - 节点数: ${positions.size}`);
    
    const startTime = Date.now();
    const applicationId = `apply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 验证输入
      this.validateInputs(graph, positions);
      
      // 预处理位置数据
      const processedPositions = this.preprocessPositions(positions, options);
      
      // 验证位置数据
      const validationResult = this.validatePositions(processedPositions, options);
      if (!validationResult.isValid) {
        console.warn(`⚠️ [位置应用器] 位置验证失败: ${validationResult.errors.join(', ')}`);
        this.stats.validationErrors++;
      }
      
      // 应用位置
      const applicationResult = await this.performPositionApplication(
        graph, 
        processedPositions, 
        options, 
        applicationId
      );
      
      // 更新统计
      const executionTime = Date.now() - startTime;
      this.updateStats(applicationResult, executionTime);
      
      console.log(`✅ [位置应用器] 位置应用完成 - 成功: ${applicationResult.appliedCount}/${positions.size}, 耗时: ${executionTime}ms`);
      
      return {
        ...applicationResult,
        applicationId,
        executionTime,
        success: true
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [位置应用器] 位置应用失败:`, error);
      
      this.stats.failedApplications++;
      
      return {
        success: false,
        error: error.message,
        applicationId,
        executionTime,
        appliedCount: 0,
        skippedCount: positions.size,
        animatedCount: 0,
        changes: []
      };
    }
  }

  /**
   * 执行位置应用的核心逻辑
   * @param {Object} graph - X6图实例
   * @param {Map} positions - 处理后的位置映射
   * @param {Object} options - 应用选项
   * @param {string} applicationId - 应用ID
   * @returns {Object} 应用结果
   */
  async performPositionApplication(graph, positions, options, applicationId) {
    const changes = [];
    let appliedCount = 0;
    let skippedCount = 0;
    let animatedCount = 0;
    
    // 获取所有图节点
    const graphNodes = graph.getNodes();
    const nodeMap = new Map(graphNodes.map(node => [node.id, node]));
    
    console.log(`🎯 [位置应用器] 开始应用 ${positions.size} 个位置到 ${graphNodes.length} 个图节点`);
    
    // 批量应用位置
    const applicationPromises = [];
    
    for (const [nodeId, newPosition] of positions) {
      const graphNode = nodeMap.get(nodeId);
      
      if (!graphNode) {
        console.warn(`⚠️ [位置应用器] 未找到节点: ${nodeId}`);
        skippedCount++;
        continue;
      }
      
      // 获取当前位置
      const currentPosition = graphNode.getPosition();
      
      // 检查位置是否需要更新
      if (this.shouldSkipPositionUpdate(currentPosition, newPosition, options)) {
        skippedCount++;
        continue;
      }
      
      // 记录位置变化
      const change = {
        nodeId,
        oldPosition: { ...currentPosition },
        newPosition: { ...newPosition },
        distance: this.calculateDistance(currentPosition, newPosition),
        timestamp: Date.now()
      };
      changes.push(change);
      
      // 应用位置
      const applicationPromise = this.applyNodePosition(
        graphNode, 
        newPosition, 
        options, 
        change
      ).then(result => {
        if (result.success) {
          appliedCount++;
          if (result.animated) {
            animatedCount++;
          }
        } else {
          skippedCount++;
        }
        return result;
      });
      
      applicationPromises.push(applicationPromise);
    }
    
    // 等待所有位置应用完成
    await Promise.all(applicationPromises);
    
    // 更新位置历史
    this.updatePositionHistory(applicationId, changes);
    
    // 触发布局完成事件
    this.triggerLayoutCompleteEvent(graph, {
      appliedCount,
      skippedCount,
      animatedCount,
      changes,
      applicationId
    });
    
    return {
      appliedCount,
      skippedCount,
      animatedCount,
      changes,
      totalNodes: positions.size,
      applicationRate: positions.size > 0 ? Math.round((appliedCount / positions.size) * 100) : 0,
      averageDistance: changes.length > 0 ? 
        changes.reduce((sum, change) => sum + change.distance, 0) / changes.length : 0,
      maxDistance: changes.length > 0 ? 
        Math.max(...changes.map(change => change.distance)) : 0
    };
  }

  /**
   * 应用单个节点位置
   * @param {Object} graphNode - X6图节点
   * @param {Object} newPosition - 新位置
   * @param {Object} options - 应用选项
   * @param {Object} change - 位置变化记录
   * @returns {Object} 应用结果
   */
  async applyNodePosition(graphNode, newPosition, options, change) {
    try {
      const useAnimation = this.shouldUseAnimation(options, change);
      
      if (useAnimation) {
        // 使用动画应用位置
        await this.applyPositionWithAnimation(graphNode, newPosition, options);
        return { success: true, animated: true };
      } else {
        // 直接应用位置
        graphNode.setPosition(newPosition.x, newPosition.y);
        return { success: true, animated: false };
      }
      
    } catch (error) {
      console.error(`❌ [位置应用器] 节点 ${graphNode.id} 位置应用失败:`, error);
      return { success: false, animated: false, error: error.message };
    }
  }

  /**
   * 使用动画应用位置
   * @param {Object} graphNode - X6图节点
   * @param {Object} newPosition - 新位置
   * @param {Object} options - 应用选项
   */
  async applyPositionWithAnimation(graphNode, newPosition, options) {
    const duration = options.animationDuration || this.config.animationDuration;
    
    return new Promise((resolve, reject) => {
      try {
        // 使用X6的动画API
        graphNode.transition('position', newPosition, {
          duration,
          timing: options.animationTiming || 'ease-in-out',
          complete: () => {
            resolve();
          }
        });
      } catch (error) {
        // 如果动画失败，直接设置位置
        console.warn(`⚠️ [位置应用器] 动画失败，直接设置位置: ${error.message}`);
        graphNode.setPosition(newPosition.x, newPosition.y);
        resolve();
      }
    });
  }

  /**
   * 验证输入参数
   * @param {Object} graph - X6图实例
   * @param {Map} positions - 位置映射
   */
  validateInputs(graph, positions) {
    if (!graph) {
      throw new Error('图实例不能为空');
    }
    
    if (!positions || !(positions instanceof Map)) {
      throw new Error('位置映射必须是Map实例');
    }
    
    if (positions.size === 0) {
      throw new Error('位置映射不能为空');
    }
    
    // 验证图实例方法
    if (typeof graph.getNodes !== 'function') {
      throw new Error('无效的图实例：缺少getNodes方法');
    }
  }

  /**
   * 预处理位置数据
   * @param {Map} positions - 原始位置映射
   * @param {Object} options - 处理选项
   * @returns {Map} 处理后的位置映射
   */
  preprocessPositions(positions, options) {
    const processedPositions = new Map();
    
    for (const [nodeId, position] of positions) {
      // 确保位置是数字
      const x = typeof position.x === 'number' ? position.x : parseFloat(position.x) || 0;
      const y = typeof position.y === 'number' ? position.y : parseFloat(position.y) || 0;
      
      // 应用位置约束
      const constrainedPosition = this.applyPositionConstraints({ x, y }, options);
      
      processedPositions.set(nodeId, constrainedPosition);
    }
    
    return processedPositions;
  }

  /**
   * 应用位置约束
   * @param {Object} position - 位置
   * @param {Object} options - 约束选项
   * @returns {Object} 约束后的位置
   */
  applyPositionConstraints(position, options) {
    let { x, y } = position;
    
    // 边界约束
    if (options.bounds) {
      x = Math.max(options.bounds.minX || -Infinity, Math.min(options.bounds.maxX || Infinity, x));
      y = Math.max(options.bounds.minY || -Infinity, Math.min(options.bounds.maxY || Infinity, y));
    }
    
    // 网格对齐
    if (options.gridSize && options.gridSize > 0) {
      x = Math.round(x / options.gridSize) * options.gridSize;
      y = Math.round(y / options.gridSize) * options.gridSize;
    }
    
    // 精度限制
    const precision = options.precision || 1;
    x = Math.round(x * precision) / precision;
    y = Math.round(y * precision) / precision;
    
    return { x, y };
  }

  /**
   * 验证位置数据
   * @param {Map} positions - 位置映射
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果
   */
  validatePositions(positions, options) {
    if (!this.config.enableValidation) {
      return { isValid: true, errors: [] };
    }
    
    const errors = [];
    const positionArray = Array.from(positions.values());
    
    // 检查位置重叠
    if (options.checkOverlap !== false) {
      const overlaps = this.detectPositionOverlaps(positionArray);
      if (overlaps.length > 0) {
        errors.push(`检测到 ${overlaps.length} 个位置重叠`);
      }
    }
    
    // 检查边界违规
    if (this.config.enableBoundsCheck && options.bounds) {
      const violations = this.detectBoundsViolations(positionArray, options.bounds);
      if (violations.length > 0) {
        errors.push(`检测到 ${violations.length} 个边界违规`);
        this.stats.boundsViolations += violations.length;
      }
    }
    
    // 检查极端位置变化
    if (options.checkExtremeChanges !== false) {
      const extremeChanges = this.detectExtremeChanges(positions);
      if (extremeChanges.length > 0) {
        errors.push(`检测到 ${extremeChanges.length} 个极端位置变化`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: errors.length > 0 ? ['位置验证发现问题，但仍将继续应用'] : []
    };
  }

  /**
   * 检测位置重叠
   * @param {Array} positions - 位置数组
   * @returns {Array} 重叠位置对
   */
  detectPositionOverlaps(positions) {
    const overlaps = [];
    const minDistance = this.config.minNodeDistance;
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = this.calculateDistance(positions[i], positions[j]);
        if (distance < minDistance) {
          overlaps.push({ pos1: positions[i], pos2: positions[j], distance });
        }
      }
    }
    
    return overlaps;
  }

  /**
   * 检测边界违规
   * @param {Array} positions - 位置数组
   * @param {Object} bounds - 边界
   * @returns {Array} 违规位置
   */
  detectBoundsViolations(positions, bounds) {
    return positions.filter(pos => 
      pos.x < (bounds.minX || -Infinity) ||
      pos.x > (bounds.maxX || Infinity) ||
      pos.y < (bounds.minY || -Infinity) ||
      pos.y > (bounds.maxY || Infinity)
    );
  }

  /**
   * 检测极端位置变化
   * @param {Map} positions - 位置映射
   * @returns {Array} 极端变化
   */
  detectExtremeChanges(positions) {
    const extremeChanges = [];
    const maxChange = this.config.maxPositionChange;
    
    // 这里需要与历史位置比较，简化实现
    // 在实际应用中，可以与上一次的位置进行比较
    
    return extremeChanges;
  }

  /**
   * 判断是否应该跳过位置更新
   * @param {Object} currentPosition - 当前位置
   * @param {Object} newPosition - 新位置
   * @param {Object} options - 选项
   * @returns {boolean} 是否跳过
   */
  shouldSkipPositionUpdate(currentPosition, newPosition, options) {
    // 位置变化阈值
    const threshold = options.updateThreshold || 1;
    const distance = this.calculateDistance(currentPosition, newPosition);
    
    return distance < threshold;
  }

  /**
   * 判断是否应该使用动画
   * @param {Object} options - 选项
   * @param {Object} change - 位置变化
   * @returns {boolean} 是否使用动画
   */
  shouldUseAnimation(options, change) {
    if (!this.config.enableAnimation || options.disableAnimation) {
      return false;
    }
    
    // 距离太小不使用动画
    if (change.distance < (options.animationThreshold || 10)) {
      return false;
    }
    
    // 距离太大不使用动画（避免过长的动画）
    if (change.distance > (options.maxAnimationDistance || 500)) {
      return false;
    }
    
    return true;
  }

  /**
   * 计算两点间距离
   * @param {Object} pos1 - 位置1
   * @param {Object} pos2 - 位置2
   * @returns {number} 距离
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 更新位置历史
   * @param {string} applicationId - 应用ID
   * @param {Array} changes - 位置变化
   */
  updatePositionHistory(applicationId, changes) {
    this.positionHistory.set(applicationId, {
      timestamp: Date.now(),
      changes,
      changeCount: changes.length
    });
    
    // 限制历史记录大小
    if (this.positionHistory.size > this.maxHistorySize) {
      const oldestKey = this.positionHistory.keys().next().value;
      this.positionHistory.delete(oldestKey);
    }
  }

  /**
   * 触发布局完成事件
   * @param {Object} graph - X6图实例
   * @param {Object} result - 应用结果
   */
  triggerLayoutCompleteEvent(graph, result) {
    try {
      // 触发自定义事件
      if (typeof graph.trigger === 'function') {
        graph.trigger('layout:complete', result);
      }
      
      // 触发节点更新事件
      if (typeof graph.trigger === 'function') {
        graph.trigger('node:change:position', result);
      }
    } catch (error) {
      console.warn(`⚠️ [位置应用器] 事件触发失败:`, error);
    }
  }

  /**
   * 更新统计信息
   * @param {Object} result - 应用结果
   * @param {number} executionTime - 执行时间
   */
  updateStats(result, executionTime) {
    this.stats.totalApplications++;
    this.stats.lastApplicationTime = Date.now();
    
    if (result.success) {
      this.stats.successfulApplications++;
    } else {
      this.stats.failedApplications++;
    }
    
    if (result.animatedCount > 0) {
      this.stats.animatedApplications++;
    }
    
    // 更新平均执行时间
    const totalTime = this.stats.averageApplicationTime * (this.stats.totalApplications - 1) + executionTime;
    this.stats.averageApplicationTime = Math.round(totalTime / this.stats.totalApplications);
  }

  /**
   * 获取应用器统计
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalApplications > 0 ? 
        Math.round((this.stats.successfulApplications / this.stats.totalApplications) * 100) : 0,
      animationRate: this.stats.totalApplications > 0 ? 
        Math.round((this.stats.animatedApplications / this.stats.totalApplications) * 100) : 0
    };
  }

  /**
   * 获取位置历史
   * @param {number} limit - 限制数量
   * @returns {Array} 历史记录
   */
  getPositionHistory(limit = 10) {
    const history = Array.from(this.positionHistory.entries())
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, limit);
    
    return history.map(([id, data]) => ({
      applicationId: id,
      ...data
    }));
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    this.positionHistory.clear();
    console.log(`🗑️ [位置应用器] 历史记录已清空`);
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalApplications: 0,
      successfulApplications: 0,
      failedApplications: 0,
      animatedApplications: 0,
      validationErrors: 0,
      boundsViolations: 0,
      lastApplicationTime: null,
      averageApplicationTime: 0
    };
    console.log(`📊 [位置应用器] 统计信息已重置`);
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log(`🔧 [位置应用器] 配置已更新`);
  }
}

// 默认导出已通过 export class 实现
