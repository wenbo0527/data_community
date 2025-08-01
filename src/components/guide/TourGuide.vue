<template>
  <div class="tour-guide-container" v-if="visible">
    <!-- 遮罩层 -->
    <div class="tour-mask" @click="handleMaskClick">
      <!-- 高亮区域 -->
      <div
        v-if="currentStep && currentStep.element"
        class="highlight-area"
        :style="highlightStyle"
      ></div>
    </div>

    <!-- 引导内容卡片 -->
    <div
      v-if="currentStep"
      class="guide-card"
      :style="cardStyle"
    >
      <div class="guide-content">
        <h3 class="guide-title">{{ currentStep.title }}</h3>
        <p class="guide-description">{{ currentStep.description }}</p>
      </div>
      <div class="guide-actions">
        <a-space>
          <a-button @click="prevStep" v-if="currentStepIndex > 0">上一步</a-button>
          <a-button type="primary" @click="nextStep">
            {{ isLastStep ? '完成' : '下一步' }}
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  steps: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'finish'])

// 当前步骤索引
const currentStepIndex = ref(0)

// 当前步骤信息
const currentStep = computed(() => props.steps[currentStepIndex.value])

// 是否为最后一步
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1)

// 高亮区域样式
const highlightStyle = computed(() => {
  if (!currentStep.value || !currentStep.value.element) return {}
  
  const element = document.querySelector(currentStep.value.element)
  if (!element) return {}

  const rect = element.getBoundingClientRect()
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  }
})

// 引导卡片位置样式
const cardStyle = computed(() => {
  if (!currentStep.value || !currentStep.value.element) return {}

  const element = document.querySelector(currentStep.value.element)
  if (!element) return {}

  const rect = element.getBoundingClientRect()
  const position = currentStep.value.position || 'bottom'

  const baseStyle = {
    position: 'fixed',
    transform: 'translate(-50%, 0)'
  }

  switch (position) {
    case 'top':
      return {
        ...baseStyle,
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - 10}px`,
        transform: 'translate(-50%, -100%)'
      }
    case 'bottom':
      return {
        ...baseStyle,
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.bottom + 10}px`
      }
    case 'left':
      return {
        ...baseStyle,
        left: `${rect.left - 10}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(-100%, -50%)'
      }
    case 'right':
      return {
        ...baseStyle,
        left: `${rect.right + 10}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(0, -50%)'
      }
    default:
      return baseStyle
  }
})

// 监听visible变化
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    currentStepIndex.value = 0
    await nextTick()
    updateHighlight()
  }
})

// 更新高亮区域
const updateHighlight = () => {
  if (!currentStep.value || !currentStep.value.element) return
  
  const element = document.querySelector(currentStep.value.element)
  if (!element) {
    console.warn(`Element ${currentStep.value.element} not found`)
    return
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 处理遮罩层点击
const handleMaskClick = (e) => {
  // 防止点击高亮区域时关闭引导
  if (e.target.classList.contains('highlight-area')) return
  // 点击遮罩层时关闭引导
  emit('update:visible', false)
}

// 上一步
const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    nextTick(updateHighlight)
  }
}

// 下一步
const nextStep = () => {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++
    nextTick(updateHighlight)
  } else {
    // 完成引导
    emit('update:visible', false)
    emit('finish')
    Message.success('引导完成！')
  }
}
</script>

<style scoped>
.tour-guide-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}

.tour-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.highlight-area {
  position: fixed;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  pointer-events: none;
  z-index: 1001;
  transition: all 0.3s ease-in-out;
}

.guide-card {
  position: fixed;
  z-index: 1002;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 320px;
  transition: all 0.3s ease-in-out;
}

.guide-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-1);
}

.guide-description {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 16px;
  line-height: 1.5;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
}
</style>