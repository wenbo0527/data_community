<template>
  <div class="workflow-manager">
    <!-- 页面头部 -->
    <div class="manager-header">
      <div class="header-left">
        <h2 class="page-title">分析流程管理</h2>
        <p class="page-description">创建和管理数据分析流程，支持拖拽式可视化编辑</p>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="createWorkflow">
          <template #icon>
            <icon-plus />
          </template>
          创建流程
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <div class="search-box">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索流程名称或描述"
          style="width: 300px"
          @search="handleSearch"
        />
      </div>
      <div class="filter-box">
        <a-select
          v-model="statusFilter"
          placeholder="状态筛选"
          style="width: 120px"
          @change="handleFilter"
        >
          <a-option value="">全部状态</a-option>
          <a-option value="draft">草稿</a-option>
          <a-option value="published">已发布</a-option>
          <a-option value="archived">已归档</a-option>
        </a-select>
        <a-button @click="resetFilters">
          <template #icon>
            <icon-refresh />
          </template>
          重置
        </a-button>
      </div>
    </div>

    <!-- 流程列表 -->
    <div class="workflow-list">
      <div v-if="loading" class="loading-container">
        <a-spin :size="32" />
      </div>
      
      <div v-else-if="filteredWorkflows.length === 0" class="empty-container">
        <a-empty description="暂无流程数据">
          <a-button type="primary" @click="createWorkflow">创建第一个流程</a-button>
        </a-empty>
      </div>
      
      <div v-else class="workflow-grid">
        <div
          v-for="workflow in filteredWorkflows"
          :key="workflow.id"
          class="workflow-card"
          @click="editWorkflow(workflow.id)"
        >
          <div class="card-header">
            <div class="workflow-info">
              <h3 class="workflow-name">{{ workflow.name }}</h3>
              <p class="workflow-description">{{ workflow.description || '暂无描述' }}</p>
            </div>
            <div class="workflow-actions" @click.stop>
              <a-dropdown>
                <a-button type="text" size="small">
                  <template #icon>
                    <icon-more />
                  </template>
                </a-button>
                <template #content>
                  <a-doption @click="editWorkflow(workflow.id)">
                    <template #icon>
                      <icon-edit />
                    </template>
                    编辑
                  </a-doption>
                  <a-doption @click="duplicateWorkflow(workflow)">
                    <template #icon>
                      <icon-copy />
                    </template>
                    复制
                  </a-doption>
                  <a-doption @click="exportWorkflow(workflow)">
                    <template #icon>
                      <icon-download />
                    </template>
                    导出
                  </a-doption>
                  <a-doption @click="deleteWorkflow(workflow.id)" class="danger-option">
                    <template #icon>
                      <icon-delete />
                    </template>
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          
          <div class="card-content">
            <div class="workflow-stats">
              <div class="stat-item">
                <span class="stat-label">节点数:</span>
                <span class="stat-value">{{ workflow.nodes.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">连接数:</span>
                <span class="stat-value">{{ workflow.edges.length }}</span>
              </div>
            </div>
            
            <div class="workflow-status">
              <a-tag
                :color="getStatusColor(workflow.status)"
                class="status-tag"
              >
                {{ getStatusText(workflow.status) }}
              </a-tag>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="workflow-meta">
              <span class="meta-item">
                <icon-clock-circle />
                更新于 {{ formatDate(workflow.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconPlus,
  IconRefresh,
  IconMore,
  IconEdit,
  IconCopy,
  IconDownload,
  IconDelete,
  IconClockCircle
} from '@arco-design/web-vue/es/icon';
import { WorkflowStorage } from '../../../utils/workflowStorage';
// import type { Workflow } from '../../../types/workflow';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const workflows = ref([]);
const searchKeyword = ref('');
const statusFilter = ref('');

// 计算属性
const filteredWorkflows = computed(() => {
  let result = workflows.value;
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(workflow => 
      workflow.name.toLowerCase().includes(keyword) ||
      (workflow.description && workflow.description.toLowerCase().includes(keyword))
    );
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(workflow => workflow.status === statusFilter.value);
  }
  
  return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
});

// 方法
const loadWorkflows = async () => {
  loading.value = true;
  try {
    workflows.value = WorkflowStorage.getWorkflows();
  } catch (error) {
    console.error('加载流程列表失败:', error);
    Message.error('加载流程列表失败');
  } finally {
    loading.value = false;
  }
};

const createWorkflow = () => {
  router.push('/exploration/workflows/create');
};

const editWorkflow = (id) => {
  router.push(`/exploration/workflows/${id}/edit`);
};

const duplicateWorkflow = (workflow) => {
  const newWorkflow = {
    ...workflow,
    id: WorkflowStorage.generateId(),
    name: `${workflow.name} (副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
  };
  
  if (WorkflowStorage.saveWorkflow(newWorkflow)) {
    Message.success('流程复制成功');
    loadWorkflows();
  } else {
    Message.error('流程复制失败');
  }
};

const exportWorkflow = (workflow) => {
  try {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    Message.success('流程导出成功');
  } catch (error) {
    console.error('导出流程失败:', error);
    Message.error('导出流程失败');
  }
};

const deleteWorkflow = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这个流程吗？',
    onOk: () => {
      if (WorkflowStorage.deleteWorkflow(id)) {
        Message.success('流程删除成功');
        loadWorkflows();
      } else {
        Message.error('流程删除失败');
      }
    }
  });
};

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
};

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
};

const getStatusColor = (status) => {
  const colors = {
    draft: 'orange',
    published: 'green',
    archived: 'gray'
  };
  return colors[status] || 'blue';
};

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  };
  return texts[status] || '未知';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return date.toLocaleDateString();
  }
};

// 生命周期
onMounted(() => {
  loadWorkflows();
});
</script>

<style scoped>
.workflow-manager {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.search-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
}

.filter-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.workflow-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 24px;
}

.workflow-card {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.workflow-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.workflow-info {
  flex: 1;
  min-width: 0;
}

.workflow-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-description {
  margin: 0;
  font-size: 14px;
  color: #86909c;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.workflow-actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.card-content {
  margin-bottom: 16px;
}

.workflow-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.stat-label {
  color: #86909c;
}

.stat-value {
  color: #1d2129;
  font-weight: 500;
}

.workflow-status {
  display: flex;
  justify-content: flex-end;
}

.status-tag {
  font-size: 12px;
}

.card-footer {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.workflow-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.danger-option {
  color: #f53f3f !important;
}
</style>