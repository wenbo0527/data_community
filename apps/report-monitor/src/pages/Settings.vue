<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-gray-900">系统设置</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <a-card title="存储设置" class="bg-white">
        <a-form :model="storageForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="数据目录">
            <a-input v-model="storageForm.dataDir" placeholder="/path/to/data" />
          </a-form-item>
          
          <a-form-item label="截图保留天数">
            <a-input-number v-model="storageForm.screenshotRetentionDays" :min="1" :max="365" />
          </a-form-item>
          
          <a-form-item label="HAR文件保留天数">
            <a-input-number v-model="storageForm.harRetentionDays" :min="1" :max="365" />
          </a-form-item>
          
          <a-form-item label="运行记录保留数量">
            <a-input-number v-model="storageForm.runHistoryLimit" :min="100" :max="10000" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="saveStorageSettings">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="监控设置" class="bg-white">
        <a-form :model="monitorForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="浏览器超时时间">
            <a-input-number v-model="monitorForm.browserTimeout" :min="5000" :max="60000" :step="1000">
              <template #suffix>ms</template>
            </a-input-number>
          </a-form-item>
          
          <a-form-item label="页面加载等待时间">
            <a-input-number v-model="monitorForm.pageLoadWaitTime" :min="1000" :max="30000" :step="1000">
              <template #suffix>ms</template>
            </a-input-number>
          </a-form-item>
          
          <a-form-item label="截图质量">
            <a-slider v-model="monitorForm.screenshotQuality" :min="1" :max="100" :step="1" />
          </a-form-item>
          
          <a-form-item label="是否启用无头模式">
            <a-switch v-model="monitorForm.headlessMode" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="saveMonitorSettings">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="告警设置" class="bg-white">
        <a-form :model="alertForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="邮件通知">
            <a-switch v-model="alertForm.emailEnabled" />
          </a-form-item>
          
          <a-form-item label="SMTP服务器">
            <a-input v-model="alertForm.smtpHost" placeholder="smtp.example.com" />
          </a-form-item>
          
          <a-form-item label="SMTP端口">
            <a-input-number v-model="alertForm.smtpPort" :min="1" :max="65535" />
          </a-form-item>
          
          <a-form-item label="发件人邮箱">
            <a-input v-model="alertForm.senderEmail" placeholder="sender@example.com" />
          </a-form-item>
          
          <a-form-item label="默认收件人">
            <a-input v-model="alertForm.defaultRecipient" placeholder="recipient@example.com" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="saveAlertSettings">保存设置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="系统维护" class="bg-white">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>清理过期截图</span>
            <a-button @click="cleanupScreenshots">立即清理</a-button>
          </div>
          
          <div class="flex items-center justify-between">
            <span>清理过期HAR文件</span>
            <a-button @click="cleanupHarFiles">立即清理</a-button>
          </div>
          
          <div class="flex items-center justify-between">
            <span>导出配置</span>
            <a-button @click="exportConfig">导出</a-button>
          </div>
          
          <div class="flex items-center justify-between">
            <span>导入配置</span>
            <a-upload
              :file-list="fileList"
              :show-file-list="false"
              @change="handleImport"
            >
              <a-button>导入</a-button>
            </a-upload>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const storageForm = ref({
  dataDir: '/data/report-monitor',
  screenshotRetentionDays: 30,
  harRetentionDays: 30,
  runHistoryLimit: 1000
})

const monitorForm = ref({
  browserTimeout: 30000,
  pageLoadWaitTime: 5000,
  screenshotQuality: 80,
  headlessMode: true
})

const alertForm = ref({
  emailEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  senderEmail: '',
  defaultRecipient: ''
})

const fileList = ref([])

const saveStorageSettings = () => {
  // 保存存储设置到后端
  console.log('保存存储设置:', storageForm.value)
}

const saveMonitorSettings = () => {
  // 保存监控设置到后端
  console.log('保存监控设置:', monitorForm.value)
}

const saveAlertSettings = () => {
  // 保存告警设置到后端
  console.log('保存告警设置:', alertForm.value)
}

const cleanupScreenshots = () => {
  // 清理过期截图
  console.log('清理过期截图')
}

const cleanupHarFiles = () => {
  // 清理过期HAR文件
  console.log('清理过期HAR文件')
}

const exportConfig = () => {
  // 导出配置文件
  console.log('导出配置')
}

const handleImport = (fileList: any[]) => {
  // 处理配置文件导入
  console.log('导入配置文件:', fileList)
}

onMounted(() => {
  // 加载当前设置
  console.log('加载系统设置')
})
</script>