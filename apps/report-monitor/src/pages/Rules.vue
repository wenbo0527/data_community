<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">监控规则</h1>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon><icon-plus /></template>
        新建规则
      </a-button>
    </div>

    <a-card class="bg-white">
      <div v-if="loading" class="text-center py-8">
        <a-spin />
      </div>
      <div v-else-if="rules.length === 0" class="text-center py-8 text-gray-500">
        暂无监控规则，点击上方按钮创建
      </div>
      <div v-else>
        <a-table :data="rules" :columns="columns">
          <template #target="{ record }">
            <span>{{ getTargetName(record.targetId) }}</span>
          </template>
          
          <template #type="{ record }">
            <a-tag>{{ getRuleTypeLabel(record.type) }}</a-tag>
          </template>
          
          <template #selector="{ record }">
            <code class="text-sm bg-gray-100 px-2 py-1 rounded">
              {{ record.selector || '-' }}
            </code>
          </template>
          
          <template #enabled="{ record }">
            <a-switch
              :model-value="record.enabled"
              @change="(val: boolean) => toggleRuleStatus(record.id, val)"
            />
          </template>
          
          <template #actions="{ record }">
            <div class="flex space-x-2">
              <a-button type="text" size="small" @click="editRule(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-popconfirm
                content="确定要删除此规则吗？"
                @ok="deleteRule(record.id)"
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
      title="创建监控规则"
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
        
        <a-form-item label="规则类型" field="type" required>
          <a-select v-model="form.type" placeholder="选择规则类型">
            <a-option value="exists">元素存在</a-option>
            <a-option value="visible">元素可见</a-option>
            <a-option value="textMatch">文本匹配</a-option>
            <a-option value="nonEmpty">内容非空</a-option>
            <a-option value="tableRows">表格行数</a-option>
            <a-option value="minPerf">最小性能</a-option>
            <a-option value="maxPerf">最大性能</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="选择器" field="selector">
          <a-input v-model="form.selector" placeholder="CSS选择器，如: .table tr" />
        </a-form-item>
        
        <a-form-item label="期望值" field="expect">
          <a-input v-model="form.expect" placeholder="文本内容或数值" />
        </a-form-item>
        
        <a-form-item label="阈值" field="threshold">
          <a-input-number v-model="form.threshold" placeholder="数值阈值" />
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
import type { MonitorRule } from '@/types/monitor'
import {
  IconPlus,
  IconEdit,
  IconDelete
} from '@arco-design/web-vue/es/icon'

const store = useMonitorStore()

const rules = computed(() => store.rules)
const loading = computed(() => store.loading)
const showCreateModal = ref(false)

const form = ref({
  targetId: '',
  type: 'exists' as 'exists' | 'visible' | 'textMatch' | 'nonEmpty' | 'tableRows' | 'minPerf' | 'maxPerf' | 'networkOk' | 'screenshotDiff',
  selector: '',
  expect: '',
  threshold: undefined as number | undefined,
  enabled: true
})

const availableTargets = computed(() => store.targets)

const columns = [
  { title: '监控目标', dataIndex: 'targetId', slotName: 'target' },
  { title: '规则类型', dataIndex: 'type', slotName: 'type' },
  { title: '选择器', dataIndex: 'selector', slotName: 'selector' },
  { title: '期望值', dataIndex: 'expect' },
  { title: '阈值', dataIndex: 'threshold' },
  { title: '启用状态', dataIndex: 'enabled', slotName: 'enabled' },
  { title: '操作', slotName: 'actions' }
]

const getTargetName = (targetId: string) => {
  const target = store.targets.find(t => t.id === targetId)
  return target?.name || '未知目标'
}

const getRuleTypeLabel = (type: string) => {
  const labels = {
    exists: '元素存在',
    visible: '元素可见',
    textMatch: '文本匹配',
    nonEmpty: '内容非空',
    tableRows: '表格行数',
    minPerf: '最小性能',
    maxPerf: '最大性能',
    networkOk: '网络正常',
    screenshotDiff: '截图对比'
  }
  return labels[type as keyof typeof labels] || type
}

const handleCreate = () => {
  if (!form.value.targetId) {
    return
  }
  
  const newRule: MonitorRule = {
    id: crypto.randomUUID(),
    targetId: form.value.targetId,
    type: form.value.type,
    selector: form.value.selector || undefined,
    expect: form.value.expect || undefined,
    threshold: form.value.threshold || undefined,
    enabled: form.value.enabled
  }
  
  store.addRule(newRule)
  showCreateModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    targetId: '',
    type: 'exists',
    selector: '',
    expect: '',
    threshold: undefined,
    enabled: true
  }
}

const toggleRuleStatus = (id: string, enabled: boolean) => {
  store.updateRule(id, { enabled })
}

const editRule = (rule: MonitorRule) => {
  // 这里可以实现编辑功能
  console.log('编辑规则:', rule)
}

const deleteRule = (id: string) => {
  store.deleteRule(id)
}

onMounted(() => {
  // 这里可以加载初始数据
})
</script>