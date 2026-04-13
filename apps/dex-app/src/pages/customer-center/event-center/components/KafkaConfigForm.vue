<template>
  <div class="kafka-config-form">
    <a-form :model="formData" :rules="formRules" ref="formRef" layout="vertical">
      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="数据源名称" field="name">
            <a-input 
              v-model="formData.name" 
              placeholder="请输入数据源名称"
              :max-length="50"
              show-word-limit
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Bootstrap Servers" field="bootstrapServers">
            <a-input 
              v-model="formData.bootstrapServers" 
              placeholder="例如: localhost:9092"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 安全协议 -->
      <a-divider orientation="left">安全协议</a-divider>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="安全协议" field="securityProtocol">
            <a-select 
              v-model="formData.securityProtocol" 
              placeholder="请选择安全协议"
              @change="handleSecurityProtocolChange"
            >
              <a-option value="PLAINTEXT">PLAINTEXT</a-option>
              <a-option value="SSL">SSL</a-option>
              <a-option value="SASL_PLAINTEXT">SASL_PLAINTEXT</a-option>
              <a-option value="SASL_SSL">SASL_SSL</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="isSASLProtocol">
          <a-form-item label="SASL机制" field="saslMechanism">
            <a-select v-model="formData.saslMechanism" placeholder="请选择SASL机制">
              <a-option value="PLAIN">PLAIN</a-option>
              <a-option value="SCRAM-SHA-256">SCRAM-SHA-256</a-option>
              <a-option value="SCRAM-SHA-512">SCRAM-SHA-512</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 认证信息 -->
      <a-row :gutter="24" v-if="isSASLProtocol">
        <a-col :span="12">
          <a-form-item label="用户名" field="username">
            <a-input 
              v-model="formData.username" 
              placeholder="请输入用户名"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="密码" field="password">
            <a-input-password 
              v-model="formData.password" 
              placeholder="请输入密码"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 高级配置 -->
      <a-divider orientation="left">高级配置</a-divider>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="连接超时时间" field="connectionTimeout">
            <a-input-number 
              v-model="formData.connectionTimeout" 
              placeholder="连接超时时间"
              :min="1000"
              :max="60000"
              :step="1000"
            >
              <template #suffix>ms</template>
            </a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="请求超时时间" field="requestTimeout">
            <a-input-number 
              v-model="formData.requestTimeout" 
              placeholder="请求超时时间"
              :min="1000"
              :max="60000"
              :step="1000"
            >
              <template #suffix>ms</template>
            </a-input-number>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="重试次数" field="retries">
            <a-input-number 
              v-model="formData.retries" 
              placeholder="重试次数"
              :min="0"
              :max="10"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="批处理大小" field="batchSize">
            <a-input-number 
              v-model="formData.batchSize" 
              placeholder="批处理大小"
              :min="1"
              :max="10000"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 描述信息 -->
      <a-divider orientation="left">描述信息</a-divider>
      <a-form-item label="描述" field="description">
        <a-textarea 
          v-model="formData.description" 
          placeholder="请输入数据源描述"
          :max-length="500"
          show-word-limit
          :rows="4"
        />
      </a-form-item>

      <!-- 测试连接 -->
      <a-divider orientation="left">连接测试</a-divider>
      <div class="connection-test">
        <a-button 
          type="outline" 
          @click="handleTestConnection"
          :loading="testingConnection"
        >
          <template #icon><IconPlayCircle /></template>
          测试连接
        </a-button>
        <div v-if="testResult" class="test-result" :class="testResult.status">
          <IconCheckCircle v-if="testResult.status === 'success'" />
          <IconCloseCircle v-if="testResult.status === 'error'" />
          {{ testResult.message }}
        </div>
      </div>

      <!-- 表单操作 -->
      <a-form-item>
        <div class="form-actions">
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </a-button>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="text" @click="handleReset">
            重置
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconPlayCircle,
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  datasourceData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel', 'test-connection'])

// 表单引用
const formRef = ref(null)

// 状态
const submitting = ref(false)
const testingConnection = ref(false)

// 测试结果
const testResult = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  bootstrapServers: '',
  securityProtocol: 'PLAINTEXT',
  saslMechanism: '',
  username: '',
  password: '',
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retries: 3,
  batchSize: 16384,
  description: ''
})

// 计算属性
const isSASLProtocol = computed(() => {
  return formData.securityProtocol === 'SASL_PLAINTEXT' || 
         formData.securityProtocol === 'SASL_SSL'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入数据源名称' },
    { min: 2, max: 50, message: '数据源名称长度应在2-50个字符之间' }
  ],
  bootstrapServers: [
    { required: true, message: '请输入Bootstrap Servers地址' },
    { pattern: /^[\w\-\.]+:\d+(,[\w\-\.]+:\d+)*$/, message: '请输入正确的地址格式，例如: localhost:9092' }
  ],
  securityProtocol: [
    { required: true, message: '请选择安全协议' }
  ],
  saslMechanism: [
    { required: true, message: '请选择SASL机制', validator: (value, callback) => {
      if (isSASLProtocol.value && !value) {
        callback('请选择SASL机制')
      } else {
        callback()
      }
    }}
  ],
  username: [
    { required: true, message: '请输入用户名', validator: (value, callback) => {
      if (isSASLProtocol.value && !value) {
        callback('请输入用户名')
      } else {
        callback()
      }
    }}
  ],
  password: [
    { required: true, message: '请输入密码', validator: (value, callback) => {
      if (isSASLProtocol.value && !value) {
        callback('请输入密码')
      } else {
        callback()
      }
    }}
  ],
  connectionTimeout: [
    { required: true, message: '请输入连接超时时间' },
    { min: 1000, max: 60000, message: '连接超时时间应在1000-60000ms之间' }
  ],
  requestTimeout: [
    { required: true, message: '请输入请求超时时间' },
    { min: 1000, max: 60000, message: '请求超时时间应在1000-60000ms之间' }
  ],
  retries: [
    { required: true, message: '请输入重试次数' },
    { min: 0, max: 10, message: '重试次数应在0-10之间' }
  ],
  batchSize: [
    { required: true, message: '请输入批处理大小' },
    { min: 1, max: 10000, message: '批处理大小应在1-10000之间' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符' }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (props.datasourceData) {
    // 编辑模式
    Object.keys(formData).forEach(key => {
      if (props.datasourceData[key] !== undefined) {
        formData[key] = props.datasourceData[key]
      }
    })
  } else {
    // 创建模式 - 使用默认值
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.bootstrapServers = ''
  formData.securityProtocol = 'PLAINTEXT'
  formData.saslMechanism = ''
  formData.username = ''
  formData.password = ''
  formData.connectionTimeout = 10000
  formData.requestTimeout = 30000
  formData.retries = 3
  formData.batchSize = 16384
  formData.description = ''
}

// 安全协议变更处理
const handleSecurityProtocolChange = () => {
  if (!isSASLProtocol.value) {
    formData.saslMechanism = ''
    formData.username = ''
    formData.password = ''
  }
}

// 测试连接
const handleTestConnection = async () => {
  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }
    
    testingConnection.value = true
    testResult.value = null
    
    // 模拟连接测试
    setTimeout(() => {
      // 模拟随机结果
      const isSuccess = Math.random() > 0.2 // 80%成功率
      
      if (isSuccess) {
        testResult.value = {
          status: 'success',
          message: '连接测试成功！Kafka集群连接正常。'
        }
      } else {
        testResult.value = {
          status: 'error',
          message: '连接测试失败：无法连接到Kafka集群，请检查配置。'
        }
      }
      
      testingConnection.value = false
      
      // 触发外部测试事件
      emit('test-connection', formData)
    }, 3000)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 表单提交
const handleSubmit = async () => {
  try {
    // 验证表单
    const valid = await formRef.value.validate()
    if (!valid) {
      return
    }
    
    submitting.value = true
    
    // 模拟提交延迟
    setTimeout(() => {
      const submitData = {
        ...formData,
        updatedAt: new Date().toISOString()
      }
      
      if (!props.datasourceData) {
        submitData.createdAt = new Date().toISOString()
        submitData.status = 'disconnected'
        submitData.topics = []
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
  testResult.value = null
  Message.info('表单已重置')
}

// 监听数据源数据变化
watch(() => props.datasourceData, () => {
  initFormData()
}, { immediate: true })

// 生命周期
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.kafka-config-form {
  padding: 0 16px;
  max-width: 800px;
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

/* 连接测试样式 */
.connection-test {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 24px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.test-result.success {
  color: #00B42A;
}

.test-result.error {
  color: #F53F3F;
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

/* 专业桌面端优化 */
@media screen and (min-width: 1920px) {
  .kafka-config-form {
    padding: 0 24px;
  }
  
  :deep(.arco-row) {
    margin-bottom: 8px;
  }
}
</style>