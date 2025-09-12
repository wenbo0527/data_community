<template>
  <div class="task-editor-page">
    <div class="page-container">
      <div class="page-header">
        <a-breadcrumb>
          <a-breadcrumb-item>营销中心</a-breadcrumb-item>
          <a-breadcrumb-item>营销任务</a-breadcrumb-item>
          <a-breadcrumb-item>{{ breadcrumbText }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="header-content">
          <h1>{{ pageTitle }}</h1>
          <div class="header-actions" v-if="mode === 'view'">
            <a-space>
              <a-button type="primary" @click="enterEditMode">
                <template #icon>
                  <icon-edit />
                </template>
                编辑
              </a-button>
              <a-dropdown v-if="taskVersions.length > 1">
                <a-button>
                  版本 v{{ currentVersion }}
                  <icon-down />
                </a-button>
                <template #content>
                  <a-doption v-for="version in taskVersions" :key="version.version"
                    @click="switchVersion(version.version)">
                    <div class="version-item">
                      <span>v{{ version.version }}</span>
                      <a-tag v-if="version.isActive" color="green" size="small">运行中</a-tag>
                      <a-tag v-if="version.version === currentVersion" color="blue" size="small">当前</a-tag>
                    </div>
                  </a-doption>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </div>

      <div class="page-content">
        <!-- 基础信息区域 -->
        <a-card title="基础信息" class="basic-info-card">
          <a-form ref="formRef" :model="taskForm" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="任务名称" field="name" required>
                  <a-input v-model="taskForm.name" placeholder="请输入任务名称" :readonly="mode === 'view'"
                    @change="handleFormChange" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="任务说明" field="description">
                  <a-input v-model="taskForm.description" placeholder="请输入任务说明" :readonly="mode === 'view'"
                    @change="handleFormChange" />
                </a-form-item>
              </a-col>
            </a-row>

            <!-- 任务状态和版本信息 -->
            <a-row :gutter="16" v-if="mode !== 'create'">
              <a-col :span="8">
                <a-form-item label="任务状态">
                  <a-tag :color="getStatusColor(taskData.status)" size="large">
                    {{ getStatusText(taskData.status) }}
                  </a-tag>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="当前版本">
                  <span class="version-info">v{{ currentVersion }}</span>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="创建时间">
                  <span>{{ taskData.createTime }}</span>
                </a-form-item>
              </a-col>
            </a-row>

            <!-- 操作按钮 - 仅在编辑和新建模式显示 -->
            <a-row :gutter="16" style="margin-top: 24px;" v-if="mode !== 'view'">
              <a-col :span="24" style="text-align: right;">
                <a-space size="large">
                  <a-button @click="goBack">
                    <template #icon>
                      <icon-arrow-left />
                    </template>
                    返回
                  </a-button>
                  <a-button type="primary" size="large" :loading="isSaving" @click="saveTask">
                    <template #icon>
                      <icon-save />
                    </template>
                    {{ isSaving ? '保存中...' : '保存' }}
                  </a-button>
                  <a-button type="primary" status="success" size="large" :loading="isPublishing" @click="publishTask">
                    <template #icon>
                      <icon-send />
                    </template>
                    {{ isPublishing ? '发布中...' : '发布' }}
                  </a-button>
                  <a-button @click="cancelEdit" v-if="mode === 'edit'">
                    取消编辑
                  </a-button>
                  <div class="task-status" v-if="taskStatus">
                    <a-tag :color="taskStatus === 'published' ? 'green' : 'blue'">
                      {{ taskStatus === 'published' ? '已发布' : '草稿' }}
                    </a-tag>
                  </div>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-card>

        <!-- 任务流程设计区域 -->
        <a-card title="任务流程设计" class="flow-design-card">
          <div class="flow-design-container">
            <!-- 左侧节点面板 - 仅在编辑和新建模式显示 -->
            <div class="node-panel" v-if="mode !== 'view'">
              <div class="node-panel-header">
                <a-input-search v-model="searchKeyword" placeholder="搜索节点" size="small" @search="handleSearch" />
              </div>
              <div class="node-categories">
                <div class="node-category">
                  <div class="category-title">
                    <icon-branch class="category-icon" />
                    分流节点
                  </div>
                  <div class="node-list">
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'audience-split')">
                      <icon-user-group class="node-icon" />
                      <span>人群分流</span>
                    </div>
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'event-split')">
                      <icon-thunderbolt class="node-icon" />
                      <span>事件分流</span>
                    </div>
                  </div>
                </div>

                <div class="node-category">
                  <div class="category-title">
                    <icon-send class="category-icon" />
                    触达节点
                  </div>
                  <div class="node-list">
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'sms')">
                      <icon-message class="node-icon" />
                      <span>短信</span>
                    </div>
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'ai-call')">
                      <icon-robot class="node-icon" />
                      <span>AI外呼</span>
                    </div>
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'manual-call')">
                      <icon-phone class="node-icon" />
                      <span>人工外呼</span>
                    </div>
                  </div>
                </div>

                <div class="node-category">
                  <div class="category-title">
                    <icon-experiment class="category-icon" />
                    实验节点
                  </div>
                  <div class="node-list">
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'ab-test')">
                      <icon-swap class="node-icon" />
                      <span>AB实验</span>
                    </div>
                  </div>
                </div>

                <div class="node-category">
                  <div class="category-title">
                    <icon-settings class="category-icon" />
                    流程节点
                  </div>
                  <div class="node-list">
                    <div class="node-item" draggable="true" @dragstart="handleNodeDragStart($event, 'wait')">
                      <icon-clock-circle class="node-icon" />
                      <span>等待</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 画布区域 -->
            <div class="canvas-area" :class="{ 'full-width': mode === 'view' }">
              <TaskFlowCanvas ref="canvasRef" :auto-add-start-node="mode !== 'view'" :readonly="mode === 'view'"
                :initial-nodes="taskForm.nodes" :initial-connections="taskForm.connections" @drop="handleCanvasDrop"
                @dragover="handleCanvasDragOver" @canvas-ready="handleCanvasReady" @node-created="handleNodeCreated"
                @node-moved="handleNodeMoved" @node-selected="handleNodeSelected" @node-updated="handleNodeUpdated"
                @node-deleted="handleNodeDeleted" @connection-created="handleConnectionCreated" />
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal, Message } from '@arco-design/web-vue'
import {
  IconEdit, IconSave, IconSend, IconDown, IconBranch,
  IconUserGroup, IconThunderbolt, IconMessage, IconRobot,
  IconPhone, IconExperiment, IconSwap, IconSettings, IconClockCircle,
  IconStop, IconCheckCircle, IconArrowLeft
} from '@arco-design/web-vue/es/icon'
import TaskFlowCanvas from './components/TaskFlowCanvas.vue'
import { validateForSave, validateForPublish, formatPublishValidationMessage } from '../../../utils/enhancedCanvasValidation.js'
import { TaskStorage } from '../../../utils/taskStorage.js'

const router = useRouter()
const route = useRoute()

// 页面模式：'create' | 'edit' | 'view'
const mode = ref('create')
const taskId = ref(null)
const currentVersion = ref(1)

// 页面状态
const isSaving = ref(false)
const isPublishing = ref(false)
const hasUnsavedChanges = ref(false)
const taskStatus = ref('draft')
const searchKeyword = ref('')

// 组件引用
const canvasRef = ref(null)
const formRef = ref(null)

// 表单数据
const taskForm = reactive({
  name: '',
  type: ''
})

// 任务数据（用于查看和编辑模式）
const taskData = ref({})

// 任务版本列表
const taskVersions = ref([])

// 计算属性
const pageTitle = computed(() => {
  switch (mode.value) {
    case 'create': return '创建营销任务'
    case 'edit': return '编辑营销任务'
    case 'view': return '查看营销任务'
    default: return '营销任务'
  }
})

const breadcrumbText = computed(() => {
  switch (mode.value) {
    case 'create': return '创建任务'
    case 'edit': return '编辑任务'
    case 'view': return '查看任务'
    default: return '任务'
  }
})

// 初始化页面
const initPage = async () => {
  const { mode: routeMode, id, version } = route.query

  mode.value = routeMode || 'create'
  taskId.value = id
  currentVersion.value = parseInt(version) || 1

  if (mode.value !== 'create' && taskId.value) {
    await loadTaskData()
  }
}

// 加载任务数据
const loadTaskData = async () => {
  try {
    console.log('🔄 [TaskEditor] 开始加载任务数据:', { taskId: taskId.value, version: currentVersion.value })
    
    // 首先尝试从本地存储加载
    const storedTask = TaskStorage.getTaskById(parseInt(taskId.value))
    
    let mockTaskData = {}
    
    if (storedTask) {
      // 使用本地存储的数据
      console.log('✅ [TaskEditor] 从本地存储加载任务数据:', storedTask)
      mockTaskData = storedTask
    } else if (taskId.value === '1') {
      // 保留原有的示例数据作为演示
      console.log('📋 [TaskEditor] 使用示例数据 (ID=1)')
      mockTaskData = {
        id: taskId.value,
        name: '消费贷促实名认证活动',
        description: '通过多渠道触达提升用户实名认证率',
        type: 'marketing',
        status: 'running',
        createTime: '2024-01-15 10:30:00',
        version: currentVersion.value,
        canvasData: {
          nodes: [
            {
              id: 'start',
              type: 'start',
              x: 400,
              y: 80,
              label: '开始',
              config: {
                name: '开始节点',
                description: '消费贷促实名认证活动开始'
              }
            },
            {
              id: 'user-filter',
              type: 'audience-split',
              x: 400,
              y: 200,
              label: '用户筛选',
              config: {
                name: '用户筛选',
                description: '筛选符合条件的目标用户',
                branchCount: 1,
                branches: [
                  { name: '符合条件', isDefault: false },
                  { name: '不符合条件', isDefault: true }
                ]
              }
            },
            {
              id: 'filter-end',
              type: 'end',
              x: 200,
              y: 320,
              label: '筛选结束',
              config: {
                name: '不符合条件结束',
                description: '不符合筛选条件的用户结束流程'
              }
            },
            {
              id: 'blacklist-check',
              type: 'audience-split',
              x: 600,
              y: 320,
              label: '黑名单检查',
              config: {
                name: '黑名单检查',
                description: '检查用户是否在黑名单中',
                branchCount: 1,
                branches: [
                  { name: '未命中黑名单', isDefault: false },
                  { name: '命中黑名单', isDefault: true }
                ]
              }
            },
            {
              id: 'blacklist-end',
              type: 'end',
              x: 800,
              y: 440,
              label: '黑名单结束',
              config: {
                name: '黑名单用户结束',
                description: '命中黑名单的用户直接结束流程'
              }
            },
            {
              id: 'sms-notification',
              type: 'sms',
              x: 400,
              y: 440,
              label: '短信通知',
              config: {
                name: '实名认证提醒短信',
                description: '发送实名认证提醒短信',
                template: '【消费贷】尊敬的用户，请完成实名认证以享受更优惠的贷款利率。',
                sendTime: 'immediate'
              }
            }
          ],
          connections: [
            {
              id: 'conn1',
              source: 'start',
              target: 'user-filter',
              label: ''
            },
            {
              id: 'conn2',
              source: 'user-filter',
              target: 'filter-end',
              label: '不符合条件'
            },
            {
              id: 'conn3',
              source: 'user-filter',
              target: 'blacklist-check',
              label: '符合条件'
            },
            {
              id: 'conn4',
              source: 'blacklist-check',
              target: 'blacklist-end',
              label: '命中黑名单'
            },
            {
              id: 'conn5',
              source: 'blacklist-check',
              target: 'sms-notification',
              label: '未命中黑名单'
            }
          ]
        }
      }
    } else {
      // 其他任务的默认数据
      console.log('📋 [TaskEditor] 使用默认空数据')
      mockTaskData = {
        id: taskId.value,
        name: '新建营销任务',
        description: '',
        type: 'marketing',
        status: 'draft',
        createTime: new Date().toLocaleString('zh-CN'),
        version: currentVersion.value,
        canvasData: {
          nodes: [],
          connections: []
        }
      }
    }

    // 更新任务数据和表单
    taskData.value = mockTaskData
    Object.assign(taskForm, {
      name: mockTaskData.name || '',
      description: mockTaskData.description || '',
      type: mockTaskData.type || '',
      nodes: mockTaskData.canvasData?.nodes || [],
      connections: mockTaskData.canvasData?.connections || []
    })

    // 设置任务状态
    taskStatus.value = mockTaskData.status || 'draft'

    console.log('✅ [TaskEditor] 任务数据加载完成:', {
      id: mockTaskData.id,
      name: mockTaskData.name,
      nodesCount: mockTaskData.canvasData?.nodes?.length || 0,
      connectionsCount: mockTaskData.canvasData?.connections?.length || 0
    })

    // 加载版本列表
    taskVersions.value = [
      { version: 1, createTime: '2024-01-15 10:30:00', isActive: false },
      { version: 2, createTime: '2024-01-16 14:20:00', isActive: true }
    ]

    // 延迟加载画布数据，确保组件已经渲染
    setTimeout(() => {
      if (canvasRef.value && mockTaskData.canvasData) {
        canvasRef.value.loadCanvasData(mockTaskData.canvasData)
      }
    }, 100)

  } catch (error) {
    console.error('❌ [TaskEditor] 加载任务数据失败:', error)
    Message.error('加载任务数据失败')
  }
}

// 进入编辑模式
const enterEditMode = () => {
  mode.value = 'edit'
  // 更新URL但不刷新页面
  router.replace({
    query: { ...route.query, mode: 'edit' }
  })
}

// 取消编辑
const cancelEdit = () => {
  if (hasUnsavedChanges.value) {
    Modal.confirm({
      title: '确认取消',
      content: '您有未保存的更改，确定要取消编辑吗？',
      onOk: () => {
        mode.value = 'view'
        hasUnsavedChanges.value = false
        loadTaskData() // 重新加载原始数据
        router.replace({
          query: { ...route.query, mode: 'view' }
        })
      }
    })
  } else {
    mode.value = 'view'
    router.replace({
      query: { ...route.query, mode: 'view' }
    })
  }
}

// 切换版本
const switchVersion = async (version) => {
  currentVersion.value = version
  router.replace({
    query: { ...route.query, version }
  })
  await loadTaskData()
}

// 获取状态颜色和文本
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'blue',
    published: 'green',
    running: 'orange',
    completed: 'green',
    failed: 'red'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    published: '已发布',
    running: '运行中',
    completed: '已完成',
    failed: '失败'
  }
  return textMap[status] || '未知'
}

// 其他方法保持不变...
const handleFormChange = () => {
  hasUnsavedChanges.value = true
}

const handleCanvasChange = () => {
  hasUnsavedChanges.value = true
}

// 画布事件处理方法
const handleCanvasReady = (data) => {
  console.log('画布就绪:', data)
}

const handleNodeCreated = (nodeData) => {
  console.log('节点创建:', nodeData)
  hasUnsavedChanges.value = true
}

const handleNodeMoved = (data) => {
  console.log('节点移动:', data)
  hasUnsavedChanges.value = true
}

const handleNodeSelected = (nodeData) => {
  console.log('节点选中:', nodeData)
}

const handleNodeUpdated = (nodeData) => {
  console.log('节点更新:', nodeData)
  hasUnsavedChanges.value = true
}

const handleNodeDeleted = (nodeData) => {
  console.log('节点删除:', nodeData)
  hasUnsavedChanges.value = true
}

const handleConnectionCreated = (connectionData) => {
  console.log('连接创建:', connectionData)
  hasUnsavedChanges.value = true
}

const handleSearch = (value) => {
  console.log('搜索节点:', value)
}

const handleNodeDragStart = (event, nodeType) => {
  event.dataTransfer.setData('nodeType', nodeType)
  event.dataTransfer.effectAllowed = 'copy'
}

const handleCanvasDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const handleCanvasDrop = (event) => {
  event.preventDefault()
  const nodeType = event.dataTransfer.getData('nodeType')
  
  // 获取画布组件的graph实例
  const graph = canvasRef.value?.graph
  if (graph && canvasRef.value) {
    // 使用X6原生坐标转换，自动处理缩放和平移
    const position = graph.clientToLocal(event.clientX, event.clientY)
    // 已禁用拖拽坐标处理日志以减少控制台冗余信息
    // console.log('🎯 [坐标转换] 拖拽坐标处理:', {
    //   clientX: event.clientX,
    //   clientY: event.clientY,
    //   offsetX: event.offsetX,
    //   offsetY: event.offsetY,
    //   convertedPosition: position,
    //   currentZoom: graph.zoom()
    // })
    canvasRef.value.addNode(nodeType, position)
  } else {
    // 备用方案：使用offset坐标
    console.warn('⚠️ [坐标转换] Graph实例不可用，使用备用坐标方案')
    if (canvasRef.value) {
      canvasRef.value.addNode(nodeType, {
        x: event.offsetX,
        y: event.offsetY
      })
    }
  }
}

const saveTask = async () => {
  if (isSaving.value) return

  try {
    isSaving.value = true

    if (!taskForm.name) {
      Message.error('请输入任务名称')
      return
    }

    console.log('💾 [TaskEditor] 开始保存任务:', { 
      id: taskId.value, 
      name: taskForm.name,
      mode: mode.value 
    })

    // 获取画布数据
    const canvasData = canvasRef.value?.getCanvasData()
    console.log('📊 [TaskEditor] 获取画布数据:', {
      nodesCount: canvasData?.nodes?.length || 0,
      connectionsCount: canvasData?.connections?.length || 0
    })

    // 基础校验（对于保存，只做轻量级校验）
    const validationResult = validateForSave({
      ...taskForm,
      canvasData
    })

    if (!validationResult.isValid) {
      // 对于保存，即使有错误也只显示警告，不阻止保存
      Message.warning(`保存成功，但存在问题：${validationResult.errors.join(', ')}`)
    }

    // 准备保存的数据
    const saveData = {
      name: taskForm.name,
      description: taskForm.description || '',
      type: taskForm.type || 'marketing',
      status: taskStatus.value || 'draft',
      canvasData: canvasData || { nodes: [], connections: [] },
      updateTime: new Date().toLocaleString('zh-CN')
    }

    let savedTask
    if (mode.value === 'create') {
      // 创建新任务
      savedTask = TaskStorage.createTask(saveData)
      console.log('✅ [TaskEditor] 创建新任务成功:', savedTask)
      
      // 更新路由到编辑模式
      router.replace({
        path: '/marketing/tasks/editor',
        query: { mode: 'edit', id: savedTask.id }
      })
      
      // 更新当前状态
      taskId.value = savedTask.id.toString()
      mode.value = 'edit'
      
    } else {
      // 更新现有任务
      savedTask = TaskStorage.updateTask(parseInt(taskId.value), saveData)
      console.log('✅ [TaskEditor] 更新任务成功:', savedTask)
    }

    // 更新本地任务数据
    taskData.value = savedTask
    taskStatus.value = savedTask.status

    console.log('[TaskEditor] 保存任务草稿:', savedTask)

    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    Message.success('保存成功')
    
    // 显示存储统计
    const stats = TaskStorage.getStorageStats()
    console.log('📈 [TaskEditor] 存储统计:', stats)

    // 标记为已保存
    hasUnsavedChanges.value = false

  } catch (error) {
    console.error('❌ [TaskEditor] 保存任务失败:', error)
    Message.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const publishTask = async () => {
  if (isPublishing.value) return

  try {
    isPublishing.value = true

    if (!taskForm.name) {
      Message.error('请输入任务名称')
      return
    }

    console.log('🚀 [TaskEditor] 开始发布任务:', { 
      id: taskId.value, 
      name: taskForm.name,
      mode: mode.value 
    })

    // 获取画布数据
    const canvasData = canvasRef.value?.getCanvasData()
    if (!canvasData) {
      Message.error('无法获取画布数据')
      return
    }

    console.log('📊 [TaskEditor] 获取画布数据:', {
      nodesCount: canvasData?.nodes?.length || 0,
      connectionsCount: canvasData?.connections?.length || 0
    })

    // 获取预览线信息（用于自动补充结束节点）
    let previewLines = []
    try {
      // 尝试从画布组件获取预览线管理器
      const previewManager = canvasRef.value?.previewManager

      if (previewManager && previewManager.getActivePreviewLines) {
        previewLines = previewManager.getActivePreviewLines()
      } else if (previewManager && previewManager.previewLines) {
        // 如果是UnifiedPreviewLineManager
        previewLines = []
        previewManager.previewLines.forEach((previewInstance, nodeId) => {
          const node = canvasData.nodes.find(n => n.id === nodeId)
          if (node && previewInstance) {
            if (Array.isArray(previewInstance)) {
              // 分支预览线
              previewInstance.forEach((instance, branchIndex) => {
                if (instance.line) {
                  previewLines.push({
                    id: instance.line.id || `preview_${nodeId}_${branchIndex}`,
                    sourceNodeId: nodeId,
                    branchId: instance.branchId,
                    branchIndex: branchIndex,
                    branchLabel: instance.branchLabel,
                    position: instance.endPosition || { x: node.position.x + 200, y: node.position.y + 100 }
                  })
                }
              })
            } else {
              // 单一预览线
              if (previewInstance.line) {
                previewLines.push({
                  id: previewInstance.line.id || `preview_${nodeId}`,
                  sourceNodeId: nodeId,
                  position: previewInstance.endPosition || { x: node.position.x + 200, y: node.position.y + 100 }
                })
              }
            }
          }
        })
      }

      console.log('📋 [发布校验] 获取到预览线信息:', {
        previewLineCount: previewLines.length,
        previewLines: previewLines.map(line => ({
          id: line.id,
          sourceNodeId: line.sourceNodeId,
          branchId: line.branchId
        }))
      })
    } catch (error) {
      console.warn('⚠️ [发布校验] 获取预览线信息失败:', error)
      previewLines = []
    }

    // 发布前完整校验
const validationResult = validateForPublish({
  ...taskForm,
  canvasData
}, { autoFix: true, previewLines })

// 添加发布校验汇总日志
console.log('📊 [发布校验汇总]', {
  timestamp: new Date().toISOString(),
  taskId: taskId.value,
  nodes: {
    total: canvasData.nodes?.length || 0,
    types: canvasData.nodes?.map(n => n.type) || [],
    endNodes: canvasData.nodes?.filter(n => n.type === 'end').length || 0
  },
  connections: {
    total: canvasData.connections?.length || 0,
    valid: canvasData.connections?.filter(c => c.valid !== false).length || 0
  },
  previewLines: {
    total: previewLines.length,
    sourceNodes: [...new Set(previewLines.map(l => l.sourceNodeId))].length
  },
  validation: {
    isValid: validationResult.isValid,
    autoFixApplied: validationResult.autoFixApplied,
    errorCount: validationResult.errors?.length || 0,
    fixCount: validationResult.fixedIssues?.length || 0
  }
})

if (!validationResult.isValid) {
      // 显示详细的校验错误信息
      const errorMessage = formatPublishValidationMessage(validationResult)

      Modal.error({
        title: '发布失败',
        content: errorMessage,
        width: 600,
        okText: '确定'
      })
      return
    }

    // 如果有自动修复，询问用户是否接受
    if (validationResult.autoFixApplied) {
      const confirmMessage = formatPublishValidationMessage(validationResult)

      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: '发布确认',
          content: confirmMessage + '\n\n是否接受自动修复并继续发布？',
          width: 600,
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        })
      })

      if (!confirmed) {
        return
      }

      // 应用自动修复的数据到画布
      if (validationResult.fixedData && validationResult.fixedData.canvasData) {
        // 重新加载修复后的数据到画布
        canvasRef.value?.loadCanvasData(validationResult.fixedData.canvasData)

        // 清理预览线并重新结构化布局
        try {
          const previewManager = canvasRef.value?.previewManager

          if (previewManager) {
            // 清理已连接的预览线
            if (previewManager.clearConnectedPreviewLines) {
              previewManager.clearConnectedPreviewLines()
            } else if (previewManager.refreshAllPreviewLines) {
              previewManager.refreshAllPreviewLines()
            }
          }

          // 触发重新布局
          if (canvasRef.value?.triggerLayout) {
            canvasRef.value.triggerLayout()
          }

          console.log('✅ [发布校验] 已应用自动修复并重新布局')
        } catch (error) {
          console.warn('⚠️ [发布校验] 重新布局失败:', error)
        }

        Message.success('已自动补充结束节点并优化布局')
      }
    }

    // 准备发布的数据
    const publishData = {
      name: taskForm.name,
      description: taskForm.description || '',
      type: taskForm.type || 'marketing',
      status: 'published',
      canvasData: validationResult.fixedData?.canvasData || canvasData,
      publishTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }

    let publishedTask
    if (mode.value === 'create') {
      // 创建并发布新任务
      publishedTask = TaskStorage.createTask(publishData)
      console.log('✅ [TaskEditor] 创建并发布新任务成功:', publishedTask)
      
      // 更新路由到编辑模式
      router.replace({
        path: '/marketing/tasks/editor',
        query: { mode: 'edit', id: publishedTask.id }
      })
      
      // 更新当前状态
      taskId.value = publishedTask.id.toString()
      mode.value = 'edit'
      
    } else {
      // 更新并发布现有任务
      publishedTask = TaskStorage.updateTask(parseInt(taskId.value), publishData)
      console.log('✅ [TaskEditor] 更新并发布任务成功:', publishedTask)
    }

    // 更新本地任务数据
    taskData.value = publishedTask
    taskStatus.value = publishedTask.status

    console.log('[TaskEditor] 发布任务:', publishedTask)

    // 模拟发布延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 发布成功
    Message.success('发布成功')
    
    // 显示存储统计
    const stats = TaskStorage.getStorageStats()
    console.log('📈 [TaskEditor] 存储统计:', stats)

    // 标记为已保存
    hasUnsavedChanges.value = false

    // 询问是否跳转到任务列表
    const shouldRedirect = await new Promise((resolve) => {
      Modal.success({
        title: '发布成功',
        content: '任务已成功发布，是否跳转到任务列表页面？',
        okText: '跳转',
        cancelText: '留在当前页',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })

    if (shouldRedirect) {
      router.push('/marketing/tasks')
    }

  } catch (error) {
    console.error('❌ [TaskEditor] 发布任务失败:', error)
    Message.error('发布失败，请重试')
  } finally {
    isPublishing.value = false
  }
}

const goBack = () => {
  router.push('/marketing/tasks')
}

// 生命周期
onMounted(() => {
  console.log('🚀🚀🚀 [TaskEditor] ===== 页面开始挂载 =====')
  console.log('🚀🚀🚀 [TaskEditor] 当前时间:', new Date().toISOString())
  console.log('🚀🚀🚀 [TaskEditor] 页面URL:', window.location.href)
  console.log('🚀🚀🚀 [TaskEditor] 路由参数:', route.query)
  console.log('🔍 [TaskEditor] 检查TaskFlowCanvas组件引用:', !!canvasRef.value)
  
  initPage()
  
  // 延迟检查组件是否挂载
  setTimeout(() => {
    console.log('🔍 [TaskEditor] 延迟检查TaskFlowCanvas组件:', {
      canvasRef: !!canvasRef.value,
      canvasElement: !!document.querySelector('.task-flow-canvas'),
      canvasArea: !!document.querySelector('.canvas-area')
    });
  }, 1000);
})

// 监听路由变化
watch(() => route.query, () => {
  initPage()
}, { deep: true })
</script>

<style scoped>
.task-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.page-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.page-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.page-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  border: 1px solid #f1f1f1;
}

.page-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.page-header {
  flex-shrink: 0;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-content {
  flex: 1;
  min-height: 0;
  padding: 24px;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.basic-info-card {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.version-info {
  font-weight: 500;
  color: #1d2129;
}

.task-status {
  display: flex;
  align-items: center;
}

.flow-design-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.flow-design-card :deep(.arco-card-body) {
  flex: 1;
  min-height: 0;
  padding: 16px;
}

.flow-design-container {
  display: flex;
  height: 100%;
  gap: 16px;
  min-height: 0;
}

.node-panel {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
  overflow-y: auto;
}

.node-panel-header {
  margin-bottom: 16px;
}

.node-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.node-category {
  border-bottom: 1px solid #f2f3f5;
  padding-bottom: 16px;
}

.node-category:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 12px;
  font-size: 14px;
}

.category-icon {
  font-size: 16px;
  color: #4080ff;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 13px;
}

.node-item:hover {
  background: #e8f4ff;
  border-color: #4080ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 128, 255, 0.15);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-icon {
  font-size: 14px;
  color: #4080ff;
}

.canvas-area {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: auto;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  position: relative;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.canvas-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.canvas-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.canvas-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  border: 1px solid #f1f1f1;
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.canvas-area.full-width {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .node-panel {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .flow-design-container {
    flex-direction: column;
  }
  
  .node-panel {
    width: 100%;
    height: 200px;
    order: 2;
  }
  
  .canvas-area {
    order: 1;
    height: 400px;
  }
}
</style>