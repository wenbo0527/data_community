/**
 * 分支布局管理器
 * 负责分流节点的分支自动生成和布局
 */
import { 
  BRANCH_SPACING_CONFIG, 
  calculateAdaptiveBranchSpacing, 
  checkBranchOverlap 
} from './branchSpacingConfig.js'

export class BranchLayoutManager {
  constructor(graph, layoutConfig = {}) {
    this.graph = graph
    this.layoutConfig = {
      branchSpacing: 180,   // 分支间距（与垂直布局配置保持一致）
      levelHeight: 150,     // 层级高度
      gridSize: 20,         // 网格大小
      minBranchSpacing: 150, // 最小分支间距（与垂直布局配置保持一致）
      maxBranchSpacing: 250, // 最大分支间距（与垂直布局配置保持一致）
      nodeWidth: 120,       // 标准节点宽度（新增，用于计算重叠）
      nodeHeight: 80,       // 标准节点高度（新增，用于计算重叠）
      ...layoutConfig
    }
  }

  /**
   * 自动分支布局
   * @param {Object} splitNode - 分流节点
   * @param {Array} branches - 分支配置数组
   * @returns {Array} 分支位置数组
   */
  layoutBranches(splitNode, branches) {
    console.log('[BranchLayoutManager] 开始分支布局:', splitNode.id, branches)
    
    const branchCount = branches.length
    const splitPosition = splitNode.position()
    
    // 获取节点类型
    const nodeData = splitNode.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'default'
    
    // 计算分支位置，传递节点类型
    const branchPositions = this.calculateBranchPositions(splitPosition, branchCount, nodeType)
    
    // 为每个分支分配位置和标签
    const layoutResult = branches.map((branch, index) => ({
      ...branch,
      position: branchPositions[index],
      parentSplit: splitNode.id,
      branchIndex: index
    }))
    
    console.log('[BranchLayoutManager] 分支布局完成:', layoutResult)
    return layoutResult
  }

  /**
   * 计算分支位置
   * @param {Object} splitPosition - 分流节点位置
   * @param {number} branchCount - 分支数量
   * @param {string} nodeType - 节点类型
   * @returns {Array} 分支位置数组
   */
  calculateBranchPositions(splitPosition, branchCount, nodeType = 'default') {
    const positions = []
    
    if (branchCount === 1) {
      // 单分支直接向下
      positions.push({
        x: splitPosition.x,
        y: splitPosition.y + this.layoutConfig.levelHeight
      })
    } else {
      // 多分支水平分布（在同一行）
      const baseY = splitPosition.y + this.layoutConfig.levelHeight
      
      // 使用新的自适应分支间距计算
      const adaptiveSpacing = calculateAdaptiveBranchSpacing(branchCount, nodeType)
      
      // 🔧 修复分支居中问题：确保分支相对于分流节点居中
      const totalWidth = (branchCount - 1) * adaptiveSpacing
      const startX = splitPosition.x - totalWidth / 2
      
      console.log('[BranchLayoutManager] 分支布局计算（修复居中）:', {
        nodeType,
        branchCount,
        adaptiveSpacing,
        totalWidth,
        splitNodeX: splitPosition.x,
        startX,
        baseY,
        splitPosition,
        centerOffset: totalWidth / 2
      })
      
      for (let i = 0; i < branchCount; i++) {
        const branchX = startX + i * adaptiveSpacing
        positions.push({
          x: branchX, // 水平分布，相对于分流节点居中
          y: baseY // 保持相同的Y坐标（同一行）
        })
        
        console.log(`[BranchLayoutManager] 分支${i + 1}位置（居中修复）:`, {
          x: branchX,
          y: baseY,
          spacing: adaptiveSpacing,
          offsetFromSplit: branchX - splitPosition.x,
          isCenter: i === Math.floor((branchCount - 1) / 2)
        })
      }
      
      // 检查是否有重叠
      if (checkBranchOverlap(positions, this.layoutConfig.nodeWidth)) {
        console.warn('[BranchLayoutManager] 检测到分支重叠，建议调整间距配置')
      }
      
      // 验证居中效果
      const leftmostX = Math.min(...positions.map(p => p.x))
      const rightmostX = Math.max(...positions.map(p => p.x))
      const actualCenter = (leftmostX + rightmostX) / 2
      const centerDeviation = Math.abs(actualCenter - splitPosition.x)
      
      console.log('[BranchLayoutManager] 分支居中验证:', {
        splitNodeX: splitPosition.x,
        leftmostX,
        rightmostX,
        actualCenter,
        centerDeviation,
        isCentered: centerDeviation < 1 // 允许1像素的误差
      })
    }
    
    return positions.map(pos => this.snapToGrid(pos))
  }

  /**
   * 更新分流节点的分支布局
   * @param {Object} splitNode - 分流节点（可能是X6节点实例或数据节点）
   * @param {Object} config - 节点配置
   * @param {boolean} skipStructuredLayout - 是否跳过结构化布局触发，默认false
   * @param {Set} protectedNodes - 需要保护位置的节点集合
   */
  updateBranchLayout(splitNode, config, skipStructuredLayout = false, protectedNodes = new Set()) {
    console.log('[BranchLayoutManager] 更新分支布局:', splitNode.id, config, { 
      skipStructuredLayout, 
      protectedNodesCount: protectedNodes.size,
      protectedNodes: Array.from(protectedNodes)
    })
    
    // 确保获取到正确的X6节点实例
    let x6Node = splitNode
    if (!splitNode.getData || typeof splitNode.getData !== 'function') {
      // 如果传入的不是X6节点实例，尝试从图中获取
      if (this.graph && splitNode.id) {
        x6Node = this.graph.getCellById(splitNode.id)
        if (!x6Node) {
          console.error('[BranchLayoutManager] 无法找到X6节点实例:', splitNode.id)
          return
        }
      } else {
        console.error('[BranchLayoutManager] 无效的节点对象:', splitNode)
        return
      }
    }
    
    // 获取节点类型，优先从nodeType字段获取，然后从type字段获取
    const nodeData = x6Node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type
    console.log('[BranchLayoutManager] 节点数据:', nodeData)
    console.log('[BranchLayoutManager] 识别的节点类型:', nodeType)
    
    let branches = []
    
    // 根据节点类型提取分支信息
    switch (nodeType) {
      case 'audience-split':
        branches = this.extractAudienceBranches(config)
        break
      case 'event-split':
        branches = this.extractEventBranches(config)
        break
      case 'ab-test':
        branches = this.extractABTestBranches(config)
        break
      default:
        console.warn('[BranchLayoutManager] 不支持的分流节点类型:', nodeType)
        return
    }
    
    if (branches.length > 0) {
      // 计算分支布局
      const branchLayout = this.layoutBranches(x6Node, branches)
      
      // 更新节点的分支信息
      this.updateNodeBranchData(x6Node, branchLayout)
      
      // 更新连接端口
      this.updateNodePorts(x6Node, branches)
      
      // 🔧 修复：检查并保护已连接的未命中人群节点位置
      if (protectedNodes.size > 0) {
        console.log('[BranchLayoutManager] 保护已连接节点的位置，跳过预览线位置重置')
        
        // 检查预览线管理器是否存在
        if (this.onBranchLayoutUpdated) {
          // 传递保护节点信息给回调
          this.onBranchLayoutUpdated(x6Node, branchLayout, { protectedNodes })
        }
      } else {
        // 根据参数决定是否触发结构化布局
        if (!skipStructuredLayout) {
          console.log('[BranchLayoutManager] 分支布局更新完成，将触发结构化布局')
          // 这里可以触发结构化布局的回调
          this.onBranchLayoutUpdated?.(x6Node, branchLayout)
        } else {
          console.log('[BranchLayoutManager] 分支布局更新完成，跳过结构化布局触发')
        }
      }
    }
  }

  /**
   * 提取人群分流分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractAudienceBranches(config) {
    const audiences = config.audiences || []
    return audiences.map((audience, index) => ({
      id: `audience_${index}`,
      label: audience.name || `人群${index + 1}`,
      type: 'audience',
      audienceId: audience.id,
      condition: audience.condition
    }))
  }

  /**
   * 提取事件分流分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractEventBranches(config) {
    return [
      {
        id: 'event_yes',
        label: config.yesLabel || '是',
        type: 'event',
        condition: 'yes'
      },
      {
        id: 'event_no',
        label: config.noLabel || '否',
        type: 'event',
        condition: 'no'
      }
    ]
  }

  /**
   * 提取AB测试分支
   * @param {Object} config - 配置对象
   * @returns {Array} 分支数组
   */
  extractABTestBranches(config) {
    return [
      {
        id: 'ab_a',
        label: config.groupALabel || '实验组A',
        type: 'ab-test',
        condition: 'group_a',
        ratio: config.groupARatio || 50
      },
      {
        id: 'ab_b',
        label: config.groupBLabel || '实验组B',
        type: 'ab-test',
        condition: 'group_b',
        ratio: config.groupBRatio || 50
      }
    ]
  }

  /**
   * 更新节点的分支数据
   * @param {Object} node - 节点
   * @param {Array} branchLayout - 分支布局数据
   */
  updateNodeBranchData(node, branchLayout) {
    const currentData = node.getData() || {}
    const updatedData = {
      ...currentData,
      branches: branchLayout,
      branchCount: branchLayout.length
    }
    
    node.setData(updatedData)
    console.log('[BranchLayoutManager] 节点分支数据已更新:', node.id, updatedData)
  }

  /**
   * 更新节点端口
   * @param {Object} node - 节点
   * @param {Array} branches - 分支数组
   */
  updateNodePorts(node, branches) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type
    
    // 先移除现有的输出端口
    const existingPorts = node.getPorts().filter(p => p.group === 'out')
    existingPorts.forEach(port => {
      node.removePort(port.id)
    })
    
    // 根据节点类型添加正确的输出端口
    if (nodeType === 'event-split') {
      // 事件分流节点只使用统一的'out'端口
      node.addPort({
        group: 'out',
        id: 'out',
        position: {
          name: 'bottom',
          args: { x: '50%', y: '100%', dx: 0, dy: 0 }
        },
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff',
            style: { visibility: 'visible' }
          }
        },
        markup: [{ tagName: 'circle', selector: 'circle' }]
      })
      
      console.log(`[BranchLayoutManager] 添加统一输出端口: out`)
    } else if (nodeType === 'ab-test') {
      // AB测试节点只使用统一的'out'端口
      node.addPort({
        group: 'out',
        id: 'out',
        position: {
          name: 'bottom',
          args: { x: '50%', y: '100%', dx: 0, dy: 0 }
        },
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff',
            style: { visibility: 'visible' }
          }
        },
        markup: [{ tagName: 'circle', selector: 'circle' }]
      })
      
      console.log(`[BranchLayoutManager] 添加统一输出端口: out`)
    } else if (nodeType === 'audience-split' && branches.length > 0) {
      // 人群分流节点只使用统一的'out'端口
      node.addPort({
        group: 'out',
        id: 'out',
        position: {
          name: 'bottom',
          args: { x: '50%', y: '100%', dx: 0, dy: 0 }
        },
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff',
            style: { visibility: 'visible' }
          }
        },
        markup: [{ tagName: 'circle', selector: 'circle' }]
      })
      
      console.log(`[BranchLayoutManager] 添加统一输出端口: out`)
    } else if (nodeType !== 'end') {
      // 其他节点使用统一的输出端口
      node.addPort({
        group: 'out',
        id: 'out',
        position: {
          name: 'bottom',
          args: { x: '50%', y: '100%', dx: 0, dy: 0 }
        },
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff',
            style: { visibility: 'visible' }
          }
        },
        markup: [{ tagName: 'circle', selector: 'circle' }]
      })
      
      console.log(`[BranchLayoutManager] 添加统一输出端口: out`)
    }
    
    // 存储分支信息到节点数据中
    const updatedData = {
      ...nodeData,
      branches: branches,
      branchCount: branches.length
    }
    node.setData(updatedData)
    
    console.log('[BranchLayoutManager] 节点端口已更新:', node.id, '节点类型:', nodeType, '分支数量:', branches.length)
  }

  /**
   * 计算合并点位置
   * @param {Array} branches - 分支数组
   * @returns {Object} 合并点位置
   */
  calculateMergePoint(branches) {
    if (!branches.length) return null
    
    // 对于水平分布的分支，合并点位于所有分支的中心位置
    const branchXPositions = branches.map(branch => branch.position.x)
    const minX = Math.min(...branchXPositions)
    const maxX = Math.max(...branchXPositions)
    const mergeX = (minX + maxX) / 2
    
    // 找到最深的Y坐标
    const maxY = Math.max(...branches.map(branch => this.getDeepestY(branch)))
    
    const mergePosition = {
      x: mergeX,
      y: maxY + this.layoutConfig.levelHeight
    }
    
    return this.snapToGrid(mergePosition)
  }

  /**
   * 获取分支的最深Y坐标
   * @param {Object} branch - 分支对象
   * @returns {number} 最深Y坐标
   */
  getDeepestY(branch) {
    // 简化实现，返回分支位置的Y坐标
    // 在实际应用中，这里应该递归查找分支下所有节点的最深位置
    return branch.position.y
  }

  /**
   * 对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    return {
      x: Math.round(position.x / this.layoutConfig.gridSize) * this.layoutConfig.gridSize,
      y: Math.round(position.y / this.layoutConfig.gridSize) * this.layoutConfig.gridSize
    }
  }

  /**
   * 清理分支布局数据
   * @param {Object} node - 节点
   */
  clearBranchLayout(node) {
    const currentData = node.getData() || {}
    const nodeType = currentData.nodeType || currentData.type
    
    const updatedData = {
      ...currentData,
      branches: [],
      branchCount: 0
    }
    
    node.setData(updatedData)
    
    // 移除所有输出端口
    const existingPorts = node.getPorts().filter(p => p.group === 'out')
    existingPorts.forEach(port => {
      node.removePort(port.id)
    })
    
    // 重新添加统一的输出端口（除了结束节点）
    if (nodeType !== 'end') {
      node.addPort({
        group: 'out',
        id: 'out',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 2,
            fill: '#fff'
          }
        }
      })
    }
    
    console.log('[BranchLayoutManager] 分支布局数据已清理:', node.id)
  }

  /**
   * 切换端口显示模式（简化版本，现在所有节点都使用统一端口）
   * @param {Object} node - 节点
   * @param {string} mode - 模式（保留参数兼容性，但实际不使用）
   */
  togglePortMode(node, mode = 'auto') {
    const nodeData = node.getData() || {}
    const branches = nodeData.branches || []
    
    // 统一模式：所有节点都使用相同的端口配置
    const updatedData = {
      ...nodeData,
      portMode: 'unified' // 标记为统一模式
    }
    node.setData(updatedData)
    
    // 重新更新端口（使用统一配置）
    this.updateNodePorts(node, branches)
    
    console.log('[BranchLayoutManager] 端口模式已设置为统一模式:', node.id)
  }

  /**
   * 获取节点的分支信息
   * @param {Object} node - 节点
   * @returns {Array} 分支数组
   */
  getNodeBranches(node) {
    const nodeData = node.getData() || {}
    return nodeData.branches || []
  }

  /**
   * 检查节点是否为简化模式（现在所有节点都是统一模式）
   * @param {Object} node - 节点
   * @returns {boolean} 始终返回false，因为不再使用简化模式
   */
  isSimplifiedMode(node) {
    // 统一模式下，不再区分简化模式
    return false
  }
}

export default BranchLayoutManager