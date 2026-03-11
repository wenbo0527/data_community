<template>
  <div class="logic-switcher">
    <div class="switcher-container">
      <div 
        class="switcher-track"
        :class="{ 'active': modelValue === 'or' }"
        @click="toggle"
      >
        <div 
          class="switcher-thumb"
          :class="{ 'moved': modelValue === 'or' }"
        >
          <span class="thumb-text">{{ modelValue === 'and' ? '且' : '或' }}</span>
        </div>
        
        <div class="track-labels">
          <span 
            class="track-label left"
            :class="{ 'active': modelValue === 'and' }"
          >
            且
          </span>
          <span 
            class="track-label right"
            :class="{ 'active': modelValue === 'or' }"
          >
            或
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="showDescription" class="logic-description">
      <div class="description-text">
        {{ modelValue === 'and' ? '所有条件都必须满足' : '满足任一条件即可' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type LogicType = 'and' | 'or'

interface Props {
  modelValue: LogicType
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  showDescription?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'medium',
  showDescription: false,
  animated: true
})

const emit = defineEmits<{
  'update:modelValue': [value: LogicType]
  change: [value: LogicType]
}>()

const toggle = () => {
  if (props.disabled) return
  
  const newValue = props.modelValue === 'and' ? 'or' : 'and'
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const switcherSize = computed(() => {
  switch (props.size) {
    case 'small': return { width: '60px', height: '28px' }
    case 'large': return { width: '80px', height: '36px' }
    default: return { width: '70px', height: '32px' }
  }
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle()
  }
}
</script>

<style scoped>
.logic-switcher {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.switcher-container {
  position: relative;
}

.switcher-track {
  position: relative;
  width: v-bind('switcherSize.width');
  height: v-bind('switcherSize.height');
  background: #f2f3f5;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.switcher-track:hover {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.switcher-track:focus {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.switcher-track.active {
  background: #e8f4ff;
  border-color: #165dff;
}

.switcher-thumb {
  position: absolute;
  left: 2px;
  top: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.switcher-thumb.moved {
  transform: translateX(100%);
  background: #165dff;
}

.thumb-text {
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
  transition: color 0.3s ease;
}

.switcher-thumb.moved .thumb-text {
  color: #fff;
}

.track-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  pointer-events: none;
  z-index: 1;
}

.track-label {
  font-size: 12px;
  font-weight: 500;
  color: #86909c;
  transition: all 0.3s ease;
}

.track-label.active {
  color: transparent;
}

.logic-description {
  text-align: center;
}

.description-text {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

/* 禁用状态 */
.logic-switcher:has(.switcher-track[disabled]) .switcher-track {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f7f8fa;
}

.logic-switcher:has(.switcher-track[disabled]) .switcher-track:hover {
  border-color: #d9d9d9;
  box-shadow: none;
}

/* 动画效果 */
@keyframes switcherPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.switcher-track:active .switcher-thumb {
  animation: switcherPulse 0.2s ease;
}

/* 尺寸变体 */
.logic-switcher[data-size="small"] .track-label,
.logic-switcher[data-size="small"] .thumb-text {
  font-size: 10px;
}

.logic-switcher[data-size="large"] .track-label,
.logic-switcher[data-size="large"] .thumb-text {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .switcher-track {
    width: 60px;
    height: 28px;
  }
  
  .track-label,
  .thumb-text {
    font-size: 10px;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .switcher-track {
    border-width: 2px;
  }
  
  .switcher-thumb {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .switcher-track,
  .switcher-thumb,
  .track-label,
  .thumb-text {
    transition: none;
  }
  
  .switcher-track:active .switcher-thumb {
    animation: none;
  }
}
</style>