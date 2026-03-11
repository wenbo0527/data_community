const state = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  categories: [
    { id: 'inventory', name: '库存预警', description: '库存相关通知模板' },
    { id: 'expiry', name: '到期提醒', description: '商品到期相关通知模板' },
    { id: 'failure_rate', name: '失败率预警', description: '接口失败率相关通知模板' },
    { id: 'system', name: '系统通知', description: '系统通用通知模板' },
    { id: 'marketing', name: '营销通知', description: '营销活动相关通知模板' }
  ],
  presetTemplates: [
    {
      id: 'inventory_alert',
      name: '库存预警模板',
      description: '适用于库存预警通知',
      category: 'inventory',
      type: 'preset',
      monitorType: 'inventory',
      title: '{{ruleName}} - 库存预警通知',
      content: '您好！\n\n{{itemName}}的库存已低于设定阈值。\n\n当前库存：{{currentStock}}件\n预警阈值：{{threshold}}件\n监控时间：{{monitorTime}}\n\n请及时处理，避免缺货风险。',
      variables: ['ruleName', 'itemName', 'currentStock', 'threshold', 'monitorTime'],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    },
    {
      id: 'expiry_warning',
      name: '到期提醒模板',
      description: '适用于商品到期提醒',
      category: 'expiry',
      type: 'preset',
      monitorType: 'expiry',
      title: '{{ruleName}} - 商品到期提醒',
      content: '您好！\n\n以下商品即将到期：\n\n商品名称：{{itemName}}\n到期时间：{{expiryDate}}\n剩余天数：{{daysLeft}}天\n\n请及时处理，避免损失。',
      variables: ['ruleName', 'itemName', 'expiryDate', 'daysLeft'],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    },
    {
      id: 'failure_rate_alert',
      name: '失败率预警模板',
      description: '适用于接口失败率预警',
      category: 'failure_rate',
      type: 'preset',
      monitorType: 'failure_rate',
      title: '{{ruleName}} - 失败率预警',
      content: '您好！\n\n检测到异常失败率：\n\n接口名称：{{apiName}}\n当前失败率：{{currentFailureRate}}%\n预警阈值：{{threshold}}%\n监控时间：{{monitorTime}}\n\n请立即检查系统状态。',
      variables: ['ruleName', 'apiName', 'currentFailureRate', 'threshold', 'monitorTime'],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    },
    {
      id: 'system_maintenance',
      name: '系统维护通知',
      description: '适用于系统维护通知',
      category: 'system',
      type: 'preset',
      monitorType: 'system',
      title: '{{ruleName}} - 系统维护通知',
      content: '您好！\n\n系统将于{{maintenanceTime}}进行维护，预计持续{{duration}}分钟。\n\n维护期间可能会影响正常使用，请提前做好准备。',
      variables: ['ruleName', 'maintenanceTime', 'duration'],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    },
    {
      id: 'marketing_campaign',
      name: '营销活动通知',
      description: '适用于营销活动通知',
      category: 'marketing',
      type: 'preset',
      monitorType: 'marketing',
      title: '{{ruleName}} - {{campaignName}}',
      content: '您好！\n\n{{campaignName}}活动已经开始！\n\n活动时间：{{startTime}} - {{endTime}}\n活动详情：{{campaignDetails}}\n\n快来参与吧！',
      variables: ['ruleName', 'campaignName', 'startTime', 'endTime', 'campaignDetails'],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-01T00:00:00Z'
    }
  ]
}

const mutations = {
  SET_TEMPLATES(state, templates) {
    state.templates = templates
  },
  
  SET_CURRENT_TEMPLATE(state, template) {
    state.currentTemplate = template
  },
  
  ADD_TEMPLATE(state, template) {
    state.templates.unshift(template)
  },
  
  UPDATE_TEMPLATE(state, updatedTemplate) {
    const index = state.templates.findIndex(template => template.id === updatedTemplate.id)
    if (index !== -1) {
      state.templates.splice(index, 1, updatedTemplate)
    }
  },
  
  DELETE_TEMPLATE(state, templateId) {
    state.templates = state.templates.filter(template => template.id !== templateId)
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  },
  
  // 初始化预设模板
  INIT_PRESET_TEMPLATES(state) {
    // 检查是否已存在预设模板
    const existingPresetIds = state.templates
      .filter(template => template.type === 'preset')
      .map(template => template.id)
    
    // 添加不存在的预设模板
    state.presetTemplates.forEach(preset => {
      if (!existingPresetIds.includes(preset.id)) {
        state.templates.push({ ...preset })
      }
    })
  }
}

const actions = {
  // 获取模板列表
  async fetchTemplates({ commit, state }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 如果没有模板数据，初始化预设模板
      if (state.templates.length === 0) {
        commit('INIT_PRESET_TEMPLATES')
      }
      
      return state.templates
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取单个模板详情
  async fetchTemplate({ commit, state }, templateId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const template = state.templates.find(t => t.id === templateId)
      if (template) {
        commit('SET_CURRENT_TEMPLATE', template)
        return template
      } else {
        throw new Error('模板不存在')
      }
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 创建模板
  async createTemplate({ commit }, templateData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const template = {
        ...templateData,
        id: `custom_${Date.now()}`,
        type: 'custom',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      commit('ADD_TEMPLATE', template)
      return template
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新模板
  async updateTemplate({ commit, state }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const template = state.templates.find(t => t.id === id)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      // 不允许修改预设模板
      if (template.type === 'preset') {
        throw new Error('预设模板不允许修改')
      }
      
      const updatedTemplate = {
        ...template,
        ...data,
        updateTime: new Date().toISOString()
      }
      
      commit('UPDATE_TEMPLATE', updatedTemplate)
      return updatedTemplate
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除模板
  async deleteTemplate({ commit, state }, templateId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const template = state.templates.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      // 不允许删除预设模板
      if (template.type === 'preset') {
        throw new Error('预设模板不允许删除')
      }
      
      commit('DELETE_TEMPLATE', templateId)
      return true
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 复制模板
  async copyTemplate({ commit, state }, templateId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const template = state.templates.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }
      
      const copiedTemplate = {
        ...template,
        id: `copy_${Date.now()}`,
        name: `${template.name} (复制)`,
        type: 'custom',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      commit('ADD_TEMPLATE', copiedTemplate)
      return copiedTemplate
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 初始化模板
  initTemplates({ commit }) {
    commit('INIT_PRESET_TEMPLATES')
  },
  
  // 清除错误
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  templates: state => state.templates,
  currentTemplate: state => state.currentTemplate,
  templateById: state => id => state.templates.find(template => template.id === id),
  
  // 按类型分类
  presetTemplates: state => state.templates.filter(template => template.type === 'preset'),
  customTemplates: state => state.templates.filter(template => template.type === 'custom'),
  
  // 按监控类型分类
  templatesByMonitorType: state => type => state.templates.filter(template => template.monitorType === type),
  
  // 按分类筛选
  templatesByCategory: state => category => state.templates.filter(template => template.category === category),
  
  // 按名称搜索
  templatesByKeyword: state => keyword => {
    if (!keyword) return state.templates
    const lowerKeyword = keyword.toLowerCase()
    return state.templates.filter(template => 
      template.name.toLowerCase().includes(lowerKeyword) ||
      template.description.toLowerCase().includes(lowerKeyword)
    )
  },
  
  // 获取分类
  categories: state => state.categories,
  categoryById: state => id => state.categories.find(category => category.id === id),
  
  // 状态相关
  loading: state => state.loading,
  error: state => state.error,
  hasError: state => !!state.error,
  
  // 统计相关
  totalTemplates: state => state.templates.length,
  presetTemplatesCount: state => state.templates.filter(template => template.type === 'preset').length,
  customTemplatesCount: state => state.templates.filter(template => template.type === 'custom').length,
  templatesByCategoryCount: state => {
    const counts = {}
    state.templates.forEach(template => {
      const category = template.category || 'unknown'
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  },
  templatesByMonitorTypeCount: state => {
    const counts = {}
    state.templates.forEach(template => {
      const type = template.monitorType || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}