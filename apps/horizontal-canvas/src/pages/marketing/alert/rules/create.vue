<template>
  <div class="alert-rule-create">
    <div class="header">
      <h1>新建预警规则</h1>
      <a-button @click="handleBack">返回列表</a-button>
    </div>

    <!-- 单页模式：移除步骤条 -->

    <div class="form-container">
      <div class="form-content">
        <!-- 步骤1: 基本信息 -->
        <div class="step-form">
          <RuleBasicInfo
            ref="basicInfoRef"
            v-model="ruleForm.basicInfo"
            :rules="validationRules.basicInfo"
          />
        </div>

        <!-- 步骤2: 条件配置 -->
        <div class="step-form">
          <RuleConditions
            ref="conditionsRef"
            v-model="ruleForm.conditions"
            :rule-type="ruleForm.basicInfo.type"
            :rules="validationRules.conditions"
          />
        </div>

        

        <!-- 步骤5: 预览确认 -->
        <div class="step-form">
          <RulePreview
            :rule-form="ruleForm"
            :preview-data="previewData"
          />
        </div>
      </div>

      <div class="preview-panel">
        <div class="step-form">
          <RuleNotifications
            ref="notificationsRef"
            v-model="ruleForm.notifications"
            :rules="validationRules.notifications"
          />
        </div>
        <div class="step-form">
          <RuleContentTemplate
            ref="contentTemplateRef"
            v-model="ruleForm.contentTemplate"
            :rule-type="ruleForm.basicInfo.type"
            :rules="validationRules.contentTemplate"
          />
        </div>
        <div class="preview-header">
          <h3>实时预览</h3>
        </div>
        <div class="preview-content">
          <ContentPreview
            :rule-form="ruleForm"
            :current-step="0"
            :preview-data="previewData"
          />
        </div>
      </div>
    </div>

    <div class="step-actions">
      <a-space>
        <a-button type="primary" :loading="saving" @click="handleSave">保存规则</a-button>
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

// 单页模式：移除步骤状态
const saving = ref(false)

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

// 处理复制功能
onMounted(() => {
  if (route.query.copyFrom) {
    // 模拟加载被复制的规则数据
    loadRuleForCopy(route.query.copyFrom)
  }
})

const loadRuleForCopy = async (ruleId) => {
  try {
    // 模拟API调用获取规则数据
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 这里模拟复制的数据，实际应该从API获取
    const mockRule = {
      basicInfo: {
        name: '库存预警规则-优惠券A（副本）',
        type: 'inventory',
        description: '监控优惠券库存情况',
        tags: ['库存', '预警']
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
          { type: 'wechat', enabled: true, config: {} }
        ],
        recipients: {
          users: ['user1', 'user2'],
          departments: ['dept1'],
          roles: ['admin']
        }
      },
      contentTemplate: {
        wechat: {
          template: '【库存预警】{{inventoryName}}库存告急！\n当前库存：{{currentValue}}{{unit}}\n预警阈值：{{threshold}}{{unit}}\n请及时补充库存。',
          variables: ['inventoryName', 'currentValue', 'unit', 'threshold']
        }
      }
    }
    
    Object.assign(ruleForm, mockRule)
    Message.success('已加载规则数据，请修改后保存')
  } catch (error) {
    Message.error('加载规则数据失败')
  }
}

// 统一校验：保存时依次校验各区块
const validateAll = async () => {
  const ok1 = await basicInfoRef.value?.validate()
  const ok2 = await conditionsRef.value?.validate()
  const ok3 = await notificationsRef.value?.validate()
  const ok4 = await contentTemplateRef.value?.validate()
  const allOk = [ok1, ok2, ok3, ok4].every(v => v !== false)
  if (!allOk) Message.warning('请完善必填信息')
  return allOk
}

// 保存处理
const handleSave = async () => {
  try {
    saving.value = true
    
    // 最终验证：校验所有区块
    const isValid = await validateAll()
    if (!isValid) return
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success('规则创建成功')
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
</script>

<style scoped lang="less">
.alert-rule-create {
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
  width: 720px;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 24px;
}

.step-form {
  max-width: 720px;
}

.preview-panel {
  width: 480px;
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
