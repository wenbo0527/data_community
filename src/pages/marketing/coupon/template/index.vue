<template>
  <div class="coupon-template-container">
    <div class="header-actions">
      <a-space>
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索券模版名称"
          style="width: 300px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="handleCreate">
          <template #icon>
            <icon-plus />
          </template>
          新建券模版
        </a-button>
      </a-space>
    </div>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #columns>
        <a-table-column title="模版ID" data-index="id" />
        <a-table-column title="模版名称" data-index="name">
          <template #cell="{ record }">
            <a-link @click="handleRowDblClick(record)" style="color: rgb(var(--primary-6))">
              {{ record.name }}
            </a-link>
          </template>
        </a-table-column>
        <a-table-column title="券类型" data-index="type">
          <template #cell="{ record }">
            <a-tag :color="record.type === 'interest_free' ? 'blue' : 'green'">
              {{ record.type === 'interest_free' ? '免息券' : '折扣券' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="贷款产品" data-index="products">
          <template #cell="{ record }">
            <a-space>
              <a-tag v-for="product in record.products" :key="product">
                {{ product === 'personal_loan' ? '个人贷款' : '企业贷款' }}
              </a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="使用渠道" data-index="useChannels">
          <template #cell="{ record }">
            <a-space>
              <a-tag v-for="channel in record.useChannels" :key="channel">
                {{ channel === 'app' ? 'APP' : channel === 'miniprogram' ? '小程序' : 'H5' }}
              </a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="有效期" data-index="validity">
          <template #cell="{ record }">
            {{ record.validityPeriod[0].split(' ')[0] }} - {{ record.validityPeriod[1].split(' ')[0] }}
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" />
        <a-table-column title="属主" data-index="creator" />
        <a-table-column title="状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="record.status === '生效中' ? 'green' : 'gray'">
              {{ record.status }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" :width="150">
          <template #cell="{ record }">
            <a-space>
              <a-button
                type="text"
                size="small"
                @click="handleStatusChange(record)"
                :status="record.status === '生效中' ? 'danger' : 'success'"
              >
                {{ record.status === '生效中' ? '下线' : '上线' }}
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
const searchKeyword = ref('')

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

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
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
  newTemplate.status = '已失效'
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
</script>

<style scoped>
.coupon-template-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>