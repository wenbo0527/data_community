<template>
  <div class="alert-rule-edit">
    <div class="header">
      <h1>编辑预警规则</h1>
      <a-button @click="handleBack">返回列表</a-button>
    </div>

    <div class="step-container">
      <a-steps :current="currentStep" type="line">
        <a-step description="填写规则基本信息">基本信息</a-step>
        <a-step description="配置预警触发条件">条件配置</a-step>
        <a-step description="设置通知渠道和接收人">通知设置</a-step>
        <a-step description="配置通知文案模板">文案配置</a-step>
        <a-step description="确认规则配置信息">预览确认</a-step>
      </a-steps>
    </div>

    <div class="form-container">
      <div class="form-content">
        <!-- 步骤1: 基本信息 -->
        <div v-show="currentStep === 0" class="step-form">
          <RuleBasicInfo
            ref="basicInfoRef"
            v-model="ruleForm.basicInfo"
            :rules="validationRules.basicInfo"
          />
        </div>

        <!-- 步骤2: 条件配置 -->
        <div v-show="currentStep === 1" class="step-form">
          <RuleConditions
            ref="conditionsRef"
            v-model="ruleForm.conditions"
            :rule-type="ruleForm.basicInfo.type"
            :rules="validationRules.conditions"
          />
        </div>

        <!-- 步骤3: 通知设置 -->
        <div v-show="currentStep === 2" class="step-form">
          <RuleNotifications
            ref="notificationsRef"
            v-model="ruleForm.notifications"
            :rules="validationRules.notifications"
          />
        </div>

        <!-- 步骤4: 文案配置 -->
        <div v-show="currentStep === 3" class="step-form">
          <RuleContentTemplate
            ref="contentTemplateRef"
            v-model="ruleForm.contentTemplate"
            :rule-type="ruleForm.basicInfo.type"
            :rules="validationRules.contentTemplate"
          />
        </div>

        <!-- 步骤5: 预览确认 -->
        <div v-show="currentStep === 4" class="step-form">
          <RulePreview
            :rule-form="ruleForm"
            :preview-data="previewData"
            :is-edit="true"
          />
        </div>
      </div>

      <div class="preview-panel" v-if="currentStep < 4">
        <div class="preview-header">
          <h3>实时预览</h3>
        </div>
        <div class="preview-content">
          <ContentPreview
            :rule-form="ruleForm"
            :current-step="currentStep"
            :preview-data="previewData"
          />
        </div>
      </div>
    </div>

    <div class="step-actions">
      <a-space>
        <a-button
          v-if="currentStep > 0"
          @click="handlePrev"
        >
          上一步
        </a-button>
        <a-button
          v-if="currentStep < 4"
          type="primary"
          @click="handleNext"
        >
          下一步
        </a-button>
        <a-button
          v-if="currentStep === 4"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存修改
        </a-button>
        <a-button @click="handleSaveDraft">保存草稿</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import RuleBasicInfo from '../components/RuleBasicInfo.vue'
import RuleConditions from '../components/RuleConditions.vue'
import RuleNotifications from '../components/RuleNotifications.vue'
import RuleContentTemplate from '../components/RuleContentTemplate.vue'
import RulePreview from '../components/RulePreview.vue'
import ContentPreview from '../components/ContentPreview.vue'

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const saving = ref(false)
const loading = ref(true)

// 表单引用
const basicInfoRef = ref()
const conditionsRef = ref()
const notificationsRef = ref()
const contentTemplateRef = ref()

// 规则表单数据
const ruleForm = reactive({
  basicInfo: {
    name: '',
    type: 'inventory',
    description: '',
    tags: []
  },
  conditions: {
    type: 'inventory',
    threshold: 100,
    thresholdType: 'absolute',
    timeWindow: '1h',
    checkInterval: '5m',
    consecutiveCount: 1
  },
  notifications: {
    channels: [
      { type: 'wechat', enabled: true, config: {} },
      { type: 'sms', enabled: false, config: {} },
      { type: 'email', enabled: false, config: {} }
    ],
    recipients: {
      users: [],
      departments: [],
      roles: []
    }
  },
  contentTemplate: {
    wechat: {
      template: '',
      variables: []
    },
    sms: {
      template: '',
      variables: []
    },
    email: {
      template: '',
      variables: [],
      subject: ''
    }
  }
})

// 验证规则
const validationRules = {
  basicInfo: {
    name: [{ required: true, message: '请输入规则名称' }],
    type: [{ required: true, message: '请选择监控类型' }]
  },
  conditions: {
    threshold: [{ required: true, message: '请输入阈值' }],
    checkInterval: [{ required: true, message: '请选择检查频率' }]
  },
  notifications: {
    channels: [{ required: true, message: '请配置通知渠道' }],
    recipients: [{ required: true, message: '请设置接收人' }]
  },
  contentTemplate: {
    wechat: [{ required: true, message: '请配置企业微信文案' }]
  }
}

// 预览数据
const previewData = computed(() => ({
  ruleName: ruleForm.basicInfo.name,
  ruleType: ruleForm.basicInfo.type,
  triggerTime: new Date().toLocaleString('zh-CN'),
  checkInterval: ruleForm.conditions.checkInterval,
  metricName: getMetricName(ruleForm.basicInfo.type),
  threshold: ruleForm.conditions.threshold,
  currentValue: Math.floor(Math.random() * 200),
  unit: getUnit(ruleForm.basicInfo.type),
  trend: Math.random() > 0.5 ? '上升' : '下降',
  couponName: '春节优惠券A',
  inventoryName: '优惠券库存A',
  packageName: '春节券包',
  failureRate: Math.floor(Math.random() * 10),
  remainingDays: Math.floor(Math.random() * 30)
}))

const getMetricName = (type) => {
  const names = {
    inventory: '库存量',
    expiry: '剩余天数',
    failure: '失败次数'
  }
  return names[type] || '指标'
}

const getUnit = (type) => {
  const units = {
    inventory: '个',
    expiry: '天',
    failure: '次'
  }
  return units[type] || ''
}

// 加载规则数据
const loadRuleData = async () => {
  const ruleId = route.params.id
  if (!ruleId) {
    Message.error('规则ID不存在')
    router.push('/marketing/alert/rules')
    return
  }
  
  try {
    loading.value = true
    
    // 模拟API调用获取规则数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟规则数据，实际应该从API获取
    const mockRuleData = {
      basicInfo: {
        name: '库存预警规则-优惠券A',
        type: 'inventory',
        description: '监控优惠券库存情况，确保业务正常运行',
        tags: ['库存', '预警', '优惠券']
      },
      conditions: {
        type: 'inventory',
        threshold: 100,
        thresholdType: 'absolute',
        timeWindow: '1h',
        checkInterval: '5m',
        consecutiveCount: 1
      },
      notifications: {
        channels: [
          { type: 'wechat', enabled: true, config: { webhook: 'xxx' } },
          { type: 'sms', enabled: false, config: {} },
          { type: 'email', enabled: true, config: { smtp: 'xxx' } }
        ],
        recipients: {
          users: ['user1', 'user2', 'user3'],
          departments: ['marketing', 'operations'],
          roles: ['admin', 'operator']
        }
      },
      contentTemplate: {
        wechat: {
          template: '【库存预警】{{inventoryName}}库存告急！\n当前库存：{{currentValue}}{{unit}}\n预警阈值：{{threshold}}{{unit}}\n趋势：{{trend}}\n请及时补充库存，避免影响业务。\n触发时间：{{triggerTime}}',
          variables: ['inventoryName', 'currentValue', 'unit', 'threshold', 'trend', 'triggerTime']
        },
        sms: {
          template: '【库存预警】{{inventoryName}}库存不足，当前{{currentValue}}{{unit}}，请及时处理。',
          variables: ['inventoryName', 'currentValue', 'unit']
        },
        email: {
          template: '【库存预警】{{inventoryName}}库存告急！<br>当前库存：{{currentValue}}{{unit}}<br>预警阈值：{{threshold}}{{unit}}<br>趋势：{{trend}}<br>请及时补充库存，避免影响业务。<br>触发时间：{{triggerTime}}',
          variables: ['inventoryName', 'currentValue', 'unit', 'threshold', 'trend', 'triggerTime'],
          subject: '库存预警通知 - {{inventoryName}}'
        }
      }
    }
    
    // 填充表单数据
    Object.assign(ruleForm, mockRuleData)
    
  } catch (error) {
    Message.error('加载规则数据失败')
    router.push('/marketing/alert/rules')
  } finally {
    loading.value = false
  }
}

// 步骤处理
const handleNext = async () => {
  // 验证当前步骤
  const isValid = await validateCurrentStep()
  if (!isValid) return
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const validateCurrentStep = async () => {
  let isValid = true
  
  switch (currentStep.value) {
    case 0:
      isValid = await basicInfoRef.value?.validate()
      break
    case 1:
      isValid = await conditionsRef.value?.validate()
      break
    case 2:
      isValid = await notificationsRef.value?.validate()
      break
    case 3:
      isValid = await contentTemplateRef.value?.validate()
      break
  }
  
  if (!isValid) {
    Message.warning('请完善必填信息')
  }
  
  return isValid
}

// 保存处理
const handleSave = async () => {
  try {
    saving.value = true
    
    // 最终验证
    const isValid = await validateCurrentStep()
    if (!isValid) return
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success('规则修改成功')
    router.push('/marketing/alert/rules')
  } catch (error) {
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleSaveDraft = async () => {
  try {
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 500))
    Message.success('草稿已保存')
  } catch (error) {
    Message.error('保存草稿失败')
  }
}

const handleBack = () => {
  router.push('/marketing/alert/rules')
}

// 初始化
onMounted(() => {
  loadRuleData()
})
</script>

<style scoped lang="less">
.alert-rule-edit {
  padding: 24px;
  background: #fff;
  min-height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.step-container {
  margin-bottom: 32px;
  padding: 0 100px;
}

.form-container {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  min-height: 500px;
}

.form-content {
  flex: 1;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 24px;
}

.step-form {
  max-width: 800px;
}

.preview-panel {
  width: 400px;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 24px;
  
  .preview-header {
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }
  }
  
  .preview-content {
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    min-height: 300px;
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}
</style>