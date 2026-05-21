<template>
  <div class="filter-controls">
    <a-select 
      v-model="localFilterMethod" 
      placeholder="筛选催收方式" 
      style="width: 120px" 
      size="small"
      allow-clear
      @change="emitFilters"
    >
      <a-option value="">全部方式</a-option>
      <a-option value="电话">电话</a-option>
      <a-option value="短信">短信</a-option>
      <a-option value="上门">上门</a-option>
      <a-option value="邮件">邮件</a-option>
    </a-select>
    <a-select 
      v-model="localFilterResult" 
      placeholder="筛选联系结果" 
      style="width: 120px" 
      size="small"
      allow-clear
      @change="emitFilters"
    >
      <a-option value="">全部结果</a-option>
      <a-option value="联系成功">联系成功</a-option>
      <a-option value="联系失败">联系失败</a-option>
      <a-option value="已发送">已发送</a-option>
      <a-option value="未联系到">未联系到</a-option>
    </a-select>
    <a-select 
      v-model="localFilterScore" 
      placeholder="效果评分" 
      style="width: 120px" 
      size="small"
      allow-clear
      @change="emitFilters"
    >
      <a-option value="">全部评分</a-option>
      <a-option value="high">高分(8-10)</a-option>
      <a-option value="medium">中分(5-7)</a-option>
      <a-option value="low">低分(0-4)</a-option>
    </a-select>
    <a-select 
      v-model="localFilterAmount" 
      placeholder="催收金额" 
      style="width: 120px" 
      size="small"
      allow-clear
      @change="emitFilters"
    >
      <a-option value="">全部金额</a-option>
      <a-option value="large">大额(>10万)</a-option>
      <a-option value="medium">中额(1-10万)</a-option>
      <a-option value="small">小额(<1万)</a-option>
    </a-select>
    <a-range-picker 
      v-model="localFilterDate" 
      size="small"
      style="width: 240px"
      @change="emitFilters"
    />
    <a-button size="small" @click="resetFilters">
      <template #icon>
        <IconRefresh />
      </template>
      重置
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'

export interface FilterState {
  method: string
  result: string
  score: string
  amount: string
  date: string[]
}

interface Props {
  filterMethod?: string
  filterResult?: string
  filterScore?: string
  filterAmount?: string
  filterDate?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  filterMethod: '',
  filterResult: '',
  filterScore: '',
  filterAmount: '',
  filterDate: () => []
})

const emit = defineEmits<{
  (e: 'update:filterMethod', value: string): void
  (e: 'update:filterResult', value: string): void
  (e: 'update:filterScore', value: string): void
  (e: 'update:filterAmount', value: string): void
  (e: 'update:filterDate', value: string[]): void
  (e: 'reset'): void
}>()

// 本地状态
const localFilterMethod = ref(props.filterMethod)
const localFilterResult = ref(props.filterResult)
const localFilterScore = ref(props.filterScore)
const localFilterAmount = ref(props.filterAmount)
const localFilterDate = ref(props.filterDate)

// 同步 props 变化
watch(() => props.filterMethod, (val) => { localFilterMethod.value = val })
watch(() => props.filterResult, (val) => { localFilterResult.value = val })
watch(() => props.filterScore, (val) => { localFilterScore.value = val })
watch(() => props.filterAmount, (val) => { localFilterAmount.value = val })
watch(() => props.filterDate, (val) => { localFilterDate.value = val })

// 发出筛选变化事件
const emitFilters = () => {
  emit('update:filterMethod', localFilterMethod.value)
  emit('update:filterResult', localFilterResult.value)
  emit('update:filterScore', localFilterScore.value)
  emit('update:filterAmount', localFilterAmount.value)
  emit('update:filterDate', localFilterDate.value)
}

// 重置筛选
const resetFilters = () => {
  localFilterMethod.value = ''
  localFilterResult.value = ''
  localFilterScore.value = ''
  localFilterAmount.value = ''
  localFilterDate.value = []
  emit('reset')
}
</script>

<style scoped>
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
</style>
