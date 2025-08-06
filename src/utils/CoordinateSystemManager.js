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
  }

  /**
   * 设置图形实例
   */
  setGraph(graph) {
    this.graph = graph;
    this.log('Graph instance set');
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * 获取画布变换状态
   */
  getCanvasTransform() {
    if (!this.graph) return { translate: { tx: 0, ty: 0 }, scale: { sx: 1, sy: 1 } };
    
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
      
      return {
        translate: safeTranslate,
        scale: safeScale
      };
    } catch (error) {
      this.log('Error getting canvas transform, using defaults:', error);
      return { translate: { tx: 0, ty: 0 }, scale: { sx: 1, sy: 1 } };
    }
  }

  /**
   * 逻辑坐标转DOM坐标
   */
  logicalToDOM(logicalX, logicalY) {
    if (!this.graph) return { x: logicalX, y: logicalY };
    
    // 🔧 安全检查：确保输入坐标是有效数字
    if (typeof logicalX !== 'number' || isNaN(logicalX) || 
        typeof logicalY !== 'number' || isNaN(logicalY)) {
      this.log('Invalid logical coordinates:', { logicalX, logicalY });
      return { x: 0, y: 0 };
    }
    
    const transform = this.getCanvasTransform();
    const scale = transform.scale;
    const translate = transform.translate;
    
    // 应用变换：先缩放，再平移
    const domX = logicalX * scale.sx + translate.tx;
    const domY = logicalY * scale.sy + translate.ty;
    
    // 🔧 安全检查：确保计算结果是有效数字
    if (isNaN(domX) || isNaN(domY)) {
      this.log('DOM coordinate calculation failed:', {
        logicalX, logicalY, scale, translate, domX, domY
      });
      return { x: logicalX, y: logicalY }; // 返回原始坐标作为备用
    }
    
    return { x: domX, y: domY };
  }

  /**
   * DOM坐标转逻辑坐标
   */
  DOMToLogical(domX, domY) {
    if (!this.graph) return { x: domX, y: domY };
    
    // 🔧 安全检查：确保输入坐标是有效数字
    if (typeof domX !== 'number' || isNaN(domX) || 
        typeof domY !== 'number' || isNaN(domY)) {
      this.log('Invalid DOM coordinates:', { domX, domY });
      return { x: 0, y: 0 };
    }
    
    const transform = this.getCanvasTransform();
    const scale = transform.scale;
    const translate = transform.translate;
    
    // 逆变换：先减去平移，再除以缩放
    const logicalX = (domX - translate.tx) / scale.sx;
    const logicalY = (domY - translate.ty) / scale.sy;
    
    // 🔧 安全检查：确保计算结果是有效数字
    if (isNaN(logicalX) || isNaN(logicalY)) {
      this.log('Logical coordinate calculation failed:', {
        domX, domY, scale, translate, logicalX, logicalY
      });
      return { x: domX, y: domY }; // 返回原始坐标作为备用
    }
    
    return { x: logicalX, y: logicalY };
  }

  /**
   * 获取节点的实际DOM位置（相对于容器）
   */
  getNodeDOMPosition(nodeId) {
    if (!this.graph) return null;
    
    const node = this.graph.getCellById(nodeId);
    if (!node) return null;
    
    const nodeView = this.graph.findViewByCell(node);
    if (!nodeView || !nodeView.container) return null;
    
    const nodeRect = nodeView.container.getBoundingClientRect();
    const containerRect = this.graph.container.getBoundingClientRect();
    
    return {
      x: nodeRect.left - containerRect.left,
      y: nodeRect.top - containerRect.top,
      width: nodeRect.width,
      height: nodeRect.height,
      centerX: nodeRect.left - containerRect.left + nodeRect.width / 2,
      centerY: nodeRect.top - containerRect.top + nodeRect.height / 2
    };
  }

  /**
   * 计算逻辑坐标与DOM坐标的偏移差异
   */
  calculateCoordinateOffset(nodeId) {
    if (!this.graph) return { x: 0, y: 0 };
    
    const node = this.graph.getCellById(nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const logicalPosition = node.getPosition();
    const domPosition = this.getNodeDOMPosition(nodeId);
    
    if (!domPosition) return { x: 0, y: 0 };
    
    // 计算逻辑坐标对应的期望DOM位置
    const expectedDOM = this.logicalToDOM(logicalPosition.x, logicalPosition.y);
    
    // 计算实际偏移
    const offsetX = domPosition.x - expectedDOM.x;
    const offsetY = domPosition.y - expectedDOM.y;
    
    return { x: offsetX, y: offsetY };
  }

  /**
   * 修正拖拽点位置
   */
  correctDragHintPosition(sourceNodeId, nodePosition, nodeSize, branchIndex = 0) {
    if (!this.graph) return nodePosition;

    try {
      // 获取源节点的实际坐标偏移
      const offset = this.calculateCoordinateOffset(sourceNodeId);
      
      // 计算拖拽点的基础位置（节点右侧中心）
      const baseX = nodePosition.x + nodeSize.width;
      const baseY = nodePosition.y + nodeSize.height / 2;
      
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
   * 获取当前配置状态
   */
  getStatus() {
    const transform = this.getCanvasTransform();
    return {
      hasGraph: !!this.graph,
      canvasTransform: transform,
      debugMode: this.debugMode
    };
  }
}

// 创建全局实例
export const coordinateManager = new CoordinateSystemManager();

// 开发环境下启用调试
if (process.env.NODE_ENV === 'development') {
  coordinateManager.setDebugMode(true);
}