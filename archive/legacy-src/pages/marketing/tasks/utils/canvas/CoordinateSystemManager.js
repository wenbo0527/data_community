/**
 * 统一坐标系统管理器
 * 负责处理画布中所有元素的坐标偏移和转换
 */
export class CoordinateSystemManager {
  constructor() {
    // 图形实例引用
    this.graph = null;
    
    // 调试模式
    this.debugMode = false;
    
    // 缓存机制
    this.cache = {
      coordinateTransforms: new Map(), // 坐标转换缓存
      nodePositions: new Map(),        // 节点位置缓存
      canvasTransform: null,           // 画布变换缓存
      lastCacheTime: 0,                // 最后缓存时间
      cacheTimeout: 100                // 缓存超时时间(ms)
    };
    
    // 性能统计
    this.performance = {
      cacheHits: 0,
      cacheMisses: 0,
      totalCalculations: 0
    };
    
    // 错误处理配置
    this.errorHandling = {
      maxRetries: 3,
      errorCount: 0,
      lastErrorTime: 0,
      errorThreshold: 10 // 错误阈值
    };
  }

  /**
   * 设置图形实例
   */
  setGraph(graph) {
    this.graph = graph;
    this.clearCache(); // 清除旧缓存
    this.log('Graph instance set');
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * 获取画布变换状态（带缓存）
   */
  getCanvasTransform() {
    if (!this.graph) return { translate: { tx: 0, ty: 0 }, scale: { sx: 1, sy: 1 } };
    
    // 检查缓存
    const now = Date.now();
    if (this.cache.canvasTransform && 
        (now - this.cache.lastCacheTime) < this.cache.cacheTimeout) {
      this.performance.cacheHits++;
      return this.cache.canvasTransform;
    }
    
    this.performance.cacheMisses++;
    
    try {
      const translate = this.graph.translate() || { tx: 0, ty: 0 };
      const scale = this.graph.scale() || { sx: 1, sy: 1 };
      
      // 🔧 安全检查：确保变换值是有效数字
      const safeTranslate = {
        tx: typeof translate.tx === 'number' && !isNaN(translate.tx) ? translate.tx : 0,
        ty: typeof translate.ty === 'number' && !isNaN(translate.ty) ? translate.ty : 0
      };
      
      const safeScale = {
        sx: typeof scale.sx === 'number' && !isNaN(scale.sx) && scale.sx > 0 ? scale.sx : 1,
        sy: typeof scale.sy === 'number' && !isNaN(scale.sy) && scale.sy > 0 ? scale.sy : 1
      };
      
      const result = {
        translate: safeTranslate,
        scale: safeScale
      };
      
      // 缓存结果
      this.cache.canvasTransform = result;
      this.cache.lastCacheTime = now;
      
      return result;
    } catch (error) {
      this.log('Error getting canvas transform, using defaults:', error);
      return { translate: { tx: 0, ty: 0 }, scale: { sx: 1, sy: 1 } };
    }
  }

  /**
   * 逻辑坐标转DOM坐标 - 带缓存优化和错误处理
   */
  logicalToDOM(logicalX, logicalY) {
    if (!this.graph) return { x: logicalX, y: logicalY };
    
    // 输入验证
    if (typeof logicalX !== 'number' || typeof logicalY !== 'number' || !isFinite(logicalX) || !isFinite(logicalY)) {
      this.handleError(`Invalid input coordinates: x=${logicalX}, y=${logicalY}`, 'logicalToDOM');
      return { x: 0, y: 0 };
    }
    
    // 检查缓存
    const cacheKey = `logical_${logicalX}_${logicalY}`;
    if (this.cache.coordinateTransforms.has(cacheKey)) {
      this.performance.cacheHits++;
      this.performance.totalCalculations++;
      return this.cache.coordinateTransforms.get(cacheKey);
    }
    
    this.performance.cacheMisses++;
    this.performance.totalCalculations++;
    
    // 使用安全转换
    const result = this.safeCoordinateTransform(logicalX, logicalY, (x, y) => {
      const transform = this.getCanvasTransform();
      const scale = transform.scale;
      const translate = transform.translate;
      
      // 应用变换：先缩放，再平移
      const domX = x * scale.sx + translate.tx;
      const domY = y * scale.sy + translate.ty;
      
      return { x: domX, y: domY };
    }, { x: logicalX, y: logicalY });
    
    // 缓存结果（限制缓存大小）
    if (this.cache.coordinateTransforms.size < 1000) {
      this.cache.coordinateTransforms.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * DOM坐标转逻辑坐标 - 带缓存优化和错误处理
   */
  DOMToLogical(domX, domY) {
    if (!this.graph) return { x: domX, y: domY };
    
    // 输入验证
    if (typeof domX !== 'number' || typeof domY !== 'number' || !isFinite(domX) || !isFinite(domY)) {
      this.handleError(`Invalid input coordinates: x=${domX}, y=${domY}`, 'DOMToLogical');
      return { x: 0, y: 0 };
    }
    
    // 检查缓存
    const cacheKey = `dom_${domX}_${domY}`;
    if (this.cache.coordinateTransforms.has(cacheKey)) {
      this.performance.cacheHits++;
      this.performance.totalCalculations++;
      return this.cache.coordinateTransforms.get(cacheKey);
    }
    
    this.performance.cacheMisses++;
    this.performance.totalCalculations++;
    
    // 使用安全转换
    const result = this.safeCoordinateTransform(domX, domY, (x, y) => {
      const transform = this.getCanvasTransform();
      const scale = transform.scale;
      const translate = transform.translate;
      
      if (scale.sx === 0 || scale.sy === 0) {
        this.handleError('Invalid or zero scale transform', 'DOMToLogical');
        return { x, y };
      }
      
      // 逆变换：先减去平移，再除以缩放
      const logicalX = (x - translate.tx) / scale.sx;
      const logicalY = (y - translate.ty) / scale.sy;
      
      return { x: logicalX, y: logicalY };
    }, { x: domX, y: domY });
    
    // 缓存结果（限制缓存大小）
    if (this.cache.coordinateTransforms.size < 1000) {
      this.cache.coordinateTransforms.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * 获取节点的实际DOM位置（相对于容器）- 增强错误处理
   */
  getNodeDOMPosition(nodeId) {
    if (!this.graph) {
      this.handleError('Graph not initialized', 'getNodeDOMPosition');
      return null;
    }
    
    try {
      const node = this.graph.getCellById(nodeId);
      if (!node) {
        this.handleError(`Node not found: ${nodeId}`, 'getNodeDOMPosition');
        return null;
      }
      
      const nodeView = this.graph.findViewByCell(node);
      if (!nodeView || !nodeView.container) {
        this.handleError(`Node view not found: ${nodeId}`, 'getNodeDOMPosition');
        return null;
      }
      
      const nodeRect = nodeView.container.getBoundingClientRect();
      const containerRect = this.graph.container.getBoundingClientRect();
      
      // 边界检查
      if (!this.isValidRect(nodeRect) || !this.isValidRect(containerRect)) {
        this.handleError('Invalid DOM rectangles', 'getNodeDOMPosition');
        return null;
      }
      
      return {
        x: nodeRect.left - containerRect.left,
        y: nodeRect.top - containerRect.top,
        width: nodeRect.width,
        height: nodeRect.height,
        centerX: nodeRect.left - containerRect.left + nodeRect.width / 2,
        centerY: nodeRect.top - containerRect.top + nodeRect.height / 2
      };
    } catch (error) {
      this.handleError(`DOM position calculation failed: ${error.message}`, 'getNodeDOMPosition');
      return null;
    }
  }

  /**
   * 计算逻辑坐标与DOM坐标的偏移差异 - 增强错误处理
   */
  calculateCoordinateOffset(nodeId) {
    if (!this.graph) {
      this.handleError('Graph not initialized', 'calculateCoordinateOffset');
      return { x: 0, y: 0 };
    }
    
    try {
      const node = this.graph.getCellById(nodeId);
      if (!node) {
        this.handleError(`Node not found: ${nodeId}`, 'calculateCoordinateOffset');
        return { x: 0, y: 0 };
      }
      
      const logicalPosition = node.getPosition();
      if (!this.isValidPosition(logicalPosition)) {
        this.handleError(`Invalid logical position for node: ${nodeId}`, 'calculateCoordinateOffset');
        return { x: 0, y: 0 };
      }
      
      const domPosition = this.getNodeDOMPosition(nodeId);
      if (!domPosition) {
        const error = `DOM position unavailable for node ${nodeId}`;
        this.log(error);
        throw new Error(error);
      }
      
      // 计算逻辑坐标对应的期望DOM位置
      const expectedDOM = this.logicalToDOM(logicalPosition.x, logicalPosition.y);
      
      // 边界检查
      if (!this.isValidPosition(expectedDOM)) {
        this.handleError('Invalid expected DOM position', 'calculateCoordinateOffset');
        return { x: 0, y: 0 };
      }
      
      // 计算实际偏移
      const offsetX = domPosition.x - expectedDOM.x;
      const offsetY = domPosition.y - expectedDOM.y;
      
      // 异常偏移检测
      if (Math.abs(offsetX) > 10000 || Math.abs(offsetY) > 10000) {
        this.handleError(`Abnormal coordinate offset detected: ${offsetX}, ${offsetY}`, 'calculateCoordinateOffset');
        return { x: 0, y: 0 };
      }
      
      return { x: offsetX, y: offsetY };
    } catch (error) {
      this.handleError(`Coordinate offset calculation failed: ${error.message}`, 'calculateCoordinateOffset');
      return { x: 0, y: 0 };
    }
  }

  /**
   * 修正拖拽点位置
   */
  correctDragHintPosition(sourceNodeId, nodePosition, nodeSize, branchIndex = 0) {
    if (!this.graph) return nodePosition;

    try {
      // 获取源节点的实际坐标偏移
      const offset = this.calculateCoordinateOffset(sourceNodeId);
      
      // 🔧 安全检查：确保nodeSize有效
      const safeWidth = nodeSize?.width || 120; // 默认宽度120px
      const safeHeight = nodeSize?.height || 40; // 默认高度40px
      
      // 计算拖拽点的基础位置（节点右侧中心）
      const baseX = nodePosition.x + safeWidth;
      const baseY = nodePosition.y + safeHeight / 2;
      
      // 应用偏移补偿
      const correctedPosition = {
        x: baseX - offset.x,
        y: baseY - offset.y
      };

      this.log('Drag hint position calculation:', {
        sourceNodeId,
        nodePosition,
        nodeSize,
        branchIndex,
        offset,
        basePosition: { x: baseX, y: baseY },
        correctedPosition
      });

      return correctedPosition;
    } catch (error) {
      this.log('Error in drag hint position calculation:', error);
      return nodePosition;
    }
  }

  /**
   * 修正预览线路径
   */
  // @ts-ignore
  correctPreviewLinePath(sourceNodeId, branchIndex, startPoint, endPoint, controlPoints = []) {
    if (!this.graph) return { startPoint, endPoint, controlPoints };

    try {
      // 获取源节点的实际坐标偏移
      const offset = this.calculateCoordinateOffset(sourceNodeId);
      
      // 应用偏移补偿到所有路径点
      const correctedStartPoint = {
        x: startPoint.x - offset.x,
        y: startPoint.y - offset.y
      };
      
      const correctedEndPoint = {
        x: endPoint.x - offset.x,
        y: endPoint.y - offset.y
      };
      
      const correctedControlPoints = controlPoints.map(point => ({
        x: point.x - offset.x,
        y: point.y - offset.y
      }));

      this.log('Preview line path calculation:', {
        sourceNodeId,
        branchIndex,
        offset,
        originalPath: { startPoint, endPoint, controlPoints },
        correctedPath: {
          startPoint: correctedStartPoint,
          endPoint: correctedEndPoint,
          controlPoints: correctedControlPoints
        }
      });

      return {
        startPoint: correctedStartPoint,
        endPoint: correctedEndPoint,
        controlPoints: correctedControlPoints
      };
    } catch (error) {
      this.log('Error in preview line path calculation:', error);
      return { startPoint, endPoint, controlPoints };
    }
  }

  /**
   * 获取节点的DOM中心点
   */
  getNodeDOMCenter(node) {
    if (!node || !this.graph) return null;
    
    try {
      const nodeView = this.graph.findViewByCell(node);
      if (!nodeView) return null;
      
      const nodeElement = nodeView.container;
      const rect = nodeElement.getBoundingClientRect();
      const containerRect = this.graph.container.getBoundingClientRect();
      
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2
      };
    } catch (error) {
      this.log('Error getting node DOM center:', error);
      return null;
    }
  }

  /**
   * 验证坐标转换的准确性
   */
  validateCoordinateTransform(node) {
    if (!node || !this.graph) return null;
    
    try {
      const logicalPosition = node.getPosition();
      
      // 🔧 安全检查：确保逻辑位置是有效的
      if (!logicalPosition || 
          typeof logicalPosition.x !== 'number' || isNaN(logicalPosition.x) ||
          typeof logicalPosition.y !== 'number' || isNaN(logicalPosition.y)) {
        this.log('Invalid logical position for node:', { nodeId: node.id, logicalPosition });
        return null;
      }
      
      const domPosition = this.logicalToDOM(logicalPosition.x, logicalPosition.y);
      const actualDOMCenter = this.getNodeDOMCenter(node);
      
      const validation = {
        nodeId: node.id,
        logicalPosition,
        calculatedDOMPosition: domPosition,
        actualDOMCenter,
        difference: actualDOMCenter ? {
          x: actualDOMCenter.x - domPosition.x,
          y: actualDOMCenter.y - domPosition.y
        } : null
      };
      
      this.log('Coordinate transform validation:', validation);
      return validation;
    } catch (error) {
      this.log('Error in coordinate validation:', error);
      return null;
    }
  }

  /**
   * 调试日志
   */
  log(message, data = null) {
    // 已禁用日志输出以减少控制台冗余信息
    // if (this.debugMode) {
    //   console.log(`[CoordinateSystemManager] ${message}`, data || '');
    // }
  }

  /**
   * 清除所有缓存
   */
  clearCache() {
    this.cache.coordinateTransforms.clear();
    this.cache.nodePositions.clear();
    this.cache.canvasTransform = null;
    this.cache.lastCacheTime = 0;
    this.log('Cache cleared');
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const hitRate = this.performance.totalCalculations > 0 
      ? (this.performance.cacheHits / (this.performance.cacheHits + this.performance.cacheMisses) * 100).toFixed(2)
      : 0;
    
    return {
      cacheHits: this.performance.cacheHits,
      cacheMisses: this.performance.cacheMisses,
      totalCalculations: this.performance.totalCalculations,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.coordinateTransforms.size
    };
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats() {
    this.performance.cacheHits = 0;
    this.performance.cacheMisses = 0;
    this.performance.totalCalculations = 0;
    this.log('Performance stats reset');
  }

  /**
   * 修正布局位置（新增方法）
   */
  correctLayoutPosition(nodeId, position) {
    if (!this.graph || !position) return position;
    
    try {
      // 获取节点的坐标偏移
      const offset = this.calculateCoordinateOffset(nodeId);
      
      // 应用偏移补偿
      const correctedPosition = {
        x: position.x - offset.x,
        y: position.y - offset.y
      };
      
      this.log('Layout position correction:', {
        nodeId,
        originalPosition: position,
        offset,
        correctedPosition
      });
      
      return correctedPosition;
    } catch (error) {
      this.log('Error in layout position correction:', error);
      return position;
    }
  }

  /**
   * 错误处理函数
   */
  handleError(message, method = 'unknown') {
    this.errorHandling.errorCount++;
    this.errorHandling.lastErrorTime = Date.now();
    
    const errorInfo = {
      message,
      method,
      timestamp: new Date().toISOString(),
      errorCount: this.errorHandling.errorCount
    };
    
    if (this.debugMode) {
      console.error(`[CoordinateSystemManager] ${method}: ${message}`, errorInfo);
    }
    
    // 错误阈值检查
    if (this.errorHandling.errorCount > this.errorHandling.errorThreshold) {
      console.warn(`[CoordinateSystemManager] Error threshold exceeded: ${this.errorHandling.errorCount} errors`);
      
      // 错误阈值超出时重置错误状态
      this.resetErrorState();
      throw new Error(`坐标系统错误阈值超出: ${this.errorHandling.errorCount} 个错误`);
    }
    
    return errorInfo;
  }
  
  /**
   * 重置错误状态
   */
  resetErrorState() {
    this.errorHandling.errorCount = 0;
    this.errorHandling.lastErrorTime = 0;
    this.clearCache();
    
    if (this.debugMode) {
      console.log('[CoordinateSystemManager] Error state reset');
    }
  }
  
  /**
   * 验证位置对象是否有效
   */
  isValidPosition(position) {
    if (!position || typeof position !== 'object') {
      return false;
    }
    
    const { x, y } = position;
    return typeof x === 'number' && typeof y === 'number' && 
           !isNaN(x) && !isNaN(y) && 
           isFinite(x) && isFinite(y);
  }
  
  /**
   * 验证矩形对象是否有效
   */
  isValidRect(rect) {
    if (!rect || typeof rect !== 'object') {
      return false;
    }
    
    const { left, top, width, height } = rect;
    return typeof left === 'number' && typeof top === 'number' &&
           typeof width === 'number' && typeof height === 'number' &&
           !isNaN(left) && !isNaN(top) && !isNaN(width) && !isNaN(height) &&
           isFinite(left) && isFinite(top) && isFinite(width) && isFinite(height) &&
           width >= 0 && height >= 0;
  }
  
  /**
   * 安全的坐标转换（带重试机制）
   */
  safeCoordinateTransform(x, y, transformFn) {
    let retries = 0;
    
    while (retries < this.errorHandling.maxRetries) {
      try {
        const result = transformFn(x, y);
        if (this.isValidPosition(result)) {
          return result;
        }
        throw new Error('Invalid transform result');
      } catch (error) {
        retries++;
        this.handleError(`Transform attempt ${retries} failed: ${error.message}`, 'safeCoordinateTransform');
        
        if (retries >= this.errorHandling.maxRetries) {
          this.log(`Transform failed after ${retries} attempts`);
          throw new Error(`坐标变换失败，已重试 ${retries} 次: ${error.message}`);
        }
        
        // 短暂延迟后重试
        if (retries < this.errorHandling.maxRetries) {
          // 在实际应用中可能需要异步延迟，这里简化处理
          continue;
        }
      }
    }
    
    throw new Error('坐标变换失败，所有重试均已用尽');
  }
  
  /**
   * 获取错误统计信息
   */
  getErrorStats() {
    return {
      errorCount: this.errorHandling.errorCount,
      lastErrorTime: this.errorHandling.lastErrorTime,
      errorThreshold: this.errorHandling.errorThreshold,
      maxRetries: this.errorHandling.maxRetries
    };
  }
  
  /**
   * 获取当前配置状态
   */
  getStatus() {
    const transform = this.getCanvasTransform();
    const performanceStats = this.getPerformanceStats();
    
    return {
      hasGraph: !!this.graph,
      canvasTransform: transform,
      debugMode: this.debugMode,
      cache: {
        coordinateTransformsSize: this.cache.coordinateTransforms.size,
        nodePositionsSize: this.cache.nodePositions.size,
        hasCanvasTransformCache: !!this.cache.canvasTransform,
        cacheTimeout: this.cache.cacheTimeout
      },
      performance: performanceStats,
      errorHandling: this.getErrorStats()
    };
  }
}

// 创建全局实例
export const coordinateManager = new CoordinateSystemManager();

// 开发环境下启用调试
if (process.env.NODE_ENV === 'development') {
  coordinateManager.setDebugMode(true);
}