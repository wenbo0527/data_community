<template>
  <div class="collection-records">
    <!-- 统计信息区域 -->
    <div class="statistics-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalRecords }}</div>
          <div class="stat-label">总催收次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.successRate }}%</div>
          <div class="stat-label">联系成功率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.avgScore }}</div>
          <div class="stat-label">平均效果评分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalAmount }}</div>
          <div class="stat-label">累计催收金额</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.contactSuccessCount }}</div>
          <div class="stat-label">成功联系</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.highScoreCount }}</div>
          <div class="stat-label">高分记录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.recentRecordsCount }}</div>
          <div class="stat-label">近30天</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.promiseCount }}</div>
          <div class="stat-label">承诺还款</div>
        </div>
      </div>
    </div>

    <!-- 标签系统 -->
    <div class="tags-section">
      <h4>催收标签</h4>
      <div class="tags-grid">
        <a-tag 
          v-for="tag in collectionTags.slice(0, 12)" 
          :key="tag.name"
          :color="getTagColor(tag.type)"
          class="collection-tag"
        >
          {{ tag.name }} ({{ tag.count }})
        </a-tag>
        <a-tag v-if="collectionTags.length === 0" color="gray">暂无标签</a-tag>
      </div>
    </div>

    <div class="section-header">
      <h3 class="section-title">
        <icon-exclamation-circle class="title-icon" />
        催收记录详情
      </h3>
      <div class="section-controls">
        <div class="filter-controls">
          <a-select 
            v-model="filterMethod" 
            placeholder="筛选催收方式" 
            style="width: 120px" 
            size="small"
            allow-clear
          >
            <a-option value="all">全部方式</a-option>
            <a-option value="电话">电话</a-option>
            <a-option value="短信">短信</a-option>
            <a-option value="上门">上门</a-option>
            <a-option value="邮件">邮件</a-option>
          </a-select>
          <a-select 
            v-model="filterResult" 
            placeholder="筛选联系结果" 
            style="width: 120px" 
            size="small"
            allow-clear
          >
            <a-option value="all">全部结果</a-option>
            <a-option value="联系成功">联系成功</a-option>
            <a-option value="联系失败">联系失败</a-option>
            <a-option value="已发送">已发送</a-option>
            <a-option value="未联系到">未联系到</a-option>
          </a-select>
          <a-select 
            v-model="filterScore" 
            placeholder="效果评分" 
            style="width: 120px" 
            size="small"
            allow-clear
          >
            <a-option value="all">全部评分</a-option>
            <a-option value="high">高分(8-10)</a-option>
            <a-option value="medium">中分(5-7)</a-option>
            <a-option value="low">低分(0-4)</a-option>
          </a-select>
          <a-select 
            v-model="filterAmount" 
            placeholder="逾期金额" 
            style="width: 120px" 
            size="small"
            allow-clear
          >
            <a-option value="all">全部金额</a-option>
            <a-option value="large">大额(>10万)</a-option>
            <a-option value="medium">中额(1-10万)</a-option>
            <a-option value="small">小额(<1万)</a-option>
          </a-select>
          <a-select 
            v-model="filterDate" 
            placeholder="时间范围" 
            style="width: 120px" 
            size="small"
            allow-clear
          >
            <a-option value="all">全部时间</a-option>
            <a-option value="recent">最近7天</a-option>
            <a-option value="week">最近30天</a-option>
            <a-option value="month">最近90天</a-option>
          </a-select>
          <a-button 
            size="small" 
            @click="resetFilters"
            style="margin-right: 8px"
          >
            重置筛选
          </a-button>

          <a-button 
            size="small" 
            @click="copyAllRecords"
            :disabled="filteredRecords.length === 0"
            :loading="isCopying"
          >
            {{ isCopying ? '复制中...' : '批量复制' }}
          </a-button>
          <a-button-group size="small">
            <a-button 
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="viewMode = 'list'"
            >
              列表
            </a-button>
            <a-button 
              :type="viewMode === 'timeline' ? 'primary' : 'default'"
              @click="viewMode = 'timeline'"
            >
              时间线
            </a-button>
          </a-button-group>
        </div>
        <span class="record-count">共 {{ filteredRecords.length }} 条记录</span>
      </div>
    </div>

    <div v-if="!records || records.length === 0" class="empty-state">
      <icon-folder class="empty-icon" />
      <p class="empty-text">暂无催收记录</p>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'" class="records-list">
      <div 
        v-for="record in paginatedRecords" 
        :key="record.id"
        class="record-item"
        :class="{
          'high-risk': record.riskLevel === '高',
          'medium-risk': record.riskLevel === '中',
          'low-risk': record.riskLevel === '低'
        }"
      >
        <div class="record-header">
          <div class="record-info">
            <span class="record-type">{{ record.collectionMethod }}</span>
            <span class="record-date">{{ formatDate(record.collectionDate) }} {{ record.collectionTime }}</span>
          </div>
          <div class="record-status">
            <a-tag 
              :color="getResultTagColor(record.contactResult)"
              class="status-tag"
            >
              {{ record.contactResult }}
            </a-tag>
            <span class="score-badge" :class="getScoreClass(record.effectiveScore)">
              {{ record.effectiveScore }}
            </span>
          </div>
        </div>

        <div class="record-content">
          <div class="record-details">
            <div class="detail-item">
              <span class="detail-label">催收人员：</span>
              <span class="detail-value">{{ record.collectorName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">逾期金额：</span>
              <span class="detail-value amount">{{ formatAmount(record.overdueAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">逾期天数：</span>
              <span class="detail-value days" :class="getOverdueDaysClass(record.overdueDays)">{{ record.overdueDays }}天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">客户响应：</span>
              <span class="detail-value">{{ record.customerResponse }}</span>
            </div>
            <div v-if="record.promiseAmount" class="detail-item">
              <span class="detail-label">承诺还款：</span>
              <span class="detail-value promise">{{ formatAmount(record.promiseAmount) }}（{{ record.promiseDate }}）</span>
            </div>
          </div>
          
          <div v-if="record.remarks" class="record-notes">
            <span class="notes-label">备注：</span>
            <span class="notes-content">{{ record.remarks }}</span>
          </div>

          <div class="record-actions">
            <a-button type="text" size="small" @click="viewDetails(record)">
              查看详情
            </a-button>
            <a-button type="text" size="small" @click="copyRecord(record)">
              复制
            </a-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="totalRecords > 0">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="totalRecords"
          :page-size-options="['10', '20', '50', '100']"
          show-page-size
          show-total
          show-jumper
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #total="{ total, range }">
            共 {{ total }} 条记录，当前显示第 {{ range[0] }}-{{ range[1] }} 条
          </template>
        </a-pagination>
      </div>
    </div>

    <!-- 时间线视图 -->
    <div v-else-if="viewMode === 'timeline'" class="timeline-view">
      <!-- 时间线控制栏 -->
      <div class="timeline-controls">
        <div class="timeline-filters">
          <a-button 
            type="text" 
            size="small" 
            @click="showTimelineFilters = !showTimelineFilters"
            :class="{ active: showTimelineFilters }"
          >
            <icon-filter /> 筛选
          </a-button>
          <a-button type="text" size="small" @click="resetTimelineFilters">
            <icon-refresh /> 重置
          </a-button>
        </div>
        <div class="timeline-zoom">
          <span class="zoom-label">缩放：</span>
          <a-slider 
            v-model="timelineZoom" 
            :min="0.5" 
            :max="2" 
            :step="0.1" 
            :style="{ width: '100px' }"
          />
          <span class="zoom-value">{{ Math.round(timelineZoom * 100) }}%</span>
        </div>
        <div class="timeline-actions">
          <a-button 
            type="text" 
            size="small" 
            @click="selectAllTimelineItems"
            :disabled="selectedTimelineItems.size === paginatedRecords.length"
          >
            全选
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            @click="clearTimelineSelection"
            :disabled="selectedTimelineItems.size === 0"
          >
            清空
          </a-button>
          <a-button 
            type="primary" 
            size="small" 
            @click="batchCopyTimelineItems"
            :disabled="selectedTimelineItems.size === 0"
          >
            批量复制 ({{ selectedTimelineItems.size }})
          </a-button>
        </div>
      </div>

      <!-- 时间线筛选面板 -->
      <div v-if="showTimelineFilters" class="timeline-filter-panel">
        <div class="filter-row">
          <div class="filter-item">
            <label>催收员：</label>
            <a-select 
              v-model="timelineFilter.collector" 
              placeholder="选择催收员" 
              allow-clear
              :style="{ width: '150px' }"
            >
              <a-option value="">全部</a-option>
              <a-option 
                v-for="collector in uniqueCollectors" 
                :key="collector" 
                :value="collector"
              >
                {{ collector }}
              </a-option>
            </a-select>
          </div>
          <div class="filter-item">
            <label>评分范围：</label>
            <a-select 
              v-model="timelineFilter.scoreRange" 
              placeholder="选择评分范围" 
              allow-clear
              :style="{ width: '150px' }"
            >
              <a-option value="">全部</a-option>
              <a-option value="high">高分 (8-10)</a-option>
              <a-option value="medium">中分 (5-7)</a-option>
              <a-option value="low">低分 (0-4)</a-option>
            </a-select>
          </div>
          <div class="filter-item">
            <label>时间范围：</label>
            <a-range-picker 
              v-model="timelineFilter.dateRange" 
              :style="{ width: '250px' }"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>

      <!-- 时间线内容 -->
      <div class="timeline-container" :style="{ transform: `scale(${timelineZoom})` }">
        <a-timeline>
          <a-timeline-item 
            v-for="record in filteredTimelineRecords" 
            :key="record.id"
            :color="getTimelineColor(record.effectiveScore)"
            class="timeline-item"
            :class="{ 
              expanded: expandedItems.has(record.id),
              hovered: hoveredItem === record.id,
              selected: selectedTimelineItems.has(record.id)
            }"
            @mouseenter="hoveredItem = record.id"
            @mouseleave="hoveredItem = null"
          >
            <template #dot>
              <div 
                class="timeline-dot" 
                :class="getTimelineDotClass(record.contactResult)"
                @click="toggleTimelineItem(record.id)"
              >
                {{ getMethodIcon(record.collectionMethod) }}
              </div>
            </template>
            <div class="timeline-content">
              <div class="timeline-header" @click="toggleExpanded(record.id)">
                <div class="timeline-title">
                  <a-checkbox 
                    :model-value="selectedTimelineItems.has(record.id)"
                    @change="toggleTimelineSelection(record.id)"
                    @click.stop
                  />
                  <span class="title-text">{{ record.collectionDate }} {{ record.collectionTime }}</span>
                  <icon-down 
                    class="expand-icon" 
                    :class="{ expanded: expandedItems.has(record.id) }"
                  />
                </div>
                <div class="timeline-tags">
                  <a-tag :color="getMethodTagColor(record.collectionMethod)" size="small">
                    {{ record.collectionMethod }}
                  </a-tag>
                  <a-tag :color="getResultTagColor(record.contactResult)" size="small">
                    {{ record.contactResult }}
                  </a-tag>
                  <a-tag 
                    :color="getScoreTagColor(record.effectiveScore)" 
                    size="small"
                  >
                    {{ record.effectiveScore }}分
                  </a-tag>
                </div>
              </div>
              
              <!-- 基础信息（始终显示） -->
              <div class="timeline-summary">
                <span class="summary-item">催收员：{{ record.collectorName }}</span>
                <span class="summary-item">金额：<span class="amount">{{ formatAmount(record.overdueAmount) }}</span></span>
                <span class="summary-item">天数：<span :class="getOverdueDaysClass(record.overdueDays)">{{ record.overdueDays }}天</span></span>
              </div>

              <!-- 详细信息（展开时显示） -->
              <div v-if="expandedItems.has(record.id)" class="timeline-details">
                <div class="detail-row">
                  <span>客户响应：{{ record.customerResponse }}</span>
                  <span>联系方式：{{ record.contactMethod || '未记录' }}</span>
                </div>
                <div v-if="record.promiseAmount" class="detail-row promise-info">
                  承诺还款：{{ formatAmount(record.promiseAmount) }}（{{ record.promiseDate }}）
                </div>
                <div v-if="record.remarks" class="timeline-remarks">
                  <strong>备注：</strong>{{ record.remarks }}
                </div>
                <div class="timeline-actions">
                  <a-button type="text" size="small" @click="viewDetails(record)">
                    <icon-eye /> 查看详情
                  </a-button>
                  <a-button type="text" size="small" @click="copyRecord(record)">
                    <icon-copy /> 复制
                  </a-button>
                  <a-button type="text" size="small" @click="markAsImportant(record)">
                    <icon-star /> 标记重要
                  </a-button>
                  <a-button type="text" size="small" @click="addFollowUp(record)">
                    <icon-plus /> 添加跟进
                  </a-button>
                </div>
              </div>

              <!-- 快速操作（悬停时显示） -->
              <div v-if="hoveredItem === record.id" class="timeline-quick-actions">
                <a-tooltip content="快速复制">
                  <a-button type="text" size="mini" @click="copyRecord(record)">
                    <icon-copy />
                  </a-button>
                </a-tooltip>
                <a-tooltip content="标记重要">
                  <a-button type="text" size="mini" @click="markAsImportant(record)">
                    <icon-star />
                  </a-button>
                </a-tooltip>
                <a-tooltip content="添加跟进">
                  <a-button type="text" size="mini" @click="addFollowUp(record)">
                    <icon-plus />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="totalRecords > 0">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="totalRecords"
          :page-size-options="['10', '20', '50', '100']"
          show-page-size
          show-total
          show-jumper
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #total="{ total, range }">
            共 {{ total }} 条记录，当前显示第 {{ range[0] }}-{{ range[1] }} 条
          </template>
        </a-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconExclamationCircle, 
  IconFolder,
  IconFilter,
  IconRefresh,
  IconDown,
  IconEye,
  IconCopy,
  IconStar,
  IconPlus
} from '@arco-design/web-vue/es/icon'
import { formatAmount } from '@/utils/formatUtils'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

// 响应式数据
const viewMode = ref('list')
const filterMethod = ref('')
const filterResult = ref('')
const filterScore = ref('')
const filterAmount = ref('')
const filterDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCopying = ref(false)

// 时间线交互状态
const expandedItems = ref(new Set())
const hoveredItem = ref(null)
const timelineZoom = ref(1)
const timelineFilter = ref({
  collector: '',
  scoreRange: '',
  dateRange: []
})
const showTimelineFilters = ref(false)
const selectedTimelineItems = ref(new Set())

// 统计数据
const statistics = computed(() => {
  const records = props.records || []
  if (records.length === 0) {
    return {
      totalRecords: 0,
      successRate: 0,
      avgScore: '0.0',
      totalAmount: '¥0.00',
      contactSuccessCount: 0,
      highScoreCount: 0,
      recentRecordsCount: 0,
      promiseCount: 0
    }
  }

  // 联系成功统计
  const successCount = records.filter(r => r.contactResult === '联系成功').length
  
  // 评分统计
  const validScores = records.map(r => parseFloat(r.effectiveScore)).filter(score => !isNaN(score))
  const totalScore = validScores.reduce((sum, score) => sum + score, 0)
  const avgScore = validScores.length > 0 ? (totalScore / validScores.length).toFixed(1) : '0.0'
  const highScoreCount = validScores.filter(score => score >= 8).length
  
  // 金额统计
  const validAmounts = records.map(r => parseFloat(r.overdueAmount)).filter(amount => !isNaN(amount))
  const totalAmount = validAmounts.reduce((sum, amount) => sum + amount, 0)
  
  // 承诺还款统计
  const promiseCount = records.filter(r => r.promiseAmount && parseFloat(r.promiseAmount) > 0).length
  
  // 最近记录统计（最近30天）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentRecordsCount = records.filter(r => {
    const recordDate = new Date(r.collectionDate)
    return recordDate >= thirtyDaysAgo
  }).length

  return {
    totalRecords: records.length,
    successRate: records.length > 0 ? Math.round((successCount / records.length) * 100) : 0,
    avgScore,
    totalAmount: formatAmount(totalAmount),
    contactSuccessCount: successCount,
    highScoreCount,
    recentRecordsCount,
    promiseCount
  }
})

// 标签统计
const collectionTags = computed(() => {
  const records = props.records || []
  const methodTags = {}
  const resultTags = {}
  const scoreTags = { '高分(8-10)': 0, '中分(5-7)': 0, '低分(0-4)': 0 }
  const amountTags = { '大额(>10万)': 0, '中额(1-10万)': 0, '小额(<1万)': 0 }
  
  records.forEach(record => {
    // 按催收方式统计
    const method = record.collectionMethod
    if (method) {
      methodTags[method] = (methodTags[method] || 0) + 1
    }
    
    // 按联系结果统计
    const result = record.contactResult
    if (result) {
      resultTags[result] = (resultTags[result] || 0) + 1
    }
    
    // 按评分统计
    const score = parseFloat(record.effectiveScore)
    if (!isNaN(score)) {
      if (score >= 8) scoreTags['高分(8-10)']++
      else if (score >= 5) scoreTags['中分(5-7)']++
      else scoreTags['低分(0-4)']++
    }
    
    // 按金额统计
    const amount = parseFloat(record.overdueAmount)
    if (!isNaN(amount)) {
      if (amount > 100000) amountTags['大额(>10万)']++
      else if (amount > 10000) amountTags['中额(1-10万)']++
      else amountTags['小额(<1万)']++
    }
  })
  
  const allTags = [
    ...Object.entries(methodTags).map(([name, count]) => ({ name: `方式:${name}`, count, type: 'method' })),
    ...Object.entries(resultTags).map(([name, count]) => ({ name: `结果:${name}`, count, type: 'result' })),
    ...Object.entries(scoreTags).map(([name, count]) => ({ name: `评分:${name}`, count, type: 'score' })),
    ...Object.entries(amountTags).map(([name, count]) => ({ name: `金额:${name}`, count, type: 'amount' }))
  ]
  
  return allTags.filter(tag => Number(tag.count) > 0).sort((a, b) => Number(b.count) - Number(a.count))
})

// 筛选后的记录
const filteredRecords = computed(() => {
  let records = props.records || []
  
  // 按催收方式筛选
  if (filterMethod.value && filterMethod.value !== 'all') {
    records = records.filter(r => r.collectionMethod === filterMethod.value)
  }
  
  // 按联系结果筛选
  if (filterResult.value && filterResult.value !== 'all') {
    records = records.filter(r => r.contactResult === filterResult.value)
  }
  
  // 按评分筛选
  if (filterScore.value && filterScore.value !== 'all') {
    records = records.filter(r => {
      const score = parseFloat(r.effectiveScore)
      if (isNaN(score)) return false
      
      switch (filterScore.value) {
        case 'high': return score >= 8
        case 'medium': return score >= 5 && score < 8
        case 'low': return score < 5
        default: return true
      }
    })
  }
  
  // 按金额筛选
  if (filterAmount.value && filterAmount.value !== 'all') {
    records = records.filter(r => {
      const amount = parseFloat(r.overdueAmount)
      if (isNaN(amount)) return false
      
      switch (filterAmount.value) {
        case 'large': return amount > 100000
        case 'medium': return amount > 10000 && amount <= 100000
        case 'small': return amount <= 10000
        default: return true
      }
    })
  }
  
  // 按时间筛选
  if (filterDate.value && filterDate.value !== 'all') {
    const now = new Date()
    records = records.filter(r => {
      const recordDate = new Date(r.collectionDate)
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filterDate.value) {
        case 'recent': return diffDays <= 7
        case 'week': return diffDays <= 30
        case 'month': return diffDays <= 90
        default: return true
      }
    })
  }
  
  return records.sort((a, b) => new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime())
})

// 分页记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 总记录数
const totalRecords = computed(() => {
  return filteredRecords.value.length
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value) || 1
})

// 时间线相关的计算属性
const uniqueCollectors = computed(() => {
  const collectors = [...new Set((props.records || []).map(record => record.collectorName))]
  return collectors.sort()
})

const filteredTimelineRecords = computed(() => {
  let records = [...filteredRecords.value]
  
  // 按催收员筛选
  if (timelineFilter.value.collector) {
    records = records.filter(record => record.collectorName === timelineFilter.value.collector)
  }
  
  // 按评分范围筛选
  if (timelineFilter.value.scoreRange) {
    const range = timelineFilter.value.scoreRange
    records = records.filter(record => {
      const score = record.effectiveScore
      if (range === 'high') return score >= 8
      if (range === 'medium') return score >= 5 && score < 8
      if (range === 'low') return score < 5
      return true
    })
  }
  
  // 按时间范围筛选
  if (timelineFilter.value.dateRange && timelineFilter.value.dateRange.length === 2) {
    const [startDate, endDate] = timelineFilter.value.dateRange
    records = records.filter(record => {
      const recordDate = new Date(record.collectionDate)
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.slice(start, end)
})

// 确保当前页不超过总页数
watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages) {
    currentPage.value = newTotalPages
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getTagColor = (type) => {
  const colorMap = {
    method: 'blue',
    result: 'green', 
    score: 'orange',
    amount: 'purple'
  }
  return colorMap[type] || 'default'
}

// 获取结果标签颜色
const getResultTagColor = (result) => {
  const colorMap = {
    '联系成功': 'green',
    '联系失败': 'red',
    '已发送': 'blue',
    '未联系到': 'orange'
  }
  return colorMap[result] || 'default'
}

// 获取评分样式类
const getScoreClass = (score) => {
  const numScore = parseFloat(score)
  if (numScore >= 8) return 'score-high'
  if (numScore >= 6) return 'score-medium'
  return 'score-low'
}

// 获取逾期天数样式类
const getOverdueDaysClass = (days) => {
  const numDays = parseInt(days)
  if (numDays >= 90) return 'days-critical'
  if (numDays >= 30) return 'days-warning'
  return 'days-normal'
}

// 获取时间线颜色
const getTimelineColor = (score) => {
  const numScore = parseFloat(score)
  if (numScore >= 8) return 'green'
  if (numScore >= 6) return 'orange'
  return 'red'
}

// 获取时间线点样式类
const getTimelineDotClass = (result) => {
  const classMap = {
    '联系成功': 'dot-success',
    '联系失败': 'dot-error',
    '已发送': 'dot-info',
    '未联系到': 'dot-warning'
  }
  return classMap[result] || 'dot-default'
}

// 获取方式图标
const getMethodIcon = (method) => {
  const iconMap = {
    '电话': '📞',
    '短信': '💬',
    '上门': '🚪',
    '邮件': '📧'
  }
  return iconMap[method] || '📋'
}

// 获取方式标签颜色
const getMethodTagColor = (method) => {
  const colorMap = {
    '电话': 'blue',
    '短信': 'green',
    '上门': 'orange',
    '邮件': 'purple'
  }
  return colorMap[method] || 'default'
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

// 重置筛选
const resetFilters = () => {
  filterMethod.value = 'all'
  filterResult.value = 'all'
  filterScore.value = 'all'
  filterAmount.value = 'all'
  filterDate.value = 'all'
  currentPage.value = 1
}

// 监听筛选条件变化，重置分页
watch([filterMethod, filterResult, filterScore, filterAmount, filterDate], () => {
  currentPage.value = 1
})

// 查看详情
const viewDetails = (record) => {
  console.log('查看催收记录详情:', record)
  // 这里可以打开详情弹窗或跳转到详情页
  Message.info('查看催收记录详情功能')
}

// 复制记录
const copyRecord = async (record) => {
  try {
    // 验证记录数据
    if (!record) {
      throw new Error('记录数据无效')
    }
    
    const copyText = formatSingleRecordText(record)
    
    // 检查剪贴板API支持
    if (!navigator.clipboard) {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = copyText
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        Message.success('催收记录已复制到剪贴板')
      } catch (fallbackError) {
        throw new Error('复制功能不支持，请手动复制')
      } finally {
        document.body.removeChild(textArea)
      }
    } else {
      await navigator.clipboard.writeText(copyText)
      Message.success('催收记录已复制到剪贴板')
    }
  } catch (error) {
    console.error('复制失败:', error)
    Message.error(`复制失败: ${error.message || '请手动复制'}`)
  }
}

// 格式化单条记录文本
const formatSingleRecordText = (record) => {
  const lines = [
    '催收记录详情',
    '=' .repeat(20),
    `日期时间: ${record.collectionDate} ${record.collectionTime}`,
    `催收方式: ${record.collectionMethod}`,
    `催收人员: ${record.collectorName}`,
    `联系电话: ${record.collectorPhone || '未提供'}`,
    `逾期金额: ${formatAmount(record.overdueAmount)}`,
    `逾期天数: ${record.overdueDays}天`,
    `联系结果: ${record.contactResult}`,
    `效果评分: ${record.effectiveScore}`,
    `客户响应: ${record.customerResponse}`,
    `风险等级: ${record.riskLevel || '未评估'}`
  ]
  
  if (record.promiseAmount) {
    lines.push(`承诺还款: ${formatAmount(record.promiseAmount)}（${record.promiseDate}）`)
  }
  
  if (record.followUpAction) {
    lines.push(`后续行动: ${record.followUpAction}`)
  }
  
  if (record.remarks) {
    lines.push(`备注信息: ${record.remarks}`)
  }
  
  lines.push('', `复制时间: ${new Date().toLocaleString()}`)
  
  return lines.join('\n')
}



// 批量复制功能
const copyAllRecords = async () => {
  if (isCopying.value) return
  
  try {
    isCopying.value = true
    Message.info('正在准备复制数据...')
    
    // 验证数据
    if (!filteredRecords.value || filteredRecords.value.length === 0) {
      throw new Error('没有可复制的数据')
    }
    
    // 检查数据量，避免复制过多数据
    if (filteredRecords.value.length > 100) {
      const confirmed = await new Promise(resolve => {
        // 这里应该使用确认对话框，暂时直接确认
        resolve(true)
      })
      if (!confirmed) {
        return
      }
    }
    
    // 模拟数据处理时间
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const copyText = generateBatchCopyText(filteredRecords.value)
    
    // 检查剪贴板API支持
    if (!navigator.clipboard) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = copyText
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        Message.success({
          content: `成功复制 ${filteredRecords.value.length} 条催收记录`,
          duration: 3000
        })
      } catch (fallbackError) {
        throw new Error('复制功能不支持，请手动复制')
      } finally {
        document.body.removeChild(textArea)
      }
    } else {
      await navigator.clipboard.writeText(copyText)
      Message.success({
        content: `成功复制 ${filteredRecords.value.length} 条催收记录`,
        duration: 3000
      })
    }
  } catch (error) {
    console.error('批量复制失败:', error)
    Message.error({
      content: `批量复制失败: ${error.message || '请重试'}`,
      duration: 5000
    })
  } finally {
    isCopying.value = false
  }
}

// 生成批量复制文本
const generateBatchCopyText = (records) => {
  const header = `催收记录汇总报告\n${'='.repeat(50)}\n`
  
  // 统计信息
  const totalAmount = records.reduce((sum, r) => sum + r.overdueAmount, 0)
  const successCount = records.filter(r => r.contactResult === '联系成功').length
  const avgScore = records.reduce((sum, r) => sum + r.effectiveScore, 0) / records.length
  const promiseCount = records.filter(r => r.promiseAmount > 0).length
  
  const summary = [
    `报告生成时间: ${new Date().toLocaleString()}`,
    `数据筛选条件: ${getFilterSummary()}`,
    '',
    '统计概览:',
    `  总记录数: ${records.length} 条`,
    `  联系成功: ${successCount} 条 (${((successCount / records.length) * 100).toFixed(1)}%)`,
    `  平均评分: ${avgScore.toFixed(1)} 分`,
    `  累计金额: ${formatAmount(totalAmount)}`,
    `  承诺还款: ${promiseCount} 条`,
    '',
    '详细记录:',
    '-'.repeat(50)
  ].join('\n')
  
  const recordsText = records.map((record, index) => {
    const lines = [
      `${(index + 1).toString().padStart(3, ' ')}. ${record.collectionDate} ${record.collectionTime}`,
      `     催收方式: ${record.collectionMethod}`,
      `     催收人员: ${record.collectorName} ${record.collectorPhone ? `(${record.collectorPhone})` : ''}`,
      `     逾期信息: ${formatAmount(record.overdueAmount)} / ${record.overdueDays}天`,
      `     联系结果: ${record.contactResult} (评分: ${record.effectiveScore})`,
      `     客户响应: ${record.customerResponse}`,
      `     风险等级: ${record.riskLevel || '未评估'}`
    ]
    
    if (record.promiseAmount) {
      lines.push(`     承诺还款: ${formatAmount(record.promiseAmount)} (${record.promiseDate})`)
    }
    
    if (record.followUpAction) {
      lines.push(`     后续行动: ${record.followUpAction}`)
    }
    
    if (record.remarks) {
      lines.push(`     备注信息: ${record.remarks}`)
    }
    
    return lines.join('\n')
  }).join('\n\n')
  
  const footer = `\n${'='.repeat(50)}\n报告结束 - 共 ${records.length} 条记录`
  
  return header + '\n' + summary + '\n\n' + recordsText + footer
}

// 获取筛选条件摘要
const getFilterSummary = () => {
  const filters = []
  if (filterMethod.value !== 'all') filters.push(`催收方式: ${filterMethod.value}`)
  if (filterResult.value !== 'all') filters.push(`联系结果: ${filterResult.value}`)
  if (filterScore.value !== 'all') filters.push(`效果评分: ${filterScore.value}`)
  if (filterAmount.value !== 'all') filters.push(`金额范围: ${filterAmount.value}`)
  if (filterDate.value !== 'all') filters.push(`时间范围: ${filterDate.value}`)
  return filters.length > 0 ? filters.join(', ') : '无筛选条件'
}



// 时间线交互方法
const toggleExpanded = (recordId) => {
  if (expandedItems.value.has(recordId)) {
    expandedItems.value.delete(recordId)
  } else {
    expandedItems.value.add(recordId)
  }
}

const toggleTimelineItem = (recordId) => {
  toggleExpanded(recordId)
}

const toggleTimelineSelection = (recordId) => {
  if (selectedTimelineItems.value.has(recordId)) {
    selectedTimelineItems.value.delete(recordId)
  } else {
    selectedTimelineItems.value.add(recordId)
  }
}

const selectAllTimelineItems = () => {
  filteredTimelineRecords.value.forEach(record => {
    selectedTimelineItems.value.add(record.id)
  })
}

const clearTimelineSelection = () => {
  selectedTimelineItems.value.clear()
}

const resetTimelineFilters = () => {
  timelineFilter.value = {
    collector: '',
    scoreRange: '',
    dateRange: []
  }
}

const batchCopyTimelineItems = () => {
  try {
    const selectedRecords = filteredTimelineRecords.value.filter(record => 
      selectedTimelineItems.value.has(record.id)
    )
    const csv = selectedRecords.map(record => 
      `${record.collectionDate},${record.collectionMethod},${record.collectorName},${record.contactResult},${record.effectiveScore}`
    ).join('\n')
    
    // 复制到剪贴板
    navigator.clipboard.writeText(csv).then(() => {
      Message.success(`已复制 ${selectedRecords.length} 条记录到剪贴板`)
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = csv
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      Message.success(`已复制 ${selectedRecords.length} 条记录到剪贴板`)
    })
  } catch (error) {
    console.error('批量复制失败:', error)
    Message.error('批量复制失败，请重试')
  }
}

const markAsImportant = (record) => {
  // 这里可以调用API标记记录为重要
  Message.success(`已标记记录 ${record.id} 为重要`)
}

const addFollowUp = (record) => {
  // 这里可以打开添加跟进的对话框
  Message.info(`为记录 ${record.id} 添加跟进`)
}

const getScoreTagColor = (score) => {
  if (score >= 8) return 'green'
  if (score >= 5) return 'orange'
  return 'red'
}

// 组件挂载时重置分页
onMounted(() => {
  currentPage.value = 1
})
</script>

<style scoped>
.collection-records {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  color: #ff7875;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-count {
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
  background: #fafbfc;
  border-radius: 8px;
  border: 2px dashed #e5e6eb;
  margin: 20px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
  color: #c9cdd4;
}

.empty-text {
  margin: 0;
  font-size: 15px;
  color: #86909c;
  line-height: 1.5;
}

.empty-description {
  margin-top: 8px;
  font-size: 13px;
  color: #c9cdd4;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fafbfc;
  border-radius: 8px;
  margin: 20px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e6eb;
  border-top: 3px solid #165dff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.loading-progress {
  margin-top: 12px;
  font-size: 12px;
  color: #c9cdd4;
}

/* 骨架屏样式 */
.skeleton-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 12px;
  background: #fafbfc;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-line.long {
  width: 100%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 错误状态样式 */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff2f0;
  border-radius: 8px;
  border: 2px dashed #ffb3b3;
  margin: 20px 0;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #ff4d4f;
  opacity: 0.8;
}

.error-text {
  margin: 0;
  font-size: 15px;
  color: #ff4d4f;
  font-weight: 500;
}

.error-description {
  margin-top: 8px;
  font-size: 13px;
  color: #ff7875;
}

.retry-btn {
  margin-top: 16px;
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}

.retry-btn:hover {
  background: #ff7875;
  border-color: #ff7875;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  background: #ffffff;
  cursor: pointer;
  overflow: hidden;
}

.record-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #e5e6eb;
  transition: all 0.3s ease;
}

.record-item:hover {
  border-color: #165dff;
  box-shadow: 0 4px 16px rgba(22, 93, 255, 0.1);
  transform: translateY(-2px);
}

.record-item:hover::before {
  background: #165dff;
  width: 6px;
}

.record-item.high-risk::before {
  background: #ff4d4f;
}

.record-item.medium-risk::before {
  background: #faad14;
}

.record-item.low-risk::before {
  background: #52c41a;
}

.record-item.selected {
  border-color: #165dff;
  background: #f0f7ff;
  box-shadow: 0 2px 12px rgba(22, 93, 255, 0.15);
}

.record-item.selected::before {
  background: #165dff;
  width: 6px;
}

.record-item:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.2);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-type {
  font-weight: 500;
  color: #262626;
}

.record-date {
  font-size: 12px;
  color: #8c8c8c;
}

.record-status {
  display: flex;
  align-items: center;
}

.status-tag {
  font-size: 12px;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
  min-width: 60px;
}

.detail-value {
  font-size: 13px;
  color: #262626;
}

.detail-value.amount {
  font-weight: 500;
  color: #ff4d4f;
}

.detail-value.days {
  font-weight: 500;
  color: #faad14;
}

.record-notes {
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.notes-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-right: 8px;
}

.notes-content {
  font-size: 13px;
  color: #595959;
  line-height: 1.4;
}

/* 统计信息样式 */
.statistics-section {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1890ff;
  opacity: 0.8;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-trend {
  font-size: 11px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
}

.stat-trend.up {
  background: #f6ffed;
  color: #52c41a;
}

.stat-trend.down {
  background: #fff2f0;
  color: #ff4d4f;
}

/* 标签系统样式 */
.tags-section {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-group-label {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  margin-right: 4px;
}

/* 筛选控件样式 */
.section-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  margin-bottom: 16px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
}

.filter-group:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}

.filter-label {
  font-size: 12px;
  color: #4e5969;
  font-weight: 500;
  white-space: nowrap;
}

.filter-input {
  min-width: 120px;
}

.reset-filters-btn {
  margin-left: auto;
  background: #f2f3f5;
  border-color: #e5e6eb;
  color: #4e5969;
}

.reset-filters-btn:hover {
  background: #e8f3ff;
  border-color: #165dff;
  color: #165dff;
}

.view-mode-toggle {
  display: flex;
  background: #f2f3f5;
  border-radius: 6px;
  padding: 2px;
  border: 1px solid #e5e6eb;
}

.view-mode-toggle .arco-btn {
  border: none;
  background: transparent;
  color: #4e5969;
  border-radius: 4px;
  margin: 0;
  transition: all 0.2s ease;
}

.view-mode-toggle .arco-btn.active {
  background: #ffffff;
  color: #165dff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.export-controls {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.export-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.export-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.export-btn:hover::before {
  left: 100%;
}

.export-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
}

.export-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.export-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-btn:disabled::before {
  display: none;
}

/* 通用按钮样式增强 */
.arco-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.arco-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.arco-btn-primary {
  background: linear-gradient(135deg, #165dff, #4080ff);
  border-color: #165dff;
}

.arco-btn-primary:hover {
  background: linear-gradient(135deg, #4080ff, #6aa1ff);
  border-color: #4080ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(22, 93, 255, 0.3);
}

.arco-btn-primary:active {
  transform: translateY(0);
}

.arco-btn-outline {
  border: 1px solid #d9d9d9;
  background: transparent;
  transition: all 0.3s ease;
}

.arco-btn-outline:hover {
  border-color: #165dff;
  color: #165dff;
  background: rgba(22, 93, 255, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(22, 93, 255, 0.1);
}

/* 输入框样式增强 */
.arco-input {
  transition: all 0.3s ease;
}

.arco-input:focus {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.arco-select {
  transition: all 0.3s ease;
}

.arco-select:focus-within {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 标签样式增强 */
.arco-tag {
  transition: all 0.3s ease;
  cursor: pointer;
}

.arco-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.arco-tag.arco-tag-checkable {
  border: 1px solid #d9d9d9;
}

.arco-tag.arco-tag-checkable:hover {
  border-color: #165dff;
}

.arco-tag.arco-tag-checked {
  background: #165dff;
  border-color: #165dff;
  color: white;
}

/* 分页组件样式增强 */
.arco-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arco-pagination-item {
  transition: all 0.3s ease;
}

.arco-pagination-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.arco-pagination-item-active {
  background: #165dff;
  border-color: #165dff;
  color: white;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
}

/* 评分样式 */
.score-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
}

.score-high {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.score-medium {
  background: #fff7e6;
  color: #faad14;
  border: 1px solid #ffd591;
}

.score-low {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffb3b3;
}

/* 逾期天数样式 */
.days-critical {
  color: #ff4d4f;
  font-weight: 600;
}

.days-warning {
  color: #faad14;
  font-weight: 500;
}

.days-normal {
  color: #52c41a;
}

.detail-value.promise {
  color: #1890ff;
  font-weight: 500;
}

/* 记录操作样式 */
.record-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

/* 时间线样式 */
.timeline-view {
  margin-top: 16px;
}

/* 时间线控制栏 */
.timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #e5e6eb;
}

.timeline-filters {
  display: flex;
  gap: 8px;
  align-items: center;
}

.timeline-filters .arco-btn.active {
  background-color: #e8f3ff;
  color: #165dff;
}

.timeline-zoom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-label {
  font-size: 12px;
  color: #4e5969;
}

.zoom-value {
  font-size: 12px;
  color: #1d2129;
  font-weight: 500;
  min-width: 35px;
}

.timeline-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 时间线筛选面板 */
.timeline-filter-panel {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 12px;
  color: #4e5969;
  white-space: nowrap;
}

/* 时间线容器 */
.timeline-container {
  transform-origin: top left;
  transition: transform 0.3s ease;
}

.timeline-item {
  transition: all 0.3s ease;
  position: relative;
}

.timeline-item.selected {
  background-color: #e8f3ff;
  border-radius: 6px;
  padding: 4px;
  margin: -4px;
}

.timeline-item.hovered {
  transform: translateX(4px);
}

.timeline-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.timeline-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.timeline-dot::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 20px;
  background: #e5e6eb;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
}

.timeline-item:last-child .timeline-dot::after {
  display: none;
}

.dot-success {
  background: #52c41a;
}

.dot-error {
  background: #ff4d4f;
}

.dot-info {
  background: #1890ff;
}

.dot-warning {
  background: #faad14;
}

.dot-default {
  background: #d9d9d9;
  color: #8c8c8c;
}

.timeline-content {
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
}

.timeline-item.expanded .timeline-content {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #262626;
  flex: 1;
}

.title-text {
  flex: 1;
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #86909c;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.timeline-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 时间线摘要信息 */
.timeline-summary {
  display: flex;
  gap: 16px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.summary-item {
  font-size: 12px;
  color: #4e5969;
}

.summary-item .amount {
  color: #f53f3f;
  font-weight: 500;
}

.timeline-details {
  margin: 12px 0;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  border-left: 3px solid #165dff;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding: 0 12px;
  }
  to {
    opacity: 1;
    max-height: 200px;
    padding: 12px;
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
  color: #595959;
}

.detail-row .amount {
  color: #ff4d4f;
  font-weight: 500;
}

.promise-info {
  color: #1890ff;
  font-weight: 500;
}

.timeline-remarks {
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
  font-size: 13px;
  color: #595959;
  margin-bottom: 8px;
}

.timeline-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

/* 快速操作按钮 */
.timeline-quick-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分页样式 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

/* 大屏幕优化 */
@media (min-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .filter-controls {
    gap: 20px;
  }
  
  .record-item {
    padding: 24px;
  }
}

/* 中等屏幕 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .filter-controls {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .filter-group {
    min-width: 200px;
  }
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .section-controls {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-controls {
    justify-content: flex-start;
  }
  
  .export-controls {
    justify-content: flex-start;
  }
  
  .view-mode-toggle {
    align-self: flex-start;
  }
  
  .record-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* 平板和小屏幕 */
@media (max-width: 768px) {
  .collection-records {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .record-details {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    flex-wrap: nowrap;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .record-item {
    padding: 16px;
  }
  
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .record-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .record-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .timeline-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .timeline-filters {
    flex-direction: column;
    gap: 8px;
  }
  
  .timeline-summary {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 2px;
  }
  
  .pagination-wrapper {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

/* 手机屏幕 */
@media (max-width: 480px) {
  .collection-records {
    padding: 12px;
  }
  
  .section-header {
    padding: 12px 0;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .record-item {
    padding: 12px;
  }
  
  .detail-item {
    padding: 8px 0;
  }
  
  .empty-state,
  .loading-state,
  .error-state {
    padding: 40px 16px;
  }
  
  .empty-icon,
  .error-icon {
    font-size: 48px;
  }
  
  .timeline-item {
    padding-left: 16px;
  }
  
  .timeline-dot {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  
  .timeline-content {
    padding: 8px 12px;
  }
  
  .timeline-quick-actions {
    position: static;
    margin-top: 8px;
    justify-content: flex-start;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>