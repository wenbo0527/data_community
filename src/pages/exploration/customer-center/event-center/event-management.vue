<template>
  <div class="event-management">
    <!-- 专业桌面端操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <h1 class="page-title">事件管理</h1>
        <div class="page-stats">
          <span class="stat-item">总计: {{ totalEvents }}</span>
          <span class="stat-item">在线: {{ onlineEvents }}</span>
          <span class="stat-item">离线: {{ offlineEvents }}</span>
        </div>
      </div>
      <div class="action-right">
        <div class="search-area">
          <a-input 
            v-model="searchKeyword" 
            placeholder="搜索事件名称、描述或所有者"
            allow-clear
            style="width: 300px"
            @change="handleSearch"
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </div>
        <div class="filter-area">
          <a-select 
            v-model="eventTypeFilter" 
            placeholder="事件类型"
            style="width: 120px"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="">全部类型</a-option>
            <a-option value="系统事件">系统事件</a-option>
            <a-option value="业务事件">业务事件</a-option>
            <a-option value="用户事件">用户事件</a-option>
            <a-option value="营销事件">营销事件</a-option>
            <a-option value="风控事件">风控事件</a-option>
          </a-select>
          <a-select 
            v-model="statusFilter" 
            placeholder="状态"
            style="width: 100px"
            allow-clear
            @change="handleFilter"
          >
            <a-option value="">全部状态</a-option>
            <a-option value="上线">上线</a-option>
            <a-option value="下线">下线</a-option>
          </a-select>
        </div>
        <div class="button-area">
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            新建事件
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button @click="handleBatchOperation">
            <template #icon><icon-download /></template>
            批量导出
          </a-button>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <a-table
        :data="filteredEvents"
        :loading="loading"
        :pagination="paginationConfig"
        row-key="id"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <!-- 选择列 -->
        <template #columns>
          <a-table-column type="selection" width="50" />
          
          <!-- 事件信息列 -->
          <a-table-column title="事件信息" data-index="eventName" width="200">
            <template #cell="{ record }">
              <div class="event-info">
                <div class="event-name">{{ record.eventName }}</div>
                <div class="event-id">{{ record.id }}</div>
              </div>
            </template>
          </a-table-column>
          
          <!-- 事件类型列 -->
          <a-table-column title="事件类型" data-index="eventType" width="120">
            <template #cell="{ record }">
              <a-tag :color="getEventTypeColor(record.eventType)">
                {{ record.eventType }}
              </a-tag>
            </template>
          </a-table-column>
          
          <!-- 事件来源列 -->
          <a-table-column title="事件来源" data-index="eventSource" width="100">
            <template #cell="{ record }">
              <span class="event-source">{{ record.eventSource }}</span>
            </template>
          </a-table-column>
          
          <!-- 触发条件列 -->
          <a-table-column title="触发条件" data-index="triggerCondition" width="200">
            <template #cell="{ record }">
              <div class="trigger-condition" :title="record.triggerCondition">
                {{ record.triggerCondition }}
              </div>
            </template>
          </a-table-column>
          
          <!-- 状态列 -->
          <a-table-column title="状态" data-index="status" width="80">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.status === '上线'"
                @change="(value) => handleStatusChange(record, value)"
              />
            </template>
          </a-table-column>
          
          <!-- 所有者列 -->
          <a-table-column title="所有者" data-index="owner" width="100">
            <template #cell="{ record }">
              <div class="owner-info">
                <a-avatar :size="24">
                  {{ record.owner.charAt(0) }}
                </a-avatar>
                <span class="owner-name">{{ record.owner }}</span>
              </div>
            </template>
          </a-table-column>
          
          <!-- 创建时间列 -->
          <a-table-column title="创建时间" data-index="createTime" width="160">
            <template #cell="{ record }">
              <div class="create-time">
                {{ formatDate(record.createTime) }}
              </div>
            </template>
          </a-table-column>
          
          <!-- 操作列 -->
          <a-table-column title="操作" fixed="right" width="200">
            <template #cell="{ record }">
              <div class="action-buttons">
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="handleTest(record)">
                  <template #icon><icon-play-circle /></template>
                  测试
                </a-button>
                <a-popconfirm
                  content="确定要删除此事件吗？"
                  @ok="handleDelete(record)"
                >
                  <a-button type="text" size="small" status="danger">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 创建/编辑事件模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <event-form
        v-if="modalVisible"
        :event-data="currentEvent"
        @submit="handleFormSubmit"
        @cancel="handleModalCancel"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch,
  IconPlus,
  IconRefresh,
  IconDownload,
  IconEdit,
  IconDelete,
  IconPlayCircle
} from '@arco-design/web-vue/es/icon'
import { mockEventAPI } from '@/mock/event'
import EventForm from './components/EventForm.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const events = ref([])
const searchKeyword = ref('')
const eventTypeFilter = ref('')
const statusFilter = ref('')
const selectedRows = ref([])
const modalVisible = ref(false)
const modalTitle = ref('')
const currentEvent = ref(null)

// 分页配置
const paginationConfig = reactive({
  total: 0,
  current: 1,
  pageSize: 20,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 计算属性
const filteredEvents = computed(() => {
  let filtered = events.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(event => 
      event.eventName.toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword) ||
      event.owner.toLowerCase().includes(keyword)
    )
  }

  // 事件类型过滤
  if (eventTypeFilter.value) {
    filtered = filtered.filter(event => event.eventType === eventTypeFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(event => event.status === statusFilter.value)
  }

  return filtered
})

const totalEvents = computed(() => events.value.length)
const onlineEvents = computed(() => events.value.filter(e => e.status === '上线').length)
const offlineEvents = computed(() => events.value.filter(e => e.status === '下线').length)

// 方法
const loadEvents = async () => {
  loading.value = true
  try {
    const data = await mockEventAPI.getEvents()
    events.value = data
    paginationConfig.total = data.length
    Message.success('事件数据加载成功')
  } catch (error) {
    Message.error('事件数据加载失败')
    console.error('加载事件数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleFilter = () => {
  // 过滤逻辑已在computed中处理
}

const handleCreate = () => {
  currentEvent.value = null
  modalTitle.value = '创建事件'
  modalVisible.value = true
}

const handleEdit = (record) => {
  currentEvent.value = { ...record }
  modalTitle.value = '编辑事件'
  modalVisible.value = true
}

const handleTest = (record) => {
  // 跳转到样本统计页面
  router.push({
    path: '/exploration/customer-center/event-center/sample-stats',
    query: { eventId: record.id, eventName: record.eventName }
  })
}

const handleDelete = async (record) => {
  loading.value = true
  try {
    await mockEventAPI.deleteEvent(record.id)
    Message.success('事件删除成功')
    await loadEvents()
  } catch (error) {
    Message.error('事件删除失败')
    console.error('删除事件失败:', error)
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (record, value) => {
  const newStatus = value ? '上线' : '下线'
  try {
    await mockEventAPI.updateEvent(record.id, { status: newStatus })
    record.status = newStatus
    Message.success(`事件已${newStatus}`)
  } catch (error) {
    Message.error('状态更新失败')
    console.error('更新事件状态失败:', error)
  }
}

const handleRefresh = () => {
  loadEvents()
}

const handleBatchOperation = () => {
  if (selectedRows.value.length === 0) {
    Message.warning('请先选择要导出的数据')
    return
  }
  Message.info('批量导出功能开发中...')
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handlePageChange = (page) => {
  paginationConfig.current = page
}

const handlePageSizeChange = (pageSize) => {
  paginationConfig.pageSize = pageSize
  paginationConfig.current = 1
}

const handleModalOk = () => {
  // 表单提交逻辑在EventForm组件中处理
}

const handleModalCancel = () => {
  modalVisible.value = false
  currentEvent.value = null
}

const handleFormSubmit = async (formData) => {
  try {
    if (currentEvent.value) {
      // 编辑模式
      await mockEventAPI.updateEvent(currentEvent.value.id, formData)
      Message.success('事件更新成功')
    } else {
      // 创建模式
      await mockEventAPI.createEvent(formData)
      Message.success('事件创建成功')
    }
    modalVisible.value = false
    await loadEvents()
  } catch (error) {
    Message.error('操作失败')
    console.error('保存事件失败:', error)
  }
}

// 工具函数
const getEventTypeColor = (type) => {
  const colorMap = {
    '系统事件': 'blue',
    '业务事件': 'green',
    '用户事件': 'orange',
    '营销事件': 'purple',
    '风控事件': 'red'
  }
  return colorMap[type] || 'gray'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadEvents()
})
</script>

<script>
export default {
  name: 'EventManagement'
}
</script>

<style scoped>
.event-management {
  height: 100%;
  background: #F2F3F5;
  display: flex;
  flex-direction: column;
}

/* 操作栏样式 */
.action-bar {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.page-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 14px;
  color: #4E5969;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-area {
  display: flex;
  align-items: center;
}

.filter-area {
  display: flex;
  gap: 8px;
}

.button-area {
  display: flex;
  gap: 8px;
}

/* 表格容器 */
.table-container {
  flex: 1;
  background: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: auto;
}

/* 表格样式优化 */
:deep(.arco-table) {
  border-radius: 8px;
}

:deep(.arco-table-th) {
  background: #F2F3F5 !important;
  font-weight: 600;
  color: #1D2129;
}

/* 事件信息样式 */
.event-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-name {
  font-weight: 500;
  color: #1D2129;
  font-size: 14px;
}

.event-id {
  font-size: 12px;
  color: #8A8E99;
  font-family: monospace;
}

/* 触发条件样式 */
.trigger-condition {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4E5969;
  font-size: 13px;
}

/* 所有者信息样式 */
.owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-size: 14px;
  color: #1D2129;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .arco-btn {
  padding: 4px 8px;
  font-size: 13px;
}

/* 事件来源样式 */
.event-source {
  font-size: 13px;
  color: #4E5969;
}

/* 创建时间样式 */
.create-time {
  font-size: 13px;
  color: #4E5969;
  font-family: monospace;
}

/* 专业桌面端优化 */
@media screen and (min-width: 1920px) {
  .action-bar {
    padding: 24px 32px;
  }
  
  .table-container {
    margin: 24px;
  }
}

/* 响应式调整 */
@media screen and (max-width: 1440px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .action-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>