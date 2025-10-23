<template>
  <div class="coupon-preview" :class="[styleType, deviceType, { 'unrendered': !isRendered }]">
    <!-- 灰色优惠券模板 -->
    <div class="gray-coupon-card">
      <!-- 券类型标签 -->
      <div class="gray-coupon-type-tag">
        角标文字
      </div>
      
      <!-- 左侧优惠信息 -->
      <div class="gray-coupon-left">
        <div class="gray-benefit-value">
          减免值
        </div>
        <div class="gray-benefit-desc">
          类别
        </div>
      </div>

      <!-- 右侧详细信息 -->
      <div class="gray-coupon-right">
        <!-- 去使用按钮 -->
        <div class="gray-use-btn">
          去使用
        </div>
        
        <div class="gray-coupon-content">
          <div class="gray-coupon-title">
            显示名称
          </div>
          <div class="gray-expiry-date">
            有效期
          </div>
          
          <!-- 使用说明按钮 -->
          <div class="gray-usage-btn">
            <span>使用说明</span>
            <IconRight class="gray-arrow-icon" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="coupon-card" :class="[displayData.type || 'interest_free', { 'unrendered': !isRendered }]">
      <!-- 券类型标签 -->
      <div class="coupon-type-tag">
        {{ getCouponTypeText() }}
      </div>
      
      <!-- 左侧优惠信息 -->
      <div class="coupon-left">
        <div class="benefit-value">
          {{ getBenefitValue() }}
        </div>
        <div class="benefit-desc">
          {{ getBenefitDesc() }}
        </div>
      </div>

      <!-- 右侧详细信息 -->
      <div class="coupon-right">
        <!-- 去使用按钮 -->
        <div class="use-btn">
          去使用
        </div>
        
        <div class="coupon-content">
          <div class="coupon-title">
            {{ getDisplayTitle() }}
          </div>
          <div class="expiry-date">
            {{ formatExpiryDate() }}
          </div>
          
          <!-- 使用说明按钮 -->
          <div class="usage-btn" @click="toggleInstructions">
            <span>使用说明</span>
            <IconRight class="arrow-icon" :style="{ transform: showFullInstructions ? 'rotate(90deg)' : 'rotate(0deg)' }" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 使用说明展开区域 -->
    <div v-if="showFullInstructions" class="usage-instructions">
      <div class="usage-list">
        <div v-for="(instruction, index) in getInstructionsList" :key="index" class="usage-item">
          {{ index + 1 }}. {{ instruction }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconRight, IconUp } from '@arco-design/web-vue/es/icon'
import { marked } from 'marked'

const props = defineProps({
  couponData: {
    type: Object,
    default: () => ({})
  },
  usageDescription: {
    type: String,
    default: ''
  },
  deviceType: {
    type: String,
    default: 'mobile'
  },
  styleType: {
    type: String,
    default: 'card' // card 或 list
  },
  isRendered: {
    type: Boolean,
    default: true // 默认为已渲染状态
  }
})

// 计算优惠券数据
const displayData = computed(() => {
  return props.couponData || {}
})

// 获取券类型文本
const getCouponTypeText = () => {
  // 如果有自定义角标文字，优先使用
  if (displayData.value.cornerText && displayData.value.cornerText.trim()) {
    return displayData.value.cornerText
  }
  
  // 否则根据券类型自动生成
  const typeMap: Record<string, string> = {
    'interest_free': '免息券',
    'discount': '折扣券'
  }
  return typeMap[displayData.value.type] || '免息券'
}

// 获取优惠价值显示
const getBenefitValue = () => {
  // 如果有自定义减免值，优先使用
  if (displayData.value.reductionValue && displayData.value.reductionValue.trim()) {
    return displayData.value.reductionValue
  }
  
  // 否则根据券类型自动计算
  if (displayData.value.type === 'interest_free') {
    if (displayData.value.interestFreeDays) {
      return `${displayData.value.interestFreeDays}天`
    } else if (displayData.value.maxInterestFreeAmount) {
      return `${displayData.value.maxInterestFreeAmount}元`
    }
    return '3期' // 默认值
  } else if (displayData.value.type === 'discount') {
    if (displayData.value.uniformDiscount) {
      const rate = Math.round(displayData.value.uniformDiscount * 10)
      return `${rate}折`
    }
    return '100元' // 默认值
  }
  return '3期' // 兜底默认值
}

// 获取优惠描述
const getBenefitDesc = () => {
  // 如果有自定义类别文字，优先使用
  if (displayData.value.categoryText && displayData.value.categoryText.trim()) {
    return displayData.value.categoryText
  }
  
  // 否则根据券类型自动生成
  if (displayData.value.type === 'interest_free') {
    return '免息'
  } else if (displayData.value.type === 'discount') {
    return '折扣'
  }
  return '免息' // 默认值
}

// 获取显示标题
const getDisplayTitle = () => {
  // 如果有自定义显示名称，优先使用
  if (displayData.value.displayName && displayData.value.displayName.trim()) {
    return displayData.value.displayName
  }
  
  // 如果有券名称，使用券名称
  if (displayData.value.name && displayData.value.name.trim()) {
    return displayData.value.name
  }
  
  // 根据券类型生成默认标题
  if (displayData.value.type === 'discount') {
    return '满减优惠券'
  }
  return '借6期免前3期优惠券' // 免息券默认标题
}

// 格式化到期日期
const formatExpiryDate = () => {
  // 如果未渲染状态，显示默认日期
  if (!props.isRendered) {
    return '2025年09月10日到期'
  }
  
  // 如果是长期有效
  if (displayData.value.validityPeriodType === 'unlimited') {
    return '长期有效'
  }
  
  // 如果有具体的有效期
  if (displayData.value.validityPeriod && displayData.value.validityPeriod[1]) {
    const expiryDate = new Date(displayData.value.validityPeriod[1])
    const year = expiryDate.getFullYear()
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0')
    const day = String(expiryDate.getDate()).padStart(2, '0')
    
    // 检查是否需要显示剩余天数提醒
    const today = new Date()
    const timeDiff = expiryDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff <= (displayData.value.expiryReminderThreshold || 7) && daysDiff > 0) {
      return `仅剩${daysDiff}天`
    }
    
    return `${year}年${month}月${day}日到期`
  }
  
  // 如果有有效期类型但没有具体日期，根据类型显示
  if (displayData.value.validityPeriodType === 'limited') {
    return '请设置有效期'
  }
  
  // 默认到期日期
  return '2025年09月10日到期'
}

// 使用说明展开/收起状态
const showFullInstructions = ref(false)

// 获取原始使用说明文本
const getRawInstructions = () => {
  return props.usageDescription || displayData.value.usageInstructions || displayData.value.usageDescription || ''
}

// 判断是否需要显示展开按钮
const shouldShowExpandButton = computed(() => {
  const instructions = getRawInstructions()
  return instructions && instructions.length > 100 // 超过100字符显示展开按钮
})

// 获取显示的使用说明内容
const getDisplayInstructions = () => {
  const instructions = getRawInstructions()
  if (!instructions) return ''
  
  let displayText = instructions
  if (shouldShowExpandButton.value && !showFullInstructions.value) {
    displayText = instructions.substring(0, 100) + '...'
  }
  
  // 使用 marked 解析 markdown
  return marked(displayText)
}

// 切换使用说明展开状态
const toggleInstructions = () => {
      showFullInstructions.value = !showFullInstructions.value
    }

    // 获取使用说明列表
const getInstructionsList = computed(() => {
  const instructions = getRawInstructions()
  if (!instructions) return []
  
  // 如果是纯文本，按行分割
  if (typeof instructions === 'string') {
    return instructions.split('\n').filter(line => line.trim())
  }
  
  // 如果是数组，直接返回
  if (Array.isArray(instructions)) {
    return instructions
  }
  
  return []
})

// 渲染Markdown内容
const renderMarkdown = (text: string) => {
  if (!text) return ''
  
  // 配置marked选项
  marked.setOptions({
    breaks: true, // 支持换行
    gfm: true // 支持GitHub风格的Markdown
  })
  
  return marked(text)
}


</script>

<style scoped>
.coupon-preview {
  width: 100%;
  padding: 8px;
}

.coupon-preview.mobile {
  max-width: 375px;
  margin: 0 auto;
}

.coupon-preview.desktop {
  max-width: 100%;
}

/* 卡片样式 */
.coupon-card {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
  transition: all 0.3s ease;
}

.coupon-card:hover {
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
  transform: translateY(-2px);
}

/* 券类型标签 */
.coupon-type-tag {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: bold;
  background: #ec4899;
  color: white;
  border-bottom-right-radius: 8px;
  z-index: 2;
}

/* 左侧优惠信息 */
.coupon-left {
  flex: 1;
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-right: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  color: white;
}

.benefit-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.benefit-desc {
  font-size: 14px;
  opacity: 0.9;
}

/* 右侧详细信息 */
.coupon-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-left: 16px;
  position: relative;
}

/* 去使用按钮 */
.use-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #ff5722 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  align-self: flex-end;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.use-btn:hover {
  background: linear-gradient(135deg, #e55a2b 0%, #e64a19 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  transform: translateY(-1px);
}

/* 优惠券内容区域 */
.coupon-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
}

.expiry-date {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* 使用说明按钮 */
.usage-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.arrow-icon {
  width: 12px;
  height: 12px;
  color: #6b7280;
}

/* 使用说明展开区域 */
.usage-instructions {
  margin-top: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s ease-out;
  width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.usage-list {
  color: #4e5969;
  font-size: 13px;
  line-height: 1.6;
}

.usage-item {
  margin-bottom: 8px;
  padding-left: 0;
}

.usage-item:last-child {
  margin-bottom: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .coupon-card {
    height: 100px;
    padding: 12px;
  }
  
  .benefit-value {
    font-size: 24px;
  }
  
  .benefit-desc {
    font-size: 12px;
  }
  
  .coupon-title {
    font-size: 14px;
  }
  
  .use-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 未渲染状态样式 */
.coupon-preview.unrendered .coupon-card {
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  box-shadow: none;
}

.coupon-preview.unrendered .coupon-type-tag {
  background: #9ca3af !important;
  color: #6b7280 !important;
  font-style: italic;
}

.coupon-preview.unrendered .coupon-left {
  background: #e5e7eb !important;
  color: #6b7280 !important;
}

.coupon-preview.unrendered .benefit-value,
.coupon-preview.unrendered .benefit-desc {
  color: #6b7280 !important;
  font-style: italic;
}

.coupon-preview.unrendered .coupon-title,
.coupon-preview.unrendered .expiry-date {
  color: #9ca3af !important;
  font-style: italic;
}

.coupon-preview.unrendered .usage-btn {
  color: #9ca3af !important;
  font-style: italic;
  cursor: not-allowed;
}

.coupon-preview.unrendered .use-btn {
  background: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  box-shadow: none !important;
}

.coupon-preview.unrendered .use-btn:hover {
  background: #e5e7eb !important;
  transform: none !important;
}



/* 灰色优惠券模板样式 */
.gray-coupon-card {
  position: relative;
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 2px dashed #94a3b8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
}

.gray-coupon-type-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: #94a3b8;
  color: white;
  padding: 4px 12px;
  border-radius: 0 0 8px 0;
  font-size: 12px;
  font-weight: 500;
}

.gray-coupon-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-right: 16px;
  border-right: 1px dashed #cbd5e1;
}

.gray-benefit-value {
  font-size: 28px;
  font-weight: bold;
  color: #64748b;
  line-height: 1;
  margin-bottom: 4px;
}

.gray-benefit-desc {
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
}

.gray-coupon-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-left: 16px;
}

.gray-use-btn {
  background: #cbd5e1;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  align-self: flex-end;
  min-width: 80px;
}

.gray-coupon-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.gray-coupon-title {
  font-size: 16px;
  font-weight: bold;
  color: #64748b;
  margin-bottom: 4px;
}

.gray-expiry-date {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.gray-usage-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  cursor: default;
}

.gray-arrow-icon {
  width: 12px;
  height: 12px;
  color: #94a3b8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .gray-coupon-card {
    height: 100px;
    padding: 12px;
  }
  
  .gray-benefit-value {
    font-size: 24px;
  }
  
  .gray-coupon-title {
    font-size: 14px;
  }
  
  .gray-use-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 显示标识按钮样式 */
.show-annotation-btn {
  margin-bottom: 16px;
}

.annotation-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.annotation-toggle-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* 高亮动画效果 */
.highlighted {
  animation: highlight-pulse 2s ease-in-out infinite;
}

@keyframes highlight-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }
}

.annotation-toggle-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

/* 高亮样式 */
.coupon-card.with-annotations {
  position: relative;
}

.highlighted {
  position: relative;
  animation: highlight 2s ease-in-out infinite;
}

@keyframes highlight {
  0%, 100% {
    box-shadow: 0 0 0 2px transparent;
  }
  50% {
    box-shadow: 0 0 0 2px #3b82f6;
  }
}

.coupon-type-tag.highlighted {
  animation: highlight-tag 2s ease-in-out infinite;
}

@keyframes highlight-tag {
  0%, 100% {
    box-shadow: 0 0 0 2px transparent;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 2px #3b82f6;
    transform: scale(1.05);
  }
}
</style>