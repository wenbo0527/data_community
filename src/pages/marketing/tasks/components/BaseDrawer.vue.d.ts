import { DefineComponent } from 'vue'

export interface BaseDrawerSlots {
  form: (props: { formData: Record<string, any>; formRef: any }) => any
  content?: () => any
  debug?: (props: { formData: Record<string, any>; isValid: boolean }) => any
  actions?: () => any
}

export interface BaseDrawerProps {
  visible: boolean
  title?: string
  width?: string
  closable?: boolean
  maskClosable?: boolean
  formData: Record<string, any>
  formRules?: Record<string, any>
  formRef?: any
  isFormValid?: boolean
  submitting?: boolean
  confirmText?: string
  cancelText?: string
  showDebug?: boolean
}

export interface BaseDrawerEmits {
  'update:visible': (visible: boolean) => void
  'confirm': () => void
  'cancel': () => void
  'debug-submit': () => void
}

declare const BaseDrawer: DefineComponent<BaseDrawerProps, {}, {}, {}, {}, {}, {}, BaseDrawerEmits, string, {}, {}, string, BaseDrawerSlots>

export default BaseDrawer