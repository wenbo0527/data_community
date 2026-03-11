<template>
  <a-layout class="community-layout">
    <!-- 左侧树形导航栏 -->
    <a-layout-sider :width="280" class="community-sider">
      <div class="sider-header">
        <h3>社区资源</h3>
        <a-input-search 
          v-model="searchKeyword" 
          placeholder="搜索文档..." 
          size="small"
          @search="handleSearch"
          class="tree-search"
        />
      </div>
      
      <!-- 树形导航 -->
      <div class="tree-container">
        <div v-if="treeData.length === 0" class="tree-loading">
          <a-spin size="small" />
          <span>加载中...</span>
        </div>
        <div v-else class="tree-wrapper">
          <a-tree
            v-model:selected-keys="selectedKeys"
            v-model:expanded-keys="expandedKeys"
            :data="treeData"
            :show-line="true"
            :block-node="true"
            @select="handleTreeSelect"
          />
        </div>
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout-content class="community-content">
      <div class="content-header">
        <a-breadcrumb>
          <a-breadcrumb-item @click="$router.push('/home')">首页</a-breadcrumb-item>
          <a-breadcrumb-item>社区资源</a-breadcrumb-item>
          <a-breadcrumb-item v-if="currentCategory">{{ currentCategory }}</a-breadcrumb-item>
          <a-breadcrumb-item v-if="currentSubCategory">{{ currentSubCategory }}</a-breadcrumb-item>
        </a-breadcrumb>
        <h2>{{ currentPageTitle }}</h2>
        <p class="header-description">{{ currentPageDescription }}</p>
      </div>

      <!-- 内容展示区域 -->
      <div class="content-body">
        <!-- 动态显示文档列表 -->
        <a-row :gutter="16">
          <a-col :span="24">
            <a-card class="content-card">
              <template #title>
                <div class="card-header">
                  <span>{{ currentPageTitle }}</span>
                  <div class="card-actions">
                    <a-select 
                      v-model="sortBy" 
                      placeholder="排序方式" 
                      style="width: 120px; margin-right: 8px;"
                    >
                      <a-option value="publishTime">发布时间</a-option>
                      <a-option value="updateTime">更新时间</a-option>
                      <a-option value="views">查看次数</a-option>
                    </a-select>
                    <a-button type="primary" size="small" @click="handleAdd">
                      <template #icon>
                        <IconPlus />
                      </template>
                      新增内容
                    </a-button>
                  </div>
                </div>
              </template>
              
              <a-list :data="filteredDocuments" :pagination="{ pageSize: 10 }">
                <template #item="{ item }">
                  <a-list-item 
                    class="clickable-item"
                    @click="() => {
                      console.log('=== 列表项点击事件触发 ===');
                      console.log('点击的 item 对象:', JSON.stringify(item, null, 2));
                      console.log('item.type:', item.type);
                      console.log('item.notificationData:', item.notificationData);
                      console.log('=== 调用 viewDocument ===');
                      viewDocument(item);
                    }"
                  >
                    <a-list-item-meta
                      :description="item.description"
                    >
                      <template #title>
                        <span class="clickable-title">{{ item.title }}</span>
                      </template>
                      <template #avatar>
                        <a-avatar>
                          <component :is="getDocumentIcon(item.category)" />
                        </a-avatar>
                      </template>
                    </a-list-item-meta>
                    <template #extra>
                      <div class="document-meta">
                        <div class="meta-item">
                          <IconUser />
                          <span>{{ item.author }}</span>
                        </div>
                        <div class="meta-item">
                          <IconCalendar />
                          <span>{{ item.updateTime }}</span>
                        </div>
                        <div class="meta-item">
                          <IconEye />
                          <span>{{ item.views }}</span>
                        </div>
                        <div class="meta-item" v-if="item.type === 'notification'">
                          <a-tag color="orange" size="small">通知</a-tag>
                        </div>
                      </div>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>

    <!-- PDF查看器模态框 -->
    <a-modal
      v-model:visible="pdfModalVisible"
      :title="currentPDFTitle"
      width="80%"
      :footer="null"
      :mask-closable="false"
      class="pdf-modal"
    >
      <PDFViewer
        :pdf-url="currentPDFUrl"
        :title="currentPDFTitle"
        :file-size="currentPDFSize"
        :update-time="currentPDFUpdateTime"
        height="70vh"
        @load="onPDFLoad"
        @error="onPDFError"
      />
    </a-modal>

    <!-- 新增内容弹窗 -->
    <a-modal
      v-model:visible="addDocumentModalVisible"
      title="新增内容"
      :width="600"
      @ok="handleSubmitDocument"
      @cancel="handleCancelAddDocument"
      :confirm-loading="submitLoading"
      class="add-document-modal"
    >
      <a-form
        ref="documentFormRef"
        :model="documentForm"
        :rules="documentFormRules"
        layout="vertical"
      >
        <a-form-item field="title" label="文档名称" required>
          <a-input
            v-model="documentForm.title"
            placeholder="请输入文档名称"
            :max-length="100"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="description" label="文档说明">
          <a-textarea
            v-model="documentForm.description"
            placeholder="请输入文档说明"
            :max-length="500"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="attachments" label="附件上传">
          <a-upload
            ref="uploadRef"
            :file-list="fileList"
            :custom-request="handleFileUpload"
            :on-before-upload="beforeUpload"
            :on-remove="handleRemoveFile"
            multiple
            draggable
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
          >
            <template #upload-button>
              <div class="upload-area">
                <div class="upload-icon">
                  <IconPlus />
                </div>
                <div class="upload-text">
                  <div>点击或拖拽文件到此区域上传</div>
                  <div class="upload-tip">
                    支持 PDF、Word、Excel、PPT、TXT、Markdown 等格式
                  </div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 通知详情弹窗 -->
    <a-modal
      v-model:visible="notificationModalVisible"
      :title="selectedNotification?.title"
      width="800px"
      :footer="null"
      :mask-closable="true"
      class="notification-modal"
      @cancel="handleCloseNotificationModal"
      @before-open="() => {
        console.log('=== 弹窗事件: before-open ===');
        console.log('notificationModalVisible:', notificationModalVisible.value);
        console.log('selectedNotification:', selectedNotification.value);
      }"
      @open="() => {
        console.log('=== 弹窗事件: open ===');
        console.log('弹窗已打开');
        console.log('selectedNotification:', selectedNotification.value);
        console.log('DOM 弹窗元素:', document.querySelector('.notification-modal'));
      }"
      @before-close="() => {
        console.log('=== 弹窗事件: before-close ===');
        console.log('弹窗即将关闭');
      }"
      @close="() => {
        console.log('=== 弹窗事件: close ===');
        console.log('弹窗已关闭');
      }"
      @update:visible="(visible) => {
        console.log('=== 弹窗事件: update:visible ===');
        console.log('visible 参数:', visible);
        console.log('notificationModalVisible.value:', notificationModalVisible.value);
      }"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <!-- 调试信息 -->
        <div style="display: none;">
          {{ console.log('=== 弹窗内容渲染调试 ===') }}
          {{ console.log('selectedNotification 存在性:', !!selectedNotification) }}
          {{ console.log('selectedNotification 内容:', selectedNotification) }}
          {{ console.log('notificationModalVisible 值:', notificationModalVisible) }}
          {{ console.log('弹窗内容正在渲染...') }}
        </div>
        
        <!-- 通知基本信息 -->
        <div class="notification-header">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="通知类型">
              <a-tag :color="getNoticeTypeColor(selectedNotification.type)">
                {{ getNoticeTypeLabel(selectedNotification.type) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="所属分类">
              {{ getNotificationCategoryName(selectedNotification.categoryId) }}
            </a-descriptions-item>
            <a-descriptions-item label="发布时间">
              {{ formatDateTime(selectedNotification.publishedAt || selectedNotification.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="作者">
              {{ selectedNotification.createdBy }}
            </a-descriptions-item>
            <a-descriptions-item label="是否置顶">
              {{ selectedNotification.isSticky ? '是' : '否' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 通知内容 -->
        <div class="notification-content">
          <h4>通知内容</h4>
          <div class="content-body" v-html="selectedNotification.content"></div>
        </div>

        <!-- 附件列表 -->
        <div v-if="selectedNotification.documents && selectedNotification.documents.length > 0" class="notification-attachments">
          <h4>附件列表</h4>
          <a-list :data="selectedNotification.documents" size="small">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.fileName"
                  :description="`文件大小: ${item.fileSize || '未知'} | 上传时间: ${formatDateTime(item.uploadTime || selectedNotification.createdAt)}`"
                >
                  <template #avatar>
                    <a-avatar>
                      <IconFile />
                    </a-avatar>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button type="text" size="small" @click="downloadAttachment(item)">
                    下载
                  </a-button>
                  <a-button type="text" size="small" @click="previewAttachment(item)">
                    预览
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IconSafe,
  IconFile,
  IconBook,
  IconNotification,
  IconUser,
  IconCalendar,
  IconEye,
  IconPlus,
  IconSearch,
  IconDown,
  IconRight
} from '@arco-design/web-vue/es/icon'
import NotificationAPI from '@/api/notification'
import { NotificationMockService } from '@/mock/notification'
import PDFViewer from '@/components/common/PDFViewer.vue'
import { getNoticeTypeLabel, getNoticeTypeColor } from '@/constants/notification'

const route = useRoute()
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')
// 选中的树节点
const selectedKeys = ref(['policy'])
// 展开的树节点
const expandedKeys = ref(['policy', 'cases', 'guide', 'news', 'notification'])
// 排序方式
const sortBy = ref('publishTime')

// 当前页面信息
const currentCategory = ref('政策制度')
const currentSubCategory = ref('')
const currentPageTitle = ref('政策制度')
const currentPageDescription = ref('数据管理相关政策制度文档')

// 通知数据
const notifications = ref([])
const notificationCategories = ref([])

// 获取通知数据
const fetchNotifications = async () => {
  try {
    console.log('开始获取通知数据...')
    const response = await NotificationAPI.getNotifications({
      status: 'published',
      pageSize: 100
    })
    console.log('通知API响应:', response)
    if (response.success) {
      const notificationData = response.data.list || response.data
      console.log('原始通知数据:', JSON.stringify(notificationData, null, 2))
      notifications.value = notificationData
      console.log('设置通知数据后:', JSON.stringify(notifications.value, null, 2))
    } else {
      console.log('通知API响应失败:', response.message)
    }
  } catch (error) {
    console.error('获取通知数据失败:', error)
  }
}

// 获取通知分类
const fetchNotificationCategories = async () => {
  try {
    console.log('开始获取通知分类...')
    const categories = await NotificationMockService.getCategories()
    console.log('分类API响应:', categories)
    if (categories.success) {
      notificationCategories.value = categories.data
      console.log('设置通知分类:', notificationCategories.value)
    } else {
      console.log('分类API响应失败:', categories.message)
    }
  } catch (error) {
    console.error('获取通知分类失败:', error)
  }
}

// PDF查看器相关状态
const pdfModalVisible = ref(false)
const currentPDFUrl = ref('')
const currentPDFTitle = ref('')
const currentPDFSize = ref(0)
const currentPDFUpdateTime = ref('')

// 通知详情弹窗相关状态
const notificationModalVisible = ref(false)
const selectedNotification = ref(null)

// 计算通知分类的数量
const getNotificationCountByCategory = (categoryId) => {
  return (notifications.value || []).filter(n => n.categoryId === categoryId).length
}

// 树形导航数据
// 树形数据
const treeData = computed(() => {
// 基础树形数据结构
const baseTreeData = [
{
key: 'policy',
title: '政策制度',
children: [
{ key: 'policy-law', title: '法律法规', count: 3 },
{ key: 'policy-internal', title: '内部制度', count: 2 },
{ key: 'policy-standard', title: '行业标准', count: 2 }
]
},
{
key: 'tech',
title: '技术文档',
children: [
{ key: 'tech-api', title: 'API文档', count: 4 },
{ key: 'tech-guide', title: '开发指南', count: 3 },
{ key: 'tech-best', title: '最佳实践', count: 2 }
]
},
{
key: 'training',
title: '培训资料',
children: [
{ key: 'training-basic', title: '基础培训', count: 3 },
{ key: 'training-advanced', title: '进阶培训', count: 2 },
{ key: 'training-cert', title: '认证考试', count: 1 }
]
},
{
key: 'news',
title: '新闻资讯',
children: [
{ key: 'news-company', title: '公司动态', count: 5 },
{ key: 'news-industry', title: '行业资讯', count: 3 },
{ key: 'news-activity', title: '活动资讯', count: 2 },
{ key: 'news-tech', title: '技术分享', count: 1 },
{ key: 'news-update', title: '版本更新', count: 1 }
]
}
]

    // 如果有通知分类数据，添加通知管理节点
    if (notificationCategories.value && notificationCategories.value.length > 0) {
      baseTreeData.push({
        key: 'notification',
        title: '通知管理',
        count: notifications.value?.length || 0,
        children: notificationCategories.value.map(category => ({
          key: `notification-${category.id}`,
          title: category.name,
          count: getNotificationCountByCategory(category.id)
        }))
      })
    }

return baseTreeData
})

// 所有文档数据
const allDocuments = computed(() => {
  const documents = [
    // 政策制度
    {
      id: 'policy-1',
      title: '数据安全法实施细则',
      description: '根据《中华人民共和国数据安全法》制定的具体实施细则，规范数据处理活动，保障数据安全。',
      category: 'policy-law',
      author: '法务部',
      publishTime: '2024-01-15',
      updateTime: '2024-01-15',
      views: 1250,
      fileName: '数据安全法实施细则.pdf',
      fileSize: '2.3MB',
      type: 'document'
    },
    {
      id: 'policy-2',
      title: '个人信息保护合规指引',
      description: '企业个人信息保护合规操作指南，包含收集、使用、存储、传输等各环节的合规要求。',
      category: 'policy-law',
      author: '合规部',
      publishTime: '2024-01-12',
      updateTime: '2024-01-12',
      views: 980,
      fileName: '个人信息保护合规指引.pdf',
      fileSize: '1.8MB'
    },
    {
      id: 'policy-3',
      title: '数据分类分级管理办法',
      description: '建立数据分类分级体系，明确不同类别和级别数据的管理要求和保护措施。',
      category: 'policy-management',
      author: '数据管理部',
      publishTime: '2024-01-10',
      updateTime: '2024-01-10',
      views: 1150,
      fileName: '数据分类分级管理办法.pdf',
      fileSize: '2.1MB'
    },
    {
      id: 'policy-4',
      title: '数据质量管理规范',
      description: '数据质量管理的标准化规范，包含数据质量评估、监控、改进等管理流程。',
      category: 'policy-management',
      author: '质量管理部',
      publishTime: '2024-01-08',
      updateTime: '2024-01-08',
      views: 890,
      fileName: '数据质量管理规范.pdf',
      fileSize: '1.9MB'
    },
    {
      id: 'policy-5',
      title: '金融行业数据安全标准',
      description: '金融行业数据安全相关的行业标准，规范金融机构数据安全管理要求。',
      category: 'policy-industry-standard',
      author: '行业协会',
      publishTime: '2024-01-05',
      updateTime: '2024-01-05',
      views: 750,
      fileName: '金融行业数据安全标准.pdf',
      fileSize: '3.2MB'
    },
    {
      id: 'policy-6',
      title: '地方数据开放管理办法',
      description: '地方政府数据开放管理的具体办法，促进政务数据开放共享。',
      category: 'policy-local-standard',
      author: '地方政府',
      publishTime: '2024-01-03',
      updateTime: '2024-01-03',
      views: 650,
      fileName: '地方数据开放管理办法.pdf',
      fileSize: '1.5MB'
    },
    {
      id: 'policy-7',
      title: '数据安全培训指引',
      description: '面向企业员工的数据安全培训指引，提升全员数据安全意识和技能。',
      category: 'policy-training',
      author: '培训中心',
      publishTime: '2024-01-01',
      updateTime: '2024-01-01',
      views: 1100,
      fileName: '数据安全培训指引.pdf',
      fileSize: '2.8MB'
    },
    // 实践案例
    {
      id: 'cases-1',
      title: '电商用户行为分析案例',
      description: '基于大数据技术分析电商用户行为模式，优化用户体验和转化率的成功实践。',
      category: 'cases-data-discovery',
      author: '数据分析团队',
      publishTime: '2024-01-14',
      updateTime: '2024-01-14',
      views: 1350,
      fileName: '电商用户行为分析案例.pdf',
      fileSize: '3.5MB'
    },
    {
      id: 'cases-2',
      title: '金融风控模型实践',
      description: '运用机器学习算法构建金融风控模型，有效识别和防范金融风险的实践案例。',
      category: 'cases-digital-risk',
      author: '风控团队',
      publishTime: '2024-01-12',
      updateTime: '2024-01-12',
      views: 1200,
      fileName: '金融风控模型实践.pdf',
      fileSize: '4.1MB'
    },
    // 操作指南
    {
      id: 'guide-1',
      title: '数据平台操作手册',
      description: '数据平台各功能模块的详细操作指南，帮助用户快速上手使用平台功能。',
      category: 'guide-data-management',
      author: '产品团队',
      publishTime: '2024-01-16',
      updateTime: '2024-01-16',
      views: 2100,
      fileName: '数据平台操作手册.pdf',
      fileSize: '5.2MB'
    },
    // 社区动态
    {
      id: 'news-1',
      title: '数据社区V2.1版本发布',
      description: '数据社区平台V2.1版本正式发布，新增智能推荐、批量操作等多项实用功能。',
      category: 'news-update',
      author: '产品团队',
      publishTime: '2024-01-16',
      updateTime: '2024-01-16',
      views: 1580,
      fileName: '社区版本更新公告.pdf',
      fileSize: '1.2MB'
    },
    {
      id: 'news-2',
      title: '技术分享会预告',
      description: '本月技术分享会将于1月20日举行，主题为"大数据处理技术与实践"。',
      category: 'news-activity',
      author: '技术委员会',
      publishTime: '2024-01-13',
      updateTime: '2024-01-13',
      views: 890
    }
  ]
  
  // 添加通知数据
  console.log('=== 通知数据映射开始 ===')
  console.log('原始通知数据 notifications.value:', JSON.stringify(notifications.value, null, 2))
  console.log('通知数据数量:', notifications.value.length)
  
  const notificationDocs = notifications.value.map((notification, index) => {
    console.log(`处理第 ${index + 1} 个通知:`, notification)
    
    // 检查必要字段
    if (!notification.id) {
      console.warn('⚠️ 通知缺少 id 字段:', notification)
    }
    if (!notification.title) {
      console.warn('⚠️ 通知缺少 title 字段:', notification)
    }
    if (!notification.content) {
      console.warn('⚠️ 通知缺少 content 字段:', notification)
    }
    
    const doc = {
      id: notification.id,
      title: notification.title,
      description: notification.content ? notification.content.substring(0, 100) + '...' : '无内容',
      category: `notification-${notification.categoryId || 'default'}`,
      author: notification.createdBy || '系统',
      publishTime: notification.publishedAt?.split('T')[0] || notification.createdAt?.split('T')[0] || '未知',
      updateTime: notification.updatedAt?.split('T')[0] || notification.createdAt?.split('T')[0] || '未知',
      views: Math.floor(Math.random() * 1000) + 100, // 模拟浏览量
      fileName: notification.documents?.[0]?.fileName || '无附件',
      fileSize: notification.documents?.[0] ? '2.1MB' : '0MB',
      type: 'notification', // 确保类型正确设置
      notificationData: notification // 确保原始数据完整传递
    }
    
    console.log(`✓ 映射完成的文档 ${index + 1}:`, JSON.stringify(doc, null, 2))
    console.log(`  - type: ${doc.type}`)
    console.log(`  - notificationData 存在: ${!!doc.notificationData}`)
    console.log(`  - notificationData 内容:`, doc.notificationData)
    
    return doc
  })
  
  console.log('=== 通知数据映射完成 ===')
  console.log('映射后的通知文档数量:', notificationDocs.length)
  console.log('所有映射后的通知文档:', JSON.stringify(notificationDocs, null, 2))
  
  return [...documents, ...notificationDocs]
})

// 根据选中的树节点过滤文档
const filteredDocuments = computed(() => {
  let documents = allDocuments.value

  // 根据选中的树节点过滤
  if (selectedKeys.value.length > 0) {
    const selectedKey = selectedKeys.value[0]
    if (selectedKey.includes('-')) {
      // 选中的是子分类
      documents = documents.filter(doc => doc.category === selectedKey)
    } else {
      // 选中的是主分类
      documents = documents.filter(doc => doc.category.startsWith(selectedKey))
    }
  }

  // 搜索过滤
  if (searchKeyword.value) {
    documents = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 排序
  documents.sort((a, b) => {
    if (sortBy.value === 'publishTime' || sortBy.value === 'updateTime') {
      return new Date(b[sortBy.value]) - new Date(a[sortBy.value])
    } else if (sortBy.value === 'views') {
      return b.views - a.views
    }
    return 0
  })

  return documents
})

// 处理树节点选择
const handleTreeSelect = (selectedKeys, { node }) => {
  if (selectedKeys.length > 0) {
    const key = selectedKeys[0]
    updateCurrentPageInfo(key, node)
  }
}

// 处理树节点展开
const handleTreeExpand = (expandedKeys) => {
  expandedKeys.value = expandedKeys
}

// 查看文档
const viewDocument = (document) => {
  console.log('=== viewDocument 详细调试信息 ===')
  console.log('函数被调用，完整 document 对象:', JSON.stringify(document, null, 2))
  console.log('document 对象的所有属性:')
  for (const key in document) {
    console.log(`  ${key}:`, document[key])
  }
  console.log('document.type 类型检查:', typeof document.type, '值:', document.type)
  console.log('document.type === "notification":', document.type === 'notification')
  console.log('document.notificationData 存在性:', !!document.notificationData)
  console.log('document.notificationData 内容:', document.notificationData)
  
  // 检查响应式变量状态
  console.log('当前响应式变量状态:')
  console.log('  notificationModalVisible.value:', notificationModalVisible.value)
  console.log('  selectedNotification.value:', selectedNotification.value)
  console.log('  notificationModalVisible 是否为 ref:', notificationModalVisible.__v_isRef)
  console.log('  selectedNotification 是否为 ref:', selectedNotification.__v_isRef)
  
  if (document.type === 'notification') {
    console.log('✓ 检测到通知类型，准备显示弹窗')
    
    // 详细记录设置前的状态
    console.log('设置前状态:')
    console.log('  selectedNotification.value:', selectedNotification.value)
    console.log('  notificationModalVisible.value:', notificationModalVisible.value)
    
    // 检查 notificationData 的完整性
    if (!document.notificationData) {
      console.error('❌ 错误: document.notificationData 不存在!')
      return
    }
    
    console.log('✓ notificationData 存在，内容:', JSON.stringify(document.notificationData, null, 2))
    
    // 设置响应式变量
    try {
      selectedNotification.value = document.notificationData
      console.log('✓ selectedNotification 设置成功')
    } catch (error) {
      console.error('❌ 设置 selectedNotification 失败:', error)
    }
    
    try {
      notificationModalVisible.value = true
      console.log('✓ notificationModalVisible 设置成功')
    } catch (error) {
      console.error('❌ 设置 notificationModalVisible 失败:', error)
    }
    
    // 详细记录设置后的状态
    console.log('设置后状态:')
    console.log('  selectedNotification.value:', selectedNotification.value)
    console.log('  notificationModalVisible.value:', notificationModalVisible.value)
    
    // 使用 nextTick 确保 DOM 更新后再检查
    nextTick(() => {
      console.log('nextTick 后状态检查:')
      console.log('  notificationModalVisible.value:', notificationModalVisible.value)
      console.log('  selectedNotification.value:', selectedNotification.value)
      console.log('  DOM 中的弹窗元素:', document.querySelector('.notification-modal'))
      console.log('  弹窗是否可见:', document.querySelector('.notification-modal')?.style.display)
    })
  } else {
    console.log('✓ 文档类型，跳转至详情页')
    const raw = document.title || document.id || 'doc'
    const slug = encodeURIComponent(String(raw))
    router.push(`/docs/${slug}`)
  }
  console.log('=== viewDocument 详细调试信息结束 ===')
}

// 更新当前页面信息
const updateCurrentPageInfo = (key, node) => {
  if (key.includes('-')) {
    // 子分类
    const [mainCategory, subCategory] = key.split('-', 2)
    const mainNode = treeData.value.find(item => item.key === mainCategory)
    currentCategory.value = mainNode?.title || ''
    currentSubCategory.value = node.title
    currentPageTitle.value = node.title
  } else {
    // 主分类
    currentCategory.value = node.title
    currentSubCategory.value = ''
    currentPageTitle.value = node.title
  }
  
  // 设置描述
  const descriptions = {
    'policy': '数据管理相关政策制度文档',
    'cases': '数据应用优秀实践案例',
    'guide': '平台功能操作指导手册',
    'news': '最新的社区公告、活动和技术分享',
    'notification': '系统通知和公告信息管理'
  }
  
  const mainKey = key.split('-')[0]
  currentPageDescription.value = descriptions[mainKey] || ''
}

// 获取文档图标
const getDocumentIcon = (category) => {
  if (category.startsWith('policy')) return 'IconSafe'
  if (category.startsWith('cases')) return 'IconFile'
  if (category.startsWith('guide')) return 'IconBook'
  if (category.startsWith('news')) return 'IconNotification'
  if (category.startsWith('notification')) return 'IconNotification'
  return 'IconFile'
}

// 新增内容弹窗相关状态
const addDocumentModalVisible = ref(false)
const submitLoading = ref(false)
const fileList = ref([])
const documentForm = ref({
  title: '',
  description: '',
  attachments: []
})

// 表单验证规则
const documentFormRules = {
  title: [
    { required: true, message: '请输入文档名称' },
    { minLength: 2, message: '文档名称至少2个字符' },
    { maxLength: 100, message: '文档名称不能超过100个字符' }
  ]
}

// 新增内容
const handleAdd = () => {
  router.push('/notification/create')
}

// 新增内容相关方法
const handleSubmitDocument = async () => {
  try {
    submitLoading.value = true
    
    // 验证表单
    const documentFormRef = ref()
    await documentFormRef.value?.validate()
    
    // 创建新文档对象
    const newDocument = {
      id: Date.now().toString(),
      title: documentForm.value.title,
      description: documentForm.value.description,
      author: '当前用户',
      publishTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
      views: 0,
      category: 'policy',
      fileName: fileList.value.length > 0 ? fileList.value[0].name : '',
      fileSize: fileList.value.length > 0 ? formatFileSize(fileList.value[0].size) : '',
      fileUrl: fileList.value.length > 0 ? URL.createObjectURL(fileList.value[0].file) : ''
    }
    
    console.log('新增内容成功:', newDocument)
    
    // 重置表单和关闭弹窗
    resetDocumentForm()
    addDocumentModalVisible.value = false
    
  } catch (error) {
    console.error('提交文档失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancelAddDocument = () => {
  resetDocumentForm()
  addDocumentModalVisible.value = false
}

const resetDocumentForm = () => {
  documentForm.value = {
    title: '',
    description: '',
    attachments: []
  }
  fileList.value = []
}

const handleFileUpload = (option) => {
  const { file } = option
  
  // 模拟上传成功
  setTimeout(() => {
    option.onSuccess()
  }, 1000)
  
  return true
}

const beforeUpload = (file) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown'
  ].includes(file.type)
  
  if (!isValidType) {
    console.error('文件格式不支持')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    console.error('文件大小不能超过10MB')
    return false
  }
  
  return true
}

const handleRemoveFile = (file) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    'IconSafe': IconSafe,
    'IconFile': IconFile,
    'IconBook': IconBook,
    'IconNotification': IconNotification,
    'IconUser': IconUser,
    'IconCalendar': IconCalendar,
    'IconEye': IconEye,
    'IconPlus': IconPlus,
    'IconSearch': IconSearch,
    'IconDown': IconDown,
    'IconRight': IconRight
  }
  return iconMap[iconName] || IconFile
}

// 初始化
onMounted(async () => {
  console.log('=== 组件挂载，开始获取数据 ===')
  // 获取通知数据和分类
  await fetchNotifications()
  await fetchNotificationCategories()
  console.log('获取到的通知数据:', JSON.stringify(notifications.value, null, 2))
    console.log('获取到的通知分类:', JSON.stringify(notificationCategories.value, null, 2))
  console.log('=== 数据获取完成 ===')
  
  // 检查路由参数，如果有分类参数则选中对应分类
  const categoryParam = route.query.category
  if (categoryParam) {
    selectedKeys.value = [categoryParam]
    const categoryNode = treeData.value.find(item => item.key === categoryParam)
    if (categoryNode) {
      updateCurrentPageInfo(categoryParam, categoryNode)
    }
  } else {
    // 默认选中政策制度
    selectedKeys.value = ['policy']
    updateCurrentPageInfo('policy', { title: '政策制度' })
  }
})

// 处理搜索
const handleSearch = (value) => {
  searchKeyword.value = value
}

// 查看PDF附件
const viewPDF = (document) => {
  if (document.type === 'notification' && document.notificationData?.documents?.[0]) {
    const pdfDoc = document.notificationData.documents[0]
    currentPDFUrl.value = pdfDoc.filePath || '/mock-pdf-url.pdf' // 模拟PDF URL
    currentPDFTitle.value = pdfDoc.fileName
    currentPDFSize.value = pdfDoc.fileSize
    currentPDFUpdateTime.value = document.updateTime
  } else {
    // 普通文档的PDF查看
    currentPDFUrl.value = `/documents/${document.fileName}` // 模拟PDF URL
    currentPDFTitle.value = document.fileName
    currentPDFSize.value = parseFloat(document.fileSize) * 1024 * 1024 // 转换为字节
    currentPDFUpdateTime.value = document.updateTime
  }
  pdfModalVisible.value = true
}

// PDF加载成功回调
const onPDFLoad = () => {
  console.log('PDF加载成功')
}

// PDF加载失败回调
const onPDFError = (error) => {
  console.error('PDF加载失败:', error)
}

// 关闭通知详情弹窗
const handleCloseNotificationModal = () => {
  notificationModalVisible.value = false
  selectedNotification.value = null
}

// 获取通知分类名称
const getNotificationCategoryName = (categoryId) => {
  const category = notificationCategories.value.find(cat => cat.id === categoryId)
  return category?.name || '未知分类'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 下载附件
const downloadAttachment = (attachment) => {
  // 模拟下载功能
  const link = document.createElement('a')
  link.href = attachment.filePath || '#'
  link.download = attachment.fileName
  link.click()
}

// 预览附件
const previewAttachment = (attachment) => {
  // 如果是PDF文件，使用PDF查看器
  if (attachment.fileName.toLowerCase().endsWith('.pdf')) {
    currentPDFUrl.value = attachment.filePath || '/mock-pdf-url.pdf'
    currentPDFTitle.value = attachment.fileName
    currentPDFSize.value = attachment.fileSize
    currentPDFUpdateTime.value = formatDateTime(attachment.uploadTime)
    pdfModalVisible.value = true
    // 关闭通知弹窗
    notificationModalVisible.value = false
  } else {
    // 其他文件类型的预览逻辑
    window.open(attachment.filePath || '#', '_blank')
  }
}
</script>

<style scoped>
.community-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.community-sider {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sider-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  flex-shrink: 0;
}

.sider-header h3 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.tree-search {
  width: 100%;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

.tree-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
  gap: 8px;
}

.tree-wrapper {
  margin-top: 8px;
}

.community-tree {
  min-height: 200px;
  font-size: 14px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
}

.community-tree :deep(.arco-tree-node) {
  padding: 4px 0;
}

.community-tree :deep(.arco-tree-node-title) {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.community-tree :deep(.arco-tree-node-title:hover) {
  background-color: #f2f3f5;
}

.community-tree :deep(.arco-tree-node-selected .arco-tree-node-title) {
  background-color: #e8f4ff;
  color: #165dff;
}

.tree-node-title {
  display: flex;
  align-items: center;
  width: 100%;
}

.tree-node-icon {
  margin-right: 6px;
  font-size: 14px;
}

.tree-node-text {
  flex: 1;
}

.tree-node-count {
  color: #86909c;
  font-size: 12px;
  margin-left: 4px;
}

.community-content {
  padding: 24px;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h2 {
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

.content-body {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
}

.content-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 新增内容弹窗样式 */
.add-document-modal .upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.add-document-modal .upload-area:hover {
  border-color: #165dff;
}

.add-document-modal .upload-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.add-document-modal .upload-text {
  text-align: center;
}

.add-document-modal .upload-text > div:first-child {
  font-size: 16px;
  color: #1d2129;
  margin-bottom: 8px;
}

.add-document-modal .upload-tip {
  font-size: 14px;
  color: #86909c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-actions {
  display: flex;
  align-items: center;
}

.document-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item svg {
  font-size: 12px;
}

.content-card :deep(.arco-card-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 20px;
}

.content-card :deep(.arco-card-body) {
  padding: 20px;
}

.content-card :deep(.arco-list-item-meta-title) {
  font-weight: 500;
  color: #1d2129;
}

.content-card :deep(.arco-list-item-meta-description) {
  color: #4e5969;
  line-height: 1.5;
}

/* 通知详情弹窗样式 */
.notification-modal :deep(.arco-modal-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 24px;
}

.notification-modal :deep(.arco-modal-body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.notification-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notification-header {
  margin-bottom: 16px;
}

.notification-header :deep(.arco-descriptions-item-label) {
  font-weight: 500;
  color: #1d2129;
  background-color: #f7f8fa;
}

.notification-header :deep(.arco-descriptions-item-value) {
  color: #4e5969;
}

.notification-content h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
  padding-bottom: 8px;
}

.notification-content .content-body {
  background-color: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  margin: 0;
  line-height: 1.6;
  color: #4e5969;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
}

.notification-content .content-body :deep(p) {
  margin: 0 0 12px 0;
}

.notification-content .content-body :deep(p:last-child) {
  margin-bottom: 0;
}

.notification-attachments h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
  padding-bottom: 8px;
}

.notification-attachments :deep(.arco-list) {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
}

.notification-attachments :deep(.arco-list-item) {
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;
}

.notification-attachments :deep(.arco-list-item:last-child) {
  border-bottom: none;
}

.notification-attachments :deep(.arco-list-item-meta-title) {
  font-weight: 500;
  color: #1d2129;
}

.notification-attachments :deep(.arco-list-item-meta-description) {
  color: #86909c;
  font-size: 12px;
}

/* PDF模态框样式 */
.pdf-modal :deep(.arco-modal-body) {
  padding: 0;
}

/* 可点击列表项样式 */
.clickable-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-item:hover {
  background-color: #f7f8fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clickable-title {
  color: #165dff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.clickable-title:hover {
  color: #0e42d2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-modal {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .notification-modal :deep(.arco-modal-body) {
    padding: 16px;
    max-height: 60vh;
  }
  
  .notification-detail {
    gap: 16px;
  }
  
  .notification-header :deep(.arco-descriptions) {
    column-count: 1;
  }
}
</style>
