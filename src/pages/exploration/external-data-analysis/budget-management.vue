<template>
  <div class="budget-management">
    <!-- 上传和筛选区域 -->
    <a-card class="action-card">
      <template #title>预算管理</template>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <a-space :size="16">
          <a-select 
            v-model="selectedGranularity" 
            :options="granularityOptions" 
            placeholder="预算粒度"
            style="width: 160px"
            allow-clear
          />
          <a-input 
            v-model="selectedTime" 
            placeholder="时间"
            style="width: 160px"
            allow-clear
          />
          <a-button type="primary" @click="handleFilter">筛选</a-button>
          <a-button @click="resetFilter">重置</a-button>
        </a-space>
        
        <div style="display: flex; gap: 16px">
          <a-upload
            :custom-request="handleUpload"
            :show-file-list="false"
            accept=".xlsx,.xls"
          >
            <template #upload-button>
              <a-button type="primary">
                <template #icon>
                  <icon-upload />
                </template>
                上传预算数据
              </a-button>
            </template>
          </a-upload>
          <a-button
            type="text"
            class="download-template"
            @click="downloadTemplate"
          >
            <template #icon>
              <icon-download />
            </template>
            下载模板
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 预算数据表格 -->
    <a-card class="table-card">
      <template #title>预算数据列表</template>
      <a-table :data="budgetList" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="业务类型" data-index="businessType" />
          <a-table-column title="平台产品" data-index="platform" />
          <a-table-column title="目标贷余" data-index="targetLoan">
            <template #cell="{ record }">
              {{ formatAmount(record.targetLoan) }}
            </template>
          </a-table-column>
          <a-table-column title="预估放款" data-index="estimatedLoan">
            <template #cell="{ record }">
              {{ formatAmount(record.estimatedLoan) }}
            </template>
          </a-table-column>
          <a-table-column title="预估费用" data-index="estimatedCost">
            <template #cell="{ record }">
              {{ formatAmount(record.estimatedCost) }}
            </template>
          </a-table-column>
          <a-table-column title="年化数据成本" data-index="estimatedAnnualCost">
            <template #cell="{ record }">
              {{ formatPercent(record.estimatedAnnualCost) }}
            </template>
          </a-table-column>
          <a-table-column title="无风险收益" data-index="estimatedRiskFreeReturn">
            <template #cell="{ record }">
              {{ formatPercent(record.estimatedRiskFreeReturn) }}
            </template>
          </a-table-column>
          <a-table-column title="预算粒度" data-index="budgetGranularity">
            <template #cell="{ record }">
              {{ record.budgetGranularity }}
            </template>
          </a-table-column>
          <a-table-column title="对应时间" data-index="budgetTime">
            <template #cell="{ record }">
              {{ record.budgetTime }}
            </template>
          </a-table-column>

        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'
import { generateWarningData } from '@/mock/external-data'
import type { BudgetData } from '@/mock/external-data'
import type { RequestOption, UploadRequest } from '@arco-design/web-vue/es/upload'

// 数据列表
const budgetList = ref<BudgetData[]>([])
const loading = ref(false)

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})

// 格式化金额
const formatAmount = (value: number) => {
  return value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-'
}

// 格式化百分比
const formatPercent = (value: number) => {
  return value ? `${(value * 100).toFixed(2)}%` : '-'
}

// 处理文件上传
const handleUpload = (options: RequestOption) => {
  Message.success('上传弹窗已显示')
  return { abort: () => {} } as UploadRequest
}

// 下载模板
const downloadTemplate = () => {
  // 实现模板下载逻辑
  const templateUrl = '/templates/budget-template.xlsx'
  window.open(templateUrl, '_blank')
}

// 获取预算列表
// 筛选相关状态
const selectedGranularity = ref('')
const selectedTime = ref('')

// 预算粒度筛选项
const granularityOptions = ref([
  { label: '年', value: '年' },
  { label: '季', value: '季' },
  { label: '月', value: '月' }
])

// 处理筛选
const handleFilter = () => {
  fetchBudgetList()
}

// 重置筛选
const resetFilter = () => {
  selectedGranularity.value = ''
  selectedTime.value = ''
  fetchBudgetList()
}

const fetchBudgetList = async () => {
  loading.value = true
  try {
    let data = generateWarningData().map(item => {
      const granularity = ['年', '季', '月'][Math.floor(Math.random() * 3)]
      let time = ''
      if (granularity === '年') {
        time = '2025'
      } else if (granularity === '季') {
        time = `Q${Math.floor(Math.random() * 3) + 1}`
      } else {
        time = `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`
      }
      return {
        ...item,
        budgetGranularity: granularity,
        budgetTime: time
      }
    })
    
    // 默认排序：按粒度(年>季>月)和时间升序
    data.sort((a, b) => {
      const granularityOrder: Record<string, number> = { '年': 1, '季': 2, '月': 3 }
      if (granularityOrder[a.budgetGranularity] !== granularityOrder[b.budgetGranularity]) {
        return granularityOrder[a.budgetGranularity] - granularityOrder[b.budgetGranularity]
      }
      return a.budgetTime.localeCompare(b.budgetTime)
    })
    
    // 筛选逻辑
    if (selectedGranularity.value) {
      data = data.filter(item => item.budgetGranularity === selectedGranularity.value)
    }
    if (selectedTime.value) {
      data = data.filter(item => item.budgetTime.includes(selectedTime.value))
    }
    
    budgetList.value = data
    pagination.value.total = data.length
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const onPageChange = (page: number) => {
  pagination.value.current = page
  fetchBudgetList()
}



onMounted(() => {
  fetchBudgetList()
})
</script>

<style scoped>
.budget-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.upload-card,
.filter-card,
.table-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
}

.download-template {
  margin-left: 16px;
  color: var(--color-text-2);
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}

:deep(.arco-table-th) {
  background-color: #f2f3f5;
  font-weight: 500;
}
</style>