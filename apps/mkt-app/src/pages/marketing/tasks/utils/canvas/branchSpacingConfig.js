/**
 * 分流节点间距配置
 * 专门管理分流节点的预览线和实体节点间距设置
 */

export const BRANCH_SPACING_CONFIG = {
  // 基础间距设置 - 🔧 增强修复：大幅增加间距防止重叠
  BASE_SPACING: {
    HORIZONTAL: 280,        // 🔧 增强修复：基础水平间距从220增加到280，确保充足间距
    VERTICAL: 100,          // 垂直间距（预览线长度）
    MIN_SPACING: 250,       // 🔧 增强修复：最小间距从200增加到250，强制防重叠
    MAX_SPACING: 350        // 🔧 增强修复：最大间距从250增加到350，允许更大布局
  },
  
  // 节点尺寸配置 - 🔧 增强修复：增加安全间隙
  NODE_DIMENSIONS: {
    STANDARD_WIDTH: 120,    // 标准节点宽度
    STANDARD_HEIGHT: 80,    // 标准节点高度
    MIN_GAP: 50,           // 🔧 增强修复：节点间最小间隙从30增加到50
    SAFE_MARGIN: 60        // 🔧 增强修复：安全边距从40增加到60
  },
  
  // 自适应间距规则
  ADAPTIVE_RULES: {
    // 根据分支数量调整间距的规则
    BRANCH_COUNT_FACTOR: 15,  // 每增加一个分支减少的间距
    MIN_BRANCHES_FOR_ADAPTIVE: 3, // 开始自适应调整的最小分支数
    MAX_BRANCHES_OPTIMAL: 5,  // 最优显示的最大分支数
    
    // 特殊情况处理
    SINGLE_BRANCH_OFFSET: 0,  // 单分支时的偏移量
    TWO_BRANCH_SPACING: 200,  // 双分支时的固定间距
    MANY_BRANCHES_MIN: 140    // 多分支时的最小间距
  },
  
  // 预览线配置
  PREVIEW_LINE: {
    LENGTH: 100,            // 预览线长度
    SNAP_ZONE_RADIUS: 40,   // 吸附区域半径
    EXTENSION_LENGTH: 20    // 预览线延伸长度
  },
  
  // 分支类型特定配置 - 🔧 增强修复：大幅增加各类型间距
  BRANCH_TYPE_CONFIG: {
    'audience-split': {
      minSpacing: 220,      // 🔧 增强修复：人群分流最小间距从160增加到220
      optimalSpacing: 280,  // 🔧 增强修复：人群分流最优间距从200增加到280
      maxBranches: 6        // 最大分支数
    },
    'event-split': {
      minSpacing: 240,      // 🔧 增强修复：事件分流最小间距从180增加到240
      optimalSpacing: 300,  // 🔧 增强修复：事件分流最优间距从220增加到300
      maxBranches: 2        // 最大分支数（是/否）
    },
    'ab-test': {
      minSpacing: 230,      // 🔧 增强修复：A/B测试最小间距从170增加到230
      optimalSpacing: 290,  // 🔧 增强修复：A/B测试最优间距从210增加到290
      maxBranches: 4        // 最大分支数
    }
  }
}

/**
 * 计算自适应分支间距
 * @param {number} branchCount - 分支数量
 * @param {string} nodeType - 节点类型
 * @returns {number} 计算出的间距
 */
export function calculateAdaptiveBranchSpacing(branchCount, nodeType = 'default') {
  const config = BRANCH_SPACING_CONFIG
  const typeConfig = config.BRANCH_TYPE_CONFIG[nodeType]
  
  // 获取基础配置
  const baseSpacing = typeConfig?.optimalSpacing || config.BASE_SPACING.HORIZONTAL
  const minSpacing = typeConfig?.minSpacing || config.BASE_SPACING.MIN_SPACING
  const maxSpacing = config.BASE_SPACING.MAX_SPACING
  
  // 计算节点最小间距（考虑节点宽度）
  const nodeMinSpacing = config.NODE_DIMENSIONS.STANDARD_WIDTH + config.NODE_DIMENSIONS.MIN_GAP
  
  let adaptiveSpacing = baseSpacing
  
  if (branchCount === 1) {
    // 单分支情况
    adaptiveSpacing = baseSpacing
  } else if (branchCount === 2) {
    // 双分支情况 - 确保不小于最小间距
    adaptiveSpacing = Math.max(minSpacing, config.ADAPTIVE_RULES.TWO_BRANCH_SPACING)
  } else if (branchCount >= config.ADAPTIVE_RULES.MIN_BRANCHES_FOR_ADAPTIVE) {
    // 多分支自适应
    const reduction = (branchCount - 2) * config.ADAPTIVE_RULES.BRANCH_COUNT_FACTOR
    adaptiveSpacing = Math.max(
      Math.max(minSpacing, nodeMinSpacing, config.ADAPTIVE_RULES.MANY_BRANCHES_MIN),
      Math.min(maxSpacing, baseSpacing - reduction)
    )
  }
  
  // 🔧 关键修复：确保最终间距不小于配置的最小值
  const finalSpacing = Math.max(minSpacing, adaptiveSpacing)
  
  console.log(`[BranchSpacing] 计算自适应间距:`, {
    branchCount,
    nodeType,
    baseSpacing,
    minSpacing,
    nodeMinSpacing,
    adaptiveSpacing,
    finalSpacing,
    enforced: finalSpacing > adaptiveSpacing ? '✅ 强制最小间距' : '✅ 正常间距',
    typeConfig: typeConfig || 'default'
  })
  
  return finalSpacing
}

/**
 * 获取分支布局的总宽度
 * @param {number} branchCount - 分支数量
 * @param {number} spacing - 分支间距
 * @returns {number} 总宽度
 */
export function getBranchLayoutTotalWidth(branchCount, spacing) {
  if (branchCount <= 1) return 0
  return (branchCount - 1) * spacing
}

/**
 * 检查分支布局是否会导致重叠
 * @param {Array} positions - 分支位置数组
 * @param {number} nodeWidth - 节点宽度
 * @returns {boolean} 是否有重叠
 */
export function checkBranchOverlap(positions, nodeWidth = BRANCH_SPACING_CONFIG.NODE_DIMENSIONS.STANDARD_WIDTH) {
  const minGap = BRANCH_SPACING_CONFIG.NODE_DIMENSIONS.MIN_GAP
  const requiredSpacing = nodeWidth + minGap
  
  for (let i = 0; i < positions.length - 1; i++) {
    const distance = Math.abs(positions[i + 1].x - positions[i].x)
    if (distance < requiredSpacing) {
      console.warn(`[BranchSpacing] 检测到分支重叠:`, {
        branch1: i,
        branch2: i + 1,
        distance,
        requiredSpacing,
        positions: [positions[i], positions[i + 1]]
      })
      return true
    }
  }
  
  return false
}

/**
 * 获取推荐的预览线长度
 * @param {number} branchCount - 分支数量
 * @param {string} nodeType - 节点类型
 * @returns {number} 推荐的预览线长度
 */
export function getRecommendedPreviewLength(branchCount, nodeType = 'default') {
  const config = BRANCH_SPACING_CONFIG
  let baseLength = config.PREVIEW_LINE.LENGTH
  
  // 根据分支数量调整预览线长度
  if (branchCount > 3) {
    baseLength += config.PREVIEW_LINE.EXTENSION_LENGTH
  }
  
  return baseLength
}

export default BRANCH_SPACING_CONFIG