<template>
  <a-modal :visible="visible" @update:visible="(val: boolean) => emit('update:visible', val)" :title="`${platform} - 详细数据`" width="1200px" :footer="false">
    <div class="modal-container">
      <!-- 总结栏 -->
      <div class="summary-section">
        <a-descriptions :column="4" bordered>
          <a-descriptions-item label="业务类型">{{ businessType }}</a-descriptions-item>
          <a-descriptions-item label="平台产品">{{ platform }}</a-descriptions-item>
          <a-descriptions-item label="实际放款">{{ formatAmount(actualLoan) }}</a-descriptions-item>
          <a-descriptions-item label="实际费用">{{ formatAmount(externalDataCost) }}</a-descriptions-item>
          <a-descriptions-item label="预算状态">{{ budgetStatus }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- Tab页 -->
      <a-tabs type="rounded" class="tabs-section">
        <a-tab-pane key="budget" title="预算消耗对比">
          <BudgetConsumptionTab 
            :platform="platform" 
            :businessType="businessType" 
            :timeRange="timeRange" 
            @time-range-change="handleTimeRangeChange"
          />
        </a-tab-pane>
        <a-tab-pane key="process" title="业务过程比对">
          <BusinessProcessTab 
            :platform="platform" 
            :businessType="businessType" 
            :timeRange="timeRange" 
            @time-range-change="handleTimeRangeChange"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BudgetConsumptionTab from './BudgetConsumptionTab.vue'
import BusinessProcessTab from './BusinessProcessTab.vue'
import { formatAmount } from '@/utils/calculations'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true
  },
  actualLoan: {
    type: Number,
    required: true
  },
  externalDataCost: {
    type: Number,
    required: true
  },
  budgetStatus: {
    type: String,
    required: true,
    default: '超支'
  }
})

const emit = defineEmits(['update:visible'])

const timeRange = ref<'month' | 'quarter'>('month')

const handleTimeRangeChange = (range: 'month' | 'quarter') => {
  timeRange.value = range
}
</script>

<style scoped>
.modal-container {
  padding: 16px;
}

.summary-section {
  margin-bottom: 24px;
}

.tabs-section {
  margin-top: 16px;
}
</style>