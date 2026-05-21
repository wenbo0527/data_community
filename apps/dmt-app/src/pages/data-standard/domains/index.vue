<template>
  <div class="domains-page">
    <a-card class="general-card" title="数据域管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              新建数据域
            </a-button>
            <a-button @click="handleImport">
              <template #icon><icon-import /></template>
              批量导入
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-input-search
            v-model="searchKey"
            placeholder="搜索域名称"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="域名称/编号" data-index="name" width="150">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="业务数据类型" data-index="businessDataType" width="150" />
          <a-table-column title="逻辑数据类型" data-index="logicalDataType" width="120" />
          <a-table-column title="长度" data-index="length" width="80" />
          <a-table-column title="精度" data-index="precision" width="80" />
          <a-table-column title="是否代码" data-index="isCode" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.isCode ? 'blue' : 'gray'">
                {{ record.isCode ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联标准代码" data-index="standardCodeNo" width="150">
            <template #cell="{ record }">
              {{ record.standardCodeNo || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" width="180" />
          <a-table-column title="操作" width="200" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm content="确定要删除该数据域吗？" @ok="handleDelete(record)">
                  <a-button type="text" status="danger" size="small">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 批量导入弹窗 -->
    <DataStandardImportModal
      v-model:visible="importVisible"
      title="批量导入数据域"
      type="domains"
      description="请下载数据域模板，填写完成后上传。系统将自动解析域名称及其对应的技术属性。"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import DataStandardImportModal from '@/components/modals/DataStandardImportModal.vue'

const router = useRouter()
const searchKey = ref('')
const importVisible = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 20
})

const tableData = ref([
  {
    id: 1,
    name: 'ID_20',
    businessDataType: '标识符',
    logicalDataType: 'VARCHAR',
    length: 20,
    precision: 0,
    isCode: false,
    standardCodeNo: '',
    updateTime: '2023-09-01 10:00:00'
  },
  {
    id: 2,
    name: 'AMT_18_2',
    businessDataType: '金额',
    logicalDataType: 'DECIMAL',
    length: 18,
    precision: 2,
    isCode: false,
    standardCodeNo: '',
    updateTime: '2023-09-02 11:30:00'
  },
  {
    id: 3,
    name: 'CODE_GENDER',
    businessDataType: '性别',
    logicalDataType: 'CHAR',
    length: 1,
    precision: 0,
    isCode: true,
    standardCodeNo: 'STD_GENDER',
    updateTime: '2023-09-05 15:20:00'
  }
])

const handleSearch = () => {
  Message.info(`搜索：${searchKey.value}`)
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleCreate = () => {
  router.push({ name: 'DataDomainCreate' })
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportSuccess = () => {
  Message.success('数据域列表已更新')
}

const handleView = (record) => {
  router.push({
    name: 'DataDomainDetail',
    params: { id: record.id }
  })
}

const handleEdit = (record) => {
  router.push({
    name: 'DataDomainEdit',
    params: { id: record.id }
  })
}

const handleDelete = (record) => {
  Message.success(`已删除：${record.name}`)
}
</script>

<style scoped>
.domains-page {
  padding: 20px;
}
</style>
