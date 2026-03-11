export interface Supplier {
  id: string
  supplierCode: string
  supplierName: string
  supplierType: 'data_provider' | 'service_provider' | 'platform_provider'
  status: 'active' | 'inactive' | 'suspended'
  creditRating?: number
  registrationDate: string
  contactInfo: { company: string; contactPerson: string; email: string; phone: string; address: string }
  businessLicense?: string
  taxId?: string
  bankInfo?: { bankName: string; bankAccount: string; bankCode: string }
  tags: string[]
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface SupplierProduct {
  id: string
  supplierId: string
  productId: string
  productCode: string
  productName: string
  category: string
  status: 'active' | 'inactive'
  interfaceCount: number
  hasContract: boolean
  createdAt: string
  updatedAt: string
}
