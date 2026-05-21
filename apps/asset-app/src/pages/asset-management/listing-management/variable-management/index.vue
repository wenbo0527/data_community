<template>
  <div class="variable-management-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>数据资产管理</a-breadcrumb-item>
        <a-breadcrumb-item>数据要素管理</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">数据要素管理</h1>
        <div class="header-actions">
          <a-button type="primary" @click="handleCreate">
            <template #icon><icon-plus /></template>
            定义要素
          </a-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- 搜索筛选 -->
      <a-card class="filter-card">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="关键词">
            <a-input
              v-model="filterForm.keyword"
              placeholder="搜索要素名称、编码"
              allow-clear
              @change="handleSearch"
            />
          </a-form-item>
          <a-form-item label="要素类型">
            <a-select
              v-model="filterForm.type"
              placeholder="全部类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="metric">指标</a-option>
              <a-option value="tag">标签</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="全部状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="active">已发布</a-option>
              <a-option value="draft">草稿</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 要素列表 -->
      <a-card class="table-card">
        <a-table
          :data="elementList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          <template #type="{ record }">
            <a-tag :color="record.type === 'metric' ? 'arcoblue' : 'purple'">
              {{ record.type === 'metric' ? '指标' : '标签' }}
            </a-tag>
          </template>
          <template #status="{ record }">
            <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
              {{ record.status === 'active' ? '已发布' : '草稿' }}
            </a-tag>
          </template>
          <template #sourceAsset="{ record }">
            <a-tag color="orangered">{{ record.sourceAsset }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="text" size="small" v-if="record.status !== 'active'" @click="handlePublish(record)">发布</a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)

const filterForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

// Mock Data
const mockElements = [
  { id: 1, name: '申请通过率', code: 'metric_apply_pass_rate', type: 'metric', sourceAsset: 'dwd_loan_apply_d', definition: '通过数/总申请数', status: 'active', creator: '张三', createdAt: '2023-10-27' },
  { id: 2, name: '高风险用户标识', code: 'tag_high_risk_user', type: 'tag', sourceAsset: 'dws_user_credit_summary', definition: '逾期次数 > 3', status: 'active', creator: '李四', createdAt: '2023-10-26' },
  { id: 3, name: '近30天平均消费', code: 'metric_avg_consume_30d', type: 'metric', sourceAsset: 'dwd_transaction_log', definition: 'sum(amount)/30', status: 'draft', creator: '王五', createdAt: '2023-10-28' },
]

const elementList = ref([...mockElements])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const columns = [
  { title: '要素名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '要素编码', dataIndex: 'code', width: 180 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '来源资产', dataIndex: 'sourceAsset', slotName: 'sourceAsset', width: 200 },
  { title: '业务口径', dataIndex: 'definition', width: 250, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '操作', slotName: 'actions', width: 180, fixed: 'right' }
]

const handleSearch = () => {
  loading.value = true
  // Mock Search
  setTimeout(() => {
    elementList.value = mockElements.filter(item => {
      const matchKeyword = !filterForm.keyword || item.name.includes(filterForm.keyword)
      const matchType = !filterForm.type || item.type === filterForm.type
      const matchStatus = !filterForm.status || item.status === filterForm.status
      return matchKeyword && matchType && matchStatus
    })
    loading.value = false
  }, 500)
}

const handleReset = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.status = ''
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleViewDetail = (record) => {
  Message.info(`查看要素详情: ${record.name}`)
}

const handleEdit = (record) => {
  Message.info(`编辑要素: ${record.name}`)
}

const handlePublish = (record) => {
  Message.success(`要素 ${record.name} 发布成功`)
  record.status = 'active'
}

const handleCreate = () => {
  Message.info('打开要素定义页面')
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.variable-management-page {
  padding: 20px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.filter-card, .table-card {
  border-radius: 4px;
}

.filter-card {
  margin-bottom: 16px;
}
</style>
