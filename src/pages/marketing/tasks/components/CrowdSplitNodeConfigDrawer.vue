<template>
  <a-drawer
    v-model:visible="visible"
    title="人群分流"
    width="480px"
    placement="right"
    @cancel="handleCancel"
  >
    <div class="config-form">
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
    </div>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit">确定</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconMinus, IconSearch } from '@arco-design/web-vue/es/icon'

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

const visible = ref(props.visible)
const crowdList = ref([])

// 获取人群列表
const fetchCrowdList = async () => {
  try {
    // TODO: 替换为实际的API调用
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('/api/crowds', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    }).catch(error => {
      console.error('API请求失败:', error);
      return { ok: false, headers: new Headers(), status: 500 };
    });
    clearTimeout(timeoutId);
    if (!response.ok || !/application\/json/i.test(response.headers.get('content-type'))) {
      console.error('接口异常响应', {
        url: '/api/crowds',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      console.warn(`无效响应[${response.status}]`, {url: response.url});
      console.warn('使用mock人群数据');
      // 生产环境警告
      if (process.env.NODE_ENV === 'production') {
        console.error('[PROD] 人群接口异常');
      }
      crowdList.value = mockCrowdData;
      return;
    }
    const data = await response.json().catch(() => ({
      code: 500,
      data: mockCrowdData,
      message: 'JSON解析失败'
    }));
    crowdList.value = data.status === 200 ? data.data : mockCrowdData
  } catch (error) {
    console.error('获取人群列表失败:', error)
    crowdList.value = mockCrowdData
    Message.error('获取人群列表失败，使用默认数据')
  }
}

onMounted(() => {
  fetchCrowdList()
})

// 生成唯一ID
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

const formData = reactive({
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
})

// 获取指定层级可用的人群列表（排除已选择的人群）
const getAvailableCrowds = (currentIndex) => {
  const selectedCrowdIds = formData.crowdLayers
    .filter((layer, index) => index !== currentIndex && layer.crowdId)
    .map(layer => layer.crowdId)
  
  return crowdList.value.filter(crowd => !selectedCrowdIds.includes(crowd.id))
}

// 处理人群选择变化
const handleCrowdChange = (index, crowdId) => {
  const layer = formData.crowdLayers[index]
  layer.crowdId = crowdId
  
  // 设置人群名称
  if (crowdId) {
    const selectedCrowd = crowdList.value.find(crowd => crowd.id === crowdId)
    if (selectedCrowd) {
      layer.crowdName = selectedCrowd.name
    }
  } else {
    layer.crowdName = ''
  }
}

// 添加人群层级
const addCrowdLayer = () => {
  formData.crowdLayers.push({
    id: generateId(),
    crowdId: null,
    crowdName: ''
  })
}

// 添加命中人群（与添加人群功能相同）
const addHitCrowdLayer = () => {
  addCrowdLayer()
}

// 移除人群层级
const removeCrowdLayer = (index) => {
  if (formData.crowdLayers.length > 1) {
    formData.crowdLayers.splice(index, 1)
  }
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleSubmit = async () => {
  console.log('提交配置前数据校验:', formData);
  try {
    // 检查是否所有层级都已选择人群
    const hasEmptyLayers = formData.crowdLayers.some(layer => !layer.crowdId)
    
    if (hasEmptyLayers) {
      Message.error('请为所有人群层级选择对应的人群')
      return
    }
    
    // 检查是否有重复的人群
    const crowdIds = formData.crowdLayers.map(layer => layer.crowdId)
    const uniqueCrowdIds = [...new Set(crowdIds)]
    if (crowdIds.length !== uniqueCrowdIds.length) {
      Message.error('不能选择重复的人群')
      return
    }
    
    // 构建保存的配置数据
    const configData = {
      type: 'crowd-split',
      crowdLayers: formData.crowdLayers.map((layer, index) => ({
        id: layer.id,
        order: index + 1,
        crowdId: layer.crowdId,
        crowdName: layer.crowdName
      }))
    }
    
    emit('confirm', configData)
    Message.success('配置保存成功')
    visible.value = false
  } catch (error) {
    console.error('配置保存失败:', error)
    Message.error('配置保存失败')
  }
}

// 监听节点数据变化，初始化表单
watch(
  () => props.nodeData,
  (newData) => {
    if (newData && newData.crowdLayers && newData.crowdLayers.length > 0) {
      formData.crowdLayers = newData.crowdLayers.map(layer => ({
        id: layer.id || generateId(),
        crowdId: layer.crowdId,
        crowdName: layer.crowdName || ''
      }))
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.visible,
  (newVal) => {
    console.log('visible状态变化:', newVal);
    visible.value = newVal;
    emit('update:visible', newVal)
  }
)
</script>

<style scoped>
.config-form {
  padding: 16px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

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

