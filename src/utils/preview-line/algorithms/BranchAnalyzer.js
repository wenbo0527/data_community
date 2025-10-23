/**
 * 分支分析器 - 负责预览线的分支分析、生成和管理
 * 从 PreviewLineSystem 中提取的分支相关算法
 */

import { PreviewLineTypes, NodeTypes, CreationRequirementTypes } from '../types/PreviewLineTypes.js'

/**
 * 分支标签工具类
 * 负责分支标签的生成、验证和修复
 */
export class BranchLabelUtils {
  /**
   * 根据分支ID和索引生成默认标签
   * @param {string} branchId - 分支ID
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {string} 生成的标签
   */
  static generateDefaultLabel(branchId, branchIndex, nodeType) {
    if (branchId.includes('audience') || nodeType === 'audience-split') {
      return branchId.includes('default') ? '未命中人群' : `人群${branchIndex + 1}`
    } else if (branchId.includes('event') || nodeType === 'event-split') {
      return branchIndex === 0 ? '是' : '否'
    } else if (branchId.includes('group') || branchId.includes('version') || nodeType === 'ab-test') {
      return branchIndex === 0 ? 'A组' : 'B组'
    } else {
      return `分支${branchIndex + 1}`
    }
  }

  /**
   * 验证并修复分支标签
   * @param {Object} branch - 分支对象
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {Object} 修复后的分支对象
   */
  static validateAndFixBranchLabel(branch, branchIndex, nodeType) {
    // 对于人群分流，确保使用正确的人群名称
    if (nodeType === 'audience-split') {
      // 如果分支有crowdName属性，使用它作为标签
      if (branch.crowdName && branch.crowdName !== branch.label) {
        console.log('🔧 [分支标签工具] 修复人群分流标签:', {
          branchId: branch.id,
          oldLabel: branch.label,
          newLabel: branch.crowdName,
          branchIndex: branchIndex
        })
        branch.label = branch.crowdName
      }
      // 如果是默认分支（未命中人群），确保标签正确
      else if (branch.id === 'unmatch_default' || branch.id === 'default') {
        branch.label = '未命中人群'
      }
      // 如果没有标签，生成默认标签
      else if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动生成人群分流标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          generatedLabel: branch.label
        })
      }
    } else {
      // 对于其他类型的节点，只在标签为空时修复
      if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动修复分支标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          nodeType: nodeType,
          generatedLabel: branch.label
        })
      }
    }
    return branch
  }
}

/**
 * 分支分析器类
 * 负责节点分支的分析、生成和管理
 */
export class BranchAnalyzer {
  constructor(config = {}) {
    this.config = {
      cacheTimeout: 5000, // 缓存超时时间（毫秒）
      enableDebug: false,
      ...config
    }
    
    // 分支信息缓存
    this.branchInfoCache = new Map()
    
    // 定期清理过期缓存
    this.cacheCleanupInterval = setInterval(() => {
      this.clearExpiredCache()
    }, 10000) // 每10秒清理一次过期缓存
  }

  /**
   * 获取节点的分支信息
   * @param {Object} node - 节点对象
   * @param {Object} config - 配置对象
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Array} 分支数组
   */
  getNodeBranches(node, config = null, forceRefresh = false) {
    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 优先使用传入的配置，然后是节点的config属性，最后是节点数据本身
    const nodeConfig = config || nodeData.config || nodeData || {}
    
    // 生成当前配置的哈希值用于比较
    const currentConfigHash = this.generateConfigHash(nodeConfig)
    
    if (this.config.enableDebug) {
      console.log('🔍 [分支分析器] getNodeBranches 配置检查:', {
        nodeId: nodeId,
        nodeType: nodeType,
        hasConfig: !!config,
        hasNodeDataConfig: !!nodeData.config,
        hasCrowdLayers: !!(nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)),
        crowdLayersCount: nodeConfig.crowdLayers ? nodeConfig.crowdLayers.length : 0,
        hasUnmatchBranch: !!nodeConfig.unmatchBranch,
        configHash: currentConfigHash
      })
    }
    
    // 检查缓存
    const cached = this.branchInfoCache.get(nodeId)
    const now = Date.now()
    
    // 检查配置是否发生变化
    const configChanged = cached && cached.configHash && cached.configHash !== currentConfigHash
    
    if (configChanged) {
      if (this.config.enableDebug) {
        console.log('🔄 [分支分析器] 检测到节点配置变化，清理缓存:', {
          nodeId: nodeId,
          nodeType: nodeType,
          oldConfigHash: cached.configHash,
          newConfigHash: currentConfigHash
        })
      }
      
      // 清理节点相关的缓存
      this.branchInfoCache.delete(nodeId)
    }
    
    // 增强缓存有效性检查
    const cacheValid = cached && 
                      (now - cached.timestamp) < this.config.cacheTimeout &&
                      !configChanged &&
                      !forceRefresh
    
    if (cacheValid) {
      if (this.config.enableDebug) {
        console.log('📦 [分支分析器] 使用缓存的分支信息:', {
          nodeId: nodeId,
          cacheAge: now - cached.timestamp,
          configHash: currentConfigHash,
          branches: cached.branches.map(b => ({ id: b.id, label: b.label }))
        })
      }
      return cached.branches
    }
    
    if (this.config.enableDebug) {
      console.log('🔍 [分支分析器] getNodeBranches 被调用:', {
        nodeId: nodeId,
        nodeType: nodeType,
        nodeData: nodeData,
        passedConfig: config,
        finalConfig: nodeConfig,
        hasStoredBranches: !!(nodeConfig.branches && Array.isArray(nodeConfig.branches)),
        cacheStatus: cached ? 'expired' : 'miss'
      })
    }
    
    let branches = []
    
    // 检查节点是否有存储的分支数据，但需要验证这些分支是否基于有效配置
    if (nodeConfig.branches && Array.isArray(nodeConfig.branches)) {
      // 对于分流节点，需要验证是否有真实的配置支持这些分支
      const isValidBranchConfig = this.validateStoredBranches(nodeType, nodeConfig, nodeId)
      
      if (isValidBranchConfig) {
        if (this.config.enableDebug) {
          console.log('🔄 [分支分析器] 使用存储的分支数据:', nodeConfig.branches)
        }
        branches = nodeConfig.branches
      } else {
        if (this.config.enableDebug) {
          console.log('⚠️ [分支分析器] 存储的分支数据无效，重新生成:', {
            nodeId: nodeId,
            nodeType: nodeType,
            storedBranches: nodeConfig.branches.length
          })
        }
        // 根据节点类型和配置重新生成分支
        branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
      }
    } else {
      // 根据节点类型和配置生成分支
      branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
    }
    
    // 使用工具类验证并修复所有分支标签
    branches = branches.map((branch, index) => 
      BranchLabelUtils.validateAndFixBranchLabel(branch, index, nodeType)
    )
    
    // 缓存结果时包含配置哈希值
    this.branchInfoCache.set(nodeId, {
      branches: branches,
      timestamp: now,
      configHash: currentConfigHash,
      nodeType: nodeType
    })
    
    if (this.config.enableDebug) {
      console.log('💾 [分支分析器] 分支信息已缓存:', {
        nodeId: nodeId,
        branchCount: branches.length,
        branches: branches.map(b => ({ id: b.id, label: b.label }))
      })
    }
    
    return branches
  }

  /**
   * 根据节点类型生成分支
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {Array} 分支数组
   */
  generateBranchesByType(nodeType, nodeConfig, nodeId) {
    if (this.config.enableDebug) {
      console.log('🔧 [分支分析器] generateBranchesByType 被调用:', {
        nodeId: nodeId,
        nodeType: nodeType,
        nodeConfig: nodeConfig,
        hasCrowdLayers: !!(nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)),
        crowdLayersCount: nodeConfig.crowdLayers ? nodeConfig.crowdLayers.length : 0,
        hasUnmatchBranch: !!nodeConfig.unmatchBranch
      })
    }
    
    switch (nodeType) {
      case 'audience-split':
        return this.generateAudienceSplitBranches(nodeConfig, nodeId, 0)
        
      case 'event-split':
        return this.generateEventSplitBranches(nodeConfig, nodeId)
        
      case 'ab-test':
        return this.generateAbTestBranches(nodeConfig, nodeId)
        
      default:
        return []
    }
  }

  /**
   * 生成人群分流分支
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @param {number} depth - 递归深度保护
   * @returns {Array} 分支数组
   */
  generateAudienceSplitBranches(nodeConfig, nodeId, depth = 0) {
    // 递归深度保护 - 防止无限递归
    if (depth > 5) {
      console.error('🚨 [分支分析器] 检测到递归调用过深，停止执行:', { nodeId, depth })
      return []
    }
    
    // 支持多种人群配置字段
    let audienceData = null
    let audienceSource = 'none'
    
    // 统一数据结构处理逻辑 - 支持多种人群配置字段
    if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers) && nodeConfig.crowdLayers.length > 0) {
      audienceData = nodeConfig.crowdLayers
      audienceSource = 'crowdLayers'
    } else if (nodeConfig.audiences && Array.isArray(nodeConfig.audiences) && nodeConfig.audiences.length > 0) {
      audienceData = nodeConfig.audiences
      audienceSource = 'audiences'
    } else if (nodeConfig.config && nodeConfig.config.crowdLayers && Array.isArray(nodeConfig.config.crowdLayers) && nodeConfig.config.crowdLayers.length > 0) {
      audienceData = nodeConfig.config.crowdLayers
      audienceSource = 'config.crowdLayers'
    } else if (nodeConfig.config && nodeConfig.config.audiences && Array.isArray(nodeConfig.config.audiences) && nodeConfig.config.audiences.length > 0) {
      audienceData = nodeConfig.config.audiences
      audienceSource = 'config.audiences'
    }
    
    if (this.config.enableDebug) {
      console.log('🔍 [分支分析器] 人群分流节点配置检查:', {
        nodeId: nodeId,
        audienceSource: audienceSource,
        audienceCount: audienceData ? audienceData.length : 0,
        nodeConfigKeys: Object.keys(nodeConfig),
        hasNestedConfig: !!(nodeConfig.config && typeof nodeConfig.config === 'object'),
        crowdLayersData: nodeConfig.crowdLayers,
        audiencesData: nodeConfig.audiences,
        configAudiencesData: nodeConfig.config?.audiences,
        fullNodeConfig: nodeConfig,
        depth: depth
      })
    }
    
    if (audienceData) {
      const branches = audienceData.map((item, index) => {
        // 支持多种人群名称字段
        const audienceName = item.crowdName || item.name || item.audienceName || item.label || `人群${index + 1}`
        
        return {
          id: item.id || `audience_${index}`,
          label: audienceName,
          crowdName: audienceName,
          type: 'audience',
          crowdId: item.crowdId || item.id,
          order: item.order || index + 1
        }
      })
      
      // 从配置中读取未命中分支信息
      if (nodeConfig.unmatchBranch) {
        branches.push({
          id: nodeConfig.unmatchBranch.id || 'unmatch_default',
          label: nodeConfig.unmatchBranch.name || nodeConfig.unmatchBranch.crowdName || '未命中人群',
          crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
          type: 'audience',
          crowdId: nodeConfig.unmatchBranch.crowdId || null,
          order: nodeConfig.unmatchBranch.order || branches.length + 1,
          isDefault: true
        })
      }
      
      if (this.config.enableDebug) {
        console.log('✅ [分支分析器] 人群分流节点生成分支:', {
          nodeId: nodeId,
          audienceSource: audienceSource,
          branchCount: branches.length,
          branches: branches.map(b => ({ id: b.id, label: b.label, crowdName: b.crowdName })),
          depth: depth
        })
      }
      
      return branches
    }
    
    // 如果没有找到人群配置数据，检查节点是否已配置
    const isNodeConfigured = nodeConfig.isConfigured === true
    
    if (this.config.enableDebug) {
      console.log('⚠️ [分支分析器] 人群分流节点未找到人群配置数据:', {
        nodeId: nodeId,
        nodeConfigIsConfigured: nodeConfig.isConfigured,
        finalIsConfigured: isNodeConfigured,
        hasAnyConfig: Object.keys(nodeConfig).length > 0,
        nodeConfigKeys: Object.keys(nodeConfig),
        fullNodeConfig: nodeConfig
      })
    }
    
    // 如果节点被标记为已配置但没有找到人群数据，生成默认分支
    if (isNodeConfigured) {
      if (this.config.enableDebug) {
        console.log('🔧 [分支分析器] 为已配置但缺少人群数据的分流节点生成默认分支:', nodeId)
      }
      return [
        { id: 'default_branch_1', label: '分支1', type: 'audience', isDefault: true },
        { id: 'default_branch_2', label: '分支2', type: 'audience', isDefault: true }
      ]
    }
    
    if (this.config.enableDebug) {
      console.log('⏭️ [分支分析器] 人群分流节点未配置，不生成分支:', nodeId)
    }
    return []
  }

  /**
   * 生成事件分流分支
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {Array} 分支数组
   */
  generateEventSplitBranches(nodeConfig, nodeId) {
    // 事件分流：固定生成两个分支（是/否）
    if (nodeConfig.eventCondition || nodeConfig.yesLabel || nodeConfig.noLabel || nodeConfig.isConfigured) {
      const eventBranches = [
        { id: 'event_yes', label: nodeConfig.yesLabel || '是', type: 'event' },
        { id: 'event_no', label: nodeConfig.noLabel || '否', type: 'event' }
      ]
      
      if (this.config.enableDebug) {
        console.log('✅ [分支分析器] 事件分流节点生成分支:', {
          nodeId: nodeId,
          branchCount: eventBranches.length,
          branches: eventBranches.map(b => ({ id: b.id, label: b.label })),
          hasEventCondition: !!nodeConfig.eventCondition,
          hasLabels: !!(nodeConfig.yesLabel || nodeConfig.noLabel),
          isConfigured: !!nodeConfig.isConfigured
        })
      }
      
      return eventBranches
    }
    
    // 如果没有任何配置，返回空数组
    if (this.config.enableDebug) {
      console.log('⏭️ [分支分析器] 事件分流节点未配置，不生成分支:', nodeId)
    }
    return []
  }

  /**
   * 生成AB测试分支
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {Array} 分支数组
   */
  generateAbTestBranches(nodeConfig, nodeId) {
    // AB测试：根据配置的版本数生成分支
    if (nodeConfig.versions && Array.isArray(nodeConfig.versions)) {
      return nodeConfig.versions.map((version, index) => ({
        id: version.id || `version_${index}`,
        label: version.name || `版本${index + 1}`,
        type: 'ab-test',
        ratio: version.ratio
      }))
    }
    
    // 如果有AB测试的基本配置，生成默认分支
    if (nodeConfig.groupALabel || nodeConfig.groupBLabel || nodeConfig.groupARatio || nodeConfig.groupBRatio) {
      return [
        { id: 'group_a', label: nodeConfig.groupALabel || 'A组', type: 'ab-test', ratio: nodeConfig.groupARatio || 50 },
        { id: 'group_b', label: nodeConfig.groupBLabel || 'B组', type: 'ab-test', ratio: nodeConfig.groupBRatio || 50 }
      ]
    }
    
    // 如果没有配置AB测试，返回空数组
    return []
  }

  /**
   * 验证存储的分支数据是否有效
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否有效
   */
  validateStoredBranches(nodeType, nodeConfig, nodeId) {
    if (!nodeConfig.branches || !Array.isArray(nodeConfig.branches) || nodeConfig.branches.length === 0) {
      if (this.config.enableDebug) {
        console.log('❌ [分支分析器] 存储分支无效 - 空数组或不存在:', {
          nodeId: nodeId,
          nodeType: nodeType,
          hasBranches: !!nodeConfig.branches,
          isArray: Array.isArray(nodeConfig.branches),
          branchCount: nodeConfig.branches ? nodeConfig.branches.length : 0
        })
      }
      return false
    }
    
    // 对于人群分流节点，检查是否有对应的人群配置
    if (nodeType === 'audience-split') {
      const hasAudienceConfig = !!(nodeConfig.crowdLayers || nodeConfig.audiences || nodeConfig.config?.audiences)
      const hasValidBranches = nodeConfig.branches.some(branch => 
        branch.type === 'audience' && (branch.crowdName || branch.label)
      )
      
      if (this.config.enableDebug) {
        console.log('🔍 [分支分析器] audience-split分支验证:', {
          nodeId: nodeId,
          hasAudienceConfig: hasAudienceConfig,
          hasValidBranches: hasValidBranches,
          branchCount: nodeConfig.branches.length,
          branches: nodeConfig.branches.map(b => ({ id: b.id, label: b.label, type: b.type }))
        })
      }
      
      return hasAudienceConfig || hasValidBranches
    }
    
    // 对于事件分流节点，检查是否有事件配置
    if (nodeType === 'event-split') {
      const hasEventConfig = !!(nodeConfig.eventCondition || nodeConfig.yesLabel || nodeConfig.noLabel)
      const hasValidBranches = nodeConfig.branches.some(branch => branch.type === 'event')
      return hasEventConfig || hasValidBranches
    }
    
    // 对于AB测试节点，检查是否有AB测试配置
    if (nodeType === 'ab-test') {
      const hasAbConfig = !!(nodeConfig.versions || nodeConfig.groupALabel || nodeConfig.groupBLabel)
      const hasValidBranches = nodeConfig.branches.some(branch => branch.type === 'ab-test')
      return hasAbConfig || hasValidBranches
    }
    
    return true
  }

  /**
   * 生成配置哈希值
   * @param {Object} config - 配置对象
   * @returns {string} 哈希值
   */
  generateConfigHash(config) {
    try {
      const configStr = JSON.stringify(config, Object.keys(config).sort())
      // 简单的哈希函数
      let hash = 0
      for (let i = 0; i < configStr.length; i++) {
        const char = configStr.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 转换为32位整数
      }
      return hash.toString()
    } catch (error) {
      console.warn('⚠️ [分支分析器] 生成配置哈希失败:', error)
      return Date.now().toString()
    }
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache() {
    const now = Date.now()
    const expiredKeys = []
    
    for (const [key, value] of this.branchInfoCache.entries()) {
      if (now - value.timestamp > this.config.cacheTimeout) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => {
      this.branchInfoCache.delete(key)
    })
    
    if (expiredKeys.length > 0 && this.config.enableDebug) {
      console.log('🧹 [分支分析器] 清理过期缓存:', {
        expiredCount: expiredKeys.length,
        remainingCount: this.branchInfoCache.size
      })
    }
  }

  /**
   * 清理节点缓存
   * @param {string} nodeId - 节点ID
   */
  clearNodeCache(nodeId) {
    this.branchInfoCache.delete(nodeId)
    
    if (this.config.enableDebug) {
      console.log('🧹 [分支分析器] 清理节点缓存:', { nodeId })
    }
  }

  /**
   * 设置几何工具
   * @param {Object} geometryUtils - 几何工具实例
   */
  setGeometryUtils(geometryUtils) {
    this.geometryUtils = geometryUtils
    
    if (this.config.enableDebug) {
      console.log('🔧 [分支分析器] 几何工具已设置')
    }
  }

  /**
   * 设置分支标签工具
   * @param {Object} branchLabelUtils - 分支标签工具实例
   */
  setBranchLabelUtils(branchLabelUtils) {
    this.branchLabelUtils = branchLabelUtils
    
    if (this.config.enableDebug) {
      console.log('🔧 [分支分析器] 分支标签工具已设置')
    }
  }

  /**
   * 设置缓存管理器
   * @param {Object} cacheManager - 缓存管理器实例
   */
  setCacheManager(cacheManager) {
    this.cacheManager = cacheManager
    
    if (this.config.enableDebug) {
      console.log('🔧 [分支分析器] 缓存管理器已设置')
    }
  }

  /**
   * 销毁分析器，清理资源
   */
  destroy() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval)
      this.cacheCleanupInterval = null
    }
    
    this.branchInfoCache.clear()
    
    if (this.config.enableDebug) {
      console.log('🗑️ [分支分析器] 已销毁')
    }
  }
}

/**
 * 创建分支分析器实例的工厂函数
 * @param {Object} config - 配置选项
 * @returns {BranchAnalyzer} 分支分析器实例
 */
export function createBranchAnalyzer(config = {}) {
  return new BranchAnalyzer(config)
}

/**
 * 默认分支分析器实例
 */
export const defaultBranchAnalyzer = createBranchAnalyzer({
  enableDebug: false,
  cacheTimeout: 5000
})

export default BranchAnalyzer