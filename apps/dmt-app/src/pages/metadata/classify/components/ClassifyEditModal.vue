<template>
  <a-modal
    :visible="visible"
    :title="`编辑字段分级 · ${field?.field_name || ''}（${tableKey}）`"
    :width="640"
    :mask-closable="false"
    :ok-text="'保存'"
    :cancel-text="'取消'"
    @ok="handleOk"
    @cancel="emit('update:visible', false)"
  >
    <a-form v-if="form" :model="form" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="字段名">
            <a-input :model-value="form.field_name" readonly />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段注释">
            <a-input :model-value="form.field_comment" readonly />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Schema">
            <a-input :model-value="tableKey.split('.')[0]" readonly />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="表名">
            <a-input :model-value="tableKey.split('.')[1]" readonly />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="业务属于" required>
            <a-select v-model="form.business_belonging" placeholder="请选择">
              <a-option v-for="b in BELONGING_OPTIONS" :key="b" :value="b">{{ b }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="分级" required>
            <a-select v-model="form.grade" placeholder="请选择">
              <a-option v-for="g in GRADE_OPTIONS" :key="g" :value="g">{{ g }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="敏感级别" required>
        <a-radio-group v-model="form.sensitivity_level">
          <a-radio v-for="lv in (['L1', 'L2', 'L3', 'L4'] as const)" :key="lv" :value="lv">
            <a-tag :color="SENSITIVITY_COLORS[lv]">{{ lv }} {{ SENSITIVITY_NAMES[lv] }}</a-tag>
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="一级业务目录" required>
            <a-select v-model="form.category_l1" allow-search>
              <a-option v-for="l1 in l1Options" :key="l1" :value="l1">{{ l1 }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="二级业务目录" required>
            <a-input v-model="form.category_l2" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="三级业务目录" required>
            <a-input v-model="form.category_l3" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="四级业务目录" required>
            <a-input v-model="form.category_l4" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { SENSITIVITY_COLORS, SENSITIVITY_NAMES, GRADE_OPTIONS, BELONGING_OPTIONS } from '@shared/classify-constants'
import { classifyMatrixData } from '@shared/classify-matrix'
import type { ClassifyField } from '@shared/classify-types'

const props = defineProps<{
  visible: boolean
  field: ClassifyField | null
  tableKey: string
}>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  'saved': [field: ClassifyField]
}>()

const form = ref<ClassifyField | null>(null)
const l1Options = Array.from(new Set(classifyMatrixData.map(i => i.category_l1)))

watch(() => props.field, (f) => {
  if (f) form.value = { ...f }
}, { immediate: true })

const handleOk = () => {
  if (!form.value) return
  if (!form.value.business_belonging || !form.value.grade || !form.value.sensitivity_level ||
      !form.value.category_l1 || !form.value.category_l2 || !form.value.category_l3 || !form.value.category_l4) {
    Message.warning('请填写所有必填项')
    return
  }
  emit('saved', form.value)
}
</script>
