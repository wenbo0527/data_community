<template>
  <a-modal :visible="visible" @update:visible="(val: boolean) => emit('update:visible', val)" :title="`${platform} - 详细数据`" width="1200px" :footer="false">
    <div class="modal-container">
      <div class="summary-section">
        <a-descriptions :column="4" bordered>
          <a-descriptions-item label="业务类型">{{ businessType }}</a-descriptions-item>
          <a-descriptions-item label="平台产品">{{ platform }}</a-descriptions-item>
          <a-descriptions-item label="目标贷余">{{ formatNumber(targetLoan) }}</a-descriptions-item>
          <a-descriptions-item label="实际放款">{{ formatNumber(actualLoan) }}</a-descriptions-item>
          <a-descriptions-item label="外数成本">{{ formatNumber(externalDataCost) }}</a-descriptions-item>
          <a-descriptions-item label="预算状态">{{ budgetStatus }}</a-descriptions-item>
        </a-descriptions>
        <div class="summary-actions">
          <a-button size="small" type="outline" @click="goArchive">查看外数档案</a-button>
        </div>
      </div>

      <a-tabs type="rounded" class="tabs-section">
        <a-tab-pane key="budget" title="预算消耗对比">
          <BudgetConsumptionTab 
            :platform="platform" 
            :businessType="businessType" 
            :timeRange="timeRange" 
            :estimatedCost="estimatedCost"
            :actualCost="actualCost"
            :estimatedLoan="targetLoan"
            :actualLoan="actualLoan"
            :externalDataCost="externalDataCost"
            :estimatedAnnualCost="estimatedAnnualCost"
            :actualAnnualCost="actualAnnualCost"
            @time-range-change="handleTimeRangeChange"
          />
        </a-tab-pane>
        <a-tab-pane key="process" title="业务过程比对">
          <BusinessProcessTab 
            :platform="platform" 
            :businessType="businessType" 
            :timeRange="timeRange" 
            :estimatedRiskFreeReturn="estimatedRiskFreeReturn"
            :actualRiskFreeReturn="actualRiskFreeReturn"
            :estimatedAnnualCost="estimatedAnnualCost"
            :actualAnnualCost="actualAnnualCost"
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
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: { type: Boolean, required: true },
  platform: { type: String, required: true },
  businessType: { type: String, required: true },
  targetLoan: { type: Number, required: false, default: 0 },
  actualLoan: { type: Number, required: false, default: 0 },
  externalDataCost: { type: Number, required: false, default: 0 },
  budgetStatus: { type: String, required: false, default: '超支' },
  estimatedCost: { type: Number, required: false, default: 0 },
  actualCost: { type: Number, required: false, default: 0 },
  estimatedAnnualCost: { type: Number, required: false, default: 0 },
  actualAnnualCost: { type: Number, required: false, default: 0 },
  estimatedRiskFreeReturn: { type: Number, required: false, default: 0 },
  actualRiskFreeReturn: { type: Number, required: false, default: 0 }
})
const emit = defineEmits(['update:visible'])
const timeRange = ref<'month' | 'quarter'>('month')
const handleTimeRangeChange = (range: 'month' | 'quarter') => { timeRange.value = range }
const formatNumber = (n: number) => { if (n === null || n === undefined) return '—'; return Number(n).toLocaleString() }
const router = useRouter()
const goArchive = () => { router.push({ path: '/external-data/archive', query: { keyword: props.platform || '' } }) }
</script>

<style scoped>
.modal-container { padding: 16px; }
.summary-section { margin-bottom: 24px; }
.tabs-section { margin-top: 16px; }
.summary-actions { margin-top: 8px; text-align: right; }
</style>
