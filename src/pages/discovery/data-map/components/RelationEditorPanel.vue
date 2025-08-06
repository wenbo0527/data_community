<template>
  <div class="relation-editor-panel">
    <div class="relation-header">
      <h3>字段 "{{ props.fieldName }}" 的关联关系配置</h3>
    </div>
    <div class="table-container">
      <div class="toolbar">
        <a-button type="primary" size="mini" @click="addRelationForField">
          <template #icon><icon-plus /></template>
          为当前字段新增关联
        </a-button>
      </div>
      
      <a-table :data="relations" :bordered="false" :pagination="false" style="width: 100%;">
        <template #columns>
          <a-table-column title="关联表" dataIndex="targetTable">
            <template #cell="{ record, rowIndex }">
              <span v-if="editingRowIndex !== rowIndex">{{ record.targetTable }}</span>
              <a-select
                v-else
                v-model="record.targetTable"
                :options="availableTables.map((t: TableItem) => ({ label: t.name, value: t.name }))"
                placeholder="请选择关联表"
                allow-clear
              />
            </template>
          </a-table-column>
          <a-table-column title="关联类型" dataIndex="relationType">
            <template #cell="{ record, rowIndex }">
              <span v-if="editingRowIndex !== rowIndex">{{ record.relationType }}</span>
              <a-select
                v-else
                v-model="record.relationType"
                :options="[
                  { label: '1:1', value: '1:1' },
                  { label: '1:N', value: '1:N' }
                ]"
                placeholder="请选择关联类型"
                allow-clear
              />
            </template>
          </a-table-column>
          <a-table-column title="关联说明" dataIndex="relationDescription">
            <template #cell="{ record, rowIndex }">
              <span v-if="editingRowIndex !== rowIndex">{{ record.relationDescription }}</span>
              <a-input
                v-else
                v-model="record.relationDescription"
                placeholder="请输入关联说明"
                allow-clear
              />
            </template>
          </a-table-column>

          <a-table-column title="关联字段" dataIndex="relationFields">
        <template #cell="{ record, rowIndex }">
          <div v-if="editingRowIndex !== rowIndex">
            <div v-for="(pair, index) in record.relationFields" :key="index">
              {{ pair.sourceField }} = {{ pair.targetField }}
            </div>
          </div>
          <div v-else class="field-pairs-container">
            <div v-for="(pair, index) in record.relationFields" :key="index" class="field-pair">
              <a-select
                v-model="pair.sourceField"
                :options="getSourceFieldOptions()"
                placeholder="请选择源字段"
                allow-clear
                style="width: 45%"
              />
              <span class="equal-sign">=</span>
              <a-select
                v-model="pair.targetField"
                :options="getTargetFieldOptions(record.targetTable)"
                placeholder="请选择目标字段"
                allow-clear
                style="width: 45%"
              />
              <a-button 
                v-if="record.relationFields.length > 1" 
                type="text" 
                size="mini" 
                status="danger" 
                @click="removeFieldPair(record, index)"
                class="remove-btn"
              >
                <template #icon>
                  <icon-delete />
                </template>
              </a-button>
            </div>
            <a-button type="dashed" size="mini" @click="addFieldPair(record)" style="width: 100%">
              <template #icon>
                <icon-plus />
              </template>
              添加字段对
            </a-button>
          </div>
        </template>
      </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record, column, rowIndex }">
              <a-space v-if="editingRowIndex === rowIndex">
                <a-button type="primary" size="mini" @click="saveRelation(rowIndex)">
                  保存
                </a-button>
                <a-button type="outline" size="mini" @click="cancelEdit(rowIndex)">
                  取消
                </a-button>
              </a-space>
              <a-space v-else>
                <a-button type="primary" size="mini" @click="editRelation(record, rowIndex)">
                  编辑
                </a-button>
                <a-button type="outline" status="danger" size="mini" @click="deleteRelation(rowIndex)">
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
// 本地TableItem接口定义
interface TableItem {
  id?: string
  name: string
  description?: string
  database?: string
  schema?: string
  type?: string
  category?: string
  domain?: string
  updateFrequency?: string
  tags?: string[]
  owner?: string
  createTime?: string
  updateTime?: string
  fields?: any[]
}
import { Modal } from '@arco-design/web-vue'
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'

// 从mock数据中导入表信息
import { mockTables } from '@/mock/data-map.js'

interface RelationFieldPair {
  sourceField: string
  targetField: string
}

interface Relation {
  id?: string
  fieldName?: string
  targetTable: string
  relationFields: RelationFieldPair[]
  relationType?: string
  relationDescription?: string
}

// 用于表示一个字段的多条关联关系
interface FieldRelationGroup {
  fieldName: string
  relations: Relation[]
}

const props = defineProps<{
  fieldName: string
  initialRelations: Relation[] // Change type to Relation[]
  currentTableName?: string // Add current table name prop
}>()

const emit = defineEmits(['save-relations'])

const relations = ref<Relation[]>([]) // State to hold the list of relations
const availableTables = ref<TableItem[]>(mockTables) // Using mock data for available tables

// State for inline editing
const editingRowIndex = ref<number | null>(null) // Index of the relation being edited
const originalRelation = ref<Relation | null>(null) // To store original data for cancel operation

// Watch for initial relations prop changes and initialize the relations state
watch(() => props.initialRelations, (newVal: Relation[]) => {
  relations.value = [...newVal] // Initialize relations with prop data
}, { immediate: true, deep: true })

// 添加新的关联关系
// 为当前字段添加新的关联关系
const addRelationForField = () => {
  const newRelation: Relation = {
    id: Date.now().toString(),
    fieldName: props.fieldName || '',
    targetTable: '',
    relationFields: [{ sourceField: '', targetField: '' }],
    relationType: '',
    relationDescription: ''
  }
  relations.value.push(newRelation)
  // Set the new row in edit mode
  editingRowIndex.value = relations.value.length - 1
}

// 为指定字段添加新的关联关系
const addRelationForSpecificField = (fieldName: string) => {
  const newRelation: Relation = {
    fieldName: fieldName,
    targetTable: '',
    relationFields: [{ sourceField: '', targetField: '' }],
    relationType: '',
    relationDescription: ''
  }
  relations.value.push(newRelation)
  // Set the new row in edit mode
  editingRowIndex.value = relations.value.length - 1
}





// Function to edit an existing relation
const editRelation = (record: Relation, index: number) => {
  // Save a copy of the original relation for potential cancellation
  originalRelation.value = JSON.parse(JSON.stringify(relations.value[index]))
  editingRowIndex.value = index
}

// 添加字段对
const addFieldPair = (record: Relation) => {
  record.relationFields.push({ sourceField: '', targetField: '' })
}

// 删除字段对
const removeFieldPair = (record: Relation, index: number) => {
  if (record.relationFields.length > 1) {
    record.relationFields.splice(index, 1)
  }
}

// Function to save an edited relation
const saveRelation = (index: number) => {
  // 验证必填字段
  const relation = relations.value[index]
  if (!relation.targetTable) {
    Modal.warning({
      title: '验证失败',
      content: '请选择关联表。'
    })
    return
  }
  
  if (relation.relationFields.some((pair: RelationFieldPair) => !pair.sourceField || !pair.targetField)) {
    Modal.warning({
      title: '验证失败',
      content: '请填写所有字段对的源字段和目标字段。'
    })
    return
  }
  
  // Exit edit mode
  editingRowIndex.value = null
  originalRelation.value = null
  emit('save-relations', relations.value);
}

// Function to cancel editing
const cancelEdit = (index: number) => {
  // Restore original relation data if it exists
  if (originalRelation.value) {
    relations.value[index] = { ...originalRelation.value }
    originalRelation.value = null
  }
  // Exit edit mode
  editingRowIndex.value = null
}

// Function to delete a relation
const deleteRelation = (index: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条关联关系吗？',
    onOk: () => {
      relations.value.splice(index, 1);
      // Adjust editing index if necessary
      if (editingRowIndex.value === index) {
        editingRowIndex.value = null
      } else if (editingRowIndex.value !== null && editingRowIndex.value > index) {
        editingRowIndex.value -= 1
      }
      emit('save-relations', relations.value);
    }
  })
}

// 获取源字段选项
const getSourceFieldOptions = () => {
  // 获取当前表的字段作为源字段选项
  console.log('getSourceFieldOptions called, props:', { fieldName: props.fieldName, currentTableName: props.currentTableName });
  console.log('getSourceFieldOptions, mockTables:', mockTables);
  
  // 使用传递的当前表名来查找当前表
  let currentTable = null;
  if (props.currentTableName) {
    currentTable = mockTables.find((table: TableItem) => table.name === props.currentTableName);
    console.log('getSourceFieldOptions, found currentTable by name:', currentTable);
  }
  
  // 如果没有传递当前表名或未找到，则使用旧的逻辑
  if (!currentTable) {
    currentTable = mockTables.find((table: TableItem) => table.fields);
    console.log('getSourceFieldOptions, fallback to first table with fields:', currentTable);
  }
  
  console.log('getSourceFieldOptions, currentTable:', currentTable);
  if (currentTable && currentTable.fields) {
    const options = currentTable.fields.map((field: { name: string }) => ({
      label: field.name,
      value: field.name
    }));
    console.log('getSourceFieldOptions, options:', options);
    return options;
  }
  console.log('getSourceFieldOptions, returning empty array');
  return [];
};

// 获取目标字段选项
const getTargetFieldOptions = (targetTableName: string) => {
  // 根据目标表名获取目标表的字段作为选项
  console.log('getTargetFieldOptions called, targetTableName:', targetTableName);
  const targetTable = mockTables.find((table: TableItem) => table.name === targetTableName);
  console.log('getTargetFieldOptions, targetTable:', targetTable);
  if (targetTable && targetTable.fields) {
    const options = targetTable.fields.map((field: { name: string }) => ({
      label: field.name,
      value: field.name
    }));
    console.log('getTargetFieldOptions, options:', options);
    return options;
  }
  console.log('getTargetFieldOptions, returning empty array');
  return [];
};
</script>

<style scoped>
.relation-editor-panel {
  padding: 20px;
  width: 100%;
}

.relation-editor-panel :deep(.arco-table-th) {
  background-color: #f5f5f5;
  font-weight: bold;
}

.relation-editor-panel :deep(.arco-table-td) {
  vertical-align: top;
}

.relation-editor-panel :deep(.arco-table) {
  width: 100%;
}

.relation-editor-panel :deep(.arco-form-item) {
  margin-bottom: 15px;
}

.toolbar {
  margin-bottom: 16px;
}

.toolbar .arco-btn {
  margin-right: 8px;
}

.relation-header {
  margin-bottom: 16px;
}

.relation-header h3 {
  margin: 0;
  color: #333;
}

.field-pairs-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-pair {
  display: flex;
  align-items: center;
  gap: 8px;
}

.equal-sign {
  font-weight: bold;
  margin: 0 4px;
}

.remove-btn {
  flex-shrink: 0;
}
</style>