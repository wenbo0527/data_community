/**
 * 水平布局配置
 * 用于管理左右结构的连接预览和自动布局
 */
import { 
  BRANCH_SPACING_CONFIG, 
  calculateAdaptiveBranchSpacing, 
  getRecommendedPreviewLength 
} from './branchSpacingConfig.js'

export const HORIZONTAL_LAYOUT_CONFIG = {
  // 布局方向
  DIRECTION: 'horizontal',
  
  // 间距配置
  SPACING: {
    NODE_HORIZONTAL: 200,    // 节点水平间距
    NODE_VERTICAL: 120,      // 节点垂直间距
    BRANCH_VERTICAL: 100,    // 分支垂直间距
    PREVIEW_LENGTH: 150,     // 预览线长度
    ENHANCED_PREVIEW_LENGTH: 200, // 为分流节点提供更长的预览线
    SNAP_ZONE: 40,          // 吸附区域半径
    MIN_DISTANCE: 60,       // 最小距离
    MIN_BRANCH_SPACING: 120, // 最小分支间距
    MAX_BRANCH_SPACING: 180  // 最大分支间距
  },
  
  // 预览线样式
  PREVIEW_STYLES: {
    PERSISTENT: {
      BRANCH: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '8,4',
        opacity: 0.5,
        targetMarker: {
          name: 'circle',
          r: 4,
          fill: '#1890ff'
        }
      },
      SINGLE: {
        stroke: '#52c41a',
        strokeWidth: 2,
        strokeDasharray: '8,4',
        opacity: 0.5,
        targetMarker: {
          name: 'circle',
          r: 4,
          fill: '#52c41a'
        }
      }
    },
    HIGHLIGHT: {
      stroke: '#ff4d4f',
      strokeWidth: 3,
      opacity: 0.8
    },
    SNAP: {
      stroke: '#ff4d4f',
      strokeWidth: 3,
      opacity: 0.9
    }
  },
  
  // 标签样式
  LABEL_STYLES: {
    BRANCH: {
      width: 60,
      height: 20,
      fontSize: 11,
      fill: 'rgba(24, 144, 255, 0.1)',
      stroke: '#1890ff',
      textColor: '#1890ff'
    },
    SINGLE: {
      width: 40,
      height: 18,
      fontSize: 10,
      fill: 'rgba(82, 196, 26, 0.1)',
      stroke: '#52c41a',
      textColor: '#52c41a'
    },
    HIGHLIGHT: {
      opacity: 1.0,
      textColor: '#ff4d4f'
    }
  },
  
  // 自动布局配置
  AUTO_LAYOUT: {
    ENABLED: true,
    ALGORITHM: 'hierarchical',
    DIRECTION: 'LR',  // Left to Right
    NODE_SEP: 60,     // 节点分离距离
    RANK_SEP: 200,    // 层级分离距离
    ALIGN: 'center'   // 对齐方式
  },
  
  // 吸附配置
  SNAP_CONFIG: {
    ENABLED: true,
    DISTANCE: 30,           // 吸附距离
    ANIMATION_DURATION: 200, // 吸附动画时长
    HIGHLIGHT_DURATION: 2000 // 高亮持续时间
  },
  
  // 连接规则
  CONNECTION_RULES: {
    HORIZONTAL_ONLY: false,  // 是否只允许水平连接
    AUTO_ARRANGE: true,      // 是否自动排列
    PREVENT_OVERLAP: true,   // 是否防止重叠
    SMART_ROUTING: true      // 是否智能路由
  }
}

/**
 * 获取节点的水平布局位置
 * @param {Object} node - 节点
 * @param {number} level - 层级
 * @param {number} index - 在层级中的索引
 * @param {number} totalInLevel - 层级中的总数
 * @returns {Object} 位置坐标
 */
export function getHorizontalLayoutPosition(node, level, index, totalInLevel) {
  const config = HORIZONTAL_LAYOUT_CONFIG
  
  const x = level * config.SPACING.NODE_HORIZONTAL
  const y = (index - (totalInLevel - 1) / 2) * config.SPACING.NODE_VERTICAL
  
  return { x, y }
}

/**
 * 计算分支预览线位置（水平方向）
 * @param {Object} sourceNode - 源节点
 * @param {Array} branches - 分支数组
 * @param {number} branchIndex - 分支索引
 * @returns {Object} 预览线坐标
 */
export function calculateHorizontalBranchPreviewPosition(sourceNode, branches, branchIndex) {
  const config = HORIZONTAL_LAYOUT_CONFIG
  const nodePosition = sourceNode.getPosition()
  const nodeSize = (sourceNode && typeof sourceNode.getSize === 'function') ? sourceNode.getSize() : { width: 120, height: 40 }
  const nodeData = sourceNode.getData() || {}
  const nodeType = nodeData.type || nodeData.nodeType
  
  // 安全检查：确保nodeSize有效
  const safeWidth = nodeSize?.width || 120
  const safeHeight = nodeSize?.height || 40
  
  // 从节点右侧中心的out端口开始
  const startX = nodePosition.x + safeWidth
  const startY = nodePosition.y + safeHeight / 2
  
  // 使用自适应分支间距计算
  const branchCount = branches.length
  const adaptiveSpacing = calculateAdaptiveBranchSpacing(branchCount, nodeType)
  const previewLength = getRecommendedPreviewLength(branchCount, nodeType)
  
  // 计算分支的垂直偏移
  const branchOffset = (branchIndex - (branchCount - 1) / 2) * adaptiveSpacing
  const endX = startX + previewLength
  const endY = startY + branchOffset
  
  console.log('📏 [HorizontalLayout] 计算分支预览线位置:', {
    nodeId: sourceNode.id,
    nodeType,
    branchIndex,
    branchCount,
    adaptiveSpacing,
    previewLength,
    start: { x: startX, y: startY, port: 'out' },
    end: { x: endX, y: endY },
    branchOffset,
    branchLabel: branches[branchIndex]?.label
  })
  
  return {
    start: { 
      x: startX, 
      y: startY,
      port: 'out'
    },
    end: { 
      x: endX, 
      y: endY,
      port: 'in'
    },
    snapZone: {
      x: endX,
      y: endY,
      radius: config.SPACING.SNAP_ZONE
    },
    metadata: {
      branchIndex,
      branchCount,
      adaptiveSpacing,
      previewLength,
      nodeType,
      branchLabel: branches[branchIndex]?.label || `分支${branchIndex + 1}`
    }
  }
}

/**
 * 计算单个预览线位置（水平方向）
 * @param {Object} sourceNode - 源节点
 * @returns {Object} 预览线坐标
 */
export function calculateHorizontalSinglePreviewPosition(sourceNode) {
  const config = HORIZONTAL_LAYOUT_CONFIG
  const nodePosition = sourceNode.getPosition()
  const nodeSize = (sourceNode && typeof sourceNode.getSize === 'function') ? sourceNode.getSize() : { width: 120, height: 40 }
  
  // 安全检查：确保nodeSize有效
  const safeWidth = nodeSize?.width || 120
  const safeHeight = nodeSize?.height || 40
  
  // 从节点右侧中心的out端口开始
  const startX = nodePosition.x + safeWidth
  const startY = nodePosition.y + safeHeight / 2
  
  // 水平向右延伸
  const endX = startX + config.SPACING.PREVIEW_LENGTH
  const endY = startY
  
  console.log('📏 [HorizontalLayout] 计算单一预览线位置:', {
    nodeId: sourceNode.id,
    start: { x: startX, y: startY, port: 'out' },
    end: { x: endX, y: endY }
  })
  
  return {
    start: { 
      x: startX, 
      y: startY,
      port: 'out'
    },
    end: { 
      x: endX, 
      y: endY,
      port: 'in'
    },
    snapZone: {
      x: endX,
      y: endY,
      radius: config.SPACING.SNAP_ZONE
    }
  }
}

/**
 * 检查两个节点是否可以水平连接
 * @param {Object} sourceNode - 源节点
 * @param {Object} targetNode - 目标节点
 * @returns {boolean} 是否可以连接
 */
export function canConnectHorizontally(sourceNode, targetNode) {
  const sourcePos = sourceNode.getPosition()
  const targetPos = targetNode.getPosition()
  
  // 目标节点应该在源节点右侧
  return targetPos.x > sourcePos.x
}