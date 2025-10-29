<template>
  <div class="rule-management">
    <a-card title="预警规则管理" :bordered="false" class="rules-card">
      <template #extra>
        <a-space>
          <a-input-search
            v-model="searchText"
            placeholder="搜索规则"
            style="width: 160px"
            size="small"
            @search="handleSearch"
          />
          <a-select
            v-model="typeFilter"
            size="small"
            style="width: 100px"
            placeholder="类型"
            allow-clear
            @change="handleTypeFilter"
          >
            <a-option value="inventory">库存</a-option>
            <a-option value="expiry">过期</a-option>
            <a-option value="failure">失败</a-option>
            <a-option value="global">全局</a-option>
          </a-select>
          <a-select
            v-model="statusFilter"
            size="small"
            style="width: 100px"
            placeholder="状态"
            allow-clear
            @change="handleStatusFilter"
          >
            <a-option value="active">启用</a-option>
            <a-option value="inactive">禁用</a-option>
          </a-select>
          <a-button type="primary" size="small" @click="handleAddRule">
            <template #icon>
              <IconPlus />
            </template>
            新建规则
          </a-button>
        </a-space>
      </template>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedRules.length > 0" class="batch-actions">
        <a-space>
          <span class="selected-count">已选择 {{ selectedRules.length }} 项</span>
          <a-button size="small" @click="handleBatchEnable">批量启用</a-button>
          <a-button size="small" @click="handleBatchDisable">批量禁用</a-button>
          <a-button size="small" status="danger" @click="handleBatchDelete">批量删除</a-button>
          <a-button size="small" type="text" @click="handleClearSelection">清除选择</a-button>
        </a-space>
      </div>

      <!-- 规则卡片网格 -->
      <div class="rules-grid">
        <div
          v-for="rule in filteredRules"
          :key="rule.id"
          class="rule-card"
          :class="{ 'rule-card--selected': selectedRules.includes(rule.id) }"
          @click="handleRuleClick(rule)"
        >
          <!-- 选择框 -->
          <div class="rule-card__checkbox" @click.stop>
            <a-checkbox
              :model-value="selectedRules.includes(rule.id)"
              @change="handleRuleSelect(rule.id, $event)"
            />
          </div>

          <!-- 规则状态指示器 -->
          <div class="rule-card__status" :class="`rule-card__status--${rule.enabled ? 'active' : 'inactive'}`">
            <div class="status-dot"></div>
          </div>

          <!-- 规则内容 -->
          <div class="rule-card__content">
            <div class="rule-card__header">
              <div class="rule-name">{{ rule.name }}</div>
              <a-tag
                :color="rule.enabled ? 'green' : 'gray'"
                size="small"
                class="status-tag"
              >
                {{ rule.enabled ? '启用' : '禁用' }}
              </a-tag>
            </div>

            <div class="rule-card__meta">
              <a-tag :color="getTypeColor(rule.type)" size="small">
                {{ getTypeText(rule.type) }}
              </a-tag>
              <span class="rule-created">{{ formatDate(rule.createdAt) }}</span>
            </div>

            <div class="rule-card__description">
              {{ rule.description || '暂无描述' }}
            </div>

            <div class="rule-card__conditions">
              <div class="conditions-title">触发条件：</div>
              <div class="conditions-text">{{ formatConditions(rule.conditions) }}</div>
            </div>

            <!-- 规则统计 -->
            <div class="rule-card__stats">
              <div class="stat-item">
                <span class="stat-label">触发次数</span>
                <span class="stat-value">{{ rule.triggerCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最近触发</span>
                <span class="stat-value">{{ formatLastTrigger(rule.lastTriggerTime) }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="rule-card__actions">
            <a-space size="mini">
              <a-button
                type="text"
                size="mini"
                :status="rule.enabled ? 'warning' : 'success'"
                @click.stop="handleToggleRule(rule)"
              >
                {{ rule.enabled ? '禁用' : '启用' }}
              </a-button>
              <a-button
                type="text"
                size="mini"
                @click.stop="handleEditRule(rule)"
              >
                编辑
              </a-button>
              <a-button
                type="text"
                size="mini"
                @click.stop="handleCopyRule(rule)"
              >
                复制
              </a-button>
              <a-button
                type="text"
                size="mini"
                status="danger"
                @click.stop="handleDeleteRule(rule)"
              >
                删除
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredRules.length === 0" class="empty-rules">
          <a-empty description="暂无预警规则">
            <a-button type="primary" @click="handleAddRule">创建第一个规则</a-button>
          </a-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredRules.length > 0" class="pagination-container">
        <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRules.length"
          :show-size-changer="true"
          :show-total="true"
          size="small"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'

// Props
const props = defineProps({
  rules: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'add-rule',
  'edit-rule',
  'delete-rule',
  'toggle-rule',
  'copy-rule',
  'batch-enable',
  'batch-disable',
  'batch-delete',
  'rule-click'
])

// 响应式数据
const searchText = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const selectedRules = ref([])
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性
const filteredRules = computed(() => {
  let filtered = [...props.rules]
  
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(rule => 
      rule.name.toLowerCase().includes(search) ||
      (rule.description && rule.description.toLowerCase().includes(search))
    )
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(rule => rule.type === typeFilter.value)
  }
  
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(rule => rule.enabled === isActive)
  }
  
  return filtered
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleTypeFilter = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleAddRule = () => {
  emit('add-rule')
}

const handleEditRule = (rule) => {
  emit('edit-rule', rule)
}

const handleDeleteRule = (rule) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除规则"${rule.name}"吗？此操作不可恢复。`,
    onOk: () => {
      emit('delete-rule', rule)
      Message.success('规则删除成功')
    }
  })
}

const handleToggleRule = (rule) => {
  emit('toggle-rule', rule)
  Message.success(`规则已${rule.enabled ? '禁用' : '启用'}`)
}

const handleCopyRule = (rule) => {
  emit('copy-rule', rule)
  Message.success('规则复制成功')
}

const handleRuleClick = (rule) => {
  emit('rule-click', rule)
}

const handleRuleSelect = (ruleId, checked) => {
  if (checked) {
    selectedRules.value.push(ruleId)
  } else {
    const index = selectedRules.value.indexOf(ruleId)
    if (index > -1) {
      selectedRules.value.splice(index, 1)
    }
  }
}

const handleBatchEnable = () => {
  emit('batch-enable', selectedRules.value)
  selectedRules.value = []
  Message.success('批量启用成功')
}

const handleBatchDisable = () => {
  emit('batch-disable', selectedRules.value)
  selectedRules.value = []
  Message.success('批量禁用成功')
}

const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRules.value.length} 个规则吗？此操作不可恢复。`,
    onOk: () => {
      emit('batch-delete', selectedRules.value)
      selectedRules.value = []
      Message.success('批量删除成功')
    }
  })
}

const handleClearSelection = () => {
  selectedRules.value = []
}

// 工具方法
const getTypeColor = (type) => {
  const colorMap = {
    inventory: 'blue',
    expiry: 'purple',
    failure: 'red',
    global: 'green'
  }
  return colorMap[type] || 'gray'
}

const getTypeText = (type) => {
  const textMap = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败监控',
    global: '全局监控'
  }
  return textMap[type] || '未知类型'
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatConditions = (conditions) => {
  if (!conditions) return '暂无条件'
  
  // 根据不同类型格式化条件
  if (conditions.threshold !== undefined) {
    return `阈值: ${conditions.threshold}${conditions.thresholdType === 'percentage' ? '%' : '张'}`
  }
  
  if (conditions.advanceDays !== undefined) {
    return `提前 ${conditions.advanceDays} 天预警`
  }
  
  if (conditions.failureRate !== undefined) {
    return `失败率超过 ${conditions.failureRate}%`
  }
  
  return '自定义条件'
}

const formatLastTrigger = (time) => {
  if (!time) return '从未'
  
  const now = new Date()
  const triggerTime = new Date(time)
  const diff = now - triggerTime
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return triggerTime.toLocaleDateString()
}

// 监听规则变化，清除无效选择
watch(() => props.rules, () => {
  const validIds = props.rules.map(rule => rule.id)
  selectedRules.value = selectedRules.value.filter(id => validIds.includes(id))
}, { deep: true })
</script>

<style scoped>
.rule-management {
  height: 100%;
}

.rules-card {
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rules-card :deep(.arco-card-body) {
  height: calc(100% - 60px);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.batch-actions {
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.selected-count {
  font-size: 14px;
  color: #1890FF;
  font-weight: 500;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.rule-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
}

.rule-card:hover {
  border-color: #1890FF;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.rule-card--selected {
  border-color: #1890FF;
  background: #f2f3ff;
}

.rule-card__checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.rule-card__status {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 8px;
  height: 8px;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.rule-card__status--active .status-dot {
  background: #52C41A;
}

.rule-card__status--inactive .status-dot {
  background: #d9d9d9;
}

.rule-card__content {
  margin-left: 16px;
  margin-right: 24px;
}

.rule-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rule-name {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.status-tag {
  flex-shrink: 0;
}

.rule-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rule-created {
  font-size: 12px;
  color: #86909c;
}

.rule-card__description {
  font-size: 13px;
  color: #86909c;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rule-card__conditions {
  margin-bottom: 12px;
}

.conditions-title {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
}

.conditions-text {
  font-size: 13px;
  color: #1d2129;
  background: #f7f8fa;
  padding: 6px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.rule-card__stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #e5e6eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #86909c;
}

.stat-value {
  font-size: 13px;
  color: #1d2129;
  font-weight: 500;
}

.rule-card__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e5e6eb;
}

.empty-rules {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .rules-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .rules-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .rule-card {
    padding: 12px;
  }
  
  .rule-card__content {
    margin-left: 12px;
    margin-right: 20px;
  }
  
  .rule-name {
    font-size: 14px;
  }
  
  .rule-card__description {
    font-size: 12px;
  }
  
  .conditions-text {
    font-size: 12px;
  }
  
  .batch-actions {
    padding: 8px 12px;
  }
}
</style>