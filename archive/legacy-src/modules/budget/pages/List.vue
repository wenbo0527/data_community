<template>
  <div class="budget-list">
    <a-card class="filter-card" :bordered="true" style="margin-bottom: 12px">
      <a-form :model="filterForm" layout="inline">
        <a-form-item field="businessType" label="业务类型">
          <a-select v-model="filterForm.businessType" placeholder="选择业务类型" allow-clear style="width: 140px">
            <a-option value="助贷">助贷</a-option>
            <a-option value="直贷">直贷</a-option>
            <a-option value="融担">融担</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="platform" label="平台">
          <a-select v-model="filterForm.platform" placeholder="选择平台" allow-clear style="width: 140px">
            <a-option v-for="p in platformOptions" :key="p" :value="p">{{ p }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="granularity" label="预算粒度">
          <a-select v-model="filterForm.granularity" placeholder="选择粒度" allow-clear style="width: 120px">
            <a-option value="year">年</a-option>
            <a-option value="quarter">季</a-option>
            <a-option value="month">月</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="year" label="年度">
          <a-select v-model="filterForm.year" placeholder="选择年度" allow-clear style="width: 120px">
            <a-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="quarter" label="季度">
          <a-select v-model="filterForm.quarter" placeholder="选择季度" allow-clear style="width: 120px">
            <a-option :value="1">Q1</a-option>
            <a-option :value="2">Q2</a-option>
            <a-option :value="3">Q3</a-option>
            <a-option :value="4">Q4</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="month" label="月份">
          <a-select v-model="filterForm.month" placeholder="选择月份" allow-clear style="width: 120px">
            <a-option v-for="m in 12" :key="m" :value="m">{{ m }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilters">筛选</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="showCreateModal = true">
              <template #icon><IconPlus /></template>
              新建/上传预算
            </a-button>
            <a-link class="download-template" @click="downloadTemplate">下载模板</a-link>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    <a-table :data="displayedList" :loading="loading" :pagination="pagination" @page-change="onPageChange" row-key="id">
      <template #columns>
        <a-table-column title="业务类型" :width="120">
          <template #cell="{ record }">{{ record.businessType }}</template>
        </a-table-column>
        <a-table-column title="平台产品" :width="160">
          <template #cell="{ record }">{{ record.platform }}-{{ record.businessType }}</template>
        </a-table-column>
        <a-table-column title="目标贷余" :width="140">
          <template #cell="{ record }">¥{{ formatAmount(record.targetLoan) }}</template>
        </a-table-column>
        <a-table-column title="预估放款" :width="140">
          <template #cell="{ record }">¥{{ formatAmount(record.estimatedLoan) }}</template>
        </a-table-column>
        <a-table-column title="预估费用" :width="120">
          <template #cell="{ record }">¥{{ formatAmount(record.estimatedCost) }}</template>
        </a-table-column>
        <a-table-column title="年化数据成本" :width="140">
          <template #cell="{ record }">{{ (record.estimatedAnnualCost * 100).toFixed(2) }}%</template>
        </a-table-column>
        <a-table-column title="无风险收益" :width="140">
          <template #cell="{ record }">{{ (record.estimatedRiskFreeReturn * 100).toFixed(2) }}%</template>
        </a-table-column>
        <a-table-column title="预算粒度" :width="120">
          <template #cell="{ record }">{{ granularityLabel(record.granularity) }}</template>
        </a-table-column>
        <a-table-column title="对应时间" :width="140">
          <template #cell="{ record }">{{ record.timeLabel }}</template>
        </a-table-column>
        <a-table-column title="剩余金额" :width="140">
          <template #cell="{ record }">¥{{ formatAmount(record.remainingAmount) }}</template>
        </a-table-column>
        <a-table-column title="操作" :width="200">
          <template #cell="{ record }">
            <a-space>
              <a-button size="small" type="text" @click="handleViewDetail(record)">详情</a-button>
              <a-button size="small" type="text" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm content="确认删除该预算？" @ok="() => handleDelete(record)">
                <a-button size="small" status="danger" type="text">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
    <a-modal v-model:visible="showCreateModal" title="新建/上传预算" :width="720" @ok="confirmCreate" @cancel="cancelCreate">
      <a-tabs v-model:active-key="createActiveTab">
        <a-tab-pane key="single" title="单独创建">
          <a-form :model="singleForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="预算名称" field="budgetName" required>
                  <a-input v-model="singleForm.budgetName" placeholder="请输入预算名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="年度" field="budgetYear" required>
                  <a-select v-model="singleForm.budgetYear" placeholder="选择年度">
                    <a-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="季度" field="budgetQuarter">
                  <a-select v-model="singleForm.budgetQuarter" placeholder="选择季度">
                    <a-option :value="1">Q1</a-option>
                    <a-option :value="2">Q2</a-option>
                    <a-option :value="3">Q3</a-option>
                    <a-option :value="4">Q4</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="月份" field="budgetMonth">
                  <a-select v-model="singleForm.budgetMonth" placeholder="选择月份">
                    <a-option v-for="m in 12" :key="m" :value="m">{{ m }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="总金额" field="totalAmount">
                  <a-input-number v-model="singleForm.totalAmount" :min="0" :precision="2" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="产品类型" field="productType">
                  <a-select v-model="singleForm.productType" placeholder="选择类型">
                    <a-option value="API">API</a-option>
                    <a-option value="文件">文件</a-option>
                    <a-option value="数据库">数据库</a-option>
                    <a-option value="平台工具">平台工具</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="平台" field="platform">
                  <a-select v-model="singleForm.platform" placeholder="选择平台">
                    <a-option value="Web">Web</a-option>
                    <a-option value="Android">Android</a-option>
                    <a-option value="iOS">iOS</a-option>
                    <a-option value="服务端">服务端</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="batch" title="批量上传">
          <a-space style="margin-bottom: 8px">
            <a-link @click="downloadTemplate">下载模板</a-link>
          </a-space>
          <p>支持上传 Excel（.xlsx/.xls）或 CSV 文件，字段：业务类型、平台、预算粒度、对应时间、目标贷余、预估放款、预估费用、年化数据成本、无风险收益。</p>
          <a-upload :show-file-list="false" :custom-request="handleBatchUpload" accept=".xlsx,.xls,.csv">
            <a-button type="outline">
              <template #icon><IconUpload /></template>
              选择文件上传
            </a-button>
          </a-upload>
          <div v-if="batchPreview.length" style="margin-top: 12px">
            <a-table :data="batchPreview" :pagination="false">
              <template #columns>
                <a-table-column title="业务类型" data-index="businessType" />
                <a-table-column title="平台" data-index="platform" />
                <a-table-column title="预算粒度" data-index="granularity" />
                <a-table-column title="对应时间" data-index="timeLabel" />
                <a-table-column title="目标贷余" data-index="targetLoan" />
                <a-table-column title="预估放款" data-index="estimatedLoan" />
                <a-table-column title="预估费用" data-index="estimatedCost" />
                <a-table-column title="年化数据成本" data-index="estimatedAnnualCost" />
                <a-table-column title="无风险收益" data-index="estimatedRiskFreeReturn" />
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconPlus } from '@arco-design/web-vue/es/icon'
import { budgetApiService } from '@/api/budget'
import type { RequestOption, UploadRequest } from '@arco-design/web-vue/es/upload'
import * as XLSX from 'xlsx'

interface BudgetItem {
  id: string
  businessType: string
  platform: string
  targetLoan: number
  estimatedLoan: number
  estimatedCost: number
  estimatedAnnualCost: number
  estimatedRiskFreeReturn: number
  granularity?: 'year'|'quarter'|'month'
  timeLabel?: string
}

const props = defineProps<{ reloadToken?: number }>()

const router = useRouter()
const loading = ref(false)
const budgetList = ref<BudgetItem[]>([])
const pagination = ref({ current: 1, pageSize: 10, total: 0 })
const filterForm = reactive<{ granularity?: 'year'|'quarter'|'month'; time?: string }>({})
const yearOptions = computed(() => {
  const now = new Date().getFullYear()
  return [now, now - 1, now - 2, now - 3, now - 4]
})
const displayedList = computed(() => {
  return budgetList.value.filter((i) => {
    if (filterForm.granularity && i.granularity !== filterForm.granularity) return false
    if (filterForm.time && i.timeLabel) {
      const t = filterForm.time.trim()
      if (t.includes('-')) {
        if (i.timeLabel !== t) return false
      } else if (t.startsWith('Q')) {
        if (!i.timeLabel.includes(t)) return false
      } else if (/^\d{4}$/.test(t)) {
        if (!i.timeLabel.startsWith(t)) return false
      }
    }
    return true
  })
})

const showCreateModal = ref(false)
const createActiveTab = ref('single')
const singleForm = reactive({ businessType: '助贷', platform: '蚂蚁', targetLoan: 900000, estimatedLoan: 700000, estimatedCost: 50000, estimatedAnnualCost: 0.045, estimatedRiskFreeReturn: 0.075, granularity: 'month' as 'year'|'quarter'|'month', year: new Date().getFullYear(), quarter: undefined as number | undefined, month: new Date().getMonth()+1 })
const batchPreview = ref<Partial<BudgetItem>[]>([])
const handleBatchUpload = async (option: any) => {
  try {
    const file = option.fileItem?.file || option.file
    const reader = new FileReader()
    const isCSV = /\.csv$/i.test(file.name)
    reader.onload = async (e) => {
      const data = e.target?.result
      let rows: any[] = []
      if (isCSV && typeof data === 'string') {
        rows = data.split(/\r?\n/).map((line) => line.split(','))
        const header = rows.shift() || []
        rows = rows.filter(r => r.length && r.some(cell => String(cell).trim().length))
        batchPreview.value = rows.map((r) => ({
          businessType: r[header.indexOf('业务类型')] || r[0],
          platform: r[header.indexOf('平台')] || r[1],
          granularity: (r[header.indexOf('预算粒度')] || r[2]) as any,
          timeLabel: r[header.indexOf('对应时间')] || r[3],
          targetLoan: Number(r[header.indexOf('目标贷余')] || r[4] || 0),
          estimatedLoan: Number(r[header.indexOf('预估放款')] || r[5] || 0),
          estimatedCost: Number(r[header.indexOf('预估费用')] || r[6] || 0),
          estimatedAnnualCost: Number(r[header.indexOf('年化数据成本')] || r[7] || 0),
          estimatedRiskFreeReturn: Number(r[header.indexOf('无风险收益')] || r[8] || 0)
        }))
      } else {
        const wb = XLSX.read(data as ArrayBuffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws)
        batchPreview.value = (json as any[]).map((row) => ({
          businessType: row['业务类型'] || row['businessType'] || '助贷',
          platform: row['平台'] || row['platform'] || '蚂蚁',
          granularity: row['预算粒度'] || row['granularity'] || 'month',
          timeLabel: row['对应时间'] || row['timeLabel'] || `${new Date().getFullYear()}-${String((new Date().getMonth()+1)).padStart(2,'0')}`,
          targetLoan: Number(row['目标贷余'] || row['targetLoan'] || 0),
          estimatedLoan: Number(row['预估放款'] || row['estimatedLoan'] || 0),
          estimatedCost: Number(row['预估费用'] || row['estimatedCost'] || 0),
          estimatedAnnualCost: Number(row['年化数据成本'] || row['estimatedAnnualCost'] || 0),
          estimatedRiskFreeReturn: Number(row['无风险收益'] || row['estimatedRiskFreeReturn'] || 0)
        }))
      }
      Message.success('文件解析成功')
    }
    if (isCSV) reader.readAsText(file)
    else reader.readAsArrayBuffer(file)
  } catch (err) {
    console.error(err)
    Message.error('文件解析失败')
  }
  return { abort() {} }
}
const confirmBatch = async () => {
  for (const row of batchPreview.value) {
    await budgetApiService.createBudget({
      businessType: String(row.businessType || '助贷'),
      platform: String(row.platform || '蚂蚁'),
      targetLoan: Number(row.targetLoan || 900000),
      estimatedLoan: Number(row.estimatedLoan || 700000),
      estimatedCost: Number(row.estimatedCost || 50000),
      estimatedAnnualCost: Number(row.estimatedAnnualCost || 0.045),
      estimatedRiskFreeReturn: Number(row.estimatedRiskFreeReturn || 0.075),
      granularity: row.granularity || 'month',
      timeLabel: String(row.timeLabel || `${new Date().getFullYear()}-${String((new Date().getMonth()+1)).padStart(2,'0')}`)
    })
  }
  Message.success('批量上传完成')
  showCreateModal.value = false
  batchPreview.value = []
  await loadBudgetList()
}
const cancelBatch = () => { showCreateModal.value = false; batchPreview.value = [] }

const confirmCreate = async () => {
  if (createActiveTab.value === 'single') {
    await budgetApiService.createBudget({
      businessType: singleForm.businessType,
      platform: singleForm.platform,
      targetLoan: Number(singleForm.targetLoan || 0),
      estimatedLoan: Number(singleForm.estimatedLoan || 0),
      estimatedCost: Number(singleForm.estimatedCost || 0),
      estimatedAnnualCost: Number(singleForm.estimatedAnnualCost || 0),
      estimatedRiskFreeReturn: Number(singleForm.estimatedRiskFreeReturn || 0),
      granularity: singleForm.granularity,
      timeLabel: singleForm.granularity === 'year' ? String(singleForm.year) : singleForm.granularity === 'quarter' ? `${singleForm.year}-Q${singleForm.quarter || Math.ceil((singleForm.month || 1)/3)}` : `${singleForm.year}-${String(singleForm.month || 1).padStart(2,'0')}`
    })
    Message.success('创建成功')
    showCreateModal.value = false
    await loadBudgetList()
  } else {
    await confirmBatch()
  }
}
const cancelCreate = () => { cancelBatch() }

const formatAmount = (val?: number) => {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString()
}

const granularityLabel = (g?: 'year'|'quarter'|'month') => {
  if (g === 'year') return '年'
  if (g === 'quarter') return '季'
  if (g === 'month') return '月'
  return '—'
}

const loadBudgetList = async () => {
  loading.value = true
  try {
    const resp = await budgetApiService.getBudgets({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    budgetList.value = resp.list || []
    pagination.value.total = (resp as any).total || resp.list?.length || 0
  } catch (err) {
    console.error('加载预算列表失败', err)
    Message.error('预算列表加载失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (page: number) => {
  pagination.value.current = page
  loadBudgetList()
}

const applyFilters = () => {}
const resetFilters = () => {
  filterForm.year = undefined
  filterForm.quarter = undefined
  filterForm.month = undefined
  filterForm.productType = undefined
  filterForm.platform = undefined
}

const goCreate = () => {
  router.push('/budget/create')
}

const handleUpload = async (options: RequestOption): Promise<UploadRequest> => {
  try {
    await budgetApiService.createBudget({})
    Message.success('上传成功，列表已刷新')
    await loadBudgetList()
  } catch (err: any) {
    Message.error(err?.message || '上传失败')
  }
  return { abort() {} } as UploadRequest
}

const downloadTemplate = () => {
  const headers = ['业务类型','平台','预算粒度','对应时间','目标贷余','预估放款','预估费用','年化数据成本','无风险收益']
  const sample = ['助贷','蚂蚁','month',`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,900000,700000,50000,0.045,0.075]
  const ws = XLSX.utils.aoa_to_sheet([headers, sample])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '预算模板')
  XLSX.writeFile(wb, 'budget-template.xlsx')
}

const handleViewDetail = (record: BudgetItem) => {
  router.push(`/budget/detail/${record.id}`)
}

const handleEdit = (record: BudgetItem) => {
  router.push(`/budget/edit/${record.id}`)
}

const handleDelete = async (record: BudgetItem) => {
  try {
    await budgetApiService.deleteBudget(record.id)
    Message.success('删除成功')
    loadBudgetList()
  } catch (err) {
    console.error('删除失败', err)
    Message.error('删除失败')
  }
}

watch(() => props.reloadToken, () => { loadBudgetList() })

loadBudgetList()
</script>

<style scoped>
.budget-list { min-height: 200px; }
.toolbar { margin-bottom: 12px; }
.download-template { margin-left: 12px; }
</style>
