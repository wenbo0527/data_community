<template>
  <a-card class="filter-card">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-form-item label="标签表名称">
          <a-input
            v-model="localFilterForm.name"
            placeholder="请输入标签表名称"
            allow-clear
            @change="handleSearch"
          />
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="状态">
          <a-select
            v-model="localFilterForm.status"
            placeholder="请选择状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部</a-option>
            <a-option value="active">激活</a-option>
            <a-option value="archived">归档</a-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="分类">
          <a-select
            v-model="localFilterForm.category"
            placeholder="请选择分类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="">全部分类</a-option>
            <a-option value="behavior">行为</a-option>
            <a-option value="profile">画像</a-option>
            <a-option value="transaction">交易</a-option>
            <a-option value="risk">风险</a-option>
            <a-option value="member">会员</a-option>
            <a-option value="marketing">营销</a-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item label="创建时间">
          <a-range-picker
            v-model="localFilterForm.dateRange"
            style="width: 100%"
            @change="handleSearch"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="24">
        <a-space>
          <a-button type="primary" @click="handleSearch">
            <template #icon><IconSearch /></template>
            搜索
          </a-button>
          <a-button @click="handleReset">
            <template #icon><IconRefresh /></template>
            重置
          </a-button>
        </a-space>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'
import type { FilterForm } from '@/types/tag'

// Props定义
interface Props {
  filterForm: FilterForm
}

const props = defineProps<Props>()

// 事件定义
const emit = defineEmits<{
  'update:filterForm': [form: FilterForm]
  search: []
  reset: []
}>()

// 本地表单状态
const localFilterForm = ref<FilterForm>({
  name: '',
  status: '',
  category: '',
  dateRange: []
})

// 监听props变化
watch(() => props.filterForm, (newVal) => {
  localFilterForm.value = { ...newVal }
}, { immediate: true })

// 监听本地表单变化
watch(localFilterForm, (newVal) => {
  emit('update:filterForm', newVal)
}, { deep: true })

// 方法
const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  localFilterForm.value = {
    name: '',
    status: '',
    category: '',
    dateRange: []
  }
  emit('reset')
}
</script>

<style scoped lang="less">
.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .filter-card {
    :deep(.arco-col) {
      margin-bottom: 12px;
    }
  }
}
</style>