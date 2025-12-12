<template>
  <a-card class="table-card">
    <template #title>
      <div class="table-header">
        <h3 class="table-title">标签表列表</h3>
        <div class="table-actions">
          <span class="total-count">共 {{ pagination.total }} 条数据</span>
        </div>
      </div>
    </template>
    
    <a-table
      :data="data"
      :loading="loading"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      @page-change="handlePageChange"
    >
      <!-- 名称列 -->
      <template #name="{ record }">
        <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
      </template>
      
      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusLabel(record.status) }}
        </a-tag>
      </template>
      
      <!-- 分类列 -->
      <template #categories="{ record }">
        <a-space wrap>
          <a-tag v-for="category in record.categories" :key="category" size="small">
            {{ category }}
          </a-tag>
        </a-space>
      </template>
      
      <!-- 数据源列 -->
      <template #dataSource="{ record }">
        <div class="data-source-info">
          <div class="data-source-name">{{ record.dataSource }}</div>
          <div class="table-name">{{ record.tableName }}</div>
        </div>
      </template>
      
      <!-- 主键列 -->
      <template #primaryKey="{ record }">
        <div class="primary-key-info">
          <div class="key-field">{{ record.primaryKey }}</div>
          <div class="identity-type">{{ getIdentityTypeLabel(record.identityType) }}</div>
        </div>
      </template>
      
      <!-- 创建时间列 -->
      <template #createTime="{ record }">
        {{ formatDate(record.createTime) }}
      </template>
      
      <!-- 操作列 -->
      <template #actions="{ record }">
        <a-space>
          <a-button type="text" size="small" @click="handleEdit(record)">
            编辑
          </a-button>
          <a-button 
            type="text" 
            size="small" 
            :status="record.status === 'active' ? 'warning' : 'success'"
            @click="handleArchive(record)"
          >
            {{ record.status === 'active' ? '归档' : '激活' }}
          </a-button>
          <a-popconfirm 
            content="确定要删除这个标签表吗？此操作不可恢复。"
            @ok="handleDelete(record)"
          >
            <a-button type="text" size="small" status="danger">
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TagTable } from '@/types/tag'

// Props定义
interface Props {
  data: TagTable[]
  loading: boolean
  pagination: {
    current: number
    pageSize: number
    total: number
    showTotal?: boolean
    showJumper?: boolean
    showPageSize?: boolean
  }
}

const props = defineProps<Props>()

// 事件定义
const emit = defineEmits<{
  'page-change': [page: number]
  'edit': [record: TagTable]
  'archive': [record: TagTable]
  'delete': [record: TagTable]
  'view-detail': [record: TagTable]
}>()

// 表格列配置
const columns = computed(() => [
  {
    title: '标签表名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '编码',
    dataIndex: 'code',
    width: 150,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '分类',
    dataIndex: 'categories',
    slotName: 'categories',
    width: 200
  },
  {
    title: '数据源',
    dataIndex: 'dataSource',
    slotName: 'dataSource',
    width: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '主键配置',
    dataIndex: 'primaryKey',
    slotName: 'primaryKey',
    width: 150
  },
  {
    title: '描述',
    dataIndex: 'description',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180,
    sortable: true
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    width: 120,
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 200,
    fixed: 'right',
    align: 'center'
  }
])

// 方法
const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleViewDetail = (record: TagTable) => {
  emit('view-detail', record)
}

const handleEdit = (record: TagTable) => {
  emit('edit', record)
}

const handleArchive = (record: TagTable) => {
  emit('archive', record)
}

const handleDelete = (record: TagTable) => {
  emit('delete', record)
}

const getStatusColor = (status: string): string => {
  const colors = {
    active: 'green',
    archived: 'gray'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const getStatusLabel = (status: string): string => {
  const labels = {
    active: '激活',
    archived: '归档'
  }
  return labels[status as keyof typeof labels] || '未知'
}

const getIdentityTypeLabel = (identityType: string): string => {
  const labels = {
    mobile: '手机号',
    device_id: '设备号',
    id_card: '身份证号',
    card_no: '卡号'
  }
  return labels[identityType as keyof typeof labels] || identityType
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped lang="less">
.table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count {
  color: #86909c;
  font-size: 14px;
}

.data-source-info {
  .data-source-name {
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }
  
  .table-name {
    font-size: 12px;
    color: #86909c;
  }
}

.primary-key-info {
  .key-field {
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }
  
  .identity-type {
    font-size: 12px;
    color: #86909c;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  :deep(.arco-table-th),
  :deep(.arco-table-td) {
    padding: 12px 8px;
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>