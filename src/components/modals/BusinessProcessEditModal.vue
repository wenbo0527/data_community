<template>
  <a-modal
    v-model:visible="visible"
    title="编辑业务流程"
    width="1200px"
    :mask-closable="false"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <div class="business-process-edit">
      <!-- 基本信息配置 -->
      <div class="basic-config">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="业务产品" required>
              <a-cascader
                v-model="cascaderValue"
                :options="cascaderOptions"
                placeholder="请选择业务类型和产品类型"
                :style="{ width: '300px' }"
                allow-search
                expand-trigger="hover"
                @change="onCascaderChange"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 业务步骤配置 -->
      <div class="steps-config">
        <div class="steps-header">
          <h3>业务步骤配置</h3>
          <a-button type="primary" @click="addStep">
            <template #icon><IconPlus /></template>
            添加步骤
          </a-button>
        </div>

        <div class="steps-list">
          <div 
            v-for="(step, index) in formData.steps" 
            :key="step.id"
            class="step-item"
          >
            <div class="step-header">
              <div class="step-order">
                <span class="step-number">{{ index + 1 }}</span>
                <div class="step-actions">
                  <a-button 
                    v-if="index > 0" 
                    type="text" 
                    size="mini" 
                    @click="moveStep(index, 'up')"
                  >
                    <template #icon><IconUp /></template>
                  </a-button>
                  <a-button 
                    v-if="index < formData.steps.length - 1" 
                    type="text" 
                    size="mini" 
                    @click="moveStep(index, 'down')"
                  >
                    <template #icon><IconDown /></template>
                  </a-button>
                  <a-button 
                    type="text" 
                    size="mini" 
                    status="danger" 
                    @click="removeStep(index)"
                  >
                    <template #icon><IconDelete /></template>
                  </a-button>
                </div>
              </div>
              <div class="step-basic-info">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-input 
                      v-model="step.name" 
                      placeholder="请输入步骤名称"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="12">
                    <a-input 
                      v-model="step.description" 
                      placeholder="请输入步骤说明"
                      size="small"
                    />
                  </a-col>
                </a-row>
              </div>
            </div>

            <div class="step-content">
              <a-tabs default-active-key="tables">
                <!-- 关联数据表 -->
                <a-tab-pane key="tables" title="关联数据表">
                  <div class="association-section">
                    <div class="section-header">
                      <span>已关联数据表 ({{ step.tables.length }})</span>
                      <a-button type="text" size="small" @click="selectTables(index)">
                        <template #icon><IconPlus /></template>
                        选择数据表
                      </a-button>
                    </div>
                    <div class="associated-items">
                      <div 
                        v-for="table in step.tables" 
                        :key="table.name"
                        class="associated-item"
                      >
                        <div class="item-info">
                          <span class="item-name">{{ table.name }}</span>
                          <span class="item-desc">{{ table.description }}</span>
                        </div>
                        <a-button 
                          type="text" 
                          size="mini" 
                          status="danger" 
                          @click="removeTable(index, table.name)"
                        >
                          <template #icon><IconClose /></template>
                        </a-button>
                      </div>
                      <div v-if="step.tables.length === 0" class="empty-state">
                        <IconFile class="empty-icon" />
                        <span>暂无关联数据表</span>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>

                <!-- 关联指标 -->
                <a-tab-pane key="metrics" title="关联指标">
                  <div class="association-section">
                    <div class="section-header">
                      <span>已关联指标 ({{ step.metrics.length }})</span>
                      <a-button type="text" size="small" @click="selectMetrics(index)">
                        <template #icon><IconPlus /></template>
                        选择指标
                      </a-button>
                    </div>
                    <div class="associated-items">
                      <div 
                        v-for="metric in step.metrics" 
                        :key="metric.name"
                        class="associated-item"
                      >
                        <div class="item-info">
                          <span class="item-name">{{ metric.name }}</span>
                          <span class="item-desc">{{ metric.description }}</span>
                        </div>
                        <a-button 
                          type="text" 
                          size="mini" 
                          status="danger" 
                          @click="removeMetric(index, metric.name)"
                        >
                          <template #icon><IconClose /></template>
                        </a-button>
                      </div>
                      <div v-if="step.metrics.length === 0" class="empty-state">
                        <IconBarChart class="empty-icon" />
                        <span>暂无关联指标</span>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>

          <div v-if="formData.steps.length === 0" class="empty-steps">
            <IconPlus class="empty-icon" />
            <span>暂无业务步骤，请点击上方按钮添加</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表选择弹窗 -->
    <a-modal
      v-model:visible="tableSelectVisible"
      title="选择数据表"
      width="800px"
      @ok="confirmTableSelection"
      @cancel="tableSelectVisible = false"
    >
      <div class="table-select-content">
        <a-input-search 
          v-model="tableSearchKeyword" 
          placeholder="搜索数据表"
          style="margin-bottom: 16px"
        />
        <a-table 
          :data="filteredTables"
          :columns="tableSelectColumns"
          :row-selection="{
            type: 'checkbox',
            selectedRowKeys: selectedTableKeys,
            onSelectionChange: onTableSelectionChange
          }"
          :pagination="{ pageSize: 10 }"
          size="small"
        />
      </div>
    </a-modal>

    <!-- 指标选择弹窗 -->
    <a-modal
      v-model:visible="metricSelectVisible"
      title="选择指标"
      width="800px"
      @ok="confirmMetricSelection"
      @cancel="metricSelectVisible = false"
    >
      <div class="metric-select-content">
        <a-input-search 
          v-model="metricSearchKeyword" 
          placeholder="搜索指标"
          style="margin-bottom: 16px"
        />
        <a-table 
          :data="filteredMetrics"
          :columns="metricSelectColumns"
          :row-selection="{
            type: 'checkbox',
            selectedRowKeys: selectedMetricKeys,
            onSelectionChange: onMetricSelectionChange
          }"
          :pagination="{ pageSize: 10 }"
          size="small"
        />
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconUp,
  IconDown,
  IconDelete,
  IconClose,
  IconFile,
  IconBarChart
} from '@arco-design/web-vue/es/icon'

interface TableItem {
  name: string
  description: string
  type: string
  owner?: string
}

interface MetricItem {
  name: string
  description: string
  unit?: string
  formula?: string
  owner?: string
}

interface ProcessStep {
  id: string
  name: string
  description: string
  tables: TableItem[]
  metrics: MetricItem[]
}

interface FormData {
  businessType: string
  productType: string
  steps: ProcessStep[]
}

const props = defineProps<{
  visible: boolean
  initialData?: FormData
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: FormData): void
}>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formData = ref<FormData>({
  businessType: '',
  productType: '',
  steps: []
})

// 级联选择器相关数据
const cascaderValue = ref<string[]>(['self', 'general'])
const cascaderOptions = ref([
  {
    value: 'self',
    label: '自营',
    children: [
      { value: 'general', label: '通用' },
      { value: 'personal', label: '个人贷' },
      { value: 'business', label: '企业贷' },
      { value: 'mortgage', label: '房贷' },
      { value: 'car', label: '车贷' }
    ]
  },
  {
    value: 'supermarket',
    label: '贷超',
    children: [
      { value: 'general', label: '通用' },
      { value: 'personal', label: '个人贷' },
      { value: 'business', label: '企业贷' }
    ]
  },
  {
    value: 'assist',
    label: '助贷',
    children: [
      { value: 'general', label: '通用' },
      { value: 'personal', label: '个人贷' },
      { value: 'mortgage', label: '房贷' }
    ]
  }
])

// 数据表选择相关
const tableSelectVisible = ref(false)
const currentStepIndex = ref(-1)
const tableSearchKeyword = ref('')
const selectedTableKeys = ref<string[]>([])

// 指标选择相关
const metricSelectVisible = ref(false)
const metricSearchKeyword = ref('')
const selectedMetricKeys = ref<string[]>([])

// 模拟数据表数据
const allTables = ref<TableItem[]>([
  { name: 'user_register', description: '用户注册信息表', type: 'table', owner: '张三' },
  { name: 'user_device', description: '用户设备信息表', type: 'table', owner: '李四' },
  { name: 'user_auth', description: '用户实名认证表', type: 'table', owner: '王五' },
  { name: 'user_bankcard', description: '用户银行卡信息表', type: 'table', owner: '赵六' },
  { name: 'credit_apply', description: '授信申请记录表', type: 'table', owner: '钱七' },
  { name: 'credit_result', description: '授信结果表', type: 'table', owner: '孙八' }
])

// 模拟指标数据
const allMetrics = ref<MetricItem[]>([
  { name: '日注册量', description: '每日新增注册用户数', unit: '人', formula: 'count(distinct user_id)' },
  { name: '渠道转化率', description: '各渠道注册成功率', unit: '%', formula: 'count(success)/count(total)' },
  { name: '实名认证率', description: '完成实名认证的用户占比', unit: '%', formula: 'count(distinct auth_user)/count(distinct total_user)' },
  { name: '认证通过率', description: '实名认证通过的比例', unit: '%', formula: 'count(success)/count(total)' },
  { name: '授信申请率', description: '注册用户中申请授信的比例', unit: '%', formula: 'count(distinct apply_user)/count(distinct register_user)' },
  { name: '平均申请金额', description: '授信申请平均金额', unit: '元', formula: 'avg(apply_amount)' }
])

// 计算属性
const filteredTables = computed(() => {
  if (!tableSearchKeyword.value) return allTables.value
  return allTables.value.filter(table => 
    table.name.includes(tableSearchKeyword.value) || 
    table.description.includes(tableSearchKeyword.value)
  )
})

const filteredMetrics = computed(() => {
  if (!metricSearchKeyword.value) return allMetrics.value
  return allMetrics.value.filter(metric => 
    metric.name.includes(metricSearchKeyword.value) || 
    metric.description.includes(metricSearchKeyword.value)
  )
})

// 表格列定义
const tableSelectColumns = [
  { title: '表名', dataIndex: 'name', width: 200 },
  { title: '描述', dataIndex: 'description' },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '负责人', dataIndex: 'owner', width: 100 }
]

const metricSelectColumns = [
  { title: '指标名', dataIndex: 'name', width: 200 },
  { title: '描述', dataIndex: 'description' },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '计算公式', dataIndex: 'formula', width: 200 }
]

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = JSON.parse(JSON.stringify(newData))
    // 同步更新级联选择器的值
    cascaderValue.value = [newData.businessType || 'self', newData.productType || 'general']
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible && !props.initialData) {
    // 重置表单数据
    formData.value = {
      businessType: '',
      productType: '',
      steps: []
    }
    // 重置级联选择器的值
    cascaderValue.value = ['self', 'general']
  }
})

// 步骤管理方法
const addStep = () => {
  const newStep: ProcessStep = {
    id: `step_${Date.now()}`,
    name: '',
    description: '',
    tables: [],
    metrics: []
  }
  formData.value.steps.push(newStep)
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
}

const moveStep = (index: number, direction: 'up' | 'down') => {
  const steps = formData.value.steps
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  
  if (targetIndex >= 0 && targetIndex < steps.length) {
    const temp = steps[index]
    steps[index] = steps[targetIndex]
    steps[targetIndex] = temp
  }
}

// 数据表选择方法
const selectTables = (stepIndex: number) => {
  currentStepIndex.value = stepIndex
  const currentStep = formData.value.steps[stepIndex]
  selectedTableKeys.value = currentStep.tables.map(table => table.name)
  tableSelectVisible.value = true
}

const onTableSelectionChange = (selectedKeys: string[]) => {
  selectedTableKeys.value = selectedKeys
}

const confirmTableSelection = () => {
  const selectedTables = allTables.value.filter(table => 
    selectedTableKeys.value.includes(table.name)
  )
  formData.value.steps[currentStepIndex.value].tables = selectedTables
  tableSelectVisible.value = false
}

const removeTable = (stepIndex: number, tableName: string) => {
  const step = formData.value.steps[stepIndex]
  step.tables = step.tables.filter(table => table.name !== tableName)
}

// 指标选择方法
const selectMetrics = (stepIndex: number) => {
  currentStepIndex.value = stepIndex
  const currentStep = formData.value.steps[stepIndex]
  selectedMetricKeys.value = currentStep.metrics.map(metric => metric.name)
  metricSelectVisible.value = true
}

const onMetricSelectionChange = (selectedKeys: string[]) => {
  selectedMetricKeys.value = selectedKeys
}

const confirmMetricSelection = () => {
  const selectedMetrics = allMetrics.value.filter(metric => 
    selectedMetricKeys.value.includes(metric.name)
  )
  formData.value.steps[currentStepIndex.value].metrics = selectedMetrics
  metricSelectVisible.value = false
}

const removeMetric = (stepIndex: number, metricName: string) => {
  const step = formData.value.steps[stepIndex]
  step.metrics = step.metrics.filter(metric => metric.name !== metricName)
}

// 级联选择器变更处理
const onCascaderChange = (value: string[]) => {
  if (value && value.length === 2) {
    formData.value.businessType = value[0]
    formData.value.productType = value[1]
    console.log('业务类型变化:', value[0], '产品类型变化:', value[1])
    Message.info(`已选择${getBusinessTypeName(value[0])}模式 - ${getProductTypeName(value[1])}产品`)
  }
}

// 获取业务类型名称
const getBusinessTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'self': '自营',
    'supermarket': '贷超',
    'assist': '助贷'
  }
  return typeMap[type] || type
}

// 获取产品类型名称
const getProductTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'general': '通用',
    'personal': '个人贷',
    'business': '企业贷',
    'mortgage': '房贷',
    'car': '车贷'
  }
  return typeMap[type] || type
}

// 弹窗操作方法
const handleSave = () => {
  // 验证表单
  if (!formData.value.businessType) {
    Message.error('请选择业务类型')
    return
  }
  if (!formData.value.productType) {
    Message.error('请选择产品类型')
    return
  }
  if (formData.value.steps.length === 0) {
    Message.error('请至少添加一个业务步骤')
    return
  }
  
  // 验证步骤信息
  for (let i = 0; i < formData.value.steps.length; i++) {
    const step = formData.value.steps[i]
    if (!step.name) {
      Message.error(`第${i + 1}个步骤的名称不能为空`)
      return
    }
    if (!step.description) {
      Message.error(`第${i + 1}个步骤的说明不能为空`)
      return
    }
  }
  
  emit('save', formData.value)
  visible.value = false
  Message.success('保存成功')
}

const handleCancel = () => {
  visible.value = false
}
</script>

<style scoped>
.business-process-edit {
  max-height: 600px;
  overflow-y: auto;
}

.basic-config {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.steps-config {
  margin-bottom: 16px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.steps-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.steps-list {
  max-height: 400px;
  overflow-y: auto;
}

.step-item {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  margin-bottom: 16px;
  background: #fff;
}

.step-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.step-order {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #165dff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.step-actions {
  display: flex;
  gap: 4px;
}

.step-content {
  padding: 16px;
}

.association-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.associated-items {
  min-height: 60px;
}

.associated-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f7f8fa;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  margin-right: 12px;
}

.item-desc {
  color: #86909c;
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #86909c;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #86909c;
  text-align: center;
  border: 2px dashed #e5e6eb;
  border-radius: 6px;
}

.table-select-content,
.metric-select-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>