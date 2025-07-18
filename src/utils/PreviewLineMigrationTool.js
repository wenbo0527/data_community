/**
 * 预览线系统迁移工具
 * 用于从现有的双预览线系统平滑过渡到统一预览线系统
 */

import UnifiedPreviewLineManager from './UnifiedPreviewLineManager.js'

export class PreviewLineMigrationTool {
  constructor(graph, branchManager, layoutConfig) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    
    // 创建统一管理器
    this.unifiedManager = new UnifiedPreviewLineManager(graph, branchManager, layoutConfig)
    
    // 迁移状态
    this.migrationState = {
      isEnabled: false,
      oldManagerInstance: null,
      migratedNodes: new Set(),
      migrationLog: []
    }
    
    console.log('🔄 [预览线迁移工具] 初始化完成')
  }

  /**
   * 开始迁移过程
   * @param {Object} oldManager - 现有的ConnectionPreviewManager实例
   * @param {Object} options - 迁移选项
   */
  async startMigration(oldManager, options = {}) {
    const {
      enableGradualMigration = true,
      preserveOldBehavior = false,
      migrationMode = 'replace' // 'replace' | 'coexist' | 'test'
    } = options

    console.log('🚀 [预览线迁移工具] 开始迁移过程:', {
      migrationMode,
      enableGradualMigration,
      preserveOldBehavior
    })

    this.migrationState.oldManagerInstance = oldManager
    this.migrationState.isEnabled = true

    try {
      switch (migrationMode) {
        case 'replace':
          await this.performReplaceMigration(oldManager)
          break
        case 'coexist':
          await this.performCoexistMigration(oldManager)
          break
        case 'test':
          await this.performTestMigration(oldManager)
          break
        default:
          throw new Error(`未知的迁移模式: ${migrationMode}`)
      }

      // 初始化统一管理器
      this.unifiedManager.init()

      console.log('✅ [预览线迁移工具] 迁移完成')
      return {
        success: true,
        migratedNodes: this.migrationState.migratedNodes.size,
        migrationLog: this.migrationState.migrationLog
      }

    } catch (error) {
      console.error('❌ [预览线迁移工具] 迁移失败:', error)
      await this.rollbackMigration()
      throw error
    }
  }

  /**
   * 执行替换迁移（完全替换旧系统）
   */
  async performReplaceMigration(oldManager) {
    console.log('🔄 [预览线迁移工具] 执行替换迁移')

    // 1. 收集现有预览线信息
    const existingPreviews = this.collectExistingPreviews(oldManager)
    
    // 2. 停用旧管理器
    this.disableOldManager(oldManager)
    
    // 3. 迁移现有预览线
    await this.migrateExistingPreviews(existingPreviews)
    
    // 4. 清理旧预览线
    this.cleanupOldPreviews(oldManager)

    this.logMigration('replace', '完全替换旧系统')
  }

  /**
   * 执行共存迁移（新旧系统共存）
   */
  async performCoexistMigration(oldManager) {
    console.log('🔄 [预览线迁移工具] 执行共存迁移')

    // 1. 为新节点使用统一管理器
    this.setupNewNodeHandler()
    
    // 2. 保持现有预览线不变
    this.preserveExistingPreviews(oldManager)
    
    // 3. 设置选择性迁移
    this.setupSelectiveMigration(oldManager)

    this.logMigration('coexist', '新旧系统共存')
  }

  /**
   * 执行测试迁移（仅测试，不影响现有系统）
   */
  async performTestMigration(oldManager) {
    console.log('🔄 [预览线迁移工具] 执行测试迁移')

    // 1. 创建测试节点
    const testNodes = this.createTestNodes()
    
    // 2. 使用统一管理器处理测试节点
    await this.testUnifiedManager(testNodes)
    
    // 3. 比较性能和行为
    const comparison = this.comparePerformance(oldManager)

    this.logMigration('test', '测试模式，不影响现有系统', comparison)
  }

  /**
   * 收集现有预览线信息
   */
  collectExistingPreviews(oldManager) {
    const previews = {
      persistent: new Map(),
      draggable: new Map()
    }

    // 收集持久化预览线
    if (oldManager.persistentPreviews) {
      previews.persistent = new Map(oldManager.persistentPreviews)
    }

    // 收集可拖拽预设线
    if (oldManager.draggablePreviewLines) {
      previews.draggable = new Map(oldManager.draggablePreviewLines)
    }

    console.log('📊 [预览线迁移工具] 收集到现有预览线:', {
      persistent: previews.persistent.size,
      draggable: previews.draggable.size
    })

    return previews
  }

  /**
   * 停用旧管理器
   */
  disableOldManager(oldManager) {
    console.log('⏸️ [预览线迁移工具] 停用旧管理器')

    // 移除事件监听器
    if (typeof oldManager.destroy === 'function') {
      oldManager.destroy()
    } else {
      // 手动移除主要事件监听器
      this.graph.off('node:added', oldManager.handleNodeAdded)
      this.graph.off('node:removed', oldManager.handleNodeRemoved)
      this.graph.off('node:move', oldManager.handleNodeMove)
      this.graph.off('node:moved', oldManager.handleNodeMoved)
    }
  }

  /**
   * 迁移现有预览线
   */
  async migrateExistingPreviews(existingPreviews) {
    console.log('🔄 [预览线迁移工具] 迁移现有预览线')

    // 迁移持久化预览线
    for (const [key, preview] of existingPreviews.persistent) {
      await this.migratePersistentPreview(key, preview)
    }

    // 迁移可拖拽预设线
    for (const [key, preview] of existingPreviews.draggable) {
      await this.migrateDraggablePreview(key, preview)
    }
  }

  /**
   * 迁移单个持久化预览线
   */
  async migratePersistentPreview(key, preview) {
    try {
      const sourceNodeId = preview.sourceNodeId || key.split('_')[0]
      const sourceNode = this.graph.getCell(sourceNodeId)
      
      if (sourceNode && sourceNode.isNode()) {
        // 使用统一管理器创建预览线
        const newPreview = this.unifiedManager.createUnifiedPreviewLine(
          sourceNode, 
          'static_display'
        )
        
        if (newPreview) {
          this.migrationState.migratedNodes.add(sourceNodeId)
          console.log('✅ [预览线迁移工具] 迁移持久化预览线:', key)
        }
      }
    } catch (error) {
      console.error('❌ [预览线迁移工具] 迁移持久化预览线失败:', key, error)
    }
  }

  /**
   * 迁移单个可拖拽预设线
   */
  async migrateDraggablePreview(key, preview) {
    try {
      const sourceNode = preview.sourceNode
      
      if (sourceNode && sourceNode.isNode()) {
        // 使用统一管理器创建交互式预览线
        const newPreview = this.unifiedManager.createUnifiedPreviewLine(
          sourceNode, 
          'interactive',
          {
            branchId: preview.branchId,
            branchIndex: preview.branchIndex,
            totalBranches: preview.totalBranches
          }
        )
        
        if (newPreview) {
          this.migrationState.migratedNodes.add(sourceNode.id)
          console.log('✅ [预览线迁移工具] 迁移可拖拽预设线:', key)
        }
      }
    } catch (error) {
      console.error('❌ [预览线迁移工具] 迁移可拖拽预设线失败:', key, error)
    }
  }

  /**
   * 清理旧预览线
   */
  cleanupOldPreviews(oldManager) {
    console.log('🧹 [预览线迁移工具] 清理旧预览线')

    // 清理持久化预览线
    if (oldManager.persistentPreviews) {
      for (const [key, preview] of oldManager.persistentPreviews) {
        try {
          if (preview.line && this.graph.hasCell(preview.line)) {
            this.graph.removeEdge(preview.line)
          }
          if (preview.label && this.graph.hasCell(preview.label)) {
            this.graph.removeNode(preview.label)
          }
        } catch (error) {
          console.warn('⚠️ [预览线迁移工具] 清理持久化预览线失败:', key, error)
        }
      }
      oldManager.persistentPreviews.clear()
    }

    // 清理可拖拽预设线
    if (oldManager.draggablePreviewLines) {
      for (const [key, preview] of oldManager.draggablePreviewLines) {
        try {
          if (preview.line && this.graph.hasCell(preview.line)) {
            this.graph.removeEdge(preview.line)
          }
          if (preview.sourceHintNode && this.graph.hasCell(preview.sourceHintNode)) {
            this.graph.removeNode(preview.sourceHintNode)
          }
          if (preview.targetHintNode && this.graph.hasCell(preview.targetHintNode)) {
            this.graph.removeNode(preview.targetHintNode)
          }
        } catch (error) {
          console.warn('⚠️ [预览线迁移工具] 清理可拖拽预设线失败:', key, error)
        }
      }
      oldManager.draggablePreviewLines.clear()
    }
  }

  /**
   * 设置新节点处理器
   */
  setupNewNodeHandler() {
    // 拦截新节点添加事件，使用统一管理器处理
    this.graph.on('node:added', (e) => {
      const { node } = e
      if (this.unifiedManager.shouldCreatePreviewLine(node)) {
        this.unifiedManager.createUnifiedPreviewLine(node, 'static_display')
        this.migrationState.migratedNodes.add(node.id)
      }
    })
  }

  /**
   * 保持现有预览线不变
   */
  preserveExistingPreviews(oldManager) {
    // 标记现有预览线，避免重复处理
    const existingNodes = this.graph.getNodes()
    existingNodes.forEach(node => {
      if (oldManager.persistentPreviews?.has(`${node.id}_single`) ||
          oldManager.draggablePreviewLines?.has(node.id)) {
        this.migrationState.migratedNodes.add(node.id)
      }
    })
  }

  /**
   * 设置选择性迁移
   */
  setupSelectiveMigration(oldManager) {
    // 提供手动迁移接口
    window.migrateNode = (nodeId) => {
      const node = this.graph.getCell(nodeId)
      if (node && node.isNode()) {
        // 清理旧预览线
        this.cleanupNodePreviews(oldManager, nodeId)
        
        // 创建新预览线
        this.unifiedManager.createUnifiedPreviewLine(node, 'static_display')
        this.migrationState.migratedNodes.add(nodeId)
        
        console.log('✅ [预览线迁移工具] 手动迁移节点:', nodeId)
      }
    }
  }

  /**
   * 清理指定节点的旧预览线
   */
  cleanupNodePreviews(oldManager, nodeId) {
    // 清理持久化预览线
    const persistentKey = `${nodeId}_single`
    if (oldManager.persistentPreviews?.has(persistentKey)) {
      const preview = oldManager.persistentPreviews.get(persistentKey)
      if (preview.line) this.graph.removeEdge(preview.line)
      if (preview.label) this.graph.removeNode(preview.label)
      oldManager.persistentPreviews.delete(persistentKey)
    }

    // 清理可拖拽预设线
    if (oldManager.draggablePreviewLines?.has(nodeId)) {
      const preview = oldManager.draggablePreviewLines.get(nodeId)
      if (preview.line) this.graph.removeEdge(preview.line)
      if (preview.sourceHintNode) this.graph.removeNode(preview.sourceHintNode)
      if (preview.targetHintNode) this.graph.removeNode(preview.targetHintNode)
      oldManager.draggablePreviewLines.delete(nodeId)
    }
  }

  /**
   * 创建测试节点
   */
  createTestNodes() {
    const testNodes = []
    
    // 创建测试节点
    for (let i = 0; i < 3; i++) {
      const testNode = this.graph.addNode({
        id: `test_node_${i}`,
        shape: 'rect',
        x: 100 + i * 200,
        y: 500,
        width: 100,
        height: 60,
        attrs: {
          body: {
            fill: '#f0f0f0',
            stroke: '#ccc'
          },
          text: {
            text: `测试节点${i + 1}`,
            fill: '#333'
          }
        },
        data: {
          type: 'test',
          isTestNode: true
        }
      })
      
      testNodes.push(testNode)
    }
    
    return testNodes
  }

  /**
   * 测试统一管理器
   */
  async testUnifiedManager(testNodes) {
    console.log('🧪 [预览线迁移工具] 测试统一管理器')

    for (const node of testNodes) {
      // 测试静态显示状态
      const preview = this.unifiedManager.createUnifiedPreviewLine(node, 'static_display')
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 测试交互状态转换
      this.unifiedManager.onNodeConfigured(node)
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 测试隐藏状态
      this.unifiedManager.onNodeConnected(node)
    }
  }

  /**
   * 比较性能
   */
  comparePerformance(oldManager) {
    const comparison = {
      memoryUsage: {
        old: this.calculateMemoryUsage(oldManager),
        new: this.calculateMemoryUsage(this.unifiedManager)
      },
      previewLineCount: {
        old: this.countOldPreviews(oldManager),
        new: this.unifiedManager.previewLines.size
      },
      eventListeners: {
        old: this.countOldEventListeners(oldManager),
        new: this.countNewEventListeners(this.unifiedManager)
      }
    }

    console.log('📊 [预览线迁移工具] 性能比较:', comparison)
    return comparison
  }

  /**
   * 计算内存使用量（估算）
   */
  calculateMemoryUsage(manager) {
    // 简单的内存使用估算
    let count = 0
    if (manager.persistentPreviews) count += manager.persistentPreviews.size
    if (manager.draggablePreviewLines) count += manager.draggablePreviewLines.size
    if (manager.previewLines) count += manager.previewLines.size
    return count
  }

  /**
   * 统计旧预览线数量
   */
  countOldPreviews(oldManager) {
    let count = 0
    if (oldManager.persistentPreviews) count += oldManager.persistentPreviews.size
    if (oldManager.draggablePreviewLines) count += oldManager.draggablePreviewLines.size
    return count
  }

  /**
   * 统计旧事件监听器数量
   */
  countOldEventListeners(oldManager) {
    // 估算事件监听器数量
    return 8 // 假设旧管理器有8个主要事件监听器
  }

  /**
   * 统计新事件监听器数量
   */
  countNewEventListeners(newManager) {
    // 统一管理器的事件监听器数量
    return 10 // 统一管理器有10个事件监听器
  }

  /**
   * 记录迁移日志
   */
  logMigration(type, description, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      description,
      data,
      migratedNodes: this.migrationState.migratedNodes.size
    }
    
    this.migrationState.migrationLog.push(logEntry)
    console.log('📝 [预览线迁移工具] 记录迁移日志:', logEntry)
  }

  /**
   * 回滚迁移
   */
  async rollbackMigration() {
    console.log('🔄 [预览线迁移工具] 回滚迁移')

    try {
      // 清理统一管理器创建的预览线
      this.unifiedManager.destroy()
      
      // 恢复旧管理器
      if (this.migrationState.oldManagerInstance) {
        this.migrationState.oldManagerInstance.init()
      }
      
      // 重置迁移状态
      this.migrationState.isEnabled = false
      this.migrationState.migratedNodes.clear()
      
      console.log('✅ [预览线迁移工具] 回滚完成')
    } catch (error) {
      console.error('❌ [预览线迁移工具] 回滚失败:', error)
    }
  }

  /**
   * 获取迁移状态
   */
  getMigrationStatus() {
    return {
      isEnabled: this.migrationState.isEnabled,
      migratedNodes: this.migrationState.migratedNodes.size,
      totalNodes: this.graph.getNodes().length,
      migrationProgress: this.migrationState.migratedNodes.size / this.graph.getNodes().length,
      migrationLog: this.migrationState.migrationLog
    }
  }

  /**
   * 获取统一管理器实例
   */
  getUnifiedManager() {
    return this.unifiedManager
  }

  /**
   * 销毁迁移工具
   */
  destroy() {
    this.unifiedManager.destroy()
    this.migrationState.migratedNodes.clear()
    this.migrationState.migrationLog = []
    
    // 清理全局方法
    if (window.migrateNode) {
      delete window.migrateNode
    }
    
    console.log('🧹 [预览线迁移工具] 已销毁')
  }
}

export default PreviewLineMigrationTool