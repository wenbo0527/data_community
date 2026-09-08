/**
 * 边（连接线）相关类型定义
 * 提供统一布局引擎中边相关的类型约束和文档
 */

import { PointType } from './LayoutTypes.js';

/**
 * 边类型枚举
 * @typedef {string} EdgeType
 */
export const EdgeType = {
  /** 直线 */
  STRAIGHT: 'straight',
  /** 曲线 */
  CURVED: 'curved',
  /** 折线 */
  POLYLINE: 'polyline',
  /** 贝塞尔曲线 */
  BEZIER: 'bezier',
  /** 正交线 */
  ORTHOGONAL: 'orthogonal',
  /** 圆弧 */
  ARC: 'arc',
  /** 自定义路径 */
  CUSTOM: 'custom'
};

/**
 * 边状态枚举
 * @typedef {string} EdgeStatus
 */
export const EdgeStatus = {
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
  /** 高亮状态 */
  HIGHLIGHTED: 'highlighted',
  /** 错误状态 */
  ERROR: 'error'
};

/**
 * 边方向枚举
 * @typedef {string} EdgeDirection
 */
export const EdgeDirection = {
  /** 无方向 */
  NONE: 'none',
  /** 单向：源到目标 */
  SOURCE_TO_TARGET: 'source-to-target',
  /** 单向：目标到源 */
  TARGET_TO_SOURCE: 'target-to-source',
  /** 双向 */
  BIDIRECTIONAL: 'bidirectional'
};

/**
 * 箭头类型枚举
 * @typedef {string} ArrowType
 */
export const ArrowType = {
  /** 无箭头 */
  NONE: 'none',
  /** 标准箭头 */
  STANDARD: 'standard',
  /** 实心箭头 */
  FILLED: 'filled',
  /** 空心箭头 */
  HOLLOW: 'hollow',
  /** 圆形箭头 */
  CIRCLE: 'circle',
  /** 菱形箭头 */
  DIAMOND: 'diamond',
  /** 三角形箭头 */
  TRIANGLE: 'triangle',
  /** 自定义箭头 */
  CUSTOM: 'custom'
};

/**
 * 边连接点类型枚举
 * @typedef {string} ConnectionPointType
 */
export const ConnectionPointType = {
  /** 中心点 */
  CENTER: 'center',
  /** 顶部 */
  TOP: 'top',
  /** 底部 */
  BOTTOM: 'bottom',
  /** 左侧 */
  LEFT: 'left',
  /** 右侧 */
  RIGHT: 'right',
  /** 左上角 */
  TOP_LEFT: 'top-left',
  /** 右上角 */
  TOP_RIGHT: 'top-right',
  /** 左下角 */
  BOTTOM_LEFT: 'bottom-left',
  /** 右下角 */
  BOTTOM_RIGHT: 'bottom-right',
  /** 自动选择 */
  AUTO: 'auto',
  /** 自定义位置 */
  CUSTOM: 'custom'
};

/**
 * 边样式类型定义
 * @typedef {Object} EdgeStyle
 * @property {string} stroke - 线条颜色
 * @property {number} strokeWidth - 线条宽度
 * @property {string} strokeDasharray - 虚线样式
 * @property {string} strokeLinecap - 线条端点样式
 * @property {string} strokeLinejoin - 线条连接样式
 * @property {number} opacity - 透明度
 * @property {Object} marker - 标记样式
 * @property {ArrowType} marker.start - 起始箭头类型
 * @property {ArrowType} marker.end - 结束箭头类型
 * @property {number} marker.size - 箭头大小
 * @property {string} marker.color - 箭头颜色
 * @property {Object} label - 标签样式
 * @property {string} label.color - 标签颜色
 * @property {string} label.fontSize - 字体大小
 * @property {string} label.fontFamily - 字体族
 * @property {string} label.fontWeight - 字体粗细
 * @property {string} label.backgroundColor - 背景颜色
 * @property {string} label.borderColor - 边框颜色
 * @property {number} label.borderWidth - 边框宽度
 * @property {number} label.padding - 内边距
 * @property {Object} animation - 动画样式
 * @property {string} animation.type - 动画类型
 * @property {number} animation.duration - 动画时长
 * @property {string} animation.easing - 缓动函数
 */
export const EdgeStyleType = {
  stroke: 'string',
  strokeWidth: 'number',
  strokeDasharray: 'string',
  strokeLinecap: 'string',
  strokeLinejoin: 'string',
  opacity: 'number',
  marker: {
    start: 'ArrowType',
    end: 'ArrowType',
    size: 'number',
    color: 'string'
  },
  label: {
    color: 'string',
    fontSize: 'string',
    fontFamily: 'string',
    fontWeight: 'string',
    backgroundColor: 'string',
    borderColor: 'string',
    borderWidth: 'number',
    padding: 'number'
  },
  animation: {
    type: 'string',
    duration: 'number',
    easing: 'string'
  }
};

/**
 * 连接点类型定义
 * @typedef {Object} ConnectionPoint
 * @property {string} nodeId - 节点ID
 * @property {ConnectionPointType} type - 连接点类型
 * @property {Point} position - 连接点位置
 * @property {Point} offset - 位置偏移
 * @property {string} direction - 连接方向
 * @property {Object} constraints - 连接约束
 */
export const ConnectionPointType_Def = {
  nodeId: 'string',
  type: 'ConnectionPointType',
  position: 'Point',
  offset: 'Point',
  direction: 'string',
  constraints: 'Object'
};

/**
 * 路径点类型定义
 * @typedef {Object} PathPoint
 * @property {Point} position - 点位置
 * @property {string} type - 点类型（控制点、锚点等）
 * @property {Object} handles - 控制手柄
 * @property {Point} handles.in - 入控制点
 * @property {Point} handles.out - 出控制点
 */
export const PathPointType = {
  position: 'Point',
  type: 'string',
  handles: {
    in: 'Point',
    out: 'Point'
  }
};

/**
 * 边数据类型定义
 * @typedef {Object} EdgeData
 * @property {string} id - 边唯一标识
 * @property {string} label - 边标签
 * @property {EdgeType} type - 边类型
 * @property {EdgeStatus} status - 边状态
 * @property {EdgeDirection} direction - 边方向
 * @property {string} sourceId - 源节点ID
 * @property {string} targetId - 目标节点ID
 * @property {ConnectionPoint} sourcePoint - 源连接点
 * @property {ConnectionPoint} targetPoint - 目标连接点
 * @property {PathPoint[]} path - 路径点列表
 * @property {EdgeStyle} style - 边样式
 * @property {Object} attrs - 边属性
 * @property {Object} data - 业务数据
 * @property {string[]} tags - 标签列表
 * @property {Object} metadata - 元数据
 * @property {Date} metadata.createdAt - 创建时间
 * @property {Date} metadata.updatedAt - 更新时间
 * @property {string} metadata.version - 版本号
 * @property {boolean} visible - 是否可见
 * @property {boolean} selectable - 是否可选择
 * @property {boolean} interactive - 是否可交互
 * @property {number} zIndex - 层级索引
 * @property {number} weight - 边权重
 * @property {Object} routing - 路由配置
 * @property {string} routing.algorithm - 路由算法
 * @property {Object} routing.options - 路由选项
 */
export const EdgeDataType = {
  id: 'string',
  label: 'string',
  type: 'EdgeType',
  status: 'EdgeStatus',
  direction: 'EdgeDirection',
  sourceId: 'string',
  targetId: 'string',
  sourcePoint: 'ConnectionPoint',
  targetPoint: 'ConnectionPoint',
  path: 'PathPoint[]',
  style: 'EdgeStyle',
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
  interactive: 'boolean',
  zIndex: 'number',
  weight: 'number',
  routing: {
    algorithm: 'string',
    options: 'Object'
  }
};

/**
 * 边路由信息类型定义
 * @typedef {Object} EdgeRouting
 * @property {string} edgeId - 边ID
 * @property {string} algorithm - 路由算法
 * @property {PathPoint[]} computedPath - 计算出的路径
 * @property {Object} constraints - 路由约束
 * @property {string[]} avoidNodes - 避开的节点
 * @property {string[]} avoidEdges - 避开的边
 * @property {number} minDistance - 最小距离
 * @property {boolean} orthogonal - 是否正交
 * @property {Object} performance - 性能信息
 * @property {number} performance.computeTime - 计算时间
 * @property {number} performance.pathLength - 路径长度
 */
export const EdgeRoutingType = {
  edgeId: 'string',
  algorithm: 'string',
  computedPath: 'PathPoint[]',
  constraints: 'Object',
  avoidNodes: 'string[]',
  avoidEdges: 'string[]',
  minDistance: 'number',
  orthogonal: 'boolean',
  performance: {
    computeTime: 'number',
    pathLength: 'number'
  }
};

/**
 * 边约束类型定义
 * @typedef {Object} EdgeConstraints
 * @property {Object} routing - 路由约束
 * @property {string[]} routing.avoidNodes - 避开的节点
 * @property {string[]} routing.avoidEdges - 避开的边
 * @property {number} routing.minDistance - 最小距离
 * @property {boolean} routing.orthogonal - 是否正交
 * @property {Object} style - 样式约束
 * @property {number} style.minWidth - 最小宽度
 * @property {number} style.maxWidth - 最大宽度
 * @property {string[]} style.allowedColors - 允许的颜色
 * @property {Object} interaction - 交互约束
 * @property {boolean} interaction.selectable - 是否可选择
 * @property {boolean} interaction.editable - 是否可编辑
 * @property {boolean} interaction.deletable - 是否可删除
 */
export const EdgeConstraintsType = {
  routing: {
    avoidNodes: 'string[]',
    avoidEdges: 'string[]',
    minDistance: 'number',
    orthogonal: 'boolean'
  },
  style: {
    minWidth: 'number',
    maxWidth: 'number',
    allowedColors: 'string[]'
  },
  interaction: {
    selectable: 'boolean',
    editable: 'boolean',
    deletable: 'boolean'
  }
};

/**
 * 边选择器类型定义
 * @typedef {Object} EdgeSelector
 * @property {string[]} ids - 按ID选择
 * @property {EdgeType[]} types - 按类型选择
 * @property {string[]} tags - 按标签选择
 * @property {EdgeStatus[]} statuses - 按状态选择
 * @property {string[]} sourceIds - 按源节点ID选择
 * @property {string[]} targetIds - 按目标节点ID选择
 * @property {EdgeDirection[]} directions - 按方向选择
 * @property {Function} filter - 自定义过滤函数
 */
export const EdgeSelectorType = {
  ids: 'string[]',
  types: 'EdgeType[]',
  tags: 'string[]',
  statuses: 'EdgeStatus[]',
  sourceIds: 'string[]',
  targetIds: 'string[]',
  directions: 'EdgeDirection[]',
  filter: 'Function'
};

/**
 * 边变更事件类型定义
 * @typedef {Object} EdgeChangeEvent
 * @property {string} type - 事件类型
 * @property {string} edgeId - 边ID
 * @property {Object} oldValue - 旧值
 * @property {Object} newValue - 新值
 * @property {string} property - 变更的属性
 * @property {Date} timestamp - 时间戳
 * @property {Object} metadata - 事件元数据
 */
export const EdgeChangeEventType = {
  type: 'string',
  edgeId: 'string',
  oldValue: 'Object',
  newValue: 'Object',
  property: 'string',
  timestamp: 'Date',
  metadata: 'Object'
};

/**
 * 边类型验证工具类
 */
export class EdgeTypeValidator {
  /**
   * 验证边数据
   * @param {*} edgeData - 待验证的边数据
   * @returns {boolean} 是否有效
   */
  static isValidEdgeData(edgeData) {
    return edgeData &&
           typeof edgeData.id === 'string' &&
           edgeData.id.length > 0 &&
           typeof edgeData.sourceId === 'string' &&
           edgeData.sourceId.length > 0 &&
           typeof edgeData.targetId === 'string' &&
           edgeData.targetId.length > 0 &&
           edgeData.sourceId !== edgeData.targetId &&
           Object.values(EdgeType).includes(edgeData.type) &&
           Object.values(EdgeStatus).includes(edgeData.status) &&
           Object.values(EdgeDirection).includes(edgeData.direction);
  }

  /**
   * 验证连接点
   * @param {*} connectionPoint - 待验证的连接点
   * @returns {boolean} 是否有效
   */
  static isValidConnectionPoint(connectionPoint) {
    return connectionPoint &&
           typeof connectionPoint.nodeId === 'string' &&
           connectionPoint.nodeId.length > 0 &&
           Object.values(ConnectionPointType).includes(connectionPoint.type) &&
           this.isValidPosition(connectionPoint.position);
  }

  /**
   * 验证路径点
   * @param {*} pathPoint - 待验证的路径点
   * @returns {boolean} 是否有效
   */
  static isValidPathPoint(pathPoint) {
    return pathPoint &&
           this.isValidPosition(pathPoint.position) &&
           typeof pathPoint.type === 'string';
  }

  /**
   * 验证位置
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
   * 验证边类型
   * @param {*} type - 待验证的类型
   * @returns {boolean} 是否有效
   */
  static isValidEdgeType(type) {
    return Object.values(EdgeType).includes(type);
  }

  /**
   * 验证边状态
   * @param {*} status - 待验证的状态
   * @returns {boolean} 是否有效
   */
  static isValidEdgeStatus(status) {
    return Object.values(EdgeStatus).includes(status);
  }

  /**
   * 验证边方向
   * @param {*} direction - 待验证的方向
   * @returns {boolean} 是否有效
   */
  static isValidEdgeDirection(direction) {
    return Object.values(EdgeDirection).includes(direction);
  }

  /**
   * 验证箭头类型
   * @param {*} arrowType - 待验证的箭头类型
   * @returns {boolean} 是否有效
   */
  static isValidArrowType(arrowType) {
    return Object.values(ArrowType).includes(arrowType);
  }

  /**
   * 验证边样式
   * @param {*} style - 待验证的样式
   * @returns {boolean} 是否有效
   */
  static isValidEdgeStyle(style) {
    if (!style) return false;
    
    const hasValidStroke = !style.stroke || typeof style.stroke === 'string';
    const hasValidStrokeWidth = !style.strokeWidth || (typeof style.strokeWidth === 'number' && style.strokeWidth >= 0);
    const hasValidOpacity = !style.opacity || (typeof style.opacity === 'number' && style.opacity >= 0 && style.opacity <= 1);
    
    return hasValidStroke && hasValidStrokeWidth && hasValidOpacity;
  }

  /**
   * 验证边路由信息
   * @param {*} routing - 待验证的路由信息
   * @returns {boolean} 是否有效
   */
  static isValidEdgeRouting(routing) {
    return routing &&
           typeof routing.edgeId === 'string' &&
           routing.edgeId.length > 0 &&
           typeof routing.algorithm === 'string' &&
           routing.algorithm.length > 0 &&
           Array.isArray(routing.computedPath);
  }
}

/**
 * 边工具函数
 */
export class EdgeUtils {
  /**
   * 创建默认边数据
   * @param {string} id - 边ID
   * @param {string} sourceId - 源节点ID
   * @param {string} targetId - 目标节点ID
   * @returns {EdgeData} 默认边数据
   */
  static createDefaultEdgeData(id, sourceId, targetId) {
    return {
      id,
      label: '',
      type: EdgeType.STRAIGHT,
      status: EdgeStatus.NORMAL,
      direction: EdgeDirection.SOURCE_TO_TARGET,
      sourceId,
      targetId,
      sourcePoint: {
        nodeId: sourceId,
        type: ConnectionPointType.AUTO,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        direction: 'out',
        constraints: {}
      },
      targetPoint: {
        nodeId: targetId,
        type: ConnectionPointType.AUTO,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        direction: 'in',
        constraints: {}
      },
      path: [],
      style: {
        stroke: '#cccccc',
        strokeWidth: 1,
        opacity: 1,
        marker: {
          start: ArrowType.NONE,
          end: ArrowType.STANDARD,
          size: 8,
          color: '#cccccc'
        }
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
      interactive: true,
      zIndex: 0,
      weight: 1,
      routing: {
        algorithm: 'auto',
        options: {}
      }
    };
  }

  /**
   * 计算边的长度
   * @param {EdgeData} edgeData - 边数据
   * @returns {number} 边长度
   */
  static calculateEdgeLength(edgeData) {
    if (!edgeData.path || edgeData.path.length === 0) {
      // 直线距离
      const dx = edgeData.targetPoint.position.x - edgeData.sourcePoint.position.x;
      const dy = edgeData.targetPoint.position.y - edgeData.sourcePoint.position.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 路径长度
    let length = 0;
    let prevPoint = edgeData.sourcePoint.position;
    
    for (const pathPoint of edgeData.path) {
      const dx = pathPoint.position.x - prevPoint.x;
      const dy = pathPoint.position.y - prevPoint.y;
      length += Math.sqrt(dx * dx + dy * dy);
      prevPoint = pathPoint.position;
    }
    
    // 最后一段到目标点
    const dx = edgeData.targetPoint.position.x - prevPoint.x;
    const dy = edgeData.targetPoint.position.y - prevPoint.y;
    length += Math.sqrt(dx * dx + dy * dy);
    
    return length;
  }

  /**
   * 获取边的中点
   * @param {EdgeData} edgeData - 边数据
   * @returns {Point} 中点坐标
   */
  static getEdgeMidpoint(edgeData) {
    if (!edgeData.path || edgeData.path.length === 0) {
      // 直线中点
      return {
        x: (edgeData.sourcePoint.position.x + edgeData.targetPoint.position.x) / 2,
        y: (edgeData.sourcePoint.position.y + edgeData.targetPoint.position.y) / 2
      };
    }
    
    // 路径中点（按长度计算）
    const totalLength = this.calculateEdgeLength(edgeData);
    const halfLength = totalLength / 2;
    
    let currentLength = 0;
    let prevPoint = edgeData.sourcePoint.position;
    
    for (const pathPoint of edgeData.path) {
      const dx = pathPoint.position.x - prevPoint.x;
      const dy = pathPoint.position.y - prevPoint.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      if (currentLength + segmentLength >= halfLength) {
        const ratio = (halfLength - currentLength) / segmentLength;
        return {
          x: prevPoint.x + dx * ratio,
          y: prevPoint.y + dy * ratio
        };
      }
      
      currentLength += segmentLength;
      prevPoint = pathPoint.position;
    }
    
    // 如果在最后一段
    const dx = edgeData.targetPoint.position.x - prevPoint.x;
    const dy = edgeData.targetPoint.position.y - prevPoint.y;
    const ratio = (halfLength - currentLength) / Math.sqrt(dx * dx + dy * dy);
    
    return {
      x: prevPoint.x + dx * ratio,
      y: prevPoint.y + dy * ratio
    };
  }

  /**
   * 检查边是否与矩形区域相交
   * @param {EdgeData} edgeData - 边数据
   * @param {Object} rect - 矩形区域 {x, y, width, height}
   * @returns {boolean} 是否相交
   */
  static isEdgeIntersectingRect(edgeData, rect) {
    // 简化实现：检查边的端点和路径点是否在矩形内
    const points = [
      edgeData.sourcePoint.position,
      edgeData.targetPoint.position,
      ...(edgeData.path || []).map(p => p.position)
    ];
    
    return points.some(point => 
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }
}

/**
 * 默认导出所有边类型定义
 */
export default {
  EdgeType,
  EdgeStatus,
  EdgeDirection,
  ArrowType,
  ConnectionPointType,
  EdgeStyleType,
  ConnectionPointType_Def,
  PathPointType,
  EdgeDataType,
  EdgeRoutingType,
  EdgeConstraintsType,
  EdgeSelectorType,
  EdgeChangeEventType,
  EdgeTypeValidator,
  EdgeUtils
};