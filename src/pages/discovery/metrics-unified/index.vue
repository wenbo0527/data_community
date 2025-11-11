<template>
  <div class="metrics-unified">
    <div class="page-header">
      <h2>指标统一管理</h2>
      <a-space>
        <a-segmented v-model="activeCategory" :options="categoryOptions" @change="handleCategoryChange" />
        <a-dropdown>
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建指标
            <template #suffix><IconDown /></template>
          </a-button>
          <template #content>
            <a-doption @click="handleCreateMetric('batch-business')">
              <template #icon><icon-upload /></template>
              批量上传业务核心指标
            </a-doption>
            <a-doption @click="handleCreateMetric('batch-regulatory')">
              <template #icon><icon-upload /></template>
              批量上传监管指标
            </a-doption>
            <a-doption @click="handleCreateMetric('create-business')">
              <template #icon><icon-plus /></template>
              新建业务核心指标
            </a-doption>
            <a-doption @click="handleCreateMetric('create-regulatory')">
              <template #icon><icon-plus /></template>
              新建监管指标
            </a-doption>
          </template>
        </a-dropdown>
      </a-space>
    </div>

    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model="searchKeyword" placeholder="搜索指标名称" allow-clear @press-enter="handleSearch">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4" v-if="activeCategory === 'business'">
          <a-select v-model="selectedDomain" placeholder="选择业务域" allow-clear @change="handleSearch">
            <a-option value="">全部业务域</a-option>
            <a-option value="获客域">获客域</a-option>
            <a-option value="转化域">转化域</a-option>
            <a-option value="留存域">留存域</a-option>
            <a-option value="变现域">变现域</a-option>
          </a-select>
        </a-col>
        <a-col :span="4" v-if="activeCategory === 'regulatory'">
          <a-select v-model="selectedRegulatoryCategory" placeholder="选择监管大类" allow-clear @change="handleSearch">
            <a-option :value="RegulatoryCategory.CBIRC_BANKING">银保监会-银监报表</a-option>
            <a-option :value="RegulatoryCategory.PBOC_CENTRALIZED">人行-大集中报表</a-option>
            <a-option :value="RegulatoryCategory.PBOC_FINANCIAL_BASE">人行-金融基础数据</a-option>
            <a-option :value="RegulatoryCategory.PBOC_INTEREST_RATE">人行-利率报备检测分析</a-option>
          </a-select>
        </a-col>
        <a-col :span="3">
          <a-select v-model="selectedStatus" placeholder="状态" allow-clear @change="handleSearch">
            <a-option value="active">生效</a-option>
            <a-option value="inactive">失效</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </template>
      <template #type="{ record }">
        <a-tag :color="record.type === MetricType.BUSINESS_CORE ? 'blue' : 'orange'">
          {{ METRIC_TYPE_LABELS[record.type] }}
        </a-tag>
      </template>
      <template #category="{ record }">
        <a-tag :color="getCategoryColor(record.category)">{{ record.category }}</a-tag>
        <a-tag v-if="record.type === MetricType.BUSINESS_CORE && record.businessDomain" color="purple" style="margin-left: 8px">
          {{ record.businessDomain }}
        </a-tag>
        <a-tag v-if="record.type === MetricType.REGULATORY && record.regulatoryCategory" color="cyan" style="margin-left: 8px">
          {{ REGULATORY_CATEGORY_LABELS[record.regulatoryCategory] }}
        </a-tag>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewMetricDetail(record)">查看</a-button>
          <a-button type="text" size="small" @click="editMetric(record)">编辑</a-button>
          <a-button type="text" size="small" @click="viewVersionHistory(record)">版本历史</a-button>
          <a-button type="text" size="small" @click="copyMetric(record)">复制</a-button>
          <a-button type="text" size="small" status="danger" @click="deleteMetric(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>

    <a-modal v-model:visible="showVersionHistoryModal" title="版本历史" width="840px" :footer="false">
      <a-table :columns="versionHistoryColumns" :data="versionHistoryData" :pagination="false">
        <template #status="{ record }">
          <a-tag :color="record.status === 'active' ? 'green' : 'gray'">
            {{ record.status === 'active' ? '当前版本' : '历史版本' }}
          </a-tag>
        </template>
        <template #effectivePeriod="{ record }">
          <span>{{ record.effectiveFrom }} ~ {{ record.effectiveTo || '未设置' }}</span>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewVersionDetail(record)">查看详情</a-button>
            <a-button v-if="record.status !== 'active'" type="text" size="small" @click="activateVersion(record)">激活版本</a-button>
          </a-space>
        </template>
  </a-table>
    </a-modal>

    <!-- 统一新建指标模态框 -->
    <a-modal v-model:visible="showCreateModal" title="新建指标" width="720px">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="指标域">
          <a-segmented v-model="createForm.type" :options="[
            { label: '业务域', value: MetricType.BUSINESS_CORE },
            { label: '监管域', value: MetricType.REGULATORY }
          ]" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="指标名称" required>
              <a-input v-model="createForm.name" placeholder="请输入指标名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="指标编码" required>
              <a-input v-model="createForm.code" placeholder="请输入指标编码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类" required>
              <a-input v-model="createForm.category" placeholder="请输入指标分类" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-if="createForm.type === MetricType.BUSINESS_CORE" label="业务域">
              <a-select v-model="createForm.businessDomain" placeholder="选择业务域">
                <a-option value="获客域">获客域</a-option>
                <a-option value="转化域">转化域</a-option>
                <a-option value="留存域">留存域</a-option>
                <a-option value="变现域">变现域</a-option>
              </a-select>
            </a-form-item>
            <a-form-item v-else label="监管大类">
              <a-select v-model="createForm.regulatoryCategory" placeholder="选择监管大类">
                <a-option :value="RegulatoryCategory.CBIRC_BANKING">银保监会-银监报表</a-option>
                <a-option :value="RegulatoryCategory.PBOC_CENTRALIZED">人行-大集中报表</a-option>
                <a-option :value="RegulatoryCategory.PBOC_FINANCIAL_BASE">人行-金融基础数据</a-option>
                <a-option :value="RegulatoryCategory.PBOC_INTEREST_RATE">人行-利率报备检测分析</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="技术负责人">
              <a-input v-model="createForm.owner" placeholder="请输入技术负责人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="业务口径">
              <a-input v-model="createForm.businessDefinition" placeholder="请输入业务口径" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="() => (showCreateModal = false)">取消</a-button>
          <a-button type="primary" @click="submitCreateMetric">提交</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
  
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconUpload, IconDownload, IconDown } from '@arco-design/web-vue/es/icon'
import { METRIC_TYPE_LABELS, REGULATORY_CATEGORY_LABELS, MetricType, RegulatoryCategory } from '@/types/metrics'
import type { MetricItem, MetricVersion } from '@/types/metrics'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeCategory = ref<'business' | 'regulatory'>('business')
const categoryOptions = [
  { label: '业务域', value: 'business' },
  { label: '监管域', value: 'regulatory' }
]

// 搜索条件
const searchKeyword = ref('')
const selectedDomain = ref('')
const selectedRegulatoryCategory = ref<RegulatoryCategory | ''>('')
const selectedStatus = ref('')

// 列定义
const columns = ref([
  {
    title: '指标名称',
    dataIndex: 'name',
    width: 180,
    render: ({ record }: { record: MetricItem }) => {
      return h('a-button', { type: 'text', onClick: () => viewMetricDetail(record) }, record.name)
    }
  },
  { title: '业务口径', dataIndex: 'businessDefinition', width: 220, ellipsis: true, tooltip: true },
  { title: '指标类型', dataIndex: 'type', width: 120, slotName: 'type' },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '分类', dataIndex: 'category', width: 150, slotName: 'category' },
  { title: '技术负责人', dataIndex: 'owner', width: 120 },
  { title: '更新时间', dataIndex: 'updateTime', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'actions', width: 240 }
])

// 数据与分页
const tableData = ref<MetricItem[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true })

// 版本历史
const showVersionHistoryModal = ref(false)
const versionHistoryData = ref<MetricVersion[]>([])
const versionHistoryColumns = [
  { title: '版本号', dataIndex: 'version', width: 120 },
  { title: '版本状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '版本说明', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '有效期', dataIndex: 'effectivePeriod', slotName: 'effectivePeriod', width: 220 },
  { title: '创建时间', dataIndex: 'createdAt', width: 150 },
  { title: '创建人', dataIndex: 'creator', width: 100 },
  { title: '操作', slotName: 'actions', width: 150, fixed: 'right' }
]

// 初始化模拟数据（合并业务与监管）
const initMockData = () => {
  tableData.value = [
    {
      id: 1,
      name: 'DAU',
      code: 'USER_001',
      type: MetricType.BUSINESS_CORE,
      category: '用户指标',
      businessDomain: '留存域',
      businessDefinition: '日活跃用户数',
      owner: '张三',
      version: 'v1.2.0',
      versionStatus: 'active',
      versionDescription: '优化计算逻辑，提升数据准确性',
      useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
      statisticalPeriod: '日更新',
      sourceTable: 'dwd.user_login_detail',
      processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau FROM dwd.user_login_detail WHERE dt = ${date} GROUP BY dt',
      updateTime: '2024-01-15 10:30:00',
      status: 'active'
    },
    {
      id: 4,
      name: '资本充足率',
      code: 'REG_001',
      type: MetricType.REGULATORY,
      category: '风险指标',
      regulatoryCategory: RegulatoryCategory.CBIRC_BANKING,
      businessDefinition: '银行资本与风险加权资产的比率',
      owner: '王五',
      version: 'v1.0.0',
      versionStatus: 'active',
      versionDescription: '初始版本',
      statisticalPeriod: '季度',
      sourceTable: 'dwd.regulatory_capital_adequacy',
      processingLogic: '(一级资本 + 二级资本) / 风险加权资产 * 100%',
      updateTime: '2024-01-13 09:15:00',
      status: 'active'
    }
  ]
  pagination.total = tableData.value.length
}

// 事件
const handleCategoryChange = () => {
  handleSearch()
}

const handleCreateMetric = (type: string) => {
  switch (type) {
    case 'batch-business':
      Message.info('批量上传业务核心指标')
      break
    case 'batch-regulatory':
      Message.info('批量上传监管指标')
      break
    case 'create-business':
      openCreateModal('business')
      break
    case 'create-regulatory':
      openCreateModal('regulatory')
      break
  }
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

const resetSearch = () => {
  searchKeyword.value = ''
  selectedDomain.value = ''
  selectedRegulatoryCategory.value = ''
  selectedStatus.value = ''
  handleSearch()
}

const getStatusColor = (status: string) => ({ active: 'green', inactive: 'orange', draft: 'gray' }[status] || 'gray')
const getStatusText = (status: string) => ({ active: '启用', inactive: '停用', draft: '草稿' }[status] || '未知')
const getCategoryColor = (category: string) => ({ '用户指标': 'blue', '业务域': 'green', '技术指标': 'orange', '财务指标': 'purple', '风险指标': 'red' }[category] || 'gray')

// 统一新建指标模态逻辑
const showCreateModal = ref(false)
const createForm = reactive({
  type: MetricType.BUSINESS_CORE as MetricType,
  name: '',
  code: '',
  category: '',
  businessDomain: '',
  regulatoryCategory: undefined as RegulatoryCategory | undefined,
  owner: '',
  businessDefinition: ''
})

const openCreateModal = (domain: 'business' | 'regulatory') => {
  showCreateModal.value = true
  createForm.type = domain === 'business' ? MetricType.BUSINESS_CORE : MetricType.REGULATORY
  createForm.businessDomain = ''
  createForm.regulatoryCategory = undefined
}

const submitCreateMetric = () => {
  const newItem: MetricItem = {
    id: String(Date.now()),
    type: createForm.type,
    name: createForm.name,
    code: createForm.code,
    category: createForm.category,
    businessDomain: createForm.type === MetricType.BUSINESS_CORE ? createForm.businessDomain : undefined,
    regulatoryCategory: createForm.type === MetricType.REGULATORY ? createForm.regulatoryCategory : undefined,
    businessDefinition: createForm.businessDefinition,
    useCase: '',
    statisticalPeriod: '日',
    sourceTable: '',
    processingLogic: '',
    fieldDescription: '',
    reportInfo: '',
    storageLocation: '',
    queryCode: '',
    versions: [
      {
        version: 'v1.0.0',
        status: 'draft',
        description: '初始版本',
        createdAt: new Date().toISOString(),
        creator: '系统',
        effectiveFrom: '',
        effectiveTo: ''
      }
    ],
    owner: createForm.owner
  }
  tableData.value.unshift(newItem)
  showCreateModal.value = false
  Message.success('指标创建成功（模拟）')
}

const viewMetricDetail = (record: MetricItem) => {
  if (record.type === MetricType.REGULATORY) {
    router.push(`/discovery/asset-management/metric-management/${record.id}/view`)
  } else {
    router.push(`/discovery/metrics-map/detail/${record.id}`)
  }
}
const editMetric = (record: MetricItem) => { router.push(`/discovery/asset-management/metric-management/${record.id}/edit`) }
const copyMetric = (record: MetricItem) => { router.push(`/discovery/asset-management/metric-management/${record.id}/copy`) }
const deleteMetric = (record: MetricItem) => { Message.success('删除成功') }

const viewVersionHistory = (record: MetricItem) => {
  versionHistoryData.value = [
    { version: 'v2.1.0', status: 'active', description: '新增渠道维度分析', createdAt: '2024-01-15 14:30:00', creator: '李四', effectiveFrom: '2024-01-15', effectiveTo: '' },
    { version: 'v2.0.0', status: 'history', description: '重构计算逻辑，提升性能', createdAt: '2024-01-10 09:15:00', creator: '李四', effectiveFrom: '2024-01-10', effectiveTo: '2024-01-15' },
    { version: 'v1.0.0', status: 'history', description: '初始版本', createdAt: '2024-01-01 10:00:00', creator: '张三', effectiveFrom: '2024-01-01', effectiveTo: '2024-01-10' }
  ]
  showVersionHistoryModal.value = true
}

const viewVersionDetail = (versionRecord: MetricVersion) => { Message.info('查看版本详情功能开发中') }
const activateVersion = (versionRecord: MetricVersion) => {
  versionHistoryData.value.forEach((item: MetricVersion) => { item.status = item.version === versionRecord.version ? 'active' : 'history' })
  Message.success(`版本 ${versionRecord.version} 已激活`)
}

initMockData()
</script>

<style scoped lang="less">
.metrics-unified {
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .search-section {
    margin-bottom: 16px;
  }
}
</style>