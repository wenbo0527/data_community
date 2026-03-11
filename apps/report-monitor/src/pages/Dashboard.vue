<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <a-card class="bg-white">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ totalTargets }}</div>
          <div class="text-gray-600">监控目标</div>
        </div>
      </a-card>
      
      <a-card class="bg-white">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ successRate }}%</div>
          <div class="text-gray-600">成功率</div>
        </div>
      </a-card>
      
      <a-card class="bg-white">
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600">{{ openAlerts }}</div>
          <div class="text-gray-600">待处理告警</div>
        </div>
      </a-card>
      
      <a-card class="bg-white">
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ recentRuns }}</div>
          <div class="text-gray-600">最近运行</div>
        </div>
      </a-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <a-card title="最近运行记录" class="bg-white">
        <div v-if="loading" class="text-center py-8">
          <a-spin />
        </div>
        <div v-else-if="runs.length === 0" class="text-center py-8 text-gray-500">
          暂无运行记录
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="run in runs.slice(0, 5)"
            :key="run.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="run.status === 'success' ? 'bg-green-500' : 'bg-red-500'"
              />
              <div>
                <div class="font-medium">{{ getTargetName(run.targetId) }}</div>
                <div class="text-sm text-gray-600">{{ formatDuration(run.duration) }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              {{ formatTime(run.createdAt) }}
            </div>
          </div>
        </div>
      </a-card>

      <a-card title="待处理告警" class="bg-white">
        <div v-if="alerts.length === 0" class="text-center py-8 text-gray-500">
          暂无待处理告警
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="alert in alerts.slice(0, 5)"
            :key="alert.id"
            class="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="getAlertColor(alert.level)"
                />
                <span class="font-medium text-sm">{{ alert.message.split('\n')[0] }}</span>
              </div>
              <a-tag :color="getAlertColor(alert.level)">
                {{ alert.level }}
              </a-tag>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatTime(alert.createdAt) }}
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMonitorStore } from '@/store/monitor'

const store = useMonitorStore()

const totalTargets = computed(() => store.targets.length)
const successRate = computed(() => {
  if (store.runs.length === 0) return 100
  const successCount = store.runs.filter(r => r.status === 'success').length
  return Math.round((successCount / store.runs.length) * 100)
})
const openAlerts = computed(() => store.openAlerts.length)
const recentRuns = computed(() => store.runs.length)
const loading = computed(() => store.loading)
const runs = computed(() => store.recentRuns)
const alerts = computed(() => store.openAlerts)

const getTargetName = (targetId: string) => {
  const target = store.targets.find(t => t.id === targetId)
  return target?.name || '未知目标'
}

const formatDuration = (duration: number) => {
  if (duration < 1000) return `${duration}ms`
  return `${(duration / 1000).toFixed(1)}s`
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getAlertColor = (level: string) => {
  switch (level) {
    case 'critical': return 'bg-red-500'
    case 'error': return 'bg-orange-500'
    case 'warning': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
}

onMounted(() => {
  // 数据已经在App.vue中加载
})
</script>