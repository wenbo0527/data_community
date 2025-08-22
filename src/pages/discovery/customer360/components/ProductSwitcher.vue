<template>
  <div 
    class="product-switcher"
    :class="{
      loading: loading,
      mobile: isMobile,
      animated: animated,
      switching: isSwitching
    }"
    role="tablist"
    aria-label="产品类型切换器"
  >
    <!-- 桌面端Tab样式 -->
    <div v-if="!isMobile || !responsive" class="desktop-tabs">
      <div 
        v-for="option in productOptions" 
        :key="option.value"
        :data-testid="`${option.value}-tab`"
        :class="[
          'tab-item',
          {
            'active': modelValue === option.value,
            'empty': showCounts && productCounts[option.value] === 0,
            'disabled': loading
          }
        ]"
        role="tab"
        :aria-selected="modelValue === option.value"
        :aria-controls="`${option.value}-panel`"
        :tabindex="modelValue === option.value ? 0 : -1"
        @click="handleTabClick(option.value)"
        @keydown="handleKeyDown($event, option.value)"
      >
        <div class="tab-content">
          <span class="tab-label">{{ option.label }}</span>
          <span 
            v-if="showCounts && productCounts[option.value] !== undefined"
            :data-testid="`${option.value}-count`"
            class="tab-count"
          >
            {{ productCounts[option.value] }}
          </span>
        </div>
        <div class="tab-indicator"></div>
      </div>
    </div>

    <!-- 移动端下拉选择器 -->
    <div v-else class="mobile-selector">
      <a-select
        :value="modelValue"
        :loading="loading"
        :disabled="loading"
        class="mobile-select"
        @change="handleSelectChange"
      >
        <a-select-option 
          v-for="option in productOptions" 
          :key="option.value"
          :value="option.value"
          :disabled="showCounts && productCounts[option.value] === 0"
        >
          <div class="option-content">
            <span>{{ option.label }}</span>
            <span 
              v-if="showCounts && productCounts[option.value] !== undefined"
              class="option-count"
            >
              ({{ productCounts[option.value] }})
            </span>
          </div>
        </a-select-option>
      </a-select>
    </div>

    <!-- 加载状态指示器 -->
    <div v-if="loading" class="loading-indicator">
      <a-spin size="small" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Select as ASelect, Option as ASelectOption, Spin as ASpin } from '@arco-design/web-vue'
import { useProductStore } from '@/stores/productStore'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'self',
    validator: (value) => ['self', 'loan'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: true
  },
  responsive: {
    type: Boolean,
    default: true
  },
  syncUrl: {
    type: Boolean,
    default: true
  },
  showCounts: {
    type: Boolean,
    default: true
  },
  productCounts: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const router = useRouter()
const productStore = useProductStore()
const isSwitching = ref(false)
const isMobile = ref(false)

// 产品选项配置
const productOptions = [
  { value: 'self', label: '自营产品' },
  { value: 'loan', label: '助贷产品' }
]

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Tab点击处理
const handleTabClick = (value) => {
  if (loading.value || value === props.modelValue) {
    return
  }
  
  switchTab(value)
}

// 键盘导航处理
const handleKeyDown = (event) => {
  const currentValue = props.modelValue
  const currentIndex = productOptions.findIndex(option => option.value === currentValue)
  
  let targetIndex = currentIndex
  
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      targetIndex = currentIndex > 0 ? currentIndex - 1 : productOptions.length - 1
      break
    case 'ArrowRight':
    case 'ArrowDown':
      targetIndex = currentIndex < productOptions.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      targetIndex = 0
      break
    case 'End':
      targetIndex = productOptions.length - 1
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      return
    default:
      return
  }
  
  event.preventDefault()
  const targetValue = productOptions[targetIndex].value
  if (targetValue !== currentValue) {
    switchTab(targetValue)
  }
}

// 移动端选择器变化处理
const handleSelectChange = (value) => {
  if (!props.loading) {
    switchTab(value)
  }
}

// 切换Tab核心逻辑
const switchTab = (value) => {
  if (value === props.modelValue) return
  
  // 更新全局store状态
  productStore.setProductType(value)
  
  // 发射事件
  emit('update:modelValue', value)
  emit('change', value)
  
  // 添加切换动画
  if (props.animated) {
    isSwitching.value = true
    setTimeout(() => {
      isSwitching.value = false
    }, 300)
  }
  
  // 更新URL参数
  if (props.syncUrl && router) {
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        productType: value
      }
    }).catch(error => {
      console.warn('URL同步失败:', error)
    })
  }
}

// 监听URL变化
watch(
  () => router?.currentRoute.value.query.productType,
  (newType) => {
    if (props.syncUrl && newType && newType !== props.modelValue) {
      emit('update:modelValue', newType)
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (props.responsive) {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }
  
  // 从URL初始化状态
  if (props.syncUrl && router?.currentRoute.value.query.productType) {
    const urlType = router.currentRoute.value.query.productType
    if (urlType !== props.modelValue && ['self', 'loan'].includes(urlType)) {
      emit('update:modelValue', urlType)
    }
  }
})

onUnmounted(() => {
  if (props.responsive) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>

<style scoped>
.product-switcher {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-switcher.loading {
  pointer-events: none;
  opacity: 0.7;
}

.product-switcher.switching {
  transform: scale(0.98);
}

/* 桌面端Tab样式 */
.desktop-tabs {
  display: flex;
  position: relative;
  background: #fafafa;
  border-radius: 6px;
  padding: 4px;
  gap: 2px;
}

.tab-item {
  flex: 1;
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  outline: none;
  user-select: none;
}

.tab-item:focus-visible {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tab-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tab-item.empty {
  opacity: 0.6;
}

.tab-item.empty .tab-count {
  color: #ff4d4f;
}

.tab-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-label {
  font-size: 14px;
  line-height: 1.4;
}



/* 移动端选择器样式 */
.mobile-selector {
  padding: 8px;
}

.mobile-select {
  width: 100%;
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.option-count {
  color: #666;
  font-size: 12px;
}

/* 加载指示器 */
.loading-indicator {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  z-index: 10;
}

/* 动画效果 */
.product-switcher.animated .tab-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-switcher.animated.switching {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 点击反馈动画 */
.tab-item:active:not(.disabled) {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 悬停时的微妙动画 */
.tab-item:hover:not(.disabled):not(.active) {
  background: rgba(24, 144, 255, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

/* 激活状态的增强动画 */
.tab-item.active {
  background: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  color: #1890ff;
  font-weight: 500;
  transform: translateY(-2px);
}

/* 切换时的内容淡入淡出 */
.product-switcher.switching .tab-content {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

/* 指示器动画增强 */
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 2px;
  transform: translateX(-50%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.tab-item.active .tab-indicator {
  width: 32px;
  opacity: 1;
}

/* 数量徽章动画 */
.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1);
}

.tab-item:hover .tab-count {
  transform: scale(1.05);
}

.tab-item.active .tab-count {
  background: linear-gradient(135deg, #e6f7ff, #bae7ff);
  color: #1890ff;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

/* 加载状态动画 */
.product-switcher.loading {
  pointer-events: none;
  opacity: 0.7;
}

.product-switcher.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 脉冲动画用于强调 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.tab-item.empty .tab-count {
  animation: pulse 2s infinite;
  color: #ff4d4f;
  background: #fff2f0;
}

/* 响应式设计 */
@media (max-width: 767px) {
  .product-switcher {
    margin: 0 -8px;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  
  .product-switcher.mobile .desktop-tabs {
    display: none;
  }
  
  .mobile-selector {
    padding: 12px;
  }
  
  .mobile-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    font-size: 16px;
    background: #fff;
    transition: all 0.3s ease;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;
  }
  
  .mobile-select:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    outline: none;
  }
  
  .tab-item {
    padding: 14px 16px;
    min-height: 48px;
    touch-action: manipulation;
  }
  
  .tab-label {
    font-size: 14px;
    font-weight: 500;
  }
  
  .tab-count {
    min-width: 20px;
    height: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  
  /* 移动端触摸优化 */
  .tab-item:active {
    background: rgba(24, 144, 255, 0.1);
    transform: scale(0.98);
  }
  
  /* 移动端悬停效果调整 */
  .tab-item:hover {
    transform: none;
    box-shadow: none;
  }
  
  .tab-item.active {
    transform: none;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }
}

/* 平板设备适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .product-switcher {
    border-radius: 10px;
  }
  
  .tab-item {
    padding: 14px 20px;
  }
  
  .tab-label {
    font-size: 15px;
  }
  
  .tab-count {
    min-width: 22px;
    height: 22px;
    font-size: 13px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .product-switcher {
    max-width: 600px;
  }
  
  .tab-item {
    padding: 16px 24px;
  }
  
  .tab-label {
    font-size: 16px;
  }
  
  .tab-count {
    min-width: 24px;
    height: 24px;
    font-size: 14px;
  }
}

/* 横屏模式优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .product-switcher {
    border-radius: 6px;
  }
  
  .tab-item {
    padding: 8px 16px;
  }
  
  .tab-label {
    font-size: 13px;
  }
  
  .tab-count {
    min-width: 16px;
    height: 16px;
    font-size: 11px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .product-switcher {
    background: #1f1f1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .desktop-tabs {
    background: #262626;
  }
  
  .tab-item.active {
    background: #1f1f1f;
    color: #1890ff;
  }
  
  .tab-count {
    background: #404040;
    color: #d9d9d9;
  }
  
  .tab-item.active .tab-count {
    background: #111a2c;
    color: #1890ff;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .tab-item {
    border: 1px solid transparent;
  }
  
  .tab-item.active {
    border-color: #1890ff;
  }
  
  .tab-item:focus-visible {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px #1890ff;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .product-switcher,
  .tab-item,
  .tab-indicator {
    transition: none;
  }
}
</style>