<template>
  <div class="workflow-create">
    <!-- 页面头部 -->
    <div class="create-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回
        </a-button>
        <div class="header-title">
          <h2>创建分析流程</h2>
          <p>配置基本信息后开始构建您的数据分析流程</p>
        </div>
      </div>
      <div class="header-right">
        <a-button @click="goBack">取消</a-button>
        <a-button type="primary" :loading="creating" @click="createWorkflow">
          创建流程
        </a-button>
      </div>
    </div>

    <!-- 创建表单 -->
    <div class="create-form">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        @submit="createWorkflow"
      >
        <a-row :gutter="24">
          <a-col :span="16">
            <!-- 基本信息 -->
            <a-card title="基本信息" class="form-card">
              <a-form-item field="name" label="流程名称" required>
                <a-input
                  v-model="formData.name"
                  placeholder="请输入流程名称"
                  :max-length="50"
                  show-word-limit
                />
              </a-form-item>
              
              <a-form-item field="description" label="流程描述">
                <a-textarea
                  v-model="formData.description"
                  placeholder="请输入流程描述（可选）"
                  :max-length="200"
                  :rows="4"
                  show-word-limit
                />
              </a-form-item>
              
              <a-form-item field="tags" label="标签">
                <a-select
                  v-model="formData.tags"
                  placeholder="选择标签便于分类管理"
                  multiple
                  :max-tag-count="3"
                  allow-clear
                >
                  <a-option value="风险">风险</a-option>
                  <a-option value="营销">营销</a-option>
                  <a-option value="其他">其他</a-option>
                </a-select>
              </a-form-item>
            </a-card>

            <!-- 模板选择 -->
            <a-card title="选择模板" class="form-card">
              <div class="template-grid">
                <div
                  v-for="template in templates"
                  :key="template.id"
                  class="template-item"
                  :class="{ active: selectedTemplate === template.id }"
                  @click="selectTemplate(template.id)"
                >
                  <div class="template-icon">
                    <component :is="template.icon" />
                  </div>
                  <div class="template-info">
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.description }}</p>
                  </div>
                  <div class="template-check">
                    <icon-check v-if="selectedTemplate === template.id" />
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <!-- 配置选项 -->
            <a-card title="配置选项" class="form-card">
              <a-form-item field="autoSave" label="自动保存">
                <a-switch v-model="formData.autoSave" />
                <div class="form-help">开启后将自动保存流程变更</div>
              </a-form-item>
              
              <a-form-item field="debugMode" label="调试模式">
                <a-switch v-model="formData.debugMode" />
                <div class="form-help">开启后可查看详细的执行日志</div>
              </a-form-item>
            </a-card>

            <!-- 预览信息 -->
            <a-card title="流程预览" class="form-card">
              <div class="preview-info">
                <div class="preview-item">
                  <span class="label">流程名称:</span>
                  <span class="value">{{ formData.name || '未设置' }}</span>
                </div>
                <div class="preview-item">
                  <span class="label">选择模板:</span>
                  <span class="value">{{ getSelectedTemplateName() }}</span>
                </div>
                <div class="preview-item">
                  <span class="label">标签数量:</span>
                  <span class="value">{{ formData.tags.length }} 个</span>
                </div>
                <div class="preview-item">
                  <span class="label">自动保存:</span>
                  <span class="value">{{ formData.autoSave ? '开启' : '关闭' }}</span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconArrowLeft,
  IconCheck,
  IconFile,
  IconStorage,
  IconCode,
  IconBranch
} from '@arco-design/web-vue/es/icon';
import { WorkflowStorage } from '../../../utils/workflowStorage';
// import type { Workflow } from '../../../types/workflow';

const router = useRouter();
const formRef = ref();
const creating = ref(false);
const selectedTemplate = ref('blank');

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  tags: [],
  autoSave: true,
  debugMode: false
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入流程名称' },
    { min: 2, max: 50, message: '流程名称长度为2-50个字符' }
  ]
};

// 模板配置
const templates = [
  {
    id: 'blank',
    name: '空白流程',
    description: '从零开始创建自定义流程',
    icon: 'IconFile',
    nodes: []
  },
  {
    id: 'data-import',
    name: '数据导入模板',
    description: '包含文件上传和数据库连接节点',
    icon: 'IconStorage',
    nodes: [
      {
        id: 'datasource-1',
        type: 'datasource',
        position: { x: 100, y: 100 },
        config: { sourceType: 'file' }
      }
    ]
  },
  {
    id: 'sql-analysis',
    name: 'SQL分析模板',
    description: '包含数据源和SQL处理节点',
    icon: 'IconCode',
    nodes: [
      {
        id: 'datasource-1',
        type: 'datasource',
        position: { x: 100, y: 100 },
        config: { sourceType: 'database' }
      },
      {
        id: 'sql-1',
        type: 'sql',
        position: { x: 300, y: 100 },
        config: { query: 'SELECT * FROM table_name LIMIT 10' }
      }
    ]
  },
  {
    id: 'python-pipeline',
    name: 'Python处理流水线',
    description: '包含完整的Python数据处理流程',
    icon: 'IconBranch',
    nodes: [
      {
        id: 'datasource-1',
        type: 'datasource',
        position: { x: 100, y: 100 },
        config: { sourceType: 'file' }
      },
      {
        id: 'python-1',
        type: 'python',
        position: { x: 300, y: 100 },
        config: { code: '# 数据处理代码\nimport pandas as pd\n\n# 处理数据\nresult = data.head(10)' }
      }
    ]
  }
];

// 方法
const goBack = () => {
  router.push('/exploration/workflows');
};

const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId;
};

const getSelectedTemplateName = () => {
  const template = templates.find(t => t.id === selectedTemplate.value);
  return template ? template.name : '未选择';
};

const createWorkflow = async (event) => {
  try {
    // 阻止表单默认提交行为
    if (event) {
      event.preventDefault();
    }
    
    // 表单验证
    try {
      await formRef.value?.validate();
    } catch (error) {
      Message.error('请完善表单信息');
      return;
    }
    
    creating.value = true;
    
    // 获取选中的模板
    const template = templates.find(t => t.id === selectedTemplate.value);
    
    // 创建新的工作流
    const newWorkflow = {
      id: WorkflowStorage.generateId(),
      name: formData.name,
      description: formData.description,
      tags: formData.tags,
      nodes: template?.nodes || [],
      edges: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存工作流
    const success = WorkflowStorage.saveWorkflow(newWorkflow);
    
    if (success) {
      Message.success('流程创建成功');
      // 跳转到编辑页面
      router.push(`/exploration/workflows/${newWorkflow.id}/edit`);
    } else {
      Message.error('流程创建失败');
    }
  } catch (error) {
    console.error('创建流程失败:', error);
    Message.error('流程创建失败');
  } finally {
    creating.value = false;
  }
};
</script>

<style scoped>
.workflow-create {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.header-title p {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

.header-right {
  display: flex;
  gap: 12px;
}

.create-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.form-card {
  margin-bottom: 24px;
}

.form-card:last-child {
  margin-bottom: 0;
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #165dff;
  background: #f2f6ff;
}

.template-item.active {
  border-color: #165dff;
  background: #f2f6ff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.template-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
  border-radius: 6px;
  margin-right: 12px;
  font-size: 20px;
  color: #165dff;
}

.template-item.active .template-icon {
  background: #165dff;
  color: white;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.template-info p {
  margin: 0;
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.template-check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #165dff;
  font-size: 16px;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f2f3f5;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  font-size: 14px;
  color: #86909c;
}

.preview-item .value {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}
</style>