<template>
    <div 
      :class="[
        'precalculate-panel',
        { 'mobile-layout': isMobile },
        { 'desktop-layout': isDesktop }
      ]"
      data-testid="precalculate-panel"
      role="region"
      aria-label="预计算面板 - 用于计算人群数量和显示结果"
    >
      <!-- 屏幕阅读器描述 -->
      <div data-testid="sr-only-description" class="sr-only">
        预计算面板，用于计算人群数量和显示结果
      </div>
    
    <div class="panel-header">
      <h3>预计算面板</h3>
      <a-button 
        type="primary" 
        @click="triggerPreCalculate"
        :loading="loading"
        :disabled="disabled"
        data-testid="calculate-button"
        aria-describedby="calculate-description"
        :aria-label="loading ? '正在计算中' : '开始预计算'"
      >
        预计算
      </a-button>
      <a-button 
          type="outline"
          :disabled="!hasResults"
          @click="exportResults"
          data-testid="export-results"
        >
          <IconDownload /> 导出结果
        </a-button>
        <a-button 
          type="text"
          :disabled="!hasResults"
          @click="copyResults"
          data-testid="copy-results"
        >
          <IconCopy /> 复制结果
        </a-button>
        <a-button
          type="text"
          @click="toggleDetails"
          data-testid="toggle-details"
        >
          <icon-chevron-down :class="{ 'rotate-180': showDetails }" /> {{ showDetails ? '收起详情' : '展开详情' }}
        </a-button>
      <div id="calculate-description" class="sr-only">
        点击此按钮开始预计算人群数量
      </div>
    </div>
    
    <div v-if="showResults" class="results-section">
      <div class="result-item">
        <span class="label">包含人群数量：</span>
        <span class="value">{{ formatNumber(results.includeCount) }}</span>
      </div>
      <div class="result-item">
        <span class="label">剔除人群数量：</span>
        <span class="value">{{ formatNumber(results.excludeCount) }}</span>
      </div>
      <div class="result-item">
        <span class="label">最终人群数量：</span>
        <span class="value">{{ formatNumber(results.finalCount) }}</span>
      </div>
      <div class="result-item">
        <span class="label">计算公式：</span>
        <span class="formula">{{ results.formula }}</span>
      </div>
      <div class="result-item">
        <span class="label">更新时间：</span>
        <span class="time">{{ results.updateTime }}</span>
      </div>
    </div>
    
    <div v-if="showValidation" class="validation-section">
      <div v-if="validationResult.isValid" class="validation-success">
        <IconCheckCircle /> 配置验证通过
      </div>
      <div v-else class="validation-error">
        <IconExclamationCircle /> 配置验证失败
        <ul class="error-list">
          <li v-for="error in validationResult.errors" :key="error.field">
            {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
    
    <div v-if="!showResults && !loading" class="empty-state">
      <p>暂无预计算结果</p>
    </div>
    
    <!-- 详细信息面板 -->
    <div 
      v-if="showDetails" 
      data-testid="calculation-details"
      class="calculation-details mt-4 p-4 bg-gray-50 rounded-lg"
    >
      <h4 class="text-lg font-medium mb-3">计算详情</h4>
      <div class="detail-item">
        <span class="label">计算时间：</span>
        <span class="value">{{ results?.lastUpdateTime ? new Date(results.lastUpdateTime).toLocaleString() : '未知' }}</span>
      </div>
      <div class="detail-item">
        <span class="label">计算公式：</span>
        <span class="value">{{ results?.formula || '包含 - 剔除 = 最终' }}</span>
      </div>
      <div class="detail-item">
        <span class="label">数据来源：</span>
        <span class="value">实时计算</span>
      </div>
    </div>
   </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IconCheckCircle, IconExclamationCircle, IconDownload, IconCopy, IconDown } from '@arco-design/web-vue/es/icon'
import type { PreCalculateStats, ValidationResult } from '@/types/audience'

interface Props {
  conditionGroups?: any[]
  excludeGroups?: any[]
  loading?: boolean
  disabled?: boolean
  showValidation?: boolean
  validationResult?: ValidationResult
  results?: PreCalculateStats
}

const props = withDefaults(defineProps<Props>(), {
  conditionGroups: () => [],
  excludeGroups: () => [],
  loading: false,
  disabled: false,
  showValidation: false,
  validationResult: () => ({ isValid: true, errors: [] }),
  results: () => ({
    includeCount: 0,
    excludeCount: 0,
    finalCount: 0,
    formula: '',
    updateTime: ''
  })
})

const emit = defineEmits<{
  preCalculate: []
  validate: []
  'export-results': []
}>()

const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value < 768)
const isDesktop = computed(() => screenWidth.value >= 1024)

// 详情展开状态
const showDetails = ref(false)

const showResults = computed(() => {
  return props.results && (props.results.includeCount > 0 || props.results.excludeCount > 0)
})

const hasResults = computed(() => {
  return props.results && (props.results.finalCount > 0 || props.results.includeCount > 0)
})

const triggerPreCalculate = () => {
  emit('preCalculate')
}

const exportResults = () => {
  emit('export-results')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const copyResults = async () => {
  if (!hasResults.value || !props.results) return
  
  const resultText = `包含: ${formatNumber(props.results.includeCount)}\n剔除: ${formatNumber(props.results.excludeCount)}\n最终: ${formatNumber(props.results.finalCount)}`
  
  try {
    await navigator.clipboard.writeText(resultText)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.precalculate-panel {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  padding: 16px;
}

.precalculate-panel.mobile-layout {
  padding: 12px;
  font-size: 14px;
}

.precalculate-panel.mobile-layout .panel-header {
  flex-direction: column;
  gap: 8px;
}

.precalculate-panel.desktop-layout {
  padding: 20px;
}

.precalculate-panel.desktop-layout .panel-header {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.results-section {
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f2f3f5;
}

.result-item:last-child {
  border-bottom: none;
}

.label {
  color: #86909c;
  font-size: 14px;
}

.value {
  color: #1d2129;
  font-weight: 500;
}

.formula {
  color: #165dff;
  font-family: monospace;
}

.time {
  color: #86909c;
  font-size: 12px;
}

.validation-section {
  margin-bottom: 16px;
}

.validation-success {
  display: flex;
  align-items: center;
  color: #00b42a;
  font-size: 14px;
}

.validation-error {
  color: #f53f3f;
  font-size: 14px;
}

.error-list {
  margin: 8px 0 0 20px;
  padding: 0;
}

.error-list li {
  margin-bottom: 4px;
}

.empty-state {
  text-align: center;
  color: #86909c;
  padding: 32px 0;
}

.calculation-details {
  border: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 4px 0;
}

.detail-item .label {
  font-weight: 500;
  color: #6b7280;
}

.detail-item .value {
  color: #374151;
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}
</style>