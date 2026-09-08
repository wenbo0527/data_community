<template>
  <div class="pdf-viewer-container">
    <!-- PDF 预览区域 -->
    <div class="pdf-preview" v-if="pdfUrl">
      <div class="pdf-header">
        <div class="pdf-info">
          <h3 class="pdf-title">{{ title || '文档预览' }}</h3>
          <div class="pdf-meta">
            <a-space>
              <span><IconFile /> {{ fileType || 'PDF' }}</span>
              <span v-if="fileSize"><IconStorage /> {{ formatFileSize(fileSize) }}</span>
              <span v-if="updateTime"><IconCalendar /> {{ formatDate(updateTime) }}</span>
            </a-space>
          </div>
        </div>
        <div class="pdf-actions">
          <a-space>
            <a-button type="outline" size="small" @click="downloadPDF">
              <template #icon><IconDownload /></template>
              下载
            </a-button>
            <a-button type="outline" size="small" @click="openInNewTab">
              <template #icon><IconShareAlt /></template>
              新窗口打开
            </a-button>
            <a-button type="outline" size="small" @click="toggleFullscreen">
              <template #icon><IconFullscreen /></template>
              全屏
            </a-button>
          </a-space>
        </div>
      </div>
      
      <!-- PDF 内容区域 -->
      <div class="pdf-content" :class="{ 'fullscreen': isFullscreen }">
        <iframe
          :src="pdfUrl"
          class="pdf-iframe"
          frameborder="0"
          @load="onPDFLoad"
          @error="onPDFError"
        ></iframe>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="pdf-loading">
          <a-spin size="large" tip="正在加载PDF文档..." />
        </div>
        
        <!-- 错误状态 -->
        <div v-if="error" class="pdf-error">
          <a-result status="error" title="PDF加载失败" :subtitle="error">
            <template #extra>
              <a-space>
                <a-button @click="retryLoad">重新加载</a-button>
                <a-button type="primary" @click="downloadPDF">直接下载</a-button>
              </a-space>
            </template>
          </a-result>
        </div>
      </div>
    </div>
    
    <!-- 无PDF时的占位符 -->
    <div v-else class="pdf-placeholder">
      <a-empty description="暂无PDF文档">
        <template #image>
          <IconFile style="font-size: 64px; color: #c9cdd4;" />
        </template>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IconFile,
  IconStorage,
  IconCalendar,
  IconDownload,
  IconShareAlt,
  IconFullscreen
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  // PDF文件URL
  pdfUrl: {
    type: String,
    default: ''
  },
  // 文档标题
  title: {
    type: String,
    default: ''
  },
  // 文件类型
  fileType: {
    type: String,
    default: 'PDF'
  },
  // 文件大小（字节）
  fileSize: {
    type: Number,
    default: 0
  },
  // 更新时间
  updateTime: {
    type: String,
    default: ''
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 高度
  height: {
    type: String,
    default: '600px'
  }
})

const emit = defineEmits(['load', 'error', 'download'])

// 响应式数据
const loading = ref(true)
const error = ref('')
const isFullscreen = ref(false)

// 计算属性
const pdfViewerUrl = computed(() => {
  if (!props.pdfUrl) return ''
  // 使用浏览器内置PDF查看器
  return props.pdfUrl + '#toolbar=1&navpanes=1&scrollbar=1'
})

// 方法
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const onPDFLoad = () => {
  loading.value = false
  error.value = ''
  emit('load')
}

const onPDFError = () => {
  loading.value = false
  error.value = 'PDF文档加载失败，请检查文件是否存在或网络连接'
  emit('error', error.value)
}

const retryLoad = () => {
  loading.value = true
  error.value = ''
  // 重新加载iframe
  const iframe = document.querySelector('.pdf-iframe')
  if (iframe) {
    iframe.src = iframe.src
  }
}

const downloadPDF = () => {
  if (props.pdfUrl) {
    const link = document.createElement('a')
    link.href = props.pdfUrl
    link.download = props.title || 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    emit('download', props.pdfUrl)
  }
}

const openInNewTab = () => {
  if (props.pdfUrl) {
    window.open(props.pdfUrl, '_blank')
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 监听ESC键退出全屏
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.pdf-viewer-container {
  width: 100%;
  height: 100%;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.pdf-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.pdf-info {
  flex: 1;
}

.pdf-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.pdf-meta {
  font-size: 12px;
  color: #86909c;
}

.pdf-actions {
  flex-shrink: 0;
}

.pdf-content {
  flex: 1;
  position: relative;
  height: v-bind(height);
}

.pdf-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #fff;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.pdf-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  z-index: 10;
}

.pdf-placeholder {
  height: v-bind(height);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .pdf-actions {
    width: 100%;
  }
  
  .pdf-actions .arco-space {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>