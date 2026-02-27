<template>
  <div class="marketing-records">
    <div class="module-header">
      <div class="header-title">营销记录</div>
      <div class="header-actions">
        <a-button size="small" @click="refreshData">
          <template #icon><IconRefresh /></template>
          刷新
        </a-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载营销记录数据...</p>
    </div>
    
    <div v-else-if="!hasData" class="empty-state">
      <a-empty description="暂无营销记录" />
    </div>
    
    <div v-else class="records-container">
      
      <!-- 1. 触达记录模块 (Touch Records) -->
      <div class="record-section touch-section">
        <div class="section-header">
          <div class="title-group">
            <span class="section-title">触达记录</span>
            <a-tag size="small" color="arcoblue" bordered>{{ filteredTouchRecords.length }}</a-tag>
          </div>
          
          <div class="filter-group">
            <a-select 
              v-model="touchFilters.channel" 
              placeholder="触达渠道" 
              style="width: 130px" 
              allow-clear 
              size="small"
            >
              <a-option>短信</a-option>
              <a-option>AI外呼</a-option>
              <a-option>人工外呼</a-option>
              <a-option>AI外呼挂短</a-option>
              <a-option>人工外呼挂短</a-option>
            </a-select>
            
            <a-select 
              v-model="touchFilters.result" 
              placeholder="结果" 
              style="width: 90px" 
              allow-clear 
              size="small"
            >
              <a-option>成功</a-option>
              <a-option>失败</a-option>
            </a-select>
            
            <a-range-picker 
              v-model="touchFilters.dateRange" 
              style="width: 200px" 
              size="small" 
            />
            
            <a-button size="small" @click="resetTouchFilters">重置</a-button>
          </div>
        </div>
        
        <a-table 
          :data="paginatedTouchRecords" 
          :pagination="false"
          size="small"
          :bordered="{ wrapper: true, cell: false }"
          row-key="id"
        >
          <template #columns>
            <a-table-column title="触达时间" data-index="touchDate" :width="160" />
            <a-table-column title="渠道" data-index="touchChannel" :width="120">
              <template #cell="{ record }">
                <div class="channel-cell">
                  <component :is="getChannelIcon(record.touchChannel)" />
                  <span>{{ record.touchChannel }}</span>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="内容" data-index="content" ellipsis tooltip>
              <template #cell="{ record }">
                <span>{{ record.content }}</span>
                <span v-if="record.duration" style="color: var(--color-text-3); margin-left: 8px; font-size: 12px;">
                  ({{ record.duration }})
                </span>
              </template>
            </a-table-column>
            <a-table-column title="状态" data-index="touchResult" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.touchResult === '成功' ? 'green' : 'red'" size="small">
                  {{ record.touchResult }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="80" align="center">
              <template #cell="{ record }">
                <a-link @click="viewDetail(record, 'touch')">详情</a-link>
              </template>
            </a-table-column>
          </template>
        </a-table>
        
        <div class="section-footer" v-if="filteredTouchRecords.length > 0">
          <a-pagination 
            size="small" 
            :total="filteredTouchRecords.length" 
            v-model:current="touchPage"
            v-model:page-size="touchPageSize"
            :page-size-options="[5, 10, 20, 50]"
            show-total
            show-page-size
          />
        </div>
      </div>

      <a-divider style="margin: 24px 0" />

      <!-- 2. 权益记录模块 (Benefit Records) -->
      <div class="record-section benefit-section">
        <div class="section-header">
          <div class="title-group">
            <span class="section-title">权益记录</span>
            <a-tag size="small" color="orange" bordered>{{ filteredBenefitRecords.length }}</a-tag>
          </div>
          
          <div class="filter-group">
            <a-select 
              v-model="benefitFilters.type" 
              placeholder="权益类型" 
              style="width: 120px" 
              allow-clear 
              size="small"
            >
              <a-option>利息减免</a-option>
              <a-option>折扣</a-option>
              <a-option>现金红包</a-option>
              <a-option>体验金</a-option>
            </a-select>
            
            <a-select 
              v-model="benefitFilters.status" 
              placeholder="状态" 
              style="width: 100px" 
              allow-clear 
              size="small"
            >
              <a-option>已发放</a-option>
              <a-option>已核销</a-option>
              <a-option>已过期</a-option>
              <a-option>已使用</a-option>
            </a-select>
            
            <a-button size="small" @click="resetBenefitFilters">重置</a-button>
          </div>
        </div>

        <a-table 
          :data="paginatedBenefitRecords" 
          :pagination="false"
          size="small"
          :bordered="{ wrapper: true, cell: false }"
          row-key="id"
        >
          <template #columns>
            <a-table-column title="下发时间" data-index="benefitDate" :width="160" />
            <a-table-column title="权益名称" data-index="benefitName" ellipsis tooltip />
            <a-table-column title="权益类型" data-index="benefitType" :width="120">
               <template #cell="{ record }">
                 <a-tag :color="getBenefitTypeColor(record.benefitType)" size="small">
                   {{ record.benefitType }}
                 </a-tag>
               </template>
            </a-table-column>
            <a-table-column title="权益状态" data-index="benefitStatus" :width="120">
               <template #cell="{ record }">
                 <a-badge 
                   :status="getBenefitStatusBadge(record.benefitStatus)" 
                   :text="record.benefitStatus" 
                 />
               </template>
            </a-table-column>
            <a-table-column title="操作" :width="80" align="center">
              <template #cell="{ record }">
                <a-link @click="viewDetail(record, 'benefit')">详情</a-link>
              </template>
            </a-table-column>
          </template>
        </a-table>
        
        <div class="section-footer" v-if="filteredBenefitRecords.length > 0">
          <a-pagination 
            size="small" 
            :total="filteredBenefitRecords.length" 
            v-model:current="benefitPage"
            v-model:page-size="benefitPageSize"
            :page-size-options="[5, 10, 20, 50]"
            show-total
            show-page-size
          />
        </div>
      </div>
    </div>
    
    <!-- 详情抽屉 -->
    <a-drawer
      v-model:visible="detailDrawerVisible"
      :title="drawerTitle"
      width="640px"
      :drawer-style="{ maxWidth: '90vw' }"
      placement="right"
    >
      <div v-if="selectedRecord" class="detail-content">
        <!-- 动态内容展示区域 -->
        <div v-if="selectedType === 'touch'" class="touch-detail-preview">
          <!-- 场景1：通话记录 (AI/人工) -->
          <div v-if="selectedRecord.duration" class="call-record-card">
            <div class="card-header">
              <span class="label">通话录音</span>
              <span class="duration">{{ selectedRecord.duration }}</span>
            </div>
            <div class="audio-player-mock">
              <a-button shape="circle" size="small" type="primary">
                <icon-play-arrow />
              </a-button>
              <div class="progress-track">
                <div class="progress-bar" style="width: 35%"></div>
              </div>
              <span class="time">00:15 / {{ selectedRecord.duration }}</span>
            </div>
            
            <div v-if="selectedRecord.transcript" class="transcript-box">
              <div class="box-title">对话详情</div>
              <a-typography-paragraph 
                class="box-content" 
                copyable 
                :copy-text="selectedRecord.transcript"
                style="margin-bottom: 0"
              >
                {{ selectedRecord.transcript }}
              </a-typography-paragraph>
            </div>
          </div>
          
          <!-- 场景2：短信/消息 -->
          <div v-else class="message-card">
            <div class="card-header">
              <span class="label">消息内容</span>
            </div>
            <div class="message-bubble">
              <a-typography-paragraph 
                copyable 
                :copy-text="selectedRecord.content"
                style="margin-bottom: 0"
              >
                {{ selectedRecord.content }}
              </a-typography-paragraph>
            </div>
          </div>
        </div>

        <!-- 基础信息 -->
        <a-descriptions :column="2" bordered size="large" class="detail-desc">
          <template v-for="(value, key) in detailFields" :key="key">
            <a-descriptions-item :label="key">{{ value }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { 
  IconRefresh,
  IconMessage,
  IconRobot,
  IconUser,
  IconNotification,
  IconPhone,
  IconPlayArrow,
  IconPause
} from '@arco-design/web-vue/es/icon'

interface Props {
  productKey?: string
  userInfo?: any
  loading?: boolean
  marketingData?: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits(['refresh', 'debug-info'])

// --- 状态管理 ---
const touchPage = ref(1)
const touchPageSize = ref(5)
const benefitPage = ref(1)
const benefitPageSize = ref(5)
const detailDrawerVisible = ref(false)
const selectedRecord = ref<any>(null)
const selectedType = ref<'touch' | 'benefit'>('touch')

const touchFilters = reactive({
  channel: '',
  result: '',
  dateRange: [] as any[]
})

const benefitFilters = reactive({
  type: '',
  status: ''
})

// --- 数据源计算 ---
const rawTouchRecords = computed(() => {
  if (props.marketingData?.touchRecords) return props.marketingData.touchRecords
  if (props.userInfo?.marketingRecords?.touchRecords) return props.userInfo.marketingRecords.touchRecords
  return []
})

const rawBenefitRecords = computed(() => {
  if (props.marketingData?.benefitRecords) return props.marketingData.benefitRecords
  if (props.userInfo?.marketingRecords?.benefitRecords) return props.userInfo.marketingRecords.benefitRecords
  return []
})

const hasData = computed(() => rawTouchRecords.value.length > 0 || rawBenefitRecords.value.length > 0)

// --- 过滤逻辑 ---
const filteredTouchRecords = computed(() => {
  return rawTouchRecords.value.filter((item: any) => {
    // 产品过滤
    if (props.productKey && item.productKey !== props.productKey) return false
    // 渠道过滤
    if (touchFilters.channel && item.touchChannel !== touchFilters.channel) return false
    // 结果过滤
    if (touchFilters.result && item.touchResult !== touchFilters.result) return false
    // 时间过滤 (简化处理)
    if (touchFilters.dateRange && touchFilters.dateRange.length === 2) {
       const date = new Date(item.touchDate).getTime()
       const start = new Date(touchFilters.dateRange[0]).getTime()
       const end = new Date(touchFilters.dateRange[1]).getTime()
       if (date < start || date > end) return false
    }
    return true
  })
})

const filteredBenefitRecords = computed(() => {
  return rawBenefitRecords.value.filter((item: any) => {
    // 产品过滤
    if (props.productKey && item.productKey !== props.productKey) return false
    // 类型过滤
    if (benefitFilters.type && item.benefitType !== benefitFilters.type) return false
    // 状态过滤
    if (benefitFilters.status && item.benefitStatus !== benefitFilters.status) return false
    return true
  })
})

// --- 分页逻辑 ---
const paginatedTouchRecords = computed(() => {
  const start = (touchPage.value - 1) * touchPageSize.value
  return filteredTouchRecords.value.slice(start, start + touchPageSize.value)
})

const paginatedBenefitRecords = computed(() => {
  const start = (benefitPage.value - 1) * benefitPageSize.value
  return filteredBenefitRecords.value.slice(start, start + benefitPageSize.value)
})

// --- 辅助方法 ---
const refreshData = () => {
  emit('refresh')
}

const resetTouchFilters = () => {
  touchFilters.channel = ''
  touchFilters.result = ''
  touchFilters.dateRange = []
}

const resetBenefitFilters = () => {
  benefitFilters.type = ''
  benefitFilters.status = ''
}

const getChannelIcon = (channel: string) => {
  if (channel.includes('AI')) return IconRobot
  if (channel.includes('人工')) return IconUser
  if (channel.includes('短信')) return IconMessage
  return IconNotification
}

const getBenefitTypeColor = (type: string) => {
  const map: Record<string, string> = {
    '利息减免': 'blue',
    '折扣': 'orange',
    '现金红包': 'red',
    '体验金': 'gold'
  }
  return map[type] || 'gray'
}

const getBenefitStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    '已发放': 'processing',
    '已核销': 'success',
    '已使用': 'success',
    '已过期': 'default',
    '未使用': 'normal'
  }
  return map[status] || 'default' as any
}

const formatBenefitValue = (record: any) => {
  if (record.benefitType === '折扣' || record.benefitValue < 1) {
    return `${(record.benefitValue * 10).toFixed(1)}折`
  }
  return `¥${Number(record.benefitValue).toLocaleString()}`
}

// --- 详情逻辑 ---
const viewDetail = (record: any, type: 'touch' | 'benefit') => {
  selectedRecord.value = record
  selectedType.value = type
  detailDrawerVisible.value = true
}

const drawerTitle = computed(() => {
  return selectedType.value === 'touch' ? '触达详情' : '权益详情'
})

const detailFields = computed(() => {
  const record = selectedRecord.value
  if (!record) return {}
  
  if (selectedType.value === 'touch') {
    return {
      '活动名称': record.campaignName,
      '活动类型': record.campaignType,
      '触达渠道': record.touchChannel,
      '触达时间': record.touchDate,
      '触达内容': record.content,
      '触达结果': record.touchResult,
      '用户反馈': record.responseAction,
      '目标人群': record.targetAudience,
      '关联产品': record.productKey || '-'
    }
  } else {
    return {
      '权益名称': record.benefitName,
      '权益类型': record.benefitType,
      '权益价值': formatBenefitValue(record),
      '当前状态': record.benefitStatus,
      '发放时间': record.benefitDate,
      '过期时间': record.expiryDate,
      '使用时间': record.useDate || '-',
      '来源活动': record.sourceActivity,
      '使用限制': record.usageRestriction
    }
  }
})
</script>

<style scoped lang="less">
.marketing-records {
  padding: 16px;
  background-color: var(--color-bg-2);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    border-left: 4px solid rgb(var(--primary-6));
    padding-left: 12px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }
  
  .filter-group {
    display: flex;
    gap: 8px;
  }
}

.channel-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-2);
  
  .arco-icon {
    color: rgb(var(--primary-6));
  }
}

.benefit-value {
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 600;
  color: var(--color-text-1);
}

.section-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.loading-state, .empty-state {
  padding: 40px;
  text-align: center;
  color: var(--color-text-3);
}

:deep(.arco-descriptions-item-label) {
  width: 100px;
}

.content-duration {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
  
  .arco-icon {
    color: rgb(var(--primary-6));
  }
}

.touch-detail-preview {
  margin-bottom: 24px;
  
  .call-record-card, .message-card {
    background: var(--color-fill-2);
    border-radius: 4px;
    padding: 16px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-weight: 500;
      color: var(--color-text-2);
    }
  }
  
  .audio-player-mock {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-bg-1);
    padding: 12px;
    border-radius: 32px;
    border: 1px solid var(--color-border-2);
    
    .progress-track {
      flex: 1;
      height: 4px;
      background: var(--color-fill-3);
      border-radius: 2px;
      position: relative;
      
      .progress-bar {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: rgb(var(--primary-6));
        border-radius: 2px;
      }
    }
    
    .time {
      font-size: 12px;
      color: var(--color-text-3);
      font-family: monospace;
    }
  }
  
  .transcript-box {
    margin-top: 16px;
    background: var(--color-bg-1);
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    padding: 12px;
    
    .box-title {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 8px;
    }
    
    .box-content {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.6;
      color: var(--color-text-1);
      max-height: 200px;
      overflow-y: auto;
    }
  }
  
  .message-bubble {
    background: var(--color-bg-1);
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    padding: 12px 16px;
    position: relative;
    margin-left: 8px;
    
    &::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 16px;
      width: 10px;
      height: 10px;
      background: var(--color-bg-1);
      border-left: 1px solid var(--color-border-2);
      border-bottom: 1px solid var(--color-border-2);
      transform: rotate(45deg);
    }
  }
}
</style>
