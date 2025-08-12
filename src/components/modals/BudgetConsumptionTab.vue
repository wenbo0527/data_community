<template>
  <div class="budget-consumption-tab">
    <div class="time-range-selector">
      <a-radio-group :value="timeRange" type="button" @change="emitTimeRangeChange">
        <a-radio value="month">月度比对</a-radio>
        <a-radio value="quarter">季度比对</a-radio>
      </a-radio-group>
    </div>

    <a-table 
      :data="tableData" 
      :pagination="false" 
      :bordered="{ wrapper: true, cell: true }"
      class="budget-table"
    >
      <template #columns>
        <a-table-column title="关键指标" data-index="name" :width="120">
          <template #cell="{ record }">
            <div @click="record.onClick" :class="{ 'clickable': record.onClick }">
              {{ record.name }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="当期数据" data-index="current" :width="150">
          <template #cell="{ record }">
            <div class="comparison-cell">
              {{ record.type === 'amount' ? formatAmount(record.current) : record.current }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="环比" data-index="change" :width="150">
          <template #cell="{ record }">
            <div class="comparison-cell">
              <span :class="getChangeClass(record.change)">
                {{ formatChangeValue(record.change, record.type) }}
              </span>
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatAmount, formatChangeValue } from '@/utils/calculations'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true
  },
  timeRange: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['time-range-change'])

const tableData = ref([
  {
    name: '实际费用',
    current: 120000,
    change: 20000,
    type: 'amount'
  },
  {
    name: '征信调用量',
    current: 1500,
    change: 200,
    type: 'number'
  },
  {
    name: '征信单笔成本',
    current: 80,
    change: 5,
    type: 'amount'
  },
  {
    name: '外部数据使用量',
    current: 1000,
    change: 150,
    type: 'number',
    onClick: () => {
      router.push({
        path: '/exploration/external-data-evaluation/list',
        query: {
          platform: props.platform
        }
      })
    }
  },
  {
    name: '外部数据调用量',
    current: 500,
    change: 50,
    type: 'number'
  },
  {
    name: '外部数据平均单价',
    current: 240,
    change: 20,
    type: 'amount'
  }
])

const emitTimeRangeChange = () => {
  emit('time-range-change', props.timeRange)
}

const getChangeClass = (value: number) => {
  return value > 0 ? 'warning-text' : 'success-text'
}
</script>

<style scoped>
.budget-consumption-tab {
  padding: 16px;
}

.time-range-selector {
  margin-bottom: 16px;
}

.comparison-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.warning-text {
  color: #f53f3f;
}

.success-text {
  color: #00b42a;
}

.clickable {
  cursor: pointer;
}
</style>