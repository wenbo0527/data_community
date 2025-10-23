/**
 * 碰撞检测器
 * 负责预览线的碰撞检测、重叠优化和路径调整
 */

export class CollisionDetector {
  constructor(graph, options = {}) {
    this.graph = graph;
    this.options = {
      overlapThreshold: 5, // 重叠阈值
      maxOptimizationAttempts: 3, // 最大优化尝试次数
      offsetStep: 15, // 偏移步长
      enableLogging: true, // 启用日志
      ...options
    };
    
    // 偏移配置缓存
    this.offsetCache = new Map();
    
    console.log('🔍 [碰撞检测器] 初始化完成');
  }

  /**
   * 优化重叠的预览线
   * @param {Array} previewInstances - 预览线实例数组
   * @returns {Object} 优化结果
   */
  optimizeOverlappingPreviewLines(previewInstances) {
    if (!previewInstances || previewInstances.length === 0) {
      console.warn('⚠️ [碰撞检测器] 预览线实例数组为空');
      return { optimized: 0, failed: 0 };
    }

    console.log('🔧 [碰撞检测器] 开始优化重叠预览线:', {
      count: previewInstances.length
    });

    let optimizedCount = 0;
    let failedCount = 0;
    const processedLines = new Set();

    try {
      // 按源节点分组预览线
      const groupedBySource = this.groupPreviewLinesBySource(previewInstances);
      
      // 为每个源节点的预览线组计算偏移
      for (const [sourceNodeId, instances] of groupedBySource) {
        if (instances.length <= 1) {
          continue; // 单条预览线无需优化
        }

        console.log('🎯 [碰撞检测器] 处理源节点的预览线组:', {
          sourceNodeId,
          count: instances.length
        });

        // 计算偏移配置
        const offsetConfigs = this.calculateOffsetConfigurations(instances);
        
        // 应用偏移配置到每条预览线
        instances.forEach((instance, index) => {
          try {
            if (processedLines.has(instance.line.id)) {
              return; // 避免重复处理
            }

            const offsetConfig = offsetConfigs[index] || {};
            this.applyOffsetToLine(instance, offsetConfig);
            
            processedLines.add(instance.line.id);
            optimizedCount++;
            
          } catch (error) {
            console.error('❌ [碰撞检测器] 应用偏移失败:', {
              lineId: instance.line.id,
              error: error.message
            });
            failedCount++;
          }
        });
      }

      const result = {
        total: previewInstances.length,
        optimized: optimizedCount,
        failed: failedCount,
        groups: groupedBySource.size
      };

      console.log('✅ [碰撞检测器] 重叠优化完成:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [碰撞检测器] 优化重叠预览线失败:', error.message);
      return {
        total: previewInstances.length,
        optimized: optimizedCount,
        failed: previewInstances.length - optimizedCount
      };
    }
  }

  /**
   * 按源节点分组预览线
   * @param {Array} previewInstances - 预览线实例数组
   * @returns {Map} 分组结果
   */
  groupPreviewLinesBySource(previewInstances) {
    const groups = new Map();
    
    previewInstances.forEach(instance => {
      if (!instance.sourceNode || !instance.line) {
        return;
      }
      
      const sourceId = instance.sourceNode.id;
      if (!groups.has(sourceId)) {
        groups.set(sourceId, []);
      }
      
      groups.get(sourceId).push(instance);
    });
    
    return groups;
  }

  /**
   * 计算偏移配置
   * @param {Array} instances - 同一源节点的预览线实例数组
   * @returns {Array} 偏移配置数组
   */
  calculateOffsetConfigurations(instances) {
    const configs = [];
    const totalLines = instances.length;
    
    // 为每条预览线计算偏移配置
    instances.forEach((instance, index) => {
      const config = this.generateOffsetConfig(index, totalLines, instance);
      configs.push(config);
    });
    
    return configs;
  }

  /**
   * 生成单条预览线的偏移配置
   * @param {number} index - 预览线索引
   * @param {number} total - 总预览线数量
   * @param {Object} instance - 预览线实例
   * @returns {Object} 偏移配置
   */
  generateOffsetConfig(index, total, instance) {
    const { line, sourceNode } = instance;
    // 安全获取节点数据
    const nodeData = (typeof sourceNode.getData === 'function' ? sourceNode.getData() : sourceNode.data || sourceNode.store?.data?.data) || {};
    const nodeType = nodeData.type || nodeData.nodeType;
    
    // 基础偏移计算
    const baseOffset = (index - Math.floor(total / 2)) * this.options.offsetStep;
    
    // 根据节点类型调整偏移
    const typeMultiplier = this.getNodeTypeOffsetMultiplier(nodeType);
    const adjustedOffset = baseOffset * typeMultiplier;
    
    // 生成路由器配置
    const routerConfig = {
      padding: Math.abs(adjustedOffset) + 10,
      step: this.options.offsetStep,
      offset: adjustedOffset,
      excludeEnds: ['source']
    };
    
    // 生成视觉样式配置
    const styleConfig = this.generateStyleConfig(index, total, nodeType);
    
    const config = {
      router: routerConfig,
      style: styleConfig,
      index,
      total,
      nodeType
    };
    
    if (this.options.enableLogging) {
      console.log('📊 [碰撞检测器] 生成偏移配置:', {
        lineId: line.id,
        config
      });
    }
    
    return config;
  }

  /**
   * 获取节点类型的偏移倍数
   * @param {string} nodeType - 节点类型
   * @returns {number} 偏移倍数
   */
  getNodeTypeOffsetMultiplier(nodeType) {
    const multipliers = {
      'audience-split': 1.2,
      'event-split': 1.0,
      'ab-test': 0.8,
      'default': 1.0
    };
    
    return multipliers[nodeType] || multipliers.default;
  }

  /**
   * 生成样式配置
   * @param {number} index - 预览线索引
   * @param {number} total - 总预览线数量
   * @param {string} nodeType - 节点类型
   * @returns {Object} 样式配置
   */
  generateStyleConfig(index, total, nodeType) {
    // 基础样式
    const baseStyle = {
      stroke: this.getNodeTypeColor(nodeType),
      strokeWidth: 2,
      strokeDasharray: '5 5'
    };
    
    // 根据索引调整透明度和线宽
    const opacity = Math.max(0.6, 1 - (index * 0.1));
    const strokeWidth = Math.max(1, 3 - Math.floor(index / 2));
    
    // 为不同索引的预览线设置不同的虚线样式
    const dashPatterns = [
      '5 5',    // 标准虚线
      '8 3',    // 长虚线
      '3 3',    // 短虚线
      '10 2 3 2', // 复合虚线
      '6 4'     // 中等虚线
    ];
    
    const dashPattern = dashPatterns[index % dashPatterns.length];
    
    return {
      ...baseStyle,
      opacity,
      strokeWidth,
      strokeDasharray: dashPattern,
      targetMarker: {
        name: 'circle',
        fill: baseStyle.stroke,
        stroke: baseStyle.stroke,
        strokeWidth: 1,
        r: 3 + index * 0.5
      }
    };
  }

  /**
   * 获取节点类型对应的颜色
   * @param {string} nodeType - 节点类型
   * @returns {string} 颜色值
   */
  getNodeTypeColor(nodeType) {
    const colors = {
      'audience-split': '#722ed1',
      'event-split': '#fa8c16',
      'ab-test': '#13c2c2',
      'default': '#1890ff'
    };
    
    return colors[nodeType] || colors.default;
  }

  /**
   * 应用偏移配置到预览线
   * @param {Object} previewInstance - 预览线实例
   * @param {Object} offsetConfig - 偏移配置
   */
  applyOffsetToLine(previewInstance, offsetConfig) {
    const { line } = previewInstance;
    
    if (!line || !offsetConfig) {
      console.warn('⚠️ [碰撞检测器] 预览线或偏移配置无效');
      return;
    }

    try {
      // 应用路由器配置
      if (offsetConfig.router) {
        line.setRouter({
          name: 'manhattan',
          args: offsetConfig.router
        });
      }

      // 应用样式配置
      if (offsetConfig.style) {
        line.attr({
          line: offsetConfig.style
        });
      }

      // 缓存偏移配置
      this.offsetCache.set(line.id, offsetConfig);

      if (this.options.enableLogging) {
        console.log('✅ [碰撞检测器] 应用偏移配置成功:', {
          lineId: line.id,
          config: offsetConfig
        });
      }
      
    } catch (error) {
      console.error('❌ [碰撞检测器] 应用偏移配置失败:', {
        lineId: line.id,
        error: error.message
      });
    }
  }

  /**
   * 获取预览线终点位置
   * @param {Object} line - 预览线对象
   * @returns {Object|null} 终点位置 {x, y}
   */
  getLineEndPosition(line) {
    if (!line) {
      return null;
    }

    try {
      // 尝试获取目标点
      const target = line.getTargetPoint();
      if (target) {
        return target;
      }

      // 如果没有目标点，尝试从路径获取最后一个点
      const pathData = line.attr('line/d');
      if (pathData) {
        // 解析SVG路径，获取最后一个点
        const matches = pathData.match(/([ML])\s*([\d.-]+)[,\s]+([\d.-]+)/g);
        if (matches && matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const coords = lastMatch.match(/([\d.-]+)/g);
          if (coords && coords.length >= 2) {
            return {
              x: parseFloat(coords[0]),
              y: parseFloat(coords[1])
            };
          }
        }
      }

      console.warn('⚠️ [碰撞检测器] 无法获取预览线终点位置:', line.id);
      return null;
      
    } catch (error) {
      console.error('❌ [碰撞检测器] 获取预览线终点位置失败:', {
        lineId: line.id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * 检测两条预览线是否重叠
   * @param {Object} line1 - 第一条预览线
   * @param {Object} line2 - 第二条预览线
   * @returns {boolean} 是否重叠
   */
  detectLineOverlap(line1, line2) {
    if (!line1 || !line2) {
      return false;
    }

    try {
      // 获取两条线的起点和终点
      const line1Start = line1.getSourcePoint();
      const line1End = this.getLineEndPosition(line1);
      const line2Start = line2.getSourcePoint();
      const line2End = this.getLineEndPosition(line2);

      if (!line1Start || !line1End || !line2Start || !line2End) {
        return false;
      }

      // 计算线段之间的最小距离
      const distance = this.calculateLineDistance(
        line1Start, line1End,
        line2Start, line2End
      );

      return distance < this.options.overlapThreshold;
      
    } catch (error) {
      console.error('❌ [碰撞检测器] 检测线段重叠失败:', {
        line1Id: line1.id,
        line2Id: line2.id,
        error: error.message
      });
      return false;
    }
  }

  /**
   * 计算两条线段之间的最小距离
   * @param {Object} p1 - 第一条线的起点
   * @param {Object} p2 - 第一条线的终点
   * @param {Object} p3 - 第二条线的起点
   * @param {Object} p4 - 第二条线的终点
   * @returns {number} 最小距离
   */
  calculateLineDistance(p1, p2, p3, p4) {
    // 简化计算：使用起点之间的距离作为近似值
    const dx = p1.x - p3.x;
    const dy = p1.y - p3.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取偏移配置缓存
   * @param {string} lineId - 预览线ID
   * @returns {Object|null} 缓存的偏移配置
   */
  getCachedOffsetConfig(lineId) {
    return this.offsetCache.get(lineId) || null;
  }

  /**
   * 清理偏移配置缓存
   * @param {string} lineId - 预览线ID（可选）
   */
  clearOffsetCache(lineId = null) {
    if (lineId) {
      this.offsetCache.delete(lineId);
    } else {
      this.offsetCache.clear();
    }
  }

  /**
   * 获取碰撞检测统计信息
   * @returns {Object} 统计信息
   */
  getDetectionStatistics() {
    return {
      overlapThreshold: this.options.overlapThreshold,
      maxOptimizationAttempts: this.options.maxOptimizationAttempts,
      offsetStep: this.options.offsetStep,
      cachedConfigs: this.offsetCache.size
    };
  }

  /**
   * 更新检测选项
   * @param {Object} newOptions - 新的选项配置
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
    
    console.log('🔄 [碰撞检测器] 选项已更新:', this.options);
  }

  /**
   * 设置缓存管理器
   * @param {Object} cacheManager - 缓存管理器实例
   */
  setCacheManager(cacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * 销毁碰撞检测器
   */
  destroy() {
    this.clearOffsetCache();
    this.graph = null;
    this.options = null;
    
    console.log('🗑️ [碰撞检测器] 已销毁');
  }
}

export default CollisionDetector;