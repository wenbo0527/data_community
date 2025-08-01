/**
 * 重构后的短信节点配置抽屉
 * 使用 useBaseDrawer 和 BaseDrawer 组件的示例
 */
<template>
  <BaseDrawer
    :visible="visible"
    title="短信节点配置"
    width="560px"
    :form-data="formData"
    :form-rules="formRules"
    :form-ref="formRef"
    :is-form-valid="isFormValid"
    :submitting="submitting"
    @update:visible="(val) => emit('update:visible', val)"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @debug-submit="handleDebugSubmit"
  >
    <!-- 表单内容 -->
    <template #form="{ formData }">
      <!-- 短信模板ID -->
      <a-form-item label="短信模板ID" field="templateId">
        <a-input
          v-model="formData.templateId"
          placeholder="请输入短信模板ID"
          allow-clear
        />
        <div class="form-item-tip">
          配置短信发送使用的模板标识
        </div>
      </a-form-item>

      <!-- 短信内容 -->
      <a-form-item label="短信内容" field="content">
        <a-textarea
          v-model="formData.content"
          placeholder="请输入短信内容"
          :rows="4"
          :max-length="500"
          show-word-limit
          allow-clear
        />
        <div class="form-item-tip">
          支持变量替换，如 {name}、{phone} 等
        </div>
      </a-form-item>

      <!-- 结果判断开关 -->
      <a-form-item label="启用结果判断" field="enableResultJudgment">
        <a-switch
          v-model="formData.enableResultJudgment"
          checked-text="开启"
          unchecked-text="关闭"
        />
        <div class="form-item-tip">
          开启后可根据短信发送结果进行分流
        </div>
      </a-form-item>

      <!-- 结果分支配置 -->
      <div v-if="formData.enableResultJudgment" class="result-branches-section">
        <a-form-item label="结果分支配置">
          <div class="branches-container">
            <div
              v-for="(branch, index) in formData.resultBranches"
              :key="index"
              class="branch-item"
            >
              <div class="branch-header">
                <span class="branch-label">
                  {{ branch.resultType === 'success' ? '成功分支' : '失败分支' }}
                </span>
              </div>
              
              <a-form-item
                :field="`resultBranches.${index}.name`"
                label="分支名称"
                :rules="[{ required: true, message: '请输入分支名称' }]"
              >
                <a-input
                  v-model="branch.name"
                  :placeholder="`请输入${branch.resultType === 'success' ? '成功' : '失败'}分支名称`"
                />
              </a-form-item>
            </div>
          </div>
        </a-form-item>

        <!-- 最大等待时间 -->
        <a-form-item label="最大等待时间" field="maxWaitTime">
          <div class="time-config">
            <a-input-number
              v-model="formData.maxWaitTime.value"
              :min="1"
              :max="1440"
              placeholder="时间值"
              style="width: 120px; margin-right: 8px;"
            />
            <a-select
              v-model="formData.maxWaitTime.unit"
              style="width: 80px;"
            >
              <a-option value="minutes">分钟</a-option>
              <a-option value="hours">小时</a-option>
              <a-option value="days">天</a-option>
            </a-select>
          </div>
          <div class="form-item-tip">
            等待短信发送结果的最长时间
          </div>
        </a-form-item>
      </div>
    </template>

    <!-- 调试信息 -->
    <template #debug="{ formData, isValid }">
      <div class="debug-info">
        <div>表单验证状态: {{ isValid ? '✓' : '✗' }}</div>
        <div>模板ID: {{ formData.templateId ? '✓' : '✗' }}</div>
        <div>短信内容: {{ formData.content ? '✓' : '✗' }}</div>
        <div>结果判断: {{ formData.enableResultJudgment ? '开启' : '关闭' }}</div>
        <div v-if="formData.enableResultJudgment">
          分支配置: {{ formData.resultBranches?.length || 0 }} 个
        </div>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { computed } from 'vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'
import BaseDrawer from '@/components/common/BaseDrawer.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  nodeData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 默认表单数据
const defaultFormData = {
  templateId: '',
  content: '',
  enableResultJudgment: false,
  resultBranches: [
    { id: 'success', name: '发送成功', resultType: 'success' },
    { id: 'failure', name: '发送失败', resultType: 'failure' }
  ],
  maxWaitTime: {
    value: 30,
    unit: 'minutes'
  }
}

// 表单验证规则
const formRules = {
  templateId: [
    { required: true, message: '请输入短信模板ID' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '模板ID只能包含字母、数字、下划线和横线' }
  ],
  content: [
    { required: true, message: '请输入短信内容' },
    { minLength: 1, maxLength: 500, message: '短信内容长度为1-500个字符' }
  ]
}

// 自定义验证函数
const customValidator = async (formData) => {
  // 如果启用结果判断，检查分支配置
  if (formData.enableResultJudgment) {
    const hasEmptyBranchName = formData.resultBranches.some(branch => !branch.name.trim())
    if (hasEmptyBranchName) {
      return {
        valid: false,
        message: '请填写所有分支名称'
      }
    }

    // 检查等待时间配置
    if (!formData.maxWaitTime.value || formData.maxWaitTime.value <= 0) {
      return {
        valid: false,
        message: '请设置有效的最大等待时间'
      }
    }
  }

  return { valid: true }
}

// 自定义数据初始化
const customInit = (formData, nodeData) => {
  if (nodeData?.config) {
    Object.assign(formData, {
      templateId: nodeData.config.templateId || '',
      content: nodeData.config.content || '',
      enableResultJudgment: nodeData.config.enableResultJudgment || false,
      resultBranches: nodeData.config.resultBranches || defaultFormData.resultBranches,
      maxWaitTime: nodeData.config.maxWaitTime || defaultFormData.maxWaitTime
    })
  }
}

// 使用基础抽屉功能
const {
  formRef,
  formData,
  submitting,
  handleCancel: baseHandleCancel,
  handleSubmit: baseHandleSubmit,
  setupWatchers
} = useBaseDrawer({
  defaultFormData,
  formRules,
  nodeType: 'sms',
  customValidator,
  customInit
})

// 表单验证状态
const isFormValid = computed(() => {
  // 如果是新节点且表单为空，允许保存空配置
  if (props.nodeData?.isNewNode && 
      formData.templateId.trim() === '' && 
      formData.content.trim() === '') {
    return true
  }
  
  // 基础验证
  const hasTemplateId = formData.templateId.trim() !== ''
  const hasContent = formData.content.trim() !== ''
  
  if (!hasTemplateId || !hasContent) {
    return false
  }
  
  // 如果启用结果判断，检查分支配置
  if (formData.enableResultJudgment) {
    const branchesValid = formData.resultBranches.every(branch => branch.name.trim() !== '')
    const timeValid = formData.maxWaitTime.value > 0
    return branchesValid && timeValid
  }
  
  return true
})

// 设置监听器
setupWatchers(props)

// 处理取消
const handleCancel = () => {
  baseHandleCancel(emit)
}

// 处理提交
const handleSubmit = () => {
  baseHandleSubmit(emit, props)
}

// 处理调试提交
const handleDebugSubmit = () => {
  console.log('[SMSNodeConfigDrawer] 调试提交，跳过验证')
  const config = {
    ...formData,
    nodeType: 'sms'
  }
  emit('confirm', config)
  emit('update:visible', false)
}
</script>

<style scoped>
.result-branches-section {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.branches-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.branch-item {
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.branch-label {
  font-weight: 500;
  color: #333;
}

.time-config {
  display: flex;
  align-items: center;
}
</style>