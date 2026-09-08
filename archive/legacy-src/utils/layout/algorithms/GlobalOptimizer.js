/**
 * 全局优化器 - 负责整体布局的全局优化和调整
 * 包括全局X轴平衡、整体居中、美学优化、性能监控等
 * 
 * 主要功能：
 * 1. 全局布局优化 - 整体调整和平衡
 * 2. X轴密度分析和重平衡
 * 3. 全局居中对齐（仅Y轴）
 * 4. 美学优化和视觉效果
 * 5. 性能监控和缓存管理
 * 6. 布局后清理和验证
 * 
 * @author 统一布局引擎重构
 * @version 2.0.0
 */

class GlobalOptimizer {
  constructor(options = {}) {
    this.options = {
      // 全局优化配置
      enableGlobalOptimization: options.enableGlobalOptimization !== false,
      enableXAxisBalancing: options.enableXAxisBalancing !== false,
      enableGlobalCentering: options.enableGlobalCentering !== false,
      enableAestheticOptimization: options.enableAestheticOptimization !== false,
      
      // 密度分析配置
      densityAnalysis: {
        regionCount: 10,
        sparseThreshold: 0.5,
        denseThreshold: 1.5,
        rebalanceIntensity: 0.3
      },
      
      // 性能配置
      performance: {
        enableCache: options.enableCache !== false,
        maxCacheSize: options.maxCacheSize || 100,
        enableMetrics: options.enableMetrics !== false
      },
      
      // 清理配置
      cleanup: {
        delayMs: 500,
        enableValidation: true
      },
      
      ...options
    };
    
    // 性能指标
    this.performanceMetrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      lastLayoutDuration: 0,
      cacheHitRate: 0
    };
    
    // 布局缓存
    this.layoutCache = {
      enabled: this.options.performance.enableCache,
      cache: new Map(),
      maxSize: this.options.performance.maxCacheSize,
      hits: 0,
      misses: 0
    };
    
    // 预览线刷新锁定
    this.previewLineRefreshLocked = false;
    this.lockStartTime = null;
    this.lockReason = null;
    this.lockTimeoutTimer = null;
    this.LOCK_TIMEOUT = 10000; // 10秒超时
    
    console.log('[GlobalOptimizer] 全局优化器初始化完成', {
      enableGlobalOptimization: this.options.enableGlobalOptimization,
      enableCache: this.layoutCache.enabled,
      maxCacheSize: this.layoutCache.maxSize
    });
  }
  
  /**
   * 应用全局优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @param {Object} graph - 图形实例
   * @returns {Promise<Object>} 优化结果
   */
  async applyGlobalOptimization(positions, layerStructure, graph) {
    if (!this.options.enableGlobalOptimization) {
      console.log('[GlobalOptimization] 全局优化已禁用，跳过');
      return { success: true, message: '全局优化已禁用' };
    }
    
    console.log('🌍 [GlobalOptimization] 开始全局布局优化');
    const startTime = Date.now();
    
    try {
      // 1. 调整全局层间距
      if (this.options.enableGlobalOptimization) {
        await this.adjustGlobalLayerSpacing(positions, layerStructure);
      }
      
      // 2. 全局X轴平衡
      if (this.options.enableXAxisBalancing) {
        await this.applyGlobalXAxisBalancing(positions, layerStructure);
      }
      
      // 3. 全局居中对齐（仅Y轴）
      if (this.options.enableGlobalCentering) {
        await this.centerAlignGlobalLayout(positions);
      }
      
      // 4. 美学优化
      if (this.options.enableAestheticOptimization) {
        await this.applyAestheticOptimizations(positions, layerStructure);
      }
      
      const duration = Date.now() - startTime;
      this.updatePerformanceMetrics(duration);
      
      console.log(`🌍 [GlobalOptimization] 全局优化完成，耗时: ${duration}ms`);
      
      return {
        success: true,
        duration,
        message: '全局优化完成',
        metrics: this.getPerformanceMetrics()
      };
      
    } catch (error) {
      console.error('[GlobalOptimization] 全局优化失败:', error);
      return {
        success: false,
        error: error.message,
        message: '全局优化失败'
      };
    }
  }
  
  /**
   * 调整全局层间距
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  async adjustGlobalLayerSpacing(positions, layerStructure) {
    console.log('[LayerSpacing] 开始调整全局层间距');
    
    const { layers, totalLayers } = layerStructure;
    if (totalLayers <= 1) {
      console.log('[LayerSpacing] 只有一层，无需调整间距');
      return;
    }
    
    // 计算理想层间距
    const baseHeight = this.options.layer?.baseHeight || 120;
    const minSpacing = baseHeight * 0.8;
    const maxSpacing = baseHeight * 1.5;
    
    // 根据层数动态调整间距
    const dynamicSpacing = Math.max(minSpacing, Math.min(maxSpacing, baseHeight * (1 + 0.1 * Math.log(totalLayers))));
    
    console.log(`[LayerSpacing] 动态层间距: ${dynamicSpacing.toFixed(1)}px (基础: ${baseHeight}px, 层数: ${totalLayers})`);
    
    // 应用新的层间距
    positions.forEach((position, nodeId) => {
      if (position.layerIndex !== undefined) {
        const newY = position.layerIndex * dynamicSpacing;
        if (Math.abs(position.y - newY) > 1) {
          console.log(`[LayerSpacing] 节点 ${nodeId} Y坐标调整: ${position.y.toFixed(1)} → ${newY.toFixed(1)}`);
          position.y = newY;
        }
      }
    });
    
    console.log('[LayerSpacing] 全局层间距调整完成');
  }
  
  /**
   * 应用全局X轴平衡
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  async applyGlobalXAxisBalancing(positions, layerStructure) {
    console.log('[XAxisBalancing] 开始全局X轴平衡');
    
    // 1. 分析X轴密度分布
    const densityAnalysis = this.analyzeXAxisDensity(positions);
    
    // 2. 识别稀疏和密集区域
    const { sparseRegions, denseRegions } = this.identifyDensityRegions(densityAnalysis);
    
    // 3. 计算重平衡策略
    const strategy = this.calculateRebalanceStrategy(densityAnalysis, sparseRegions, denseRegions);
    
    // 4. 应用重平衡调整
    if (strategy.primaryIssue !== 'balanced') {
      this.applyRebalanceAdjustments(positions, layerStructure, strategy);
    }
    
    console.log('[XAxisBalancing] 全局X轴平衡完成');
  }
  
  /**
   * 分析X轴分布密度
   * @param {Map} positions - 位置映射
   * @returns {Object} 密度分析结果
   */
  analyzeXAxisDensity(positions) {
    const allPositions = Array.from(positions.values());
    const validPositions = allPositions.filter(pos => 
      pos.x !== undefined && !isNaN(pos.x) && Math.abs(pos.x) < 1000
    );

    if (validPositions.length === 0) {
      return { regions: [], totalWidth: 0, centerOfMass: 0 };
    }

    const xCoords = validPositions.map(pos => pos.x).sort((a, b) => a - b);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const totalWidth = maxX - minX;

    // 将X轴分为指定数量区域进行密度分析
    const regionCount = this.options.densityAnalysis.regionCount;
    const regionWidth = totalWidth / regionCount;
    const regions = [];

    for (let i = 0; i < regionCount; i++) {
      const regionStart = minX + i * regionWidth;
      const regionEnd = regionStart + regionWidth;
      const nodesInRegion = xCoords.filter(x => x >= regionStart && x < regionEnd).length;
      
      regions.push({
        index: i,
        start: regionStart,
        end: regionEnd,
        center: regionStart + regionWidth / 2,
        nodeCount: nodesInRegion,
        density: nodesInRegion / validPositions.length
      });
    }

    // 计算质心（重心）
    const totalMass = xCoords.reduce((sum, x) => sum + x, 0);
    const centerOfMass = totalMass / xCoords.length;

    return {
      regions,
      totalWidth,
      centerOfMass,
      minX,
      maxX,
      totalNodes: validPositions.length
    };
  }
  
  /**
   * 识别稀疏和密集区域
   * @param {Object} densityAnalysis - 密度分析结果
   * @returns {Object} 稀疏和密集区域
   */
  identifyDensityRegions(densityAnalysis) {
    const { regions } = densityAnalysis;
    const avgDensity = 1 / regions.length; // 平均密度
    const sparseThreshold = avgDensity * this.options.densityAnalysis.sparseThreshold;
    const denseThreshold = avgDensity * this.options.densityAnalysis.denseThreshold;

    const sparseRegions = regions.filter(region => region.density < sparseThreshold);
    const denseRegions = regions.filter(region => region.density > denseThreshold);

    console.log(`[区域识别] 平均密度: ${(avgDensity * 100).toFixed(1)}%, 稀疏区域: ${sparseRegions.length}, 密集区域: ${denseRegions.length}`);

    return { sparseRegions, denseRegions };
  }
  
  /**
   * 计算重平衡策略
   * @param {Object} densityAnalysis - 密度分析结果
   * @param {Array} sparseRegions - 稀疏区域
   * @param {Array} denseRegions - 密集区域
   * @returns {Object} 重平衡策略
   */
  calculateRebalanceStrategy(densityAnalysis, sparseRegions, denseRegions) {
    const { centerOfMass, totalWidth, minX, maxX } = densityAnalysis;
    const idealCenter = (minX + maxX) / 2;
    const massOffset = centerOfMass - idealCenter;

    // 判断主要问题类型
    let primaryIssue = 'balanced';
    if (Math.abs(massOffset) > totalWidth * 0.1) {
      primaryIssue = massOffset > 0 ? 'right_heavy' : 'left_heavy';
    }

    // 计算调整强度
    const adjustmentIntensity = Math.min(Math.abs(massOffset) / (totalWidth * 0.2), 1.0);

    return {
      primaryIssue,
      massOffset,
      adjustmentIntensity,
      targetShift: -massOffset * this.options.densityAnalysis.rebalanceIntensity,
      sparseRegionCount: sparseRegions.length,
      denseRegionCount: denseRegions.length
    };
  }
  
  /**
   * 应用重平衡调整
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @param {Object} strategy - 重平衡策略
   */
  applyRebalanceAdjustments(positions, layerStructure, strategy) {
    if (strategy.primaryIssue === 'balanced') {
      console.log('[重平衡] 分布已平衡，无需调整');
      return;
    }

    const { targetShift, adjustmentIntensity } = strategy;
    let adjustedNodes = 0;

    console.log(`[重平衡] 开始调整，目标偏移: ${targetShift.toFixed(1)}, 强度: ${(adjustmentIntensity * 100).toFixed(1)}%`);

    // 对所有节点应用渐进式调整
    positions.forEach((pos, nodeId) => {
      if (pos.x !== undefined && !isNaN(pos.x)) {
        const oldX = pos.x;
        
        // 基于距离中心的位置计算调整权重
        const distanceFromCenter = Math.abs(pos.x);
        const adjustmentWeight = Math.min(distanceFromCenter / 200, 1.0);
        
        // 应用调整
        const adjustment = targetShift * adjustmentIntensity * adjustmentWeight;
        pos.x += adjustment;
        
        if (Math.abs(adjustment) > 0.5) {
          adjustedNodes++;
          console.log(`[节点调整] ${nodeId}: ${oldX.toFixed(1)} → ${pos.x.toFixed(1)} (调整: ${adjustment.toFixed(1)})`);
        }
      }
    });

    console.log(`[重平衡] 完成，调整了 ${adjustedNodes} 个节点`);
  }
  
  /**
   * 全局居中对齐 - 仅负责Y轴居中，保护X轴分布
   * @param {Map} positions - 位置映射
   */
  async centerAlignGlobalLayout(positions) {
    const allPositions = Array.from(positions.values());

    if (allPositions.length === 0) return;

    // 只进行基础的位置有效性检查
    const validPositions = allPositions.filter(pos => {
      const isValid = pos.x !== undefined && pos.y !== undefined && 
                     !isNaN(pos.x) && !isNaN(pos.y);
      if (!isValid) {
        console.warn('[全局居中] 发现无效位置，已过滤:', pos);
      }
      return isValid;
    });

    if (validPositions.length === 0) {
      console.warn('[全局居中] 没有有效位置，跳过全局居中');
      return;
    }

    // 核心：全局居中只负责Y轴平移，不修改X轴分布
    const minY = Math.min(...validPositions.map(pos => pos.y));
    const offsetY = -minY;

    console.log(
      `🌍 [全局Y轴居中] Y轴边界: minY=${minY.toFixed(1)}, offsetY=${offsetY.toFixed(1)} (有效位置数: ${validPositions.length})`
    );

    // 关键：只应用Y轴偏移，完全保护X轴分布
    positions.forEach((pos, nodeId) => {
      pos.y += offsetY;  // 只修改Y轴，保持X轴不变
    });

    console.log('🌍 [全局居中完成] 仅进行Y轴居中，X轴分布完全保护');
  }
  
  /**
   * 美学优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  async applyAestheticOptimizations(positions, layerStructure) {
    console.log('[AestheticOptimization] 开始美学优化');
    
    // 1. 检查对称分布
    await this.optimizeSymmetricDistribution(positions, layerStructure);
    
    // 2. 优化视觉平衡
    await this.optimizeVisualBalance(positions);
    
    // 3. 调整节点间距
    await this.optimizeNodeSpacing(positions);
    
    console.log('[AestheticOptimization] 美学优化完成');
  }
  
  /**
   * 优化对称分布
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  async optimizeSymmetricDistribution(positions, layerStructure) {
    const { layers } = layerStructure;
    
    layers.forEach((layerNodes, layerIndex) => {
      if (layerNodes.length <= 1) return;
      
      const xCoords = layerNodes.map(node => {
        const pos = positions.get(node.nodeId || node.id);
        return pos ? pos.x : 0;
      }).sort((a, b) => a - b);
      
      if (this.checkSymmetricDistribution(xCoords)) {
        console.log(`[对称分布] 层 ${layerIndex} 已是对称分布，无需调整`);
        return;
      }
      
      // 重新应用对称分布
      this.reapplySymmetricDistribution(layerNodes, positions);
    });
  }
  
  /**
   * 检查是否为对称分布
   * @param {Array} xCoords - 排序后的X坐标数组
   * @returns {boolean} 是否对称
   */
  checkSymmetricDistribution(xCoords) {
    if (xCoords.length < 2) return false;
    
    // 检查是否接近对称分布的特征值
    const symmetricPatterns = [
      [-60, 60], // 2节点
      [-80, 0, 80], // 3节点
      [-90, -30, 30, 90], // 4节点
    ];
    
    for (const pattern of symmetricPatterns) {
      if (pattern.length === xCoords.length) {
        const matches = pattern.every((expected, index) => 
          Math.abs(xCoords[index] - expected) < 10
        );
        if (matches) return true;
      }
    }
    
    return false;
  }
  
  /**
   * 重新应用对称分布
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   */
  reapplySymmetricDistribution(layerNodes, positions) {
    const nodeCount = layerNodes.length;
    let targetPositions = [];
    
    if (nodeCount === 2) {
      const spacing = 160;
      targetPositions = [-spacing/2, spacing/2];
    } else if (nodeCount === 3) {
      const spacing = 120;
      targetPositions = [-spacing, 0, spacing];
    } else if (nodeCount === 4) {
      const spacing = 100;
      targetPositions = [-spacing*1.5, -spacing*0.5, spacing*0.5, spacing*1.5];
    } else {
      // 动态对称分布
      const baseSpacing = 120;
      const spacing = Math.max(60, Math.min(baseSpacing, 300 / (nodeCount - 1)));
      const totalWidth = (nodeCount - 1) * spacing;
      const startX = -totalWidth / 2;
      targetPositions = Array.from({length: nodeCount}, (_, i) => startX + i * spacing);
    }
    
    // 按节点类型和功能排序
    layerNodes.sort((a, b) => {
      const aId = a.nodeId || a.id;
      const bId = b.nodeId || b.id;
      
      // 开始节点在前
      if (aId && aId.includes('start')) return -1;
      if (bId && bId.includes('start')) return 1;
      
      // 结束节点在后
      if (aId && aId.includes('end')) return 1;
      if (bId && bId.includes('end')) return -1;
      
      // 按功能类型排序
      const getTypeOrder = (nodeId) => {
        if (!nodeId) return 8;
        if (nodeId.includes('audience')) return 1;
        if (nodeId.includes('event')) return 2;
        if (nodeId.includes('sms')) return 3;
        if (nodeId.includes('ai-call')) return 4;
        if (nodeId.includes('manual-call')) return 5;
        if (nodeId.includes('ab-test')) return 6;
        if (nodeId.includes('wait')) return 7;
        return 8;
      };
      
      return getTypeOrder(aId) - getTypeOrder(bId);
    });
    
    // 应用目标位置
    layerNodes.forEach((node, index) => {
      if (index < targetPositions.length) {
        const nodeId = node.nodeId || node.id;
        const pos = positions.get(nodeId);
        if (pos) {
          const oldX = pos.x;
          pos.x = targetPositions[index];
          console.log(`[对称分布] 节点 ${nodeId}: ${oldX.toFixed(1)} → ${targetPositions[index]}`);
        }
      }
    });
  }
  
  /**
   * 优化视觉平衡
   * @param {Map} positions - 位置映射
   */
  async optimizeVisualBalance(positions) {
    // 计算视觉重心
    const allPositions = Array.from(positions.values());
    const validPositions = allPositions.filter(pos => 
      pos.x !== undefined && pos.y !== undefined && !isNaN(pos.x) && !isNaN(pos.y)
    );
    
    if (validPositions.length === 0) return;
    
    const centerX = validPositions.reduce((sum, pos) => sum + pos.x, 0) / validPositions.length;
    const centerY = validPositions.reduce((sum, pos) => sum + pos.y, 0) / validPositions.length;
    
    console.log(`[视觉平衡] 当前视觉重心: (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
    
    // 如果重心偏移过大，进行微调
    if (Math.abs(centerX) > 50) {
      const adjustment = -centerX * 0.1; // 10%的调整
      positions.forEach(pos => {
        pos.x += adjustment;
      });
      console.log(`[视觉平衡] 应用X轴调整: ${adjustment.toFixed(1)}px`);
    }
  }
  
  /**
   * 优化节点间距
   * @param {Map} positions - 位置映射
   */
  async optimizeNodeSpacing(positions) {
    // 检查节点间距是否合理
    const allPositions = Array.from(positions.values());
    const validPositions = allPositions.filter(pos => 
      pos.x !== undefined && pos.y !== undefined && !isNaN(pos.x) && !isNaN(pos.y)
    );
    
    if (validPositions.length < 2) return;
    
    // 按层分组检查间距
    const layerGroups = new Map();
    validPositions.forEach(pos => {
      const layerIndex = pos.layerIndex || 0;
      if (!layerGroups.has(layerIndex)) {
        layerGroups.set(layerIndex, []);
      }
      layerGroups.get(layerIndex).push(pos);
    });
    
    layerGroups.forEach((layerPositions, layerIndex) => {
      if (layerPositions.length < 2) return;
      
      // 检查同层节点间距
      const xCoords = layerPositions.map(pos => pos.x).sort((a, b) => a - b);
      const minSpacing = 80; // 最小间距
      
      for (let i = 1; i < xCoords.length; i++) {
        const spacing = xCoords[i] - xCoords[i-1];
        if (spacing < minSpacing) {
          console.log(`[节点间距] 层 ${layerIndex} 节点间距过小: ${spacing.toFixed(1)}px < ${minSpacing}px`);
          // 可以在这里添加间距调整逻辑
        }
      }
    });
  }
  
  /**
   * 生成布局缓存键
   * @param {Object} graph - 图形实例
   * @returns {string} 缓存键
   */
  generateLayoutCacheKey(graph) {
    if (!graph) return 'no-graph';
    
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    
    // 基于节点和边的基本信息生成缓存键
    const nodeInfo = nodes.map(node => ({
      id: node.id,
      position: node.getPosition(),
      size: node.getSize()
    }));
    
    const edgeInfo = edges.map(edge => ({
      id: edge.id,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    }));
    
    return JSON.stringify({ nodes: nodeInfo, edges: edgeInfo });
  }
  
  /**
   * 缓存布局结果
   * @param {string} key - 缓存键
   * @param {Object} result - 布局结果
   */
  cacheLayoutResult(key, result) {
    if (!this.layoutCache.enabled) return;
    
    // 检查缓存大小限制
    if (this.layoutCache.cache.size >= this.layoutCache.maxSize) {
      // 删除最旧的缓存项（LRU策略）
      const firstKey = this.layoutCache.cache.keys().next().value;
      this.layoutCache.cache.delete(firstKey);
    }
    
    this.layoutCache.cache.set(key, result);
    this.layoutCache.misses++;
    this.updateCacheHitRate();
    console.log(`[布局缓存] 缓存布局结果，当前缓存大小: ${this.layoutCache.cache.size}`);
  }
  
  /**
   * 获取缓存的布局结果
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存的结果
   */
  getCachedLayoutResult(key) {
    if (!this.layoutCache.enabled) return null;
    
    const result = this.layoutCache.cache.get(key);
    if (result) {
      this.layoutCache.hits++;
      this.updateCacheHitRate();
      console.log('[布局缓存] 命中缓存');
    }
    return result;
  }
  
  /**
   * 更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.layoutCache.hits + this.layoutCache.misses;
    this.performanceMetrics.cacheHitRate = total > 0 ? (this.layoutCache.hits / total) * 100 : 0;
  }
  
  /**
   * 更新性能指标
   * @param {number} duration - 布局持续时间（毫秒）
   */
  updatePerformanceMetrics(duration) {
    this.performanceMetrics.layoutCount++;
    this.performanceMetrics.totalLayoutTime += duration;
    this.performanceMetrics.averageLayoutTime = 
      this.performanceMetrics.totalLayoutTime / this.performanceMetrics.layoutCount;
    this.performanceMetrics.lastLayoutDuration = duration;
    
    console.log(`[性能监控] 布局耗时: ${duration}ms, 平均耗时: ${this.performanceMetrics.averageLayoutTime.toFixed(2)}ms`);
  }
  
  /**
   * 清除布局缓存
   */
  clearLayoutCache() {
    this.layoutCache.cache.clear();
    this.layoutCache.hits = 0;
    this.layoutCache.misses = 0;
    this.updateCacheHitRate();
    console.log('[布局缓存] 缓存已清除');
  }
  
  /**
   * 锁定预览线刷新
   * @param {string} reason - 锁定原因
   */
  lockPreviewLineRefresh(reason = '布局计算中') {
    if (this.previewLineRefreshLocked) {
      console.warn(`[预览线锁定] 已经锁定，原因: ${this.lockReason}`);
      return false;
    }
    
    this.previewLineRefreshLocked = true;
    this.lockStartTime = Date.now();
    this.lockReason = reason;
    
    // 设置超时自动解锁
    this.lockTimeoutTimer = setTimeout(() => {
      console.warn(`[预览线锁定] 锁定超时，自动解锁。原因: ${this.lockReason}`);
      this.unlockPreviewLineRefresh('超时自动解锁');
    }, this.LOCK_TIMEOUT);
    
    console.log(`[预览线锁定] 预览线刷新已锁定，原因: ${reason}`);
    return true;
  }
  
  /**
   * 解锁预览线刷新
   * @param {string} reason - 解锁原因
   */
  unlockPreviewLineRefresh(reason = '布局计算完成') {
    if (!this.previewLineRefreshLocked) {
      console.warn('[预览线锁定] 当前未锁定');
      return false;
    }
    
    const lockDuration = Date.now() - this.lockStartTime;
    
    this.previewLineRefreshLocked = false;
    this.lockStartTime = null;
    this.lockReason = null;
    
    // 清除超时定时器
    if (this.lockTimeoutTimer) {
      clearTimeout(this.lockTimeoutTimer);
      this.lockTimeoutTimer = null;
    }
    
    console.log(`[预览线锁定] 预览线刷新已解锁，原因: ${reason}，锁定时长: ${lockDuration}ms`);
    return true;
  }
  
  /**
   * 检查预览线刷新是否被锁定
   * @returns {boolean} 是否被锁定
   */
  isPreviewLineRefreshLocked() {
    return this.previewLineRefreshLocked;
  }
  
  /**
   * 获取锁定状态信息
   * @returns {Object} 锁定状态信息
   */
  getPreviewLineLockStatus() {
    return {
      locked: this.previewLineRefreshLocked,
      reason: this.lockReason,
      startTime: this.lockStartTime,
      duration: this.lockStartTime ? Date.now() - this.lockStartTime : 0
    };
  }
  
  /**
   * 获取性能指标
   * @returns {Object} 性能指标
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheInfo: {
        enabled: this.layoutCache.enabled,
        size: this.layoutCache.cache.size,
        maxSize: this.layoutCache.maxSize,
        hits: this.layoutCache.hits,
        misses: this.layoutCache.misses
      }
    };
  }
  
  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      cacheInfo: {
        enabled: this.layoutCache.enabled,
        size: this.layoutCache.cache.size,
        maxSize: this.layoutCache.maxSize,
        hits: this.layoutCache.hits,
        misses: this.layoutCache.misses
      },
      lockStatus: this.getPreviewLineLockStatus()
    };
  }
  
  /**
   * 清理缓存和重置状态
   */
  cleanup() {
    this.clearLayoutCache();
    this.unlockPreviewLineRefresh('清理操作');
    
    // 重置性能指标
    this.performanceMetrics = {
      layoutCount: 0,
      totalLayoutTime: 0,
      averageLayoutTime: 0,
      lastLayoutDuration: 0,
      cacheHitRate: 0
    };
    
    console.log('[GlobalOptimizer] 清理完成');
  }
  
  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      enabled: this.layoutCache.enabled,
      size: this.layoutCache.cache.size,
      maxSize: this.layoutCache.maxSize,
      hits: this.layoutCache.hits,
      misses: this.layoutCache.misses,
      hitRate: this.performanceMetrics.cacheHitRate
    };
  }
}

export default GlobalOptimizer;