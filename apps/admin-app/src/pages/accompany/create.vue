<template>
  <div class="content">
    <a-steps :current="currentStep" class="steps-nav">
      <a-step v-for="step in steps" :key="step.key" :title="step.title" />
    </a-steps>

    <div class="step-content">
      <component 
        :is="currentComponent" 
        v-bind="currentStepProps"
        @next="goToNextStep"
        @prev="goToPreviousStep"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { DataProduct } from '@/types/accompany'
import type { StepItem } from '@/types/steps'
import { calculateAssignedAmount, calculateProgress, calculateTotalRatio } from '@/utils/calculations'
import BasicInfoStep from '@/components/steps/BasicInfoStep.vue'
import DataProductStep from '@/components/steps/DataProductStep.vue'
import SceneStep from '@/components/steps/SceneStep.vue'
import CreditProductStep from '@/components/steps/CreditProductStep.vue'
import SuccessStep from '@/components/steps/SuccessStep.vue'

// Step configuration
const steps: StepItem[] = [
  { key: 'basic', title: '基本信息', component: BasicInfoStep },
  { key: 'product', title: '数据产品', component: DataProductStep },
  { key: 'scene', title: '场景选择', component: SceneStep },
  { key: 'credit', title: '信贷产品', component: CreditProductStep },
  { key: 'success', title: '完成', component: SuccessStep }
]

const currentStep = ref(0)
const formData = ref<FormData>({
  workId: '',
  basic: {
    name: '',
    cacheTime: '30',
    days: 0,
    periods: 0,
    description: '',
    periodDays: [30]
  },
  creditProducts: [],
  dataProducts: []
})

// Computed properties
const currentComponent = computed(() => {
  const component = steps[currentStep.value].component
  console.log(`当前步骤: ${steps[currentStep.value].key}, 组件: ${component.name}`)
  return component
})

const currentStepProps = computed(() => {
  const baseProps = {
    formData: formData.value,
    step: currentStep.value
  }

  if (steps[currentStep.value].key === 'product') {
    return {
      ...baseProps,
      modelValue: {
        products: formData.value.dataProducts,
        periodDays: formData.value.basic.periodDays || []
      },
      'onUpdate:modelValue': (value: any) => {
        formData.value.dataProducts = value.products
        formData.value.basic.periodDays = value.periodDays
      }
    }
  }

  if (steps[currentStep.value].key === 'basic') {
    return {
      ...baseProps,
      modelValue: formData.value.basic,
      'onUpdate:modelValue': (value: any) => {
        formData.value.basic = value
      }
    }
  }

  console.log(`基础步骤props:`, baseProps)
  return baseProps
})

// Navigation methods
const goToNextStep = () => {
  console.log('当前步骤:', steps[currentStep.value].key)
  if (validateCurrentStep()) {
    console.log('校验通过，跳转到下一步')
    currentStep.value++
  } else {
    console.warn('步骤校验未通过')
  }
}

const goToPreviousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Validation methods
const validateCurrentStep = () => {
  const validators: Record<string, () => boolean> = {
    basic: validateBasicInfo,
    product: validateDataProducts,
    scene: validateScenes,
    credit: validateCreditProducts
  }
  const currentValidator = validators[steps[currentStep.value].key]
  return currentValidator ? currentValidator() : true
}

const validateBasicInfo = () => {
  const { name, days, periods } = formData.value.basic
  return !!(name && days && periods)
}

const validateDataProducts = () => {
  return formData.value.dataProducts.every(product => product.name && product.totalAmount)
}

const validateScenes = () => {
  if (!formData.value.dataProducts.length) {
    Message.error('请先添加数据产品')
    return false
  }

  return formData.value.dataProducts.every(product => {
    if (!product.scenes?.length) {
      Message.error(`数据产品「${product.name}」未配置场景数据`)
      return false
    }

    const totalAllocated = product.scenes.reduce((sum, scene) => {
      return sum + Math.round(Number(scene.amount || 0))
    }, 0)
    
    if (totalAllocated !== product.totalAmount) {
      const difference = Math.abs(totalAllocated - product.totalAmount)
      Message.error(`数据产品「${product.name}」场景分配总量(${totalAllocated})与产品总量(${product.totalAmount})不一致，还需分配${difference}条数据`)
      return false
    }

    return true
  })
}



const validateCreditProducts = () => {
  if (!formData.value.creditProducts?.length) {
    Message.error('请选择至少一个信贷产品')
    return false
  }

  const hasValidAllocation = formData.value.dataProducts.every(product => {
    const scenes = product.scenes || []
    return scenes.every(scene => {
      const creditProducts = scene.creditProducts || []
      const totalAllocated = creditProducts.reduce((sum: number, cp: { amount?: number }) => sum + (cp.amount || 0), 0)
      if (totalAllocated !== scene.amount) {
        Message.error(`数据产品「${product.name}」的场景「${scene.sceneName}」信贷产品分配总量不正确`)
        return false
      }
      return true
    })
  })

  return hasValidAllocation
}

// Event handlers with consistent naming
import type { FormData as AccompanyFormData } from '@/types/accompany'

export interface FormData extends AccompanyFormData {}

const onProductSelect = (product: string) => {
  // Handle product selection
}

const onSceneChange = (scenes: string[]) => {
  // Handle scene changes
}

const onAmountChange = (amount: number) => {
  // Handle amount changes
}

const onSubmitForm = async () => {
  // Handle form submission
}

defineExpose({
  currentStep,
  steps,
  formData,
  goToNextStep,
  goToPreviousStep,
  currentComponent,
  currentStepProps
})
</script>

<style scoped>
.content {
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.steps-nav {
  margin-bottom: 32px;
}

.steps-nav :deep(.arco-steps-item) {
  padding: 0 16px;
}

.steps-nav :deep(.arco-steps-item-title) {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-2);
}

.steps-nav :deep(.arco-steps-item-active .arco-steps-item-title) {
  color: rgb(var(--primary-6));
}

.step-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>