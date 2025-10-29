<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="AB实验分流节点配置"
    width="520px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 节点名称 -->
      <a-form-item label="节点名称" field="nodeName" required>
        <a-input
          v-model="formData.nodeName"
          placeholder="请输入节点名称"
          allow-clear
        />
      </a-form-item>

      <!-- 实验名称 -->
      <a-form-item label="实验名称" field="experimentName">
        <a-input
          v-model="formData.experimentName"
          placeholder="请输入AB实验名称"
          allow-clear
        />
      </a-form-item>

      <!-- 实验描述 -->
      <a-form-item label="实验描述" field="description">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入实验描述（可选）"
          :rows="3"
          allow-clear
        />
      </a-form-item>

      <!-- 分支配置 -->
      <a-form-item label="分支配置" field="branches">
        <div class="branches-container">
          <div
            v-for="(branch, index) in formData.branches"
            :key="index"
            class="branch-item"
          >
            <div class="branch-header">
              <span class="branch-label">分支 {{ index + 1 }}</span>
              <a-button
                v-if="formData.branches.length > 2"
                type="text"
                status="danger"
                size="small"
                @click="removeBranch(index)"
              >
                <template #icon>
                  <icon-delete />
                </template>
                删除
              </a-button>
            </div>
            
            <div class="branch-content">
              <a-form-item
                :field="`branches.${index}.name`"
                label="分支名称"
                :rules="[{ required: true, message: '请输入分支名称' }]"
              >
                <a-input
                  v-model="branch.name"
                  placeholder="请输入分支名称"
                  @input="updateBranchName(index, $event)"
                />
              </a-form-item>
              
              <a-form-item
                :field="`branches.${index}.percentage`"
                label="流量占比 (%)"
                :rules="[
                  { required: true, message: '请输入流量占比' },
                  { type: 'number', min: 0.1, max: 100, message: '占比必须在0.1-100之间' }
                ]"
              >
                <a-input-number
                  v-model="branch.percentage"
                  :min="0.1"
                  :max="100"
                  :precision="1"
                  placeholder="请输入占比"
                  style="width: 100%"
                  @change="updatePercentage"
                />
              </a-form-item>
            </div>
          </div>
          
          <!-- 总占比显示和自动调整 -->
          <div class="percentage-summary">
            <a-alert
              :type="totalPercentage === 100 ? 'success' : 'warning'"
              :message="`当前总占比: ${totalPercentage}% ${totalPercentage === 100 ? '✓' : ''}`"
              show-icon
            />
            <div v-if="totalPercentage !== 100" class="percentage-actions">
              <a-button
                type="text"
                size="small"
                @click="autoAdjustPercentages"
              >
                自动调整为100%
              </a-button>
              <a-button
                type="text"
                size="small"
                @click="averageDistribute"
              >
                平均分配
              </a-button>
            </div>
          </div>
          
          <!-- 添加分支按钮 -->
          <a-button
            v-if="formData.branches.length < 10"
            type="dashed"
            block
            @click="addBranch"
          >
            <template #icon>
              <icon-plus />
            </template>
            新增分支
          </a-button>
        </div>
      </a-form-item>
    </template>

    <template #debug>
      <div class="debug-info">
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '✓' : '✗' }}</div>
        <div><strong>总占比:</strong> {{ totalPercentage }}%</div>
        <div><strong>实验名称:</strong> {{ formData.experimentName ? '✓' : '✗' }}</div>
        <div><strong>分支数量:</strong> {{ formData.branches.length }}</div>
      </div>
    </template>

    <template #actions>
      <a-button
        type="outline"
        status="warning"
        @click="forceSubmit"
      >
        强制提交(调试)
      </a-button>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'

// Props 和 Emits
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

// 表单验证规则
const formRules = {
  experimentName: [
    { required: true, message: '请输入实验名称' },
    { minLength: 2, maxLength: 50, message: '实验名称长度为2-50个字符' }
  ],
  'branches.*.name': [
    { required: true, message: '请输入分支名称' },
    { minLength: 1, maxLength: 20, message: '分支名称长度为1-20个字符' }
  ],
  'branches.*.percentage': [
    { required: true, message: '请输入流量占比' },
    { type: 'number', min: 0.1, max: 100, message: '占比必须在0.1-100之间' }
  ]
}

// 初始表单数据
const getInitialFormData = () => ({
  nodeName: props.nodeData?.nodeName || 'AB实验分流',
  experimentName: '',
  description: '',
  branches: [
    { name: '对照组', percentage: 50 },
    { name: '实验组', percentage: 50 }
  ]
})

// 自定义验证函数
const customValidation = (formData) => {
  // 检查 formData 是否存在
  if (!formData) {
    return false
  }
  
  if (!formData.experimentName?.trim()) return false
  if (!formData.branches || formData.branches.length < 2) return false
  
  // 检查分支名称和占比
  for (const branch of formData.branches) {
    if (!branch.name?.trim() || !branch.percentage) return false
  }
  
  // 检查总占比是否为100%
  const total = formData.branches.reduce((sum, branch) => sum + (branch.percentage || 0), 0)
  return Math.abs(total - 100) < 0.1 // 允许0.1的误差
}

// 使用 BaseDrawer 组合式函数
const {
  visible,
  formData,
  isSubmitting,
  isFormValid,
  handleCancel,
  handleSubmit: baseHandleSubmit
} = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'ab-test'
})

// AB测试特有的计算属性和方法
const totalPercentage = computed(() => {
  if (!formData.branches || !Array.isArray(formData.branches)) {
    return 0
  }
  return formData.branches.reduce((sum, branch) => {
    return sum + (branch.percentage || 0)
  }, 0)
})

// 分支管理方法
const addBranch = () => {
  if (formData.branches.length >= 10) return
  
  const remainingPercentage = Math.max(0, 100 - totalPercentage.value)
  const newPercentage = remainingPercentage > 0 ? remainingPercentage : 10
  
  formData.branches.push({
    name: `分支${formData.branches.length + 1}`,
    percentage: newPercentage
  })
  
  // 如果添加后超过100%，自动调整
  if (totalPercentage.value > 100) {
    autoAdjustPercentages()
  }
}

const removeBranch = (index) => {
  if (formData.branches.length <= 2) return
  formData.branches.splice(index, 1)
  autoAdjustPercentages()
}

const updateBranchName = (index, value) => {
  formData.branches[index].name = value
}

const updatePercentage = () => {
  nextTick(() => {
    // 如果总占比超过100%，自动调整最后一个分支
    if (totalPercentage.value > 100) {
      autoAdjustPercentages()
    }
  })
}

const autoAdjustPercentages = () => {
  const total = totalPercentage.value
  if (total === 100) return
  
  if (total === 0) {
    // 如果总占比为0，平均分配
    averageDistribute()
    return
  }
  
  // 按比例调整到100%
  const factor = 100 / total
  formData.branches.forEach(branch => {
    branch.percentage = Math.round(branch.percentage * factor * 10) / 10
  })
  
  // 处理舍入误差
  const newTotal = totalPercentage.value
  if (newTotal !== 100) {
    const diff = 100 - newTotal
    formData.branches[0].percentage = Math.round((formData.branches[0].percentage + diff) * 10) / 10
  }
}

const averageDistribute = () => {
  const branchCount = formData.branches.length
  const averagePercentage = Math.floor(100 / branchCount * 10) / 10
  const remainder = Math.round((100 - averagePercentage * branchCount) * 10) / 10
  
  formData.branches.forEach((branch, index) => {
    if (index === 0) {
      branch.percentage = averagePercentage + remainder
    } else {
      branch.percentage = averagePercentage
    }
  })
}

// 自定义提交处理
const handleSubmit = async () => {
  const config = {
    experimentName: formData.experimentName.trim(),
    description: formData.description.trim(),
    branches: formData.branches.map((branch, index) => ({
      id: `branch_${index + 1}`,
      name: branch.name.trim(),
      percentage: Number(branch.percentage),
      label: branch.name.trim()
    })),
    nodeType: 'ab-test'
  }
  
  await baseHandleSubmit(config)
}

// 强制提交（调试用）
const forceSubmit = () => {
  console.log('强制提交AB测试节点配置:', formData)
  
  const config = {
    experimentName: formData.experimentName.trim() || '默认实验',
    description: formData.description.trim(),
    branches: formData.branches.map((branch, index) => ({
      id: `branch_${index + 1}`,
      name: branch.name.trim() || `分支${index + 1}`,
      percentage: Number(branch.percentage) || 50,
      label: branch.name.trim() || `分支${index + 1}`
    })),
    nodeType: 'ab-test'
  }
  
  emit('confirm', config)
  emit('update:visible', false)
}
</script>

<style scoped>
.branches-container {
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  padding: 16px;
  background-color: var(--color-bg-1);
}

.branch-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--color-border-3);
  border-radius: 4px;
  background-color: var(--color-bg-2);
}

.branch-item:last-child {
  margin-bottom: 0;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.branch-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.branch-content {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: start;
}

.percentage-summary {
  margin: 16px 0;
}

.percentage-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.debug-info {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.debug-info div {
  margin-bottom: 4px;
}

.debug-info div:last-child {
  margin-bottom: 0;
}
</style>