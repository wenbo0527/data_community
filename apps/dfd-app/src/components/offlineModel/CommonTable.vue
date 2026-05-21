<template>
  <div class="common-table">
    <a-table
      v-bind="$attrs"
      :data="tableData"
      :columns="computedColumns"
      :loading="loading"
      :pagination="computedPagination"
      :row-selection="rowSelection"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <!-- 空数据插槽 -->
      <template #empty>
        <div class="empty-content">
          <icon-inbox class="empty-icon" />
          <div class="empty-text">{{ emptyText }}</div>
        </div>
      </template>

      <!-- 操作列插槽 -->
      <template #actions="{ record }" v-if="showActions">
        <a-space>
          <a-button
            v-if="showView"
            type="text"
            size="small"
            @click.stop="handleView(record)"
          >
            <template #icon>
              <icon-eye />
            </template>
            查看
          </a-button>
          
          <a-button
            v-if="showEdit"
            type="text"
            size="small"
            @click.stop="handleEdit(record)"
          >
            <template #icon>
              <icon-edit />
            </template>
            编辑
          </a-button>
          
          <a-button
            v-if="showDelete"
            type="text"
            size="small"
            status="danger"
            @click.stop="handleDelete(record)"
          >
            <template #icon>
              <icon-delete />
            </template>
            删除
          </a-button>

          <!-- 自定义操作按钮 -->
          <slot name="custom-actions" :record="record" />
        </a-space>
      </template>

      <!-- 状态列插槽 -->
      <template #status="{ record, column }" v-if="hasStatusColumn">
        <a-tag :color="getStatusColor(record[column.dataIndex])">
          {{ getStatusLabel(record[column.dataIndex]) }}
        </a-tag>
      </template>

      <!-- 时间列插槽 -->
      <template #time="{ record, column }" v-if="hasTimeColumn">
        {{ formatTime(record[column.dataIndex]) }}
      </template>

      <!-- 自定义列插槽 -->
      <template 
        v-for="slot in customSlots" 
        :key="slot"
        #[slot]="{ record, column, rowIndex }"
      >
        <slot 
          :name="slot" 
          :record="record" 
          :column="column" 
          :rowIndex="rowIndex"
        />
      </template>
    </a-table>

    <!-- 分页器 -->
    <div class="table-footer" v-if="showPagination">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :show-total="showTotal"
        :show-jumper="showJumper"
        :show-page-size="showPageSize"
        :page-size-options="pageSizeOptions"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from 'vue'

const props = defineProps({
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  
  // 列配置
  columns: {
    type: Array,
    required: true
  },
  
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0
    })
  },
  
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  
  // 是否显示操作列
  showActions: {
    type: Boolean,
    default: true
  },
  
  // 是否显示查看按钮
  showView: {
    type: Boolean,
    default: true
  },
  
  // 是否显示编辑按钮
  showEdit: {
    type: Boolean,
    default: true
  },
  
  // 是否显示删除按钮
  showDelete: {
    type: Boolean,
    default: true
  },
  
  // 是否显示总数
  showTotal: {
    type: Boolean,
    default: true
  },
  
  // 是否显示跳转
  showJumper: {
    type: Boolean,
    default: true
  },
  
  // 是否显示页大小选择
  showPageSize: {
    type: Boolean,
    default: true
  },
  
  // 页大小选项
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  
  // 空数据文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  
  // 状态映射配置
  statusMap: {
    type: Object,
    default: () => ({
      active: { color: 'green', label: '有效' },
      inactive: { color: 'red', label: '无效' },
      draft: { color: 'orange', label: '草稿' },
      pending: { color: 'blue', label: '待审核' },
      expired: { color: 'gray', label: '已过期' },
      running: { color: 'blue', label: '运行中' },
      completed: { color: 'green', label: '已完成' },
      failed: { color: 'red', label: '失败' },
      stopped: { color: 'orange', label: '已停止' }
    })
  },
  
  // 行选择配置
  rowSelection: {
    type: [Object, Boolean],
    default: false
  }
})

const emit = defineEmits([
  'page-change',
  'page-size-change',
  'selection-change',
  'row-click',
  'view',
  'edit',
  'delete'
])

const slots = useSlots()

// 响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

// 计算属性
const tableData = computed(() => {
  if (!props.showPagination) {
    return props.data
  }
  
  // 如果传入的是对象，使用对象中的数据
  if (props.pagination && typeof props.pagination === 'object') {
    return props.data
  }
  
  // 本地分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

const computedColumns = computed(() => {
  let columns = [...props.columns]
  
  // 添加操作列
  if (props.showActions && !columns.find(col => col.dataIndex === 'actions')) {
    columns.push({
      title: '操作',
      dataIndex: 'actions',
      slotName: 'actions',
      width: 200,
      fixed: 'right'
    })
  }
  
  // 处理状态列
  columns = columns.map(column => {
    if (column.dataType === 'status') {
      return {
        ...column,
        slotName: 'status'
      }
    }
    if (column.dataType === 'time') {
      return {
        ...column,
        slotName: 'time'
      }
    }
    return column
  })
  
  return columns
})

const computedPagination = computed(() => {
  if (!props.showPagination) {
    return false
  }
  
  if (props.pagination && typeof props.pagination === 'object') {
    return {
      ...props.pagination,
      showTotal: props.showTotal,
      showJumper: props.showJumper,
      showPageSize: props.showPageSize,
      pageSizeOptions: props.pageSizeOptions
    }
  }
  
  return {
    current: currentPage.value,
    pageSize: pageSize.value,
    total: props.pagination?.total || props.data.length,
    showTotal: props.showTotal,
    showJumper: props.showJumper,
    showPageSize: props.showPageSize,
    pageSizeOptions: props.pageSizeOptions
  }
})

const hasStatusColumn = computed(() => {
  return props.columns.some(col => col.dataType === 'status')
})

const hasTimeColumn = computed(() => {
  return props.columns.some(col => col.dataType === 'time')
})

const customSlots = computed(() => {
  const defaultSlots = ['empty', 'actions', 'status', 'time']
  return Object.keys(slots).filter(slot => !defaultSlots.includes(slot))
})

// 监听分页配置变化
watch(() => props.pagination, (newVal) => {
  if (newVal && typeof newVal === 'object') {
    currentPage.value = newVal.current || 1
    pageSize.value = newVal.pageSize || 10
    total.value = newVal.total || 0
  }
}, { immediate: true })

// 方法
const handlePageChange = (page) => {
  currentPage.value = page
  emit('page-change', page)
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  emit('page-size-change', size)
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

const handleRowClick = (record) => {
  emit('row-click', record)
}

const handleView = (record) => {
  emit('view', record)
}

const handleEdit = (record) => {
  emit('edit', record)
}

const handleDelete = (record) => {
  emit('delete', record)
}

const getStatusColor = (status) => {
  return props.statusMap[status]?.color || 'gray'
}

const getStatusLabel = (status) => {
  return props.statusMap[status]?.label || status
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 暴露方法给父组件
const getSelectedRows = () => selectedRows.value
const clearSelection = () => {
  // 这里需要访问a-table的实例来清除选择
}
const refresh = () => {
  emit('page-change', currentPage.value)
}

defineExpose({
  getSelectedRows,
  clearSelection,
  refresh
})
</script>

<style scoped lang="less">
.common-table {
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    
    .empty-icon {
      font-size: 48px;
      color: #d9d9d9;
      margin-bottom: 16px;
    }
    
    .empty-text {
      color: #999;
      font-size: 14px;
    }
  }
  
  .table-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>