<template>
  <div class="edit-notification-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-breadcrumb>
          <a-breadcrumb-item @click="$router.push('/admin/notifications')">
            通知管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>编辑通知</a-breadcrumb-item>
        </a-breadcrumb>
        <h1 class="page-title">编辑通知</h1>
        <p class="page-description">修改通知内容和设置</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button @click="handleSaveDraft" :loading="savingDraft">
            保存草稿
          </a-button>
          <a-button type="primary" @click="handlePublish" :loading="publishing">
            更新发布
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" tip="加载通知数据中..." />
    </div>

    <!-- 编辑表单 -->
    <div v-else class="edit-form-container">
      <a-row :gutter="24">
        <!-- 主要内容区 -->
        <a-col :span="16">
          <a-card class="content-card">
            <template #title>
              <span>通知内容</span>
            </template>

            <a-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              layout="vertical"
            >
              <a-form-item field="title" label="通知标题" required>
                <a-input
                  v-model="formData.title"
                  placeholder="请输入通知标题"
                  :max-length="100"
                  show-word-limit
                />
              </a-form-item>

              <a-form-item field="summary" label="通知摘要">
                <a-textarea
                  v-model="formData.summary"
                  placeholder="请输入通知摘要，用于在列表中展示"
                  :max-length="200"
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                  show-word-limit
                />
              </a-form-item>

              <a-form-item field="content" label="通知内容" required>
                <div class="editor-container">
                  <a-textarea
                    v-model="formData.content"
                    placeholder="请输入通知内容，支持Markdown格式"
                    :auto-size="{ minRows: 10, maxRows: 20 }"
                    class="content-editor"
                  />
                  <div class="editor-toolbar">
                    <a-space>
                      <a-button size="small" @click="insertMarkdown('**', '**')">
                        <template #icon><icon-bold /></template>
                        粗体
                      </a-button>
                      <a-button size="small" @click="insertMarkdown('*', '*')">
                        <template #icon><icon-italic /></template>
                        斜体
                      </a-button>
                      <a-button size="small" @click="insertMarkdown('`', '`')">
                        <template #icon><icon-code /></template>
                        代码
                      </a-button>
                      <a-button size="small" @click="insertMarkdown('[', '](url)')">
                        <template #icon><icon-link /></template>
                        链接
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </a-form-item>

              <a-form-item field="tags" label="标签">
                <a-input-tag
                  v-model="formData.tags"
                  placeholder="输入标签后按回车添加"
                  :max-tag-count="5"
                  allow-clear
                />
              </a-form-item>
            </a-form>
          </a-card>

          <!-- 附件上传 -->
          <a-card class="attachment-card" title="附件">
            <a-upload
              ref="uploadRef"
              :file-list="fileList"
              :custom-request="handleUpload"
              :on-before-upload="beforeUpload"
              @change="handleFileChange"
              multiple
              draggable
            >
              <template #upload-button>
                <div class="upload-area">
                  <div class="upload-icon">
                    <icon-upload />
                  </div>
                  <div class="upload-text">
                    <div>点击或拖拽文件到此区域上传</div>
                    <div class="upload-tip">支持单个或批量上传，文件大小不超过10MB</div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-card>
        </a-col>

        <!-- 侧边栏设置 -->
        <a-col :span="8">
          <a-card class="settings-card" title="发布设置">
            <a-form :model="formData" layout="vertical">
              <a-form-item field="categoryId" label="通知分类" required>
                <a-select
                  v-model="formData.categoryId"
                  placeholder="请选择通知分类"
                  :loading="categoriesLoading"
                >
                  <a-option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                    :label="category.name"
                  >
                    <a-tag :color="category.color" size="small">
                      {{ category.name }}
                    </a-tag>
                  </a-option>
                </a-select>
              </a-form-item>

              <a-form-item field="priority" label="优先级">
                <a-select v-model="formData.priority" placeholder="请选择优先级">
                  <a-option value="low">
                    <a-space>
                      <a-tag color="green" size="small">低</a-tag>
                      <span>普通通知</span>
                    </a-space>
                  </a-option>
                  <a-option value="medium">
                    <a-space>
                      <a-tag color="orange" size="small">中</a-tag>
                      <span>重要通知</span>
                    </a-space>
                  </a-option>
                  <a-option value="high">
                    <a-space>
                      <a-tag color="red" size="small">高</a-tag>
                      <span>紧急通知</span>
                    </a-space>
                  </a-option>
                </a-select>
              </a-form-item>

              <a-form-item field="isTop" label="置顶设置">
                <a-switch
                  v-model="formData.isTop"
                  checked-text="置顶"
                  unchecked-text="普通"
                />
                <div class="form-tip">置顶通知将显示在列表顶部</div>
              </a-form-item>

              <a-form-item field="publishTime" label="发布时间">
                <a-date-picker
                  v-model="formData.publishTime"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择发布时间"
                  style="width: 100%"
                />
                <div class="form-tip">留空则立即发布</div>
              </a-form-item>
            </a-form>
          </a-card>

          <!-- 预览卡片 -->
          <a-card class="preview-card" title="预览">
            <div class="notification-preview">
              <div class="preview-header">
                <div class="preview-title">
                  {{ formData.title || '通知标题' }}
                </div>
                <div class="preview-meta">
                  <a-space>
                    <a-tag
                      v-if="selectedCategory"
                      :color="selectedCategory.color"
                      size="small"
                    >
                      {{ selectedCategory.name }}
                    </a-tag>
                    <a-tag
                      :color="getPriorityColor(formData.priority)"
                      size="small"
                    >
                      {{ getPriorityText(formData.priority) }}
                    </a-tag>
                    <span v-if="formData.isTop" class="top-badge">置顶</span>
                  </a-space>
                </div>
              </div>
              <div class="preview-summary">
                {{ formData.summary || '通知摘要' }}
              </div>
              <div class="preview-content">
                {{ formData.content ? formData.content.substring(0, 100) + '...' : '通知内容预览' }}
              </div>
              <div class="preview-tags" v-if="formData.tags && formData.tags.length">
                <a-tag
                  v-for="tag in formData.tags"
                  :key="tag"
                  size="small"
                  color="arcoblue"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconBold,
  IconItalic,
  IconCode,
  IconLink,
  IconUpload
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI } from '../../../api/notification'

const router = useRouter()
const route = useRoute()
const notificationAPI = new NotificationAPI()

// 获取通知ID
const notificationId = route.params.id

// 响应式数据
const loading = ref(true)
const savingDraft = ref(false)
const publishing = ref(false)
const categoriesLoading = ref(false)
const formRef = ref()
const uploadRef = ref()

// 表单数据
const formData = reactive({
  title: '',
  summary: '',
  content: '',
  tags: [],
  categoryId: '',
  priority: 'medium',
  isTop: false,
  publishTime: null,
  attachments: []
})

// 文件列表
const fileList = ref([])

// 分类数据
const categories = ref([])

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入通知标题' },
    { minLength: 2, message: '标题至少2个字符' },
    { maxLength: 100, message: '标题不能超过100个字符' }
  ],
  content: [
    { required: true, message: '请输入通知内容' },
    { minLength: 10, message: '内容至少10个字符' }
  ],
  categoryId: [
    { required: true, message: '请选择通知分类' }
  ]
}

// 计算属性
const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === formData.categoryId)
})

// 方法定义
const fetchNotificationData = async () => {
  loading.value = true
  try {
    const response = await notificationAPI.getNotification(notificationId)
    if (response.success) {
      const notification = response.data
      
      // 填充表单数据
      Object.assign(formData, {
        title: notification.title,
        summary: notification.summary || '',
        content: notification.content,
        tags: notification.tags || [],
        categoryId: notification.categoryId,
        priority: notification.priority || 'medium',
        isTop: notification.isTop || false,
        publishTime: notification.publishTime ? new Date(notification.publishTime) : null,
        attachments: notification.attachments || []
      })

      // 设置文件列表
      if (notification.attachments && notification.attachments.length > 0) {
        fileList.value = notification.attachments.map(file => ({
          uid: file.id,
          name: file.name,
          url: file.url,
          status: 'done'
        }))
      }
    } else {
      Message.error(response.message || '获取通知数据失败')
      router.push('/admin/notifications')
    }
  } catch (error) {
    console.error('获取通知数据失败:', error)
    Message.error('获取通知数据失败')
    router.push('/admin/notifications')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    const response = await notificationAPI.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    categoriesLoading.value = false
  }
}

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  savingDraft.value = true
  try {
    const submitData = {
      ...formData,
      status: 'draft',
      publishTime: formData.publishTime ? formData.publishTime.toISOString() : null
    }

    const response = await notificationAPI.updateNotification(notificationId, submitData)
    if (response.success) {
      Message.success('保存草稿成功')
    } else {
      Message.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    Message.error('保存失败')
  } finally {
    savingDraft.value = false
  }
}

const handlePublish = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  publishing.value = true
  try {
    const submitData = {
      ...formData,
      status: 'published',
      publishTime: formData.publishTime ? formData.publishTime.toISOString() : new Date().toISOString()
    }

    const response = await notificationAPI.updateNotification(notificationId, submitData)
    if (response.success) {
      Message.success('更新发布成功')
      router.push('/admin/notifications')
    } else {
      Message.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    Message.error('发布失败')
  } finally {
    publishing.value = false
  }
}

const handleCancel = () => {
  Modal.confirm({
    title: '确认离开',
    content: '当前有未保存的修改，确定要离开吗？',
    onOk: () => {
      router.push('/admin/notifications')
    }
  })
}

const insertMarkdown = (prefix, suffix = '') => {
  const textarea = document.querySelector('.content-editor textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.content.substring(start, end)
  const replacement = prefix + selectedText + suffix

  formData.content = 
    formData.content.substring(0, start) + 
    replacement + 
    formData.content.substring(end)

  // 重新设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selectedText.length
    )
  }, 0)
}

const beforeUpload = (file) => {
  const isValidType = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ].includes(file.type)

  if (!isValidType) {
    Message.error('只支持图片、PDF、Word、Excel文件')
    return false
  }

  const isValidSize = file.size / 1024 / 1024 < 10
  if (!isValidSize) {
    Message.error('文件大小不能超过10MB')
    return false
  }

  return true
}

const handleUpload = async (option) => {
  try {
    const response = await notificationAPI.uploadFile(option.fileItem.file)
    if (response.success) {
      option.onSuccess(response.data)
      formData.attachments.push(response.data)
    } else {
      option.onError(new Error(response.message || '上传失败'))
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    option.onError(error)
  }
}

const handleFileChange = (fileList, fileItem) => {
  if (fileItem.status === 'error') {
    Message.error(`文件 ${fileItem.name} 上传失败`)
  }
}

// 工具方法
const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  }
  return colors[priority] || 'blue'
}

const getPriorityText = (priority) => {
  const texts = {
    low: '低优先级',
    medium: '中优先级',
    high: '高优先级'
  }
  return texts[priority] || '普通'
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    fetchNotificationData(),
    fetchCategories()
  ])
})
</script>

<style scoped>
.edit-notification-page {
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
  margin: 8px 0 8px 0;
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 8px;
}

.edit-form-container {
  gap: 16px;
}

.content-card,
.attachment-card,
.settings-card,
.preview-card {
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-container {
  position: relative;
}

.content-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.editor-toolbar {
  margin-top: 8px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #165dff;
  background-color: #f2f3ff;
}

.upload-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-tip {
  color: #86909c;
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.notification-preview {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.preview-header {
  margin-bottom: 12px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-badge {
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.preview-summary {
  color: #4e5969;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.preview-content {
  color: #86909c;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  cursor: pointer;
}

:deep(.arco-breadcrumb-item-link:hover) {
  color: #0e42d2;
}

:deep(.arco-form-item-label) {
  font-weight: 600;
}

:deep(.arco-textarea-wrapper) {
  border-radius: 6px;
}

:deep(.arco-select-view-single) {
  border-radius: 6px;
}

:deep(.arco-input-wrapper) {
  border-radius: 6px;
}

:deep(.arco-picker) {
  border-radius: 6px;
}
</style>