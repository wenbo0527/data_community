<template>
  <div class="task-editor-page">
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
                <a-doption 
                  v-for="version in taskVersions" 
                  :key="version.version"
                  @click="switchVersion(version.version)"
                >
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
                <a-input 
                  v-model="taskForm.name" 
                  placeholder="请输入任务名称"
                  :readonly="mode === 'view'"
                  @change="handleFormChange"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="任务类型" field="type" required>
                <a-select 
                  v-model="taskForm.type" 
                  placeholder="请选择任务类型"
                  :disabled="mode === 'view'"
                  @change="handleFormChange"
                >
                  <a-option value="marketing">营销活动</a-option>
                  <a-option value="notification">通知推送</a-option>
                  <a-option value="survey">问卷调研</a-option>
                </a-select>
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
                <a-button 
                  type="primary" 
                  size="large"
                  :loading="isSaving"
                  @click="saveTask"
                >
                  <template #icon>
                    <icon-save />
                  </template>
                  {{ isSaving ? '保存中...' : '保存' }}
                </a-button>
                <a-button 
                  type="primary" 
                  status="success"
                  size="large"
                  :loading="isPublishing"
                  @click="publishTask"
                >
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
              <a-input-search 
                v-model="searchKeyword" 
                placeholder="搜索节点" 
                size="small"
                @search="handleSearch"
              />
            </div>
            <div class="node-categories">
              <div class="node-category">
                <div class="category-title">
                  <icon-branch class="category-icon" />
                  分流节点
                </div>
                <div class="node-list">
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'audience-split')"
                  >
                    <icon-user-group class="node-icon" />
                    <span>人群分流</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'event-split')"
                  >
                    <icon-thunderbolt class="node-icon" />
                    <span>事件分流</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'blacklist')"
                  >
                    <icon-stop class="node-icon" />
                    <span>黑名单</span>
                  </div>
                </div>
              </div>

              <div class="node-category">
                <div class="category-title">
                  <icon-send class="category-icon" />
                  触达节点
                </div>
                <div class="node-list">
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'sms')"
                  >
                    <icon-message class="node-icon" />
                    <span>短信</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'ai-call')"
                  >
                    <icon-robot class="node-icon" />
                    <span>AI外呼</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'manual-call')"
                  >
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
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'ab-test')"
                  >
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
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'wait')"
                  >
                    <icon-clock-circle class="node-icon" />
                    <span>等待</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleNodeDragStart($event, 'end')"
                  >
                    <icon-check-circle class="node-icon" />
                    <span>结束</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 画布区域 -->
          <div class="canvas-area" :class="{ 'full-width': mode === 'view' }">
            <TaskFlowCanvas 
              ref="canvasRef" 
              :auto-add-start-node="mode !== 'view'"
              :readonly="mode === 'view'"
              :initial-nodes="taskForm.nodes" 
              :initial-connections="taskForm.connections"
              @drop="handleCanvasDrop"
              @dragover="handleCanvasDragOver"
              @canvas-ready="handleCanvasReady"
              @node-created="handleNodeCreated"
              @node-moved="handleNodeMoved"
              @node-selected="handleNodeSelected"
              @node-updated="handleNodeUpdated"
              @node-deleted="handleNodeDeleted"
              @connection-created="handleConnectionCreated"
            />
          </div>
        </div>
      </a-card>
    </div>

    <!-- 页面底部操作栏 -->
    <div class="page-footer">
      <a-space>
        <a-button @click="goBack">返回</a-button>
        <template v-if="mode === 'view'">
          <a-button type="primary" @click="enterEditMode">编辑任务</a-button>
        </template>
      </a-space>
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
    // 模拟API调用 - 根据任务ID获取对应的数据
    let mockTaskData = {}
    
    if (taskId.value === '1') {
      // 消费贷促实名认证活动 - 完整的画布流程
      mockTaskData = {
        id: taskId.value,
        name: '消费贷促实名认证活动',
        type: 'marketing',
        status: 'running',
        createTime: '2024-01-15 10:30:00',
        version: currentVersion.value,
        canvasData: {
          nodes: [
            { 
              id: 'start', 
              type: 'start', 
              x: 300, 
              y: 100, 
              label: '开始',
              config: {
                name: '开始节点',
                description: '消费贷促实名认证活动开始'
              }
            },
            { 
              id: 'crowd-split', 
              type: 'crowd-split', 
              x: 300, 
              y: 220, 
              label: '人群分流',
              config: {
                name: '人群分流',
                description: '根据用户黑名单状态进行分流',
                conditions: [
                  { name: '命中黑名单', expression: 'user.isBlacklisted == true' },
                  { name: '未命中黑名单', expression: 'user.isBlacklisted == false' }
                ]
              }
            },
            { 
              id: 'blacklist-end', 
              type: 'end', 
              x: 150, 
              y: 340, 
              label: '黑名单结束',
              config: {
                name: '黑名单用户结束',
                description: '命中黑名单的用户直接结束流程'
              }
            },
            { 
              id: 'ab-test', 
              type: 'ab-test', 
              x: 450, 
              y: 340, 
              label: 'AB实验',
              config: {
                name: 'AB实验分组',
                description: '对未命中黑名单的用户进行AB实验分组',
                groups: [
                  { name: 'A组', ratio: 50, description: '电销策略A' },
                  { name: 'B组', ratio: 50, description: '电销策略B' }
                ]
              }
            },
            { 
              id: 'manual-call-1', 
              type: 'manual-call', 
              x: 350, 
              y: 460, 
              label: '人工电销A组',
              config: {
                name: '人工电销A组',
                description: '针对A组用户的电销策略',
                callScript: '促实名认证话术A版本',
                maxAttempts: 3
              }
            },
            { 
              id: 'manual-call-2', 
              type: 'manual-call', 
              x: 550, 
              y: 460, 
              label: '人工电销B组',
              config: {
                name: '人工电销B组',
                description: '针对B组用户的电销策略',
                callScript: '促实名认证话术B版本',
                maxAttempts: 3
              }
            },
            { 
              id: 'end', 
              type: 'end', 
              x: 450, 
              y: 580, 
              label: '结束',
              config: {
                name: '流程结束',
                description: '营销活动流程结束'
              }
            }
          ],
          connections: [
            { 
              id: 'conn1',
              source: 'start', 
              target: 'crowd-split',
              label: ''
            },
            { 
              id: 'conn2',
              source: 'crowd-split', 
              target: 'blacklist-end', 
              label: '命中黑名单'
            },
            { 
              id: 'conn3',
              source: 'crowd-split', 
              target: 'ab-test', 
              label: '未命中黑名单'
            },
            { 
              id: 'conn4',
              source: 'ab-test', 
              target: 'manual-call-1', 
              label: 'A组(50%)'
            },
            { 
              id: 'conn5',
              source: 'ab-test', 
              target: 'manual-call-2', 
              label: 'B组(50%)'
            },
            { 
              id: 'conn6',
              source: 'manual-call-1', 
              target: 'end',
              label: ''
            },
            { 
              id: 'conn7',
              source: 'manual-call-2', 
              target: 'end',
              label: ''
            }
          ]
        }
      }
    } else {
      // 其他任务的默认数据
      mockTaskData = {
        id: taskId.value,
        name: '消费贷营销任务',
        type: 'marketing',
        status: 'draft',
        createTime: '2024-01-15 10:30:00',
        version: currentVersion.value,
        canvasData: {
          nodes: [],
          connections: []
        }
      }
    }
    
    taskData.value = mockTaskData
    Object.assign(taskForm, {
      name: mockTaskData.name,
      type: mockTaskData.type,
      nodes: mockTaskData.canvasData.nodes,
      connections: mockTaskData.canvasData.connections
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
    console.error('加载任务数据失败:', error)
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
  if (canvasRef.value) {
    canvasRef.value.addNode(nodeType, {
      x: event.offsetX,
      y: event.offsetY
    })
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
    if (!taskForm.type) {
      Message.error('请选择任务类型')
      return
    }
    
    // 获取画布数据
    const canvasData = canvasRef.value?.getCanvasData()
    
    // 基础校验（对于保存，只做轻量级校验）
    const validationResult = validateForSave({
      ...taskForm,
      canvasData
    })
    
    if (!validationResult.isValid) {
      // 对于保存，即使有错误也只显示警告，不阻止保存
      Message.warning(`保存成功，但存在问题：${validationResult.errors.join(', ')}`)
    }
    
    const taskData = {
      ...taskForm,
      canvasData,
      status: 'draft',
      updateTime: new Date().toLocaleString('zh-CN'),
      creator: '当前用户'
    }
    
    console.log('[TaskEditor] 保存任务草稿:', taskData)
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存成功，状态仍为草稿
    taskStatus.value = 'draft'
    Message.success('保存成功')
    
    // 标记为已保存
    hasUnsavedChanges.value = false
    
  } catch (error) {
    console.error('[TaskEditor] 保存任务失败:', error)
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
    if (!taskForm.type) {
      Message.error('请选择任务类型')
      return
    }
    
    // 获取画布数据
    const canvasData = canvasRef.value?.getCanvasData()
    if (!canvasData) {
      Message.error('无法获取画布数据')
      return
    }
    
    // 获取预览线信息（用于自动补充结束节点）
    let previewLines = []
    try {
      // 尝试从画布组件获取预览线管理器
      const previewManager = canvasRef.value?.previewManager || 
                            canvasRef.value?.$refs?.layeredCanvas?.previewManager ||
                            canvasRef.value?.$refs?.layeredCanvas?.connectionPreviewManager
      
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
          const previewManager = canvasRef.value?.previewManager || 
                                canvasRef.value?.$refs?.layeredCanvas?.previewManager ||
                                canvasRef.value?.$refs?.layeredCanvas?.connectionPreviewManager
          
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

    const taskData = {
      ...taskForm,
      canvasData: validationResult.fixedData?.canvasData || canvasData,
      status: 'published',
      publishTime: new Date().toLocaleString('zh-CN'),
      creator: '当前用户'
    }
    
    console.log('[TaskEditor] 发布任务:', taskData)
    
    // 模拟发布延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 发布成功
    taskStatus.value = 'published'
    Message.success('发布成功')
    
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
    console.error('[TaskEditor] 发布任务失败:', error)
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
  initPage()
})

// 监听路由变化
watch(() => route.query, () => {
  initPage()
}, { deep: true })
</script>

<style scoped>
.task-editor-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
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
}

.version-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.basic-info-card {
  margin-bottom: 24px;
}

.flow-design-card {
  margin-bottom: 24px;
}

.flow-design-container {
  display: flex;
  height: 600px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

/* 左侧节点面板 */
.node-panel {
  width: 280px;
  background: #fafbfc;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.node-panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
  background: white;
}

.node-categories {
  flex: 1;
  overflow-y: auto;
}

.node-category {
  margin-bottom: 8px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-weight: 500;
  color: #1d2129;
  background: #f2f3f5;
  border-bottom: 1px solid #e5e6eb;
}

.category-icon {
  font-size: 14px;
  color: #86909c;
}

.node-list {
  padding: 4px 0;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.node-item:hover {
  background: #e8f4ff;
  color: #165dff;
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  font-size: 14px;
  color: #86909c;
}

.node-item:hover .node-icon {
  color: #165dff;
}

.node-item span {
  font-size: 13px;
}

/* 右侧画布区域 */
.canvas-area {
  flex: 1;
  background: white;
  position: relative;
  overflow: auto; /* 添加滚动条 */
}

.canvas-area.full-width {
  width: 100%;
}

/* 滚动条样式优化 */
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
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.page-footer {
  background: white;
  border-top: 1px solid #e5e6eb;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
}

.version-info {
  font-weight: 500;
  color: #1890ff;
}

.flow-design-container {
  display: flex;
  height: 600px;
  gap: 16px;
}

.node-panel {
  width: 280px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  position: relative;
}

.canvas-area.full-width {
  width: 100%;
}

.page-footer {
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #e5e6eb;
  background: #fff;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* 其他样式保持不变... */
</style>