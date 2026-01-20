<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">探索模式</h1>
        <p class="text-gray-600 mt-1">先抓取页面数据，再智能推荐监控规则</p>
      </div>
      <div class="flex space-x-2">
        <a-button @click="goBack">
          <template #icon><icon-arrow-left /></template>
          返回
        </a-button>
        <a-button type="primary" @click="startExploration" :loading="loading" :disabled="!selectedTarget">
          <template #icon><icon-search /></template>
          开始探索
        </a-button>
      </div>
    </div>

    <!-- Target Selection -->
    <a-card title="选择监控目标" class="bg-white">
      <div class="space-y-4">
        <a-select 
          v-model="selectedTarget" 
          placeholder="请选择要探索的监控目标"
          class="w-full"
          allow-clear
        >
          <a-option 
            v-for="target in targets" 
            :key="target.id" 
            :value="target.id"
            :label="target.name"
          >
            <div class="flex items-center justify-between">
              <span>{{ target.name }}</span>
              <a-tag size="small">{{ target.authType }}</a-tag>
            </div>
          </a-option>
        </a-select>
        
        <div v-if="selectedTarget" class="p-3 bg-blue-50 rounded-lg">
          <div class="text-sm text-blue-800">
            <div>URL: {{ selectedTargetUrl }}</div>
            <div>认证方式: {{ getAuthTypeLabel(selectedTargetAuthType) }}</div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- Exploration Progress -->
    <a-card v-if="explorationSession" title="探索进度" class="bg-white">
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <a-progress 
            :percent="explorationProgress" 
            size="small" 
            status="normal"
          />
          <span class="text-sm text-gray-600">{{ explorationStatus }}</span>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-2xl font-bold text-blue-600">{{ elementCount }}</div>
            <div class="text-sm text-gray-600">DOM元素</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-2xl font-bold text-green-600">{{ apiRequestCount }}</div>
            <div class="text-sm text-gray-600">API请求</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-2xl font-bold text-purple-600">{{ screenshotCount }}</div>
            <div class="text-sm text-gray-600">截图</div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- Page Preview -->
    <a-card v-if="currentScreenshot" title="页面预览" class="bg-white">
      <div class="space-y-4">
        <div class="border rounded-lg overflow-hidden">
          <img 
            :src="currentScreenshot" 
            alt="页面截图" 
            class="w-full h-auto max-h-96 object-contain"
          />
        </div>
        
        <div class="flex space-x-2">
          <a-button size="small" @click="refreshScreenshot">
            <template #icon><icon-refresh /></template>
            刷新截图
          </a-button>
          <a-button size="small" @click="downloadScreenshot">
            <template #icon><icon-download /></template>
            下载截图
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- Element Explorer -->
    <a-card v-if="elements.length > 0" title="元素探索" class="bg-white">
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <a-input-search 
            v-model="elementFilter" 
            placeholder="搜索元素（标签名、文本内容、选择器）"
            class="flex-1"
          />
          <a-select v-model="elementTypeFilter" placeholder="元素类型" style="width: 120px">
            <a-option value="">全部</a-option>
            <a-option value="table">表格</a-option>
            <a-option value="chart">图表</a-option>
            <a-option value="text">文本</a-option>
            <a-option value="button">按钮</a-option>
          </a-select>
        </div>
        
        <div class="max-h-96 overflow-y-auto">
          <a-table 
            :data="filteredElements" 
            :columns="elementColumns"
            size="small"
            :pagination="false"
          >
            <template #selector="{ record }">
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ record.selector }}</code>
            </template>
            
            <template #textContent="{ record }">
              <div class="max-w-xs truncate" :title="record.textContent">
                {{ record.textContent || '-' }}
              </div>
            </template>
            
            <template #actions="{ record }">
              <div class="flex space-x-1">
                <a-button type="text" size="mini" @click="previewElement(record)">
                  预览
                </a-button>
                <a-button type="text" size="mini" @click="createRuleFromElement(record)">
                  创建规则
                </a-button>
              </div>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>

    <!-- Rule Recommendations -->
    <a-card v-if="recommendations.length > 0" title="智能规则推荐" class="bg-white">
      <div class="space-y-3">
        <div 
          v-for="(rec, index) in recommendations" 
          :key="index"
          class="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <a-tag :color="getConfidenceColor(rec.confidence)">
                  置信度 {{ Math.round(rec.confidence * 100) }}%
                </a-tag>
                <a-tag>{{ getRuleTypeLabel(rec.type) }}</a-tag>
              </div>
              <div class="font-medium text-gray-900">{{ rec.description }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ rec.reason }}</div>
              <div v-if="rec.selector" class="text-xs text-gray-500 mt-1">
                选择器: <code>{{ rec.selector }}</code>
              </div>
            </div>
            <div class="flex flex-col space-y-1">
              <a-button type="primary" size="small" @click="applyRecommendation(rec)">
                应用
              </a-button>
              <a-button size="small" @click="previewRecommendation(rec)">
                预览
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- Network Requests -->
    <a-card v-if="networkRequests.length > 0" title="网络请求分析" class="bg-white">
      <div class="max-h-64 overflow-y-auto">
        <a-table 
          :data="networkRequests" 
          :columns="networkColumns"
          size="small"
          :pagination="{ pageSize: 10 }"
        >
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status || 'pending' }}
            </a-tag>
          </template>
          
          <template #responseTime="{ record }">
            <span v-if="record.responseTime">{{ record.responseTime }}ms</span>
            <span v-else>-</span>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- Action Buttons -->
    <div class="flex justify-between">
      <a-button @click="goBack">返回列表</a-button>
      <div class="flex space-x-2">
        <a-button @click="exportExplorationData">
          <template #icon><icon-download /></template>
          导出数据
        </a-button>
        <a-button type="primary" @click="createRulesFromExploration" :disabled="recommendations.length === 0">
          <template #icon><icon-plus /></template>
          创建规则
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMonitorStore } from '@/store/monitor'
import { apiService } from '@/services/api'
import RuleTemplateLibrary from '@/components/RuleTemplateLibrary.vue'
import {
  IconArrowLeft,
  IconSearch,
  IconRefresh,
  IconDownload,
  IconPlus,
  IconApps
} from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()
const store = useMonitorStore()

// State
const selectedTarget = ref('')
const loading = ref(false)
const explorationSession = ref<any>(null)
const elements = ref<any[]>([])
const networkRequests = ref<any[]>([])
const recommendations = ref<any[]>([])
const elementFilter = ref('')
const elementTypeFilter = ref('')
const showTemplateLibrary = ref(false)

// Computed
const targets = computed(() => store.targets)
const selectedTargetUrl = computed(() => {
  const target = targets.value.find(t => t.id === selectedTarget.value)
  return target?.url || ''
})
const selectedTargetAuthType = computed(() => {
  const target = targets.value.find(t => t.id === selectedTarget.value)
  return target?.authType || ''
})
const explorationProgress = computed(() => {
  if (!explorationSession.value) return 0
  return Math.min(100, (elements.value.length + networkRequests.value.length) * 2)
})
const explorationStatus = computed(() => {
  if (loading.value) return '正在探索页面...'
  if (explorationSession.value) return '探索完成'
  return '等待开始探索'
})
const elementCount = computed(() => elements.value.length)
const apiRequestCount = computed(() => networkRequests.value.filter(r => r.type === 'xhr' || r.type === 'fetch').length)
const screenshotCount = computed(() => explorationSession.value?.screenshots?.length || 0)
const currentScreenshot = computed(() => {
  const screenshots = explorationSession.value?.screenshots || []
  return screenshots.length > 0 ? `/api/screenshot/${screenshots[screenshots.length - 1]}` : ''
})

const filteredElements = computed(() => {
  let filtered = elements.value
  
  if (elementFilter.value) {
    const filter = elementFilter.value.toLowerCase()
    filtered = filtered.filter(el => 
      el.selector.toLowerCase().includes(filter) ||
      el.tagName.toLowerCase().includes(filter) ||
      (el.textContent && el.textContent.toLowerCase().includes(filter))
    )
  }
  
  if (elementTypeFilter.value) {
    filtered = filtered.filter(el => {
      switch (elementTypeFilter.value) {
        case 'table': return el.tagName === 'table'
        case 'chart': return el.attributes.class?.includes('chart') || el.attributes.class?.includes('graph')
        case 'text': return ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName)
        case 'button': return el.tagName === 'button' || el.isClickable
        default: return true
      }
    })
  }
  
  return filtered
})

// Element table columns
const elementColumns = [
  { title: '选择器', dataIndex: 'selector', slotName: 'selector', width: 200 },
  { title: '标签', dataIndex: 'tagName', width: 80 },
  { title: '文本内容', dataIndex: 'textContent', slotName: 'textContent' },
  { title: '可见', dataIndex: 'isVisible', width: 60, render: (val: boolean) => val ? '是' : '否' },
  { title: '可点击', dataIndex: 'isClickable', width: 80, render: (val: boolean) => val ? '是' : '否' },
  { title: '操作', slotName: 'actions', width: 120 }
]

// Network table columns
const networkColumns = [
  { title: 'URL', dataIndex: 'url', ellipsis: true },
  { title: '方法', dataIndex: 'method', width: 60 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: '响应时间', dataIndex: 'responseTime', slotName: 'responseTime', width: 100 }
]

// Methods
const goBack = () => {
  router.push('/targets')
}

const getAuthTypeLabel = (type: string) => {
  const labels = {
    password: '密码认证',
    sso: 'SSO认证',
    cookie: 'Cookie认证',
    script: '自定义脚本'
  }
  return labels[type as keyof typeof labels] || type
}

const startExploration = async () => {
  if (!selectedTarget.value) return
  
  loading.value = true
  try {
    // Create exploration session
    const session = await apiService.createExplorationSession(selectedTarget.value)
    explorationSession.value = session
    
    // Simulate exploration (in real implementation, this would be done server-side)
    setTimeout(async () => {
      // Mock data for demonstration
      elements.value = [
        {
          selector: '.ant-table',
          tagName: 'table',
          textContent: '数据表格',
          isVisible: true,
          isClickable: false,
          attributes: { class: 'ant-table' }
        },
        {
          selector: 'h1',
          tagName: 'h1',
          textContent: '销售报表',
          isVisible: true,
          isClickable: false,
          attributes: {}
        },
        {
          selector: '.chart-container',
          tagName: 'div',
          textContent: '图表区域',
          isVisible: true,
          isClickable: false,
          attributes: { class: 'chart-container' }
        }
      ]
      
      networkRequests.value = [
        {
          url: '/api/sales/data',
          method: 'GET',
          status: 200,
          type: 'xhr',
          responseTime: 245
        },
        {
          url: '/api/charts/config',
          method: 'GET',
          status: 200,
          type: 'xhr',
          responseTime: 189
        }
      ]
      
      // Generate intelligent recommendations based on discovered elements and network data
      recommendations.value = generateIntelligentRecommendations(elements.value, networkRequests.value)
      
      loading.value = false
    }, 2000)
    
  } catch (error) {
    console.error('探索失败:', error)
    loading.value = false
  }
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'green'
  if (confidence >= 0.6) return 'orange'
  return 'red'
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

const getStatusColor = (status?: number) => {
  if (!status) return 'gray'
  if (status >= 200 && status < 300) return 'green'
  if (status >= 300 && status < 400) return 'orange'
  return 'red'
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'green'
    case 'medium': return 'orange'
    case 'hard': return 'red'
    default: return 'blue'
  }
}

const getDifficultyLabel = (difficulty: string) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[difficulty as keyof typeof labels] || '未知'
}

const previewElement = (element: any) => {
  console.log('预览元素:', element)
  // TODO: Implement element preview
}

const createRuleFromElement = (element: any) => {
  console.log('从元素创建规则:', element)
  // TODO: Navigate to rule creation with pre-filled data
  router.push('/rules')
}

const applyRecommendation = (recommendation: any) => {
  console.log('应用推荐规则:', recommendation)
  // TODO: Navigate to rule creation with recommendation data
  router.push('/rules')
}

const previewRecommendation = (recommendation: any) => {
  console.log('预览推荐规则:', recommendation)
  // TODO: Show rule preview
}

const exportExplorationData = () => {
  const data = {
    session: explorationSession.value,
    elements: elements.value,
    networkRequests: networkRequests.value,
    recommendations: recommendations.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `exploration-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const createRulesFromExploration = () => {
  console.log('从探索结果创建规则')
  // TODO: Batch create rules from recommendations
  router.push('/rules')
}

const refreshScreenshot = () => {
  console.log('刷新截图')
  // TODO: Implement screenshot refresh
}

const handleElementSelected = (element: any) => {
  console.log('选中元素:', element)
  // TODO: Handle element selection
}

const handleRuleCreated = (rule: any) => {
  console.log('创建规则:', rule)
  // TODO: Navigate to rule creation with the rule data
  router.push('/rules')
}

const downloadScreenshot = () => {
  if (!currentScreenshot.value) return
  
  const a = document.createElement('a')
  a.href = currentScreenshot.value
  a.download = `screenshot-${Date.now()}.png`
  a.click()
}

const generateIntelligentRecommendations = (elements: any[], networkRequests: any[]) => {
  const recommendations = []
  
  // Analyze elements for rule recommendations
  const tables = elements.filter(el => el.tagName === 'table')
  const headings = elements.filter(el => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName))
  const buttons = elements.filter(el => el.tagName === 'button' || el.isClickable)
  const charts = elements.filter(el => el.attributes.class?.includes('chart') || el.attributes.class?.includes('graph'))
  
  // Table recommendations
  if (tables.length > 0) {
    recommendations.push({
      type: 'tableRows',
      selector: tables[0].selector,
      expect: '1',
      description: `表格数据存在性检查 (${tables.length}个表格)`,
      confidence: 0.9,
      reason: '检测到表格元素，建议验证数据行数',
      difficulty: 'easy'
    })
  }
  
  // Heading recommendations
  if (headings.length > 0) {
    recommendations.push({
      type: 'textMatch',
      selector: headings[0].selector,
      expect: headings[0].textContent || '',
      description: `页面标题检查: ${headings[0].textContent}`,
      confidence: 0.85,
      reason: '检测到页面标题，建议验证关键文本内容',
      difficulty: 'easy'
    })
  }
  
  // Chart recommendations
  if (charts.length > 0) {
    recommendations.push({
      type: 'exists',
      selector: charts[0].selector,
      description: `图表存在性检查 (${charts.length}个图表)`,
      confidence: 0.8,
      reason: '检测到图表元素，建议验证图表是否正常渲染',
      difficulty: 'medium'
    })
  }
  
  // Network performance recommendations
  const apiRequests = networkRequests.filter(r => r.type === 'xhr' || r.type === 'fetch')
  if (apiRequests.length > 0) {
    const avgResponseTime = apiRequests.reduce((sum, req) => sum + (req.responseTime || 0), 0) / apiRequests.length
    const maxResponseTime = Math.max(...apiRequests.map(req => req.responseTime || 0))
    
    recommendations.push({
      type: 'networkOk',
      description: 'API请求状态检查',
      confidence: 0.85,
      reason: '检测到API请求，建议验证接口可用性',
      difficulty: 'easy'
    })
    
    if (maxResponseTime > 1000) {
      recommendations.push({
        type: 'maxPerf',
        threshold: Math.ceil(maxResponseTime * 1.2),
        description: `API响应性能检查 (当前最大: ${maxResponseTime}ms)`,
        confidence: 0.75,
        reason: `检测到API响应时间较长，建议设置性能阈值 (建议: ${Math.ceil(maxResponseTime * 1.2)}ms)`,
        difficulty: 'medium'
      })
    }
  }
  
  // Performance recommendations based on element loading
  if (elements.length > 0) {
    const visibleElements = elements.filter(el => el.isVisible)
    if (visibleElements.length > 0) {
      recommendations.push({
        type: 'visible',
        selector: visibleElements[0].selector,
        description: `关键元素可见性检查`,
        confidence: 0.8,
        reason: '检测到可见元素，建议验证关键内容是否显示',
        difficulty: 'easy'
      })
    }
  }
  
  return recommendations
}

onMounted(() => {
  // Load targets if not already loaded
  if (store.targets.length === 0) {
    store.loadTargets()
  }
})
</script>