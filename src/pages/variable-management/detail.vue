<template>
  <div class="variable-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item @click="handleBackToList">变量管理</a-breadcrumb-item>
        <a-breadcrumb-item>变量详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ variableData.name }}</h1>
          <a-tag :color="getStatusColor(variableData.status)">
            {{ getStatusLabel(variableData.status) }}
          </a-tag>
        </div>
        <div class="header-actions">
          <a-button @click="handleEdit">
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-button 
            :status="variableData.status === 'active' ? 'warning' : 'normal'"
            @click="handleToggleStatus"
          >
            <template #icon><icon-switch /></template>
            {{ variableData.status === 'active' ? '停用' : '启用' }}
          </a-button>
          <a-button status="danger" @click="handleDelete">
            <template #icon><icon-delete /></template>
            删除
          </a-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <a-tabs v-model:active-key="activeTab" type="card">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" title="基本信息">
          <div class="tab-content">
            <a-card title="变量信息" class="info-card">
              <a-descriptions :data="basicInfo" :column="2" bordered />
            </a-card>
            
            <a-card title="技术属性" class="info-card">
              <a-descriptions :data="technicalInfo" :column="2" bordered />
            </a-card>

            <a-card title="质量指标" class="info-card">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">数据质量</div>
                    <div class="quality-value">
                      <a-progress
                        :percent="variableData.dataQuality"
                        :color="getQualityColor(variableData.dataQuality)"
                        size="large"
                      />
                      <span class="quality-text">{{ variableData.dataQuality }}%</span>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">缺失率</div>
                    <div class="quality-value">
                      <a-progress
                        :percent="variableData.missingRate"
                        status="exception"
                        size="large"
                      />
                      <span class="quality-text">{{ variableData.missingRate }}%</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 16px;">
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">唯一值数量</div>
                    <div class="quality-value">
                      <span class="quality-number">{{ variableData.uniqueValueCount }}</span>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">更新频率</div>
                    <div class="quality-value">
                      <span class="quality-text">{{ variableData.updateFrequency }}</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </a-card>

            <a-card title="变量定义" class="info-card">
              <div class="definition-content">
                {{ variableData.definition || '暂无定义' }}
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 数据来源 -->
        <a-tab-pane key="source" title="数据来源">
          <div class="tab-content">
            <a-card title="数据源信息" class="info-card">
              <a-descriptions :data="sourceInfo" :column="2" bordered />
            </a-card>

            <a-card title="字段映射" class="info-card">
              <a-table
                :data="fieldMappingData"
                :columns="fieldMappingColumns"
                row-key="id"
                :pagination="false"
              >
                <template #status="{ record }">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '正常' : '异常' }}
                  </a-tag>
                </template>
              </a-table>
            </a-card>

            <a-card title="数据血缘" class="info-card">
              <div class="lineage-container">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <h4>上游依赖</h4>
                    <a-timeline>
                      <a-timeline-item v-for="item in upstreamLineage" :key="item.id">
                        <div class="lineage-item">
                          <div class="lineage-name">{{ item.name }}</div>
                          <div class="lineage-type">({{ getTypeLabel(item.type) }})</div>
                        </div>
                      </a-timeline-item>
                    </a-timeline>
                  </a-col>
                  <a-col :span="12">
                    <h4>下游使用</h4>
                    <a-timeline>
                      <a-timeline-item v-for="item in downstreamLineage" :key="item.id">
                        <div class="lineage-item">
                          <div class="lineage-name">{{ item.name }}</div>
                          <div class="lineage-type">({{ getTypeLabel(item.type) }})</div>
                        </div>
                      </a-timeline-item>
                    </a-timeline>
                  </a-col>
                </a-row>
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 使用场景 -->
        <a-tab-pane key="usage" title="使用场景">
          <div class="tab-content">
            <a-card title="使用统计" class="info-card">
              <a-row :gutter="16">
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.total }}</div>
                    <div class="stat-label">总使用次数</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.metrics }}</div>
                    <div class="stat-label">指标引用</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.models }}</div>
                    <div class="stat-label">模型使用</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.reports }}</div>
                    <div class="stat-label">报表引用</div>
                  </div>
                </a-col>
              </a-row>
            </a-card>

            <a-card title="使用场景列表" class="info-card">
              <a-table
                :data="usageScenarios"
                :columns="usageColumns"
                row-key="id"
                :pagination="usagePagination"
                @page-change="handleUsagePageChange"
              >
                <template #type="{ record }">
                  <a-tag :color="getUsageTypeColor(record.type)">
                    {{ getUsageTypeLabel(record.type) }}
                  </a-tag>
                </template>
                <template #actions="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewUsage(record)">
                      查看
                    </a-button>
                    <a-button type="text" size="small" @click="handleGotoUsage(record)">
                      跳转
                    </a-button>
                  </a-space>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <!-- 版本历史 -->
        <a-tab-pane key="versions" title="版本历史">
          <div class="tab-content">
            <a-card title="版本列表" class="info-card">
              <a-table
                :data="versionList"
                :columns="versionColumns"
                row-key="id"
                :pagination="versionPagination"
                @page-change="handleVersionPageChange"
              >
                <template #version="{ record }">
                  <div class="version-info">
                    <div class="version-number">{{ record.version }}</div>
                    <a-tag v-if="record.isCurrent" color="green">当前版本</a-tag>
                  </div>
                </template>
                <template #changes="{ record }">
                  <div class="changes-content">
                    <div v-for="change in record.changes" :key="change" class="change-item">
                      • {{ change }}
                    </div>
                  </div>
                </template>
                <template #actions="{ record }">
                  <a-space>
                    <a-button 
                      v-if="!record.isCurrent" 
                      type="text" 
                      size="small" 
                      @click="handleCompareVersion(record)"
                    >
                      对比
                    </a-button>
                    <a-button 
                      v-if="!record.isCurrent" 
                      type="text" 
                      size="small" 
                      status="warning"
                      @click="handleRollbackVersion(record)"
                    >
                      回滚
                    </a-button>
                  </a-space>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useVariableStore } from '@/store/modules/variable'

const router = useRouter()
const route = useRoute()
const variableStore = useVariableStore()

// 当前激活的标签页
const activeTab = ref('basic')

// 变量数据
const variableData = computed(() => variableStore.currentVariable || {
  id: '',
  name: '',
  code: '',
  type: '',
  status: '',
  description: '',
  dataSource: '',
  dataSourceName: '',
  sourceField: '',
  updateFrequency: '',
  dataQuality: 0,
  missingRate: 0,
  uniqueValueCount: 0,
  definition: '',
  creator: '',
  createdAt: '',
  updatedAt: ''
})

// 使用统计
const usageStats = ref({
  total: 0,
  metrics: 0,
  models: 0,
  reports: 0
})

// 使用场景分页
const usagePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 版本分页
const versionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 使用场景列表
const usageScenarios = ref([])

// 版本列表
const versionList = ref([])

// 字段映射数据
const fieldMappingData = ref([])

// 上游血缘数据
const upstreamLineage = ref([])

// 下游血缘数据
const downstreamLineage = ref([])

// 状态映射
const statusMap = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

// 使用类型映射
const usageTypeMap = {
  metric: { label: '指标', color: 'blue' },
  model: { label: '模型', color: 'green' },
  report: { label: '报表', color: 'orange' },
  dashboard: { label: '仪表板', color: 'purple' }
}

// 基本信息
const basicInfo = computed(() => [
  { label: '变量名称', value: variableData.value.name },
  { label: '变量编码', value: variableData.value.code },
  { label: '变量类型', value: getTypeLabel(variableData.value.type) },
  { label: '创建人', value: variableData.value.creator },
  { label: '创建时间', value: variableData.value.createdAt },
  { label: '更新时间', value: variableData.value.updatedAt }
])

// 技术属性
const technicalInfo = computed(() => [
  { label: '数据源', value: variableData.value.dataSourceName },
  { label: '源字段', value: variableData.value.sourceField },
  { label: '更新频率', value: variableData.value.updateFrequency },
  { label: '描述', value: variableData.value.description || '暂无描述' }
])

// 数据源信息
const sourceInfo = computed(() => [
  { label: '数据源名称', value: variableData.value.dataSourceName },
  { label: '数据源类型', value: '数据库表' },
  { label: '连接信息', value: 'PostgreSQL:10.0.0.1:5432/analytics' },
  { label: '最后同步时间', value: '2024-01-15 14:30:00' }
])

// 获取状态标签
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusColor = (status) => statusMap[status]?.color || 'gray'

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    numerical: '数值型',
    categorical: '分类型',
    text: '文本型',
    datetime: '时间型',
    boolean: '布尔型'
  }
  return typeMap[type] || type
}

// 获取质量颜色
const getQualityColor = (quality) => {
  if (quality >= 95) return '#52c41a'
  if (quality >= 80) return '#faad14'
  return '#ff4d4f'
}

// 获取使用类型标签和颜色
const getUsageTypeLabel = (type) => usageTypeMap[type]?.label || type
const getUsageTypeColor = (type) => usageTypeMap[type]?.color || 'gray'

// 使用场景表格列
const usageColumns = [
  { title: '场景名称', dataIndex: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120, fixed: 'right' }
]

// 版本表格列
const versionColumns = [
  { title: '版本', dataIndex: 'version', slotName: 'version', width: 120 },
  { title: '变更描述', dataIndex: 'description', width: 200 },
  { title: '变更内容', dataIndex: 'changes', slotName: 'changes' },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120, fixed: 'right' }
]

// 字段映射表格列
const fieldMappingColumns = [
  { title: '字段名', dataIndex: 'fieldName', width: 150 },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '是否主键', dataIndex: 'isPrimaryKey', width: 80, render: ({ record }) => record.isPrimaryKey ? '是' : '否' },
  { title: '是否可空', dataIndex: 'isNullable', width: 80, render: ({ record }) => record.isNullable ? '是' : '否' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '描述', dataIndex: 'description' }
]

// 获取变量详情
const fetchVariableDetail = async () => {
  try {
    const variableId = route.params.id
    
    if (!variableId) {
      Message.error('变量ID不能为空')
      return
    }
    
    await variableStore.fetchVariableDetail(variableId)
    
    // Mock字段映射数据
    fieldMappingData.value = [
      {
        id: '1',
        fieldName: 'age',
        dataType: 'INTEGER',
        isPrimaryKey: false,
        isNullable: true,
        status: 'active',
        description: '用户年龄'
      },
      {
        id: '2',
        fieldName: 'user_id',
        dataType: 'BIGINT',
        isPrimaryKey: true,
        isNullable: false,
        status: 'active',
        description: '用户ID'
      }
    ]

    // Mock血缘数据
    upstreamLineage.value = [
      { id: 'table_001', name: '用户注册表', type: 'table' },
      { id: 'table_002', name: '用户认证表', type: 'table' }
    ]

    downstreamLineage.value = [
      { id: 'metric_001', name: '用户平均年龄', type: 'metric' },
      { id: 'model_001', name: '信用评分模型', type: 'model' },
      { id: 'report_001', name: '用户画像报告', type: 'report' }
    ]

  } catch (error) {
    console.error('获取变量详情失败:', error)
    Message.error('获取变量详情失败')
  }
}

// 获取使用场景
const fetchUsageScenarios = async () => {
  try {
    // Mock数据
    usageScenarios.value = [
      {
        id: 'usage_001',
        name: '用户平均年龄指标',
        type: 'metric',
        creator: '李四',
        createdAt: '2024-01-10 09:30:00',
        description: '计算所有用户的平均年龄，用于用户画像分析'
      },
      {
        id: 'usage_002',
        name: '信用评分模型',
        type: 'model',
        creator: '王五',
        createdAt: '2024-01-12 14:20:00',
        description: '使用用户年龄作为特征之一，构建信用评分模型'
      },
      {
        id: 'usage_003',
        name: '用户画像报告',
        type: 'report',
        creator: '赵六',
        createdAt: '2024-01-15 11:15:00',
        description: '在用户画像报告中展示年龄分布情况'
      }
    ]
    usagePagination.total = 3
    
    // Mock使用统计
    usageStats.value = {
      total: 15,
      metrics: 8,
      models: 4,
      reports: 3
    }
  } catch (error) {
    console.error('获取使用场景失败:', error)
    Message.error('获取使用场景失败')
  }
}

// 获取版本历史
const fetchVersionHistory = async () => {
  try {
    // Mock数据
    versionList.value = [
      {
        id: 'ver_003',
        version: 'v1.2.0',
        isCurrent: true,
        description: '优化数据质量监控',
        changes: ['新增数据质量监控规则', '优化缺失值处理逻辑'],
        creator: '张三',
        createdAt: '2024-01-15 14:30:00'
      },
      {
        id: 'ver_002',
        version: 'v1.1.0',
        isCurrent: false,
        description: '扩展数据源',
        changes: ['新增用户认证表作为数据源', '优化数据更新频率'],
        creator: '李四',
        createdAt: '2024-01-10 10:20:00'
      },
      {
        id: 'ver_001',
        version: 'v1.0.0',
        isCurrent: false,
        description: '初始版本',
        changes: ['创建用户年龄变量', '配置基础数据质量规则'],
        creator: '张三',
        createdAt: '2024-01-01 10:00:00'
      }
    ]
    versionPagination.total = 3
  } catch (error) {
    console.error('获取版本历史失败:', error)
    Message.error('获取版本历史失败')
  }
}

// 返回列表
const handleBackToList = () => {
  router.push('/variable-management')
}

// 编辑变量
const handleEdit = () => {
  Message.info('编辑功能开发中...')
}

// 切换状态
const handleToggleStatus = async () => {
  try {
    const newStatus = variableData.value.status === 'active' ? 'deprecated' : 'active'
    const action = variableData.value.status === 'active' ? '停用' : '启用'
    
    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}变量"${variableData.value.name}"吗？`,
      onOk: async () => {
        try {
          await variableStore.updateVariable({
            id: variableData.value.id,
            data: { status: newStatus }
          })
          Message.success(`变量已${action}`)
        } catch (error) {
          Message.error('状态更新失败')
        }
      }
    })
  } catch (error) {
    Message.error('状态更新失败')
  }
}

// 删除变量
const handleDelete = async () => {
  try {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除变量"${variableData.value.name}"吗？此操作不可恢复。`,
      okText: '删除',
      okButtonProps: { status: 'danger' },
      onOk: async () => {
        try {
          await variableStore.deleteVariable(variableData.value.id)
          Message.success('变量已删除')
          router.push('/variable-management')
        } catch (error) {
          Message.error('删除失败')
        }
      }
    })
  } catch (error) {
    Message.error('删除失败')
  }
}

// 查看使用场景
const handleViewUsage = (record) => {
  Message.info(`查看${record.name}详情`)
}

// 跳转到使用场景
const handleGotoUsage = (record) => {
  // 根据类型跳转到不同的页面
  const routes = {
    metric: '/metrics',
    model: '/models',
    report: '/reports',
    dashboard: '/dashboards'
  }
  const route = routes[record.type] || '/'
  router.push(`${route}/${record.id}`)
}

// 版本对比
const handleCompareVersion = (record) => {
  Message.info(`对比版本: ${record.version}`)
}

// 版本回滚
const handleRollbackVersion = (record) => {
  Modal.confirm({
    title: '确认回滚',
    content: `确定要回滚到版本"${record.version}"吗？`,
    onOk: async () => {
      Message.success('版本回滚成功')
      fetchVersionHistory()
    }
  })
}

// 使用场景分页
const handleUsagePageChange = (page) => {
  usagePagination.current = page
  fetchUsageScenarios()
}

// 版本分页
const handleVersionPageChange = (page) => {
  versionPagination.current = page
  fetchVersionHistory()
}

// 初始化
onMounted(() => {
  fetchVariableDetail()
  fetchUsageScenarios()
  fetchVersionHistory()
})
</script>

<style scoped>
.variable-detail-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content {
  padding: 16px 0;
}

.info-card {
  margin-bottom: 16px;
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.quality-label {
  font-size: 14px;
  color: #86909c;
  min-width: 80px;
}

.quality-value {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.quality-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  min-width: 60px;
}

.quality-number {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.definition-content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #1d2129;
  min-height: 100px;
}

.lineage-container {
  padding: 16px;
}

.lineage-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lineage-name {
  font-weight: 500;
  color: #1d2129;
}

.lineage-type {
  font-size: 12px;
  color: #86909c;
}

.usage-stat {
  text-align: center;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #52c41a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #86909c;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  font-weight: 600;
  color: #1d2129;
}

.changes-content {
  max-height: 100px;
  overflow-y: auto;
}

.change-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
</style>