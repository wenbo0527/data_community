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
      supplierCode: 'BAIHANG',
      supplierName: '百行',
      supplierType: 'data_provider',
      status: 'active',
      creditRating: 4,
      registrationDate: '2022-05-01T00:00:00Z',
      contactInfo: { company: '百行科技', contactPerson: '张经理', email: 'zhang@baihang.com', phone: '13800138000', address: '北京朝阳' },
      businessLicense: '91110000777648852X',
      taxId: '91110000777648852X',
      bankInfo: { bankName: '中国银行北京分行', bankAccount: '1234567890123456789', bankCode: 'BOC-BJ' },
      tags: ['LBS','DATA'],
      description: '百行数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      id: 'SUP-002',
      supplierCode: 'PUDAO',
      supplierName: '朴道',
      supplierType: 'data_provider',
      status: 'active',
      creditRating: 4,
      registrationDate: '2022-08-10T00:00:00Z',
      contactInfo: { company: '朴道科技', contactPerson: '李经理', email: 'li@pudao.com', phone: '13900139000', address: '上海浦东' },
      businessLicense: '91310000777648852Y',
      taxId: '91310000777648852Y',
      bankInfo: { bankName: '工商银行上海分行', bankAccount: '9876543210987654321', bankCode: 'ICBC-SH' },
      tags: ['LBS','DATA'],
      description: '朴道数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      id: 'SUP-003',
      supplierCode: 'BAIDU',
      supplierName: '百度',
      supplierType: 'platform_provider',
      status: 'active',
      creditRating: 5,
      registrationDate: '2020-03-01T00:00:00Z',
      contactInfo: { company: '百度在线', contactPerson: '王经理', email: 'wang@baidu.com', phone: '13700137000', address: '深圳南山' },
      businessLicense: '91440000777648852Z',
      taxId: '91440000777648852Z',
      bankInfo: { bankName: '建设银行深圳分行', bankAccount: '5555555555555555555', bankCode: 'CCB-SZ' },
      tags: ['MAP'],
      description: '百度地图数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system'
    },
    {
      id: 'SUP-004',
      supplierCode: 'GAODE',
      supplierName: '高德',
      supplierType: 'platform_provider',
      status: 'active',
      creditRating: 5,
      registrationDate: '2020-06-01T00:00:00Z',
      contactInfo: { company: '高德软件', contactPerson: '赵经理', email: 'zhao@autonavi.com', phone: '13600136000', address: '杭州西湖' },
      businessLicense: '91510000777648852A',
      taxId: '91510000777648852A',
      bankInfo: { bankName: '农业银行杭州分行', bankAccount: '6666666666666666666', bankCode: 'ABC-HZ' },
      tags: ['MAP'],
      description: '高德地图数据供应商',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'system',
      updatedBy: 'system'
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
  return suppliers.find(s => s.supplierCode === supplierCode) || null
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
  return suppliers.filter(s => s.supplierType === category)
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
