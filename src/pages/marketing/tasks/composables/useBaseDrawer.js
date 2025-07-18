import { ref, reactive, computed, watch } from 'vue'

/**
 * 基础抽屉组合式函数
 * 提供所有节点抽屉的通用功能和状态管理
 */
export function useBaseDrawer({
  props,
  emit,
  initialFormData,
  formRules,
  nodeType,
  onSubmit,
  onCancel,
  customValidation
}) {
  // 表单引用
  const formRef = ref()
  
  // 提交状态
  const submitting = ref(false)
  
  // 表单数据
  const formData = reactive({ ...initialFormData })
  
  // 重置表单数据
  const resetFormData = () => {
    Object.assign(formData, initialFormData)
    console.log(`[${nodeType}NodeConfigDrawer] 表单数据已重置为初始状态`)
  }
  
  // 初始化表单数据
  const initFormData = () => {
    if (props.nodeData?.config) {
      console.log(`[${nodeType}NodeConfigDrawer] 初始化已有配置数据`)
      Object.assign(formData, { ...initialFormData, ...props.nodeData.config })
    } else {
      console.log(`[${nodeType}NodeConfigDrawer] 初始化默认数据`)
      resetFormData()
    }
  }
  
  // 表单验证状态
  const isFormValid = computed(() => {
    // 如果有自定义验证函数，使用自定义验证
    if (customValidation) {
      return customValidation(formData, props)
    }
    
    // 默认验证：检查必填字段
    if (formRules) {
      for (const [field, rules] of Object.entries(formRules)) {
        const fieldRules = Array.isArray(rules) ? rules : [rules]
        for (const rule of fieldRules) {
          if (rule.required && (!formData[field] || formData[field] === '')) {
            return false
          }
        }
      }
    }
    
    return true
  })
  
  // 监听节点数据变化
  watch(() => props.nodeData, (newData) => {
    console.log(`[${nodeType}NodeConfigDrawer] 节点数据变化:`, newData)
    
    if (!newData) return
    
    // 如果是新节点，重置表单
    if (newData.isNewNode) {
      console.log(`[${nodeType}NodeConfigDrawer] 检测到新节点，重置表单数据`)
      resetFormData()
      return
    }
    
    // 加载已有配置
    if (newData.config) {
      console.log(`[${nodeType}NodeConfigDrawer] 加载已有配置数据`)
      Object.assign(formData, { ...initialFormData, ...newData.config })
    } else {
      console.log(`[${nodeType}NodeConfigDrawer] 无配置数据，使用默认初始状态`)
      resetFormData()
    }
  }, { immediate: true, deep: true })
  
  // 监听抽屉可见性变化
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      console.log(`[${nodeType}NodeConfigDrawer] 抽屉打开，检查是否需要重置表单`)
      if (props.nodeData?.isNewNode) {
        console.log(`[${nodeType}NodeConfigDrawer] 抽屉打开时检测到新节点，重置表单`)
        resetFormData()
      } else {
        initFormData()
      }
    }
  })
  
  // 处理取消
  const handleCancel = () => {
    console.log(`[${nodeType}NodeConfigDrawer] 处理取消操作`)
    if (onCancel) {
      onCancel()
    }
    emit('update:visible', false)
    emit('cancel')
  }
  
  // 处理提交
  const handleSubmit = async () => {
    try {
      console.log(`[${nodeType}NodeConfigDrawer] 处理提交操作`)
      submitting.value = true
      
      // 表单验证
      if (formRef.value) {
        const valid = await formRef.value.validate()
        if (!valid) {
          submitting.value = false
          return
        }
      }
      
      // 调用自定义提交处理
      let config
      if (onSubmit) {
        config = await onSubmit(formData)
      } else {
        config = { ...formData, nodeType }
      }
      
      console.log(`[${nodeType}NodeConfigDrawer] 提交配置:`, config)
      emit('confirm', config)
      emit('update:visible', false)
    } catch (error) {
      console.error(`${nodeType}配置验证失败:`, error)
    } finally {
      submitting.value = false
    }
  }
  
  // 处理调试提交
  const handleDebugSubmit = () => {
    console.log(`[${nodeType}NodeConfigDrawer] 调试提交:`, {
      formData: { ...formData },
      isValid: isFormValid.value,
      nodeData: props.nodeData
    })
  }
  
  return {
    formData,
    formRef,
    isFormValid,
    submitting,
    resetFormData,
    initFormData,
    handleSubmit,
    handleCancel,
    handleDebugSubmit
  }
}