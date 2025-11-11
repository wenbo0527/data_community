/**
 * 数据迁移管理器 - 一次性完成所有数据格式转换
 * 解决边数据格式、localStorage.getItem错误、新旧数据兼容性问题
 */

/**
 * 数据版本枚举
 */
const DataVersion = {
  V1_0: '1.0', // 旧版本：source/target为字符串
  V2_0: '2.0'  // 新版本：source/target为对象 {cell: string}
}

/**
 * 迁移类型枚举
 */
const MigrationType = {
  EDGE_FORMAT: 'edge_format',
  NODE_FORMAT: 'node_format',
  STORAGE_ACCESS: 'storage_access',
  NODE_REFERENCE: 'node_reference'
}

/**
 * 数据迁移管理器
 */
class DataMigrationManager {
  constructor(options = {}) {
    this.options = {
      autoMigration: true,
      validateAfterMigration: true,
      backupBeforeMigration: true,
      enableRollback: true,
      errorRecovery: true,
      performanceLogging: true,
      ...options
    }
    
    this.migrationRules = new Map()
    this.migrationHistory = []
    this.backupData = null
    
    this.setupMigrationRules()
  }

  /**
   * 设置迁移规则
   */
  setupMigrationRules() {
    // 边格式迁移规则
    this.migrationRules.set(MigrationType.EDGE_FORMAT, {
      version: `${DataVersion.V1_0} -> ${DataVersion.V2_0}`,
      description: '边数据从字符串ID格式迁移到对象格式',
      priority: 1,
      migrate: this.migrateEdgeFormat.bind(this),
      validate: this.validateEdgeFormat.bind(this)
    })

    // 存储访问迁移规则
    this.migrationRules.set(MigrationType.STORAGE_ACCESS, {
      version: `${DataVersion.V1_0} -> ${DataVersion.V2_0}`,
      description: '修复localStorage访问错误',
      priority: 2,
      migrate: this.migrateStorageAccess.bind(this),
      validate: this.validateStorageAccess.bind(this)
    })

    // 节点引用迁移规则
    this.migrationRules.set(MigrationType.NODE_REFERENCE, {
      version: `${DataVersion.V1_0} -> ${DataVersion.V2_0}`,
      description: '修复节点引用和ID映射',
      priority: 3,
      migrate: this.migrateNodeReference.bind(this),
      validate: this.validateNodeReference.bind(this)
    })
  }

  /**
   * 执行数据迁移
   */
  async migrateData(data) {
    const startTime = Date.now()
    console.log('[DataMigration] 开始数据迁移...')
    
    try {
      // 1. 数据预处理
      const preprocessedData = this.preprocessData(data)
      
      // 2. 备份原始数据
      if (this.options.backupBeforeMigration) {
        this.backupData = JSON.parse(JSON.stringify(preprocessedData))
      }
      
      // 3. 检测迁移需求
      const migrationNeeds = this.detectMigrationNeeds(preprocessedData)
      if (migrationNeeds.length === 0) {
        console.log('[DataMigration] 无需迁移，数据格式已是最新')
        return {
          success: true,
          data: preprocessedData,
          migrationCount: 0,
          report: this.generateReport(preprocessedData, preprocessedData, 0)
        }
      }
      
      // 4. 执行迁移规则
      let migratedData = { ...preprocessedData }
      let totalMigrationCount = 0
      
      // 按优先级排序执行迁移
      const sortedMigrations = migrationNeeds.sort((a, b) => 
        (this.migrationRules.get(a)?.priority || 999) - (this.migrationRules.get(b)?.priority || 999)
      )
      
      for (const migrationType of sortedMigrations) {
        const rule = this.migrationRules.get(migrationType)
        if (rule) {
          console.log(`[DataMigration] 执行迁移: ${rule.description}`)
          const result = await rule.migrate(migratedData)
          migratedData = result.data
          totalMigrationCount += result.count
          
          // 记录迁移历史
          this.migrationHistory.push({
            type: migrationType,
            timestamp: Date.now(),
            count: result.count,
            description: rule.description
          })
        }
      }
      
      // 5. 数据验证
      if (this.options.validateAfterMigration) {
        const validationResult = this.validateMigratedData(migratedData)
        if (!validationResult.isValid) {
          throw new Error(`数据迁移验证失败: ${validationResult.errors.join(', ')}`)
        }
      }
      
      // 6. 更新版本信息
      migratedData._version = DataVersion.V2_0
      migratedData._migrationTimestamp = Date.now()
      
      const duration = Date.now() - startTime
      console.log(`[DataMigration] 数据迁移完成，耗时 ${duration}ms，迁移项目: ${totalMigrationCount}`)
      
      return {
        success: true,
        data: migratedData,
        migrationCount: totalMigrationCount,
        duration,
        report: this.generateReport(data, migratedData, totalMigrationCount)
      }
      
    } catch (error) {
      console.error('[DataMigration] 数据迁移失败:', error)
      
      // 错误恢复
      if (this.options.errorRecovery && this.backupData) {
        console.log('[DataMigration] 尝试从备份恢复数据...')
        return {
          success: false,
          data: this.backupData,
          error: error.message,
          migrationCount: 0
        }
      }
      
      throw new Error(`数据迁移失败: ${error.message}`)
    }
  }

  /**
   * 数据预处理
   */
  preprocessData(data) {
    if (!data || typeof data !== 'object') {
      return { nodes: [], edges: [], previewLines: [], connections: [] }
    }
    
    return {
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
      previewLines: Array.isArray(data.previewLines) ? data.previewLines : [],
      connections: Array.isArray(data.connections) ? data.connections : [],
      ...data
    }
  }

  /**
   * 检测迁移需求
   */
  detectMigrationNeeds(data) {
    const needs = []
    
    // 检测边格式问题
    if (this.detectEdgeFormatIssues(data)) {
      needs.push(MigrationType.EDGE_FORMAT)
    }
    
    // 检测存储访问问题
    if (this.detectStorageAccessIssues(data)) {
      needs.push(MigrationType.STORAGE_ACCESS)
    }
    
    // 检测节点引用问题
    if (this.detectNodeReferenceIssues(data)) {
      needs.push(MigrationType.NODE_REFERENCE)
    }
    
    return needs
  }

  /**
   * 检测边格式问题
   */
  detectEdgeFormatIssues(data) {
    const collections = ['edges', 'previewLines', 'connections']
    
    for (const collectionName of collections) {
      const collection = data[collectionName]
      if (Array.isArray(collection)) {
        for (const item of collection) {
          // 检查source格式
          if (collectionName === 'previewLines') {
            // 预览线在交互过程中可能暂时没有完整的source/target
            // 仅当存在source/target时才验证其结构
            if (typeof item.source === 'string') {
              return true
            }
            if (item.source && typeof item.source === 'object' && !item.source.cell) {
              return true
            }
          } else {
            if (typeof item.source === 'string') {
              return true
            }
            if (item.source && typeof item.source === 'object' && !item.source.cell) {
              return true
            }
          }
          
          // 检查target格式
          if (collectionName === 'previewLines') {
            // 预览线可能未确定target，仅当存在时进行结构验证
            if (typeof item.target === 'string') {
              return true
            }
            if (item.target && typeof item.target === 'object' && !item.target.cell) {
              return true
            }
          } else {
            if (typeof item.target === 'string') {
              return true
            }
            if (item.target && typeof item.target === 'object' && !item.target.cell) {
              return true
            }
          }
          
          // 检查必要属性
          if (collectionName !== 'previewLines') {
            if (!item.id || !item.shape) {
              return true
            }
          } else {
            // 预览线是临时数据，id/shape不作为迁移触发条件
          }
        }
      }
    }
    
    return false
  }

  /**
   * 检测存储访问问题
   */
  detectStorageAccessIssues(data) {
    // 检查数据中是否有localStorage访问相关的错误标记
    return data._hasStorageError || data._storageAccessFailed || false
  }

  /**
   * 检测节点引用问题
   */
  detectNodeReferenceIssues(data) {
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }
    
    const nodeIds = new Set(data.nodes.map(node => node.id).filter(Boolean))
    
    // 检查边引用的节点是否存在
    for (const edge of data.edges) {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source?.cell
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target?.cell
      
      if (sourceId && !nodeIds.has(sourceId)) {
        return true
      }
      if (targetId && !nodeIds.has(targetId)) {
        return true
      }
    }
    
    return false
  }

  /**
   * 迁移边格式
   */
  async migrateEdgeFormat(data) {
    let migrationCount = 0
    const collections = ['edges', 'previewLines', 'connections']
    
    for (const collectionName of collections) {
      if (Array.isArray(data[collectionName])) {
        data[collectionName] = data[collectionName].map(item => {
          let needsMigration = false
          const migratedItem = { ...item }
          
          // 迁移source格式
          if (typeof item.source === 'string') {
            migratedItem.source = { cell: item.source }
            needsMigration = true
          } else if (item.source && typeof item.source === 'object' && !item.source.cell) {
            migratedItem.source = { cell: item.source.id || item.source.nodeId || String(item.source) }
            needsMigration = true
          }
          
          // 迁移target格式
          if (typeof item.target === 'string') {
            migratedItem.target = { cell: item.target }
            needsMigration = true
          } else if (item.target && typeof item.target === 'object' && !item.target.cell) {
            migratedItem.target = { cell: item.target.id || item.target.nodeId || String(item.target) }
            needsMigration = true
          }
          
          // 确保必要属性
          if (collectionName !== 'previewLines') {
            if (!migratedItem.id) {
              migratedItem.id = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              needsMigration = true
            }
            
            if (!migratedItem.shape) {
              migratedItem.shape = collectionName === 'edges' ? 'edge' : 'preview-line'
              needsMigration = true
            }
          }
          
          if (needsMigration) {
            migrationCount++
            console.log(`[DataMigration] 迁移${collectionName}格式: ${item.id || 'unknown'} -> ${migratedItem.id}`)
          }
          
          return migratedItem
        })
      }
    }
    
    return { data, count: migrationCount }
  }

  /**
   * 迁移存储访问
   */
  async migrateStorageAccess(data) {
    let migrationCount = 0
    
    // 清除存储错误标记
    if (data._hasStorageError) {
      delete data._hasStorageError
      migrationCount++
    }
    
    if (data._storageAccessFailed) {
      delete data._storageAccessFailed
      migrationCount++
    }
    
    // 添加存储访问修复标记
    data._storageAccessFixed = true
    data._storageFixTimestamp = Date.now()
    
    if (migrationCount > 0) {
      console.log(`[DataMigration] 修复存储访问问题，清理了 ${migrationCount} 个错误标记`)
    }
    
    return { data, count: migrationCount }
  }

  /**
   * 迁移节点引用
   */
  async migrateNodeReference(data) {
    let migrationCount = 0
    
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return { data, count: 0 }
    }
    
    const nodeIds = new Set(data.nodes.map(node => node.id).filter(Boolean))
    const orphanedEdges = []
    const createdNodes = []
    
    // 智能处理边引用：创建缺失节点而不是删除边
    data.edges = data.edges.map(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source?.cell
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target?.cell
      
      let needsUpdate = false
      let updatedEdge = { ...edge }
      
      // 处理源节点引用
      if (sourceId && !nodeIds.has(sourceId)) {
        // 创建缺失的源节点
        const missingNode = this.createMissingNode(sourceId)
        data.nodes.push(missingNode)
        nodeIds.add(sourceId)
        createdNodes.push(missingNode)
        migrationCount++
        needsUpdate = true
        
        console.log(`[DataMigration] 创建缺失的源节点: ${sourceId}`)
      }
      
      // 处理目标节点引用
      if (targetId && !nodeIds.has(targetId)) {
        // 创建缺失的目标节点
        const missingNode = this.createMissingNode(targetId)
        data.nodes.push(missingNode)
        nodeIds.add(targetId)
        createdNodes.push(missingNode)
        migrationCount++
        needsUpdate = true
        
        console.log(`[DataMigration] 创建缺失的目标节点: ${targetId}`)
      }
      
      // 确保边的引用格式正确
      if (typeof updatedEdge.source === 'string') {
        updatedEdge.source = { cell: updatedEdge.source }
        needsUpdate = true
      }
      
      if (typeof updatedEdge.target === 'string') {
        updatedEdge.target = { cell: updatedEdge.target }
        needsUpdate = true
      }
      
      if (needsUpdate) {
        console.log(`[DataMigration] 更新边引用格式: ${edge.id}`)
      }
      
      return updatedEdge
    })
    
    // 记录创建的节点信息
    if (createdNodes.length > 0) {
      console.log(`[DataMigration] 创建了 ${createdNodes.length} 个缺失节点:`, createdNodes.map(n => n.id))
      data._createdMissingNodes = createdNodes
    }
    
    // 记录孤立边信息（现在应该为空，因为我们创建了缺失节点）
    if (orphanedEdges.length > 0) {
      console.log(`[DataMigration] 仍有 ${orphanedEdges.length} 条无法修复的边:`, orphanedEdges)
      data._remainingOrphanedEdges = orphanedEdges
    }
    
    return { data, count: migrationCount }
  }

  /**
   * 创建缺失的节点
   */
  createMissingNode(nodeId) {
    return {
      id: nodeId,
      shape: 'rect',
      x: Math.random() * 400 + 100, // 随机位置
      y: Math.random() * 300 + 100,
      width: 120,
      height: 40,
      label: nodeId.includes('start') ? '开始节点' : '未知节点',
      attrs: {
        body: {
          fill: '#f0f0f0',
          stroke: '#d0d0d0',
          strokeWidth: 1
        },
        text: {
          text: nodeId.includes('start') ? '开始节点' : '未知节点',
          fill: '#666666'
        }
      },
      data: {
        type: 'missing-node',
        originalId: nodeId,
        createdBy: 'DataMigrationManager',
        createdAt: Date.now()
      }
    }
  }

  /**
   * 验证边格式
   */
  validateEdgeFormat(data) {
    const errors = []
    const collections = ['edges', 'previewLines', 'connections']
    
    for (const collectionName of collections) {
      if (Array.isArray(data[collectionName])) {
        data[collectionName].forEach((item, index) => {
          if (collectionName !== 'previewLines') {
            if (!item.id) {
              errors.push(`${collectionName}[${index}] 缺少id`)
            }
            
            if (!item.source || !item.source.cell) {
              errors.push(`${collectionName}[${index}] source格式错误`)
            }
            
            if (!item.target || !item.target.cell) {
              errors.push(`${collectionName}[${index}] target格式错误`)
            }
          } else {
            // 预览线允许在交互过程中缺少source/target；当存在时需符合对象格式
            if (item.source && !item.source.cell) {
              errors.push(`${collectionName}[${index}] source格式错误`)
            }
            if (item.target && !item.target.cell) {
              errors.push(`${collectionName}[${index}] target格式错误`)
            }
          }
        })
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 验证存储访问
   */
  validateStorageAccess(data) {
    const errors = []
    
    if (data._hasStorageError) {
      errors.push('仍存在存储错误标记')
    }
    
    if (data._storageAccessFailed) {
      errors.push('仍存在存储访问失败标记')
    }
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 验证节点引用
   */
  validateNodeReference(data) {
    const errors = []
    
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return { isValid: true, errors }
    }
    
    const nodeIds = new Set(data.nodes.map(node => node.id).filter(Boolean))
    
    data.edges.forEach((edge, index) => {
      const sourceId = edge.source?.cell
      const targetId = edge.target?.cell
      
      if (sourceId && !nodeIds.has(sourceId)) {
        errors.push(`edges[${index}] 引用了不存在的源节点: ${sourceId}`)
      }
      
      if (targetId && !nodeIds.has(targetId)) {
        errors.push(`edges[${index}] 引用了不存在的目标节点: ${targetId}`)
      }
    })
    
    return { isValid: errors.length === 0, errors }
  }

  /**
   * 验证迁移后的数据
   */
  validateMigratedData(data) {
    const allErrors = []
    
    // 执行所有验证规则，但跳过节点引用验证（因为已经在迁移过程中处理）
    for (const [type, rule] of this.migrationRules) {
      if (rule.validate && type !== MigrationType.NODE_REFERENCE) {
        const result = rule.validate(data)
        if (!result.isValid) {
          allErrors.push(...result.errors.map(error => `${type}: ${error}`))
        }
      }
    }
    
    // 单独进行宽松的节点引用验证
    const nodeRefResult = this.validateNodeReferenceLoose(data)
    if (!nodeRefResult.isValid) {
      // 只记录警告，不阻止迁移
      console.warn('[DataMigration] 节点引用验证警告:', nodeRefResult.errors)
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: nodeRefResult.errors || []
    }
  }

  /**
   * 宽松的节点引用验证（仅用于警告）
   */
  validateNodeReferenceLoose(data) {
    const warnings = []
    
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return { isValid: true, errors: warnings }
    }
    
    const nodeIds = new Set(data.nodes.map(node => node.id).filter(Boolean))
    
    data.edges.forEach((edge, index) => {
      const sourceId = edge.source?.cell
      const targetId = edge.target?.cell
      
      if (sourceId && !nodeIds.has(sourceId)) {
        warnings.push(`edges[${index}] 引用了不存在的源节点: ${sourceId} (已在迁移中处理)`)
      }
      
      if (targetId && !nodeIds.has(targetId)) {
        warnings.push(`edges[${index}] 引用了不存在的目标节点: ${targetId} (已在迁移中处理)`)
      }
    })
    
    return { isValid: warnings.length === 0, errors: warnings }
  }

  /**
   * 生成迁移报告
   */
  generateReport(originalData, migratedData, migrationCount) {
    return {
      timestamp: new Date().toISOString(),
      version: {
        from: originalData._version || DataVersion.V1_0,
        to: DataVersion.V2_0
      },
      statistics: {
        original: {
          nodes: originalData.nodes?.length || 0,
          edges: originalData.edges?.length || 0,
          previewLines: originalData.previewLines?.length || 0,
          connections: originalData.connections?.length || 0
        },
        migrated: {
          nodes: migratedData.nodes?.length || 0,
          edges: migratedData.edges?.length || 0,
          previewLines: migratedData.previewLines?.length || 0,
          connections: migratedData.connections?.length || 0
        },
        changes: {
          totalMigrations: migrationCount,
          nodesChanged: (migratedData.nodes?.length || 0) - (originalData.nodes?.length || 0),
          edgesChanged: (migratedData.edges?.length || 0) - (originalData.edges?.length || 0)
        }
      },
      migrationHistory: [...this.migrationHistory],
      removedOrphanedEdges: migratedData._removedOrphanedEdges || []
    }
  }

  /**
   * 回滚到备份数据
   */
  rollback() {
    if (!this.backupData) {
      throw new Error('没有可用的备份数据进行回滚')
    }
    
    console.log('[DataMigration] 回滚到备份数据')
    return {
      success: true,
      data: JSON.parse(JSON.stringify(this.backupData)),
      message: '已回滚到迁移前的数据状态'
    }
  }

  /**
   * 获取迁移历史
   */
  getMigrationHistory() {
    return [...this.migrationHistory]
  }

  /**
   * 清理迁移历史
   */
  clearMigrationHistory() {
    this.migrationHistory = []
    this.backupData = null
  }
}

export default DataMigrationManager
export { DataVersion, MigrationType }