<template>
  <div class="table-management">
    <div class="page-header">
      <h2>表管理</h2>
      <a-button type="primary" @click="goToRegisterForm">
        <template #icon>
          <icon-plus />
        </template>
        新建表
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索表名、描述"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedDatabase"
            placeholder="选择数据库"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="mysql">MySQL</a-option>
            <a-option value="postgresql">PostgreSQL</a-option>
            <a-option value="oracle">Oracle</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedStatus"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="active">活跃</a-option>
            <a-option value="inactive">非活跃</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data="tableData"
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
      
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="viewTable(record)">
            查看
          </a-button>
          <a-button type="text" size="small" @click="editTable(record)">
            编辑
          </a-button>
          <a-button type="text" size="small" status="danger" @click="deleteTable(record)">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 创建/编辑表单模态框 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="editingTable ? '编辑表' : '新建表'"
      width="800px"
      @ok="handleSubmit"
      @cancel="resetForm"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="表名" field="tableName">
              <a-input v-model="formData.tableName" placeholder="请输入表名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据库" field="database">
              <a-select v-model="formData.database" placeholder="选择数据库">
                <a-option value="mysql">MySQL</a-option>
                <a-option value="postgresql">PostgreSQL</a-option>
                <a-option value="oracle">Oracle</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="表描述" field="description">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入表描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="业务分类" field="category">
          <a-select v-model="formData.category" placeholder="选择业务分类">
            <a-option value="user">用户数据</a-option>
            <a-option value="transaction">交易数据</a-option>
            <a-option value="product">产品数据</a-option>
            <a-option value="marketing">营销数据</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="负责人" field="owner">
          <a-input v-model="formData.owner" placeholder="请输入负责人" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'
import { mockTables as tableManagementData } from '@/mock/data-map.ts'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const selectedDatabase = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const editingTable = ref(null)
const formRef = ref()

const router = useRouter()

// 表格列配置
const columns = [
  {
    title: '中文表名',
    dataIndex: 'tableName',
    width: 200
  },
  {
    title: '计算集群表名',
    dataIndex: 'computeClusterTable',
    width: 200
  },
  {
    title: '分析集群表名',
    dataIndex: 'analysisClusterTable',
    width: 200
  },
  {
    title: '业务域',
    dataIndex: 'category',
    width: 120
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    width: 120
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    width: 180
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 表格数据
const tableData = computed(() => {
  return tableManagementData.map((item, index) => ({
    id: index + 1,
    tableName: item.name,
    // 使用现有的name属性来模拟计算集群表名和分析集群表名，删除hive和doris前缀
    computeClusterTable: `${item.category}.${item.name}`,
    analysisClusterTable: `${item.category}.${item.name}`,
    category: item.domain,
    owner: item.owner,
    // 使用固定的日期或基于index的日期来模拟注册时间
    registerTime: `2024-01-${String(index + 1).padStart(2, '0')}`
  }))
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: computed(() => tableData.value.length),
  showTotal: true,
  showPageSize: true
})

// 表单数据
const formData = reactive({
  tableName: '',
  database: '',
  description: '',
  category: '',
  owner: ''
})

// 表单验证规则
const formRules = {
  tableName: [
    { required: true, message: '请输入表名' }
  ],
  database: [
    { required: true, message: '请选择数据库' }
  ],
  category: [
    { required: true, message: '请选择业务分类' }
  ],
  owner: [
    { required: true, message: '请输入负责人' }
  ]
}

// 方法
const handleSearch = () => {
  loading.value = true
  // 模拟搜索
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
    archived: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

const viewTable = (record: any) => {
  // 跳转到表详情页
  router.push(`/discovery/data-map/table/${encodeURIComponent(record.tableName)}`)
}

const editTable = (record: any) => {
  // 重定向到注册表单页面，并传递编辑模式和数据
  router.push({
    path: '/discovery/asset-management/table-management/register',
    query: { 
      mode: 'edit',
      id: record.tableName // 使用表名作为ID
    }
  })
}

const deleteTable = (record: any) => {
  // 删除确认
  console.log('删除表:', record)
  Message.success('删除成功')
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      // 提交表单
      console.log('提交表单:', formData)
      Message.success(editingTable.value ? '编辑成功' : '创建成功')
      showCreateModal.value = false
      resetForm()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  editingTable.value = null
  Object.assign(formData, {
    tableName: '',
    database: '',
    description: '',
    category: '',
    owner: ''
  })
  formRef.value?.resetFields()
}

// 跳转到注册表单页面
const goToRegisterForm = () => {
  router.push('/discovery/asset-management/table-management/register')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.table-management {
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
</style>
