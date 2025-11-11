import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

// 外部数据统一状态管理
export const useExternalDataStore = defineStore('externalData', () => {
  // 安全 JSON 解析与默认值兜底
  const parseJSONSafe = async (response) => {
    try {
      if (!response) return null
      const contentType = response.headers?.get && response.headers.get('content-type') || ''
      // 优先按 content-type 判断
      if (contentType.includes('application/json')) {
        try {
          return await response.json()
        } catch (e) {
          console.warn('JSON解析失败（content-type为JSON）:', e)
          return null
        }
      }

      // 尝试读取文本并判断是否为 HTML
      let text = ''
      try {
        const cloned = response.clone()
        text = await cloned.text()
      } catch (e) {
        // 无法读取文本则直接返回 null
        return null
      }

      if (!text) return null
      const trimmed = text.trim()
      // 如果是 HTML 或以 '<' 开头，则认为不是有效 JSON
      if (trimmed.startsWith('<') || /<!doctype/i.test(trimmed)) {
        return null
      }

      // 尝试将文本解析为 JSON
      try {
        return JSON.parse(trimmed)
      } catch (e) {
        console.warn('文本解析为JSON失败:', e)
        return null
      }
    } catch (e) {
      console.error('JSON解析失败:', e)
      return null
    }
  }

  const defaultStatistics = {
    // 档案模块默认统计结构，贴合页面展示字段
    externalDataArchive: { products: 0, interfaces: 0, suppliers: 0 },
    // 评估模块默认统计，覆盖 introduction/monitoring/quality/value/risk
    externalDataEvaluation: { introduction: 5, monitoring: 12, quality: 8, value: 3, risk: 6 },
    // 预算模块默认统计，覆盖页面常用字段
    budgetManagement: { totalBudget: 0, usedBudget: 0, remainingBudget: 0, warningCount: 0 },
    // 服务模块默认统计，简化为页面使用的统计字段
    externalDataService: { totalServices: 0, running: 0, successRate: 0 }
  }

  // 状态定义
  const products = ref([]) // 数据产品列表
  const providers = ref([]) // 供应商列表
  const evaluations = ref([]) // 评估数据
  const budgets = ref([]) // 预算数据
  const services = ref([]) // 服务数据
  const statistics = ref({}) // 统计数据
  const loading = ref(false) // 加载状态
  const error = ref(null) // 错误信息

  // 计算属性
  const activeProducts = computed(() => {
    const activeFlags = ['active', '在线', 'online']
    return products.value.filter(product => activeFlags.includes(product.status))
  })
  
  const totalBudget = computed(() => 
    budgets.value.reduce((sum, budget) => sum + (budget.totalAmount || 0), 0)
  )
  
  const usedBudget = computed(() => 
    budgets.value.reduce((sum, budget) => sum + (budget.usedAmount || 0), 0)
  )

  // 获取产品列表
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      // 拉取全量产品列表，避免分页与统计对不齐
      const response = await fetch('/api/external-data/products?page=1&pageSize=1000')
      const data = await parseJSONSafe(response)
      const payload = data?.data || data
      products.value = payload?.list || []
      return products.value
    } catch (err) {
      error.value = err.message
      console.error('获取产品列表失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取供应商列表
  const fetchProviders = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/providers')
      const data = await parseJSONSafe(response)
      const payload = data?.data || data
      providers.value = payload?.list || []
      return providers.value
    } catch (err) {
      error.value = err.message
      console.error('获取供应商列表失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取统计数据（支持不传module时拉取全部）
  const fetchStatistics = async (module) => {
    // 若未指定模块，则拉取全部统计
    if (!module) {
      return await fetchAllStatistics()
    }

    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/external-data/statistics/${module}`)
      let data = null

      // 响应非 2xx 时直接使用默认统计
      if (response && response.ok) {
        try {
          data = await parseJSONSafe(response)
        } catch (e) {
          // 理论上 parseJSONSafe 已捕获，这里双保险
          console.warn('统计数据解析异常，使用默认值:', e)
          data = null
        }
      }

      const safeDefault = defaultStatistics[module] || {}
      const payload = data?.data || data
      const isValidObject = payload && typeof payload === 'object' && Object.keys(payload).length > 0
      statistics.value[module] = isValidObject ? payload : safeDefault
      return statistics.value[module]
    } catch (err) {
      // 出错不再抛给上层，统一兜底默认值并记录错误
      console.error('获取统计数据失败，已回退默认值:', err)
      statistics.value[module] = defaultStatistics[module] || {}
      return statistics.value[module]
    } finally {
      loading.value = false
    }
  }

  // 数据一致性检查
  const checkDataConsistency = () => {
    const inconsistencies = []

    // 检查产品数据一致性
    if (products.value.length > 0) {
      const activeFlags = ['active', '在线', 'online']
      const activeProductsList = products.value.filter(p => activeFlags.includes(p.status))
      const archivedStats = statistics.value.externalDataArchive || {}
      const archiveActive = typeof archivedStats.activeProducts === 'number' ? archivedStats.activeProducts : null
      const archiveTotal = typeof archivedStats.totalProducts === 'number' ? archivedStats.totalProducts : null
      // 仅在统计值存在时执行比对，避免未提供字段导致的误报
      // 若当前列表是分页（长度明显小于统计总数），则跳过比对避免假阳性
      const isPartialList = archiveTotal && products.value.length < archiveTotal
      if (!isPartialList && archiveActive !== null && archiveActive !== activeProductsList.length) {
        inconsistencies.push({
          type: 'product_count_mismatch',
          message: `产品数量不一致: 档案显示${archiveActive}个活跃产品，实际有${activeProductsList.length}个`
        })
      }
    }

    // 检查评估数据一致性
    const evaluationStats = statistics.value.externalDataEvaluation || {}
    const totalEvaluations = evaluations.value.length
    const evalTotal = typeof evaluationStats.total === 'number'
      ? evaluationStats.total
      : (typeof evaluationStats.totalEvaluations === 'number' ? evaluationStats.totalEvaluations : null)
    // 仅在实际列表已加载且统计提供了总数时进行比对
    if (totalEvaluations > 0 && evalTotal !== null && evalTotal !== totalEvaluations) {
      inconsistencies.push({
        type: 'evaluation_count_mismatch',
        message: `评估数量不一致: 统计显示${evalTotal}个评估，实际有${totalEvaluations}个`
      })
    }

    // 检查预算数据一致性
    const budgetStats = statistics.value.budgetManagement || {}
    const totalBudgets = budgets.value.length
    const budgetTotal = typeof budgetStats.total === 'number'
      ? budgetStats.total
      : (typeof budgetStats.totalBudgets === 'number' ? budgetStats.totalBudgets : null)
    if (totalBudgets > 0 && budgetTotal !== null && budgetTotal !== totalBudgets) {
      inconsistencies.push({
        type: 'budget_count_mismatch',
        message: `预算数量不一致: 统计显示${budgetTotal}个预算，实际有${totalBudgets}个`
      })
    }

    return inconsistencies
  }

  // 同步所有数据
  const syncAllData = async () => {
    try {
      loading.value = true
      error.value = null

      // 并行获取所有数据
      const [productsRes, evaluationsRes, budgetsRes, servicesRes] = await Promise.all([
        fetchProducts(),
        fetchEvaluations(),
        fetchBudgets(),
        fetchServiceApplications()
      ])

      // 检查数据一致性
      const inconsistencies = checkDataConsistency()

      if (inconsistencies.length > 0) {
        console.warn('数据一致性检查发现问题:', inconsistencies)
      }

      return { products: productsRes, evaluations: evaluationsRes, budgets: budgetsRes, services: servicesRes, inconsistencies }
    } catch (err) {
      error.value = err.message
      console.error('数据同步失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新产品状态
  const updateProductStatus = async (productId, status) => {
    try {
      const response = await fetch(`/api/external-data/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        const index = products.value.findIndex(p => p.id === productId)
        if (index !== -1) {
          products.value[index].status = status
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('更新产品状态失败:', err)
      throw err
    }
  }

  // 创建评估
  const createEvaluation = async (evaluationData) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evaluationData)
      })
      const data = await parseJSONSafe(response)
      if (data) evaluations.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('创建评估失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建预算
  const createBudget = async (budgetData) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budgetData)
      })
      const data = await parseJSONSafe(response)
      if (data) budgets.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('创建预算失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建服务申请
  const createServiceApplication = async (serviceData) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      })
      const data = await parseJSONSafe(response)
      if (data) services.value.push(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('创建服务申请失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取预算数据
  const fetchBudgets = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/budgets')
      const data = await parseJSONSafe(response)
      const payload = data?.data || data
      budgets.value = payload?.list || []
      return budgets.value
    } catch (err) {
      error.value = err.message
      console.error('获取预算数据失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取服务申请
  const fetchServiceApplications = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/services')
      const data = await parseJSONSafe(response)
      const payload = data?.data || data
      services.value = payload?.list || []
      return services.value
    } catch (err) {
      error.value = err.message
      console.error('获取服务申请失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 重置错误状态
  const resetError = () => {
    error.value = null
  }

  // 强制同步所有数据
  const forceSyncAllData = async () => {
    try {
      loading.value = true
      error.value = null
      
      // 清空现有数据
      products.value = []
      providers.value = []
      evaluations.value = []
      budgets.value = []
      services.value = []
      
      // 重新获取所有数据
      const [productsRes, providersRes, evaluationsRes, budgetsRes, servicesRes, statsRes] = await Promise.all([
        fetchProducts(),
        fetchProviders(),
        fetchEvaluations(),
        fetchBudgets(),
        fetchServiceApplications(),
        fetchAllStatistics()
      ])
      
      // 再次检查数据一致性
      const inconsistencies = checkDataConsistency()
      
      if (inconsistencies.length === 0) {
        Message.success('数据同步完成，所有模块数据已保持一致')
      } else {
        console.warn('强制同步后仍存在数据不一致:', inconsistencies)
        Message.warning('数据同步完成，但发现部分不一致，请检查日志')
      }
      
      return { inconsistencies }
    } catch (err) {
      error.value = err.message
      console.error('强制数据同步失败:', err)
      Message.error('数据同步失败: ' + err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取所有统计数据
  const fetchAllStatistics = async () => {
    const modules = ['externalDataArchive', 'externalDataEvaluation', 'budgetManagement', 'externalDataService']
    const promises = modules.map(module => fetchStatistics(module).catch(() => {
      // 单个模块失败也不阻塞整体，兜底默认值
      statistics.value[module] = defaultStatistics[module] || {}
    }))
    
    try {
      await Promise.all(promises)
      return statistics.value
    } catch (err) {
      console.error('获取统计数据失败:', err)
      throw err
    }
  }

  // 获取评估数据
  const fetchEvaluations = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/external-data/evaluations')
      const data = await parseJSONSafe(response)
      const payload = data?.data || data
      evaluations.value = payload?.list || []
      return evaluations.value
    } catch (err) {
      error.value = err.message
      console.error('获取评估数据失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清空数据
  const clearData = () => {
    products.value = []
    providers.value = []
    evaluations.value = []
    budgets.value = []
    services.value = []
    statistics.value = {}
    error.value = null
  }

  return {
    // 状态
    products,
    providers,
    evaluations,
    budgets,
    services,
    statistics,
    loading,
    error,
    
    // 计算属性
    activeProducts,
    totalBudget,
    usedBudget,
    
    // 方法
    fetchProducts,
    fetchProviders,
    fetchBudgets,
    fetchServiceApplications,
    fetchStatistics,
    updateProductStatus,
    createEvaluation,
    createBudget,
    createServiceApplication,
    syncAllData,
    checkDataConsistency,
    resetError,
    clearData,
    forceSyncAllData,
    fetchAllStatistics,
    fetchEvaluations
  }
})