<template>
  <a-modal v-model:visible="visible" :title="title" :footer="false" width="600px" @cancel="handleCancel">
    <a-space direction="vertical" size="large" fill>
      <div style="text-align: center; margin-bottom: 16px">
        <h4>请下载模板文件，填写后上传</h4>
        <p style="color: var(--color-text-3); margin-top: 8px">{{ description }}</p>
      </div>
      <a-button type="primary" @click="handleDownloadTemplate" long>
        <template #icon><IconDownload /></template>
        下载导入模板
      </a-button>
      <a-upload-dragger
        :show-file-list="false"
        :custom-request="handleUploadRequest"
        @change="onFileChange"
        accept=".xlsx,.xls"
        drag
        class="upload-area"
        :class="{ 'upload-area--dragover': isDragover }"
        style="height: 180px; margin: 16px 0"
      >
        <div class="upload-content">
          <IconUpload class="upload-icon" style="font-size: 32px; margin-bottom: 16px" />
          <p class="upload-text" style="font-size: 16px; margin-bottom: 8px">拖拽文件到此处或<span class="upload-highlight"> 点击上传</span></p>
          <p class="upload-hint" style="color: var(--color-text-3)">支持.xlsx和.xls格式文件，文件大小不超过5MB</p>
          <a-progress v-if="uploadProgress > 0" :percent="uploadProgress" :show-text="false" />
          <div v-if="currentFile" class="file-preview" style="margin-top: 16px; display: flex; align-items: center; justify-content: center;">
            <IconFile style="margin-right: 8px" />
            <span>{{ currentFile.name }}</span>
            <span style="color: var(--color-text-3); margin-left: 8px">
              {{ formatFileSize(currentFile.size) }}
            </span>
          </div>
        </div>
      </a-upload-dragger>
      <a-alert v-if="fileCount > 0" type="info" style="margin-top: 16px">
        检测到 {{ fileCount }} 条记录，确认导入？
        <template #action>
          <a-space>
            <a-button type="primary" size="small" @click="confirmUpload">确认导入</a-button>
            <a-button size="small" @click="fileCount = 0">重选</a-button>
          </a-space>
        </template>
      </a-alert>
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDownload, IconFile } from '@arco-design/web-vue/es/icon'
import { useFileUpload } from '@/utils/fileUploadUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '批量导入'
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: '按照模板格式填写数据，系统将自动检测并处理'
  }
})

const emit = defineEmits(['update:visible', 'success'])

const visible = ref(props.visible)
const fileCount = ref(0)

const { 
  isDragover, 
  uploadProgress, 
  currentFile, 
  formatFileSize,
  handleFileChange,
} = useFileUpload()

watch(() => props.visible, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:visible', val)
})

const handleCancel = () => {
  visible.value = false
  fileCount.value = 0
}

const handleDownloadTemplate = () => {
  const link = document.createElement('a')
  link.href = `/templates/data-standard-${props.type}-template.xlsx`
  link.download = `${props.title}模板.xlsx`
  link.click()
  Message.success('正在下载模板...')
}

const onFileChange = (fileList: any) => {
  handleFileChange(props.type, fileList, fileCount)
}

const handleUploadRequest = (option: any) => {
  // 模拟上传成功
  setTimeout(() => {
    option.onSuccess()
  }, 1000)
  return {
    abort: () => {}
  }
}

const confirmUpload = () => {
  Message.loading({ content: '正在导入数据...', id: 'import' })
  setTimeout(() => {
    Message.success({ content: `成功导入 ${fileCount.value} 条记录`, id: 'import' })
    fileCount.value = 0
    visible.value = false
    emit('success')
  }, 1500)
}
</script>

<style scoped>
.upload-area {
  transition: all 0.3s;
}
.upload-area--dragover {
  background-color: var(--color-fill-2);
  border-color: var(--color-primary-light-3);
}
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.upload-highlight {
  color: var(--color-primary-light-4);
  cursor: pointer;
}
</style>
