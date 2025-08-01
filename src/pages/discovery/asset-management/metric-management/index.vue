<template>
  <div class="metric-management">
    <div class="page-header">
      <h2>指标管理</h2>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <icon-plus />
        </template>
        新建指标
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索指标名称、描述"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedCategory"
            placeholder="指标分类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="business">业务指标</a-option>
            <a-option value="technical">技术指标</a-option>
            <a-option value="financial">财务指标</a-option>
            <a-option value="risk">风险指标</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedStatus"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="active">启用</a-option>
            <a-option value="inactive">停用</a-option>
            <a-option value="draft">草稿</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data="mockData"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #status="{ record }">
        <a-tag
          :color="getStatusColor(record.status)"
        >
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      
      <template #category="{ record }">
        <a-tag
          :color="getCategoryColor(record.category)"
        >
          {{ getCategoryText(record.category) }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="editMetric(record)">
            编辑
          </a-button>
          <a-button type="text" size="small" @click="viewVersionHistory(record)">
            版本历史
          </a-button>
          <a-button type="text" size="small" @click="copyMetric(record)">
            复制
          </a-button>
          <a-button type="text" size="small" status="danger" @click="deleteMetric(record)">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 创建/编辑指标模态框 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingMetric?.isViewMode ? '指标详情' : (editingMetric ? '编辑指标' : '新建指标')"
      width="1000px"
      @ok="handleSubmit"
      @cancel="resetForm"
      :ok-text="editingMetric?.isViewMode ? '关闭' : '确定'"
      :cancel-text="editingMetric?.isViewMode ? '' : '取消'"
      :hide-cancel="editingMetric?.isViewMode"
    >
      <a-form
          ref="formRef"
          :model="formData"
          :rules="editingMetric?.isViewMode ? {} : formRules"
          layout="vertical"
          :disabled="editingMetric?.isViewMode"
        >
        <!-- 基本信息 -->
        <a-divider orientation="left">基本信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="指标名称" field="name">
              <a-input v-model="formData.name" placeholder="请输入指标名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="指标编码" field="code">
              <a-input v-model="formData.code" placeholder="请输入指标编码" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="指标分类" field="category">
              <a-select v-model="formData.category" placeholder="请选择指标分类">
                <a-option value="用户指标">用户指标</a-option>
                <a-option value="业务域">业务域</a-option>
                <a-option value="技术指标">技术指标</a-option>
                <a-option value="财务指标">财务指标</a-option>
                <a-option value="风险指标">风险指标</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="业务域" field="businessDomain">
              <a-select v-model="formData.businessDomain" placeholder="请选择业务域">
                <a-option value="留存域">留存域</a-option>
                <a-option value="转化域">转化域</a-option>
                <a-option value="业务规模">业务规模</a-option>
                <a-option value="风控域">风控域</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="统计周期" field="statisticalPeriod">
              <a-select v-model="formData.statisticalPeriod" placeholder="请选择统计周期">
                <a-option value="实时">实时</a-option>
                <a-option value="日更新">日更新</a-option>
                <a-option value="离线T+1">离线T+1</a-option>
                <a-option value="离线T+2">离线T+2</a-option>
                <a-option value="每周">每周</a-option>
                <a-option value="每月">每月</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="负责人" field="owner">
              <a-input v-model="formData.owner" placeholder="请输入负责人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="版本号" field="version">
              <a-input v-model="formData.version" placeholder="请输入版本号（如：v1.0.0）" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="版本说明">
              <a-textarea v-model="formData.versionDescription" placeholder="请输入本次版本的更新说明" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 业务定义 -->
        <a-divider orientation="left">业务定义</a-divider>
        <a-form-item label="业务定义" field="businessDefinition">
          <a-textarea v-model="formData.businessDefinition" placeholder="请输入业务定义" :rows="3" />
        </a-form-item>
        <a-form-item label="使用场景">
          <a-textarea v-model="formData.useCase" placeholder="请输入使用场景" :rows="3" />
        </a-form-item>
        
        <!-- 技术逻辑 -->
        <a-divider orientation="left">技术逻辑</a-divider>
        <a-form-item label="来源表" field="sourceTable">
          <a-input v-model="formData.sourceTable" placeholder="请输入来源表" />
        </a-form-item>
        <a-form-item label="加工逻辑">
          <a-textarea v-model="formData.processingLogic" placeholder="请输入加工逻辑SQL" :rows="5" />
        </a-form-item>
        <a-form-item label="字段说明">
          <a-textarea v-model="formData.fieldDescription" placeholder="请输入字段说明" :rows="3" />
        </a-form-item>
        
        <!-- 报表位置 -->
        <a-divider orientation="left">报表位置</a-divider>
        <a-form-item label="报表列表">
          <div class="report-list">
            <div v-for="(report, index) in formData.reports" :key="index" class="report-item">
              <a-row :gutter="8">
                <a-col :span="10">
                  <a-input v-model="report.name" placeholder="请输入报表名称" />
                </a-col>
                <a-col :span="12">
                  <a-input v-model="report.url" placeholder="请输入报表URL" />
                </a-col>
                <a-col :span="2">
                  <a-button 
                    type="text" 
                    status="danger" 
                    @click="removeReport(index)"
                    :disabled="formData.reports.length <= 1"
                  >
                    删除
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addReport" class="add-report-btn">
              <template #icon>
                <icon-plus />
              </template>
              添加报表
            </a-button>
          </div>
        </a-form-item>
        
        <!-- 结果表信息 -->
        <a-divider orientation="left">结果表信息</a-divider>
        <a-form-item label="存储位置">
          <a-input v-model="formData.storageLocation" placeholder="请输入存储位置" />
        </a-form-item>
        <a-form-item label="查询代码">
          <a-textarea v-model="formData.queryCode" placeholder="请输入查询代码" :rows="5" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 版本历史模态框 -->
    <a-modal
      v-model:visible="showVersionHistoryModal"
      title="版本历史"
      width="800px"
      :footer="false"
    >
      <a-table
        :columns="versionHistoryColumns"
        :data="versionHistoryData"
        :pagination="false"
      >
        <template #versionStatus="{ record }">
          <a-tag
            :color="record.versionStatus === 'active' ? 'green' : 'gray'"
          >
            {{ record.versionStatus === 'active' ? '当前版本' : '历史版本' }}
          </a-tag>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="viewVersionDetail(record)">
              查看详情
            </a-button>
            <a-button 
              v-if="record.versionStatus !== 'active'" 
              type="text" 
              size="small" 
              @click="activateVersion(record)"
            >
              激活版本
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const showVersionHistoryModal = ref(false)
// 指标接口定义
interface MetricItem {
  id?: number
  name: string
  code: string
  category: string
  businessDomain: string
  businessDefinition: string
  owner: string
  version: string
  versionStatus: string
  versionDescription: string
  useCase: string
  statisticalPeriod: string
  sourceTable: string
  processingLogic: string
  fieldDescription: string
  reports: Array<{ name: string; url: string }>
  storageLocation: string
  queryCode: string
  status?: string
  updateTime?: string
  isViewMode?: boolean
}

const editingMetric = ref<MetricItem | null>(null)
const currentMetricForHistory = ref(null)
const formRef = ref()
// 版本历史接口定义
interface VersionHistoryItem {
  id: number
  version: string
  versionStatus: string
  versionDescription: string
  createTime: string
  creator: string
}

const versionHistoryData = ref<VersionHistoryItem[]>([])

// 表格列配置
const columns = [
  {
    title: '指标名称',
    dataIndex: 'name',
    width: 150,
    render: ({ record }: { record: any }) => {
      return h('a-button', {
        type: 'text',
        onClick: () => viewMetricDetail(record)
      }, record.name)
    }
  },
  {
    title: '指标编码',
    dataIndex: 'code',
    width: 120
  },
  {
    title: '分类',
    dataIndex: 'category',
    slotName: 'category',
    width: 100
  },
  {
    title: '业务域',
    dataIndex: 'businessDomain',
    width: 100
  },
  {
    title: '业务定义',
    dataIndex: 'businessDefinition',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '统计周期',
    dataIndex: 'statisticalPeriod',
    width: 100
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    width: 100
  },
  {
    title: '版本号',
    dataIndex: 'version',
    width: 100
  },
  {
    title: '版本状态',
    dataIndex: 'versionStatus',
    width: 100,
    render: ({ record }: { record: any }) => {
      const statusMap: Record<string, { text: string; color: string }> = {
        'active': { text: '当前版本', color: 'green' },
        'history': { text: '历史版本', color: 'gray' },
        'draft': { text: '草稿', color: 'orange' }
      }
      const status = statusMap[record.versionStatus] || { text: record.versionStatus, color: 'blue' }
      return h('a-tag', { color: status.color }, status.text)
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 80
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 150
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 版本历史表格列配置
const versionHistoryColumns = [
  {
    title: '版本号',
    dataIndex: 'version',
    width: 120
  },
  {
    title: '版本状态',
    dataIndex: 'versionStatus',
    slotName: 'versionStatus',
    width: 100
  },
  {
    title: '版本说明',
    dataIndex: 'versionDescription',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 模拟数据
const mockData = ref([
  {
    id: 1,
    name: 'DAU',
    code: 'USER_001',
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
    processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau\nFROM dwd.user_login_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
    reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '核心指标报表', url: '/reports/core-metrics' }],
    storageLocation: 'adm.ads_user_core_metrics',
    queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}',
    status: 'active',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '当日风控授信通过笔数',
    code: 'A00043',
    category: '业务域',
    businessDomain: '业务规模',
    businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
    owner: '王志雄',
    version: 'v1.0.0',
    versionStatus: 'active',
    versionDescription: '初始版本',
    useCase: '',
    statisticalPeriod: '离线T+2',
    sourceTable: 'a_frms_deparment_sx_his_full',
    processingLogic: 'SELECT COUNT(flow_id) FROM a_frms_deparment_sx_his_full WHERE result=\'PA\'',
    fieldDescription: '',
    reports: [{ name: '发展日测报告', url: '/reports/daily-development' }, { name: '公司级报表', url: '/reports/company-level' }, { name: '市场营销报表', url: '/reports/marketing' }],
    storageLocation: 'adm.ads_report_index_commonality_info_full',
    queryCode: 'SELECT data_dt=20250401\nFROM adm.ads_report_numbersinfo_free_temporal_code\nWHERE data_dt=20250401\nAND indicator_name=\'风控授信通过量\'\nAND indicator_id=\'A00043\'',
    status: 'active',
    updateTime: '2024-01-15 11:45:00'
  },
  {
    id: 3,
    name: '用户注册转化率',
    code: 'USER_002',
    category: '用户指标',
    businessDomain: '转化域',
    businessDefinition: '访问用户转化为注册用户的比率',
    owner: '李四',
    version: 'v2.1.0',
    versionStatus: 'active',
    versionDescription: '新增渠道维度分析',
    useCase: '衡量产品获客效果，优化注册流程',
    statisticalPeriod: '日更新',
    sourceTable: 'dwd.user_register_detail',
    processingLogic: 'SELECT dt, COUNT(DISTINCT register_user_id) / COUNT(DISTINCT visit_user_id) as conversion_rate\nFROM dwd.user_register_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID',
    reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '转化分析报表', url: '/reports/conversion-analysis' }],
    storageLocation: 'adm.ads_user_conversion_metrics',
    queryCode: 'SELECT conversion_rate FROM adm.ads_user_conversion_metrics WHERE dt = ${date}',
    status: 'active',
    updateTime: '2024-01-14 16:20:00'
  }
])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4,
  showTotal: true,
  showPageSize: true
})

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  category: '',
  businessDomain: '',
  owner: '',
  version: '',
  versionDescription: '',
  versionStatus: 'draft',
  businessDefinition: '',
  useCase: '',
  statisticalPeriod: '',
  sourceTable: '',
  processingLogic: '',
  fieldDescription: '',
  reports: [{ name: '', url: '' }],
  storageLocation: '',
  queryCode: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入指标名称' }
  ],
  code: [
    { required: true, message: '请输入指标编码' }
  ],
  category: [
    { required: true, message: '请选择指标分类' }
  ],
  businessDomain: [
    { required: true, message: '请选择业务域' }
  ],
  owner: [
    { required: true, message: '请输入负责人' }
  ],
  version: [
    { required: true, message: '请输入版本号' }
  ],
  businessDefinition: [
    { required: true, message: '请输入业务定义' }
  ],
  statisticalPeriod: [
    { required: true, message: '请选择统计周期' }
  ],
  sourceTable: [
    { required: true, message: '请输入来源表' }
  ]
}

// 方法
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    draft: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '启用',
    inactive: '停用',
    draft: '草稿'
  }
  return textMap[status] || '未知'
}

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    '用户指标': 'blue',
    '业务域': 'green',
    '技术指标': 'orange',
    '财务指标': 'purple',
    '风险指标': 'red'
  }
  return colorMap[category] || 'gray'
}

const getCategoryText = (category: string) => {
  return category
}

// 报表操作方法
const addReport = () => {
  formData.reports.push({ name: '', url: '' })
}

const removeReport = (index: number) => {
  if (formData.reports.length > 1) {
    formData.reports.splice(index, 1)
  }
}

const viewMetricDetail = (record: any) => {
  // 设置为查看模式，填充表单数据但设为只读
  editingMetric.value = { ...record, isViewMode: true }
  Object.assign(formData, record)
  showCreateModal.value = true
}

const editMetric = (record: any) => {
  editingMetric.value = record
  Object.assign(formData, record)
  showCreateModal.value = true
}

// 版本历史相关方法
const viewVersionHistory = (record: any) => {
  currentMetricForHistory.value = record
  // 模拟版本历史数据
  versionHistoryData.value = [
    {
      id: 1,
      version: 'v2.1.0',
      versionStatus: 'active',
      versionDescription: '新增渠道维度分析',
      createTime: '2024-01-15 14:30:00',
      creator: '李四'
    },
    {
      id: 2,
      version: 'v2.0.0',
      versionStatus: 'history',
      versionDescription: '重构计算逻辑，提升性能',
      createTime: '2024-01-10 09:15:00',
      creator: '李四'
    },
    {
      id: 3,
      version: 'v1.0.0',
      versionStatus: 'history',
      versionDescription: '初始版本',
      createTime: '2024-01-01 10:00:00',
      creator: '张三'
    }
  ]
  showVersionHistoryModal.value = true
}

const viewVersionDetail = (versionRecord: any) => {
  console.log('查看版本详情:', versionRecord)
  Message.info('查看版本详情功能开发中')
}

const activateVersion = (versionRecord: any) => {
  console.log('激活版本:', versionRecord)
  // 更新版本状态
  versionHistoryData.value.forEach(item => {
    item.versionStatus = item.id === versionRecord.id ? 'active' : 'history'
  })
  Message.success(`版本 ${versionRecord.version} 已激活`)
}

const copyMetric = (record: any) => {
  const newMetric = { ...record }
  newMetric.name = `${record.name}_副本`
  newMetric.code = `${record.code}_COPY`
  Object.assign(formData, newMetric)
  editingMetric.value = null
  showCreateModal.value = true
}

const deleteMetric = (record: any) => {
  console.log('删除指标:', record)
  Message.success('删除成功')
}

const handleSubmit = async () => {
  // 如果是查看模式，直接关闭弹窗
  if (editingMetric.value?.isViewMode) {
    showCreateModal.value = false
    resetForm()
    return
  }
  
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      // 如果是编辑模式，自动设置版本状态为当前版本
      if (editingMetric.value) {
        formData.versionStatus = 'active'
        Message.success(`指标编辑成功，版本 ${formData.version} 已激活`)
      } else {
        formData.versionStatus = 'active'
        Message.success(`指标创建成功，版本 ${formData.version} 已激活`)
      }
      console.log('提交表单:', formData)
      showCreateModal.value = false
      resetForm()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  editingMetric.value = null
  Object.assign(formData, {
    name: '',
    code: '',
    category: '',
    businessDomain: '',
    owner: '',
    version: '',
    versionDescription: '',
    versionStatus: 'draft',
    businessDefinition: '',
    useCase: '',
    statisticalPeriod: '',
    sourceTable: '',
    processingLogic: '',
    fieldDescription: '',
    reports: [{ name: '', url: '' }],
    storageLocation: '',
    queryCode: ''
  })
  formRef.value?.resetFields()
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.metric-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.report-list {
  width: 100%;
}

.report-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.add-report-btn {
  width: 100%;
  margin-top: 8px;
  border-style: dashed;
}
</style>