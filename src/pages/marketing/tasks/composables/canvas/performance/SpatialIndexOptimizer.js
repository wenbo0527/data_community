/**
 * 空间索引优化器
 * 使用空间索引技术优化吸附检测和碰撞检测性能
 */
export class SpatialIndexOptimizer {
  constructor(options = {}) {
    this.options = {
      gridSize: 50,
      maxItemsPerCell: 10,
      enableDynamicResize: true,
      ...options
    }
    
    this.grid = new Map()
    this.items = new Map()
    this.bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
    this.stats = {
      totalItems: 0,
      gridCells: 0,
      queries: 0,
      hits: 0
    }
    
    console.log('🗂️ [SpatialIndexOptimizer] 空间索引优化器初始化完成')
  }

  /**
   * 添加项目到空间索引
   */
  addItem(id, bounds, data = {}) {
    try {
      // 移除已存在的项目
      this.removeItem(id)
      
      const item = {
        id,
        bounds: this.normalizeBounds(bounds),
        data,
        cells: new Set()
      }
      
      // 计算项目覆盖的网格单元
      const cells = this.getCellsForBounds(item.bounds)
      
      // 添加到相应的网格单元
      for (const cellKey of cells) {
        if (!this.grid.has(cellKey)) {
          this.grid.set(cellKey, new Set())
        }
        this.grid.get(cellKey).add(id)
        item.cells.add(cellKey)
      }
      
      this.items.set(id, item)
      this.stats.totalItems++
      this.stats.gridCells = this.grid.size
      
      // 动态调整网格大小
      if (this.options.enableDynamicResize) {
        this.checkGridResize()
      }
      
      return true
      
    } catch (error) {
      console.error('添加空间索引项目失败:', error)
      return false
    }
  }

  /**
   * 从空间索引中移除项目
   */
  removeItem(id) {
    const item = this.items.get(id)
    if (!item) return false

    try {
      // 从所有相关网格单元中移除
      for (const cellKey of item.cells) {
        const cell = this.grid.get(cellKey)
        if (cell) {
          cell.delete(id)
          // 如果单元为空，删除它
          if (cell.size === 0) {
            this.grid.delete(cellKey)
          }
        }
      }
      
      this.items.delete(id)
      this.stats.totalItems--
      this.stats.gridCells = this.grid.size
      
      return true
      
    } catch (error) {
      console.error('移除空间索引项目失败:', error)
      return false
    }
  }

  /**
   * 查询指定区域内的项目
   */
  queryRegion(bounds) {
    this.stats.queries++
    
    try {
      const normalizedBounds = this.normalizeBounds(bounds)
      const cells = this.getCellsForBounds(normalizedBounds)
      const candidates = new Set()
      
      // 收集候选项目
      for (const cellKey of cells) {
        const cell = this.grid.get(cellKey)
        if (cell) {
          for (const itemId of cell) {
            candidates.add(itemId)
          }
        }
      }
      
      // 精确碰撞检测
      const results = []
      for (const itemId of candidates) {
        const item = this.items.get(itemId)
        if (item && this.boundsIntersect(normalizedBounds, item.bounds)) {
          results.push({
            id: itemId,
            bounds: item.bounds,
            data: item.data
          })
        }
      }
      
      if (results.length > 0) {
        this.stats.hits++
      }
      
      return results
      
    } catch (error) {
      console.error('查询空间索引失败:', error)
      return []
    }
  }

  /**
   * 查询指定点附近的项目
   */
  queryPoint(x, y, radius = 0) {
    return this.queryRegion({
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    })
  }

  /**
   * 查询最近的项目
   */
  queryNearest(x, y, maxDistance = Infinity, filter = null) {
    const searchRadius = Math.min(maxDistance, this.options.gridSize * 2)
    const candidates = this.queryPoint(x, y, searchRadius)
    
    let nearest = null
    let minDistance = maxDistance
    
    for (const candidate of candidates) {
      // 应用过滤器
      if (filter && !filter(candidate)) continue
      
      // 计算到边界中心的距离
      const centerX = candidate.bounds.x + candidate.bounds.width / 2
      const centerY = candidate.bounds.y + candidate.bounds.height / 2
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearest = {
          ...candidate,
          distance
        }
      }
    }
    
    return nearest
  }

  /**
   * 更新项目位置
   */
  updateItem(id, newBounds, newData = null) {
    const item = this.items.get(id)
    if (!item) return false

    // 检查是否需要更新
    const normalizedBounds = this.normalizeBounds(newBounds)
    if (this.boundsEqual(item.bounds, normalizedBounds)) {
      // 只更新数据
      if (newData !== null) {
        item.data = { ...item.data, ...newData }
      }
      return true
    }

    // 重新添加项目
    const data = newData ? { ...item.data, ...newData } : item.data
    return this.addItem(id, normalizedBounds, data)
  }

  /**
   * 获取网格单元键
   */
  getCellKey(gridX, gridY) {
    return `${gridX},${gridY}`
  }

  /**
   * 获取边界覆盖的网格单元
   */
  getCellsForBounds(bounds) {
    const cells = []
    const gridSize = this.options.gridSize
    
    const startX = Math.floor(bounds.x / gridSize)
    const startY = Math.floor(bounds.y / gridSize)
    const endX = Math.floor((bounds.x + bounds.width) / gridSize)
    const endY = Math.floor((bounds.y + bounds.height) / gridSize)
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(this.getCellKey(x, y))
      }
    }
    
    return cells
  }

  /**
   * 标准化边界对象
   */
  normalizeBounds(bounds) {
    if (bounds.width !== undefined && bounds.height !== undefined) {
      return bounds
    }
    
    // 处理点对象
    if (bounds.x !== undefined && bounds.y !== undefined) {
      return {
        x: bounds.x,
        y: bounds.y,
        width: 1,
        height: 1
      }
    }
    
    throw new Error('无效的边界对象')
  }

  /**
   * 检查两个边界是否相交
   */
  boundsIntersect(bounds1, bounds2) {
    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    )
  }

  /**
   * 检查两个边界是否相等
   */
  boundsEqual(bounds1, bounds2) {
    return (
      bounds1.x === bounds2.x &&
      bounds1.y === bounds2.y &&
      bounds1.width === bounds2.width &&
      bounds1.height === bounds2.height
    )
  }

  /**
   * 检查是否需要调整网格大小
   */
  checkGridResize() {
    const avgItemsPerCell = this.stats.totalItems / Math.max(this.stats.gridCells, 1)
    
    if (avgItemsPerCell > this.options.maxItemsPerCell * 2) {
      // 网格太粗糙，需要细分
      this.resizeGrid(this.options.gridSize / 2)
    } else if (avgItemsPerCell < this.options.maxItemsPerCell / 4 && this.options.gridSize < 200) {
      // 网格太细，可以合并
      this.resizeGrid(this.options.gridSize * 2)
    }
  }

  /**
   * 调整网格大小
   */
  resizeGrid(newGridSize) {
    if (newGridSize === this.options.gridSize) return

    console.log(`🔄 [SpatialIndexOptimizer] 调整网格大小: ${this.options.gridSize} -> ${newGridSize}`)
    
    // 保存所有项目
    const allItems = Array.from(this.items.values()).map(item => ({
      id: item.id,
      bounds: item.bounds,
      data: item.data
    }))
    
    // 清空当前索引
    this.grid.clear()
    this.items.clear()
    this.options.gridSize = newGridSize
    
    // 重新添加所有项目
    for (const item of allItems) {
      this.addItem(item.id, item.bounds, item.data)
    }
  }

  /**
   * 清空所有项目
   */
  clear() {
    this.grid.clear()
    this.items.clear()
    this.stats.totalItems = 0
    this.stats.gridCells = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      gridSize: this.options.gridSize,
      avgItemsPerCell: this.stats.totalItems / Math.max(this.stats.gridCells, 1),
      hitRate: this.stats.queries > 0 ? this.stats.hits / this.stats.queries : 0
    }
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    const cellDistribution = new Map()
    
    for (const [cellKey, items] of this.grid) {
      const itemCount = items.size
      cellDistribution.set(itemCount, (cellDistribution.get(itemCount) || 0) + 1)
    }
    
    return {
      stats: this.getStats(),
      cellDistribution: Object.fromEntries(cellDistribution),
      bounds: this.bounds,
      sampleItems: Array.from(this.items.entries()).slice(0, 5)
    }
  }

  /**
   * 销毁优化器
   */
  destroy() {
    this.clear()
    console.log('🗑️ [SpatialIndexOptimizer] 空间索引优化器已销毁')
  }
}

export default SpatialIndexOptimizer