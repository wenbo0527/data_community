<template>
  <div class="model-evaluation-page">
    <div class="page-header">
      <div class="page-title">
        <h2>模型评估</h2>
        <span class="page-subtitle">查看和管理所有模型评估任务</span>
      </div>
      <div class="page-actions">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <icon-plus />
            </template>
            新建评估
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="filter-section">
      <a-card>
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="模型名称">
            <a-input
              v-model="filterForm.modelName"
              placeholder="请输入模型名称"
              allow-clear
              @change="handleFilterChange"
            />
          </a-form-item>

          <a-form-item label="评估类型">
            <a-select
              v-model="filterForm.evaluationType"
              placeholder="请选择评估类型"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value=" offline">离线评估</a-option>
              <a-option value="online">在线评估</a-option>
              <a-option value="abtest">A/B测试</a-option>
            </a-select>
          </a-form-item>

          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              allow-clear
              @change="handleFilterChange"
            >
              <a-option value="pending">待执行</a-option>
              <a-option value="running">运行中</a-option>
              <a-option value="completed">已完成</a-option>
              <a-option value="failed">失败</a-option>
            </a-select>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <div class="table-section">
      <a-card>
        <template #title>
          <div class="table-header">
            <span>评估记录</span>
            <a-space>
              <a-button size="small" @click="handleRefresh">
                <template #icon>
                  <icon-refresh />
                </template>
                刷新
              </a-button>
            </a-space>
          </div>
        </template>

        <a-table
          :data="evaluationList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @page-change="handlePageChange"
        >
          <template #modelName="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.modelName }}</a-link>
          </template>

          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>

          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>

          <template #createTime="{ record }">
            {{ formatDate(record.createTime) }}
          </template>

          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-button
                v-if="record.status === 'completed'"
                type="text"
                size="small"
                @click="handleViewReport(record)"
              >
                报告
              </a-button>
              <a-button
                v-if="['pending', 'failed'].includes(record.status)"
                type="text"
                size="small"
                status="danger"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { evaluationAPI } from '@/api/offlineModel'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const loading = ref(false)

const filterForm = reactive({
  modelName: '',
  evaluationType: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

const columns = [
  {
    title: '模型名称',
    dataIndex: 'modelName',
    slotName: 'modelName',
    width: 200
  },
  {
    title: '评估类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '评估指标',
    dataIndex: 'metrics',
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

const evaluationList = ref<any[]>([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await evaluationAPI.getEvaluations({ page: pagination.current, pageSize: pagination.pageSize })
    const list = (res.data && res.data.data) ? res.data.data : []
    evaluationList.value = list
    pagination.total = (res.data && res.data.total) ? res.data.total : list.length
  } catch (error) {
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filterForm.modelName = ''
  filterForm.evaluationType = ''
  filterForm.status = ''
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleRefresh = () => {
  loadData()
  Message.success('已刷新')
}

const handleCreate = () => {
  router.push('/offline-model/model-evaluation/create')
}

const handleViewDetail = (record: any) => {
  router.push(`/offline-model/model-evaluation/detail/${record.id}`)
}

const handleViewReport = (record: any) => {
  router.push(`/offline-model/model-evaluation/report/${record.id}`)
}

const handleDelete = (record: any) => {
  Message.info('删除功能开发中')
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = { offline: 'blue', online: 'green', abtest: 'purple' }
  return colors[type] || 'gray'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { offline: '离线评估', online: '在线评估', abtest: 'A/B测试' }
  return labels[type] || type
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { pending: 'gray', running: 'blue', completed: 'green', failed: 'red' }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { pending: '待执行', running: '运行中', completed: '已完成', failed: '失败' }
  return labels[status] || status
}

const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleString('zh-CN') : '-'
}
</script>

<style scoped lang="less">
.model-evaluation-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }

      .page-subtitle {
        color: #666;
        font-size: 14px;
      }
    }
  }

  .filter-section {
    margin-bottom: 24px;
  }

  .table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
