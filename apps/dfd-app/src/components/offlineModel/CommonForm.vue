<template>
  <div class="common-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="computedRules"
      :layout="layout"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :size="size"
      @submit="handleSubmit"
    >
      <a-row :gutter="gutter">
        <template v-for="field in formFields" :key="field.name">
          <a-col :span="field.span || fieldSpan">
            <!-- 输入框 -->
            <a-form-item
              v-if="field.type === 'input'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-input
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                :max-length="field.maxLength"
                allow-clear
                show-word-limit
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 文本域 -->
            <a-form-item
              v-else-if="field.type === 'textarea'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-textarea
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                :max-length="field.maxLength"
                :auto-size="field.autoSize || { minRows: 3, maxRows: 5 }"
                allow-clear
                show-word-limit
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 数字输入框 -->
            <a-form-item
              v-else-if="field.type === 'number'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-input-number
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :precision="field.precision"
                style="width: 100%"
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 选择器 -->
            <a-form-item
              v-else-if="field.type === 'select'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-select
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                :multiple="field.multiple"
                :allow-clear="field.allowClear !== false"
                :filter-option="field.filterOption !== false"
                @change="(value) => handleFieldChange(field.name, value)"
              >
                <a-option
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </a-option>
              </a-select>
            </a-form-item>

            <!-- 单选框 -->
            <a-form-item
              v-else-if="field.type === 'radio'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-radio-group
                v-model="formData[field.name]"
                :disabled="field.disabled"
                @change="(value) => handleFieldChange(field.name, value)"
              >
                <a-radio
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <!-- 复选框 -->
            <a-form-item
              v-else-if="field.type === 'checkbox'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-checkbox-group
                v-model="formData[field.name]"
                :disabled="field.disabled"
                @change="(value) => handleFieldChange(field.name, value)"
              >
                <a-checkbox
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <!-- 开关 -->
            <a-form-item
              v-else-if="field.type === 'switch'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-switch
                v-model="formData[field.name]"
                :disabled="field.disabled"
                :checked-value="field.checkedValue !== undefined ? field.checkedValue : true"
                :unchecked-value="field.uncheckedValue !== undefined ? field.uncheckedValue : false"
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 日期选择器 -->
            <a-form-item
              v-else-if="field.type === 'date'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-date-picker
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                :format="field.format || 'YYYY-MM-DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                style="width: 100%"
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 日期范围选择器 -->
            <a-form-item
              v-else-if="field.type === 'dateRange'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-range-picker
                v-model="formData[field.name]"
                :placeholder="field.placeholder || ['开始日期', '结束日期']"
                :disabled="field.disabled"
                :format="field.format || 'YYYY-MM-DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                style="width: 100%"
                @change="(value) => handleFieldChange(field.name, value)"
              />
            </a-form-item>

            <!-- 文件上传 -->
            <a-form-item
              v-else-if="field.type === 'upload'"
              :label="field.label"
              :field="field.name"
              :rules="field.rules"
              :required="field.required"
            >
              <a-upload
                v-model:file-list="formData[field.name]"
                :action="field.action"
                :accept="field.accept"
                :multiple="field.multiple"
                :limit="field.limit"
                :disabled="field.disabled"
                :draggable="field.draggable !== false"
                :tip="field.tip"
                @change="(fileList) => handleFieldChange(field.name, fileList)"
              />
            </a-form-item>

            <!-- 自定义插槽 -->
            <slot
              v-else-if="field.type === 'slot'"
              :name="field.slotName"
              :field="field"
              :value="formData[field.name]"
              :form-data="formData"
              :update-value="(value) => handleFieldChange(field.name, value)"
            />

            <!-- 自定义组件 -->
            <component
              v-else-if="field.component"
              :is="field.component"
              v-model="formData[field.name]"
              v-bind="field.props || {}"
              @change="(value) => handleFieldChange(field.name, value)"
            />
          </a-col>
        </template>
      </a-row>

      <!-- 表单操作按钮 -->
      <a-form-item v-if="showActions">
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitLoading">
            {{ submitText }}
          </a-button>
          <a-button @click="handleReset">
            {{ resetText }}
          </a-button>
          <a-button v-if="showCancel" @click="handleCancel">
            {{ cancelText }}
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  // 表单字段配置
  fields: {
    type: Array,
    required: true
  },
  
  // 表单数据
  model: {
    type: Object,
    default: () => ({})
  },
  
  // 表单布局
  layout: {
    type: String,
    default: 'vertical' // horizontal, vertical, inline
  },
  
  // 标签宽度
  labelCol: {
    type: Object,
    default: () => ({ span: 6 })
  },
  
  // 控件宽度
  wrapperCol: {
    type: Object,
    default: () => ({ span: 18 })
  },
  
  // 尺寸
  size: {
    type: String,
    default: 'medium' // mini, small, medium, large
  },
  
  // 栅格间隔
  gutter: {
    type: Number,
    default: 16
  },
  
  // 字段默认宽度
  fieldSpan: {
    type: Number,
    default: 24
  },
  
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  
  // 提交按钮文本
  submitText: {
    type: String,
    default: '提交'
  },
  
  // 重置按钮文本
  resetText: {
    type: String,
    default: '重置'
  },
  
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  
  // 是否显示取消按钮
  showCancel: {
    type: Boolean,
    default: false
  },
  
  // 提交加载状态
  submitLoading: {
    type: Boolean,
    default: false
  },
  
  // 是否自动创建默认值
  autoCreateDefaults: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'submit',
  'reset',
  'cancel',
  'field-change',
  'validate'
])

// 响应式数据
const formRef = ref()
const formData = reactive({})
const formFields = computed(() => props.fields)

// 计算属性
const computedRules = computed(() => {
  const rules = {}
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.name] = field.rules
    }
  })
  return rules
})

// 监听
watch(() => props.model, (newVal) => {
  Object.assign(formData, newVal)
}, { immediate: true, deep: true })

watch(formData, (newVal) => {
  emit('field-change', newVal)
}, { deep: true })

// 生命周期
const initFormData = () => {
  if (!props.autoCreateDefaults) return
  
  props.fields.forEach(field => {
    if (formData[field.name] === undefined && field.defaultValue !== undefined) {
      formData[field.name] = field.defaultValue
    }
    
    // 设置默认值
    if (formData[field.name] === undefined) {
      switch (field.type) {
        case 'input':
        case 'textarea':
        case 'select':
        case 'date':
          formData[field.name] = ''
          break
        case 'number':
          formData[field.name] = field.min || 0
          break
        case 'checkbox':
          formData[field.name] = []
          break
        case 'switch':
          formData[field.name] = field.checkedValue !== undefined ? field.checkedValue : false
          break
        case 'dateRange':
          formData[field.name] = []
          break
        case 'upload':
          formData[field.name] = []
          break
        default:
          formData[field.name] = ''
      }
    }
  })
}

// 方法
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      emit('submit', formData)
      emit('validate', true, formData)
    }
  } catch (error) {
    Message.error('表单验证失败，请检查输入')
    emit('validate', false, error)
  }
}

const handleReset = () => {
  formRef.value.resetFields()
  initFormData()
  emit('reset', formData)
}

const handleCancel = () => {
  emit('cancel', formData)
}

const handleFieldChange = (fieldName, value) => {
  emit('field-change', { fieldName, value, formData })
}

const validate = async () => {
  return await formRef.value.validate()
}

const resetFields = () => {
  formRef.value.resetFields()
  initFormData()
}

const clearValidate = (fields) => {
  formRef.value.clearValidate(fields)
}

const setFields = (fields) => {
  Object.keys(fields).forEach(key => {
    formData[key] = fields[key]
  })
}

const getFormData = () => {
  return { ...formData }
}

// 初始化
initFormData()

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  setFields,
  getFormData,
  formRef
})
</script>

<style scoped lang="less">
.common-form {
  .arco-form-item {
    margin-bottom: 16px;
  }
  
  .arco-space {
    width: 100%;
  }
}
</style>