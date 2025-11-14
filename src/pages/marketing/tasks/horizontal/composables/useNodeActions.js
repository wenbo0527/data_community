import { computed } from 'vue'

/**
 * 节点操作组合式函数
 * 处理节点操作菜单、动作执行和权限管理
 */
export function useNodeActions() {
  
  /**
   * 获取可用操作列表
   * @param {string} nodeType - 节点类型
   * @param {boolean} isDisabled - 节点是否禁用
   * @param {Object} permissions - 权限配置
   * @returns {Array} 可用操作列表
   */
  function getAvailableActions(nodeType, isDisabled = false, permissions = {}) {
    const defaultPermissions = {
      canRename: true,
      canCopy: true,
      canDelete: true,
      canDisable: true,
      canDebug: true,
      canConfigure: true
    }
    
    const perms = { ...defaultPermissions, ...permissions }
    
    const actions = []
    
    // 配置操作（所有非结束节点）
    if (nodeType !== 'end' && perms.canConfigure) {
      actions.push({
        key: 'configure',
        label: '配置',
        icon: '⚙️',
        order: 1,
        danger: false,
        disabled: isDisabled
      })
    }
    
    // 重命名操作
    if (perms.canRename) {
      actions.push({
        key: 'rename',
        label: '重命名',
        icon: '✏️',
        order: 2,
        danger: false,
        disabled: isDisabled
      })
    }
    
    // 复制操作
    if (perms.canCopy) {
      actions.push({
        key: 'copy',
        label: '复制',
        icon: '📋',
        order: 3,
        danger: false,
        disabled: isDisabled
      })
    }
    
    // 调试操作
    if (perms.canDebug) {
      actions.push({
        key: 'debug',
        label: '调试',
        icon: '🐛',
        order: 4,
        danger: false,
        disabled: false // 调试操作不受禁用状态影响
      })
    }
    
    // 禁用/启用操作
    if (perms.canDisable && nodeType !== 'start' && nodeType !== 'end') {
      actions.push({
        key: 'toggle',
        label: isDisabled ? '启用' : '禁用',
        icon: isDisabled ? '▶️' : '⏸️',
        order: 5,
        danger: false,
        disabled: false
      })
    }
    
    // 删除操作（开始和结束节点不允许删除）
    if (nodeType !== 'start' && nodeType !== 'end' && perms.canDelete) {
      actions.push({
        key: 'delete',
        label: '删除',
        icon: '🗑️',
        order: 10,
        danger: true,
        disabled: false
      })
    }
    
    // 按order排序
    return actions.sort((a, b) => a.order - b.order)
  }
  
  /**
   * 处理节点操作
   * @param {string} actionKey - 操作键
   * @param {Object} context - 操作上下文
   * @returns {Object} 操作结果
   */
  function handleNodeAction(actionKey, context = {}) {
    const { nodeType, nodeData, nodeConfig, nodeId, graph } = context
    
    const results = {
      success: false,
      action: actionKey,
      message: '',
      data: null,
      error: null
    }
    
    try {
      switch (actionKey) {
        case 'configure':
          results.data = handleConfigure(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '配置操作已触发'
          break
          
        case 'rename':
          results.data = handleRename(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '重命名操作已触发'
          break
          
        case 'copy':
          results.data = handleCopy(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '复制操作已触发'
          break
          
        case 'debug':
          results.data = handleDebug(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '调试信息已输出'
          break
          
        case 'toggle':
          results.data = handleToggle(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '状态切换已触发'
          break
          
        case 'delete':
          results.data = handleDelete(nodeType, nodeData, nodeConfig, nodeId, graph)
          results.success = true
          results.message = '删除操作已触发'
          break
          
        default:
          results.error = new Error(`未知操作: ${actionKey}`)
          results.message = '操作类型不支持'
      }
    } catch (error) {
      results.error = error
      results.message = `操作失败: ${error.message}`
      results.success = false
    }
    
    return results
  }
  
  /**
   * 处理配置操作
   * @private
   */
  function handleConfigure(nodeType, nodeData, nodeConfig, nodeId, graph) {
    console.log(`📝 [NodeAction] 配置节点:`, {
      nodeId,
      nodeType,
      nodeData,
      nodeConfig
    })
    
    // 这里可以触发配置抽屉的打开
    return {
      action: 'configure',
      nodeId,
      nodeType,
      timestamp: Date.now()
    }
  }
  
  /**
   * 处理重命名操作
   * @private
   */
  function handleRename(nodeType, nodeData, nodeConfig, nodeId, graph) {
    console.log(`✏️ [NodeAction] 重命名节点:`, {
      nodeId,
      nodeType,
      currentName: nodeConfig.nodeName || nodeData.nodeName || '未命名'
    })
    
    // 这里可以触发重命名对话框
    return {
      action: 'rename',
      nodeId,
      nodeType,
      currentName: nodeConfig.nodeName || nodeData.nodeName || '未命名',
      timestamp: Date.now()
    }
  }
  
  /**
   * 处理复制操作
   * @private
   */
  function handleCopy(nodeType, nodeData, nodeConfig, nodeId, graph) {
    console.log(`📋 [NodeAction] 复制节点:`, {
      nodeId,
      nodeType,
      nodeData,
      nodeConfig
    })
    
    // 这里可以实现节点复制逻辑
    return {
      action: 'copy',
      nodeId,
      nodeType,
      copiedData: JSON.parse(JSON.stringify({ nodeData, nodeConfig })),
      timestamp: Date.now()
    }
  }
  
  /**
   * 处理调试操作
   * @private
   */
  function handleDebug(nodeType, nodeData, nodeConfig, nodeId, graph) {
    console.log(`🐛 [NodeAction] 调试节点:`, {
      nodeId,
      nodeType,
      nodeData,
      nodeConfig,
      debugInfo: {
        type: nodeType,
        id: nodeId,
        configKeys: Object.keys(nodeConfig || {}),
        dataKeys: Object.keys(nodeData || {}),
        timestamp: Date.now(),
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'N/A'
      }
    })
    
    return {
      action: 'debug',
      nodeId,
      nodeType,
      debugInfo: {
        config: nodeConfig,
        data: nodeData,
        timestamp: Date.now()
      }
    }
  }
  
  /**
   * 处理切换状态操作
   * @private
   */
  function handleToggle(nodeType, nodeData, nodeConfig, nodeId, graph) {
    const currentDisabled = nodeData.disabled || false
    const newDisabled = !currentDisabled
    
    console.log(`🔄 [NodeAction] 切换节点状态:`, {
      nodeId,
      nodeType,
      from: currentDisabled ? '禁用' : '启用',
      to: newDisabled ? '禁用' : '启用'
    })
    
    // 这里可以实现禁用/启用逻辑
    return {
      action: 'toggle',
      nodeId,
      nodeType,
      previousState: currentDisabled,
      newState: newDisabled,
      timestamp: Date.now()
    }
  }
  
  /**
   * 处理删除操作
   * @private
   */
  function handleDelete(nodeType, nodeData, nodeConfig, nodeId, graph) {
    console.log(`🗑️ [NodeAction] 删除节点:`, {
      nodeId,
      nodeType,
      nodeData,
      nodeConfig
    })
    
    // 这里可以实现删除逻辑
    return {
      action: 'delete',
      nodeId,
      nodeType,
      deletedData: JSON.parse(JSON.stringify({ nodeData, nodeConfig })),
      timestamp: Date.now()
    }
  }
  
  /**
   * 验证操作权限
   * @param {string} actionKey - 操作键
   * @param {Object} context - 操作上下文
   * @returns {boolean} 是否有权限
   */
  function validateActionPermission(actionKey, context) {
    const { nodeType, permissions = {} } = context
    const availableActions = getAvailableActions(nodeType, false, permissions)
    const action = availableActions.find(a => a.key === actionKey)
    
    return action && !action.disabled
  }
  
  /**
   * 获取操作历史记录
   * @param {number} limit - 限制数量
   * @returns {Array} 操作历史
   */
  function getActionHistory(limit = 10) {
    // 这里可以实现操作历史记录功能
    return []
  }
  
  /**
   * 清除操作历史
   */
  function clearActionHistory() {
    // 这里可以实现清除历史记录功能
  }
  
  return {
    getAvailableActions,
    handleNodeAction,
    validateActionPermission,
    getActionHistory,
    clearActionHistory
  }
}