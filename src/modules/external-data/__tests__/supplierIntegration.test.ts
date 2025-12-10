import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getAvailableSuppliers, 
  getSupplierById, 
  getSuppliersByIds,
  getSupplierSettlementConfig,
  checkSupplierAvailability 
} from '@/modules/budget/api/supplierDictionary'
import { useSettlementSupplier } from '@/modules/budget/composables/useSettlementSupplier'
import { supplierChangeNotifier, notifySupplierChange } from '@/modules/external-data/utils/supplierChangeNotifier'

// 模拟数据
const mockSuppliers = [
  {
    id: 'SUP-001',
    code: 'MEITUAN',
    name: '美团',
    category: 'LBS',
    status: 'active',
    contactInfo: {
      person: '张经理',
      phone: '13800138000',
      email: 'zhang@meituan.com'
    },
    billingInfo: {
      bankName: '中国银行北京分行',
      bankAccount: '1234567890123456789',
      taxNo: '91110000777648852X'
    },
    description: '美团位置服务数据供应商',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'SUP-002',
    code: 'DIDI',
    name: '滴滴',
    category: 'LBS',
    status: 'active',
    contactInfo: {
      person: '李经理',
      phone: '13900139000',
      email: 'li@didiglobal.com'
    },
    billingInfo: {
      bankName: '工商银行上海分行',
      bankAccount: '9876543210987654321',
      taxNo: '91310000777648852Y'
    },
    description: '滴滴出行数据供应商',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('供应商管理统一入口功能测试', () => {
  describe('供应商字典API测试', () => {
    it('应该获取所有可用供应商', async () => {
      const suppliers = await getAvailableSuppliers()
      expect(suppliers).toBeInstanceOf(Array)
      expect(suppliers.length).toBeGreaterThan(0)
      expect(suppliers[0]).toHaveProperty('id')
      expect(suppliers[0]).toHaveProperty('name')
      expect(suppliers[0]).toHaveProperty('status')
    })

    it('应该根据ID获取供应商', async () => {
      const supplier = await getSupplierById('SUP-001')
      expect(supplier).not.toBeNull()
      expect(supplier?.id).toBe('SUP-001')
      expect(supplier?.name).toBe('美团')
    })

    it('应该返回null当供应商ID不存在', async () => {
      const supplier = await getSupplierById('NON-EXISTENT')
      expect(supplier).toBeNull()
    })

    it('应该批量获取供应商', async () => {
      const suppliers = await getSuppliersByIds(['SUP-001', 'SUP-002'])
      expect(suppliers).toHaveLength(2)
      expect(suppliers[0].name).toBe('美团')
      expect(suppliers[1].name).toBe('滴滴')
    })

    it('应该检查供应商可用性', async () => {
      const isAvailable = await checkSupplierAvailability('SUP-001')
      expect(isAvailable).toBe(true)
    })

    it('应该返回false当供应商不可用时', async () => {
      // 模拟不存在的供应商
      const isAvailable = await checkSupplierAvailability('SUP-999')
      expect(isAvailable).toBe(false)
    })

    it('应该获取供应商结算配置', async () => {
      const config = await getSupplierSettlementConfig('SUP-001')
      expect(config).not.toBeNull()
      expect(config).toHaveProperty('settlementCycle')
      expect(config).toHaveProperty('paymentTerms')
      expect(config).toHaveProperty('billingType')
      expect(config).toHaveProperty('currency')
      expect(config).toHaveProperty('taxRate')
    })
  })

  describe('结算系统供应商组合式函数测试', () => {
    it('应该正确初始化供应商数据', () => {
      const { suppliers, supplierOptions, supplierMap } = useSettlementSupplier()
      
      expect(suppliers.value).toBeInstanceOf(Array)
      expect(supplierOptions.value).toBeInstanceOf(Array)
      expect(supplierMap.value).toBeInstanceOf(Map)
    })

    it('应该加载供应商数据', async () => {
      const { loadSuppliers, suppliers, loading, error } = useSettlementSupplier()
      
      expect(loading.value).toBe(false)
      
      const promise = loadSuppliers()
      expect(loading.value).toBe(true)
      
      await promise
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(suppliers.value.length).toBeGreaterThan(0)
    })

    it('应该根据ID获取供应商', async () => {
      const { loadSuppliers, getSupplier } = useSettlementSupplier()
      
      await loadSuppliers()
      const supplier = getSupplier('SUP-001')
      
      expect(supplier).toBeDefined()
      expect(supplier?.name).toBe('美团')
    })

    it('应该获取供应商名称', async () => {
      const { loadSuppliers, getSupplierName } = useSettlementSupplier()
      
      await loadSuppliers()
      const name = getSupplierName('SUP-001')
      
      expect(name).toBe('美团')
    })

    it('应该返回未知供应商当ID不存在', async () => {
      const { loadSuppliers, getSupplierName } = useSettlementSupplier()
      
      await loadSuppliers()
      const name = getSupplierName('NON-EXISTENT')
      
      expect(name).toBe('未知供应商')
    })

    it('应该从合同中提取供应商信息', async () => {
      const { loadSuppliers, extractSuppliersFromContracts } = useSettlementSupplier()
      
      await loadSuppliers()
      const contracts = [
        { supplier: '美团' },
        { supplier: '滴滴' },
        { supplier: 'UNKNOWN' }
      ]
      
      const suppliers = extractSuppliersFromContracts(contracts)
      
      expect(suppliers).toHaveLength(2) // 只提取到已知的供应商
      expect(suppliers[0].name).toBe('美团')
      expect(suppliers[1].name).toBe('滴滴')
    })

    it('应该验证供应商列表', async () => {
      const { loadSuppliers, validateSuppliers } = useSettlementSupplier()
      
      await loadSuppliers()
      const result = await validateSuppliers(['SUP-001', 'SUP-002', 'SUP-999'])
      
      expect(result.valid).toBe(false)
      expect(result.invalidIds).toContain('SUP-999')
      expect(result.details).toHaveLength(3)
      expect(result.details[0].available).toBe(true)
      expect(result.details[2].available).toBe(false)
    })
  })

  describe('供应商变更通知机制测试', () => {
    beforeEach(() => {
      // 清空监听器
      supplierChangeNotifier['listeners'].clear()
      supplierChangeNotifier['eventQueue'] = []
    })

    it('应该注册监听器', () => {
      const listener = {
        id: 'test-listener',
        name: '测试监听器',
        callback: vi.fn()
      }
      
      const unregister = supplierChangeNotifier.registerListener(listener)
      expect(supplierChangeNotifier['listeners'].has('test-listener')).toBe(true)
      
      unregister()
      expect(supplierChangeNotifier['listeners'].has('test-listener')).toBe(false)
    })

    it('应该触发变更通知', async () => {
      const callback = vi.fn()
      const listener = {
        id: 'test-listener',
        name: '测试监听器',
        callback
      }
      
      supplierChangeNotifier.registerListener(listener)
      
      const event = {
        type: 'update' as const,
        supplierId: 'SUP-001',
        supplierCode: 'MEITUAN',
        supplierName: '美团',
        timestamp: new Date().toISOString()
      }
      
      await supplierChangeNotifier.notifyChange(event)
      
      expect(callback).toHaveBeenCalledWith(event)
    })

    it('应该过滤事件类型', async () => {
      const callback = vi.fn()
      const listener = {
        id: 'test-listener',
        name: '测试监听器',
        callback,
        filter: {
          eventTypes: ['create', 'delete'] as const
        }
      }
      
      supplierChangeNotifier.registerListener(listener)
      
      const updateEvent = {
        type: 'update' as const,
        supplierId: 'SUP-001',
        supplierCode: 'MEITUAN',
        supplierName: '美团',
        timestamp: new Date().toISOString()
      }
      
      await supplierChangeNotifier.notifyChange(updateEvent)
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('应该发送供应商变更通知', async () => {
      const callback = vi.fn()
      const listener = {
        id: 'test-listener',
        name: '测试监听器',
        callback
      }
      
      supplierChangeNotifier.registerListener(listener)
      
      await notifySupplierChange('update', {
        id: 'SUP-001',
        code: 'MEITUAN',
        name: '美团'
      }, {
        name: { oldValue: '美团网', newValue: '美团' }
      })
      
      expect(callback).toHaveBeenCalled()
      const callArg = callback.mock.calls[0][0]
      expect(callArg.type).toBe('update')
      expect(callArg.supplierId).toBe('SUP-001')
      expect(callArg.changes).toHaveProperty('name')
    })

    it('应该处理状态变更通知', async () => {
      const callback = vi.fn()
      const listener = {
        id: 'test-listener',
        name: '测试监听器',
        callback
      }
      
      supplierChangeNotifier.registerListener(listener)
      
      await notifySupplierChange('status_change', {
        id: 'SUP-001',
        code: 'MEITUAN',
        name: '美团',
        status: 'inactive'
      }, {
        status: { oldValue: 'active', newValue: 'inactive' }
      })
      
      expect(callback).toHaveBeenCalled()
      const callArg = callback.mock.calls[0][0]
      expect(callArg.type).toBe('status_change')
      expect(callArg.oldStatus).toBe('active')
      expect(callArg.newStatus).toBe('inactive')
    })
  })

  describe('集成测试', () => {
    it('应该实现完整的供应商管理流程', async () => {
      // 1. 加载供应商数据
      const { loadSuppliers, supplierOptions } = useSettlementSupplier()
      await loadSuppliers()
      
      expect(supplierOptions.value.length).toBeGreaterThan(0)
      
      // 2. 验证供应商可用性
      const { validateSuppliers } = useSettlementSupplier()
      const supplierIds = supplierOptions.value.map(opt => opt.value)
      const validation = await validateSuppliers(supplierIds)
      
      expect(validation.valid).toBe(true)
      expect(validation.invalidIds).toHaveLength(0)
      
      // 3. 模拟供应商变更通知
      const callback = vi.fn()
      supplierChangeNotifier.registerListener({
        id: 'integration-test',
        name: '集成测试监听器',
        callback
      })
      
      await notifySupplierChange('update', {
        id: 'SUP-001',
        code: 'MEITUAN',
        name: '美团'
      })
      
      expect(callback).toHaveBeenCalled()
    })
  })
})