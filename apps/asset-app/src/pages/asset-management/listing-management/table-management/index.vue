<template>
  <div class="table-management">
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <IconPlus />
        </template>
        {{ createButtonText }}
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4" v-if="assetType === 'Resource'">
          <a-select
            v-model="selectedDatabase"
            placeholder="数据源类型"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="mysql">MySQL</a-option>
            <a-option value="oracle">Oracle</a-option>
            <a-option value="hive">Hive</a-option>
          </a-select>
        </a-col>
        <a-col :span="4" v-if="assetType === 'Asset'">
          <a-select
            v-model="selectedDomain"
            placeholder="业务域"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="credit">信贷域</a-option>
            <a-option value="marketing">营销域</a-option>
            <a-option value="risk">风控域</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="selectedStatus"
            placeholder="状态"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="active">正常</a-option>
            <a-option value="inactive">异常</a-option>
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
        <a-tag :color="record.status === 'active' ? 'green' : 'red'">
          {{ record.status === 'active' ? '正常' : '异常' }}
        </a-tag>
      </template>
      
      <template #actions="{ record }">
        <a-space>
          <template v-if="assetType === 'Resource'">
            <a-button type="text" size="small" @click="syncMetadata(record)">同步元数据</a-button>
            <a-button type="text" size="small" @click="editTable(record)">配置</a-button>
          </template>
          <template v-else>
            <a-button type="text" size="small" @click="viewTable(record)">详情</a-button>
            <a-button type="text" size="small" @click="publishAsset(record)">上架</a-button>
            <a-button type="text" size="small" @click="viewLineage(record)">血缘</a-button>
          </template>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'

const props = defineProps({
  assetType: {
    type: String,
    default: 'Asset' // 'Resource' or 'Asset'
  }
})

const router = useRouter()
const loading = ref(false)
const searchKeyword = ref('')
const selectedDatabase = ref('')
const selectedDomain = ref('')
const selectedStatus = ref('')

const pageTitle = computed(() => props.assetType === 'Resource' ? '数据资源管理' : '数据资产管理')
const createButtonText = computed(() => props.assetType === 'Resource' ? '接入数据源' : '注册资产')
const searchPlaceholder = computed(() => props.assetType === 'Resource' ? '搜索源表名' : '搜索资产名称')

// 模拟数据
const resourceMockData = [
  { id: 1, name: 'loan_apply', source: '信贷核心系统', type: 'Oracle', status: 'active', updateTime: '2023-10-27 10:00:00' },
  { id: 2, name: 'user_info', source: 'CRM系统', type: 'MySQL', status: 'active', updateTime: '2023-10-26 15:30:00' },
  { id: 3, name: 'repayment_log', source: '支付网关', type: 'Kafka', status: 'active', updateTime: '2023-10-27 10:05:00' },
]

const assetMockData = [
  { id: 101, name: 'dwd_loan_apply_d', domain: '信贷域', layer: 'DWD', owner: '张三', status: 'active' },
  { id: 102, name: 'dws_user_credit_summary', domain: '风控域', layer: 'DWS', owner: '李四', status: 'active' },
  { id: 103, name: 'ads_marketing_conversion', domain: '营销域', layer: 'ADS', owner: '王五', status: 'inactive' },
]

const tableData = computed(() => {
  return props.assetType === 'Resource' ? resourceMockData : assetMockData
})

const columns = computed(() => {
  if (props.assetType === 'Resource') {
    return [
      { title: '源表名', dataIndex: 'name', width: 200 },
      { title: '来源系统', dataIndex: 'source', width: 150 },
      { title: '数据源类型', dataIndex: 'type', width: 120 },
      { title: '接入状态', dataIndex: 'status', slotName: 'status', width: 100 },
      { title: '最近更新时间', dataIndex: 'updateTime', width: 180 },
      { title: '操作', slotName: 'actions', width: 200, fixed: 'right' }
    ]
  } else {
    return [
      { title: '资产名称', dataIndex: 'name', width: 250 },
      { title: '业务域', dataIndex: 'domain', width: 120 },
      { title: '数仓分层', dataIndex: 'layer', width: 100 },
      { title: '负责人', dataIndex: 'owner', width: 100 },
      { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
      { title: '操作', slotName: 'actions', width: 220, fixed: 'right' }
    ]
  }
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: true,
  showPageSize: true
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => loading.value = false, 500)
}

const handlePageChange = (page: number) => {
  pagination.current = page
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.current = 1
}

const handleCreate = () => {
  if (props.assetType === 'Resource') {
    Message.info('打开数据源接入弹窗')
  } else {
    router.push('/management/asset-management/listing-management/table-management/register')
  }
}

const syncMetadata = (record: any) => {
  Message.success(`已触发表 ${record.name} 的元数据同步`)
}

const editTable = (record: any) => {
  Message.info(`配置数据源: ${record.name}`)
}

const viewTable = (record: any) => {
  Message.info(`查看资产详情: ${record.name}`)
}

const publishAsset = (record: any) => {
  Message.success(`资产 ${record.name} 上架成功`)
}

const viewLineage = (record: any) => {
  router.push(`/discovery/lineage?id=${record.id}`)
}

onMounted(() => {
  // Init
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
