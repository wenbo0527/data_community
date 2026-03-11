<template>
  <div 
    v-if="visible" 
    class="connection-context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div class="menu-item" @click="deleteConnection">
      <Icon icon="trash-2" size="14" />
      <span>删除连接线</span>
    </div>
    <div class="menu-item" @click="restorePreviewLine">
      <Icon icon="refresh-cw" size="14" />
      <span>恢复预览线</span>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-item" @click="closeMenu">
      <Icon icon="x" size="14" />
      <span>取消</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@arco-design/web-vue'

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
  edge: {
    type: Object,
    default: null
  },
  graph: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'close',
  'delete-connection',
  'restore-preview-line'
])

/**
 * 删除连接线
 */
const deleteConnection = () => {
  if (props.edge && props.graph) {
    try {
      // 获取连接线数据
      const edgeData = props.edge.getData() || {}
      const connectionInfo = {
        id: props.edge.id,
        source: props.edge.getSourceCellId(),
        target: props.edge.getTargetCellId(),
        sourcePort: props.edge.getSourcePortId(),
        targetPort: props.edge.getTargetPortId(),
        branchId: edgeData.branchId,
        label: getEdgeLabel(props.edge)
      }
      
      console.log('🗑️ [ConnectionContextMenu] 准备删除连接线:', connectionInfo)
      
      // 删除连接线
      props.graph.removeCell(props.edge)
      
      // 触发删除事件
      emit('delete-connection', connectionInfo)
      
      console.log('✅ [ConnectionContextMenu] 连接线删除成功')
    } catch (error) {
      console.error('❌ [ConnectionContextMenu] 删除连接线失败:', error)
    }
  }
  
  closeMenu()
}

/**
 * 恢复预览线
 */
const restorePreviewLine = () => {
  if (props.edge) {
    try {
      // 获取连接线信息
      const edgeData = props.edge.getData() || {}
      const connectionInfo = {
        id: props.edge.id,
        source: props.edge.getSourceCellId(),
        target: props.edge.getTargetCellId(),
        sourcePort: props.edge.getSourcePortId(),
        targetPort: props.edge.getTargetPortId(),
        branchId: edgeData.branchId,
        label: getEdgeLabel(props.edge)
      }
      
      console.log('🔄 [ConnectionContextMenu] 准备恢复预览线:', connectionInfo)
      
      // 触发恢复预览线事件
      emit('restore-preview-line', connectionInfo)
      
      console.log('✅ [ConnectionContextMenu] 预览线恢复请求已发送')
    } catch (error) {
      console.error('❌ [ConnectionContextMenu] 恢复预览线失败:', error)
    }
  }
  
  closeMenu()
}

/**
 * 获取连接线标签
 */
const getEdgeLabel = (edge) => {
  if (!edge) return ''
  
  try {
    // 获取标签信息 - 优先从 edge.getLabels() 中获取
    const labels = edge.getLabels() || []
    if (labels.length > 0) {
      const labelData = labels[0]
      if (labelData.markup && typeof labelData.markup === 'string') {
        return labelData.markup
      } else if (labelData.attrs && labelData.attrs.text && labelData.attrs.text.text) {
        return labelData.attrs.text.text
      } else if (labelData.attrs && labelData.attrs.label && labelData.attrs.label.text) {
        return labelData.attrs.label.text
      }
    }
    
    // 如果从标签中没有获取到，则从 edgeData 中获取
    const edgeData = edge.getData() || {}
    return edgeData.branchLabel || edgeData.label || ''
  } catch (error) {
    console.warn('获取连接线标签失败:', error)
    return ''
  }
}

/**
 * 关闭菜单
 */
const closeMenu = () => {
  emit('close')
}

/**
 * 处理点击外部区域关闭菜单
 */
const handleClickOutside = (event) => {
  const menu = event.target.closest('.connection-context-menu')
  if (!menu) {
    closeMenu()
  }
}

/**
 * 处理ESC键关闭菜单
 */
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
  font-size: 14px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
}

.menu-item:hover {
  background-color: #f3f4f6;
}

.menu-item:active {
  background-color: #e5e7eb;
}

.menu-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
}

.menu-item span {
  color: #374151;
  font-weight: 500;
}

.menu-item:hover span {
  color: #111827;
}
</style>