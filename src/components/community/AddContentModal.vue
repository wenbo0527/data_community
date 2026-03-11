<template>
  <a-modal
    v-model:visible="visible"
    title="新增内容"
    width="900px"
    :mask-closable="false"
    :esc-to-close="false"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
      @submit="handleSubmit"
    >
      <!-- 是否发送通知开关 -->
      <a-form-item label="发送方式">
        <a-radio-group v-model="sendNotification" @change="handleSendModeChange">
          <a-radio :value="false">仅上传文档</a-radio>
          <a-radio :value="true">发送通知</a-radio>
        </a-radio-group>
        <div class="field-tip">选择"发送通知"将同时上传文档并发送通知给用户</div>
      </a-form-item>

      <a-divider />

      <!-- 基本信息 -->
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item field="title" label="标题" required>
            <a-input 
              v-model="formData.title" 
              placeholder="请输入内容标题"
              :max-length="100"
              show-word-limit
            />
          </a-form-item>
        </a-col>

        <!-- 通知相关字段 - 仅在发送通知时显示 -->
        <template v-if="sendNotification">
          <a-col :span="24">
            <a-form-item field="categoryPath" label="通知分类" required>
              <a-cascader
                v-model="formData.categoryPath"
                :options="categoryOptions"
                placeholder="请选择通知分类"
                :field-names="{ value: 'key', label: 'title', children: 'children' }"
                expand-trigger="hover"
                check-strictly
                style="width: 100%"
              />
              <div class="field-tip">请先选择主分类，再选择具体的子分类</div>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item field="summary" label="通知摘要">
              <a-textarea 
                v-model="formData.summary" 
                placeholder="请输入通知摘要（可选）"
                :max-length="200"
                :rows="3"
                show-word-limit
              />
            </a-form-item>
          </a-col>
        </template>

        <!-- 正文内容 -->
        <a-col :span="24">
          <a-form-item field="content" label="正文内容" required>
            <div class="rich-editor-container">
              <div class="editor-toolbar">
                <a-space>
                  <a-button 
                    size="small" 
                    @click="insertText('**粗体文本**')"
                  >
                    <template #icon><IconBold /></template>
                    粗体
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="insertText('*斜体文本*')"
                  >
                    <template #icon><IconItalic /></template>
                    斜体
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="insertText('# 标题')"
                  >
                    <template #icon><IconH1 /></template>
                    标题
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="insertText('- 列表项')"
                  >
                    <template #icon><IconList /></template>
                    列表
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="insertText('[链接文本](链接地址)')"
                  >
                    <template #icon><IconLink /></template>
                    链接
                  </a-button>
                </a-space>
              </div>
              <a-textarea 
                ref="contentEditor"
                v-model="formData.content" 
                placeholder="请输入内容，支持Markdown格式"
                :rows="8"
                class="content-editor"
              />
            </div>
          </a-form-item>
        </a-col>

        <!-- 内容预览 -->
        <a-col :span="24" v-if="formData.content">
          <a-form-item label="内容预览">
            <div class="content-preview" v-html="renderedContent"></div>
          </a-form-item>
        </a-col>

        <!-- 附件上传 -->
        <a-col :span="24">
          <a-form-item field="attachments" label="附件文档">
            <a-upload
              ref="uploadRef"
              :file-list="fileList"
              :custom-request="handleUpload"
              :on-before-upload="beforeUpload"
              :on-remove="handleRemove"
              multiple
              draggable
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
            >
              <template #upload-button>
                <div class="upload-area">
                  <div class="upload-icon">
                    <IconUpload />
                  </div>
                  <div class="upload-text">
                    <div>点击或拖拽文件到此区域上传</div>
                    <div class="upload-tip">
                      支持 PDF、Office文档、文本文件等格式，单个文件不超过10MB
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-form-item>
        </a-col>

        <!-- 发布设置 - 仅在发送通知时显示 -->
        <template v-if="sendNotification">
          <a-col :span="24">
            <a-divider orientation="left">发布设置</a-divider>
          </a-col>

          <a-col :span="12">
            <a-form-item field="isSticky" label="置顶显示">
              <a-switch v-model="formData.isSticky" />
              <div class="field-tip">置顶的通知将在列表顶部显示</div>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item field="isPublic" label="公开可见">
              <a-switch v-model="formData.isPublic" />
              <div class="field-tip">公开的通知所有用户都可以查看</div>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button 
          v-if="sendNotification"
          @click="handleSaveDraft" 
          :loading="saving"
        >
          保存草稿
        </a-button>
        <a-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          {{ sendNotification ? '发布通知' : '上传文档' }}
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconBold,
  IconItalic,
  IconH1,
  IconList,
  IconLink,
  IconUpload
} from '@arco-design/web-vue/es/icon'
import type { 
  Notification, 
  NotificationAttachment, 
  ResourceCategory 
} from '@/types/community'

// Props
interface Props {
  visible: boolean
  category?: ResourceCategory
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  category: 'policy'
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': [data: any]
}>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formRef = ref()
const contentEditor = ref()
const uploadRef = ref()
const submitting = ref(false)
const saving = ref(false)
const fileList = ref<any[]>([])
const sendNotification = ref(false)

// 表单数据
const formData = ref<Partial<Notification>>({
  title: '',
  categoryPath: [],
  summary: '',
  content: '',
  isSticky: false,
  isPublic: true,
  attachments: []
})

// 动态表单验证规则
const formRules = computed(() => {
  const baseRules = {
    title: [
      { required: true, message: '请输入标题' },
      { minLength: 2, message: '标题至少2个字符' },
      { maxLength: 100, message: '标题不能超过100个字符' }
    ],
    content: [
      { required: true, message: '请输入内容' },
      { minLength: 10, message: '内容至少10个字符' }
    ]
  }

  // 如果发送通知，添加通知相关验证规则
  if (sendNotification.value) {
    return {
      ...baseRules,
      categoryPath: [
        { required: true, message: '请选择通知分类' },
        { 
          validator: (value: any) => {
            return Array.isArray(value) && value.length === 2
          }, 
          message: '请选择完整的分类路径' 
        }
      ]
    }
  }

  return baseRules
})

// 级联选择器选项
const categoryOptions = [
  {
    key: 'policy',
    title: '政策制度',
    children: [
      { key: 'policy-law', title: '法律法规' },
      { key: 'policy-management', title: '管理办法' },
      { key: 'policy-standard', title: '标准规范' }
    ]
  },
  {
    key: 'cases',
    title: '实践案例',
    children: [
      { key: 'cases-analytics', title: '数据分析' },
      { key: 'cases-ml', title: '机器学习' },
      { key: 'cases-visualization', title: '数据可视化' }
    ]
  },
  {
    key: 'guide',
    title: '操作指南',
    children: [
      { key: 'guide-basic', title: '基础操作' },
      { key: 'guide-advanced', title: '高级功能' },
      { key: 'guide-troubleshooting', title: '故障排除' }
    ]
  },
  {
    key: 'news',
    title: '社区动态',
    children: [
      { key: 'news-announcement', title: '公告通知' },
      { key: 'news-activity', title: '活动资讯' },
      { key: 'news-update', title: '更新日志' }
    ]
  }
]

// 渲染的内容（简单的Markdown渲染）
const renderedContent = computed(() => {
  if (!formData.value.content) return ''
  
  let html = formData.value.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
  
  // 包装列表项
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
  
  return html
})

// 方法
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

const handleSendModeChange = () => {
  // 切换模式时重置相关字段
  if (!sendNotification.value) {
    formData.value.categoryPath = []
    formData.value.summary = ''
    formData.value.isSticky = false
    formData.value.isPublic = true
  } else {
    // 根据当前分类设置默认值
    const categoryKey = props.category || 'policy'
    formData.value.categoryPath = [categoryKey, `${categoryKey}-law`]
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    // 处理提交数据
    const submitData = {
      ...formData.value,
      type: sendNotification.value ? 'notification' : 'document',
      categoryId: formData.value.categoryPath?.[1] || props.category,
      category: formData.value.categoryPath?.[0] || props.category,
    }
    
    // 移除级联选择器字段
    delete submitData.categoryPath
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const successMessage = sendNotification.value ? '通知发布成功' : '文档上传成功'
    Message.success(successMessage)
    
    emit('success', submitData)
    handleCancel()
  } catch (error) {
    Message.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleSaveDraft = async () => {
  try {
    saving.value = true
    
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success('草稿保存成功')
  } catch (error) {
    Message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  // 重置表单
  formData.value = {
    title: '',
    categoryPath: [],
    summary: '',
    content: '',
    isSticky: false,
    isPublic: true,
    attachments: []
  }
  fileList.value = []
  sendNotification.value = false
  
  emit('update:visible', false)
}

// 监听弹窗显示状态，设置默认分类
watch(() => props.visible, (newVal) => {
  if (newVal && props.category) {
    const categoryKey = props.category
    formData.value.categoryPath = [categoryKey, `${categoryKey}-law`]
  }
})
</script>

<style scoped>
.rich-editor-container {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  background-color: #f7f8fa;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e6eb;
}

.content-editor {
  border: none;
  border-radius: 0;
}

.content-editor :deep(.arco-textarea) {
  border: none;
  box-shadow: none;
}

.content-preview {
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
}

.content-preview :deep(h1),
.content-preview :deep(h2),
.content-preview :deep(h3) {
  margin: 16px 0 8px 0;
  color: #1d2129;
}

.content-preview :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.content-preview :deep(li) {
  margin: 4px 0;
}

.content-preview :deep(a) {
  color: #165dff;
  text-decoration: none;
}

.content-preview :deep(a:hover) {
  text-decoration: underline;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background-color: #f7f8fa;
  border: 2px dashed #c9cdd4;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #165dff;
  background-color: #f2f3ff;
}

.upload-icon {
  font-size: 36px;
  color: #86909c;
  margin-bottom: 12px;
}

.upload-text {
  text-align: center;
}

.upload-text > div:first-child {
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 6px;
}

.upload-tip {
  font-size: 12px;
  color: #86909c;
}

.field-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

:deep(.arco-divider-text) {
  font-weight: 600;
  color: #1d2129;
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>