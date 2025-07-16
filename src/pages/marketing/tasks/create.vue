<template>
  <div class="create-task-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item>营销中心</a-breadcrumb-item>
        <a-breadcrumb-item>营销任务</a-breadcrumb-item>
        <a-breadcrumb-item>创建任务</a-breadcrumb-item>
      </a-breadcrumb>
      <h1>创建营销任务</h1>
    </div>

    <div class="page-content">
      <!-- 基础信息区域 -->
      <a-card title="基础信息" class="basic-info-card">
        <a-form :model="taskForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="任务名称" field="name" required>
                <a-input v-model="taskForm.name" placeholder="请输入任务名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="任务类型" field="type" required>
                <a-select v-model="taskForm.type" placeholder="请选择任务类型">
                  <a-option value="campaign">营销活动</a-option>
                  <a-option value="automation">自动化流程</a-option>
                  <a-option value="experiment">实验任务</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="执行时间" field="executeTime">
                <a-date-picker v-model="taskForm.executeTime" show-time placeholder="请选择执行时间" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="任务说明" field="description">
            <a-textarea v-model="taskForm.description" placeholder="请输入任务说明" :rows="3" />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 任务流程设计区域 -->
      <a-card title="任务流程设计" class="flow-design-card">
        <div class="flow-design-container">
          <!-- 左侧节点面板 -->
          <div class="node-panel">
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
                    @dragstart="handleDragStart($event, 'audience-split')"
                  >
                    <icon-user-group class="node-icon" />
                    <span>人群分流</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleDragStart($event, 'event-split')"
                  >
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
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleDragStart($event, 'sms')"
                  >
                    <icon-message class="node-icon" />
                    <span>短信</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleDragStart($event, 'ai-call')"
                  >
                    <icon-robot class="node-icon" />
                    <span>AI外呼</span>
                  </div>
                  <div 
                    class="node-item" 
                    draggable="true"
                    @dragstart="handleDragStart($event, 'manual-call')"
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
                    @dragstart="handleDragStart($event, 'ab-test')"
                  >
                    <icon-swap class="node-icon" />
                    <span>AB实验分流</span>
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
                    @dragstart="handleDragStart($event, 'wait')"
                  >
                    <icon-clock-circle class="node-icon" />
                    <span>等待</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧画布区域 -->
          <div class="canvas-area">
            <TaskFlowCanvas 
              ref="canvasRef" 
              @drop="handleCanvasDrop"
              @dragover="handleCanvasDragOver"
            />
          </div>
        </div>
      </a-card>
    </div>

    <div class="page-footer">
      <a-space>
        <a-button @click="goBack">返回</a-button>
        <a-button @click="saveDraft">保存草稿</a-button>
        <a-button type="primary" @click="saveTask">保存任务</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconBranch,
  IconUserGroup,
  IconThunderbolt,
  IconSend,
  IconMessage,
  IconRobot,
  IconPhone,
  IconExperiment,
  IconSwap,
  IconSettings,
  IconClockCircle
} from '@arco-design/web-vue/es/icon'
import TaskFlowCanvas from './components/TaskFlowCanvas.vue'

const router = useRouter()
const formRef = ref()
const canvasRef = ref()
const searchKeyword = ref('')

// 表单数据
const taskForm = reactive({
  name: '',
  type: '',
  executeTime: null,
  description: ''
})

// 搜索节点
const handleSearch = (value) => {
  console.log('搜索节点:', value)
  // 这里可以添加节点搜索逻辑
}

// 拖拽开始
const handleDragStart = (event, nodeType) => {
  event.dataTransfer.setData('nodeType', nodeType)
  event.dataTransfer.effectAllowed = 'copy'
}

// 画布拖拽悬停
const handleCanvasDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

// 画布放置
const handleCanvasDrop = (event) => {
  event.preventDefault()
  const nodeType = event.dataTransfer.getData('nodeType')
  console.log('添加节点:', nodeType)
  // 这里可以调用画布组件的方法添加节点
  if (canvasRef.value) {
    canvasRef.value.addNode(nodeType, {
      x: event.offsetX,
      y: event.offsetY
    })
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 保存草稿
const saveDraft = async () => {
  try {
    // 这里可以不验证必填项，直接保存草稿
    console.log('保存草稿:', taskForm)
    Message.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    Message.error('保存草稿失败')
  }
}

// 保存任务
const saveTask = async () => {
  try {
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
    
    const taskData = {
      ...taskForm,
      canvasData,
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN'),
      creator: '当前用户'
    }
    
    console.log('保存任务:', taskData)
    Message.success('任务创建成功')
    
    // 返回任务列表页面
    router.push('/marketing/tasks')
  } catch (error) {
    console.error('保存任务失败:', error)
    Message.error('保存任务失败')
  }
}

// 组件挂载
onMounted(() => {
  console.log('任务创建页面已挂载')
})
</script>

<style scoped>
.create-task-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.page-header h1 {
  margin: 8px 0 0 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.page-content {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
}

.basic-info-card {
  margin-bottom: 16px;
}

.flow-design-card {
  height: calc(100vh - 280px);
  min-height: 500px;
}

.flow-design-card :deep(.arco-card-body) {
  height: calc(100% - 57px);
  padding: 0;
}

.flow-design-container {
  display: flex;
  height: 100%;
}

/* 左侧节点面板 */
.node-panel {
  width: 280px;
  border-right: 1px solid #e5e6eb;
  background: #fafafa;
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
  padding: 8px 0;
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
  overflow: hidden;
}

.page-footer {
  background: white;
  border-top: 1px solid #e5e6eb;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
}

/* 卡片样式 */
:deep(.arco-card) {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 20px;
}

:deep(.arco-card-header-title) {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

/* 表单样式 */
:deep(.arco-form-item) {
  margin-bottom: 20px;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #1d2129;
}

/* 按钮样式 */
:deep(.arco-btn-primary) {
  background-color: #165dff;
  border-color: #165dff;
}

:deep(.arco-btn-primary:hover) {
  background-color: #4080ff;
  border-color: #4080ff;
}

/* 输入框样式 */
:deep(.arco-input),
:deep(.arco-textarea),
:deep(.arco-select-view),
:deep(.arco-picker) {
  border-radius: 4px;
}

:deep(.arco-input:focus),
:deep(.arco-textarea:focus),
:deep(.arco-select-view-focus),
:deep(.arco-picker-focused) {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .flow-design-container {
    flex-direction: column;
  }
  
  .node-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e5e6eb;
  }
  
  .node-categories {
    display: flex;
    gap: 16px;
    padding: 8px 16px;
  }
  
  .node-category {
    flex: 1;
    margin-bottom: 0;
  }
  
  .canvas-area {
    height: 400px;
  }
}
</style>