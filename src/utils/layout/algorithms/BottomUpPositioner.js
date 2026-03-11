/**
 * 自底向上定位器 - 负责自底向上的节点位置计算
 * 从UnifiedStructuredLayoutEngine.js中提取的位置计算功能
 */
export class BottomUpPositioner {
  constructor(layoutModel, options = {}, graph = null, geometricAligner = null) {
    this.layoutModel = layoutModel;
    this.options = options;
    this.graph = graph;
    this.geometricAligner = geometricAligner;
  }

  /**
   * 自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositions(layerStructure) {
    console.log(" [位置计算] 开始自底向上位置计算");

    const { layers } = layerStructure;
    const positions = new Map();

    // 从最底层开始计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];
      const isBottomLayer = layerIndex === layers.length - 1;

      if (isBottomLayer) {
        // 最底层：统一排列所有节点
        this.calculateBottomLayerPositions(layer, positions, layerIndex);
      } else {
        // 上层：基于子节点分布计算
        this.calculateParentLayerPositions(
          layer,
          positions,
          layerIndex,
          layerStructure,
        );
      }
    }

    console.log(
      ` [位置计算] 位置计算完成，共计算 ${positions.size} 个节点位置`,
    );

    return positions;
  }

  /**
   * 几何中心对齐的自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositionsWithGeometricAlignment(layerStructure) {
    console.log(" [几何对齐] 开始几何中心对齐的自底向上位置计算");

    try {
      // 转换layerStructure为layers数组格式
      const layers = layerStructure.layers || [];
      
      // 获取当前节点位置映射
      const currentPositions = new Map();
      if (this.graph) {
        this.graph.getNodes().forEach(node => {
          const position = node.getPosition();
          currentPositions.set(node.id, position);
        });
      }
      
      // 使用几何中心对齐算法
      if (this.geometricAligner) {
        const optimizedPositions = await this.geometricAligner.calculateGeometricAlignment(
          layers,
          currentPositions
        );
        
        // 构造返回结果格式
        const alignmentResult = {
          positions: optimizedPositions,
          isValid: true
        };

        console.log(
          ` [几何对齐] 几何中心对齐完成，共计算 ${alignmentResult.positions.size} 个节点位置`,
        );

        // 验证对齐结果
        const validationResult = this.geometricAligner.validateAlignment(alignmentResult);
        if (!validationResult.isValid) {
          console.warn(' [几何对齐] 对齐验证失败，回退到标准算法');
          console.warn('验证错误:', validationResult.errors);
          return await this.calculateBottomUpPositions(layerStructure);
        }

        console.log(' [几何对齐] 对齐验证通过');
        return alignmentResult.positions;
      }

    } catch (error) {
      console.error(' [几何对齐] 几何中心对齐失败，回退到标准算法:', error);
    }
    
    return await this.calculateBottomUpPositions(layerStructure);
  }

  /**
   * 计算最底层位置（垂直分层布局）
   * @param {Array} bottomLayer - 最底层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   */
  calculateBottomLayerPositions(bottomLayer, positions, layerIndex) {
    const nodeSpacing = this.options.node?.preferredSpacing || 200;
    
    // 计算Y坐标（层级位置）
    const layerY = this.calculateLayerY(layerIndex);
    
    console.log(
      ` [垂直分层] 第${layerIndex}层，目标Y坐标: ${layerY}，节点数: ${bottomLayer.length}`,
    );

    // 按节点类型排序，开始节点在顶层
    const sortedNodes = bottomLayer.sort((a, b) => {
      const aId = a.id || a.getId();
      const bId = b.id || b.getId();
      
      // 开始节点永远在最顶层（Y坐标最小）
      if (aId.includes('start')) return -1;
      if (bId.includes('start')) return 1;
      
      // 结束节点在最底层（Y坐标最大）
      if (aId.includes('end')) return 1;
      if (bId.includes('end')) return -1;
      
      // 其他节点按ID排序保持稳定性
      return aId.localeCompare(bId);
    });

    // 垂直分层布局：为每个节点分配位置
    sortedNodes.forEach((node, index) => {
      const nodeId = node.id || node.getId();
      
      // 垂直分层布局 - 所有节点使用相同的X坐标（居中对齐）
      const canvasWidth = (this.options?.canvas?.width && typeof this.options.canvas.width === 'number' && !isNaN(this.options.canvas.width)) ? this.options.canvas.width : 800;
      const centerX = canvasWidth / 2; // 画布中心X坐标
      const nodeX = centerX;
      
      // 单节点特殊处理
      let finalY;
      if (bottomLayer.length === 1) {
        finalY = 300; // 单节点使用画布中心Y坐标
      } else {
        finalY = layerY; // 多节点使用层级Y坐标
      }
      
      const positionData = {
        x: nodeX,
        y: finalY,
        layerIndex,
        isBottomLayer: true,
        nodeType: "normal",
        sortIndex: index
      };
      
      positions.set(nodeId, positionData);
      
      console.log(
        ` [垂直分层] 普通节点 ${nodeId}: (${nodeX}, ${finalY}), 层级: ${layerIndex}`,
      );
    });

    console.log(
      ` [垂直分层] 垂直分层布局完成，共处理 ${sortedNodes.length} 个节点`,
    );
  }

  /**
   * 计算层级Y坐标
   * @param {number} layerIndex - 层级索引（0为最底层）
   * @returns {number} Y坐标
   */
  calculateLayerY(layerIndex) {
    const baseY = 300; // 基础Y坐标（画布中心）
    const layerSpacing = 150; // 层级间距
    
    // 从底层开始，向上递减Y坐标（因为Y轴向下为正）
    // layerIndex=0（底层）-> Y=300
    // layerIndex=1（上一层）-> Y=150
    // layerIndex=2（再上一层）-> Y=0
    return baseY - (layerIndex * layerSpacing);
  }

  /**
   * 计算父层位置（基于子节点分布）
   * @param {Array} parentLayer - 父层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   * @param {Object} layerStructure - 层级结构
   */
  calculateParentLayerPositions(
    parentLayer,
    positions,
    layerIndex,
    layerStructure,
  ) {
    const layerY = this.calculateLayerY(layerIndex);
    console.log(
      ` [父层定位] 第${layerIndex}层，目标Y坐标: ${layerY}，父节点数: ${parentLayer.length}`,
    );

    // 🔥 关键修复：强制统一同层Y坐标验证
    console.log(` [Y坐标统一] 开始强制统一第${layerIndex}层所有节点Y坐标为: ${layerY}`);

    // 关键修复：分别处理有子节点和无子节点的节点
    const nodesWithChildren = [];
    const nodesWithoutChildren = [];

    parentLayer.forEach((parentNode) => {
      const parentId = parentNode.id || parentNode.getId();
      const children = layerStructure.parentChildMap?.get(parentId) || [];

      // 获取子节点位置
      const childPositions = children
        .map((childId) => positions.get(childId))
        .filter((pos) => pos !== undefined);

      if (childPositions.length > 0) {
        nodesWithChildren.push({ node: parentNode, childPositions });
      } else {
        nodesWithoutChildren.push(parentNode);
      }
    });

    // 第一步：处理有子节点的节点
    nodesWithChildren.forEach(({ node, childPositions }) => {
      const parentId = node.id || node.getId();
      const parentX = this.calculateOptimalParentPosition(childPositions);

      const positionData = {
        x: parentX,
        y: layerY, // 🔥 关键修复：强制使用层级计算的Y坐标，确保同层节点Y坐标一致
        layerIndex,
        nodeType: "normal",
        childrenCount: childPositions.length,
        childrenSpread: this.calculateChildrenSpread(childPositions),
      };

      positions.set(parentId, positionData);

      console.log(
        ` [父层定位] 普通节点 ${parentId}: (${parentX.toFixed(1)}, ${layerY}), 子节点数: ${childPositions.length}`,
      );

      // 🔥 关键修复：Y坐标一致性验证
      console.log(` [Y坐标验证] 节点 ${parentId} Y坐标已强制设置为: ${layerY}`);
    });

    // 第二步：处理无子节点的节点
    if (nodesWithoutChildren.length > 0) {
      console.log(
        ` [父层定位] 处理 ${nodesWithoutChildren.length} 个无子节点的节点`,
      );

      // 获取已分配位置的节点X坐标范围
      const existingPositions = Array.from(positions.values())
        .filter((pos) => pos.layerIndex === layerIndex)
        .map((pos) => pos.x);

      let startX = 0;
      if (existingPositions.length > 0) {
        const maxX = Math.max(...existingPositions);
        startX = maxX + (this.options.node?.preferredSpacing || 200);
      }

      // 为无子节点的节点分配X坐标
      nodesWithoutChildren.forEach((node, index) => {
        const parentId = node.id || node.getId();
        const nodeX = startX + index * (this.options.node?.preferredSpacing || 200);

        const positionData = {
          x: nodeX,
          y: layerY, // 🔥 关键修复：强制使用层级计算的Y坐标，确保同层节点Y坐标一致
          layerIndex,
          nodeType: "normal",
          childrenCount: 0,
          childrenSpread: 0,
          isOrphanNode: true, // 标记为孤立节点
        };

        positions.set(parentId, positionData);

        console.log(
          ` [父层定位] 普通节点 ${parentId}: (${nodeX.toFixed(1)}, ${layerY}), 孤立节点`,
        );

        // 🔥 关键修复：Y坐标一致性验证
        console.log(` [Y坐标验证] 孤立节点 ${parentId} Y坐标已强制设置为: ${layerY}`);

        // 同步图形节点位置
        if (this.graph && node.setPosition) {
          node.setPosition({ x: nodeX, y: layerY });
          console.log(
            ` [同步修复] 图形节点 ${parentId} 内部位置已同步: (${nodeX.toFixed(1)}, ${layerY})`,
          );
        }
      });
    }
  }

  /**
   * 计算父节点最优位置
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 最优X坐标
   */
  calculateOptimalParentPosition(childPositions) {
    if (!childPositions || childPositions.length === 0) {
      console.warn(' [父节点定位] 子节点位置数组为空，返回默认位置0');
      return 0;
    }

    const childXCoords = childPositions.map((pos) => pos.x);

    if (childXCoords.length === 1) {
      // 🔥 关键修复：单个子节点，父节点直接对齐到子节点X坐标
      const optimalX = childXCoords[0];
      console.log(` [父节点定位] 单子节点对齐: 父节点X = ${optimalX.toFixed(1)}`);
      return optimalX;
    } else if (childXCoords.length === 2) {
      // 🔥 关键修复：两个子节点，父节点精确定位到中心点
      const optimalX = (childXCoords[0] + childXCoords[1]) / 2;
      console.log(` [父节点定位] 双子节点中心: 父节点X = ${optimalX.toFixed(1)} (子节点: ${childXCoords[0].toFixed(1)}, ${childXCoords[1].toFixed(1)})`);
      return optimalX;
    } else {
      // 🔥 关键修复：多个子节点，使用精确的算术平均值作为中点
      const arithmeticMean = childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length;
      
      // 增强修复：同时计算几何中心（边界中心）作为参考
      const minX = Math.min(...childXCoords);
      const maxX = Math.max(...childXCoords);
      const geometricCenter = (minX + maxX) / 2;
      
      // 🔥 关键修复：优先使用算术平均值，确保父节点位于子节点的真实中心
      const optimalX = arithmeticMean;
      
      console.log(` [父节点定位] 多子节点中心: 父节点X = ${optimalX.toFixed(1)}`);
      console.log(`   [计算详情] 算术平均: ${arithmeticMean.toFixed(1)}, 几何中心: ${geometricCenter.toFixed(1)}, 子节点X坐标: [${childXCoords.map(x => x.toFixed(1)).join(', ')}]`);
      
      return optimalX;
    }
  }

  /**
   * 计算子节点分布范围
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 分布范围
   */
  calculateChildrenSpread(childPositions) {
    if (childPositions.length <= 1) return 0;

    const xCoords = childPositions.map((pos) => pos.x);
    return Math.max(...xCoords) - Math.min(...xCoords);
  }

  /**
   * 层级内统一优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 优化后的位置映射
   */
  async optimizeUnifiedLayerAlignment(positions, layerStructure) {
    console.log(" [统一优化] 开始层级内统一优化");

    let totalAdjustments = 0;

    // 对每一层进行统一优化
    for (
      let layerIndex = 0;
      layerIndex < layerStructure.layers.length;
      layerIndex++
    ) {
      const mixedNodes = this.layoutModel.mixedLayerNodes?.get(layerIndex);

      if (mixedNodes && mixedNodes.allNodes.length > 1) {
        // 关键：统一处理该层的所有节点
        const layerAdjustments = await this.optimizeSingleLayerUnified(
          mixedNodes,
          positions,
          layerStructure,
        );
        totalAdjustments += layerAdjustments;
      }
    }

    console.log(
      ` [统一优化] 优化完成，调整 ${totalAdjustments} 个节点位置`,
    );

    return positions;
  }

  /**
   * 优化单层的统一排列
   * @param {Object} mixedNodes - 混合节点数据
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  async optimizeSingleLayerUnified(mixedNodes, positions, layerStructure) {
    const { allNodes, layerIndex } = mixedNodes;

    // 第一步：解决节点重叠
    const overlapAdjustments = this.resolveNodeOverlaps(allNodes, positions);

    // 第二步：优化parent-child对齐
    const alignmentAdjustments = this.optimizeParentChildAlignment(
      allNodes,
      positions,
      layerStructure,
    );

    // 关键修复：层级居中对齐放在最后执行，确保不被其他优化覆盖
    const centerAdjustments = this.centerAlignLayer(allNodes, positions);

    const totalAdjustments =
      overlapAdjustments + alignmentAdjustments + centerAdjustments;

    console.log(
      ` [单层优化] 第${layerIndex}层优化完成，总调整 ${totalAdjustments} 次`,
    );
    console.log(
      `   [优化详情] 重叠解决: ${overlapAdjustments}, parent-child对齐: ${alignmentAdjustments}, 层级居中: ${centerAdjustments}`,
    );

    return totalAdjustments;
  }

  /**
   * 解决节点重叠 - 增强版
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  resolveNodeOverlaps(layerNodes, positions) {
    // 增强修复：强制最小间距，确保底层节点不重叠
    const baseMinSpacing = this.options.node?.minSpacing || 100;
    const enhancedMinSpacing = Math.max(baseMinSpacing, 150); // 强制最小150px间距
    let adjustments = 0;

    // 关键修复：过滤掉没有位置信息的节点，避免TypeError
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          ` [重叠解决] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log(' [重叠解决] 没有有效节点需要处理重叠');
      return 0;
    }

    console.log(` [重叠解决] 开始处理 ${validNodes.length} 个节点的重叠问题，强制最小间距: ${enhancedMinSpacing}px`);

    // 按X坐标排序
    const sortedNodes = validNodes.sort((a, b) => {
      const aPos = positions.get(a.id || a.getId());
      const bPos = positions.get(b.id || b.getId());
      // 修复：按逻辑流程排序，而非X坐标排序
      const aId = a.id || a.getId();
      const bId = b.id || b.getId();
      
      // 开始节点优先级最高
      if (aId.includes('start')) return -1;
      if (bId.includes('start')) return 1;
      
      // 结束节点优先级最低
      if (aId.includes('end')) return 1;
      if (bId.includes('end')) return -1;
      
      // 其他节点按节点ID排序，保持稳定顺序
      return aId.localeCompare(bId);
    });

    // 打印排序后的节点信息
    console.log(' [重叠解决] 排序后的节点:', sortedNodes.map(node => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return `${nodeId}(normal, x=${pos.x.toFixed(1)})`;
      }),
    );

    // 增强修复：多轮重叠检测，确保彻底解决重叠
    const maxIterations = 3;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      let iterationAdjustments = 0;
      
      // 从左到右检查并调整重叠
      for (let i = 1; i < sortedNodes.length; i++) {
        const currentNode = sortedNodes[i];
        const prevNode = sortedNodes[i - 1];

        const currentPos = positions.get(currentNode.id || currentNode.getId());
        const prevPos = positions.get(prevNode.id || prevNode.getId());

        // 增强修复：使用统一间距
        const requiredSpacing = enhancedMinSpacing;
        // 使用统一间距，不再区分节点类型

        const actualSpacing = currentPos.x - prevPos.x;

        if (actualSpacing < requiredSpacing) {
          const adjustment = requiredSpacing - actualSpacing + 10; // 额外10px缓冲
          const oldX = currentPos.x;
          currentPos.x += adjustment;
          adjustments++;
          iterationAdjustments++;

          console.log(
            ` [重叠解决-轮次${iteration + 1}] 调整节点 ${currentNode.id || currentNode.getId()}: ${oldX.toFixed(1)} -> ${currentPos.x.toFixed(1)} (+${adjustment.toFixed(1)}px, 需求间距: ${requiredSpacing}px)`,
          );

          // 增强修复：同步更新图形节点位置
          if (this.graph) {
            const graphNode = this.graph.getCellById(currentNode.id || currentNode.getId());
            if (graphNode) {
              graphNode.setPosition({ x: currentPos.x, y: currentPos.y });
              console.log(` [图形同步] 节点 ${currentNode.id || currentNode.getId()} 图形位置已同步`);
            }
          }
        }
      }
      
      iteration++;
      
      // 如果本轮没有调整，说明重叠已解决
      if (iterationAdjustments === 0) {
        console.log(` [重叠解决] 第${iteration}轮检测无重叠，解决完成`);
        break;
      }
      
      console.log(` [重叠解决] 第${iteration}轮完成，调整了${iterationAdjustments}个节点`);
    }

    // 增强修复：最终验证，确保没有遗漏的重叠
    this.validateNoOverlaps(sortedNodes, positions, enhancedMinSpacing);

    console.log(` [重叠解决] 重叠解决完成，调整 ${adjustments} 个节点，执行了${iteration}轮检测`);

    return adjustments;
  }

  /**
   * 增强修复：验证没有节点重叠
   * @param {Array} sortedNodes - 排序后的节点
   * @param {Map} positions - 位置映射
   * @param {number} minSpacing - 最小间距
   */
  validateNoOverlaps(sortedNodes, positions, minSpacing) {
    console.log(' [重叠验证] 开始最终重叠验证');
    
    let overlapCount = 0;
    
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const prevNode = sortedNodes[i - 1];

      const currentPos = positions.get(currentNode.id || currentNode.getId());
      const prevPos = positions.get(prevNode.id || prevNode.getId());

      const actualSpacing = currentPos.x - prevPos.x;

      if (actualSpacing < minSpacing) {
        overlapCount++;
        console.error(` [重叠验证] 发现残留重叠: ${prevNode.id || prevNode.getId()} 和 ${currentNode.id || currentNode.getId()}, 间距: ${actualSpacing.toFixed(1)}px (需求: ${minSpacing}px)`);
      }
    }
    
    if (overlapCount === 0) {
      console.log(' [重叠验证] 验证通过，无节点重叠');
    } else {
      console.error(` [重叠验证] 发现${overlapCount}处重叠，需要进一步处理`);
    }
  }

  /**
   * 优化parent-child对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  optimizeParentChildAlignment(layerNodes, positions, layerStructure) {
    let adjustments = 0;

    console.log(` [parent-child对齐] 开始增强parent-child X坐标对齐优化，处理 ${layerNodes.length} 个节点`);

    layerNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      const nodePos = positions.get(nodeId);

      // 关键修复：检查节点位置是否存在
      if (!nodePos) {
        console.warn(
          ` [parent-child对齐] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return;
      }

      const children = layerStructure.parentChildMap?.get(nodeId) || [];

      if (children.length > 0) {
        const childPositions = children
          .map((childId) => positions.get(childId))
          .filter((pos) => pos !== undefined);

        if (childPositions.length > 0) {
          const optimalX = this.calculateOptimalParentPosition(childPositions);
          const currentX = nodePos.x;
          const threshold = 5; // 5px阈值

          if (Math.abs(currentX - optimalX) > threshold) {
            nodePos.x = optimalX;
            adjustments++;
            console.log(
              ` [parent-child对齐] 调整节点 ${nodeId}: ${currentX.toFixed(1)} -> ${optimalX.toFixed(1)}`,
            );
          }
        }
      }
    });

    console.log(` [parent-child对齐] parent-child对齐完成，调整 ${adjustments} 个节点`);
    return adjustments;
  }

  /**
   * 层级居中对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) return 0;

    // 获取层级节点的X坐标范围
    const nodePositions = layerNodes
      .map(node => positions.get(node.id || node.getId()))
      .filter(pos => pos !== undefined);

    if (nodePositions.length === 0) return 0;

    const xCoords = nodePositions.map(pos => pos.x);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const currentCenter = (minX + maxX) / 2;

    // 计算画布中心
    const canvasWidth = this.options?.canvas?.width || 800;
    const targetCenter = canvasWidth / 2;

    const offset = targetCenter - currentCenter;
    const threshold = 10; // 10px阈值

    if (Math.abs(offset) > threshold) {
      // 应用偏移到所有节点
      nodePositions.forEach(pos => {
        pos.x += offset;
      });

      console.log(` [层级居中] 层级整体偏移 ${offset.toFixed(1)}px，居中对齐完成`);
      return nodePositions.length;
    }

    return 0;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    // 清除位置相关缓存
    console.log(' [缓存清理] 清除BottomUpPositioner缓存');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      positionerType: 'BottomUpPositioner',
      hasGeometricAligner: !!this.geometricAligner,
      hasGraph: !!this.graph
    };
  }
}

export default BottomUpPositioner;