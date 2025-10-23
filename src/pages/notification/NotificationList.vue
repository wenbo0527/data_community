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
              v-model="filters.type" 
              placeholder="通知类型" 
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="">全部类型</a-option>
              <a-option 
                v-for="type in notificationTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select 
              v-model="filters.categoryId" 
              placeholder="所属分类" 
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="">全部分类</a-option>
              <a-option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
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
              <component :is="getTypeIcon(record.type)" />
              <span>{{ record.title }}</span>
              <a-tag 
                v-if="record.isSticky" 
                color="red" 
                size="small"
              >
                置顶
              </a-tag>
              <a-tag 
                v-if="record.priority && record.priority !== 'medium'" 
                :color="getPriorityColor(record.priority)" 
                size="small"
              >
                {{ getPriorityName(record.priority) }}
              </a-tag>
            </a-space>
          </div>
        </template>

        <template #type="{ record }">
          <a-tag :color="getTypeColor(record.type)" size="small">
            {{ getTypeName(record.type) }}
          </a-tag>
        </template>

        <template #category="{ record }">
          <span>{{ getCategoryName(record.categoryId) }}</span>
        </template>

        <template #status="{ record }">
          <a-tag :color="getStatusColor(record)" size="small">
            {{ getStatusName(record) }}
          </a-tag>
        </template>

        <template #publishTime="{ record }">
          <div>
            <div>{{ formatDate(record.publishTime || record.createdAt) }}</div>
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
            <a-button 
              type="text" 
              size="small" 
              @click="handleView(record)"
            >
              <template #icon><IconEye /></template>
              查看
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="handleEdit(record)"
            >
              <template #icon><IconEdit /></template>
              编辑
            </a-button>
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
                <a-doption 
                  v-if="!record.isSticky" 
                  value="stick"
                >
                  <template #icon><IconPushpin /></template>
                  置顶
                </a-doption>
                <a-doption 
                  v-else 
                  value="unstick"
                >
                  <template #icon><IconPushpin /></template>
                  取消置顶
                </a-doption>
                <a-doption 
                  v-if="getStatusName(record) === '已发布'" 
                  value="recall"
                >
                  <template #icon><IconStop /></template>
                  撤回通知
                </a-doption>
                <a-doption 
                  v-if="getStatusName(record) === '已发布'" 
                  value="unpublish"
                >
                  <template #icon><IconStop /></template>
                  取消发布
                </a-doption>
                <a-doption 
                  v-else-if="getStatusName(record) === '草稿'" 
                  value="publish"
                >
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
            <a-tag :color="getTypeColor(selectedNotification.type)">
              {{ getTypeName(selectedNotification.type) }}
            </a-tag>
            <a-tag color="blue">
              {{ getCategoryName(selectedNotification.categoryId) }}
            </a-tag>
          </a-space>
        </div>
        
        <div class="detail-meta">
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="发布时间">
              {{ formatDateTime(selectedNotification.publishTime || selectedNotification.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="作者">
              {{ selectedNotification.author }}
            </a-descriptions-item>
            <a-descriptions-item label="查看次数">
              {{ selectedNotification.views }}
            </a-descriptions-item>
            <a-descriptions-item label="优先级">
              {{ getPriorityName(selectedNotification.priority) }}
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
                    {{ item.fileSize }} • {{ formatDate(item.uploadTime) }}
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
import type { Notification, NotificationType } from '@/types/community'
import mockData from '@/mock/community'

const router = useRouter()

// 响应式数据
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

// 通知类型选项
const notificationTypes = [
  { value: 'announcement', label: '公告通知' },
  { value: 'activity', label: '活动通知' },
  { value: 'update', label: '更新通知' },
  { value: 'policy_notice', label: '政策通知' }
]

// 分类选项
const categories = computed(() => mockData.categories)



// 筛选后的通知列表
const filteredNotifications = computed(() => {
  let result = [...mockData.notifications]

  // 类型筛选
  if (filters.type) {
    result = result.filter(n => n.type === filters.type)
  }

  // 分类筛选
  if (filters.categoryId) {
    result = result.filter(n => n.categoryId === filters.categoryId)
  }

  // 状态筛选
  if (filters.status) {
    result = result.filter(n => {
      const status = getStatusName(n)
      return (
        (filters.status === 'draft' && status === '草稿') ||
        (filters.status === 'published' && status === '已发布') ||
        (filters.status === 'expired' && status === '已过期')
      )
    })
  }

  // 关键词搜索
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(n => 
      n.title.toLowerCase().includes(keyword) ||
      (n.summary || '').toLowerCase().includes(keyword) ||
      n.content.toLowerCase().includes(keyword)
    )
  }

  // 更新分页总数
  pagination.total = result.length

  // 分页
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return result.slice(start, end)
})

// 表格列定义
const columns = [
  { title: '通知标题', dataIndex: 'title', slotName: 'title', width: 300 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '所属分类', dataIndex: 'categoryId', slotName: 'category', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '发布信息', dataIndex: 'publishTime', slotName: 'publishTime', width: 150 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 200, fixed: 'right' }
]

// 方法
const getTypeIcon = (type: NotificationType) => {
  const iconMap = {
    announcement: IconNotification,
    activity: IconBulb,
    update: IconBook,
    policy_notice: IconSafe
  }
  return iconMap[type] || IconNotification
}

const getTypeColor = (type: NotificationType): string => {
  const colorMap = {
    announcement: 'red',
    activity: 'blue',
    update: 'green',
    policy_notice: 'orange'
  }
  return colorMap[type] || 'gray'
}

const getTypeName = (type: NotificationType): string => {
  const nameMap = {
    announcement: '公告',
    activity: '活动',
    update: '更新',
    policy_notice: '政策通知'
  }
  return nameMap[type] || '通知'
}

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((c: any) => c.id === categoryId)
  return category?.name || '未知分类'
}

const getStatusName = (notification: Notification): string => {
  const now = new Date()
  const publishTime = notification.publishTime ? new Date(notification.publishTime) : new Date(notification.createdAt)
  const expireTime = notification.expireTime ? new Date(notification.expireTime) : null

  if (!notification.publishTime && notification.status === 'draft') {
    return '草稿'
  }
  
  if (expireTime && now > expireTime) {
    return '已过期'
  }
  
  if (publishTime > now) {
    return '待发布'
  }
  
  return '已发布'
}

const getStatusColor = (notification: Notification): string => {
  const status = getStatusName(notification)
  const colorMap: Record<string, string> = {
    '草稿': 'orange',
    '待发布': 'blue',
    '已发布': 'green',
    '已过期': 'red'
  }
  return colorMap[status] || 'gray'
}

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    urgent: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'gray'
  }
  return colorMap[priority] || 'gray'
}

const getPriorityName = (priority: string): string => {
  const nameMap: Record<string, string> = {
    urgent: '紧急',
    high: '重要',
    medium: '普通',
    low: '一般'
  }
  return nameMap[priority] || priority
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const renderContent = (content: string): string => {
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
  router.push(`/notification/detail/${notification.id}`)
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
      Message.success(action === 'stick' ? '置顶成功' : '取消置顶成功')
      break
    case 'publish':
      Message.success('发布成功')
      break
    case 'recall':
      Modal.confirm({
        title: '确认撤回',
        content: `确定要撤回通知"${notification.title}"吗？撤回后通知将不再对用户可见。`,
        onOk: () => {
          Message.success('撤回成功')
        }
      })
      break
    case 'unpublish':
      Message.success('取消发布成功')
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除通知"${notification.title}"吗？此操作不可恢复。`,
        onOk: () => {
          Message.success('删除成功')
        }
      })
      break
  }
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleSearch = () => {
  pagination.current = 1
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

// 生命周期
onMounted(() => {
  // 初始化数据
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