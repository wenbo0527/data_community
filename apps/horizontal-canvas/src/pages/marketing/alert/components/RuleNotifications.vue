<template>
  <div class="rule-notifications">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="validationRules"
      label-align="left"
      label-col-props="{ span: 6 }"
      wrapper-col-props="{ span: 18 }"
    >
      <!-- 通知渠道配置 -->
      <a-divider orientation="left">通知渠道</a-divider>
      
      <a-form-item
        label="启用渠道"
        field="channels"
        required
      >
        <a-checkbox-group v-model="enabledChannels">
          <a-checkbox value="wechat">企业微信</a-checkbox>
          <a-checkbox value="sms">短信</a-checkbox>
          <a-checkbox value="email">邮件</a-checkbox>
        </a-checkbox-group>
        <template #extra>
          <div class="form-extra">至少选择一个通知渠道，支持多选</div>
        </template>
      </a-form-item>

      <!-- 企业微信配置 -->
      <div v-if="isChannelEnabled('wechat')" class="channel-config">
        <a-divider orientation="left">企业微信配置</a-divider>
        
        <a-form-item
          label="Webhook地址"
          field="channels.wechat.config.webhook"
        >
          <a-input
            v-model="formData.channels.wechat.config.webhook"
            placeholder="请输入企业微信Webhook地址"
            allow-clear
          />
          <template #extra>
            <div class="form-extra">企业微信机器人的Webhook地址，用于发送通知</div>
          </template>
        </a-form-item>

        <a-form-item
          label="消息类型"
          field="channels.wechat.config.msgType"
        >
          <a-radio-group v-model="formData.channels.wechat.config.msgType" type="button">
            <a-radio value="text">文本</a-radio>
            <a-radio value="markdown">Markdown</a-radio>
          </a-radio-group>
          <template #extra>
            <div class="form-extra">选择消息格式类型</div>
          </template>
        </a-form-item>

        <a-form-item
          label="@提醒"
          field="channels.wechat.config.atMobiles"
        >
          <a-input-tag
            v-model="formData.channels.wechat.config.atMobiles"
            placeholder="请输入手机号，按回车确认"
            allow-clear
          />
          <template #extra>
            <div class="form-extra">@指定手机号用户，留空则不@任何人</div>
          </template>
        </a-form-item>

        <a-form-item
          label="@所有人"
          field="channels.wechat.config.atAll"
        >
          <a-switch v-model="formData.channels.wechat.config.atAll">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </a-switch>
          <template #extra>
            <div class="form-extra">是否@企业微信群中的所有人</div>
          </template>
        </a-form-item>
      </div>

      <!-- 短信配置 -->
      <div v-if="isChannelEnabled('sms')" class="channel-config">
        <a-divider orientation="left">短信配置</a-divider>
        
        <a-form-item
          label="短信签名"
          field="channels.sms.config.signature"
        >
          <a-input
            v-model="formData.channels.sms.config.signature"
            placeholder="请输入短信签名"
            allow-clear
          />
          <template #extra>
            <div class="form-extra">短信签名，如：【阿里云】</div>
          </template>
        </a-form-item>

        <a-form-item
          label="模板ID"
          field="channels.sms.config.templateId"
        >
          <a-input
            v-model="formData.channels.sms.config.templateId"
            placeholder="请输入短信模板ID"
            allow-clear
          />
          <template #extra>
            <div class="form-extra">第三方短信服务提供的模板ID</div>
          </template>
        </a-form-item>

        <a-form-item
          label="服务商"
          field="channels.sms.config.provider"
        >
          <a-select
            v-model="formData.channels.sms.config.provider"
            placeholder="请选择短信服务商"
            style="width: 200px"
          >
            <a-option value="aliyun">阿里云</a-option>
            <a-option value="tencent">腾讯云</a-option>
            <a-option value="huawei">华为云</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>
      </div>

      <!-- 邮件配置 -->
      <div v-if="isChannelEnabled('email')" class="channel-config">
        <a-divider orientation="left">邮件配置</a-divider>
        
        <a-form-item
          label="SMTP服务器"
          field="channels.email.config.smtpHost"
        >
          <a-input
            v-model="formData.channels.email.config.smtpHost"
            placeholder="请输入SMTP服务器地址"
            allow-clear
          />
          <template #extra>
            <div class="form-extra">如：smtp.example.com</div>
          </template>
        </a-form-item>

        <a-form-item
          label="SMTP端口"
          field="channels.email.config.smtpPort"
        >
          <a-input-number
            v-model="formData.channels.email.config.smtpPort"
            :min="1"
            :max="65535"
            placeholder="请输入SMTP端口"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item
          label="发件人邮箱"
          field="channels.email.config.senderEmail"
        >
          <a-input
            v-model="formData.channels.email.config.senderEmail"
            placeholder="请输入发件人邮箱地址"
            allow-clear
          />
        </a-form-item>

        <a-form-item
          label="发件人名称"
          field="channels.email.config.senderName"
        >
          <a-input
            v-model="formData.channels.email.config.senderName"
            placeholder="请输入发件人名称"
            allow-clear
          />
        </a-form-item>

        <a-form-item
          label="SSL加密"
          field="channels.email.config.useSSL"
        >
          <a-switch v-model="formData.channels.email.config.useSSL">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </a-switch>
          <template #extra>
            <div class="form-extra">是否使用SSL加密连接</div>
          </template>
        </a-form-item>
      </div>

      <!-- 接收人配置 -->
      <a-divider orientation="left">接收人配置</a-divider>
      
      <a-form-item
        label="接收用户"
        field="recipients.users"
        required
      >
        <a-select
          v-model="formData.recipients.users"
          placeholder="请选择接收用户"
          multiple
          style="width: 100%"
          allow-clear
        >
          <a-option value="user1">张三 (zhangsan@company.com)</a-option>
          <a-option value="user2">李四 (lisi@company.com)</a-option>
          <a-option value="user3">王五 (wangwu@company.com)</a-option>
          <a-option value="user4">赵六 (zhaoliu@company.com)</a-option>
        </a-select>
        <template #extra>
          <div class="form-extra">选择要接收通知的具体用户，支持多选</div>
        </template>
      </a-form-item>

      <a-form-item
        label="接收部门"
        field="recipients.departments"
      >
        <a-select
          v-model="formData.recipients.departments"
          placeholder="请选择接收部门"
          multiple
          style="width: 100%"
          allow-clear
        >
          <a-option value="marketing">市场部</a-option>
          <a-option value="operations">运营部</a-option>
          <a-option value="tech">技术部</a-option>
          <a-option value="customer">客服部</a-option>
        </a-select>
        <template #extra>
          <div class="form-extra">选择要接收通知的部门，支持多选</div>
        </template>
      </a-form-item>

      <a-form-item
        label="接收角色"
        field="recipients.roles"
      >
        <a-select
          v-model="formData.recipients.roles"
          placeholder="请选择接收角色"
          multiple
          style="width: 100%"
          allow-clear
        >
          <a-option value="admin">管理员</a-option>
          <a-option value="operator">运营人员</a-option>
          <a-option value="developer">开发人员</a-option>
          <a-option value="manager">部门经理</a-option>
        </a-select>
        <template #extra>
          <div class="form-extra">选择要接收通知的角色，支持多选</div>
        </template>
      </a-form-item>

      <!-- 高级配置 -->
      <a-divider orientation="left">高级配置</a-divider>
      
      <a-form-item
        label="通知级别"
        field="notificationLevel"
      >
        <a-radio-group v-model="formData.notificationLevel" type="button">
          <a-radio value="urgent">紧急</a-radio>
          <a-radio value="important">重要</a-radio>
          <a-radio value="normal">一般</a-radio>
        </a-radio-group>
        <template #extra>
          <div class="form-extra">通知级别将影响接收人的通知方式和优先级</div>
        </template>
      </a-form-item>

      <a-form-item
        label="免打扰时段"
        field="quietHours"
      >
        <a-time-picker-range
          v-model="formData.quietHours"
          style="width: 240px"
          :placeholder="['开始时间', '结束时间']"
        />
        <template #extra>
          <div class="form-extra">在免打扰时段内不发送通知，为空表示全天可通知</div>
        </template>
      </a-form-item>

      <a-form-item
        label="最大通知次数"
        field="maxNotifications"
      >
        <a-input-number
          v-model="formData.maxNotifications"
          :min="1"
          :max="100"
          placeholder="请输入最大通知次数"
          style="width: 200px"
        />
        <template #suffix>
          <span class="input-suffix">次/天</span>
        </template>
        <template #extra>
          <div class="form-extra">同一规则每天最多发送通知的次数，避免过度打扰</div>
        </template>
      </a-form-item>

      <a-form-item
        label="重试机制"
        field="retryConfig.enabled"
      >
        <a-switch v-model="formData.retryConfig.enabled">
          <template #checked>启用</template>
          <template #unchecked>禁用</template>
        </a-switch>
        <template #extra>
          <div class="form-extra">通知发送失败时是否重试</div>
        </template>
      </a-form-item>

      <div v-if="formData.retryConfig.enabled" class="retry-config">
        <a-form-item
          label="重试次数"
          field="retryConfig.maxRetries"
        >
          <a-input-number
            v-model="formData.retryConfig.maxRetries"
            :min="1"
            :max="5"
            placeholder="请输入重试次数"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item
          label="重试间隔"
          field="retryConfig.retryInterval"
        >
          <a-input-number
            v-model="formData.retryConfig.retryInterval"
            :min="1"
            :max="60"
            placeholder="请输入重试间隔"
            style="width: 200px"
          />
          <template #suffix>
            <span class="input-suffix">分钟</span>
          </template>
        </a-form-item>
      </div>
    </a-form>

    <!-- 接收人预览 -->
    <div class="recipients-preview">
      <a-divider orientation="left">接收人预览</a-divider>
      <div class="preview-content">
        <a-descriptions :data="previewData" :column="1" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const formRef = ref()

// 表单数据
const formData = reactive({
  channels: {
    wechat: {
      enabled: true,
      config: {
        webhook: '',
        msgType: 'text',
        atMobiles: [],
        atAll: false
      }
    },
    sms: {
      enabled: false,
      config: {
        signature: '',
        templateId: '',
        provider: 'aliyun'
      }
    },
    email: {
      enabled: false,
      config: {
        smtpHost: '',
        smtpPort: 587,
        senderEmail: '',
        senderName: '',
        useSSL: true
      }
    }
  },
  recipients: {
    users: [],
    departments: [],
    roles: []
  },
  notificationLevel: 'normal',
  quietHours: [],
  maxNotifications: 10,
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryInterval: 5
  }
})

// 启用的渠道
const enabledChannels = computed({
  get() {
    const channels = []
    if (formData.channels.wechat.enabled) channels.push('wechat')
    if (formData.channels.sms.enabled) channels.push('sms')
    if (formData.channels.email.enabled) channels.push('email')
    return channels
  },
  set(value) {
    formData.channels.wechat.enabled = value.includes('wechat')
    formData.channels.sms.enabled = value.includes('sms')
    formData.channels.email.enabled = value.includes('email')
  }
})

// 验证规则
const validationRules = computed(() => ({
  channels: [
    {
      validator: (value, callback) => {
        const enabledCount = Object.values(formData.channels).filter(c => c.enabled).length
        if (enabledCount === 0) {
          callback('请至少选择一个通知渠道')
        } else {
          callback()
        }
      }
    }
  ],
  recipients: [
    {
      validator: (value, callback) => {
        if (formData.recipients.users.length === 0 && 
            formData.recipients.departments.length === 0 && 
            formData.recipients.roles.length === 0) {
          callback('请至少选择一种接收方式')
        } else {
          callback()
        }
      }
    }
  ],
  // 企业微信验证
  ...(formData.channels.wechat.enabled && {
    'channels.wechat.config.webhook': [
      { required: true, message: '请输入企业微信Webhook地址' },
      { 
        validator: (value, callback) => {
          if (value && !value.startsWith('http')) {
            callback('请输入有效的Webhook地址')
          } else {
            callback()
          }
        }
      }
    ]
  }),
  // 短信验证
  ...(formData.channels.sms.enabled && {
    'channels.sms.config.signature': [
      { required: true, message: '请输入短信签名' }
    ],
    'channels.sms.config.templateId': [
      { required: true, message: '请输入短信模板ID' }
    ]
  }),
  // 邮件验证
  ...(formData.channels.email.enabled && {
    'channels.email.config.smtpHost': [
      { required: true, message: '请输入SMTP服务器地址' }
    ],
    'channels.email.config.smtpPort': [
      { required: true, message: '请输入SMTP端口' }
    ],
    'channels.email.config.senderEmail': [
      { required: true, message: '请输入发件人邮箱地址' },
      { 
        validator: (value, callback) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (value && !emailRegex.test(value)) {
            callback('请输入有效的邮箱地址')
          } else {
            callback()
          }
        }
      }
    ],
    'channels.email.config.senderName': [
      { required: true, message: '请输入发件人名称' }
    ]
  })
}))

// 检查渠道是否启用
const isChannelEnabled = (channel) => {
  return formData.channels[channel]?.enabled || false
}

// 获取通知级别标签
const getNotificationLevelLabel = (level) => {
  const labels = {
    urgent: '紧急',
    important: '重要',
    normal: '一般'
  }
  return labels[level] || level
}

// 预览数据
const previewData = computed(() => {
  const data = []
  
  // 启用的渠道
  const enabledChannels = Object.entries(formData.channels)
    .filter(([_, config]) => config.enabled)
    .map(([channel, _]) => {
      const labels = {
        wechat: '企业微信',
        sms: '短信',
        email: '邮件'
      }
      return labels[channel] || channel
    })
  
  if (enabledChannels.length > 0) {
    data.push({
      label: '启用渠道',
      value: enabledChannels.join(', ')
    })
  }
  
  // 接收人统计
  const recipientCount = formData.recipients.users.length + 
                        formData.recipients.departments.length + 
                        formData.recipients.roles.length
  
  if (recipientCount > 0) {
    data.push({
      label: '接收人统计',
      value: `${formData.recipients.users.length}个用户, ${formData.recipients.departments.length}个部门, ${formData.recipients.roles.length}个角色`
    })
  }
  
  // 通知级别
  data.push({
    label: '通知级别',
    value: getNotificationLevelLabel(formData.notificationLevel)
  })
  
  // 免打扰时段
  if (formData.quietHours && formData.quietHours.length === 2) {
    data.push({
      label: '免打扰时段',
      value: `${formData.quietHours[0]} - ${formData.quietHours[1]}`
    })
  }
  
  // 最大通知次数
  data.push({
    label: '最大通知次数',
    value: `${formData.maxNotifications}次/天`
  })
  
  // 重试配置
  if (formData.retryConfig.enabled) {
    data.push({
      label: '重试机制',
      value: `最多${formData.retryConfig.maxRetries}次，间隔${formData.retryConfig.retryInterval}分钟`
    })
  }
  
  return data
})

// 监听数据变化
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, newValue)
}, { immediate: true, deep: true })

watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// 验证方法
const validate = async () => {
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 重置方法
const reset = () => {
  Object.assign(formData, {
    channels: {
      wechat: {
        enabled: true,
        config: {
          webhook: '',
          msgType: 'text',
          atMobiles: [],
          atAll: false
        }
      },
      sms: {
        enabled: false,
        config: {
          signature: '',
          templateId: '',
          provider: 'aliyun'
        }
      },
      email: {
        enabled: false,
        config: {
          smtpHost: '',
          smtpPort: 587,
          senderEmail: '',
          senderName: '',
          useSSL: true
        }
      }
    },
    recipients: {
      users: [],
      departments: [],
      roles: []
    },
    notificationLevel: 'normal',
    quietHours: [],
    maxNotifications: 10,
    retryConfig: {
      enabled: true,
      maxRetries: 3,
      retryInterval: 5
    }
  })
}

// 暴露方法
defineExpose({
  validate,
  reset
})
</script>

<style scoped lang="less">
.rule-notifications {
  padding: 24px 0;
}

.channel-config {
  margin-bottom: 24px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

.form-extra {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.input-suffix {
  color: #86909c;
  font-size: 12px;
  margin-left: 8px;
}

.retry-config {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-top: 16px;
}

.recipients-preview {
  margin-top: 32px;
  
  .preview-content {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 16px;
  }
}
</style>