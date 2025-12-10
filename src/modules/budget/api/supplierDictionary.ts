import type { Supplier } from '@/modules/external-data/types/supplier'

/**
 * 结算系统供应商字典引用API
 * 用于从外数档案模块获取供应商信息，作为只读引用
 */

/**
 * 获取所有可用的供应商列表
 * 用于结算系统的供应商筛选和选择
 */
export async function getAvailableSuppliers(): Promise<Supplier[]> {
  // 模拟从外数档案模块获取供应商数据
  // 实际项目中这里应该调用外数档案模块的API
  return Promise.resolve([
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
    },
    {
      id: 'SUP-003',
      code: 'BAIDU',
      name: '百度',
      category: 'MAP',
      status: 'active',
      contactInfo: {
        person: '王经理',
        phone: '13700137000',
        email: 'wang@baidu.com'
      },
      billingInfo: {
        bankName: '建设银行深圳分行',
        bankAccount: '5555555555555555555',
        taxNo: '91440000777648852Z'
      },
      description: '百度地图数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'SUP-004',
      code: 'GAODE',
      name: '高德',
      category: 'MAP',
      status: 'active',
      contactInfo: {
        person: '赵经理',
        phone: '13600136000',
        email: 'zhao@autonavi.com'
      },
      billingInfo: {
        bankName: '农业银行杭州分行',
        bankAccount: '6666666666666666666',
        taxNo: '91510000777648852A'
      },
      description: '高德地图数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ])
}

/**
 * 根据供应商ID获取供应商详细信息
 * 用于结算任务中的供应商详情展示
 */
export async function getSupplierById(supplierId: string): Promise<Supplier | null> {
  const suppliers = await getAvailableSuppliers()
  return suppliers.find(s => s.id === supplierId) || null
}

/**
 * 根据供应商编码获取供应商信息
 * 用于通过合同中的供应商字段反查供应商详情
 */
export async function getSupplierByCode(supplierCode: string): Promise<Supplier | null> {
  const suppliers = await getAvailableSuppliers()
  return suppliers.find(s => s.code === supplierCode) || null
}

/**
 * 批量获取供应商信息
 * 用于结算任务中多个供应商的批量查询
 */
export async function getSuppliersByIds(supplierIds: string[]): Promise<Supplier[]> {
  const suppliers = await getAvailableSuppliers()
  return suppliers.filter(s => supplierIds.includes(s.id))
}

/**
 * 获取指定分类的供应商列表
 * 用于按业务分类筛选供应商
 */
export async function getSuppliersByCategory(category: string): Promise<Supplier[]> {
  const suppliers = await getAvailableSuppliers()
  return suppliers.filter(s => s.category === category)
}

/**
 * 检查供应商是否可用
 * 用于结算前验证供应商状态
 */
export async function checkSupplierAvailability(supplierId: string): Promise<boolean> {
  const supplier = await getSupplierById(supplierId)
  return supplier !== null && supplier.status === 'active'
}

/**
 * 获取供应商的结算配置信息
 * 包括结算周期、付款条件等
 */
export async function getSupplierSettlementConfig(supplierId: string): Promise<{
  settlementCycle: 'monthly' | 'quarterly' | 'yearly'
  paymentTerms: number // 付款账期（天）
  billingType: 'prepaid' | 'postpaid'
  currency: string
  taxRate: number
} | null> {
  const supplier = await getSupplierById(supplierId)
  if (!supplier) return null

  // 模拟不同供应商的结算配置
  const configMap: Record<string, {
    settlementCycle: 'monthly' | 'quarterly' | 'yearly'
    paymentTerms: number
    billingType: 'prepaid' | 'postpaid'
    currency: string
    taxRate: number
  }> = {
    'SUP-001': { // 美团
      settlementCycle: 'monthly',
      paymentTerms: 30,
      billingType: 'postpaid',
      currency: 'CNY',
      taxRate: 0.06
    },
    'SUP-002': { // 滴滴
      settlementCycle: 'monthly',
      paymentTerms: 45,
      billingType: 'postpaid',
      currency: 'CNY',
      taxRate: 0.06
    },
    'SUP-003': { // 百度
      settlementCycle: 'quarterly',
      paymentTerms: 60,
      billingType: 'prepaid',
      currency: 'CNY',
      taxRate: 0.06
    },
    'SUP-004': { // 高德
      settlementCycle: 'monthly',
      paymentTerms: 30,
      billingType: 'postpaid',
      currency: 'CNY',
      taxRate: 0.06
    }
  }

  return configMap[supplierId] || {
    settlementCycle: 'monthly',
    paymentTerms: 30,
    billingType: 'postpaid',
    currency: 'CNY',
    taxRate: 0.06
  }
}