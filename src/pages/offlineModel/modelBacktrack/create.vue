<template>
  <div class="backtrack-create-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/offline-model/model-backtrack">模型回溯</a-breadcrumb-item>
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

        <a-collapse-item key="sample" :header="createMode === CREATE_MODES.SINGLE ? '2. 选择样本数据' : '2. 配置周期回溯'" v-if="sampleForm.mode===createMode">
          <a-form :model="sampleForm" layout="vertical">
            <!-- 周期回溯配置 - 顶层 -->
            <template v-if="createMode === CREATE_MODES.PERIODIC">
              <a-divider orientation="left">周期任务配置</a-divider>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="任务发起时间" required>
                    <a-radio-group v-model="sampleForm.periodicity">
                      <a-radio value="daily">每日</a-radio>
                      <a-radio value="weekly">每周</a-radio>
                      <a-radio value="monthly">每月</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  
                  <!-- 每周具体星期选择 -->
                  <a-form-item v-if="sampleForm.periodicity === 'weekly'" label="每周具体时间" required>
                    <a-checkbox-group v-model="sampleForm.weekDays">
                      <a-checkbox value="1">周一</a-checkbox>
                      <a-checkbox value="2">周二</a-checkbox>
                      <a-checkbox value="3">周三</a-checkbox>
                      <a-checkbox value="4">周四</a-checkbox>
                      <a-checkbox value="5">周五</a-checkbox>
                      <a-checkbox value="6">周六</a-checkbox>
                      <a-checkbox value="0">周日</a-checkbox>
                    </a-checkbox-group>
                  </a-form-item>
                  
                  <!-- 每月具体日期选择 -->
                  <a-form-item v-if="sampleForm.periodicity === 'monthly'" label="每月具体日期" required>
                    <a-select 
                      v-model="sampleForm.monthDays" 
                      placeholder="选择每月执行日期" 
                      multiple
                      allow-clear
                    >
                      <a-option v-for="day in monthDayOptions" :key="day" :value="day">{{ day }}号</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                
                <a-col :span="12">
                  <a-form-item label="任务触发方式" required>
                    <a-radio-group v-model="sampleForm.triggerType">
                      <a-radio value="schedule">定时</a-radio>
                      <a-radio value="subscribe">订阅</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  
                  <!-- 定时任务配置 -->
                  <a-form-item v-if="sampleForm.triggerType === 'schedule'" label="执行时间">
                    <a-time-picker v-model="sampleForm.scheduleTime" format="HH:mm" placeholder="选择执行时间" style="width: 100%" />
                  </a-form-item>
                  
                  <!-- 订阅任务配置 -->
                  <a-form-item v-if="sampleForm.triggerType === 'subscribe'" label="订阅袋鼠云任务">
                    <a-select v-model="sampleForm.kangarooTaskId" placeholder="选择袋鼠云任务ID" allow-search>
                      <a-option value="">无</a-option>
                      <a-option value="task-001">Doris表插入任务ID-001</a-option>
                      <a-option value="task-002">Doris表插入任务ID-002</a-option>
                      <a-option value="task-003">Hive表插入任务ID-001</a-option>
                      <a-option value="task-004">Hive表插入任务ID-002</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
            
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
import { backtrackAPI } from '@/api/offlineModel'
import { featureAPI } from '@/api/offlineModel'
import { modelAPI } from '@/api/offlineModel'
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

// 步骤控制
const currentStep = ref(1)
const totalSteps = ref(4)

// 模式选择
const createMode = ref(routeParams.mode || CREATE_MODES.SINGLE)
const modeOptions = [
  { label: '单次回溯', value: CREATE_MODES.SINGLE, description: '一次性执行模型回溯任务' },
  { label: '周期回溯', value: CREATE_MODES.PERIODIC, description: '定期执行模型回溯任务' }
]

// 生成每月日期选项
const monthDayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString())

// 样本表
const sampleForm = ref({ 
  mode: CREATE_MODES.SINGLE, 
  sourceType: 'doris', 
  dbName: '', 
  tableName: '', 
  table: '', 
  periodicity: 'daily', 
  weekDays: [], // 每周具体星期
  monthDays: [], // 每月具体日期
  triggerType: 'schedule', // 任务触发方式：schedule(定时) 或 subscribe(订阅)
  scheduleTime: null, // 定时执行时间
  kangarooTaskId: '' 
})
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
const modelInputDefs = [
  { title: '入参名', dataIndex: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', width: 140 },
  { title: '描述', dataIndex: 'description' }
]
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
    console.log('[Backtrack] loadTables', tableOptions.value)
  } catch {}
}

const onModelVersionChange = async (value, options) => {
  console.log('[Backtrack] onModelVersionChange called', value, options)
  let serviceName = ''
  let version = ''
  if (Array.isArray(value) && value.length) {
    serviceName = value[0]
    version = value[1] || ''
  } else if (typeof value === 'string') {
    // 若选择的是版本值（如 'v1.0.0'），需要反查父级服务名
    const parentOpt = (modelOptions.value || []).find(o => (o.children || []).some(c => c.value === value))
    if (parentOpt) {
      serviceName = parentOpt.value
      version = value
      modelForm.value.modelVersion = [serviceName, version]
    } else {
      // 否则按服务名处理，自动取第一个版本
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
    console.log('[Backtrack] loadServices', platformServices.value)
    console.log('[Backtrack] modelOptions', modelOptions.value)
  } catch {}
}
loadTables()
loadServices()

onMounted(async () => {
  // 设置创建模式
  if (routeParams.mode && (routeParams.mode === CREATE_MODES.SINGLE || routeParams.mode === CREATE_MODES.PERIODIC)) {
    createMode.value = routeParams.mode
    sampleForm.value.mode = routeParams.mode
  }
  await onSourceChange()
})

// 兜底监听：确保模型版本选择后必填映射与入参匹配刷新
watch(() => modelForm.value.modelVersion, async (val) => {
  if (Array.isArray(val) && val.length >= 2) {
    console.log('[Backtrack] watch modelVersion', val)
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
    console.log('[Backtrack] onTableChange -> tableColumns', name, tableColumns.value)
    const regRes = await featureAPI.getRegisteredFields(name)
    featureTargets.value = Array.isArray(regRes.data) ? regRes.data : (regRes.data?.data || [])
    console.log('[Backtrack] onTableChange -> featureTargets', featureTargets.value)
    // 更新匹配状态
    inputMappings.value = inputMappings.value.map(m => ({
      ...m,
      status: featureTargets.value.some(f => f.name === m.target) ? 'matched' : 'unmatched'
    }))
    requiredMappings.value = requiredMappings.value.map(r => {
      const same = tableColumns.value.find(c => c.name === r.name)
      const target = r.target || (same ? same.name : '')
      return { ...r, target, status: target ? 'matched' : 'unmatched' }
    })
    console.log('[Backtrack] requiredMappings after table', requiredMappings.value)
    console.log('[Backtrack] inputMappings after table', inputMappings.value)
  } catch {}
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
      console.log('[Backtrack] onServiceChange success', serviceName, p)
      modelInputs.value = (p.inputs || []).map(i => ({ name: i.name, type: i.type, description: i.description || '' }))
      modelOutputs.value = (p.outputs || []).map(o => ({ name: o.name, type: o.type, description: o.description || '' }))
      console.log('[Backtrack] modelInputs', modelInputs.value)
      console.log('[Backtrack] modelOutputs', modelOutputs.value)
      // 初始化映射：按同名匹配
      const baseInputs = modelInputs.value.map(i => {
        const same = featureTargets.value.find(f => f.name === i.name)
        return { rowKey: `${p.serviceName}|${i.name}`, name: i.name, type: i.type, from: '当前模型', target: same ? same.name : '', status: same ? 'matched' : 'unmatched' }
      })
      // 处理依赖子模型的入参
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
        } catch {}
      }
      // 合并并去重（按 rowKey）
      const merged = [...baseInputs, ...childInputs]
      const seen = new Set()
      inputMappings.value = merged.filter(r => {
        const k = r.rowKey
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      // 生成必填字段映射（依赖模型主键）
      const pkSet = Array.from(new Set(['cert_no', ...(((p && p.pkFields) || []))]))
      requiredMappings.value = pkSet.map(name => {
        const same = tableColumns.value.find(c => c.name === name)
        const label = name === 'cert_no' ? '证件号' : name
        const target = same ? same.name : ''
        return { name, label, target, status: target ? 'matched' : 'unmatched' }
      })
      Message.info(`必填映射生成: ${requiredMappings.value.length} 项，入参: ${modelInputs.value.length} 项`)
      console.log('[Backtrack] built inputMappings', inputMappings.value)
      console.log('[Backtrack] built requiredMappings', requiredMappings.value)
      return p
    }
    console.log('[Backtrack] onServiceChange fail', serviceName, res)
    return null
  } catch (e) { console.log('[Backtrack] onServiceChange error', e) }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    // 表单验证
    const errors = []
    if (!sampleForm.value.table) errors.push('请选择样本表')
    if (!modelForm.value.serviceName) errors.push('请选择回溯模型')
    if ((requiredMappings.value || []).some(r => !r.target)) errors.push('请完成必填字段映射')
    
    if (errors.length > 0) {
      errors.forEach(error => Message.warning(error))
      submitting.value = false
      return
    }
    
    const mappings = inputMappings.value.map(m => ({ input: m.name, target: m.target }))
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
      // 周期回溯相关字段
      periodicity: sampleForm.value.periodicity,
      kangarooTaskId: sampleForm.value.kangarooTaskId,
    }
    
    console.log('[Backtrack] submit payload', payload)
    const res = await backtrackAPI.createBacktrack(payload)
    
    if (res.success) {
      Message.success('回溯任务创建成功')
      // 根据来源模块跳转回对应页面
      if (isFromRisk.value) {
        router.push('/risk/model-offline-analysis/model-backtrack')
      } else {
        router.push('/offline-model/model-backtrack')
      }
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
  // 重置相关表单数据
  if (mode === CREATE_MODES.PERIODIC) {
    observeForm.value.dateRange = []
  }
}

const handleCancel = () => {
  // 根据来源模块返回对应页面
  if (isFromRisk.value) {
    router.push('/risk/model-offline-analysis/model-backtrack')
  } else {
    router.push('/offline-model/model-backtrack')
  }
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
