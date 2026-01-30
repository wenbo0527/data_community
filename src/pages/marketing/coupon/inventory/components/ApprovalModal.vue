<template>
  <a-modal
    :visible="visible"
    title="优惠券审批申请"
    width="1200px"
    :mask-closable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
    @update:visible="$emit('update:visible', $event)"
    class="approval-modal"
  >
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <a-steps :current="currentStep" size="small" class="approval-steps">
        <a-step title="基本信息" description="填写券模板和发放信息" />
        <a-step title="审批配置" description="设置审批人和申请理由" />
        <a-step title="发放规则" description="配置发放方式和目标用户" />
        <a-step title="通知设置" description="选择通知方式" />
      </a-steps>
    </div>

    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      class="approval-form"
    >
      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <a-card title="基本信息" class="form-card" :bordered="false">
          <template #extra>
            <a-tag color="blue">
              <template #icon>
                <IconInfoCircle />
              </template>
              步骤 1/4
            </a-tag>
          </template>
          
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item field="templateName" label="券模板名称">
                <a-input 
                  v-model="formData.templateName" 
                  readonly 
                  class="readonly-input"
                >
                  <template #prefix>
                    <IconGift />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="couponCount" label="发券数量" required>
                <a-input-number
                  v-model="formData.couponCount"
                  :min="1"
                  :max="10000"
                  placeholder="请输入发券数量"
                  style="width: 100%"
                >
                  <template #prefix>
                     <IconUser />
                   </template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <div class="info-card">
                <div class="info-title">预计成本</div>
                <div class="info-value">{{ estimatedCost }}</div>
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item field="effectiveDate" label="生效日期" required>
                <a-date-picker
                  v-model="formData.effectiveDate"
                  :disabled-date="(date: any) => date && date < new Date()"
                  placeholder="请选择生效日期"
                  style="width: 100%"
                >
                  <template #prefix>
                    <IconCalendar />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="expiryDate" label="失效日期" required>
                <a-date-picker
                  v-model="formData.expiryDate"
                  style="width: 100%"
                  placeholder="请选择失效日期"
                  :disabled-date="(date: any) => date <= formData.effectiveDate"
                >
                  <template #prefix>
                    <IconCalendar />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </div>

      <!-- 步骤2: 审批配置 -->
      <div v-show="currentStep === 1" class="step-content">
        <a-card title="审批配置" class="form-card" :bordered="false">
          <template #extra>
            <a-tag color="orange">
              <template #icon>
                <IconUser />
              </template>
              步骤 2/4
            </a-tag>
          </template>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item field="approver" label="审批人" required>
                <a-select
                  v-model="formData.approver"
                  placeholder="请选择审批人"
                  allow-search
                >
                  <template #prefix>
                    <IconUser />
                  </template>
                  <a-option
                    v-for="user in approverList"
                    :key="user.id"
                    :value="user.id"
                    :label="user.name"
                  >
                    <div class="approver-option">
                      <div class="approver-name">{{ user.name }}</div>
                      <div class="approver-dept">{{ user.department }}</div>
                    </div>
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="priority" label="审批优先级" required>
                <a-select v-model="formData.priority" placeholder="请选择优先级">
                  <template #prefix>
                    <IconExclamationCircle />
                  </template>
                  <a-option value="high">
                    <a-tag color="red">高优先级</a-tag>
                  </a-option>
                  <a-option value="medium">
                    <a-tag color="orange">中优先级</a-tag>
                  </a-option>
                  <a-option value="low">
                    <a-tag color="green">低优先级</a-tag>
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item field="approvalReason" label="申请理由" required>
                <a-textarea
                  v-model="formData.approvalReason"
                  placeholder="请详细说明申请理由，包括业务背景、预期效果等..."
                  :max-length="500"
                  show-word-limit
                  :auto-size="{ minRows: 4, maxRows: 8 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </div>

      <!-- 步骤3: 发放规则 -->
      <div v-show="currentStep === 2" class="step-content">
        <a-card title="发放规则" class="form-card" :bordered="false">
          <template #extra>
            <a-tag color="purple">
              <template #icon>
                <IconSettings />
              </template>
              步骤 3/4
            </a-tag>
          </template>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item field="distributionType" label="发放方式" required>
                <a-radio-group v-model="formData.distributionType" class="distribution-radio">
                   <a-radio value="manual">
                     <div class="radio-option">
                       <IconUser />
                       <span>手动发放</span>
                       <div class="radio-desc">审批通过后手动触发发放</div>
                     </div>
                   </a-radio>
                  <a-radio value="auto">
                    <div class="radio-option">
                      <IconRobot />
                      <span>自动发放</span>
                      <div class="radio-desc">按设定时间自动发放</div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formData.distributionType === 'auto'">
              <a-form-item field="autoDistributionTime" label="自动发放时间">
                <a-date-picker
                  v-model="formData.autoDistributionTime"
                  show-time
                  style="width: 100%"
                  placeholder="请选择自动发放时间"
                >
                  <template #prefix>
                    <IconClockCircle />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item field="targetUsers" label="目标用户群体" required>
                <a-select
                  v-model="formData.targetUsers"
                  placeholder="请选择目标用户群体"
                  multiple
                >
                  <template #prefix>
                    <IconUserGroup />
                  </template>
                  <a-option value="new_users">
                    <div class="user-option">
                      <IconUserAdd />
                      <span>新用户</span>
                    </div>
                  </a-option>
                  <a-option value="active_users">
                    <div class="user-option">
                      <IconFire />
                      <span>活跃用户</span>
                    </div>
                  </a-option>
                  <a-option value="vip_users">
                    <div class="user-option">
                      <IconFire />
                      <span>VIP用户</span>
                    </div>
                  </a-option>
                  <a-option value="custom">
                    <div class="user-option">
                      <IconSettings />
                      <span>自定义用户群</span>
                    </div>
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="maxPerUser" label="每人限领数量">
                <a-input-number
                  v-model="formData.maxPerUser"
                  :min="1"
                  :max="10"
                  placeholder="不限制请留空"
                  style="width: 100%"
                >
                  <template #prefix>
                    <icon-number />
                  </template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </div>

      <!-- 步骤4: 通知设置 -->
      <div v-show="currentStep === 3" class="step-content">
        <a-card title="通知设置" class="form-card" :bordered="false">
          <template #extra>
            <a-tag color="green">
              <template #icon>
                <IconNotification />
              </template>
              步骤 4/4
            </a-tag>
          </template>
          
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item field="notificationSettings" label="通知方式">
                <a-checkbox-group v-model="formData.notificationSettings" class="notification-group">
                  <a-checkbox value="email">
                    <div class="notification-option">
                      <IconEmail />
                      <div class="notification-content">
                        <div class="notification-title">邮件通知</div>
                        <div class="notification-desc">发送邮件到审批人邮箱</div>
                      </div>
                    </div>
                  </a-checkbox>
                  <a-checkbox value="sms">
                    <div class="notification-option">
                      <IconPhone />
                      <div class="notification-content">
                        <div class="notification-title">短信通知</div>
                        <div class="notification-desc">发送短信到审批人手机</div>
                      </div>
                    </div>
                  </a-checkbox>
                  <a-checkbox value="app_push">
                    <div class="notification-option">
                      <IconMobile />
                      <div class="notification-content">
                        <div class="notification-title">APP推送</div>
                        <div class="notification-desc">推送消息到移动端APP</div>
                      </div>
                    </div>
                  </a-checkbox>
                  <a-checkbox value="wechat">
                    <div class="notification-option">
                      <IconNotification />
                      <div class="notification-content">
                        <div class="notification-title">微信通知</div>
                        <div class="notification-desc">发送消息到企业微信</div>
                      </div>
                    </div>
                  </a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 申请摘要 -->
          <a-divider>申请摘要</a-divider>
          <div class="summary-card">
            <a-row :gutter="16">
              <a-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">券模板</div>
                  <div class="summary-value">{{ formData.templateName }}</div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">发券数量</div>
                  <div class="summary-value">{{ formData.couponCount }}张</div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">审批人</div>
                  <div class="summary-value">{{ getApproverName(formData.approver) }}</div>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="summary-item">
                  <div class="summary-label">优先级</div>
                  <div class="summary-value">
                    <a-tag :color="getPriorityColor(formData.priority)">
                      {{ getPriorityText(formData.priority) }}
                    </a-tag>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </div>
    </a-form>

    <template #footer>
      <div class="modal-footer">
        <div class="footer-left">
          <a-progress 
            :percent="stepProgress" 
            size="small" 
            :show-text="false"
            class="progress-bar"
          />
          <span class="progress-text">完成进度: {{ stepProgress }}%</span>
        </div>
        <div class="footer-right">
          <a-space>
            <a-button @click="handleCancel">取消</a-button>
            <a-button 
              v-if="currentStep > 0" 
              @click="prevStep"
              :disabled="submitLoading"
            >
              上一步
            </a-button>
            <a-button 
              v-if="currentStep < 3" 
              type="primary" 
              @click="nextStep"
              :disabled="!canProceedToNext"
            >
              下一步
            </a-button>
            <a-button 
              v-if="currentStep === 3" 
              type="primary" 
              @click="handleSubmit" 
              :loading="submitLoading"
            >
              <template #icon>
                <IconCheck />
              </template>
              提交审批
            </a-button>
          </a-space>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconInfoCircle,
  IconGift,
  IconCalendar,
  IconUser,
  IconExclamationCircle,
  IconSettings,
  IconRobot,
  IconClockCircle,
  IconUserGroup,
  IconUserAdd,
  IconFire,
  IconNotification,
  IconEmail,
  IconPhone,
  IconMobile,
  IconCheck
} from '@arco-design/web-vue/es/icon'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  templateData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const submitLoading = ref(false)
const currentStep = ref(0)

// 步骤进度计算
const stepProgress = computed(() => {
  return Math.round(((currentStep.value + 1) / 4) * 100)
})

// 预计成本计算
const estimatedCost = computed(() => {
  const count = formData.couponCount || 0
  const unitCost = 5 // 假设每张券成本5元
  return `¥${(count * unitCost).toLocaleString()}`
})

// 步骤导航
const nextStep = async () => {
  const isValid = await validateCurrentStep()
  if (isValid && currentStep.value < 3) {
    currentStep.value++
    // 显示成功提示
    Message.success(`第${currentStep.value}步验证通过`)
  } else if (!isValid) {
    Message.warning('请完善当前步骤的必填信息')
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 检查是否可以进入下一步
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 0: // 基本信息
      return formData.templateName && formData.couponCount && formData.effectiveDate && formData.expiryDate
    case 1: // 审批配置
      return formData.approver && formData.priority && formData.approvalReason.length >= 10
    case 2: // 发放规则
      return formData.distributionType && formData.targetUsers.length > 0
    case 3: // 通知设置
      return true
    default:
      return false
  }
})

// 获取审批人姓名
const getApproverName = (approverId: string) => {
  const approver = approverList.value.find((user: any) => user.id === approverId)
  return approver ? approver.name : ''
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colors[priority as keyof typeof colors] || 'blue'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const texts = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority as keyof typeof texts] || ''
}

// 表单数据
const formData = reactive({
  templateId: '',
  templateName: '',
  couponCount: 100,
  effectiveDate: null,
  expiryDate: null,
  approver: '',
  priority: 'medium',
  approvalReason: '',
  distributionType: 'manual',
  autoDistributionTime: null,
  targetUsers: [],
  maxPerUser: null,
  notificationSettings: ['email']
})

// 审批人列表
const approverList = ref([
  { id: 'user001', name: '张三', department: '营销部' },
  { id: 'user002', name: '李四', department: '风控部' },
  { id: 'user003', name: '王五', department: '产品部' },
  { id: 'user004', name: '赵六', department: '运营部' }
])

// 表单验证规则
const rules = {
  templateName: [
    { required: true, message: '请输入券模板名称' },
    { minLength: 2, message: '券模板名称至少需要2个字符' },
    { maxLength: 50, message: '券模板名称不能超过50个字符' }
  ],
  couponCount: [
    { required: true, message: '请输入发券数量' },
    { type: 'number', min: 1, max: 100000, message: '发券数量必须在1-100000之间' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期' }
  ],
  expiryDate: [
    { required: true, message: '请选择失效日期' }
  ],
  approver: [
    { required: true, message: '请选择审批人' }
  ],
  priority: [
    { required: true, message: '请选择审批优先级' }
  ],
  approvalReason: [
    { required: true, message: '请输入申请理由' },
    { minLength: 10, message: '申请理由至少10个字符' },
    { maxLength: 500, message: '申请理由不能超过500个字符' }
  ],
  distributionType: [
    { required: true, message: '请选择发放方式' }
  ],
  targetUsers: [
    { required: true, message: '请选择目标用户群体' }
  ],
  maxPerUser: [
    { type: 'number', min: 1, message: '每人限领数量必须大于0' },
    { type: 'number', max: 100, message: '每人限领数量不能超过100张' }
  ]
}

// 监听模板数据变化
watch(() => props.templateData, (newData: any) => {
  if (newData) {
    formData.templateId = newData.id
    formData.templateName = newData.name
  }
}, { immediate: true })

// 提交审批
const handleSubmit = async () => {
  if (submitLoading.value) return
  
  try {
    submitLoading.value = true
    
    // 表单验证
    await formRef.value.validate()
    
    // 数据完整性检查
    if (!validateFormData()) {
      return
    }
    
    // 调用API提交审批申请
    const { approvalAPI } = await import('@/api/coupon.js')
    const response = await approvalAPI.submitApproval(formData)
    
    if (response.code === 200) {
      Message.success('审批申请提交成功')
      emit('success')
      handleCancel()
    } else {
      Message.error(response.message || '提交失败')
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    if (error.message) {
      Message.error(error.message)
    } else {
      Message.error('提交失败，请检查表单数据后重试')
    }
  } finally {
    submitLoading.value = false
  }
}

// 数据完整性验证
const validateFormData = () => {
  // 检查基本信息
  if (!formData.templateName.trim()) {
    Message.error('请填写券模板名称')
    return false
  }
  
  if (!formData.couponCount || formData.couponCount <= 0) {
    Message.error('发券数量必须大于0')
    return false
  }
  
  if (!formData.effectiveDate) {
    Message.error('请选择生效日期')
    return false
  }
  
  if (!formData.expiryDate) {
    Message.error('请选择失效日期')
    return false
  }
  
  // 检查日期逻辑
  const effectiveTime = new Date(formData.effectiveDate).getTime()
  const expiryTime = new Date(formData.expiryDate).getTime()
  const currentTime = Date.now()
  
  if (effectiveTime >= expiryTime) {
    Message.error('生效日期必须早于失效日期')
    return false
  }
  
  if (expiryTime <= currentTime) {
    Message.error('失效日期不能早于当前时间')
    return false
  }
  
  // 检查审批配置
  if (!formData.approver) {
    Message.error('请选择审批人')
    return false
  }
  
  if (!formData.approvalReason.trim()) {
    Message.error('请填写申请理由')
    return false
  }
  
  // 检查发放规则
  if (!formData.distributionType) {
    Message.error('请选择发放方式')
    return false
  }
  
  if (formData.targetUsers.length === 0) {
    Message.error('请选择目标用户群体')
    return false
  }
  
  return true
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  // 重置表单
  formRef.value?.resetFields()
}

// 验证当前步骤
const validateCurrentStep = async () => {
  try {
    await formRef.value?.validateField(getFieldsForStep(currentStep.value))
    return true
  } catch (error) {
    return false
  }
}

// 获取当前步骤需要验证的字段
const getFieldsForStep = (step: number) => {
  switch (step) {
    case 0:
      return ['templateName', 'couponCount', 'effectiveDate', 'expiryDate']
    case 1:
      return ['approver', 'priority', 'approvalReason']
    case 2:
      return ['distributionType', 'targetUsers']
    case 3:
      return []
    default:
      return []
  }
}
</script>

<style scoped>
.approval-modal :deep(.arco-modal-body) {
  padding: 24px;
}

/* 步骤指示器样式 */
.approval-modal :deep(.arco-steps) {
  margin-bottom: 32px;
}

.approval-modal :deep(.arco-steps-item-title) {
  font-weight: 600;
  font-size: 16px;
}

.approval-modal :deep(.arco-steps-item-description) {
  color: #86909c;
  font-size: 14px;
}

/* 卡片样式 */
.approval-modal :deep(.arco-card) {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.approval-modal :deep(.arco-card:hover) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.approval-modal :deep(.arco-card-header) {
  border-bottom: 1px solid #f2f3f5;
  padding: 20px 24px 16px;
}

.approval-modal :deep(.arco-card-body) {
  padding: 24px;
}

/* 表单项样式 */
.approval-modal :deep(.arco-form-item) {
  margin-bottom: 24px;
}

.approval-modal :deep(.arco-form-item-label) {
  font-weight: 600;
  color: #1d2129;
  font-size: 14px;
}

/* 单选框和复选框样式 */
.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.radio-option:hover, .checkbox-option:hover {
  border-color: #165dff;
  background-color: #f2f7ff;
}

.radio-option svg, .checkbox-option svg {
  margin-right: 8px;
  color: #165dff;
  font-size: 16px;
}

.radio-option span, .checkbox-option span {
  font-weight: 500;
  color: #1d2129;
}

.radio-desc {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  margin-left: 24px;
}

/* 选择器选项样式 */
.user-option, .notification-option {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.user-option svg, .notification-option svg {
  margin-right: 8px;
  color: #165dff;
  font-size: 14px;
}

.notification-content {
  margin-left: 8px;
}

.notification-title {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.notification-desc {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

/* 摘要卡片样式 */
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 500;
  color: #4e5969;
}

.summary-value {
  font-weight: 600;
  color: #1d2129;
}

.cost-highlight {
  color: #f53f3f;
  font-size: 16px;
}

/* 底部操作区样式 */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #f2f3f5;
  background-color: #fafbfc;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4e5969;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* 进度条样式 */
.approval-modal :deep(.arco-progress-line-text) {
  font-weight: 600;
  color: #165dff;
}

/* 按钮样式优化 */
.approval-modal :deep(.arco-btn-primary) {
  background: linear-gradient(135deg, #165dff 0%, #246fff 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
  transition: all 0.3s ease;
}

.approval-modal :deep(.arco-btn-primary:hover) {
  background: linear-gradient(135deg, #0e4fd1 0%, #1c5aff 100%);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.4);
  transform: translateY(-1px);
}

.approval-modal :deep(.arco-btn-outline) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.approval-modal :deep(.arco-btn-outline:hover) {
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .approval-modal :deep(.arco-modal) {
    width: 95vw !important;
    margin: 20px auto;
  }
  
  .approval-modal :deep(.arco-card-body) {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: center;
  }
}

/* 动画效果 */
.approval-modal :deep(.arco-card) {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.arco-form-item-label) {
  font-weight: 600;
}

:deep(.arco-divider-text) {
  font-weight: 600;
  color: var(--color-text-1);
}
</style>