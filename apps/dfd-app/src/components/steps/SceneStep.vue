<template>
  <div class="scene-step">
    <div class="scene-selection">
      <h3 class="section-title">场景选择</h3>
      <a-select
        v-model="selectedScenes"
        multiple
        placeholder="请选择场景"
        class="scene-select"
      >
        <a-option v-for="scene in sceneOptions" :key="scene.value" :value="scene.value">
          {{ scene.label }}
        </a-option>
      </a-select>
    </div>

    <div v-for="(product, productIndex) in formData.dataProducts" :key="productIndex" class="product-section">
      <h3 class="product-title">{{ product.name }}</h3>
      <div class="product-info">
        <span class="info-label">总条数：</span>
        <span class="info-value">{{ product.totalAmount }}</span>
      </div>
      <a-table :data="getProductSceneData(product)" :columns="columns" :pagination="false" class="scene-table">
        <template #scene="{ record }">
          {{ record.sceneName }}
        </template>
        <template #amount="{ record }">
          <a-input-number
            v-model="record.amount"
            :min="0"
            :max="product.totalAmount"
            :precision="0"
            placeholder="请输入分配条数"
            class="amount-input"
            @change="updateAmount(record, product)"
          />
        </template>
        <template #ratio="{ record }">
          {{ calculateRatio(record.amount, product.totalAmount) }}%
        </template>
        <template #amountCondition="{ record }">
          <div class="condition-selects">
            <a-select
              v-model="record.selectedCondition"
              placeholder="选择条件"
              class="condition-type-select"
              style="width: 100px"
            >
              <a-option value="amount">额度</a-option>
              <a-option value="period">期数</a-option>
              <a-option value="riskLevel">风险等级</a-option>
            </a-select>
            <a-select
              v-model="record.amountCondition"
              placeholder="选择关系"
              class="condition-select"
              @change="(value: string) => updateAmountCondition(value, record, product)"
            >
              <a-option v-for="option in amountConditionOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-option>
            </a-select>
            <div class="value-input" v-if="record.amountCondition">
              <template v-if="record.amountCondition === 'range'">
                <a-input
                  v-model="record.minAmount"
                  placeholder="最小值"
                  class="condition-input"
                  @change="updateAmountRange(record, product)"
                  @update:model-value="(val: string) => record.minAmount = Number(val)"
                />
                <span class="separator">-</span>
                <a-input
                  v-model="record.maxAmount"
                  placeholder="最大值"
                  class="condition-input"
                  @change="updateAmountRange(record, product)"
                  @update:model-value="(val: string) => record.maxAmount = val ? Number(val) : null"
                />
              </template>
              <template v-else>
                <a-input
                  v-model="record.amountValue"
                  :placeholder="getAmountPlaceholder(record.amountCondition)"
                  class="condition-input"
                  @change="updateAmountValue(record, product)"
                  @update:model-value="(val: string) => record.amountValue = Number(val)"
                />
              </template>
              
            </div>
          </div>
        </template>
      </a-table>
      <div class="allocation-progress">
        <span class="progress-text">分配进度：{{ calculateProgress(product) }}%</span>
        <a-progress :percent="calculateProgress(product)" :show-text="false" size="small" />
      </div>
    </div>

    <div class="form-footer">
      <a-space>
        <a-button size="large" @click="handlePrev">上一步</a-button>
        <a-button type="primary" size="large" @click="handleNext">下一步</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FormData, Scene } from '../../types/accompany'

const props = defineProps<{
  formData: FormData
}>()

const emit = defineEmits(['next', 'prev'])

const selectedScenes = ref<string[]>([])

const sceneOptions = [
  { label: '授信申请', value: 'credit_apply' },
  { label: '授信通过', value: 'credit_pass' },
  { label: '支用申请', value: 'loan_apply' },
  { label: '支用通过', value: 'loan_pass' }
]

const conditionFields = [
  { label: '条件', value: 'condition' }
]

const amountConditionOptions = [
  { label: '等于', value: 'eq' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
  { label: '区间', value: 'range' }
]

const periodConditionOptions = [
  { label: '等于', value: 'eq' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
  { label: '区间', value: 'range' }
]

const riskLevelOptions = [
  { label: '低风险', value: 'low' },
  { label: '中风险', value: 'medium' },
  { label: '高风险', value: 'high' }
]

const columns = [
  { title: '场景', slotName: 'scene', width: 150 },
  { title: '分配条数', slotName: 'amount', width: 150 },
  { title: '分配比例', slotName: 'ratio', width: 150 },
  { title: '条件', slotName: 'amountCondition', width: 300 }
]

const getProductSceneData = (product: { scenes?: any[] }) => {
  return selectedScenes.value.map(sceneValue => {
    const sceneName = sceneOptions.find(option => option.value === sceneValue)?.label || ''
    const existingScene = product.scenes?.find((s) => s.sceneValue === sceneValue)
    return {
      sceneValue,
      sceneName,
      amount: Number(existingScene?.amount || 0),
      selectedField: 'amount',
      amountCondition: existingScene?.amountCondition || '',
      amountValue: Number(existingScene?.amountValue || 0),
      minAmount: Number(existingScene?.minAmount || 0),
      maxAmount: existingScene?.maxAmount || null,
      creditProducts: []
    }
  })
}

const updateAmount = (record: any, product: { scenes?: any[]; totalAmount: number }) => {
  if (record.amount > product.totalAmount) {
    record.amount = product.totalAmount
  }
  
  // 更新产品的场景数据
  if (!product.scenes) {
    product.scenes = []
  }
  
  const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue)
  const updatedRecord = {
    ...record,
    ratio: calculateRatio(record.amount, product.totalAmount)
  }
  
  if (existingSceneIndex >= 0) {
    product.scenes[existingSceneIndex] = updatedRecord
  } else {
    product.scenes.push(updatedRecord)
  }
}

const calculateRatio = (amount: number, total: number) => {
  if (!total) return 0
  // 使用toFixed控制精度，并转换为数值类型
  return Number((amount / total * 100).toFixed(2))
}

const calculateProgress = (product: { scenes?: any[]; totalAmount: number }) => {
  if (!product.totalAmount) return 0
  const totalAllocated = (product.scenes || []).reduce((sum: number, scene: { amount: number }) => {
    // 直接使用整数计算，避免浮点数精度问题
    const sceneAmount = Math.round(Number(scene.amount || 0))
    return sum + sceneAmount
  }, 0)
  // 使用整数计算百分比，最后再处理小数位
  return Math.min(Number((totalAllocated * 100 / product.totalAmount).toFixed(2)), 100)
}

const validateSceneAllocation = () => {
  // 检查是否选择了场景
  if (selectedScenes.value.length === 0) {
    Message.error('请至少选择一个场景进行数据分配')
    return false
  }

  // 检查每个数据产品的场景分配是否完成
  return props.formData.dataProducts.every(product => {
    // 检查是否存在场景数据
    if (!product.scenes?.length) {
      Message.error(`请为数据产品「${product.name}」分配场景数据`)
      return false
    }

    // 检查是否所有选择的场景都已分配数据
    const unallocatedScenes = selectedScenes.value.filter(sceneValue => {
      return !product.scenes?.some((scene) => scene.sceneValue === sceneValue && Number(scene.amount) > 0)
    })

    if (unallocatedScenes.length > 0) {
      const sceneNames = unallocatedScenes
        .map(sceneValue => sceneOptions.find(option => option.value === sceneValue)?.label)
        .filter(Boolean)
        .join('、')
      Message.error(`数据产品「${product.name}」的「${sceneNames}」场景尚未分配数据`)
      return false
    }

    // 检查分配总量是否正确
    const totalAllocated = product.scenes.reduce((sum: number, scene: { amount: number }) => {
      return sum + Math.round(Number(scene.amount || 0))
    }, 0)

    if (totalAllocated !== product.totalAmount) {
      const difference = Math.abs(totalAllocated - product.totalAmount)
      Message.error(
        `数据产品「${product.name}」的场景分配总量(${totalAllocated})与产品总量(${product.totalAmount})不一致，` +
        `还需分配${difference}条数据`
      )
      return false
    }

    return true
  })
}



const handleNext = () => {
  if (!validateSceneAllocation()) {
    // 使用Arco Design的Message组件显示错误提示
    Message.error('请确保所有数据产品的场景分配完成且总量正确')
    return
  }
  // 添加校验通过日志
  console.log('场景步骤校验通过，触发下一步')
  emit('next')
}

const handlePrev = () => {
  emit('prev')
}

const getAmountPlaceholder = (condition: string) => {
  const placeholders = {
    gt: '大于金额',
    lt: '小于金额',
    gte: '大于等于金额',
    lte: '小于等于金额'
  }
  return placeholders[condition as keyof typeof placeholders] || '请输入金额'
}

const updateAmountCondition = (value: string, record: any, product: { scenes?: any[] }) => {
  if (!product.scenes) {
    product.scenes = []
  }
  
  const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue)
  
  if (existingSceneIndex >= 0) {
    product.scenes[existingSceneIndex].amountCondition = value
  } else {
    product.scenes.push({
      ...record,
      amountCondition: value
    })
  }
}

const updateSelectedCondition = (value: string, record: any, product: { scenes?: any[] }) => {
  if (!product.scenes) {
    product.scenes = []
  }
  
  const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue)
  
  if (existingSceneIndex >= 0) {
    product.scenes[existingSceneIndex].selectedCondition = value
  } else {
    product.scenes.push({
      ...record,
      selectedCondition: value
    })
  }
}

const updateAmountValue = (record: any, product: { scenes?: any[] }) => {
  // 确保数值有效
  if (record.amountValue < 0) {
    record.amountValue = 0
  }
  updateSceneData(record, product)
}

const updateAmountRange = (record: any, product: { scenes?: any[] }) => {
  // 确保最小额度不为负
  if (record.minAmount < 0) {
    record.minAmount = 0
  }
  // 确保最大额度不小于最小额度
  if (record.maxAmount && record.maxAmount < record.minAmount) {
    record.maxAmount = record.minAmount
  }
  updateSceneData(record, product)
}

const updateSceneData = (record: any, product: { scenes?: any[] }) => {
  if (!product.scenes) {
    product.scenes = []
  }

  const existingSceneIndex = product.scenes.findIndex((s) => s.sceneValue === record.sceneValue)
  if (existingSceneIndex >= 0) {
    const updatedScene = {
      ...product.scenes[existingSceneIndex],
      amountCondition: String(record.amountCondition),
      amountValue: String(record.amountValue),
      minAmount: String(record.minAmount),
      maxAmount: record.maxAmount ? String(record.maxAmount) : null
    }
    product.scenes[existingSceneIndex] = updatedScene
  } else {
    product.scenes.push({
      sceneValue: String(record.sceneValue),
      sceneName: String(record.sceneName),
      amount: String(record.amount),
      amountCondition: String(record.amountCondition),
      amountValue: String(record.amountValue),
      minAmount: String(record.minAmount),
      maxAmount: record.maxAmount ? String(record.maxAmount) : null
    })
  }
}

// 添加场景数据更新监听
watch(() => props.formData.dataProducts, () => {
  console.log('场景数据更新:', JSON.parse(JSON.stringify(props.formData.dataProducts)))
}, { deep: true, immediate: true })
</script>

<style scoped>
.condition-selects {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.condition-select {
  width: 120px;
}

.condition-label {
  display: inline-block;
  width: 40px;
  line-height: 32px;
  color: var(--color-text-2);
}

.value-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-input .separator,
.value-input .unit {
  color: var(--color-text-2);
}

.amount-range-input {
  width: 120px;
}

.scene-step {
  padding: 24px;
}

.scene-selection {
  margin-bottom: 32px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
}

.scene-select {
  width: 100%;
}

.product-section {
  margin-bottom: 32px;
}

.product-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
}

.product-info {
  margin-bottom: 16px;
}

.info-label {
  color: var(--color-text-2);
}

.info-value {
  margin-left: 8px;
  font-weight: 500;
  color: var(--color-text-1);
}

.scene-table {
  width: 100%;
  border-radius: 4px;
}

.amount-range-input {
  width: 120px;
}

.amount-input {
  width: 160px;
}

.form-footer {
  margin-top: 40px;
  text-align: center;
}

.form-footer :deep(.arco-btn) {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}

.allocation-progress {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.progress-text {
  margin-right: 12px;
  color: var(--color-text-2);
}

.allocation-progress :deep(.arco-progress) {
  width: 200px;
}
</style>
