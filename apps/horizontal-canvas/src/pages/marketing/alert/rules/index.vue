<template>
  <div class="alert-rules-container">
    <div class="header">
      <h1>通知规则管理</h1>
      <a-button type="primary" @click="handleCreateRule">
        <template #icon>
          <icon-plus />
        </template>
        新建规则
      </a-button>
    </div>

    <div class="search-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入规则名称"
            allow-clear
            @change="handleSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.type"
            placeholder="选择监控类型"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="inventory">库存监控</a-option>
            <a-option value="expiry">过期监控</a-option>
            <a-option value="failure">失败率监控</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="选择状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="active">启用</a-option>
            <a-option value="inactive">禁用</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model="searchForm.dateRange"
            style="width: 100%"
            @change="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-space>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <div class="table-container">
      <a-table
        :data="rules"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <template #columns>
          <a-table-column type="selection" width="50" />
          <a-table-column title="规则名称" data-index="name" width="200">
            <template #cell="{ record }">
              <a-link @click="handleEditRule(record.id)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="监控类型" data-index="type" width="120">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeLabel(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预警条件" data-index="conditions" width="200">
            <template #cell="{ record }">
              <div class="condition-text">
                {{ formatCondition(record.conditions) }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="通知渠道" data-index="channels" width="150">
            <template #cell="{ record }">
              <div class="channels">
                <a-tag
                  v-for="channel in record.notificationConfig.channels"
                  :key="channel.type"
                  size="small"
                  :color="channel.enabled ? 'green' : 'gray'"
                >
                  {{ getChannelLabel(channel.type) }}
                </a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.status === 'active'"
                @change="(value) => handleStatusChange(record.id, value)"
              >
                <template #checked>启用</template>
                <template #unchecked>禁用</template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" width="180">
            <template #cell="{ record }">
              {{ formatDate(record.createdAt) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditRule(record.id)">
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="handleCopyRule(record)">
                  复制
                </a-button>
                <a-popconfirm
                  content="确定要删除这条规则吗？"
                  @ok="handleDeleteRule(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <div class="batch-operations" v-if="selectedRows.length > 0">
      <a-space>
        <a-button @click="handleBatchStatusChange(true)">批量启用</a-button>
        <a-button @click="handleBatchStatusChange(false)">批量禁用</a-button>
        <a-popconfirm
          content="确定要删除选中的规则吗？"
          @ok="handleBatchDelete"
        >
          <a-button status="danger">批量删除</a-button>
        </a-popconfirm>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: '',
  dateRange: []
})

// 表格数据
const rules = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 模拟数据
const mockRules = [
  {
    id: '1',
    name: '库存预警规则-优惠券A',
    type: 'inventory',
    conditions: {
      type: 'inventory',
      threshold: 100,
      thresholdType: 'absolute',
      checkInterval: '5m'
    },
    notificationConfig: {
      channels: [
        { type: 'wechat', enabled: true },
        { type: 'sms', enabled: false }
      ]
    },
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'admin'
  },
  {
    id: '2',
    name: '过期提醒规则-春节券包',
    type: 'expiry',
    conditions: {
      type: 'expiry',
      threshold: 7,
      thresholdType: 'absolute',
      timeWindow: '1d'
    },
    notificationConfig: {
      channels: [
        { type: 'wechat', enabled: true },
        { type: 'email', enabled: true }
      ]
    },
    status: 'active',
    createdAt: '2024-01-14T15:20:00Z',
    createdBy: 'operator1'
  },
  {
    id: '3',
    name: '发放失败监控',
    type: 'failure',
    conditions: {
      type: 'failure',
      threshold: 5,
      thresholdType: 'percentage',
      checkInterval: '10m'
    },
    notificationConfig: {
      channels: [
        { type: 'wechat', enabled: true }
      ]
    },
    status: 'inactive',
    createdAt: '2024-01-13T09:10:00Z',
    createdBy: 'admin'
  }
]

// 获取规则列表
const fetchRules = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 过滤逻辑
    let filteredRules = mockRules
    if (searchForm.name) {
      filteredRules = filteredRules.filter(rule => 
        rule.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    if (searchForm.type) {
      filteredRules = filteredRules.filter(rule => rule.type === searchForm.type)
    }
    if (searchForm.status) {
      filteredRules = filteredRules.filter(rule => rule.status === searchForm.status)
    }
    
    rules.value = filteredRules
    pagination.total = filteredRules.length
  } catch (error) {
    Message.error('获取规则列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchRules()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 创建规则
const handleCreateRule = () => {
  router.push('/marketing/alert/rules/create')
}

// 编辑规则
const handleEditRule = (id) => {
  router.push(`/marketing/alert/rules/edit/${id}`)
}

// 复制规则
const handleCopyRule = (rule) => {
  // 跳转到创建页面，带上复制的数据
  router.push({
    path: '/marketing/alert/rules/create',
    query: { copyFrom: rule.id }
  })
}

// 删除规则
const handleDeleteRule = async (id) => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    Message.success('删除成功')
    fetchRules()
  } catch (error) {
    Message.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 状态切换
const handleStatusChange = async (id, enabled) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 200))
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      rule.status = enabled ? 'active' : 'inactive'
    }
    Message.success(enabled ? '已启用' : '已禁用')
  } catch (error) {
    Message.error('操作失败')
  }
}

// 批量操作
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleBatchStatusChange = async (enabled) => {
  try {
    loading.value = true
    // 模拟批量API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    selectedRows.value.forEach(row => {
      row.status = enabled ? 'active' : 'inactive'
    })
    Message.success(`已${enabled ? '启用' : '禁用'} ${selectedRows.value.length} 条规则`)
  } catch (error) {
    Message.error('操作失败')
  } finally {
    loading.value = false
  }
}

const handleBatchDelete = async () => {
  try {
    loading.value = true
    // 模拟批量删除API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    Message.success(`已删除 ${selectedRows.value.length} 条规则`)
    fetchRules()
  } catch (error) {
    Message.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 工具函数
const getTypeColor = (type) => {
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red'
  }
  return colors[type] || 'gray'
}

const getTypeLabel = (type) => {
  const labels = {
    inventory: '库存监控',
    expiry: '过期监控',
    failure: '失败率监控'
  }
  return labels[type] || type
}

const getChannelLabel = (channel) => {
  const labels = {
    wechat: '企业微信',
    sms: '短信',
    email: '邮件'
  }
  return labels[channel] || channel
}

const formatCondition = (conditions) => {
  const { type, threshold, thresholdType, checkInterval } = conditions
  let text = ''
  
  switch (type) {
    case 'inventory':
      text = `库存低于 ${threshold}${thresholdType === 'percentage' ? '%' : '个'}`
      break
    case 'expiry':
      text = `提前 ${threshold} 天过期提醒`
      break
    case 'failure':
      text = `失败率超过 ${threshold}%`
      break
    default:
      text = '自定义条件'
  }
  
  if (checkInterval) {
    text += `，每${checkInterval.replace('m', '分钟').replace('h', '小时').replace('d', '天')}检查`
  }
  
  return text
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchRules()
})
</script>

<style scoped lang="less">
.alert-rules-container {
  padding: 24px;
  background: #fff;
  min-height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.search-bar {
  margin-bottom: 24px;
  padding: 16px;
  background: #f2f3f5;
  border-radius: 6px;
}

.table-container {
  margin-bottom: 16px;
}

.condition-text {
  color: #86909c;
  font-size: 12px;
}

.channels {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.batch-operations {
  padding: 12px 0;
  border-top: 1px solid #e5e6eb;
}
</style>