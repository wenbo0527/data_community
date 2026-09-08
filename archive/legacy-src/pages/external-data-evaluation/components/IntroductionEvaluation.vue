<template>
  <div class="intro-evaluation">
    <a-card title="引入评估" hoverable>
      <a-form layout="inline" :model="query" class="query-bar" @submit.prevent="onSearch">
        <a-form-item field="dateRange" label="时间范围">
          <a-range-picker v-model="query.dateRange" style="width: 240px" />
        </a-form-item>
        <a-form-item field="reportType" label="报告类型">
          <a-select v-model="query.reportType" style="width: 180px" allow-clear>
            <a-option value="产品级效果评估">产品级效果评估</a-option>
            <a-option value="供应商评估">供应商评估</a-option>
            <a-option value="引入价值评估">引入价值评估</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="keyword" label="关键词">
          <a-input v-model="query.keyword" placeholder="报告名/产品/接口" style="width: 200px" />
        </a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button type="outline" @click="onReset">重置</a-button>
        </a-space>
      </a-form>

      <a-table
        row-key="id"
        :data="list"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="报告ID" data-index="id" width="100" />
          <a-table-column title="报告名称" data-index="title" />
          <a-table-column title="报告类型" data-index="reportType" width="160" />
          <a-table-column title="状态" data-index="status" width="120" />
          <a-table-column title="创建时间" data-index="createdAt" width="180" />
          <a-table-column title="操作" width="140">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" type="text" @click="viewDetail(record.id)">详情</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="detailVisible" :title="detail?.title || '评估报告详情'" width="640">
      <a-descriptions :data="detailItems" :column="2" :label-style="{ 'font-weight': 600, width: '120px' }" />
    </a-modal>
  </div>
  
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watchEffect } from 'vue'
import { useExternalDataStore } from '../../../store/modules/external-data'

const store = useExternalDataStore()

const loading = computed(() => store.evaluationLoading)
const list = computed(() => store.evaluationList)
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true
})
// 同步store分页信息到本地分页对象（保留showTotal）
watchEffect(() => {
  pagination.total = store.evaluationPagination.total
  pagination.current = store.evaluationPagination.page
  pagination.pageSize = store.evaluationPagination.pageSize
})

const query = reactive<{ dateRange: string[] | null; reportType?: string; keyword?: string }>(
  { dateRange: null, reportType: undefined, keyword: '' }
)

const fetchList = async () => {
  const params: any = {
    page: pagination.current,
    pageSize: pagination.pageSize
  }
  if (query.dateRange && query.dateRange.length === 2) {
    params.startDate = query.dateRange[0]
    params.endDate = query.dateRange[1]
  }
  if (query.reportType) params.reportType = query.reportType
  if (query.keyword) params.keyword = query.keyword
  await store.fetchEvaluationList(params)
}

const onSearch = () => {
  pagination.current = 1
  fetchList()
}

const onReset = () => {
  query.dateRange = null
  query.reportType = undefined
  query.keyword = ''
  pagination.current = 1
  fetchList()
}

const onPageChange = (page: number) => {
  pagination.current = page
  fetchList()
}

const detailVisible = ref(false)
const detail = computed(() => store.evaluationDetail)
const detailItems = computed(() => {
  const d: any = detail.value || {}
  return [
    { label: '报告ID', value: d.id ?? '-' },
    { label: '报告名称', value: d.title ?? '-' },
    { label: '报告类型', value: d.reportType ?? '-' },
    { label: '状态', value: d.status ?? '-' },
    { label: '创建时间', value: d.createdAt ?? '-' },
    { label: '产品', value: d.productName ?? '-' },
    { label: '供应商', value: d.supplier ?? '-' },
    { label: '结论摘要', value: d.summary ?? '-' }
  ]
})

const viewDetail = async (id: number) => {
  await store.fetchEvaluationDetail(id)
  detailVisible.value = true
}

onMounted(fetchList)
</script>

<style scoped>
.query-bar {
  margin-bottom: 12px;
}
</style>