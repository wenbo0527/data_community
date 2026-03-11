import { ref, computed } from 'vue'
import { getAvailableSuppliers, getSupplierById, getSuppliersByIds, checkSupplierAvailability } from '@/modules/budget/api/supplierDictionary'
import type { Supplier } from '@/modules/external-data/types/supplier'

/**
 * 结算系统供应商字典组合式函数
 * 提供结算系统所需的供应商数据访问功能
 */
export function useSettlementSupplier() {
  // 供应商缓存
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeSuppliers = computed(() => suppliers.value.filter(s => s.status === 'active'))
  const supplierOptions = computed(() => activeSuppliers.value.map(s => ({
    label: s.supplierName,
    value: s.id,
    code: s.supplierCode,
    category: s.supplierType
  })))

  const supplierMap = computed(() => {
    const map = new Map<string, Supplier>()
    suppliers.value.forEach(s => map.set(s.id, s))
    return map
  })

  const supplierCodeMap = computed(() => {
    const map = new Map<string, Supplier>()
    suppliers.value.forEach(s => map.set(s.supplierCode, s))
    return map
  })

  /**
   * 加载供应商列表
   */
  const loadSuppliers = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await getAvailableSuppliers()
      suppliers.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载供应商失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取供应商
   */
  const getSupplier = (id: string): Supplier | undefined => {
    return supplierMap.value.get(id)
  }

  /**
   * 根据编码获取供应商
   */
  const getSupplierByCode = (code: string): Supplier | undefined => {
    return supplierCodeMap.value.get(code)
  }

  /**
   * 批量获取供应商
   */
  const getSuppliers = (ids: string[]): Supplier[] => {
    return ids.map(id => getSupplier(id)).filter(Boolean) as Supplier[]
  }

  /**
   * 检查供应商是否可用
   */
  const isSupplierAvailable = (id: string): boolean => {
    const supplier = getSupplier(id)
    return supplier !== undefined && supplier.status === 'active'
  }

  /**
   * 根据分类筛选供应商
   */
  const getSuppliersByCategory = (category: string): Supplier[] => {
    return activeSuppliers.value.filter(s => s.supplierType === category)
  }

  /**
   * 获取供应商名称
   */
  const getSupplierName = (id: string): string => {
    const supplier = getSupplier(id)
    return supplier?.supplierName || '未知供应商'
  }

  /**
   * 获取供应商编码
   */
  const getSupplierCode = (id: string): string => {
    const supplier = getSupplier(id)
    return supplier?.supplierCode || 'UNKNOWN'
  }

  /**
   * 验证供应商列表
   * 用于结算前验证所有供应商的可用性
   */
  const validateSuppliers = async (supplierIds: string[]): Promise<{
    valid: boolean
    invalidIds: string[]
    details: Array<{ id: string; name: string; available: boolean; reason?: string }>
  }> => {
    const details = await Promise.all(
      supplierIds.map(async (id) => {
        const supplier = getSupplier(id)
        if (!supplier) {
          return { id, name: '未知供应商', available: false, reason: '供应商不存在' }
        }
        
        const available = await checkSupplierAvailability(id)
        return {
          id,
          name: supplier.supplierName,
          available,
          reason: available ? undefined : '供应商不可用'
        }
      })
    )

    const invalidIds = details.filter(d => !d.available).map(d => d.id)
    
    return {
      valid: invalidIds.length === 0,
      invalidIds,
      details
    }
  }

  /**
   * 从合同数据中提取供应商信息
   * 用于将合同中的供应商字段映射到标准供应商对象
   */
  const extractSuppliersFromContracts = (contracts: Array<{ supplier: string }>): Supplier[] => {
    const suppliers: Supplier[] = []
    const processed = new Set<string>()

    contracts.forEach(contract => {
      if (contract.supplier && !processed.has(contract.supplier)) {
        processed.add(contract.supplier)
        
        // 尝试通过编码查找供应商
        let supplier = getSupplierByCode(contract.supplier)
        
        // 如果编码找不到，尝试通过名称查找
        if (!supplier) {
          supplier = activeSuppliers.value.find(s => 
            s.supplierName === contract.supplier || s.supplierCode === contract.supplier
          )
        }
        
        if (supplier) {
          suppliers.push(supplier)
        }
      }
    })

    return suppliers
  }

  return {
    // 状态
    suppliers,
    loading,
    error,
    
    // 计算属性
    activeSuppliers,
    supplierOptions,
    supplierMap,
    supplierCodeMap,
    
    // 方法
    loadSuppliers,
    getSupplier,
    getSupplierByCode,
    getSuppliers,
    isSupplierAvailable,
    getSuppliersByCategory,
    getSupplierName,
    getSupplierCode,
    validateSuppliers,
    extractSuppliersFromContracts
  }
}
