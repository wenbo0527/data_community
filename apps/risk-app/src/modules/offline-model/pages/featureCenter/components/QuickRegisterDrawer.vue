<template>
  <a-drawer :visible="visible" width="90vw" title="快速注册" @cancel="handleClose" :mask-closable="false" @ok="submitCreate">
    <a-collapse :default-active-key="['basic','fields','confirm']" :bordered="false">
      <a-collapse-item key="basic" header="1. 快速注册基础信息">
        <a-form :model="createForm" layout="vertical" auto-label-width validation-trigger="blur">
          <a-form-item label="选择数据表" required field="table">
            <a-select v-model="createForm.table" placeholder="请选择数据表" allow-search @change="onTableChange">
              <a-option v-for="t in tableList" :key="t.name" :value="t.name">{{ t.name }} ({{ tableTypeLabel(t.type) }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="表类型" required field="tableType">
            <a-radio-group v-model="createForm.tableType">
              <a-radio value="stream">流水表</a-radio>
              <a-radio value="slow_change">拉链表</a-radio>
              <a-radio value="snapshot">分区/快照表</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="主键字段" required field="primaryKey">
            <a-select v-model="createForm.primaryKey" placeholder="请选择主键">
              <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="分区字段" field="partitionFields">
            <a-select v-model="createForm.partitionFields" placeholder="请选择分区字段" multiple allow-search>
              <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="特征描述" field="description">
            <a-textarea v-model="createForm.description" :max-length="200" show-word-limit />
          </a-form-item>
          <a-form-item label="特征分类(大类)" required field="majorCategories">
            <a-select v-model="createForm.majorCategories" multiple placeholder="请选择特征分类">
              <a-option value="credit">征信特征</a-option>
              <a-option value="behavior">行为特征</a-option>
            </a-select>
          </a-form-item>
          <a-space>
            <a-button type="outline" :disabled="!createForm.table" @click="saveMeta">保存元信息(模拟)</a-button>
            <a-tag v-if="metaMsg" color="green">{{ metaMsg }}</a-tag>
          </a-space>
        </a-form>
      </a-collapse-item>
      <a-collapse-item key="fields" header="2. 字段校验与批量注册">
        <a-collapse :bordered="false" :default-active-key="['registered','unregistered']">
          <a-collapse-item key="registered" :header="`已注册字段（${registeredCount}）`">
            <a-card :bordered="false">
              <a-table :data="registeredFields" :columns="registeredColumns" :pagination="false" row-key="name" size="small" />
            </a-card>
          </a-collapse-item>
          <a-collapse-item key="unregistered" :header="`未注册字段（${unregisteredCount}）`">
            <a-card :bordered="false">
              <a-table :data="unregisteredFields" :columns="unregisteredColumns" :pagination="false" row-key="name" size="small">
                <template #selectedCell="{ record }">
                  <a-switch v-model="record.selected" size="small" />
                </template>
                <template #codeCell="{ record }">
                  <a-input v-model="record.code" placeholder="特征编码" />
                </template>
                <template #cnNameCell="{ record }">
                  <a-input v-model="record.cnName" placeholder="中文名" />
                </template>
                <template #dataTypeCell="{ record }">
                  <a-select v-model="record.dataType" placeholder="数据类型">
                    <a-option value="int">int</a-option>
                    <a-option value="double">double</a-option>
                    <a-option value="string">string</a-option>
                    <a-option value="timestamp">timestamp</a-option>
                  </a-select>
                </template>
                <template #defaultValueCell="{ record }">
                  <a-input v-model="record.defaultValue" placeholder="默认值" />
                </template>
              </a-table>
              <a-space style="margin-top: 8px">
                <a-button
                  type="primary"
                  size="small"
                  :disabled="!unregisteredFields.some(f => f.selected)"
                  @click="registerAll"
                >
                  注册选中
                </a-button>
                <a-button size="small" @click="runFieldValidate">执行校验</a-button>
                <a-tag v-if="fieldMsg" color="green">{{ fieldMsg }}</a-tag>
              </a-space>
            </a-card>
          </a-collapse-item>
        </a-collapse>
      </a-collapse-item>
      <a-collapse-item key="confirm" header="3. 确认提交">
        <a-descriptions bordered :column="1">
          <a-descriptions-item label="数据表">{{ createForm.table }}</a-descriptions-item>
          <a-descriptions-item label="表类型">{{ tableTypeLabel(createForm.tableType) }}</a-descriptions-item>
          <a-descriptions-item label="主键字段">{{ createForm.primaryKey }}</a-descriptions-item>
          <a-descriptions-item label="分区字段">{{ (createForm.partitionFields || []).join(', ') || '-' }}</a-descriptions-item>
          <a-descriptions-item label="特征描述">{{ createForm.description || '-' }}</a-descriptions-item>
          <a-descriptions-item label="本次注册字段">{{ (unregisteredFields.filter(f=>f.selected).map(f=>f.name)).join(', ') || '-' }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-item>
    </a-collapse>
    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submitCreate">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { featureAPI } from '@/modules/offline-model/api'
import { tableTypeLabel, registeredColumns, unregisteredColumns } from '../shared'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'success'])

const createForm = reactive({ table: '', tableType: '', primaryKey: '', partitionFields: [], description: '', majorCategories: [] })
const tableList = ref([])
const tableColumns = ref([])
const registeredFields = ref([])
const unregisteredFields = ref([])
const registeredCount = computed(() => registeredFields.value.length)
const unregisteredCount = computed(() => unregisteredFields.value.length)
const metaMsg = ref('')
const fieldMsg = ref('')

// 抽屉打开时加载数据表列表
watch(() => props.visible, async (val) => {
  if (val) {
    metaMsg.value = ''
    fieldMsg.value = ''
    try {
      const res = await featureAPI.listTables()
      tableList.value = res.success ? res.data : []
      if (tableList.value.length > 0) {
        createForm.table = tableList.value[0].name
        await onTableChange(createForm.table)
      }
    } catch (error) {
      console.error('获取数据表失败:', error)
      Message.error({ content: '获取数据表失败', duration: 6000 })
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const onTableChange = async (name) => {
  try {
    const meta = await featureAPI.getTableMeta(name)
    const metaData = meta.success ? meta.data : meta
    createForm.table = name
    createForm.tableType = metaData?.type || ''
    createForm.primaryKey = metaData?.primaryKey || ''
    createForm.description = metaData?.description || ''
    createForm.partitionFields = metaData?.partitionFields || []

    const colsRes = await featureAPI.getTableColumns(name)
    tableColumns.value = colsRes.success ? colsRes.data : []

    const regRes = await featureAPI.getRegisteredFields(name)
    registeredFields.value = regRes.success ? regRes.data : []

    const unregRes = await featureAPI.getUnregisteredFields(name)
    const rawUnreg = unregRes.success ? unregRes.data : []
    unregisteredFields.value = rawUnreg.map(c => ({
      name: c.name,
      type: c.type,
      code: c.name,
      cnName: c.name,
      onlineTime: '',
      dataType: c.type,
      defaultValue: '',
      processingLogic: '',
      batch: '',
      remark: '',
      level1: '',
      level2: '',
      selected: true
    }))
  } catch (error) {
    console.error('获取表信息失败:', error)
    Message.error({ content: '获取表信息失败', duration: 6000 })
  }
}

const saveMeta = async () => {
  if (!createForm.table) return
  try {
    const res = await featureAPI.setTableMeta(createForm.table, {
      type: createForm.tableType,
      primaryKey: createForm.primaryKey,
      description: createForm.description,
      partitionFields: createForm.partitionFields
    })
    if (res.success) metaMsg.value = '元信息已保存'
  } catch (error) {
    console.error('保存元信息失败:', error)
    Message.error({ content: '保存元信息失败', duration: 6000 })
  }
}

const registerAll = async () => {
  if (!createForm.table) return
  const selected = unregisteredFields.value.filter(f => f.selected)
  if (selected.length === 0) {
    Message.warning({ content: '请在未注册字段中选择要注册的字段', duration: 3000 })
    return
  }
  try {
    const res = await featureAPI.batchRegisterFields(createForm.table, selected)
    registeredFields.value = res.success ? res.data : []

    const unregRes = await featureAPI.getUnregisteredFields(createForm.table)
    const newUnreg = unregRes.success ? unregRes.data : []
    unregisteredFields.value = newUnreg.map(c => ({
      name: c.name,
      type: c.type,
      code: c.name,
      cnName: c.name,
      onlineTime: '',
      dataType: c.type,
      defaultValue: '',
      processingLogic: '',
      batch: '',
      remark: '',
      level1: '',
      level2: '',
      selected: true
    }))
  } catch (error) {
    console.error('批量注册字段失败:', error)
    Message.error({ content: '批量注册字段失败', duration: 6000 })
  }
}

const runFieldValidate = () => {
  const ok = unregisteredFields.value.filter(f => f.selected).length > 0
  fieldMsg.value = ok ? '校验通过' : '校验不通过，请选择需注册字段'
}

const submitCreate = async () => {
  if (!createForm.table) {
    Message.warning({ content: '请选择数据表', duration: 3000 })
    return
  }
  const selected = unregisteredFields.value.filter(f => f.selected)
  if (selected.length === 0) {
    Message.warning({ content: '请在未注册字段中选择要注册的字段', duration: 3000 })
    return
  }
  try {
    const res = await featureAPI.batchRegisterFields(createForm.table, selected)
    if (res.success) {
      Message.success({ content: '特征注册完成', duration: 3000 })
      emit('update:visible', false)
      emit('success')
    } else {
      Message.error({ content: res?.message || '注册失败', duration: 6000 })
    }
  } catch (error) {
    console.error('特征注册失败:', error)
    Message.error({ content: '特征注册失败', duration: 6000 })
  }
}
</script>
