<template>
  <div class="notification-list-container">
    <a-card class="list-card">
      <template #title>
        <div class="list-header">
          <a-breadcrumb>
            <a-breadcrumb-item @click="$router.push('/home')">首页</a-breadcrumb-item>
            <a-breadcrumb-item>通知管理</a-breadcrumb-item>
          </a-breadcrumb>
          <h2>通知管理</h2>
          <p class="header-description">管理系统通知、公告和社区动态</p>
        </div>
      </template>

      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            新增内容
          </a-button>
        </a-space>
      </template>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-select 
              v-model="filters.categoryId" 
              placeholder="一级分类" 
              allow-clear
              @change="() => { filters.type = ''; handleFilterChange(); }"
            >
              <a-option value="">全部一级分类</a-option>
              <a-option 
                v-for="category in firstLevelCategories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select 
              v-model="filters.type" 
              placeholder="二级分类" 
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="">全部二级分类</a-option>
              <a-option 
                v-for="type in secondLevelTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select 
              v-model="filters.status" 
              placeholder="发布状态" 
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="">全部状态</a-option>
              <a-option value="draft">草稿</a-option>
              <a-option value="published">已发布</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-input-search 
              v-model="filters.keyword" 
              placeholder="搜索标题或内容..."
              @search="handleSearch"
              @clear="handleSearch"
            />
          </a-col>
        </a-row>
      </div>



      <!-- 通知列表 -->
      <a-table
        :columns="columns"
        :data="filteredNotifications"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #title="{ record }">
          <div class="notification-title">
            <a-space>
              <component :is="getNoticeTypeIcon(record.type)" />
              <span>{{ record.title }}</span>
              <a-tag 
                v-if="record.isSticky" 
                color="red" 
                size="small"
              >
                置顶
              </a-tag>
            </a-space>
          </div>
        </template>

        <template #type="{ record }">
          <a-tag :color="getNoticeTypeColor(record.type)" size="small">
            {{ getNoticeTypeLabel(record.type) }}
          </a-tag>
        </template>

        <template #category="{ record }">
          {{ getCategoryLabel(record.categoryId) }}
        </template>

        <template #status="{ record }">
          <StatusTag :status="record.status" dictKey="notification" />
        </template>

        <template #publishTime="{ record }">
          <div>
            <div>{{ DateUtils.formatDate(record.publishTime || record.createdAt) }}</div>
            <div class="meta-info">{{ record.author }}</div>
          </div>
        </template>

        <template #stats="{ record }">
          <a-space direction="vertical" size="mini">
            <span><IconEye /> {{ record.views }}</span>
            <span v-if="record.allowComments">
              <IconMessage /> {{ record.commentCount || 0 }}
            </span>
          </a-space>
        </template>

        <template #actions="{ record }">
          <a-space>
            <TableActions
              :actions="[
                { key: 'view', label: '查看', icon: IconEye },
                { key: 'edit', label: '编辑', icon: IconEdit }
              ]"
              :row="record"
              @action="onRowAction"
            />
            <a-dropdown @select="(value: string) => handleAction(value, record)">
              <a-button type="text" size="small">
                <template #icon><IconMore /></template>
                更多
              </a-button>
              <template #content>
                <a-doption value="copy">
                  <template #icon><IconCopy /></template>
                  复制
                </a-doption>
                <a-doption v-if="!record.isSticky" value="stick">
                  <template #icon><IconPushpin /></template>
                  置顶
                </a-doption>
                <a-doption v-else value="unstick">
                  <template #icon><IconPushpin /></template>
                  取消置顶
                </a-doption>
                <a-doption v-if="record.status === 'published'" value="recall">
                  <template #icon><IconStop /></template>
                  撤回通知
                </a-doption>
                <a-doption v-if="record.status === 'published'" value="unpublish">
                  <template #icon><IconStop /></template>
                  取消发布
                </a-doption>
                <a-doption v-else-if="record.status === 'draft'" value="publish">
                  <template #icon><IconSend /></template>
                  立即发布
                </a-doption>
                <a-doption value="delete" class="danger-option">
                  <template #icon><IconDelete /></template>
                  删除
                </a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 查看通知详情弹窗 -->
    <a-modal
      v-model:visible="viewModalVisible"
      title="通知详情"
      :width="800"
      :footer="false"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-header">
          <h3>{{ selectedNotification.title }}</h3>
          <a-space>
            <a-tag color="blue">
              {{ getCategoryLabel(selectedNotification.categoryId) }}
            </a-tag>
            <a-tag :color="getNoticeTypeColor(selectedNotification.type)">
              {{ getNoticeTypeLabel(selectedNotification.type) }}
            </a-tag>
          </a-space>
        </div>
        
        <div class="detail-meta">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="发布时间">
              {{ DateUtils.formatDateTime(selectedNotification.publishTime || selectedNotification.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="作者">
              {{ selectedNotification.author }}
            </a-descriptions-item>
            <a-descriptions-item label="查看次数">
              {{ selectedNotification.views }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div v-if="selectedNotification.summary" class="detail-summary">
          <h4>摘要</h4>
          <p>{{ selectedNotification.summary }}</p>
        </div>

        <div class="detail-content">
          <h4>内容</h4>
          <div class="content-html" v-html="renderContent(selectedNotification.content)"></div>
        </div>

        <div v-if="selectedNotification.attachments?.length" class="detail-attachments">
          <h4>附件</h4>
          <a-list :data="selectedNotification.attachments" size="small">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <IconFile />
                  </template>
                  <template #title>
                    <a :href="item.fileUrl" target="_blank">{{ item.fileName }}</a>
                  </template>
                  <template #description>
                    {{ item.fileSize }} • {{ DateUtils.formatDate(item.uploadTime) }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconMore,
  IconCopy,
  IconPushpin,
  IconStop,
  IconSend,
  IconDelete,
  IconMessage,
  IconNotification,
  IconSafe,
  IconBulb,
  IconBook,
  IconFile
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI, CategoryAPI } from '@/api/notification'
import type { Notification, NotificationType, Category } from '@/types/notification'

import { 
  getNoticeTypeLabel, 
  getNoticeTypeColor, 
  getNoticeTypeIcon,
  NOTICE_TYPE_OPTIONS,
  ARCHIVE_CATEGORY_TREE,
  getCategoryLabel
} from '@/constants/notification'
import StatusTag from '@/components/common/StatusTag.vue'
import TableActions from '@/components/common/TableActions.vue'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()

// 响应式数据
const notificationList = ref<Notification[]>([])
const loading = ref(false)
const viewModalVisible = ref(false)
const selectedNotification = ref<Notification | null>(null)

// 筛选条件
const filters = reactive({
  type: '',
  categoryId: '',
  status: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 归档分类数据
const categoryOptions = ARCHIVE_CATEGORY_TREE

// 一级分类选项
const firstLevelCategories = computed(() => {
  return categoryOptions.map(cat => ({
    id: cat.value,
    name: cat.label
  }))
})

// 二级分类选项 (根据所选的一级分类动态变化)
const secondLevelTypes = computed(() => {
  if (!filters.categoryId) {
    // 如果没选一级分类，显示所有二级分类
    const allTypes: any[] = []
    categoryOptions.forEach(cat => {
      cat.children.forEach(child => {
        allTypes.push({
          value: child.value,
          label: child.label
        })
      })
    })
    return allTypes
  }
  
  const selectedCat = categoryOptions.find(cat => cat.value === filters.categoryId)
  return selectedCat ? selectedCat.children.map(child => ({
    value: child.value,
    label: child.label
  })) : []
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      category: filters.categoryId || undefined,
      type: filters.type || undefined,
      status: (filters.status as any) || undefined,
      keyword: filters.keyword || undefined
    }
    const response = await NotificationAPI.getNotifications(params)
    if (response.success) {
      notificationList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    Message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选后的通知列表 (不再需要 computed，改为 fetchData)
const filteredNotifications = computed(() => notificationList.value)

// 表格列定义
const columns = [
  { title: '通知标题', dataIndex: 'title', slotName: 'title', width: 300 },
  { title: '一级分类', dataIndex: 'categoryId', slotName: 'category', width: 120 },
  { title: '二级分类', dataIndex: 'type', slotName: 'type', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '发布信息', dataIndex: 'createdAt', slotName: 'publishTime', width: 150 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 200, fixed: 'right' }
]

// 方法
const getStatusName = (notification: Notification): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return statusMap[notification.status] || '未知'
}

const onRowAction = (e: { key: string, row: Notification }) => {
  if (e.key === 'view') handleView(e.row)
  else if (e.key === 'edit') handleEdit(e.row)
}

const renderContent = (content: string): string => {
  if (!content) return ''
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
}

const handleCreate = () => {
  router.push('/notification/create')
}

const handleView = (notification: Notification) => {
  selectedNotification.value = notification
  viewModalVisible.value = true
}

const handleEdit = (notification: Notification) => {
  router.push(`/notification/edit/${notification.id}`)
}

const handleAction = async (action: string, notification: Notification) => {
  switch (action) {
    case 'copy':
      router.push(`/notification/create?copy=${notification.id}`)
      break
    case 'stick':
    case 'unstick':
      try {
        await NotificationAPI.updateNotification(notification.id, { isTop: action === 'stick' } as any)
        Message.success(action === 'stick' ? '置顶成功' : '取消置顶成功')
        fetchData()
      } catch (error) {
        Message.error('操作失败')
      }
      break
    case 'publish':
      try {
        await NotificationAPI.publishNotification(notification.id)
        Message.success('发布成功')
        fetchData()
      } catch (error) {
        Message.error('发布失败')
      }
      break
    case 'recall':
      Modal.confirm({
        title: '确认撤回',
        content: `确定要撤回通知"${notification.title}"吗？撤回后通知将不再对用户可见。`,
        onOk: async () => {
          try {
            await NotificationAPI.updateNotification(notification.id, { status: 'draft' })
            Message.success('撤回成功')
            fetchData()
          } catch (error) {
            Message.error('撤回失败')
          }
        }
      })
      break
    case 'unpublish':
      try {
        await NotificationAPI.updateNotification(notification.id, { status: 'draft' })
        Message.success('取消发布成功')
        fetchData()
      } catch (error) {
        Message.error('操作失败')
      }
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除通知"${notification.title}"吗？此操作不可恢复。`,
        onOk: async () => {
          try {
            await NotificationAPI.deleteNotification(notification.id)
            Message.success('删除成功')
            fetchData()
          } catch (error) {
            Message.error('删除失败')
          }
        }
      })
      break
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  fetchData()
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchData()
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.notification-list-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.list-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header h2 {
  margin: 8px 0 4px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.header-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.stats-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.notification-title {
  display: flex;
  align-items: center;
}

.meta-info {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.danger-option {
  color: #f53f3f;
}

.notification-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.detail-header h3 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 18px;
  font-weight: 600;
}

.detail-meta {
  margin-bottom: 16px;
}

.detail-summary {
  margin-bottom: 16px;
}

.detail-summary h4,
.detail-content h4,
.detail-attachments h4 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 14px;
  font-weight: 600;
}

.detail-summary p {
  margin: 0;
  color: #4e5969;
  line-height: 1.5;
}

.content-html {
  color: #4e5969;
  line-height: 1.6;
}

.content-html :deep(h3),
.content-html :deep(h4),
.content-html :deep(h5) {
  margin: 16px 0 8px 0;
  color: #1d2129;
}

.content-html :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.content-html :deep(li) {
  margin: 4px 0;
}

.content-html :deep(a) {
  color: #165dff;
  text-decoration: none;
}

.content-html :deep(a:hover) {
  text-decoration: underline;
}

.detail-attachments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}
</style>
