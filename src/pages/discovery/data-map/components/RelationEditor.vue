<template>
  <a-modal
    v-model:visible="isVisible"
    :title="currentView === 'list' ? '关联关系管理' : '编辑关联关系'"
    @cancel="handleCancel"
    @before-ok="currentView === 'form' ? handleBeforeOk : handleListOk"
    width="800px"
    :mask-closable="false"
    :ok-text="currentView === 'list' ? '确定' : '保存'"
  >
    <!-- 已添加的关联关系列表视图 -->
    <div v-if="currentView === 'list'">
      <div style="margin-bottom: 16px; text-align: right;">
        <a-button type="primary" @click="showFormView">
          <template #icon>
            <icon-plus />
          </template>
          新增关联关系
        </a-button>
      </div>
      
      <a-table :data="existingRelations" :bordered="false" :pagination="false">
        <template #columns>
          <a-table-column title="源表" dataIndex="sourceTable">
            <template #cell="{ record }">
              {{ record.sourceTable }}
            </template>
          </a-table-column>
          <a-table-column title="目标表" dataIndex="targetTable">
            <template #cell="{ record }">
              {{ record.targetTable }}
            </template>
          </a-table-column>
          <a-table-column title="关联字段" dataIndex="relationFields">
            <template #cell="{ record }">
              <div v-for="(pair, index) in record.relationFields" :key="index">
                {{ pair.sourceField }} = {{ pair.targetField }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="关联类型" dataIndex="relationType" />
          <a-table-column title="关联说明" dataIndex="relationDescription" />
          <a-table-column title="操作" :width="120">
            <template #cell="{ record, rowIndex }">
              <a-space>
                <a-button type="text" size="mini" @click="editRelation(record, rowIndex)">编辑</a-button>
                <a-popconfirm content="确定删除此关联关系吗?" @ok="deleteRelation(rowIndex)">
                  <a-button type="text" size="mini" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      
      <a-empty v-if="existingRelations.length === 0" description="暂无关联关系" />
    </div>
    
    <!-- 新增/编辑关联关系表单视图 -->
    <a-form v-else :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
      <a-form-item field="targetTable" label="目标表" validate-trigger="blur" required>
        <a-select 
          v-model="form.targetTable" 
          placeholder="请选择目标表"
          :options="availableTables"
          :field-names="{ value: 'name', label: 'name' }"
          @change="onTargetTableChange"
        />
      </a-form-item>
      
      <a-form-item field="relationFields" label="关联字段对" required>
        <div class="field-pairs-container">
          <div v-for="(pair, index) in form.relationFields" :key="index" class="field-pair">
            <a-input-group>
              <a-select 
                v-model="pair.sourceField" 
                placeholder="请选择源字段"
                :options="sourceFieldsOptions"
                style="width: 40%"
              />
              <span class="equal-sign">=</span>
              <a-select 
                v-model="pair.targetField" 
                placeholder="请选择目标字段"
                :options="targetTableFields"
                style="width: 55%"
              />
            </a-input-group>
            <a-button 
              v-if="form.relationFields.length > 1" 
              type="text" 
              size="mini" 
              status="danger" 
              @click="removeFieldPair(index)"
              class="remove-btn"
            >
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </div>
          <a-button type="dashed" size="mini" @click="addFieldPair" style="width: 100%">
            <template #icon>
              <icon-plus />
            </template>
            添加字段对
          </a-button>
        </div>
      </a-form-item>
      
      <a-form-item field="relationType" label="关联类型" required>
        <a-select v-model="form.relationType" placeholder="请选择关联类型">
          <a-option value="1:1">1对1 (1:1)</a-option>
          <a-option value="1:N">1对多 (1:N)</a-option>
          <a-option value="N:1">多对1 (N:1)</a-option>
          <a-option value="N:N">多对多 (N:N)</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item field="relationDescription" label="关联说明">
        <a-textarea v-model="form.relationDescription" placeholder="请输入关联说明" :auto-size="{ minRows: 2, maxRows: 4 }" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Modal } from '@arco-design/web-vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { mockTables } from '@/mock/data-map'

interface RelationFieldPair {
  sourceField: string
  targetField: string
}

interface Relation {
  id?: string
  sourceTable: string
  targetTable: string
  relationFields: RelationFieldPair[]
  relationType: '1:1' | '1:N' | 'N:1' | 'N:N'
  relationDescription: string
}

const props = defineProps<{ 
  visible: boolean
  sourceTable: string
  sourceFields: string[]
  initialRelations: Relation[] 
}>()

const emit = defineEmits(['update:visible', 'save-relations'])

const isVisible = ref(props.visible)
const currentView = ref<'list' | 'form'>('list') // 默认显示列表视图
const form = ref({
  targetTable: '',
  relationFields: [{ sourceField: props.sourceFields[0] || '', targetField: '' }],
  relationType: 'N:1' as '1:1' | '1:N' | 'N:1' | 'N:N',
  relationDescription: ''
})

const existingRelations = ref<Relation[]>([...props.initialRelations])
const editingIndex = ref<number | null>(null)

// 显示表单视图
const showFormView = () => {
  currentView.value = 'form'
  // 重置表单
  resetForm()
  editingIndex.value = null
}

// 显示列表视图
const showListView = () => {
  currentView.value = 'list'
}

// 处理列表视图的确定按钮
const handleListOk = (done: (closed: boolean) => void) => {
  emit('save-relations', existingRelations.value)
  done(true)
}

// 可用的目标表列表
const availableTables = computed(() => {
  return mockTables.filter(table => table.name !== props.sourceTable)
})

// 目标表的字段列表
const targetTableFields = computed(() => {
  const targetTable = mockTables.find(t => t.name === form.value.targetTable)
  return targetTable?.fields?.map(field => ({ value: field.name, label: field.name })) || []
})

// 源表的字段列表
const sourceFieldsOptions = computed(() => {
  return props.sourceFields.map((field: string) => ({ value: field, label: field }))
})

watch(() => props.visible, (newVal: boolean) => {
  isVisible.value = newVal
  if (newVal) {
    // 默认显示列表视图
    currentView.value = 'list'
    // Reset form and load initial relations when modal opens
    resetForm()
    existingRelations.value = [...props.initialRelations]
  }
})

const resetForm = () => {
  form.value = {
    targetTable: '',
    relationFields: [{ sourceField: props.sourceFields[0] || '', targetField: '' }],
    relationType: 'N:1',
    relationDescription: ''
  }
  editingIndex.value = null
}

const onTargetTableChange = (value: string) => {
  form.value.targetTable = value
  // Reset target fields when target table changes
  form.value.relationFields.forEach((pair: RelationFieldPair) => {
    pair.targetField = ''
  })
}

const addFieldPair = () => {
  form.value.relationFields.push({ 
    sourceField: props.sourceFields[0] || '', 
    targetField: '' 
  })
}

const removeFieldPair = (index: number) => {
  if (form.value.relationFields.length > 1) {
    form.value.relationFields.splice(index, 1)
  }
}

const handleCancel = () => {
  isVisible.value = false
  emit('update:visible', false)
  resetForm()
}

const handleBeforeOk = (done: (closed: boolean) => void) => {
  // Validation
  if (!form.value.targetTable) {
    Modal.warning({
      title: '验证失败',
      content: '请选择目标表。'
    })
    done(false)
    return
  }

  if (form.value.relationFields.some((pair: RelationFieldPair) => !pair.targetField)) {
    Modal.warning({
      title: '验证失败',
      content: '请选择所有关联字段对的目标字段。'
    })
    done(false)
    return
  }

  if (!form.value.relationType) {
    Modal.warning({
      title: '验证失败',
      content: '请选择关联类型。'
    })
    done(false)
    return
  }

  const newRelation: Relation = {
    sourceTable: props.sourceTable,
    targetTable: form.value.targetTable,
    relationFields: [...form.value.relationFields],
    relationType: form.value.relationType,
    relationDescription: form.value.relationDescription
  }

  if (editingIndex.value !== null) {
    // Update existing relation
    existingRelations.value[editingIndex.value] = { ...newRelation, id: existingRelations.value[editingIndex.value].id }
  } else {
    // Add new relation
    newRelation.id = Date.now().toString()
    existingRelations.value.push(newRelation)
  }

  emit('save-relations', existingRelations.value)
  resetForm()
  // 保存后切换回列表视图
  currentView.value = 'list'
  done(true)
}

const editRelation = (record: Relation, index: number) => {
  form.value = {
    targetTable: record.targetTable,
    relationFields: [...record.relationFields],
    relationType: record.relationType,
    relationDescription: record.relationDescription
  }
  editingIndex.value = index
  // 切换到表单视图进行编辑
  currentView.value = 'form'
}

const deleteRelation = (index: number) => {
  existingRelations.value.splice(index, 1)
  emit('save-relations', existingRelations.value)
}
</script>

<style scoped>
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