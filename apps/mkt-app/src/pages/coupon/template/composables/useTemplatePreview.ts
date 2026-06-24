/**
 * 优惠券模板预览 Composable
 * TASK-20260618-11640CE4 (chain-#6)
 *
 * 职责：
 * - previewData 计算属性
 * - refreshPreview 刷新方法
 * - quillOptions 编辑器配置
 * - isPreviewRendered 渲染状态
 */

import { ref, computed, Ref } from 'vue'
import type { TemplateFormData } from './useTemplateForm'

const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  },
  placeholder: '请输入优惠券使用说明，支持富文本格式...'
}

export function useTemplatePreview(formData: Ref<TemplateFormData>) {
  const previewKey = ref(0)

  const isPreviewRendered = computed(() => {
    return !!(formData.value.name || formData.value.displayName || formData.value.type)
  })

  const previewData = computed(() => ({
    id: formData.value.id,
    name: formData.value.displayName || formData.value.name,
    displayName: formData.value.displayName || formData.value.name,
    type: formData.value.type,
    cornerText: formData.value.cornerText,
    categoryText: formData.value.categoryText,
    reductionValue: formData.value.reductionValue,
    showExpiryDate: formData.value.showExpiryDate,
    validityPeriod: formData.value.validityPeriod,
    validityPeriodType: formData.value.validityPeriodType,
    expiryReminderThreshold: formData.value.expiryReminderThreshold,
    interestFreeDays: formData.value.interestFreeDays,
    maxInterestFreeAmount: formData.value.maxInterestFreeAmount,
    uniformDiscount: formData.value.uniformDiscount,
    product_name: formData.value.product_name,
    discount_value: formData.value.discount_value,
    usageInstructions: formData.value.usageDescription
  }))

  const refreshPreview = () => {
    previewKey.value++
  }

  return {
    previewKey,
    previewData,
    refreshPreview,
    isPreviewRendered,
    quillOptions
  }
}
