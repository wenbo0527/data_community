<template>
  <div class="virtual-event-form">
    <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical">
      <!-- 步骤导航 -->
      <div class="step-navigator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ active: currentStep === index, completed: currentStep > index }"
          @click="goToStep(index)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-desc">{{ step.description }}</div>
          </div>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 基本信息 -->
        <div v-show="currentStep === 0" class="step-panel">
          <a-divider orientation="left">基本信息</a-divider>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="虚拟事件名称" field="eventName">
                <a-input 
                  v-model="formData.eventName" 
                  placeholder="请输入虚拟事件名称"
                  :max-length="50"
                  show-word-limit
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="关联真实事件" field="eventId">
                <a-select 
                  v-model="formData.eventId" 
                  placeholder="请选择关联的真实事件"
                  @change="handleRealEventChange"
                >
                  <a-option 
                    v-for="event in realEvents" 
                    :key="event.id" 
                    :value="event.id"
                  >
                    {{ event.eventName }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="应用场景" field="scenario">
                <a-select v-model="formData.scenario" multiple placeholder="请选择应用场景">
                  <a-option value="营销通知">营销通知</a-option>
                  <a-option value="电销出池">电销出池</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
          </a-row>

          <a-form-item label="描述" field="description">
            <a-textarea 
              v-model="formData.description" 
              placeholder="请输入虚拟事件描述"
              :max-length="200"
              show-word-limit
              :rows="3"
            />
          </a-form-item>
        </div>

        

        <!-- 步骤3: 输出配置 -->
        <div v-show="currentStep === 2" class="step-panel">
          <a-divider orientation="left">输出配置</a-divider>
          
          <a-form-item label="输出字段配置">
            <div class="output-fields">
              <div class="field-header">
                <span>字段名称</span>
                <span>字段类型</span>
                <span>映射规则</span>
                <span>操作</span>
              </div>
              <div 
                v-for="(field, index) in outputFields" 
                :key="index"
                class="field-item"
              >
                <a-input 
                  v-model="field.name" 
                  placeholder="字段名称"
                  style="width: 150px"
                />
                <a-select 
                  v-model="field.type" 
                  placeholder="字段类型"
                  style="width: 120px"
                >
                  <a-option value="string">字符串</a-option>
                  <a-option value="number">数字</a-option>
                  <a-option value="boolean">布尔值</a-option>
                  <a-option value="date">日期</a-option>
                </a-select>
                <a-input 
                  v-model="field.mapping" 
                  placeholder="映射规则"
                  style="flex: 1"
                />
                <a-button 
                  type="text" 
                  size="small" 
                  status="danger"
                  @click="removeOutputField(index)"
                >
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
            </div>
            <div class="add-field-action">
              <a-button type="dashed" long @click="addOutputField">
                <template #icon><icon-plus /></template>
                添加输出字段
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="权限控制">
            <div class="permission-control">
              <a-checkbox-group v-model="formData.permissions">
                <a-checkbox value="read">读取权限</a-checkbox>
                <a-checkbox value="write">写入权限</a-checkbox>
                <a-checkbox value="delete">删除权限</a-checkbox>
                <a-checkbox value="export">导出权限</a-checkbox>
              </a-checkbox-group>
            </div>
          </a-form-item>
        </div>
      </div>

      <!-- 步骤操作 -->
      <div class="step-actions">
        <a-button 
          v-if="currentStep > 0" 
          @click="previousStep"
        >
          上一步
        </a-button>
        <a-button 
          v-if="currentStep < steps.length - 1" 
          type="primary" 
          @click="nextStep"
        >
          下一步
        </a-button>
        <a-button 
          v-if="currentStep === steps.length - 1" 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          保存
        </a-button>
        <a-button @click="handleCancel">
          取消
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconDelete,
  IconMinus
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  eventData: {
    type: Object,
    default: null
  },
  realEvents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 表单引用
const formRef = ref(null)

// 步骤状态
const currentStep = ref(0)
const submitting = ref(false)

// 步骤定义
const steps = [
  {
    title: '基本信息',
    description: '配置虚拟事件的基本属性'
  },
  {
    title: '输出配置',
    description: '配置输出字段和权限'
  }
]

// 表单数据
const formData = reactive({
  eventName: '',
  eventId: '',
  scenario: [],
  description: '',
  permissions: ['read']
})

// 输出字段数据
const outputFields = ref([
  { name: '', type: 'string', mapping: '' }
])

// 表单验证规则
const formRules = {
  eventName: [
    { required: true, message: '请输入虚拟事件名称' },
    { min: 2, max: 50, message: '虚拟事件名称长度应在2-50个字符之间' }
  ],
  eventId: [
    { required: true, message: '请选择关联的真实事件' }
  ],
  scenario: [
    { required: true, message: '请选择应用场景' }
  ],
  
  description: [
    { max: 200, message: '描述长度不能超过200个字符' }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (props.eventData) {
    // 编辑模式
    Object.keys(formData).forEach(key => {
      if (props.eventData[key] !== undefined) {
        if (key === 'conditionGroups') {
          formData[key] = JSON.parse(JSON.stringify(props.eventData[key]))
        } else {
          formData[key] = props.eventData[key]
        }
      }
    })
  } else {
    // 创建模式 - 使用默认值
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formData.eventName = ''
  formData.eventId = ''
  formData.scenario = ''
  formData.description = ''
  formData.permissions = ['read']
  
  outputFields.value = [
    { name: '', type: 'string', mapping: '' }
  ]
}

// 步骤导航
const goToStep = (step) => {
  currentStep.value = step
}

const nextStep = async () => {
  try {
    // 验证当前步骤
    const valid = await validateCurrentStep()
    if (!valid) {
      return
    }
    
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  } catch (error) {
    console.error('步骤验证失败:', error)
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 验证当前步骤
const validateCurrentStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    return await formRef.value.validate(['eventName', 'eventId', 'scenario'])
  }
  
  
  
  return true
}

// 条件组操作
 

// 输出字段操作
const addOutputField = () => {
  outputFields.value.push({ name: '', type: 'string', mapping: '' })
}

const removeOutputField = (index) => {
  if (outputFields.value.length > 1) {
    outputFields.value.splice(index, 1)
  } else {
    Message.warning('至少需要保留一个输出字段')
  }
}

// 真实事件变更处理
const handleRealEventChange = (eventId) => {
  console.log('选择的真实事件:', eventId)
}

// 表单提交
const handleSubmit = async () => {
  try {
    const valid = await validateCurrentStep()
    if (!valid) {
      return
    }
    
    submitting.value = true
    
    // 模拟提交延迟
    setTimeout(() => {
      const submitData = {
        ...formData,
        outputFields: outputFields.value.filter(field => field.name && field.type),
        updateTime: new Date().toISOString()
      }
      
      if (!props.eventData) {
        submitData.createTime = new Date().toISOString()
        submitData.updater = '当前用户'
        submitData.status = '已上线'
        submitData.version = 1
        submitData.versions = [{ version: 1, updatedAt: new Date().toISOString(), updater: '当前用户', description: '初始版本' }]
        submitData.expireAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
      }
      
      emit('submit', submitData)
      submitting.value = false
    }, 1500)
    
  } catch (error) {
    console.error('表单验证失败:', error)
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}

// 监听事件数据变化
watch(() => props.eventData, () => {
  initFormData()
}, { immediate: true })

// 生命周期
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.virtual-event-form {
  padding: 0 16px;
  max-width: 800px;
}

/* 步骤导航器 */
.step-navigator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 20px 0;
  border-bottom: 2px solid #F2F3F5;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.step-item:hover {
  background-color: #F8F9FA;
}

.step-item.active {
  background-color: #E8F2FF;
  border: 1px solid #165DFF;
}

.step-item.completed {
  background-color: rgba(0, 180, 42, 0.1);
  border: 1px solid #00B42A;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F3F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4E5969;
}

.step-item.active .step-number {
  background: #165DFF;
  color: white;
}

.step-item.completed .step-number {
  background: #00B42A;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 4px;
}

.step-item.active .step-title {
  color: #165DFF;
}

.step-item.completed .step-title {
  color: #00B42A;
}

.step-desc {
  font-size: 12px;
  color: #8A8E99;
}

/* 步骤面板 */
.step-panel {
  min-height: 400px;
}

/* 条件组样式 */
.condition-groups {
  margin-bottom: 24px;
}

.condition-group {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #E5E6EB;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.conditions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #E5E6EB;
}

.condition-fields {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-group-action {
  margin-top: 16px;
}

/* 输出字段样式 */
.output-fields {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.field-header {
  display: grid;
  grid-template-columns: 150px 120px 1fr 40px;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
}

.field-item {
  display: grid;
  grid-template-columns: 150px 120px 1fr 40px;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.add-field-action {
  margin-top: 16px;
}

/* 权限控制 */
.permission-control {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
}

/* 步骤操作 */
.step-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #F2F3F5;
  margin-top: 24px;
}

/* 表单样式优化 */
:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 8px;
}

:deep(.arco-divider-text) {
  font-size: 14px;
  font-weight: 600;
  color: #165DFF;
  background: white;
  padding: 0 16px;
}

/* 专业桌面端优化 */
@media screen and (min-width: 1920px) {
  .virtual-event-form {
    padding: 0 24px;
  }
  
  .step-panel {
    min-height: 450px;
  }
}
</style>
