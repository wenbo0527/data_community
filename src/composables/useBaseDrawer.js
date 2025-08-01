/**
 * 基础抽屉组合式函数
 * 提供所有节点抽屉的通用功能和状态管理
 */
import { ref, reactive, computed, watch, nextTick } from 'vue'

export function useBaseDrawer(options = {}) {
  const {
    props,
    emit,
    formRules = {},
    getInitialFormData,
    customValidation,
    nodeType = '',
    initialFormData = {},
    onSubmit,
    onCancel
  } = options

  // 基础状态
  const formRef = ref()
  const isSubmitting = ref(false)

  // 表单数据 - 使用传入的初始数据或函数
  const formData = reactive(
    typeof getInitialFormData === 'function' 
      ? getInitialFormData() 
      : { ...initialFormData }
  )

  // 获取节点类型标识符用于日志
  const nodeTypeId = nodeType || 'unknown'

  /**
   * 重置表单数据到初始状态
   */
  const resetFormData = () => {
    console.log(`[${nodeTypeId}NodeConfigDrawer] 表单数据已重置为初始状态`)
    
    const initialData = typeof getInitialFormData === 'function' 
      ? getInitialFormData() 
      : { ...initialFormData }
    
    // 清空当前数据
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    
    // 设置初始数据
    Object.assign(formData, initialData)
    
    // 清除表单验证状态
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  /**
   * 初始化表单数据
   */
  const initFormData = (nodeData) => {
    console.log(`[${nodeTypeId}NodeConfigDrawer] 初始化默认数据`)
    
    if (nodeData?.config) {
      // 如果有配置数据，合并到表单数据中
      Object.assign(formData, nodeData.config)
    } else {
      // 否则重置为初始状态
      resetFormData()
    }
  }

  // 监听 visible 变化
  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 监听节点数据变化
  watch(() => props.nodeData, (newData) => {
    console.log(`[${nodeTypeId}NodeConfigDrawer] 节点数据变化:`, newData)
    
    if (newData && Object.keys(newData).length > 0) {
      if (newData.config) {
        console.log(`[${nodeTypeId}NodeConfigDrawer] 发现配置数据，进行初始化`)
        Object.assign(formData, newData.config)
      } else {
        console.log(`[${nodeTypeId}NodeConfigDrawer] 无配置数据，使用默认初始状态`)
        resetFormData()
      }
    } else {
      console.log(`[${nodeTypeId}NodeConfigDrawer] 无配置数据，使用默认初始状态`)
      resetFormData()
    }
  }, { immediate: true, deep: true })

  // 监听抽屉显示状态
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      console.log(`[${nodeTypeId}NodeConfigDrawer] 抽屉打开，检查是否需要重置表单`)
      
      if (props.nodeData?.config) {
        console.log(`[${nodeTypeId}NodeConfigDrawer] 发现配置数据，进行初始化`)
        Object.assign(formData, props.nodeData.config)
      } else {
        console.log(`[${nodeTypeId}NodeConfigDrawer] 无配置数据，重置表单`)
        initFormData(props.nodeData)
      }
    }
  })

  /**
   * 处理取消操作
   */
  const handleCancel = () => {
    console.log(`[${nodeTypeId}NodeConfigDrawer] 处理取消操作`)
    
    if (onCancel && typeof onCancel === 'function') {
      onCancel()
    }
    
    emit('update:visible', false)
    emit('cancel')
  }

  /**
   * 处理提交操作
   */
  const handleSubmit = async (customConfig = null) => {
    if (isSubmitting.value) {
      console.log(`[${nodeTypeId}NodeConfigDrawer] 正在提交中，忽略重复提交`)
      return
    }

    try {
      isSubmitting.value = true
      console.log(`[${nodeTypeId}NodeConfigDrawer] 开始处理提交操作`)

      // 表单验证
      if (formRef.value) {
        try {
          await formRef.value.validate()
        } catch (error) {
          console.log(`[${nodeTypeId}NodeConfigDrawer] 表单验证失败:`, error)
          return
        }
      }

      // 自定义验证
      if (customValidation && typeof customValidation === 'function') {
        const validationErrors = customValidation(formData)
        if (validationErrors && validationErrors.length > 0) {
          console.log(`[${nodeTypeId}NodeConfigDrawer] 自定义验证失败:`, validationErrors)
          return
        }
      }

      // 创建配置数据
      let config
      if (customConfig) {
        config = customConfig
      } else if (onSubmit && typeof onSubmit === 'function') {
        config = onSubmit(formData)
      } else {
        config = {
          ...formData,
          nodeType: nodeType
        }
      }

      console.log(`[${nodeTypeId}NodeConfigDrawer] 提交配置:`, config)
      
      emit('confirm', config)
      emit('update:visible', false)
      
      console.log(`[${nodeTypeId}NodeConfigDrawer] 提交成功`)
    } catch (error) {
      console.error(`[${nodeTypeId}NodeConfigDrawer] 提交失败:`, error)
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 调试提交（强制提交，跳过验证）
   */
  const handleDebugSubmit = async () => {
    console.log(`[${nodeTypeId}NodeConfigDrawer] 调试提交（跳过验证）`)
    
    const config = onSubmit && typeof onSubmit === 'function' 
      ? onSubmit(formData)
      : { ...formData, nodeType: nodeType }
    
    console.log(`[${nodeTypeId}NodeConfigDrawer] 调试提交配置:`, config)
    
    emit('confirm', config)
    emit('update:visible', false)
  }

  // 表单验证状态
  const isFormValid = computed(() => {
    if (customValidation && typeof customValidation === 'function') {
      const result = customValidation(formData)
      // 如果返回布尔值，直接使用
      if (typeof result === 'boolean') {
        return result
      }
      // 如果返回数组（错误列表），检查是否为空
      if (Array.isArray(result)) {
        return result.length === 0
      }
      // 其他情况，检查是否为假值
      return !result
    }
    return true
  })

  return {
    // 状态
    formData,
    formRef,
    visible,
    isSubmitting,
    isFormValid,
    
    // 方法
    handleSubmit,
    handleCancel,
    handleDebugSubmit,
    resetFormData,
    initFormData,
    
    // 计算属性
    submitting: isSubmitting
  }
}