/**
 * 位置应用器 - 将计算结果应用到实际节点
 */

import { PositionApplicationError, globalErrorHandler } from '../errors/CoordinateErrors.js';

/**
 * 应用策略基类
 */
export class ApplicationStrategy {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * 应用位置 - 子类需要实现
   * @param {Map} positions - 节点位置映射
   * @param {Object} context - 应用上下文
   * @returns {Promise<Object>} 应用结果
   */
  async apply(positions, context) {
    throw new Error('ApplicationStrategy.apply() must be implemented by subclass');
  }
}

/**
 * 直接应用策略
 */
export class DirectApplicationStrategy extends ApplicationStrategy {
  constructor(config = {}) {
    super('direct', config);
    this.enableAnimation = config.enableAnimation !== false;
    this.animationDuration = config.animationDuration || 300;
  }

  async apply(positions, context) {
    const { nodeManager, graph } = context;
    const results = {
      applied: 0,
      failed: 0,
      errors: []
    };

    console.log(`🔄 [直接应用策略] 开始应用 ${positions.size} 个节点位置`);

    for (const [nodeId, position] of positions) {
      try {
        if (nodeManager && typeof nodeManager.updateNodePosition === 'function') {
          await nodeManager.updateNodePosition(nodeId, position, {
            animate: this.enableAnimation,
            duration: this.animationDuration
          });
        } else if (graph && typeof graph.updateNodePosition === 'function') {
          await graph.updateNodePosition(nodeId, position);
        } else {
          // 直接更新DOM元素（备用方案）
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            if (this.enableAnimation) {
              nodeElement.style.transition = `transform ${this.animationDuration}ms ease-in-out`;
            }
            // 🔧 坐标验证：确保transform属性不包含NaN值
            const validX = (typeof position.x === 'number' && !isNaN(position.x) && isFinite(position.x)) ? position.x : 200;
            const validY = (typeof position.y === 'number' && !isNaN(position.y) && isFinite(position.y)) ? position.y : 100;
            
            if (validX !== position.x || validY !== position.y) {
              console.warn('⚠️ [PositionApplicator] 检测到NaN坐标，使用默认值:', {
                nodeId,
                originalPosition: position,
                correctedPosition: { x: validX, y: validY }
              });
            }
            
            nodeElement.style.transform = `translate(${validX}px, ${validY}px)`;
          } else {
            throw new Error(`找不到节点元素: ${nodeId}`);
          }
        }

        results.applied++;
        console.log(`  ✅ 应用节点 ${nodeId}: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          nodeId,
          position,
          error: error.message
        });
        console.error(`  ❌ 应用节点 ${nodeId} 失败:`, error.message);
      }
    }

    console.log(`✅ [直接应用策略] 应用完成 - 成功: ${results.applied}, 失败: ${results.failed}`);
    return results;
  }
}

/**
 * 批量应用策略
 */
export class BatchApplicationStrategy extends ApplicationStrategy {
  constructor(config = {}) {
    super('batch', config);
    this.batchSize = config.batchSize || 20;
    this.batchDelay = config.batchDelay || 50;
    this.enableAnimation = config.enableAnimation !== false;
    this.animationDuration = config.animationDuration || 300;
  }

  async apply(positions, context) {
    const { nodeManager, graph } = context;
    const results = {
      applied: 0,
      failed: 0,
      errors: [],
      batches: 0
    };

    const positionArray = Array.from(positions.entries());
    const totalBatches = Math.ceil(positionArray.length / this.batchSize);

    console.log(`🔄 [批量应用策略] 开始批量应用 - ${positionArray.length} 个节点, ${totalBatches} 个批次`);

    for (let i = 0; i < positionArray.length; i += this.batchSize) {
      const batch = positionArray.slice(i, i + this.batchSize);
      const batchIndex = Math.floor(i / this.batchSize) + 1;

      console.log(`  🔄 处理批次 ${batchIndex}/${totalBatches} - ${batch.length} 个节点`);

      try {
        const batchResults = await this.applyBatch(batch, context);
        results.applied += batchResults.applied;
        results.failed += batchResults.failed;
        results.errors.push(...batchResults.errors);
        results.batches++;

        // 批次间延迟
        if (i + this.batchSize < positionArray.length && this.batchDelay > 0) {
          await this.delay(this.batchDelay);
        }
      } catch (error) {
        console.error(`  ❌ 批次 ${batchIndex} 处理失败:`, error.message);
        batch.forEach(([nodeId, position]) => {
          results.failed++;
          results.errors.push({
            nodeId,
            position,
            error: `批次处理失败: ${error.message}`
          });
        });
      }
    }

    console.log(`✅ [批量应用策略] 应用完成 - 成功: ${results.applied}, 失败: ${results.failed}, 批次: ${results.batches}`);
    return results;
  }

  async applyBatch(batch, context) {
    const { nodeManager, graph } = context;
    const batchResults = {
      applied: 0,
      failed: 0,
      errors: []
    };

    // 并行处理批次内的节点
    const promises = batch.map(async ([nodeId, position]) => {
      try {
        if (nodeManager && typeof nodeManager.updateNodePosition === 'function') {
          await nodeManager.updateNodePosition(nodeId, position, {
            animate: this.enableAnimation,
            duration: this.animationDuration
          });
        } else if (graph && typeof graph.updateNodePosition === 'function') {
          await graph.updateNodePosition(nodeId, position);
        } else {
          // 直接更新DOM元素
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            if (this.enableAnimation) {
              nodeElement.style.transition = `transform ${this.animationDuration}ms ease-in-out`;
            }
            // 🔧 坐标验证：确保transform属性不包含NaN值
            const validX = (typeof position.x === 'number' && !isNaN(position.x) && isFinite(position.x)) ? position.x : 200;
            const validY = (typeof position.y === 'number' && !isNaN(position.y) && isFinite(position.y)) ? position.y : 100;
            
            if (validX !== position.x || validY !== position.y) {
              console.warn('⚠️ [PositionApplicator] 检测到NaN坐标，使用默认值:', {
                nodeId,
                originalPosition: position,
                correctedPosition: { x: validX, y: validY }
              });
            }
            
            nodeElement.style.transform = `translate(${validX}px, ${validY}px)`;
          } else {
            throw new Error(`找不到节点元素: ${nodeId}`);
          }
        }

        batchResults.applied++;
        return { success: true, nodeId };
      } catch (error) {
        batchResults.failed++;
        batchResults.errors.push({
          nodeId,
          position,
          error: error.message
        });
        return { success: false, nodeId, error: error.message };
      }
    });

    await Promise.allSettled(promises);
    return batchResults;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 渐进应用策略
 */
export class ProgressiveApplicationStrategy extends ApplicationStrategy {
  constructor(config = {}) {
    super('progressive', config);
    this.stepsCount = config.stepsCount || 10;
    this.stepDelay = config.stepDelay || 30;
    this.enableAnimation = config.enableAnimation !== false;
    this.animationDuration = config.animationDuration || 300;
    this.easingFunction = config.easingFunction || 'ease-out';
  }

  async apply(positions, context) {
    const { nodeManager, graph } = context;
    const results = {
      applied: 0,
      failed: 0,
      errors: [],
      steps: 0
    };

    console.log(`🔄 [渐进应用策略] 开始渐进应用 - ${positions.size} 个节点, ${this.stepsCount} 步`);

    // 获取当前位置
    const currentPositions = await this.getCurrentPositions(positions, context);
    
    // 计算每步的位置增量
    const positionSteps = this.calculatePositionSteps(currentPositions, positions);

    for (let step = 1; step <= this.stepsCount; step++) {
      console.log(`  🔄 执行步骤 ${step}/${this.stepsCount}`);

      try {
        const stepResults = await this.applyStep(step, positionSteps, context);
        results.applied += stepResults.applied;
        results.failed += stepResults.failed;
        results.errors.push(...stepResults.errors);
        results.steps++;

        // 步骤间延迟
        if (step < this.stepsCount && this.stepDelay > 0) {
          await this.delay(this.stepDelay);
        }
      } catch (error) {
        console.error(`  ❌ 步骤 ${step} 执行失败:`, error.message);
        break;
      }
    }

    console.log(`✅ [渐进应用策略] 应用完成 - 成功: ${results.applied}, 失败: ${results.failed}, 步骤: ${results.steps}`);
    return results;
  }

  async getCurrentPositions(targetPositions, context) {
    const currentPositions = new Map();
    
    for (const nodeId of targetPositions.keys()) {
      try {
        // 尝试从节点管理器获取当前位置
        let currentPos = null;
        
        if (context.nodeManager && typeof context.nodeManager.getNodePosition === 'function') {
          currentPos = await context.nodeManager.getNodePosition(nodeId);
        } else {
          // 从DOM元素获取当前位置
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            currentPos = { x: rect.left, y: rect.top };
          }
        }

        if (currentPos) {
          currentPositions.set(nodeId, currentPos);
        } else {
          // 使用目标位置作为起始位置
          currentPositions.set(nodeId, targetPositions.get(nodeId));
        }
      } catch (error) {
        console.warn(`获取节点 ${nodeId} 当前位置失败:`, error.message);
        currentPositions.set(nodeId, targetPositions.get(nodeId));
      }
    }

    return currentPositions;
  }

  calculatePositionSteps(currentPositions, targetPositions) {
    const positionSteps = new Map();

    for (const [nodeId, targetPos] of targetPositions) {
      const currentPos = currentPositions.get(nodeId) || targetPos;
      
      const deltaX = (targetPos.x - currentPos.x) / this.stepsCount;
      const deltaY = (targetPos.y - currentPos.y) / this.stepsCount;

      positionSteps.set(nodeId, {
        current: { ...currentPos },
        target: { ...targetPos },
        delta: { x: deltaX, y: deltaY }
      });
    }

    return positionSteps;
  }

  async applyStep(step, positionSteps, context) {
    const stepResults = {
      applied: 0,
      failed: 0,
      errors: []
    };

    const progress = step / this.stepsCount;
    const easedProgress = this.applyEasing(progress);

    for (const [nodeId, stepData] of positionSteps) {
      try {
        const currentX = stepData.current.x + stepData.delta.x * step;
        const currentY = stepData.current.y + stepData.delta.y * step;

        // 应用缓动函数
        const easedX = stepData.current.x + (stepData.target.x - stepData.current.x) * easedProgress;
        const easedY = stepData.current.y + (stepData.target.y - stepData.current.y) * easedProgress;

        const position = { 
          x: easedX, 
          y: easedY,
          layerIndex: stepData.target.layerIndex 
        };

        if (context.nodeManager && typeof context.nodeManager.updateNodePosition === 'function') {
          await context.nodeManager.updateNodePosition(nodeId, position, {
            animate: false // 渐进应用本身就是动画
          });
        } else if (context.graph && typeof context.graph.updateNodePosition === 'function') {
          await context.graph.updateNodePosition(nodeId, position);
        } else {
          // 直接更新DOM元素
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            // 🔧 坐标验证：确保transform属性不包含NaN值
            const validX = (typeof position.x === 'number' && !isNaN(position.x) && isFinite(position.x)) ? position.x : 200;
            const validY = (typeof position.y === 'number' && !isNaN(position.y) && isFinite(position.y)) ? position.y : 100;
            
            if (validX !== position.x || validY !== position.y) {
              console.warn('⚠️ [PositionApplicator] 渐进应用中检测到NaN坐标，使用默认值:', {
                nodeId,
                step,
                originalPosition: position,
                correctedPosition: { x: validX, y: validY }
              });
            }
            
            nodeElement.style.transform = `translate(${validX}px, ${validY}px)`;
          } else {
            throw new Error(`找不到节点元素: ${nodeId}`);
          }
        }

        stepResults.applied++;
      } catch (error) {
        stepResults.failed++;
        stepResults.errors.push({
          nodeId,
          step,
          error: error.message
        });
      }
    }

    return stepResults;
  }

  applyEasing(progress) {
    switch (this.easingFunction) {
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'linear':
      default:
        return progress;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 位置应用器主类
 */
export class PositionApplicator {
  constructor(config = {}) {
    this.config = {
      strategy: config.strategy || 'direct',
      enableValidation: config.enableValidation !== false,
      enableRollback: config.enableRollback !== false,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 100,
      logLevel: config.logLevel || 'info',
      ...config
    };

    this.strategies = new Map();
    this.applicationHistory = [];
    this.rollbackStack = [];
    this.statistics = {
      totalApplications: 0,
      successfulApplications: 0,
      failedApplications: 0,
      totalNodesApplied: 0,
      totalNodesFailed: 0,
      averageApplicationTime: 0
    };

    this.initializeStrategies();
  }

  /**
   * 初始化应用策略
   */
  initializeStrategies() {
    // 注册默认策略
    this.registerStrategy(new DirectApplicationStrategy(this.config.strategyConfigs?.direct || {}));
    this.registerStrategy(new BatchApplicationStrategy(this.config.strategyConfigs?.batch || {}));
    this.registerStrategy(new ProgressiveApplicationStrategy(this.config.strategyConfigs?.progressive || {}));

    console.log(`✅ [位置应用器] 初始化完成 - ${this.strategies.size} 个应用策略`);
  }

  /**
   * 注册应用策略
   */
  registerStrategy(strategy) {
    if (!(strategy instanceof ApplicationStrategy)) {
      throw new PositionApplicationError('应用策略必须继承自 ApplicationStrategy');
    }

    this.strategies.set(strategy.name, strategy);
    console.log(`📝 [位置应用器] 注册策略: ${strategy.name}`);
  }

  /**
   * 应用位置 - 主入口方法
   * @param {Map} positions - 节点位置映射
   * @param {Object} context - 应用上下文
   * @returns {Promise<Object>} 应用结果
   */
  async apply(positions, context = {}) {
    const applicationId = this.generateApplicationId();
    const startTime = performance.now();

    console.log(`🔄 [位置应用器] 开始应用位置 - ID: ${applicationId}, 节点数: ${positions.size}, 策略: ${this.config.strategy}`);

    try {
      // 验证输入
      if (this.config.enableValidation) {
        this.validateInput(positions, context);
      }

      // 保存当前状态（用于回滚）
      let rollbackData = null;
      if (this.config.enableRollback) {
        rollbackData = await this.saveCurrentState(positions, context);
      }

      // 获取应用策略
      const strategy = this.strategies.get(this.config.strategy);
      if (!strategy) {
        throw new PositionApplicationError(`未找到应用策略: ${this.config.strategy}`);
      }

      // 执行应用
      let result = null;
      let retryCount = 0;

      while (retryCount <= this.config.maxRetries) {
        try {
          result = await strategy.apply(positions, context);
          break; // 成功则跳出重试循环
        } catch (error) {
          retryCount++;
          
          if (retryCount <= this.config.maxRetries) {
            console.warn(`⚠️ [位置应用器] 应用失败，第 ${retryCount} 次重试: ${error.message}`);
            await this.delay(this.config.retryDelay * retryCount);
          } else {
            throw error;
          }
        }
      }

      // 验证应用结果
      if (this.config.enableValidation) {
        await this.validateApplicationResult(result, positions);
      }

      // 记录成功的应用
      const endTime = performance.now();
      const applicationTime = endTime - startTime;

      const applicationRecord = {
        id: applicationId,
        timestamp: Date.now(),
        strategy: this.config.strategy,
        nodeCount: positions.size,
        result,
        applicationTime: Number(applicationTime.toFixed(2)),
        retryCount,
        rollbackData
      };

      this.recordApplicationHistory(applicationRecord);
      this.updateStatistics(applicationRecord);

      if (this.config.enableRollback && rollbackData) {
        this.rollbackStack.push({
          applicationId,
          rollbackData,
          timestamp: Date.now()
        });

        // 限制回滚栈大小
        if (this.rollbackStack.length > 10) {
          this.rollbackStack = this.rollbackStack.slice(-10);
        }
      }

      console.log(`✅ [位置应用器] 应用完成 - ID: ${applicationId}, 耗时: ${applicationTime.toFixed(2)}ms, 成功: ${result.applied}, 失败: ${result.failed}`);

      return {
        applicationId,
        success: true,
        ...result,
        applicationTime: Number(applicationTime.toFixed(2)),
        retryCount
      };
    } catch (error) {
      const applicationError = new PositionApplicationError(
        `位置应用失败: ${error.message}`,
        null,
        { applicationId, nodeCount: positions.size, strategy: this.config.strategy }
      );

      globalErrorHandler.handleError(applicationError, {
        component: 'PositionApplicator',
        method: 'apply',
        applicationId
      });

      // 记录失败的应用
      this.statistics.failedApplications++;

      throw applicationError;
    }
  }

  /**
   * 验证输入数据
   */
  validateInput(positions, context) {
    if (!(positions instanceof Map)) {
      throw new PositionApplicationError('positions 必须是 Map 类型');
    }

    if (positions.size === 0) {
      throw new PositionApplicationError('positions 不能为空');
    }

    // 验证位置数据格式
    for (const [nodeId, position] of positions) {
      if (!position || typeof position !== 'object') {
        throw new PositionApplicationError(`节点 ${nodeId} 的位置数据格式错误`);
      }

      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new PositionApplicationError(`节点 ${nodeId} 的坐标必须是数字`);
      }

      if (!isFinite(position.x) || !isFinite(position.y)) {
        throw new PositionApplicationError(`节点 ${nodeId} 的坐标必须是有限数字`);
      }
    }

    console.log(`✅ [位置应用器] 输入验证通过 - ${positions.size} 个节点`);
  }

  /**
   * 保存当前状态
   */
  async saveCurrentState(positions, context) {
    const currentState = new Map();

    console.log(`💾 [位置应用器] 保存当前状态 - ${positions.size} 个节点`);

    for (const nodeId of positions.keys()) {
      try {
        let currentPos = null;

        if (context.nodeManager && typeof context.nodeManager.getNodePosition === 'function') {
          currentPos = await context.nodeManager.getNodePosition(nodeId);
        } else {
          // 从DOM元素获取当前位置
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(nodeElement);
            const transform = computedStyle.transform;
            
            if (transform && transform !== 'none') {
              // 解析transform矩阵
              const matrix = transform.match(/matrix\(([^)]+)\)/);
              if (matrix) {
                const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
                currentPos = { x: values[4] || 0, y: values[5] || 0 };
              }
            } else {
              currentPos = { x: rect.left, y: rect.top };
            }
          }
        }

        if (currentPos) {
          currentState.set(nodeId, currentPos);
        }
      } catch (error) {
        console.warn(`保存节点 ${nodeId} 状态失败:`, error.message);
      }
    }

    console.log(`✅ [位置应用器] 状态保存完成 - ${currentState.size} 个节点`);
    return currentState;
  }

  /**
   * 验证应用结果
   */
  async validateApplicationResult(result, originalPositions) {
    if (!result || typeof result !== 'object') {
      throw new PositionApplicationError('应用结果格式错误');
    }

    if (typeof result.applied !== 'number' || typeof result.failed !== 'number') {
      throw new PositionApplicationError('应用结果缺少必要的统计信息');
    }

    const totalExpected = originalPositions.size;
    const totalProcessed = result.applied + result.failed;

    if (totalProcessed !== totalExpected) {
      throw new PositionApplicationError(
        `应用结果不一致: 期望 ${totalExpected} 个节点，实际处理 ${totalProcessed} 个节点`
      );
    }

    // 检查失败率
    const failureRate = result.failed / totalExpected;
    if (failureRate > 0.5) { // 失败率超过50%
      throw new PositionApplicationError(
        `应用失败率过高: ${(failureRate * 100).toFixed(1)}% (${result.failed}/${totalExpected})`
      );
    }

    console.log(`✅ [位置应用器] 应用结果验证通过 - 成功率: ${((result.applied / totalExpected) * 100).toFixed(1)}%`);
  }

  /**
   * 回滚到之前的状态
   */
  async rollback(applicationId) {
    console.log(`🔄 [位置应用器] 开始回滚 - ID: ${applicationId}`);

    const rollbackEntry = this.rollbackStack.find(entry => entry.applicationId === applicationId);
    if (!rollbackEntry) {
      throw new PositionApplicationError(`未找到回滚数据: ${applicationId}`);
    }

    const { rollbackData } = rollbackEntry;
    if (!rollbackData || rollbackData.size === 0) {
      throw new PositionApplicationError(`回滚数据为空: ${applicationId}`);
    }

    try {
      // 使用直接策略进行回滚
      const directStrategy = this.strategies.get('direct');
      const result = await directStrategy.apply(rollbackData, {});

      console.log(`✅ [位置应用器] 回滚完成 - ID: ${applicationId}, 恢复: ${result.applied} 个节点`);
      
      return {
        success: true,
        applicationId,
        restored: result.applied,
        failed: result.failed
      };
    } catch (error) {
      throw new PositionApplicationError(
        `回滚失败: ${error.message}`,
        null,
        { applicationId }
      );
    }
  }

  /**
   * 记录应用历史
   */
  recordApplicationHistory(record) {
    this.applicationHistory.push(record);

    // 限制历史记录大小
    if (this.applicationHistory.length > 50) {
      this.applicationHistory = this.applicationHistory.slice(-50);
    }
  }

  /**
   * 更新统计信息
   */
  updateStatistics(record) {
    this.statistics.totalApplications++;
    this.statistics.successfulApplications++;
    this.statistics.totalNodesApplied += record.result.applied;
    this.statistics.totalNodesFailed += record.result.failed;

    // 更新平均应用时间
    const totalTime = this.statistics.averageApplicationTime * (this.statistics.totalApplications - 1) + record.applicationTime;
    this.statistics.averageApplicationTime = totalTime / this.statistics.totalApplications;
  }

  /**
   * 生成应用ID
   */
  generateApplicationId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      ...this.statistics,
      successRate: this.statistics.totalApplications > 0 
        ? this.statistics.successfulApplications / this.statistics.totalApplications 
        : 0,
      nodeSuccessRate: (this.statistics.totalNodesApplied + this.statistics.totalNodesFailed) > 0
        ? this.statistics.totalNodesApplied / (this.statistics.totalNodesApplied + this.statistics.totalNodesFailed)
        : 0,
      recentApplications: this.applicationHistory.slice(-10),
      rollbackStackSize: this.rollbackStack.length
    };
  }

  /**
   * 获取策略列表
   */
  getStrategies() {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      config: strategy.config
    }));
  }

  /**
   * 切换应用策略
   */
  setStrategy(strategyName) {
    if (!this.strategies.has(strategyName)) {
      throw new PositionApplicationError(`未找到应用策略: ${strategyName}`);
    }

    this.config.strategy = strategyName;
    console.log(`🔧 [位置应用器] 切换策略: ${strategyName}`);
  }

  /**
   * 重新配置
   */
  reconfigure(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // 重新初始化策略（如果配置了新的策略配置）
    if (newConfig.strategyConfigs) {
      this.initializeStrategies();
    }
    
    console.log(`🔧 [位置应用器] 重新配置完成`);
  }

  /**
   * 清理历史记录
   */
  clearHistory() {
    this.applicationHistory = [];
    this.rollbackStack = [];
    this.statistics = {
      totalApplications: 0,
      successfulApplications: 0,
      failedApplications: 0,
      totalNodesApplied: 0,
      totalNodesFailed: 0,
      averageApplicationTime: 0
    };
    
    console.log(`🗑️ [位置应用器] 历史记录已清理`);
  }
}