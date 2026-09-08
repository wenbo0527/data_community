<template>
  <div :class="containerClasses">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" :class="toolbarClasses">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <ASpace>
            <AButton v-if="showRefresh" @click="handleRefresh" :loading="loading">
              <template #icon><IconRefresh /></template>
              刷新
            </AButton>
            <slot name="toolbar-buttons"></slot>
          </ASpace>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <ASpace>
            <!-- 列设置 -->
            <APopover v-if="showColumnSetting" trigger="click" position="bottom">
              <AButton>
                <template #icon><IconSettings /></template>
              </AButton>
              <template #content>
                <div class="column-setting">
                  <div class="setting-title">列设置</div>
                  <ACheckboxGroup v-model="visibleColumns" direction="vertical">
                    <ACheckbox 
                      v-for="col in settableColumns" 
                      :key="col.dataIndex || col.key"
                      :value="col.dataIndex || col.key"
                    >
                      {{ col.title }}
                    </ACheckbox>
                  </ACheckboxGroup>
                </div>
              </template>
            </APopover>
            <!-- 密度设置 -->
            <APopover v-if="showDensitySetting" trigger="click" position="bottom">
              <AButton>
                <template #icon><IconMenu /></template>
              </AButton>
              <template #content>
                <div class="density-setting">
                  <div class="setting-title">表格密度</div>
                  <ARadioGroup v-model="currentSize" direction="vertical">
                    <ARadio value="small">紧凑</ARadio>
                    <ARadio value="medium">默认</ARadio>
                    <ARadio value="large">宽松</ARadio>
                  </ARadioGroup>
                </div>
              </template>
            </APopover>
          </ASpace>
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <ATable
      v-bind="tableProps"
      :class="tableClasses"
      :columns="computedColumns"
      :data="data"
      :loading="loading"
      :pagination="computedPagination"
      :size="currentSize"
      :scroll="scroll"
      :row-selection="rowSelection"
      :expandable="expandable"
      :bordered="bordered"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @sorter-change="handleSorterChange"
      @filter-change="handleFilterChange"
      @selection-change="handleSelectionChange"
      @expand="handleExpand"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblclick"
      @cell-click="handleCellClick"
    >
      <!-- 动态插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
    </ATable>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { 
  Table as ATable, 
  Button as AButton, 
  Space as ASpace,
  Popover as APopover,
  Checkbox as ACheckbox,
  CheckboxGroup as ACheckboxGroup,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  IconRefresh,
  IconSettings,
  IconMenu
} from '@arco-design/web-vue'
import { arcoConfig } from '@/utils/arco'

export default {
  name: 'BaseTable',
  components: {
    ATable,
    AButton,
    ASpace,
    APopover,
    ACheckbox,
    ACheckboxGroup,
    ARadio,
    ARadioGroup,
    IconRefresh,
    IconSettings,
    IconMenu
  },
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 表格列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页配置
    pagination: {
      type: [Object, Boolean],
      default: () => ({})
    },
    // 表格大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 滚动配置
    scroll: {
      type: Object,
      default: () => ({})
    },
    // 行选择配置
    rowSelection: {
      type: Object,
      default: null
    },
    // 展开配置
    expandable: {
      type: Object,
      default: null
    },
    // 是否显示工具栏
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 是否显示刷新按钮
    showRefresh: {
      type: Boolean,
      default: true
    },
    // 是否显示列设置
    showColumnSetting: {
      type: Boolean,
      default: true
    },
    // 是否显示密度设置
    showDensitySetting: {
      type: Boolean,
      default: true
    },
    // 是否显示边框
    bordered: {
      type: Boolean,
      default: true
    },
    // 紧凑模式
    compact: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'compact', 'ultra-compact'].includes(value)
    },
    // 空间优化模式
    spaceOptimized: {
      type: Boolean,
      default: false
    },
    // 其他表格属性
    tableProps: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'refresh',
    'page-change',
    'page-size-change',
    'sorter-change',
    'filter-change',
    'selection-change',
    'expand',
    'row-click',
    'row-dblclick',
    'cell-click'
  ],
  setup(props, { emit }) {
    // 当前表格大小
    const currentSize = ref(props.size)
    
    // 可见列
    const visibleColumns = ref([])
    
    // 容器样式类
    const containerClasses = computed(() => {
      const classes = ['base-table-container']
      
      if (props.spaceOptimized) {
        classes.push('table-space-optimized')
      }
      
      if (!props.bordered) {
        classes.push('table-borderless')
      }
      
      if (props.compact === 'compact') {
        classes.push('table-compact')
      } else if (props.compact === 'ultra-compact') {
        classes.push('table-ultra-compact')
      }
      
      if (!props.bordered && props.compact === 'compact') {
        classes.push('table-borderless-compact')
      }
      
      return classes
    })
    
    // 工具栏样式类
    const toolbarClasses = computed(() => {
      const classes = ['table-toolbar']
      
      if (props.compact !== 'normal') {
        classes.push('table-toolbar-compact')
      }
      
      return classes
    })
    
    // 表格样式类
    const tableClasses = computed(() => {
      const classes = []
      
      if (props.compact === 'compact') {
        classes.push('table-compact')
      } else if (props.compact === 'ultra-compact') {
        classes.push('table-ultra-compact')
      }
      
      if (!props.bordered) {
        classes.push('table-borderless')
      }
      
      classes.push('table-hover-optimized')
      
      return classes
    })
    
    // 可设置的列（排除操作列等）
    const settableColumns = computed(() => {
      return props.columns.filter(col => 
        col.dataIndex && 
        !col.fixed && 
        col.title !== '操作'
      )
    })
    
    // 计算后的列配置
    const computedColumns = computed(() => {
      if (visibleColumns.value.length === 0) {
        return props.columns
      }
      return props.columns.filter(col => {
        // 保留操作列、固定列和选中的列
        return !col.dataIndex || 
               col.fixed || 
               col.title === '操作' || 
               visibleColumns.value.includes(col.dataIndex)
      })
    })
    
    // 计算后的分页配置
    const computedPagination = computed(() => {
      if (props.pagination === false) {
        return false
      }
      return {
        ...arcoConfig.table.pagination,
        ...props.pagination
      }
    })
    
    // 初始化可见列
    watch(
      () => props.columns,
      (newColumns) => {
        if (visibleColumns.value.length === 0) {
          visibleColumns.value = settableColumns.value.map(col => col.dataIndex)
        }
      },
      { immediate: true }
    )
    
    // 事件处理
    const handleRefresh = () => {
      emit('refresh')
    }
    
    const handlePageChange = (page) => {
      emit('page-change', page)
    }
    
    const handlePageSizeChange = (pageSize) => {
      emit('page-size-change', pageSize)
    }
    
    const handleSorterChange = (dataIndex, direction) => {
      emit('sorter-change', dataIndex, direction)
    }
    
    const handleFilterChange = (dataIndex, filteredValues) => {
      emit('filter-change', dataIndex, filteredValues)
    }
    
    const handleSelectionChange = (rowKeys, rowRecords) => {
      emit('selection-change', rowKeys, rowRecords)
    }
    
    const handleExpand = (rowKey, record) => {
      emit('expand', rowKey, record)
    }
    
    const handleRowClick = (record, ev) => {
      emit('row-click', record, ev)
    }
    
    const handleRowDblclick = (record, ev) => {
      emit('row-dblclick', record, ev)
    }
    
    const handleCellClick = (record, column, ev) => {
      emit('cell-click', record, column, ev)
    }
    
    return {
      currentSize,
      visibleColumns,
      containerClasses,
      toolbarClasses,
      tableClasses,
      settableColumns,
      computedColumns,
      computedPagination,
      handleRefresh,
      handlePageChange,
      handlePageSizeChange,
      handleSorterChange,
      handleFilterChange,
      handleSelectionChange,
      handleExpand,
      handleRowClick,
      handleRowDblclick,
      handleCellClick
    }
  }
}
</script>

<style scoped>
.base-table-container {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  flex-shrink: 0;
}

.column-setting,
.density-setting {
  width: 200px;
  padding: 8px;
}

.setting-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #1d2129;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.column-setting :deep(.arco-checkbox-group) {
  max-height: 200px;
  overflow-y: auto;
}

.column-setting :deep(.arco-checkbox) {
  margin-bottom: 8px;
}

.density-setting :deep(.arco-radio) {
  margin-bottom: 8px;
}
</style>