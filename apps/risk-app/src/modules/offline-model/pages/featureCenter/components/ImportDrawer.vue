<template>
  <a-drawer :visible="visible" width="90vw" title="批量导入特征" @cancel="handleClose" :mask-closable="false">
    <a-space style="margin-bottom: 12px">
      <a-button type="outline" @click="downloadTemplate">模板下载</a-button>
      <a-button type="primary" @click="addImportRow">新增一行</a-button>
      <a-button status="danger" @click="clearImportRows">清空</a-button>
    </a-space>
    <a-table :data="importRows" :columns="importColumns" row-key="__key" :pagination="false" size="small">
      <template #majorCategoryCell="{ record }">
        <a-select v-model="record.majorCategory" placeholder="特征大类">
          <a-option value="credit">征信变量</a-option>
          <a-option value="behavior">行为变量</a-option>
          <a-option value="model_output">模型输出</a-option>
        </a-select>
      </template>
      <template #level1Cell="{ record }">
        <a-select v-model="record.level1" placeholder="一级分类">
          <a-option v-for="opt in level1Options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #level2Cell="{ record }">
        <a-select v-model="record.level2" placeholder="二级分类">
          <a-option v-for="opt in level2Options(record.level1)" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
        </a-select>
      </template>
      <template #codeCell="{ record }">
        <a-input v-model="record.code" placeholder="特征编码" />
      </template>
      <template #nameCell="{ record }">
        <a-input v-model="record.name" placeholder="特征名称" />
      </template>
      <template #sourceTableCell="{ record }">
        <a-input v-model="record.sourceTable" placeholder="日模型来源表" />
      </template>
      <template #processingLogicCell="{ record }">
        <a-input v-model="record.processingLogic" placeholder="加工逻辑" />
      </template>
      <template #dataTypeCell="{ record }">
        <a-select v-model="record.dataType" placeholder="数据类型">
          <a-option value="int">int</a-option>
          <a-option value="double">double</a-option>
          <a-option value="string">string</a-option>
          <a-option value="timestamp">timestamp</a-option>
        </a-select>
      </template>
      <template #batchCell="{ record }">
        <a-input v-model="record.batch" placeholder="批次" />
      </template>
      <template #proposerCell="{ record }">
        <a-input v-model="record.proposer" placeholder="需求提出人" />
      </template>
      <template #developerCell="{ record }">
        <a-input v-model="record.developer" placeholder="开发人" />
      </template>
      <template #onlineTimeCell="{ record }">
        <a-date-picker v-model="record.onlineTime" style="width: 100%" />
      </template>
      <template #accepterCell="{ record }">
        <a-input v-model="record.accepter" placeholder="验收人" />
      </template>
      <template #remarkCell="{ record }">
        <a-input v-model="record.remark" placeholder="备注" />
      </template>
      <template #actionsCell="{ rowIndex }">
        <a-button size="mini" status="danger" @click="removeImportRow(rowIndex)">移除</a-button>
      </template>
    </a-table>
    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submitImport">导入</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { featureAPI } from '@/modules/offline-model/api'
import { level1Options, level2Options, typeMap } from '../shared'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'success'])

const importRows = ref([])
const importColumns = [
  { title: '特征大类', dataIndex: 'majorCategory', slotName: 'majorCategoryCell', width: 140 },
  { title: '一级分类', dataIndex: 'level1', slotName: 'level1Cell', width: 140 },
  { title: '二级分类', dataIndex: 'level2', slotName: 'level2Cell', width: 140 },
  { title: '特征编码', dataIndex: 'code', slotName: 'codeCell', width: 160 },
  { title: '特征名称', dataIndex: 'name', slotName: 'nameCell', width: 160 },
  { title: '日模型来源表', dataIndex: 'sourceTable', slotName: 'sourceTableCell', width: 160 },
  { title: '加工逻辑', dataIndex: 'processingLogic', slotName: 'processingLogicCell', width: 200 },
  { title: '数据类型', dataIndex: 'dataType', slotName: 'dataTypeCell', width: 140 },
  { title: '批次', dataIndex: 'batch', slotName: 'batchCell', width: 120 },
  { title: '需求提出人', dataIndex: 'proposer', slotName: 'proposerCell', width: 140 },
  { title: '开发人', dataIndex: 'developer', slotName: 'developerCell', width: 140 },
  { title: '上线时间', dataIndex: 'onlineTime', slotName: 'onlineTimeCell', width: 160 },
  { title: '验收人', dataIndex: 'accepter', slotName: 'accepterCell', width: 140 },
  { title: '备注', dataIndex: 'remark', slotName: 'remarkCell' },
  { title: '操作', dataIndex: 'actions', slotName: 'actionsCell', width: 100, fixed: 'right' }
]

// 抽屉打开时确保有一行数据
watch(() => props.visible, (val) => {
  if (val && importRows.value.length === 0) {
    addImportRow()
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const addImportRow = () => {
  importRows.value.push({
    __key: Date.now() + Math.random(),
    majorCategory: '', level1: '', level2: '', code: '', name: '', sourceTable: '', processingLogic: '', dataType: '', batch: '', proposer: '', developer: '', onlineTime: '', accepter: '', remark: ''
  })
}

const removeImportRow = (idx) => {
  importRows.value.splice(idx, 1)
}

const clearImportRows = () => {
  importRows.value = []
}

const submitImport = async () => {
  if (importRows.value.length === 0) {
    Message.warning({ content: '请先添加导入数据', duration: 3000 })
    return
  }
  const payload = importRows.value.map(r => ({
    name: r.name,
    code: r.code,
    type: typeMap(r.dataType),
    description: r.processingLogic || '',
    dataSource: r.sourceTable || '',
    updateFrequency: '按需',
    majorCategory: r.majorCategory,
    level1: r.level1,
    level2: r.level2,
    batch: r.batch,
    proposer: r.proposer,
    developer: r.developer,
    onlineTime: r.onlineTime,
    accepter: r.accepter,
    remark: r.remark
  }))
  try {
    const res = await featureAPI.importFeatures(payload)
    if (res.success) {
      Message.success({ content: res.message || '批量导入成功', duration: 3000 })
      emit('update:visible', false)
      emit('success')
    } else {
      Message.error({ content: res.message || '批量导入失败', duration: 6000 })
    }
  } catch (error) {
    console.error('批量导入失败:', error)
    Message.error({ content: '批量导入失败', duration: 6000 })
  }
}

const downloadTemplate = () => {
  const headers = ['majorCategory','level1','level2','code','name','sourceTable','processingLogic','dataType','batch','proposer','developer','onlineTime','accepter','remark']
  const csv = headers.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feature_import_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
