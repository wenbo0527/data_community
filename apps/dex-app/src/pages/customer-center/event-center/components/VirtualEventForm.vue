<template>
  <div class="virtual-event-form">
    <!-- 顶部标题栏 -->
    <div class="form-header">
      <div class="header-title">
        <span class="title-text">{{ props.eventData ? '编辑虚拟事件' : '新建虚拟事件' }}</span>
        <span class="title-sub">配置虚拟事件的基本属性、规则及输出字段</span>
      </div>
      <a-button @click="handleCancel">返回</a-button>
    </div>

    <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical" class="form-content">
      <!-- 基本信息模块 -->
      <a-card title="基本信息" class="section-card" :bordered="false">
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
          <a-col :span="12">
            <a-form-item label="有效期" field="expireAt">
               <a-date-picker 
                  v-model="formData.expireAt" 
                  style="width: 100%" 
                  placeholder="请选择有效期（可选）" 
                  show-time
               />
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
      </a-card>

      <!-- 事件关系配置模块 -->
      <a-card title="事件关系配置" class="section-card" :bordered="false">
        <div class="relation-rules">
          <div 
            v-for="(rule, index) in relationRules" 
            :key="index"
            class="rule-item"
          >
            <div class="rule-header">
              <span class="rule-title">规则 {{ index + 1 }}</span>
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                @click="removeRule(index)"
              >
                删除规则
              </a-button>
            </div>
            
            <div class="rule-content">
              <div class="rule-sentence">
                <span class="text-fixed">当发生事件</span>
                <div class="event-selector">
                  <a-select 
                    v-model="rule.triggerEvent" 
                    placeholder="选择触发事件"
                    style="width: 200px"
                    allow-search
                  >
                    <a-option 
                      v-for="event in realEvents" 
                      :key="event.id" 
                      :value="event.id"
                    >
                      {{ event.eventName }}
                    </a-option>
                  </a-select>
                  <a-button 
                    v-if="rule.triggerEvent"
                    type="text" 
                    size="small"
                    :class="{ 'has-filter': rule.triggerFilters && rule.triggerFilters.length > 0 }"
                    @click="openFilterModal(index, 'trigger')"
                  >
                    <template #icon><IconFilter /></template>
                    {{ rule.triggerFilters && rule.triggerFilters.length > 0 ? '已筛选' : '筛选' }}
                  </a-button>
                </div>
                
                <span class="text-fixed">后，在</span>
                <a-input-number 
                  v-model="rule.timeWindow" 
                  placeholder="时长"
                  style="width: 100px"
                  :min="1"
                />
                <a-select 
                  v-model="rule.timeUnit" 
                  style="width: 80px"
                >
                  <a-option value="minute">分钟</a-option>
                  <a-option value="hour">小时</a-option>
                  <a-option value="day">天</a-option>
                </a-select>
                <span class="text-fixed">内，</span>
                
                <a-select 
                  v-model="rule.relationType" 
                  style="width: 100px"
                >
                  <a-option value="happen">发生</a-option>
                  <a-option value="not_happen">未发生</a-option>
                </a-select>
                
                <span class="text-fixed">事件</span>
                <div class="event-selector">
                  <a-select 
                    v-model="rule.targetEvent" 
                    placeholder="选择目标事件"
                    style="width: 200px"
                    allow-search
                  >
                    <a-option 
                      v-for="event in realEvents" 
                      :key="event.id" 
                      :value="event.id"
                    >
                      {{ event.eventName }}
                    </a-option>
                  </a-select>
                  <a-button 
                    v-if="rule.targetEvent"
                    type="text" 
                    size="small"
                    :class="{ 'has-filter': rule.targetFilters && rule.targetFilters.length > 0 }"
                    @click="openFilterModal(index, 'target')"
                  >
                    <template #icon><IconFilter /></template>
                    {{ rule.targetFilters && rule.targetFilters.length > 0 ? '已筛选' : '筛选' }}
                  </a-button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="add-rule-action">
            <a-button type="dashed" long @click="addRule">
              <template #icon><IconPlus /></template>
              添加事件关系规则
            </a-button>
          </div>
        </div>
      </a-card>

      <!-- 输出配置模块 -->
      <a-card title="输出配置" class="section-card" :bordered="false">
        <a-form-item label="输出字段配置" :content-class="'output-fields-wrapper'">
          <div class="output-fields">
            <div class="field-header">
              <span class="col-index">#</span>
              <span class="col-name required">字段名称</span>
              <span class="col-type required">字段类型</span>
              <span class="col-mapping">映射规则</span>
              <span class="col-desc">描述</span>
              <span class="col-action">操作</span>
            </div>
            <div 
              v-for="(field, index) in outputFields" 
              :key="index"
              class="field-item"
            >
              <span class="col-index">{{ index + 1 }}</span>
              <a-input 
                v-model="field.name" 
                placeholder="如: user_id"
                class="col-name"
                :status="field.error ? 'error' : 'normal'"
                @input="field.error = false"
              />
              <a-select 
                v-model="field.type" 
                placeholder="类型"
                class="col-type"
              >
                <a-option value="string">字符串</a-option>
                <a-option value="number">数字</a-option>
                <a-option value="boolean">布尔值</a-option>
                <a-option value="date">日期</a-option>
              </a-select>
              <a-auto-complete
                v-model="field.mapping"
                :data="commonMappingFields"
                placeholder="选择或输入源字段"
                class="col-mapping"
                allow-clear
              />
              <a-input 
                v-model="field.description" 
                placeholder="字段描述"
                class="col-desc"
              />
              <a-button 
                type="text" 
                size="small" 
                status="danger"
                class="col-action"
                @click="removeOutputField(index)"
              >
                <template #icon><IconDelete /></template>
              </a-button>
            </div>
          </div>
          <div class="add-field-action">
            <a-button type="dashed" long @click="addOutputField">
              <template #icon><IconPlus /></template>
              添加输出字段
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="权限控制">
          <div class="permission-control">
            <div class="permission-header">
              <a-checkbox 
                :model-value="isAllPermissionsSelected"
                :indeterminate="isPermissionIndeterminate"
                @change="handleSelectAllPermissions"
              >
                全选
              </a-checkbox>
            </div>
            <a-checkbox-group v-model="formData.permissions">
              <a-checkbox value="read">读取权限</a-checkbox>
              <a-checkbox value="write">写入权限</a-checkbox>
              <a-checkbox value="delete">删除权限</a-checkbox>
              <a-checkbox value="export">导出权限</a-checkbox>
            </a-checkbox-group>
          </div>
        </a-form-item>
      </a-card>

      <!-- 底部操作栏 -->
      <div class="form-actions">
        <a-button @click="handleCancel" class="action-btn">
          取消
        </a-button>
        <a-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
          class="action-btn"
        >
          保存
        </a-button>
      </div>
    </a-form>

    <!-- 筛选条件配置弹窗 -->
    <a-modal
      v-model:visible="filterModalVisible"
      title="配置筛选条件"
      width="600px"
      @ok="handleFilterConfirm"
      @cancel="handleFilterCancel"
    >
      <div class="conditions">
        <div 
          v-for="(filter, index) in tempFilters" 
          :key="index"
          class="condition-item"
        >
          <div class="condition-row">
            <a-select 
              v-model="filter.field" 
              placeholder="属性名称"
              style="width: 180px"
            >
              <a-option v-for="field in commonMappingFields" :key="field" :value="field">{{ field }}</a-option>
            </a-select>
            <a-select 
              v-model="filter.operator" 
              placeholder="关系条件"
              style="width: 120px"
            >
              <a-option value="等于">等于</a-option>
              <a-option value="不等于">不等于</a-option>
              <a-option value="包含">包含</a-option>
              <a-option value="不包含">不包含</a-option>
              <a-option value="大于">大于</a-option>
              <a-option value="小于">小于</a-option>
            </a-select>
            <a-input 
              v-model="filter.value" 
              placeholder="值"
              style="width: 180px"
            />
            <div class="condition-actions">
              <a-button 
                type="text" 
                status="success" 
                size="small"
                @click="addFilterCondition"
              >
                <template #icon><IconPlus /></template>
              </a-button>
              <a-button 
                type="text" 
                status="danger" 
                size="small"
                @click="removeFilterCondition(index)"
                :disabled="tempFilters.length === 1 && !tempFilters[0].field"
              >
                <template #icon><IconMinus /></template>
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconDelete,
  IconMinus,
  IconFilter
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

// 状态
const submitting = ref(false)

// 表单数据
const formData = reactive({
  eventName: '',
  eventId: '',
  scenario: [],
  description: '',
  permissions: ['read'],
  expireAt: ''
})

// 事件关系规则数据
const relationRules = ref([
  {
    triggerEvent: '',
    triggerFilters: [], // 触发事件的筛选条件
    timeWindow: 1,
    timeUnit: 'hour',
    relationType: 'happen',
    targetEvent: '',
    targetFilters: [] // 目标事件的筛选条件
  }
])

// 筛选弹窗状态
const filterModalVisible = ref(false)
const currentFilterType = ref('') // 'trigger' or 'target'
const currentRuleIndex = ref(-1)
const tempFilters = ref([])

// 常用映射字段提示
const commonMappingFields = [
  'user_id', 'order_id', 'amount', 'timestamp', 'status', 'device_id', 
  'ip_address', 'platform', 'version', 'product_id', 'category', 'price'
]

// 所有权限选项
const allPermissions = ['read', 'write', 'delete', 'export']

// 输出字段数据
const outputFields = ref([
  { name: '', type: 'string', mapping: '', description: '', error: false }
])

// 权限控制计算属性
const isAllPermissionsSelected = computed(() => {
  return formData.permissions.length === allPermissions.length
})

const isPermissionIndeterminate = computed(() => {
  return formData.permissions.length > 0 && formData.permissions.length < allPermissions.length
})

const handleSelectAllPermissions = (val) => {
  if (val) {
    formData.permissions = [...allPermissions]
  } else {
    formData.permissions = []
  }
}

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
        if (key === 'relationRules') {
          relationRules.value = JSON.parse(JSON.stringify(props.eventData[key]))
        } else {
          formData[key] = props.eventData[key]
        }
      }
    })
    
    if (props.eventData && props.eventData.relationRules) {
    relationRules.value = JSON.parse(JSON.stringify(props.eventData.relationRules))
  } else {
    relationRules.value = [
      {
        triggerEvent: '',
        triggerFilters: [],
        timeWindow: 1,
        timeUnit: 'hour',
        relationType: 'happen',
        targetEvent: '',
        targetFilters: []
      }
    ]
  }

  // 回显输出字段
    if (props.eventData.outputFields && props.eventData.outputFields.length > 0) {
      outputFields.value = props.eventData.outputFields.map(field => ({
        ...field,
        description: field.description || '', // 确保有 description 字段
        error: false
      }))
    }
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
    { name: '', type: 'string', mapping: '', description: '', error: false }
  ]
}

// 验证输出字段
const validateOutputFields = () => {
  let isValid = true
  const names = new Set()
  
  outputFields.value.forEach(field => {
    // 必填校验
    if (!field.name || !field.name.trim()) {
      field.error = true
      isValid = false
    }
    
    // 重复校验
    if (names.has(field.name)) {
      field.error = true
      Message.warning(`字段名称 "${field.name}" 重复`)
      isValid = false
    } else if (field.name) {
      names.add(field.name)
    }
  })
  
  if (!isValid) {
    Message.warning('请检查输出字段配置，字段名称不能为空且不能重复')
    return false
  }
  return true
}

// 事件关系规则操作
const addRule = () => {
  relationRules.value.push({
    triggerEvent: '',
    triggerFilters: [],
    timeWindow: 1,
    timeUnit: 'hour',
    relationType: 'happen',
    targetEvent: '',
    targetFilters: []
  })
}

const removeRule = (index) => {
  if (relationRules.value.length > 1) {
    relationRules.value.splice(index, 1)
  } else {
    Message.warning('至少需要保留一条事件关系规则')
  }
}

// 筛选器操作
const openFilterModal = (index, type) => {
  currentRuleIndex.value = index
  currentFilterType.value = type
  
  const rule = relationRules.value[index]
  const filters = type === 'trigger' ? rule.triggerFilters : rule.targetFilters
  
  // 深拷贝现有筛选条件，如果没有则初始化一个空的
  if (filters && filters.length > 0) {
    tempFilters.value = JSON.parse(JSON.stringify(filters))
  } else {
    tempFilters.value = [{ field: '', operator: '等于', value: '' }]
  }
  
  filterModalVisible.value = true
}

const addFilterCondition = () => {
  tempFilters.value.push({ field: '', operator: '等于', value: '' })
}

const removeFilterCondition = (index) => {
  if (tempFilters.value.length > 1) {
    tempFilters.value.splice(index, 1)
  } else {
    // 如果只有一条，清空内容而不是删除
    tempFilters.value[0] = { field: '', operator: '等于', value: '' }
  }
}

const handleFilterConfirm = () => {
  // 过滤掉无效的筛选条件
  const validFilters = tempFilters.value.filter(f => f.field && f.operator)
  
  const rule = relationRules.value[currentRuleIndex.value]
  if (currentFilterType.value === 'trigger') {
    rule.triggerFilters = validFilters
  } else {
    rule.targetFilters = validFilters
  }
  
  filterModalVisible.value = false
}

const handleFilterCancel = () => {
  filterModalVisible.value = false
}

// 输出字段操作
const addOutputField = () => {
  outputFields.value.push({ name: '', type: 'string', mapping: '', description: '', error: false })
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
    // 验证基本信息
    const formValid = await formRef.value.validate()
    if (formValid) {
      return
    }

    // 验证事件关系规则
    let rulesValid = true
    relationRules.value.forEach(rule => {
      if (!rule.triggerEvent || !rule.targetEvent || !rule.timeWindow) {
        rulesValid = false
      }
    })
    
    if (!rulesValid) {
      Message.warning('请完善事件关系配置')
      return
    }

    // 验证输出字段
    const fieldsValid = validateOutputFields()
    if (!fieldsValid) {
      return
    }
    
    submitting.value = true
    
    // 模拟提交延迟
    setTimeout(() => {
      const submitData = {
        ...formData,
        relationRules: relationRules.value,
        // 过滤并清理数据
        outputFields: outputFields.value
          .filter(field => field.name && field.type)
          .map(({ error, ...rest }) => rest), // 移除 error 字段
        updateTime: new Date().toISOString()
      }
      
      if (!props.eventData) {
        submitData.createTime = new Date().toISOString()
        submitData.updater = '当前用户'
        submitData.status = '已上线'
        submitData.version = 1
        submitData.versions = [{ version: 1, updatedAt: new Date().toISOString(), updater: '当前用户', description: '初始版本' }]
        submitData.expireAt = formData.expireAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
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
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.title-sub {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.section-card {
  margin-bottom: 24px;
  background: white;
  border-radius: 4px;
}

/* 事件关系规则样式 */
.relation-rules {
  margin-bottom: 24px;
}

.rule-item {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #E5E6EB;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
}

.rule-content {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #E5E6EB;
}

.rule-sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1D2129;
}

.text-fixed {
  color: #4E5969;
  font-weight: 500;
  white-space: nowrap;
}

.add-rule-action {
  margin-top: 16px;
}

/* 输出字段样式 */
.output-fields {
  background: #F8F9FA;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.field-header {
  display: grid;
  grid-template-columns: 40px 140px 100px 1fr 1fr 40px;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
}

.field-item {
  display: grid;
  grid-template-columns: 40px 140px 100px 1fr 1fr 40px;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.col-index {
  text-align: center;
  color: #86909c;
  font-size: 12px;
}

.required::before {
  content: '*';
  color: rgb(var(--danger-6));
  margin-right: 4px;
}

.permission-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e5e6eb;
}

.add-field-action {
  margin-top: 16px;
}

/* 权限控制 */
.permission-control {
  background: #F8F9FA;
  border-radius: 4px;
  padding: 16px;
}

/* 筛选样式 */
.event-selector {
  display: flex;
  align-items: center;
  gap: 4px;
}

.has-filter {
  color: rgb(var(--primary-6));
}

/* 底部操作栏 */
.form-actions {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e5e6eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  z-index: 100;
}

/* 表单样式优化 */
:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 8px;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 24px 20px;
}
</style>
