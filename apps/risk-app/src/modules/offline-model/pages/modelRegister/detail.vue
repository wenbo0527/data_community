<template>
  <div class="model-detail-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/model-offline-analysis/model-register">模型注册</a-breadcrumb-item>
        <a-breadcrumb-item>模型详情</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">模型详情 #{{ id }}</h1>
    </div>
    <a-tabs type="card" :active-key="activeTab" @change="activeTab=$event">
      <a-tab-pane key="base" title="基础信息">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="模型ID">{{ id }}</a-descriptions-item>
          <a-descriptions-item label="服务名">{{ serviceName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="版本">{{ selectedVersion || '-' }}</a-descriptions-item>
        </a-descriptions>
        <div class="section">
          <h3>选择平台模型</h3>
          <a-form :model="modelForm" layout="inline">
            <a-form-item label="模型与版本" required>
              <a-cascader v-model="modelForm.modelVersion" :options="modelOptions" allow-search change-on-select placeholder="请选择模型与版本" @change="onModelVersionChange" />
            </a-form-item>
          </a-form>
        </div>
      </a-tab-pane>
      <a-tab-pane key="feature" title="输出特征化">
        <div class="section">
          <a-form :model="featureForm" layout="inline">
            <a-form-item label="目标表" required>
              <a-select v-model="featureForm.targetTable" placeholder="选择目标表" @change="onTargetTableChange">
                <a-option v-for="t in tableOptions" :key="t.name" :value="t.name">{{ t.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
        <a-table :data="outputRows" :columns="outputCols" row-key="name" size="small" :pagination="false">
          <template #statusCell="{ record }">
            <a-tag :color="record.registered ? 'green' : 'gray'">{{ record.registered ? '已注册' : '未注册' }}</a-tag>
          </template>
          <template #actionCell="{ record }">
            <a-button type="primary" size="small" :disabled="!featureForm.targetTable || record.registered" @click="registerOutput(record)">注册为特征</a-button>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
    <div class="actions-bar">
      <a-space>
        <a-button @click="handleBack">返回</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { modelAPI, featureAPI } from '@/modules/offline-model/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const activeTab = ref('base')

const serviceName = ref('')
const selectedVersion = ref('')
const modelForm = ref({ modelVersion: [] })
const modelOptions = ref([])

const outputs = ref([])
const outputRows = ref([])
const outputCols = [
  { title: '出参名', dataIndex: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', width: 120 },
  { title: '描述', dataIndex: 'description' },
  { title: '状态', dataIndex: 'registered', slotName: 'statusCell', width: 100 },
  { title: '操作', dataIndex: 'action', slotName: 'actionCell', width: 140 }
]

const featureForm = ref({ targetTable: '' })
const tableOptions = ref([])
const registeredSet = ref(new Set())

const handleBack = () => {
  router.push('/model-offline-analysis/model-register')
}

const loadServices = async () => {
  try {
    const res = await modelAPI.listPlatformModels()
    const list = res.data || []
    modelOptions.value = list.map(p => ({ value: p.serviceName, label: p.name, children: [{ value: p.version, label: p.version }] }))
  } catch {}
}

const loadTables = async () => {
  try {
    const res = await featureAPI.listTables()
    tableOptions.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch {}
}

const refreshRegistered = async () => {
  registeredSet.value = new Set()
  if (!featureForm.value.targetTable) return
  try {
    const res = await featureAPI.getRegisteredFields(featureForm.value.targetTable)
    const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    list.forEach(f => registeredSet.value.add(f.name))
  } catch {}
  outputRows.value = outputs.value.map(o => ({ ...o, registered: registeredSet.value.has(o.name) }))
}

const onModelVersionChange = async (value) => {
  let svc = ''
  let ver = ''
  if (Array.isArray(value) && value.length) { svc = value[0]; ver = value[1] || '' } else if (typeof value === 'string') { svc = value }
  if (!svc) return
  serviceName.value = svc
  selectedVersion.value = ver
  const res = await modelAPI.getPlatformModel(svc)
  if (res.success) {
    const p = res.data
    outputs.value = (p.outputs || []).map(o => ({ name: o.name, type: o.type, description: o.description || '' }))
    await refreshRegistered()
    Message.success('已加载平台模型输出')
  } else {
    Message.error(res.message || '加载失败')
  }
}

const onTargetTableChange = async () => {
  await refreshRegistered()
}

const registerOutput = async (record) => {
  if (!featureForm.value.targetTable) { Message.warning('请选择目标表'); return }
  const fields = [{
    name: record.name,
    level1: 'model_outputs',
    level2: serviceName.value || 'platform',
    cnName: record.name,
    dataType: record.type,
    defaultValue: '',
    processingLogic: '模型输出沉淀为特征',
    batch: '',
    remark: ''
  }]
  const res = await featureAPI.batchRegisterFields(featureForm.value.targetTable, fields)
  if (res.success) {
    Message.success('已注册为特征')
    await refreshRegistered()
  } else {
    Message.error(res.message || '注册失败')
  }
}

onMounted(async () => {
  await loadServices()
  await loadTables()
})
</script>

<style scoped>
.model-detail-page { padding: 16px; background: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.section { margin-top: 12px; }
.actions-bar { margin-top: 16px; }
</style>
