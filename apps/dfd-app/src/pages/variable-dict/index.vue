<template>
  <div class="variable-management-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>变量管理</a-breadcrumb-item>
        <a-breadcrumb-item>变量列表</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <h1 class="page-title">变量上下架管理</h1>
        <div class="header-actions">
          <a-dropdown trigger="click" @select="handleCreateMenuSelect">
            <a-button type="primary">
              <template #icon><icon-plus /></template>
              新建变量
            </a-button>
            <template #content>
              <a-doption value="create">单独注册</a-doption>
              <a-doption value="incremental">导入更新</a-doption>
            </template>
          </a-dropdown>
          <a-button @click="handleExport">
            <template #icon><icon-download /></template>
            导出变量清单
          </a-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- 统计概览 -->
      <a-row :gutter="16" class="stats-row">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">变量总数</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.active }}</div>
              <div class="stat-label">已上架</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.offline }}</div>
              <div class="stat-label">已下架</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索筛选 -->
      <a-card class="filter-card">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="关键词">
            <a-input v-model="filterForm.keyword" placeholder="搜索变量名称、编码或描述" allow-clear @change="handleSearch" />
          </a-form-item>
          <a-form-item label="变量类型">
            <a-select v-model="filterForm.type" placeholder="全部类型" allow-clear @change="handleSearch">
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="datetime">时间型</a-option>
              <a-option value="boolean">布尔型</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model="filterForm.status" placeholder="全部状态" allow-clear @change="handleSearch">
              <a-option value="draft">草稿</a-option>
              <a-option value="pending">待审核</a-option>
              <a-option value="active">已上架</a-option>
              <a-option value="inactive">已下架</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 变量列表 -->
      <a-card class="table-card">
        <a-table
          :data="displayList"
          :columns="columns"
          :loading="loading"
          :pagination="paginationConfig"
          row-key="id"
          @page-change="handlePageChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">{{ getTypeLabel(record.type) }}</a-tag>
          </template>
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">详情</a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="text" size="small" :status="record.status === 'active' ? 'warning' : 'normal'" @click="handleToggleStatus(record)">
                {{ record.status === 'active' ? '下架' : '上架' }}
              </a-button>
            </a-space>
          </template>
          <template #empty>
            <div class="table-empty">
              <icon-empty :size="40" class="empty-icon" />
              <span>暂无变量数据</span>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 导入更新弹窗 -->
    <a-modal v-model:visible="importModalVisible" title="导入更新变量" width="600px" @ok="confirmImport" @cancel="importModalVisible = false">
      <a-upload :auto-upload="false" :limit="1" :accept="'.xlsx,.xls'" @change="handleFileChange">
        <a-button>选择Excel文件</a-button>
      </a-upload>
      <div style="margin-top: 12px">已解析记录数：{{ importFileCount }}</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  total: 156,
  active: 98,
  pending: 23,
  offline: 35
})

// 筛选表单
const filterForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

// 变量列表（Mock）
const allVariables = ref([
  { id: 1, name: '客户年龄段', code: 'var_age_group', type: 'categorical', status: 'active', dataSourceName: 'CRM系统', creator: '张三', createdAt: '2024-03-15' },
  { id: 2, name: '近30天交易金额', code: 'var_trx_amt_30d', type: 'numerical', status: 'active', dataSourceName: '交易系统', creator: '李四', createdAt: '2024-03-18' },
  { id: 3, name: '客户等级', code: 'var_cust_level', type: 'categorical', status: 'pending', dataSourceName: 'CRM系统', creator: '王五', createdAt: '2024-04-01' },
  { id: 4, name: '最后登录时间', code: 'var_last_login_time', type: 'datetime', status: 'active', dataSourceName: '运营系统', creator: '赵六', createdAt: '2024-03-20' },
  { id: 5, name: '是否VIP', code: 'var_is_vip', type: 'boolean', status: 'inactive', dataSourceName: '会员系统', creator: '张三', createdAt: '2024-02-28' },
  { id: 6, name: '手机号码', code: 'var_phone', type: 'text', status: 'active', dataSourceName: 'CRM系统', creator: '李四', createdAt: '2024-03-10' },
  { id: 7, name: '近7天登录次数', code: 'var_login_cnt_7d', type: 'numerical', status: 'pending', dataSourceName: '运营系统', creator: '王五', createdAt: '2024-04-05' },
  { id: 8, name: '用户画像标签', code: 'var_user_profile', type: 'text', status: 'active', dataSourceName: '画像系统', creator: '赵六', createdAt: '2024-03-25' },
  { id: 9, name: '风险评分', code: 'var_risk_score', type: 'numerical', status: 'active', dataSourceName: '风控系统', creator: '张三', createdAt: '2024-03-30' },
  { id: 10, name: '信用等级', code: 'var_credit_level', type: 'categorical', status: 'expired', dataSourceName: '征信系统', creator: '李四', createdAt: '2024-01-15' }
])

const displayList = ref([...allVariables.value])
const loading = ref(false)

// 分页
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: computed(() => displayList.value.length),
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '变量编码', dataIndex: 'code', width: 180 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '数据源', dataIndex: 'dataSourceName', width: 150 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

// 类型映射
const typeMap: Record<string, { label: string; color: string }> = {
  numerical: { label: '数值型', color: 'blue' },
  categorical: { label: '分类型', color: 'green' },
  text: { label: '文本型', color: 'orange' },
  datetime: { label: '时间型', color: 'purple' },
  boolean: { label: '布尔型', color: 'cyan' }
}

// 状态映射
const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已上架', color: 'green' },
  inactive: { label: '已下架', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

const getTypeLabel = (type: string) => typeMap[type]?.label || type
const getTypeColor = (type: string) => typeMap[type]?.color || 'gray'
const getStatusLabel = (status: string) => statusMap[status]?.label || status
const getStatusColor = (status: string) => statusMap[status]?.color || 'gray'

// 搜索
const handleSearch = () => {
  displayList.value = allVariables.value.filter(v => {
    const keywordMatch = !filterForm.keyword || v.name.includes(filterForm.keyword) || v.code.includes(filterForm.keyword)
    const typeMatch = !filterForm.type || v.type === filterForm.type
    const statusMatch = !filterForm.status || v.status === filterForm.status
    return keywordMatch && typeMatch && statusMatch
  })
  paginationConfig.current = 1
  paginationConfig.total = displayList.value.length
}

// 重置
const handleReset = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.status = ''
  handleSearch()
}

// 分页
const handlePageChange = (page: number) => {
  paginationConfig.current = page
}

// 详情
const handleViewDetail = (record: any) => {
  Message.info(`查看变量详情：${record.name}（Demo模式）`)
}

// 编辑
const handleEdit = (record: any) => {
  Message.info(`编辑变量：${record.name}（Demo模式）`)
}

// 上下架
const handleToggleStatus = async (record: any) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  Message.success(`变量「${record.name}」已${newStatus === 'active' ? '上架' : '下架'}`)
  handleSearch()
}

// 导出
const handleExport = () => {
  Message.info('导出功能开发中...')
}

// 新建
const handleCreateMenuSelect = (val: string) => {
  if (val === 'incremental') {
    importModalVisible.value = true
  } else {
    Message.info('新建变量（Demo模式）')
  }
}

// 导入
const importModalVisible = ref(false)
const importFileCount = ref(0)
const handleFileChange = (info: any) => {
  importFileCount.value = info.fileList?.length || 0
}
const confirmImport = () => {
  Message.success(`成功导入 ${importFileCount.value} 条记录`)
  importModalVisible.value = false
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.variable-management-page { padding: 16px; background-color: #f5f5f5; min-height: 100vh; }
.page-header { margin-bottom: 16px; }
.header-content { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: #1d2129; }
.header-actions { display: flex; gap: 8px; }
.page-content { max-width: 1400px; margin: 0 auto; }
.stats-row { margin-bottom: 16px; }
.stat-card { height: 100px; display: flex; align-items: center; justify-content: center; text-align: center; }
.stat-content { display: flex; flex-direction: column; align-items: center; }
.stat-number { font-size: 32px; font-weight: 600; color: #1d2129; margin-bottom: 4px; }
.stat-label { font-size: 14px; color: #86909c; }
.filter-card { margin-bottom: 16px; }
.table-card { margin-bottom: 16px; }
.table-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: var(--color-text-3); }
.table-empty .empty-icon { color: var(--color-fill-3); }
</style>
