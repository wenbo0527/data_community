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
    
    // 清空内部状态
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.endpointMap.clear();
    this.layerMap.clear();

    const { nodes = [], edges = [] } = graphData;

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
   * 预处理节点数据，包括普通节点和预览线endpoint
   * @param {Array} nodes - X6节点数组
   * @param {Array} previewEndpoints - 预览线endpoint数组
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

    // 处理预览线endpoint虚拟节点
    previewEndpoints.forEach(endpoint => {
      const hierarchyNode = this.convertEndpointToHierarchy(endpoint);
      processedNodes.push(hierarchyNode);
      this.nodeMap.set(endpoint.id, hierarchyNode);
      this.endpointMap.set(endpoint.id, endpoint);
    });

    this.log('📊 [节点预处理] 完成', {
      普通节点: nodes.length,
      预览线节点: previewEndpoints.length,
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
    // 获取节点位置和尺寸
    const position = this.getNodePosition(node);
    const size = this.getNodeSize(node);
    const data = this.getNodeData(node);

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

  /**
   * 将预览线endpoint转换为hierarchy格式
   * @param {Object} endpoint - 预览线endpoint数据
   * @returns {Object} hierarchy格式节点
   */
  convertEndpointToHierarchy(endpoint) {
    const position = endpoint.position || { x: 0, y: 0 };
    const size = endpoint.size || this.options.node.endpointSize;

    return {
      id: endpoint.id,
      data: {
        type: 'endpoint',
        sourceNodeId: endpoint.sourceNodeId,
        branchId: endpoint.branchId,
        branchLabel: endpoint.branchLabel,
        // 标识属性
        isEndpoint: true,
        isVirtual: true,
        originalPosition: position,
        originalSize: size
      },
      children: [],
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y
    };
  }

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

    // 查找根节点（入度为0的节点）
    const rootNodes = nodes.filter(node => inDegree.get(node.id) === 0);
    
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
      node.children = children
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
    
    const positionMap = new Map();
    
    // 递归遍历层次结构，提取位置信息
    const extractPositions = (node) => {
      if (!node) return;
      
      // 跳过虚拟根节点
      if (node.id !== 'virtual_root') {
        positionMap.set(node.id, {
          x: node.x || 0,
          y: node.y || 0,
          width: node.width || this.options.node.width,
          height: node.height || this.options.node.height
        });
      }
      
      // 递归处理子节点
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => extractPositions(child));
      }
    };
    
    extractPositions(hierarchyResult);
    
    this.log('✅ [位置转换] 转换完成', { 节点数量: positionMap.size });
    
    return positionMap;
  }

  /**
   * 获取节点位置（兼容多种数据格式）
   * @param {Object} node - 节点对象
   * @returns {Object} 位置坐标 {x, y}
   */
  getNodePosition(node) {
    // X6节点实例方法
    if (node.getPosition && typeof node.getPosition === 'function') {
      return node.getPosition();
    }
    
    // 直接位置属性
    if (node.position) {
      return { x: node.position.x || 0, y: node.position.y || 0 };
    }
    
    // X6配置格式
    if (typeof node.x === 'number' && typeof node.y === 'number') {
      return { x: node.x, y: node.y };
    }
    
    // 默认位置
    return { x: 0, y: 0 };
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