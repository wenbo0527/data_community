<template>
  <div class="configuration-validator">
    <div class="validator-header">
      <div class="header-left">
        <h3>配置验证</h3>
        <a-badge 
          v-if="validationResult"
          :status="validationResult.isValid ? 'success' : 'error'"
          :text="validationResult.isValid ? '验证通过' : '验证失败'"
        />
      </div>
      
      <div class="header-actions">
        <a-button 
          size="small" 
          :loading="isValidating"
          @click="validateConfiguration"
        >
          <icon-refresh /> 重新验证
        </a-button>
        
        <a-button 
          v-if="autoValidate"
          size="small"
          type="text"
          @click="toggleAutoValidate"
        >
          <icon-eye /> 自动验证
        </a-button>
        <a-button 
          v-else
          size="small"
          type="text"
          @click="toggleAutoValidate"
        >
          <icon-eye-invisible /> 手动验证
        </a-button>
      </div>
    </div>
    
    <div class="validator-content">
      <!-- 验证进度 -->
      <div v-if="isValidating" class="validation-progress">
        <a-progress 
          :percent="validationProgress"
          :show-text="false"
          size="small"
        />
        <div class="progress-text">{{ validationStep }}</div>
      </div>
      
      <!-- 验证结果概览 -->
      <div v-if="validationResult && !isValidating" class="validation-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">总计规则</span>
            <span class="stat-value">{{ validationResult.totalRules }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">通过</span>
            <span class="stat-value success">{{ validationResult.passedRules }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">失败</span>
            <span class="stat-value error">{{ validationResult.failedRules }}</span>
          </div>
        </div>
        
        <div class="summary-time">
          <icon-clock-circle />
          <span>验证时间: {{ formatTime(validationResult.timestamp) }}</span>
        </div>
      </div>
      
      <!-- 错误列表 -->
      <div v-if="validationResult?.errors?.length" class="validation-errors">
        <div class="errors-header">
          <h4>验证错误 ({{ validationResult.errors.length }})</h4>
          <a-button 
            size="mini"
            type="text"
            @click="toggleErrorsExpanded"
          >
            {{ errorsExpanded ? '收起' : '展开' }}
            <icon-down v-if="!errorsExpanded" />
            <icon-up v-else />
          </a-button>
        </div>
        
        <a-collapse v-model:active-key="activeErrorKeys" :bordered="false">
          <a-collapse-item 
            v-for="error in displayedErrors"
            :key="error.id"
            :name="error.id"
            :header="error.message"
          >
            <template #extra>
              <a-tag 
                :color="getErrorSeverityColor(error.severity)"
                size="small"
              >
                {{ error.severity }}
              </a-tag>
            </template>
            
            <div class="error-details">
              <div v-if="error.field" class="error-field">
                <strong>字段:</strong> {{ error.field }}
              </div>
              <div v-if="error.value" class="error-value">
                <strong>当前值:</strong> 
                <code>{{ error.value }}</code>
              </div>
              <div v-if="error.suggestion" class="error-suggestion">
                <strong>建议:</strong> {{ error.suggestion }}
              </div>
              <div v-if="error.path" class="error-path">
                <strong>路径:</strong> {{ error.path }}
              </div>
            </div>
          </a-collapse-item>
        </a-collapse>
        
        <div v-if="validationResult.errors.length > maxDisplayErrors" class="errors-pagination">
          <a-pagination 
            v-model:current="currentErrorPage"
            :total="validationResult.errors.length"
            :page-size="maxDisplayErrors"
            size="small"
            simple
          />
        </div>
      </div>
      
      <!-- 验证规则配置 -->
      <div v-if="showRuleConfig" class="validation-rules">
        <div class="rules-header">
          <h4>验证规则配置</h4>
          <a-button 
            size="mini"
            type="text"
            @click="toggleRuleConfig"
          >
            {{ showRuleConfig ? '隐藏' : '显示' }}
          </a-button>
        </div>
        
        <div class="rules-list">
          <div 
            v-for="rule in validationRules"
            :key="rule.id"
            class="rule-item"
          >
            <a-switch 
              v-model="rule.enabled"
              size="small"
              @change="onRuleToggle(rule.id, $event)"
            />
            <div class="rule-info">
              <div class="rule-name">{{ rule.name }}</div>
              <div class="rule-description">{{ rule.description }}</div>
            </div>
            <a-tag 
              :color="getRuleSeverityColor(rule.severity)"
              size="small"
            >
              {{ rule.severity }}
            </a-tag>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!validationResult && !isValidating" class="validation-empty">
        <icon-info-circle />
        <div class="empty-text">点击"重新验证"开始配置验证</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  IconRefresh, 
  IconEye, 
  IconEyeInvisible, 
  IconClockCircle,
  IconDown,
  IconUp,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon'

interface ValidationError {
  id: string
  message: string
  severity: 'error' | 'warning' | 'info'
  field?: string
  value?: any
  suggestion?: string
  path?: string
}

interface ValidationResult {
  isValid: boolean
  totalRules: number
  passedRules: number
  failedRules: number
  errors: ValidationError[]
  timestamp: number
}

interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  enabled: boolean
}

interface Props {
  configuration?: any
  autoValidate?: boolean
  validationRules?: ValidationRule[]
  maxDisplayErrors?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoValidate: true,
  validationRules: () => [],
  maxDisplayErrors: 10
})

const emit = defineEmits<{
  validate: [configuration: any]
  ruleToggle: [ruleId: string, enabled: boolean]
  autoValidateChange: [enabled: boolean]
}>()

const isValidating = ref(false)
const validationProgress = ref(0)
const validationStep = ref('')
const validationResult = ref<ValidationResult | null>(null)
const errorsExpanded = ref(false)
const showRuleConfig = ref(false)
const activeErrorKeys = ref<string[]>([])
const currentErrorPage = ref(1)

const displayedErrors = computed(() => {
  if (!validationResult.value?.errors) return []
  
  const start = (currentErrorPage.value - 1) * props.maxDisplayErrors
  const end = start + props.maxDisplayErrors
  return validationResult.value.errors.slice(start, end)
})

const getErrorSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'error': return 'red'
    case 'warning': return 'orange'
    case 'info': return 'blue'
    default: return 'gray'
  }
}

const getRuleSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'error': return 'red'
    case 'warning': return 'orange'
    case 'info': return 'blue'
    default: return 'gray'
  }
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const validateConfiguration = async () => {
  isValidating.value = true
  validationProgress.value = 0
  validationStep.value = '开始验证...'
  
  try {
    // 模拟验证过程
    const steps = [
      '检查必填字段...',
      '验证数据格式...',
      '检查业务规则...',
      '验证依赖关系...',
      '生成验证报告...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      validationStep.value = steps[i]
      validationProgress.value = ((i + 1) / steps.length) * 100
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    emit('validate', props.configuration)
    
    // 模拟验证结果
    validationResult.value = {
      isValid: Math.random() > 0.3,
      totalRules: 15,
      passedRules: 12,
      failedRules: 3,
      errors: [
        {
          id: 'error-1',
          message: '条件组名称不能为空',
          severity: 'error',
          field: 'conditionGroup.name',
          value: '',
          suggestion: '请为条件组设置一个有意义的名称'
        },
        {
          id: 'error-2',
          message: '标签条件值格式不正确',
          severity: 'warning',
          field: 'condition.tagValue',
          value: 'invalid-format',
          suggestion: '标签值应该是有效的字符串格式'
        }
      ],
      timestamp: Date.now()
    }
  } finally {
    isValidating.value = false
  }
}

const toggleAutoValidate = () => {
  const newValue = !props.autoValidate
  emit('autoValidateChange', newValue)
}

const toggleErrorsExpanded = () => {
  errorsExpanded.value = !errorsExpanded.value
  if (errorsExpanded.value && validationResult.value?.errors) {
    activeErrorKeys.value = validationResult.value.errors.map(e => e.id)
  } else {
    activeErrorKeys.value = []
  }
}

const toggleRuleConfig = () => {
  showRuleConfig.value = !showRuleConfig.value
}

const onRuleToggle = (ruleId: string, enabled: boolean) => {
  emit('ruleToggle', ruleId, enabled)
}

// 自动验证
watch(
  () => props.configuration,
  () => {
    if (props.autoValidate) {
      validateConfiguration()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.configuration-validator {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
}

.validator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.validator-content {
  padding: 16px;
}

.validation-progress {
  margin-bottom: 16px;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
  text-align: center;
}

.validation-summary {
  margin-bottom: 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
}

.summary-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
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
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.stat-value.success {
  color: #00b42a;
}

.stat-value.error {
  color: #f53f3f;
}

.summary-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.validation-errors {
  margin-bottom: 16px;
}

.errors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.errors-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #f53f3f;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}

.error-field,
.error-value,
.error-suggestion,
.error-path {
  line-height: 1.4;
}

.error-value code {
  background: #f2f3f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.errors-pagination {
  margin-top: 12px;
  text-align: center;
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

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f7f8fa;
  border-radius: 6px;
}

.rule-info {
  flex: 1;
}

.rule-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.rule-description {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.validation-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #86909c;
}

.empty-text {
  font-size: 14px;
}
</style>