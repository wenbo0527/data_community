import axios from 'axios'
import type {
  Supplier,
  SupplierPricing,
  SupplierProduct,
  SupplierQuery,
  PricingQuery,
  SupplierListResponse,
  PricingListResponse,
  SupplierStatusLog,
  SupplierEvaluation
} from '../types/supplier'

/**
 * 供应商管理API
 * 作为供应商信息的唯一真实来源
 */

// 供应商基础管理
export async function getSuppliers(params: SupplierQuery): Promise<SupplierListResponse> {
  const res = await axios.get('/api/external-data/suppliers', { params })
  return (res as any)?.data
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const res = await axios.get(`/api/external-data/suppliers/${id}`)
  return (res as any)?.data
}

export async function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
  const res = await axios.post('/api/external-data/suppliers', data)
  return (res as any)?.data
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
  const res = await axios.put(`/api/external-data/suppliers/${id}`, data)
  return (res as any)?.data
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const res = await axios.delete(`/api/external-data/suppliers/${id}`)
  return (res as any)?.data?.success || true
}

export async function updateSupplierStatus(id: string, status: string, reason?: string): Promise<Supplier> {
  const res = await axios.patch(`/api/external-data/suppliers/${id}/status`, { status, reason })
  return (res as any)?.data
}

// 供应商定价档案管理
export async function getSupplierPricings(params: PricingQuery): Promise<PricingListResponse> {
  const res = await axios.get('/api/external-data/suppliers/pricings', { params })
  return (res as any)?.data
}

export async function getSupplierPricing(id: string): Promise<SupplierPricing | null> {
  const res = await axios.get(`/api/external-data/suppliers/pricings/${id}`)
  return (res as any)?.data
}

export async function createSupplierPricing(data: Omit<SupplierPricing, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierPricing> {
  const res = await axios.post('/api/external-data/suppliers/pricings', data)
  return (res as any)?.data
}

export async function updateSupplierPricing(id: string, data: Partial<SupplierPricing>): Promise<SupplierPricing> {
  const res = await axios.put(`/api/external-data/suppliers/pricings/${id}`, data)
  return (res as any)?.data
}

export async function deleteSupplierPricing(id: string): Promise<boolean> {
  const res = await axios.delete(`/api/external-data/suppliers/pricings/${id}`)
  return (res as any)?.data?.success || true
}

// 获取供应商的有效定价
export async function getActivePricing(supplierId: string, productCode: string, date?: string): Promise<SupplierPricing | null> {
  const params = { supplierId, productCode, date: date || new Date().toISOString(), status: 'active' }
  const res = await axios.get('/api/external-data/suppliers/pricings/active', { params })
  return (res as any)?.data
}

// 供应商产品关联管理
export async function getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  const res = await axios.get(`/api/external-data/suppliers/${supplierId}/products`)
  return (res as any)?.data?.list || []
}

export async function addSupplierProduct(data: Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierProduct> {
  const res = await axios.post('/api/external-data/suppliers/products', data)
  return (res as any)?.data
}

export async function removeSupplierProduct(id: string): Promise<boolean> {
  const res = await axios.delete(`/api/external-data/suppliers/products/${id}`)
  return (res as any)?.data?.success || true
}

// 供应商状态变更记录
export async function getSupplierStatusLogs(supplierId: string): Promise<SupplierStatusLog[]> {
  const res = await axios.get(`/api/external-data/suppliers/${supplierId}/status-logs`)
  return (res as any)?.data?.list || []
}

// 供应商评估管理
export async function getSupplierEvaluations(supplierId: string): Promise<SupplierEvaluation[]> {
  const res = await axios.get(`/api/external-data/suppliers/${supplierId}/evaluations`)
  return (res as any)?.data?.list || []
}

export async function createSupplierEvaluation(data: Omit<SupplierEvaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplierEvaluation> {
  const res = await axios.post('/api/external-data/suppliers/evaluations', data)
  return (res as any)?.data
}

// 供其他模块引用的供应商字典API
export async function getSupplierDictionary(): Promise<Pick<Supplier, 'id' | 'supplierCode' | 'supplierName' | 'status'>[]> {
  const res = await axios.get('/api/external-data/suppliers/dictionary')
  return (res as any)?.data || []
}

// 获取供应商的简要信息（供其他模块引用）
export async function getSupplierBrief(id: string): Promise<Pick<Supplier, 'id' | 'supplierCode' | 'supplierName' | 'supplierType' | 'status'> | null> {
  const res = await axios.get(`/api/external-data/suppliers/${id}/brief`)
  return (res as any)?.data
}

// 批量获取供应商信息
export async function getSuppliersByIds(ids: string[]): Promise<Supplier[]> {
  const res = await axios.post('/api/external-data/suppliers/batch', { ids })
  return (res as any)?.data?.list || []
}