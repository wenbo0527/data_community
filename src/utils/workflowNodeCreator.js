import { StringExt } from '@antv/x6';
import { NodeType, PROCESSING_TYPE_LIST, getPortsByType } from './workflowNodeTypes.js';

/**
 * 根据起点计算下游节点的位置信息
 * @param {Node} node 起始节点
 * @param {Graph} graph 画布实例
 * @param {number} dx 水平偏移量
 * @param {number} dy 垂直偏移量
 * @returns {Object} 位置坐标 {x, y}
 */
export const getDownstreamNodePosition = (node, graph, dx = 250, dy = 100) => {
  if (!node || !graph) {
    return { x: 100, y: 100 };
  }

  // 找出画布中以该起始节点为起点的相关边的终点id集合
  const downstreamNodeIdList = [];
  graph.getEdges().forEach((edge) => {
    const sourceId = edge.getSourceCellId();
    const targetId = edge.getTargetCellId();
    if (sourceId === node.id) {
      downstreamNodeIdList.push(targetId);
    }
  });

  // 获取起点的位置信息
  const position = node.getPosition();
  let minX = Infinity;
  let maxY = -Infinity;

  // 遍历所有下游节点，找到合适的位置
  graph.getNodes().forEach((graphNode) => {
    if (downstreamNodeIdList.indexOf(graphNode.id) > -1) {
      const nodePosition = graphNode.getPosition();
      // 找到所有节点中最左侧的节点的x坐标
      if (nodePosition.x < minX) {
        minX = nodePosition.x;
      }
      // 找到所有节点中最下方的节点的y坐标
      if (nodePosition.y > maxY) {
        maxY = nodePosition.y;
      }
    }
  });

  return {
    x: minX !== Infinity ? minX : position.x + dx,
    y: maxY !== -Infinity ? maxY + dy : position.y
  };
};

/**
 * 创建节点并添加到画布
 * @param {string} type 节点类型
 * @param {Graph} graph X6图形实例
 * @param {Object} position 节点位置 {x, y}
 * @param {Object} data 节点数据
 * @returns {Node} 创建的节点
 */
export const createNode = (type, graph, position = { x: 100, y: 100 }, data = {}) => {
  if (!graph || !type) {
    console.warn('Invalid graph instance or node type');
    return null;
  }

  try {
    // 获取同类型节点数量，用于生成唯一名称
    const sameTypeNodes = graph.getNodes().filter(node => {
      const nodeData = node.getData() || {};
      return nodeData?.type === type;
    });

    // 获取节点类型配置
    const typeConfig = PROCESSING_TYPE_LIST.find(item => item.type === type);
    const typeName = typeConfig?.name || type;

    // 生成节点ID
    const nodeId = data.id || `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 获取端口配置
    const ports = getPortsByType(type, nodeId);

    // 创建节点配置
    const nodeConfig = {
      id: nodeId,
      shape: 'workflow-node', // 使用统一的Vue节点组件
      x: position.x,
      y: position.y,
      width: 120,
      height: 60,
      ports,
      data: {
        type,
        name: data.name || `${typeName}_${sameTypeNodes.length + 1}`,
        config: data.config || {},
        status: data.status || 'default',
        ...data
      }
    };

    // 添加节点到画布
    const node = graph.addNode(nodeConfig);
    
    console.log(`Created node: ${nodeId} of type: ${type}`);
    return node;
  } catch (error) {
    console.error('Error creating node:', error);
    return null;
  }
};

/**
 * 创建边并添加到画布
 * @param {string} source 源节点ID
 * @param {string} target 目标节点ID
 * @param {Graph} graph 画布实例
 * @returns {Edge} 创建的边实例
 */
export const createEdge = (source, target, graph) => {
  if (!graph || !source || !target) {
    console.warn('Graph, source and target are required to create edge');
    return null;
  }

  const edgeConfig = {
    id: StringExt.uuid(),
    shape: 'workflow-edge', // 使用自定义边形状
    source: {
      cell: source,
      port: `${source}-out`
    },
    target: {
      cell: target,
      port: `${target}-in`
    },
    zIndex: -1,
    data: {
      source,
      target
    },
    attrs: {
      line: {
        stroke: '#A2B1C3',
        strokeWidth: 2,
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8
        }
      }
    }
  };

  const newEdge = graph.addEdge(edgeConfig);
  return newEdge;
};

/**
 * 获取节点类型的填充颜色
 * @param {string} type 节点类型
 * @returns {string} 填充颜色
 */
const getNodeTypeFillColor = (type) => {
  const colorMap = {
    [NodeType.INPUT]: '#e6f7ff',
    [NodeType.FILTER]: '#f6ffed',
    [NodeType.JOIN]: '#e6f7ff',
    [NodeType.UNION]: '#fff7e6',
    [NodeType.AGG]: '#f9f0ff',
    [NodeType.OUTPUT]: '#fff1f0'
  };
  return colorMap[type] || '#f5f5f5';
};

/**
 * 获取节点类型的颜色
 * @param {string} type 节点类型
 * @returns {string} 颜色值
 */
const getNodeTypeColor = (type) => {
  const colorMap = {
    [NodeType.INPUT]: '#1890ff',
    [NodeType.FILTER]: '#52c41a',
    [NodeType.JOIN]: '#1890ff',
    [NodeType.UNION]: '#fa8c16',
    [NodeType.AGG]: '#722ed1',
    [NodeType.OUTPUT]: '#f5222d'
  };
  return colorMap[type] || '#1890ff';
};



/**
 * 批量创建节点
 * @param {Array} nodeConfigs 节点配置数组
 * @param {Graph} graph 画布实例
 * @returns {Array} 创建的节点数组
 */
export const createNodes = (nodeConfigs, graph) => {
  if (!Array.isArray(nodeConfigs) || !graph) {
    console.warn('Node configs array and graph are required');
    return [];
  }

  return nodeConfigs.map(config => {
    return createNode(config.type, graph, config.position);
  }).filter(Boolean);
};

/**
 * 批量创建边
 * @param {Array} edgeConfigs 边配置数组
 * @param {Graph} graph 画布实例
 * @returns {Array} 创建的边数组
 */
export const createEdges = (edgeConfigs, graph) => {
  if (!Array.isArray(edgeConfigs) || !graph) {
    console.warn('Edge configs array and graph are required');
    return [];
  }

  return edgeConfigs.map(config => {
    return createEdge(config.source, config.target, graph);
  }).filter(Boolean);
};

/**
 * 创建下游节点和连接边
 * @param {Node} sourceNode 源节点
 * @param {string} nodeType 要创建的节点类型
 * @param {Graph} graph X6图形实例
 * @returns {Object} 包含创建的节点和边的对象
 */
export const createDownstreamNode = (sourceNode, nodeType, graph) => {
  if (!sourceNode || !nodeType || !graph) {
    console.warn('Invalid parameters for creating downstream node');
    return { node: null, edge: null };
  }

  try {
    // 获取下游节点的位置
    const position = getDownstreamNodePosition(sourceNode, graph);
    
    // 创建新节点
    const newNode = createNode(nodeType, graph, position);
    if (!newNode) {
      console.warn('Failed to create new node');
      return { node: null, edge: null };
    }

    // 创建连接边
    const edge = createEdge(sourceNode.id, newNode.id, graph);
    if (!edge) {
      console.warn('Failed to create edge');
      // 如果边创建失败，删除已创建的节点
      graph.removeNode(newNode.id);
      return { node: null, edge: null };
    }

    return { node: newNode, edge };
  } catch (error) {
    console.error('Error creating downstream node:', error);
    return { node: null, edge: null };
  }
};