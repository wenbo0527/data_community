/**
 * 节点相关类型定义
 * 提供统一布局引擎中节点相关的类型约束和文档
 */

import { PointType, SizeType, BoundingBoxType } from './LayoutTypes.js';

/**
 * 节点类型枚举
 * @typedef {string} NodeType
 */
export const NodeType = {
  /** 普通节点 */
  NORMAL: 'normal',
  /** 根节点 */
  ROOT: 'root',
  /** 叶子节点 */
  LEAF: 'leaf',
  /** 分支节点 */
  BRANCH: 'branch',
  /** 连接器节点 */
  CONNECTOR: 'connector',
  /** 虚拟节点 */
  VIRTUAL: 'virtual',
  /** 组合节点 */
  GROUP: 'group',
  /** 占位节点 */
  PLACEHOLDER: 'placeholder'
};

/**
 * 节点状态枚举
 * @typedef {string} NodeStatus
 */
export const NodeStatus = {
  /** 正常状态 */
  NORMAL: 'normal',
  /** 选中状态 */
  SELECTED: 'selected',
  /** 悬停状态 */
  HOVERED: 'hovered',
  /** 激活状态 */
  ACTIVE: 'active',
  /** 禁用状态 */
  DISABLED: 'disabled',
  /** 隐藏状态 */
  HIDDEN: 'hidden',
  /** 锁定状态 */
  LOCKED: 'locked',
  /** 错误状态 */
  ERROR: 'error'
};

/**
 * 节点形状枚举
 * @typedef {string} NodeShape
 */
export const NodeShape = {
  /** 矩形 */
  RECTANGLE: 'rectangle',
  /** 圆形 */
  CIRCLE: 'circle',
  /** 椭圆 */
  ELLIPSE: 'ellipse',
  /** 菱形 */
  DIAMOND: 'diamond',
  /** 三角形 */
  TRIANGLE: 'triangle',
  /** 六边形 */
  HEXAGON: 'hexagon',
  /** 自定义形状 */
  CUSTOM: 'custom'
};

/**
 * 节点样式类型定义
 * @typedef {Object} NodeStyle
 * @property {string} fill - 填充颜色
 * @property {string} stroke - 边框颜色
 * @property {number} strokeWidth - 边框宽度
 * @property {string} strokeDasharray - 边框虚线样式
 * @property {number} opacity - 透明度
 * @property {Object} text - 文本样式
 * @property {string} text.color - 文本颜色
 * @property {string} text.fontSize - 字体大小
 * @property {string} text.fontFamily - 字体族
 * @property {string} text.fontWeight - 字体粗细
 * @property {string} text.textAlign - 文本对齐
 * @property {Object} shadow - 阴影样式
 * @property {number} shadow.offsetX - 阴影X偏移
 * @property {number} shadow.offsetY - 阴影Y偏移
 * @property {number} shadow.blur - 阴影模糊度
 * @property {string} shadow.color - 阴影颜色
 */
export const NodeStyleType = {
  fill: 'string',
  stroke: 'string',
  strokeWidth: 'number',
  strokeDasharray: 'string',
  opacity: 'number',
  text: {
    color: 'string',
    fontSize: 'string',
    fontFamily: 'string',
    fontWeight: 'string',
    textAlign: 'string'
  },
  shadow: {
    offsetX: 'number',
    offsetY: 'number',
    blur: 'number',
    color: 'string'
  }
};

/**
 * 节点数据类型定义
 * @typedef {Object} NodeData
 * @property {string} id - 节点唯一标识
 * @property {string} label - 节点标签
 * @property {NodeType} type - 节点类型
 * @property {NodeStatus} status - 节点状态
 * @property {NodeShape} shape - 节点形状
 * @property {Point} position - 节点位置
 * @property {Size} size - 节点尺寸
 * @property {NodeStyle} style - 节点样式
 * @property {Object} attrs - 节点属性
 * @property {Object} data - 业务数据
 * @property {string[]} tags - 标签列表
 * @property {Object} metadata - 元数据
 * @property {Date} metadata.createdAt - 创建时间
 * @property {Date} metadata.updatedAt - 更新时间
 * @property {string} metadata.version - 版本号
 * @property {boolean} visible - 是否可见
 * @property {boolean} selectable - 是否可选择
 * @property {boolean} draggable - 是否可拖拽
 * @property {boolean} resizable - 是否可调整大小
 * @property {number} zIndex - 层级索引
 */
export const NodeDataType = {
  id: 'string',
  label: 'string',
  type: 'NodeType',
  status: 'NodeStatus',
  shape: 'NodeShape',
  position: 'Point',
  size: 'Size',
  style: 'NodeStyle',
  attrs: 'Object',
  data: 'Object',
  tags: 'string[]',
  metadata: {
    createdAt: 'Date',
    updatedAt: 'Date',
    version: 'string'
  },
  visible: 'boolean',
  selectable: 'boolean',
  draggable: 'boolean',
  resizable: 'boolean',
  zIndex: 'number'
};

/**
 * 节点层级信息类型定义
 * @typedef {Object} NodeLayerInfo
 * @property {string} nodeId - 节点ID
 * @property {number} layerIndex - 层级索引
 * @property {number} positionInLayer - 在层级中的位置
 * @property {number} depth - 深度
 * @property {string[]} parentIds - 父节点ID列表
 * @property {string[]} childIds - 子节点ID列表
 * @property {string[]} siblingIds - 兄弟节点ID列表
 * @property {boolean} isRoot - 是否为根节点
 * @property {boolean} isLeaf - 是否为叶子节点
 * @property {number} subtreeSize - 子树大小
 */
export const NodeLayerInfoType = {
  nodeId: 'string',
  layerIndex: 'number',
  positionInLayer: 'number',
  depth: 'number',
  parentIds: 'string[]',
  childIds: 'string[]',
  siblingIds: 'string[]',
  isRoot: 'boolean',
  isLeaf: 'boolean',
  subtreeSize: 'number'
};

/**
 * 节点连接信息类型定义
 * @typedef {Object} NodeConnection
 * @property {string} sourceId - 源节点ID
 * @property {string} targetId - 目标节点ID
 * @property {string} edgeId - 边ID
 * @property {string} type - 连接类型
 * @property {string} direction - 连接方向
 * @property {number} weight - 连接权重
 * @property {Object} metadata - 连接元数据
 */
export const NodeConnectionType = {
  sourceId: 'string',
  targetId: 'string',
  edgeId: 'string',
  type: 'string',
  direction: 'string',
  weight: 'number',
  metadata: 'Object'
};

/**
 * 节点约束类型定义
 * @typedef {Object} NodeConstraints
 * @property {Object} position - 位置约束
 * @property {Point} position.min - 最小位置
 * @property {Point} position.max - 最大位置
 * @property {boolean} position.fixed - 是否固定位置
 * @property {Object} size - 尺寸约束
 * @property {Size} size.min - 最小尺寸
 * @property {Size} size.max - 最大尺寸
 * @property {boolean} size.fixed - 是否固定尺寸
 * @property {Object} alignment - 对齐约束
 * @property {string[]} alignment.alignWith - 与哪些节点对齐
 * @property {string} alignment.type - 对齐类型
 * @property {Object} spacing - 间距约束
 * @property {number} spacing.min - 最小间距
 * @property {number} spacing.preferred - 首选间距
 * @property {string[]} avoidOverlap - 避免重叠的节点列表
 */
export const NodeConstraintsType = {
  position: {
    min: 'Point',
    max: 'Point',
    fixed: 'boolean'
  },
  size: {
    min: 'Size',
    max: 'Size',
    fixed: 'boolean'
  },
  alignment: {
    alignWith: 'string[]',
    type: 'string'
  },
  spacing: {
    min: 'number',
    preferred: 'number'
  },
  avoidOverlap: 'string[]'
};

/**
 * 节点组类型定义
 * @typedef {Object} NodeGroup
 * @property {string} id - 组ID
 * @property {string} name - 组名称
 * @property {string[]} nodeIds - 节点ID列表
 * @property {BoundingBox} bounds - 组边界
 * @property {NodeStyle} style - 组样式
 * @property {boolean} collapsed - 是否折叠
 * @property {Object} metadata - 组元数据
 */
export const NodeGroupType = {
  id: 'string',
  name: 'string',
  nodeIds: 'string[]',
  bounds: 'BoundingBox',
  style: 'NodeStyle',
  collapsed: 'boolean',
  metadata: 'Object'
};

/**
 * 节点选择器类型定义
 * @typedef {Object} NodeSelector
 * @property {string[]} ids - 按ID选择
 * @property {NodeType[]} types - 按类型选择
 * @property {string[]} tags - 按标签选择
 * @property {NodeStatus[]} statuses - 按状态选择
 * @property {BoundingBox} bounds - 按边界选择
 * @property {Function} filter - 自定义过滤函数
 */
export const NodeSelectorType = {
  ids: 'string[]',
  types: 'NodeType[]',
  tags: 'string[]',
  statuses: 'NodeStatus[]',
  bounds: 'BoundingBox',
  filter: 'Function'
};

/**
 * 节点变更事件类型定义
 * @typedef {Object} NodeChangeEvent
 * @property {string} type - 事件类型
 * @property {string} nodeId - 节点ID
 * @property {Object} oldValue - 旧值
 * @property {Object} newValue - 新值
 * @property {string} property - 变更的属性
 * @property {Date} timestamp - 时间戳
 * @property {Object} metadata - 事件元数据
 */
export const NodeChangeEventType = {
  type: 'string',
  nodeId: 'string',
  oldValue: 'Object',
  newValue: 'Object',
  property: 'string',
  timestamp: 'Date',
  metadata: 'Object'
};

/**
 * 节点类型验证工具类
 */
export class NodeTypeValidator {
  /**
   * 验证节点数据
   * @param {*} nodeData - 待验证的节点数据
   * @returns {boolean} 是否有效
   */
  static isValidNodeData(nodeData) {
    return nodeData &&
           typeof nodeData.id === 'string' &&
           nodeData.id.length > 0 &&
           typeof nodeData.label === 'string' &&
           Object.values(NodeType).includes(nodeData.type) &&
           Object.values(NodeStatus).includes(nodeData.status) &&
           this.isValidPosition(nodeData.position) &&
           this.isValidSize(nodeData.size);
  }

  /**
   * 验证节点位置
   * @param {*} position - 待验证的位置
   * @returns {boolean} 是否有效
   */
  static isValidPosition(position) {
    return position &&
           typeof position.x === 'number' &&
           typeof position.y === 'number' &&
           !isNaN(position.x) &&
           !isNaN(position.y);
  }

  /**
   * 验证节点尺寸
   * @param {*} size - 待验证的尺寸
   * @returns {boolean} 是否有效
   */
  static isValidSize(size) {
    return size &&
           typeof size.width === 'number' &&
           typeof size.height === 'number' &&
           size.width > 0 &&
           size.height > 0;
  }

  /**
   * 验证节点类型
   * @param {*} type - 待验证的类型
   * @returns {boolean} 是否有效
   */
  static isValidNodeType(type) {
    return Object.values(NodeType).includes(type);
  }

  /**
   * 验证节点状态
   * @param {*} status - 待验证的状态
   * @returns {boolean} 是否有效
   */
  static isValidNodeStatus(status) {
    return Object.values(NodeStatus).includes(status);
  }

  /**
   * 验证节点形状
   * @param {*} shape - 待验证的形状
   * @returns {boolean} 是否有效
   */
  static isValidNodeShape(shape) {
    return Object.values(NodeShape).includes(shape);
  }

  /**
   * 验证节点样式
   * @param {*} style - 待验证的样式
   * @returns {boolean} 是否有效
   */
  static isValidNodeStyle(style) {
    if (!style) return false;
    
    // 基本样式验证
    const hasValidFill = !style.fill || typeof style.fill === 'string';
    const hasValidStroke = !style.stroke || typeof style.stroke === 'string';
    const hasValidStrokeWidth = !style.strokeWidth || (typeof style.strokeWidth === 'number' && style.strokeWidth >= 0);
    const hasValidOpacity = !style.opacity || (typeof style.opacity === 'number' && style.opacity >= 0 && style.opacity <= 1);
    
    return hasValidFill && hasValidStroke && hasValidStrokeWidth && hasValidOpacity;
  }

  /**
   * 验证节点层级信息
   * @param {*} layerInfo - 待验证的层级信息
   * @returns {boolean} 是否有效
   */
  static isValidNodeLayerInfo(layerInfo) {
    return layerInfo &&
           typeof layerInfo.nodeId === 'string' &&
           typeof layerInfo.layerIndex === 'number' &&
           layerInfo.layerIndex >= 0 &&
           typeof layerInfo.positionInLayer === 'number' &&
           layerInfo.positionInLayer >= 0 &&
           typeof layerInfo.depth === 'number' &&
           layerInfo.depth >= 0;
  }
}

/**
 * 节点工具函数
 */
export class NodeUtils {
  /**
   * 创建默认节点数据
   * @param {string} id - 节点ID
   * @param {string} label - 节点标签
   * @returns {NodeData} 默认节点数据
   */
  static createDefaultNodeData(id, label = '') {
    return {
      id,
      label: label || id,
      type: NodeType.NORMAL,
      status: NodeStatus.NORMAL,
      shape: NodeShape.RECTANGLE,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 60 },
      style: {
        fill: '#ffffff',
        stroke: '#cccccc',
        strokeWidth: 1,
        opacity: 1
      },
      attrs: {},
      data: {},
      tags: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      visible: true,
      selectable: true,
      draggable: true,
      resizable: false,
      zIndex: 0
    };
  }

  /**
   * 计算节点中心点
   * @param {NodeData} nodeData - 节点数据
   * @returns {Point} 中心点坐标
   */
  static getNodeCenter(nodeData) {
    return {
      x: nodeData.position.x + nodeData.size.width / 2,
      y: nodeData.position.y + nodeData.size.height / 2
    };
  }

  /**
   * 计算节点边界框
   * @param {NodeData} nodeData - 节点数据
   * @returns {BoundingBox} 边界框
   */
  static getNodeBounds(nodeData) {
    return {
      x: nodeData.position.x,
      y: nodeData.position.y,
      width: nodeData.size.width,
      height: nodeData.size.height,
      centerX: nodeData.position.x + nodeData.size.width / 2,
      centerY: nodeData.position.y + nodeData.size.height / 2
    };
  }

  /**
   * 检查两个节点是否重叠
   * @param {NodeData} node1 - 节点1
   * @param {NodeData} node2 - 节点2
   * @returns {boolean} 是否重叠
   */
  static isNodesOverlapping(node1, node2) {
    const bounds1 = this.getNodeBounds(node1);
    const bounds2 = this.getNodeBounds(node2);
    
    return !(bounds1.x + bounds1.width <= bounds2.x ||
             bounds2.x + bounds2.width <= bounds1.x ||
             bounds1.y + bounds1.height <= bounds2.y ||
             bounds2.y + bounds2.height <= bounds1.y);
  }
}

/**
 * 默认导出所有节点类型定义
 */
export default {
  NodeType,
  NodeStatus,
  NodeShape,
  NodeStyleType,
  NodeDataType,
  NodeLayerInfoType,
  NodeConnectionType,
  NodeConstraintsType,
  NodeGroupType,
  NodeSelectorType,
  NodeChangeEventType,
  NodeTypeValidator,
  NodeUtils
};