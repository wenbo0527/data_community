<template>
  <div class="metric-management">
    <div class="page-header">
      <h2>指标管理</h2>
      <a-dropdown>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          新建指标
          <template #suffix><icon-down /></template>
        </a-button>
        <template #content>
          <a-doption @click="handleCreateMetric('batch-business')">
            <template #icon><icon-upload /></template>
            批量上传
          </a-doption>
          <a-doption @click="handleCreateMetric('create-business')">
            <template #icon><icon-plus /></template>
            新建指标
          </a-doption>
        </template>
      </a-dropdown>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input
            v-model="searchParams.name"
            placeholder="搜索指标名称"
            allow-clear
            @press-enter="handleSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchParams.businessDomain"
            placeholder="指标域"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="留存域">留存域</a-option>
            <a-option value="转化域">转化域</a-option>
            <a-option value="业务规模">业务规模</a-option>
            <a-option value="风控域">风控域</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="searchParams.regulatoryCategory"
            placeholder="归属场景"
            allow-clear
            @change="handleSearch"
          >
            <a-option :value="RegulatoryCategory.CBIRC_BANKING">银保监会-银监报表</a-option>
            <a-option :value="RegulatoryCategory.PBOC_CENTRALIZED">人行-大集中报表</a-option>
            <a-option :value="RegulatoryCategory.PBOC_FINANCIAL_BASE">人行-金融基础数据</a-option>
            <a-option :value="RegulatoryCategory.PBOC_INTEREST_RATE">人行-利率报备检测分析</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
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
      
      <template #type="{ record }">
        <a-tag :color="record.type === MetricType.BUSINESS_CORE ? 'blue' : 'orange'">
          {{ METRIC_TYPE_LABELS[record.type] }}
        </a-tag>
      </template>
      
      <template #domain="{ record }">
        <template v-if="record.type === MetricType.BUSINESS_CORE">
          {{ record.businessDomain || '-' }}
        </template>
        <template v-else-if="record.type === MetricType.REGULATORY">
          {{ REGULATORY_CATEGORY_LABELS[record.regulatoryCategory] || '-' }}
        </template>
        <span v-else>-</span>
      </template>

      <template #scene="{ record }">
       {{ REGULATORY_CATEGORY_LABELS[record.regulatoryCategory] || '-' }}
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="editMetric(record)">
            编辑
          </a-button>
          <a-button type="text" size="small" @click="viewVersionHistory(record)">
            历史版本
          </a-button>
          <a-button type="text" size="small" @click="archiveMetric(record)">
            归档
          </a-button>
        </a-space>
      </template>
    </a-table>



    <!-- 版本历史模态框 -->
    <a-modal
      v-model:visible="showVersionHistoryModal"
      title="历史版本"
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

    <!-- 批量上传业务核心指标弹窗 -->
    <a-modal
      v-model:visible="showBatchUploadBusinessModal"
      title="批量上传业务核心指标"
      width="600px"
      @ok="handleBatchUploadSubmit('business')"
      @cancel="resetBatchUpload"
      ok-text="确定上传"
      cancel-text="取消"
    >
      <div class="batch-upload-content">
        <a-alert
          type="info"
          message="请先下载模版，按照模版格式填写数据后上传Excel文件"
          style="margin-bottom: 16px"
        />
        
        <a-space direction="vertical" style="width: 100%" size="large">
          <!-- 下载模版 -->
          <div>
            <h4>步骤1：下载Excel模版</h4>
            <a-button type="outline" @click="downloadTemplate('business')">
              <template #icon><icon-download /></template>
              下载业务核心指标模版
            </a-button>
          </div>
          
          <!-- 文件上传 -->
          <div>
            <h4>步骤2：上传填写好的Excel文件</h4>
            <a-upload
              ref="businessUploadRef"
              :file-list="businessFileList"
              :auto-upload="false"
              accept=".xlsx,.xls"
              @change="handleBusinessFileChange"
              @remove="handleBusinessFileRemove"
            >
              <template #upload-button>
                <a-button type="primary">
                  <template #icon><icon-upload /></template>
                  选择Excel文件
                </a-button>
              </template>
            </a-upload>
            <div class="upload-tips">
              <p>支持格式：.xlsx、.xls</p>
              <p>文件大小：不超过10MB</p>
            </div>
          </div>
        </a-space>
      </div>
    </a-modal>

    <!-- 批量上传监管指标弹窗 -->
    <a-modal
      v-model:visible="showBatchUploadRegulatoryModal"
      title="批量上传监管指标"
      width="600px"
      @ok="handleBatchUploadSubmit('regulatory')"
      @cancel="resetBatchUpload"
      ok-text="确定上传"
      cancel-text="取消"
    >
      <div class="batch-upload-content">
        <a-alert
          type="info"
          message="请先下载模版，按照模版格式填写数据后上传Excel文件"
          style="margin-bottom: 16px"
        />
        
        <a-space direction="vertical" style="width: 100%" size="large">
          <!-- 下载模版 -->
          <div>
            <h4>步骤1：下载Excel模版</h4>
            <a-button type="outline" @click="downloadTemplate('regulatory')">
              <template #icon><icon-download /></template>
              下载监管指标模版
            </a-button>
          </div>
          
          <!-- 文件上传 -->
          <div>
            <h4>步骤2：上传填写好的Excel文件</h4>
            <a-upload
              ref="regulatoryUploadRef"
              :file-list="regulatoryFileList"
              :auto-upload="false"
              accept=".xlsx,.xls"
              @change="handleRegulatoryFileChange"
              @remove="handleRegulatoryFileRemove"
            >
              <template #upload-button>
                <a-button type="primary">
                  <template #icon><icon-upload /></template>
                  选择Excel文件
                </a-button>
              </template>
            </a-upload>
            <div class="upload-tips">
              <p>支持格式：.xlsx、.xls</p>
              <p>文件大小：不超过10MB</p>
            </div>
          </div>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconDelete,
  IconEye,
  IconCopy,
  IconHistory,
  IconDown,
  IconUpload,
  IconDownload
} from '@arco-design/web-vue/es/icon'
import { MetricType, RegulatoryCategory } from '@/types/metrics'

type UploadCategory = 'business' | 'regulatory'
interface SimpleUploadFile {
  uid: string
  name?: string
  originFile?: File
  size?: number
  type?: string
}

// 路由实例
const router = useRouter()

// 响应式数据
const loading = ref(false)// 常量定义
const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  [MetricType.BUSINESS_CORE]: '业务核心指标',
  [MetricType.REGULATORY]: '监管指标'
}

const REGULATORY_CATEGORY_LABELS: Record<RegulatoryCategory, string> = {
  [RegulatoryCategory.CBIRC_BANKING]: '银保监会-银监报表',
  [RegulatoryCategory.PBOC_CENTRALIZED]: '人行-大集中报表',
  [RegulatoryCategory.PBOC_FINANCIAL_BASE]: '人行-金融基础数据',
  [RegulatoryCategory.PBOC_INTEREST_RATE]: '人行-利率报备检测分析'
}

// 响应式数据
const searchKeyword = ref<string>('')
const selectedCategory = ref<string>('')
const selectedStatus = ref<string>('')
const selectedDomain = ref<string>('')
const selectedRegulatoryCategory = ref<string>('')

const showVersionHistoryModal = ref(false)
const showBatchUploadBusinessModal = ref(false)
const showBatchUploadRegulatoryModal = ref(false)
const uploadFile = ref<File | null>(null)
const businessFileList = ref<SimpleUploadFile[]>([])
const regulatoryFileList = ref<SimpleUploadFile[]>([])
const businessUploadRef = ref(null)
const regulatoryUploadRef = ref(null)
// 指标接口定义
interface MetricItem {
  id?: number
  name: string
  code: string
  type: MetricType
  category: string
  businessDomain?: string
  businessDefinition: string
  owner: string
  businessOwner?: string
  technicalOwner?: string
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
  regulatoryCategory?: RegulatoryCategory
}

const currentMetricForHistory = ref<MetricItem | null>(null)
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
const columns: Array<{
  title: string
  dataIndex?: string
  width?: number
  render?: (ctx: { record: MetricItem }) => any
  slotName?: string
  ellipsis?: boolean // Add ellipsis property
  tooltip?: boolean // Add tooltip property
}> = [
  {
    title: '指标名称',
    dataIndex: 'name',
    width: 180,
    render: ({ record }: { record: MetricItem }) => {
      return h('a-button', {
        type: 'text',
        onClick: () => viewMetricDetail(record)
      }, record.name)
    }
  },
  {
    title: '业务口径',
    dataIndex: 'businessDefinition',
    width: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '指标类型',
    dataIndex: 'type',
    width: 120,
    slotName: 'type'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slotName: 'status'
  },
  {
    title: '指标域',
    dataIndex: 'domain',
    width: 150,
    slotName: 'domain'
  },
  {
    title: '归属场景',
    dataIndex: 'scene',
    width: 220,
    slotName: 'scene'
  },
  {
    title: '业务负责人',
    dataIndex: 'businessOwner',
    width: 120
  },
  {
    title: '技术负责人',
    dataIndex: 'technicalOwner',
    width: 120
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 160
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'actions',
    width: 200
  }
]

// 版本历史表格列配置
const versionHistoryColumns: Array<{
  title: string
  dataIndex?: string
  width?: number
  slotName?: string
  ellipsis?: boolean
  tooltip?: boolean
  fixed?: string
}> = [
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
const mockData = ref<MetricItem[]>([
  {
    id: 1,
    name: 'DAU',
    code: 'USER_001',
    type: MetricType.BUSINESS_CORE,
    category: '用户指标',
    businessDomain: '留存域',
    businessDefinition: '日活跃用户数',
    owner: '张三',
    businessOwner: '李四',
    technicalOwner: '王五',
    version: '1',
    versionStatus: 'active',
    versionDescription: '优化计算逻辑，提升数据准确性',
    useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
    statisticalPeriod: '日更新',
    sourceTable: '',
    processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau\nFROM dwd.user_login_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
    reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '核心指标报表', url: '/reports/core-metrics' }],
    storageLocation: '',
    queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}',
    status: 'active',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '当日风控授信通过笔数',
    code: 'A00043',
    type: MetricType.BUSINESS_CORE,
    category: '业务域',
    businessDomain: '业务规模',
    businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
    owner: '王志雄',
    businessOwner: '王志雄',
    technicalOwner: '',
    version: '1',
    versionStatus: 'active',
    versionDescription: '初始版本',
    useCase: '',
    statisticalPeriod: '离线T+2',
    sourceTable: '',
    processingLogic: 'SELECT COUNT(flow_id) FROM a_frms_deparment_sx_his_full WHERE result=\'PA\'',
    fieldDescription: '',
    reports: [{ name: '发展日测报告', url: '/reports/daily-development' }, { name: '公司级报表', url: '/reports/company-level' }, { name: '市场营销报表', url: '/reports/marketing' }],
    storageLocation: '',
    queryCode: 'SELECT data_dt=20250401\nFROM adm.ads_report_numbersinfo_free_temporal_code\nWHERE data_dt=20250401\nAND indicator_name=\'风控授信通过量\'\nAND indicator_id=\'A00043\'',
    status: 'active',
    updateTime: '2024-01-15 11:45:00'
  },
  {
    id: 3,
    name: '用户注册转化率',
    code: 'USER_002',
    type: MetricType.BUSINESS_CORE,
    category: '用户指标',
    businessDomain: '转化域',
    businessDefinition: '访问用户转化为注册用户的比率',
    owner: '李四',
    businessOwner: '李四',
    technicalOwner: '赵六',
    version: '2',
    versionStatus: 'active',
    versionDescription: '新增渠道维度分析',
    useCase: '衡量产品获客效果，优化注册流程',
    statisticalPeriod: '日更新',
    sourceTable: '',
    processingLogic: 'SELECT dt, COUNT(DISTINCT register_user_id) / COUNT(DISTINCT visit_user_id) as conversion_rate\nFROM dwd.user_register_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID',
    reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '转化分析报表', url: '/reports/conversion-analysis' }],
    storageLocation: '',
    queryCode: 'SELECT conversion_rate FROM adm.ads_user_conversion_metrics WHERE dt = ${date}',
    status: 'active',
    updateTime: '2024-01-14 16:20:00'
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
    businessOwner: '王五',
    technicalOwner: '孙七',
    version: '1',
    versionStatus: 'active',
    versionDescription: '初始版本',
    useCase: '监管合规报表',
    statisticalPeriod: '季度',
    sourceTable: '',
    processingLogic: '(一级资本 + 二级资本) / 风险加权资产 * 100%',
    fieldDescription: '资本充足率: 银行资本与风险加权资产的比率',
    reports: [{ name: '银保监会季度报表', url: '/reports/cbirc-quarterly' }],
    storageLocation: '',
    queryCode: 'SELECT capital_adequacy_ratio FROM adm.ads_regulatory_metrics WHERE report_date = ${quarter_end_date}',
    status: 'active',
    updateTime: '2024-01-13 09:15:00'
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



const searchParams = reactive({
  name: '',
  businessDomain: '',
  regulatoryCategory: RegulatoryCategory.CBIRC_BANKING,
});


// 方法
// 处理新建指标下拉菜单点击
const handleCreateMetric = (type: string) => {
  switch (type) {
    case 'batch-business':
      console.log('批量上传')
      showBatchUploadBusinessModal.value = true
      break
    case 'create-business':
      console.log('新建指标')
  router.push('/discovery/asset-management/metric-management/create/edit?type=business')
      break

  }
}

const handleSearch = () => {
  loading.value = true
  // 实际项目中这里会调用API进行搜索
  console.log('搜索条件:', {
    keyword: searchKeyword.value,
    category: selectedCategory.value,
    status: selectedStatus.value,
    businessDomain: selectedDomain.value,
    regulatoryCategory: selectedRegulatoryCategory.value
  })
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

const resetSearch = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedDomain.value = ''
  selectedRegulatoryCategory.value = ''
  handleSearch()
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



const viewMetricDetail = (record: MetricItem) => {
  router.push(`/discovery/asset-management/metric-management/${record.id}/view`)
}

const editMetric = (record: MetricItem) => {
  router.push(`/discovery/asset-management/metric-management/${record.id}/edit`)
}

// 版本历史相关方法
const viewVersionHistory = (record: MetricItem) => {
  currentMetricForHistory.value = record
  // 模拟版本历史数据
  versionHistoryData.value = [
    {
      id: 1,
      version: '3',
      versionStatus: 'active',
      versionDescription: '新增渠道维度分析',
      createTime: '2024-01-15 14:30:00',
      creator: '李四'
    },
    {
      id: 2,
      version: '2',
      versionStatus: 'history',
      versionDescription: '重构计算逻辑，提升性能',
      createTime: '2024-01-10 09:15:00',
      creator: '李四'
    },
    {
      id: 3,
      version: '1',
      versionStatus: 'history',
      versionDescription: '初始版本',
      createTime: '2024-01-01 10:00:00',
      creator: '张三'
    }
  ]
  showVersionHistoryModal.value = true
}

const viewVersionDetail = (versionRecord: VersionHistoryItem) => {
  console.log('查看版本详情:', versionRecord)
  Message.info('查看版本详情功能开发中')
}

const activateVersion = (versionRecord: VersionHistoryItem) => {
  console.log('激活版本:', versionRecord)
  // 更新版本状态
  versionHistoryData.value.forEach((item: VersionHistoryItem) => {
    item.versionStatus = item.id === versionRecord.id ? 'active' : 'history'
  })
  Message.success(`版本 ${versionRecord.version} 已激活`)
}



const copyMetric = (record: MetricItem) => {
  router.push(`/discovery/asset-management/metric-management/${record.id}/copy`)
}

const deleteMetric = (record: MetricItem) => {
  console.log('删除指标:', record)
  Message.success('删除成功')
}

const archiveMetric = (record: MetricItem) => {
  // 简单处理：标记为停用状态表示归档
  record.status = 'inactive'
  Message.success('已归档')
}



// 批量上传相关方法
const downloadTemplate = (type: UploadCategory) => {
  // 创建模版数据
  const templateData = {
    business: {
      filename: '业务核心指标批量上传模版.xlsx',
      headers: ['指标名称', '指标编码', '指标描述', '分类', '统计周期', '业务域', '业务负责人', '技术负责人', '业务定义', '使用场景', '加工逻辑', '字段说明'],
      sampleData: [
        ['示例指标1', 'METRIC_001', '这是一个示例指标', '财务指标', '月度', '风险管理', '张三', '李四', '业务定义示例', '用于风险评估', 'SELECT * FROM table', '字段1:描述1']
      ]
    },
    regulatory: {
      filename: '监管指标批量上传模版.xlsx',
      headers: ['指标名称', '指标编码', '指标描述', '监管报表大类', '报表名称', '统计周期', '业务域', '负责人', '业务负责人', '技术负责人', '业务定义', '使用场景', '加工逻辑', '字段说明', '报表位置'],
      sampleData: [
        ['示例监管指标1', 'REG_001', '这是一个示例监管指标', '资本充足率', '资本充足率报表', '季度', '风险管理', '李四', '王五', '赵六', '监管业务定义', '监管合规', 'SELECT * FROM reg_table', '监管字段描述', 'A1']
      ]
    }
  }

  const template = templateData[type]
  
  // 创建工作簿
  const wb: any = {
    SheetNames: ['模版'],
    Sheets: {
      '模版': {
        '!ref': `A1:${String.fromCharCode(65 + template.headers.length - 1)}${template.sampleData.length + 1}`,
        ...template.headers.reduce((acc: { [key: string]: { v: string; t: string } }, header, index) => {
          const col = String.fromCharCode(65 + index)
          acc[`${col}1`] = { v: header, t: 's' }
          return acc
        }, {}),
        ...((template.sampleData && template.sampleData[0]) ? template.sampleData[0].reduce((acc: { [key: string]: { v: string; t: string } }, data, index) => {
          const col = String.fromCharCode(65 + index)
          acc[`${col}2`] = { v: data, t: 's' }
          return acc
        }, {}) : {})
      }
    }
  }

  // 模拟下载
  const blob = new Blob([JSON.stringify(wb)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = template.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  Message.success(`${template.filename} 下载成功`)
}

const handleBusinessFileChange = (fileList: SimpleUploadFile[]) => {
  businessFileList.value = fileList
}

const handleBusinessFileRemove = (file: SimpleUploadFile) => {
  const index = businessFileList.value.findIndex((item: SimpleUploadFile) => item.uid === file.uid)
  if (index > -1) {
    businessFileList.value.splice(index, 1)
  }
}

const handleRegulatoryFileChange = (fileList: SimpleUploadFile[]) => {
  regulatoryFileList.value = fileList
}

const handleRegulatoryFileRemove = (file: SimpleUploadFile) => {
  const index = regulatoryFileList.value.findIndex((item: SimpleUploadFile) => item.uid === file.uid)
  if (index > -1) {
    regulatoryFileList.value.splice(index, 1)
  }
}

const handleBatchUploadSubmit = async (type: UploadCategory) => {
  const fileList = type === 'business' ? businessFileList.value : regulatoryFileList.value
  
  if (fileList.length === 0) {
    Message.warning('请先选择要上传的Excel文件')
    return
  }

  const file = fileList[0].originFile || fileList[0]
  
  // 验证文件类型
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  if (!allowedTypes.includes(file.type)) {
    Message.error('请上传Excel文件（.xlsx或.xls格式）')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    Message.error('文件大小不能超过10MB')
    return
  }

  try {
    // 这里应该调用实际的上传API
    // const formData = new FormData()
    // formData.append('file', file)
    // formData.append('type', type)
    // const response = await uploadBatchMetrics(formData)
    
    // 模拟上传成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success(`${type === 'business' ? '业务核心指标' : '监管指标'}批量上传成功`)
    
    // 关闭弹窗并重置
    if (type === 'business') {
      showBatchUploadBusinessModal.value = false
    } else {
      showBatchUploadRegulatoryModal.value = false
    }
    resetBatchUpload()
    
    // 刷新列表
    handleSearch()
  } catch (error) {
    console.error('批量上传失败:', error)
    Message.error('批量上传失败，请重试')
  }
}

const resetBatchUpload = () => {
  businessFileList.value = []
  regulatoryFileList.value = []
  showBatchUploadBusinessModal.value = false
  showBatchUploadRegulatoryModal.value = false
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

/* 批量上传弹窗样式 */
.batch-upload-content {
  padding: 8px 0;
}

.batch-upload-content h4 {
  margin: 0 0 12px 0;
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
}

.upload-tips {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f7f8fa;
  border-radius: 4px;
  border-left: 3px solid #165dff;
}

.upload-tips p {
  margin: 0;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.upload-tips p:first-child {
  margin-bottom: 4px;
}
</style>