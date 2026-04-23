<template>
  <a-modal
    v-model:visible="isVisible"
    :title="modalTitle"
    @cancel="handleCancel"
    @before-ok="handleBeforeOk"
    width="600px"
  >
    <a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
      <a-form-item field="targetTable" label="关联表名" validate-trigger="blur" required>
        <a-input v-model="form.targetTable" placeholder="请输入关联表名" />
      </a-form-item>
      <a-form-item field="relationField" label="关联字段" validate-trigger="blur" required>
        <a-input v-model="form.relationField" placeholder="请输入关联字段名" />
      </a-form-item>
      <a-form-item field="relationType" label="关联类型">
        <a-select v-model="form.relationType" placeholder="请选择关联类型">
          <a-option value="字段关联">字段关联</a-option>
          <a-option value="维度-事实关联">维度-事实关联</a-option>
          <a-option value="事实-维度关联">事实-维度关联</a-option>
          <a-option value="维度-汇总关联">维度-汇总关联</a-option>
          <a-option value="汇总-维度关联">汇总-维度关联</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="relationDescription" label="关联说明">
        <a-textarea v-model="form.relationDescription" placeholder="请输入关联说明" />
      </a-form-item>
    </a-form>

    <a-divider orientation="left">现有关联关系</a-divider>
    <a-table :data="existingRelations" :bordered="false" :pagination="false">
      <template #columns>
        <a-table-column title="关联表" dataIndex="targetTable" />
        <a-table-column title="关联字段" dataIndex="relationField" />
        <a-table-column title="关联类型" dataIndex="relationType" />
        <a-table-column title="操作">
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
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal } from '@arco-design/web-vue'

interface Relation {
  targetTable: string
  relationField: string
  relationType?: string
  relationDescription?: string
}

const props = defineProps<{ visible: boolean; fieldName: string; initialRelations: Relation[] }>()
const emit = defineEmits(['update:visible', 'save-relations'])

const isVisible = ref(props.visible)
const modalTitle = ref(`编辑字段 '${props.fieldName}' 的关联关系`)
const form = ref<Relation>({ targetTable: '', relationField: '', relationType: '', relationDescription: '' })
const existingRelations = ref<Relation[]>([...props.initialRelations])
const editingIndex = ref<number | null>(null)

watch(() => props.visible, (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    // Reset form and load initial relations when modal opens
    resetForm()
    existingRelations.value = [...props.initialRelations]
    modalTitle.value = `编辑字段 '${props.fieldName}' 的关联关系`
  }
})

watch(() => props.fieldName, (newVal) => {
  modalTitle.value = `编辑字段 '${newVal}' 的关联关系`
})

const resetForm = () => {
  form.value = { targetTable: '', relationField: '', relationType: '', relationDescription: '' }
  editingIndex.value = null
}

const handleCancel = () => {
  isVisible.value = false
  emit('update:visible', false)
  resetForm()
}

const handleBeforeOk = (done: (closed: boolean) => void) => {
  // Basic validation
  if (!form.value.targetTable || !form.value.relationField) {
    Modal.warning({
      title: '验证失败',
      content: '关联表名和关联字段不能为空。'
    })
    done(false)
    return
  }

  if (editingIndex.value !== null) {
    // Update existing relation
    existingRelations.value[editingIndex.value] = { ...form.value }
  } else {
    // Add new relation
    existingRelations.value.push({ ...form.value })
  }

  emit('save-relations', existingRelations.value)
  isVisible.value = false
  emit('update:visible', false)
  resetForm()
  done(true)
}

const editRelation = (record: Relation, index: number) => {
  form.value = { ...record }
  editingIndex.value = index
}

const deleteRelation = (index: number) => {
  existingRelations.value.splice(index, 1)
  emit('save-relations', existingRelations.value)
}
</script>

<style scoped>
/* Add styles here if needed */
</style>