<template>
  <div 
    class="preset-slot" 
    :class="[state, { 'with-connector': showConnector }]"
    :style="slotStyle"
    @click="handleClick"
  >
    <div class="slot-connector" v-if="showConnector"></div>
    <div class="slot-indicator">
      <div class="slot-icon" v-if="state === 'empty'">+</div>
    </div>
    <div class="slot-label" v-if="slot.label">{{ slot.label }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 组件属性
const props = defineProps({
  // 预设位数据
  slot: {
    type: Object,
    required: true
  },
  // 预设位状态：empty, occupied
  state: {
    type: String,
    default: 'empty'
  },
  // 父节点位置
  parentPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  // 是否显示连接线
  showConnector: {
    type: Boolean,
    default: false
  }
})

// 事件
const emit = defineEmits(['click', 'add-node'])

// 预设位样式
const slotStyle = computed(() => {
  const { x, y } = props.slot.position
  return {
    left: `${x - props.parentPosition.x}px`,
    top: `${y - props.parentPosition.y}px`
  }
})

// 处理点击事件
const handleClick = (e) => {
  e.stopPropagation()
  emit('click', props.slot)
  emit('add-node', props.slot)
}
</script>

<style scoped>
.preset-slot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 5;
}

.slot-connector {
  position: absolute;
  width: 2px;
  height: 30px;
  background-color: #ddd;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.slot-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #1890ff;
  transition: all 0.3s;
}

.slot-icon {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
}

.slot-label {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* 状态样式 */
.preset-slot.empty .slot-indicator {
  background-color: #fff;
  border-color: #1890ff;
}

.preset-slot.occupied .slot-indicator {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.preset-slot.empty:hover .slot-indicator {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.5);
}
</style>