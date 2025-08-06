/**
 * 统一结构化布局引擎
 * 基于父子关联关系的分层分级自底向上定位系统
 * 统一处理预览线endpoint和普通节点的同层排列
 */

export class UnifiedStructuredLayoutEngine {
  constructor(graph, options = {}, previewLineManager = null) {
    this.graph = graph;
    this.previewLineManager = previewLineManager; // 🎯 关键：接收预览线管理器实例
    this.options = {
      // 层级配置
      layer: {
        baseHeight: 200, // 🔧 优化：基础层级高度从150增加到200，改善视觉层次
        dynamicSpacing: true, // 动态间距调整
        maxLayers: 10, // 最大层级数
        tolerance: 20, // 层级容差
      },

      // 节点配置
      node: {
        minSpacing: 120, // 最小节点间距
        preferredSpacing: 180, // 首选节点间距
        maxSpacing: 300, // 最大节点间距
        endpointSize: { width: 20, height: 20 }, // endpoint虚拟节点大小
      },

      // 优化配置
      optimization: {
        enableGlobalOptimization: true,
        maxIterations: 5,
        convergenceThreshold: 0.01,
        enableAestheticOptimization: true,
        enableEndpointIntegration: true, // 启用endpoint集成
      },

      // 性能配置
      performance: {
        enableParallelProcessing: false, // 暂时禁用并行处理
        batchSize: 50,
        enableCaching: true,
      },

      ...options,
    };

    // 布局数据模型
    this.layoutModel = {
      layers: [], // 分层结构
      nodePositions: new Map(), // 节点位置
      parentChildMap: new Map(), // 父子关系
      childParentMap: new Map(), // 子父关系
      layerMetrics: new Map(), // 层级指标
      endpointNodes: new Map(), // endpoint虚拟节点
      mixedLayerNodes: new Map(), // 混合层级节点（普通节点+endpoint）
      nodeToLayer: new Map(), // 节点到层级的映射
      optimizationHistory: [], // 优化历史
    };
  }

  /**
   * 执行统一结构化布局
   * @returns {Object} 布局结果
   */
  async executeLayout() {
    console.log("🚀 [统一结构化布局] 开始执行布局");

    try {
      // 阶段1：数据预处理
      const preprocessResult = await this.preprocessLayoutData();

      // 阶段2：分层构建（包含endpoint集成）
      const layerStructure =
        await this.buildHierarchicalLayers(preprocessResult);

      // 阶段3：自底向上位置计算
      const positions = await this.calculateBottomUpPositions(layerStructure);

      // 阶段4：层级内统一优化（普通节点+endpoint）
      const optimizedPositions = await this.optimizeUnifiedLayerAlignment(
        positions,
        layerStructure,
      );

      // 阶段5：全局平衡优化
      const finalPositions = await this.applyGlobalOptimization(
        optimizedPositions,
        layerStructure,
      );

      // 阶段6：应用到图形
      await this.applyPositionsToGraph(finalPositions);

      // 🎯 关键修复：最终同步所有endpoint位置到预览线管理器
      this.syncAllEndpointPositions(finalPositions);

      return this.generateLayoutReport(layerStructure, finalPositions);
    } catch (error) {
      console.error("❌ [统一结构化布局] 布局执行失败:", error);
      return {
        success: false,
        error: error.message,
        message: `布局执行失败: ${error.message}`,
      };
    }
  }

  /**
   * 数据预处理：提取节点、边和预览线endpoint
   * @returns {Object} 预处理结果
   */
  async preprocessLayoutData() {
    console.log("📊 [数据预处理] 开始提取布局数据");

    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();

    // 过滤有效节点（排除拖拽点）
    const validNodes = nodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const nodeData = node.getData() || {};
      return (
        !nodeId.includes("hint") &&
        !nodeData.isEndpoint &&
        !nodeData.isPreview &&
        !nodeId.startsWith("hint_")
      );
    });

    // 过滤有效边（排除预览线）
    const validEdges = edges.filter((edge) => {
      const edgeId = edge.id || edge.getId();
      const edgeData = edge.getData() || {};
      return (
        !edgeId.includes("preview") &&
        !edgeId.includes("unified_preview") &&
        !edgeData.isPreview &&
        !edgeData.isPersistentPreview
      );
    });

    // 🎯 关键：提取预览线endpoint作为虚拟节点
    const endpointNodes = await this.extractPreviewEndpoints();

    console.log('📊 [数据预处理] 数据统计:', {
      普通节点: validNodes.length,
      有效连线: validEdges.length,
      预览线endpoint: endpointNodes.length,
      总处理节点: validNodes.length + endpointNodes.length,
    });

    return {
      validNodes,
      validEdges,
      endpointNodes,
      totalNodes: validNodes.length + endpointNodes.length,
    };
  }

  /**
   * 提取预览线endpoint作为虚拟节点
   * @returns {Array} endpoint虚拟节点数组
   */
  async extractPreviewEndpoints() {
    const endpointNodes = [];

    console.log("🔍 [预览线提取] 开始提取预览线endpoint并校验连接状态");

    // 获取预览线管理器（用于获取预览线位置信息）
    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager ||
      null;

    if (
      !previewLineManager ||
      !previewLineManager.previewLines ||
      previewLineManager.previewLines.size === 0
    ) {
      console.log(
        "⚠️ [预览线提取] 预览线管理器不可用，将为所有叶子节点创建默认虚拟endpoint",
      );
      return this.createVirtualEndpointsForLeafNodes();
    }

    const previewLines = previewLineManager.previewLines;
    console.log(`🔍 [预览线提取] 发现 ${previewLines.size} 个源节点的预览线`);

    // 🎯 关键修复：在创建endpoint前校验分支连接状态
    previewLines.forEach((previewInstance, sourceNodeId) => {
      console.log(
        `🔍 [预览线提取] 处理源节点 ${sourceNodeId} 的预览线:`,
        previewInstance,
      );

      // 检查源节点是否存在
      const sourceNode = this.graph.getCellById(sourceNodeId);
      if (!sourceNode) {
        console.warn(`⚠️ [预览线提取] 源节点 ${sourceNodeId} 不存在，跳过`);
        return;
      }

      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只为未连接的分支创建虚拟endpoint
        console.log(
          `📋 [预览线提取] 源节点 ${sourceNodeId} 有 ${previewInstance.length} 个分支预览线`,
        );
        previewInstance.forEach((instance, index) => {
          if (instance.endPosition && !instance.isAttached) {
            const branchId = instance.branchId || `branch_${index}`;

            // 🎯 关键校验：检查该分支是否已有实际连接
            const hasConnection = this.hasBranchConnection(
              sourceNode,
              branchId,
              instance,
            );

            if (!hasConnection) {
              const endpointNode = this.createEndpointVirtualNode(
                sourceNodeId,
                branchId,
                instance.endPosition,
                instance.branchLabel,
              );
              endpointNodes.push(endpointNode);
              this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode);
              console.log(
                `✅ [预览线提取] 成功创建分支endpoint虚拟节点: ${endpointNode.id}`,
              );
            } else {
              console.log(`⏭️ [预览线提取] 跳过已连接的分支 ${branchId}:`, {
                sourceNodeId,
                branchId,
                branchLabel: instance.branchLabel,
              });
            }
          } else {
            console.log('⚠️ [预览线提取] 跳过已附着或无端点的分支预览线:', instance)
          }
        });
      } else if (
        previewInstance &&
        previewInstance.endPosition &&
        !previewInstance.isAttached
      ) {
        // 单一预览线 - 检查节点是否已有连接
        console.log(`📋 [预览线提取] 源节点 ${sourceNodeId} 有单一预览线`);

        // 🎯 关键校验：检查节点是否已有实际连接
        const hasConnection = this.hasExistingRealConnections(sourceNode);

        if (!hasConnection) {
          const endpointNode = this.createEndpointVirtualNode(
            sourceNodeId,
            "single",
            previewInstance.endPosition,
            null,
          );
          endpointNodes.push(endpointNode);
          this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode);
          console.log(
            `✅ [预览线提取] 成功创建单一endpoint虚拟节点: ${endpointNode.id}`,
          );
        } else {
          console.log(`⏭️ [预览线提取] 跳过已连接的节点 ${sourceNodeId}`);
        }
      } else {
        console.log('⚠️ [预览线提取] 跳过已附着或无端点的预览线:', previewInstance);
      }
    });

    console.log(
      `🎯 [预览线提取] 提取完成，共创建 ${endpointNodes.length} 个endpoint虚拟节点:`,
      endpointNodes.map((node) => node.id),
    );

    return endpointNodes;
  }

  /**
   * 检查特定分支是否已有实际连接
   * @param {Object} sourceNode - 源节点对象
   * @param {string} branchId - 分支ID
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 该分支是否已有实际连接
   */
  hasBranchConnection(sourceNode, branchId, previewInstance) {
    if (!sourceNode || !this.graph) return false;

    const outgoingEdges = this.graph.getOutgoingEdges(sourceNode) || [];

    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter((edge) => {
      const edgeData = edge.getData() || {};
      return (
        !edgeData.isUnifiedPreview &&
        !edgeData.isPersistentPreview &&
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line" &&
        edgeData.type !== "draggable-preview"
      );
    });

    // 🎯 关键：检查是否有连接与当前分支相关
    const branchLabel = previewInstance?.branchLabel;
    const branchConnections = realConnections.filter((edge) => {
      const edgeData = edge.getData() || {};

      // 方法1：检查边的数据中是否包含分支信息
      if (
        edgeData.branchId === branchId ||
        edgeData.branchLabel === branchLabel
      ) {
        return true;
      }

      // 方法2：检查边的标签是否匹配分支标签
      const edgeLabels = edge.getLabels() || [];
      if (
        branchLabel &&
        edgeLabels.some(
          (label) =>
            label.attrs?.text?.text === branchLabel ||
            label.attrs?.label?.text === branchLabel,
        )
      ) {
        return true;
      }

      // 方法3：对于分流节点，检查连接的目标位置是否与分支预览线位置匹配
      if (previewInstance?.endPosition) {
        const targetPoint = edge.getTargetPoint();
        if (targetPoint) {
          const distance = Math.sqrt(
            Math.pow(targetPoint.x - previewInstance.endPosition.x, 2) +
              Math.pow(targetPoint.y - previewInstance.endPosition.y, 2),
          );
          // 如果连接的目标位置与预览线端点位置很接近（50像素内），认为是同一分支
          if (distance < 50) {
            return true;
          }
        }
      }

      return false;
    });

    // 方法4：对于分流节点的特殊处理 - 检查连接数量与分支数量的关系
    if (branchConnections.length === 0 && realConnections.length > 0) {
      const sourceNodeData = sourceNode.getData() || {};
      const nodeType = sourceNodeData.type || sourceNodeData.nodeType;

      if (nodeType === "crowd-split" || nodeType === "condition") {
        // 获取预览线管理器中该节点的所有分支
        const previewLineManager =
          this.previewLineManager ||
          window.unifiedPreviewLineManager ||
          this.graph.previewLineManager;

        if (previewLineManager && previewLineManager.previewLines) {
          const nodePreviewLines = previewLineManager.previewLines.get(
            sourceNode.id,
          );
          if (Array.isArray(nodePreviewLines)) {
            const totalBranches = nodePreviewLines.length;
            // 如果实际连接数等于或超过总分支数，说明所有分支都已连接
            if (realConnections.length >= totalBranches) {
              console.log(
                `🔍 [分支连接检查] 节点 ${sourceNode.id} 所有分支都已连接 (${realConnections.length}/${totalBranches})`,
              );
              return true;
            }

            // 如果当前分支索引小于已连接数量，认为该分支已连接
            const currentBranchIndex = nodePreviewLines.findIndex(
              (instance) =>
                instance.branchId === branchId || instance === previewInstance,
            );
            if (
              currentBranchIndex >= 0 &&
              currentBranchIndex < realConnections.length
            ) {
              console.log(
                `🔍 [分支连接检查] 分支 ${branchId} 按索引判断已连接 (索引${currentBranchIndex} < 连接数${realConnections.length})`,
              );
              return true;
            }
          }
        }
      }
    }

    const hasConnection = branchConnections.length > 0;

    console.log(`🔍 [分支连接检查] 节点 ${sourceNode.id} 分支 ${branchId}:`, {
      branchLabel,
      hasConnection,
      branchConnections: branchConnections.length,
      totalRealConnections: realConnections.length,
      branchConnectionIds: branchConnections.map((edge) => edge.id),
      previewEndPosition: previewInstance?.endPosition,
    });

    return hasConnection;
  }

  /**
   * 检查节点是否已有实际连接（非预览线）
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有实际连接
   */
  hasExistingRealConnections(node) {
    if (!node || !this.graph) return false;

    const outgoingEdges = this.graph.getOutgoingEdges(node) || [];

    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter((edge) => {
      const edgeData = edge.getData() || {};
      return (
        !edgeData.isUnifiedPreview &&
        !edgeData.isPersistentPreview &&
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line"
      );
    });

    console.log(
      `🔍 [连接检查] 节点 ${node.id} 实际连接数: ${realConnections.length}`,
      {
        totalEdges: outgoingEdges.length,
        realConnections: realConnections.length,
        realConnectionIds: realConnections.map((edge) => edge.id),
      },
    );

    return realConnections.length > 0;
  }

  /**
   * 为所有叶子节点创建虚拟endpoint节点
   * @returns {Array} 虚拟endpoint节点数组
   */
  createVirtualEndpointsForLeafNodes() {
    const endpointNodes = [];
    const nodes = this.graph.getNodes();

    console.log(
      "🔍 [虚拟endpoint] 开始为叶子节点创建虚拟endpoint（带连接校验）",
    );

    nodes.forEach((node) => {
      const nodeData = node.getData() || {};
      const nodeType = nodeData.type || nodeData.nodeType;

      // 跳过特殊节点
      if (
        nodeData.isEndpoint ||
        nodeType === "endpoint" ||
        nodeType === "end" ||
        nodeType === "finish" ||
        nodeData.isUnifiedPreview ||
        nodeData.isPersistentPreview ||
        nodeData.isPreview
      ) {
        return;
      }

      // 🎯 关键校验：检查节点是否已有实际连接
      const hasRealConnections = this.hasExistingRealConnections(node);

      if (!hasRealConnections) {
        // 这是一个没有实际连接的叶子节点，为它创建虚拟endpoint
        const nodePosition = node.getPosition();
        const nodeSize = node.getSize();

        // 计算虚拟endpoint位置 - 修复：使用合理的X坐标偏移
        const endPosition = {
          x: nodePosition.x + 50, // 修复：使用较小的偏移量，避免异常的X坐标
          y: nodePosition.y + nodeSize.height / 2,
        };

        const virtualNode = this.createEndpointVirtualNode(
          node.id,
          'virtual',
          endPosition,
          `${node.id}_virtual_endpoint`
        )

        // 🎯 新增：立即建立位置映射
        if (this.layoutModel && this.layoutModel.nodePositions) {
          this.layoutModel.nodePositions.set(virtualNode.id, {
            x: endPosition.x,
            y: endPosition.y,
            nodeType: "endpoint",
            sourceNodeId: node.id,
            branchId: "virtual",
            isVirtual: true,
          });
          console.log(
            `🎯 [位置映射] 虚拟endpoint位置已建立: ${virtualNode.id} -> (${endPosition.x}, ${endPosition.y})`,
          );
        }

        endpointNodes.push(virtualNode);
        console.log(
          `✅ [虚拟endpoint] 为叶子节点 ${node.id} 创建虚拟endpoint: ${virtualNode.id}`,
        );
      } else {
        console.log(`⏭️ [虚拟endpoint] 跳过已有连接的节点 ${node.id}`);
      }
    });

    console.log(
      `🎯 [虚拟endpoint] 虚拟endpoint创建完成，共创建 ${endpointNodes.length} 个虚拟节点`,
    );
    return endpointNodes;
  }

  /**
   * 创建endpoint虚拟节点
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} endPosition - 端点位置
   * @param {string} branchLabel - 分支标签
   * @returns {Object} 虚拟节点对象
   */
  createEndpointVirtualNode(sourceNodeId, branchId, endPosition, branchLabel) {
    // 🎯 关键：使用与 useStructuredLayout.js 一致的ID格式
    const originalEndpointId = `endpoint_${sourceNodeId}_${branchId}`;
    const endpointId = `virtual_endpoint_${originalEndpointId}`;

    console.log(`🎯 [虚拟节点创建] 创建endpoint虚拟节点: ${endpointId}`, {
      sourceNodeId,
      branchId,
      endPosition: { x: endPosition.x, y: endPosition.y },
    });

    return {
      id: endpointId,
      type: "endpoint",
      sourceNodeId,
      branchId,
      branchLabel,
      isVirtual: true,
      isEndpoint: true,
      position: {
        x: endPosition.x,
        y: 0, // 🎯 关键修复：初始Y坐标设置为0，确保后续层级计算的一致性
      },
      size: this.options.node.endpointSize,

      // 模拟节点接口
      getId: () => endpointId,
      getPosition: () => ({ x: endPosition.x, y: 0 }),
      getSize: () => this.options.node.endpointSize,
      getData: () => ({
        type: "endpoint",
        isEndpoint: true,
        sourceNodeId,
        branchId,
      }),
      setPosition: (pos) => {
        endPosition.x = pos.x;
        endPosition.y = pos.y;
        // 同步更新预览线管理器中的位置
        this.updatePreviewEndpointPosition(sourceNodeId, branchId, pos);
      },
    };
  }

  /**
   * 获取节点的层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 层级Y坐标
   */
  getNodeLayerY(nodeId) {
    // 🎯 修复1：增强布局模型检查
    if (!this.layoutModel || !this.layoutModel.nodeToLayer) {
      console.warn(
        `⚠️ [布局引擎] 布局模型未初始化，节点 ${nodeId} 使用默认Y坐标`,
      );
      return this.getDefaultLayerY(nodeId);
    }

    // 🎯 修复2：首先检查节点层级映射
    const layerIndex = this.layoutModel.nodeToLayer.get(nodeId);
    if (layerIndex === undefined) {
      console.warn(
        `⚠️ [布局引擎] 未找到节点 ${nodeId} 的层级信息，尝试智能推断`,
      );
      return this.inferNodeLayerY(nodeId);
    }

    const layerY = layerIndex * this.options.layer.baseHeight;
    console.log(
      `📍 [布局引擎] 节点 ${nodeId} 层级Y坐标: 第${layerIndex}层 -> Y=${layerY}`,
    );
    return layerY;
  }

  /**
   * 智能推断节点层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 推断的Y坐标
   */
  inferNodeLayerY(nodeId) {
    try {
      // 🎯 策略1：通过图形节点位置推断
      const node = this.graph.getCellById(nodeId);
      if (node) {
        const position = node.getPosition();
        const estimatedLayer = Math.floor(
          position.y / this.options.layer.baseHeight,
        );
        const estimatedY = estimatedLayer * this.options.layer.baseHeight;
        console.log(
          `🔍 [智能推断] 节点 ${nodeId} 基于位置推断层级Y坐标: ${estimatedY} (第${estimatedLayer}层)`,
        );

        // 🎯 临时添加到层级映射中，避免重复推断
        if (this.layoutModel && this.layoutModel.nodeToLayer) {
          this.layoutModel.nodeToLayer.set(nodeId, estimatedLayer);
        }

        return estimatedY;
      }

      // 🎯 策略2：通过父子关系推断
      if (this.layoutModel && this.layoutModel.childParentMap) {
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];
        if (parents.length > 0) {
          const parentId = parents[0];
          const parentLayer = this.layoutModel.nodeToLayer.get(parentId);
          if (parentLayer !== undefined) {
            const childLayer = parentLayer + 1;
            const childY = childLayer * this.options.layer.baseHeight;
            console.log(
              `🔍 [智能推断] 节点 ${nodeId} 基于父节点 ${parentId} 推断层级Y坐标: ${childY} (第${childLayer}层)`,
            );

            // 临时添加到层级映射中
            this.layoutModel.nodeToLayer.set(nodeId, childLayer);
            return childY;
          }
        }
      }

      // 🎯 策略3：使用默认Y坐标
      return this.getDefaultLayerY(nodeId);
    } catch (error) {
      console.warn(`⚠️ [智能推断] 节点 ${nodeId} 推断失败:`, error.message);
      return this.getDefaultLayerY(nodeId);
    }
  }

  /**
   * 获取默认层级Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 默认Y坐标
   */
  getDefaultLayerY(nodeId) {
    // 🎯 根据节点类型返回不同的默认Y坐标
    if (nodeId.includes("start")) {
      return 0; // 起始节点在第0层
    } else if (
      nodeId.includes("virtual_endpoint") ||
      nodeId.includes("endpoint")
    ) {
      return this.options.layer.baseHeight * 3; // endpoint节点默认在第3层
    } else {
      return this.options.layer.baseHeight; // 普通节点默认在第1层
    }
  }

  /**
   * 获取下一层的Y坐标
   * @param {string} nodeId - 节点ID
   * @returns {number} 下一层的Y坐标
   */
  getNextLayerY(nodeId) {
    try {
      const currentLayerY = this.getNodeLayerY(nodeId);
      const nextLayerY = currentLayerY + this.options.layer.baseHeight;
      console.log(
        `📍 [布局引擎] 节点 ${nodeId} 下一层Y坐标: ${currentLayerY} + ${this.options.layer.baseHeight} = ${nextLayerY}`,
      );
      return nextLayerY;
    } catch (error) {
      console.warn(
        `⚠️ [布局引擎] 获取节点 ${nodeId} 下一层Y坐标失败:`,
        error.message,
      );
      // 使用默认的下一层Y坐标
      return this.options.layer.baseHeight * 2;
    }
  }

  /**
   * 更新预览线endpoint位置
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} position - 新位置
   */
  updatePreviewEndpointPosition(sourceNodeId, branchId, position) {
    console.log("🔄 [位置同步] 更新endpoint位置:", {
      sourceNodeId,
      branchId,
      position,
    });

    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager;

    if (!previewLineManager) {
      console.warn(
        `⚠️ [位置同步] 预览线管理器不可用，无法更新endpoint位置: ${sourceNodeId}_${branchId}`,
      );
      return;
    }

    console.log("✅ [位置同步] 找到预览线管理器，开始更新预览线终点位置");

    // 🎯 关键修复：强制更新预览线管理器的endPosition属性
    if (previewLineManager.endPosition) {
      const oldEndPosition = { ...previewLineManager.endPosition };
      previewLineManager.endPosition.x = position.x;
      previewLineManager.endPosition.y = position.y;
      console.log(
        `🎯 [强制同步] 预览线管理器endPosition已更新: (${oldEndPosition.x}, ${oldEndPosition.y}) → (${position.x}, ${position.y})`,
      );
    }

    // 🎯 关键修复：直接查找并更新预览线的终点位置
    const previewInstances = previewLineManager.previewLines.get(sourceNodeId);
    if (!previewInstances) {
      console.warn(`⚠️ [位置同步] 未找到节点 ${sourceNodeId} 的预览线实例`);
      return;
    }

    let updatedCount = 0;

    if (Array.isArray(previewInstances)) {
      // 分支预览线：查找匹配的分支
      previewInstances.forEach((instance) => {
        if (instance.branchId === branchId) {
          console.log(`🎯 [位置同步] 找到匹配的分支预览线: ${branchId}`);

          // 直接更新预览线的终点位置
          if (instance.line && typeof instance.line.setTarget === "function") {
            instance.line.setTarget({
              x: position.x,
              y: position.y,
            });

            // 同步更新实例中的endPosition
            if (instance.endPosition) {
              instance.endPosition.x = position.x;
              instance.endPosition.y = position.y;
            }

            // 更新endpoint标记位置
            if (typeof previewLineManager.updateEndpointMarker === "function") {
              previewLineManager.updateEndpointMarker(instance.line, position);
            }

            updatedCount++;
            console.log(
              `✅ [位置同步] 分支预览线终点位置已更新: ${branchId} -> (${position.x}, ${position.y})`,
            );
          }
        }
      });
    } else {
      // 单一预览线
      const instance = previewInstances;
      console.log('🎯 [位置同步] 更新单一预览线终点位置');

      if (instance.line && typeof instance.line.setTarget === "function") {
        instance.line.setTarget({
          x: position.x,
          y: position.y,
        });

        // 同步更新实例中的endPosition
        if (instance.endPosition) {
          instance.endPosition.x = position.x;
          instance.endPosition.y = position.y;
        }

        // 更新endpoint标记位置
        if (typeof previewLineManager.updateEndpointMarker === "function") {
          previewLineManager.updateEndpointMarker(instance.line, position);
        }

        updatedCount++;
        console.log(
          `✅ [位置同步] 单一预览线终点位置已更新: -> (${position.x}, ${position.y})`,
        );
      }
    }

    if (updatedCount === 0) {
      console.warn(
        `⚠️ [位置同步] 未找到可更新的预览线: ${sourceNodeId}_${branchId}`,
      );

      // 尝试强制刷新预览线位置
      const sourceNode = this.graph.getCellById(sourceNodeId);
      if (
        sourceNode &&
        typeof previewLineManager.updatePreviewLinePosition === "function"
      ) {
        console.log("🔄 [位置同步] 尝试强制刷新预览线位置");
        previewLineManager.updatePreviewLinePosition(sourceNode);
      }
    } else {
      console.log(`✅ [位置同步] 成功更新 ${updatedCount} 条预览线的终点位置`);
    }
  }

  /**
   * 构建分层结构（包含endpoint集成）
   * @param {Object} preprocessResult - 预处理结果
   * @returns {Object} 层级结构
   */
  async buildHierarchicalLayers(preprocessResult) {
    console.log("🔍 [分层构建] 开始构建包含endpoint的分层结构");

    const { validNodes, validEdges, endpointNodes } = preprocessResult;

    // 🎯 关键：将普通节点和endpoint节点合并处理
    const allNodes = [...validNodes, ...endpointNodes];

    // 构建父子关系图
    this.buildParentChildRelationships(allNodes, validEdges, endpointNodes);

    // 识别叶子节点（最底层）
    const leafNodes = this.identifyLeafNodes(allNodes);

    // 自底向上分层
    const layers = this.calculateLayersBottomUp(leafNodes, allNodes);

    // 🎯 关键：为每层创建混合节点列表（普通节点+endpoint）
    this.createMixedLayerNodes(layers);

    console.log('🔍 [分层构建] 分层完成:', {
      总层数: layers.length,
      各层节点分布: layers
        .map((layer, index) => {
          const normalCount = layer.filter((n) => !n.isEndpoint).length;
          const endpointCount = layer.filter((n) => n.isEndpoint).length;
          return `第${index + 1}层: ${normalCount}普通+${endpointCount}endpoint`;
        })
        .join(", "),
    });

    return {
      layers,
      nodeToLayer: this.layoutModel.nodeToLayer,
      parentChildMap: this.layoutModel.parentChildMap,
      childParentMap: this.layoutModel.childParentMap,
      mixedLayerNodes: this.layoutModel.mixedLayerNodes,
      totalLayers: layers.length,
    };
  }

  /**
   * 构建父子关系（包含endpoint的虚拟关系）
   * @param {Array} allNodes - 所有节点（普通+endpoint）
   * @param {Array} validEdges - 有效边
   * @param {Array} endpointNodes - endpoint节点
   */
  buildParentChildRelationships(allNodes, validEdges, endpointNodes) {
    // 初始化关系映射
    allNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      this.layoutModel.parentChildMap.set(nodeId, []);
      this.layoutModel.childParentMap.set(nodeId, []);
    });

    // 处理普通节点间的连接关系
    validEdges.forEach((edge) => {
      const sourceId = edge.getSourceCellId();
      const targetId = edge.getTargetCellId();

      if (sourceId && targetId) {
        // 建立父子关系
        if (this.layoutModel.parentChildMap.has(sourceId)) {
          this.layoutModel.parentChildMap.get(sourceId).push(targetId);
        }
        if (this.layoutModel.childParentMap.has(targetId)) {
          this.layoutModel.childParentMap.get(targetId).push(sourceId);
        }
      }
    });

    // 🎯 关键：建立endpoint与源节点的虚拟父子关系
    endpointNodes.forEach((endpointNode) => {
      const sourceNodeId = endpointNode.sourceNodeId;
      const endpointId = endpointNode.id;

      // endpoint作为源节点的子节点
      if (this.layoutModel.parentChildMap.has(sourceNodeId)) {
        this.layoutModel.parentChildMap.get(sourceNodeId).push(endpointId);
      }
      if (this.layoutModel.childParentMap.has(endpointId)) {
        this.layoutModel.childParentMap.get(endpointId).push(sourceNodeId);
      }
    });

    console.log('🔗 [关系构建] 父子关系构建完成', {
      节点数: allNodes.length,
      连接数: validEdges.length,
      endpoint虚拟关系: endpointNodes.length,
    });
  }

  /**
   * 识别叶子节点（出度为0的节点，但排除endpoint节点）
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 叶子节点数组
   */
  identifyLeafNodes(allNodes) {
    // 首先过滤出普通节点（非endpoint节点）
    const normalNodes = allNodes.filter(
      (node) => !(node.isEndpoint || node.isVirtual),
    );

    const leafNodes = normalNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const children = this.layoutModel.parentChildMap.get(nodeId) || [];

      // 过滤出真正的子节点（排除endpoint虚拟节点）
      const realChildren = children.filter((childId) => {
        const childNode = allNodes.find((n) => (n.id || n.getId()) === childId);
        return childNode && !(childNode.isEndpoint || childNode.isVirtual);
      });

      return realChildren.length === 0;
    });

    console.log(
      `🌿 [叶子识别] 识别到 ${leafNodes.length} 个叶子节点（排除endpoint）`,
    );
    console.log('🌿 [叶子识别] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()));

    // 如果没有找到叶子节点，可能是因为图中有循环或者所有节点都有连接
    // 在这种情况下，选择入度为0的节点作为起始点
    if (leafNodes.length === 0) {
      console.warn('⚠️ [叶子识别] 未找到叶子节点，尝试寻找根节点（入度为0）');

      const rootNodes = normalNodes.filter((node) => {
        const nodeId = node.id || node.getId();
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];

        // 过滤出真正的父节点（排除endpoint虚拟节点）
        const realParents = parents.filter((parentId) => {
          const parentNode = allNodes.find(
            (n) => (n.id || n.getId()) === parentId,
          );
          return parentNode && !(parentNode.isEndpoint || parentNode.isVirtual);
        });

        return realParents.length === 0;
      });

      console.log(
        `🌿 [根节点识别] 识别到 ${rootNodes.length} 个根节点:`,
        rootNodes.map((n) => n.id || n.getId()),
      );

      if (rootNodes.length > 0) {
        return rootNodes;
      }

      // 如果连根节点都没有，选择第一个普通节点作为起始点
      if (normalNodes.length > 0) {
        console.warn('⚠️ [叶子识别] 未找到根节点，使用第一个普通节点作为起始点')
        return [normalNodes[0]];
      }
    }

    return leafNodes;
  }

  /**
   * 自底向上计算层级（方案D：增强版本）
   * @param {Array} leafNodes - 叶子节点
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 分层结果
   */
  calculateLayersBottomUp(leafNodes, allNodes) {
    const layers = [];
    const processedNodes = new Set();
    const nodeToLayer = new Map();
    let currentLayer = [...leafNodes]; // 复制数组避免修改原数组
    let layerIndex = 0;

    console.log(
      `🔍 [层级构建] 开始自底向上构建，叶子节点: ${leafNodes.length}个`,
    );
    console.log('🔍 [层级构建] 叶子节点列表:', leafNodes.map(n => n.id || n.getId()))
    console.log(`🔍 [层级构建] 总节点数: ${allNodes.length}个`);

    // 从叶子节点开始，逐层向上构建
    while (currentLayer.length > 0) {
      // 当前层级
      const layerNodes = [...currentLayer];
      layers.push(layerNodes);

      console.log(
        `📊 [层级构建] 第${layerIndex}层: ${layerNodes.length}个节点`,
        layerNodes.map((n) => n.id || n.getId()),
      );

      // 记录节点层级
      layerNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layerIndex);
      });

      // 查找下一层（父节点层）
      const nextLayer = [];
      const candidateParents = new Set();

      layerNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        const parents = this.layoutModel.childParentMap.get(nodeId) || [];

        console.log(`🔗 [层级构建] 节点 ${nodeId} 的父节点:`, parents);

        parents.forEach((parentId) => {
          if (!processedNodes.has(parentId)) {
            candidateParents.add(parentId);
          }
        });
      });

      console.log('🎯 [层级构建] 候选父节点:', Array.from(candidateParents));

      // 验证候选父节点的所有子节点是否都已处理
      candidateParents.forEach((parentId) => {
        const children = this.layoutModel.parentChildMap.get(parentId) || [];

        // 只考虑非endpoint子节点
        const realChildren = children.filter((childId) => {
          const childNode = allNodes.find(
            (n) => (n.id || n.getId()) === childId,
          );
          return childNode && !(childNode.isEndpoint || childNode.isVirtual);
        });

        const allChildrenProcessed = realChildren.every((childId) =>
          processedNodes.has(childId),
        );

        console.log(
          `🔍 [层级构建] 父节点 ${parentId} 的实际子节点:`,
          realChildren,
          `全部处理完成: ${allChildrenProcessed}`,
        );

        if (allChildrenProcessed) {
          const parentNode = allNodes.find(
            (n) => (n.id || n.getId()) === parentId,
          );
          if (parentNode && !(parentNode.isEndpoint || parentNode.isVirtual)) {
            nextLayer.push(parentNode);
            console.log(`✅ [层级构建] 添加父节点 ${parentId} 到下一层`);
          }
        }
      });

      currentLayer = nextLayer;
      layerIndex++;

      // 防止无限循环
      if (layerIndex > 20) {
        console.warn('⚠️ [层级构建] 层级构建超过20层，强制停止');
        break;
      }
    }

    console.log(
      `📊 [层级构建] 初步构建完成，共 ${layers.length} 层，已处理 ${processedNodes.size} 个节点`,
    );

    // 🔍 检查未处理的节点
    const allNodeIds = allNodes
      .filter((node) => !(node.isEndpoint || node.isVirtual))
      .map((node) => node.id || node.getId());
    const unprocessedNodeIds = allNodeIds.filter(
      (nodeId) => !processedNodes.has(nodeId),
    );

    if (unprocessedNodeIds.length > 0) {
      console.warn(
        `⚠️ [层级构建] 发现 ${unprocessedNodeIds.length} 个未处理的节点:`,
        unprocessedNodeIds,
      );

      // 将未处理的节点添加到最后一层
      const unprocessedNodes = allNodes.filter((node) =>
        unprocessedNodeIds.includes(node.id || node.getId()),
      );

      if (layers.length === 0) {
        layers.push([]);
      }
      layers[layers.length - 1].push(...unprocessedNodes);

      unprocessedNodes.forEach((node) => {
        const nodeId = node.id || node.getId();
        processedNodes.add(nodeId);
        nodeToLayer.set(nodeId, layers.length - 1);
      });

      console.log(`🔧 [层级构建] 已将未处理节点添加到第${layers.length - 1}层`);
    }

    // 反转层级顺序（使第0层为顶层）
    layers.reverse();

    console.log('🔄 [层级构建] 层级反转完成，最终层级结构:');
    layers.forEach((layer, index) => {
      console.log(
        `  第${index}层: ${layer.length}个节点`,
        layer.map((n) => n.id || n.getId()),
      );
    });

    // 重新计算层级索引（确保nodeToLayer映射正确）
    this.layoutModel.nodeToLayer = new Map();
    layers.forEach((layer, index) => {
      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        this.layoutModel.nodeToLayer.set(nodeId, index);
      });
    });

    console.log(
      `📋 [层级构建] nodeToLayer映射重建完成，共 ${this.layoutModel.nodeToLayer.size} 个节点`,
    );

    // 🎯 关键修复：重新调整endpoint节点的层级
    this.adjustEndpointLayers(layers, allNodes);

    return layers;
  }

  /**
   * 调整endpoint节点的层级（方案E：增强版本）
   * @param {Array} layers - 分层结果
   * @param {Array} allNodes - 所有节点
   */
  adjustEndpointLayers(layers, allNodes) {
    console.log("🔧 [层级调整] 开始调整endpoint节点层级（增强版本）");

    // 收集所有endpoint节点
    const endpointNodes = allNodes.filter(
      (node) => node.isEndpoint || node.isVirtual,
    );
    console.log(`🔍 [层级调整] 发现 ${endpointNodes.length} 个endpoint节点`);

    // 从layers中移除所有endpoint节点
    layers.forEach((layer, layerIndex) => {
      for (let i = layer.length - 1; i >= 0; i--) {
        const node = layer[i];
        if (node.isEndpoint || node.isVirtual) {
          console.log(
            `🗑️ [层级调整] 从第${layerIndex}层移除endpoint ${node.id || node.getId()}`,
          );
          layer.splice(i, 1);
        }
      }
    });

    let successCount = 0;
    let failureCount = 0;

    // 重新分配endpoint节点到正确的层级
    endpointNodes.forEach((endpointNode) => {
      const endpointId = endpointNode.id || endpointNode.getId();
      console.log(`🔍 [层级调整] 处理endpoint: ${endpointId}`);

      // 🎯 增强：多种方式获取源节点ID
      let sourceNodeId = null;

      // 方式1：直接属性
      if (endpointNode.sourceNodeId) {
        sourceNodeId = endpointNode.sourceNodeId;
        console.log(
          `✅ [层级调整] 通过sourceNodeId找到源节点: ${sourceNodeId}`,
        );
      }
      // 方式2：sourceId属性
      else if (endpointNode.sourceId) {
        sourceNodeId = endpointNode.sourceId;
        console.log(`✅ [层级调整] 通过sourceId找到源节点: ${sourceNodeId}`);
      }
      // 方式3：从ID中解析（针对virtual_endpoint_xxx格式）
      else if (endpointId.includes("virtual_endpoint_")) {
        // 🎯 修复：正确解析virtual_endpoint_endpoint_node_xxx_xxx格式的ID
        if (endpointId.includes("virtual_endpoint_endpoint_")) {
          // 格式：virtual_endpoint_endpoint_node_1754380100151_unmatch_default
          const match = endpointId.match(
            /virtual_endpoint_endpoint_(node_\d+)_/,
          );
          if (match) {
            sourceNodeId = match[1]; // 提取 node_1754380100151
            console.log(`✅ [层级调整] 从ID解析出源节点: ${sourceNodeId}`);
          }
        } else {
          // 其他格式：virtual_endpoint_xxx
          const parts = endpointId.split("_");
          if (parts.length >= 3) {
            sourceNodeId = parts[2]; // virtual_endpoint_[sourceId]_xxx
            console.log(`✅ [层级调整] 从ID解析出源节点: ${sourceNodeId}`);
          }
        }
      }
      // 方式4：从连接关系中查找
      else {
        // 查找指向此endpoint的连接
        const incomingConnections =
          this.layoutModel.childParentMap.get(endpointId) || [];
        if (incomingConnections.length > 0) {
          sourceNodeId = incomingConnections[0]; // 取第一个父节点作为源节点
          console.log(`✅ [层级调整] 从连接关系找到源节点: ${sourceNodeId}`);
        }
      }

      if (sourceNodeId) {
        // 找到源节点的层级
        const sourceNodeLayer = this.layoutModel.nodeToLayer.get(sourceNodeId);
        console.log(
          `🔍 [层级调整] 源节点 ${sourceNodeId} 的层级: ${sourceNodeLayer}`,
        );

        if (sourceNodeLayer !== undefined) {
          const targetLayer = sourceNodeLayer + 1;

          // 确保目标层级存在
          while (layers.length <= targetLayer) {
            layers.push([]);
            console.log(`➕ [层级调整] 创建新层级: 第${layers.length - 1}层`);
          }

          // 将endpoint节点添加到正确的层级
          layers[targetLayer].push(endpointNode);
          this.layoutModel.nodeToLayer.set(endpointId, targetLayer);

          console.log(
            `🎯 [层级调整] endpoint ${endpointId} 从源节点 ${sourceNodeId}(第${sourceNodeLayer}层) 调整到第${targetLayer}层`,
          );
          successCount++;
        } else {
          console.warn(
            `⚠️ [层级调整] endpoint ${endpointId} 的源节点 ${sourceNodeId} 未找到层级信息`,
          );

          // 🔧 紧急回退：将endpoint放到最后一层
          const lastLayerIndex = layers.length - 1;
          if (lastLayerIndex >= 0) {
            layers[lastLayerIndex].push(endpointNode);
            this.layoutModel.nodeToLayer.set(endpointId, lastLayerIndex);
            console.log(
              `🚨 [层级调整] 紧急回退：将endpoint ${endpointId} 放到最后一层(第${lastLayerIndex}层)`,
            );
            successCount++;
          } else {
            // 创建新层级
            layers.push([endpointNode]);
            this.layoutModel.nodeToLayer.set(endpointId, 0);
            console.log(
              `🚨 [层级调整] 紧急回退：为endpoint ${endpointId} 创建新层级(第0层)`,
            );
            successCount++;
          }
        }
      } else {
        console.warn(`⚠️ [层级调整] endpoint ${endpointId} 未找到源节点信息`);

        // 🔧 最终回退：将endpoint放到最后一层
        const lastLayerIndex = Math.max(0, layers.length - 1);
        if (layers.length === 0) {
          layers.push([]);
        }
        layers[lastLayerIndex].push(endpointNode);
        this.layoutModel.nodeToLayer.set(endpointId, lastLayerIndex);
        console.log(
          `🚨 [层级调整] 最终回退：将endpoint ${endpointId} 放到第${lastLayerIndex}层`,
        );
        failureCount++;
      }
    });

    console.log('🔧 [层级调整] endpoint节点层级调整完成');
    console.log(`  ✅ 成功处理: ${successCount} 个`);
    console.log(`  ⚠️ 回退处理: ${failureCount} 个`);
    console.log(`  📊 总计: ${endpointNodes.length} 个endpoint`);

    // 最终验证：确保所有endpoint都有层级信息
    const unassignedEndpoints = endpointNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      return !this.layoutModel.nodeToLayer.has(nodeId);
    });

    if (unassignedEndpoints.length > 0) {
      console.error(
        `❌ [层级调整] 仍有 ${unassignedEndpoints.length} 个endpoint未分配层级:`,
        unassignedEndpoints.map((n) => n.id || n.getId()),
      );
    } else {
      console.log('✅ [层级调整] 所有endpoint都已正确分配层级');
    }
  }

  /**
   * 为每层创建混合节点列表（普通节点+endpoint统一管理）
   * @param {Array} layers - 分层结果
   */
  createMixedLayerNodes(layers) {
    layers.forEach((layer, layerIndex) => {
      const mixedNodes = {
        normalNodes: [],
        endpointNodes: [],
        allNodes: layer,
        layerIndex,
      };

      layer.forEach((node) => {
        if (node.isEndpoint) {
          mixedNodes.endpointNodes.push(node);
        } else {
          mixedNodes.normalNodes.push(node);
        }
      });

      this.layoutModel.mixedLayerNodes.set(layerIndex, mixedNodes);

      console.log(
        `📊 [混合层级] 第${layerIndex}层: ${mixedNodes.normalNodes.length}普通节点 + ${mixedNodes.endpointNodes.length}endpoint节点`,
      );
    });
  }

  /**
   * 自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositions(layerStructure) {
    console.log("🎯 [位置计算] 开始自底向上位置计算");

    const { layers } = layerStructure;
    const positions = new Map();

    // 从最底层开始计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex];
      const isBottomLayer = layerIndex === layers.length - 1;

      if (isBottomLayer) {
        // 最底层：统一排列所有节点（普通+endpoint）
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
      `🎯 [位置计算] 位置计算完成，共计算 ${positions.size} 个节点位置`,
    );

    return positions;
  }

  /**
   * 计算最底层位置（统一排列普通节点和endpoint）
   * @param {Array} bottomLayer - 最底层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   */
  calculateBottomLayerPositions(bottomLayer, positions, layerIndex) {
    const nodeSpacing = this.options.node.preferredSpacing;
    const totalWidth = (bottomLayer.length - 1) * nodeSpacing;
    const startX = -totalWidth / 2;
    const layerY = layerIndex * this.options.layer.baseHeight;

    console.log(
      `📊 [底层定位] 第${layerIndex}层（最底层），目标Y坐标: ${layerY}，节点数: ${bottomLayer.length}`,
    );

    // 🎯 关键：按X坐标排序，确保endpoint和普通节点统一排列
    const sortedNodes = bottomLayer.sort((a, b) => {
      let aPos, bPos;

      // 处理虚拟 endpoint 节点
      if (a.isEndpoint || a.isVirtual) {
        aPos = a.position || a.getPosition() || { x: 0, y: 0 };
      } else if (a.getPosition) {
        aPos = a.getPosition();
      } else {
        aPos = { x: 0, y: 0 };
      }

      if (b.isEndpoint || b.isVirtual) {
        bPos = b.position || b.getPosition() || { x: 0, y: 0 };
      } else if (b.getPosition) {
        bPos = b.getPosition();
      } else {
        bPos = { x: 0, y: 0 };
      }

      console.log(
        `🔍 [排序调试] 节点 ${a.id || a.getId()}: x=${aPos.x} (${a.isEndpoint ? "endpoint" : "normal"}), 节点 ${b.id || b.getId()}: x=${bPos.x} (${b.isEndpoint ? "endpoint" : "normal"})`,
      );

      return aPos.x - bPos.x;
    });

    console.log('📊 [底层排序] 排序后的节点顺序:', sortedNodes.map(node => {
        const nodeId = node.id || node.getId();
        const pos =
          node.isEndpoint || node.isVirtual
            ? node.position || node.getPosition() || { x: 0, y: 0 }
            : node.getPosition
              ? node.getPosition()
              : { x: 0, y: 0 };
        return `${nodeId}(${node.isEndpoint ? "endpoint" : "normal"}, x=${pos.x})`;
      }),
    );

    // 🎯 关键：统一分配位置，不再依赖原始位置
    sortedNodes.forEach((node, index) => {
      const nodeId = node.id || node.getId();
      const finalX = startX + index * nodeSpacing;

      // 获取原始位置用于记录
      let originalPos;
      if (node.isEndpoint || node.isVirtual) {
        originalPos = node.position || node.getPosition() || { x: 0, y: 0 };
      } else if (node.getPosition) {
        originalPos = node.getPosition();
      } else {
        originalPos = { x: 0, y: 0 };
      }

      const positionData = {
        x: finalX,
        y: layerY, // 🎯 关键修复：强制使用层级计算的Y坐标，确保同层所有节点Y坐标一致
        layerIndex,
        isBottomLayer: true,
        nodeType: node.isEndpoint ? "endpoint" : "normal",
        originalX: originalPos.x,
        originalY: originalPos.y, // 记录原始Y坐标用于调试
        sortIndex: index, // 添加排序索引用于调试
      };

      positions.set(nodeId, positionData);

      console.log(
        `📍 [底层定位] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${nodeId}: (${finalX.toFixed(1)}, ${layerY}), 原始位置: (${originalPos.x}, ${originalPos.y}), 排序索引: ${index}`,
      );

      // 🎯 关键修复：对于虚拟endpoint节点，立即同步其内部位置
      if (node.isEndpoint && node.setPosition) {
        node.setPosition({ x: finalX, y: layerY });
        console.log(
          `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步: (${finalX.toFixed(1)}, ${layerY})`,
        );
      }
    });

    console.log(
      `📊 [底层定位] 最底层位置计算完成，共处理 ${sortedNodes.length} 个节点`,
    );
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
    const layerY = layerIndex * this.options.layer.baseHeight;
    console.log(
      `📍 [父层定位] 第${layerIndex}层，目标Y坐标: ${layerY}，父节点数: ${parentLayer.length}`,
    );

    // 🎯 关键修复：分别处理有子节点和无子节点的节点
    const nodesWithChildren = [];
    const nodesWithoutChildren = [];

    parentLayer.forEach((parentNode) => {
      const parentId = parentNode.id || parentNode.getId();
      const children = layerStructure.parentChildMap.get(parentId) || [];

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
        y: layerY,
        layerIndex,
        nodeType: node.isEndpoint ? "endpoint" : "normal",
        childrenCount: childPositions.length,
        childrenSpread: this.calculateChildrenSpread(childPositions),
      };

      positions.set(parentId, positionData);

      console.log(
        `📍 [父层定位] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${parentId}: (${parentX.toFixed(1)}, ${layerY}), 子节点数: ${childPositions.length}`,
      );
    });

    // 第二步：处理无子节点的节点（通常是endpoint节点）
    if (nodesWithoutChildren.length > 0) {
      console.log(
        `📍 [父层定位] 处理 ${nodesWithoutChildren.length} 个无子节点的节点`,
      );

      // 获取已分配位置的节点X坐标范围
      const existingPositions = Array.from(positions.values())
        .filter((pos) => pos.layerIndex === layerIndex)
        .map((pos) => pos.x);

      let startX = 0;
      if (existingPositions.length > 0) {
        const maxX = Math.max(...existingPositions);
        startX = maxX + this.options.node.preferredSpacing;
      }

      // 为无子节点的节点分配X坐标
      nodesWithoutChildren.forEach((node, index) => {
        const parentId = node.id || node.getId();
        const nodeX = startX + index * this.options.node.preferredSpacing;

        const positionData = {
          x: nodeX,
          y: layerY,
          layerIndex,
          nodeType: node.isEndpoint ? "endpoint" : "normal",
          childrenCount: 0,
          childrenSpread: 0,
          isOrphanNode: true, // 标记为孤立节点
        };

        positions.set(parentId, positionData);

        console.log(
          `📍 [父层定位] ${node.isEndpoint ? "Endpoint" : "普通节点"} ${parentId}: (${nodeX.toFixed(1)}, ${layerY}), 孤立节点`,
        );

        // 🎯 关键修复：对于虚拟endpoint节点，立即同步其内部位置
        if (node.isEndpoint && node.setPosition) {
          node.setPosition({ x: nodeX, y: layerY });
          console.log(
            `🎯 [同步修复] 虚拟endpoint ${parentId} 内部位置已同步: (${nodeX.toFixed(1)}, ${layerY})`,
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
    const childXCoords = childPositions.map((pos) => pos.x);

    if (childXCoords.length === 1) {
      // 单个子节点：直接对齐
      return childXCoords[0];
    } else if (childXCoords.length === 2) {
      // 两个子节点：中心点
      return (childXCoords[0] + childXCoords[1]) / 2;
    } else {
      // 多个子节点：加权中心
      const minX = Math.min(...childXCoords);
      const maxX = Math.max(...childXCoords);
      const centerX =
        childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length;

      // 混合策略：中心点权重70%，边界中心权重30%
      return centerX * 0.7 + ((minX + maxX) / 2) * 0.3;
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
   * 层级内统一优化（普通节点+endpoint）
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 优化后的位置映射
   */
  async optimizeUnifiedLayerAlignment(positions, layerStructure) {
    console.log("🔧 [统一优化] 开始层级内统一优化");

    let totalAdjustments = 0;

    // 对每一层进行统一优化
    for (
      let layerIndex = 0;
      layerIndex < layerStructure.layers.length;
      layerIndex++
    ) {
      const mixedNodes = this.layoutModel.mixedLayerNodes.get(layerIndex);

      if (mixedNodes && mixedNodes.allNodes.length > 1) {
        // 🎯 关键：统一处理该层的所有节点（普通+endpoint）
        const layerAdjustments = await this.optimizeSingleLayerUnified(
          mixedNodes,
          positions,
          layerStructure,
        );
        totalAdjustments += layerAdjustments;
      }
    }

    console.log(
      `🔧 [统一优化] 优化完成，共调整 ${totalAdjustments} 个节点位置`,
    );

    return positions;
  }

  /**
   * 优化单层的统一排列（普通节点+endpoint）
   * @param {Object} mixedNodes - 混合节点数据
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  async optimizeSingleLayerUnified(mixedNodes, positions, layerStructure) {
    const { allNodes, layerIndex } = mixedNodes;

    // 第一步：解决节点重叠
    const overlapAdjustments = this.resolveNodeOverlaps(allNodes, positions);

    // 第二步：优化父子对齐（考虑endpoint）
    const alignmentAdjustments = this.optimizeParentChildAlignment(
      allNodes,
      positions,
      layerStructure,
    );

    // 🎯 关键修复：层级居中对齐放在最后执行，确保不被其他优化覆盖
    const centerAdjustments = this.centerAlignLayer(allNodes, positions);

    const totalAdjustments =
      overlapAdjustments + alignmentAdjustments + centerAdjustments;

    console.log(
      `🔧 [单层优化] 第${layerIndex}层优化完成，总调整 ${totalAdjustments} 次`,
    );
    console.log(
      `  📊 [优化详情] 重叠解决: ${overlapAdjustments}, 父子对齐: ${alignmentAdjustments}, 层级居中: ${centerAdjustments}`,
    );

    return totalAdjustments;
  }

  /**
   * 解决节点重叠
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  resolveNodeOverlaps(layerNodes, positions) {
    const minSpacing = this.options.node.minSpacing;
    let adjustments = 0;

    // 🎯 关键修复：过滤掉没有位置信息的节点，避免TypeError
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          `⚠️ [重叠解决] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log('📊 [重叠解决] 没有有效节点需要处理重叠');
      return 0;
    }

    console.log(`📊 [重叠解决] 开始处理 ${validNodes.length} 个节点的重叠问题`);

    // 按X坐标排序
    const sortedNodes = validNodes.sort((a, b) => {
      const aPos = positions.get(a.id || a.getId());
      const bPos = positions.get(b.id || b.getId());
      // 现在可以安全访问，因为已经过滤了无效节点
      return aPos.x - bPos.x;
    });

    // 打印排序后的节点信息
    console.log('📊 [重叠解决] 排序后的节点:', sortedNodes.map(node => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return `${nodeId}(${node.isEndpoint ? "endpoint" : "normal"}, x=${pos.x.toFixed(1)})`;
      }),
    );

    // 从左到右检查并调整重叠
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i];
      const prevNode = sortedNodes[i - 1];

      const currentPos = positions.get(currentNode.id || currentNode.getId());
      const prevPos = positions.get(prevNode.id || prevNode.getId());

      const requiredSpacing = minSpacing;
      const actualSpacing = currentPos.x - prevPos.x;

      if (actualSpacing < requiredSpacing) {
        const adjustment = requiredSpacing - actualSpacing;
        const oldX = currentPos.x;
        currentPos.x += adjustment;
        adjustments++;

        console.log(
          `🔧 [重叠解决] 调整节点 ${currentNode.id || currentNode.getId()}: ${oldX.toFixed(1)} -> ${currentPos.x.toFixed(1)} (+${adjustment.toFixed(1)}px)`,
        );

        // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
        if (currentNode.isEndpoint && currentNode.setPosition) {
          currentNode.setPosition({ x: currentPos.x, y: currentPos.y });
          console.log(
            `🎯 [同步修复] 虚拟endpoint ${currentNode.id || currentNode.getId()} 内部位置已同步: (${currentPos.x.toFixed(1)}, ${currentPos.y})`,
          );
        }
      }
    }

    console.log(`📊 [重叠解决] 重叠解决完成，共调整 ${adjustments} 个节点`);

    return adjustments;
  }

  /**
   * 优化父子对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  optimizeParentChildAlignment(layerNodes, positions, layerStructure) {
    let adjustments = 0;
    const alignmentThreshold = 50; // 对齐阈值

    layerNodes.forEach((node) => {
      const nodeId = node.id || node.getId();
      const nodePos = positions.get(nodeId);

      // 🎯 关键修复：检查节点位置是否存在
      if (!nodePos) {
        console.warn(
          `⚠️ [父子对齐] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return;
      }

      const children = layerStructure.parentChildMap.get(nodeId) || [];

      if (children.length > 0) {
        const childPositions = children
          .map((childId) => positions.get(childId))
          .filter((pos) => pos !== undefined);

        if (childPositions.length > 0) {
          const optimalX = this.calculateOptimalParentPosition(childPositions);
          const currentX = nodePos.x;

          // 如果调整幅度在合理范围内，则进行调整
          if (Math.abs(optimalX - currentX) <= alignmentThreshold) {
            nodePos.x = optimalX;
            adjustments++;

            console.log(
              `🔧 [父子对齐] 调整节点 ${nodeId}: ${currentX} -> ${optimalX}`,
            );
          }
        }
      }
    });

    return adjustments;
  }

  /**
   * 层级居中对齐 - 增强版
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) return 0;

    // 🎯 关键修复：过滤掉没有位置信息的节点
    const validNodes = layerNodes.filter((node) => {
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);
      if (!pos) {
        console.warn(
          `⚠️ [层级居中] 节点 ${nodeId} 在positions中不存在，跳过处理`,
        );
        return false;
      }
      return true;
    });

    if (validNodes.length === 0) {
      console.log('📊 [层级居中] 没有有效节点需要居中对齐');
      return 0;
    }

    // 🎯 高优先级修复：单节点层级强制居中处理 (阈值降至0.1px)
    if (validNodes.length === 1) {
      const node = validNodes[0];
      const nodeId = node.id || node.getId();
      const pos = positions.get(nodeId);

      // 对于单节点，强制居中到 x=0，使用极低阈值确保精确居中
      if (Math.abs(pos.x) > 0.1) {
        const oldX = pos.x;
        pos.x = 0;
        console.log(
          `🎯 [单节点强制居中] 节点 ${nodeId}: ${oldX.toFixed(1)} → 0.0 (强制居中)`,
        );

        // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
        if (node.isEndpoint && node.setPosition) {
          node.setPosition({ x: 0, y: pos.y });
          console.log(
            `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步到居中位置`,
          );
        }

        return 1;
      } else {
        console.log(
          `✅ [单节点居中] 节点 ${nodeId}: 已精确居中 (${pos.x.toFixed(1)})`,
        );
        return 0;
      }
    }

    // 🎯 中优先级修复：多节点层级对称分布优化
    return this.optimizeMultiNodeSymmetricDistribution(validNodes, positions);
  }

  /**
   * 优化多节点层级对称分布 - 新增方法
   * @param {Array} validNodes - 有效节点数组
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  optimizeMultiNodeSymmetricDistribution(validNodes, positions) {
    const nodeCount = validNodes.length;
    let adjustments = 0;

    console.log(`🔧 [多节点对称分布] 开始优化 ${nodeCount} 个节点的对称分布`);

    // 获取当前X坐标并排序
    const nodePositions = validNodes
      .map((node) => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        return { node, nodeId, pos, x: pos.x };
      })
      .sort((a, b) => a.x - b.x);

    // 根据节点数量采用不同的对称分布策略
    if (nodeCount === 2) {
      // 两节点：对称分布在 -60, +60
      const targetPositions = [-60, 60];
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🔧 [2节点对称] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX} (对称分布)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else if (nodeCount === 3) {
      // 三节点：等间距分布在 -80, 0, +80
      const targetPositions = [-80, 0, 80];
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🔧 [3节点等间距] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX} (等间距居中)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else if (nodeCount === 4) {
      // 四节点：对称分布在 -90, -30, +30, +90
      const targetPositions = [-90, -30, 30, 90];
      nodePositions.forEach((item, index) => {
        const targetX = targetPositions[index];
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🔧 [4节点对称] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX} (对称分布)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
          }
        }
      });
    } else {
      // 多节点（5+）：动态对称分布
      const spacing = Math.min(120, 240 / (nodeCount - 1)); // 动态间距，最大120px
      const totalWidth = (nodeCount - 1) * spacing;
      const startX = -totalWidth / 2;

      nodePositions.forEach((item, index) => {
        const targetX = startX + index * spacing;
        if (Math.abs(item.pos.x - targetX) > 1) {
          const oldX = item.pos.x;
          item.pos.x = targetX;
          adjustments++;
          console.log(
            `🔧 [多节点动态] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetX.toFixed(1)} (动态对称)`,
          );

          // 同步endpoint位置
          if (item.node.isEndpoint && item.node.setPosition) {
            item.node.setPosition({ x: targetX, y: item.pos.y });
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
        if (item.node.isEndpoint && item.node.setPosition) {
          item.node.setPosition({ x: item.pos.x, y: item.pos.y });
        }
      });
      adjustments += nodeCount;
      console.log(
        `🔧 [最终居中] 整体微调偏移 ${offsetX.toFixed(1)}px，确保精确居中`,
      );
    }

    console.log(
      `✅ [多节点对称分布] 优化完成，调整 ${adjustments} 次，节点分布:`,
      nodePositions
        .map((item) => `${item.nodeId}(${item.pos.x.toFixed(1)})`)
        .join(", "),
    );

    return adjustments;
  }

  /**
   * 全局优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 最终位置映射
   */
  async applyGlobalOptimization(positions, layerStructure) {
    console.log("🌍 [全局优化] 开始全局布局优化");

    // 全局优化1：调整层级间距
    this.adjustGlobalLayerSpacing(positions, layerStructure);

    // 全局优化2：整体居中
    this.centerAlignGlobalLayout(positions);

    // 全局优化3：美学优化
    if (this.options.optimization.enableAestheticOptimization) {
      this.applyAestheticOptimizations(positions, layerStructure);
    }

    console.log("🌍 [全局优化] 全局优化完成");

    return positions;
  }

  /**
   * 调整全局层级间距
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  adjustGlobalLayerSpacing(positions, layerStructure) {
    const baseHeight = this.options.layer.baseHeight;
    console.log(
      `🔧 [层级间距] 开始调整全局层级间距，baseHeight: ${baseHeight}`,
    );

    layerStructure.layers.forEach((layer, layerIndex) => {
      const targetY = layerIndex * baseHeight;
      console.log(
        `🔧 [层级间距] 第${layerIndex}层，目标Y坐标: ${targetY}，节点数: ${layer.length}`,
      );

      layer.forEach((node) => {
        const nodeId = node.id || node.getId();
        const pos = positions.get(nodeId);
        if (pos) {
          const oldY = pos.y;
          pos.y = targetY;
          console.log(
            `🔧 [层级间距] 节点 ${nodeId}: Y坐标 ${oldY} → ${targetY}`,
          );

          // 🎯 关键修复：对于虚拟endpoint节点，同步其内部位置
          if (node.isEndpoint && node.setPosition) {
            node.setPosition({ x: pos.x, y: targetY });
            console.log(
              `🎯 [同步修复] 虚拟endpoint ${nodeId} 内部位置已同步到层级Y坐标: ${targetY}`,
            );
          }
        } else {
          console.warn(`⚠️ [层级间距] 节点 ${nodeId} 在positions中不存在`);
        }
      });
    });

    console.log('🔧 [层级间距] 全局层级间距调整完成');
  }

  /**
   * 全局居中对齐 - 增强版，保护局部优化结果
   * @param {Map} positions - 位置映射
   */
  centerAlignGlobalLayout(positions) {
    const allPositions = Array.from(positions.values());

    if (allPositions.length === 0) return;

    // 🎯 修复1：过滤异常位置，避免边界计算错误
    const validPositions = allPositions.filter(pos => {
      const isValid = pos.x !== undefined && pos.y !== undefined && 
                     !isNaN(pos.x) && !isNaN(pos.y) && 
                     Math.abs(pos.x) < 10000 && Math.abs(pos.y) < 10000;
      if (!isValid) {
        console.warn(`⚠️ [全局居中] 发现异常位置，已过滤:`, pos);
      }
      return isValid;
    });

    if (validPositions.length === 0) {
      console.warn("⚠️ [全局居中] 没有有效位置，跳过全局居中");
      return;
    }

    // 🎯 修复2：记录已优化的对称分布
    const symmetricLayers = new Map();
    positions.forEach((pos, nodeId) => {
      if (pos.layerIndex !== undefined) {
        if (!symmetricLayers.has(pos.layerIndex)) {
          symmetricLayers.set(pos.layerIndex, []);
        }
        symmetricLayers.get(pos.layerIndex).push({ nodeId, pos });
      }
    });

    // 计算安全的边界
    const minX = Math.min(...validPositions.map((pos) => pos.x));
    const maxX = Math.max(...validPositions.map((pos) => pos.x));
    const minY = Math.min(...validPositions.map((pos) => pos.y));

    console.log(
      `🌍 [全局居中] 安全边界计算: minX=${minX.toFixed(1)}, maxX=${maxX.toFixed(1)}, minY=${minY.toFixed(1)} (有效位置数: ${validPositions.length})`,
    );

    // 🎯 修复3：检查边界合理性
    const xRange = maxX - minX;
    if (xRange > 1000) {
      console.warn(`⚠️ [全局居中] X坐标范围异常 (${xRange.toFixed(1)}px)，使用保守偏移`);
      // 使用保守的居中策略
      const conservativeOffsetX = -minX;
      positions.forEach((pos) => {
        if (Math.abs(pos.x) < 500) { // 只调整合理范围内的节点
          pos.x += conservativeOffsetX;
        }
      });
      console.log(`🌍 [全局居中] 保守偏移完成: offsetX=${conservativeOffsetX.toFixed(1)}`);
      return;
    }

    // 正常的居中计算
    const offsetX = -(minX + maxX) / 2;
    const offsetY = -minY;

    console.log(
      `🌍 [全局居中] 偏移量计算: offsetX=${offsetX.toFixed(1)}, offsetY=${offsetY.toFixed(1)}`,
    );

    // 记录偏移前的样本位置
    let sampleCount = 0;
    positions.forEach((pos, nodeId) => {
      if (sampleCount < 3) {
        console.log(
          `🌍 [全局居中] 偏移前节点 ${nodeId}: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`,
        );
        sampleCount++;
      }
    });

    // 应用偏移
    positions.forEach((pos) => {
      pos.x += offsetX;
      pos.y += offsetY;
    });

    // 🎯 修复4：恢复对称分布的相对位置
     symmetricLayers.forEach((layerNodes, layerIndex) => {
       if (layerNodes.length >= 2) {
         // 检查是否为对称分布层
         const xCoords = layerNodes.map((item) => item.pos.x).sort((a, b) => a - b);
         const isSymmetric = this.checkSymmetricDistribution(xCoords);
         
         if (isSymmetric) {
           console.log(`🔧 [对称保护] 第${layerIndex}层检测到对称分布，重新应用对称布局`);
           this.reapplySymmetricDistribution(layerNodes);
         }
       }
     });

    // 🎯 修复5：强制单节点层居中
    symmetricLayers.forEach((layerNodes, layerIndex) => {
      if (layerNodes.length === 1) {
        const singleNode = layerNodes[0];
        if (Math.abs(singleNode.pos.x) > 0.1) {
          console.log(`🎯 [单节点强制居中] 第${layerIndex}层单节点 ${singleNode.nodeId}: ${singleNode.pos.x.toFixed(1)} → 0`);
          singleNode.pos.x = 0;
        }
      }
    });

    // 记录偏移后的样本位置
    sampleCount = 0;
    positions.forEach((pos, nodeId) => {
      if (sampleCount < 3) {
        console.log(
          `🌍 [全局居中] 偏移后节点 ${nodeId}: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`,
        );
        sampleCount++;
      }
    });

    console.log(
      `🌍 [全局居中] 增强居中完成: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`,
    );
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
   */
  reapplySymmetricDistribution(layerNodes) {
    const nodeCount = layerNodes.length;
    let targetPositions = [];
    
    if (nodeCount === 2) {
      targetPositions = [-60, 60];
    } else if (nodeCount === 3) {
      targetPositions = [-80, 0, 80];
    } else if (nodeCount === 4) {
      targetPositions = [-90, -30, 30, 90];
    } else {
      // 动态对称分布
      const spacing = Math.min(120, 240 / (nodeCount - 1));
      const totalWidth = (nodeCount - 1) * spacing;
      const startX = -totalWidth / 2;
      targetPositions = Array.from({length: nodeCount}, (_, i) => startX + i * spacing);
    }
    
    // 按当前X坐标排序
    layerNodes.sort((a, b) => a.pos.x - b.pos.x);
    
    // 应用目标位置
    layerNodes.forEach((item, index) => {
      if (index < targetPositions.length) {
        const oldX = item.pos.x;
        item.pos.x = targetPositions[index];
        console.log(`🔧 [对称恢复] 节点 ${item.nodeId}: ${oldX.toFixed(1)} → ${targetPositions[index]}`);
      }
    });
  }

  /**
   * 美学优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  applyAestheticOptimizations(positions, layerStructure) {
    // 美学优化可以在这里添加更多细节
    console.log("✨ [美学优化] 应用美学优化");
  }

  /**
   * 应用位置到图形
   * @param {Map} finalPositions - 最终位置映射
   */
  async applyPositionsToGraph(finalPositions) {
    console.log("📍 [位置应用] 开始应用位置到图形");

    let appliedCount = 0;
    let endpointCount = 0;

    finalPositions.forEach((position, nodeId) => {
      // 🎯 关键：统一计算中心点位置，确保Y坐标一致
      const centerPosition = {
        x: position.x,
        y: position.y, // 直接使用层级计算的Y坐标
      };

      // 处理普通节点
      const graphNode = this.graph.getCellById(nodeId);
      if (graphNode) {
        const size = graphNode.getSize();
        const topLeftPosition = {
          x: centerPosition.x - size.width / 2,
          y: centerPosition.y - size.height / 2,
        };
        graphNode.setPosition(topLeftPosition);
        appliedCount++;

        console.log(
          `📍 [位置应用] 普通节点 ${nodeId}: 中心点(${centerPosition.x.toFixed(1)}, ${centerPosition.y.toFixed(1)}) 左上角(${topLeftPosition.x.toFixed(1)}, ${topLeftPosition.y.toFixed(1)})`,
        );
        return;
      }

      // 🎯 关键：处理虚拟endpoint节点 - 使用与同层节点相同的Y坐标
      const endpointNode = this.layoutModel.endpointNodes.get(nodeId);
      if (endpointNode) {
        // 🎯 关键修复：虚拟endpoint使用与同层节点相同的Y坐标
        if (endpointNode.setPosition) {
          endpointNode.setPosition(centerPosition);
        } else if (endpointNode.position) {
          endpointNode.position.x = centerPosition.x;
          endpointNode.position.y = centerPosition.y;
        }

        // 🎯 关键：同步更新预览线管理器中的endpoint位置
        this.updatePreviewEndpointPosition(
          endpointNode.sourceNodeId,
          endpointNode.branchId,
          centerPosition,
        );

        endpointCount++;

        console.log(
          `📍 [位置应用] 虚拟Endpoint ${nodeId}: 中心点(${centerPosition.x.toFixed(1)}, ${centerPosition.y.toFixed(1)}) 源节点: ${endpointNode.sourceNodeId} 分支: ${endpointNode.branchId} 层级: ${position.layerIndex}`,
        );
      }
    });

    console.log(
      `📍 [位置应用] 应用完成: ${appliedCount}个普通节点 + ${endpointCount}个虚拟endpoint`,
    );
  }

  /**
   * 生成布局报告
   * @param {Object} layerStructure - 层级结构
   * @param {Map} finalPositions - 最终位置
   * @returns {Object} 布局报告
   */
  generateLayoutReport(layerStructure, finalPositions) {
    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        totalLayers: layerStructure.totalLayers,
        totalNodes: finalPositions.size,
        normalNodes: 0,
        endpointNodes: 0,
        layerDistribution: [],
      },
      performance: {
        executionTime: Date.now() - this.startTime,
        optimizationIterations: this.layoutModel.optimizationHistory.length,
      },
      message: "统一结构化布局执行成功",
    };

    // 统计节点类型分布
    finalPositions.forEach((position, nodeId) => {
      if (position.nodeType === "endpoint") {
        report.statistics.endpointNodes++;
      } else {
        report.statistics.normalNodes++;
      }
    });

    // 统计层级分布
    layerStructure.layers.forEach((layer, index) => {
      const normalCount = layer.filter((n) => !n.isEndpoint).length;
      const endpointCount = layer.filter((n) => n.isEndpoint).length;

      report.statistics.layerDistribution.push({
        layer: index,
        normalNodes: normalCount,
        endpointNodes: endpointCount,
        total: layer.length,
      });
    });

    console.log("📊 [布局报告]", report);

    return report;
  }

  /**
   * 🎯 关键修复：同步所有endpoint位置到预览线管理器
   * @param {Map} finalPositions - 最终位置映射
   */
  syncAllEndpointPositions(finalPositions) {
    console.log("🔄 [批量同步] 开始同步所有endpoint位置到预览线管理器");

    const previewLineManager =
      this.previewLineManager ||
      window.unifiedPreviewLineManager ||
      this.graph.previewLineManager;

    if (!previewLineManager) {
      console.warn("⚠️ [批量同步] 预览线管理器不可用，跳过同步");
      return;
    }

    let syncedCount = 0;

    // 遍历所有endpoint节点
    this.layoutModel.endpointNodes.forEach((endpointNode, nodeId) => {
      const position = finalPositions.get(nodeId);
      if (position) {
        // 强制更新预览线管理器中的对应endpoint位置
        this.updatePreviewEndpointPosition(
          endpointNode.sourceNodeId,
          endpointNode.branchId,
          { x: position.x, y: position.y },
        );
        syncedCount++;

        console.log(
          `🔄 [批量同步] Endpoint ${nodeId}: 源节点=${endpointNode.sourceNodeId}, 分支=${endpointNode.branchId}, 位置=(${position.x.toFixed(1)}, ${position.y.toFixed(1)})`,
        );
      }
    });

    // 🎯 关键修复：强制更新预览线管理器的全局endPosition
    if (
      previewLineManager.endPosition &&
      this.layoutModel.endpointNodes.size > 0
    ) {
      // 使用最后一个endpoint的位置作为全局endPosition
      const lastEndpointPosition = Array.from(finalPositions.values())
        .filter((pos) => pos.nodeType === "endpoint")
        .pop();

      if (lastEndpointPosition) {
        previewLineManager.endPosition.x = lastEndpointPosition.x;
        previewLineManager.endPosition.y = lastEndpointPosition.y;
        console.log(
          `🎯 [全局同步] 预览线管理器全局endPosition已更新: (${lastEndpointPosition.x.toFixed(1)}, ${lastEndpointPosition.y.toFixed(1)})`,
        );
      }
    }

    console.log(`🔄 [批量同步] 同步完成，共处理 ${syncedCount} 个endpoint位置`);
  }

  /**
   * 🎯 新增：验证虚拟endpoint位置映射
   */
  validateEndpointPositions() {
    if (
      !this.layoutModel ||
      !this.layoutModel.nodePositions ||
      !this.layoutModel.endpointNodes
    ) {
      console.warn("⚠️ [位置验证] 布局模型未完全初始化，跳过验证");
      return;
    }

    let missingCount = 0;
    let fixedCount = 0;

    console.log("🔍 [位置验证] 开始验证虚拟endpoint位置映射");

    this.layoutModel.endpointNodes.forEach((endpointNode, nodeId) => {
      if (!this.layoutModel.nodePositions.has(nodeId)) {
        missingCount++;
        console.log(`⚠️ [位置验证] 发现缺失位置映射: ${nodeId}`);

        // 自动补全缺失的位置映射
        const sourcePosition = this.layoutModel.nodePositions.get(
          endpointNode.sourceNodeId,
        );
        if (sourcePosition) {
          const estimatedPosition = {
            x: sourcePosition.x + 150, // 默认水平偏移
            y: sourcePosition.y + 150, // 默认垂直偏移
            nodeType: "endpoint",
            sourceNodeId: endpointNode.sourceNodeId,
            branchId: endpointNode.branchId,
            isVirtual: true,
            isAutoFixed: true,
          };

          this.layoutModel.nodePositions.set(nodeId, estimatedPosition);
          fixedCount++;
          console.log(
            `🔧 [位置修复] 自动补全虚拟endpoint位置: ${nodeId} -> (${estimatedPosition.x}, ${estimatedPosition.y})`,
          );
        } else {
          console.warn(
            `⚠️ [位置修复] 无法找到源节点位置，跳过修复: ${endpointNode.sourceNodeId}`,
          );
        }
      }
    });

    if (missingCount > 0) {
      console.log(
        `🔧 [位置验证] 验证完成 - 发现 ${missingCount} 个缺失位置，已修复 ${fixedCount} 个`,
      );
    } else {
      console.log("✅ [位置验证] 所有虚拟endpoint位置映射正常");
    }

    return { missingCount, fixedCount };
  }
}
