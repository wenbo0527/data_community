<template>
  <div class="notification-create-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-breadcrumb>
          <a-breadcrumb-item @click="$router.push('/admin/notifications')">
            通知管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ isEdit ? '编辑通知' : '新建通知' }}</a-breadcrumb-item>
        </a-breadcrumb>
        <h1 class="page-title">{{ isEdit ? '编辑通知' : '新建通知' }}</h1>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button @click="handleSaveDraft" :loading="saving">保存草稿</a-button>
          <a-button type="primary" @click="handlePublish" :loading="publishing">
            {{ isEdit ? '更新并发布' : '发布' }}
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <a-row :gutter="16">
        <!-- 主要内容区 -->
        <a-col :span="18">
          <a-card title="基本信息" class="form-card">
            <a-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              layout="vertical"
              @submit="handleSubmit"
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
                  placeholder="请输入通知摘要，用于列表展示"
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
                      <a-button size="small" @click="insertMarkdown('- ', '')">
                        <template #icon><icon-list /></template>
                        列表
                      </a-button>
                      <a-button size="small" @click="insertMarkdown('[链接文字](', ')')">
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
                  :max-tag-count="10"
                  allow-clear
                />
              </a-form-item>
            </a-form>
          </a-card>

          <!-- 附件上传 -->
          <a-card title="附件管理" class="form-card">
            <a-upload
              ref="uploadRef"
              :file-list="fileList"
              :custom-request="handleUpload"
              :on-before-upload="beforeUpload"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              :on-remove="onRemoveFile"
              multiple
              drag
            >
              <template #upload-button>
                <div class="upload-area">
                  <div class="upload-icon">
                    <icon-cloud-upload />
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
        <a-col :span="6">
          <a-card title="发布设置" class="form-card">
            <a-form :model="formData" layout="vertical">
              <a-form-item field="categoryId" label="通知分类" required>
                <a-select
                  v-model="formData.categoryId"
                  placeholder="请选择分类"
                  allow-clear
                >
                  <a-option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    <a-space>
                      <a-tag :color="category.color" size="small">
                        {{ category.name }}
                      </a-tag>
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

            </a-form>
          </a-card>

          <!-- 预览卡片 -->
          <a-card title="预览" class="form-card">
            <div class="preview-content">
              <div class="preview-title">
                {{ formData.title || '通知标题' }}
                <a-tag v-if="formData.isTop" color="red" size="small">置顶</a-tag>
              </div>
              <div class="preview-meta">
                <a-space>
                  <a-tag
                    v-if="formData.categoryId"
                    :color="getCategoryColor(formData.categoryId)"
                    size="small"
                  >
                    {{ getCategoryName(formData.categoryId) }}
                  </a-tag>

                </a-space>
              </div>
              <div class="preview-summary">
                {{ formData.summary || '通知摘要' }}
              </div>
              <div class="preview-tags" v-if="formData.tags && formData.tags.length > 0">
                <a-tag
                  v-for="tag in formData.tags"
                  :key="tag"
                  size="small"
                  style="margin: 2px"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconBold,
  IconItalic,
  IconCode,
  IconList,
  IconLink,
  IconUpload
} from '@arco-design/web-vue/es/icon'
import { NotificationAPI } from '../../../api/notification'

const router = useRouter()
const route = useRoute()
const notificationAPI = new NotificationAPI()

// 响应式数据
const formRef = ref()
const uploadRef = ref()
const saving = ref(false)
const publishing = ref(false)
const categories = ref([])
const fileList = ref([])

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)
const copyFromId = computed(() => route.query.copyFrom)

// 表单数据
const formData = reactive({
  title: '',
  summary: '',
  content: '',
  categoryId: '',
  isTop: false,
  publishTime: '',
  tags: [],
  attachments: []
})

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

// 方法定义
const fetchCategories = async () => {
  try {
    const response = await notificationAPI.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const fetchNotificationData = async (id) => {
  try {
    const response = await notificationAPI.getNotificationById(id)
    if (response.success) {
      const data = response.data
      Object.keys(formData).forEach(key => {
        if (data[key] !== undefined) {
          formData[key] = data[key]
        }
      })
      
      // 处理附件
      if (data.attachments && data.attachments.length > 0) {
        fileList.value = data.attachments.map(file => ({
          uid: file.id,
          name: file.name,
          url: file.url,
          status: 'done',
          response: file
        }))
      }
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    Message.error('获取通知详情失败')
  }
}

const handleCancel = () => {
  Modal.confirm({
    title: '确认离开',
    content: '当前有未保存的内容，确定要离开吗？',
    onOk: () => {
      router.push('/admin/notifications')
    }
  })
}

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  saving.value = true
  try {
    const submitData = {
      ...formData,
      status: 'draft',
      attachments: fileList.value
        .filter(file => file.status === 'done')
        .map(file => file.response)
    }

    let response
    if (isEdit.value) {
      response = await notificationAPI.updateNotification(route.params.id, submitData)
    } else {
      response = await notificationAPI.createNotification(submitData)
    }

    if (response.success) {
      Message.success('保存成功')
      router.push('/admin/notifications')
    } else {
      Message.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    Message.error('保存失败')
  } finally {
    saving.value = false
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
      attachments: fileList.value
        .filter(file => file.status === 'done')
        .map(file => file.response)
    }

    let response
    if (isEdit.value) {
      response = await notificationAPI.updateNotification(route.params.id, submitData)
    } else {
      response = await notificationAPI.createNotification(submitData)
    }

    if (response.success) {
      Message.success(isEdit.value ? '更新并发布成功' : '发布成功')
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

const insertMarkdown = (prefix, suffix) => {
  const textarea = document.querySelector('.content-editor textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.content.substring(start, end)
  const newText = prefix + selectedText + suffix

  formData.content = 
    formData.content.substring(0, start) + 
    newText + 
    formData.content.substring(end)

  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    const newCursorPos = start + prefix.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

// 文件上传相关方法
const beforeUpload = (file) => {
  const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
  if (!isValidSize) {
    Message.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const handleUpload = async (option) => {
  try {
    const response = await notificationAPI.uploadFile(option.file)
    if (response.success) {
      option.onSuccess(response.data)
    } else {
      option.onError(new Error(response.message || '上传失败'))
    }
  } catch (error) {
    option.onError(error)
  }
}

const onUploadSuccess = (response, file) => {
  Message.success(`${file.name} 上传成功`)
}

const onUploadError = (error, file) => {
  Message.error(`${file.name} 上传失败`)
}

const onRemoveFile = (file) => {
  return true
}

// 工具方法
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || '未分类'
}

const getCategoryColor = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.color || 'blue'
}



// 生命周期
onMounted(async () => {
  await fetchCategories()
  
  if (isEdit.value) {
    await fetchNotificationData(route.params.id)
  } else if (copyFromId.value) {
    await fetchNotificationData(copyFromId.value)
    // 清除ID相关字段，作为新建处理
    formData.id = undefined
    formData.title = `${formData.title} - 副本`
  }
})
</script>

<style scoped>
.notification-create-page {
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
  margin: 8px 0 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.header-right {
  flex-shrink: 0;
}

.form-container {
  max-width: 1200px;
}

.form-card {
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
  padding: 8px;
  background-color: #f7f8fa;
  border-radius: 4px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.upload-text {
  color: #86909c;
}

.upload-tip {
  font-size: 12px;
  margin-top: 4px;
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.preview-content {
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-meta {
  margin-bottom: 8px;
}

.preview-summary {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.5;
  margin-bottom: 8px;
}

.preview-tags {
  margin-top: 8px;
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

:deep(.arco-upload-list-item) {
  margin-top: 8px;
}

:deep(.arco-form-item-label) {
  font-weight: 600;
}
</style>