<template>
  <div class="coupon-template-container">
    <a-card class="header-card">
      <div class="header-actions">
        <a-space>
          <a-select
            v-model="searchKeyword"
            placeholder="选择模版类型"
            style="width: 300px"
            @change="handleSearch"
            allow-clear
          >
            <a-option value="interest_free">免息券</a-option>
            <a-option value="discount">折扣券</a-option>
          </a-select>
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <icon-plus />
            </template>
            新建券模版
          </a-button>
        </a-space>
      </div>
    </a-card>

    <a-card class="table-card">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :stripe="true"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @filter-change="handleFilterChange"
      >
        <template #columns>
          <a-table-column title="模版名称" data-index="name" :width="200" :filterable="{ filterSearch: true }">
            <template #cell="{ record }">
              <a-space>
                <a-tag :color="record.type === 'interest_free' ? 'arcoblue' : 'green'">
                  {{ record.type === 'interest_free' ? '免息券' : '折扣券' }}
                </a-tag>
                <a-link @click="handleRowDblClick(record)">
                  {{ record.name }}
                </a-link>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="适用范围" data-index="scope" :width="160">
            <template #cell="{ record }">
              <div>
                <div class="scope-row">
                  <span class="scope-label">产品：</span>
                  <a-space size="mini">
                    <a-tag v-for="product in record.products" :key="product" size="small">
                      {{ product === 'personal_loan' ? '个人贷款' : '企业贷款' }}
                    </a-tag>
                  </a-space>
                </div>
                <div class="scope-row">
                  <span class="scope-label">渠道：</span>
                  <a-space size="mini">
                    <a-tag v-for="channel in record.useChannels" :key="channel" size="small">
                      {{ channel === 'app' ? 'APP' : channel === 'miniprogram' ? '小程序' : 'H5' }}
                    </a-tag>
                  </a-space>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="有效期" data-index="validityPeriod" :width="160">
            <template #cell="{ record }">
              <div>
                {{ record.validityPeriodType === 'unlimited' ? '长期有效' : `${record.validityPeriod[0].split(' ')[0]} 至 ${record.validityPeriod[1].split(' ')[0]}` }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="属主" data-index="creator" :width="100" :filterable="{ filterSearch: true }" />
          <a-table-column title="状态" data-index="status" :width="80" align="center" :filterable="{ filterMultiple: false }" :filters="[{ text: '生效中', value: '生效中' }, { text: '已失效', value: '已失效' }, { text: '草稿', value: '草稿' }]">
            <template #cell="{ record }">
              <a-tag :color="record.status === '生效中' ? 'green' : 'gray'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="100" align="center">
            <template #cell="{ record }">
              <a-space size="mini">
                <a-button
                  type="text"
                  size="small"
                  @click="handleStatusChange(record)"
                  :status="record.status === '生效中' ? 'danger' : 'success'"
                >
                  {{ record.status === '生效中' ? '下线' : '上线' }}
                </a-button>
                <a-divider direction="vertical" />
                <a-button
                  v-if="record.status === '草稿'"
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  @click="handleCopy(record)"
                >
                  复制
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 表格数据
const tableData = ref([])
const loading = ref(false)
// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

import { templateMockData } from '@/mock/coupon'

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // 使用mock数据
    tableData.value = templateMockData
    pagination.value.total = templateMockData.length
  } catch (error) {
    Message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 表格筛选变化
const handleFilterChange = (dataIndex, values) => {
  if (!values || values.length === 0) return
  
  const filteredData = templateMockData.filter(item => {
    if (dataIndex === 'status') {
      return values.includes(item[dataIndex])
    } else {
      return item[dataIndex].toLowerCase().includes(values[0].toLowerCase())
    }
  })
  
  tableData.value = filteredData
  pagination.value.total = filteredData.length
  pagination.value.current = 1
}

// 分页变化
const onPageChange = (current) => {
  pagination.value.current = current
  fetchData()
}

const onPageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  fetchData()
}

// 新建券模版
const handleCreate = () => {
  router.push('/marketing/coupon/create')
}

// 处理上线/下线
const handleStatusChange = (record) => {
  if (record.status === '生效中') {
    Modal.warning({
      title: '确认下线',
      content: `确定要下线模版「${record.name}」吗？`,
      onOk: () => {
        // TODO: 调用下线接口
        record.status = '已失效'
        Message.success('下线成功')
        fetchData()
      }
    })
  } else {
    // TODO: 调用上线接口
    record.status = '生效中'
    Message.success('上线成功')
    fetchData()
  }
}

// 复制券模版
const handleCopy = (record) => {
  const newTemplate = { ...record }
  newTemplate.id = Date.now().toString() // 临时ID，实际应由后端生成
  newTemplate.name = `${record.name}_副本`
  newTemplate.status = '草稿'
  newTemplate.createTime = new Date().toLocaleString()
  tableData.value.unshift(newTemplate)
  Message.success('复制成功')
}

// 删除券模版
// 处理点击查看详情
const handleRowDblClick = (record) => {
  router.push({
    path: '/marketing/coupon/template/detail',
    query: { 
      id: record.id,
      mode: 'view' // 添加mode参数标识为查看模式
    }
  })
}

const handleDelete = (record) => {
  Modal.warning({
    title: '确认删除',
    content: `确定要删除模版「${record.name}」吗？`,
    onOk: () => {
      // TODO: 调用删除接口
      Message.success('删除成功')
      fetchData()
    }
  })
}

onMounted(() => {
  fetchData()
})

const searchKeyword = ref('')

// 处理搜索
const handleSearch = (value) => {
  if (!value) {
    fetchData()
    return
  }
  
  const filteredData = templateMockData.filter(item => 
    item.type === value
  )
  
  tableData.value = filteredData
  pagination.value.total = filteredData.length
  pagination.value.current = 1
}
</script>

<style scoped>
.coupon-template-container {
  padding: 16px;
}

.header-card {
  margin-bottom: 16px;
}

.table-card {
  background-color: var(--color-bg-2);
}

:deep(.arco-table-td) {
  padding: 12px 16px;
}

:deep(.arco-table-cell) {
  white-space: normal;
  word-break: break-word;
}

:deep(.arco-table-th) {
  padding: 12px 16px;
  background-color: var(--color-neutral-2) !important;
}

:deep(.arco-link) {
  color: rgb(var(--primary-6));
}

:deep(.arco-space-mini) {
  gap: 4px !important;
}

.scope-row, .time-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  &:last-child {
    margin-bottom: 0;
  }
}

.scope-label, .time-label {
  color: var(--color-text-3);
  font-size: 13px;
  margin-right: 8px;
  white-space: nowrap;
}

.time-info {
  max-width: 160px;
  overflow: hidden;
}

.time-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:last-child {
    margin-bottom: 0;
  }
}

.time-label {
  color: var(--color-text-3);
  font-size: 13px;
  margin-right: 8px;
  white-space: nowrap;
}
</style>