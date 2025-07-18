<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="人群分流节点配置"
    width="600px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 系统提示 -->
      <div class="system-tip">
        <a-alert type="info" show-icon>
          系统将按从上到下顺序，依次命中
        </a-alert>
      </div>

      <!-- 人群分层配置 -->
      <div class="crowd-layers">
        <div 
          v-for="(layer, index) in formData.crowdLayers" 
          :key="layer.id"
          class="crowd-layer"
        >
          <div class="layer-header">
            <span class="layer-title">人群{{ index + 1 }}：</span>
            <span class="layer-label">命中</span>
            <a-button
              v-if="formData.crowdLayers.length > 1"
              type="text"
              status="danger"
              size="small"
              class="remove-btn"
              @click="removeCrowdLayer(index)"
            >
              <icon-minus />
            </a-button>
          </div>
          
          <div class="layer-content">
            <a-select
              v-model="layer.crowdId"
              placeholder="请选择人群"
              class="crowd-select"
              @change="(value) => handleCrowdChange(index, value)"
            >
              <a-option 
                v-for="crowd in getAvailableCrowds(index)" 
                :key="crowd.id" 
                :value="crowd.id"
              >
                {{ crowd.name }}
              </a-option>
            </a-select>
            
            <a-button
              type="text"
              size="small"
              class="search-btn"
            >
              <icon-search />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button 
          type="primary" 
          class="add-crowd-btn"
          @click="addCrowdLayer"
        >
          新增人群
        </a-button>
        <a-button 
          type="primary" 
          class="add-hit-crowd-btn"
          @click="addHitCrowdLayer"
        >
          添加命中人群
        </a-button>
      </div>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '✓' : '✗' }}</div>
        <div><strong>人群层级数量:</strong> {{ formData?.crowdLayers?.length || 0 }}</div>
        <div><strong>已选择人群:</strong> {{ formData?.crowdLayers?.filter(l => l.crowdId && l.crowdId !== null && l.crowdId !== undefined && l.crowdId !== '')?.length || 0 }}</div>
        <div><strong>可用人群数量:</strong> {{ crowdList.length }}</div>
        <div><strong>验证错误:</strong> {{ customValidation(formData).join(', ') || '无' }}</div>
        <div><strong>人群ID列表:</strong> {{ formData?.crowdLayers?.map(l => l.crowdId || 'null').join(', ') || '无' }}</div>
        
        <div class="log-section" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong>日志信息:</strong>
            <div>
              <a-button size="mini" @click="exportLogs">导出日志</a-button>
              <a-button size="mini" @click="clearLogs" style="margin-left: 8px;">清空日志</a-button>
            </div>
          </div>
          
          <div><strong>会话ID:</strong> {{ crowdSplitLogger.sessionId }}</div>
          <div><strong>日志总数:</strong> {{ logSummary.totalLogs }}</div>
          <div><strong>错误数:</strong> {{ logSummary.logsByLevel.error || 0 }}</div>
          <div><strong>警告数:</strong> {{ logSummary.logsByLevel.warn || 0 }}</div>
          
          <div style="margin-top: 10px;">
            <strong>最近日志:</strong>
            <div style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px;">
              <div v-for="log in recentLogs" :key="log.timestamp" 
                   :style="{ color: getLogColor(log.level), marginBottom: '4px' }">
                [{{ formatLogTime(log.timestamp) }}] {{ log.category }}: {{ log.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconMinus, IconSearch } from '@arco-design/web-vue/es/icon'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'
import crowdSplitLogger from '@/utils/crowdSplitLogger.js'

// Mock数据
const mockCrowdData = [
  {
    id: 1,
    name: '高净值客户',
    count: 1500,
    tags: ['VIP', 'AUM>50万']
  },
  {
    id: 2,
    name: '新注册用户',
    count: 4500,
    tags: ['新手', '30日内']
  },
  {
    id: 3,
    name: '活跃交易用户',
    count: 2800,
    tags: ['高频', '月交易>10次']
  },
  {
    id: 4,
    name: '潜在流失用户',
    count: 1200,
    tags: ['风险', '30日未登录']
  },
  {
    id: 5,
    name: '理财产品用户',
    count: 3200,
    tags: ['理财', '稳健型']
  },
  {
    id: 6,
    name: '基金投资用户',
    count: 2100,
    tags: ['基金', '成长型']
  }
]

// Props 和 Emits
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  nodeData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 人群列表
const crowdList = ref([])

// 表单验证规则
const formRules = {
  crowdLayers: [
    { required: true, message: '请配置人群分层' }
  ]
}

// 生成唯一ID
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

// 初始表单数据
const getInitialFormData = () => {
  const initialData = {
    crowdLayers: [
      {
        id: generateId(),
        crowdId: null,
        crowdName: ''
      },
      {
        id: generateId(),
        crowdId: null,
        crowdName: ''
      }
    ]
  }
  
  crowdSplitLogger.info('INIT', '初始化表单数据', {
    crowdLayersCount: initialData.crowdLayers.length,
    layerIds: initialData.crowdLayers.map(l => l.id)
  })
  
  return initialData
}

// 自定义验证函数
const customValidation = (formData) => {
  const errors = []
  
  crowdSplitLogger.debug('VALIDATION', '开始表单验证', { formData })
  
  // 检查 formData 是否存在
  if (!formData) {
    crowdSplitLogger.warn('VALIDATION', '表单数据为空')
    return errors
  }
  
  if (!formData.crowdLayers || formData.crowdLayers.length === 0) {
    const error = '请配置人群分层'
    errors.push(error)
    crowdSplitLogger.warn('VALIDATION', error)
    return errors
  }
  
  // 检查是否所有层级都已选择人群
  const emptyLayers = formData.crowdLayers.filter(layer => 
    !layer.crowdId || layer.crowdId === null || layer.crowdId === undefined || layer.crowdId === ''
  )
  
  if (emptyLayers.length > 0) {
    const error = `请为所有人群层级选择对应的人群 (还有 ${emptyLayers.length} 个未选择)`
    errors.push(error)
    crowdSplitLogger.warn('VALIDATION', error, {
      emptyLayersCount: emptyLayers.length,
      emptyLayerIds: emptyLayers.map(l => l.id),
      totalLayers: formData.crowdLayers.length
    })
  }
  
  // 检查是否有重复的人群
  const validCrowdIds = formData.crowdLayers
    .map(layer => layer.crowdId)
    .filter(id => id && id !== null && id !== undefined && id !== '')
  
  const uniqueCrowdIds = [...new Set(validCrowdIds)]
  if (validCrowdIds.length !== uniqueCrowdIds.length) {
    const error = '不能选择重复的人群'
    errors.push(error)
    crowdSplitLogger.warn('VALIDATION', error, {
      validCrowdIds,
      uniqueCrowdIds,
      duplicateCount: validCrowdIds.length - uniqueCrowdIds.length
    })
  }
  
  const isValid = errors.length === 0
  crowdSplitLogger.logValidation(isValid, errors, formData)
  
  return errors
}

// 使用 BaseDrawer 组合式函数
const {
  formData,
  visible,
  isSubmitting,
  handleSubmit: baseHandleSubmit,
  handleCancel
} = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'crowd-split'
})

// 获取人群列表
const fetchCrowdList = async () => {
  const startTime = Date.now()
  crowdSplitLogger.info('API_CALL', '开始获取人群列表')
  
  try {
    // TODO: 替换为实际的API调用
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    crowdSplitLogger.debug('API_CALL', '发起人群列表API请求', {
      url: '/api/crowds',
      timeout: 10000
    })
    
    const response = await fetch('/api/crowds', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    }).catch(error => {
      crowdSplitLogger.error('API_CALL', 'API请求失败', error);
      return { ok: false, headers: new Headers(), status: 500 };
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime
    
    if (!response.ok || !/application\/json/i.test(response.headers.get('content-type'))) {
      crowdSplitLogger.error('API_CALL', '接口异常响应', {
        url: '/api/crowds',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime
      });
      
      crowdSplitLogger.warn('API_CALL', `无效响应[${response.status}]，使用mock数据`, {
        url: response.url,
        responseTime
      });
      
      // 生产环境警告
      if (process.env.NODE_ENV === 'production') {
        crowdSplitLogger.error('API_CALL', '[PROD] 人群接口异常');
      }
      
      crowdList.value = mockCrowdData;
      crowdSplitLogger.info('API_CALL', '已加载mock人群数据', {
        count: mockCrowdData.length,
        responseTime
      });
      return;
    }
    
    const data = await response.json().catch(() => {
      crowdSplitLogger.error('API_CALL', 'JSON解析失败，使用mock数据');
      return {
        code: 500,
        data: mockCrowdData,
        message: 'JSON解析失败'
      };
    });
    
    crowdList.value = data.status === 200 ? data.data : mockCrowdData
    
    crowdSplitLogger.logApiCall('/api/crowds', 'GET', data.status || 200, responseTime)
    crowdSplitLogger.info('API_CALL', '人群列表获取成功', {
      count: crowdList.value.length,
      responseTime,
      dataSource: data.status === 200 ? 'api' : 'mock'
    })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    crowdSplitLogger.error('API_CALL', '获取人群列表失败', {
      error: error.message,
      stack: error.stack,
      responseTime
    })
    
    crowdList.value = mockCrowdData
    Message.error('获取人群列表失败，使用默认数据')
    
    crowdSplitLogger.info('API_CALL', '已回退到mock数据', {
      count: mockCrowdData.length,
      responseTime
    })
  }
}

onMounted(() => {
  crowdSplitLogger.info('LIFECYCLE', '组件已挂载，开始初始化')
  fetchCrowdList()
})

// 监听器
watch(() => props.visible, (newVal, oldVal) => {
  crowdSplitLogger.info('LIFECYCLE', `抽屉显示状态变化: ${oldVal} -> ${newVal}`)
  if (newVal) {
    crowdSplitLogger.info('LIFECYCLE', '抽屉打开，记录节点数据', props.nodeData)
  }
}, { immediate: true })

watch(() => formData, (newVal) => {
  if (newVal) {
    crowdSplitLogger.logFormDataChange('表单数据监听变化', newVal)
  }
}, { deep: true })

// 日志相关计算属性
const logSummary = computed(() => {
  try {
    return crowdSplitLogger.getLogSummary()
  } catch (error) {
    console.error('LogSummary computed error:', error)
    return { total: 0, debug: 0, info: 0, warn: 0, error: 0 }
  }
})

const recentLogs = computed(() => {
  try {
    return crowdSplitLogger.logs.slice(-20).reverse()
  } catch (error) {
    console.error('RecentLogs computed error:', error)
    return []
  }
})

// 日志工具方法
const getLogColor = (level) => {
  const colors = {
    debug: '#666',
    info: '#1890ff',
    warn: '#faad14',
    error: '#f5222d'
  }
  return colors[level] || '#666'
}

const formatLogTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const exportLogs = () => {
  const logData = crowdSplitLogger.exportLogs()
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crowd-split-logs-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  crowdSplitLogger.info('SYSTEM', '日志已导出')
  Message.success('日志导出成功')
}

const clearLogs = () => {
  crowdSplitLogger.clearLogs()
  Message.success('日志已清空')
}

// 获取指定层级可用的人群列表（排除已选择的人群）
const getAvailableCrowds = (currentIndex) => {
  // 检查 formData 和 crowdLayers 是否存在
  if (!formData || !formData.crowdLayers) {
    return crowdList.value || []
  }
  
  const selectedCrowdIds = formData.crowdLayers
    .filter((layer, index) => index !== currentIndex && layer.crowdId)
    .map(layer => layer.crowdId)
  
  return crowdList.value.filter(crowd => !selectedCrowdIds.includes(crowd.id))
}

// 处理人群选择变化
const handleCrowdChange = (index, crowdId) => {
  crowdSplitLogger.debug('CROWD_SELECT', '开始处理人群选择变化', {
    index,
    crowdId,
    formDataExists: !!formData,
    crowdLayersExists: !!formData?.crowdLayers
  })
  
  if (!formData || !formData.crowdLayers || !formData.crowdLayers[index]) {
    crowdSplitLogger.warn('CROWD_SELECT', '无法处理人群选择：数据不完整', {
      index,
      crowdId,
      formDataExists: !!formData,
      crowdLayersExists: !!formData?.crowdLayers,
      layerExists: !!formData?.crowdLayers?.[index]
    })
    return
  }
  
  const layer = formData.crowdLayers[index]
  const oldCrowdId = layer.crowdId
  const oldCrowdName = layer.crowdName
  
  layer.crowdId = crowdId
  
  // 设置人群名称
  if (crowdId) {
    const selectedCrowd = crowdList.value.find(crowd => crowd.id === crowdId)
    if (selectedCrowd) {
      layer.crowdName = selectedCrowd.name
      crowdSplitLogger.logCrowdSelection(index, crowdId, selectedCrowd.name)
    } else {
      crowdSplitLogger.warn('CROWD_SELECT', '未找到对应的人群信息', {
        index,
        crowdId,
        availableCrowds: crowdList.value.map(c => ({ id: c.id, name: c.name }))
      })
    }
  } else {
    layer.crowdName = ''
    crowdSplitLogger.info('CROWD_SELECT', '清空人群选择', { index })
  }
  
  // 记录变化
  crowdSplitLogger.logFormDataChange('人群选择变化', {
    index,
    oldCrowdId,
    newCrowdId: crowdId,
    oldCrowdName,
    newCrowdName: layer.crowdName,
    totalLayers: formData.crowdLayers.length,
    selectedCount: formData.crowdLayers.filter(l => l.crowdId).length
  })
}

// 添加人群层级
const addCrowdLayer = () => {
  if (!formData || !formData.crowdLayers) {
    crowdSplitLogger.warn('LAYER_OP', '无法添加层级：表单数据不完整')
    return
  }
  
  const newLayer = {
    id: generateId(),
    crowdId: null,
    crowdName: ''
  }
  
  formData.crowdLayers.push(newLayer)
  
  crowdSplitLogger.logLayerOperation('添加层级', formData.crowdLayers.length - 1, {
    newLayerId: newLayer.id,
    totalLayers: formData.crowdLayers.length
  })
  
  crowdSplitLogger.logFormDataChange('添加人群层级', formData)
}

// 添加命中人群（与添加人群功能相同）
const addHitCrowdLayer = () => {
  crowdSplitLogger.info('LAYER_OP', '添加命中人群层级（调用添加层级）')
  addCrowdLayer()
}

// 移除人群层级
const removeCrowdLayer = (index) => {
  if (!formData || !formData.crowdLayers || formData.crowdLayers.length <= 1) {
    crowdSplitLogger.warn('LAYER_OP', '无法移除层级：条件不满足', {
      index,
      formDataExists: !!formData,
      crowdLayersExists: !!formData?.crowdLayers,
      layersCount: formData?.crowdLayers?.length || 0
    })
    return
  }
  
  const removedLayer = formData.crowdLayers[index]
  formData.crowdLayers.splice(index, 1)
  
  crowdSplitLogger.logLayerOperation('移除层级', index, {
    removedLayerId: removedLayer?.id,
    removedCrowdId: removedLayer?.crowdId,
    removedCrowdName: removedLayer?.crowdName,
    remainingLayers: formData.crowdLayers.length
  })
  
  crowdSplitLogger.logFormDataChange('移除人群层级', formData)
}

// 表单验证状态
const isFormValid = computed(() => {
  try {
    // 确保 formData 已经初始化
    if (!formData) {
      return false
    }
    const errors = customValidation(formData)
    return errors.length === 0
  } catch (error) {
    crowdSplitLogger.error('VALIDATION', '表单验证计算属性出错', {
      error: error.message,
      stack: error.stack,
      formDataExists: !!formData
    })
    return false
  }
})

// 监听表单验证状态变化
watch(() => isFormValid.value, (newVal, oldVal) => {
  try {
    crowdSplitLogger.debug('VALIDATION', `表单验证状态变化: ${oldVal} -> ${newVal}`)
  } catch (error) {
    console.error('Watch isFormValid error:', error)
  }
}, { 
  flush: 'post' // 确保在DOM更新后执行
})

// 自定义提交处理
const handleSubmit = async () => {
  crowdSplitLogger.info('SUBMIT', '开始处理表单提交')
  
  if (!formData || !formData.crowdLayers) {
    const error = '表单数据不完整'
    crowdSplitLogger.error('SUBMIT', error, {
      formDataExists: !!formData,
      crowdLayersExists: !!formData?.crowdLayers
    })
    Message.error(error)
    return
  }
  
  // 检查是否所有层级都已选择人群
  const hasEmptyLayers = formData.crowdLayers.some(layer => !layer.crowdId)
  
  if (hasEmptyLayers) {
    const error = '请为所有人群层级选择对应的人群'
    crowdSplitLogger.warn('SUBMIT', error, {
      totalLayers: formData.crowdLayers.length,
      emptyLayers: formData.crowdLayers.filter(l => !l.crowdId).length,
      selectedLayers: formData.crowdLayers.filter(l => l.crowdId).length
    })
    Message.error(error)
    return
  }
  
  // 检查是否有重复的人群
  const crowdIds = formData.crowdLayers.map(layer => layer.crowdId)
  const uniqueCrowdIds = [...new Set(crowdIds)]
  if (crowdIds.length !== uniqueCrowdIds.length) {
    const error = '不能选择重复的人群'
    crowdSplitLogger.warn('SUBMIT', error, {
      crowdIds,
      uniqueCrowdIds,
      duplicateCount: crowdIds.length - uniqueCrowdIds.length
    })
    Message.error(error)
    return
  }
  
  // 构建配置数据
  const configData = {
    type: 'crowd-split',
    crowdLayers: formData.crowdLayers.map((layer, index) => ({
      id: layer.id,
      order: index + 1,
      crowdId: layer.crowdId,
      crowdName: layer.crowdName
    })),
    nodeType: 'crowd-split'
  }
  
  crowdSplitLogger.logSubmit(configData, true)
  crowdSplitLogger.info('SUBMIT', '表单提交成功，配置数据已生成', {
    layersCount: configData.crowdLayers.length,
    crowdIds: configData.crowdLayers.map(l => l.crowdId)
  })
  
  await baseHandleSubmit(configData)
  Message.success('配置保存成功')
}
</script>

<style scoped>
.system-tip {
  margin-bottom: 24px;
}

.system-tip .arco-alert {
  background-color: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
}

.crowd-layers {
  margin-bottom: 24px;
}

.crowd-layer {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.layer-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.layer-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.layer-label {
  font-size: 14px;
  color: #666;
}

.remove-btn {
  margin-left: auto;
  color: #ff4d4f;
}

.remove-btn:hover {
  background-color: #fff2f0;
}

.layer-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crowd-select {
  flex: 1;
}

.search-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.search-btn:hover {
  background-color: #f0f0f0;
  color: #1890ff;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.add-crowd-btn,
.add-hit-crowd-btn {
  flex: 1;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
}

.add-crowd-btn {
  background-color: #1890ff;
  border-color: #1890ff;
}

.add-crowd-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.add-hit-crowd-btn {
  background-color: #1890ff;
  border-color: #1890ff;
}

.add-hit-crowd-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.debug-info {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.debug-info div {
  margin-bottom: 4px;
}

.debug-info div:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .layer-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-btn {
    align-self: flex-end;
    width: auto;
    padding: 0 12px;
  }
}
</style>

