/**
 * 流程布局管理器
 * 负责自动布局、预设位管理和流程展开逻辑
 */

import { getNodeConfig } from './nodeTypes.js'

export class FlowLayoutManager {
  constructor(graph) {
    this.graph = graph
    this.presetSlots = new Map() // 存储所有预设位信息
    this.nodeSlotMapping = new Map() // 节点与预设位的映射关系
  }

  /**
   * 初始化节点的预设位
   * @param {Object} node - 节点对象
   */
  initNodePresetSlots(node) {
    const nodeConfig = getNodeConfig(node.getData().type)
    if (!nodeConfig || !nodeConfig.autoExpand || !nodeConfig.nextSlots) {
      return
    }

    const nodePosition = node.getPosition()
    const nodeId = node.id
    const slots = []

    nodeConfig.nextSlots.forEach((slotConfig, index) => {
      const slotId = `${nodeId}_slot_${index}`
      const slot = {
        id: slotId,
        nodeId: nodeId,
        type: slotConfig.type,
        label: slotConfig.label,
        position: {
          x: nodePosition.x + slotConfig.position.x,
          y: nodePosition.y + slotConfig.position.y
        },
        allowedTypes: slotConfig.allowedTypes || [],
        state: 'empty', // empty, occupied, disabled
        config: slotConfig
      }
      
      slots.push(slot)
      this.presetSlots.set(slotId, slot)
    })

    this.nodeSlotMapping.set(nodeId, slots)
    return slots
  }

  /**
   * 更新节点位置时同步更新预设位位置
   * @param {string} nodeId - 节点ID
   * @param {Object} newPosition - 新位置
   */
  updateNodePresetSlots(nodeId, newPosition) {
    const slots = this.nodeSlotMapping.get(nodeId)
    if (!slots) return

    const node = this.graph.getCellById(nodeId)
    const nodeConfig = getNodeConfig(node.getData().type)
    
    slots.forEach((slot, index) => {
      const slotConfig = nodeConfig.nextSlots[index]
      slot.position = {
        x: newPosition.x + slotConfig.position.x,
        y: newPosition.y + slotConfig.position.y
      }
      this.presetSlots.set(slot.id, slot)
    })
  }

  /**
   * 获取节点的预设位
   * @param {string} nodeId - 节点ID
   * @returns {Array} 预设位数组
   */
  getNodePresetSlots(nodeId) {
    return this.nodeSlotMapping.get(nodeId) || []
  }

  /**
   * 获取所有预设位
   * @returns {Array} 所有预设位数组
   */
  getAllPresetSlots() {
    return Array.from(this.presetSlots.values())
  }

  /**
   * 获取空闲的预设位
   * @returns {Array} 空闲预设位数组
   */
  getEmptyPresetSlots() {
    return this.getAllPresetSlots().filter(slot => slot.state === 'empty')
  }

  /**
   * 占用预设位
   * @param {string} slotId - 预设位ID
   * @param {string} nodeId - 占用的节点ID
   */
  occupyPresetSlot(slotId, nodeId) {
    const slot = this.presetSlots.get(slotId)
    if (slot) {
      slot.state = 'occupied'
      slot.occupiedBy = nodeId
      this.presetSlots.set(slotId, slot)
    }
  }

  /**
   * 释放预设位
   * @param {string} slotId - 预设位ID
   */
  releasePresetSlot(slotId) {
    const slot = this.presetSlots.get(slotId)
    if (slot) {
      slot.state = 'empty'
      delete slot.occupiedBy
      this.presetSlots.set(slotId, slot)
    }
  }

  /**
   * 删除节点时清理相关预设位
   * @param {string} nodeId - 节点ID
   */
  removeNodePresetSlots(nodeId) {
    const slots = this.nodeSlotMapping.get(nodeId)
    if (slots) {
      slots.forEach(slot => {
        this.presetSlots.delete(slot.id)
      })
      this.nodeSlotMapping.delete(nodeId)
    }

    // 清理被该节点占用的预设位
    this.presetSlots.forEach((slot, slotId) => {
      if (slot.occupiedBy === nodeId) {
        this.releasePresetSlot(slotId)
      }
    })
  }

  /**
   * 在预设位添加节点
   * @param {string} slotId - 预设位ID
   * @param {string} nodeType - 节点类型
   * @param {Object} options - 额外选项
   * @returns {Object} 新节点信息
   */
  addNodeToPresetSlot(slotId, nodeType, options = {}) {
    const slot = this.presetSlots.get(slotId)
    if (!slot || slot.state !== 'empty') {
      throw new Error('预设位不可用')
    }

    // 检查节点类型是否允许
    if (slot.allowedTypes.length > 0 && !slot.allowedTypes.includes(nodeType)) {
      throw new Error(`节点类型 ${nodeType} 不允许添加到此预设位`)
    }

    const nodeConfig = getNodeConfig(nodeType)
    if (!nodeConfig) {
      throw new Error(`未知的节点类型: ${nodeType}`)
    }

    // 创建新节点
    const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 将位置对齐到网格
    const snappedPosition = this.snapToGrid(slot.position)
    
    const nodeData = {
      id: newNodeId,
      type: nodeType,
      label: nodeConfig.label,
      position: snappedPosition,
      ...options
    }

    // 占用预设位
    this.occupyPresetSlot(slotId, newNodeId)

    // 创建从父节点到新节点的连接
    const parentNode = this.graph.getCellById(slot.nodeId)
    if (parentNode) {
      const edgeId = `edge_${slot.nodeId}_${newNodeId}`
      const edgeData = {
        id: edgeId,
        source: slot.nodeId,
        target: newNodeId,
        label: slot.label
      }
      
      return {
        node: nodeData,
        edge: edgeData,
        slot: slot
      }
    }

    return {
      node: nodeData,
      slot: slot
    }
  }

  /**
   * 自动布局算法
   * @param {Array} nodes - 节点数组
   * @param {Object} options - 布局选项
   * @returns {Object} 布局结果
   */
  autoLayout(nodes, options = {}) {
    const {
      direction = 'vertical', // vertical, horizontal
      spacing = { x: 200, y: 150 },
      startPosition = { x: 400, y: 100 }
    } = options

    const layoutResult = {
      nodes: [],
      edges: []
    }

    // 找到开始节点
    const startNode = nodes.find(node => node.type === 'start')
    if (!startNode) {
      console.warn('未找到开始节点，无法进行自动布局')
      return layoutResult
    }

    // 构建节点层级关系
    const levels = this.buildNodeLevels(nodes)
    
    // 按层级进行布局
    levels.forEach((levelNodes, levelIndex) => {
      const levelY = startPosition.y + levelIndex * spacing.y
      const levelWidth = levelNodes.length * spacing.x
      const startX = startPosition.x - levelWidth / 2

      levelNodes.forEach((node, nodeIndex) => {
        const nodeX = startX + nodeIndex * spacing.x
        const position = { x: nodeX, y: levelY }
        
        layoutResult.nodes.push({
          ...node,
          position
        })
      })
    })

    return layoutResult
  }

  /**
   * 构建节点层级关系
   * @param {Array} nodes - 节点数组
   * @returns {Array} 层级数组
   */
  buildNodeLevels(nodes) {
    const levels = []
    const visited = new Set()
    const nodeMap = new Map()
    
    // 构建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
    })

    // 找到开始节点
    const startNode = nodes.find(node => node.type === 'start')
    if (startNode) {
      levels[0] = [startNode]
      visited.add(startNode.id)
    }

    // BFS遍历构建层级
    let currentLevel = 0
    while (levels[currentLevel] && levels[currentLevel].length > 0) {
      const nextLevel = []
      
      levels[currentLevel].forEach(node => {
        // 这里需要根据实际的边连接关系来确定下一层节点
        // 暂时使用简化逻辑
      })

      if (nextLevel.length > 0) {
        levels[currentLevel + 1] = nextLevel
      }
      currentLevel++
    }

    return levels
  }

  /**
   * 计算最佳节点位置
   * @param {string} nodeType - 节点类型
   * @param {Object} parentPosition - 父节点位置
   * @param {Object} options - 选项
   * @returns {Object} 计算出的位置
   */
  calculateOptimalPosition(nodeType, parentPosition, options = {}) {
    const {
      direction = 'bottom',
      spacing = 150,
      avoidOverlap = true
    } = options

    let position = { ...parentPosition }

    switch (direction) {
      case 'bottom':
        position.y += spacing
        break
      case 'top':
        position.y -= spacing
        break
      case 'left':
        position.x -= spacing
        break
      case 'right':
        position.x += spacing
        break
      case 'bottom-left':
        position.x -= spacing / 2
        position.y += spacing
        break
      case 'bottom-right':
        position.x += spacing / 2
        position.y += spacing
        break
    }

    // 避免重叠
    if (avoidOverlap) {
      position = this.avoidNodeOverlap(position)
    }

    return position
  }

  /**
   * 避免节点重叠并对齐到网格
   * @param {Object} position - 目标位置
   * @returns {Object} 调整后的位置
   */
  avoidNodeOverlap(position) {
    const nodes = this.graph.getNodes()
    const minDistance = 120 // 最小距离
    let adjustedPosition = this.snapToGrid(position) // 先对齐到网格
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let hasOverlap = false
      
      for (const node of nodes) {
        const nodePosition = node.getPosition()
        const distance = Math.sqrt(
          Math.pow(adjustedPosition.x - nodePosition.x, 2) +
          Math.pow(adjustedPosition.y - nodePosition.y, 2)
        )
        
        if (distance < minDistance) {
          hasOverlap = true
          // 调整位置（按网格单位调整）
          adjustedPosition.x += 80 // 大网格单位
          adjustedPosition.y += 80 // 大网格单位
          // 再次对齐到网格
          adjustedPosition = this.snapToGrid(adjustedPosition)
          break
        }
      }
      
      if (!hasOverlap) {
        break
      }
      
      attempts++
    }

    return adjustedPosition
  }
  
  /**
   * 将位置对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐到网格的位置
   */
  snapToGrid(position) {
    const gridSize = 20 // 小网格大小
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }

  /**
   * 清理所有预设位
   */
  clearAllPresetSlots() {
    this.presetSlots.clear()
    this.nodeSlotMapping.clear()
  }

  /**
   * 获取预设位统计信息
   * @returns {Object} 统计信息
   */
  getPresetSlotStats() {
    const allSlots = this.getAllPresetSlots()
    const emptySlots = allSlots.filter(slot => slot.state === 'empty')
    const occupiedSlots = allSlots.filter(slot => slot.state === 'occupied')
    const disabledSlots = allSlots.filter(slot => slot.state === 'disabled')

    return {
      total: allSlots.length,
      empty: emptySlots.length,
      occupied: occupiedSlots.length,
      disabled: disabledSlots.length,
      byType: {
        single: allSlots.filter(slot => slot.type === 'single').length,
        branch: allSlots.filter(slot => slot.type === 'branch').length,
        parallel: allSlots.filter(slot => slot.type === 'parallel').length,
        terminal: allSlots.filter(slot => slot.type === 'terminal').length
      }
    }
  }
}

export default FlowLayoutManager