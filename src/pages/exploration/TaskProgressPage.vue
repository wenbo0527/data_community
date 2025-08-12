<template>
  <div class="task-progress-page">
    <div class="page-header">
      <h2>{{ taskName || '任务进度详情' }}</h2>
      <p class="task-id">任务ID: {{ taskId }}</p>
      
      <!-- 状态提示 -->
      <a-alert 
        v-if="taskStatus === '进行中' || taskStatus === 'running'"
        type="info"
        :message="`任务正在执行中，当前进度 ${progressPercent}%`"
        :description="`执行时长: ${executionDuration} | 预计剩余: ${estimatedRemainingTime}`"
        show-icon
        style="margin-bottom: 16px;"
      />
      
      <a-alert 
        v-else-if="taskStatus === '已完成' || taskStatus === 'completed'"
        type="success"
        message="任务执行完成"
        :description="`总执行时长: ${executionDuration}`"
        show-icon
        style="margin-bottom: 16px;"
      />
      
      <a-alert 
        v-else-if="taskStatus === '已失败' || taskStatus === 'failed'"
        type="error"
        message="任务执行失败"
        :description="errorMessage || '任务执行过程中发生错误，请查看执行日志或重试任务'"
        show-icon
        style="margin-bottom: 16px;"
      />
    </div>
    
    <a-card class="progress-card" title="任务执行进度">
      <a-steps :current="currentStep" style="margin-bottom: 30px;">
        <a-step>任务创建</a-step>
        <a-step>数据处理</a-step>
        <a-step>模型分析</a-step>
        <a-step>报告生成</a-step>
        <a-step>完成</a-step>
      </a-steps>
      
      <div class="progress-details">
        <a-progress 
          :percent="progressPercent" 
          :status="progressStatus" 
          :show-text="true" 
          style="margin-bottom: 20px;"
        />
        
        <!-- 实时状态显示 -->
        <a-alert 
          v-if="taskStatus === '进行中'" 
          type="info" 
          :message="statusMessage" 
          :description="`进度: ${progressPercent}% | 预计剩余时间: ${estimatedRemainingTime}`"
          show-icon 
          style="margin-bottom: 20px;"
        />
        <a-alert 
          v-else-if="taskStatus === '已完成'" 
          type="success" 
          message="任务执行完成" 
          description="分析报告已生成，您可以查看详细报告。"
          show-icon 
          style="margin-bottom: 20px;"
        />
        <a-alert 
          v-else-if="taskStatus === '已失败'" 
          type="error" 
          message="任务执行失败" 
          :description="errorMessage || '任务执行过程中发生错误，请查看执行日志了解详情。'"
          show-icon 
          style="margin-bottom: 20px;"
        />
        
        <div class="task-info">
          <a-descriptions title="任务基本信息" :column="1" bordered>
            <a-descriptions-item label="任务ID">{{ taskId }}</a-descriptions-item>
            <a-descriptions-item label="任务名称">{{ taskName }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ createTime }}</a-descriptions-item>
            <a-descriptions-item label="预计完成时间">{{ estimatedTime }}</a-descriptions-item>
            <a-descriptions-item label="任务状态">
              <a-tag :color="getStatusColor(taskStatus)">{{ taskStatus }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="执行时长">{{ executionDuration }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="task-config" style="margin-top: 20px;">
          <a-descriptions title="任务配置信息" :column="1" bordered>
            <a-descriptions-item label="产品名称">{{ taskConfig.productName }}</a-descriptions-item>
            <a-descriptions-item label="报告类型">{{ taskConfig.reportType }}</a-descriptions-item>
            <a-descriptions-item label="分析周期">{{ taskConfig.analysisPeriod }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <!-- 执行日志 -->
        <div class="execution-logs" style="margin-top: 20px;">
          <a-card title="执行日志" size="small">
            <div class="log-container">
              <div 
                v-for="(log, index) in executionLogs" 
                :key="index" 
                class="log-item"
                :class="log.type"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
              <div v-if="executionLogs.length === 0" class="no-logs">
                暂无执行日志
              </div>
            </div>
          </a-card>
        </div>
        
        <div class="action-buttons">
          <a-button @click="goToList">返回任务列表</a-button>
          <a-button type="primary" @click="refreshProgress" :loading="refreshing">刷新进度</a-button>
          <a-button 
            v-if="taskStatus === '已失败'" 
            type="outline" 
            status="warning" 
            @click="retryTask"
            :loading="retrying"
          >
            重试任务
          </a-button>
          <a-button 
            v-if="taskStatus === '已完成'" 
            type="primary" 
            status="success" 
            @click="viewReport"
          >
            查看报告
          </a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Message,
  Steps as ASteps,
  Step as AStep,
  Progress as AProgress,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Button as AButton,
  Alert as AAlert,
  Tag as ATag,
  Card as ACard
} from '@arco-design/web-vue';

// 导入任务API服务
import { getTaskDetail } from '@/api/external/task.ts';

// 获取路由和路由参数
const route = useRoute();
const router = useRouter();

// 任务信息
const taskId = ref('');
const taskName = ref('');
const createTime = ref('');
const estimatedTime = ref('');
const taskStatus = ref('');
const taskConfig = ref({
  productName: '',
  reportType: '',
  analysisPeriod: ''
});

// 进度信息
const currentStep = ref(0);
const progressPercent = ref(0);
const progressStatus = ref<'normal' | 'success' | 'warning' | 'danger'>('normal');
const statusMessage = ref('任务已创建，正在准备执行...');

// 新增功能变量
const refreshing = ref(false);
const retrying = ref(false);
const errorMessage = ref('');
const executionLogs = ref<Array<{time: string, message: string, type: string}>>([]);
const autoRefreshTimer = ref<NodeJS.Timeout | null>(null);
const startTime = ref('');

// 计算属性
const executionDuration = computed(() => {
  if (!startTime.value) return '-';
  const start = new Date(startTime.value).getTime();
  const now = new Date().getTime();
  const duration = Math.floor((now - start) / 1000);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const estimatedRemainingTime = computed(() => {
  if (progressPercent.value === 0) return '计算中...';
  if (progressPercent.value >= 100) return '已完成';
  
  const elapsed = startTime.value ? (new Date().getTime() - new Date(startTime.value).getTime()) / 1000 : 0;
  const totalEstimated = elapsed / (progressPercent.value / 100);
  const remaining = Math.max(0, totalEstimated - elapsed);
  
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);
  return `约 ${minutes} 分 ${seconds} 秒`;
});

// 初始化任务信息
const initTaskInfo = async () => {
  // 从路由参数获取任务ID
  const taskIdParam = route.query.taskId;
  if (!taskIdParam) {
    Message.error('任务ID不存在');
    goToList();
    return;
  }

  taskId.value = taskIdParam.toString();
  taskName.value = route.query.taskName ? route.query.taskName.toString() : '未知任务';

  try {
    // 调用API获取任务详情
    const response = await getTaskDetail(parseInt(taskId.value));
    if (response.code === 200 && response.data) {
      const taskData = response.data;
      taskName.value = taskData.taskName || '未知任务';
      createTime.value = taskData.createTime || '';
      estimatedTime.value = taskData.estimatedTime || '';
      taskStatus.value = taskData.status || '';
      taskConfig.value = taskData.config || {};
      progressPercent.value = taskData.progress || 0;

      // 设置开始时间
      if (!startTime.value && taskData.status === '进行中') {
        startTime.value = taskData.createTime;
      }
      
      // 初始化执行日志
      if (executionLogs.value.length === 0) {
        executionLogs.value = [
          { time: taskData.createTime, message: '任务已创建', type: 'info' },
          { time: taskData.createTime, message: '开始数据收集...', type: 'info' }
        ];
      }

      // 根据进度更新步骤和状态
      updateStepAndStatus();
      
      // 启动自动刷新（仅当任务运行中时）
      if (taskData.status === '进行中' && !autoRefreshTimer.value) {
        startAutoRefresh();
      }
    } else {
      Message.error('获取任务详情失败: ' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    errorMessage.value = '获取任务详情失败';
    Message.error('网络异常，获取任务详情失败');
  }
};

// 根据进度更新步骤和状态
const updateStepAndStatus = () => {
  if (progressPercent.value >= 20) currentStep.value = 1;
  if (progressPercent.value >= 40) currentStep.value = 2;
  if (progressPercent.value >= 60) currentStep.value = 3;
  if (progressPercent.value >= 100) {
    currentStep.value = 4;
    progressStatus.value = 'success';
    statusMessage.value = '任务已完成，报告已生成。';
  } else if (taskStatus.value === '已失败') {
    progressStatus.value = 'danger';
    statusMessage.value = '任务执行失败，请查看日志了解详情。';
  } else {
    // 根据当前步骤设置状态消息
    if (currentStep.value === 0) {
      statusMessage.value = '任务已创建，正在准备执行...';
    } else if (currentStep.value === 1) {
      statusMessage.value = '正在处理数据，请稍候...';
    } else if (currentStep.value === 2) {
      statusMessage.value = '正在进行模型分析...';
    } else if (currentStep.value === 3) {
      statusMessage.value = '正在生成报告...';
    }
  }
}

// 模拟进度更新
const updateProgress = () => {
  // 模拟进度更新逻辑
  if (progressPercent.value < 100) {
    // 随机增加进度
    const increment = Math.floor(Math.random() * 10) + 1;
    progressPercent.value = Math.min(progressPercent.value + increment, 100);
    
    // 根据进度更新步骤
    if (progressPercent.value >= 20) currentStep.value = 1;
    if (progressPercent.value >= 40) currentStep.value = 2;
    if (progressPercent.value >= 60) currentStep.value = 3;
    if (progressPercent.value >= 100) {
      currentStep.value = 4;
      progressStatus.value = 'success';
      statusMessage.value = '任务已完成，报告已生成。';
    }
    
    // 更新状态消息
    if (currentStep.value === 0) {
      statusMessage.value = '任务已创建，正在准备执行...';
    } else if (currentStep.value === 1) {
      statusMessage.value = '正在处理数据，请稍候...';
    } else if (currentStep.value === 2) {
      statusMessage.value = '正在进行模型分析...';
    } else if (currentStep.value === 3) {
      statusMessage.value = '正在生成报告...';
    }
  }
};

// 自动刷新功能
const startAutoRefresh = () => {
  if (autoRefreshTimer.value) return;
  
  autoRefreshTimer.value = setInterval(async () => {
    if (taskStatus.value === 'running' || taskStatus.value === '进行中') {
      await refreshProgress(true);
    } else {
      stopAutoRefresh();
    }
  }, 3000); // 每3秒刷新一次
};

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
};

// 刷新进度
const refreshProgress = async (isAuto = false) => {
  if (!isAuto) {
    refreshing.value = true;
  }
  
  try {
    // 调用API获取最新任务详情
    const response = await getTaskDetail(parseInt(taskId.value));
    if (response.code === 200 && response.data) {
      const taskData = response.data;
      progressPercent.value = taskData.progress || 0;
      taskStatus.value = taskData.status || '';

      // 更新步骤和状态
      updateStepAndStatus();
      
      if (!isAuto) {
        Message.success('进度已刷新');
      }
      
      // 添加执行日志
      const now = new Date().toLocaleString();
      if (progressPercent.value > 0) {
        executionLogs.value.push({
          time: now,
          message: `进度更新: ${progressPercent.value}%`,
          type: 'info'
        });
      }
    } else {
      if (!isAuto) {
        Message.error('刷新进度失败: ' + (response.message || '未知错误'));
      }
    }
  } catch (error) {
    console.error('刷新进度失败:', error);
    if (!isAuto) {
      Message.error('网络异常，刷新进度失败');
    }
  } finally {
    if (!isAuto) {
      refreshing.value = false;
    }
  }
};

// 重试任务
const retryTask = async () => {
  retrying.value = true;
  
  try {
    // 模拟重试API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 重置任务状态
    taskStatus.value = 'running';
    progressPercent.value = 0;
    currentStep.value = 0;
    errorMessage.value = '';
    
    // 添加重试日志
    const now = new Date().toLocaleString();
    executionLogs.value.push({
      time: now,
      message: '任务已重新启动',
      type: 'success'
    });
    
    // 重新启动自动刷新
    startAutoRefresh();
    
    Message.success('任务重试成功');
  } catch (error) {
    Message.error('重试失败');
  } finally {
    retrying.value = false;
  }
};

// 查看报告
const viewReport = () => {
  // 跳转到报告详情页
  router.push(`/exploration/external-data-evaluation/report/${taskId.value}`);
};

// 返回任务列表
const goToList = () => {
  router.push('/exploration/external-data-evaluation/task-list');
};

// 组件挂载时初始化
onMounted(() => {
  initTaskInfo();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.task-progress-page {
  padding: 20px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 60px);
}

.progress-card {
  max-width: 800px;
  margin: 0 auto;
}

.progress-details {
  margin-top: 20px;
}

.task-info {
  margin-bottom: 20px;
}

.current-status {
  margin-bottom: 20px;
}

.current-status h4 {
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>