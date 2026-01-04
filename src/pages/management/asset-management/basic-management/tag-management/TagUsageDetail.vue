<template>
  <a-modal
    :visible="visible"
    title="使用明细"
    @cancel="handleCancel"
    :footer="false"
    width="800px"
  >
    <div class="header-info" style="margin-bottom: 16px">
      <a-descriptions :column="2">
        <a-descriptions-item label="标签组名称">{{ data.name }}</a-descriptions-item>
        <a-descriptions-item label="当前使用数">{{ total }}</a-descriptions-item>
      </a-descriptions>
    </div>

    <a-table :data="tableData" :pagination="pagination" @page-change="handlePageChange">
      <template #columns>
        <a-table-column title="资产名称" data-index="assetName" />
        <a-table-column title="资产类型" data-index="assetType" />
        <a-table-column title="所属项目" data-index="project" />
        <a-table-column title="标签值" data-index="tagValue">
          <template #cell="{ record }">
            <a-tag :color="data.color || 'arcoblue'">{{ record.tagValue }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="应用时间" data-index="applyTime" />
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible'])

const tableData = ref([])
const total = ref(0)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

watch(() => props.visible, (val) => {
  if (val) {
    fetchData()
  }
})

const fetchData = () => {
  // Mock data
  const mockData = Array(25).fill(null).map((_, index) => ({
    id: index,
    assetName: `Asset_${index + 1}`,
    assetType: index % 3 === 0 ? 'Table' : (index % 3 === 1 ? 'API' : 'Indicator'),
    project: `Project_${index % 5 + 1}`,
    tagValue: props.data.type === 'text' ? 'TagA' : 'RuleVal',
    applyTime: '2023-10-27 10:00:00'
  }))
  
  total.value = mockData.length
  pagination.total = mockData.length
  
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = mockData.slice(start, end)
}

const handlePageChange = (current) => {
  pagination.current = current
  fetchData()
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>
