<template>
  <div 
    v-if="visible" 
    class="node-type-selector"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px'
    }"
    @click.stop
  >
    <div class="selector-header">
      <span>选择节点类型</span>
      <button class="close-btn" @click="handleClose">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 4.586L10.293.293a1 1 0 011.414 1.414L7.414 6l4.293 4.293a1 1 0 01-1.414 1.414L6 7.414l-4.293 4.293a1 1 0 01-1.414-1.414L4.586 6 .293 1.707A1 1 0 011.707.293L6 4.586z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    
    <div class="node-types-grid">
      <div 
        v-for="nodeType in availableNodeTypes" 
        :key="nodeType.type"
        class="node-type-item"
        :style="{ backgroundColor: nodeType.color + '20', borderColor: nodeType.color }"
        @click="handleNodeTypeSelect(nodeType.type)"
      >
        <div 
          class="node-preview"
          :style="{ backgroundColor: nodeType.color }"
        ></div>
        <span class="node-label">{{ nodeType.label }}</span>
      </div>
    </div>
  </div>
  
  <!-- 遮罩层 -->
  <div 
    v-if="visible" 
    class="selector-overlay"
    @click="handleClose"
  ></div>
</template>

<script setup>
import { computed } from 'vue'
import { nodeTypes } from '../../utils/nodeTypes'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  sourceNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'node-type-selected', 'close'])

// 获取可用的节点类型（排除开始节点，并根据预设位过滤）
const availableNodeTypes = computed(() => {
  let filteredTypes = Object.entries(nodeTypes)
    .filter(([type]) => type !== 'start')
  
  // 如果源节点有allowedTypes限制，则进行过滤
  if (props.sourceNode?.allowedTypes && Array.isArray(props.sourceNode.allowedTypes)) {
    filteredTypes = filteredTypes.filter(([type]) => 
      props.sourceNode.allowedTypes.includes(type)
    )
  }
  
  return filteredTypes.map(([type, config]) => ({
    type,
    ...config
  }))
})

// 处理节点类型选择
const handleNodeTypeSelect = (nodeType) => {
  emit('node-type-selected', {
    nodeType,
    sourceNode: props.sourceNode
  })
  handleClose()
}

// 关闭选择器
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
.node-type-selector {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8e8e8;
  min-width: 280px;
  max-width: 400px;
  max-height: 500px;
  overflow: hidden;
}

.selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
  font-weight: 500;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.node-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.node-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.node-type-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.node-preview {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-bottom: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.node-label {
  font-size: 12px;
  color: #333;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}

/* 滚动条样式 */
.node-types-grid::-webkit-scrollbar {
  width: 6px;
}

.node-types-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.node-types-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.node-types-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>