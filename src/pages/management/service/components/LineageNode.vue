<template>
  <div class="lineage-node" :class="nodeClass">
    <div class="node-header">
      <component :is="iconComponent" class="node-icon" />
      <span class="node-title" :title="nodeData.label">{{ nodeData.label }}</span>
    </div>
    <div class="node-content">
      <div v-if="nodeData.type === 'main'" class="node-tag main-tag">主节点</div>
      <div v-else-if="nodeData.type === 'upstream'" class="node-tag upstream-tag">上游</div>
      <div v-else-if="nodeData.type === 'downstream'" class="node-tag downstream-tag">下游</div>
      
      <div class="node-info">
        <div class="info-row" v-if="nodeData.dbName">
          <span class="label">库名:</span>
          <span class="value">{{ nodeData.dbName }}</span>
        </div>
        <div class="info-row" v-if="nodeData.owner">
          <span class="label">负责人:</span>
          <span class="value">{{ nodeData.owner }}</span>
        </div>
      </div>
    </div>

    <!-- 展开按钮 -->
    <div 
      v-if="showLeftExpand" 
      class="expand-btn left" 
      @click.stop="handleExpand('left')"
      title="展开上游"
    >
      <icon-plus />
    </div>
    <div 
      v-if="showRightExpand" 
      class="expand-btn right" 
      @click.stop="handleExpand('right')"
      title="展开下游"
    >
      <icon-plus />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { IconApps, IconArrowLeft, IconArrowRight, IconStorage, IconPlus } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 注入 Graph 实例的方法（需要在父组件 provide）
const expandNode = inject('expandNode', () => {})

// 获取节点数据
const getNodeData = () => {
  return props.node.getData() || {}
}

const nodeData = ref(getNodeData())

// 监听数据变化
onMounted(() => {
  props.node.on('change:data', () => {
    nodeData.value = getNodeData()
  })
})

const nodeClass = computed(() => {
  return {
    'is-main': nodeData.value.type === 'main',
    'is-upstream': nodeData.value.type === 'upstream',
    'is-downstream': nodeData.value.type === 'downstream',
    'is-selected': props.node.isSelected?.()
  }
})

const iconComponent = computed(() => {
  switch (nodeData.value.type) {
    case 'upstream': return IconArrowLeft
    case 'downstream': return IconArrowRight
    case 'main': return IconStorage
    default: return IconApps
  }
})

// 按钮显示逻辑
const showLeftExpand = computed(() => {
  const { type, upstreamExpanded } = nodeData.value
  // 主节点或上游节点可以展开左侧，且未展开过
  return (type === 'main' || type === 'upstream') && !upstreamExpanded
})

const showRightExpand = computed(() => {
  const { type, downstreamExpanded } = nodeData.value
  // 主节点或下游节点可以展开右侧，且未展开过
  return (type === 'main' || type === 'downstream') && !downstreamExpanded
})

const handleExpand = (direction) => {
  const data = getNodeData()
  props.node.setData({ ...data, __expandAction: direction })
  expandNode(props.node.id, direction)
}
</script>

<style scoped>
.lineage-node {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: visible; /* 允许按钮超出 */
  transition: all 0.2s;
  position: relative;
}

.expand-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: #fff;
  border: 1px solid #165dff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #165dff;
  font-size: 12px;
  z-index: 10;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #165dff;
  color: #fff;
  transform: translateY(-50%) scale(1.1);
}

.expand-btn.left {
  left: -10px;
}

.expand-btn.right {
  right: -10px;
}

.lineage-node:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.lineage-node.is-selected {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.node-header {
  padding: 8px 12px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  font-size: 16px;
  color: #86909c;
}

.node-title {
  font-weight: 600;
  color: #1d2129;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.node-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  width: fit-content;
}

.main-tag {
  background: #e8f3ff;
  color: #165dff;
  border: 1px solid #b7ccff;
}

.upstream-tag {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.downstream-tag {
  background: #e8ffea;
  color: #00b42a;
  border: 1px solid #aff0b5;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4e5969;
}

.info-row {
  display: flex;
  gap: 8px;
}

.label {
  color: #86909c;
  min-width: 40px;
}

.value {
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Specific styles for node types */
.lineage-node.is-main {
  border-color: #165dff;
}

.lineage-node.is-main .node-header {
  background: #e8f3ff;
}

.lineage-node.is-main .node-icon {
  color: #165dff;
}
</style>
