<template>
  <div 
    class="workflow-node"
    :class="{
      'node-selected': isSelected,
      'node-hover': isHover,
      [`node-${nodeData.type.toLowerCase()}`]: true
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onNodeClick"
  >
    <!-- 节点主体 -->
    <div class="node-body">
      <!-- 节点图标 -->
      <div class="node-icon">
        <component :is="getNodeIcon(nodeData.type)" />
      </div>
      
      <!-- 节点信息 -->
      <div class="node-info">
        <div class="node-name">{{ nodeData.name }}</div>
        <div class="node-type">{{ getNodeTypeName(nodeData.type) }}</div>
      </div>
      
      <!-- 节点状态指示器 -->
      <div 
        class="node-status"
        :class="`status-${nodeData.status || 'default'}`"
      ></div>
      
      <!-- 删除按钮 -->
      <div 
        v-if="isHover && nodeData.type !== 'INPUT'"
        class="delete-button"
        @click.stop="onDeleteNode"
        title="删除节点"
      >
        <icon-close />
      </div>
    </div>
    
    <!-- 添加下游节点按钮 -->
    <div 
      v-if="canAddDownstream && (isHover || plusMenuVisible)"
      class="plus-button-container"
    >
      <a-dropdown 
        v-model:popup-visible="plusMenuVisible"
        trigger="click"
        position="bottom"
        popup-container="body"
      >
        <div 
          class="plus-button" 
          @click.stop="onPlusButtonClick"
          :class="{ 'plus-button-active': plusMenuVisible }"
        >
          <icon-plus />
        </div>
        <template #content>
          <div class="plus-menu">
            <div class="menu-title">添加下游节点</div>
            <div class="menu-items">
              <div
                v-for="item in availableNodeTypes"
                :key="item.type"
                class="menu-item"
                @click="onMenuItemClick(item.type)"
              >
                <div class="item-icon">
                  <img 
                    :src="getNodeTypeLogo(item.type)" 
                    :alt="item.name"
                    class="node-mini-logo"
                  />
                </div>
                <span class="item-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </a-dropdown>
    </div>
    
    <!-- 连接桩 -->
    <div 
      v-if="showPorts"
      class="node-ports"
    >
      <!-- 输入端口 -->
      <div 
        v-if="hasInputPort"
        class="port port-input"
        :class="{ 'port-visible': isHover || isConnecting }"
      ></div>
      
      <!-- 输出端口 -->
      <div 
        v-if="hasOutputPort"
        class="port port-output"
        :class="{ 'port-visible': isHover || isConnecting }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue';
import { IconPlus, IconClose } from '@arco-design/web-vue/es/icon';
import { Dropdown as ADropdown } from '@arco-design/web-vue';
import { 
  NodeType, 
  PROCESSING_TYPE_LIST, 
  NODE_TYPE_LOGO,
  getNodeTypeName,
  getNodeTypeIcon
} from '../../utils/workflowNodeTypes.js';
import { createDownstreamNode } from '../../utils/workflowNodeCreator.js';
import { consoleLogger } from '../../utils/consoleLogger.js';

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

// 调试日志：组件setup开始
consoleLogger.info('[WorkflowNode] 组件setup开始执行，节点ID:', props.node?.id)

// 注入graph实例
const graph = inject('graph', ref(null));
const selectedNodeId = inject('selectedNodeId', ref(null));
const setSelectedNode = inject('setSelectedNode', () => {});

// 调试日志：inject执行完成
consoleLogger.info('[WorkflowNode] inject执行完成')
consoleLogger.info('[WorkflowNode] 注入的graph:', graph)
consoleLogger.info('[WorkflowNode] graph.value:', graph?.value)
consoleLogger.info('[WorkflowNode] graph类型:', typeof graph?.value)
consoleLogger.info('[WorkflowNode] graph是否有效:', !!graph?.value)

// 响应式数据
const isHover = ref(false);
const plusMenuVisible = ref(false);
const isConnecting = ref(false);

// 计算属性
const nodeData = computed(() => props.node.getData() || {});

const isSelected = computed(() => {
  return selectedNodeId?.value === props.node.id;
});

const canAddDownstream = computed(() => {
  return nodeData.value.type !== NodeType.OUTPUT;
});

const hasInputPort = computed(() => {
  return nodeData.value.type !== NodeType.INPUT;
});

const hasOutputPort = computed(() => {
  return nodeData.value.type !== NodeType.OUTPUT;
});

const showPorts = computed(() => {
  return hasInputPort.value || hasOutputPort.value;
});

const availableNodeTypes = computed(() => {
  // 根据当前节点类型过滤可用的下游节点类型
  return PROCESSING_TYPE_LIST.filter(item => {
    // 输入节点可以连接所有类型
    if (nodeData.value.type === NodeType.INPUT) {
      return true;
    }
    // 其他节点不能连接输入节点
    return item.type !== NodeType.INPUT;
  });
});

// 方法
const onMouseEnter = () => {
  isHover.value = true;
  showNodePorts();
};

const onMouseLeave = () => {
  isHover.value = false;
  hideNodePorts();
};

const onNodeClick = () => {
  setSelectedNode?.(props.node);
};

const onPlusButtonClick = () => {
  plusMenuVisible.value = !plusMenuVisible.value;
};

const onMenuItemClick = (nodeType) => {
  createDownstream(nodeType);
  plusMenuVisible.value = false;
};

const onDeleteNode = () => {
  if (!graph?.value || !props.node) {
    consoleLogger.warn('[WorkflowNode] 无法删除节点：Graph实例或节点不存在');
    return;
  }

  try {
    consoleLogger.info('[WorkflowNode] 开始删除节点:', props.node.id);
    
    // 获取与该节点相关的所有边
    const connectedEdges = graph.value.getConnectedEdges(props.node);
    consoleLogger.info('[WorkflowNode] 找到相关边:', connectedEdges.length);
    
    // 删除所有相关的边
    connectedEdges.forEach(edge => {
      graph.value.removeEdge(edge);
      consoleLogger.info('[WorkflowNode] 删除边:', edge.id);
    });
    
    // 删除节点
    graph.value.removeNode(props.node);
    consoleLogger.info('[WorkflowNode] 节点删除成功:', props.node.id);
    
  } catch (error) {
    consoleLogger.error('[WorkflowNode] 删除节点时发生错误:', error);
  }
};

// 监听graph实例变化
watch(
  () => graph?.value,
  (newGraph, oldGraph) => {
    consoleLogger.info('[WorkflowNode] graph实例发生变化')
    consoleLogger.info('- 旧graph:', oldGraph)
    consoleLogger.info('- 新graph:', newGraph)
    consoleLogger.info('- 新graph类型:', typeof newGraph)
    consoleLogger.info('- 新graph是否有效:', !!newGraph)
  },
  { immediate: true }
)

// 存储待执行的操作队列
const pendingOperations = ref([])

// 简化的graph监听机制
const checkAndExecutePendingOperations = () => {
  if (graph?.value && pendingOperations.value.length > 0) {
    consoleLogger.info('[WorkflowNode] Graph实例已可用，执行待处理操作')
    const operations = [...pendingOperations.value]
    pendingOperations.value = []
    
    operations.forEach(operation => {
      operation()
    })
  }
}

// 定期检查graph实例状态
let graphCheckInterval = null

const createDownstream = (type) => {
  consoleLogger.group('[WorkflowNode] createDownstream函数执行')
  consoleLogger.info('目标节点类型:', type)
  consoleLogger.info('当前节点:', props.node?.id)
  
  // 检查graph实例是否可用
  if (!graph?.value) {
    consoleLogger.warn('[WorkflowNode] Graph实例尚未初始化，将操作加入待处理队列')
    
    // 将操作加入待处理队列
    pendingOperations.value.push(() => {
      consoleLogger.info('[WorkflowNode] 从队列执行createDownstream操作')
      executeCreateDownstream(type)
    })
    
    consoleLogger.groupEnd()
    return;
  }

  executeCreateDownstream(type)
  consoleLogger.groupEnd()
};

const executeCreateDownstream = (type) => {
  try {
    consoleLogger.info('[WorkflowNode] 开始创建下游节点')
    const result = createDownstreamNode(props.node, type, graph.value);
    if (result.node && result.edge) {
      consoleLogger.info('[WorkflowNode] 成功创建下游节点:', result);
      // 可以在这里添加成功创建的回调
    } else {
      consoleLogger.warn('[WorkflowNode] 创建下游节点失败，结果:', result);
    }
  } catch (error) {
    consoleLogger.error('[WorkflowNode] 创建下游节点时发生错误:', error);
  }
};

const showNodePorts = () => {
  if (!props.node) return;
  
  // 获取该节点下的所有连接桩
  const ports = props.node.getPorts() || [];
  ports.forEach((port) => {
    props.node.setPortProp(port.id, 'attrs/circle', {
      fill: '#fff',
      stroke: '#85A5FF',
      strokeWidth: 2,
      r: 4,
      opacity: 1
    });
  });
};

const hideNodePorts = () => {
  if (!props.node || isConnecting.value) return;
  
  // 获取该节点下的所有连接桩
  const ports = props.node.getPorts() || [];
  ports.forEach((port) => {
    props.node.setPortProp(port.id, 'attrs/circle', {
      fill: 'transparent',
      stroke: 'transparent',
      opacity: 0
    });
  });
};

const getNodeIcon = (type) => {
  return getNodeTypeIcon(type);
};

const getNodeTypeLogo = (type) => {
  return NODE_TYPE_LOGO[type] || '';
};

// 监听graph实例的变化
watch(graph, (newGraph) => {
  consoleLogger.info('[WorkflowNode] Graph实例发生变化:', {
    newGraph: newGraph,
    graphValid: !!newGraph,
    nodeId: props.node?.id
  })
  
  if (newGraph) {
    consoleLogger.info('[WorkflowNode] Graph实例已可用，执行待处理操作')
    checkAndExecutePendingOperations()
  }
}, { immediate: true })

// 组件生命周期日志跟踪
onMounted(() => {
  consoleLogger.info('[WorkflowNode] 组件已挂载，节点ID:', props.node?.id)
  consoleLogger.info('[WorkflowNode] 挂载时graph状态:', {
    graph: graph,
    graphValue: graph?.value,
    graphType: typeof graph?.value,
    graphValid: !!graph?.value
  })
})

// 暴露方法给父组件
defineExpose({
  showPorts: showNodePorts,
  hidePorts: hideNodePorts,
  setConnecting: (connecting) => {
    isConnecting.value = connecting;
  }
});
</script>

<style scoped>
.workflow-node {
  position: relative;
  width: 120px;
  height: 60px;
  border-radius: 6px;
  border: 2px solid #d9d9d9;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  overflow: visible;
}

.workflow-node:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(64, 169, 255, 0.15);
  transform: translateY(-1px);
}

.workflow-node.node-selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2), 0 4px 12px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
}

.workflow-node.node-hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(64, 169, 255, 0.15);
}

.node-body {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  height: 100%;
  position: relative;
}

.node-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
  color: #1890ff;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
  line-height: 1.2;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-type {
  font-size: 10px;
  color: #86909c;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: absolute;
  top: 6px;
  right: 6px;
}

.delete-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
  border: 2px solid #fff;
  z-index: 15;
  opacity: 0;
}

.workflow-node:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: #ff7875;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.status-default {
  background: #d9d9d9;
}

.status-success {
  background: #52c41a;
}

.status-error {
  background: #f5222d;
}

.status-running {
  background: #1890ff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.plus-button-container {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 15;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.workflow-node:hover .plus-button-container,
.plus-button-container:has(.plus-button-active) {
  opacity: 1;
}

.plus-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  border: 2px solid #fff;
}

.plus-button:hover {
  background: #40a9ff;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.plus-button-active {
  background: #1890ff !important;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.plus-menu {
  min-width: 180px;
  padding: 8px 0;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: menuSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-title {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #86909c;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

.menu-items {
  max-height: 200px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #1890ff;
  transform: translateX(2px);
}

.menu-item:active {
  background-color: #e6f7ff;
}

.item-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-mini-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.item-name {
  font-size: 12px;
  color: #1d2129;
}

.node-ports {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.port {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #1890ff;
  background: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

.port-visible {
  opacity: 1;
}

.port-input {
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.port-output {
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
}

/* 节点类型特定样式 - 简化为3种类型 */
.node-input {
  border-color: #1890ff;
}

.node-input .node-icon {
  color: #1890ff;
}

.node-processing {
  border-color: #52c41a;
}

.node-processing .node-icon {
  color: #52c41a;
}

.node-output {
  border-color: #f5222d;
}

.node-output .node-icon {
  color: #f5222d;
}
</style>