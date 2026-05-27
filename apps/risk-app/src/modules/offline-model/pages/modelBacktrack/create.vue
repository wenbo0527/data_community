<template>
  <div class="backtrack-create-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/model-offline-analysis/model-backtrack">模型回溯</a-breadcrumb-item>
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
    </div>

    <div class="page-content">
      <!-- 步骤一：选择回溯模型 -->
      <a-collapse :active-key="activeKeys" :bordered="false">
        <a-collapse-item key="model" header="步骤一：选择回溯模型">
          <a-form :model="modelForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="任务名称">
                  <a-input
                    v-model="modelForm.taskName"
                    placeholder="请输入任务名称（选填，最大50字符）"
                    :max-length="50"
                    show-word-limit
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
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
              </a-col>
            </a-row>

            <!-- 观测日期范围：单次 / 周期共用的时间窗口 -->
            <a-row :gutter="16" v-if="createMode === CREATE_MODES.SINGLE">
              <a-col :span="12">
                <a-form-item label="观测日期范围" :extra="createMode === CREATE_MODES.SINGLE ? '定义本次回溯的时间范围' : ''">
                  <a-range-picker
                    v-model="observeForm.dateRange"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    :placeholder="['开始日期', '结束日期']"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-collapse-item>

        <!-- 步骤二：配置样本数据 / 周期回溯 -->
        <a-collapse-item key="sample" :header="createMode === CREATE_MODES.SINGLE ? '步骤二：选择样本数据' : '步骤二：配置周期回溯'">
          <!-- 周期回溯专用配置区 -->
          <template v-if="createMode === CREATE_MODES.PERIODIC">
            <a-divider orientation="left">周期执行配置</a-divider>
            <a-row :gutter="16">
              <!-- 左：执行频率 -->
              <a-col :span="8">
                <a-form-item label="执行频率" required>
                  <a-radio-group v-model="sampleForm.periodicity" style="flex-direction: column; align-items: flex-start;">
                    <a-radio value="daily">每日</a-radio>
                    <a-radio value="weekly">每周</a-radio>
                    <a-radio value="monthly">每月</a-radio>
                  </a-radio-group>
                </a-form-item>
                <!-- 每周具体星期 -->
                <a-form-item v-if="sampleForm.periodicity === 'weekly'" label="选择星期" required>
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
                <!-- 每月具体日期 -->
                <a-form-item v-if="sampleForm.periodicity === 'monthly'" label="选择日期" required>
                  <a-select v-model="sampleForm.monthDays" placeholder="选择日期" multiple allow-clear style="width: 100%;">
                    <a-option v-for="d in monthDayOptions" :key="d" :value="d">{{ d }}号</a-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <!-- 中：触发方式 -->
              <a-col :span="8">
                <a-form-item label="触发方式" required>
                  <a-radio-group v-model="sampleForm.triggerType" style="flex-direction: column; align-items: flex-start;">
                    <a-radio value="schedule">定时触发</a-radio>
                    <a-radio value="subscribe">订阅袋鼠云任务</a-radio>
                  </a-radio-group>
                </a-form-item>
                <!-- 定时配置 -->
                <a-form-item v-if="sampleForm.triggerType === 'schedule'" label="执行时间">
                  <a-time-picker v-model="sampleForm.scheduleTime" format="HH:mm" placeholder="选择执行时间" style="width: 100%;" />
                </a-form-item>
                <!-- 订阅配置 -->
                <a-form-item v-if="sampleForm.triggerType === 'subscribe'" label="选择袋鼠云任务">
                  <a-select v-model="sampleForm.kangarooTaskId" placeholder="选择任务ID" allow-search style="width: 100%;">
                    <a-option value="">无</a-option>
                    <a-option value="task-001">Doris表插入任务ID-001</a-option>
                    <a-option value="task-002">Doris表插入任务ID-002</a-option>
                    <a-option value="task-003">Hive表插入任务ID-001</a-option>
                    <a-option value="task-004">Hive表插入任务ID-002</a-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <!-- 右：执行时间窗口 -->
              <a-col :span="8">
                <a-form-item label="任务执行时间窗口" required>
                  <a-range-picker
                    :model-value="[sampleForm.taskStartDate, sampleForm.taskEndDate]"
                    @change="onTaskDateRangeChange"
                    @select="onTaskDateRangeSelect"
                    format="YYYY-MM-DD"
                    style="width: 100%; margin-bottom: 20px;"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </template>
          <!-- 样本表输入（共同部分）-->
          <a-divider orientation="left">样本表配置</a-divider>
          <a-form :model="sampleForm" layout="vertical">
            <div class="sample-table-row">
              <div class="field-label">
                <span class="label-text">样本表</span>
                <span class="required-star">*</span>
              </div>
              <div class="field-control">
                <div class="input-with-btn">
                  <a-input
                    v-model="sampleForm.tableNameInput"
                    placeholder="请输入表名，例如: dw.user"
                    :status="tableInputStatus === 'error' ? 'error' : undefined"
                    allow-clear
                    @keyup.enter="handleTableValidate"
                  />
                  <a-button type="primary" @click="handleTableValidate" :loading="tableLoading">
                    {{ tableInputStatus === 'success' ? '重新拉取' : '拉取数据' }}
                  </a-button>
                </div>
                <div v-if="tableInputStatus === 'success'" class="field-status success">
                  <icon-check-circle /> 表存在，共 {{ tableColumns.length }} 个字段
                </div>
                <div v-if="tableInputStatus === 'error'" class="field-status error">
                  <icon-close-circle /> 表不存在，请检查表名是否正确
                </div>
              </div>
            </div>

            <!-- 样本表字段：拉取成功后才展示 -->
            <a-form-item v-if="tableColumns.length > 0" label="样本表字段">
              <template #label>样本表字段（共 {{ tableColumns.length }} 个）</template>
              <a-table :data="tableColumns" :columns="tableColumnDefs" row-key="name" size="small" :pagination="false" />
            </a-form-item>

            <!-- SQL 条件 -->
            <div class="sql-where-row">
              <div class="field-label">
                <span class="label-text">WHERE 条件追加</span>
              </div>
              <div class="field-control">
                <div class="sql-input-wrap">
                  <a-input
                    v-model="sampleForm.sqlWhere"
                    placeholder="例如: user_id > 1000 AND status = 'active'"
                    allow-clear
                  />
                  <div class="field-hint">直接输入 WHERE 子句条件部分，无需写 WHERE 关键字</div>
                </div>
              </div>
            </div>

            <!-- SQL 预览 -->
            <a-form-item label="SQL 预览">
              <div class="sql-preview-box">
                <div class="sql-preview-label">原始 SQL</div>
                <div class="sql-text"><code>{{ baseSQL }}</code></div>
                <template v-if="sampleForm.sqlWhere">
                  <div class="sql-preview-label">追加条件后</div>
                  <div class="sql-text highlighted"><code>{{ fullSQL }}</code></div>
                </template>
              </div>
            </a-form-item>
          </a-form>
        </a-collapse-item>

        <!-- 步骤三：必填字段映射 -->
        <a-collapse-item key="required" header="步骤三：必填字段映射">
          <div class="section-tip">根据样本表字段，完成以下必填字段的映射匹配</div>
          <a-table :data="requiredMappings" :columns="requiredDefs" row-key="name" size="small" :pagination="false">
            <template #targetCell="{ record }">
              <a-select
                v-model="record.target"
                placeholder="选择样本字段"
                allow-search
                style="width: 100%;"
                @change="updateRequiredStatus(record)"
              >
                <a-option v-for="c in tableColumns" :key="c.name" :value="c.name">
                  {{ c.name }} <span class="col-type">{{ c.type }}</span>
                </a-option>
              </a-select>
            </template>
            <template #encryptedCell="{ record }">
              <a-tooltip content="关联时是否对字段加密">
                <a-switch v-model="record.isEncrypted" size="small" />
              </a-tooltip>
            </template>
            <template #statusCell="{ record }">
              <a-tag :color="record.status === 'matched' ? 'green' : 'red'" class="status-tag">
                {{ record.status === 'matched' ? '已匹配' : '未匹配' }}
              </a-tag>
            </template>
          </a-table>
        </a-collapse-item>

        <!-- 步骤四：入参匹配 -->
        <a-collapse-item key="match" header="步骤四：入参匹配">
          <div class="section-tip">
            已匹配 <a-badge :count="matchedCount" :max-count="99" style="margin: 0 4px;" />{{ matchedCount }} / {{ inputMappings.length }}，未匹配 {{ inputMappings.length - matchedCount }}
          </div>
          <a-table :data="inputMappings" :columns="mappingDefs" row-key="rowKey" size="small" :pagination="false">
            <template #targetCell="{ record }">
              <a-select
                v-model="record.target"
                placeholder="选择特征中心特征"
                allow-search
                style="width: 100%;"
                @change="updateInputStatus(record)"
              >
                <a-option v-for="f in featureTargets" :key="f.name" :value="f.name">
                  {{ f.cnName || f.name }} <span class="col-type">{{ f.dataType || f.type || '' }}</span>
                </a-option>
              </a-select>
            </template>
            <template #statusCell="{ record }">
              <a-tag :color="record.status === 'matched' ? 'green' : 'red'" class="status-tag">
                {{ record.status === 'matched' ? '已匹配' : '未匹配' }}
              </a-tag>
            </template>
            <template #fromCell="{ record }">
              <a-tag :color="record.from === '当前模型' ? 'arcoblue' : 'orange'">{{ record.from || '当前模型' }}</a-tag>
            </template>
          </a-table>
        </a-collapse-item>

        <!-- 步骤五：输出信息 -->
        <a-collapse-item key="output" header="步骤五：输出信息">
          <a-table :data="modelOutputs" :columns="modelOutputDefs" row-key="name" size="small" :pagination="false" />
        </a-collapse-item>
      </a-collapse>
    </div>

    <!-- 底部操作栏 -->
    <div class="actions-bar">
      <div class="actions-inner">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">创建回溯</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { backtrackAPI } from '@/modules/offline-model/api'
import { featureAPI } from '@/modules/offline-model/api'
import { modelAPI } from '@/modules/offline-model/api'
import {
  getBacktrackRouteParams,
  CREATE_MODES,
  isFromRiskModule
} from '@/modules/offline-model/utils/model-backtrack-router'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)

// 折叠面板默认全部展开
const activeKeys = ref(['model', 'sample', 'required', 'match', 'output'])

// 获取路由参数
const routeParams = getBacktrackRouteParams(route)
const isFromRisk = computed(() => isFromRiskModule(route))

// 模式选择
const createMode = ref(routeParams.mode || CREATE_MODES.SINGLE)
const modeOptions = [
  { label: '单次回溯', value: CREATE_MODES.SINGLE },
  { label: '周期回溯', value: CREATE_MODES.PERIODIC }
]

// 生成每月日期选项
const monthDayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString())

// 样本表
const sampleForm = ref({
  mode: CREATE_MODES.SINGLE,
  sourceType: 'doris',
  tableNameInput: '',
  sqlWhere: '',
  periodicity: 'daily',
  weekDays: [],
  monthDays: [],
  triggerType: 'schedule',
  scheduleTime: null,
  kangarooTaskId: '',
  taskStartDate: null,
  taskEndDate: null
})
const tableColumns = ref([])
const tableColumnDefs = [
  { title: '字段名', dataIndex: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', width: 160 }
]
const tableLoading = ref(false)
const tableInputStatus = ref('')
const requiredMappings = ref([])
const requiredDefs = [
  { title: '字段', dataIndex: 'name', width: 160 },
  { title: '说明', dataIndex: 'label', width: 160 },
  { title: '映射到样本字段', dataIndex: 'target', slotName: 'targetCell', width: 260 },
  { title: '关联加密', dataIndex: 'isEncrypted', slotName: 'encryptedCell', width: 100, align: 'center' },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 100, align: 'center' }
]

// 观测日期
const observeForm = ref({ observeDate: '', dateRange: [] })

// SQL 预览
const baseSQL = computed(() => {
  return sampleForm.value.tableNameInput ? `SELECT * FROM ${sampleForm.value.tableNameInput}` : ''
})
const fullSQL = computed(() => {
  return sampleForm.value.sqlWhere ? `${baseSQL.value} WHERE ${sampleForm.value.sqlWhere}` : baseSQL.value
})

// 模型
const modelForm = ref({ serviceName: '', selectedVersion: '', modelVersion: [], taskName: '' })
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
  { title: '映射到特征中心', dataIndex: 'target', slotName: 'targetCell', width: 280 },
  { title: '状态', dataIndex: 'status', slotName: 'statusCell', width: 100, align: 'center' }
]
const matchedCount = computed(() => inputMappings.value.filter(i => i.status === 'matched').length)

// v1.3: 样本表输入 + 拉取数据
const handleTableValidate = async () => {
  const tableName = sampleForm.value.tableNameInput?.trim()
  if (!tableName) {
    Message.warning('请输入表名')
    return
  }
  tableLoading.value = true
  tableInputStatus.value = ''
  tableColumns.value = []
  // Mock 样本表字段（正式环境替换为真实 API）
  const MOCK_TABLES = {
    'dw.user': [
      { name: 'user_id', type: 'bigint', comment: '用户ID' },
      { name: 'cert_no', type: 'varchar(18)', comment: '证件号码' },
      { name: 'mobile', type: 'varchar(11)', comment: '手机号' },
      { name: 'name', type: 'varchar(50)', comment: '姓名' },
      { name: 'gender', type: 'varchar(2)', comment: '性别' },
      { name: 'age', type: 'int', comment: '年龄' },
      { name: 'city', type: 'varchar(50)', comment: '城市' },
      { name: 'register_date', type: 'date', comment: '注册日期' },
      { name: 'status', type: 'varchar(10)', comment: '账户状态' },
      { name: 'update_time', type: 'datetime', comment: '更新时间' }
    ],
    'dw.user_credit': [
      { name: 'user_id', type: 'bigint', comment: '用户ID' },
      { name: 'cert_no', type: 'varchar(18)', comment: '证件号码' },
      { name: 'mobile', type: 'varchar(11)', comment: '手机号' },
      { name: 'credit_limit', type: 'decimal(18,2)', comment: '授信额度' },
      { name: 'used_limit', type: 'decimal(18,2)', comment: '已用额度' },
      { name: 'open_date', type: 'date', comment: '开户日期' },
      { name: 'level', type: 'varchar(10)', comment: '信用等级' },
      { name: 'risk_score', type: 'int', comment: '风险评分' },
      { name: 'overdue_count', type: 'int', comment: '逾期次数' },
      { name: 'loan_count', type: 'int', comment: '历史贷款笔数' },
      { name: 'update_time', type: 'datetime', comment: '更新时间' }
    ],
    'dw.transaction': [
      { name: 'trans_id', type: 'varchar(32)', comment: '交易流水号' },
      { name: 'user_id', type: 'bigint', comment: '用户ID' },
      { name: 'amount', type: 'decimal(18,2)', comment: '交易金额' },
      { name: 'trans_type', type: 'varchar(20)', comment: '交易类型' },
      { name: 'product_name', type: 'varchar(50)', comment: '产品名称' },
      { name: 'channel', type: 'varchar(20)', comment: '渠道来源' },
      { name: 'trans_date', type: 'date', comment: '交易日期' },
      { name: 'status', type: 'varchar(10)', comment: '交易状态' },
      { name: 'merchant_name', type: 'varchar(100)', comment: '商户名称' },
      { name: 'create_time', type: 'datetime', comment: '创建时间' }
    ]
  }
  try {
    const mockCols = MOCK_TABLES[tableName]
    const cols = mockCols || []
    if (cols.length > 0) {
      tableColumns.value = cols
      tableInputStatus.value = 'success'
      requiredMappings.value = requiredMappings.value.map(r => {
        const same = tableColumns.value.find(c => c.name === r.name)
        const target = r.target || (same ? same.name : '')
        return { ...r, target, status: target ? 'matched' : 'unmatched', isEncrypted: r.isEncrypted || false }
      })
    } else {
      tableInputStatus.value = 'error'
    }
  } catch {
    tableInputStatus.value = 'error'
  } finally {
    tableLoading.value = false
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
  } catch {}
}
loadServices()

onMounted(async () => {
  if (routeParams.mode && (routeParams.mode === CREATE_MODES.SINGLE || routeParams.mode === CREATE_MODES.PERIODIC)) {
    createMode.value = routeParams.mode
    sampleForm.value.mode = routeParams.mode
  }
})

watch(() => modelForm.value.modelVersion, async (val) => {
  if (Array.isArray(val) && val.length >= 2) {
    await onModelVersionChange(val)
  }
})

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
        } catch {}
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
        return { name, label, target, status: target ? 'matched' : 'unmatched', isEncrypted: false }
      })
      Message.info(`必填映射 ${requiredMappings.value.length} 项，入参 ${modelInputs.value.length} 项`)
    }
  } catch (e) {}
}

const updateRequiredStatus = (record) => {
  record.status = record.target ? 'matched' : 'unmatched'
}
const updateInputStatus = (record) => {
  record.status = record.target ? 'matched' : 'unmatched'
}

const onTaskDateRangeChange = (dateString, date) => {
  sampleForm.value.taskStartDate = date[0]
  sampleForm.value.taskEndDate = date[1]
}
const onTaskDateRangeSelect = (dateString, date) => {
  sampleForm.value.taskStartDate = date[0]
  sampleForm.value.taskEndDate = date[1]
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const errors = []
    if (!sampleForm.value.tableNameInput) errors.push('请输入样本表名')
    if (!modelForm.value.serviceName) errors.push('请选择回溯模型')
    if ((requiredMappings.value || []).some(r => !r.target)) errors.push('请完成必填字段映射')
    if (createMode.value === CREATE_MODES.PERIODIC) {
      if (!sampleForm.value.taskStartDate) errors.push('请选择任务执行开始时间')
      if (!sampleForm.value.taskEndDate) errors.push('请选择任务执行结束时间')
    }
    if (errors.length > 0) {
      errors.forEach(error => Message.warning(error))
      return
    }
    const mappings = inputMappings.value.map(m => ({ input: m.name, target: m.target }))
    const payload = {
      table: sampleForm.value.tableNameInput,
      sourceType: sampleForm.value.sourceType,
      mode: sampleForm.value.mode,
      observeDate: observeForm.value.observeDate,
      dateRange: observeForm.value.dateRange || [],
      serviceName: modelForm.value.serviceName,
      version: modelForm.value.selectedVersion,
      taskName: modelForm.value.taskName,
      inputMappings: mappings,
      outputs: modelOutputs.value,
      requiredFieldMappings: requiredMappings.value.map(r => ({ field: r.name, target: r.target, isEncrypted: !!r.isEncrypted })),
      periodicity: sampleForm.value.periodicity,
      kangarooTaskId: sampleForm.value.kangarooTaskId,
      sqlWhere: sampleForm.value.sqlWhere,
      taskStartDate: sampleForm.value.taskStartDate,
      taskEndDate: sampleForm.value.taskEndDate,
    }
    const res = await backtrackAPI.createBacktrack(payload)
    if (res.success) {
      Message.success('回溯任务创建成功')
      router.push(isFromRisk.value ? '/risk/model-offline-analysis/model-backtrack' : '/model-offline-analysis/model-backtrack')
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
  router.push(isFromRisk.value ? '/risk/model-offline-analysis/model-backtrack' : '/model-offline-analysis/model-backtrack')
}
</script>

<style scoped>
.backtrack-create-page {
  padding: 16px;
  background-color: #fff;
  min-height: 100%;
}
.page-header { margin-bottom: 16px; }
.page-title { margin: 0 0 12px; font-size: 18px; font-weight: 600; }
.mode-selector { margin-bottom: 4px; }
.page-content { max-width: 1280px; margin: 0 auto; }

/* 操作栏 */
.actions-bar {
  position: sticky;
  bottom: 0;
  background: rgba(255,255,255,0.97);
  border-top: 1px solid var(--color-neutral-3);
  padding: 12px 0;
  margin-top: 16px;
  z-index: 10;
}
.actions-inner {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 折叠面板标题数字对齐 */
:deep(.arco-collapse-item-header) { font-weight: 500; }

/* 样本表输入 */
.table-input-row { display: flex; gap: 8px; align-items: center; }
.table-input-row .arco-input-wrapper { flex: 1; }

/* 样本表 & SQL 条件：标签+输入框同一行右侧对齐 */
.sample-table-row,
.sql-where-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 16px;
}
.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 100px;
  padding-top: 2px;
  font-size: 14px;
  color: var(--color-text-2);
}
.label-text { font-weight: 500; }
.required-star { color: rgb(var(--red-6)); margin-left: 2px; }
.field-control { flex: 1; }
.input-with-btn { display: flex; gap: 8px; align-items: center; }
.input-with-btn .arco-input-wrapper { flex: 1; }
.sql-input-wrap .field-hint { font-size: 12px; color: var(--color-text-3); margin-top: 4px; }

/* 字段状态 */
.field-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 6px;
}
.field-status.success { color: rgb(var(--green-6)); }
.field-status.error { color: rgb(var(--red-6)); }
.field-hint { color: var(--color-text-3); font-size: 12px; }

/* SQL 预览 */
.sql-preview-box {
  background: var(--color-fill-relaxed);
  border: 1px solid var(--color-neutral-3);
  border-radius: 6px;
  padding: 12px;
}
.sql-preview-label {
  font-size: 12px;
  color: var(--color-text-3);
  margin-bottom: 4px;
}
.sql-preview-label + .sql-text { margin-top: 0; }
.sql-preview-label:not(:first-child) { margin-top: 8px; }
.sql-text {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  word-break: break-all;
}
.sql-text.highlighted {
  color: rgb(var(--arcoblue-6));
  border: 1px solid rgb(var(--arcoblue-3));
}
.sql-text code {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}

/* section tip */
.section-tip {
  font-size: 13px;
  color: var(--color-text-3);
  margin-bottom: 10px;
}

/* 状态标签 */
.status-tag { font-size: 12px; }

/* select option 类型 */
.col-type { color: var(--color-text-3); font-size: 12px; margin-left: 6px; }
</style>
