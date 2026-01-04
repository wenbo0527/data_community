<template>
  <div class="regulatory-config-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>监管报表配置</h2>
      <p class="page-description">管理监管报表大类和指标分类的绑定关系</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <a-button type="primary" @click="showAddModal">
        <template #icon><icon-plus /></template>
        新增配置
      </a-button>
      <a-button @click="refreshData">
        <template #icon><icon-refresh /></template>
        刷新
      </a-button>
    </div>

    <!-- 配置列表 -->
    <div class="config-table">
      <a-table
        :columns="columns"
        :data-source="configList"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'regulatoryCategory'">
            <a-tag color="blue">
              {{ getRegulatoryLabel(record.regulatoryCategory) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'metricCategories'">
            <div class="metric-categories">
              <a-tag
                v-for="category in record.metricCategories"
                :key="category"
                color="green"
                class="category-tag"
              >
                {{ category }}
              </a-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'success' : 'default'">
              {{ record.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="editConfig(record)">
                编辑
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                :danger="record.status === 'active'"
                @click="toggleStatus(record)"
              >
                {{ record.status === 'active' ? '禁用' : '启用' }}
              </a-button>
              <a-popconfirm
                title="确定要删除这个配置吗？"
                @confirm="deleteConfig(record.id)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑配置模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      width="600px"
      @ok="handleSubmit"
      @cancel="resetForm"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="监管报表大类" name="regulatoryCategory">
          <a-select
            v-model:value="formData.regulatoryCategory"
            placeholder="请选择监管报表大类"
            :options="regulatoryCategoryOptions"
          />
        </a-form-item>

        <a-form-item label="报表名称" name="reportName">
          <a-input
            v-model:value="formData.reportName"
            placeholder="请输入报表名称"
          />
        </a-form-item>

        <a-form-item label="报表描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入报表描述"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="关联指标分类" name="metricCategories">
          <a-select
            v-model:value="formData.metricCategories"
            mode="multiple"
            placeholder="请选择关联的指标分类"
            :options="metricCategoryOptions"
          />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { RegulatoryCategory, RegulatoryLabels } from '@/types/metrics'

// 响应式数据
const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 配置列表数据
const configList = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列配置
const columns = [
  {
    title: '监管报表大类',
    dataIndex: 'regulatoryCategory',
    key: 'regulatoryCategory',
    width: 150
  },
  {
    title: '报表名称',
    dataIndex: 'reportName',
    key: 'reportName',
    width: 200
  },
  {
    title: '报表描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '关联指标分类',
    dataIndex: 'metricCategories',
    key: 'metricCategories',
    width: 250
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 表单数据
const formData = reactive({
  id: '',
  regulatoryCategory: '',
  reportName: '',
  description: '',
  metricCategories: [],
  status: 'active'
})

// 表单验证规则
const formRules = {
  regulatoryCategory: [
    { required: true, message: '请选择监管报表大类', trigger: 'change' }
  ],
  reportName: [
    { required: true, message: '请输入报表名称', trigger: 'blur' }
  ],
  metricCategories: [
    { required: true, message: '请选择关联的指标分类', trigger: 'change' }
  ]
}

// 监管报表大类选项
const regulatoryCategoryOptions = computed(() => {
  return Object.values(RegulatoryCategory).map(value => ({
    label: RegulatoryLabels[value],
    value
  }))
})

// 指标分类选项
const metricCategoryOptions = [
  { label: '风险指标', value: 'risk' },
  { label: '资本指标', value: 'capital' },
  { label: '流动性指标', value: 'liquidity' },
  { label: '盈利指标', value: 'profitability' },
  { label: '资产质量指标', value: 'asset_quality' },
  { label: '业务指标', value: 'business' },
  { label: '合规指标', value: 'compliance' }
]

// 获取监管报表大类标签
const getRegulatoryLabel = (category: string) => {
  return RegulatoryLabels[category as RegulatoryCategory] || category
}

// 显示新增模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetForm()
}

// 编辑配置
const editConfig = (record: any) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, record)
}

// 切换状态
const toggleStatus = async (record: any) => {
  try {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    // 这里应该调用API更新状态
    record.status = newStatus
    Message.success(`${newStatus === 'active' ? '启用' : '禁用'}成功`)
  } catch (error) {
    console.error('切换状态失败:', error)
    Message.error('操作失败')
  }
}

// 删除配置
const deleteConfig = async (id: string) => {
  try {
    // 这里应该调用API删除配置
    const index = configList.value.findIndex((item: any) => item.id === id)
    if (index > -1) {
      configList.value.splice(index, 1)
      pagination.total--
    }
    Message.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    Message.error('删除失败')
  }
}

// 表单提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      // 编辑模式
      const index = configList.value.findIndex((item: any) => item.id === formData.id)
      if (index > -1) {
        configList.value[index] = { ...formData, updateTime: new Date().toLocaleString() }
      }
      Message.success('更新成功')
    } else {
      // 新增模式
      const newConfig = {
        ...formData,
        id: Date.now().toString(),
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      configList.value.unshift(newConfig)
      pagination.total++
      Message.success('新增成功')
    }
    
    modalVisible.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    regulatoryCategory: '',
    reportName: '',
    description: '',
    metricCategories: [],
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 刷新数据
const refreshData = () => {
  loadConfigList()
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadConfigList()
}

// 加载配置列表
const loadConfigList = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = [
      {
        id: '1',
        regulatoryCategory: RegulatoryCategory.CAPITAL_ADEQUACY,
        reportName: '资本充足率报表',
        description: '银行资本充足率相关监管报表',
        metricCategories: ['capital', 'risk'],
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        regulatoryCategory: RegulatoryCategory.LIQUIDITY_RISK,
        reportName: '流动性风险报表',
        description: '银行流动性风险管理相关报表',
        metricCategories: ['liquidity', 'risk'],
        status: 'active',
        createTime: '2024-01-16 14:20:00',
        updateTime: '2024-01-16 14:20:00'
      },
      {
        id: '3',
        regulatoryCategory: RegulatoryCategory.CREDIT_RISK,
        reportName: '信用风险报表',
        description: '信用风险管理和监控相关报表',
        metricCategories: ['risk', 'asset_quality'],
        status: 'active',
        createTime: '2024-01-17 09:15:00',
        updateTime: '2024-01-17 09:15:00'
      }
    ]
    
    configList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    console.error('加载配置列表失败:', error)
    Message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadConfigList()
})
</script>

<style scoped>
.regulatory-config-page {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.config-table {
  background: #fff;
  border-radius: 6px;
}

.metric-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.category-tag {
  margin: 0;
}

:deep(.ant-table) {
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>
