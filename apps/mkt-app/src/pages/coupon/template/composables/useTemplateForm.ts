/**
 * 优惠券模板表单状态管理 Composable
 * TASK-20260618-11640CE4 (chain-#6)
 *
 * 职责：
 * - formData ref（核心状态）
 * - rules 校验规则
 * - formRef
 * - handleProductChange 副作用
 */

import { ref, computed, Ref, ComputedRef } from 'vue'

export interface TemplateFormData {
  id: string
  name: string
  type: string
  description: string
  validityPeriodType: string
  validityPeriod: [Date, Date] | undefined
  firstUseOnly: boolean
  stackable: boolean
  repaymentMethods: string[]
  loanPeriodType: string
  loanPeriodMin: number | undefined
  loanPeriodMax: number | undefined
  loanPeriodValue: number | undefined
  loanAmountMin: number | undefined
  loanAmountMax: number | undefined
  useChannels: string[]
  creditChannels: string[]
  interestFreeDays: number | undefined
  maxInterestFreeAmount: number | undefined
  discountType: string
  uniformDiscount: number | undefined
  frontPeriods: number | undefined
  frontDiscount: number | undefined
  backPeriods: number | undefined
  backDiscount: number | undefined
  fixedFrontPeriods: number | undefined
  fixedFrontValue: number | undefined
  fixedBackPeriods: number | undefined
  fixedBackDiscount: number | undefined
  hasLockPeriod: boolean
  lockPeriodType: string
  lockPeriodValue: number | undefined
  lockLimitType: string
  displayName: string
  cornerText: string
  categoryText: string
  reductionValue: string
  showExpiryDate: boolean
  expiryReminderThreshold: number | undefined
  usageDescription: string
  product_id: string
  product_name: string
  discount_value: number | undefined
}

const createEmptyFormData = (): TemplateFormData => ({
  id: '',
  name: '',
  type: 'interest_free',
  description: '',
  validityPeriodType: 'limited',
  validityPeriod: undefined,
  firstUseOnly: false,
  stackable: false,
  repaymentMethods: [],
  loanPeriodType: 'unlimited',
  loanPeriodMin: undefined,
  loanPeriodMax: undefined,
  loanPeriodValue: undefined,
  loanAmountMin: undefined,
  loanAmountMax: undefined,
  useChannels: [],
  creditChannels: [],
  interestFreeDays: undefined,
  maxInterestFreeAmount: undefined,
  discountType: 'uniform',
  uniformDiscount: undefined,
  frontPeriods: undefined,
  frontDiscount: undefined,
  backPeriods: undefined,
  backDiscount: undefined,
  fixedFrontPeriods: undefined,
  fixedFrontValue: undefined,
  fixedBackPeriods: undefined,
  fixedBackDiscount: undefined,
  hasLockPeriod: false,
  lockPeriodType: 'days',
  lockPeriodValue: undefined,
  lockLimitType: 'unlimited',
  displayName: '',
  cornerText: '',
  categoryText: '',
  reductionValue: '',
  showExpiryDate: true,
  expiryReminderThreshold: undefined,
  usageDescription: '',
  product_id: '',
  product_name: '',
  discount_value: undefined
})

const productOptions = [
  { label: '自营APP', value: 'SELF_APP' }
]

const pricedProductOptions = [
  { label: '京东大额低息', value: 'JD_001' },
  { label: '美团大额低息', value: 'MT_001' }
]

export function useTemplateForm() {
  const formData = ref<TemplateFormData>(createEmptyFormData())
  const formRef = ref()

  // 产品是否已锁定
  const productLocked: ComputedRef<boolean> = computed(() => {
    return !!(formData.value.product_id)
  })

  // 切换产品
  const handleProductChange = (value: string) => {
    formData.value.product_id = value
    formData.value.product_name = pricedProductOptions.find(p => p.value === value)?.label || ''
  }

  // 校验规则
  const rules = {
    name: [
      { required: true, message: '请输入优惠券名称' },
      { maxLength: 50, message: '名称最多50个字符' }
    ],
    type: [
      { required: true, message: '请选择优惠券类型' }
    ],
    product_id: [
      {
        validator: (value: string, cb: (error?: string) => void) => {
          if (formData.value.type === 'PRICED_DISCOUNT' && !value) {
            cb('请选择产品')
          } else {
            cb()
          }
        }
      }
    ],
    discount_value: [
      {
        validator: (value: number | undefined, cb: (error?: string) => void) => {
          if (formData.value.type === 'PRICED_DISCOUNT' && !value) {
            cb('请输入折扣值')
          } else {
            cb()
          }
        }
      }
    ],
    firstUseOnly: [
      { required: true, message: '请选择是否仅限首次支用' }
    ],
    stackable: [
      { required: true, message: '请选择是否支持叠加' }
    ]
  }

  return {
    formData,
    formRef,
    rules,
    productOptions,
    pricedProductOptions,
    productLocked,
    handleProductChange
  }
}
