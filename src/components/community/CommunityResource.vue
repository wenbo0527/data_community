<template>
  <a-layout class="community-resource-layout">
    <!-- 左侧树形导航栏 -->
    <a-layout-sider :width="280" class="community-sider">
      <div class="sider-header">
        <h3>社区资源</h3>
        <a-input-search 
          v-model="searchKeyword" 
          placeholder="搜索文档..." 
          size="small"
          style="margin-top: 12px;"
          @search="handleSearch"
        />
      </div>
      <div class="tree-container">
        <a-tree
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          @select="handleTreeSelect"
          @expand="handleTreeExpand"
          :show-line="true"
          :block-node="true"
        >
          <template #icon="{ node }">
            <component :is="node.isLeaf ? IconFile : IconFolder" />
          </template>
          <template #title="{ node }">
            <div class="tree-node-title">
              <span>{{ node.title }}</span>
              <span v-if="node.count" class="node-count">({{ node.count }})</span>
            </div>
          </template>
        </a-tree>
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout-content class="community-content">
      <!-- PDF查看器 -->
      <PDFViewer 
        v-if="selectedDocument"
        :title="selectedDocument.title"
        :file-url="selectedDocument.fileUrl || '/mock-pdf.pdf'"
        :file-name="selectedDocument.fileName"
        :file-size="selectedDocument.fileSize"
        :author="selectedDocument.author"
        :publish-time="selectedDocument.publishTime"
        :views="selectedDocument.views"
        :description="selectedDocument.description"
        @back="selectedDocument = null"
        @close="selectedDocument = null"
      />

      <!-- 通知详情弹窗 -->
      <a-modal
        v-model:visible="notificationModalVisible"
        title="通知详情"
        :width="800"
        :footer="false"
        class="notification-detail-modal"
      >
        <div v-if="selectedNotification" class="notification-detail">
          <div class="detail-header">
            <h3>{{ selectedNotification.title }}</h3>
            <a-space>
              <a-tag color="blue">
                {{ selectedNotification.category }}
              </a-tag>
              <a-tag v-if="selectedNotification.isSticky" color="red">
                置顶
              </a-tag>
            </a-space>
          </div>
          
          <div class="detail-meta">
            <a-descriptions :column="2" size="small">
              <a-descriptions-item label="发布时间">
                {{ formatDate(selectedNotification.publishTime || selectedNotification.createdAt) }}
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
                      {{ item.fileSize }} • {{ formatDate(item.uploadTime) }}
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>
      </a-modal>
      
      <!-- 文档列表页面 -->
      <div v-if="!selectedDocument" class="document-list-container">
        <div class="content-header">
          <div class="header-info">
            <h2>{{ currentPageInfo.title }}</h2>
            <p class="description">{{ currentPageInfo.description }}</p>
          </div>
          <div class="header-actions">
            <a-button 
              v-if="canManage" 
              type="primary" 
              @click="handleAdd"
            >
              <template #icon><IconPlus /></template>
              新增内容
            </a-button>
          </div>
        </div>

        <div class="content-body">
          <div class="filter-bar">
            <a-space>
              <a-select 
                v-model="sortBy" 
                placeholder="排序方式" 
                style="width: 120px;"
              >
                <a-option value="publishTime">发布时间</a-option>
                <a-option value="views">查看次数</a-option>
                <a-option value="title">标题</a-option>
              </a-select>
              <a-select 
                v-model="sortOrder" 
                placeholder="排序顺序" 
                style="width: 100px;"
              >
                <a-option value="desc">降序</a-option>
                <a-option value="asc">升序</a-option>
              </a-select>
            </a-space>
          </div>

          <a-list
            :data="filteredDocuments"
            :pagination="{ pageSize: 10 }"
            class="document-list"
          >
            <template #item="{ item }">
              <a-list-item class="document-item" @click="viewItem(item)">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar class="document-avatar">
                      <component :is="getItemIcon(item)" />
                    </a-avatar>
                  </template>
                  <template #title>
                    <div class="document-title">
                      <span class="title-text">{{ item.title }}</span>
                      <a-space size="small">
                        <a-tag 
                          v-if="item.category" 
                          color="blue" 
                          size="small"
                        >
                          {{ item.category }}
                        </a-tag>
                        <a-tag 
                          v-if="item.isSticky" 
                          color="red" 
                          size="small"
                        >
                          置顶
                        </a-tag>
                        <a-tag 
                          v-if="item.type && item.type !== 'document'" 
                          color="orange" 
                          size="small"
                        >
                          通知
                        </a-tag>
                      </a-space>
                    </div>
                  </template>
                  <template #description>
                    <div class="document-description">
                      <p>{{ item.description || item.summary }}</p>
                      <div v-if="item.fileName" class="pdf-info">
                        <a-space>
                          <IconFile />
                          <span>{{ item.fileName }}</span>
                          <span class="file-size">{{ item.fileSize }}</span>
                        </a-space>
                      </div>
                      <div class="document-meta">
                        <a-space size="small">
                          <span><IconUser /> {{ item.author }}</span>
                          <span><IconCalendar /> {{ formatDate(item.publishTime) }}</span>
                          <span><IconEye /> {{ item.views }} 次查看</span>
                        </a-space>
                      </div>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  IconSafe,
  IconFile,
  IconBook,
  IconNotification,
  IconPlus,
  IconUser,
  IconCalendar,
  IconEye,
  IconBulb,
  IconFolder,
  IconEdit
} from '@arco-design/web-vue/es/icon'
import PDFViewer from '@/components/common/PDFViewer.vue'
import type { TreeNode, Document, Notification } from '@/types/community'
import { ResourceCategory, NotificationType } from '@/types/community'

// Props
interface Props {
  category: ResourceCategory
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canManage: false
})

// Emits
const emit = defineEmits<{
  add: []
  edit: [item: Document | Notification]
  view: [item: Document | Notification]
}>()

// 响应式数据
const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const selectedDocument = ref<Document | null>(null)
const selectedNotification = ref<Notification | null>(null)
const notificationModalVisible = ref(false)
const sortBy = ref('publishTime')
const sortOrder = ref('desc')

// 模拟数据
const mockDocuments = ref<(Document | Notification)[]>([
  {
    id: '1',
    title: '数据治理政策文件',
    description: '关于数据治理的重要政策文件',
    author: '管理员',
    publishTime: '2024-01-15',
    views: 156,
    category: '政策法规',
    fileName: 'data-governance-policy.pdf',
    fileSize: '2.5MB',
    fileUrl: '/mock-pdf.pdf'
  },
  {
    id: '2',
    title: '系统维护通知',
    type: NotificationType.ANNOUNCEMENT,
    summary: '系统将于本周末进行维护升级',
    content: '为了提升系统性能，我们将在本周末进行系统维护。维护期间可能会影响正常使用，请提前做好准备。',
    author: '系统管理员',
    publishTime: '2024-01-20',
    views: 89,
    category: '系统公告',
    isSticky: true,
    attachments: []
  }
])

// 计算属性
const treeData = computed(() => {
  if (!props.category) return []
  
  const categoryKey = props.category
  const subcategories = getSubcategories(categoryKey)
  
  return [
    {
      key: categoryKey,
      title: getCategoryTitle(categoryKey),
      isLeaf: false,
      children: subcategories
    }
  ]
})

const currentPageInfo = computed(() => ({
  title: getCategoryTitle(props.category),
  description: getCategoryDescription(props.category)
}))

const filteredDocuments = computed(() => {
  let docs = mockDocuments.value

  // 搜索过滤
  if (searchKeyword.value) {
    docs = docs.filter((doc: Document | Notification) => {
      const description = 'description' in doc ? doc.description : doc.summary
      return doc.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        (description && description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    })
  }

  // 排序
  docs.sort((a: Document | Notification, b: Document | Notification) => {
    let aValue = a[sortBy.value as keyof (Document | Notification)]
    let bValue = b[sortBy.value as keyof (Document | Notification)]
    
    if (sortBy.value === 'publishTime') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }
    
    if (sortOrder.value === 'desc') {
      return (bValue as number) > (aValue as number) ? 1 : -1
    } else {
      return (aValue as number) > (bValue as number) ? 1 : -1
    }
  })

  return docs
})

// 方法
const getCategoryTitle = (category: ResourceCategory): string => {
  const titleMap = {
    [ResourceCategory.POLICY]: '政策法规',
    [ResourceCategory.CASES]: '应用案例',
    [ResourceCategory.GUIDE]: '操作指南',
    [ResourceCategory.NEWS]: '社区动态'
  }
  return titleMap[category]
}

const getCategoryDescription = (category: ResourceCategory): string => {
  const descMap = {
    [ResourceCategory.POLICY]: '相关政策法规和制度文件',
    [ResourceCategory.CASES]: '优秀的数据应用实践案例分享',
    [ResourceCategory.GUIDE]: '详细的操作手册和使用教程',
    [ResourceCategory.NEWS]: '最新的社区公告、活动和技术分享'
  }
  return descMap[category]
}

const getSubcategories = (category: ResourceCategory) => {
  const subcategories = {
    [ResourceCategory.POLICY]: [
      { key: 'policy-law', title: '法律法规', isLeaf: true },
      { key: 'policy-management', title: '管理办法', isLeaf: true },
      { key: 'policy-standard', title: '标准规范', isLeaf: true }
    ],
    [ResourceCategory.CASES]: [
      { key: 'cases-analytics', title: '数据分析', isLeaf: true },
      { key: 'cases-ml', title: '机器学习', isLeaf: true },
      { key: 'cases-visualization', title: '数据可视化', isLeaf: true }
    ],
    [ResourceCategory.GUIDE]: [
      { key: 'guide-basic', title: '基础操作', isLeaf: true },
      { key: 'guide-advanced', title: '高级功能', isLeaf: true },
      { key: 'guide-troubleshooting', title: '故障排除', isLeaf: true }
    ],
    [ResourceCategory.NEWS]: [
      { key: 'news-announcement', title: '公告通知', isLeaf: true },
      { key: 'news-activity', title: '活动资讯', isLeaf: true },
      { key: 'news-update', title: '更新日志', isLeaf: true }
    ]
  }
  return subcategories[category] || []
}

const handleTreeSelect = (keys: string[]) => {
  selectedKeys.value = keys
}

const handleTreeExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

const updateCurrentPageInfo = () => {
  // 更新当前页面信息
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const getItemIcon = (item: Document | Notification) => {
  if ('type' in item && item.type) {
    return IconNotification
  }
  
  switch (props.category) {
    case ResourceCategory.POLICY:
      return IconSafe
    case ResourceCategory.CASES:
      return IconBulb
    case ResourceCategory.GUIDE:
      return IconBook
    case ResourceCategory.NEWS:
      return IconNotification
    default:
      return IconFile
  }
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const renderContent = (content: string): string => {
  return content.replace(/\n/g, '<br>')
}

const viewItem = (item: Document | Notification) => {
  const raw = (item as any)?.title || (item as any)?.id || 'doc'
  const slug = encodeURIComponent(String(raw))
  router.push(`/docs/${slug}`)
  emit('view', item)
}

const editItem = (item: Document | Notification) => {
  emit('edit', item)
}

const handleAdd = () => {
  router.push('/notification/create')
}

// 生命周期
onMounted(() => {
  // 初始化展开的节点和选中的节点
  if (props.category) {
    expandedKeys.value = [props.category]
    selectedKeys.value = [props.category]
  }
  updateCurrentPageInfo()
})

watch(() => props.category, (newCategory: ResourceCategory) => {
  if (newCategory) {
    selectedKeys.value = [newCategory]
    expandedKeys.value = [newCategory]
  }
  updateCurrentPageInfo()
})
</script>

<style scoped>
.community-resource-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.community-sider {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sider-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.sider-header h3 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.tree-container {
  padding: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.tree-node-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-count {
  color: #86909c;
  font-size: 12px;
}

.community-content {
  padding: 24px;
  background-color: #f5f5f5;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info h2 {
  margin: 0 0 8px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.content-body {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
}

.document-list {
  padding: 0 24px 24px;
}

.document-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.document-item:hover {
  background-color: #f7f8fa;
}

.document-avatar {
  background-color: #f2f3f5;
  color: #4e5969;
}

.document-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-text {
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
}

.title-text:hover {
  color: #165dff;
  text-decoration: underline;
}

.document-description {
  color: #86909c;
}

.pdf-info {
  margin: 8px 0;
  padding: 8px;
  background-color: #f7f8fa;
  border-radius: 4px;
}

.file-size {
  color: #86909c;
  font-size: 12px;
}

.document-meta {
  margin-top: 8px;
}

/* 通知详情弹窗样式 */
.notification-detail-modal :deep(.arco-modal-body) {
  padding: 0;
}

.notification-detail {
  padding: 24px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.detail-header h3 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 20px;
  font-weight: 600;
}

.detail-meta {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.detail-summary {
  margin-bottom: 24px;
}

.detail-summary h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.detail-summary p {
  margin: 0;
  color: #4e5969;
  line-height: 1.6;
}

.detail-content {
  margin-bottom: 24px;
}

.detail-content h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.content-html {
  color: #4e5969;
  line-height: 1.6;
}

.detail-attachments h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}
</style>
