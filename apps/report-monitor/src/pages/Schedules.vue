<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">调度计划</h1>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon><icon-plus /></template>
        新建计划
      </a-button>
    </div>

    <a-card class="bg-white">
      <div v-if="loading" class="text-center py-8">
        <a-spin />
      </div>
      <div v-else-if="schedules.length === 0" class="text-center py-8 text-gray-500">
        暂无调度计划，点击上方按钮创建
      </div>
      <div v-else>
        <a-table :data="schedules" :columns="columns">
          <template #target="{ record }">
            <span>{{ getTargetName(record.targetId) }}</span>
          </template>
          
          <template #cron="{ record }">
            <code class="text-sm bg-gray-100 px-2 py-1 rounded">
              {{ record.cron }}
            </code>
          </template>
          
          <template #timezone="{ record }">
            <span>{{ record.timezone }}</span>
          </template>
          
          <template #enabled="{ record }">
            <a-switch
              :model-value="record.enabled"
              @change="(val: boolean) => toggleScheduleStatus(record.id, val)"
            />
          </template>
          
          <template #actions="{ record }">
            <div class="flex space-x-2">
              <a-button type="text" size="small" @click="editSchedule(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-popconfirm
                content="确定要删除此计划吗？"
                @ok="deleteSchedule(record.id)"
              >
                <a-button type="text" size="small" status="danger">
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </a-table>
      </div>
    </a-card>

    <a-modal
      v-model:visible="showCreateModal"
      title="创建调度计划"
      @ok="handleCreate"
      @cancel="resetForm"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="监控目标" field="targetId" required>
          <a-select v-model="form.targetId" placeholder="选择监控目标">
            <a-option
              v-for="target in availableTargets"
              :key="target.id"
              :value="target.id"
            >
              {{ target.name }}
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="Cron表达式" field="cron" required>
          <a-input v-model="form.cron" placeholder="0 */5 * * * *" />
          <div class="text-xs text-gray-500 mt-1">
            例如：每5分钟执行一次
          </div>
        </a-form-item>
        
        <a-form-item label="时区" field="timezone">
          <a-input v-model="form.timezone" placeholder="UTC" />
        </a-form-item>
        
        <a-form-item label="最大并发" field="maxConcurrency">
          <a-input-number v-model="form.maxConcurrency" :min="1" :max="10" />
        </a-form-item>
        
        <a-form-item label="重试次数" field="retryPolicy.maxRetries">
          <a-input-number v-model="form.retryPolicy.maxRetries" :min="0" :max="5" />
        </a-form-item>
        
        <a-form-item label="重试延迟" field="retryPolicy.delay">
          <a-input-number v-model="form.retryPolicy.delay" :min="1000" :step="1000">
            <template #suffix>ms</template>
          </a-input-number>
        </a-form-item>
        
        <a-form-item label="启用状态" field="enabled">
          <a-switch v-model="form.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMonitorStore } from '@/store/monitor'
import type { MonitorSchedule } from '@/types/monitor'
import {
  IconPlus,
  IconEdit,
  IconDelete
} from '@arco-design/web-vue/es/icon'

const store = useMonitorStore()

const schedules = computed(() => store.schedules)
const loading = computed(() => store.loading)
const showCreateModal = ref(false)

const form = ref({
  targetId: '',
  cron: '0 */5 * * * *',
  timezone: 'UTC',
  maxConcurrency: 1,
  retryPolicy: {
    maxRetries: 2,
    backoff: 'exponential' as 'fixed' | 'exponential',
    delay: 2000
  },
  enabled: true
})

const availableTargets = computed(() => store.targets)

const columns = [
  { title: '监控目标', dataIndex: 'targetId', slotName: 'target' },
  { title: 'Cron表达式', dataIndex: 'cron', slotName: 'cron' },
  { title: '时区', dataIndex: 'timezone', slotName: 'timezone' },
  { title: '最大并发', dataIndex: 'maxConcurrency' },
  { title: '启用状态', dataIndex: 'enabled', slotName: 'enabled' },
  { title: '操作', slotName: 'actions' }
]

const getTargetName = (targetId: string) => {
  const target = store.targets.find(t => t.id === targetId)
  return target?.name || '未知目标'
}

const handleCreate = () => {
  if (!form.value.targetId || !form.value.cron) {
    return
  }
  
  const newSchedule: MonitorSchedule = {
    id: crypto.randomUUID(),
    ...form.value
  }
  
  store.addSchedule(newSchedule)
  showCreateModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    targetId: '',
    cron: '0 */5 * * * *',
    timezone: 'UTC',
    maxConcurrency: 1,
    retryPolicy: {
      maxRetries: 2,
      backoff: 'exponential',
      delay: 2000
    },
    enabled: true
  }
}

const toggleScheduleStatus = (id: string, enabled: boolean) => {
  store.updateSchedule(id, { enabled })
}

const editSchedule = (schedule: MonitorSchedule) => {
  // 这里可以实现编辑功能
  console.log('编辑计划:', schedule)
}

const deleteSchedule = (id: string) => {
  store.deleteSchedule(id)
}

onMounted(() => {
  // 这里可以加载初始数据
})
</script>