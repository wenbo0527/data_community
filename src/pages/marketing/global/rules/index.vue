<template>
  <div class="rule-management">
    <a-card title="规则管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="outline" @click="handleViewAlertManagement">
            <template #icon>
              <icon-notification />
            </template>
            预警管理
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <IconPlus />
            </template>
            新建规则
          </a-button>
          <a-button @click="handleViewAlertManagement">
            <template #icon>
              <IconEye />
            </template>
            查看预警管理
          </a-button>
        </a-space>
      </template>

      <!-- Tab 分类 -->
      <a-tabs v-model:active-key="activeTab" type="line" class="rule-tabs">
        <a-tab-pane key="frequency" title="频控规则">
          <!-- 搜索区域 -->
          <div class="search-form">
            <a-form :model="searchForm" layout="inline">
              <a-form-item label="规则名称">
                <a-input 
                  v-model="searchForm.name" 
                  placeholder="请输入规则名称"
                  style="width: 200px"
                />
              </a-form-item>
              <a-form-item label="规则类型">
                <a-select 
                  v-model="searchForm.type" 
                  placeholder="请选择规则类型"
                  style="width: 150px"
                >
                  <a-option value="">全部</a-option>
                  <a-option value="business">业务规则</a-option>
                  <a-option value="system">系统规则</a-option>
                  <a-option value="security">安全规则</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="状态">
                <a-select 
                  v-model="searchForm.status" 
                  placeholder="请选择状态"
                  style="width: 120px"
                >
                  <a-option value="">全部</a-option>
                  <a-option value="active">启用</a-option>
                  <a-option value="inactive">禁用</a-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
              </a-form-item>
            </a-form>
          </div>

          <!-- 频控规则表格 -->
          <a-table 
            :columns="frequencyColumns" 
            :data="filteredFrequencyRules" 
            :pagination="pagination"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #type="{ record }">
              <a-tag :color="getTypeColor(record?.type)">
                {{ getTypeText(record?.type) }}
              </a-tag>
            </template>
            
            <template #status="{ record }">
              <a-switch 
                v-model="record.status" 
                :checked-value="'active'" 
                :unchecked-value="'inactive'"
                @change="handleStatusChange(record)"
              />
            </template>
            
            <template #actions="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="text" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-popconfirm
                content="确定要删除这条规则吗？"
                @ok="handleDelete(record)"
              >
                <a-button type="text" size="small" status="danger">
                  删除
                </a-button>
              </a-popconfirm>
              <a-button v-if="record.status === 'active'" type="text" size="small" @click="handleViewAlertManagement">查看预警</a-button>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="alert" title="预警规则">
          <!-- 预警规则搜索区域 -->
          <div class="search-form">
            <a-form :model="alertSearchForm" layout="inline">
              <a-form-item label="规则名称">
                <a-input 
                  v-model="alertSearchForm.name" 
                  placeholder="请输入规则名称"
                  style="width: 200px"
                />
              </a-form-item>
              <a-form-item label="监控类型">
                <a-select 
                  v-model="alertSearchForm.type" 
                  placeholder="请选择监控类型"
                  style="width: 150px"
                >
                  <a-option value="">全部</a-option>
                  <a-option value="inventory">库存监控</a-option>
                  <a-option value="expiry">过期监控</a-option>
                  <a-option value="failure">失败率监控</a-option>
                  <a-option value="coupon_inventory">券库存粒度</a-option>
                  <a-option value="coupon_package">券包粒度</a-option>
                  <a-option value="coupon_lifecycle">券实例生命周期</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="状态">
                <a-select 
                  v-model="alertSearchForm.status" 
                  placeholder="请选择状态"
                  style="width: 120px"
                >
                  <a-option value="">全部</a-option>
                  <a-option value="active">启用</a-option>
                  <a-option value="inactive">禁用</a-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="handleAlertSearch">查询</a-button>
                <a-button @click="handleAlertReset" style="margin-left: 8px">重置</a-button>
              </a-form-item>
            </a-form>
          </div>

          <!-- 预警规则表格 -->
          <a-table 
            :columns="alertColumns" 
            :data="filteredAlertRules" 
            :pagination="alertPagination"
            @page-change="onAlertPageChange"
            @page-size-change="onAlertPageSizeChange"
          >
            <template #type="{ record }">
              <a-tag :color="getAlertTypeColor(record?.type)">
                {{ getAlertTypeText(record?.type) }}
              </a-tag>
            </template>
            
            <template #status="{ record }">
              <a-switch 
                v-model="record.status" 
                :checked-value="'active'" 
                :unchecked-value="'inactive'"
                @change="handleStatusChangeAlert(record)"
              />
            </template>
            
            <template #conditions="{ record }">
              <span>{{ formatAlertConditions(record.conditions) }}</span>
            </template>
            
            <template #actions="{ record }">
              <a-button type="text" size="small" @click="handleEditAlert(record)">
                编辑
              </a-button>
              <a-button type="text" size="small" @click="handleViewAlert(record)">
                查看
              </a-button>
              <a-popconfirm
                content="确定要删除这条预警规则吗？"
                @ok="handleDeleteAlert(record)"
              >
                <a-button type="text" size="small" status="danger">
                  删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="formData" :rules="rules" ref="formRef">
        <a-form-item label="规则名称" field="name">
          <a-input v-model="formData.name" placeholder="请输入规则名称" />
        </a-form-item>
        
        <a-form-item label="规则类型" field="type">
          <a-select v-model="formData.type" placeholder="请选择规则类型">
            <a-option value="business">业务规则</a-option>
            <a-option value="system">系统规则</a-option>
            <a-option value="security">安全规则</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="规则描述" field="description">
          <a-textarea 
            v-model="formData.description" 
            placeholder="请输入规则描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="规则内容" field="content">
          <a-textarea 
            v-model="formData.content" 
            placeholder="请输入规则内容（JSON格式）"
            :rows="5"
          />
        </a-form-item>
        
        <a-form-item label="优先级" field="priority">
          <a-input-number 
            v-model="formData.priority" 
            :min="1" 
            :max="100"
            placeholder="请输入优先级"
          />
        </a-form-item>
        
        <a-form-item label="状态" field="status">
          <a-radio-group v-model="formData.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconEye } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import { getAllAlertRules, getActiveAlertRules, updateAlertRule, deleteAlertRule, toggleAlertRuleStatus } from '@/api/alertRules'

const router = useRouter()

// 当前激活的Tab
const activeTab = ref('frequency')

// 频控规则搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 预警规则搜索表单
const alertSearchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 频控规则表格数据
const frequencyRulesData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 预警规则表格数据
const alertRulesData = ref([])
const alertPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 频控规则表格列配置
const frequencyColumns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '规则类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    width: 100
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 预警规则表格列配置
const alertColumns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '监控类型',
    dataIndex: 'type',
    slotName: 'type',
    width: 120
  },
  {
    title: '预警条件',
    dataIndex: 'conditions',
    slotName: 'conditions',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('')
const formRef = ref()
const formData = reactive({
  id: null,
  name: '',
  type: '',
  description: '',
  content: '',
  priority: 1,
  status: 'active'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入规则名称' }],
  type: [{ required: true, message: '请选择规则类型' }],
  description: [{ required: true, message: '请输入规则描述' }],
  content: [{ required: true, message: '请输入规则内容' }],
  priority: [{ required: true, message: '请输入优先级' }]
}

// 频控规则Mock数据
const mockFrequencyData = ref([
  {
    id: 1,
    name: '库存预警频控',
    type: 'inventory',
    conditions: '库存 < 100',
    frequency: '每小时最多1次',
    status: 'active',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '过期商品频控',
    type: 'expiry',
    conditions: '过期时间 < 7天',
    frequency: '每天最多3次',
    status: 'inactive',
    createTime: '2024-01-14 09:20:00',
    updateTime: '2024-01-14 09:20:00'
  },
  {
    id: 3,
    name: '系统故障频控',
    type: 'failure',
    conditions: '错误率 > 5%',
    frequency: '每分钟最多1次',
    status: 'active',
    createTime: '2024-01-13 14:15:00',
    updateTime: '2024-01-13 14:15:00'
  }
])

const mockAlertData = ref([
  {
    id: 1,
    name: '库存不足预警',
    type: 'inventory',
    level: 'high',
    conditions: '库存数量 < 50',
    channels: ['email', 'sms'],
    status: 'active',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '商品即将过期',
    type: 'expiry',
    level: 'medium',
    conditions: '过期时间 < 3天',
    channels: ['email'],
    status: 'active',
    createTime: '2024-01-14 09:20:00',
    updateTime: '2024-01-14 09:20:00'
  },
  {
    id: 3,
    name: '系统异常监控',
    type: 'failure',
    level: 'high',
    conditions: '响应时间 > 5秒',
    channels: ['email', 'sms', 'webhook'],
    status: 'inactive',
    createTime: '2024-01-13 14:15:00',
    updateTime: '2024-01-13 14:15:00'
  }
])

// 获取类型颜色
const getTypeColor = (type) => {
  if (!type || typeof type !== 'string') return 'gray'
  const colors = {
    business: 'blue',
    system: 'green',
    security: 'red',
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red'
  }
  return colors[type] || 'gray'
}

// 获取类型文本
const getTypeText = (type) => {
  if (!type || typeof type !== 'string') return '未知类型'
  const texts = {
    business: '业务规则',
    system: '系统规则',
    security: '安全规则',
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败率监控'
  }
  return texts[type] || type
}

// 计算过滤后的频控规则数据
const filteredFrequencyRules = computed(() => {
  let rules = [...(frequencyRulesData.value || [])]
  
  // 确保所有规则都有基本属性
  rules = rules.filter(rule => rule && typeof rule === 'object')
  
  if (searchForm.name) {
    rules = rules.filter(rule => 
      rule?.name?.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }
  
  if (searchForm.type) {
    rules = rules.filter(rule => rule?.type === searchForm.type)
  }
  
  if (searchForm.status) {
    rules = rules.filter(rule => rule?.status === searchForm.status)
  }
  
  return rules
})

// 计算过滤后的预警规则数据
const filteredAlertRules = computed(() => {
  let rules = [...(mockAlertData.value || [])]
  
  // 确保所有规则都有基本属性
  rules = rules.filter(rule => rule && typeof rule === 'object')
  
  if (alertSearchForm.name) {
    rules = rules.filter(rule => 
      rule?.name?.toLowerCase().includes(alertSearchForm.name.toLowerCase())
    )
  }
  
  if (alertSearchForm.type) {
    rules = rules.filter(rule => rule?.type === alertSearchForm.type)
  }
  
  if (alertSearchForm.status) {
    rules = rules.filter(rule => rule?.status === alertSearchForm.status)
  }
  
  return rules
})

// 获取频控规则数据
const fetchFrequencyTableData = async () => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 确保数据是有效的数组
    const data = mockFrequencyData.value || []
    frequencyRulesData.value = data.filter(item => item && typeof item === 'object' && item.id)
    pagination.total = frequencyRulesData.value.length
  } catch (error) {
    console.error('获取频控规则数据失败:', error)
    frequencyRulesData.value = []
    pagination.total = 0
    Message.error('获取频控规则数据失败')
  } finally {
    loading.value = false
  }
}

// 获取预警规则数据
const fetchAlertTableData = async () => {
  try {
    alertLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 确保数据是有效的数组
    const data = mockAlertData.value || []
    mockAlertData.value = data.filter(item => item && typeof item === 'object' && item.id)
    alertPagination.total = mockAlertData.value.length
  } catch (error) {
    console.error('获取预警规则数据失败:', error)
    mockAlertData.value = []
    alertPagination.total = 0
    Message.error('获取预警规则数据失败')
  } finally {
    alertLoading.value = false
  }
}

// 跳转到预警管理页
const handleViewAlertManagement = () => {
  router.push('/marketing/alert/management')
}

// 频控规则搜索
const handleSearch = () => {
  pagination.current = 1
  // 触发计算属性重新计算
  fetchFrequencyTableData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  pagination.current = 1
  fetchFrequencyTableData()
}

// 预警规则搜索
const handleAlertSearch = () => {
  alertPagination.current = 1
  // 触发计算属性重新计算
  fetchAlertTableData()
}

const handleAlertReset = () => {
  alertSearchForm.name = ''
  alertSearchForm.type = ''
  alertSearchForm.status = ''
  alertPagination.current = 1
  fetchAlertTableData()
}

// 创建
const handleCreate = () => {
  modalTitle.value = '新增规则'
  modalVisible.value = true
  resetForm()
}

// 编辑
const handleEdit = (record) => {
  modalTitle.value = '编辑规则'
  modalVisible.value = true
  Object.assign(formData, record)
}

// 查看
const handleView = (record) => {
  Message.info(`查看规则: ${record?.name || '未知规则'}`)
}

const handleDelete = (record) => {
  Message.success(`删除规则: ${record?.name || '未知规则'}`)
  fetchFrequencyTableData()
}

const handleStatusChange = (record) => {
  Message.success(`规则状态已${record?.status === 'active' ? '启用' : '禁用'}`)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    Message.success(formData.id ? '更新成功' : '创建成功')
    modalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    type: '',
    description: '',
    content: '',
    priority: 1,
    status: 'active'
  })
}

// 预警规则相关方法
const getAlertTypeColor = (type) => {
  if (!type || typeof type !== 'string') return 'gray'
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red',
    coupon_inventory: 'purple',
    coupon_package: 'green',
    coupon_lifecycle: 'cyan'
  }
  return colors[type] || 'gray'
}

const getAlertTypeText = (type) => {
  if (!type || typeof type !== 'string') return '未知类型'
  const texts = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败率监控',
    coupon_inventory: '券库存粒度',
    coupon_package: '券包粒度',
    coupon_lifecycle: '券实例生命周期'
  }
  return texts[type] || type
}

const formatAlertConditions = (conditions) => {
  if (!conditions) return '暂无条件'
  
  // 如果是字符串，直接返回
  if (typeof conditions === 'string') {
    return conditions
  }
  
  // 如果是对象，进行格式化
  if (typeof conditions === 'object') {
    if (conditions.threshold !== undefined) {
      return `阈值: ${conditions.threshold}${conditions.thresholdType === 'percentage' ? '%' : '张'}`
    }
    
    if (conditions.advanceDays !== undefined) {
      return `提前${conditions.advanceDays}天预警`
    }
    
    if (conditions.failureRate !== undefined) {
      return `失败率超过${conditions.failureRate}%`
    }
    
    if (conditions.inventoryThreshold !== undefined) {
      return `库存阈值: ${conditions.inventoryThreshold}${conditions.thresholdType === 'percentage' ? '%' : '张'}`
    }
    
    if (conditions.daysThreshold !== undefined) {
      return `剩余${conditions.daysThreshold}天预警`
    }
    
    return JSON.stringify(conditions)
  }
  
  return '暂无条件'
}

// 预警规则操作方法
const handleEditAlert = (record) => {
  Message.info(`编辑预警规则: ${record.name}`)
}

const handleViewAlert = (record) => {
  Message.info(`查看预警规则: ${record?.name || '未知规则'}`)
}

const handleDeleteAlert = (record) => {
  Message.success(`删除预警规则: ${record?.name || '未知规则'}`)
  fetchAlertTableData()
}

const handleStatusChangeAlert = (record) => {
  Message.success(`预警规则状态已${record?.status === 'active' ? '启用' : '禁用'}`)
}

// 频控规则分页变更
const onPageChange = (page) => {
  pagination.current = page
  fetchFrequencyTableData()
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  fetchFrequencyTableData()
}

// 预警规则分页变更
const onAlertPageChange = (page) => {
  alertPagination.current = page
  fetchAlertTableData()
}

const onAlertPageSizeChange = (pageSize) => {
  alertPagination.pageSize = pageSize
  fetchAlertTableData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchFrequencyTableData()
  fetchAlertTableData()
})
</script>

<style scoped>
.rule-management {
  padding: 20px;
}

.rule-tabs {
  margin-top: 20px;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

/* 桌面端优化 */
@media (min-width: 1200px) {
  .rule-management {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .search-form {
    padding: 24px;
  }
  
  .rule-tabs :deep(.arco-tabs-content) {
    padding-top: 16px;
  }
  
  .rule-tabs :deep(.arco-tabs-tab) {
    font-size: 16px;
    padding: 12px 24px;
  }
}

/* 确保表格在桌面端有足够的空间 */
.rule-management :deep(.arco-table) {
  min-height: 400px;
}

.rule-management :deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

.rule-management :deep(.arco-card-body) {
  padding: 20px;
}

@media (min-width: 1200px) {
  .rule-management :deep(.arco-card-body) {
    padding: 24px;
  }
  
  .rule-management :deep(.arco-table-td) {
    padding: 16px 12px;
  }
  
  .rule-management :deep(.arco-table-th) {
    padding: 16px 12px;
  }
}

/* 搜索表单桌面端优化 */
@media (min-width: 1200px) {
  .search-form :deep(.arco-form-item) {
    margin-bottom: 20px;
  }
  
  .search-form :deep(.arco-input) {
    height: 40px;
  }
  
  .search-form :deep(.arco-select) {
    height: 40px;
  }
  
  .search-form :deep(.arco-btn) {
    height: 40px;
    padding: 0 20px;
  }
}

/* 按钮组优化 */
.rule-management :deep(.arco-space-item) {
  margin-right: 12px;
}

@media (min-width: 1200px) {
  .rule-management :deep(.arco-space-item) {
    margin-right: 16px;
  }
}
</style>