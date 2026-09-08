<template>
  <div class="codes-page">
    <a-card class="general-card" title="标准代码管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              新建标准代码
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
            placeholder="搜索代码名称/编号"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="标准代码编号" data-index="standardCode" width="150" />
          <a-table-column title="代码名称" data-index="name" width="150" />
          <a-table-column title="主题" data-index="subject" width="120" />
          <a-table-column title="来源" data-index="source" width="120">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.source }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="码值示例" data-index="examples" width="200">
             <template #cell="{ record }">
               <a-typography-text type="secondary" ellipsis>
                 {{ record.examples }}
               </a-typography-text>
             </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" width="180" />
          <a-table-column title="操作" width="200" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm content="确定要删除该标准代码吗？" @ok="handleDelete(record)">
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
      title="批量导入标准代码"
      type="codes"
      description="请下载标准代码模板，填写完成后上传。系统将自动解析代码编号及其对应的码值枚举。"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import DataStandardImportModal from '@/components/modals/DataStandardImportModal.vue'

const searchKey = ref('')
const importVisible = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 30
})

const tableData = ref([
  {
    id: 1,
    standardCode: 'STD_GENDER',
    name: '性别代码',
    subject: '公共',
    source: '国标',
    examples: '0-未知, 1-男, 2-女, 9-未说明',
    updateTime: '2023-08-20 09:00:00'
  },
  {
    id: 2,
    standardCode: 'STD_ID_TYPE',
    name: '证件类型',
    subject: '公共',
    source: '行标',
    examples: '101-身份证, 102-护照, 103-军官证...',
    updateTime: '2023-08-22 14:00:00'
  },
  {
    id: 3,
    standardCode: 'STD_CURRENCY',
    name: '币种代码',
    subject: '财务',
    source: 'ISO',
    examples: 'CNY-人民币, USD-美元, EUR-欧元...',
    updateTime: '2023-08-25 16:30:00'
  }
])

const handleSearch = () => {
  Message.info(`搜索：${searchKey.value}`)
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleCreate = () => {
  Message.info('点击新建标准代码')
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportSuccess = () => {
  Message.success('标准代码列表已更新')
}

const handleView = (record) => {
  Message.info(`查看详情：${record.name}`)
}

const handleEdit = (record) => {
  Message.info(`编辑：${record.name}`)
}

const handleDelete = (record) => {
  Message.success(`已删除：${record.name}`)
}
</script>

<style scoped>
.codes-page {
  padding: 20px;
}
</style>
