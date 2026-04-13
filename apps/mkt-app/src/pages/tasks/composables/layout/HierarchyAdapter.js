/**
 * HierarchyAdapter - X6节点数据与@antv/hierarchy格式的双向转换适配器
 * 
 * 功能说明：
 * 1. 将X6图形数据转换为@antv/hierarchy所需的层次结构数据
 * 2. 将@antv/hierarchy布局结果转换回X6节点位置数据
 * 3. 处理预览线endpoint虚拟节点的特殊逻辑
 * 4. 保持与现有UnifiedStructuredLayoutEngine的兼容性
 */

export class HierarchyAdapter {
  constructor(options = {}) {
    this.options = {
      // 节点配置
      node: {
        width: 120,
        height: 60,
        spacing: 50,
        endpointSize: { width: 20, height: 20 },
        ...options.node
      },
      // 层级配置
      layer: {
        height: 200,
        spacing: 100,
        ...options.layer
      },
      // 调试模式
      debug: options.debug || false,
      ...options
    };

    // 内部状态
    this.nodeMap = new Map(); // 存储节点ID到节点数据的映射
    this.edgeMap = new Map(); // 存储边数据
    this.endpointMap = new Map(); // 存储预览线endpoint映射
    this.layerMap = new Map(); // 存储节点层级映射
  }

  /**
   * 将X6图形数据转换为@antv/hierarchy格式
   * @param {Object} graphData - X6图形数据 {nodes, edges}
   * @param {Array} previewEndpoints - 预览线endpoint数据
   * @returns {Object} hierarchy格式的数据
   */
  convertToHierarchyData(graphData, previewEndpoints = []) {
    this.log('🔄 [数据转换] 开始转换X6数据到hierarchy格式');
    
    // 🔍 添加详细的输入数据调试日志
    console.log('🔍 [HierarchyAdapter] convertToHierarchyData 输入数据:', {
      graphData: graphData,
      hasNodes: !!graphData?.nodes,
      nodeCount: graphData?.nodes?.length || 0,
      hasEdges: !!graphData?.edges,
      edgeCount: graphData?.edges?.length || 0,
      previewEndpointCount: previewEndpoints?.length || 0
    });
    
    // 清空内部状态
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.endpointMap.clear();
    this.layerMap.clear();

    const { nodes = [], edges = [] } = graphData;
    
    // 🔍 记录解构后的节点数据
    console.log('🔍 [HierarchyAdapter] 解构后的节点数据:', {
      nodeCount: nodes.length,
      firstNode: nodes[0] ? {
        id: nodes[0].id,
        type: nodes[0].type,
        hasGetPosition: typeof nodes[0].getPosition === 'function',
        position: nodes[0].position,
        x: nodes[0].x,
        y: nodes[0].y,
        keys: Object.keys(nodes[0])
      } : null
    });

    // 1. 预处理节点数据
    const processedNodes = this.preprocessNodes(nodes, previewEndpoints);
    
    // 2. 构建层次结构
    const hierarchyData = this.buildHierarchyStructure(processedNodes, edges);
    
    // 3. 添加布局配置
    const result = {
      ...hierarchyData,
      // hierarchy布局配置
      config: {
        direction: 'TB', // 自上而下布局
        nodeSep: this.options.node.spacing,
        rankSep: this.options.layer.height,
        align: 'center'
      }
    };

    this.log('✅ [数据转换] 转换完成', { 
      nodeCount: processedNodes.length, 
      edgeCount: edges.length,
      endpointCount: previewEndpoints.length 
    });

    return result;
  }

  /**
   * 预处理节点数据，仅处理普通节点
   * @param {Array} nodes - X6节点数组
   * @param {Array} previewEndpoints - 预览线endpoint数组（已废弃）
   * @returns {Array} 处理后的节点数组
   */
  preprocessNodes(nodes, previewEndpoints) {
    const processedNodes = [];

    // 处理普通节点
    nodes.forEach(node => {
      const hierarchyNode = this.convertX6NodeToHierarchy(node);
      processedNodes.push(hierarchyNode);
      this.nodeMap.set(node.id, hierarchyNode);
    });

    // 🗑️ [已删除] 预览线endpoint处理已被新的预览线分层策略替代

    this.log('📊 [节点预处理] 完成', {
      普通节点: nodes.length,
      预览线节点: 0, // 不再处理
      总节点数: processedNodes.length
    });

    return processedNodes;
  }

  /**
   * 将X6节点转换为hierarchy格式
   * @param {Object} node - X6节点数据
   * @returns {Object} hierarchy格式节点
   */
  convertX6NodeToHierarchy(node) {
    // 🔍 添加详细的节点数据调试日志
    console.log('🔍 [HierarchyAdapter] 转换X6节点:', {
      nodeId: node.id,
      nodeType: node.type,
      hasGetPosition: typeof node.getPosition === 'function',
      rawPosition: node.position,
      rawX: node.x,
      rawY: node.y,
      nodeKeys: Object.keys(node)
    });
    
    // 获取节点位置和尺寸
    const position = this.getNodePosition(node);
    const size = this.getNodeSize(node);
    const data = this.getNodeData(node);
    
    // 🔍 记录获取到的位置信息
    console.log('📊 [HierarchyAdapter] 节点位置获取结果:', {
      nodeId: node.id,
      position: position,
      positionX: position.x,
      positionY: position.y,
      xType: typeof position.x,
      yType: typeof position.y,
      xIsNaN: isNaN(position.x),
      yIsNaN: isNaN(position.y)
    });
    
    // 🚨 检查并警告NaN坐标
    if (isNaN(position.x) || isNaN(position.y)) {
      console.error('🚨 [HierarchyAdapter] 发现NaN坐标在convertX6NodeToHierarchy阶段!', {
        nodeId: node.id,
        原始节点: node,
        获取的位置: position,
        x值: position.x,
        y值: position.y,
        x是否NaN: isNaN(position.x),
        y是否NaN: isNaN(position.y),
        调用栈: new Error().stack
      });
    }

    return {
      id: node.id,
      // hierarchy需要的基本属性
      data: {
        ...data,
        // 保留原始X6属性
        originalType: node.type || data?.type,
        originalPosition: position,
        originalSize: size,
        // 节点类型标识
        isEndpoint: false,
        isVirtual: false
      },
      // 子节点数组（后续在buildHierarchyStructure中填充）
      children: [],
      // 布局相关属性
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y
    };
  }

  // 🗑️ [已删除] convertEndpointToHierarchy 方法已被新的预览线分层策略替代

  /**
   * 构建层次结构树
   * @param {Array} nodes - 处理后的节点数组
   * @param {Array} edges - 边数组
   * @returns {Object} 层次结构数据
   */
  buildHierarchyStructure(nodes, edges) {
    // 构建邻接表
    const adjacencyList = new Map();
    const inDegree = new Map();
    
    // 初始化
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // 构建连接关系
    edges.forEach(edge => {
      const sourceId = edge.source?.cell || edge.source;
      const targetId = edge.target?.cell || edge.target;
      
      if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
        adjacencyList.get(sourceId).push(targetId);
        inDegree.set(targetId, inDegree.get(targetId) + 1);
      }
    });

    // 🗑️ [已删除] 预览线endpoint的父子关系处理已被新的预览线分层策略替代
    
    console.log('📊 [HierarchyAdapter] 最终邻接表:', Array.from(adjacencyList.entries()));
    console.log('📊 [HierarchyAdapter] 最终入度表:', Array.from(inDegree.entries()));

    // 查找根节点（入度为0的节点）
    const rootNodes = (nodes || []).filter(node => inDegree.get(node.id) === 0);
    
    if (rootNodes.length === 0) {
      this.log('⚠️ [层次结构] 未找到根节点，使用第一个节点作为根节点');
      return nodes.length > 0 ? nodes[0] : null;
    }

    // 构建树结构
    const buildTree = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) {
        this.log('⚠️ [层次结构] 检测到循环依赖:', nodeId);
        return null;
      }
      
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      // 递归构建子节点
      const children = adjacencyList.get(nodeId) || [];
      node.children = (children || [])
        .map(childId => buildTree(childId, new Set(visited)))
        .filter(child => child !== null);

      return node;
    };

    // 如果有多个根节点，创建虚拟根节点
    if (rootNodes.length === 1) {
      return buildTree(rootNodes[0].id);
    } else {
      // 创建虚拟根节点包含所有根节点
      const virtualRoot = {
        id: 'virtual_root',
        data: {
          type: 'virtual_root',
          isVirtual: true
        },
        children: rootNodes.map(root => buildTree(root.id)),
        width: 0,
        height: 0,
        x: 0,
        y: 0
      };
      
      return virtualRoot;
    }
  }

  /**
   * 将@antv/hierarchy布局结果转换回X6位置数据
   * @param {Object} hierarchyResult - hierarchy布局结果
   * @returns {Map} 节点ID到位置的映射
   */
  convertFromHierarchyData(hierarchyResult) {
    this.log('🔄 [位置转换] 开始转换hierarchy结果到X6位置');
    console.log('🔍 [HierarchyAdapter] 输入的hierarchyResult:', hierarchyResult);
    
    // 🔍 详细分析@antv/hierarchy布局算法的输出结果
    console.log('📊 [HierarchyAdapter] @antv/hierarchy输出详细分析:');
    console.log('  - hierarchyResult类型:', typeof hierarchyResult);
    console.log('  - hierarchyResult是否为null:', hierarchyResult === null);
    console.log('  - hierarchyResult是否为undefined:', hierarchyResult === undefined);
    
    if (hierarchyResult) {
      console.log('  - 根节点ID:', hierarchyResult.id);
      console.log('  - 根节点x坐标:', hierarchyResult.x, '类型:', typeof hierarchyResult.x, 'isNaN:', isNaN(hierarchyResult.x));
      console.log('  - 根节点y坐标:', hierarchyResult.y, '类型:', typeof hierarchyResult.y, 'isNaN:', isNaN(hierarchyResult.y));
      console.log('  - 是否有children:', !!hierarchyResult.children);
      console.log('  - children数量:', hierarchyResult.children ? hierarchyResult.children.length : 0);
      
      // 检查前几个子节点的坐标
      if (hierarchyResult.children && hierarchyResult.children.length > 0) {
        console.log('  - 前3个子节点坐标检查:');
        hierarchyResult.children.slice(0, 3).forEach((child, index) => {
          console.log(`    子节点${index}: ID=${child.id}, x=${child.x}(${typeof child.x}), y=${child.y}(${typeof child.y}), xNaN=${isNaN(child.x)}, yNaN=${isNaN(child.y)}`);
        });
      }
      
      // 递归检查所有节点是否有NaN坐标
      const checkNaNCoordinates = (node, path = '') => {
        if (!node) return;
        
        const currentPath = path ? `${path}/${node.id}` : node.id;
        if ((typeof node.x === 'number' && isNaN(node.x)) || (typeof node.y === 'number' && isNaN(node.y))) {
          console.error(`❌ [HierarchyAdapter] 发现NaN坐标! 路径: ${currentPath}, x=${node.x}, y=${node.y}`);
        }
        
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(child => checkNaNCoordinates(child, currentPath));
        }
      };
      
      console.log('🔍 [HierarchyAdapter] 检查@antv/hierarchy输出中的NaN坐标:');
      checkNaNCoordinates(hierarchyResult);
    }
    
    const positionMap = new Map();
    
    // 递归遍历层次结构，提取位置信息
    const extractPositions = (node, depth = 0) => {
      if (!node) return;
      
      const indent = '  '.repeat(depth);
      console.log(`${indent}🔍 [HierarchyAdapter] 处理节点:`, {
        id: node.id,
        x: node.x,
        y: node.y,
        xType: typeof node.x,
        yType: typeof node.y,
        xIsNaN: isNaN(node.x),
        yIsNaN: isNaN(node.y),
        xIsFinite: isFinite(node.x),
        yIsFinite: isFinite(node.y)
      });
      
      // 跳过虚拟根节点
      if (node.id !== 'virtual_root') {
        // 🔧 添加坐标验证和调试日志
        let x = node.x;
        let y = node.y;
        
        // 详细记录原始坐标信息
        console.log(`${indent}📊 [HierarchyAdapter] 节点 ${node.id} 原始坐标:`, {
          原始x值: x,
          原始y值: y,
          x类型: typeof x,
          y类型: typeof y,
          x是否为数字: typeof x === 'number',
          y是否为数字: typeof y === 'number',
          x是否NaN: isNaN(x),
          y是否NaN: isNaN(y),
          x是否有限: isFinite(x),
          y是否有限: isFinite(y)
        });
        
        // 检查并修复无效的X坐标
        if (typeof x !== 'number' || isNaN(x) || !isFinite(x)) {
          console.warn(`⚠️ [HierarchyAdapter] 节点 ${node.id} X坐标无效 (${x})，使用默认值 0`);
          console.log('🔍 [HierarchyAdapter] X坐标异常详情:', {
            id: node.id,
            原始x: node.x,
            x类型: typeof node.x,
            x字符串: String(node.x),
            x转换: Number(node.x),
            节点完整对象: JSON.stringify(node, null, 2)
          });
          x = 0;
        }
        
        // 检查并修复无效的Y坐标
        if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
          console.warn(`⚠️ [HierarchyAdapter] 节点 ${node.id} Y坐标无效 (${y})，使用默认值 0`);
          console.log('🔍 [HierarchyAdapter] Y坐标异常详情:', {
            id: node.id,
            原始y: node.y,
            y类型: typeof node.y,
            y字符串: String(node.y),
            y转换: Number(node.y),
            节点完整对象: JSON.stringify(node, null, 2)
          });
          y = 0;
        }
        
        const position = {
          x: x,
          y: y,
          width: node.width || this.options.node.width,
          height: node.height || this.options.node.height
        };
        
        positionMap.set(node.id, position);
        
        // 记录成功转换的坐标
        console.log(`${indent}✅ [HierarchyAdapter] 节点 ${node.id} 转换完成: (${x}, ${y})`);
        this.log(`📍 [位置转换] 节点 ${node.id}: (${x}, ${y})`);
      }
      
      // 递归处理子节点
      if (node.children && Array.isArray(node.children)) {
        console.log(`${indent}🔄 [HierarchyAdapter] 处理 ${node.children.length} 个子节点`);
        node.children.forEach(child => extractPositions(child, depth + 1));
      }
    };
    
    extractPositions(hierarchyResult);
    
    console.log('🎯 [HierarchyAdapter] 最终位置映射:', Array.from(positionMap.entries()));
    this.log('✅ [位置转换] 转换完成', { 节点数量: positionMap.size });
    
    return positionMap;
  }

  /**
   * 获取节点位置（兼容多种数据格式）
   * @param {Object} node - 节点对象
   * @returns {Object} 位置坐标 {x, y}
   */
  getNodePosition(node) {
    console.log('🔍 [HierarchyAdapter] getNodePosition 开始:', {
      nodeId: node?.id,
      hasGetPosition: typeof node?.getPosition === 'function',
      hasPosition: !!node?.position,
      hasXY: node?.x !== undefined || node?.y !== undefined
    });
    
    let finalPosition;
    
    // X6节点实例方法
    if (node.getPosition && typeof node.getPosition === 'function') {
      const pos = node.getPosition();
      console.log('📊 [HierarchyAdapter] X6实例getPosition结果:', {
        nodeId: node.id,
        position: pos,
        x: pos?.x,
        y: pos?.y,
        xType: typeof pos?.x,
        yType: typeof pos?.y,
        xIsNaN: isNaN(pos?.x),
        yIsNaN: isNaN(pos?.y)
      });
      finalPosition = pos;
    }
    // 直接位置属性
    else if (node.position) {
      const pos = { x: node.position.x || 0, y: node.position.y || 0 };
      console.log('📊 [HierarchyAdapter] position属性结果:', {
        nodeId: node.id,
        rawPosition: node.position,
        finalPosition: pos,
        rawX: node.position.x,
        rawY: node.position.y,
        xType: typeof node.position.x,
        yType: typeof node.position.y,
        xIsNaN: isNaN(node.position.x),
        yIsNaN: isNaN(node.position.y)
      });
      finalPosition = pos;
    }
    // X6配置格式
    else if (typeof node.x === 'number' && typeof node.y === 'number') {
      const pos = { x: node.x, y: node.y };
      console.log('📊 [HierarchyAdapter] x,y属性结果:', {
        nodeId: node.id,
        rawX: node.x,
        rawY: node.y,
        finalPosition: pos,
        xType: typeof node.x,
        yType: typeof node.y,
        xIsNaN: isNaN(node.x),
        yIsNaN: isNaN(node.y)
      });
      finalPosition = pos;
    }
    // 默认位置
    else {
      console.log('⚠️ [HierarchyAdapter] 使用默认位置:', { nodeId: node?.id });
      finalPosition = { x: 0, y: 0 };
    }
    
    // 🔍 记录最终获取的位置
    console.log('📊 [HierarchyAdapter] getNodePosition最终结果:', {
      nodeId: node.id || 'unknown',
      finalPosition: finalPosition,
      x: finalPosition.x,
      y: finalPosition.y,
      xType: typeof finalPosition.x,
      yType: typeof finalPosition.y,
      xIsNaN: isNaN(finalPosition.x),
      yIsNaN: isNaN(finalPosition.y)
    });

    // 🛡️ 坐标验证和回退机制
    const validatedPosition = {
      x: finalPosition.x,
      y: finalPosition.y
    };

    // 验证并修复X坐标
    if (!isFinite(validatedPosition.x) || isNaN(validatedPosition.x)) {
      console.warn('⚠️ [HierarchyAdapter] X坐标无效，使用默认值0:', {
        nodeId: node.id || 'unknown',
        原始X: finalPosition.x,
        修复后X: 0
      });
      validatedPosition.x = 0;
    }

    // 验证并修复Y坐标
    if (!isFinite(validatedPosition.y) || isNaN(validatedPosition.y)) {
      console.warn('⚠️ [HierarchyAdapter] Y坐标无效，使用默认值0:', {
        nodeId: node.id || 'unknown',
        原始Y: finalPosition.y,
        修复后Y: 0
      });
      validatedPosition.y = 0;
    }

    // 🔍 记录验证后的位置
    if (validatedPosition.x !== finalPosition.x || validatedPosition.y !== finalPosition.y) {
      console.log('✅ [HierarchyAdapter] 坐标已验证和修复:', {
        nodeId: node.id || 'unknown',
        原始位置: finalPosition,
        修复后位置: validatedPosition
      });
    }

    return validatedPosition;
  }

  /**
   * 获取节点尺寸（兼容多种数据格式）
   * @param {Object} node - 节点对象
   * @returns {Object} 尺寸 {width, height}
   */
  getNodeSize(node) {
    // X6节点实例方法
    if (node.getSize && typeof node.getSize === 'function') {
      return node.getSize();
    }
    
    // 直接尺寸属性
    if (node.size) {
      return { width: node.size.width || this.options.node.width, height: node.size.height || this.options.node.height };
    }
    
    // X6配置格式
    if (typeof node.width === 'number' && typeof node.height === 'number') {
      return { width: node.width, height: node.height };
    }
    
    // 默认尺寸
    return { width: this.options.node.width, height: this.options.node.height };
  }

  /**
   * 获取节点数据（兼容多种数据格式）
   * @param {Object} node - 节点对象
   * @returns {Object} 节点数据
   */
  getNodeData(node) {
    // X6节点实例方法
    if (node.getData && typeof node.getData === 'function') {
      return node.getData();
    }
    
    // 直接数据属性
    if (node.data) {
      return node.data;
    }
    
    // 从节点属性中提取
    return {
      type: node.type,
      label: node.label,
      ...node
    };
  }

  /**
   * 调试日志输出
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  log(message, data = null) {
    if (this.options.debug) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * 获取适配器统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      nodeCount: this.nodeMap.size,
      edgeCount: this.edgeMap.size,
      endpointCount: this.endpointMap.size,
      layerCount: this.layerMap.size
    };
  }

  /**
   * 重置适配器状态
   */
  reset() {
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.endpointMap.clear();
    this.layerMap.clear();
    this.log('🔄 [适配器] 状态已重置');
  }
}

// 默认导出
export default HierarchyAdapter;