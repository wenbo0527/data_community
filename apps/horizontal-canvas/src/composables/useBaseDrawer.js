import { ref, reactive, computed } from 'vue'

export function useBaseDrawer({ props, emit, initialFormData, formRules, getInitialFormData, customValidation, nodeType, onSubmit, onCancel }) {
  const visible = ref(!!props.visible)
  const formRef = ref(null)
  const base = getInitialFormData ? getInitialFormData() : (initialFormData || {})
  const cfg = (props?.nodeData && props.nodeData.config) ? props.nodeData.config : {}
  const merged = { ...base, ...cfg }
  if (cfg && typeof cfg.nodeName === 'string' && cfg.nodeName) merged.nodeName = cfg.nodeName
  const formData = reactive(merged)
  const submitting = ref(false)

  const normalizeValidation = (res) => {
    if (res == null) return true
    if (Array.isArray(res)) return res.length === 0
    if (typeof res === 'boolean') return res
    return true
  }

  const isFormValid = computed(() => {
    try {
      const res = customValidation ? customValidation(formData) : true
      return normalizeValidation(res)
    } catch { return true }
  })
  const isValid = isFormValid

  const baseHandleSubmit = async (config) => {
    try {
      submitting.value = true
      const payload = onSubmit ? (await onSubmit(config ?? formData)) : (config ?? formData)
      emit('confirm', payload)
      emit('update:visible', false)
    } finally {
      submitting.value = false
    }
  }

  const handleSubmit = async () => {
    await baseHandleSubmit(formData)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    emit('cancel')
    emit('update:visible', false)
  }

  const handleDebugSubmit = async () => {
    await baseHandleSubmit(formData)
  }

  return { formData, formRef, isFormValid, isValid, submitting, isSubmitting: submitting, visible, handleSubmit, handleCancel, handleDebugSubmit, handleSubmitBase: baseHandleSubmit }
}
