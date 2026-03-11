<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">运行记录</h1>
      <div class="flex space-x-2">
        <a-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px">
          <a-option value="">全部</a-option>
          <a-option value="success">成功</a-option>
          <a-option value="failed">失败</a-option>
          <a-option value="running">运行中</a-option>
        </a-select>
        <a-button @click="refreshData">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </div>
    </div>

    <a-card class="bg-white">
      <div v-if="loading" class="text-center py-8">
        <a-spin />
      </div>
      <div v-else-if="filteredRuns.length === 0" class="text-center py-8 text-gray-500">
        暂无运行记录
      </div>
      <div v-else>
        <a-table :data="filteredRuns" :columns="columns">
          <template #target="{ record }">
            <span>{{ getTargetName(record.targetId) }}</span>
          </template>
          
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          
          <template #duration="{ record }">
            <span>{{ formatDuration(record.duration) }}</span>
          </template>
          
          <template #errors="{ record }">
            <div v-if="record.errors.length > 0">
              <a-badge :count="record.errors.length" :offset="[0, 0]">
                <a-button size="mini" @click="showErrors(record)">
                  查看错误
                </a-button>
              </a-badge>
            </div>
            <span v-else class="text-green-600">无错误</span>
          </template>
          
          <template #screenshot="{ record }">
            <div v-if="record.screenshotRef" class="flex space-x-2">
              <a-button size="mini" @click="viewScreenshot(record.screenshotRef)">
                查看截图
              </a-button>
            </div>
            <span v-else class="text-gray-500">无截图</span>
          </template>
          
          <template #actions="{ record }">
            <div class="flex space-x-2">
              <a-button size="mini" @click="viewDetails(record)">
                详情
              </a-button>
              <a-button size="mini" @click="rerunMonitor(record.targetId)">
                重新运行
              </a-button>
            </div>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="showErrorModal"
      title="错误详情"
      width="600px"
    >
      <div v-if="selectedRun" class="space-y-3">
        <div
          v-for="(error, index) in selectedRun.errors"
          :key="index"
          class="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-red-800">{{ error.type }}</span>
            <a-tag color="red">{{ error.ruleId }}</a-tag>
          </div>
          <div class="text-sm text-red-700 mt-2">{{ error.message }}</div>
          <div v-if="error.screenshot" class="mt-2">
            <a-button size="mini" @click="viewScreenshot(error.screenshot)">
              查看错误截图
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="showDetailModal"
      title="运行详情"
      width="800px"
    >
      <div v-if="selectedRun" class="space-y-4">
        <a-descriptions :data="detailData" :column="2" bordered />
        
        <div v-if="selectedRun.metrics && Object.keys(selectedRun.metrics).length > 0">
          <h4 class="font-medium mb-2">性能指标</h4>
          <a-descriptions :data="metricsData" :column="2" bordered />
        </div>
        
        <div v-if="selectedRun.harRef">
          <h4 class="font-medium mb-2">网络日志</h4>
          <a-button size="small" @click="viewHar(selectedRun.harRef)">
            查看HAR文件
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMonitorStore } from '@/store/monitor'
import type { MonitorRun } from '@/types/monitor'
import {
  IconRefresh
} from '@arco-design/web-vue/es/icon'

const store = useMonitorStore()

const runs = computed(() => store.runs)
const loading = computed(() => store.loading)
const statusFilter = ref('')
const showErrorModal = ref(false)
const showDetailModal = ref(false)
const selectedRun = ref<MonitorRun | null>(null)

const filteredRuns = computed(() => {
  if (!statusFilter.value) return runs.value
  return runs.value.filter(run => run.status === statusFilter.value)
})

const columns = [
  { title: '监控目标', dataIndex: 'targetId', slotName: 'target' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '持续时间', dataIndex: 'duration', slotName: 'duration' },
  { title: '错误信息', dataIndex: 'errors', slotName: 'errors' },
  { title: '截图', dataIndex: 'screenshotRef', slotName: 'screenshot' },
  { title: '运行时间', dataIndex: 'createdAt' },
  { title: '操作', slotName: 'actions' }
]

const detailData = computed(() => {
  if (!selectedRun.value) return []
  return [
    { label: '运行ID', value: selectedRun.value.id },
    { label: '监控目标', value: getTargetName(selectedRun.value.targetId) },
    { label: '状态', value: getStatusLabel(selectedRun.value.status) },
    { label: '持续时间', value: formatDuration(selectedRun.value.duration) },
    { label: '创建时间', value: formatTime(selectedRun.value.createdAt) },
    { label: '错误数量', value: selectedRun.value.errors.length }
  ]
})

const metricsData = computed(() => {
  if (!selectedRun.value?.metrics) return []
  const metrics = selectedRun.value.metrics
  return [
    { label: '加载时间', value: metrics.loadTime ? `${metrics.loadTime}ms` : '-' },
    { label: 'DOM加载时间', value: metrics.domContentLoaded ? `${metrics.domContentLoaded}ms` : '-' },
    { label: '首次绘制', value: metrics.firstPaint ? `${metrics.firstPaint}ms` : '-' }
  ]
})

const getTargetName = (targetId: string) => {
  const target = store.targets.find(t => t.id === targetId)
  return target?.name || '未知目标'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: '等待中',
    running: '运行中',
    success: '成功',
    failed: '失败',
    timeout: '超时'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'blue',
    running: 'cyan',
    success: 'green',
    failed: 'red',
    timeout: 'orange'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const formatDuration = (duration: number) => {
  if (duration < 1000) return `${duration}ms`
  return `${(duration / 1000).toFixed(1)}s`
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const showErrors = (run: MonitorRun) => {
  selectedRun.value = run
  showErrorModal.value = true
}

const viewDetails = (run: MonitorRun) => {
  selectedRun.value = run
  showDetailModal.value = true
}

const viewScreenshot = (screenshotRef: string) => {
  // 这里可以实现截图查看功能
  console.log('查看截图:', screenshotRef)
}

const viewHar = (harRef: string) => {
  // 这里可以实现HAR文件查看功能
  console.log('查看HAR:', harRef)
}

const rerunMonitor = (targetId: string) => {
  // 这里可以实现重新运行功能
  console.log('重新运行监控:', targetId)
}

const refreshData = () => {
  // 这里可以实现数据刷新功能
  console.log('刷新数据')
}

onMounted(() => {
  // 这里可以加载初始数据
})
</script>