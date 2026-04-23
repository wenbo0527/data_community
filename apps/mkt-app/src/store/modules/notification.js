import { notificationApi } from '@/api/notification'

const state = {
  rules: [],
  currentRule: null,
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  filters: {
    status: '',
    type: '',
    keyword: ''
  },
  sort: {
    field: 'createTime',
    order: 'desc'
  }
}

const mutations = {
  SET_RULES(state, rules) {
    state.rules = rules
  },
  
  SET_CURRENT_RULE(state, rule) {
    state.currentRule = rule
  },
  
  ADD_RULE(state, rule) {
    state.rules.unshift(rule)
  },
  
  UPDATE_RULE(state, updatedRule) {
    const index = state.rules.findIndex(rule => rule.id === updatedRule.id)
    if (index !== -1) {
      state.rules.splice(index, 1, updatedRule)
    }
  },
  
  DELETE_RULE(state, ruleId) {
    state.rules = state.rules.filter(rule => rule.id !== ruleId)
  },
  
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
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  
  SET_SORT(state, sort) {
    state.sort = { ...state.sort, ...sort }
  },
  
  RESET_FILTERS(state) {
    state.filters = {
      status: '',
      type: '',
      keyword: ''
    }
  }
}

const actions = {
  // 获取规则列表
  async fetchRules({ commit, state }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const params = {
        page: state.pagination.current,
        pageSize: state.pagination.pageSize,
        ...state.filters,
        sortField: state.sort.field,
        sortOrder: state.sort.order
      }
      
      const response = await notificationApi.getRules(params)
      
      commit('SET_RULES', response.data.list)
      commit('SET_PAGINATION', {
        total: response.data.total,
        current: response.data.currentPage,
        pageSize: response.data.pageSize
      })
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取单个规则详情
  async fetchRule({ commit }, ruleId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.getRule(ruleId)
      commit('SET_CURRENT_RULE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 创建规则
  async createRule({ commit }, ruleData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.createRule(ruleData)
      commit('ADD_RULE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新规则
  async updateRule({ commit }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.updateRule(id, data)
      commit('UPDATE_RULE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除规则
  async deleteRule({ commit }, ruleId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await notificationApi.deleteRule(ruleId)
      commit('DELETE_RULE', ruleId)
      
      return true
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 批量删除规则
  async batchDeleteRules({ commit }, ruleIds) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await notificationApi.batchDeleteRules(ruleIds)
      
      // 批量删除本地数据
      ruleIds.forEach(ruleId => {
        commit('DELETE_RULE', ruleId)
      })
      
      return true
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新规则状态
  async updateRuleStatus({ commit }, { ruleId, status }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.updateRuleStatus(ruleId, status)
      commit('UPDATE_RULE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取模板列表
  async fetchTemplates({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.getTemplates()
      commit('SET_TEMPLATES', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取单个模板详情
  async fetchTemplate({ commit }, templateId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.getTemplate(templateId)
      commit('SET_CURRENT_TEMPLATE', response.data)
      
      return response.data
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
      
      const response = await notificationApi.createTemplate(templateData)
      commit('ADD_TEMPLATE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新模板
  async updateTemplate({ commit }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await notificationApi.updateTemplate(id, data)
      commit('UPDATE_TEMPLATE', response.data)
      
      return response.data
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除模板
  async deleteTemplate({ commit }, templateId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await notificationApi.deleteTemplate(templateId)
      commit('DELETE_TEMPLATE', templateId)
      
      return true
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新分页
  updatePagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  
  // 更新筛选条件
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },
  
  // 更新排序
  updateSort({ commit }, sort) {
    commit('SET_SORT', sort)
  },
  
  // 重置筛选条件
  resetFilters({ commit }) {
    commit('RESET_FILTERS')
  },
  
  // 清除错误
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  // 规则相关
  rules: state => state.rules,
  currentRule: state => state.currentRule,
  ruleById: state => id => state.rules.find(rule => rule.id === id),
  enabledRules: state => state.rules.filter(rule => rule.enabled),
  rulesByType: state => type => state.rules.filter(rule => rule.basicInfo?.monitorType === type),
  rulesByStatus: state => status => state.rules.filter(rule => rule.enabled === status),
  
  // 模板相关
  templates: state => state.templates,
  currentTemplate: state => state.currentTemplate,
  templateById: state => id => state.templates.find(template => template.id === id),
  presetTemplates: state => state.templates.filter(template => template.type === 'preset'),
  customTemplates: state => state.templates.filter(template => template.type === 'custom'),
  templatesByMonitorType: state => type => state.templates.filter(template => template.monitorType === type),
  
  // 状态相关
  loading: state => state.loading,
  error: state => state.error,
  hasError: state => !!state.error,
  
  // 分页相关
  pagination: state => state.pagination,
  total: state => state.pagination.total,
  currentPage: state => state.pagination.current,
  pageSize: state => state.pagination.pageSize,
  
  // 筛选相关
  filters: state => state.filters,
  keyword: state => state.filters.keyword,
  statusFilter: state => state.filters.status,
  typeFilter: state => state.filters.type,
  
  // 排序相关
  sort: state => state.sort,
  sortField: state => state.sort.field,
  sortOrder: state => state.sort.order,
  
  // 统计相关
  totalRules: state => state.rules.length,
  enabledRulesCount: state => state.rules.filter(rule => rule.enabled).length,
  disabledRulesCount: state => state.rules.filter(rule => !rule.enabled).length,
  rulesByTypeCount: state => {
    const counts = {}
    state.rules.forEach(rule => {
      const type = rule.basicInfo?.monitorType || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  },
  totalTemplates: state => state.templates.length,
  presetTemplatesCount: state => state.templates.filter(template => template.type === 'preset').length,
  customTemplatesCount: state => state.templates.filter(template => template.type === 'custom').length
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}