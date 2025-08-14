<template>
  <div class="debug-panel">
    <!-- 调试控制栏 -->
    <div class="debug-toolbar">
      <div class="toolbar-left">
        <a-button-group size="small">
          <a-button
            type="primary"
            :loading="isRunning"
            :disabled="!canRun"
            @click="startDebug"
          >
            <template #icon>
              <icon-play-arrow v-if="!isRunning" />
              <icon-loading v-else />
            </template>
            {{ isRunning ? '运行中' : '开始调试' }}
          </a-button>
          
          <a-button
            :disabled="!canStep"
            @click="stepNext"
          >
            <template #icon>
              <icon-forward />
            </template>
            单步执行
          </a-button>
          
          <a-button
            :disabled="!canContinue"
            @click="continueExecution"
          >
            <template #icon>
              <icon-play-circle />
            </template>
            继续
          </a-button>
          
          <a-button
            :disabled="!canStop"
            status="danger"
            @click="stopDebug"
          >
            <template #icon>
              <icon-pause-circle />
            </template>
            停止
          </a-button>
        </a-button-group>
      </div>
      
      <div class="toolbar-right">
        <a-space>
          <a-switch
            v-model="debugConfig.stepMode"
            size="small"
          >
            <template #checked>步进</template>
            <template #unchecked>连续</template>
          </a-switch>
          
          <a-select
            v-model="debugConfig.logLevel"
            size="small"
            style="width: 100px"
          >
            <a-option value="debug">调试</a-option>
            <a-option value="info">信息</a-option>
            <a-option value="warn">警告</a-option>
            <a-option value="error">错误</a-option>
          </a-select>
          
          <a-button
            type="text"
            size="small"
            @click="clearLogs"
          >
            <template #icon>
              <icon-delete />
            </template>
            清空日志
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 调试状态 -->
    <div v-if="currentSession" class="debug-status">
      <div class="status-item">
        <span class="status-label">状态:</span>
        <a-tag :color="getStatusColor(currentSession.status)" size="small">
          {{ getStatusText(currentSession.status) }}
        </a-tag>
      </div>
      
      <div v-if="currentSession.currentNodeId" class="status-item">
        <span class="status-label">当前节点:</span>
        <span class="status-value">{{ getCurrentNodeLabel() }}</span>
      </div>
      
      <div v-if="currentSession.startTime" class="status-item">
        <span class="status-label">执行时间:</span>
        <span class="status-value">{{ getExecutionDuration() }}</span>
      </div>
    </div>

    <!-- 调试内容 -->
    <div class="debug-content">
      <a-tabs v-model:active-key="activeTab" size="small">
        <!-- 执行日志 -->
        <a-tab-pane key="logs" title="执行日志">
          <div class="logs-container">
            <div v-if="filteredLogs.length === 0" class="empty-logs">
              <a-empty description="暂无日志" :image-style="{ height: '60px' }" />
            </div>
            
            <div v-else class="logs-list" ref="logsContainer">
              <div
                v-for="log in filteredLogs"
                :key="log.id"
                class="log-item"
                :class="`log-${log.level}`"
              >
                <div class="log-header">
                  <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                  <a-tag :color="getLogLevelColor(log.level)" size="mini">
                    {{ log.level.toUpperCase() }}
                  </a-tag>
                </div>
                <div class="log-message">{{ log.message }}</div>
                <div v-if="log.data" class="log-data">
                  <a-collapse size="mini">
                    <a-collapse-item header="详细信息" key="data">
                      <pre class="log-data-content">{{ JSON.stringify(log.data, null, 2) }}</pre>
                    </a-collapse-item>
                  </a-collapse>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 节点结果 -->
        <a-tab-pane key="results" title="节点结果">
          <div class="results-container">
            <div v-if="nodeResults.length === 0" class="empty-results">
              <a-empty description="暂无执行结果" :image-style="{ height: '60px' }" />
            </div>
            
            <div v-else class="results-list">
              <div
                v-for="result in nodeResults"
                :key="result.nodeId"
                class="result-item"
                :class="{ 'result-error': !result.success }"
              >
                <div class="result-header">
                  <div class="result-node">
                    <span class="node-label">{{ getNodeLabel(result.nodeId) }}</span>
                    <a-tag
                      :color="result.success ? 'green' : 'red'"
                      size="small"
                    >
                      {{ result.success ? '成功' : '失败' }}
                    </a-tag>
                  </div>
                  <div class="result-meta">
                    <span class="execution-time">{{ result.executionTime }}ms</span>
                    <span class="result-time">{{ formatTime(result.timestamp) }}</span>
                  </div>
                </div>
                
                <div v-if="result.error" class="result-error-info">
                  <div class="error-message">{{ result.error }}</div>
                  <div v-if="result.errorDetails" class="error-details">
                    <a-collapse size="mini">
                      <a-collapse-item header="错误详情" key="details">
                        <pre class="error-stack">{{ result.errorDetails }}</pre>
                      </a-collapse-item>
                    </a-collapse>
                  </div>
                </div>
                
                <div v-if="result.outputData" class="result-output">
                  <div class="output-header">
                    <span>输出数据</span>
                    <span class="output-count">
                      ({{ getOutputDataCount(result.outputData) }} 行)
                    </span>
                  </div>
                  <div class="output-preview">
                    <a-button
                      type="text"
                      size="small"
                      @click="previewOutputData(result)"
                    >
                      <template #icon>
                        <icon-eye />
                      </template>
                      预览数据
                    </a-button>
                  </div>
                </div>
                
                <div v-if="result.logs?.length" class="result-logs">
                  <div class="logs-header">执行日志:</div>
                  <div class="logs-content">
                    <div
                      v-for="(logMsg, index) in result.logs"
                      :key="index"
                      class="log-line"
                    >
                      {{ logMsg }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 断点管理 -->
        <a-tab-pane key="breakpoints" title="断点">
          <div class="breakpoints-container">
            <div class="breakpoints-header">
              <span>断点列表</span>
              <a-button
                type="text"
                size="small"
                @click="clearAllBreakpoints"
              >
                清空断点
              </a-button>
            </div>
            
            <div v-if="breakpoints.length === 0" class="empty-breakpoints">
              <a-empty description="暂无断点" :image-style="{ height: '60px' }" />
            </div>
            
            <div v-else class="breakpoints-list">
              <div
                v-for="nodeId in breakpoints"
                :key="nodeId"
                class="breakpoint-item"
              >
                <div class="breakpoint-info">
                  <icon-record-stop class="breakpoint-icon" />
                  <span class="breakpoint-label">{{ getNodeLabel(nodeId) }}</span>
                </div>
                <a-button
                  type="text"
                  size="mini"
                  status="danger"
                  @click="removeBreakpoint(nodeId)"
                >
                  <template #icon>
                    <icon-close />
                  </template>
                </a-button>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 变量监视 -->
        <a-tab-pane key="variables" title="变量">
          <div class="variables-container">
            <div v-if="!currentSession || currentSession.variables.size === 0" class="empty-variables">
              <a-empty description="暂无变量" :image-style="{ height: '60px' }" />
            </div>
            
            <div v-else class="variables-list">
              <div
                v-for="[key, value] in currentSession.variables"
                :key="key"
                class="variable-item"
              >
                <div class="variable-name">{{ key }}</div>
                <div class="variable-value">
                  <pre>{{ JSON.stringify(value, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 数据预览模态框 -->
    <a-modal
      v-model:visible="showDataPreview"
      title="数据预览"
      width="80%"
      :footer="false"
    >
      <div v-if="previewData" class="data-preview">
        <a-table
          :columns="previewData.columns"
          :data="previewData.rows"
          :pagination="false"
          size="small"
          :scroll="{ x: '100%', y: 400 }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconPlayArrow,
  IconLoading,
  IconForward,
  IconPlayCircle,
  IconPauseCircle,
  IconDelete,
  IconEye,
  IconRecordStop,
  IconClose
} from '@arco-design/web-vue/es/icon';

const props = defineProps(['workflow', 'graph']);
const emit = defineEmits(['debug-start', 'debug-stop', 'debug-step', 'debug-continue']);

// 响应式数据
const isRunning = ref(false);
const activeTab = ref('logs');
const showDataPreview = ref(false);
const previewData = ref(null);
const logsContainer = ref(null);

// 调试配置
const debugConfig = ref({
  stepMode: false,
  logLevel: 'info'
});

// 调试会话
const currentSession = ref(null);
const debugLogs = ref([]);
const nodeResults = ref([]);
const breakpoints = ref([]);

// 计算属性
const canRun = computed(() => {
  return props.workflow && !isRunning.value;
});

const canStep = computed(() => {
  return currentSession.value && currentSession.value.status === 'paused';
});

const canContinue = computed(() => {
  return currentSession.value && currentSession.value.status === 'paused';
});

const canStop = computed(() => {
  return currentSession.value && ['running', 'paused'].includes(currentSession.value.status);
});

const filteredLogs = computed(() => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const minLevel = levels.indexOf(debugConfig.value.logLevel);
  return debugLogs.value.filter(log => {
    const logLevel = levels.indexOf(log.level);
    return logLevel >= minLevel;
  });
});

// 方法
const startDebug = async () => {
  if (!props.workflow) return;
  
  isRunning.value = true;
  currentSession.value = {
    id: Date.now().toString(),
    status: 'running',
    startTime: new Date(),
    currentNodeId: null,
    variables: new Map()
  };
  
  addLog('info', '开始调试执行');
  emit('debug-start', currentSession.value);
  
  try {
    // 模拟调试执行
    await simulateDebugExecution();
  } catch (error) {
    addLog('error', '调试执行失败', { error: error.message });
    currentSession.value.status = 'error';
  } finally {
    if (currentSession.value.status === 'running') {
      currentSession.value.status = 'completed';
      addLog('info', '调试执行完成');
    }
    isRunning.value = false;
  }
};

const stepNext = () => {
  if (!canStep.value) return;
  
  addLog('info', '单步执行');
  emit('debug-step', currentSession.value);
  
  // 模拟单步执行
  setTimeout(() => {
    if (currentSession.value) {
      currentSession.value.status = 'paused';
    }
  }, 500);
};

const continueExecution = () => {
  if (!canContinue.value) return;
  
  addLog('info', '继续执行');
  currentSession.value.status = 'running';
  emit('debug-continue', currentSession.value);
};

const stopDebug = () => {
  if (!canStop.value) return;
  
  addLog('warn', '停止调试执行');
  currentSession.value.status = 'stopped';
  isRunning.value = false;
  emit('debug-stop', currentSession.value);
};

const clearLogs = () => {
  debugLogs.value = [];
  Message.success('日志已清空');
};

const clearAllBreakpoints = () => {
  breakpoints.value = [];
  Message.success('断点已清空');
};

const removeBreakpoint = (nodeId) => {
  const index = breakpoints.value.indexOf(nodeId);
  if (index > -1) {
    breakpoints.value.splice(index, 1);
    Message.success('断点已移除');
  }
};

const addLog = (level, message, data = null) => {
  const log = {
    id: Date.now() + Math.random(),
    level,
    message,
    data,
    timestamp: new Date()
  };
  
  debugLogs.value.push(log);
  
  // 自动滚动到底部
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
    }
  });
};

const simulateDebugExecution = async () => {
  const nodes = props.workflow.nodes || [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    currentSession.value.currentNodeId = node.id;
    
    addLog('info', `执行节点: ${getNodeLabel(node.id)}`);
    
    // 检查断点
    if (breakpoints.value.includes(node.id)) {
      addLog('warn', `遇到断点: ${getNodeLabel(node.id)}`);
      currentSession.value.status = 'paused';
      return;
    }
    
    // 模拟节点执行
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 添加节点结果
    const result = {
      nodeId: node.id,
      success: Math.random() > 0.1, // 90% 成功率
      executionTime: Math.floor(Math.random() * 1000) + 100,
      timestamp: new Date(),
      outputData: generateMockData(),
      logs: [`节点 ${node.id} 执行完成`]
    };
    
    if (!result.success) {
      result.error = '模拟执行错误';
      result.errorDetails = 'Error: 这是一个模拟的错误信息';
    }
    
    nodeResults.value.push(result);
    addLog(result.success ? 'info' : 'error', 
      `节点执行${result.success ? '成功' : '失败'}: ${getNodeLabel(node.id)}`);
  }
};

const generateMockData = () => {
  return {
    columns: [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '值', dataIndex: 'value', key: 'value' }
    ],
    rows: Array.from({ length: 5 }, (_, i) => ({
      key: i,
      id: i + 1,
      name: `数据项 ${i + 1}`,
      value: Math.floor(Math.random() * 100)
    }))
  };
};

const previewOutputData = (result) => {
  previewData.value = result.outputData;
  showDataPreview.value = true;
};

const getStatusColor = (status) => {
  const colors = {
    running: 'blue',
    paused: 'orange',
    completed: 'green',
    stopped: 'red',
    error: 'red'
  };
  return colors[status] || 'gray';
};

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    paused: '已暂停',
    completed: '已完成',
    stopped: '已停止',
    error: '错误'
  };
  return texts[status] || '未知';
};

const getLogLevelColor = (level) => {
  const colors = {
    debug: 'gray',
    info: 'blue',
    warn: 'orange',
    error: 'red'
  };
  return colors[level] || 'gray';
};

const getCurrentNodeLabel = () => {
  if (!currentSession.value?.currentNodeId) return '';
  return getNodeLabel(currentSession.value.currentNodeId);
};

const getNodeLabel = (nodeId) => {
  if (!props.workflow?.nodes) return nodeId;
  const node = props.workflow.nodes.find(n => n.id === nodeId);
  return node ? `${node.type}-${nodeId.slice(-4)}` : nodeId;
};

const getExecutionDuration = () => {
  if (!currentSession.value?.startTime) return '';
  const duration = Date.now() - currentSession.value.startTime.getTime();
  return `${Math.floor(duration / 1000)}s`;
};

const getOutputDataCount = (outputData) => {
  return outputData?.rows?.length || 0;
};

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString();
};
</script>

<style scoped>
.debug-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.debug-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.debug-status {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #f2f3f5;
  border-bottom: 1px solid #e5e6eb;
  font-size: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-label {
  color: #86909c;
}

.status-value {
  color: #1d2129;
  font-weight: 500;
}

.debug-content {
  flex: 1;
  overflow: hidden;
}

.logs-container,
.results-container,
.breakpoints-container,
.variables-container {
  height: 400px;
  overflow-y: auto;
}

.logs-list {
  padding: 8px;
}

.log-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #e5e6eb;
}

.log-item.log-debug {
  border-left-color: #86909c;
  background: #f7f8fa;
}

.log-item.log-info {
  border-left-color: #165dff;
  background: #f2f7ff;
}

.log-item.log-warn {
  border-left-color: #ff7d00;
  background: #fff7e8;
}

.log-item.log-error {
  border-left-color: #f53f3f;
  background: #ffece8;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-time {
  font-size: 11px;
  color: #86909c;
}

.log-message {
  font-size: 13px;
  color: #1d2129;
  line-height: 1.4;
}

.log-data {
  margin-top: 8px;
}

.log-data-content {
  font-size: 11px;
  background: #f7f8fa;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
}

.results-list {
  padding: 8px;
}

.result-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
}

.result-item.result-error {
  border-color: #f53f3f;
  background: #ffece8;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-label {
  font-weight: 500;
  color: #1d2129;
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #86909c;
}

.result-error-info {
  margin-bottom: 8px;
}

.error-message {
  color: #f53f3f;
  font-size: 13px;
  margin-bottom: 4px;
}

.error-stack {
  font-size: 11px;
  background: #f7f8fa;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
}

.result-output {
  margin-bottom: 8px;
}

.output-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
}

.output-count {
  color: #86909c;
  font-weight: normal;
}

.result-logs {
  margin-top: 8px;
}

.logs-header {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #1d2129;
}

.logs-content {
  background: #f7f8fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
}

.log-line {
  color: #4e5969;
  line-height: 1.4;
}

.breakpoints-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e6eb;
  font-size: 13px;
  font-weight: 500;
}

.breakpoints-list {
  padding: 8px;
}

.breakpoint-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: #f7f8fa;
}

.breakpoint-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breakpoint-icon {
  color: #f53f3f;
}

.breakpoint-label {
  font-size: 13px;
  color: #1d2129;
}

.variables-list {
  padding: 8px;
}

.variable-item {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.variable-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
}

.variable-value pre {
  font-size: 11px;
  background: #f7f8fa;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-logs,
.empty-results,
.empty-breakpoints,
.empty-variables {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.data-preview {
  max-height: 500px;
  overflow: auto;
}
</style>