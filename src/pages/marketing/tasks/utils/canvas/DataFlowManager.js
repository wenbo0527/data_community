/**
 * 数据流程管理器
 * 统一管理数据加载、保存、发布流程，包含数据校验和自动修复机制
 */

import { validateCanvasData } from './canvasValidation.js'
import { validateForPublish, validateForSave } from './enhancedCanvasValidation.js'
import { Message } from '@arco-design/web-vue'

export class DataFlowManager {
  constructor(options = {}) {
    this.options = {
      autoFix: true,
      validateOnLoad: true,
      validateOnSave: true,
      validateOnPublish: true,
      enableBackup: true,
      maxBackupCount: 10,
      ...options
    }
    
    this.backupHistory = []
    this.validationCache = new Map()
    this.isProcessing = false
  }

  /**
   * 增强的数据加载流程
   * @param {Object} rawData - 原始数据
   * @param {Object} options - 加载选项
   * @returns {Promise<Object>} 处理后的数据
   */
  async loadData(rawData, options = {}) {
    console.log('[DataFlowManager] 开始数据加载流程')
    
    if (this.isProcessing) {
      throw new Error('数据流程正在处理中，请稍后重试')
    }
    
    this.isProcessing = true
    
    try {
      // 1. 数据预处理
      const preprocessedData = await this.preprocessData(rawData)
      
      // 2. 数据校验
      if (this.options.validateOnLoad) {
        const validationResult = await this.validateData(preprocessedData, 'load')
        
        if (!validationResult.isValid && !this.options.autoFix) {
          throw new Error(`数据校验失败: ${validationResult.errors.join(', ')}`)
        }
        
        // 3. 自动修复（如果启用）
        if (!validationResult.isValid && this.options.autoFix) {
          console.log('[DataFlowManager] 检测到数据问题，开始自动修复')
          const fixedData = await this.autoFixData(preprocessedData, validationResult)
          
          if (fixedData) {
            console.log('[DataFlowManager] 数据自动修复成功')
            return {
              success: true,
              data: fixedData,
              warnings: validationResult.warnings,
              autoFixed: true
            }
          }
        }
      }
      
      // 4. 创建备份
      if (this.options.enableBackup) {
        this.createBackup(preprocessedData, 'load')
      }
      
      console.log('[DataFlowManager] 数据加载完成')
      return {
        success: true,
        data: preprocessedData,
        warnings: [],
        autoFixed: false
      }
      
    } catch (error) {
      console.error('[DataFlowManager] 数据加载失败:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 增强的数据保存流程
   * @param {Object} canvasData - 画布数据
   * @param {Object} options - 保存选项
   * @returns {Promise<Object>} 保存结果
   */
  async saveData(canvasData, options = {}) {
    console.log('[DataFlowManager] 开始数据保存流程')
    
    if (this.isProcessing) {
      throw new Error('数据流程正在处理中，请稍后重试')
    }
    
    this.isProcessing = true
    
    try {
      // 1. 保存前校验
      if (this.options.validateOnSave) {
        const validationResult = await this.validateData(canvasData, 'save')
        
        if (!validationResult.isValid) {
          return {
            success: false,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            canAutoFix: validationResult.canAutoFix
          }
        }
        
        if (validationResult.warnings.length > 0) {
          console.warn('[DataFlowManager] 保存时发现警告:', validationResult.warnings)
        }
      }
      
      // 2. 数据序列化和格式化
      const formattedData = await this.formatDataForSave(canvasData)
      
      // 3. 创建备份
      if (this.options.enableBackup) {
        this.createBackup(canvasData, 'save')
      }
      
      // 4. 执行保存
      const saveResult = await this.performSave(formattedData, options)
      
      console.log('[DataFlowManager] 数据保存完成')
      return {
        success: true,
        data: saveResult,
        warnings: []
      }
      
    } catch (error) {
      console.error('[DataFlowManager] 数据保存失败:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 增强的数据发布流程
   * @param {Object} canvasData - 画布数据
   * @param {Object} options - 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async publishData(canvasData, options = {}) {
    console.log('[DataFlowManager] 开始数据发布流程')
    
    if (this.isProcessing) {
      throw new Error('数据流程正在处理中，请稍后重试')
    }
    
    this.isProcessing = true
    
    try {
      // 1. 发布前完整校验
      if (this.options.validateOnPublish) {
        const validationResult = await this.validateData(canvasData, 'publish')
        
        if (!validationResult.isValid) {
          // 尝试自动修复
          if (validationResult.canAutoFix && this.options.autoFix) {
            console.log('[DataFlowManager] 检测到发布问题，开始自动修复')
            const fixedData = await this.autoFixData(canvasData, validationResult)
            
            if (fixedData) {
              console.log('[DataFlowManager] 发布数据自动修复成功')
              canvasData = fixedData
            } else {
              return {
                success: false,
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                canAutoFix: false
              }
            }
          } else {
            return {
              success: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              canAutoFix: validationResult.canAutoFix
            }
          }
        }
      }
      
      // 2. 数据优化和格式化
      const optimizedData = await this.optimizeDataForPublish(canvasData)
      
      // 3. 创建发布备份
      if (this.options.enableBackup) {
        this.createBackup(canvasData, 'publish')
      }
      
      // 4. 执行发布
      const publishResult = await this.performPublish(optimizedData, options)
      
      console.log('[DataFlowManager] 数据发布完成')
      return {
        success: true,
        data: publishResult,
        warnings: []
      }
      
    } catch (error) {
      console.error('[DataFlowManager] 数据发布失败:', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 数据预处理
   * @param {Object} rawData - 原始数据
   * @returns {Promise<Object>} 预处理后的数据
   */
  async preprocessData(rawData) {
    console.log('[DataFlowManager] 开始数据预处理')
    
    if (!rawData) {
      return { nodes: [], connections: [] }
    }
    
    const processed = {
      nodes: Array.isArray(rawData.nodes) ? [...rawData.nodes] : [],
      connections: Array.isArray(rawData.connections) ? [...rawData.connections] : []
    }
    
    // 数据清理和标准化
    processed.nodes = processed.nodes.map(node => this.normalizeNodeData(node))
    processed.connections = processed.connections.map(conn => this.normalizeConnectionData(conn))
    
    // 移除无效数据
    processed.nodes = processed.nodes.filter(node => node && node.id && node.type)
    processed.connections = processed.connections.filter(conn => 
      conn && conn.id && conn.source && conn.target
    )
    
    console.log('[DataFlowManager] 数据预处理完成:', {
      nodes: processed.nodes.length,
      connections: processed.connections.length
    })
    
    return processed
  }

  /**
   * 数据校验
   * @param {Object} data - 待校验数据
   * @param {string} context - 校验上下文 ('load', 'save', 'publish')
   * @returns {Promise<Object>} 校验结果
   */
  async validateData(data, context = 'general') {
    console.log(`[DataFlowManager] 开始${context}校验`)
    
    // 检查缓存
    const cacheKey = `${context}_${this.generateDataHash(data)}`
    if (this.validationCache.has(cacheKey)) {
      console.log('[DataFlowManager] 使用缓存的校验结果')
      return this.validationCache.get(cacheKey)
    }
    
    let result
    
    switch (context) {
      case 'save':
        result = validateForSave ? validateForSave(data) : validateCanvasData(data)
        break
      case 'publish':
        result = validateForPublish ? validateForPublish(data, { autoFix: this.options.autoFix }) : validateCanvasData(data)
        break
      default:
        result = validateCanvasData(data)
    }
    
    // 缓存结果
    this.validationCache.set(cacheKey, result)
    
    console.log(`[DataFlowManager] ${context}校验完成:`, {
      isValid: result.isValid,
      errors: result.errors?.length || 0,
      warnings: result.warnings?.length || 0
    })
    
    return result
  }

  /**
   * 自动修复数据
   * @param {Object} data - 待修复数据
   * @param {Object} validationResult - 校验结果
   * @returns {Promise<Object|null>} 修复后的数据或null
   */
  async autoFixData(data, validationResult) {
    console.log('[DataFlowManager] 开始自动修复数据')
    
    try {
      let fixedData = JSON.parse(JSON.stringify(data)) // 深拷贝
      let hasChanges = false
      
      // 1. 修复缺失的开始节点
      const startNodes = fixedData.nodes.filter(node => node.type === 'start')
      if (startNodes.length === 0) {
        const startNode = {
          id: 'auto-start-node',
          type: 'start',
          label: '开始',
          position: { x: 100, y: 100 },
          data: {
            type: 'start',
            isConfigured: true,
            config: { name: '开始节点', description: '自动添加的开始节点' }
          }
        }
        fixedData.nodes.unshift(startNode)
        hasChanges = true
        console.log('[DataFlowManager] 自动添加开始节点')
      }
      
      // 2. 修复重复的开始节点
      if (startNodes.length > 1) {
        fixedData.nodes = fixedData.nodes.filter((node, index) => {
          if (node.type === 'start') {
            return index === fixedData.nodes.findIndex(n => n.type === 'start')
          }
          return true
        })
        hasChanges = true
        console.log('[DataFlowManager] 移除重复的开始节点')
      }
      
      // 3. 修复节点位置
      fixedData.nodes.forEach(node => {
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          node.position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
          hasChanges = true
        }
      })
      
      // 4. 修复连接引用
      const nodeIds = new Set(fixedData.nodes.map(node => node.id))
      fixedData.connections = fixedData.connections.filter(conn => {
        return nodeIds.has(conn.source) && nodeIds.has(conn.target)
      })
      
      if (hasChanges) {
        console.log('[DataFlowManager] 数据自动修复完成')
        return fixedData
      }
      
      return null
      
    } catch (error) {
      console.error('[DataFlowManager] 自动修复失败:', error)
      return null
    }
  }

  /**
   * 创建数据备份
   * @param {Object} data - 待备份数据
   * @param {string} context - 备份上下文
   */
  createBackup(data, context) {
    const backup = {
      timestamp: Date.now(),
      context,
      data: JSON.parse(JSON.stringify(data)),
      id: `backup_${context}_${Date.now()}`
    }
    
    this.backupHistory.push(backup)
    
    // 限制备份数量
    if (this.backupHistory.length > this.options.maxBackupCount) {
      this.backupHistory.shift()
    }
    
    console.log(`[DataFlowManager] 创建${context}备份:`, backup.id)
  }

  /**
   * 恢复备份
   * @param {string} backupId - 备份ID
   * @returns {Object|null} 备份数据
   */
  restoreBackup(backupId) {
    const backup = this.backupHistory.find(b => b.id === backupId)
    if (backup) {
      console.log('[DataFlowManager] 恢复备份:', backupId)
      return JSON.parse(JSON.stringify(backup.data))
    }
    return null
  }

  /**
   * 标准化节点数据
   * @param {Object} node - 节点数据
   * @returns {Object} 标准化后的节点数据
   */
  normalizeNodeData(node) {
    return {
      id: node.id,
      type: node.type,
      label: node.label || node.type,
      position: node.position || { x: node.x || 0, y: node.y || 0 },
      data: {
        type: node.type,
        isConfigured: node.data?.isConfigured || false,
        config: node.data?.config || node.config || {},
        ...node.data
      },
      ...node
    }
  }

  /**
   * 标准化连接数据
   * @param {Object} connection - 连接数据
   * @returns {Object} 标准化后的连接数据
   */
  normalizeConnectionData(connection) {
    return {
      id: connection.id,
      source: connection.source,
      target: connection.target,
      sourcePort: connection.sourcePort || 'out',
      targetPort: connection.targetPort || 'in',
      data: connection.data || {},
      ...connection
    }
  }

  /**
   * 格式化保存数据
   * @param {Object} data - 原始数据
   * @returns {Promise<Object>} 格式化后的数据
   */
  async formatDataForSave(data) {
    return {
      ...data,
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        nodeCount: data.nodes?.length || 0,
        connectionCount: data.connections?.length || 0
      }
    }
  }

  /**
   * 优化发布数据
   * @param {Object} data - 原始数据
   * @returns {Promise<Object>} 优化后的数据
   */
  async optimizeDataForPublish(data) {
    // 移除调试信息和临时数据
    const optimized = JSON.parse(JSON.stringify(data))
    
    optimized.nodes = optimized.nodes.map(node => {
      const cleaned = { ...node }
      delete cleaned.debug
      delete cleaned.temp
      return cleaned
    })
    
    return optimized
  }

  /**
   * 执行保存操作
   * @param {Object} data - 格式化后的数据
   * @param {Object} options - 保存选项
   * @returns {Promise<Object>} 保存结果
   */
  async performSave(data, options) {
    // 这里应该调用实际的保存API
    console.log('[DataFlowManager] 执行保存操作')
    return { saved: true, timestamp: Date.now() }
  }

  /**
   * 执行发布操作
   * @param {Object} data - 优化后的数据
   * @param {Object} options - 发布选项
   * @returns {Promise<Object>} 发布结果
   */
  async performPublish(data, options) {
    // 这里应该调用实际的发布API
    console.log('[DataFlowManager] 执行发布操作')
    return { published: true, timestamp: Date.now() }
  }

  /**
   * 生成数据哈希用于缓存
   * @param {Object} data - 数据对象
   * @returns {string} 哈希值
   */
  generateDataHash(data) {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString()
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.validationCache.clear()
    console.log('[DataFlowManager] 缓存已清理')
  }

  /**
   * 获取备份历史
   * @returns {Array} 备份历史列表
   */
  getBackupHistory() {
    return [...this.backupHistory]
  }
}

// 创建全局实例
export const globalDataFlowManager = new DataFlowManager()

// 导出便捷方法
export const loadCanvasData = (data, options) => globalDataFlowManager.loadData(data, options)
export const saveCanvasData = (data, options) => globalDataFlowManager.saveData(data, options)
export const publishCanvasData = (data, options) => globalDataFlowManager.publishData(data, options)