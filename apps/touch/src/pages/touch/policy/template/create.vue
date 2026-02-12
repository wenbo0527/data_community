<template>
  <div class="policy-template-create">
    <a-card :bordered="false" title="新建策略模板">
      <a-form :model="formState" layout="vertical" ref="formRef">
        
        <!-- 模块一：消息策略模板新建 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-icon">📝</span>
              <span>消息策略模板新建</span>
            </div>
          </div>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="标题" required>
                <a-input v-model="formState.title" placeholder="请输入标题" size="large" />
              </a-form-item>
            </a-col>
            
            <a-col :span="12">
              <a-form-item label="消息类型" required>
                <a-select v-model="formState.messageType" placeholder="请选择消息类型" size="large">
                  <a-option value="sms">短信</a-option>
                  <a-option value="push">推送</a-option>
                  <a-option value="email">邮件</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="一级场景" required>
                <a-select v-model="formState.scene" placeholder="请选择一级场景" size="large">
                  <a-option value="marketing">营销类</a-option>
                  <a-option value="risk">风控类</a-option>
                  <a-option value="notification">通知类</a-option>
                  <a-option value="history">历史存量</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="12">
              <a-form-item label="策略tag" required>
                <a-select v-model="formState.tags" mode="multiple" placeholder="请选择策略tag" size="large">
                  <a-option value="high_priority">高优先级</a-option>
                  <a-option value="test">测试</a-option>
                  <a-option value="production">生产</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="产品">
                <a-select v-model="formState.product" placeholder="请选择产品" size="large">
                  <a-option value="su">Su音</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="12">
              <a-form-item label="目标渠道" required>
                <a-select 
                  v-model="formState.channel" 
                  placeholder="请选择目标渠道" 
                  size="large"
                  @change="handleChannelChange"
                >
                  <a-option v-for="item in channelOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="策略级频控" help="发送次数可设置2-5次">
                <a-select v-model="formState.frequencyControl" placeholder="请选择频控次数" size="large">
                  <a-option value="2">2次</a-option>
                  <a-option value="3">3次</a-option>
                  <a-option value="4">4次</a-option>
                  <a-option value="5">5次</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <a-col :span="12">
              <a-form-item label="发送次数" required>
                <a-input-number 
                  v-model="formState.sendCount" 
                  :min="1" 
                  style="width: 100%;"
                  size="large"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        
        <!-- 模块二：消息策略 -->
        <div v-if="formState.channel" class="form-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-icon">💬</span>
              <span>消息策略</span>
            </div>
          </div>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="厂商" required>
                <a-select v-model="formState.vendor" placeholder="请选择厂商" size="large">
                  <a-option v-for="item in vendorOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <!-- 短信策略 -->
          <template v-if="formState.channel === 'sms'">
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item label="短信模板" required>
                  <a-radio-group v-model="formState.smsTemplateType" @change="handleSmsTemplateTypeChange" size="large">
                    <a-radio value="new">新建短信模板</a-radio>
                    <a-radio value="existing">选择已有模板</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24" v-if="formState.smsTemplateType === 'new'">
              <a-col :span="12">
                <a-form-item label="模板标题" required>
                  <a-input v-model="formState.smsTemplateTitle" placeholder="请输入短信模板标题" size="large" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24" v-if="formState.smsTemplateType === 'new'">
              <a-col :span="24">
                <a-form-item label="短信内容" required>
                  <a-textarea 
                    v-model="formState.smsContent" 
                    placeholder="请输入短信内容"
                    :auto-size="{ minRows: 4, maxRows: 8 }"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24" v-if="formState.smsTemplateType === 'existing'">
              <a-col :span="12">
                <a-form-item label="选择模板" required>
                  <a-select v-model="formState.smsTemplateId" placeholder="请选择短信模板" allow-search size="large">
                    <a-option v-for="item in smsTemplateList" :key="item.id" :value="item.id">
                      {{ item.templateId }} - {{ item.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </template>
          
          <!-- AI外呼策略 -->
          <template v-if="formState.channel === 'ai_call'">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="AI模板标题" required>
                  <a-select v-model="formState.aiTemplateId" placeholder="请选择AI模板" allow-search size="large">
                    <a-option value="1">AI外呼话术A</a-option>
                    <a-option value="2">AI外呼话术B</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              
              <a-col :span="12">
                <a-form-item label="外呼任务ID" required>
                  <a-input v-model="formState.callTaskId" placeholder="请输入外呼任务ID" size="large" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="是否挂短" required>
                  <a-radio-group v-model="formState.withSms" @change="handleWithSmsChange" size="large">
                    <a-radio :value="true">是</a-radio>
                    <a-radio :value="false">否</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            
            <!-- AI外呼挂短短信模板 -->
            <template v-if="formState.withSms">
              <div class="subsection">
                <div class="subsection-title">挂短短信配置</div>
                
                <a-row :gutter="24">
                  <a-col :span="24">
                    <a-form-item label="挂短短信模板" required>
                      <a-radio-group v-model="formState.smsFallbackType" size="large">
                        <a-radio value="new">新建短信模板</a-radio>
                        <a-radio value="existing">选择已有模板</a-radio>
                      </a-radio-group>
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'new'">
                  <a-col :span="12">
                    <a-form-item label="短信模板标题" required>
                      <a-input v-model="formState.smsFallbackTitle" placeholder="请输入短信模板标题" size="large" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'new'">
                  <a-col :span="24">
                    <a-form-item label="短信内容" required>
                      <a-textarea 
                        v-model="formState.smsFallbackContent" 
                        placeholder="请输入短信内容"
                        :auto-size="{ minRows: 4, maxRows: 8 }"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'existing'">
                  <a-col :span="12">
                    <a-form-item label="选择模板" required>
                      <a-select v-model="formState.smsFallbackTemplateId" placeholder="请选择短信模板" allow-search size="large">
                        <a-option v-for="item in smsTemplateList" :key="item.id" :value="item.id">
                          {{ item.templateId }} - {{ item.label }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </template>
          </template>
          
          <!-- 人工外呼策略 -->
          <template v-if="formState.channel === 'manual_call'">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="人工模板标题" required>
                  <a-select v-model="formState.manualTemplateId" placeholder="请选择人工模板" allow-search size="large">
                    <a-option value="1">人工外呼脚本A</a-option>
                    <a-option value="2">人工外呼脚本B</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              
              <a-col :span="12">
                <a-form-item label="外呼任务ID" required>
                  <a-input v-model="formState.callTaskId" placeholder="请输入外呼任务ID" size="large" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="渠道编号" required>
                  <a-input v-model="formState.channelCode" placeholder="请输入渠道编号" size="large" />
                </a-form-item>
              </a-col>
              
              <a-col :span="12">
                <a-form-item label="名单失效时间" required>
                  <a-date-picker 
                    v-model="formState.listExpireTime" 
                    show-time 
                    format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%;"
                    size="large"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="是否挂短" required>
                  <a-radio-group v-model="formState.withSms" @change="handleWithSmsChange" size="large">
                    <a-radio :value="true">是</a-radio>
                    <a-radio :value="false">否</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            
            <!-- 人工外呼挂短短信模板 -->
            <template v-if="formState.withSms">
              <div class="subsection">
                <div class="subsection-title">挂短短信配置</div>
                
                <a-row :gutter="24">
                  <a-col :span="24">
                    <a-form-item label="挂短短信模板" required>
                      <a-radio-group v-model="formState.smsFallbackType" size="large">
                        <a-radio value="new">新建短信模板</a-radio>
                        <a-radio value="existing">选择已有模板</a-radio>
                      </a-radio-group>
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'new'">
                  <a-col :span="12">
                    <a-form-item label="短信模板标题" required>
                      <a-input v-model="formState.smsFallbackTitle" placeholder="请输入短信模板标题" size="large" />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'new'">
                  <a-col :span="24">
                    <a-form-item label="短信内容" required>
                      <a-textarea 
                        v-model="formState.smsFallbackContent" 
                        placeholder="请输入短信内容"
                        :auto-size="{ minRows: 4, maxRows: 8 }"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="24" v-if="formState.smsFallbackType === 'existing'">
                  <a-col :span="12">
                    <a-form-item label="选择模板" required>
                      <a-select v-model="formState.smsFallbackTemplateId" placeholder="请选择短信模板" allow-search size="large">
                        <a-option v-for="item in smsTemplateList" :key="item.id" :value="item.id">
                          {{ item.templateId }} - {{ item.label }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </template>
          </template>
        </div>
        
        <!-- 模块三：发送时间 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-icon">⏰</span>
              <span>发送时间</span>
            </div>
          </div>
          
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="每日发送时间段">
                <div class="time-range-wrapper">
                  <a-time-picker 
                    v-model="formState.timeStart" 
                    format="HH:mm:ss" 
                    placeholder="开始时间"
                    style="width: 200px"
                    size="large"
                  />
                  <span class="time-range-sep">至</span>
                  <a-time-picker 
                    v-model="formState.timeEnd" 
                    format="HH:mm:ss" 
                    placeholder="结束时间"
                    style="width: 200px"
                    size="large"
                  />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-space size="large">
            <a-button type="primary" size="large" @click="handleSubmit">
              <template #icon><icon-check /></template>
              确定
            </a-button>
            <a-button size="large" @click="handleCancel">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-space>
        </div>
        
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconCheck, IconClose } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const formRef = ref()

const formState = reactive({
  // 模块一：消息策略模板新建
  title: '',
  messageType: '',
  scene: '',
  tags: [] as string[],
  product: '',
  channel: '',
  frequencyControl: '',
  sendCount: 5,
  
  // 模块二：消息策略
  vendor: '',
  
  // 短信策略
  smsTemplateType: 'existing',
  smsTemplateId: '',
  smsTemplateTitle: '',
  smsContent: '',
  
  // AI外呼策略
  aiTemplateId: '',
  callTaskId: '',
  withSms: false,
  
  // 人工外呼策略
  manualTemplateId: '',
  channelCode: '',
  listExpireTime: '',
  
  // 挂短短信
  smsFallbackType: 'existing',
  smsFallbackTemplateId: '',
  smsFallbackTitle: '',
  smsFallbackContent: '',
  
  // 模块三：发送时间
  timeStart: '',
  timeEnd: ''
})

const channelOptions = [
  { label: '短信', value: 'sms' },
  { label: 'AI外呼', value: 'ai_call' },
  { label: '人工外呼', value: 'manual_call' }
]

const vendorOptionsMap: Record<string, { label: string, value: string }[]> = {
  sms: [
    { label: '阿里云短信', value: 'aliyun' },
    { label: '腾讯云短信', value: 'tencent' }
  ],
  ai_call: [
    { label: '百应', value: 'baiying' },
    { label: '九四', value: 'jiusi' }
  ],
  manual_call: [
    { label: '人工坐席', value: 'manual' }
  ]
}

// 短信模板列表
const smsTemplateList = ref([
  {
    id: 1,
    templateId: "2601122006487765848108",
    label: "促销券下发成功短信通知"
  },
  {
    id: 2,
    templateId: "2501211448648175551156",
    label: "优惠券下发成功短信通知"
  },
  {
    id: 3,
    templateId: "2511228101960531071201",
    label: "手机APP优惠本商用"
  }
])

const vendorOptions = computed(() => {
  return vendorOptionsMap[formState.channel] || []
})

const handleChannelChange = () => {
  formState.vendor = ''
  resetMessageStrategy()
}

const handleSmsTemplateTypeChange = () => {
  formState.smsTemplateId = ''
  formState.smsTemplateTitle = ''
  formState.smsContent = ''
}

const handleWithSmsChange = () => {
  formState.smsFallbackType = 'existing'
  formState.smsFallbackTemplateId = ''
  formState.smsFallbackTitle = ''
  formState.smsFallbackContent = ''
}

const resetMessageStrategy = () => {
  // 短信策略
  formState.smsTemplateType = 'existing'
  formState.smsTemplateId = ''
  formState.smsTemplateTitle = ''
  formState.smsContent = ''
  
  // AI外呼策略
  formState.aiTemplateId = ''
  formState.callTaskId = ''
  formState.withSms = false
  
  // 人工外呼策略
  formState.manualTemplateId = ''
  formState.channelCode = ''
  formState.listExpireTime = ''
  
  // 挂短短信
  formState.smsFallbackType = 'existing'
  formState.smsFallbackTemplateId = ''
  formState.smsFallbackTitle = ''
  formState.smsFallbackContent = ''
}

if (route.query && route.query.mode === 'copy') {
  formState.title = String(route.query.title || '')
  formState.messageType = String(route.query.messageType || '')
  formState.scene = String(route.query.scene || '')
  formState.vendor = String(route.query.vendor || '')
  try {
    const parsed = JSON.parse(String(route.query.tags || '[]'))
    formState.tags = Array.isArray(parsed) ? parsed : []
  } catch {
    formState.tags = []
  }
}

const handleSubmit = () => {
  // 验证必填项
  if (!formState.title) {
    Message.warning('请输入标题')
    return
  }
  
  if (formState.channel === 'sms') {
    if (formState.smsTemplateType === 'new') {
      if (!formState.smsTemplateTitle || !formState.smsContent) {
        Message.warning('请完善短信模板信息')
        return
      }
    } else {
      if (!formState.smsTemplateId) {
        Message.warning('请选择短信模板')
        return
      }
    }
  }
  
  if (formState.channel === 'ai_call') {
    if (!formState.aiTemplateId || !formState.callTaskId) {
      Message.warning('请完善AI外呼策略信息')
      return
    }
    if (formState.withSms) {
      if (formState.smsFallbackType === 'new') {
        if (!formState.smsFallbackTitle || !formState.smsFallbackContent) {
          Message.warning('请完善挂短短信模板信息')
          return
        }
      } else {
        if (!formState.smsFallbackTemplateId) {
          Message.warning('请选择挂短短信模板')
          return
        }
      }
    }
  }
  
  if (formState.channel === 'manual_call') {
    if (!formState.manualTemplateId || !formState.callTaskId || !formState.channelCode || !formState.listExpireTime) {
      Message.warning('请完善人工外呼策略信息')
      return
    }
    if (formState.withSms) {
      if (formState.smsFallbackType === 'new') {
        if (!formState.smsFallbackTitle || !formState.smsFallbackContent) {
          Message.warning('请完善挂短短信模板信息')
          return
        }
      } else {
        if (!formState.smsFallbackTemplateId) {
          Message.warning('请选择挂短短信模板')
          return
        }
      }
    }
  }
  
  Message.success('策略模板创建成功')
  router.push('/touch/policy/template')
}

const handleCancel = () => {
  router.push('/touch/policy/template')
}
</script>

<style scoped>
.policy-template-create {
  padding: 20px;
  background: #f2f3f5;
  min-height: 100vh;
}

.policy-template-create :deep(.arco-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.policy-template-create :deep(.arco-card-body) {
  padding: 32px;
}

.policy-template-create :deep(.arco-form) {
  max-width: 1200px;
  margin: 0 auto;
}

/* 表单模块 */
.form-section {
  margin-bottom: 48px;
  padding: 24px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e6eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-icon {
  font-size: 20px;
}

/* 子模块 */
.subsection {
  margin-top: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.subsection-title {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
  font-size: 15px;
  font-weight: 500;
  color: #4e5969;
}

/* 表单项样式 */
:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

:deep(.arco-form-item-label-required-symbol) {
  color: #f53f3f;
  margin-right: 4px;
}

:deep(.arco-select-view),
:deep(.arco-input),
:deep(.arco-textarea),
:deep(.arco-picker),
:deep(.arco-input-number) {
  border-radius: 4px;
}

:deep(.arco-select-view:hover),
:deep(.arco-input:hover),
:deep(.arco-textarea:hover),
:deep(.arco-picker:hover),
:deep(.arco-input-number:hover) {
  border-color: #4080ff;
}

:deep(.arco-radio-group) {
  display: flex;
  gap: 24px;
}

:deep(.arco-radio) {
  font-size: 14px;
}

:deep(.arco-textarea) {
  font-size: 14px;
  line-height: 1.6;
}

/* 时间范围 */
.time-range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-range-sep {
  color: #86909c;
  font-size: 14px;
}

/* 操作按钮 */
.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .policy-template-create {
    padding: 12px;
  }
  
  .policy-template-create :deep(.arco-card-body) {
    padding: 16px;
  }
  
  .form-section {
    padding: 16px;
  }
}
</style>
