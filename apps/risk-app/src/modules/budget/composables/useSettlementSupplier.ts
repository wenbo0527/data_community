import { ref, computed } from 'vue'
import { getAvailableSuppliers, getSupplierById, getSuppliersByIds, checkSupplierAvailability, partnerOrgNames, shortToFullName } from '../../budget/api/supplierDictionary'
import type { Supplier } from '../../external-data/types/supplier'

export function useSettlementSupplier() {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeSuppliers = computed(() => suppliers.value.filter(s => s.status === 'active'))
  // PRD R01: 合作机构选项列表（全称）
  const partnerOrgOptions = computed(() => partnerOrgNames.map(name => ({ label: name, value: name })))
  const supplierOptions = computed(() => activeSuppliers.value.map(s => ({
    label: s.supplierName,
    value: s.supplierName,
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

  const loadSuppliers = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await getAvailableSuppliers()
      suppliers.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载合作机构失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSupplier = (id: string): Supplier | undefined => supplierMap.value.get(id)
  const getSupplierByCode = (code: string): Supplier | undefined => supplierCodeMap.value.get(code)
  const getSuppliers = (ids: string[]): Supplier[] => ids.map(id => getSupplier(id)).filter(Boolean) as Supplier[]
  const isSupplierAvailable = (id: string): boolean => { const supplier = getSupplier(id); return supplier !== undefined && supplier.status === 'active' }
  const getSuppliersByCategory = (category: string): Supplier[] => activeSuppliers.value.filter(s => s.supplierType === category)
  const getSupplierName = (id: string): string => getSupplier(id)?.supplierName || '未知合作机构'
  const getSupplierCode = (id: string): string => getSupplier(id)?.supplierCode || 'UNKNOWN'

  const validateSuppliers = async (supplierIds: string[]) => {
    const details = await Promise.all(
      supplierIds.map(async (id) => {
        const supplier = getSupplier(id)
        if (!supplier) return { id, name: '未知合作机构', available: false, reason: '合作机构不存在' }
        const available = await checkSupplierAvailability(id)
        return { id, name: supplier.supplierName, available, reason: available ? undefined : '合作机构不可用' }
      })
    )
    const invalidIds = details.filter(d => !d.available).map(d => d.id)
    return { valid: invalidIds.length === 0, invalidIds, details }
  }

  const extractSuppliersFromContracts = (contracts: Array<{ supplier: string }>): Supplier[] => {
    const res: Supplier[] = []
    const processed = new Set<string>()
    contracts.forEach(contract => {
      if (contract.supplier && !processed.has(contract.supplier)) {
        processed.add(contract.supplier)
        let supplier = getSupplierByCode(contract.supplier)
        if (!supplier) supplier = activeSuppliers.value.find(s => s.supplierName === contract.supplier || s.supplierCode === contract.supplier)
        if (supplier) res.push(supplier)
      }
    })
    return res
  }

  return {
    suppliers, loading, error,
    activeSuppliers, partnerOrgOptions, supplierOptions, supplierMap, supplierCodeMap,
    loadSuppliers, getSupplier, getSupplierByCode, getSuppliers, isSupplierAvailable,
    getSuppliersByCategory, getSupplierName, getSupplierCode, validateSuppliers, extractSuppliersFromContracts,
    partnerOrgNames, shortToFullName
  }
}
