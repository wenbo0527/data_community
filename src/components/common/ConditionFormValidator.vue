<template>
  <div class="condition-form-validator">
    <div class="validator-container">
      <!-- 字段验证状态 -->
      <div class="field-validations">
        <div 
          v-for="field in validatedFields"
          :key="field.name"
          class="field-validation"
          :class="{
            'valid': field.isValid,
            'invalid': !field.isValid && field.touched,
            'validating': field.isValidating
          }"
        >
          <div class="field-header">
            <span class="field-name">{{ field.label }}</span>
            <div class="field-status">
              <icon-check-circle v-if="field.isValid && field.touched" class="status-icon valid" />
              <icon-close-circle v-else-if="!field.isValid && field.touched" class="status-icon invalid" />
              <icon-loading v-else-if="field.isValidating" class="status-icon validating" />
              <icon-minus-circle v-else class="status-icon untouched" />
            </div>
          </div>
          
          <div v-if="field.errors.length > 0" class="field-errors">
            <div 
              v-for="error in field.errors"
              :key="error.id"
              class="field-error"
              :class="error.type"
            >
              <icon-exclamation-circle-fill class="error-icon" />
              <span class="error-message">{{ error.message }}</span>
            </div>
          </div>
          
          <div v-if="field.warnings.length > 0" class="field-warnings">
            <div 
              v-for="warning in field.warnings"
              :key="warning.id"
              class="field-warning"
            >
              <icon-exclamation-circle-fill class="warning-icon" />
              <span class="warning-message">{{ warning.message }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 实时验证反馈 -->
      <div v-if="showRealTimeValidation" class="realtime-validation">
        <div class="realtime-header">
          <h4>实时验证</h4>
          <a-switch 
            v-model="realtimeEnabled"
            size="small"
            @change="onRealtimeToggle"
          >
            <template #checked>开启</template>
            <template #unchecked>关闭</template>
          </a-switch>
        </div>
        
        <div class="realtime-stats">
          <div class="stat-item">
            <span class="stat-label">验证字段</span>
            <span class="stat-value">{{ validatedFields.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">通过</span>
            <span class="stat-value valid">{{ validFieldsCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">错误</span>
            <span class="stat-value invalid">{{ invalidFieldsCount }}</span>
          </div>
        </div>
      </div>
      
      <!-- 验证结果摘要 -->
      <div v-if="validationSummary" class="validation-summary">
        <div class="summary-header">
          <h4>验证摘要</h4>
          <a-badge 
            :status="validationSummary.isValid ? 'success' : 'error'"
            :text="validationSummary.isValid ? '全部通过' : '存在错误'"
          />
        </div>
        
        <div class="summary-content">
          <div class="summary-progress">
            <a-progress 
              :percent="validationProgress"
              :status="validationSummary.isValid ? 'success' : 'exception'"
              size="small"
            />
            <div class="progress-text">
              {{ validFieldsCount }}/{{ validatedFields.length }} 字段验证通过
            </div>
          </div>
          
          <div v-if="!validationSummary.isValid" class="summary-errors">
            <div class="errors-count">
              共 {{ totalErrorsCount }} 个错误需要修复
            </div>
            <a-button 
              size="mini"
              type="text"
              @click="focusFirstError"
            >
              定位首个错误
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- 验证规则说明 -->
      <div v-if="showValidationRules" class="validation-rules">
        <div class="rules-header">
          <h4>验证规则</h4>
          <a-button 
            size="mini"
            type="text"
            @click="toggleRulesExpanded"
          >
            {{ rulesExpanded ? '收起' : '展开' }}
            <icon-down v-if="!rulesExpanded" />
            <icon-up v-else />
          </a-button>
        </div>
        
        <a-collapse v-if="rulesExpanded" v-model:active-key="activeRuleKeys" :bordered="false">
          <a-collapse-item 
            v-for="rule in validationRules"
            :key="rule.field"
            :name="rule.field"
            :header="rule.label"
          >
            <div class="rule-details">
              <div v-if="rule.required" class="rule-item">
                <span class="required-icon">*</span>
                <span>必填字段</span>
              </div>
              <div v-if="rule.minLength" class="rule-item">
                <icon-edit class="rule-icon" />
                <span>最小长度: {{ rule.minLength }} 字符</span>
              </div>
              <div v-if="rule.maxLength" class="rule-item">
                <icon-edit class="rule-icon" />
                <span>最大长度: {{ rule.maxLength }} 字符</span>
              </div>
              <div v-if="rule.pattern" class="rule-item">
                <icon-code class="rule-icon" />
                <span>格式要求: {{ rule.patternDescription }}</span>
              </div>
              <div v-if="rule.dependencies?.length" class="rule-item">
                <icon-relation class="rule-icon" />
                <span>依赖字段: {{ rule.dependencies.join(', ') }}</span>
              </div>
            </div>
          </a-collapse-item>
        </a-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  IconCheckCircle,
  IconCloseCircle,
  IconLoading,
  IconMinusCircle,
  IconExclamationCircleFill,
  IconDown,
  IconUp,
  IconEdit,
  IconCode,
  IconRelation,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon'

interface FieldError {
  id: string
  type: 'error' | 'warning'
  message: string
}

interface FieldWarning {
  id: string
  message: string
}

interface ValidatedField {
  name: string
  label: string
  value: any
  isValid: boolean
  isValidating: boolean
  touched: boolean
  errors: FieldError[]
  warnings: FieldWarning[]
}

interface ValidationRule {
  field: string
  label: string
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternDescription?: string
  dependencies?: string[]
}

interface ValidationSummary {
  isValid: boolean
  totalFields: number
  validFields: number
  invalidFields: number
  totalErrors: number
}

interface Props {
  fields?: ValidatedField[]
  validationRules?: ValidationRule[]
  showRealTimeValidation?: boolean
  showValidationRules?: boolean
  realtimeValidation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  validationRules: () => [],
  showRealTimeValidation: true,
  showValidationRules: true,
  realtimeValidation: true
})

const emit = defineEmits<{
  fieldValidate: [fieldName: string, value: any]
  realtimeToggle: [enabled: boolean]
  focusField: [fieldName: string]
}>()

const realtimeEnabled = ref(props.realtimeValidation)
const rulesExpanded = ref(false)
const activeRuleKeys = ref<string[]>([])

const validatedFields = computed(() => props.fields)

const validFieldsCount = computed(() => {
  return validatedFields.value.filter(field => field.isValid && field.touched).length
})

const invalidFieldsCount = computed(() => {
  return validatedFields.value.filter(field => !field.isValid && field.touched).length
})

const totalErrorsCount = computed(() => {
  return validatedFields.value.reduce((total, field) => {
    return total + field.errors.length
  }, 0)
})

const validationProgress = computed(() => {
  const totalFields = validatedFields.value.length
  if (totalFields === 0) return 0
  return Math.round((validFieldsCount.value / totalFields) * 100)
})

const validationSummary = computed((): ValidationSummary => {
  const totalFields = validatedFields.value.length
  const validFields = validFieldsCount.value
  const invalidFields = invalidFieldsCount.value
  const totalErrors = totalErrorsCount.value
  
  return {
    isValid: totalErrors === 0 && validFields === totalFields,
    totalFields,
    validFields,
    invalidFields,
    totalErrors
  }
})

const onRealtimeToggle = (enabled: boolean) => {
  emit('realtimeToggle', enabled)
}

const toggleRulesExpanded = () => {
  rulesExpanded.value = !rulesExpanded.value
  if (rulesExpanded.value) {
    activeRuleKeys.value = props.validationRules.map(rule => rule.field)
  } else {
    activeRuleKeys.value = []
  }
}

const focusFirstError = () => {
  const firstErrorField = validatedFields.value.find(field => 
    !field.isValid && field.touched && field.errors.length > 0
  )
  
  if (firstErrorField) {
    emit('focusField', firstErrorField.name)
  }
}

// 监听字段变化进行实时验证
watch(
  () => validatedFields.value,
  (newFields) => {
    if (realtimeEnabled.value) {
      newFields.forEach(field => {
        if (field.touched) {
          emit('fieldValidate', field.name, field.value)
        }
      })
    }
  },
  { deep: true }
)
</script>

<style scoped>
.condition-form-validator {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
}

.validator-container {
  padding: 16px;
}

.field-validations {
  margin-bottom: 16px;
}

.field-validation {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
}

.field-validation.valid {
  border-color: #00b42a;
  background: #f6ffed;
}

.field-validation.invalid {
  border-color: #f53f3f;
  background: #fff2f0;
}

.field-validation.validating {
  border-color: #165dff;
  background: #f0f5ff;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.field-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.field-status {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 16px;
}

.status-icon.valid {
  color: #00b42a;
}

.status-icon.invalid {
  color: #f53f3f;
}

.status-icon.validating {
  color: #165dff;
}

.status-icon.untouched {
  color: #86909c;
}

.field-errors {
  margin-bottom: 8px;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #f53f3f;
}

.error-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.field-warnings {
  margin-bottom: 8px;
}

.field-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #ff7d00;
}

.warning-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.realtime-validation {
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.realtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.realtime-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.realtime-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.stat-value.valid {
  color: #00b42a;
}

.stat-value.invalid {
  color: #f53f3f;
}

.validation-summary {
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #86909c;
  text-align: center;
}

.summary-errors {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.errors-count {
  font-size: 12px;
  color: #f53f3f;
}

.validation-rules {
  margin-bottom: 16px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rules-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.rule-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
}

.rule-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.rule-icon.required {
  color: #f53f3f;
}
</style>