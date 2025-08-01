<template>
  <div class="business-process-tab">
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
      :span-method="spanMethod"
      class="process-table"
    >
      <template #columns>
        <a-table-column title="客群结构" data-index="customerType" :width="120">
          <template #cell="{ record, rowIndex }">
            <template v-if="rowIndex % 8 === 0">
              {{ record.customerType }}
            </template>
          </template>
        </a-table-column>
        <a-table-column title="业务流程" data-index="processName" :width="150">
          <template #cell="{ record }">
            {{ record.processName }}
          </template>
        </a-table-column>
        <a-table-column title="实际数据" data-index="currentValue" :width="150">
          <template #cell="{ record }">
            <div class="comparison-cell">
              {{ record.processName === '授信申请量' ? record.creditApplyCount.current : 
                 record.processName === '授信通过率' ? formatPercent(record.creditApprovalRate.current) :
                 record.processName === '授信平均额度' ? formatAmount(record.creditLimit.current) :
                 record.processName === '支用申请量' ? record.loanApplyCount.current :
                 record.processName === '支用通过率' ? formatPercent(record.loanApprovalRate.current) :
                 record.processName === '支用金额' ? formatAmount(record.loanAmount.current) :
                 record.processName === '平均期数' ? record.averageTerm.current :
                 formatPercent(record.averagePricing.current) }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="环比" data-index="change" :width="150">
          <template #cell="{ record }">
            <div class="comparison-cell">
              <span :class="getChangeClass(
                record.processName === '授信申请量' ? record.creditApplyCount.change :
                record.processName === '授信通过率' ? record.creditApprovalRate.change :
                record.processName === '授信平均额度' ? record.creditLimit.change :
                record.processName === '支用申请量' ? record.loanApplyCount.change :
                record.processName === '支用通过率' ? record.loanApprovalRate.change :
                record.processName === '支用金额' ? record.loanAmount.change :
                record.processName === '平均期数' ? record.averageTerm.change :
                record.averagePricing.change
              )">
                {{ record.processName === '授信申请量' ? formatChangeValue(record.creditApplyCount.change, 'number') :
                   record.processName === '授信通过率' ? formatChangeValue(record.creditApprovalRate.change, 'percent') :
                   record.processName === '授信平均额度' ? formatChangeValue(record.creditLimit.change, 'amount') :
                   record.processName === '支用申请量' ? formatChangeValue(record.loanApplyCount.change, 'number') :
                   record.processName === '支用通过率' ? formatChangeValue(record.loanApprovalRate.change, 'percent') :
                   record.processName === '支用金额' ? formatChangeValue(record.loanAmount.change, 'amount') :
                   record.processName === '平均期数' ? formatChangeValue(record.averageTerm.change, 'number') :
                   formatChangeValue(record.averagePricing.change, 'percent') }}
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
import { formatAmount, formatPercent, formatChangeValue } from '@/utils/calculations'

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
    customerType: '新户',
    processName: '授信申请量',
    creditApplyCount: { current: 5000, change: 500 },
    rowSpan: 2
  },
  {
    customerType: '新户',
    processName: '授信通过率',
    creditApprovalRate: { current: 0.65, change: 0.05 },
    rowSpan: 0
  },
  {
    customerType: '新户',
    processName: '授信平均额度',
    creditLimit: { current: 5000000, change: 500000 },
    rowSpan: 2
  },
  {
    customerType: '新户',
    processName: '支用申请量',
    loanApplyCount: { current: 3000, change: 300 },
    rowSpan: 0
  },
  {
    customerType: '新户',
    processName: '支用通过率',
    loanApprovalRate: { current: 0.8, change: 0.02 },
    rowSpan: 2
  },
  {
    customerType: '新户',
    processName: '支用金额',
    loanAmount: { current: 3000000, change: 300000 },
    rowSpan: 0
  },
  {
    customerType: '新户',
    processName: '平均期数',
    averageTerm: { current: 12, change: 1 },
    rowSpan: 2
  },
  {
    customerType: '新户',
    processName: '平均定价',
    averagePricing: { current: 0.15, change: 0.01 },
    rowSpan: 0
  },
  {
    customerType: '老户',
    processName: '授信申请量',
    creditApplyCount: { current: 4000, change: 400 },
    rowSpan: 2
  },
  {
    customerType: '老户',
    processName: '授信通过率',
    creditApprovalRate: { current: 0.6, change: 0.04 },
    rowSpan: 0
  },
  {
    customerType: '老户',
    processName: '授信平均额度',
    creditLimit: { current: 4000000, change: 400000 },
    rowSpan: 2
  },
  {
    customerType: '老户',
    processName: '支用申请量',
    loanApplyCount: { current: 2000, change: 200 },
    rowSpan: 0
  },
  {
    customerType: '老户',
    processName: '支用通过率',
    loanApprovalRate: { current: 0.75, change: 0.01 },
    rowSpan: 2
  },
  {
    customerType: '老户',
    processName: '支用金额',
    loanAmount: { current: 2000000, change: 200000 },
    rowSpan: 0
  },
  {
    customerType: '老户',
    processName: '平均期数',
    averageTerm: { current: 10, change: 0.5 },
    rowSpan: 2
  },
  {
    customerType: '老户',
    processName: '平均定价',
    averagePricing: { current: 0.12, change: 0.005 },
    rowSpan: 0
  }]
)

const emitTimeRangeChange = () => {
  emit('time-range-change', props.timeRange)
}

const getChangeClass = (value: number) => {
  return value > 0 ? 'warning-text' : 'success-text'
}

const spanMethod = ({ record, column, rowIndex }: { record: any; column: any; rowIndex: number }) => {
  if (column.dataIndex === 'customerType') {
    const sameTypeRows = tableData.value.filter(item => item.customerType === record.customerType);
    const isFirstRow = tableData.value.findIndex(item => item.customerType === record.customerType) === rowIndex;
    
    return {
      rowspan: isFirstRow ? sameTypeRows.length : 0,
      colspan: 1
    }
  }
  return {
    rowspan: 1,
    colspan: 1
  }
}
</script>

<style scoped>
.business-process-tab {
  padding: 16px;
}

.time-range-selector {
  margin-bottom: 16px;
}

.process-table {
  :deep(.arco-table-tr) {
    height: 48px;
  }
  :deep(.arco-table-cell) {
    padding: 12px 8px;
  }
}

.comparison-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.warning-text {
  color: #f53f3f;
  font-weight: 600;
}

.success-text {
  color: #00b42a;
  font-weight: 600;
}
</style>