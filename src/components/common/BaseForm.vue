<template>
  <div class="base-form-container">
    <a-form
      ref="formRef"
      v-bind="formProps"
      :model="formData"
      :rules="formRules"
      :layout="layout"
      :size="size"
      :label-col-props="labelColProps"
      :wrapper-col-props="wrapperColProps"
      :label-align="labelAlign"
      :disabled="disabled"
      @submit="handleSubmit"
      @submit-success="handleSubmitSuccess"
      @submit-failed="handleSubmitFailed"
    >
      <!-- 动态渲染表单项 -->
      <template v-for="item in formItems" :key="item.field">
        <!-- 分组标题 -->
        <div v-if="item.type === 'group'" class="form-group-title">
          {{ item.title }}
        </div>
        
        <!-- 分割线 -->
        <a-divider v-else-if="item.type === 'divider'" :orientation="item.orientation || 'left'">
          {{ item.title }}
        </a-divider>
        
        <!-- 表单项 -->
        <a-form-item
          v-else
          :field="item.field"
          :label="item.label"
          :rules="item.rules"
          :validate-trigger="item.validateTrigger"
          :help="item.help"
          :extra="item.extra"
          :required="item.required"
          :asterisk-position="item.asteriskPosition"
          :label-col-props="item.labelColProps"
          :wrapper-col-props="item.wrapperColProps"
          :hide-label="item.hideLabel"
          :hide-asterisk="item.hideAsterisk"
          :disabled="item.disabled || disabled"
          :class="item.className"
        >
          <!-- 输入框 -->
          <a-input
            v-if="item.type === 'input'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :max-length="item.maxLength"
            :show-word-limit="item.showWordLimit"
            :allow-clear="item.allowClear !== false"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 密码输入框 -->
          <a-input-password
            v-else-if="item.type === 'password'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :allow-clear="item.allowClear !== false"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 文本域 -->
          <a-textarea
            v-else-if="item.type === 'textarea'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :max-length="item.maxLength"
            :show-word-limit="item.showWordLimit"
            :auto-size="item.autoSize"
            :allow-clear="item.allowClear !== false"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 数字输入框 -->
          <a-input-number
            v-else-if="item.type === 'number'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            :precision="item.precision"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 选择器 -->
          <a-select
            v-else-if="item.type === 'select'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :options="item.options"
            :multiple="item.multiple"
            :allow-search="item.allowSearch"
            :allow-clear="item.allowClear !== false"
            :disabled="item.disabled || disabled"
            :loading="item.loading"
            v-bind="item.props"
          />
          
          <!-- 级联选择器 -->
          <a-cascader
            v-else-if="item.type === 'cascader'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :options="item.options"
            :multiple="item.multiple"
            :allow-search="item.allowSearch"
            :allow-clear="item.allowClear !== false"
            :disabled="item.disabled || disabled"
            :loading="item.loading"
            v-bind="item.props"
          />
          
          <!-- 日期选择器 -->
          <a-date-picker
            v-else-if="item.type === 'date'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :format="item.format"
            :disabled="item.disabled || disabled"
            :allow-clear="item.allowClear !== false"
            v-bind="item.props"
          />
          
          <!-- 时间选择器 -->
          <a-time-picker
            v-else-if="item.type === 'time'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :format="item.format"
            :disabled="item.disabled || disabled"
            :allow-clear="item.allowClear !== false"
            v-bind="item.props"
          />
          
          <!-- 日期时间选择器 -->
          <a-date-picker
            v-else-if="item.type === 'datetime'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :format="item.format || 'YYYY-MM-DD HH:mm:ss'"
            :show-time="true"
            :disabled="item.disabled || disabled"
            :allow-clear="item.allowClear !== false"
            v-bind="item.props"
          />
          
          <!-- 日期范围选择器 -->
          <a-range-picker
            v-else-if="item.type === 'daterange'"
            v-model="formData[item.field]"
            :placeholder="item.placeholder || ['开始日期', '结束日期']"
            :format="item.format"
            :disabled="item.disabled || disabled"
            :allow-clear="item.allowClear !== false"
            v-bind="item.props"
          />
          
          <!-- 单选框组 -->
          <a-radio-group
            v-else-if="item.type === 'radio'"
            v-model="formData[item.field]"
            :options="item.options"
            :direction="item.direction || 'horizontal'"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 复选框组 -->
          <a-checkbox-group
            v-else-if="item.type === 'checkbox'"
            v-model="formData[item.field]"
            :options="item.options"
            :direction="item.direction || 'horizontal'"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 开关 -->
          <a-switch
            v-else-if="item.type === 'switch'"
            v-model="formData[item.field]"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 滑块 -->
          <a-slider
            v-else-if="item.type === 'slider'"
            v-model="formData[item.field]"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            :range="item.range"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 评分 -->
          <a-rate
            v-else-if="item.type === 'rate'"
            v-model="formData[item.field]"
            :count="item.count"
            :allow-half="item.allowHalf"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 上传 -->
          <a-upload
            v-else-if="item.type === 'upload'"
            v-model:file-list="formData[item.field]"
            :action="item.action"
            :multiple="item.multiple"
            :accept="item.accept"
            :limit="item.limit"
            :disabled="item.disabled || disabled"
            v-bind="item.props"
          />
          
          <!-- 自定义插槽 -->
          <slot
            v-else-if="item.type === 'slot'"
            :name="item.slotName || item.field"
            :item="item"
            :form-data="formData"
          ></slot>
          
          <!-- 自定义渲染函数 -->
          <component
            v-else-if="item.type === 'render' && item.render"
            :is="item.render"
            :item="item"
            :form-data="formData"
          />
        </a-form-item>
      </template>
      
      <!-- 表单操作按钮 -->
      <a-form-item v-if="showActions" :wrapper-col-props="actionWrapperColProps">
        <a-space :size="16">
          <a-button
            v-if="showSubmit"
            type="primary"
            html-type="submit"
            :loading="submitLoading"
            :disabled="disabled"
          >
            {{ submitText }}
          </a-button>
          <a-button
            v-if="showReset"
            @click="handleReset"
            :disabled="disabled"
          >
            {{ resetText }}
          </a-button>
          <a-button
            v-if="showCancel"
            @click="handleCancel"
            :disabled="disabled"
          >
            {{ cancelText }}
          </a-button>
          <slot name="actions" :form-data="formData"></slot>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword,
  Textarea as ATextarea,
  InputNumber as AInputNumber,
  Select as ASelect,
  Cascader as ACascader,
  DatePicker as ADatePicker,
  TimePicker as ATimePicker,
  RangePicker as ARangePicker,
  RadioGroup as ARadioGroup,
  CheckboxGroup as ACheckboxGroup,
  Switch as ASwitch,
  Slider as ASlider,
  Rate as ARate,
  Upload as AUpload,
  Button as AButton,
  Space as ASpace,
  Divider as ADivider
} from '@arco-design/web-vue'
import { arcoConfig } from '@/utils/arco'
import { businessMessage } from '@/utils/message'

export default {
  name: 'BaseForm',
  components: {
    AForm,
    AFormItem,
    AInput,
    AInputPassword,
    ATextarea,
    AInputNumber,
    ASelect,
    ACascader,
    ADatePicker,
    ATimePicker,
    ARangePicker,
    ARadioGroup,
    ACheckboxGroup,
    ASwitch,
    ASlider,
    ARate,
    AUpload,
    AButton,
    ASpace,
    ADivider
  },
  props: {
    // 表单数据
    modelValue: {
      type: Object,
      default: () => ({})
    },
    // 表单项配置
    formItems: {
      type: Array,
      default: () => []
    },
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    // 表单布局
    layout: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical', 'inline'].includes(value)
    },
    // 表单大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 标签列属性
    labelColProps: {
      type: Object,
      default: () => ({ span: 6 })
    },
    // 包装列属性
    wrapperColProps: {
      type: Object,
      default: () => ({ span: 18 })
    },
    // 标签对齐方式
    labelAlign: {
      type: String,
      default: 'right',
      validator: (value) => ['left', 'right'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: true
    },
    // 是否显示提交按钮
    showSubmit: {
      type: Boolean,
      default: true
    },
    // 是否显示重置按钮
    showReset: {
      type: Boolean,
      default: true
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      default: false
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
    // 提交加载状态
    submitLoading: {
      type: Boolean,
      default: false
    },
    // 操作按钮包装列属性
    actionWrapperColProps: {
      type: Object,
      default: () => ({ offset: 6, span: 18 })
    },
    // 其他表单属性
    formProps: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'submit', 'submit-success', 'submit-failed', 'reset', 'cancel'],
  setup(props, { emit }) {
    const formRef = ref()
    
    // 表单数据
    const formData = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    // 表单验证规则
    const formRules = computed(() => {
      const rules = { ...props.rules }
      
      // 从表单项中提取验证规则
      props.formItems.forEach(item => {
        if (item.rules && item.field) {
          rules[item.field] = item.rules
        }
      })
      
      return rules
    })
    
    // 事件处理
    const handleSubmit = (data) => {
      emit('submit', data)
    }
    
    const handleSubmitSuccess = (data) => {
      businessMessage.saveSuccess()
      emit('submit-success', data)
    }
    
    const handleSubmitFailed = (data) => {
      businessMessage.error('表单验证失败，请检查输入内容')
      emit('submit-failed', data)
    }
    
    const handleReset = () => {
      formRef.value?.resetFields()
      emit('reset')
    }
    
    const handleCancel = () => {
      emit('cancel')
    }
    
    // 表单方法
    const validate = () => {
      return formRef.value?.validate()
    }
    
    const validateField = (field) => {
      return formRef.value?.validateField(field)
    }
    
    const resetFields = () => {
      formRef.value?.resetFields()
    }
    
    const clearValidate = (field) => {
      formRef.value?.clearValidate(field)
    }
    
    const setFields = (data) => {
      formRef.value?.setFields(data)
    }
    
    return {
      formRef,
      formData,
      formRules,
      handleSubmit,
      handleSubmitSuccess,
      handleSubmitFailed,
      handleReset,
      handleCancel,
      validate,
      validateField,
      resetFields,
      clearValidate,
      setFields
    }
  }
}
</script>

<style scoped>
.base-form-container {
  background: #fff;
  border-radius: 6px;
  padding: 24px;
}

.form-group-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group-title:first-child {
  margin-top: 0;
}

:deep(.arco-form-item) {
  margin-bottom: 24px;
}

:deep(.arco-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
}

:deep(.arco-form-item-message) {
  margin-top: 4px;
}
</style>