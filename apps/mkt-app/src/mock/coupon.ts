/**
 * Coupon Mock Data
 * Mock data for coupon module
 */

export interface MockTemplate {
  id: string
  templateId: string
  name: string
  type: 'discount' | 'reduction' | 'cash' | 'gift'
  description?: string
  denomination?: number
  threshold?: number
  validDays: number
  status: 'draft' | 'active' | 'paused' | 'expired'
  createTime: string
  updateTime: string
}

export interface MockPackage {
  id: string
  packageId: string
  name: string
  description: string
  couponCount: number
  totalValue: number
  status: 'active' | 'paused' | 'expired'
  validDays: number
  createTime: string
}

export interface MockRecord {
  id: string
  recordId: string
  userId: string
  userName: string
  couponName: string
  action: 'received' | 'used' | 'expired'
  createTime: string
}

export interface MockCoupon {
  id: string
  instanceId: string
  couponId: string
  templateId: string
  couponName: string
  couponType: 'discount' | 'reduction' | 'cash' | 'gift'
  status: 'received' | 'locked' | 'used' | 'expired'
  validPeriod: string
  createTime: string
}

// Mock data
export const templateMockData: MockTemplate[] = [
  {
    id: '1',
    templateId: 'T001',
    name: '新人专享券',
    type: 'discount',
    description: '新用户首单立减',
    denomination: 20,
    threshold: 100,
    validDays: 30,
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-15 14:30:00',
  },
  {
    id: '2',
    templateId: 'T002',
    name: '满减券',
    type: 'reduction',
    description: '满200减50',
    denomination: 50,
    threshold: 200,
    validDays: 15,
    status: 'active',
    createTime: '2024-01-05 09:00:00',
    updateTime: '2024-01-10 16:00:00',
  },
]

export const packageMockData: MockPackage[] = [
  {
    id: '1',
    packageId: 'P001',
    name: '新人礼包',
    description: '包含3张优惠券',
    couponCount: 3,
    totalValue: 100,
    status: 'active',
    validDays: 30,
    createTime: '2024-01-01 10:00:00',
  },
]

export const recordMockData: MockRecord[] = [
  {
    id: '1',
    recordId: 'R001',
    userId: 'U001',
    userName: '张三',
    couponName: '新人专享券',
    action: 'received',
    createTime: '2024-01-10 10:00:00',
  },
]

export const couponMockData: MockCoupon[] = [
  {
    id: '1',
    instanceId: 'I001',
    couponId: 'C001',
    templateId: 'T001',
    couponName: '新人专享券',
    couponType: 'discount',
    status: 'received',
    validPeriod: '2024-01-01 至 2024-01-31',
    createTime: '2024-01-10 10:00:00',
  },
]

export default {
  templateMockData,
  couponMockData,
  packageMockData,
  recordMockData,
}
