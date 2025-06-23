<template>
  <div class="relation-editor-panel">
    <a-space direction="vertical" style="width: 100%;">
      <a-button type="primary" size="mini" @click="addRelation">
        <template #icon><icon-plus /></template>
        新增关联
      </a-button>
      
      <a-table :data="relations" :bordered="false" :pagination="false">
        <template #columns>
          <a-table-column title="关联表" dataIndex="targetTable" />
          <a-table-column title="关联字段" dataIndex="relationField" />
          <a-table-column title="关联类型" dataIndex="relationType" />
          <a-table-column title="关联说明" dataIndex="relationDescription" />
          <a-table-column title="操作">
            <template #cell="{ record, rowIndex }">
              <a-space>
                <a-button type="text" size="mini" @click="editRelation(record, rowIndex)">编辑</a-button>
                <a-button type="text" size="mini" status="danger" @click="deleteRelation(rowIndex)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      
    </a-space>
    
    <!-- 新增/编辑关联关系弹窗 -->
    <a-modal
      v-model:visible="editModalVisible"
      :title="isEditing ? '编辑关联关系' : '新增关联关系'"
      @ok="handleEditModalOk"
      @cancel="handleEditModalCancel"
    >
      <a-form :model="currentRelationForm" layout="vertical">
        <a-form-item label="关联表" field="targetTable" required>
          <a-select
            v-model="currentRelationForm.targetTable"
            placeholder="请选择关联表"
            allow-search
            :disabled="isEditing"
          >
            <a-option 
              v-for="table in availableTables"
              :key="table.name"
              :value="table.name"
            >
              {{ table.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关联字段" field="relationField" required>
           <a-input v-model="currentRelationForm.relationField" placeholder="请输入关联字段" />
        </a-form-item>
        <a-form-item label="关联类型" field="relationType">
          <a-select v-model="currentRelationForm.relationType" placeholder="请选择关联类型">
            <a-option value="主表关联">主表关联</a-option>
            <a-option value="维度-事实关联">维度-事实关联</a-option>
            <a-option value="维度-汇总关联">维度-汇总关联</a-option>
            <a-option value="字段关联">字段关联</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关联说明" field="relationDescription">
          <a-textarea 
            v-model="currentRelationForm.relationDescription"
            placeholder="请输入关联说明"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
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
import { IconPlus } from '@arco-design/web-vue/es/icon'

interface Relation {
  targetTable: string
  relationField: string
  relationType?: string
  relationDescription?: string
}

const props = defineProps<{
  fieldName: string
  initialRelations: Relation[] // Change type to Relation[]
}>()

const emit = defineEmits(['save-relations'])

const relations = ref<Relation[]>([]) // State to hold the list of relations
const availableTables = ref<TableItem[]>([]) // Assuming you have a list of all available tables

// State for the Add/Edit modal
const editModalVisible = ref(false)
const isEditing = ref(false)
const currentRelationForm = reactive<Relation>({ // Form state for the modal
  targetTable: '',
  relationField: '',
  relationType: '',
  relationDescription: ''
})
const editingIndex = ref<number | null>(null) // Index of the relation being edited

// Watch for initial relations prop changes and initialize the relations state
watch(() => props.initialRelations, (newVal) => {
  relations.value = [...newVal] // Initialize relations with prop data
}, { immediate: true, deep: true })

// Mock data for available tables (replace with actual data fetching)
// For now, let's use a simple mock list
availableTables.value = [
  { name: 'dim_user', type: 'dimension', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
  { name: 'fact_loan_apply', type: 'fact', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
  { name: 'dws_risk_score', type: 'dws', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
  { name: 'dwd_fraud_alert', type: 'dwd', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
  { name: 'dim_product', type: 'dimension', category: '', domain: '', updateFrequency: '', owner: '', description: '', fields: [] },
]

// --- Modal Actions ---

const addRelation = () => {
  isEditing.value = false
  editingIndex.value = null
  // Reset form
  currentRelationForm.targetTable = ''
  currentRelationForm.relationField = props.fieldName // Default to current field name
  currentRelationForm.relationType = ''
  currentRelationForm.relationDescription = ''
  editModalVisible.value = true
}

const editRelation = (record: Relation, index: number) => {
  isEditing.value = true
  editingIndex.value = index
  // Populate form with record data
  currentRelationForm.targetTable = record.targetTable
  currentRelationForm.relationField = record.relationField
  currentRelationForm.relationType = record.relationType || ''
  currentRelationForm.relationDescription = record.relationDescription || ''
  editModalVisible.value = true
}

const deleteRelation = (index: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条关联关系吗？',
    onOk: () => {
      relations.value.splice(index, 1);
      emit('save-relations', relations.value);
    }
  })
}

const handleEditModalOk = () => {
  // Basic validation (add more robust validation as needed)
  if (!currentRelationForm.targetTable || !currentRelationForm.relationField) {
    // Show error message
    return
  }

  if (isEditing.value && editingIndex.value !== null) {
    // Update existing relation
    relations.value[editingIndex.value] = { ...currentRelationForm }
  } else {
    // Add new relation
    relations.value.push({ ...currentRelationForm });
  }
  emit('save-relations', relations.value);
  editModalVisible.value = false
}

const handleEditModalCancel = () => {
  editModalVisible.value = false
}

// --- Panel Actions ---

// (In Vue 3 setup script, everything declared here is automatically exposed)
</script>

<style scoped>
.relation-editor-panel {
  padding: 16px;
}
</style>