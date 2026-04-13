<template>
  <div 
    v-if="visible" 
    class="node-toolbar"
    :style="{
      position: 'absolute',
      left: position.x + 'px',
      top: position.y + 'px',
      zIndex: 1000
    }"
  >
    <div class="toolbar-content">
      <a-button-group size="small">
        <a-button @click="handleEdit">
          <template #icon>
            <IconEdit />
          </template>
          编辑
        </a-button>
        <a-button @click="handleCopy">
          <template #icon>
            <IconCopy />
          </template>
          复制
        </a-button>
        <a-button @click="handleDelete" status="danger">
          <template #icon>
            <IconDelete />
          </template>
          删除
        </a-button>
      </a-button-group>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconEdit, IconCopy, IconDelete } from '@arco-design/web-vue/es/icon'

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  nodeId: {
    type: String,
    default: ''
  }
})

// Emits定义
const emit = defineEmits([
  'edit',
  'copy', 
  'delete',
  'close'
])

// 事件处理
const handleEdit = () => {
  emit('edit', props.nodeId)
  emit('close')
}

const handleCopy = () => {
  emit('copy', props.nodeId)
  emit('close')
}

const handleDelete = () => {
  emit('delete', props.nodeId)
  emit('close')
}
</script>

<style scoped>
.node-toolbar {
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.toolbar-content {
  display: flex;
  align-items: center;
}

.node-toolbar :deep(.arco-btn-group) {
  display: flex;
}

.node-toolbar :deep(.arco-btn) {
  border-radius: 4px;
  margin-right: 4px;
}

.node-toolbar :deep(.arco-btn:last-child) {
  margin-right: 0;
}
</style>