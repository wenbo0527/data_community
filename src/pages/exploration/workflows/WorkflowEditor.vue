<template>
  <div class="workflow-editor">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon><IconArrowLeft /></template>
          返回
        </a-button>
        <div class="workflow-info">
          <h3>{{ workflow?.name || '工作流编辑器' }}</h3>
          <a-tag color="blue">v{{ currentVersion }}</a-tag>
        </div>
      </div>
      
      <div class="header-center">
        <div class="editor-actions">
          <a-button type="text" :disabled="!canUndo" @click="undo">
            <template #icon><IconUndo /></template>
          </a-button>
          <a-button type="text" :disabled="!canRedo" @click="redo">
            <template #icon><IconRedo /></template>
          </a-button>
        </div>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-button type="outline" @click="toggleDebugPanel">
            <template #icon><IconPlayArrow /></template>
            调试运行
          </a-button>
          <a-button type="primary" :loading="saving" @click="saveWorkflow">
            <template #icon><IconSave /></template>
            保存
          </a-button>
          <a-dropdown>
            <a-button type="primary">
              发布 <IconDown />
            </a-button>
            <template #content>
              <a-doption @click="showPublishDialog">
                <template #icon><IconCheck /></template>
                发布流程
              </a-doption>
              <a-doption @click="archiveWorkflow">
                <template #icon><IconArchive /></template>
                归档流程
              </a-doption>
              <a-doption @click="showVersionHistory">
                <template #icon><IconHistory /></template>
                版本历史
              </a-doption>
              <a-doption @click="createNewVersion">
                <template #icon><IconBranch /></template>
                创建新版本
              </a-doption>
            </template>
          </a-dropdown>
          <a-button type="outline" @click="showPublishDialog">
            <template #icon><IconSettings /></template>
            发布设置
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- 工具栏面板 -->
      <div class="toolbar-panel">
        <div class="panel-header">
          <span class="panel-title">节点工具箱</span>
        </div>
        <div class="panel-content">
          <div class="node-categories">
            <div class="category-section">
              <h4 class="category-title">基础节点</h4>
              <div class="node-items">
                <div 
                  v-for="nodeType in availableNodeTypes" 
                  :key="nodeType.type"
                  class="node-item"
                  :draggable="true"
                  @dragstart="onNodeDragStart($event, nodeType)"
                  @dragend="onNodeDragEnd"
                >
                  <div class="node-item-icon">
                    <img 
                      :src="getNodeTypeLogo(nodeType.type)" 
                      :alt="nodeType.name"
                      class="node-logo"
                    />
                  </div>
                  <div class="node-item-info">
                    <div class="node-item-name">{{ nodeType.name }}</div>
                    <div class="node-item-desc">{{ nodeType.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 画布区域 -->
      <div class="canvas-container" :class="{ 'full-width': !showPropertyPanel }">
        <div 
          ref="canvasRef" 
          class="canvas"
          @dragover="onCanvasDragOver"
          @drop="onCanvasDrop"
        ></div>
      </div>
      
      <!-- 属性面板 -->
      <div v-if="showPropertyPanel" class="property-panel">
        <div class="panel-header">
          <span class="panel-title">属性配置</span>
          <a-button type="text" size="small" @click="showPropertyPanel = false">
            <template #icon><IconClose /></template>
          </a-button>
        </div>
        <div class="panel-content">
          <div v-if="!selectedNode" class="no-selection">
            <IconInfoCircle :size="32" style="color: #86909c;" />
            <p>请选择一个节点进行配置</p>
          </div>
          <div v-else class="node-properties">
            <!-- 节点基本信息 -->
            <a-collapse :default-active-key="['basic']">
              <a-collapse-item header="基本信息" key="basic">
                <a-form :model="selectedNode" layout="vertical">
                  <a-form-item label="节点名称">
                    <a-input v-model="selectedNode.label" placeholder="请输入节点名称" />
                  </a-form-item>
                  <a-form-item label="节点类型">
                    <a-input :model-value="selectedNode.type" readonly />
                  </a-form-item>
                </a-form>
              </a-collapse-item>
            </a-collapse>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 调试面板 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <span class="debug-title">调试面板</span>
        <a-button type="text" size="small" @click="showDebugPanel = false">
          <template #icon><IconClose /></template>
        </a-button>
      </div>
      <div class="debug-content">
        <a-tabs default-active-key="logs">
          <a-tab-pane key="logs" title="执行日志">
            <div class="debug-logs">
              <div v-if="debugLogs.length === 0" class="no-logs">
                <p>暂无调试日志</p>
              </div>
              <div v-else>
                <div v-for="(log, index) in debugLogs" :key="index" class="log-item" :class="log.level">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-level">{{ log.level.toUpperCase() }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="results" title="执行结果">
            <div class="debug-results">
              <div v-if="Object.keys(debugResults).length === 0" class="no-results">
                <p>暂无执行结果</p>
              </div>
              <div v-else>
                <div v-for="(result, nodeId) in debugResults" :key="nodeId" class="result-item">
                  <h4>节点: {{ nodeId }}</h4>
                  <pre>{{ JSON.stringify(result, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>

  <!-- 版本历史弹窗 -->
  <a-modal
    v-model:visible="showVersionHistoryModal"
    title="版本历史"
    width="800px"
    :footer="false"
  >
    <div class="version-history">
      <div class="version-list">
        <div 
          v-for="version in versionHistory" 
          :key="version.id"
          class="version-item"
          :class="{ active: version.version === currentVersion }"
        >
          <div class="version-header">
            <div class="version-info">
              <h4>{{ version.version }}</h4>
              <a-tag :color="version.status === 'published' ? 'green' : 'orange'">
                {{ version.status === 'published' ? '已发布' : '草稿' }}
              </a-tag>
            </div>
            <div class="version-actions">
              <a-button type="text" size="small" @click="compareVersion(version.id)">
                比较
              </a-button>
              <a-button type="text" size="small" @click="revertToVersion(version.id)">
                恢复
              </a-button>
            </div>
          </div>
          <div class="version-details">
            <p class="version-description">{{ version.description }}</p>
            <div class="version-meta">
              <span>创建者: {{ version.author }}</span>
              <span>创建时间: {{ version.createdAt }}</span>
              <span>修改: {{ version.changes }} 处</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 发布设置弹窗 -->
  <a-modal
    v-model:visible="showPublishModal"
    title="发布设置"
    width="600px"
    @ok="confirmPublish"
    @cancel="cancelPublish"
  >
    <a-form :model="publishSettings" layout="vertical">
      <a-form-item label="发布环境" field="environment">
        <a-select v-model="publishSettings.environment">
          <a-option value="development">开发环境</a-option>
          <a-option value="staging">测试环境</a-option>
          <a-option value="production">生产环境</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="发布说明" field="description">
        <a-textarea 
          v-model="publishSettings.description" 
          placeholder="请输入本次发布的说明..."
          :rows="4"
        />
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model="publishSettings.autoStart">
          发布后自动启动工作流
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model="publishSettings.notifyUsers">
          通知相关用户
        </a-checkbox>
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 创建新版本弹窗 -->
  <a-modal
    v-model:visible="showNewVersionModal"
    title="创建新版本"
    width="500px"
    @ok="confirmCreateVersion"
    @cancel="cancelCreateVersion"
  >
    <a-form :model="newVersionData" layout="vertical">
      <a-form-item label="版本号" field="version" required>
        <a-input 
          v-model="newVersionData.version" 
          placeholder="例如: 1.1.0"
        />
      </a-form-item>
      <a-form-item label="基于版本" field="basedOn">
        <a-select v-model="newVersionData.basedOn" placeholder="选择基础版本">
          <a-option 
            v-for="version in versionHistory" 
            :key="version.id"
            :value="version.version"
          >
            {{ version.version }} - {{ version.description }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="版本说明" field="description">
        <a-textarea 
          v-model="newVersionData.description" 
          placeholder="请输入新版本的说明..."
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Graph, Shape } from '@antv/x6'
import { register as registerVueShape } from '@antv/x6-vue-shape'
import { Message } from '@arco-design/web-vue'
import {
  IconArrowLeft,
  IconUndo,
  IconRedo,
  IconPlayArrow,
  IconSave,
  IconDown,
  IconCheck,
  IconArchive,
  IconInfoCircle,
  IconClose,
  IconHistory,
  IconBranch,
  IconSettings
} from '@arco-design/web-vue/es/icon'
import { WorkflowStorage } from '../../../utils/workflowStorage'
import WorkflowNode from '../../../components/workflow/WorkflowNode.vue'
import { NodeType, PROCESSING_TYPE_LIST, NODE_TYPE_LOGO, getNodeTypeLogo } from '../../../utils/workflowNodeTypes.js'
import { createNode, createEdge } from '../../../utils/workflowNodeCreator.js'
import { consoleLogger } from '../../../utils/consoleLogger.js'

// 注册自定义工作流节点
registerVueShape({
  shape: 'workflow-node',
  width: 200,
  height: 80,
  component: WorkflowNode,
  inherit: 'vue-shape'
})

const route = useRoute()
const router = useRouter()
const canvasRef = ref()

// 响应式数据
const workflow = ref(null)
const graph = ref(null)
const selectedNode = ref(null)
const selectedNodeId = computed(() => selectedNode.value?.id || null)

// 调试日志：setup函数开始
consoleLogger.info('[WorkflowEditor] Setup函数开始执行')
consoleLogger.info('[WorkflowEditor] 初始graph.value状态:', graph.value)

// 依赖注入 - 在setup函数中提供
provide('graph', graph)
provide('selectedNodeId', selectedNodeId)
provide('setSelectedNode', (nodeData) => {
  selectedNode.value = nodeData
})

// 调试日志：provide执行完成
consoleLogger.info('[WorkflowEditor] provide执行完成，当前graph.value:', graph.value)
const showPropertyPanel = ref(true)
const showDebugPanel = ref(false)
const debugging = ref(false)
const saving = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const debugLogs = ref([])
const debugResults = ref({})

// 版本管理和发布相关数据
const showVersionHistoryModal = ref(false)
const showPublishModal = ref(false)
const showNewVersionModal = ref(false)
const versionHistory = ref([])
const currentVersion = ref('1.0.0')
const publishSettings = ref({
  environment: 'production',
  description: '',
  autoStart: false,
  notifyUsers: true
})
const newVersionData = ref({
  version: '',
  description: '',
  basedOn: ''
})

// 拖拽相关数据
const draggedNodeType = ref(null)
const availableNodeTypes = computed(() => {
  return PROCESSING_TYPE_LIST.map(item => ({
    ...item,
    description: getNodeTypeDescription(item.type)
  }))
})

// 获取节点类型描述
const getNodeTypeDescription = (type) => {
  const descriptions = {
    'start': '流程开始节点',
    'end': '流程结束节点',
    'condition': '条件判断节点',
    'action': '执行动作节点',
    'delay': '延时等待节点'
  }
  return descriptions[type] || '处理节点'
}

// 方法
const goBack = () => {
  router.push('/exploration/workflows')
}

const undo = () => {
  if (graph.value && canUndo.value) {
    graph.value.undo()
  }
}

const redo = () => {
  if (graph.value && canRedo.value) {
    graph.value.redo()
  }
}

const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
}

const saveWorkflow = async () => {
  saving.value = true
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('工作流保存成功')
  } catch (error) {
    Message.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

const archiveWorkflow = () => {
  Message.info('归档功能开发中...')
}

// 版本管理方法
const showVersionHistory = () => {
  // 模拟加载版本历史数据
  versionHistory.value = [
    {
      id: '1',
      version: '1.0.0',
      description: '初始版本',
      author: '张三',
      createdAt: '2024-01-15 10:30:00',
      status: 'published',
      changes: 5
    },
    {
      id: '2', 
      version: '1.1.0',
      description: '添加数据清洗功能',
      author: '李四',
      createdAt: '2024-01-20 14:20:00',
      status: 'draft',
      changes: 3
    }
  ]
  showVersionHistoryModal.value = true
}

const showPublishDialog = () => {
  publishSettings.value = {
    environment: 'production',
    description: '',
    autoStart: false,
    notifyUsers: true
  }
  showPublishModal.value = true
}

const createNewVersion = () => {
  newVersionData.value = {
    version: '',
    description: '',
    basedOn: currentVersion.value
  }
  showNewVersionModal.value = true
}

const compareVersion = (versionId) => {
  Message.info(`比较版本 ${versionId} 功能开发中...`)
}

const revertToVersion = (versionId) => {
  Message.info(`恢复到版本 ${versionId} 功能开发中...`)
}

const confirmPublish = async () => {
  if (!publishSettings.value.description.trim()) {
    Message.warning('请填写发布说明')
    return
  }
  
  try {
    // 模拟发布过程
    Message.loading('正在发布...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    Message.success('发布成功!')
    showPublishModal.value = false
    
    // 更新版本历史
    const newVersion = {
      id: Date.now().toString(),
      version: currentVersion.value,
      description: publishSettings.value.description,
      author: '当前用户',
      createdAt: new Date().toLocaleString(),
      status: 'published',
      changes: Math.floor(Math.random() * 10) + 1
    }
    versionHistory.value.unshift(newVersion)
    
    if (publishSettings.value.autoStart) {
      Message.info('工作流已自动启动')
    }
    
    if (publishSettings.value.notifyUsers) {
      Message.info('已通知相关用户')
    }
  } catch (error) {
    Message.error('发布失败: ' + error.message)
  }
}

const cancelPublish = () => {
  showPublishModal.value = false
}

const confirmCreateVersion = async () => {
  if (!newVersionData.value.version.trim()) {
    Message.warning('请填写版本号')
    return
  }
  
  // 检查版本号是否已存在
  const existingVersion = versionHistory.value.find(v => v.version === newVersionData.value.version)
  if (existingVersion) {
    Message.warning('版本号已存在，请使用其他版本号')
    return
  }
  
  try {
    // 模拟创建新版本
    Message.loading('正在创建新版本...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newVersion = {
      id: Date.now().toString(),
      version: newVersionData.value.version,
      description: newVersionData.value.description || '新版本',
      author: '当前用户',
      createdAt: new Date().toLocaleString(),
      status: 'draft',
      changes: 0
    }
    
    versionHistory.value.unshift(newVersion)
    currentVersion.value = newVersionData.value.version
    
    Message.success('新版本创建成功!')
    showNewVersionModal.value = false
  } catch (error) {
    Message.error('创建版本失败: ' + error.message)
  }
}

const cancelCreateVersion = () => {
  showNewVersionModal.value = false
}

// 拖拽相关方法
const onNodeDragStart = (event, nodeType) => {
  consoleLogger.info('[WorkflowEditor] 开始拖拽节点:', nodeType)
  draggedNodeType.value = nodeType
  
  // 设置拖拽数据
  event.dataTransfer.setData('application/json', JSON.stringify(nodeType))
  event.dataTransfer.effectAllowed = 'copy'
  
  // 添加拖拽样式
  event.target.style.opacity = '0.5'
}

const onNodeDragEnd = (event) => {
  consoleLogger.info('[WorkflowEditor] 拖拽结束')
  draggedNodeType.value = null
  
  // 恢复样式
  event.target.style.opacity = '1'
}

const onCanvasDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const onCanvasDrop = (event) => {
  event.preventDefault()
  
  try {
    const nodeTypeData = JSON.parse(event.dataTransfer.getData('application/json'))
    consoleLogger.info('[WorkflowEditor] 在画布上放置节点:', nodeTypeData)
    
    if (!graph.value) {
      consoleLogger.error('[WorkflowEditor] Graph实例不存在，无法创建节点')
      Message.error('画布未初始化，请稍后再试')
      return
    }
    
    // 获取放置位置（相对于画布的坐标）
    const canvasRect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - canvasRect.left
    const y = event.clientY - canvasRect.top
    
    // 转换为画布坐标
    const position = graph.value.clientToLocal({ x, y })
    
    consoleLogger.info('[WorkflowEditor] 节点放置位置:', position)
    
    // 创建节点
    createNodeOnCanvas(nodeTypeData, position)
    
  } catch (error) {
    consoleLogger.error('[WorkflowEditor] 处理拖拽放置时发生错误:', error)
    Message.error('创建节点失败')
  }
}

const createNodeOnCanvas = (nodeTypeData, position) => {
  try {
    const nodeConfig = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeTypeData.type,
      name: nodeTypeData.name,
      position: {
        x: position.x - 100, // 节点宽度的一半
        y: position.y - 40   // 节点高度的一半
      }
    }
    
    consoleLogger.info('[WorkflowEditor] 创建节点配置:', nodeConfig)
    
    const node = createNode(graph.value, nodeConfig)
    
    if (node) {
      consoleLogger.info('[WorkflowEditor] 节点创建成功:', node.id)
      Message.success(`${nodeTypeData.name} 节点创建成功`)
    } else {
      consoleLogger.error('[WorkflowEditor] 节点创建失败')
      Message.error('节点创建失败')
    }
    
  } catch (error) {
    consoleLogger.error('[WorkflowEditor] 创建节点时发生错误:', error)
    Message.error('创建节点失败: ' + error.message)
  }
}

const initGraph = () => {
  consoleLogger.info('[WorkflowEditor] initGraph函数开始执行')
  
  if (!canvasRef.value) {
    consoleLogger.error('[WorkflowEditor] canvasRef.value为空，无法初始化Graph')
    return
  }
  
  consoleLogger.info('[WorkflowEditor] 开始创建Graph实例')
  
  graph.value = new Graph({
    container: canvasRef.value,
    width: canvasRef.value.offsetWidth,
    height: canvasRef.value.offsetHeight,
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee',
          thickness: 1
        },
        {
          color: '#ddd',
          thickness: 1,
          factor: 4
        }
      ]
    },
    history: true,
    clipboard: true,
    keyboard: true,
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta']
    },
    scroller: {
      enabled: true,
      pannable: true,
      pageVisible: false,
      pageBreak: false
    },
    // 启用拖拽功能
    panning: {
      enabled: true,
      modifiers: 'shift'
    },
    // 启用连接功能
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#165dff',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
    // 启用选择功能
    selecting: {
      enabled: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
    },
    // 启用调整大小
    resizing: {
      enabled: true,
    },
    // 启用旋转
    rotating: {
      enabled: false,
    },
  })
  
  consoleLogger.info('[WorkflowEditor] Graph实例创建成功:', graph.value)
  consoleLogger.info('[WorkflowEditor] Graph实例类型:', typeof graph.value)
  consoleLogger.info('[WorkflowEditor] Graph实例是否有效:', !!graph.value)
  
  // 设置全局Graph实例，供WorkflowNode组件使用
  window.workflowGraph = graph.value
  consoleLogger.info('[WorkflowEditor] Graph实例已设置到window.workflowGraph')
  
  // 绑定事件
  bindGraphEvents()
  
  // 加载工作流数据
  loadWorkflowData()
  
  consoleLogger.info('[WorkflowEditor] initGraph函数执行完成，最终graph.value:', graph.value)
}

const bindGraphEvents = () => {
  if (!graph.value) return
  
  // 节点选择事件
  graph.value.on('node:click', ({ node }) => {
    const nodeData = node.getData() || {}
    selectedNode.value = {
      id: node.id,
      type: nodeData.type || 'unknown',
      label: nodeData.name || nodeData.label || '',
      config: nodeData.config || {}
    }
  })
  
  // 画布点击事件
  graph.value.on('blank:click', () => {
    selectedNode.value = null
  })
  
  // 历史记录变化
  graph.value.on('history:change', () => {
    canUndo.value = graph.value.canUndo()
    canRedo.value = graph.value.canRedo()
  })
}

const loadWorkflowData = () => {
  // 模拟加载工作流数据
  workflow.value = {
    id: route.params.id || 'new',
    name: '数据处理工作流',
    description: '示例工作流',
    nodes: [],
    edges: []
  }
  
  // 如果是空工作流，自动添加数据输入节点作为起始节点
  if (workflow.value.nodes.length === 0) {
    addDefaultInputNode()
  }
}

// 添加默认数据输入节点
const addDefaultInputNode = () => {
  if (!graph.value) return
  
  const inputNodeId = 'input-node-1'
  const inputNode = {
    id: inputNodeId,
    shape: 'workflow-node',
    x: 100,
    y: 200,
    width: 180,
    height: 60,
    data: {
      type: 'INPUT',
      name: '数据输入',
      config: {
        sourceType: 'file',
        description: '数据源输入节点'
      }
    },
    ports: [
      {
        id: `${inputNodeId}-out`,
        group: 'out'
      }
    ]
  }
  
  // 添加节点到画布
  const node = graph.value.addNode(inputNode)
  
  // 更新工作流数据
  workflow.value.nodes.push({
    id: inputNodeId,
    type: 'INPUT',
    name: '数据输入',
    position: { x: 100, y: 200 },
    config: {
      sourceType: 'file',
      description: '数据源输入节点'
    }
  })
}

// 生命周期
onMounted(() => {
  consoleLogger.info('[WorkflowEditor] onMounted生命周期钩子执行')
  // 使用setTimeout确保DOM完全渲染后再初始化Graph
  setTimeout(() => {
    consoleLogger.info('[WorkflowEditor] setTimeout回调执行，准备初始化Graph')
    initGraph()
    // 确保Graph实例初始化完成后再通知子组件
    nextTick(() => {
      consoleLogger.info('[WorkflowEditor] Graph初始化完成，通知子组件')
      // 触发一个事件通知所有等待的操作
      if (window.workflowGraphInitialized) {
        window.workflowGraphInitialized()
      }
    })
  }, 100)
})

onBeforeUnmount(() => {
  if (graph.value) {
    graph.value.dispose()
  }
})
</script>

<style scoped>
.workflow-editor {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e5e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.workflow-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workflow-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 工具栏面板样式 */
.toolbar-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.toolbar-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #fafafa;
}

.toolbar-panel .panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.toolbar-panel .panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.node-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-section {
  display: flex;
  flex-direction: column;
}

.category-title {
  font-size: 13px;
  font-weight: 600;
  color: #4e5969;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: white;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.node-item:hover {
  border-color: #165dff;
  background: #f2f7ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f2f3f5;
}

.node-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.node-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  line-height: 1.4;
}

.node-item-desc {
  font-size: 11px;
  color: #86909c;
  line-height: 1.3;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: white;
}

.canvas-container.full-width {
  width: 100%;
}

.canvas {
  width: 100%;
  height: 100%;
}

.property-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #86909c;
  text-align: center;
}

.no-selection p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

.node-properties {
  width: 100%;
}

.debug-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 320px;
  height: 300px;
  background: white;
  border-top: 1px solid #e5e6eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
}

.debug-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.debug-content {
  height: calc(100% - 49px);
  overflow: hidden;
}

.debug-logs {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f2f3f5;
  font-size: 12px;
}

.log-time {
  color: #86909c;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: 600;
}

.log-item.info .log-level {
  color: #165dff;
}

.log-item.success .log-level {
  color: #00b42a;
}

.log-item.error .log-level {
  color: #f53f3f;
}

.log-message {
  flex: 1;
  color: #1d2129;
}

.debug-results {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.result-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f2f3f5;
  border-radius: 6px;
}

.result-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1d2129;
}

.result-item pre {
  margin: 0;
  font-size: 12px;
  color: #4e5969;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-logs,
.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #86909c;
  font-size: 14px;
  text-align: center;
}

/* 版本管理样式 */
.version-history {
  max-height: 500px;
  overflow-y: auto;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-item {
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.version-item:hover {
  border-color: #165dff;
  background: #f2f7ff;
}

.version-item.active {
  border-color: #165dff;
  background: #e8f4ff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.version-details {
  color: #4e5969;
}

.version-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.version-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86909c;
}

.version-meta span {
  display: flex;
  align-items: center;
}
</style>