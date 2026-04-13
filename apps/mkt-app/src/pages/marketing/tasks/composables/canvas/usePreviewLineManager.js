import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

/**
 * 预览线管理相关功能的 composable
 * 提供预览线检查、生成、验证等功能
 */
export function usePreviewLineManager() {
  // 预览线状态
  const previewLineStatus = ref({
    isChecking: false,
    isGenerating: false,
    lastCheckTime: null,
    validityResults: null
  })

  /**
   * 检查预览线有效性
   * @param {Object} graph - X6 图实例
   * @param {Object} previewLineSystem - 预览线系统
   */
  const checkPreviewLineValidity = async (graph, previewLineSystem) => {
    if (!graph) {
      console.warn('[预览线检查] 图实例不存在')
      return null
    }

    previewLineStatus.value.isChecking = true

    try {
      console.log('[预览线检查] 开始检查预览线有效性...')

      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      
      const results = {
        totalNodes: nodes.length,
        configuredNodes: 0,
        expectedPreviewLines: 0,
        actualPreviewLines: 0,
        validPreviewLines: 0,
        invalidPreviewLines: 0,
        missingPreviewLines: [],
        extraPreviewLines: [],
        issues: []
      }

      // 统计配置节点和期望预览线
      const configuredNodeIds = new Set()
      nodes.forEach(node => {
        const nodeData = node.getData() || {}
        const isConfigured = nodeData.isConfigured === true
        
        if (isConfigured) {
          results.configuredNodes++
          configuredNodeIds.add(node.id)
          
          const nodeType = nodeData.type || nodeData.nodeType
          if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
            // 分支节点：根据配置计算预览线数
            const config = nodeData.config || {}
            let branchCount = 0
            
            if (nodeType === 'audience-split' && config.audiences) {
              branchCount = config.audiences.length
            } else if (nodeType === 'event-split') {
              // 事件分流节点固定有2个分支：是/否
              branchCount = config.branches ? config.branches.length : 2
            } else if (nodeType === 'ab-test' && config.variants) {
              branchCount = config.variants.length
            }
            
            results.expectedPreviewLines += Math.max(branchCount, 1)
          } else {
            // 普通节点：1条预览线
            results.expectedPreviewLines += 1
          }
        }
      })

      // 检查实际预览线
      const previewLines = []
      const realConnections = []
      
      edges.forEach(edge => {
        const edgeData = edge.getData() || {}
        const edgeId = edge.id || 'unknown'
        
        const isPreviewLine = edgeData.isPreview === true || 
                             edgeData.isPersistentPreview === true || 
                             edgeData.isUnifiedPreview === true ||
                             edgeData.type === 'preview-line' ||
                             edgeData.type === 'unified-preview-line' ||
                             edgeId.includes('preview')
        
        if (isPreviewLine) {
          previewLines.push({
            id: edgeId,
            source: edge.getSourceCellId(),
            target: edge.getTargetCellId(),
            data: edgeData,
            edge: edge
          })
        } else {
          realConnections.push({
            id: edgeId,
            source: edge.getSourceCellId(),
            target: edge.getTargetCellId(),
            data: edgeData
          })
        }
      })

      results.actualPreviewLines = previewLines.length

      // 验证预览线有效性
      previewLines.forEach(previewLine => {
        const sourceNode = graph.getCellById(previewLine.source)
        const targetNode = graph.getCellById(previewLine.target)
        
        let isValid = true
        const issues = []
        
        // 检查源节点
        if (!sourceNode) {
          isValid = false
          issues.push('源节点不存在')
        } else if (!configuredNodeIds.has(previewLine.source)) {
          isValid = false
          issues.push('源节点未配置')
        }
        
        // 检查目标节点
        if (!targetNode) {
          isValid = false
          issues.push('目标节点不存在')
        }
        
        // 检查预览线数据完整性
        if (!previewLine.data.branchId && sourceNode) {
          const sourceData = sourceNode.getData() || {}
          const nodeType = sourceData.type || sourceData.nodeType
          if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
            issues.push('分支节点预览线缺少branchId')
          }
        }
        
        if (isValid && issues.length === 0) {
          results.validPreviewLines++
        } else {
          results.invalidPreviewLines++
          results.issues.push({
            type: 'invalid_preview_line',
            previewLineId: previewLine.id,
            issues: issues
          })
        }
      })

      // 检查缺失的预览线
      const expectedPreviewLinesByNode = new Map()
      nodes.forEach(node => {
        const nodeData = node.getData() || {}
        if (nodeData.isConfigured === true) {
          const nodeType = nodeData.type || nodeData.nodeType
          const existingPreviewLines = previewLines.filter(pl => pl.source === node.id)
          
          let expectedCount = 1
          if (['audience-split', 'event-split', 'ab-test'].includes(nodeType)) {
            const config = nodeData.config || {}
            if (nodeType === 'audience-split' && config.audiences) {
              expectedCount = config.audiences.length
            } else if (nodeType === 'event-split') {
              // 事件分流节点固定有2个分支：是/否
              expectedCount = config.branches ? config.branches.length : 2
            } else if (nodeType === 'ab-test' && config.variants) {
              expectedCount = config.variants.length
            }
          }
          
          expectedPreviewLinesByNode.set(node.id, expectedCount)
          
          if (existingPreviewLines.length < expectedCount) {
            results.missingPreviewLines.push({
              nodeId: node.id,
              nodeType: nodeType,
              expected: expectedCount,
              actual: existingPreviewLines.length,
              missing: expectedCount - existingPreviewLines.length
            })
          } else if (existingPreviewLines.length > expectedCount) {
            results.extraPreviewLines.push({
              nodeId: node.id,
              nodeType: nodeType,
              expected: expectedCount,
              actual: existingPreviewLines.length,
              extra: existingPreviewLines.length - expectedCount
            })
          }
        }
      })

      // 汇总问题
      if (results.missingPreviewLines.length > 0) {
        results.issues.push({
          type: 'missing_preview_lines',
          count: results.missingPreviewLines.length,
          details: results.missingPreviewLines
        })
      }
      
      if (results.extraPreviewLines.length > 0) {
        results.issues.push({
          type: 'extra_preview_lines',
          count: results.extraPreviewLines.length,
          details: results.extraPreviewLines
        })
      }

      previewLineStatus.value.validityResults = results
      previewLineStatus.value.lastCheckTime = new Date()

      console.log('[预览线检查] 检查完成:', results)
      
      const hasIssues = results.issues.length > 0
      if (hasIssues) {
        Message.warning(`预览线检查完成，发现 ${results.issues.length} 个问题`)
      } else {
        Message.success('预览线检查完成，未发现问题')
      }

      return results

    } catch (error) {
      console.error('[预览线检查] 检查失败:', error)
      previewLineStatus.value.validityResults = {
        error: error.message,
        timestamp: new Date()
      }
      Message.error('预览线检查失败: ' + error.message)
      return null
    } finally {
      previewLineStatus.value.isChecking = false
    }
  }

  /**
   * 触发预览线生成
   * @param {Object} previewLineSystem - 预览线系统
   * @param {Object} graph - X6 图实例
   */
  const triggerPreviewLineGeneration = async (previewLineSystem, graph) => {
    if (!previewLineSystem) {
      console.error('[预览线生成] 预览线系统未初始化')
      Message.error('预览线管理器未初始化，无法生成预览线')
      return null
    }
    
    previewLineStatus.value.isGenerating = true
    
    try {
      console.log('[预览线生成] 开始触发预览线生成...')
      
      // 检查是否有可用的生成方法
      const manager = previewLineSystem.manager || previewLineSystem
      const creator = previewLineSystem.creator || previewLineSystem
      
      const availableMethods = [
        { obj: manager, method: 'triggerPreviewLineGeneration' },
        { obj: creator, method: 'generatePreviewLines' },
        { obj: manager, method: 'updatePreviewLines' },
        { obj: manager, method: 'refreshPreviewLines' }
      ]
      
      let generationTarget = null
      for (const { obj, method } of availableMethods) {
        if (obj && typeof obj[method] === 'function') {
          generationTarget = { obj, method }
          break
        }
      }
      
      if (!generationTarget) {
        throw new Error('预览线系统中未找到可用的生成方法')
      }
      
      console.log(`[预览线生成] 使用方法: ${generationTarget.method}`)
      
      const result = await generationTarget.obj[generationTarget.method]()
      console.log('[预览线生成] 生成完成:', result)
      
      // 解析结果
      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      
      if (result && typeof result === 'object') {
        successCount = result.success ? result.success.length : 0
        failedCount = result.failed ? result.failed.length : 0
        skippedCount = result.skipped ? result.skipped.length : 0
      } else if (typeof result === 'number') {
        successCount = result
      } else if (result === true) {
        successCount = 1
      }
      
      Message.success(`预览线生成完成！成功: ${successCount} 条，失败: ${failedCount} 条，跳过: ${skippedCount} 条`)
      
      return result
      
    } catch (error) {
      console.error('[预览线生成] 生成失败:', error)
      Message.error('预览线生成失败: ' + error.message)
      return null
    } finally {
      previewLineStatus.value.isGenerating = false
    }
  }

  /**
   * 强制重新生成预览线
   * @param {Object} previewLineSystem - 预览线系统
   * @param {Object} graph - X6 图实例
   */
  const forceRegeneratePreviewLines = async (previewLineSystem, graph) => {
    if (!previewLineSystem) {
      console.warn('预览线系统未初始化')
      Message.warning('预览线管理器未就绪')
      return null
    }

    try {
      console.log('🔄 [预览线管理] 开始强制重新生成预览线...')
      
      // 检查可用的强制重新生成方法
      const manager = previewLineSystem.manager || previewLineSystem
      const creator = previewLineSystem.creator || previewLineSystem
      
      const availableMethods = [
        { obj: manager, method: 'forceRegeneratePreviewLines' },
        { obj: manager, method: 'forceRefreshPreviewLines' },
        { obj: manager, method: 'clearAndRegeneratePreviewLines' },
        { obj: manager, method: 'resetPreviewLines' }
      ]
      
      let regenerateTarget = null
      for (const { obj, method } of availableMethods) {
        if (obj && typeof obj[method] === 'function') {
          regenerateTarget = { obj, method }
          break
        }
      }
      
      if (!regenerateTarget) {
        // 如果没有专门的强制重新生成方法，尝试清除后重新生成
        if (manager && typeof manager.clearPreviewLines === 'function' &&
            creator && typeof creator.generatePreviewLines === 'function') {
          console.log('[预览线管理] 使用清除+生成的方式')
          await manager.clearPreviewLines()
          const result = await creator.generatePreviewLines()
          console.log('🔄 [预览线管理] 强制重新生成预览线结果:', result)
          Message.success('预览线已重新生成')
          return result
        } else {
          throw new Error('预览线系统中未找到可用的重新生成方法')
        }
      }
      
      console.log(`[预览线管理] 使用方法: ${regenerateTarget.method}`)
      const result = await regenerateTarget.obj[regenerateTarget.method]()
      console.log('🔄 [预览线管理] 强制重新生成预览线结果:', result)
      
      Message.success('预览线已重新生成')
      return result
      
    } catch (error) {
      console.error('预览线重新生成失败:', error)
      Message.error('预览线重新生成失败: ' + error.message)
      return null
    }
  }

  /**
   * 清理无效预览线
   * @param {Object} graph - X6 图实例
   */
  const cleanupInvalidPreviewLines = (graph) => {
    if (!graph) {
      console.warn('[预览线清理] 图实例不存在')
      return 0
    }

    try {
      console.log('[预览线清理] 开始清理无效预览线...')
      
      const edges = graph.getEdges()
      const nodesToRemove = []
      
      edges.forEach(edge => {
        const edgeData = edge.getData() || {}
        const edgeId = edge.id || 'unknown'
        
        // 识别预览线
        const isPreviewLine = edgeData.isPreview === true || 
                             edgeData.isPersistentPreview === true || 
                             edgeData.isUnifiedPreview === true ||
                             edgeData.type === 'preview-line' ||
                             edgeId.includes('preview')
        
        if (isPreviewLine) {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          const sourceNode = graph.getCellById(sourceId)
          const targetNode = graph.getCellById(targetId)
          
          // 检查预览线是否有效
          let shouldRemove = false
          
          if (!sourceNode || !targetNode) {
            shouldRemove = true
            console.log(`[预览线清理] 发现无效预览线 ${edgeId}: 节点不存在`)
          } else {
            const sourceData = sourceNode.getData() || {}
            if (sourceData.isConfigured !== true) {
              shouldRemove = true
              console.log(`[预览线清理] 发现无效预览线 ${edgeId}: 源节点未配置`)
            }
          }
          
          if (shouldRemove) {
            nodesToRemove.push(edge)
          }
        }
      })
      
      // 移除无效预览线
      nodesToRemove.forEach(edge => {
        try {
          graph.removeCell(edge)
        } catch (error) {
          console.warn('[预览线清理] 移除预览线失败:', error)
        }
      })
      
      console.log(`[预览线清理] 清理完成，移除了 ${nodesToRemove.length} 条无效预览线`)
      
      if (nodesToRemove.length > 0) {
        Message.success(`已清理 ${nodesToRemove.length} 条无效预览线`)
      } else {
        Message.info('未发现需要清理的无效预览线')
      }
      
      return nodesToRemove.length
      
    } catch (error) {
      console.error('[预览线清理] 清理失败:', error)
      Message.error('预览线清理失败: ' + error.message)
      return 0
    }
  }

  return {
    previewLineStatus: computed(() => previewLineStatus.value),
    checkPreviewLineValidity,
    triggerPreviewLineGeneration,
    forceRegeneratePreviewLines,
    cleanupInvalidPreviewLines
  }
}