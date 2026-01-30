<template>
  <div class="notification-form-container">
    <div class="form-header">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item @click="$router.push('/home')">首页</a-breadcrumb-item>
        <a-breadcrumb-item @click="$router.push('/admin/notifications')">通知管理</a-breadcrumb-item>
        <a-breadcrumb-item>{{ isEdit ? '编辑内容' : '新增内容' }}</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-title-container">
        <h1 class="page-title">{{ isEdit ? '编辑内容' : '新增内容' }}</h1>
        <a-tag v-if="!isEdit" color="green" class="new-content-tag">新内容</a-tag>
      </div>
    </div>

    <div class="form-layout">
      <!-- 主要内容编辑区域 -->
      <div class="main-panel">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
          class="main-form"
          @submit="handleSubmit"
        >
          <!-- 合并的基本信息卡片 -->
          <a-card class="basic-info-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <IconEdit />
                基本信息
                <span class="required-mark">*</span>
              </div>
            </template>
            
            <!-- 内容类型选择 -->
            <a-form-item 
              field="contentType" 
              label="内容类型"
              :rules="[{ required: true, message: '请选择内容类型' }]"
              class="content-type-field"
            >
              <a-radio-group 
                v-model="formData.contentType" 
                type="button"
                class="content-type-selector"
                @change="handleContentTypeChange"
              >
                <a-radio value="document" class="type-option">
                  <div class="radio-content">
                    <IconFile class="radio-icon" />
                    <div class="radio-text">
                      <div class="radio-title">仅上传文档</div>
                      <div class="radio-desc">上传文档到社区资源库</div>
                    </div>
                  </div>
                </a-radio>
                <a-radio value="notification" class="type-option">
                  <div class="radio-content">
                    <IconNotification class="radio-icon" />
                    <div class="radio-text">
                      <div class="radio-title">发送通知</div>
                      <div class="radio-desc">发布通知消息给用户</div>
                    </div>
                  </div>
                </a-radio>
              </a-radio-group>
            </a-form-item>

            <!-- 文档来源选择 (仅文档模式显示) -->
            <a-form-item
              v-if="formData.contentType === 'document'"
              field="docSource"
              label="文档来源"
              class="doc-source-field"
            >
              <a-radio-group v-model="formData.docSource" type="button">
                <a-radio value="upload">本地上传</a-radio>
                <a-radio value="system">关联系统文档</a-radio>
              </a-radio-group>
            </a-form-item>

            <!-- 模式提示 -->
            <a-alert 
              v-if="formData.contentType === 'document'"
              type="info" 
              class="mode-alert"
              show-icon
            >
              文档模式：专注于文档上传和管理，支持多种文件格式
            </a-alert>
            <a-alert 
              v-else-if="formData.contentType === 'notification'"
              type="success" 
              class="mode-alert"
              show-icon
            >
              通知模式：发布重要通知和公告，支持富文本编辑
            </a-alert>

            <!-- 基本信息表单 -->
            <div class="form-row">
              <!-- 标题 -->
              <a-form-item 
                field="title" 
                label="标题"
                :rules="[{ required: true, message: '请输入标题' }]"
                class="title-field"
              >
                <a-input 
                  v-model="formData.title" 
                  :placeholder="formData.contentType === 'document' ? '请输入文档标题' : '请输入通知标题'"
                  class="title-input"
                  size="large"
                />
              </a-form-item>

              <!-- 归档分类 - 两种模式都显示 -->
              <a-form-item 
                field="categoryPath" 
                label="归档分类"
                :rules="[{ required: true, message: '请选择归档分类' }]"
                class="category-field"
              >
              <a-cascader
                v-model="formData.categoryPath"
                :options="categoryOptions"
                :placeholder="formData.contentType === 'document' ? '请选择文档分类' : '请选择通知分类'"
                class="category-selector"
                size="large"
                allow-search
                path-mode
              />
            </a-form-item>

            <!-- 关联文档（通知模式 或 文档模式且选择系统文档） -->
            <a-form-item 
              v-if="formData.contentType === 'notification' || (formData.contentType === 'document' && formData.docSource === 'system')" 
              field="associatedDocSlug" 
              :label="formData.contentType === 'document' ? '选择文档' : '关联文档'"
              :rules="(formData.contentType === 'document' && formData.docSource === 'system') ? [{ required: true, message: '请选择系统文档' }] : []"
            >
              <template #extra>
                <a-link v-if="formData.associatedDocSlug" @click="$router.push('/docs/' + encodeURIComponent(formData.associatedDocSlug!))">预览</a-link>
              </template>
              <a-select
                v-model="formData.associatedDocSlug"
                :placeholder="formData.contentType === 'document' ? '请选择一个系统文档' : '选择一个已存在的文档进行关联'"
                allow-clear
                allow-search
                size="large"
              >
                <a-option v-for="doc in docIndex" :key="doc.slug" :value="doc.slug">{{ doc.title }}</a-option>
              </a-select>
            </a-form-item>

              <!-- 通知对象 - 发送通知模式下所有分类都显示 -->
              <a-form-item v-if="formData.contentType === 'notification'" field="target" label="通知对象" required>
                <template #extra>
                  <a-link @click="goToUserGroupManagement">
                    <IconUserGroup /> 维护用户组
                  </a-link>
                </template>
                <a-select
                  v-model="formData.target"
                  placeholder="请选择通知对象"
                  multiple
                  allow-clear
                  size="large"
                >
                  <a-option 
                    v-for="group in userGroups" 
                    :key="group.value" 
                    :value="group.value"
                  >
                    {{ group.label }}
                  </a-option>
                </a-select>
              </a-form-item>

              <!-- 数据服务特有字段 -->
              <a-form-item v-if="showDataServiceFields" field="dataAssets" label="变更数据资产" required>
                <a-select
                  v-model="formData.dataAssets"
                  placeholder="请选择或输入变更的数据资产"
                  multiple
                  allow-clear
                  allow-search
                  allow-create
                  size="large"
                >
                  <a-option 
                    v-for="asset in DATA_ASSET_OPTIONS" 
                    :key="asset.value" 
                    :value="asset.value"
                  >
                    {{ asset.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </div>
          </a-card>

          <!-- 内容编辑卡片 -->
          <a-card class="content-editor-card" :bordered="false">
            <template #title>
              <div class="card-title-with-actions">
                <div class="card-title">
                  <IconEdit />
                  {{ formData.contentType === 'document' ? '文档描述' : '正文' }}
                  <span v-if="formData.contentType === 'notification'" class="required-mark">*</span>
                </div>
                <div class="word-count">
                  {{ wordCount }} 字
                </div>
              </div>
            </template>
            
            <a-form-item 
              field="content" 
              class="content-field"
              :rules="formData.contentType === 'notification' ? [{ required: true, message: '请输入通知内容' }] : []"
            >
              <div class="editor-container">
                <a-textarea
                  v-model="formData.content"
                  :placeholder="formData.contentType === 'document' ? '请输入文档描述（可选）' : '请输入通知内容，支持 Markdown 语法'"
                  class="content-editor"
                  :auto-size="{ minRows: 12, maxRows: 20 }"
                  @input="handleContentChange"
                />
                
                <!-- Markdown 工具栏 -->
                <div v-if="formData.contentType === 'notification'" class="editor-toolbar">
                  <a-button-group size="mini">
                    <a-button @click="insertMarkdown('**', '**')" title="粗体">
                      <IconBold />
                    </a-button>
                    <a-button @click="insertMarkdown('*', '*')" title="斜体">
                      <IconItalic />
                    </a-button>
                    <a-button @click="insertMarkdown('`', '`')" title="代码">
                      <IconCode />
                    </a-button>
                    <a-button @click="insertMarkdown('[', '](url)')" title="链接">
                      <icon-link />
                    </a-button>
                    <a-button @click="insertMarkdown('- ', '')" title="列表">
                      <IconList />
                    </a-button>
                  </a-button-group>
                </div>
              </div>
            </a-form-item>
          </a-card>

          <!-- 附件管理卡片 -->
          <a-card v-if="formData.contentType === 'document' && formData.docSource === 'upload'" class="attachment-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <icon-attachment />
                附件管理
                <span v-if="formData.contentType === 'document'" class="required-mark">*</span>
              </div>
            </template>
            
            <!-- 文档模式提示 -->
            <a-alert 
              v-if="formData.contentType === 'document'"
              type="warning" 
              class="mode-alert"
              show-icon
            >
              文档模式下必须上传至少一个文件
            </a-alert>
            
            <a-upload
              v-model:file-list="fileList"
              :custom-request="handleUpload"
              :before-upload="beforeUpload"
              @remove="handleRemove"
              multiple
              draggable
              :show-upload-list="{ showPreviewIcon: true, showRemoveIcon: true }"
            >
              <template #upload-area>
                <div class="upload-area">
                  <div class="upload-icon">
                    <icon-cloud-upload />
                  </div>
                  <div class="upload-text">
                    <div class="upload-title">点击或拖拽文件到此区域上传</div>
                    <div class="upload-subtitle">
                      支持 PDF、Word、Excel、PPT、图片等格式，单个文件不超过 50MB
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-card>

          <!-- 发布设置卡片 - 仅通知模式显示 -->
          <a-card v-if="formData.contentType === 'notification'" class="publish-settings-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <IconSettings />
                发布设置
              </div>
            </template>
            
            <div class="settings-grid">
              <a-form-item field="isSticky" label="置顶显示" class="setting-item">
                <a-switch v-model="formData.isSticky" />
              </a-form-item>
              
              <a-form-item field="isPublic" label="公开可见" class="setting-item">
                <a-switch v-model="formData.isPublic" />
              </a-form-item>
              
              <a-form-item field="publishTime" label="发布时间" class="setting-item">
                <a-date-picker
                  v-model="formData.publishTime"
                  show-time
                  format="YYYY-MM-DD HH:mm"
                  placeholder="选择发布时间"
                />
              </a-form-item>
            </div>
          </a-card>

          <!-- 操作按钮卡片 -->
          <a-card class="action-card" :bordered="false">
            <div class="action-buttons">
              <div class="left-actions">
                <a-button 
                  v-if="formData.contentType === 'notification'"
                  @click="handleSaveDraft"
                  :loading="isSaving"
                  size="large"
                >
                  <IconSave />
                  保存草稿
                </a-button>
              </div>
              
              <div class="right-actions">
                <a-button 
                  v-if="formData.contentType === 'notification'"
                  type="outline"
                  size="large"
                  @click="handlePreview"
                >
                  <IconEye />
                  预览
                </a-button>
                <a-button @click="handleCancel" size="large">
                  取消
                </a-button>
                <a-button 
                  type="primary" 
                  @click="handleSubmit"
                  :loading="isSubmitting"
                  size="large"
                >
                  <icon-send v-if="formData.contentType === 'notification'" />
                  <IconUpload v-else />
                  {{ getSubmitButtonText() }}
                </a-button>
              </div>
            </div>
          </a-card>
        </a-form>
        <a-modal
          v-model:visible="previewVisible"
          :footer="false"
          :title="null"
          width="800px"
          class="notification-detail-modal"
        >
          <div v-if="previewNotification" class="home-notification-detail">
            <NotificationDetailContent :notification="previewNotification" variant="home" />
          </div>
        </a-modal>
      </div>
    </div>
    <!-- 用户组管理弹窗 -->
    <a-modal
      v-model:visible="groupModalVisible"
      title="用户组管理"
      width="600px"
      :footer="false"
    >
      <div class="group-management">
        <div class="group-list">
          <a-list>
            <template #header>
              <div class="list-header">
                <span>现有用户组</span>
                <a-button type="text" size="small" @click="resetGroupForm">
                  <IconPlus /> 新增
                </a-button>
              </div>
            </template>
            <a-list-item v-for="group in userGroups" :key="group.value">
              <div class="group-item">
                <span class="group-name">{{ group.label }}</span>
                <div class="group-actions">
                  <a-button type="text" size="small" @click="handleEditGroup(group)">
                    <IconEdit /> 编辑
                  </a-button>
                  <a-popconfirm content="确定删除该用户组吗？" @ok="handleDeleteGroup(group.value)">
                    <a-button type="text" status="danger" size="small">
                      <IconDelete /> 删除
                    </a-button>
                  </a-popconfirm>
                </div>
              </div>
            </a-list-item>
          </a-list>
        </div>
        
        <div class="group-form">
          <div class="form-title">{{ editingGroup ? '编辑用户组' : '新增用户组' }}</div>
          <a-form :model="newGroupForm" layout="vertical">
            <a-form-item field="name" label="用户组名称" required>
              <a-input v-model="newGroupForm.name" placeholder="请输入用户组名称" />
            </a-form-item>
            <a-form-item field="members" label="组成员" required>
              <a-select
                v-model="newGroupForm.members"
                placeholder="请选择成员"
                multiple
                allow-search
              >
                <a-option 
                  v-for="user in mockUserList" 
                  :key="user.id" 
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.department }})
                </a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSaveGroup">保存</a-button>
                <a-button @click="resetGroupForm">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconBold,
  IconItalic,
  IconCode,
  IconList,
  IconUpload,
  IconFile,
  IconNotification,
  IconSettings,
  IconEdit,
  IconPen,
  IconEye,
  IconCalendar,
  IconPushpin,
  IconPlus,
  IconInfoCircle,
  IconCheckCircle,
  IconExclamationCircle,
  IconStorage,
  IconUserGroup,
  IconSave,
  IconDelete
} from '@arco-design/web-vue/es/icon'
import type { 
  Notification, 
  NotificationAttachment, 
  ResourceCategory,
} from '@/types/community'
import { NotificationType, DATA_ASSET_OPTIONS } from '@/types/community'
import { 
  getNoticeTypeLabel, 
  getNoticeTypeColor, 
  getNoticeTypeIcon,
  NOTICE_TYPE_OPTIONS,
  ARCHIVE_CATEGORY_TREE
} from '@/constants/notification'
import NotificationAPI from '@/api/notification'
import { marked } from 'marked'
import NotificationDetailContent from '@/components/community/NotificationDetailContent.vue'
import { listDocs } from '@/api/docsLocal'

// 路由
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref()
const contentEditor = ref()
const uploadRef = ref()

// 响应式数据
const isEdit = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const isSaving = ref(false)
const fileList = ref<any[]>([])
const attachmentEnabled = ref(true) // 附件管理开关，默认开启
const publishSettingsEnabled = ref(true) // 发布设置开关，默认开启
const docIndex = ref<{ slug: string; title: string }[]>([])

// 模拟用户数据
const mockUserList = [
  { id: 'user-1', name: '系统管理员', department: '技术部' },
  { id: 'user-2', name: '内容编辑员', department: '运营部' },
  { id: 'user-3', name: '张三', department: '数据部' },
  { id: 'user-4', name: '李四', department: '产品部' },
  { id: 'user-5', name: '王五', department: '销售部' },
  { id: 'user-6', name: '赵六', department: '客服部' },
  { id: 'user-7', name: '钱七', department: '财务部' }
]

// 用户组管理
const userGroups = ref([
  { label: '全体用户', value: 'all', members: [] as string[] },
  { label: '数据分析师', value: 'analysts', members: ['user-3'] },
  { label: '开发人员', value: 'developers', members: ['user-1'] },
  { label: '产品经理', value: 'managers', members: ['user-4'] }
])

const goToUserGroupManagement = () => {
  router.push({ name: 'AdminUserGroups' })
}

// 表单数据
const formData = ref<Partial<Notification> & { 
  contentType: string, 
  docSource: string,
  categoryPath: string[],
  notificationType?: string,
  target?: string[],
  associatedDocSlug?: string 
}>({
  contentType: 'notification', // 默认为发送通知模式
  docSource: 'upload', // 默认为本地上传
  notificationType: 'general',
  title: '',
  categoryPath: [], // 级联选择器的值
  content: '',
  isSticky: false,
  isPublic: true,
  allowComments: false, // 默认关闭评论功能
  publishTime: undefined,
  expireTime: undefined,
  attachments: [],
  serviceType: '',
  targetTable: '',
  dataAssets: [],
  target: []
})

// 字数统计
const contentWordCount = computed(() => {
  return formData.value.content ? formData.value.content.length : 0
})

// Markdown 渲染
const renderedContent = computed(() => {
  if (!formData.value.content) {
    return '<div class="empty-preview">开始输入内容以查看预览...</div>'
  }
  try {
    return marked(formData.value.content)
  } catch (error) {
    return '<div class="error-preview">预览渲染出错</div>'
  }
})

// 是否显示数据服务特有字段
const showDataServiceFields = computed(() => {
  const path = formData.value.categoryPath
  const isDataAssetChange = Array.isArray(path) && 
         path.length >= 2 && 
         path[0] === 'data_service' && 
         path[1] === 'data_asset_change'
  return formData.value.contentType === 'notification' && isDataAssetChange
})

const previewVisible = ref(false)
const previewNotification = computed(() => {
  if (formData.value.contentType !== 'notification') return null
  const now = new Date().toISOString()
  return {
    id: 'preview',
    title: formData.value.title || '（未填写标题）',
    content: renderedContent.value,
    type: formData.value.categoryPath?.[1] || '',
    categoryId: formData.value.categoryPath?.[0] || '',
    author: '数据社区运营团队',
    sender: '数据社区运营团队',
    publishTime: formData.value.publishTime || now,
    createdAt: now,
    updatedAt: now,
    attachments: (formData.value as any).attachments || []
  }
})

const handlePreview = () => {
  previewVisible.value = true
}

// 动态表单验证规则
const formRules = computed(() => {
  const baseRules = {
    contentType: [
      { required: true, message: '请选择内容类型' }
    ],
    title: [
      { required: true, message: '请输入标题' },
      { minLength: 2, message: '标题至少2个字符' },
      { maxLength: 100, message: '标题不能超过100个字符' }
    ]
  }

  // 根据内容类型添加不同的验证规则
  if (formData.value.contentType === 'notification') {
    const rules: any = {
      ...baseRules,
      content: [
        { required: true, message: '请输入正文内容' },
        { minLength: 10, message: '正文内容至少10个字符' }
      ],
      categoryPath: [
        { required: true, message: '请选择内容分类' },
        { 
          validator: (value: any) => {
            return Array.isArray(value) && value.length === 2
          }, 
          message: '请选择完整的分类路径' 
        }
      ],
      target: [
        { required: true, message: '请选择通知对象' }
      ]
    }

    // Data Service Validation
    if (showDataServiceFields.value) {
      rules.dataAssets = [{ required: true, message: '请选择或输入变更的数据资产' }]
    }

    return rules
  } else if (formData.value.contentType === 'document') {
    const rules: any = { ...baseRules }
    
    if (formData.value.docSource === 'upload') {
      rules.attachments = [
        { 
          validator: () => {
            return fileList.value && fileList.value.length > 0
          }, 
          message: '文档模式下至少需要上传一个文件' 
        }
      ]
    }
    
    return rules
  }

  return baseRules
})

// 级联选择器选项 - 基于归档分类树形结构
const categoryOptions = ARCHIVE_CATEGORY_TREE

// 方法
const insertMarkdown = (prefix: string, suffix: string) => {
  const textarea = contentEditor.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = formData.value.content || ''
  
  const before = content.substring(0, start)
  const selected = content.substring(start, end)
  const after = content.substring(end)
  
  formData.value.content = before + prefix + selected + suffix + after
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, end + prefix.length)
  })
}

const handleContentChange = () => {
  // 内容变化时的处理逻辑
}

// 内容类型切换处理
const handleContentTypeChange = (value: string) => {
  console.log('Content type changed to:', value) // 调试信息
  if (value === 'document') {
    // 切换到文档模式
    Message.info('已切换到文档模式')
    // 确保附件管理开启
    attachmentEnabled.value = true
  } else if (value === 'notification') {
    // 切换到通知模式
    Message.info('已切换到通知发布模式，请填写正文内容')
  }
}



const insertText = (text: string) => {
  const textarea = contentEditor.value?.$el?.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = formData.value.content || ''
  
  formData.value.content = content.substring(0, start) + text + content.substring(end)
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  })
}

const beforeUpload = (file: File) => {
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
    Message.error('只支持 PDF、Office文档、文本文件等格式')
    return false
  }
  
  const isValidSize = file.size / 1024 / 1024 < 10
  if (!isValidSize) {
    Message.error('文件大小不能超过10MB')
    return false
  }
  
  return true
}

const handleUpload = (option: any) => {
  const { file } = option
  
  // 模拟上传过程
  setTimeout(() => {
    const attachment: NotificationAttachment = {
      id: `att-${Date.now()}`,
      notificationId: '',
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      mimeType: file.type,
      fileUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user'
    }
    
    formData.value.attachments = formData.value.attachments || []
    formData.value.attachments.push(attachment)
    
    option.onSuccess()
    Message.success('文件上传成功')
  }, 1000)
}

const handleRemove = (file: any) => {
  const index = fileList.value.findIndex((item: any) => item.uid === file.uid)
  if (index > -1) {
    formData.value.attachments?.splice(index, 1)
  }
}

const handleSubmit = async () => {
  try {
    // 额外的业务逻辑验证
    if (formData.value.contentType === 'document') {
      if (formData.value.docSource === 'upload') {
        if (!fileList.value || fileList.value.length === 0) {
          Message.error('文档模式下必须上传至少一个文件')
          return
        }
      } else if (formData.value.docSource === 'system') {
        if (!formData.value.associatedDocSlug) {
          Message.error('请选择关联的系统文档')
          return
        }
      }
    } else if (formData.value.contentType === 'notification') {
      if (!formData.value.content || formData.value.content.trim().length < 10) {
        Message.error('通知模式下必须填写正文内容（至少10个字符）')
        return
      }
    }
    
    const valid = await formRef.value.validate()
    if (!valid) return
    
    isSubmitting.value = true
    
    // 根据内容类型处理不同的数据结构
    let submitData: any = {
      ...formData.value
    }
    
    if (formData.value.contentType === 'notification') {
      // 通知模式：处理级联选择器的值，转换为后端需要的格式
      submitData = {
        ...submitData,
        categoryId: formData.value.categoryPath?.[0] || '', // 一级分类
        type: formData.value.categoryPath?.[1] || '', // 二级分类
      }
      // 移除级联选择器字段
      delete submitData.categoryPath
    } else if (formData.value.contentType === 'document') {
      // 文档模式：只保留必要字段
      submitData = {
        title: formData.value.title,
        content: formData.value.content,
        attachments: formData.value.attachments,
        contentType: formData.value.contentType,
        isPublic: true, // 文档默认公开
        publishTime: new Date().toISOString() // 立即发布
      }
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const successMessage = formData.value.contentType === 'document' 
      ? (isEdit.value ? '文档更新成功' : '文档上传成功')
      : (isEdit.value ? '通知更新成功' : '通知发布成功')
    
    Message.success(successMessage)
    
    // 统一跳转到通知列表页面
    router.push('/admin/notifications')
  } catch (error) {
    Message.error('操作失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleSaveDraft = async () => {
  try {
    isSaving.value = true
    
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success('草稿保存成功')
  } catch (error) {
    Message.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/notifications')
}

const loadNotification = async (id: string) => {
  try {
    // 获取通知详情
    const response = await NotificationAPI.getNotification(id)
    if (response.success && response.data) {
      const notification = response.data
      Object.assign(formData.value, notification)
      
      // 处理分类路径转换逻辑 (categoryId -> categoryPath)
      if (notification.categoryId && (!formData.value.categoryPath || formData.value.categoryPath.length === 0)) {
        const categoryMap: Record<string, string[]> = {
          '1': ['notification', 'notification-1'],
          '2': ['notification', 'notification-2'],
          '3': ['notification', 'notification-3'],
          '4': ['notification', 'notification-4'],
          '5': ['notification', 'notification-5'],
          '6': ['notification', 'notification-6']
        }
        const mappedPath = categoryMap[notification.categoryId]
        if (mappedPath) {
          formData.value.categoryPath = [...mappedPath]
        }
      }
      
      // 加载附件到文件列表
      if (notification.documents) {
        fileList.value = notification.documents.map((att) => ({
          uid: att.id,
          name: att.fileName,
          status: 'done',
          url: att.filePath
        }))
      }
    }
  } catch (error) {
    console.error('加载通知失败:', error)
    Message.error('获取通知详情失败')
  }
}

// 获取提交按钮文本
const getSubmitButtonText = () => {
  if (isEdit.value) {
    return formData.value.contentType === 'document' ? '更新文档' : '更新内容'
  } else {
    return formData.value.contentType === 'document' ? '上传文档' : '发布'
  }
}

// 键盘快捷键支持
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+S 或 Cmd+S 保存草稿
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (formData.value.contentType === 'notification') {
      handleSaveDraft()
    }
  }
  
  // Ctrl+Enter 或 Cmd+Enter 提交表单
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}

// 生命周期
onMounted(async () => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  
  try {
    docIndex.value = await listDocs()
  } catch {}
  
  if (isEdit.value) {
    await loadNotification(route.params.id as string)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.notification-form-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0;
}

.form-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 24px;
}

.breadcrumb {
  margin-bottom: 12px;
}

.header-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.new-content-tag {
  font-size: 12px;
}

.form-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.main-panel {
  flex: 1;
  min-width: 0;
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片样式 */
.content-type-card,
.basic-info-card,
.content-editor-card,
.preview-card,
.attachment-card,
.publish-settings-card,
.action-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e6eb;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.content-type-card:hover,
.basic-info-card:hover,
.content-editor-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.card-title-with-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
}

.word-count {
  margin-left: auto;
  font-size: 12px;
  color: #86909c;
  font-weight: normal;
}

.required-mark {
  color: #f53f3f;
  margin-left: 4px;
}

.mode-alert {
  margin-bottom: 16px;
}

/* 表单行布局 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* 内容类型选择器 */
.content-type-selector {
  width: 100%;
}

.type-option {
  flex: 1;
  margin-right: 16px;
}

.type-option:last-child {
  margin-right: 0;
}

.content-type-selector :deep(.arco-radio) {
  width: 100%;
  height: auto;
}

.content-type-selector :deep(.arco-radio-button) {
  width: 100%;
  height: auto;
  padding: 0;
  border-radius: 8px;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
}

.radio-icon {
  font-size: 20px;
  color: #4e5969;
}

.radio-text {
  flex: 1;
}

.radio-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.radio-desc {
  font-size: 12px;
  color: #86909c;
}

/* 表单字段 */
.title-field,
.category-field,
.content-field {
  margin-bottom: 0;
}

.content-field :deep(.arco-form-item-content) {
  width: 100%;
}

.content-field :deep(.arco-textarea-wrapper) {
  width: 100% !important;
}

.title-input,
.category-selector {
  font-size: 16px;
}

/* 内容编辑器 */
.editor-container {
  position: relative;
  width: 100%;
}

.content-editor {
  font-size: 14px;
  line-height: 1.6;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
  min-height: 300px;
  width: 100% !important;
  box-sizing: border-box;
}

.editor-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 6px;
  padding: 4px;
  border: 1px solid #e5e6eb;
  z-index: 10;
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f2f7ff;
}

.upload-icon {
  font-size: 48px;
  color: #86909c;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  color: #1d2129;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  color: #86909c;
}

/* 发布设置网格 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-item {
  margin-bottom: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 12px;
}

.right-actions {
  margin-left: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-layout {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .form-layout {
    padding: 0 12px;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .left-actions,
  .right-actions {
    width: 100%;
    justify-content: center;
  }
}

.preview-content {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  font-size: 14px;
  line-height: 1.6;
}

.empty-preview {
  color: #86909c;
  text-align: center;
  padding: 40px 20px;
  font-style: italic;
}

.error-preview {
  color: #f53f3f;
  text-align: center;
  padding: 40px 20px;
}

.preview-content :deep(h1) {
  font-size: 20px;
  margin: 16px 0 8px 0;
  color: #1d2129;
}

.preview-content :deep(h2) {
  font-size: 18px;
  margin: 14px 0 6px 0;
  color: #1d2129;
}

.preview-content :deep(h3) {
  font-size: 16px;
  margin: 12px 0 4px 0;
  color: #1d2129;
}

.preview-content :deep(p) {
  margin: 8px 0;
  color: #4e5969;
}

.preview-content :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.preview-content :deep(li) {
  margin: 4px 0;
  color: #4e5969;
}

.preview-content :deep(code) {
  background: #f2f3f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.preview-content :deep(strong) {
  font-weight: 600;
  color: #1d2129;
}

/* 附件上传 */
.attachment-content {
  padding-top: 16px;
}

.attachment-field {
  margin-bottom: 16px;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 2px dashed #c9cdd4;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f2f7ff;
}

.upload-icon {
  font-size: 24px;
  color: #86909c;
}

.upload-text {
  flex: 1;
}

.upload-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
}

.upload-desc {
  font-size: 12px;
  color: #86909c;
}

.upload-tips {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 6px;
}

.tip-title {
  font-weight: 500;
}

/* 发布设置 */
.publish-settings-content {
  padding-top: 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1d2129;
}

.time-picker {
  width: 100%;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  min-width: 80px;
}

.draft-btn {
  min-width: 100px;
}

.submit-btn {
  min-width: 80px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-layout {
    max-width: 100%;
  }
  
  .right-panel {
    width: 350px;
  }
}

@media (max-width: 992px) {
  .form-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-panel {
    width: 100%;
  }
  
  .content-editor {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .form-layout {
    padding: 0 16px;
  }
  
  .form-header {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .radio-content {
    padding: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .cancel-btn,
  .draft-btn,
  .submit-btn {
    width: 100%;
  }
}

/* 动画效果 */
.content-type-card,
.basic-info-card,
.content-editor-card,
.preview-card,
.attachment-card,
.publish-settings-card,
.action-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.preview-content::-webkit-scrollbar {
  width: 6px;
}

.preview-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.preview-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.preview-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.group-management {
  display: flex;
  gap: 20px;
  height: 400px;
}

.group-list {
  flex: 1;
  border-right: 1px solid var(--color-border);
  padding-right: 20px;
  overflow-y: auto;
}

.group-form {
  flex: 1;
  padding-left: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: var(--color-text-1);
}
</style>
