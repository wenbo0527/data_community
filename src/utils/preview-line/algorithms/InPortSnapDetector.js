/**
 * In端口专用吸附检测器
 * 专门针对目标节点的in端口进行吸附检测和视觉反馈
 */

import { PORT_CONSTANTS } from '../core/PortConfigurationFactory.js';

export class InPortSnapDetector {
  constructor(options = {}) {
    this.options = {
      // 吸附配置
      enabled: true,                    // 吸附功能总开关
      threshold: 40,                    // 吸附触发距离阈值(px)
      highlightThreshold: 60,           // 高亮显示距离阈值(px)
      maxCheckDistance: 200,            // 最大检查距离(px)
      
      // in端口特定配置
      targetPort: PORT_CONSTANTS.TARGET_PORT, // 固定为'in'端口
      portRadius: 8,                    // 端口检测半径
      portHighlightRadius: 12,          // 端口高亮半径
      portOffset: { x: 0, y: 0 },       // 端口位置偏移
      
      // 视觉反馈配置
      highlightColor: '#00ff00',        // 高亮颜色
      highlightOpacity: 0.8,            // 高亮透明度
      animationType: 'pulse',           // 动画类型
      animationDuration: 200,           // 动画持续时间(ms)
      showDistance: true,               // 显示距离信息
      showSnapHint: true,               // 显示吸附提示
      
      // 性能优化配置
      debounceTime: 16,                 // 防抖时间(约60fps)
      batchSize: 20,                    // 批量处理大小
      enableCache: true,                // 启用缓存
      cacheTimeout: 1000,               // 缓存超时时间(ms)
      
      // 调试配置
      debug: false,                     // 调试模式开关
      logLevel: 'info',                 // 日志级别
      showSnapArea: false,              // 显示吸附区域
      showDistanceInfo: false,          // 显示距离信息
      
      ...options
    };
    
    // 缓存管理
    this.cache = {
      nodePositions: new Map(),         // 节点位置缓存
      portPositions: new Map(),         // 端口位置缓存
      snapResults: new Map(),           // 吸附结果缓存
      lastUpdate: 0                     // 最后更新时间
    };
    
    // 性能统计
    this.stats = {
      detectionsPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      snapSuccesses: 0,
      snapFailures: 0,
      averageDetectionTime: 0,
      totalDetectionTime: 0
    };
    
    // 当前高亮状态
    this.currentHighlights = new Map();
    
    // 防抖定时器
    this.debounceTimer = null;
    
    console.log('✅ [InPortSnapDetector] 初始化完成', {
      targetPort: this.options.targetPort,
      threshold: this.options.threshold,
      enableCache: this.options.enableCache
    });
  }
  
  /**
   * 检查节点是否可以吸附到预览线
   * @param {string} nodeId - 节点ID
   * @param {Object} nodePosition - 节点位置
   * @param {Array} previewLines - 预览线数组
   * @param {Object} graph - 图形实例
   * @returns {Object} 吸附检测结果
   */
  checkNodeSnapToPreviewLines(nodeId, nodePosition, previewLines, graph) {
    const startTime = performance.now();
    
    try {
      // 基础验证
      if (!this.options.enabled) {
        console.log('🔧 [InPortSnapDetector] 吸附功能已禁用');
        return this.createSnapResult(false, 'snap_disabled');
      }
      
      if (!nodeId || !nodePosition || !previewLines || !graph) {
        console.log('🔧 [InPortSnapDetector] 参数无效', { nodeId, nodePosition, previewLines: !!previewLines, graph: !!graph });
        return this.createSnapResult(false, 'invalid_parameters');
      }
      
      if (!Array.isArray(previewLines) || previewLines.length === 0) {
        console.log('🔧 [InPortSnapDetector] 没有预览线可供吸附', { previewLinesCount: previewLines?.length });
        return this.createSnapResult(false, 'no_preview_lines');
      }
      
      // 获取目标节点
      const targetNode = graph.getCellById(nodeId);
      if (!targetNode) {
        console.log('🔧 [InPortSnapDetector] 目标节点未找到', { nodeId });
        return this.createSnapResult(false, 'node_not_found');
      }
      
      // 获取目标节点的in端口位置
      const inPortPosition = this.getNodeInPortPosition(targetNode, nodePosition);
      console.log('🔧 [InPortSnapDetector] 目标节点in端口位置', { nodeId, inPortPosition });
      
      // 验证in端口位置是否有效
      if (!inPortPosition || typeof inPortPosition.x !== 'number' || typeof inPortPosition.y !== 'number') {
        console.log('🔧 [InPortSnapDetector] in端口位置无效', { nodeId, inPortPosition });
        return this.createSnapResult(false, 'invalid_in_port_position');
      }
      
      // 检查缓存
      const cacheKey = this.generateCacheKey(nodeId, nodePosition, previewLines);
      if (this.options.enableCache && this.cache.snapResults.has(cacheKey)) {
        const cached = this.cache.snapResults.get(cacheKey);
        if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
          this.stats.cacheHits++;
          return cached.result;
        }
      }
      
      this.stats.cacheMisses++;
      this.stats.detectionsPerformed++;
      
      // 执行吸附检测
      const snapResult = this.performSnapDetection(inPortPosition, previewLines, targetNode);
      
      // 缓存结果
      if (this.options.enableCache) {
        this.cache.snapResults.set(cacheKey, {
          result: snapResult,
          timestamp: Date.now()
        });
      }
      
      // 更新统计
      const endTime = performance.now();
      const detectionTime = endTime - startTime;
      this.stats.totalDetectionTime += detectionTime;
      this.stats.averageDetectionTime = this.stats.totalDetectionTime / this.stats.detectionsPerformed;
      
      if (snapResult.canSnap) {
        this.stats.snapSuccesses++;
      } else {
        this.stats.snapFailures++;
      }
      
      if (this.options.debug) {
        console.log(`🔍 [InPortSnapDetector] 吸附检测完成`, {
          nodeId,
          canSnap: snapResult.canSnap,
          detectionTime: `${detectionTime.toFixed(2)}ms`,
          reason: snapResult.reason
        });
      }
      
      return snapResult;
      
    } catch (error) {
      console.error('❌ [InPortSnapDetector] 吸附检测异常:', error);
      return this.createSnapResult(false, 'detection_error', { error: error.message });
    }
  }
  
  /**
   * 执行吸附检测核心逻辑
   * @param {Object} inPortPosition - in端口位置
   * @param {Array} previewLines - 预览线数组
   * @param {Object} targetNode - 目标节点
   * @returns {Object} 吸附检测结果
   */
  performSnapDetection(inPortPosition, previewLines, targetNode) {
    let bestSnapTarget = null;
    let minDistance = Infinity;
    
    console.log('🔧 [InPortSnapDetector] 开始吸附检测', { 
      inPortPosition, 
      previewLinesCount: previewLines.length,
      threshold: this.options.threshold 
    });
    
    // 遍历所有预览线
    for (const previewLine of previewLines) {
      try {
        // 获取预览线终点
        const endPoint = this.getPreviewLineEndPoint(previewLine);
        if (!endPoint) {
          console.log('🔧 [InPortSnapDetector] 预览线终点获取失败', { previewLineId: previewLine.id });
          continue;
        }
        
        // 计算到in端口的距离
        const snapDistance = this.calculateSnapDistance(endPoint, inPortPosition);
        
        console.log('🔧 [InPortSnapDetector] 预览线距离计算', { 
          previewLineId: previewLine.id,
          endPoint,
          snapDistance: snapDistance.distance,
          threshold: this.options.threshold
        });
        
        // 检查是否在吸附阈值内
        if (snapDistance.distance < this.options.threshold && 
            snapDistance.distance < minDistance) {
          
          minDistance = snapDistance.distance;
          bestSnapTarget = {
            previewLineId: previewLine.id,
            previewLine: previewLine,
            targetPort: this.options.targetPort,
            snapDistance: snapDistance,
            snapPosition: this.calculateSnapPosition(inPortPosition, targetNode),
            endPoint: endPoint,
            inPortPosition: inPortPosition
          };
          
          console.log('🔧 [InPortSnapDetector] 找到更好的吸附目标', { 
            previewLineId: previewLine.id,
            distance: snapDistance.distance
          });
        }
        
      } catch (error) {
        console.warn('⚠️ [InPortSnapDetector] 预览线检测异常:', error, previewLine.id);
      }
    }
    
    const result = this.createSnapResult(
      bestSnapTarget !== null,
      bestSnapTarget ? 'snap_available' : 'no_snap_target',
      {
        snapTarget: bestSnapTarget,
        minDistance: minDistance,
        targetPort: this.options.targetPort,
        checkedPreviewLines: previewLines.length
      }
    );
    
    console.log('🔧 [InPortSnapDetector] 吸附检测结果', { 
      canSnap: result.canSnap,
      reason: result.reason,
      minDistance,
      bestTargetId: bestSnapTarget?.previewLineId
    });
    
    return result;
  }
  
  /**
   * 获取节点in端口的精确坐标
   * @param {Object} node - 节点对象
   * @param {Object} nodePosition - 节点位置（可选，用于覆盖）
   * @returns {Object} in端口位置
   */
  getNodeInPortPosition(node, nodePosition = null) {
    try {
      // 使用提供的位置或获取节点当前位置
      const position = nodePosition || node.getPosition();
      const size = node.getSize();
      
      // 🔧 修复：in端口位于节点顶部中央（适配垂直布局）
      const inPortPosition = {
        x: position.x + size.width / 2 + this.options.portOffset.x,  // 节点水平中心 + 偏移
        y: position.y + this.options.portOffset.y,                   // 节点顶部 + 偏移
        port: this.options.targetPort,
        nodeId: node.id,
        nodeSize: size,
        nodePosition: position
      };
      
      return inPortPosition;
      
    } catch (error) {
      console.error('❌ [InPortSnapDetector] 获取in端口位置失败:', error);
      return null;
    }
  }
  
  /**
   * 获取预览线终点位置
   * @param {Object} previewLine - 预览线对象
   * @returns {Object} 终点位置
   */
  getPreviewLineEndPoint(previewLine) {
    try {
      // 从预览线对象获取终点
      if (previewLine.graphInstance) {
        const targetPoint = previewLine.graphInstance.getTargetPoint();
        if (targetPoint) {
          return {
            x: targetPoint.x,
            y: targetPoint.y,
            previewLineId: previewLine.id
          };
        }
      }
      
      // 从预览线数据获取终点
      if (previewLine.target && previewLine.target.x !== undefined && previewLine.target.y !== undefined) {
        return {
          x: previewLine.target.x,
          y: previewLine.target.y,
          previewLineId: previewLine.id
        };
      }
      
      // 从预览线路径获取终点
      if (previewLine.path && previewLine.path.length > 0) {
        const lastPoint = previewLine.path[previewLine.path.length - 1];
        return {
          x: lastPoint.x,
          y: lastPoint.y,
          previewLineId: previewLine.id
        };
      }
      
      return null;
      
    } catch (error) {
      console.warn('⚠️ [InPortSnapDetector] 获取预览线终点失败:', error);
      return null;
    }
  }
  
  /**
   * 计算预览线终点到目标节点in端口的距离
   * @param {Object} previewLineEndPoint - 预览线终点
   * @param {Object} targetNodeInPort - 目标节点in端口
   * @returns {Object} 距离信息
   */
  calculateSnapDistance(previewLineEndPoint, targetNodeInPort) {
    const dx = previewLineEndPoint.x - targetNodeInPort.x;
    const dy = previewLineEndPoint.y - targetNodeInPort.y;
    
    return {
      distance: Math.sqrt(dx * dx + dy * dy),
      deltaX: dx,
      deltaY: dy,
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
      previewLineEndPoint,
      targetNodeInPort
    };
  }
  
  /**
   * 计算吸附位置
   * @param {Object} inPortPosition - in端口位置
   * @param {Object} targetNode - 目标节点
   * @returns {Object} 吸附位置
   */
  calculateSnapPosition(inPortPosition, targetNode) {
    const nodeSize = targetNode.getSize();
    
    return {
      x: inPortPosition.x - nodeSize.width / 2,
      y: inPortPosition.y - nodeSize.height / 2,
      centerX: inPortPosition.x,
      centerY: inPortPosition.y,
      port: this.options.targetPort
    };
  }
  
  /**
   * 应用in端口吸附高亮效果
   * @param {string} nodeId - 节点ID
   * @param {Object} snapInfo - 吸附信息
   * @param {Object} graph - 图形实例
   */
  highlightInPortForSnap(nodeId, snapInfo, graph) {
    try {
      if (!this.options.showSnapHint || !snapInfo.snapTarget) {
        return;
      }
      
      const node = graph.getCellById(nodeId);
      if (!node) return;
      
      const inPortPosition = snapInfo.snapTarget.inPortPosition;
      
      // 创建in端口高亮效果
      const highlightConfig = {
        position: inPortPosition,
        radius: this.options.portHighlightRadius,
        color: this.options.highlightColor,
        opacity: this.options.highlightOpacity,
        animation: this.options.animationType,
        duration: this.options.animationDuration,
        port: this.options.targetPort
      };
      
      // 应用高亮样式
      this.applyPortHighlight(nodeId, highlightConfig, graph);
      
      // 显示吸附提示
      if (this.options.showSnapHint) {
        this.showSnapHint({
          message: `吸附到 ${nodeId} 的输入端口`,
          position: inPortPosition,
          distance: snapInfo.minDistance,
          port: this.options.targetPort
        });
      }
      
    } catch (error) {
      console.error('❌ [InPortSnapDetector] 应用高亮效果失败:', error);
    }
  }
  
  /**
   * 应用端口高亮样式
   * @param {string} nodeId - 节点ID
   * @param {Object} highlightConfig - 高亮配置
   * @param {Object} graph - 图形实例
   */
  applyPortHighlight(nodeId, highlightConfig, graph) {
    try {
      // 清除之前的高亮
      this.clearPortHighlight(nodeId);
      
      // 创建高亮元素
      const highlightElement = this.createHighlightElement(highlightConfig);
      
      // 存储高亮状态
      this.currentHighlights.set(nodeId, {
        element: highlightElement,
        config: highlightConfig,
        timestamp: Date.now()
      });
      
      if (this.options.debug) {
        console.log(`✨ [InPortSnapDetector] 应用端口高亮: ${nodeId}.${highlightConfig.port}`);
      }
      
    } catch (error) {
      console.error('❌ [InPortSnapDetector] 应用端口高亮失败:', error);
    }
  }
  
  /**
   * 创建高亮元素
   * @param {Object} config - 高亮配置
   * @returns {Object} 高亮元素
   */
  createHighlightElement(config) {
    // 这里应该根据具体的图形库实现高亮元素创建
    // 暂时返回配置对象作为占位符
    return {
      type: 'port-highlight',
      position: config.position,
      radius: config.radius,
      color: config.color,
      opacity: config.opacity,
      animation: config.animation,
      duration: config.duration,
      port: config.port,
      created: Date.now()
    };
  }
  
  /**
   * 清除端口高亮
   * @param {string} nodeId - 节点ID
   */
  clearPortHighlight(nodeId) {
    if (this.currentHighlights.has(nodeId)) {
      const highlight = this.currentHighlights.get(nodeId);
      // 这里应该实际移除高亮元素
      this.currentHighlights.delete(nodeId);
      
      if (this.options.debug) {
        console.log(`🧹 [InPortSnapDetector] 清除端口高亮: ${nodeId}`);
      }
    }
  }
  
  /**
   * 显示吸附提示
   * @param {Object} hintInfo - 提示信息
   */
  showSnapHint(hintInfo) {
    if (this.options.debug) {
      console.log(`💡 [InPortSnapDetector] 吸附提示:`, hintInfo);
    }
    
    // 这里应该实现具体的提示显示逻辑
    // 可以是工具提示、状态栏信息等
  }
  
  /**
   * 创建吸附结果对象
   * @param {boolean} canSnap - 是否可以吸附
   * @param {string} reason - 原因
   * @param {Object} data - 附加数据
   * @returns {Object} 吸附结果
   */
  createSnapResult(canSnap, reason, data = {}) {
    return {
      canSnap,
      reason,
      targetPort: this.options.targetPort,
      timestamp: Date.now(),
      ...data
    };
  }
  
  /**
   * 生成缓存键
   * @param {string} nodeId - 节点ID
   * @param {Object} nodePosition - 节点位置
   * @param {Array} previewLines - 预览线数组
   * @returns {string} 缓存键
   */
  generateCacheKey(nodeId, nodePosition, previewLines) {
    const positionKey = `${Math.round(nodePosition.x)},${Math.round(nodePosition.y)}`;
    const previewLinesKey = previewLines.map(p => p.id).sort().join(',');
    return `${nodeId}_${positionKey}_${previewLinesKey}`;
  }
  
  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.nodePositions.clear();
    this.cache.portPositions.clear();
    this.cache.snapResults.clear();
    this.cache.lastUpdate = Date.now();
    
    console.log('🧹 [InPortSnapDetector] 缓存已清理');
  }
  
  /**
   * 清理所有高亮
   */
  clearAllHighlights() {
    for (const nodeId of this.currentHighlights.keys()) {
      this.clearPortHighlight(nodeId);
    }
    console.log('🧹 [InPortSnapDetector] 所有高亮已清理');
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.snapResults.size,
      cacheHitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0,
      currentHighlights: this.currentHighlights.size
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      detectionsPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      snapSuccesses: 0,
      snapFailures: 0,
      averageDetectionTime: 0,
      totalDetectionTime: 0
    };
    console.log('📊 [InPortSnapDetector] 统计信息已重置');
  }
  
  /**
   * 销毁检测器
   */
  destroy() {
    this.clearCache();
    this.clearAllHighlights();
    this.resetStats();
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    console.log('🗑️ [InPortSnapDetector] 检测器已销毁');
  }
}

// 创建默认实例
export const defaultInPortSnapDetector = new InPortSnapDetector();