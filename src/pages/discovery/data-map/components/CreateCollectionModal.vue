<template>
  <a-modal
    :visible="visible"
    :title="isEditMode ? '编辑表集合' : '创建表集合'"
    width="800px"
    @ok="handleCreateCollection"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
    class="collection-modal"
  >
    <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
      <a-form-item field="name" label="集合名称">
        <a-input 
          v-model="formData.name" 
          placeholder="请输入集合名称，如：贷前分析常用表" 
          :max-length="50"
          show-word-limit
        />
      </a-form-item>
      
      <a-form-item field="description" label="集合描述">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入集合描述"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          :max-length="200"
          show-word-limit
        />
      </a-form-item>
      
      <a-form-item field="type" label="集合类型">
        <a-select v-model="formData.type" placeholder="请选择集合类型">
          <a-option value="业务流程">业务流程</a-option>
          <a-option value="数据分析">数据分析</a-option>
          <a-option value="风险管控">风险管控</a-option>
          <a-option value="用户画像">用户画像</a-option>
          <a-option value="营销活动">营销活动</a-option>
          <a-option value="通用">通用</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item field="owner" label="负责人">
        <a-select v-model="formData.owner" placeholder="请选择负责人" allow-search>
          <a-option value="张三">张三</a-option>
          <a-option value="李四">李四</a-option>
          <a-option value="王五">王五</a-option>
          <a-option value="赵六">赵六</a-option>
          <a-option value="钱七">钱七</a-option>
          <a-option value="当前用户">当前用户</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="选择表">
        <div class="table-selection">
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索表名或描述"
            style="margin-bottom: 16px"
          />
          
          <!-- 已选表列表 -->
          <div class="selected-tables" v-if="formData.tables.length > 0">
            <a-typography-title :heading="6" style="margin-bottom: 12px">
              已选表 ({{ formData.tables.length }})
            </a-typography-title>
            <a-space wrap>
              <a-tag 
                v-for="table in formData.tables" 
                :key="table.name"
                closable
                @close="removeSelectedTable(table)"
                size="small"
                color="blue"
              >
                {{ table.name }}
              </a-tag>
            </a-space>
          </div>
          
          <!-- 可选表列表 -->
          <div class="available-tables" style="margin-top: 16px">
            <a-typography-title :heading="6" style="margin-bottom: 12px">
              可选表
            </a-typography-title>
            <a-table
              :data="filteredTables"
              :columns="tableColumns"
              :pagination="{ pageSize: 5, simple: true }"
              :row-selection="rowSelection"
              :row-key="'key'"
              size="small"
              class="table-selector"
              :scroll="{ y: 300 }"
            >
              <template #columns>
                <a-table-column title="表名" data-index="name" :width="180">
                  <template #cell="{ record }">
                    <a-typography-text strong>{{ record.name }}</a-typography-text>
                  </template>
                </a-table-column>
                <a-table-column title="类型" data-index="type" :width="100">
                  <template #cell="{ record }">
                    <a-tag size="small" :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="描述" data-index="description">
                  <template #cell="{ record }">
                    <a-typography-paragraph type="secondary" :ellipsis="{ rows: 1 }">
                      {{ record.description }}
                    </a-typography-paragraph>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { tableMockData } from '@/mock/tableData.ts'

interface TableField {
  name: string
  type: string
  description: string
}

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
}

interface TableCollection {
  id: string
  name: string
  description: string
  type?: string
  tables: TableItem[]
  owner?: string
  updateTime?: string
  isFavorite?: boolean
}

interface CreateCollectionModalEmits {
  (e: 'create', collection: Omit<TableCollection, 'id'>): void
  (e: 'update', collection: TableCollection): void
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<{
  visible: boolean
  editData?: TableCollection | null
}>()

const emit = defineEmits<CreateCollectionModalEmits>()

const formRef = ref()
const searchKeyword = ref('')
const selectedKeys = ref<string[]>([])

const formData = ref({
  name: '',
  description: '',
  type: '通用',
  owner: '当前用户',
  tables: [] as TableItem[]
})

// 编辑模式判断
const isEditMode = computed(() => {
  const editMode = !!props.editData
  console.log('[CreateCollectionModal] isEditMode computed:', editMode, 'props.editData:', props.editData)
  return editMode
})

const rules = {
  name: [
    { required: true, message: '请输入集合名称' },
    { minLength: 2, message: '集合名称至少2个字符' },
    { maxLength: 50, message: '集合名称不能超过50个字符' }
  ],
  type: [
    { required: true, message: '请选择集合类型' }
  ],
  owner: [
    { required: true, message: '请选择负责人' }
  ]
}

// 模拟表数据
const mockTransferData = computed(() => {
  return tableMockData.map((table, index) => ({
    key: `table_${index}`,
    name: table.name,
    type: table.type,
    category: table.category,
    domain: table.domain,
    updateFrequency: table.updateFrequency,
    owner: table.owner,
    description: table.description,
    fields: table.fields
  }))
})

// 过滤后的表数据
const filteredTables = computed(() => {
  if (!searchKeyword.value) {
    return mockTransferData.value
  }
  return mockTransferData.value.filter((table: TableItem & { key: string }) => 
    table.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    table.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 表格列配置
const tableColumns = [
  { title: '表名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '描述', dataIndex: 'description' }
]

// 行选择配置
const rowSelection = computed(() => ({
  type: 'checkbox',
  selectedRowKeys: selectedKeys.value,
  onSelect: (rowKeys: string[], rowKey: string, record: TableItem & { key: string }) => {
    const table = mockTransferData.value.find((t: TableItem & { key: string }) => t.key === rowKey)
    if (table) {
      if (rowKeys.includes(rowKey)) {
        // 添加到已选表
        if (!formData.value.tables.find((t: TableItem) => t.name === table.name)) {
          formData.value.tables.push(table)
        }
      } else {
        // 从已选表中移除
        formData.value.tables = formData.value.tables.filter((t: TableItem) => t.name !== table.name)
      }
    }
  },
  onSelectAll: (selected: boolean, selectedRows: (TableItem & { key: string })[], changeRows: (TableItem & { key: string })[]) => {
    if (selected) {
      // 全选
      changeRows.forEach((row: TableItem & { key: string }) => {
        const table = mockTransferData.value.find((t: TableItem & { key: string }) => t.key === row.key)
        if (table && !formData.value.tables.find((t: TableItem) => t.name === table.name)) {
          formData.value.tables.push(table)
        }
      })
    } else {
      // 取消全选
      changeRows.forEach((row: TableItem & { key: string }) => {
        formData.value.tables = formData.value.tables.filter((t: TableItem) => t.name !== row.name)
      })
    }
  }
}))

// 监听已选表变化，同步更新selectedKeys
watch(() => formData.value.tables, (newTables: TableItem[]) => {
  selectedKeys.value = newTables.map((table: TableItem) => {
    const item = mockTransferData.value.find((t: TableItem & { key: string }) => t.name === table.name)
    return item?.key || ''
  }).filter((key: string) => key)
}, { deep: true })

// 移除已选表
const removeSelectedTable = (table: TableItem) => {
  formData.value.tables = formData.value.tables.filter((t: TableItem) => t.name !== table.name)
  const item = mockTransferData.value.find((t: TableItem & { key: string }) => t.name === table.name)
  if (item) {
    selectedKeys.value = selectedKeys.value.filter((key: string) => key !== item.key)
  }
}

// 获取类型颜色
const getTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    '维度表': 'blue',
    '事实表': 'green',
    '明细表': 'orange',
    '汇总表': 'purple'
  }
  return type ? colors[type] || 'gray' : 'gray'
}

// 处理创建/编辑集合
const handleCreateCollection = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    
    if (formData.value.tables.length === 0) {
      Message.warning('请至少选择一张表')
      return
    }
    
    const collectionData: Omit<TableCollection, 'id'> = {
      name: formData.value.name,
      description: formData.value.description,
      type: formData.value.type,
      owner: formData.value.owner,
      tables: formData.value.tables.map(table => ({
        name: table.name,
        type: table.type,
        category: table.category,
        domain: table.domain,
        updateFrequency: table.updateFrequency,
        owner: table.owner,
        description: table.description,
        fields: table.fields
      })),
      updateTime: new Date().toISOString(),
      isFavorite: false
    }
    
    if (isEditMode.value && props.editData) {
      // 编辑模式
      emit('update', {
        ...collectionData,
        id: props.editData.id,
        isFavorite: props.editData.isFavorite
      } as TableCollection)
      Message.success('集合更新成功')
    } else {
      // 创建模式
      emit('create', collectionData)
      Message.success('集合创建成功')
    }
    
    handleCancel()
  } catch (error) {
    console.error('表单验证失败:', error)
    Message.error(isEditMode.value ? '更新失败' : '创建失败')
  }
}

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
  // 重置表单
  formData.value = {
    name: '',
    description: '',
    type: '通用',
    owner: '当前用户',
    tables: []
  }
  selectedKeys.value = []
  searchKeyword.value = ''
  formRef.value?.resetFields()
}

// 监听visible变化
watch(() => props.visible, (newVisible: boolean) => {
  console.log('[CreateCollectionModal] visible watcher triggered with newVisible:', newVisible)
  if (!newVisible) {
    console.log('[CreateCollectionModal] Modal is closing, calling handleCancel')
    handleCancel()
  } else if (newVisible && props.editData) {
    console.log('[CreateCollectionModal] Modal is opening in edit mode, filling form data with editData')
    // 编辑模式时填充数据
    formData.value = {
      name: props.editData.name,
      description: props.editData.description || '',
      type: props.editData.type || '通用',
      owner: props.editData.owner || '当前用户',
      tables: [...props.editData.tables]
    }
    console.log('[CreateCollectionModal] Form data filled from editData:', formData.value)
  } else {
    console.log('[CreateCollectionModal] Modal is opening but not in edit mode. editData exists:', !!props.editData)
  }
})

// 监听editData变化
watch(() => props.editData, (newEditData: TableCollection | null | undefined) => {
  console.log('[CreateCollectionModal] editData watcher triggered with newEditData:', newEditData)
  if (newEditData && props.visible) {
    console.log('[CreateCollectionModal] Filling form data with editData')
    formData.value = {
      name: newEditData.name,
      description: newEditData.description || '',
      type: newEditData.type || '通用',
      owner: newEditData.owner || '当前用户',
      tables: [...newEditData.tables]
    }
    console.log('[CreateCollectionModal] Form data filled:', formData.value)
  } else {
    console.log('[CreateCollectionModal] Not filling form data. newEditData exists:', !!newEditData, 'props.visible:', props.visible)
  }
}, { deep: true })
</script>

<style scoped>
.table-selection {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
}

.selected-tables {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f2f3f5;
  border-radius: 4px;
}

.available-tables {
  background-color: white;
  border-radius: 4px;
  padding: 12px;
}

.table-selector {
  border-radius: 4px;
}

.table-selector :deep(.arco-table-th) {
  background-color: #f7f8fa;
  font-weight: 600;
}

.table-selector :deep(.arco-table-tr:hover) {
  background-color: #f2f3f5;
}

:deep(.arco-form-item-label) {
  font-weight: 600;
  color: var(--color-text-1);
}

/* 集合弹窗样式优化 */
:deep(.collection-modal) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.collection-modal .arco-modal-header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
}

:deep(.collection-modal .arco-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

:deep(.collection-modal .arco-modal-body) {
  padding: 24px;
}

:deep(.collection-modal .arco-modal-footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
}

:deep(.collection-modal .arco-modal-footer .arco-btn) {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 20px;
  height: 36px;
}

:deep(.collection-modal .arco-modal-footer .arco-btn-primary) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

:deep(.collection-modal .arco-modal-footer .arco-btn-primary:hover) {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}
</style>