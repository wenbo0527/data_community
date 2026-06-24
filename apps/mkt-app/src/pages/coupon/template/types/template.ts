/**
 * 优惠券模板相关类型定义
 * TASK-20260618-11640CE4 (chain-#6)
 */

export type CouponType = 'interest_free' | 'discount' | 'PRICED_DISCOUNT'

export type ValidityPeriodType = 'limited' | 'unlimited'

export type LoanPeriodType = 'unlimited' | 'range' | 'fixed'

export type DiscountType = 'uniform' | 'staged' | 'fixed'

export type LockPeriodType = 'days' | 'months' | 'unlimited'

export type LockLimitType = 'unlimited' | 'limited'

export interface ProductOption {
  label: string
  value: string
}

export interface CouponTemplate {
  id: string
  name: string
  type: CouponType
  description: string
  validityPeriodType: ValidityPeriodType
  validityPeriod?: [Date, Date]
  firstUseOnly: boolean
  stackable: boolean
  repaymentMethods: string[]
  loanPeriodType: LoanPeriodType
  loanPeriodMin?: number
  loanPeriodMax?: number
  loanPeriodValue?: number
  loanAmountMin?: number
  loanAmountMax?: number
  useChannels: string[]
  creditChannels: string[]
  interestFreeDays?: number
  maxInterestFreeAmount?: number
  discountType: DiscountType
  uniformDiscount?: number
  frontPeriods?: number
  frontDiscount?: number
  backPeriods?: number
  backDiscount?: number
  fixedFrontPeriods?: number
  fixedFrontValue?: number
  fixedBackPeriods?: number
  fixedBackDiscount?: number
  hasLockPeriod: boolean
  lockPeriodType: LockPeriodType
  lockPeriodValue?: number
  lockLimitType: LockLimitType
  displayName: string
  cornerText: string
  categoryText: string
  reductionValue: string
  showExpiryDate: boolean
  expiryReminderThreshold?: number
  usageDescription: string
  product_id: string
  product_name: string
  discount_value?: number
}
