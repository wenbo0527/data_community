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
import { ref, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'
import type { RequestOption, UploadRequest } from '@arco-design/web-vue/es/upload'
import { useBudgetStore } from '@/store/modules/budget'
import type { BudgetData } from '@/store/modules/budget'

// 接入统一预算 Store
const store = useBudgetStore()
const loading = computed(() => store.loading)

// 页面展示用的预算列表（由 store.list 加筛选/排序得到）
const budgetList = ref<BudgetData[]>([])

// 分页配置（本页本地维护，驱动 store.fetchBudgetList）
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

// 处理文件上传（先接入 Mock 追加，后续替换为真实Excel上传解析）
const handleUpload = async (options: RequestOption) => {
  const ok = await store.uploadMock()
  if (ok) {
    await fetchBudgetList()
    Message.success('已追加Mock数据')
  } else {
    Message.error('追加失败')
  }
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
  try {
    await store.fetchBudgetList({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    // 以 store.list 为基础进行（占位）筛选与排序
    let data: BudgetData[] = [...store.list]
    // 保留筛选控件占位（当前数据未提供粒度/时间字段，则不筛选）
    if (selectedGranularity.value && 'budgetGranularity' in (data[0] || {})) {
      data = data.filter((item: any) => item.budgetGranularity === selectedGranularity.value)
    }
    if (selectedTime.value && 'budgetTime' in (data[0] || {})) {
      data = data.filter((item: any) => String(item.budgetTime).includes(selectedTime.value))
    }
    budgetList.value = data
    pagination.value.total = store.total
  } catch (error: any) {
    Message.error(error.message || '获取数据失败')
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