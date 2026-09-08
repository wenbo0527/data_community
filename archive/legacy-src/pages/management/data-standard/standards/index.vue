<template>
  <div class="standards-page">
    <!-- P1.2 接入: 标准统计卡 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-statistic title="标准总数" :value="totalStandards" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已发布" :value="publishedStandards" :value-style="{ color: '#00b42a' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="草稿" :value="draftStandards" :value-style="{ color: '#ff7d00' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="关联字段" :value="linkedFieldCount" :value-style="{ color: '#165dff' }" />
      </a-col>
    </a-row>

    <a-card class="general-card" title="数据标准管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              新建标准
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
            placeholder="搜索标准名称/编号/英文简称"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="标准编号" data-index="standardNo" width="120">
            <template #cell="{ record }">
              <a-link @click="handleView(record)">{{ record.standardNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="版本" data-index="version" width="80">
            <template #cell="{ record }">
              v{{ record.version || '1.0' }}
            </template>
          </a-table-column>
          <a-table-column title="中文名称" data-index="chineseName" width="150" />
          <a-table-column title="英文简称" data-index="englishAbbr" width="150" />
          <a-table-column title="主题" data-index="subject" width="100" />
          <a-table-column title="域" data-index="domain" width="120" />
          <a-table-column title="数据类型" data-index="dataType" width="120">
            <template #cell="{ record }">
              {{ record.dataType }}
              <span v-if="record.length">({{ record.length }}<span v-if="record.precision">,{{ record.precision }}</span>)</span>
            </template>
          </a-table-column>
          <a-table-column title="归口管理部门" data-index="department" width="150" />
          <a-table-column title="被引用字段数" width="130">
            <template #cell="{ record }">
              <a-tooltip
                v-if="getFieldLinkCount(record.standardNo) > 0"
                :content="`查看引用此标准的字段列表`"
              >
                <a-tag color="arcoblue" size="small">
                  {{ getFieldLinkCount(record.standardNo) }} 个字段
                </a-tag>
              </a-tooltip>
              <a-tag v-else size="small" color="gray">未引用</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'published' ? 'green' : 'orange'">
                {{ record.status === 'published' ? '已发布' : '草稿' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" width="180" />
          <a-table-column title="操作" width="200" fixed="right" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-popconfirm content="确定要删除该标准吗？" @ok="handleDelete(record)">
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
      title="批量导入数据标准"
      type="standards"
      description="请下载数据标准模板，填写完成后上传。系统将根据标准编号自动识别更新或新增。"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import DataStandardImportModal from '@/components/modals/DataStandardImportModal.vue'
import { StandardStore } from '@/mock/shared/standard-store'
import { FieldLinkStore } from '@/mock/shared/lineage'

// === 标准统计(P1 接入) ===
const totalStandards = computed(() => StandardStore.list().length)
const publishedStandards = computed(() =>
  StandardStore.list().filter(s => s.status === 'published').length
)
const draftStandards = computed(() =>
  StandardStore.list().filter(s => s.status !== 'published').length
)
const linkedFieldCount = computed(() => {
  const codes = new Set(StandardStore.list().map(s => s.standardNo || s.code))
  return FieldLinkStore.list().filter(l => codes.has(l.standardCode)).length
})

const router = useRouter()

// === 打通层: 标准被引用字段数 ===
const getFieldLinkCount = (standardNo) => {
  return FieldLinkStore.byStandard(standardNo).length
}
const searchKey = ref('')
const importVisible = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50
})

// Mock Data from StandardStore
const tableData = ref([])

onMounted(() => {
  tableData.value = StandardStore.getStandards()
  pagination.total = tableData.value.length
})

const handleSearch = () => {
  const allStandards = StandardStore.getStandards()
  if (!searchKey.value) {
    tableData.value = allStandards
  } else {
    const key = searchKey.value.toLowerCase()
    tableData.value = allStandards.filter(item => 
      item.standardNo.toLowerCase().includes(key) ||
      item.chineseName.includes(key) ||
      item.englishAbbr.toLowerCase().includes(key)
    )
  }
}

const handlePageChange = (page) => {
  pagination.current = page
  Message.info(`切换到第 ${page} 页`)
}

const handleCreate = () => {
  router.push({ name: 'StandardCreate' })
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportSuccess = () => {
  // 重新加载数据
  Message.success('列表已刷新')
}

const handleView = (record) => {
  router.push({
    name: 'StandardDetail',
    params: { id: record.id }
  })
}

const handleEdit = (record) => {
  router.push({
    name: 'StandardEdit',
    params: { id: record.id }
  })
}

const handleDelete = (record) => {
  Message.success(`已删除：${record.chineseName}`)
}
</script>

<style scoped>
.standards-page {
  padding: 20px;
}
</style>
