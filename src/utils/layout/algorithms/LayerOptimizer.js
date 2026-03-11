/**
 * 层级优化器 - 负责层级内的节点优化和对齐
 * 从UnifiedStructuredLayoutEngine.js中提取的层级优化功能
 */
export class LayerOptimizer {
  constructor(layoutModel, options = {}, graph = null) {
    this.layoutModel = layoutModel;
    this.options = options;
    this.graph = graph;
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
    let forcedAlignments = 0;

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
          const deviation = Math.abs(currentX - optimalX);

          // 关键修复：使用更严格的阈值（0.01px）确保精确对齐
          if (deviation > 0.01) {
            const oldX = nodePos.x;
            nodePos.x = optimalX;
            adjustments++;

            // 关键修复：详细记录子节点信息用于调试
            const childInfo = childPositions.map((pos, idx) => `子${idx+1}:(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`).join(', ');
            
            console.log(
              ` [parent-child对齐] 强制精确调整节点 ${nodeId}: ${oldX.toFixed(1)} → ${optimalX.toFixed(1)} (deviation: ${deviation.toFixed(3)}px)`,
            );
            console.log(`   └─ 子节点位置: ${childInfo}`);
            console.log(`   └─ 计算的最优X坐标: ${optimalX.toFixed(3)}`);

            // 同步更新图形节点位置
            if (this.graph) {
              const graphNode = this.graph.getCellById(nodeId);
              if (graphNode) {
                graphNode.setPosition({ x: optimalX, y: nodePos.y });
                console.log(` [图形同步] 节点 ${nodeId} 图形位置已同步到精确对齐位置`);
              }
            }

            // 关键修复：验证对齐结果
            const postAlignmentDeviation = Math.abs(nodePos.x - optimalX);
            if (postAlignmentDeviation > 0.001) {
              console.error(` [对齐验证] 节点 ${nodeId} 对齐后仍有deviation: ${postAlignmentDeviation.toFixed(6)}px`);
              // 强制再次设置
              nodePos.x = optimalX;
              forcedAlignments++;
            }
          } else {
            console.log(
              ` [parent-child对齐] 节点 ${nodeId} 已精确对齐 (deviation: ${deviation.toFixed(6)}px)`,
            );
          }

          // 关键修复：额外验证父子关系的几何正确性
          this.validateParentChildGeometry(nodeId, nodePos, childPositions);
        }
      }
    });

    console.log(` [parent-child对齐] 增强对齐优化完成，调整 ${adjustments} 个父节点位置，强制修正 ${forcedAlignments} 次`);
    return adjustments;
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
      // 关键修复：单个子节点，父节点直接对齐到子节点X坐标
      const optimalX = childXCoords[0];
      console.log(` [父节点定位] 单子节点对齐: 父节点X = ${optimalX.toFixed(1)}`);
      return optimalX;
    } else if (childXCoords.length === 2) {
      // 关键修复：两个子节点，父节点精确定位到中心点
      const optimalX = (childXCoords[0] + childXCoords[1]) / 2;
      console.log(` [父节点定位] 双子节点中心: 父节点X = ${optimalX.toFixed(1)} (子节点: ${childXCoords[0].toFixed(1)}, ${childXCoords[1].toFixed(1)})`);
      return optimalX;
    } else {
      // 关键修复：多个子节点，使用精确的算术平均值作为中点
      const arithmeticMean = childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length;
      
      // 增强修复：同时计算几何中心（边界中心）作为参考
      const minX = Math.min(...childXCoords);
      const maxX = Math.max(...childXCoords);
      const geometricCenter = (minX + maxX) / 2;
      
      // 关键修复：优先使用算术平均值，确保父节点位于子节点的真实中心
      const optimalX = arithmeticMean;
      
      console.log(` [父节点定位] 多子节点中心: 父节点X = ${optimalX.toFixed(1)}`);
      console.log(`   [计算详情] 算术平均: ${arithmeticMean.toFixed(1)}, 几何中心: ${geometricCenter.toFixed(1)}, 子节点X坐标: [${childXCoords.map(x => x.toFixed(1)).join(', ')}]`);
      
      return optimalX;
    }
  }

  /**
   * 关键修复：验证父子关系的几何正确性
   * @param {string} parentId - 父节点ID
   * @param {Object} parentPos - 父节点位置
   * @param {Array} childPositions - 子节点位置数组
   */
  validateParentChildGeometry(parentId, parentPos, childPositions) {
    if (childPositions.length === 0) return;

    // 计算子节点的X坐标范围
    const childXCoords = childPositions.map(pos => pos.x);
    const minChildX = Math.min(...childXCoords);
    const maxChildX = Math.max(...childXCoords);
    const childCenterX = (minChildX + maxChildX) / 2;

    // 验证父节点是否位于子节点的几何中心
    const geometricDeviation = Math.abs(parentPos.x - childCenterX);
    
    if (geometricDeviation > 0.1) {
      console.warn(` [几何验证] 父节点 ${parentId} 几何中心deviation: ${geometricDeviation.toFixed(3)}px`);
      console.warn(`   └─ 父节点X: ${parentPos.x.toFixed(3)}, 子节点几何中心X: ${childCenterX.toFixed(3)}`);
      console.warn(`   └─ 子节点X范围: [${minChildX.toFixed(1)}, ${maxChildX.toFixed(1)}]`);
    } else {
      console.log(` [几何验证] 父节点 ${parentId} 几何位置正确 (deviation: ${geometricDeviation.toFixed(6)}px)`);
    }
  }

  /**
   * 层级居中对齐 - 增强版
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) return 0;

    // 关键修复：过滤掉没有位置信息的节点
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          ` [层级居中] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log(' [层级居中] 没有有效节点需要居中对齐');
      return 0;
    }

    // 高优先级修复：单节点层级强制居中处理 (阈值降至0.1px)
    if (validNodes.length === 1) {
      const node = validNodes[0];
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);

      // 对于单节点，强制居中到 x=0，使用极低阈值确保精确居中
      if (Math.abs(pos.x) > 0.1) {
        const oldX = pos.x;
        pos.x = 0;
        console.log(
          ` [单节点强制居中] 节点 ${nodeId}: ${oldX.toFixed(1)} → 0.0 (强制居中)`,
        );

        // 同步图形节点位置
        if (node.setPosition) {
          node.setPosition({ x: 0, y: pos.y });
          console.log(
            ` [同步修复] 图形节点 ${nodeId} 内部位置已同步到居中位置`,
          );
        }

        return 1;
      } else {
        console.log(
          ` [单节点居中] 节点 ${nodeId}: 已精确居中 (${pos.x.toFixed(1)})`,
        );
        return 0;
      }
    }

    // 中优先级修复：多节点层级对称分布优化
    return this.optimizeMultiNodeSymmetricDistribution(validNodes, positions);
  }

  /**
   * 优化多节点层级对称分布 - 增强版算法
   * @param {Array} validNodes - 有效节点数组
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  optimizeMultiNodeSymmetricDistribution(validNodes, positions) {
    const nodeCount = validNodes.length;
    let adjustments = 0;

    console.log(` [增强对称分布] 开始优化 ${nodeCount} 个节点的智能对称分布`);

    // 获取当前X坐标并排序
    const nodePositions = validNodes
      .map((node) => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return { node, nodeId, pos, x: pos.x };
      })
      .sort((a, b) => a.x - b.x);

    // 计算节点重要性权重（基于连接数和类型）
    const nodeWeights = this.calculateNodeImportanceWeights(validNodes);

    // 根据节点数量采用不同的智能对称分布策略
    if (nodeCount === 2) {
      // 两节点：动态对称分布，基于重要性调整间距
      const baseSpacing = 80; // 基础间距从60增加到80
      const weightDiff = Math.abs(nodeWeights[0] - nodeWeights[1]);
      const dynamicSpacing = baseSpacing + (weightDiff * 20); // 重要性差异影响间距
      const targetPositions = [-dynamicSpacing / 2, dynamicSpacing / 2];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            ` [2节点智能] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (动态间距: ${dynamicSpacing.toFixed(1)})`,
          );

          // 同步图形节点位置
          if (this.graph) {
            const graphNode = this.graph.getCellById(item.nodeId);
            if (graphNode) {
              graphNode.setPosition({ x: targetX, y: item.pos.y });
            }
          }
        }
      });
    } else if (nodeCount === 3) {
      // 三节点：黄金比例分布，中心节点权重影响偏移
      const totalWidth = 140; // 增加总宽度
      const centerWeight = nodeWeights[1]; // 中心节点权重
      const centerOffset = (centerWeight - 0.5) * 20; // 根据重要性微调中心位置
      const targetPositions = [
        -totalWidth / 2,
        centerOffset,
        totalWidth / 2
      ];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            ` [3节点黄金] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (黄金比例+权重调整)`,
          );

          // 同步图形节点位置
          if (this.graph) {
            const graphNode = this.graph.getCellById(item.nodeId);
            if (graphNode) {
              graphNode.setPosition({ x: targetX, y: item.pos.y });
            }
          }
        }
      });
    } else if (nodeCount === 4) {
      // 四节点：黄金比例对称分布
      const goldenRatio = 1.618;
      const baseWidth = 120;
      const innerSpacing = baseWidth / goldenRatio; // 内侧间距使用黄金比例
      const outerSpacing = baseWidth; // 外侧间距
      
      const targetPositions = [
        -outerSpacing,
        -innerSpacing / 2,
        innerSpacing / 2,
        outerSpacing
      ];
      
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            ` [4节点黄金] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (黄金比例对称)`,
          );

          // 同步图形节点位置
          if (this.graph) {
            const graphNode = this.graph.getCellById(item.nodeId);
            if (graphNode) {
              graphNode.setPosition({ x: targetX, y: item.pos.y });
            }
          }
        }
      });
    } else {
      // 多节点（5+）：智能加权分布
      const positions = this.calculateIntelligentMultiNodeDistribution(nodePositions, nodeWeights);
      
      nodePositions.forEach((item, index) => {
        const targetX = positions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            ` [多节点智能] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (智能加权分布)`,
          );

          // 同步图形节点位置
          if (this.graph) {
            const graphNode = this.graph.getCellById(item.nodeId);
            if (graphNode) {
              graphNode.setPosition({ x: targetX, y: item.pos.y });
            }
          }
        }
      });
    }

    // 最终验证：确保整体居中
    const finalXCoords = nodePositions.map((item) => item.pos.x);
    const finalCenterX =
      (Math.min(...finalXCoords) + Math.max(...finalXCoords)) / 2;

    if (Math.abs(finalCenterX) > 0.5) {
      const offsetX = -finalCenterX;
      nodePositions.forEach((item) => {
        item.pos.x += offsetX;
        if (this.graph) {
          const graphNode = this.graph.getCellById(item.nodeId);
          if (graphNode) {
            graphNode.setPosition({ x: item.pos.x, y: item.pos.y });
          }
        }
      });
      adjustments += nodeCount;
      console.log(
        ` [最终居中] 整体微调偏移 ${offsetX.toFixed(1)}px，确保精确居中`,
      );
    }

    console.log(
      ` [增强对称分布] 优化完成，调整 ${adjustments} 次，节点分布:`,
      nodePositions
        .map((item) => `${item.nodeId}(${item.pos.x.toFixed(1)})`)
        .join(", "),
    );

    return adjustments;
  }

  /**
   * 计算节点重要性权重
   * @param {Array} nodes - 节点数组
   * @returns {Array} 权重数组
   */
  calculateNodeImportanceWeights(nodes) {
    const weights = nodes.map(node => {
      let weight = 0.5; // 基础权重
      
      // 基于连接数的权重
      const connections = this.getNodeConnections(node);
      weight += Math.min(connections * 0.1, 0.3); // 最多增加0.3
      
      // 基于层级位置的权重（中心层级权重更高）
      const layerIndex = this.getNodeLayerIndex(node);
      const totalLayers = this.getTotalLayers();
      const centerDistance = Math.abs(layerIndex - totalLayers / 2);
      weight += (1 - centerDistance / (totalLayers / 2)) * 0.2;
      
      return Math.min(Math.max(weight, 0.1), 1.0); // 限制在0.1-1.0范围内
    });
    
    console.log(` [节点权重] 计算完成:`, weights.map((w, i) => `${nodes[i].id || nodes[i].getId()}(${w.toFixed(2)})`).join(", "));
    return weights;
  }

  /**
   * 计算智能多节点分布位置
   * @param {Array} nodePositions - 节点位置数组
   * @param {Array} weights - 权重数组
   * @returns {Array} 目标X坐标数组
   */
  calculateIntelligentMultiNodeDistribution(nodePositions, weights) {
    const nodeCount = nodePositions.length;
    const maxWidth = 400; // 最大分布宽度
    
    // 基于权重计算动态间距
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const avgWeight = totalWeight / nodeCount;
    
    // 计算每个节点应占的空间比例
    const spaceRatios = weights.map(w => w / avgWeight);
    
    // 计算累积位置
    const positions = [];
    const currentPos = -maxWidth / 2;
    const unitSpacing = maxWidth / (nodeCount - 1);
    
    for (let i = 0; i < nodeCount; i++) {
      if (i === 0) {
        positions.push(currentPos);
      } else if (i === nodeCount - 1) {
        positions.push(maxWidth / 2);
      } else {
        // 中间节点基于权重调整位置
        const basePos = -maxWidth / 2 + (i * unitSpacing);
        const weightAdjustment = (spaceRatios[i] - 1) * 30; // 权重调整幅度
        positions.push(basePos + weightAdjustment);
      }
    }
    
    // 确保整体居中
    const centerX = (positions[0] + positions[positions.length - 1]) / 2;
    const offset = -centerX;
    return positions.map(pos => pos + offset);
  }

  /**
   * 获取节点连接数
   * @param {Object} node - 节点对象
   * @returns {number} 连接数
   */
  getNodeConnections(node) {
    // 简化实现，实际应该根据图结构计算
    return node.connections ? node.connections.length : 1;
  }

  /**
   * 获取节点层级索引
   * @param {Object} node - 节点对象
   * @returns {number} 层级索引
   */
  getNodeLayerIndex(node) {
    // 简化实现，实际应该根据布局结构计算
    return node.layerIndex || 0;
  }

  /**
   * 获取总层级数
   * @returns {number} 总层级数
   */
  getTotalLayers() {
    // 简化实现，实际应该根据布局结构计算
    return this.layoutModel?.layers?.length || 3;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    // 清除优化相关缓存
    console.log(' [缓存清理] 清除LayerOptimizer缓存');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      optimizerType: 'LayerOptimizer',
      hasGraph: !!this.graph
    };
  }
}

export default LayerOptimizer;