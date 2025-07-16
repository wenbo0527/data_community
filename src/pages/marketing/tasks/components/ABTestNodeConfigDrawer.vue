<template>
  <a-drawer
    v-model:visible="drawerVisible"
    title="AB实验分流节点配置"
    width="520px"
    placement="right"
    @cancel="handleCancel"
  >
    <div class="config-form">
      <a-form
        ref="formRef"
        :model="formData"
        layout="vertical"
        :rules="formRules"
      >
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
                    { type: 'number', min: 1, max: 100, message: '占比必须在1-100之间' }
                  ]"
                >
                  <a-input-number
                    v-model="branch.percentage"
                    :min="1"
                    :max="100"
                    :precision="1"
                    placeholder="请输入占比"
                    style="width: 100%"
                    @change="updatePercentage"
                  />
                </a-form-item>
              </div>
            </div>
            
            <!-- 总占比显示 -->
            <div class="percentage-summary">
              <a-alert
                :type="totalPercentage === 100 ? 'success' : 'warning'"
                :message="`当前总占比: ${totalPercentage}% ${totalPercentage === 100 ? '✓' : '(需要等于100%)'}`"
                show-icon
              />
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
              添加分支
            </a-button>
          </div>
        </a-form-item>

        <!-- 实验设置 -->
        <a-form-item label="实验设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model="formData.enableRandomSeed">
              启用随机种子（确保用户分流的一致性）
            </a-checkbox>
            <a-checkbox v-model="formData.enableMetrics">
              启用实验指标追踪
            </a-checkbox>
          </a-space>
        </a-form-item>

        <!-- 随机种子配置 -->
        <a-form-item
          v-if="formData.enableRandomSeed"
          label="随机种子"
          field="randomSeed"
        >
          <a-input-number
            v-model="formData.randomSeed"
            :min="1"
            :max="999999"
            placeholder="请输入随机种子"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          确定
        </a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'

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

const formRef = ref()
const drawerVisible = ref(false)

// 表单数据
const formData = reactive({
  experimentName: '',
  description: '',
  branches: [
    { name: '对照组', percentage: 50 },
    { name: '实验组', percentage: 50 }
  ],
  enableRandomSeed: true,
  enableMetrics: true,
  randomSeed: Math.floor(Math.random() * 999999) + 1
})

// 表单验证规则
const formRules = {
  experimentName: [
    { required: true, message: '请输入实验名称' },
    { minLength: 2, maxLength: 50, message: '实验名称长度为2-50个字符' }
  ]
}

// 计算总占比
const totalPercentage = computed(() => {
  return formData.branches.reduce((sum, branch) => sum + (branch.percentage || 0), 0)
})

// 表单验证状态
const isFormValid = computed(() => {
  return formData.experimentName.trim() !== '' &&
         formData.branches.length >= 2 &&
         totalPercentage.value === 100 &&
         formData.branches.every(branch => branch.name.trim() !== '' && branch.percentage > 0)
})

// 监听visible变化
watch(() => props.visible, (newVal) => {
  drawerVisible.value = newVal
  if (newVal) {
    initFormData()
  }
})

watch(drawerVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.nodeData?.config) {
    Object.assign(formData, {
      experimentName: props.nodeData.config.experimentName || '',
      description: props.nodeData.config.description || '',
      branches: props.nodeData.config.branches || [
        { name: '对照组', percentage: 50 },
        { name: '实验组', percentage: 50 }
      ],
      enableRandomSeed: props.nodeData.config.enableRandomSeed ?? true,
      enableMetrics: props.nodeData.config.enableMetrics ?? true,
      randomSeed: props.nodeData.config.randomSeed || Math.floor(Math.random() * 999999) + 1
    })
  }
}

// 添加分支
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

// 删除分支
const removeBranch = (index) => {
  if (formData.branches.length <= 2) return
  formData.branches.splice(index, 1)
  autoAdjustPercentages()
}

// 更新分支名称
const updateBranchName = (index, value) => {
  formData.branches[index].name = value
}

// 更新占比
const updatePercentage = () => {
  nextTick(() => {
    // 如果总占比超过100%，自动调整最后一个分支
    if (totalPercentage.value > 100) {
      autoAdjustPercentages()
    }
  })
}

// 自动调整占比
const autoAdjustPercentages = () => {
  const total = totalPercentage.value
  if (total === 100) return
  
  const branchCount = formData.branches.length
  const averagePercentage = Math.floor(100 / branchCount)
  const remainder = 100 - (averagePercentage * branchCount)
  
  formData.branches.forEach((branch, index) => {
    branch.percentage = averagePercentage + (index < remainder ? 1 : 0)
  })
}

// 处理取消
const handleCancel = () => {
  drawerVisible.value = false
  emit('cancel')
}

// 处理提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    
    if (totalPercentage.value !== 100) {
      return
    }
    
    const config = {
      experimentName: formData.experimentName,
      description: formData.description,
      branches: formData.branches.map((branch, index) => ({
        id: `branch_${index + 1}`,
        name: branch.name,
        percentage: branch.percentage,
        label: branch.name
      })),
      enableRandomSeed: formData.enableRandomSeed,
      enableMetrics: formData.enableMetrics,
      randomSeed: formData.randomSeed,
      nodeType: 'ab-test'
    }
    
    emit('confirm', config)
    drawerVisible.value = false
  } catch (error) {
    console.error('AB测试配置验证失败:', error)
  }
}
</script>

<style scoped>
.config-form {
  padding: 0 4px;
}

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

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>