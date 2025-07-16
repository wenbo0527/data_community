<template>
  <div 
    class="preset-slot"
    :class="[
      `preset-slot--${slot.type}`,
      `preset-slot--${state}`,
      { 'preset-slot--hover': isHover }
    ]"
    :style="slotStyle"
    @click="handleClick"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <!-- 预设位图标 -->
    <div class="preset-slot__icon">
      <svg v-if="state === 'empty'" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else-if="state === 'occupied'" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>

    <!-- 预设位标签 -->
    <div class="preset-slot__label">
      {{ slot.label }}
    </div>

    <!-- 连接线 -->
    <div class="preset-slot__connector" v-if="showConnector">
      <svg class="connector-line" :style="connectorStyle">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>
        <line 
          :x1="connectorStart.x" 
          :y1="connectorStart.y" 
          :x2="connectorEnd.x" 
          :y2="connectorEnd.y" 
          stroke="currentColor" 
          stroke-width="2"
          stroke-dasharray="6 4"
          marker-end="url(#arrowhead)"
        />
      </svg>
    </div>

    <!-- 悬浮提示 -->
    <div class="preset-slot__tooltip" v-if="isHover && state === 'empty'">
      点击添加{{ slot.label }}节点
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  slot: {
    type: Object,
    required: true
  },
  state: {
    type: String,
    default: 'empty', // empty, occupied, disabled
    validator: (value) => ['empty', 'occupied', 'disabled'].includes(value)
  },
  parentPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  showConnector: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'add-node'])

const isHover = ref(false)

// 计算预设位样式
const slotStyle = computed(() => {
  const { x, y } = props.slot.position
  return {
    position: 'absolute',
    left: `${props.parentPosition.x + x}px`,
    top: `${props.parentPosition.y + y}px`,
    transform: 'translate(-50%, -50%)'
  }
})

// 计算连接线样式
const connectorStyle = computed(() => {
  return {
    position: 'absolute',
    width: '100px',
    height: '60px',
    top: '-30px',
    left: '-50px',
    pointerEvents: 'none',
    zIndex: 1
  }
})

// 连接线起点和终点
const connectorStart = computed(() => {
  return { x: 50, y: 0 }
})

const connectorEnd = computed(() => {
  return { x: 50, y: 30 }
})

// 处理点击事件
const handleClick = () => {
  if (props.state === 'empty') {
    emit('click', props.slot)
    emit('add-node', {
      slot: props.slot,
      position: {
        x: props.parentPosition.x + props.slot.position.x,
        y: props.parentPosition.y + props.slot.position.y
      }
    })
  }
}
</script>

<style scoped>
.preset-slot {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  position: relative;
}

/* 不同类型的预设位样式 */
.preset-slot--single {
  border: 2px solid #5F95FF;
  background: rgba(95, 149, 255, 0.1);
}

.preset-slot--branch {
  border: 2px solid #FF6A6A;
  background: rgba(255, 106, 106, 0.1);
}

.preset-slot--parallel {
  border: 2px solid #69C0FF;
  background: rgba(105, 192, 255, 0.1);
}

.preset-slot--terminal {
  border: 2px solid #8C8C8C;
  background: rgba(140, 140, 140, 0.1);
}

/* 不同状态的样式 */
.preset-slot--empty {
  opacity: 0.7;
}

.preset-slot--empty:hover,
.preset-slot--hover {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-slot--occupied {
  opacity: 1;
  background: #52c41a;
  border-color: #52c41a;
  cursor: default;
}

.preset-slot--disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f5f5f5;
  border-color: #d9d9d9;
}

/* 图标样式 */
.preset-slot__icon {
  width: 24px;
  height: 24px;
  color: inherit;
}

.preset-slot--empty .preset-slot__icon {
  color: #5F95FF;
}

.preset-slot--occupied .preset-slot__icon {
  color: white;
}

.preset-slot--disabled .preset-slot__icon {
  color: #bfbfbf;
}

/* 标签样式 */
.preset-slot__label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preset-slot:hover .preset-slot__label {
  opacity: 1;
}

/* 连接线样式 */
.preset-slot__connector {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.connector-line {
  color: #5F95FF;
  opacity: 0.6;
}

.preset-slot:hover .connector-line {
  opacity: 1;
}

/* 提示框样式 */
.preset-slot__tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preset-slot {
    width: 40px;
    height: 40px;
  }
  
  .preset-slot__icon {
    width: 20px;
    height: 20px;
  }
  
  .preset-slot__label {
    font-size: 10px;
  }
}
</style>