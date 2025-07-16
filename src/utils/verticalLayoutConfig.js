/**
 * 垂直布局配置
 * 用于管理上下结构的连接预览和自动布局
 */
import { 
  BRANCH_SPACING_CONFIG, 
  calculateAdaptiveBranchSpacing, 
  getRecommendedPreviewLength 
} from './branchSpacingConfig.js'

export const VERTICAL_LAYOUT_CONFIG = {
  // 布局方向
  DIRECTION: 'vertical',
  
  // 间距配置
  SPACING: {
    NODE_VERTICAL: 120,      // 节点垂直间距
    NODE_HORIZONTAL: 200,    // 节点水平间距
    BRANCH_HORIZONTAL: 180,  // 分支水平间距（从60增加到180，确保有足够空间放置实体节点）
    PREVIEW_LENGTH: 100,     // 预览线长度（从80增加到100，给节点更多空间）
    SNAP_ZONE: 40,          // 吸附区域半径（从35增加到40，更容易吸附）
    MIN_DISTANCE: 60,       // 最小距离（从50增加到60）
    MIN_BRANCH_SPACING: 150, // 最小分支间距（新增）
    MAX_BRANCH_SPACING: 250  // 最大分支间距（新增）
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
    DIRECTION: 'TB',  // Top to Bottom
    NODE_SEP: 60,     // 节点分离距离
    RANK_SEP: 120,    // 层级分离距离
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
    VERTICAL_ONLY: false,    // 是否只允许垂直连接
    AUTO_ARRANGE: true,      // 是否自动排列
    PREVENT_OVERLAP: true,   // 是否防止重叠
    SMART_ROUTING: true      // 是否智能路由
  }
}

/**
 * 获取节点的垂直布局位置
 * @param {Object} node - 节点
 * @param {number} level - 层级
 * @param {number} index - 在层级中的索引
 * @param {number} totalInLevel - 层级中的总数
 * @returns {Object} 位置坐标
 */
export function getVerticalLayoutPosition(node, level, index, totalInLevel) {
  const config = VERTICAL_LAYOUT_CONFIG
  
  const x = (index - (totalInLevel - 1) / 2) * config.SPACING.NODE_HORIZONTAL
  const y = level * config.SPACING.NODE_VERTICAL
  
  return { x, y }
}

/**
 * 计算分支预览线位置
 * @param {Object} sourceNode - 源节点
 * @param {Array} branches - 分支数组
 * @param {number} branchIndex - 分支索引
 * @returns {Object} 预览线坐标
 */
export function calculateBranchPreviewPosition(sourceNode, branches, branchIndex) {
  const config = VERTICAL_LAYOUT_CONFIG
  const nodePosition = sourceNode.getPosition()
  const nodeSize = sourceNode.getSize()
  const nodeData = sourceNode.getData() || {}
  const nodeType = nodeData.type || nodeData.nodeType
  
  // 从节点底部中心的out端口开始（统一出口）
  const startX = nodePosition.x + nodeSize.width / 2
  const startY = nodePosition.y + nodeSize.height
  
  // 使用新的自适应分支间距计算
  const branchCount = branches.length
  const adaptiveSpacing = calculateAdaptiveBranchSpacing(branchCount, nodeType)
  const previewLength = getRecommendedPreviewLength(branchCount, nodeType)
  
  // 计算分支的水平偏移
  const branchOffset = (branchIndex - (branchCount - 1) / 2) * adaptiveSpacing
  const endX = startX + branchOffset
  const endY = startY + previewLength
  
  console.log('📏 [VerticalLayout] 计算分支预览线位置:', {
    nodeId: sourceNode.id,
    nodeType,
    branchIndex,
    branchCount,
    adaptiveSpacing,
    previewLength,
    start: { x: startX, y: startY, port: 'out' }, // 统一使用out端口
    end: { x: endX, y: endY },
    branchOffset,
    branchLabel: branches[branchIndex]?.label
  })
  
  return {
    start: { 
      x: startX, 
      y: startY,
      port: 'out' // 统一使用out端口作为出口
    },
    end: { 
      x: endX, 
      y: endY,
      port: 'in1' // 指定输入端口
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
 * 计算单个预览线位置
 * @param {Object} sourceNode - 源节点
 * @returns {Object} 预览线坐标
 */
export function calculateSinglePreviewPosition(sourceNode) {
  const config = VERTICAL_LAYOUT_CONFIG
  const nodePosition = sourceNode.getPosition()
  const nodeSize = sourceNode.getSize()
  
  // 从节点底部中心的out端口开始（统一出口）
  const startX = nodePosition.x + nodeSize.width / 2
  const startY = nodePosition.y + nodeSize.height
  
  // 垂直向下延伸
  const endX = startX
  const endY = startY + config.SPACING.PREVIEW_LENGTH
  
  console.log('📏 [VerticalLayout] 计算单一预览线位置:', {
    nodeId: sourceNode.id,
    start: { x: startX, y: startY, port: 'out' }, // 统一使用out端口
    end: { x: endX, y: endY }
  })
  
  return {
    start: { 
      x: startX, 
      y: startY,
      port: 'out' // 统一使用out端口作为出口
    },
    end: { 
      x: endX, 
      y: endY,
      port: 'in1' // 指定输入端口
    },
    snapZone: {
      x: endX,
      y: endY,
      radius: config.SPACING.SNAP_ZONE
    }
  }
}

/**
 * 检查两个节点是否可以垂直连接
 * @param {Object} sourceNode - 源节点
 * @param {Object} targetNode - 目标节点
 * @returns {boolean} 是否可以连接
 */
export function canConnectVertically(sourceNode, targetNode) {
  const sourcePos = sourceNode.getPosition()
  const targetPos = targetNode.getPosition()
  
  // 目标节点应该在源节点下方
  return targetPos.y > sourcePos.y
}

/**
 * 获取最佳吸附位置
 * @param {Object} dragNode - 被拖拽的节点
 * @param {Array} snapTargets - 吸附目标数组
 * @returns {Object|null} 最佳吸附位置
 */
export function getBestSnapPosition(dragNode, snapTargets) {
  const config = VERTICAL_LAYOUT_CONFIG
  const dragPos = dragNode.getPosition()
  const dragSize = dragNode.getSize()
  const dragCenter = {
    x: dragPos.x + dragSize.width / 2,
    y: dragPos.y
  }
  
  let bestSnap = null
  let minDistance = Infinity
  
  snapTargets.forEach(target => {
    const distance = Math.sqrt(
      Math.pow(dragCenter.x - target.x, 2) + 
      Math.pow(dragCenter.y - target.y, 2)
    )
    
    if (distance < config.SNAP_CONFIG.DISTANCE && distance < minDistance) {
      minDistance = distance
      bestSnap = {
        ...target,
        distance
      }
    }
  })
  
  return bestSnap
}

export default VERTICAL_LAYOUT_CONFIG