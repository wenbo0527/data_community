<template>
  <div class="event-form">
    <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical">
      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="事件名称" field="eventName">
            <a-input 
              v-model="formData.eventName" 
              placeholder="请输入事件名称"
              :max-length="50"
              show-word-limit
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="事件类型" field="eventType">
            <a-select v-model="formData.eventType" placeholder="请选择事件类型">
              <a-option value="系统事件">系统事件</a-option>
              <a-option value="业务事件">业务事件</a-option>
              <a-option value="用户事件">用户事件</a-option>
              <a-option value="营销事件">营销事件</a-option>
              <a-option value="风控事件">风控事件</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="事件来源" field="eventSource">
            <a-select v-model="formData.eventSource" placeholder="请选择事件来源">
              <a-option value="系统">系统</a-option>
              <a-option value="用户操作">用户操作</a-option>
              <a-option value="定时任务">定时任务</a-option>
              <a-option value="外部触发">外部触发</a-option>
              <a-option value="API调用">API调用</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" field="status">
            <a-radio-group v-model="formData.status">
              <a-radio value="上线">上线</a-radio>
              <a-radio value="下线">下线</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 触发条件 -->
      <a-divider orientation="left">触发条件</a-divider>
      <a-form-item label="触发条件" field="triggerCondition">
        <a-textarea 
          v-model="formData.triggerCondition" 
          placeholder="请输入事件触发条件，例如：用户点击购买按钮"
          :max-length="200"
          show-word-limit
          :rows="3"
        />
      </a-form-item>

      <!-- 字段定义 -->
      <a-divider orientation="left">字段定义</a-divider>
      <a-form-item label="注册键" field="registryKey">
        <a-select v-model="formData.registryKey" placeholder="请选择注册键">
          <a-option value="user_id">用户ID</a-option>
          <a-option value="order_id">订单ID</a-option>
          <a-option value="transaction_id">交易ID</a-option>
          <a-option value="event_id">事件ID</a-option>
          <a-option value="session_id">会话ID</a-option>
        </a-select>
      </a-form-item>

      <!-- 描述信息 -->
      <a-divider orientation="left">描述信息</a-divider>
      <a-form-item label="事件描述" field="description">
        <a-textarea 
          v-model="formData.description" 
          placeholder="请输入事件详细描述"
          :max-length="500"
          show-word-limit
          :rows="4"
        />
      </a-form-item>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="负责人" field="owner">
            <a-input 
              v-model="formData.owner" 
              placeholder="请输入负责人姓名"
              :max-length="20"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="标签" field="tags">
            <a-input-tag 
              v-model="formData.tags" 
              placeholder="请输入标签，按回车确认"
              :max-tag-count="5"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 高级配置 -->
      <a-divider orientation="left">高级配置</a-divider>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="优先级" field="priority">
            <a-select v-model="formData.priority" placeholder="请选择优先级">
              <a-option value="low">低</a-option>
              <a-option value="medium">中</a-option>
              <a-option value="high">高</a-option>
              <a-option value="urgent">紧急</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="有效期限" field="expiryDays">
            <a-input-number 
              v-model="formData.expiryDays" 
              placeholder="有效天数"
              :min="1"
              :max="365"
              :precision="0"
            >
              <template #suffix>天</template>
            </a-input-number>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 表单操作 -->
      <a-form-item>
        <div class="form-actions">
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </a-button>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="text" @click="handleReset">
            重置
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  eventData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 表单引用
const formRef = ref(null)

// 提交状态
const submitting = ref(false)

// 表单数据
const formData = reactive({
  eventName: '',
  eventType: '',
  eventSource: '',
  status: '下线',
  triggerCondition: '',
  registryKey: 'user_id',
  description: '',
  owner: '',
  tags: [],
  priority: 'medium',
  expiryDays: 30
})

// 表单验证规则
const formRules = {
  eventName: [
    { required: true, message: '请输入事件名称' },
    { min: 2, max: 50, message: '事件名称长度应在2-50个字符之间' }
  ],
  eventType: [
    { required: true, message: '请选择事件类型' }
  ],
  eventSource: [
    { required: true, message: '请选择事件来源' }
  ],
  status: [
    { required: true, message: '请选择状态' }
  ],
  triggerCondition: [
    { required: true, message: '请输入触发条件' },
    { max: 200, message: '触发条件长度不能超过200个字符' }
  ],
  registryKey: [
    { required: true, message: '请选择注册键' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符' }
  ],
  owner: [
    { required: true, message: '请输入负责人姓名' },
    { max: 20, message: '负责人姓名长度不能超过20个字符' }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (props.eventData) {
    // 编辑模式
    Object.keys(formData).forEach(key => {
      if (props.eventData[key] !== undefined) {
        formData[key] = props.eventData[key]
      }
    })
  } else {
    // 创建模式 - 使用默认值
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'tags') {
      formData[key] = []
    } else if (key === 'status') {
      formData[key] = '下线'
    } else if (key === 'priority') {
      formData[key] = 'medium'
    } else if (key === 'expiryDays') {
      formData[key] = 30
    } else if (key === 'registryKey') {
      formData[key] = 'user_id'
    } else {
      formData[key] = ''
    }
  })
}

// 表单提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }
    
    submitting.value = true
    
    // 模拟提交延迟
    setTimeout(() => {
      const submitData = {
        ...formData,
        updateTime: new Date().toISOString()
      }
      
      if (!props.eventData) {
        submitData.createTime = new Date().toISOString()
      }
      
      emit('submit', submitData)
      submitting.value = false
    }, 1000)
    
  } catch (error) {
    console.error('表单验证失败:', error)
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}

// 重置表单
const handleReset = () => {
  resetForm()
  Message.info('表单已重置')
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
.event-form {
  padding: 0 16px;
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

/* 操作按钮样式 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #F2F3F5;
  margin-top: 24px;
}

/* 输入框样式优化 */
:deep(.arco-input-wrapper),
:deep(.arco-textarea-wrapper) {
  border-radius: 6px;
}

:deep(.arco-input-wrapper:focus-within),
:deep(.arco-textarea-wrapper:focus-within) {
  border-color: #165DFF;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 标签输入框样式 */
:deep(.arco-input-tag) {
  border-radius: 6px;
  min-height: 36px;
}

/* 选择器样式 */
:deep(.arco-select-view-single) {
  border-radius: 6px;
}

/* 数字输入框样式 */
:deep(.arco-input-number) {
  border-radius: 6px;
}

/* 单选框样式 */
:deep(.arco-radio-checked .arco-radio-icon) {
  border-color: #165DFF;
  background-color: #165DFF;
}

/* 专业桌面端样式 */
@media screen and (min-width: 1920px) {
  .event-form {
    padding: 0 24px;
  }
  
  :deep(.arco-row) {
    margin-bottom: 8px;
  }
}
</style>