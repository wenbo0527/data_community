<template>
  <div class="backtrack-create-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/risk/model-offline-analysis/model-backtrack">模型回溯</a-breadcrumb-item>
        <a-breadcrumb-item>新建回溯</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">新建回溯</h1>
      <div class="mode-selector" v-if="!routeParams.mode">
        <a-radio-group v-model="createMode" type="button" @change="handleModeChange">
          <a-radio v-for="option in modeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-radio>
        </a-radio-group>
      </div>
      <div class="step-indicator" v-if="currentStep <= totalSteps">
        <a-steps :current="currentStep" size="small">
          <a-step>选择模型</a-step>
          <a-step>配置数据</a-step>
          <a-step>字段映射</a-step>
          <a-step>确认创建</a-step>
        </a-steps>
      </div>
    </div>
    <div class="page-content">
      <a-collapse :default-active-key="['model','sample','required','match','output']" :bordered="false">
        <a-collapse-item key="model" header="1. 选择回溯模型">
          <a-form :model="modelForm" layout="vertical">
            <a-form-item label="模型与版本" required>
              <a-cascader
                v-model="modelForm.modelVersion"
                :options="modelOptions"
                allow-search
                change-on-select
                placeholder="请选择模型与版本"
                @change="onModelVersionChange"
              />
            </a-form-item>
          </a-form>
        </a-collapse-item>

        <a-collapse-item key="sample" :header="createMode === 'single' ? '2. 选择样本数据' : '2. 配置周期回溯'" v-if="sampleForm.mode===createMode">
          <a-form :model="sampleForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="数据来源" required>
                  <a-radio-group v-model="sampleForm.sourceType">
                    <a-radio value="doris">Doris</a-radio>
                    <a-radio value="hive">Hive</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="库名" required>
                  <a-select v-model="sampleForm.dbName" placeholder="请选择库名" @change="onDbChange">
                    <a-option v-for="d in dbOptions" :key="d.name" :value="d.name">{{ d.name }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="表名" required>
                  <a-select v-model="sampleForm.tableName" placeholder="请选择表名" @change="onTableNameChange">
                    <a-option v-for="t in tableNameOptions" :key="t.name" :value="t.name">{{ t.name }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="样本表" required>
              <a-select v-model="sampleForm.table" placeholder="请选择数据表" allow-search @change="onTableChange">
                <a-option v-for="t in tableOptions" :key="t.name" :value="t.name">{{ t.name }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="样本表字段">
              <a-table :data="tableColumns" :columns="tableColumnDefs" row-key="name" size="small" :pagination="false" />
            </a-form-item>
          </a-form>
        </a-collapse-item>

        <a-collapse-item key="required" header="3. 必填字段映射">
          <a-table :data="requiredMappings" :columns="requiredDefs" row-key="name" size="small" :pagination="false">
            <template #targetCell="{ record }">
              <a-select v-model="record.target" placeholder="选择样本字段" allow-search @change="updateRequiredStatus(record)">
                <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">{{ c.name }} ({{ c.type }})</a-option>
              </a-select>
            </template>
            <template #statusCell="{ record }">
              <a-tag :color="record.status==='matched' ? 'green' : 'red'">{{ record.status==='matched' ? '已匹配' : '未匹配' }}</a-tag>
            </template>
          </a-table>
        </a-collapse-item>

        <a-collapse-item key="match" header="4. 入参匹配情况">
          <a-table :data="inputMappings" :columns="mappingDefs" row-key="rowKey" size="small" :pagination="false">
            <template #targetCell="{ record }">
              <a-select v-model="record.target" placeholder="选择特征中心特征" allow-search @change="updateInputStatus(record)">
                <a-option v-for="f in featureTargets" :key="f.name" :value="f.name">{{ f.cnName || f.name }} ({{ f.dataType || f.type || '' }})</a-option>
              </a-select>
            </template>
            <template #statusCell="{ record }">
              <a-tag :color="record.status==='matched' ? 'green' : 'red'">{{ record.status==='matched' ? '已匹配' : '未匹配' }}</a-tag>
            </template>
            <template #fromCell="{ record }">
              <a-tag>{{ record.from || '当前模型' }}</a-tag>
            </template>
          </a-table>
          <div class="match-summary">已匹配 {{ matchedCount }} / {{ inputMappings.length }}，未匹配 {{ inputMappings.length - matchedCount }}</div>
        </a-collapse-item>

        <a-collapse-item key="output" header="5. 输出信息">
          <a-table :data="modelOutputs" :columns="modelOutputDefs" row-key="name" size="small" :pagination="false" />
        </a-collapse-item>
      </a-collapse>
    </div>

    <div class="actions-bar">
      <div class="actions-inner">
        <a-button @click="handleCancel">返回</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">创建回溯</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { backtrackAPI, featureAPI, modelAPI } from '@/api/offlineModel'
import { 
  getBacktrackRouteParams, 
  CREATE_MODES,
  isFromRiskModule 
} from '@/utils/model-backtrack-router'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)

// 获取路由参数
const routeParams = getBacktrackRouteParams(route)
const isFromRisk = computed(() => isFromRiskModule(route))
console.log('isFromRisk:', isFromRisk.value)

// 步骤控制
const currentStep = ref(1)
const totalSteps = ref(4)

// 模式选择
const createMode = ref(routeParams.mode || CREATE_MODES.SINGLE)
const modeOptions = [
  { label: '单次回溯', value: CREATE_MODES.SINGLE, description: '一次性执行模型回溯任务' },
  { label: '周期回溯', value: CREATE_MODES.PERIODIC, description: '定期执行模型回溯任务' }
]

// 样本表
const sampleForm = ref({ mode: 'single', sourceType: 'doris', dbName: '', tableName: '', table: '' })
const dbOptions = ref([])
const tableNameOptions = ref([])
const tableOptions = ref([])
const tableColumns = ref([])
const tableColumnDefs = [
  { title: '字段名', dataIndex: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 }
]
const requiredMappings = ref([])
const requiredDefs = [
  { title: '字段', dataIndex: 'name', width: 140 },
  { title: '说明', dataIndex: 'label', width: 160 },
  { title: '样本字段', dataIndex: 'target', slotName: 'targetCell', width: 220 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 120 }
]

// 观测日期
const observeForm = ref({ observeDate: '', dateRange: [] })

// 模型服务与入参/出参
const modelForm = ref({ serviceName: '', selectedVersion: '', modelVersion: [] })
const platformServices = ref([])
const modelInputs = ref([])
const modelOutputs = ref([])
const modelOptions = ref([])
const modelOutputDefs = [
  { title: '出参名', dataIndex: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '描述', dataIndex: 'description' }
]

// 入参匹配
const inputMappings = ref([])
const featureTargets = ref([])
const mappingDefs = [
  { title: '入参名', dataIndex: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', width: 120 },
  { title: '来源', dataIndex: 'from', slotName: 'fromCell', width: 140 },
  { title: '特征中心特征', dataIndex: 'target', slotName: 'targetCell', width: 260 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 120 }
]
const matchedCount = computed(() => inputMappings.value.filter(i => i.status === 'matched').length)

// 初始化加载表与模型服务
const loadTables = async () => {
  try {
    const res = await featureAPI.listTables()
    tableOptions.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (e) {
    // 忽略加载错误
  }
}

const onModelVersionChange = async (value) => {
  let serviceName = ''
  let version = ''
  if (Array.isArray(value) && value.length) {
    serviceName = value[0]
    version = value[1] || ''
  } else if (typeof value === 'string') {
    const parentOpt = (modelOptions.value || []).find(o => (o.children || []).some(c => c.value === value))
    if (parentOpt) {
      serviceName = parentOpt.value
      version = value
      modelForm.value.modelVersion = [serviceName, version]
    } else {
      serviceName = value
      const opt = (modelOptions.value || []).find(o => o.value === serviceName)
      version = opt?.children?.[0]?.value || ''
      modelForm.value.modelVersion = version ? [serviceName, version] : [serviceName]
    }
  }
  if (!serviceName) return
  modelForm.value.serviceName = serviceName
  modelForm.value.selectedVersion = version
  Message.info(`选择模型: ${serviceName}${version ? ' / ' + version : ''}`)
  await onServiceChange(serviceName)
}

const loadServices = async () => {
  try {
    const listRes = await modelAPI.listPlatformModels()
    platformServices.value = listRes.data || []
    modelOptions.value = (platformServices.value || []).map(p => ({
      value: p.serviceName,
      label: p.name,
      children: [{ value: p.version, label: p.version }]
    }))
  } catch (e) {
    // 忽略加载错误
  }
}

onMounted(async () => {
  await loadTables()
  await loadServices()
  if (routeParams.mode && (routeParams.mode === CREATE_MODES.SINGLE || routeParams.mode === CREATE_MODES.PERIODIC)) {
    createMode.value = routeParams.mode
    sampleForm.value.mode = routeParams.mode
  }
  await onSourceChange()
})

watch(() => modelForm.value.modelVersion, async (val) => {
  if (Array.isArray(val) && val.length >= 2) {
    await onModelVersionChange(val)
  }
})

const onSourceChange = async () => {
  const res = await featureAPI.listDatabases(sampleForm.value.sourceType)
  dbOptions.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  sampleForm.value.dbName = ''
  tableNameOptions.value = []
  sampleForm.value.tableName = ''
}

const onDbChange = async (dbName) => {
  const res = await featureAPI.listTablesByDb(sampleForm.value.sourceType, dbName)
  tableNameOptions.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  sampleForm.value.tableName = ''
}

const onTableNameChange = async (tableName) => {
  sampleForm.value.table = tableName
  await onTableChange(tableName)
}

const onTableChange = async (name) => {
  try {
    const colsRes = await featureAPI.getTableColumns(name)
    tableColumns.value = Array.isArray(colsRes.data) ? colsRes.data : (colsRes.data?.data || [])
    const regRes = await featureAPI.getRegisteredFields(name)
    featureTargets.value = Array.isArray(regRes.data) ? regRes.data : (regRes.data?.data || [])
    inputMappings.value = inputMappings.value.map(m => ({
      ...m,
      status: featureTargets.value.some(f => f.name === m.target) ? 'matched' : 'unmatched'
    }))
    requiredMappings.value = requiredMappings.value.map(r => {
      const same = tableColumns.value.find(c => c.name === r.name)
      const target = r.target || (same ? same.name : '')
      return { ...r, target, status: target ? 'matched' : 'unmatched' }
    })
  } catch (e) {
    // 忽略加载错误
  }
}

const updateRequiredStatus = (record) => {
  record.status = record.target ? 'matched' : 'unmatched'
}
const updateInputStatus = (record) => {
  record.status = record.target ? 'matched' : 'unmatched'
}

const onServiceChange = async (serviceName) => {
  try {
    const res = await modelAPI.getPlatformModel(serviceName)
    if (res.success) {
      const p = res.data
      modelInputs.value = (p.inputs || []).map(i => ({ name: i.name, type: i.type, description: i.description || '' }))
      modelOutputs.value = (p.outputs || []).map(o => ({ name: o.name, type: o.type, description: o.description || '' }))
      const baseInputs = modelInputs.value.map(i => {
        const same = featureTargets.value.find(f => f.name === i.name)
        return { rowKey: `${p.serviceName}|${i.name}`, name: i.name, type: i.type, from: '当前模型', target: same ? same.name : '', status: same ? 'matched' : 'unmatched' }
      })
      let childInputs = []
      const depends = Array.isArray(p.dependsOn) ? p.dependsOn : []
      for (const d of depends) {
        try {
          const childRes = await modelAPI.getPlatformModel(d.serviceName)
          if (childRes.success) {
            const c = childRes.data
            const ci = (c.inputs || []).map(i => {
              const same = featureTargets.value.find(f => f.name === i.name)
              return { rowKey: `${c.serviceName}|${i.name}`, name: i.name, type: i.type, from: c.serviceName, target: same ? same.name : '', status: same ? 'matched' : 'unmatched' }
            })
            childInputs = childInputs.concat(ci)
          }
        } catch (e) {
          // 忽略单个依赖加载错误
        }
      }
      const merged = [...baseInputs, ...childInputs]
      const seen = new Set()
      inputMappings.value = merged.filter(r => {
        const k = r.rowKey
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      const pkSet = Array.from(new Set(['cert_no', ...(((p && p.pkFields) || []))]))
      requiredMappings.value = pkSet.map(name => {
        const same = tableColumns.value.find(c => c.name === name)
        const label = name === 'cert_no' ? '证件号' : name
        const target = same ? same.name : ''
        return { name, label, target, status: target ? 'matched' : 'unmatched' }
      })
      Message.info(`必填映射生成: ${requiredMappings.value.length} 项，入参: ${modelInputs.value.length} 项`)
      return p
    }
    return null
  } catch (e) {
    // 忽略加载错误
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const errors = []
    if (!sampleForm.value.table) errors.push('请选择样本表')
    if (!modelForm.value.serviceName) errors.push('请选择回溯模型')
    if ((requiredMappings.value || []).some(r => !r.target)) errors.push('请完成必填字段映射')
    
    if (errors.length > 0) {
      errors.forEach(error => Message.warning(error))
      submitting.value = false
      return
    }
    
    const mappings = inputMappings.value
      .filter(m => m.target)
      .map(m => ({
        serviceName: m.from === '当前模型' ? modelForm.value.serviceName : m.from,
        input: m.name,
        target: m.target
      }))

    const payload = {
      table: sampleForm.value.table,
      sourceType: sampleForm.value.sourceType,
      dbName: sampleForm.value.dbName,
      tableName: sampleForm.value.tableName,
      mode: sampleForm.value.mode,
      observeDate: observeForm.value.observeDate,
      dateRange: observeForm.value.dateRange || [],
      serviceName: modelForm.value.serviceName,
      version: modelForm.value.selectedVersion,
      inputMappings: mappings,
      outputs: modelOutputs.value,
      requiredFieldMappings: requiredMappings.value.map(r => ({ field: r.name, target: r.target })),
    }
    
    const res = await backtrackAPI.createBacktrack(payload)
    if (res.success) {
      Message.success('回溯任务创建成功')
      router.push('/risk/model-offline-analysis/model-backtrack')
    } else {
      Message.error(res.message || '创建失败')
    }
  } catch (e) {
    if (e?.message) Message.error(e.message)
  } finally {
    submitting.value = false
  }
}

const handleModeChange = (mode) => {
  sampleForm.value.mode = mode
  if (mode === CREATE_MODES.PERIODIC) {
    observeForm.value.dateRange = []
  }
}

const handleCancel = () => {
  router.push('/risk/model-offline-analysis/model-backtrack')
}
</script>

<style scoped>
.backtrack-create-page { padding: 16px; background-color: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.mode-selector { margin-top: 16px; }
.step-indicator { margin-top: 16px; margin-bottom: 24px; }
.page-content { max-width: 1200px; margin: 0 auto; }
.match-summary { margin-top: 8px; color: #4e5969; }
.actions-bar { position: sticky; bottom: 0; background: rgba(255,255,255,0.95); border-top: 1px solid #e5e6eb; padding: 10px 0; margin-top: 12px; }
.actions-inner { display: flex; gap: 8px; justify-content: flex-end; max-width: 1200px; margin: 0 auto; padding: 0 8px; }
</style>
