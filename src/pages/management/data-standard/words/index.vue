<template>
  <div class="words-page">
    <a-card class="general-card" title="标准单词管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              新建标准单词
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
            placeholder="搜索中文/英文名称/缩写"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="单词中文名称" data-index="chineseName" width="150" />
          <a-table-column title="单词英文名称" data-index="englishName" width="150" />
          <a-table-column title="单词英文缩写" data-index="abbreviation" width="150" />
          <a-table-column title="词性/分类" data-index="type" width="120">
             <template #cell="{ record }">
               <a-tag v-if="record.type === 'class'" color="purple">分类词</a-tag>
               <a-tag v-else color="blue">普通词</a-tag>
             </template>
          </a-table-column>
          <a-table-column title="同义词" data-index="synonyms" width="200">
             <template #cell="{ record }">
               {{ record.synonyms || '-' }}
             </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" width="180" />
          <a-table-column title="操作" width="200" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm content="确定要删除该标准单词吗？" @ok="handleDelete(record)">
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
      title="批量导入标准单词"
      type="words"
      description="请下载标准单词模板，填写完成后上传。系统将自动解析中英文名称及其缩写命名规范。"
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
  total: 40
})

const tableData = ref([
  {
    id: 1,
    chineseName: '客户',
    englishName: 'Customer',
    abbreviation: 'CUST',
    type: 'noun',
    synonyms: '用户, 消费者',
    updateTime: '2023-07-10 10:00:00'
  },
  {
    id: 2,
    chineseName: '账户',
    englishName: 'Account',
    abbreviation: 'ACCT',
    type: 'noun',
    synonyms: '户头',
    updateTime: '2023-07-11 11:00:00'
  },
  {
    id: 3,
    chineseName: '代码',
    englishName: 'Code',
    abbreviation: 'CD',
    type: 'class',
    synonyms: '编号',
    updateTime: '2023-07-12 14:00:00'
  },
  {
    id: 4,
    chineseName: '日期',
    englishName: 'Date',
    abbreviation: 'DT',
    type: 'class',
    synonyms: '时间',
    updateTime: '2023-07-13 16:00:00'
  }
])

const handleSearch = () => {
  Message.info(`搜索：${searchKey.value}`)
}

const handlePageChange = (page) => {
  pagination.current = page
}

const handleCreate = () => {
  Message.info('点击新建标准单词')
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportSuccess = () => {
  Message.success('标准单词列表已更新')
}

const handleEdit = (record) => {
  Message.info(`编辑：${record.chineseName}`)
}

const handleDelete = (record) => {
  Message.success(`已删除：${record.chineseName}`)
}
</script>

<style scoped>
.words-page {
  padding: 20px;
}
</style>
