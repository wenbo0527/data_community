<template>
  <div class="cdp-config-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <!-- CDP 人群选择 -->
      <a-form-item field="crowdId" label="CDP人群" required>
        <a-select
          v-model="formData.crowdId"
          placeholder="请选择目标人群"
          :loading="crowdLoading"
          allow-search
          @search="handleCrowdSearch"
        >
          <a-option
            v-for="crowd in crowdList"
            :key="crowd.id"
            :value="crowd.id"
          >
            {{ crowd.name }}
            <span class="crowd-count">({{ crowd.userCount || 0 }}人)</span>
          </a-option>
        </a-select>
        <template #extra>
          <span class="form-tip">选择需要触达的目标人群</span>
        </template>
      </a-form-item>

      <!-- 人群标签 -->
      <a-form-item field="crowdLabel" label="人群标签">
        <a-input
          v-model="formData.crowdLabel"
          placeholder="请输入人群标签（可选）"
          :max-length="50"
          show-word-limit
        />
      </a-form-item>

      <!-- 触达优先级 -->
      <a-form-item field="priority" label="触达优先级">
        <a-radio-group v-model="formData.priority">
          <a-radio value="high">高</a-radio>
          <a-radio value="normal">普通</a-radio>
          <a-radio value="low">低</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 排除人群（可选） -->
      <a-form-item field="excludeCrowdIds" label="排除人群">
        <a-select
          v-model="formData.excludeCrowdIds"
          placeholder="选择需要排除的人群（可选）"
          multiple
          allow-clear
        >
          <a-option
            v-for="crowd in crowdList"
            :key="crowd.id"
            :value="crowd.id"
          >
            {{ crowd.name }}
          </a-option>
        </a-select>
        <template #extra>
          <span class="form-tip">已选择人群中的排除项</span>
        </template>
      </a-form-item>

      <!-- 预计触达人数 -->
      <a-form-item label="预计触达">
        <a-statistic :value="estimatedCount" :precision="0">
          <template #suffix>人</template>
        </a-statistic>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormInstance } from '@arco-design/web-vue'

interface CDPFormData {
  crowdId?: string
  crowdLabel?: string
  priority?: 'high' | 'normal' | 'low'
  excludeCrowdIds?: string[]
}

interface Crowd {
  id: string
  name: string
  userCount?: number
}

interface Props {
  modelValue?: CDPFormData
}

interface Emits {
  (e: 'update:modelValue', value: CDPFormData): void
  (e: 'change', value: CDPFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    crowdId: '',
    crowdLabel: '',
    priority: 'normal',
    excludeCrowdIds: []
  })
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const crowdList = ref<Crowd[]>([])
const crowdLoading = ref(false)

const formData = ref<CDPFormData>({
  crowdId: props.modelValue.crowdId || '',
  crowdLabel: props.modelValue.crowdLabel || '',
  priority: props.modelValue.priority || 'normal',
  excludeCrowdIds: props.modelValue.excludeCrowdIds || []
})

const formRules = {
  crowdId: [
    { required: true, message: '请选择CDP人群' }
  ],
  priority: [
    { required: true, message: '请选择触达优先级' }
  ]
}

// 模拟 CDP 人群数据
const mockCrowdData: Crowd[] = [
  { id: 'cdp_001', name: '高价值客群', userCount: 12500 },
  { id: 'cdp_002', name: '活跃用户', userCount: 28000 },
  { id: 'cdp_003', name: '沉睡用户', userCount: 8500 },
  { id: 'cdp_004', name: '新注册用户', userCount: 5200 },
  { id: 'cdp_005', name: '复购用户', userCount: 15000 }
]

// 加载人群列表
const loadCrowdList = async (keyword?: string) => {
  crowdLoading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 300))
    if (keyword) {
      crowdList.value = mockCrowdData.filter(c => 
        c.name.toLowerCase().includes(keyword.toLowerCase())
      )
    } else {
      crowdList.value = mockCrowdData
    }
  } finally {
    crowdLoading.value = false
  }
}

// 搜索处理
const handleCrowdSearch = (value: string) => {
  loadCrowdList(value)
}

// 计算预计触达人数
const estimatedCount = computed(() => {
  const selected = crowdList.value.find(c => c.id === formData.value.crowdId)
  if (!selected) return 0
  const excludeCount = formData.value.excludeCrowdIds?.length || 0
  return selected.userCount ? selected.userCount - (excludeCount * 100) : 0
})

// 监听数据变化
watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
}, { deep: true })

onMounted(() => {
  loadCrowdList()
})

// 暴露方法供父组件调用
defineExpose({
  validate: () => formRef.value?.validate(),
  getData: () => ({ ...formData.value })
})
</script>

<style scoped>
.cdp-config-form {
  padding: 8px 0;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
}

.crowd-count {
  color: var(--color-text-3);
  font-size: 12px;
  margin-left: 8px;
}
</style>