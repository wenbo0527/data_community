import { Ref, ComputedRef } from 'vue'

export interface UseBaseDrawerOptions {
  props: any
  emit: any
  formRules?: Record<string, any>
  getInitialFormData?: () => any
  customValidation?: (formData: any) => boolean | string[]
  nodeType?: string
  initialFormData?: Record<string, any>
  onSubmit?: (formData: any) => any
  onCancel?: () => void
}

export interface UseBaseDrawerReturn {
  // 状态
  formData: Record<string, any>
  formRef: Ref<any>
  visible: ComputedRef<boolean>
  isSubmitting: Ref<boolean>
  isFormValid: ComputedRef<boolean>
  submitting: Ref<boolean>
  
  // 方法
  handleSubmit: (customConfig?: any) => Promise<void>
  handleCancel: () => void
  handleDebugSubmit: () => Promise<void>
  resetFormData: () => void
  initFormData: (nodeData: any) => void
}

export declare function useBaseDrawer(options: UseBaseDrawerOptions): UseBaseDrawerReturn