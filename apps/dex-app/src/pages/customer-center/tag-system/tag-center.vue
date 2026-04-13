<template>
  <div class="tag-center">
    <!-- 页面头部 -->
    <TagCenterHeader 
      @quick-register="openQuickRegister"
      @form-register="openFormRegister"
      @batch-import="openBatchImport"
      @refresh="handleRefresh"
    />

    <!-- 统计卡片 -->
    <TagStatsCards :stats="stats" />

    <!-- 筛选区域 -->
    <TagFilterSection 
      :filter-form="filterForm"
      @update:filterForm="onFilterFormUpdate"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <TagTableList 
      :data="tagTables"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @edit="handleEdit"
      @archive="handleArchive"
      @delete="handleDelete"
    />

    <!-- 快速注册抽屉 -->
    <QuickRegisterDrawer 
      v-model:visible="quickRegisterVisible"
      @success="handleRegisterSuccess"
    />

    <!-- 表单注册抽屉 -->
    <FormRegisterDrawer 
      v-model:visible="formRegisterVisible"
      @success="handleRegisterSuccess"
    />

    <!-- 批量导入抽屉 -->
    <BatchImportDrawer 
      v-model:visible="batchImportVisible"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useTagCenterStore } from '@/stores/tagCenter'
import TagCenterHeader from './components/TagCenterHeader.vue'
import TagStatsCards from './components/TagStatsCards.vue'
import TagFilterSection from './components/TagFilterSection.vue'
import TagTableList from './components/TagTableList.vue'
import QuickRegisterDrawer from './components/QuickRegisterDrawer.vue'
import FormRegisterDrawer from './components/FormRegisterDrawer.vue'
import BatchImportDrawer from './components/BatchImportDrawer.vue'

// 状态管理
const tagCenterStore = useTagCenterStore()

// 抽屉状态
const quickRegisterVisible = ref(false)
const formRegisterVisible = ref(false)
const batchImportVisible = ref(false)

// 计算属性
const tagTables = computed(() => tagCenterStore.tagTables)
const loading = computed(() => tagCenterStore.loading)
const pagination = computed(() => tagCenterStore.pagination)
const stats = computed(() => tagCenterStore.stats)

// 筛选表单
const filterForm = ref({
  name: '',
  status: '',
  category: '',
  dateRange: [] as string[]
})
const onFilterFormUpdate = (val: typeof filterForm.value) => {
  filterForm.value = val
}

// 方法
const openQuickRegister = () => {
  quickRegisterVisible.value = true
}

const openFormRegister = () => {
  formRegisterVisible.value = true
}

const openBatchImport = () => {
  batchImportVisible.value = true
}

const handleRefresh = () => {
  loadData()
  Message.success('数据已刷新')
}

const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

const handleReset = () => {
  filterForm.value.name = ''
  filterForm.value.status = ''
  filterForm.value.category = ''
  filterForm.value.dateRange = []
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadData()
}

const handleRegisterSuccess = () => {
  loadData()
  Message.success('标签表注册成功')
}

const handleEdit = (record: any) => {
  // TODO: 实现编辑功能
  Message.info('编辑功能开发中')
}

const handleArchive = async (record: any) => {
  try {
    await tagCenterStore.updateTagTable(record.id, {
      ...record,
      status: record.status === 'active' ? 'archived' : 'active'
    })
    Message.success(record.status === 'active' ? '已归档' : '已激活')
  } catch (error) {
    Message.error('操作失败')
  }
}

const handleDelete = async (record: any) => {
  try {
    await tagCenterStore.deleteTagTable(record.id)
    Message.success('删除成功')
  } catch (error) {
    Message.error('删除失败')
  }
}

const loadData = async () => {
  try {
    await tagCenterStore.loadTagTables({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...filterForm.value
    })
  } catch (error) {
    Message.error('加载数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.tag-center {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}
</style>
