/**
 * 位置计算器
 * 负责预览线的位置计算、坐标验证和同步
 */

export class PositionCalculator {
  constructor(graph, options = {}) {
    this.graph = graph;
    this.options = {
      coordinateThreshold: 10, // 坐标偏差阈值
      retryAttempts: 3, // 重试次数
      enableLogging: true, // 启用日志
      ...options
    };
    
    console.log('📐 [位置计算器] 初始化完成');
  }

  /**
   * 获取节点的实际DOM中心坐标
   * @param {Object} node - 节点对象
   * @returns {Object|null} 中心坐标 {x, y} 或 null
   */
  getActualNodeCenter(node) {
    if (!node || !node.id) {
      console.warn('⚠️ [位置计算器] 节点对象无效');
      return null;
    }

    try {
      // 尝试从DOM获取实际位置
      const nodeView = this.graph?.findViewByCell?.(node);
      if (nodeView && nodeView.container) {
        const bbox = nodeView.container.getBBox();
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          const center = {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
          };
          
          if (this.options.enableLogging) {
            console.log('📍 [位置计算器] 获取DOM中心坐标:', {
              nodeId: node.id,
              center,
              bbox
            });
          }
          
          return center;
        }
      }

      // 回退到逻辑坐标
      const position = node.getPosition();
      const size = node.getSize();
      
      if (position && size) {
        const center = {
          x: position.x + size.width / 2,
          y: position.y + size.height / 2
        };
        
        if (this.options.enableLogging) {
          console.log('📍 [位置计算器] 使用逻辑中心坐标:', {
            nodeId: node.id,
            center,
            position,
            size
          });
        }
        
        return center;
      }

      console.warn('⚠️ [位置计算器] 无法获取节点坐标:', node.id);
      return null;
      
    } catch (error) {
      console.error('❌ [位置计算器] 获取节点中心坐标失败:', {
        nodeId: node.id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * 同步预览线位置
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 同步是否成功
   */
  syncPreviewLinePosition(previewInstance) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return false;
    }

    const { line, sourceNode } = previewInstance;
    
    try {
      // 验证line对象的必要方法
      if (!this.validateLineObject(line)) {
        return false;
      }

      // 验证sourceNode对象的必要方法
      if (!this.validateSourceNode(sourceNode)) {
        return false;
      }

      // 计算正确的out端口位置
      const outPortPosition = this.calculateOutPortPosition(sourceNode);
      if (!outPortPosition) {
        console.warn('⚠️ [位置计算器] 无法计算out端口位置');
        return false;
      }

      // 获取当前预览线的起始点
      const currentSource = this.safeGetSourcePoint(line);
      if (!currentSource) {
        console.warn('⚠️ [位置计算器] 无法获取预览线起始点');
        return false;
      }
      
      // 检查是否需要更新位置
      const positionDiff = this.calculatePositionDifference(currentSource, outPortPosition);
      
      if (positionDiff > this.options.coordinateThreshold) {
        // 更新预览线起始位置 - 使用正确的端口格式
        const success = this.safeSetSource(line, sourceNode.id, 'out');
        
        if (success && this.options.enableLogging) {
          console.log('🔄 [位置计算器] 同步预览线位置:', {
            lineId: line.id,
            nodeId: sourceNode.id,
            oldPosition: currentSource,
            newPosition: outPortPosition,
            difference: positionDiff
          });
        }
        
        return success;
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ [位置计算器] 同步预览线位置失败:', {
        lineId: line.id,
        nodeId: sourceNode.id,
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * 验证并修正预览线坐标
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 验证是否通过
   */
  validateAndCorrectPreviewLineCoordinates(previewInstance) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return false;
    }

    const { line, sourceNode } = previewInstance;
    
    try {
      // 验证line对象的必要方法
      if (!this.validateLineObject(line)) {
        return false;
      }

      // 验证sourceNode对象的必要方法
      if (!this.validateSourceNode(sourceNode)) {
        return false;
      }

      // 获取预览线当前起始坐标
      const currentSource = this.safeGetSourcePoint(line);
      if (!currentSource) {
        console.warn('⚠️ [位置计算器] 无法获取预览线起始坐标');
        return false;
      }

      // 计算预期的out端口位置
      const expectedOutPort = this.getOutPortPosition(sourceNode);
      if (!expectedOutPort) {
        console.warn('⚠️ [位置计算器] 无法计算预期out端口位置');
        return false;
      }

      // 计算坐标偏差
      const deviation = this.calculatePositionDifference(currentSource, expectedOutPort);
      
      if (this.options.enableLogging) {
        console.log('🔍 [位置计算器] 坐标验证结果:', {
          lineId: line.id,
          nodeId: sourceNode.id,
          currentSource,
          expectedOutPort,
          deviation,
          threshold: this.options.coordinateThreshold
        });
      }

      // 如果偏差超过阈值，进行修正
      if (deviation > this.options.coordinateThreshold) {
        console.log('🔧 [位置计算器] 检测到坐标偏差，开始修正:', {
          lineId: line.id,
          deviation,
          threshold: this.options.coordinateThreshold
        });

        // 修正预览线起始位置 - 使用安全的设置方法
        const setSourceSuccess = this.safeSetSource(line, sourceNode.id, 'out');
        
        if (!setSourceSuccess) {
          console.warn('⚠️ [位置计算器] 设置预览线源失败');
          return false;
        }
        
        // 验证修正结果
        const correctedSource = this.safeGetSourcePoint(line);
        if (!correctedSource) {
          console.warn('⚠️ [位置计算器] 修正后无法获取源点坐标');
          return false;
        }
        
        const finalDeviation = this.calculatePositionDifference(correctedSource, expectedOutPort);
        
        if (finalDeviation <= this.options.coordinateThreshold) {
          console.log('✅ [位置计算器] 坐标修正成功:', {
            lineId: line.id,
            finalDeviation
          });
          return true;
        } else {
          console.warn('⚠️ [位置计算器] 坐标修正后仍有偏差:', {
            lineId: line.id,
            finalDeviation
          });
          return false;
        }
      }

      // 坐标正常，无需修正
      return true;
      
    } catch (error) {
      console.error('❌ [位置计算器] 坐标验证失败:', {
        lineId: line.id,
        nodeId: sourceNode.id,
        error: error.message
      });
      return false;
    }
  }

  /**
   * 计算两点之间的距离
   * @param {Object} point1 - 第一个点 {x, y}
   * @param {Object} point2 - 第二个点 {x, y}
   * @returns {number} 距离
   */
  calculatePositionDifference(point1, point2) {
    if (!point1 || !point2) {
      return Infinity;
    }
    
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算节点的out端口位置
   * @param {Object} node - 节点对象
   * @returns {Object|null} out端口位置 {x, y}
   */
  calculateOutPortPosition(node) {
    if (!node) {
      console.warn('⚠️ [位置计算器] 节点对象无效');
      return null;
    }
    
    try {
      const nodePosition = node.getPosition();
      const nodeSize = node.getSize();
      
      if (!nodePosition || !nodeSize) {
        console.warn('⚠️ [位置计算器] 无法获取节点位置或尺寸:', node.id);
        return null;
      }
      
      // out端口位置：节点底部中心
      const outPortPosition = {
        x: nodePosition.x + nodeSize.width / 2,  // 节点中心X坐标
        y: nodePosition.y + nodeSize.height      // 节点底部Y坐标
      };
      
      if (this.options.enableLogging) {
        console.log('📍 [位置计算器] 计算out端口位置:', {
          nodeId: node.id,
          nodePosition,
          nodeSize,
          outPortPosition
        });
      }
      
      return outPortPosition;
      
    } catch (error) {
      console.error('❌ [位置计算器] 计算out端口位置失败:', {
        nodeId: node.id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * 计算节点的in端口位置
   * @param {Object} node - 节点对象
   * @returns {Object|null} in端口位置 {x, y}
   */
  calculateInPortPosition(node) {
    if (!node) {
      console.warn('⚠️ [位置计算器] 节点对象无效');
      return null;
    }
    
    try {
      const nodePosition = node.getPosition();
      const nodeSize = node.getSize();
      
      if (!nodePosition || !nodeSize) {
        console.warn('⚠️ [位置计算器] 无法获取节点位置或尺寸:', node.id);
        return null;
      }
      
      // in端口位置：节点顶部中心
      const inPortPosition = {
        x: nodePosition.x + nodeSize.width / 2,  // 节点中心X坐标
        y: nodePosition.y                        // 节点顶部Y坐标
      };
      
      if (this.options.enableLogging) {
        console.log('📍 [位置计算器] 计算in端口位置:', {
          nodeId: node.id,
          nodePosition,
          nodeSize,
          inPortPosition
        });
      }
      
      return inPortPosition;
      
    } catch (error) {
      console.error('❌ [位置计算器] 计算in端口位置失败:', {
        nodeId: node.id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * 批量同步预览线位置
   * @param {Array} previewInstances - 预览线实例数组
   * @returns {Object} 同步结果统计
   */
  batchSyncPositions(previewInstances) {
    console.log('🔄 [位置计算器] 开始批量同步位置:', {
      count: previewInstances.length
    });
    
    let successCount = 0;
    let failureCount = 0;
    const failures = [];
    
    previewInstances.forEach(instance => {
      try {
        if (this.syncPreviewLinePosition(instance)) {
          successCount++;
        } else {
          failureCount++;
          failures.push(instance.line?.id || 'unknown');
        }
      } catch (error) {
        failureCount++;
        failures.push({
          lineId: instance.line?.id || 'unknown',
          error: error.message
        });
      }
    });
    
    const result = {
      total: previewInstances.length,
      success: successCount,
      failure: failureCount,
      failures
    };
    
    console.log('✅ [位置计算器] 批量同步完成:', result);
    
    return result;
  }

  /**
   * 批量验证预览线坐标
   * @param {Array} previewInstances - 预览线实例数组
   * @returns {Object} 验证结果统计
   */
  batchValidateCoordinates(previewInstances) {
    console.log('🔍 [位置计算器] 开始批量验证坐标:', {
      count: previewInstances.length
    });
    
    let validCount = 0;
    let invalidCount = 0;
    let correctedCount = 0;
    const issues = [];
    
    previewInstances.forEach(instance => {
      try {
        const wasValid = this.validateAndCorrectPreviewLineCoordinates(instance);
        if (wasValid) {
          validCount++;
        } else {
          invalidCount++;
          issues.push(instance.line?.id || 'unknown');
        }
      } catch (error) {
        invalidCount++;
        issues.push({
          lineId: instance.line?.id || 'unknown',
          error: error.message
        });
      }
    });
    
    const result = {
      total: previewInstances.length,
      valid: validCount,
      invalid: invalidCount,
      corrected: correctedCount,
      issues
    };
    
    console.log('✅ [位置计算器] 批量验证完成:', result);
    
    return result;
  }

  /**
   * 获取位置计算统计信息
   * @returns {Object} 统计信息
   */
  getCalculationStatistics() {
    return {
      coordinateThreshold: this.options.coordinateThreshold,
      retryAttempts: this.options.retryAttempts,
      enableLogging: this.options.enableLogging
    };
  }

  /**
   * 更新计算选项
   * @param {Object} newOptions - 新的选项配置
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
    
    console.log('🔄 [位置计算器] 选项已更新:', this.options);
  }

  /**
   * 设置缓存管理器
   * @param {Object} cacheManager - 缓存管理器实例
   */
  setCacheManager(cacheManager) {
    this.cacheManager = cacheManager;
    console.log('🔄 [位置计算器] 缓存管理器已设置');
  }

  /**
   * 验证预览线实例的有效性
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 是否有效
   */
  validatePreviewInstance(previewInstance) {
    if (!previewInstance) {
      console.warn('⚠️ [位置计算器] 预览线实例为空');
      return false;
    }

    if (!previewInstance.line) {
      console.warn('⚠️ [位置计算器] 预览线实例缺少line对象');
      return false;
    }

    if (!previewInstance.sourceNode) {
      console.warn('⚠️ [位置计算器] 预览线实例缺少sourceNode对象');
      return false;
    }

    return true;
  }

  /**
   * 验证line对象的必要方法
   * @param {Object} line - 预览线对象
   * @returns {boolean} 是否有效
   */
  validateLineObject(line) {
    if (!line) {
      console.warn('⚠️ [位置计算器] line对象为空');
      return false;
    }

    const requiredMethods = ['getSourcePoint', 'setSource', 'id'];
    for (const method of requiredMethods) {
      if (method === 'id') {
        if (!line.id) {
          console.warn(`⚠️ [位置计算器] line对象缺少属性: ${method}`);
          return false;
        }
      } else if (typeof line[method] !== 'function') {
        console.warn(`⚠️ [位置计算器] line对象缺少方法: ${method}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 验证sourceNode对象的必要方法
   * @param {Object} sourceNode - 源节点对象
   * @returns {boolean} 是否有效
   */
  validateSourceNode(sourceNode) {
    if (!sourceNode) {
      console.warn('⚠️ [位置计算器] sourceNode对象为空');
      return false;
    }

    const requiredMethods = ['getPosition', 'getSize', 'id'];
    for (const method of requiredMethods) {
      if (method === 'id') {
        if (!sourceNode.id) {
          console.warn(`⚠️ [位置计算器] sourceNode对象缺少属性: ${method}`);
          return false;
        }
      } else if (typeof sourceNode[method] !== 'function') {
        console.warn(`⚠️ [位置计算器] sourceNode对象缺少方法: ${method}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 获取节点的out端口位置（调用已有的方法）
   * @param {Object} sourceNode - 源节点对象
   * @returns {Object|null} out端口位置
   */
  getOutPortPosition(sourceNode) {
    return this.calculateOutPortPosition(sourceNode);
  }

  /**
   * 安全地获取预览线的源点坐标
   * @param {Object} line - 预览线对象
   * @returns {Object|null} 源点坐标
   */
  safeGetSourcePoint(line) {
    try {
      if (!line || typeof line.getSourcePoint !== 'function') {
        console.warn('⚠️ [位置计算器] line对象无效或缺少getSourcePoint方法');
        return null;
      }

      const sourcePoint = line.getSourcePoint();
      if (!sourcePoint || typeof sourcePoint.x !== 'number' || typeof sourcePoint.y !== 'number') {
        console.warn('⚠️ [位置计算器] 获取的源点坐标无效:', sourcePoint);
        return null;
      }

      return sourcePoint;
    } catch (error) {
      console.error('❌ [位置计算器] 获取源点坐标失败:', error.message);
      return null;
    }
  }

  /**
   * 安全地设置预览线的源
   * @param {Object} line - 预览线对象
   * @param {string} nodeId - 节点ID
   * @param {string} port - 端口名称
   * @returns {boolean} 是否设置成功
   */
  safeSetSource(line, nodeId, port) {
    try {
      if (!line || typeof line.setSource !== 'function') {
        console.warn('⚠️ [位置计算器] line对象无效或缺少setSource方法');
        return false;
      }

      if (!nodeId || !port) {
        console.warn('⚠️ [位置计算器] nodeId或port参数无效:', { nodeId, port });
        return false;
      }

      line.setSource({ cell: nodeId, port: port });
      return true;
    } catch (error) {
      console.error('❌ [位置计算器] 设置预览线源失败:', {
        nodeId,
        port,
        error: error.message
      });
      return false;
    }
  }

  /**
   * 销毁位置计算器
   */
  destroy() {
    this.graph = null;
    this.options = null;
    this.cacheManager = null;
    
    console.log('🗑️ [位置计算器] 已销毁');
  }
}

export default PositionCalculator;