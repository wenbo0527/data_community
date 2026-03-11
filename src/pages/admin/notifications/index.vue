<template>
  <div class="notification-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">通知管理</h1>
        <p class="page-description">管理系统通知和公告信息</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-radio-group v-model="viewMode" type="button">
            <a-radio value="table">
              <template #icon><IconList /></template>
              表格
            </a-radio>
            <a-radio value="list">
              <template #icon><IconApps /></template>
              卡片
            </a-radio>
          </a-radio-group>
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            新建通知
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><IconRefresh /></template>
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <a-card class="search-card">
      <a-form :model="searchForm" layout="inline" @submit="handleSearch">
        <a-form-item field="keyword" label="关键词">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索标题、内容或标签"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select
            v-model="searchForm.status"
            placeholder="全部状态"
            style="width: 120px"
            allow-clear
          >
            <a-option value="draft">草稿</a-option>
            <a-option value="pending">待审批</a-option>
            <a-option value="published">已发布</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="categoryId" label="分类">
          <a-select
            v-model="searchForm.categoryId"
            placeholder="全部分类"
            style="width: 120px"
            allow-clear
          >
            <a-option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="type" label="类型">
          <a-select
            v-model="searchForm.type"
            placeholder="全部类型"
            style="width: 120px"
            allow-clear
          >
            <a-option
              v-for="(label, value) in NOTICE_TYPE_MAP"
              :key="value"
              :value="value"
            >
              {{ label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据内容 -->
    <a-card class="table-card">
      <template #title>
        <div class="table-header">
          <span>通知列表</span>
          <a-space v-if="selectedRowKeys.length > 0 && viewMode === 'table'">
            <span class="selected-info">已选择 {{ selectedRowKeys.length }} 项</span>
            <a-button size="small" status="danger" @click="handleBatchDelete">
              批量删除
            </a-button>
          </a-space>
        </div>
      </template>

      <!-- 表格视图 -->
      <a-table
        v-if="viewMode === 'table'"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #title="{ record }">
          <div class="title-cell">
            <a-link @click="handleView(record.id)">{{ record.title }}</a-link>
            <a-tag v-if="record.isTop" color="red" size="small" style="margin-left: 8px">
              置顶
            </a-tag>
          </div>
        </template>

        <template #category="{ record }">
          <a-tag :color="record.category?.color || 'blue'">
            {{ record.category?.name || '未分类' }}
          </a-tag>
        </template>

        <template #type="{ record }">
          <a-tag :color="getNoticeTypeColor(record.type)" bordered>
            {{ getNoticeTypeLabel(record.type) }}
          </a-tag>
        </template>

        <template #status="{ record }">
          <StatusTag :status="record.status" dictKey="notification" />
        </template>

        <template #publishTime="{ record }">
          <span v-if="record.publishTime">
            {{ DateUtils.formatDateTime(record.publishTime) }}
          </span>
          <span v-else class="text-gray">未发布</span>
        </template>

        <template #viewCount="{ record }">
          <a-space>
            <IconEye />
            <span>{{ record.viewCount || 0 }}</span>
          </a-space>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button 
              v-if="record.status === 'pending'" 
              type="text" 
              size="small" 
              @click="handleApprove(record)"
            >
              审批
            </a-button>
            <a-button type="text" size="small" @click="handleEdit(record.id)">
              编辑
            </a-button>
            <a-dropdown>
              <a-button type="text" size="small">
                更多
                <IconDown />
              </a-button>
              <template #content>
                <a-doption @click="handleToggleTop(record)">
                  {{ record.isTop ? '取消置顶' : '设为置顶' }}
                </a-doption>
                <a-doption
                  v-if="record.status === 'draft'"
                  @click="handlePublish(record)"
                >
                  发布
                </a-doption>
                <a-doption
                  v-if="record.status === 'published'"
                  @click="handleArchive(record)"
                >
                  归档
                </a-doption>
                <a-doption @click="handleCopy(record)">
                  复制
                </a-doption>
                <a-doption class="danger" @click="handleDelete(record)">
                  删除
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>

      <!-- 列表视图 (对齐首页样式) -->
      <div v-else class="list-view-container">
        <a-list :loading="loading" :bordered="false">
          <a-list-item 
            v-for="item in tableData" 
            :key="item.id"
            class="admin-notice-list-item"
          >
            <div class="notice-item-inner" @click="handleView(item.id)">
              <div class="notice-left-bar" :style="{ backgroundColor: getStatusColor(item.status) === 'gray' ? '#86909c' : (getStatusColor(item.status) === 'green' ? '#00b42a' : '#165dff') }"></div>
              <div class="notice-content-wrapper">
                <div class="notice-header-row">
                  <div class="notice-title-text">
                    {{ item.title }}
                    <a-tag v-if="item.isTop" color="red" size="small" style="margin-left: 8px">置顶</a-tag>
                  </div>
                  <div class="notice-actions" @click.stop>
                    <a-space>
                      <a-button type="text" size="small" @click="handleEdit(item.id)">
                        <template #icon><IconEdit /></template>
                        编辑
                      </a-button>
                      <a-dropdown>
                        <a-button type="text" size="small">
                          更多 <IconDown />
                        </a-button>
                        <template #content>
                          <a-doption @click="handleToggleTop(item)">{{ item.isTop ? '取消置顶' : '设为置顶' }}</a-doption>
                          <a-doption v-if="item.status === 'draft'" @click="handlePublish(item)">发布</a-doption>
                          <a-doption v-if="item.status === 'published'" @click="handleArchive(item)">归档</a-doption>
                          <a-doption @click="handleCopy(item)">复制</a-doption>
                          <a-doption class="danger" @click="handleDelete(item)">删除</a-doption>
                        </template>
                      </a-dropdown>
                    </a-space>
                  </div>
                </div>
                <div class="notice-info-row">
                  <a-space size="medium">
                    <a-tag size="small" :color="item.category?.color || 'blue'" bordered class="notice-tag">
                      <template #icon><IconTag /></template>
                      {{ item.category?.name || '未分类' }}
                    </a-tag>
                    <StatusTag :status="item.status" dictKey="notification" />
                    <span class="notice-meta-item">
                      <IconEye /> {{ item.viewCount || 0 }}
                    </span>
                    <span class="notice-meta-item">
                      <IconClockCircle /> {{ DateUtils.formatDateTime(item.publishTime || item.createdAt) }}
                    </span>
                    <span class="notice-meta-item">
                      创建人: {{ item.createdBy }}
                    </span>
                  </a-space>
                </div>
              </div>
            </div>
          </a-list-item>
        </a-list>
        
        <div class="pagination-wrapper">
          <a-pagination
            :current="pagination.current"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            show-total
            show-jumper
            @change="handlePageChange"
          />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconRefresh,
  IconEye,
  IconDown,
  IconList,
  IconApps,
  IconEdit,
  IconDelete,
  IconClockCircle,
  IconTag
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI, CategoryAPI } from '../../../api/notification'
import { 
  NOTICE_TYPE_MAP, 
  getNoticeTypeLabel, 
  getNoticeTypeColor 
} from '@/constants/notification'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()

// 视图模式：table (表格), list (列表)
const viewMode = ref('table')

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const categories = ref([])
const selectedRowKeys = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  categoryId: '',
  type: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 表格列配置
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    slotName: 'title',
    width: 300,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    slotName: 'category',
    width: 100
  },
  {
    title: '类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },

  {
    title: '发布时间',
    dataIndex: 'publishTime',
    slotName: 'publishTime',
    width: 160
  },
  {
    title: '浏览量',
    dataIndex: 'viewCount',
    slotName: 'viewCount',
    width: 80
  },
  {
    title: '创建人',
    dataIndex: 'createdBy',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 行选择配置
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
})

// 方法定义
const fetchData = async () => {
  loading.value = true
  try {
    const { keyword, status, categoryId, type } = searchForm
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword,
      status,
      category: categoryId || undefined,
      type: type || undefined
    }
    
    const response = await NotificationAPI.getNotifications(params)
    
    if (response.success) {
      tableData.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    Message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await CategoryAPI.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchData()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchData()
}

const handleCreate = () => {
  router.push('/admin/notifications/create')
}

const handleView = (id) => {
  router.push(`/admin/notifications/detail/${id}`)
}

const handleEdit = (id) => {
  router.push(`/admin/notifications/edit/${id}`)
}

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除通知"${record.title}"吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        const response = await NotificationAPI.deleteNotification(record.id)
        if (response.success) {
          Message.success('删除成功')
          fetchData()
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除通知失败:', error)
        Message.error('删除失败')
      }
    }
  })
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的通知')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条通知吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        const response = await NotificationAPI.batchDeleteNotifications(selectedRowKeys.value)
        if (response.success) {
          Message.success(response.message)
          selectedRowKeys.value = []
          fetchData()
        } else {
          Message.error(response.message || '批量删除失败')
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        Message.error('批量删除失败')
      }
    }
  })
}

const handleToggleTop = async (record) => {
  try {
    const response = await NotificationAPI.updateNotification(record.id, {
      isTop: !record.isTop
    })
    if (response.success) {
      Message.success(record.isTop ? '取消置顶成功' : '设为置顶成功')
      fetchData()
    } else {
      Message.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('切换置顶状态失败:', error)
    Message.error('操作失败')
  }
}

const handlePublish = async (record) => {
  try {
    const response = await NotificationAPI.updateNotification(record.id, {
      status: 'published'
    })
    if (response.success) {
      Message.success('发布成功')
      fetchData()
    } else {
      Message.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布通知失败:', error)
    Message.error('发布失败')
  }
}

const handleArchive = async (record) => {
  try {
    const response = await NotificationAPI.updateNotification(record.id, {
      status: 'archived'
    })
    if (response.success) {
      Message.success('归档成功')
      fetchData()
    } else {
      Message.error(response.message || '归档失败')
    }
  } catch (error) {
    console.error('归档通知失败:', error)
    Message.error('归档失败')
  }
}

const handleCopy = (record) => {
  router.push({
    path: '/admin/notifications/create',
    query: { copyFrom: record.id }
  })
}



// 工具方法
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'gray',
    pending: 'orange',
    published: 'green',
    archived: 'blue'
  }
  return colorMap[status] || 'gray'
}

 

// 生命周期
onMounted(() => {
  fetchCategories()
  fetchData()
})
</script>

<style scoped>
.notification-list-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.selected-info {
  color: #165dff;
  font-size: 14px;
}

.title-cell {
  display: flex;
  align-items: center;
}

.text-gray {
  color: #86909c;
}

.danger {
  color: #f53f3f !important;
}

:deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

:deep(.arco-table-td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.arco-table-tr:hover .arco-table-td) {
  background-color: #f7f8fa;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-form-item) {
  margin-bottom: 0;
}

/* 列表视图样式 - 对齐首页 */
.list-view-container {
  padding: 8px 0;
}

.admin-notice-list-item {
  padding: 0 !important;
  border-bottom: 1px solid #f2f3f5 !important;
  transition: all 0.2s;
}

.admin-notice-list-item:hover {
  background-color: #f7f8fa;
}

.notice-item-inner {
  display: flex;
  padding: 16px 20px;
  cursor: pointer;
  position: relative;
}

.notice-left-bar {
  width: 4px;
  height: 40px;
  background-color: #165dff;
  border-radius: 2px;
  margin-right: 16px;
  flex-shrink: 0;
  align-self: center;
}

.notice-content-wrapper {
  flex: 1;
  overflow: hidden;
}

.notice-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notice-title-text {
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-info-row {
  display: flex;
  align-items: center;
}

.notice-tag {
  border-radius: 2px;
}

.notice-meta-item {
  font-size: 13px;
  color: #86909c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.admin-notice-list-item:hover .notice-actions {
  opacity: 1;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 10px;
}
</style>
