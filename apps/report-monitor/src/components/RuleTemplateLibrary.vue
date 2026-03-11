<template>
  <div class="rule-template-library">
    <a-card title="规则模板库" class="bg-white">
      <div class="template-categories">
        <a-tabs v-model="activeCategory" type="rounded">
            <a-tab-pane key="all" title="全部">
              <TemplateList :templates="allTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="table" title="表格数据">
              <TemplateList :templates="tableTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="chart" title="图表数据">
              <TemplateList :templates="chartTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="text" title="文本内容">
              <TemplateList :templates="textTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="performance" title="性能监控">
              <TemplateList :templates="performanceTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="network" title="网络请求">
              <TemplateList :templates="networkTemplates" @select="selectTemplate" />
            </a-tab-pane>
            <a-tab-pane key="visual" title="视觉检查">
              <TemplateList :templates="visualTemplates" @select="selectTemplate" />
            </a-tab-pane>
          </a-tabs>
      </div>
      
      <!-- Template Details Modal -->
      <a-modal
        v-model:visible="showTemplateDetails"
        title="模板详情"
        @ok="applySelectedTemplate"
        @cancel="closeTemplateDetails"
      >
        <div v-if="selectedTemplate" class="template-details">
          <div class="template-header">
            <h3>{{ selectedTemplate.name }}</h3>
            <a-tag :color="getDifficultyColor(selectedTemplate.difficulty)">
              {{ getDifficultyLabel(selectedTemplate.difficulty) }}
            </a-tag>
          </div>
          
          <div class="template-description">
            {{ selectedTemplate.description }}
          </div>
          
          <div class="template-config">
            <h4>配置参数</h4>
            <div class="config-items">
              <div v-for="config in selectedTemplate.configs" :key="config.key" class="config-item">
                <div class="config-label">{{ config.label }}</div>
                <div class="config-input">
                  <a-input
                    v-if="config.type === 'string'"
                    v-model="templateConfig[config.key]"
                    :placeholder="config.placeholder"
                  />
                  <a-input-number
                    v-else-if="config.type === 'number'"
                    v-model="templateConfig[config.key]"
                    :min="config.min"
                    :max="config.max"
                  />
                  <a-select
                    v-else-if="config.type === 'select'"
                    v-model="templateConfig[config.key]"
                    :options="config.options"
                  />
                  <a-switch
                    v-else-if="config.type === 'boolean'"
                    v-model="templateConfig[config.key]"
                  />
                </div>
                <div class="config-help">{{ config.help }}</div>
              </div>
            </div>
          </div>
          
          <div class="template-preview">
            <h4>规则预览</h4>
            <div class="preview-content">
              <div class="preview-item">
                <span class="preview-label">类型:</span>
                <span class="preview-value">{{ getRuleTypeLabel(selectedTemplate.rule.type) }}</span>
              </div>
              <div class="preview-item" v-if="selectedTemplate.rule.selector">
                <span class="preview-label">选择器:</span>
                <code class="preview-value">{{ renderTemplate(selectedTemplate.rule.selector) }}</code>
              </div>
              <div class="preview-item" v-if="selectedTemplate.rule.expect">
                <span class="preview-label">期望值:</span>
                <code class="preview-value">{{ renderTemplate(selectedTemplate.rule.expect) }}</code>
              </div>
              <div class="preview-item" v-if="selectedTemplate.rule.threshold">
                <span class="preview-label">阈值:</span>
                <span class="preview-value">{{ renderTemplate(selectedTemplate.rule.threshold) }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  rule: {
    type: string
    selector?: string
    expect?: string | number
    threshold?: number
  }
  configs: TemplateConfig[]
}

interface TemplateConfig {
  key: string
  label: string
  type: 'string' | 'number' | 'select' | 'boolean'
  placeholder?: string
  default?: any
  min?: number
  max?: number
  options?: { label: string; value: any }[]
  help?: string
}

// Props
const props = defineProps<{
  elements?: any[]
}>()

// Emits
const emit = defineEmits<{
  templateApplied: [rule: any]
}>()

// State
const activeCategory = ref('all')
const showTemplateDetails = ref(false)
const selectedTemplate = ref<RuleTemplate | null>(null)
const templateConfig = ref<Record<string, any>>({})

// Template Library
const ruleTemplates = ref<RuleTemplate[]>([
  {
    id: 'table-exists',
    name: '表格存在性检查',
    description: '验证页面中表格元素是否存在',
    category: 'table',
    difficulty: 'easy',
    rule: {
      type: 'exists',
      selector: 'table, .ant-table, .el-table, .arco-table'
    },
    configs: [
      {
        key: 'customSelector',
        label: '自定义选择器',
        type: 'string',
        placeholder: '可选：输入特定的表格选择器',
        help: '如果不填写，将使用默认的表格选择器'
      }
    ]
  },
  {
    id: 'table-rows',
    name: '表格行数检查',
    description: '验证表格中数据行的数量',
    category: 'table',
    difficulty: 'medium',
    rule: {
      type: 'tableRows',
      selector: 'table tbody tr, .ant-table-tbody .ant-table-row',
      expect: '{{minRows}}',
      threshold: 0
    },
    configs: [
      {
        key: 'minRows',
        label: '最小行数',
        type: 'number',
        default: 1,
        min: 1,
        max: 1000,
        help: '表格中至少应该有的数据行数'
      },
      {
        key: 'customSelector',
        label: '表格行选择器',
        type: 'string',
        placeholder: '可选：输入特定的表格行选择器',
        help: '如果不填写，将使用默认的表格行选择器'
      }
    ]
  },
  {
    id: 'table-header-exists',
    name: '表头存在性检查',
    description: '验证表格是否包含表头',
    category: 'table',
    difficulty: 'easy',
    rule: {
      type: 'exists',
      selector: 'table thead tr, .ant-table-thead .ant-table-row'
    },
    configs: [
      {
        key: 'customSelector',
        label: '自定义选择器',
        type: 'string',
        placeholder: '可选：输入特定的表头选择器',
        help: '如果不填写，将使用默认的表头选择器'
      }
    ]
  },
  {
    id: 'table-filter-visible',
    name: '表格筛选控件可见性',
    description: '验证表格筛选或搜索控件是否可见',
    category: 'table',
    difficulty: 'easy',
    rule: {
      type: 'visible',
      selector: '.table-filter, .ant-table-filter-trigger, .search-input'
    },
    configs: [
      {
        key: 'customSelector',
        label: '筛选控件选择器',
        type: 'string',
        placeholder: '可选：输入特定筛选控件选择器',
        help: '如果不填写，将使用默认的筛选控件选择器'
      }
    ]
  },
  {
    id: 'chart-exists',
    name: '图表存在性检查',
    description: '验证页面中图表元素是否存在',
    category: 'chart',
    difficulty: 'easy',
    rule: {
      type: 'exists',
      selector: '.chart, .graph, .plot, [data-chart], canvas'
    },
    configs: [
      {
        key: 'customSelector',
        label: '自定义选择器',
        type: 'string',
        placeholder: '可选：输入特定的图表选择器',
        help: '如果不填写，将使用默认的图表选择器'
      }
    ]
  },
  {
    id: 'chart-visible',
    name: '图表可见性检查',
    description: '验证图表是否在视口中可见',
    category: 'chart',
    difficulty: 'easy',
    rule: {
      type: 'visible',
      selector: '.chart, .graph, .plot, [data-chart], canvas'
    },
    configs: [
      {
        key: 'customSelector',
        label: '图表选择器',
        type: 'string',
        placeholder: '可选：输入特定的图表选择器',
        help: '如果不填写，将使用默认的图表选择器'
      }
    ]
  },
  {
    id: 'chart-data-non-empty',
    name: '图表数据非空检查',
    description: '验证图表是否加载到数据',
    category: 'chart',
    difficulty: 'medium',
    rule: {
      type: 'nonEmpty',
      selector: '.chart .series, [data-chart] .series'
    },
    configs: [
      {
        key: 'dataSelector',
        label: '数据选择器',
        type: 'string',
        placeholder: '可选：输入特定的图表数据选择器',
        help: '如果不填写，将使用默认的数据选择器'
      }
    ]
  },
  {
    id: 'text-contains',
    name: '文本内容检查',
    description: '验证页面中是否包含特定的文本内容',
    category: 'text',
    difficulty: 'easy',
    rule: {
      type: 'textMatch',
      selector: 'body',
      expect: '{{textContent}}'
    },
    configs: [
      {
        key: 'textContent',
        label: '文本内容',
        type: 'string',
        default: '关键数据',
        placeholder: '输入要检查的文本内容',
        help: '页面中应该包含的文本内容'
      },
      {
        key: 'caseSensitive',
        label: '区分大小写',
        type: 'boolean',
        default: false,
        help: '是否区分大小写'
      }
    ]
  },
  {
    id: 'page-title-exists',
    name: '页面标题存在性检查',
    description: '验证页面标题是否存在',
    category: 'text',
    difficulty: 'easy',
    rule: {
      type: 'exists',
      selector: 'h1, .page-title, [data-title]'
    },
    configs: [
      {
        key: 'customSelector',
        label: '标题选择器',
        type: 'string',
        placeholder: '可选：输入特定的标题选择器',
        help: '如果不填写，将使用默认的标题选择器'
      }
    ]
  },
  {
    id: 'element-visible',
    name: '元素可见性检查',
    description: '验证特定元素是否在页面上可见',
    category: 'text',
    difficulty: 'easy',
    rule: {
      type: 'visible',
      selector: '{{elementSelector}}'
    },
    configs: [
      {
        key: 'elementSelector',
        label: '元素选择器',
        type: 'string',
        default: '.重要内容, .important-content',
        placeholder: '输入要检查的元素选择器',
        help: '要检查可见性的元素CSS选择器'
      }
    ]
  },
  {
    id: 'element-non-empty',
    name: '元素非空检查',
    description: '验证特定元素是否包含内容',
    category: 'text',
    difficulty: 'easy',
    rule: {
      type: 'nonEmpty',
      selector: '{{elementSelector}}'
    },
    configs: [
      {
        key: 'elementSelector',
        label: '元素选择器',
        type: 'string',
        default: '.data-container',
        placeholder: '输入要检查的元素选择器',
        help: '要检查内容的元素CSS选择器'
      }
    ]
  },
  {
    id: 'performance-load-time',
    name: '页面加载时间检查',
    description: '验证页面加载时间是否在合理范围内',
    category: 'performance',
    difficulty: 'medium',
    rule: {
      type: 'maxPerf',
      threshold: 3000
    },
    configs: [
      {
        key: 'maxTime',
        label: '最大加载时间（毫秒）',
        type: 'number',
        default: 3000,
        min: 100,
        max: 30000,
        help: '页面加载的最大允许时间'
      }
    ]
  },
  {
    id: 'performance-min-time',
    name: '页面最小加载时间检查',
    description: '验证页面加载时间不低于设定阈值',
    category: 'performance',
    difficulty: 'medium',
    rule: {
      type: 'minPerf',
      threshold: 500
    },
    configs: [
      {
        key: 'minTime',
        label: '最小加载时间（毫秒）',
        type: 'number',
        default: 500,
        min: 100,
        max: 30000,
        help: '页面加载的最小允许时间'
      }
    ]
  },
  {
    id: 'api-status',
    name: 'API状态检查',
    description: '验证API请求是否成功返回',
    category: 'network',
    difficulty: 'easy',
    rule: {
      type: 'networkOk'
    },
    configs: [
      {
        key: 'expectedStatus',
        label: '期望状态码',
        type: 'select',
        default: '200',
        options: [
          { label: '200 - 成功', value: '200' },
          { label: '201 - 创建成功', value: '201' },
          { label: '202 - 接受请求', value: '202' },
          { label: '任意2xx成功', value: '2xx' }
        ],
        help: '期望的HTTP状态码'
      }
    ]
  },
  {
    id: 'api-status-2xx',
    name: 'API状态2xx检查',
    description: '验证API请求返回是否为2xx',
    category: 'network',
    difficulty: 'easy',
    rule: {
      type: 'networkOk',
      expect: '2xx'
    },
    configs: [
      {
        key: 'expectedStatus',
        label: '期望状态码',
        type: 'select',
        default: '2xx',
        options: [
          { label: '200 - 成功', value: '200' },
          { label: '201 - 创建成功', value: '201' },
          { label: '202 - 接受请求', value: '202' },
          { label: '任意2xx成功', value: '2xx' }
        ],
        help: '期望的HTTP状态码'
      }
    ]
  },
  {
    id: 'screenshot-page-diff',
    name: '页面截图对比',
    description: '对比当前页面与基准图的差异',
    category: 'visual',
    difficulty: 'hard',
    rule: {
      type: 'screenshotDiff',
      threshold: 0.1
    },
    configs: [
      {
        key: 'diffThreshold',
        label: '差异阈值',
        type: 'number',
        default: 0.1,
        min: 0,
        max: 1,
        help: '允许的截图差异比例'
      }
    ]
  },
  {
    id: 'screenshot-element-diff',
    name: '元素截图对比',
    description: '对比特定元素截图与基准图的差异',
    category: 'visual',
    difficulty: 'hard',
    rule: {
      type: 'screenshotDiff',
      selector: '{{elementSelector}}',
      threshold: 0.05
    },
    configs: [
      {
        key: 'elementSelector',
        label: '元素选择器',
        type: 'string',
        default: '.chart, .graph, .plot, [data-chart], canvas',
        placeholder: '输入要截图的元素选择器',
        help: '用于截图对比的元素CSS选择器'
      },
      {
        key: 'diffThreshold',
        label: '差异阈值',
        type: 'number',
        default: 0.05,
        min: 0,
        max: 1,
        help: '允许的截图差异比例'
      }
    ]
  }
])

// Computed
const allTemplates = computed(() => ruleTemplates.value)

const tableTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'table')
)

const chartTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'chart')
)

const textTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'text')
)

const performanceTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'performance')
)

const networkTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'network')
)

const visualTemplates = computed(() => 
  ruleTemplates.value.filter(t => t.category === 'visual')
)

// Methods
const selectTemplate = (template: RuleTemplate) => {
  selectedTemplate.value = template
  templateConfig.value = {}
  
  // Initialize config with defaults
  template.configs.forEach(config => {
    if (config.default !== undefined) {
      templateConfig.value[config.key] = config.default
    }
  })
  
  showTemplateDetails.value = true
}

const closeTemplateDetails = () => {
  showTemplateDetails.value = false
  selectedTemplate.value = null
  templateConfig.value = {}
}

const applySelectedTemplate = () => {
  if (!selectedTemplate.value) return
  
  const rule = {
    type: selectedTemplate.value.rule.type,
    selector: renderTemplate(selectedTemplate.value.rule.selector || ''),
    expect: renderTemplate(selectedTemplate.value.rule.expect || ''),
    threshold: selectedTemplate.value.rule.threshold,
    description: selectedTemplate.value.description,
    templateId: selectedTemplate.value.id
  }
  
  emit('templateApplied', rule)
  closeTemplateDetails()
}

const renderTemplate = (template: string | number | undefined): string | number | undefined => {
  if (typeof template === 'number') return template
  if (!template || typeof template !== 'string') return template
  
  let result = template
  Object.entries(templateConfig.value).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  })
  
  return result
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'green'
    case 'medium': return 'orange'
    case 'hard': return 'red'
    default: return 'gray'
  }
}

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

const getRuleTypeLabel = (type: string) => {
  const labels = {
    exists: '存在性检查',
    visible: '可见性检查',
    textMatch: '文本匹配',
    nonEmpty: '非空检查',
    tableRows: '表格行数',
    minPerf: '最小性能',
    maxPerf: '最大性能',
    networkOk: '网络状态',
    screenshotDiff: '截图对比'
  }
  return labels[type as keyof typeof labels] || type
}
</script>

<style scoped>
.rule-template-library {
  height: 100%;
}

.template-categories {
  min-height: 500px;
}

.template-details {
  max-height: 70vh;
  overflow-y: auto;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.template-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.template-description {
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}

.template-config {
  margin-bottom: 20px;
}

.template-config h4 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.config-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-label {
  font-weight: 500;
  color: #374151;
}

.config-input {
  margin: 4px 0;
}

.config-help {
  font-size: 12px;
  color: #6b7280;
}

.template-preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.template-preview h4 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-weight: 500;
  color: #374151;
  min-width: 60px;
}

.preview-value {
  color: #6b7280;
  font-family: monospace;
}
</style>