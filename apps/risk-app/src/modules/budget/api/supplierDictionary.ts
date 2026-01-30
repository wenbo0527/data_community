import type { Supplier } from '../../external-data/types/supplier'

const now = new Date().toISOString()
const suppliersMock: Supplier[] = [
  { id: 'SUP-001', supplierCode: '学信网', supplierName: '学信网', supplierType: 'data_provider', status: 'active', creditRating: 90, registrationDate: now, contactInfo: { company: '学信网', contactPerson: '教务经理', email: 'support@chsi.com.cn', phone: '010-12345678', address: '北京' }, tags: ['教育','认证'], createdAt: now, updatedAt: now, createdBy: 'admin', updatedBy: 'admin' },
  { id: 'SUP-002', supplierCode: '百行', supplierName: '百行', supplierType: 'data_provider', status: 'active', creditRating: 88, registrationDate: now, contactInfo: { company: '百行征信', contactPerson: '客户经理', email: 'service@bhcredit.cn', phone: '021-98765432', address: '上海' }, tags: ['征信','信用'], createdAt: now, updatedAt: now, createdBy: 'admin', updatedBy: 'admin' },
  { id: 'SUP-003', supplierCode: '朴道', supplierName: '朴道', supplierType: 'data_provider', status: 'active', creditRating: 85, registrationDate: now, contactInfo: { company: '朴道智能', contactPerson: '渠道经理', email: 'bd@pudao.ai', phone: '0755-11223344', address: '深圳' }, tags: ['设备','风控'], createdAt: now, updatedAt: now, createdBy: 'admin', updatedBy: 'admin' },
  { id: 'SUP-004', supplierCode: '钱塘', supplierName: '钱塘', supplierType: 'data_provider', status: 'active', creditRating: 84, registrationDate: now, contactInfo: { company: '钱塘数据', contactPerson: '商务经理', email: 'contact@qiantangdata.cn', phone: '0571-55667788', address: '杭州' }, tags: ['位置','行为'], createdAt: now, updatedAt: now, createdBy: 'admin', updatedBy: 'admin' }
]

export async function getSupplierOptions() {
  return suppliersMock.map(s => s.supplierName)
}

export async function getAvailableSuppliers(): Promise<Supplier[]> {
  return suppliersMock.filter(s => s.status === 'active')
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  return suppliersMock.find(s => s.id === id)
}

export async function getSuppliersByIds(ids: string[]): Promise<Supplier[]> {
  const set = new Set(ids)
  return suppliersMock.filter(s => set.has(s.id))
}

export async function checkSupplierAvailability(id: string): Promise<boolean> {
  const s = suppliersMock.find(x => x.id === id)
  return !!s && s.status === 'active'
}
