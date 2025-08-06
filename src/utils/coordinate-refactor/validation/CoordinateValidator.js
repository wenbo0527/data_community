/**
 * 坐标验证器 - 验证计算结果的正确性
 */

import { CoordinateValidationError, globalErrorHandler } from '../errors/CoordinateErrors.js';

/**
 * 验证规则基类
 */
export class ValidationRule {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
    this.severity = config.severity || 'error'; // error, warning, info
  }

  /**
   * 验证方法 - 子类需要实现
   * @param {Map} positions - 节点位置映射
   * @param {Array} layers - 层级数据
   * @param {Object} context - 验证上下文
   * @returns {Array} 验证结果
   */
  validate(positions, layers, context) {
    throw new Error('ValidationRule.validate() must be implemented by subclass');
  }

  /**
   * 创建验证结果
   */
  createResult(isValid, message, details = {}) {
    return {
      rule: this.name,
      isValid,
      severity: this.severity,
      message,
      details,
      timestamp: Date.now()
    };
  }
}

/**
 * 边界验证规则
 */
export class BoundaryValidationRule extends ValidationRule {
  constructor(config = {}) {
    super('boundary', config);
    this.minX = config.minX || -10000;
    this.maxX = config.maxX || 10000;
    this.minY = config.minY || -10000;
    this.maxY = config.maxY || 10000;
  }

  validate(positions, layers, context) {
    const results = [];
    const violations = [];

    positions.forEach((position, nodeId) => {
      if (position.x < this.minX || position.x > this.maxX ||
          position.y < this.minY || position.y > this.maxY) {
        violations.push({
          nodeId,
          position,
          bounds: {
            minX: this.minX,
            maxX: this.maxX,
            minY: this.minY,
            maxY: this.maxY
          }
        });
      }
    });

    if (violations.length > 0) {
      results.push(this.createResult(
        false,
        `${violations.length} 个节点超出边界范围`,
        { violations, totalNodes: positions.size }
      ));
    } else {
      results.push(this.createResult(
        true,
        '所有节点都在边界范围内',
        { totalNodes: positions.size }
      ));
    }

    return results;
  }
}

/**
 * 重叠验证规则
 */
export class OverlapValidationRule extends ValidationRule {
  constructor(config = {}) {
    super('overlap', config);
    this.minDistance = config.minDistance || 50;
    this.tolerance = config.tolerance || 5;
  }

  validate(positions, layers, context) {
    const results = [];
    const overlaps = [];
    const positionArray = Array.from(positions.entries());

    for (let i = 0; i < positionArray.length; i++) {
      for (let j = i + 1; j < positionArray.length; j++) {
        const [nodeIdA, posA] = positionArray[i];
        const [nodeIdB, posB] = positionArray[j];

        const distance = Math.sqrt(
          Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2)
        );

        if (distance < this.minDistance - this.tolerance) {
          overlaps.push({
            nodeA: nodeIdA,
            nodeB: nodeIdB,
            distance: Number(distance.toFixed(2)),
            minDistance: this.minDistance,
            severity: distance < this.minDistance / 2 ? 'critical' : 'warning'
          });
        }
      }
    }

    if (overlaps.length > 0) {
      const criticalOverlaps = overlaps.filter(o => o.severity === 'critical');
      results.push(this.createResult(
        false,
        `检测到 ${overlaps.length} 个重叠问题 (${criticalOverlaps.length} 个严重)`,
        { overlaps, criticalCount: criticalOverlaps.length }
      ));
    } else {
      results.push(this.createResult(
        true,
        '没有检测到节点重叠',
        { totalChecks: positionArray.length * (positionArray.length - 1) / 2 }
      ));
    }

    return results;
  }
}

/**
 * 层级一致性验证规则
 */
export class LayerConsistencyValidationRule extends ValidationRule {
  constructor(config = {}) {
    super('layerConsistency', config);
    this.yTolerance = config.yTolerance || 20;
    this.minLayerSpacing = config.minLayerSpacing || 100;
  }

  validate(positions, layers, context) {
    const results = [];
    const inconsistencies = [];
    const layerStats = [];

    layers.forEach((layer, index) => {
      if (!layer.nodes || layer.nodes.length === 0) return;

      const layerPositions = layer.nodes
        .filter(node => positions.has(node.id))
        .map(node => positions.get(node.id));

      if (layerPositions.length === 0) return;

      // 计算层级统计
      const yValues = layerPositions.map(pos => pos.y);
      const avgY = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      const ySpread = maxY - minY;

      layerStats.push({
        layerIndex: index,
        nodeCount: layerPositions.length,
        avgY: Number(avgY.toFixed(2)),
        minY: Number(minY.toFixed(2)),
        maxY: Number(maxY.toFixed(2)),
        ySpread: Number(ySpread.toFixed(2))
      });

      // 检查层级内一致性
      if (ySpread > this.yTolerance) {
        inconsistencies.push({
          type: 'intraLayer',
          layerIndex: index,
          ySpread,
          tolerance: this.yTolerance,
          nodeCount: layerPositions.length
        });
      }
    });

    // 检查层级间间距
    for (let i = 0; i < layerStats.length - 1; i++) {
      const currentLayer = layerStats[i];
      const nextLayer = layerStats[i + 1];
      const spacing = Math.abs(nextLayer.avgY - currentLayer.avgY);

      if (spacing < this.minLayerSpacing) {
        inconsistencies.push({
          type: 'interLayer',
          layerA: currentLayer.layerIndex,
          layerB: nextLayer.layerIndex,
          spacing: Number(spacing.toFixed(2)),
          minSpacing: this.minLayerSpacing
        });
      }
    }

    if (inconsistencies.length > 0) {
      results.push(this.createResult(
        false,
        `检测到 ${inconsistencies.length} 个层级一致性问题`,
        { inconsistencies, layerStats }
      ));
    } else {
      results.push(this.createResult(
        true,
        '层级一致性验证通过',
        { layerStats }
      ));
    }

    return results;
  }
}

/**
 * 连接有效性验证规则
 */
export class ConnectionValidityValidationRule extends ValidationRule {
  constructor(config = {}) {
    super('connectionValidity', config);
    this.maxConnectionLength = config.maxConnectionLength || 1000;
    this.minConnectionLength = config.minConnectionLength || 10;
  }

  validate(positions, layers, context) {
    const results = [];
    const invalidConnections = [];
    let totalConnections = 0;

    layers.forEach(layer => {
      if (!layer.connections) return;

      layer.connections.forEach(connection => {
        totalConnections++;
        const sourcePos = positions.get(connection.source);
        const targetPos = positions.get(connection.target);

        if (!sourcePos || !targetPos) {
          invalidConnections.push({
            type: 'missingNode',
            connection,
            missingSource: !sourcePos,
            missingTarget: !targetPos
          });
          return;
        }

        const length = Math.sqrt(
          Math.pow(targetPos.x - sourcePos.x, 2) + 
          Math.pow(targetPos.y - sourcePos.y, 2)
        );

        if (length > this.maxConnectionLength) {
          invalidConnections.push({
            type: 'tooLong',
            connection,
            length: Number(length.toFixed(2)),
            maxLength: this.maxConnectionLength
          });
        } else if (length < this.minConnectionLength) {
          invalidConnections.push({
            type: 'tooShort',
            connection,
            length: Number(length.toFixed(2)),
            minLength: this.minConnectionLength
          });
        }
      });
    });

    if (invalidConnections.length > 0) {
      results.push(this.createResult(
        false,
        `检测到 ${invalidConnections.length} 个无效连接`,
        { invalidConnections, totalConnections }
      ));
    } else {
      results.push(this.createResult(
        true,
        `所有 ${totalConnections} 个连接都有效`,
        { totalConnections }
      ));
    }

    return results;
  }
}

/**
 * 性能验证规则
 */
export class PerformanceValidationRule extends ValidationRule {
  constructor(config = {}) {
    super('performance', config);
    this.maxCalculationTime = config.maxCalculationTime || 5000; // 5秒
    this.maxMemoryUsage = config.maxMemoryUsage || 100 * 1024 * 1024; // 100MB
  }

  validate(positions, layers, context) {
    const results = [];
    const issues = [];

    // 检查计算时间
    if (context.calculationTime && context.calculationTime > this.maxCalculationTime) {
      issues.push({
        type: 'calculationTime',
        actual: context.calculationTime,
        threshold: this.maxCalculationTime,
        unit: 'ms'
      });
    }

    // 检查内存使用（如果可用）
    if (context.memoryUsage && context.memoryUsage > this.maxMemoryUsage) {
      issues.push({
        type: 'memoryUsage',
        actual: context.memoryUsage,
        threshold: this.maxMemoryUsage,
        unit: 'bytes'
      });
    }

    // 检查节点密度
    const nodeCount = positions.size;
    const density = nodeCount / (layers.length || 1);
    if (density > 100) { // 每层超过100个节点
      issues.push({
        type: 'nodeDensity',
        actual: Number(density.toFixed(2)),
        threshold: 100,
        unit: 'nodes/layer'
      });
    }

    if (issues.length > 0) {
      results.push(this.createResult(
        false,
        `检测到 ${issues.length} 个性能问题`,
        { issues }
      ));
    } else {
      results.push(this.createResult(
        true,
        '性能验证通过',
        { 
          nodeCount,
          layerCount: layers.length,
          density: Number(density.toFixed(2))
        }
      ));
    }

    return results;
  }
}

/**
 * 坐标验证器主类
 */
export class CoordinateValidator {
  constructor(config = {}) {
    this.config = {
      enabledRules: config.enabledRules || ['boundary', 'overlap', 'layerConsistency', 'connectionValidity', 'performance'],
      strictMode: config.strictMode || false,
      continueOnError: config.continueOnError !== false,
      logLevel: config.logLevel || 'info',
      ...config
    };

    this.rules = new Map();
    this.validationHistory = [];
    this.statistics = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      totalIssues: 0
    };

    this.initializeRules();
  }

  /**
   * 初始化验证规则
   */
  initializeRules() {
    const ruleConfigs = this.config.ruleConfigs || {};

    // 注册默认规则
    this.registerRule(new BoundaryValidationRule(ruleConfigs.boundary || {}));
    this.registerRule(new OverlapValidationRule(ruleConfigs.overlap || {}));
    this.registerRule(new LayerConsistencyValidationRule(ruleConfigs.layerConsistency || {}));
    this.registerRule(new ConnectionValidityValidationRule(ruleConfigs.connectionValidity || {}));
    this.registerRule(new PerformanceValidationRule(ruleConfigs.performance || {}));

    console.log(`✅ [坐标验证器] 初始化完成 - ${this.rules.size} 个验证规则`);
  }

  /**
   * 注册验证规则
   */
  registerRule(rule) {
    if (!(rule instanceof ValidationRule)) {
      throw new CoordinateValidationError('验证规则必须继承自 ValidationRule');
    }

    this.rules.set(rule.name, rule);
    console.log(`📝 [坐标验证器] 注册规则: ${rule.name}`);
  }

  /**
   * 移除验证规则
   */
  unregisterRule(ruleName) {
    const removed = this.rules.delete(ruleName);
    if (removed) {
      console.log(`🗑️ [坐标验证器] 移除规则: ${ruleName}`);
    }
    return removed;
  }

  /**
   * 验证坐标 - 主入口方法
   * @param {Map} positions - 节点位置映射
   * @param {Array} layers - 层级数据
   * @param {Object} context - 验证上下文
   * @returns {Object} 验证结果
   */
  async validate(positions, layers, context = {}) {
    const validationId = this.generateValidationId();
    const startTime = performance.now();

    console.log(`🔍 [坐标验证器] 开始验证 - ID: ${validationId}, 节点数: ${positions.size}`);

    try {
      // 验证输入
      this.validateInput(positions, layers);

      // 执行验证规则
      const ruleResults = await this.executeValidationRules(positions, layers, context);

      // 分析结果
      const analysis = this.analyzeResults(ruleResults);

      // 生成报告
      const report = this.generateReport(validationId, ruleResults, analysis, context);

      // 记录统计
      this.updateStatistics(analysis);

      // 记录历史
      this.recordValidationHistory(validationId, report);

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      console.log(`✅ [坐标验证器] 验证完成 - ID: ${validationId}, 耗时: ${validationTime.toFixed(2)}ms, 状态: ${analysis.isValid ? '通过' : '失败'}`);

      return {
        ...report,
        validationTime: Number(validationTime.toFixed(2))
      };
    } catch (error) {
      const validationError = new CoordinateValidationError(
        `坐标验证失败: ${error.message}`,
        null,
        { validationId, nodeCount: positions.size, layerCount: layers.length }
      );

      globalErrorHandler.handleError(validationError, {
        component: 'CoordinateValidator',
        method: 'validate',
        validationId
      });

      throw validationError;
    }
  }

  /**
   * 验证输入数据
   */
  validateInput(positions, layers) {
    if (!(positions instanceof Map)) {
      throw new CoordinateValidationError('positions 必须是 Map 类型');
    }

    if (!Array.isArray(layers)) {
      throw new CoordinateValidationError('layers 必须是数组类型');
    }

    if (positions.size === 0) {
      throw new CoordinateValidationError('positions 不能为空');
    }

    // 验证位置数据格式
    for (const [nodeId, position] of positions) {
      if (!position || typeof position !== 'object') {
        throw new CoordinateValidationError(`节点 ${nodeId} 的位置数据格式错误`);
      }

      if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new CoordinateValidationError(`节点 ${nodeId} 的坐标必须是数字`);
      }

      if (!isFinite(position.x) || !isFinite(position.y)) {
        throw new CoordinateValidationError(`节点 ${nodeId} 的坐标必须是有限数字`);
      }
    }

    console.log(`✅ [坐标验证器] 输入验证通过 - ${positions.size} 个节点, ${layers.length} 个层级`);
  }

  /**
   * 执行验证规则
   */
  async executeValidationRules(positions, layers, context) {
    const ruleResults = [];
    const enabledRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled && this.config.enabledRules.includes(rule.name));

    console.log(`🔄 [坐标验证器] 执行 ${enabledRules.length} 个验证规则`);

    for (const rule of enabledRules) {
      try {
        console.log(`  🔍 执行规则: ${rule.name}`);
        const results = rule.validate(positions, layers, context);
        
        if (Array.isArray(results)) {
          ruleResults.push(...results);
        } else {
          ruleResults.push(results);
        }

        console.log(`  ✅ 规则 ${rule.name} 完成 - ${results.length || 1} 个结果`);
      } catch (error) {
        const ruleError = {
          rule: rule.name,
          isValid: false,
          severity: 'error',
          message: `规则执行失败: ${error.message}`,
          details: { error: error.message },
          timestamp: Date.now()
        };

        ruleResults.push(ruleError);
        
        console.error(`❌ 规则 ${rule.name} 执行失败:`, error.message);

        if (!this.config.continueOnError) {
          throw new CoordinateValidationError(
            `验证规则 ${rule.name} 执行失败: ${error.message}`,
            null,
            { rule: rule.name }
          );
        }
      }
    }

    return ruleResults;
  }

  /**
   * 分析验证结果
   */
  analyzeResults(ruleResults) {
    const analysis = {
      isValid: true,
      totalRules: ruleResults.length,
      passedRules: 0,
      failedRules: 0,
      warningRules: 0,
      errorRules: 0,
      criticalIssues: 0,
      totalIssues: 0,
      severityBreakdown: {
        error: 0,
        warning: 0,
        info: 0
      }
    };

    ruleResults.forEach(result => {
      if (result.isValid) {
        analysis.passedRules++;
      } else {
        analysis.failedRules++;
        analysis.totalIssues++;

        if (result.severity === 'error') {
          analysis.errorRules++;
          analysis.severityBreakdown.error++;
          analysis.isValid = false;
        } else if (result.severity === 'warning') {
          analysis.warningRules++;
          analysis.severityBreakdown.warning++;
          
          if (!this.config.strictMode) {
            // 在非严格模式下，警告不影响整体验证结果
          } else {
            analysis.isValid = false;
          }
        } else {
          analysis.severityBreakdown.info++;
        }

        // 检查是否有严重问题
        if (result.details && result.details.criticalCount) {
          analysis.criticalIssues += result.details.criticalCount;
        }
      }
    });

    return analysis;
  }

  /**
   * 生成验证报告
   */
  generateReport(validationId, ruleResults, analysis, context) {
    const report = {
      validationId,
      timestamp: Date.now(),
      isValid: analysis.isValid,
      summary: {
        totalRules: analysis.totalRules,
        passedRules: analysis.passedRules,
        failedRules: analysis.failedRules,
        totalIssues: analysis.totalIssues,
        criticalIssues: analysis.criticalIssues,
        severityBreakdown: analysis.severityBreakdown
      },
      results: ruleResults,
      context: {
        nodeCount: context.nodeCount || 0,
        layerCount: context.layerCount || 0,
        calculationTime: context.calculationTime,
        memoryUsage: context.memoryUsage
      },
      recommendations: this.generateRecommendations(ruleResults, analysis)
    };

    return report;
  }

  /**
   * 生成建议
   */
  generateRecommendations(ruleResults, analysis) {
    const recommendations = [];

    // 基于验证结果生成建议
    ruleResults.forEach(result => {
      if (!result.isValid) {
        switch (result.rule) {
          case 'overlap':
            recommendations.push({
              type: 'optimization',
              priority: 'high',
              message: '建议增加节点间距或使用更好的分布算法',
              rule: result.rule
            });
            break;
          case 'layerConsistency':
            recommendations.push({
              type: 'configuration',
              priority: 'medium',
              message: '建议调整层级计算策略或增加层级间距',
              rule: result.rule
            });
            break;
          case 'performance':
            recommendations.push({
              type: 'performance',
              priority: 'medium',
              message: '建议启用缓存或使用批处理模式',
              rule: result.rule
            });
            break;
          case 'boundary':
            recommendations.push({
              type: 'configuration',
              priority: 'high',
              message: '建议调整边界范围或缩放坐标',
              rule: result.rule
            });
            break;
        }
      }
    });

    // 基于整体分析生成建议
    if (analysis.criticalIssues > 0) {
      recommendations.push({
        type: 'urgent',
        priority: 'critical',
        message: `检测到 ${analysis.criticalIssues} 个严重问题，建议立即修复`,
        rule: 'general'
      });
    }

    if (analysis.totalIssues > analysis.totalRules * 0.5) {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        message: '问题较多，建议重新评估计算策略和参数配置',
        rule: 'general'
      });
    }

    return recommendations;
  }

  /**
   * 更新统计信息
   */
  updateStatistics(analysis) {
    this.statistics.totalValidations++;
    
    if (analysis.isValid) {
      this.statistics.passedValidations++;
    } else {
      this.statistics.failedValidations++;
    }
    
    this.statistics.totalIssues += analysis.totalIssues;
  }

  /**
   * 记录验证历史
   */
  recordValidationHistory(validationId, report) {
    this.validationHistory.push({
      id: validationId,
      timestamp: report.timestamp,
      isValid: report.isValid,
      issueCount: report.summary.totalIssues,
      criticalIssues: report.summary.criticalIssues,
      nodeCount: report.context.nodeCount,
      layerCount: report.context.layerCount
    });

    // 限制历史记录大小
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100);
    }
  }

  /**
   * 生成验证ID
   */
  generateValidationId() {
    return `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      ...this.statistics,
      successRate: this.statistics.totalValidations > 0 
        ? this.statistics.passedValidations / this.statistics.totalValidations 
        : 0,
      averageIssuesPerValidation: this.statistics.totalValidations > 0
        ? this.statistics.totalIssues / this.statistics.totalValidations
        : 0,
      recentValidations: this.validationHistory.slice(-10)
    };
  }

  /**
   * 获取规则列表
   */
  getRules() {
    return Array.from(this.rules.values()).map(rule => ({
      name: rule.name,
      enabled: rule.enabled,
      severity: rule.severity,
      config: rule.config
    }));
  }

  /**
   * 启用/禁用规则
   */
  setRuleEnabled(ruleName, enabled) {
    const rule = this.rules.get(ruleName);
    if (rule) {
      rule.enabled = enabled;
      console.log(`🔧 [坐标验证器] 规则 ${ruleName} ${enabled ? '启用' : '禁用'}`);
      return true;
    }
    return false;
  }

  /**
   * 重新配置
   */
  reconfigure(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // 重新初始化规则（如果配置了新的规则配置）
    if (newConfig.ruleConfigs) {
      this.initializeRules();
    }
    
    console.log(`🔧 [坐标验证器] 重新配置完成`);
  }

  /**
   * 清理历史记录
   */
  clearHistory() {
    this.validationHistory = [];
    this.statistics = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      totalIssues: 0
    };
    
    console.log(`🗑️ [坐标验证器] 历史记录已清理`);
  }
}