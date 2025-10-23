<template>
  <div 
    v-if="visible" 
    class="connection-context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div class="menu-item" @click="handleDeleteConnection">
      <icon-delete class="menu-icon" />
      <span>删除连接线</span>
    </div>
    <div class="menu-item" @click="handleEditConnection">
      <icon-edit class="menu-icon" />
      <span>编辑连接</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" @click="handleViewDetails">
      <icon-eye class="menu-icon" />
      <span>查看详情</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IconDelete, IconEdit, IconEye } from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  connectionData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'delete-connection',
  'edit-connection', 
  'view-details',
  'close'
])

// 处理删除连接线
const handleDeleteConnection = () => {
  console.log('删除连接线:', props.connectionData)
  emit('delete-connection', props.connectionData)
  emit('close')
}

// 处理编辑连接
const handleEditConnection = () => {
  console.log('编辑连接:', props.connectionData)
  emit('edit-connection', props.connectionData)
  emit('close')
}

// 处理查看详情
const handleViewDetails = () => {
  console.log('查看连接详情:', props.connectionData)
  emit('view-details', props.connectionData)
  emit('close')
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (props.visible) {
    emit('close')
  }
}

// 监听键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.connection-context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 140px;
  font-size: 14px;
  user-select: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:active {
  background-color: #e6f7ff;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #666;
}

.menu-item:hover .menu-icon {
  color: #1890ff;
}

.menu-divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 4px 0;
}

/* 删除按钮特殊样式 */
.menu-item:first-child:hover {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.menu-item:first-child:hover .menu-icon {
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .connection-context-menu {
    min-width: 120px;
    font-size: 13px;
  }
  
  .menu-item {
    padding: 10px 12px;
  }
  
  .menu-icon {
    font-size: 14px;
  }
}
</style>