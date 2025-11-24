<template>
  <div class="table-management">
    <a-card :bordered="false">
      <template #title>
        <div class="table-header">
          <span>标签表管理</span>
          <a-space>
            <a-input-search
              v-model="searchText"
              placeholder="搜索表名称"
              style="width: 250px"
              @search="handleSearch"
            />
            <a-button type="primary" @click="handleTableRegistration">
              <template #icon><icon-plus /></template>
              注册标签表
            </a-button>
          </a-space>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #mappingStatus="{ record }">
          <a-space>
            <icon-check-circle v-if="record.mappingStatus === 'configured'" style="color: #00b42a" />
            <icon-close-circle v-else-if="record.mappingStatus === 'not_configured'" style="color: #f53f3f" />
            <icon-minus-circle v-else style="color: #c9cdd4" />
            <span>{{ getMappingStatusText(record.mappingStatus) }}</span>
          </a-space>
        </template>

        <template #identityType="{ record }">
          <a-tag v-if="record.identityType" :color="getIdentityTypeColor(record.identityType)">
            {{ getIdentityTypeText(record.identityType) }}
          </a-tag>
          <span v-else>-</span>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleViewDetails(record)">
              详情
            </a-button>
            <a-button 
              v-if="record.mappingStatus !== 'configured'" 
              type="text" 
              size="small"
              @click="handleConfigureMapping(record)"
            >
              配置映射
            </a-button>
            <a-button v-else type="text" size="small" @click="handleEditMapping(record)">
              编辑映射
            </a-button>
            <a-popconfirm
              content="确定要删除这个标签表吗？"
              @ok="handleDelete(record)"
            >
              <a-button type="text" status="danger" size="small">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 表详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      :title="`表详情 - ${currentTable?.tableName}`"
      :width="600"
      :footer="false"
    >
      <table-detail
        v-if="currentTable"
        :table-data="currentTable"
        @edit-mapping="handleEditMapping"
      />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconCheckCircle, IconCloseCircle, IconMinusCircle } from '@arco-design/web-vue/es/icon'
import TableDetail from './components/table-detail.vue'

const router = useRouter()

// 搜索文本
const searchText = ref('')

// 加载状态
const loading = ref(false)

// 详情抽屉
const detailVisible = ref(false)
const currentTable = ref(null)

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 表格列配置
const columns = [
  {
    title: '表名称',
    dataIndex: 'tableName',
    width: 200,
    ellipsis: true
  },
  {
    title: '表描述',
    dataIndex: 'tableDesc',
    ellipsis: true
  },
  {
    title: '数据源',
    dataIndex: 'dataSource',
    width: 120
  },
  {
    title: '记录数',
    dataIndex: 'recordCount',
    width: 100,
    align: 'right',
    sortable: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    slotName: 'status'
  },
  {
    title: 'ID映射状态',
    dataIndex: 'mappingStatus',
    width: 130,
    slotName: 'mappingStatus'
  },
  {
    title: '标识类型',
    dataIndex: 'identityType',
    width: 100,
    slotName: 'identityType'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    sortable: true
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 160,
    sortable: true
  },
  {
    title: '操作',
    dataIndex: 'actions',
    width: 200,
    slotName: 'actions',
    fixed: 'right'
  }
]

// 模拟数据
const mockTableData = ref([
  {
    id: 1,
    tableName: 'user_profile_table',
    tableDesc: '用户画像标签表，包含用户基础属性和行为标签',
    dataSource: 'Hive',
    recordCount: 1250000,
    status: 'active',
    mappingStatus: 'configured',
    identityType: 'person',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:25:00',
    primaryKey: 'user_id',
    mappingRule: {
      algorithm: 'exact_match',
      fields: ['user_id', 'mobile_md5'],
      confidence: 0.95
    }
  },
  {
    id: 2,
    tableName: 'device_behavior_table',
    tableDesc: '设备行为标签表，记录设备使用行为特征',
    dataSource: 'MySQL',
    recordCount: 890000,
    status: 'active',
    mappingStatus: 'not_configured',
    identityType: null,
    createTime: '2024-01-18 09:15:00',
    updateTime: '2024-01-18 09:15:00',
    primaryKey: 'device_id'
  },
  {
    id: 3,
    tableName: 'enterprise_customer_table',
    tableDesc: '企业客户标签表，包含企业客户的基本信息和业务标签',
    dataSource: 'Oracle',
    recordCount: 45000,
    status: 'active',
    mappingStatus: 'configured',
    identityType: 'enterprise',
    createTime: '2024-01-12 16:45:00',
    updateTime: '2024-01-19 11:30:00',
    primaryKey: 'enterprise_id',
    mappingRule: {
      algorithm: 'exact_match',
      fields: ['enterprise_id', 'business_license_no'],
      confidence: 0.98
    }
  },
  {
    id: 4,
    tableName: 'family_account_table',
    tableDesc: '家庭账户标签表，记录家庭成员关系和账户信息',
    dataSource: 'PostgreSQL',
    recordCount: 230000,
    status: 'inactive',
    mappingStatus: 'pending',
    identityType: null,
    createTime: '2024-01-10 14:20:00',
    updateTime: '2024-01-16 17:10:00',
    primaryKey: 'family_id'
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchText.value) return mockTableData.value
  
  return mockTableData.value.filter(item => 
    item.tableName.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.tableDesc.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 表格数据
const tableData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredData.value.slice(start, end)
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    active: '活跃',
    inactive: '停用',
    pending: '待处理'
  }
  return textMap[status] || status
}

const getMappingStatusText = (status) => {
  const textMap = {
    configured: '已配置',
    not_configured: '未配置',
    pending: '待配置'
  }
  return textMap[status] || '未配置'
}

const getIdentityTypeColor = (type) => {
  const colorMap = {
    person: 'blue',
    device: 'green',
    enterprise: 'orange',
    family: 'purple'
  }
  return colorMap[type] || 'gray'
}

const getIdentityTypeText = (type) => {
  const textMap = {
    person: '个人',
    device: '设备',
    enterprise: '企业',
    family: '家庭'
  }
  return textMap[type] || type
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
}

// 表注册
const handleTableRegistration = () => {
  router.push('/exploration/customer-center/tag-system/table-registration')
}

// 查看详情
const handleViewDetails = (record) => {
  currentTable.value = record
  detailVisible.value = true
}

// 配置映射
const handleConfigureMapping = (record) => {
  router.push({
    path: '/exploration/customer-center/tag-system/table-registration',
    query: { tableId: record.id, mode: 'mapping' }
  })
}

// 编辑映射
const handleEditMapping = (record) => {
  router.push({
    path: '/exploration/customer-center/tag-system/table-registration',
    query: { tableId: record.id, mode: 'edit' }
  })
}

// 删除处理
const handleDelete = (record) => {
  Message.success(`表 "${record.tableName}" 删除成功`)
  // 这里应该调用实际的删除API
}
</script>

<style scoped lang="less">
.table-management {
  padding: 16px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>