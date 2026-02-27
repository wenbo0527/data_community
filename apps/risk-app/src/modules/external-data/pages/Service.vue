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
          <a-select v-model="filters.serviceType" allow-clear placeholder="选择类型" style="width: 220px">
            <a-option value="在线批量调用">在线批量调用</a-option>
            <a-option value="外数离线回溯申请">外数离线回溯申请</a-option>
            <a-option value="周期跑批任务申请">周期跑批任务申请</a-option>
            <a-option value="全量变量回溯申请">全量变量回溯申请</a-option>
            <a-option value="风险合规离线回溯申请">风险合规离线回溯申请</a-option>
            <a-option value="批量外数调用服务申请">批量外数调用服务申请</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 160px">
            <a-option value="draft">草稿</a-option>
            <a-option value="approving">审批中</a-option>
            <a-option value="executing">执行中</a-option>
            <a-option value="completed">已完成</a-option>
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
          <a-table-column title="服务类型" :width="180">
            <template #cell="{ record }">{{ record.serviceType }}</template>
          </a-table-column>
          <a-table-column title="关联外数产品" data-index="relatedProduct" :width="200">
             <template #cell="{ record }">{{ record.relatedProduct || '-' }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
             <template #cell="{ record }"><a-tag :color="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="创建人" data-index="creator" :width="120" />
          <a-table-column title="提出时间" :width="180">
             <template #cell="{ record }">{{ formatDate(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }"><a-button size="mini" type="outline" @click="openEdit(record)">编辑</a-button></template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer :visible="createVisible" :width="1000" @cancel="closeCreate" :esc-to-close="true" :mask-closable="false" :title="editMode ? '查看/编辑数据服务' : '新增数据服务'">
      <a-steps :current="createStep" style="margin-bottom: 24px" small>
        <a-step title="样本表准备" description="配置服务与数据" />
        <a-step title="样本表校验" description="数据完整性检查" />
        <a-step title="审批发起" description="提交服务申请" />
        <a-step title="调用发起" description="执行数据服务" />
        <a-step title="结果回收" description="获取服务结果" />
      </a-steps>

      <!-- 阶段1: 样本表准备 -->
      <div v-show="createStep === 0">
        <a-form :model="createForm" layout="vertical">
          <a-card title="基础信息" :bordered="false" class="form-section">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="服务类型" field="serviceType" required>
                  <a-select v-model="createForm.serviceType" placeholder="请选择类型" :disabled="editMode">
                    <a-option value="在线批量调用">在线批量调用</a-option>
                    <a-option value="外数离线回溯申请">外数离线回溯申请</a-option>
                    <a-option value="周期跑批任务申请">周期跑批任务申请</a-option>
                    <a-option value="全量变量回溯申请">全量变量回溯申请</a-option>
                    <a-option value="风险合规离线回溯申请">风险合规离线回溯申请</a-option>
                    <a-option value="批量外数调用服务申请">批量外数调用服务申请</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="服务名称" field="name" required>
                  <a-input v-model="createForm.name" placeholder="请输入服务名称" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="关联外数产品" field="relatedProduct">
                  <a-select v-model="createForm.relatedProduct" placeholder="选择外数产品" allow-create>
                    <a-option v-for="p in store.products" :key="p.id" :value="p.name">{{ p.name }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="描述" field="description">
                  <a-textarea v-model="createForm.description" :rows="1" placeholder="请输入服务描述" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card title="样本配置" :bordered="false" class="form-section">
            <!-- 在线批量调用配置 -->
            <div v-if="createForm.serviceType === '在线批量调用'">
              <a-alert type="info" style="margin-bottom: 16px">适用于实时API调用场景，需配置接口参数与并发限制。</a-alert>
              <a-row :gutter="16">
                <a-col :span="12"><a-form-item label="身份证号" required><a-input v-model="flowApiForm.idNumber" placeholder="示例值" /></a-form-item></a-col>
                <a-col :span="12"><a-form-item label="手机号" required><a-input v-model="flowApiForm.mobile" placeholder="示例值" /></a-form-item></a-col>
                <a-col :span="12"><a-form-item label="并发上限(QPS)" required><a-input-number v-model="flowApiForm.qps" :min="1" :max="1000" /></a-form-item></a-col>
              </a-row>
            </div>

            <!-- 外数离线回溯申请配置 -->
            <div v-if="createForm.serviceType === '外数离线回溯申请'">
               <a-alert type="info" style="margin-bottom: 16px">适用于历史数据回溯，需上传样本文件并指定时间范围。</a-alert>
               <a-form-item label="上传样本文件" required>
                 <a-upload draggable />
               </a-form-item>
               <a-form-item label="回溯时间范围" required>
                 <a-range-picker v-model="flowOfflineTaskForm.dateRange" style="width: 100%" />
               </a-form-item>
            </div>

            <!-- 周期跑批任务申请配置 -->
            <div v-if="createForm.serviceType === '周期跑批任务申请'">
              <a-alert type="info" style="margin-bottom: 16px">适用于定期执行的数据任务，需配置调度周期。</a-alert>
              <a-form-item label="任务名称" required><a-input v-model="flowOfflineTaskForm.taskName" /></a-form-item>
              <a-form-item label="调度周期(Cron)" required><a-input placeholder="0 0 1 * * ?" /></a-form-item>
              <a-form-item label="脚本配置"><a-textarea placeholder="输入执行脚本或SQL" /></a-form-item>
            </div>

            <!-- 全量变量回溯申请配置 -->
            <div v-if="createForm.serviceType === '全量变量回溯申请'">
              <a-alert type="info" style="margin-bottom: 16px">适用于全量变量的历史回溯。</a-alert>
              <a-form-item label="变量选择" required>
                <a-select multiple placeholder="选择变量">
                  <a-option>变量A</a-option><a-option>变量B</a-option><a-option>变量C</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="时间范围" required>
                 <a-range-picker v-model="flowVariableBacktrackForm.dateRange" style="width: 100%" />
              </a-form-item>
            </div>

            <!-- 风险合规离线回溯申请配置 -->
            <div v-if="createForm.serviceType === '风险合规离线回溯申请'">
              <a-alert type="info" style="margin-bottom: 16px">适用于风险合规数据的离线查询。</a-alert>
              <a-form-item label="查询模式" required>
                <a-radio-group v-model="flowRiskQueryForm.mode">
                  <a-radio value="single">单条查询</a-radio>
                  <a-radio value="batch">批量查询</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="上传名单" v-if="flowRiskQueryForm.mode === 'batch'"><a-upload /></a-form-item>
              <a-form-item label="身份证号" v-else><a-input v-model="flowRiskQueryForm.idNumber" /></a-form-item>
            </div>

            <!-- 批量外数调用服务申请配置 -->
            <div v-if="createForm.serviceType === '批量外数调用服务申请'">
              <a-alert type="info" style="margin-bottom: 16px">适用于多数据源的批量调用。</a-alert>
              <a-form-item label="数据源配置" required><a-textarea placeholder="JSON配置" /></a-form-item>
              <a-form-item label="清洗规则"><a-input placeholder="规则名称" /></a-form-item>
            </div>
          </a-card>

          <div class="drawer-footer">
            <a-button @click="closeCreate">取消</a-button>
            <a-button type="primary" @click="goToValidationStep">下一步：样本校验</a-button>
          </div>
        </a-form>
      </div>

      <!-- 阶段2: 样本表校验 -->
      <div v-show="createStep === 1">
        <a-result status="info" title="准备进行样本校验">
          <template #subtitle>
            系统将检查样本数据的完整性、格式规范及是否符合隐私合规要求。
          </template>
          <template #extra>
            <div v-if="validationStatus === 'idle'">
              <a-button type="primary" @click="startValidation">开始校验</a-button>
            </div>
            <div v-else-if="validationStatus === 'processing'" style="width: 100%; text-align: center">
              <a-progress :percent="validationProgress" status="active" />
              <p style="margin-top: 8px">校验中... {{ validationProgress }}%</p>
            </div>
            <div v-else-if="validationStatus === 'success'">
              <a-alert type="success" title="校验通过" style="margin-bottom: 16px">所有检查项均已通过，可以继续下一步。</a-alert>
              <a-space>
                <a-button @click="createStep = 0">上一步</a-button>
                <a-button type="primary" @click="createStep = 2">下一步：审批发起</a-button>
              </a-space>
            </div>
            <div v-else-if="validationStatus === 'error'">
              <a-alert type="error" title="校验失败" style="margin-bottom: 16px">发现 3 个格式错误，请修改样本后重试。</a-alert>
              <a-space>
                <a-button @click="createStep = 0">返回修改</a-button>
                <a-button type="primary" @click="startValidation">重试校验</a-button>
              </a-space>
            </div>
          </template>
        </a-result>
        
        <a-card title="校验日志" v-if="validationLogs.length > 0" style="margin-top: 24px">
          <a-timeline>
            <a-timeline-item v-for="(log, idx) in validationLogs" :key="idx" :dot-color="log.type === 'error' ? 'red' : 'green'">
              {{ log.message }}
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </div>

      <!-- 阶段3: 审批发起 -->
      <div v-show="createStep === 2">
        <a-form layout="vertical">
          <a-alert type="warning" style="margin-bottom: 16px">提交审批后，服务将进入审批流程，期间不可修改配置。</a-alert>
          <a-form-item label="申请人"><a-input disabled default-value="当前用户" /></a-form-item>
          <a-form-item label="申请部门"><a-input disabled default-value="风险管理部" /></a-form-item>
          <a-form-item label="申请理由" required>
            <a-textarea placeholder="请详细描述申请该数据服务的业务背景和用途" :rows="4" />
          </a-form-item>
          <a-form-item label="紧急程度">
            <a-radio-group default-value="normal">
              <a-radio value="normal">普通</a-radio>
              <a-radio value="urgent">紧急</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <div class="drawer-footer">
            <a-button @click="createStep = 1">上一步</a-button>
            <a-button type="primary" @click="submitApproval">提交审批</a-button>
          </div>
        </a-form>
      </div>

      <!-- 阶段4: 调用发起 -->
      <div v-show="createStep === 3">
        <a-result status="success" title="审批已通过">
          <template #subtitle>您可以配置执行参数并发起服务调用。</template>
          <template #extra>
             <a-space direction="vertical" style="width: 100%">
               <a-card title="执行配置" style="width: 100%; text-align: left">
                 <a-form layout="vertical">
                   <a-form-item label="执行时间窗口"><a-range-picker show-time style="width: 100%" /></a-form-item>
                   <a-form-item label="结果通知"><a-checkbox-group><a-checkbox value="email">邮件</a-checkbox><a-checkbox value="sms">短信</a-checkbox></a-checkbox-group></a-form-item>
                 </a-form>
               </a-card>
               <a-space style="margin-top: 16px">
                 <a-button type="primary" status="danger">发起调用</a-button>
                 <a-button @click="closeCreate">关闭</a-button>
               </a-space>
             </a-space>
          </template>
        </a-result>
      </div>

      <!-- 阶段5: 结果回收 -->
      <div v-show="createStep === 4">
        <a-result status="success" title="调用已完成">
          <template #subtitle>服务执行成功，共处理数据 12,500 条。</template>
          <template #extra>
            <a-space>
              <a-button type="primary">下载结果数据</a-button>
              <a-button>查看执行报告</a-button>
            </a-space>
          </template>
        </a-result>
        <a-table :data="[{id:1, time:'2024-05-20 10:00', status:'成功', count: 12500}]" :pagination="false" style="margin-top: 24px">
           <a-table-column title="执行时间" data-index="time" />
           <a-table-column title="状态" data-index="status" />
           <a-table-column title="数据量" data-index="count" />
        </a-table>
      </div>

    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores'

const store = useExternalDataStore()

type ServiceType = '在线批量调用' | '外数离线回溯申请' | '周期跑批任务申请' | '全量变量回溯申请' | '风险合规离线回溯申请' | '批量外数调用服务申请'

const filters = reactive<{ serviceType?: ServiceType; status?: string }>({})
const services = ref<any[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const displayedServices = computed<any[]>(() => {
  return (services.value as Array<{ serviceType?: string; status?: string }>).filter((x) => {
    if (filters.serviceType && x.serviceType !== filters.serviceType) return false
    if (filters.status && x.status !== filters.status) return false
    return true
  })
})
const resetFilter = () => { filters.serviceType = undefined; filters.status = undefined }
const onPageChange = (page: number) => { pagination.current = page }
const statusLabel = (s: string) => ({ draft: '草稿', approving: '审批中', executing: '执行中', completed: '已完成' }[s] || s)
const statusTag = (s: string) => ({ draft: 'gray', approving: 'blue', executing: 'orangered', completed: 'green' }[s] || 'gray')
const formatDate = (d: string) => d ? new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'
const load = async () => {
  try {
    await store.fetchProducts()
    await store.fetchServices()
    services.value = store.services || []
    pagination.total = services.value.length
    Message.success('已加载服务列表')
  } catch {
    Message.error('加载失败')
  }
}
onMounted(load)

const createVisible = ref(false)
const createStep = ref(0)
const editMode = ref(false)
const editingId = ref<string | null>(null)
const createForm = reactive<{ name: string; serviceType?: ServiceType; description?: string; relatedProduct?: string }>({
  name: '',
  serviceType: '在线批量调用',
  description: '',
  relatedProduct: ''
})

// 表单数据模型
const flowApiForm = reactive<{ idNumber?: string; mobile?: string; qps?: number }>({ idNumber: '', mobile: '', qps: 100 })
const flowOfflineTaskForm = reactive<{ taskName?: string; dateRange?: any[] }>({ taskName: '', dateRange: [] })
const flowVariableBacktrackForm = reactive<{ dateRange?: any[]; variables: string[] }>({ dateRange: [], variables: [] })
const flowRiskQueryForm = reactive<{ idNumber?: string; mode?: string }>({ idNumber: '', mode: 'single' })

// 校验状态
const validationStatus = ref<'idle' | 'processing' | 'success' | 'error'>('idle')
const validationProgress = ref(0)
const validationLogs = ref<{ type: 'info' | 'error' | 'success'; message: string }[]>([])

const openCreate = () => { 
  createVisible.value = true
  createStep.value = 0
  editMode.value = false
  editingId.value = null
  resetCreateForm()
  resetValidation()
}

const closeCreate = () => { 
  createVisible.value = false
  editMode.value = false
  editingId.value = null 
}

const resetCreateForm = () => {
  createForm.name = ''
  createForm.serviceType = '在线批量调用'
  createForm.description = ''
  createForm.relatedProduct = ''
  // 重置子表单
  flowApiForm.idNumber = ''
  flowApiForm.mobile = ''
  flowApiForm.qps = 100
  flowOfflineTaskForm.taskName = ''
  flowOfflineTaskForm.dateRange = []
}

const resetValidation = () => {
  validationStatus.value = 'idle'
  validationProgress.value = 0
  validationLogs.value = []
}

const openEdit = (record: any) => {
  editMode.value = true
  editingId.value = String(record?.id || '')
  createVisible.value = true
  
  // 恢复基础数据
  createForm.name = record?.name || ''
  createForm.serviceType = record?.serviceType || '在线批量调用'
  createForm.description = record?.description || ''
  createForm.relatedProduct = record?.relatedProduct || ''
  
  // 根据状态跳转到对应步骤
  const status = record?.status || 'draft'
  if (status === 'draft') {
    createStep.value = 0
    resetValidation()
  } else if (status === 'approving') {
    createStep.value = 2 // 审批中
  } else if (status === 'executing') {
    createStep.value = 3 // 调用发起
  } else if (status === 'completed') {
    createStep.value = 4 // 结果回收
  }
}

// 导航逻辑
const goToValidationStep = () => {
  if (!createForm.name) {
    Message.warning('请输入服务名称')
    return
  }
  createStep.value = 1
  if (validationStatus.value !== 'success') {
    resetValidation()
  }
}

const startValidation = () => {
  validationStatus.value = 'processing'
  validationProgress.value = 0
  validationLogs.value = []
  
  const steps = [
    { progress: 20, msg: '正在检查参数格式...' },
    { progress: 40, msg: '参数格式检查通过' },
    { progress: 60, msg: '正在验证数据权限...' },
    { progress: 80, msg: '权限验证通过' },
    { progress: 100, msg: '样本数据合规性检查通过' }
  ]
  
  let i = 0
  const timer = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(timer)
      validationStatus.value = 'success'
      return
    }
    const step = steps[i]
    validationProgress.value = step.progress
    validationLogs.value.push({ 
      type: step.msg.includes('通过') ? 'success' : 'info', 
      message: step.msg 
    })
    i++
  }, 800)
}

const submitApproval = async () => {
  const payload = {
    ...createForm,
    applyData: {
      api: flowApiForm,
      offline: flowOfflineTaskForm,
      variable: flowVariableBacktrackForm,
      risk: flowRiskQueryForm
    },
    status: 'approving',
    currentStage: 'approval'
  }
  
  const ok = editMode.value && editingId.value 
    ? await store.updateService(String(editingId.value), payload as any) 
    : await store.createService(payload as any)
    
  if (ok) { 
    Message.success('已提交审批申请')
    await load()
    closeCreate() 
  } else { 
    Message.error(store.error || '提交失败') 
  }
}
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
.form-section { margin-bottom: 16px; border: 1px solid var(--color-neutral-3); border-radius: 4px; }
.drawer-footer { margin-top: 24px; text-align: right; }
.drawer-footer button { margin-left: 12px; }
</style>
