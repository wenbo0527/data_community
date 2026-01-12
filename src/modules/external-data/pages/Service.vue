<template>
  <div class="external-data-service">
    <a-page-header title="外数数据服务" />
    <a-card :bordered="true" class="toolbar">
      <a-form :model="filters" layout="inline">
        <a-form-item field="supplier" label="供应商">
          <a-select v-model="filters.supplier" allow-clear placeholder="选择供应商" style="width: 200px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="serviceType" label="服务类型">
          <a-select v-model="filters.serviceType" allow-clear placeholder="选择类型" style="width: 160px">
            <a-option value="API">API</a-option>
            <a-option value="文件">文件</a-option>
            <a-option value="数据库">数据库</a-option>
            <a-option value="平台工具">平台工具</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
          <a-button style="margin-left: 8px" type="outline" @click="openCreate">新增数据服务</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card title="服务列表">
      <a-table :data="displayedServices" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="服务名称" data-index="name" :width="200" />
          <a-table-column title="供应商" data-index="supplier" :width="160" />
          <a-table-column title="类型" :width="120">
            <template #cell="{ record }">{{ record.serviceType }}</template>
          </a-table-column>
          <a-table-column title="计费模式" :width="140">
            <template #cell="{ record }">{{ billingModeLabel(record.billingMode) }}</template>
          </a-table-column>
          <a-table-column title="单价" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.unitPrice) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-button size="mini" type="outline" @click="openEdit(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer :visible="createVisible" :width="1000" @cancel="closeCreate" :esc-to-close="true" :mask-closable="false" title="新增数据服务">
      <a-steps :current="createStep" style="margin-bottom: 16px">
        <a-step title="选择类型与模板" />
        <a-step title="填写申请信息" />
        <a-step title="陪跑计划(可选)" />
      </a-steps>
      <div v-show="createStep === 0">
        <a-form :model="createForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="服务类型" field="serviceType" required>
                <a-select v-model="createForm.serviceType" placeholder="请选择类型">
                  <a-option value="API">API</a-option>
                  <a-option value="文件">文件</a-option>
                  <a-option value="数据库">数据库</a-option>
                  <a-option value="平台工具">平台工具</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="服务名称" field="name" required>
                <a-input v-model="createForm.name" placeholder="请输入服务名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="供应商" field="supplier">
                <a-input v-model="createForm.supplier" placeholder="请输入供应商" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-divider>选择模板</a-divider>
          <a-row :gutter="[16,16]">
            <a-col :span="8" v-for="tpl in filteredTemplates" :key="tpl.id">
              <a-card hoverable :class="{ 'selected': selectedTemplate?.id === tpl.id }" @click="selectTemplate(tpl)">
                <div class="tpl-title">{{ tpl.title }}</div>
                <div class="tpl-desc">{{ tpl.description }}</div>
              </a-card>
            </a-col>
          </a-row>
          <div style="margin-top: 16px">
            <a-space>
              <a-button type="primary" @click="goNextFromChoose">下一步</a-button>
              <a-button @click="closeCreate">取消</a-button>
            </a-space>
          </div>
        </a-form>
      </div>
      <div v-show="createStep === 1">
        <a-form :model="createForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="计费模式" field="billingMode">
                <a-select v-model="createForm.billingMode" placeholder="选择计费模式">
                  <a-option value="per_call">按次</a-option>
                  <a-option value="monthly">按月</a-option>
                  <a-option value="tier">阶梯</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="单价(元)" field="unitPrice">
                <a-input-number v-model="createForm.unitPrice" :min="0" :precision="2" placeholder="请输入单价" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="状态" field="status">
                <a-select v-model="createForm.status" placeholder="选择状态">
                  <a-option value="pending">待上线</a-option>
                  <a-option value="online">在线</a-option>
                  <a-option value="maintaining">维护中</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item label="描述" field="description">
                <a-textarea v-model="createForm.description" :rows="3" placeholder="请输入服务描述" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <a-divider>模板申请信息</a-divider>
        <div v-if="selectedTemplateKey === 'online-detail'">
          <a-form :model="flowApiForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8"><a-form-item label="身份证号" field="idNumber"><a-input v-model="flowApiForm.idNumber" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="手机号" field="mobile"><a-input v-model="flowApiForm.mobile" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="并发上限" field="qps"><a-input-number v-model="flowApiForm.qps" :min="0" style="width:100%" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </div>
        <div v-else-if="selectedTemplateKey === 'offline-task'">
          <a-form :model="flowOfflineTaskForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item label="任务名称" field="taskName" required><a-input v-model="flowOfflineTaskForm.taskName" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="时间范围" field="dateRange"><a-input v-model="flowOfflineTaskForm.dateRange" placeholder="如: 2024-01-01 ~ 2024-01-31" /></a-form-item></a-col>
            </a-row>
            <a-form-item label="批量文件">
              <a-upload :limit="1" :auto-upload="false" />
            </a-form-item>
          </a-form>
        </div>
        <div v-else-if="selectedTemplateKey === 'variable-backtrack'">
          <a-form :model="flowVariableBacktrackForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8"><a-form-item label="开始日期" field="startDate"><a-date-picker v-model="flowVariableBacktrackForm.startDate" style="width:100%" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="结束日期" field="endDate"><a-date-picker v-model="flowVariableBacktrackForm.endDate" style="width:100%" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="变量名" field="variables"><a-input-tag v-model="flowVariableBacktrackForm.variables" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </div>
        <div v-else-if="selectedTemplateKey === 'file-clean'">
          <a-form :model="flowFileCleanForm" layout="vertical">
            <a-form-item label="上传文件"><a-upload :auto-upload="false" /></a-form-item>
            <a-form-item label="清洗规则"><a-input v-model="flowFileCleanForm.rules" placeholder="如: 去重、格式化、校验" /></a-form-item>
          </a-form>
        </div>
        <div v-else-if="selectedTemplateKey === 'risk-query'">
          <a-form :model="flowRiskQueryForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8"><a-form-item label="身份证号" field="idNumber"><a-input v-model="flowRiskQueryForm.idNumber" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="开始日期" field="startDate"><a-date-picker v-model="flowRiskQueryForm.startDate" style="width:100%" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="结束日期" field="endDate"><a-date-picker v-model="flowRiskQueryForm.endDate" style="width:100%" /></a-form-item></a-col>
            </a-row>
            <a-form-item label="模式"><a-radio-group v-model="flowRiskQueryForm.mode"><a-radio value="single">单条</a-radio><a-radio value="batch">批量</a-radio></a-radio-group></a-form-item>
          </a-form>
        </div>
        <a-divider>流程化工具</a-divider>
        <a-card :bordered="true">
          <a-space style="margin-bottom: 12px">
            <a-select v-model="newStepType" placeholder="选择环节类型" style="width: 160px">
              <a-option value="datasource">数据源</a-option>
              <a-option value="sql">SQL处理</a-option>
              <a-option value="python">Python处理</a-option>
              <a-option value="approval">审批</a-option>
              <a-option value="deploy">发布</a-option>
              <a-option value="operation">运维</a-option>
            </a-select>
            <a-button type="outline" @click="addPipelineStep">新增环节</a-button>
          </a-space>
          <a-table :data="pipeline" :pagination="false">
            <template #columns>
              <a-table-column title="#" :width="60">
                <template #cell="{ rowIndex }">
                  {{ rowIndex + 1 }}
                </template>
              </a-table-column>
              <a-table-column title="类型" :width="120">
                <template #cell="{ record }">
                  <a-tag>{{ stepTypeLabel(record.type) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="名称" :width="200">
                <template #cell="{ record }">
                  <a-input v-model="record.name" placeholder="环节名称" />
                </template>
              </a-table-column>
              <a-table-column title="配置" :width="480">
                <template #cell="{ record }">
                  <div v-if="record.type === 'datasource'">
                    <a-row :gutter="8">
                      <a-col :span="8"><a-input v-model="record.config.host" placeholder="主机" /></a-col>
                      <a-col :span="8"><a-input v-model="record.config.database" placeholder="数据库" /></a-col>
                      <a-col :span="8"><a-input v-model="record.config.table" placeholder="表名" /></a-col>
                    </a-row>
                  </div>
                  <div v-else-if="record.type === 'sql'">
                    <a-input-tag v-model="record.config.tags" placeholder="标签（可选）" style="margin-bottom:8px" />
                    <a-textarea v-model="record.config.query" :rows="3" placeholder="编写SQL语句" />
                  </div>
                  <div v-else-if="record.type === 'python'">
                    <a-input-tag v-model="record.config.dependencies" placeholder="依赖包（可选）" style="margin-bottom:8px" />
                    <a-textarea v-model="record.config.script" :rows="3" placeholder="编写Python脚本" />
                  </div>
                  <div v-else-if="record.type === 'approval'">
                    <a-input v-model="record.config.approver" placeholder="审批人" />
                  </div>
                  <div v-else-if="record.type === 'deploy'">
                    <a-input v-model="record.config.env" placeholder="发布环境，如：prod" />
                  </div>
                  <div v-else-if="record.type === 'operation'">
                    <a-input v-model="record.config.monitor" placeholder="监控项，如：QPS/错误率" />
                  </div>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="220">
                <template #cell="{ rowIndex }">
                  <a-space>
                    <a-button size="mini" @click="moveUp(rowIndex)" :disabled="rowIndex===0">上移</a-button>
                    <a-button size="mini" @click="moveDown(rowIndex)" :disabled="rowIndex===pipeline.length-1">下移</a-button>
                    <a-button size="mini" status="danger" @click="removePipelineStep(rowIndex)">删除</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
        <div style="margin-top: 16px">
          <a-space>
            <a-button @click="createStep = 0">上一步</a-button>
            <a-button type="primary" @click="createStep = 2">下一步</a-button>
          </a-space>
        </div>
      </div>
      <div v-show="createStep === 2">
        <a-space style="margin-bottom: 12px">
          <a-checkbox v-model="needAccompany">需要陪跑计划</a-checkbox>
        </a-space>
        <div v-if="needAccompany">
          <a-steps :current="currentStep" style="margin-bottom: 16px">
            <a-step v-for="s in steps" :key="s.key" :title="s.title" />
          </a-steps>
          <component :is="currentComponent" v-bind="currentStepProps" @next="goToNextStep" @prev="goToPreviousStep" />
        </div>
        <div style="margin-top: 16px">
          <a-space>
            <a-button @click="createStep = 1">上一步</a-button>
            <a-button type="primary" @click="submitCreate">提交</a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import BasicInfoStep from '@/components/steps/BasicInfoStep.vue'
import DataProductStep from '@/components/steps/DataProductStep.vue'
import SceneStep from '@/components/steps/SceneStep.vue'
import CreditProductStep from '@/components/steps/CreditProductStep.vue'
const store = useExternalDataStore()

type ServiceType = 'API'|'文件'|'数据库'|'平台工具'

const filters = reactive<{ supplier?: string; serviceType?: ServiceType }>({})
const services = ref<any[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const supplierOptions = computed<string[]>(() => {
  const list = (services.value as Array<{ supplier?: string }>).map((x) => x.supplier).filter((v): v is string => Boolean(v))
  return Array.from(new Set(list))
})
const displayedServices = computed<any[]>(() => {
  return (services.value as Array<{ supplier?: string; serviceType?: string }>).filter((x) => {
    if (filters.supplier && x.supplier !== filters.supplier) return false
    if (filters.serviceType && x.serviceType !== filters.serviceType) return false
    return true
  })
})
const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => s === 'online' ? '在线' : s === 'maintaining' ? '维护中' : s === 'pending' ? '待上线' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'maintaining' ? 'warning' : 'default'

const applyFilter = () => { Message.success('筛选已更新') }
const resetFilter = () => { filters.supplier = undefined; filters.serviceType = undefined }
const onPageChange = (page: number) => { pagination.current = page }
const load = async () => { try { await store.fetchServices(); services.value = store.services || []; pagination.total = services.value.length; Message.success('已加载服务列表') } catch { Message.error('加载失败') } }
onMounted(load)

const createVisible = ref(false)
const createStep = ref(0)
const editMode = ref(false)
const editingId = ref<string | null>(null)
const createForm = reactive<{ name: string; supplier?: string; serviceType?: string; billingMode?: string; unitPrice?: number; status?: string; description?: string }>({
  name: '',
  supplier: '',
  serviceType: 'API',
  billingMode: 'per_call',
  unitPrice: 0,
  status: 'pending',
  description: ''
})
type TemplateItem = { id: number; key: string; type: string; title: string; description: string }
const serviceTemplates: TemplateItem[] = [
  { id: 1, key: 'online-detail', type: 'API', title: '在线数据明细申请', description: '在线调用外部数据API接口' },
  { id: 2, key: 'offline-task', type: '文件', title: '外置数据回溯申请', description: '一次性离线数据任务' },
  { id: 3, key: 'offline-task', type: '数据库', title: '离线数据任务申请', description: '批量离线处理任务' },
  { id: 4, key: 'variable-backtrack', type: '数据库', title: '全量变量回溯申请', description: '历史变量回溯处理' },
  { id: 5, key: 'file-clean', type: '文件', title: '数据文件清洗申请', description: '对接上传文件清洗' },
  { id: 6, key: 'risk-query', type: 'API', title: '风险合规外数查询', description: '客户风险合规相关外数查询' }
]
const selectedTemplate = ref<TemplateItem | null>(null)
const selectedTemplateKey = computed(() => selectedTemplate.value?.key || '')
const filteredTemplates = computed<TemplateItem[]>(() => {
  const t = createForm.serviceType || ''
  return serviceTemplates.filter((x) => !t || x.type === t)
})
const selectTemplate = (tpl: TemplateItem) => { selectedTemplate.value = tpl; createForm.name ||= tpl.title; createForm.description ||= tpl.description }
const openCreate = () => { createVisible.value = true; createStep.value = 0; editMode.value = false; editingId.value = null; resetCreateForm() }
const closeCreate = () => { createVisible.value = false; editMode.value = false; editingId.value = null }
const needAccompany = ref(false)
const goNextFromChoose = () => {
  if (!createForm.serviceType || !createForm.name || !selectedTemplate.value) { Message.warning('请选择类型并选择模板，填写服务名称'); return }
  createStep.value = 1
}

type DataProduct = { id: string; name: string; totalAmount: number; periods: any[]; scenes?: any[] }
type BasicInfo = { name: string; cacheTime: string; days: number; periods: number; description: string; periodDays: number[] }
type FormData = { workId: string; basic: BasicInfo; creditProducts: any[]; dataProducts: DataProduct[] }
const steps = [
  { key: 'basic', title: '基本信息', component: BasicInfoStep },
  { key: 'product', title: '数据产品', component: DataProductStep },
  { key: 'scene', title: '场景选择', component: SceneStep },
  { key: 'credit', title: '信贷产品', component: CreditProductStep }
]
const currentStep = ref(0)
const accompanyForm = ref<FormData>({
  workId: '',
  basic: { name: '', cacheTime: '30', days: 0, periods: 0, description: '', periodDays: [30] },
  creditProducts: [],
  dataProducts: []
})
const currentComponent = computed(() => steps[currentStep.value]?.component || BasicInfoStep)
const currentStepProps = computed(() => {
  const base = { formData: accompanyForm.value, step: currentStep.value }
  if (steps[currentStep.value]?.key === 'product') {
    return {
      ...base,
      modelValue: {
        products: accompanyForm.value.dataProducts || [],
        periodDays: accompanyForm.value.basic?.periodDays || []
      },
      'onUpdate:modelValue': (v: any) => {
        accompanyForm.value.dataProducts = v?.products ?? []
        accompanyForm.value.basic = {
          ...(accompanyForm.value.basic || { name: '', cacheTime: '30', days: 0, periods: 0, description: '', periodDays: [] }),
          periodDays: v?.periodDays ?? []
        }
      }
    }
  }
  if (steps[currentStep.value]?.key === 'basic') {
    return {
      ...base,
      modelValue: accompanyForm.value?.basic ?? { name: '', cacheTime: '30', days: 0, periods: 0, description: '', periodDays: [] },
      'onUpdate:modelValue': (v: any) => { accompanyForm.value.basic = v || accompanyForm.value.basic }
    }
  }
  return base
})
const goToNextStep = () => { currentStep.value++ }
const goToPreviousStep = () => { if (currentStep.value > 0) currentStep.value-- }

const submitCreate = async () => {
  if (!createForm.name || !selectedTemplate.value) { Message.warning('请完善服务信息与模板'); return }
  const payload = {
    ...createForm,
    templateKey: selectedTemplateKey.value,
    templateTitle: selectedTemplate.value?.title,
    applyData: selectedTemplateKey.value === 'online-detail' ? flowApiForm
      : selectedTemplateKey.value === 'offline-task' ? flowOfflineTaskForm
      : selectedTemplateKey.value === 'variable-backtrack' ? flowVariableBacktrackForm
      : selectedTemplateKey.value === 'file-clean' ? flowFileCleanForm
      : selectedTemplateKey.value === 'risk-query' ? flowRiskQueryForm
      : {},
    accompanyPlan: needAccompany.value ? accompanyForm.value : {},
    workflow: pipeline.value
  }
  const ok = editMode.value && editingId.value
    ? await store.updateService(String(editingId.value), payload as any)
    : await store.createService(payload as any)
  if (ok) { Message.success(editMode.value ? '已更新数据服务' : '已新增数据服务'); await load(); closeCreate() } else { Message.error(store.error || (editMode.value ? '更新失败' : '新增失败')) }
}

const flowApiForm = reactive<{ idNumber?: string; mobile?: string; qps?: number }>({ idNumber: '', mobile: '', qps: 0 })
const flowOfflineTaskForm = reactive<{ taskName?: string; dateRange?: string }>({ taskName: '', dateRange: '' })
const flowVariableBacktrackForm = reactive<{ startDate?: string; endDate?: string; variables: string[] }>({ startDate: '', endDate: '', variables: [] })
const flowFileCleanForm = reactive<{ rules?: string }>({ rules: '' })
const flowRiskQueryForm = reactive<{ idNumber?: string; startDate?: string; endDate?: string; mode?: string }>({ idNumber: '', startDate: '', endDate: '', mode: 'single' })

type PipelineStep = { type: string; name: string; config: Record<string, any> }
const pipeline = ref<PipelineStep[]>([])
const newStepType = ref<string>('datasource')
const stepTypeLabel = (t: string) => ({ datasource: '数据源', sql: 'SQL处理', python: 'Python处理', approval: '审批', deploy: '发布', operation: '运维' }[t] || t)
const defaultConfigFor = (t: string) => t === 'datasource' ? { host: '', database: '', table: '' }
  : t === 'sql' ? { query: '', tags: [] }
  : t === 'python' ? { script: '', dependencies: [] }
  : t === 'approval' ? { approver: '' }
  : t === 'deploy' ? { env: 'dev' }
  : t === 'operation' ? { monitor: 'QPS' }
  : {}
const addPipelineStep = () => {
  const type = newStepType.value || 'datasource'
  pipeline.value.push({ type, name: `${stepTypeLabel(type)}_${pipeline.value.length + 1}`, config: defaultConfigFor(type) })
}
const removePipelineStep = (idx: number) => { pipeline.value.splice(idx, 1) }
const moveUp = (idx: number) => { if (idx > 0) { const [s] = pipeline.value.splice(idx, 1); pipeline.value.splice(idx - 1, 0, s) } }
const moveDown = (idx: number) => { if (idx < pipeline.value.length - 1) { const [s] = pipeline.value.splice(idx, 1); pipeline.value.splice(idx + 1, 0, s) } }

const resetCreateForm = () => {
  createForm.name = ''
  createForm.supplier = ''
  createForm.serviceType = 'API'
  createForm.billingMode = 'per_call'
  createForm.unitPrice = 0
  createForm.status = 'pending'
  createForm.description = ''
  selectedTemplate.value = null
  pipeline.value = []
  needAccompany.value = false
  currentStep.value = 0
  accompanyForm.value = {
    workId: '',
    basic: { name: '', cacheTime: '30', days: 0, periods: 0, description: '', periodDays: [30] },
    creditProducts: [],
    dataProducts: []
  }
}

const openEdit = (record: any) => {
  editMode.value = true
  editingId.value = String(record?.id || '')
  createVisible.value = true
  createStep.value = 0
  createForm.name = record?.name || ''
  createForm.supplier = record?.supplier || ''
  createForm.serviceType = record?.serviceType || 'API'
  createForm.billingMode = record?.billingMode || 'per_call'
  createForm.unitPrice = typeof record?.unitPrice === 'number' ? record.unitPrice : 0
  createForm.status = record?.status || 'pending'
  createForm.description = record?.description || ''
  pipeline.value = Array.isArray(record?.workflow) ? record.workflow as PipelineStep[] : []
  const tplKey = record?.templateKey || ''
  const tpl = serviceTemplates.find((x) => x.key === tplKey && x.type === createForm.serviceType)
  selectedTemplate.value = tpl || null
}
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
.tpl-title { font-weight: 600; margin-bottom: 8px; }
.tpl-desc { color: var(--color-text-2); }
.selected { border: 1px solid rgb(var(--primary-6)); }
</style>
