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
        <template #tableName="{ record }">
          <a-link @click="handleViewDetails(record)">{{ record.tableName }}</a-link>
        </template>

        

        <template #identityType="{ record }">
          <a-tag v-if="record.identityType" :color="getIdentityTypeColor(record.identityType)">
            {{ getIdentityTypeText(record.identityType) }}
          </a-tag>
          <span v-else>-</span>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-popconfirm v-if="record.status==='online'" content="确定下线该表？" @ok="handleToggleStatus(record)">
              <a-button type="text" size="small">下线</a-button>
            </a-popconfirm>
            <a-button v-if="record.status==='offline'" type="text" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm v-if="record.status==='offline'" content="确定上线该表？" @ok="handleToggleStatus(record)">
              <a-button type="text" size="small">上线</a-button>
            </a-popconfirm>
            <a-popconfirm v-if="record.status==='offline'" content="确定要删除这个标签表吗？" @ok="handleDelete(record)">
              <a-button type="text" status="danger" size="small">删除</a-button>
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
  { title: '表名称', dataIndex: 'tableName', width: 200, ellipsis: true, slotName: 'tableName' },
  { title: '表描述', dataIndex: 'tableDesc', ellipsis: true },
  { title: '标识字段', dataIndex: 'primaryKey', width: 120 },
  { title: '标识类型', dataIndex: 'identityType', width: 100, slotName: 'identityType' },
  { title: '表状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '更新时间', dataIndex: 'updateTime', width: 160, sortable: true },
  { title: '操作', dataIndex: 'actions', width: 220, slotName: 'actions', fixed: 'right' }
]

// 模拟数据
const mockTableData = ref([
  {
    id: 1,
    tableName: 'user_profile_table',
    tableDesc: '用户画像标签表，包含用户基础属性和行为标签',
    dataSource: 'Hive',
    status: 'online',
    mappingStatus: 'configured',
    identityType: 'mobile',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:25:00',
    primaryKey: 'mobile',
    mappingRule: {
      algorithm: 'exact',
      fields: ['mobile'],
      confidence: 0.95
    }
  },
  {
    id: 4,
    tableName: 'tag_user_daily',
    tableDesc: 'Doris 日颗粒标签明细',
    dataSource: 'Doris',
    status: 'offline',
    mappingStatus: 'partial',
    identityType: 'id_card',
    createTime: '2024-01-10 14:20:00',
    updateTime: '2024-01-16 17:10:00',
    primaryKey: 'id_card'
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  const dsOk = (item) => ['Doris', 'Hive'].includes(item.dataSource)
  const base = mockTableData.value.filter(dsOk)
  if (!searchText.value) return base
  return base.filter(item =>
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
    online: 'green',
    offline: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    online: '上线',
    offline: '下线'
  }
  return textMap[status] || status
}

 

const getIdentityTypeColor = (type) => {
  const colorMap = {
    unified_customer_id: 'blue',
    id_card: 'orange',
    mobile: 'green'
  }
  return colorMap[type] || 'gray'
}

const getIdentityTypeText = (type) => {
  const textMap = {
    unified_customer_id: '统一客户ID',
    id_card: '身份证',
    mobile: '手机号'
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

const handleEdit = (record) => {
  router.push({
    path: '/exploration/customer-center/tag-system/table-registration',
    query: { tableId: record.id, mode: 'edit' }
  })
}

// 删除处理
const handleDelete = (record) => {
  Message.success(`表 "${record.tableName}" 删除成功`)
  // 这里应该调用实际的删除API
  const idx = mockTableData.value.findIndex(x => x.id === record.id)
  if (idx >= 0) {
    mockTableData.value.splice(idx, 1)
    pagination.total = mockTableData.value.length
  }
}

// 上线/下线
const handleToggleStatus = (record) => {
  record.status = record.status === 'online' ? 'offline' : 'online'
  Message.success(`已${record.status === 'online' ? '上线' : '下线'} "${record.tableName}"`)
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
