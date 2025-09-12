<template>
  <a-modal
    v-model:visible="visible"
    :title="`${modelName} - 版本历史`"
    width="1200px"
    :footer="false"
    @cancel="handleClose"
  >
    <div class="version-history-container">
      <!-- 版本列表 -->
      <div class="version-list" v-if="!showComparison">
        <div class="version-header">
          <h3>版本列表</h3>
          <a-button type="primary" @click="handleCreateVersion">
            <template #icon><icon-plus /></template>
            创建新版本
          </a-button>
        </div>
        
        <a-table
          :data="versionList"
          :pagination="false"
          :loading="loading"
        >
          <template #columns>
            <a-table-column title="版本号" data-index="version">
              <template #cell="{ record }">
                <a-tag :color="record.isCurrent ? 'green' : 'blue'">
                  {{ record.version }}
                  <span v-if="record.isCurrent"> (当前)</span>
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createdAt">
              <template #cell="{ record }">
                {{ formatDate(record.createdAt) }}
              </template>
            </a-table-column>
            <a-table-column title="创建人" data-index="createdBy" />
            <a-table-column title="变更说明" data-index="description" />
            <a-table-column title="操作" align="center" :width="200">
              <template #cell="{ record, rowIndex }">
                <a-space>
                  <a-button 
                    size="small" 
                    @click="handleViewVersion(record)"
                    :disabled="record.isCurrent"
                  >
                    查看
                  </a-button>
                  <a-button 
                    size="small" 
                    @click="handleCompareVersion(record, rowIndex)"
                    :disabled="versionList.length < 2"
                  >
                    对比
                  </a-button>
                  <a-popconfirm
                    content="确定要回滚到此版本吗？"
                    @ok="handleRollback(record.version)"
                  >
                    <a-button 
                      size="small" 
                      type="outline"
                      status="warning"
                      :disabled="record.isCurrent"
                    >
                      回滚
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <!-- 版本对比 -->
      <div class="version-comparison" v-if="showComparison">
        <div class="comparison-header">
          <a-button @click="backToList">
            <template #icon><icon-left /></template>
            返回版本列表
          </a-button>
          <h3>版本对比</h3>
        </div>
        
        <div class="comparison-selector">
          <a-space>
            <span>对比版本：</span>
            <a-select v-model="compareVersions.left" placeholder="选择版本" style="width: 150px">
              <a-option v-for="version in versionList" :key="version.version" :value="version.version">
                {{ version.version }}
              </a-option>
            </a-select>
            <span>vs</span>
            <a-select v-model="compareVersions.right" placeholder="选择版本" style="width: 150px">
              <a-option v-for="version in versionList" :key="version.version" :value="version.version">
                {{ version.version }}
              </a-option>
            </a-select>
            <a-button type="primary" @click="loadComparison" :disabled="!compareVersions.left || !compareVersions.right">
              开始对比
            </a-button>
          </a-space>
        </div>

        <div class="comparison-content" v-if="comparisonData">
          <div class="comparison-grid">
            <div class="comparison-left">
              <h4>{{ compareVersions.left }}</h4>
              <div class="code-content">
                <pre><code v-html="highlightDifferences(comparisonData.left, 'left')"></code></pre>
              </div>
            </div>
            <div class="comparison-right">
              <h4>{{ compareVersions.right }}</h4>
              <div class="code-content">
                <pre><code v-html="highlightDifferences(comparisonData.right, 'right')"></code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建版本模态框 -->
    <a-modal
      v-model:visible="showCreateVersion"
      title="创建新版本"
      @ok="handleCreateVersionConfirm"
      @cancel="showCreateVersion = false"
    >
      <a-form :model="newVersionForm" layout="vertical">
        <a-form-item label="变更说明" required>
          <a-textarea 
            v-model="newVersionForm.description" 
            placeholder="请输入版本变更说明"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconPlus, IconLeft } from '@arco-design/web-vue/es/icon';
import { getVersionHistory, createVersion, rollbackVersion, getVersionComparison } from '@/api/dataModels';

interface Props {
  visible: boolean;
  modelId: string;
  modelName: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const loading = ref(false);
const versionList = ref([]);
const showComparison = ref(false);
const showCreateVersion = ref(false);

// 版本对比相关
const compareVersions = reactive({
  left: '',
  right: ''
});
const comparisonData = ref(null);

// 创建版本表单
const newVersionForm = reactive({
  description: ''
});

// 监听模态框显示状态
watch(() => props.visible, (newVal) => {
  if (newVal && props.modelId) {
    loadVersionHistory();
  }
});

// 加载版本历史
const loadVersionHistory = async () => {
  if (!props.modelId) return;
  
  loading.value = true;
  try {
    const response = await getVersionHistory(props.modelId);
    if (response.code === 200) {
      versionList.value = response.data;
    } else {
      Message.error(response.message || '加载版本历史失败');
    }
  } catch (error) {
    Message.error('加载版本历史失败');
    console.error('Load version history error:', error);
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 查看版本
const handleViewVersion = (version: any) => {
  // 这里可以实现查看特定版本的详情
  Message.info(`查看版本 ${version.version}`);
};

// 对比版本
const handleCompareVersion = (version: any, index: number) => {
  showComparison.value = true;
  compareVersions.left = version.version;
  // 默认选择下一个版本进行对比
  if (index < versionList.value.length - 1) {
    compareVersions.right = versionList.value[index + 1].version;
  } else if (index > 0) {
    compareVersions.right = versionList.value[index - 1].version;
  }
};

// 返回版本列表
const backToList = () => {
  showComparison.value = false;
  compareVersions.left = '';
  compareVersions.right = '';
  comparisonData.value = null;
};

// 加载对比数据
const loadComparison = async () => {
  if (!compareVersions.left || !compareVersions.right) return;
  
  loading.value = true;
  try {
    const response = await getVersionComparison(props.modelId, compareVersions.left, compareVersions.right);
    if (response.code === 200) {
      comparisonData.value = response.data;
    } else {
      Message.error(response.message || '加载对比数据失败');
    }
  } catch (error) {
    Message.error('加载对比数据失败');
    console.error('Load comparison error:', error);
  } finally {
    loading.value = false;
  }
};

// 高亮差异
const highlightDifferences = (content: string, side: 'left' | 'right') => {
  if (!comparisonData.value) return content;
  
  // 这里实现简单的差异高亮逻辑
  // 实际项目中可以使用更专业的diff库
  return content.replace(/\n/g, '<br>');
};

// 版本回滚
const handleRollback = async (version: string) => {
  loading.value = true;
  try {
    const response = await rollbackVersion(props.modelId, version);
    if (response.code === 200) {
      Message.success('版本回滚成功');
      await loadVersionHistory();
    } else {
      Message.error(response.message || '版本回滚失败');
    }
  } catch (error) {
    Message.error('版本回滚失败');
    console.error('Rollback error:', error);
  } finally {
    loading.value = false;
  }
};

// 创建版本
const handleCreateVersion = () => {
  showCreateVersion.value = true;
  newVersionForm.description = '';
};

// 确认创建版本
const handleCreateVersionConfirm = async () => {
  if (!newVersionForm.description.trim()) {
    Message.warning('请输入变更说明');
    return;
  }
  
  loading.value = true;
  try {
    const response = await createVersion(props.modelId, {
      description: newVersionForm.description
    });
    if (response.code === 200) {
      Message.success('版本创建成功');
      showCreateVersion.value = false;
      await loadVersionHistory();
    } else {
      Message.error(response.message || '版本创建失败');
    }
  } catch (error) {
    Message.error('版本创建失败');
    console.error('Create version error:', error);
  } finally {
    loading.value = false;
  }
};

// 关闭模态框
const handleClose = () => {
  visible.value = false;
  showComparison.value = false;
  showCreateVersion.value = false;
  compareVersions.left = '';
  compareVersions.right = '';
  comparisonData.value = null;
};
</script>

<style scoped>
.version-history-container {
  min-height: 500px;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.version-header h3 {
  margin: 0;
}

.comparison-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.comparison-header h3 {
  margin: 0;
}

.comparison-selector {
  margin-bottom: 24px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 400px;
}

.comparison-left,
.comparison-right {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.comparison-left h4,
.comparison-right h4 {
  margin: 0;
  padding: 12px 16px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  font-size: 14px;
  font-weight: 500;
}

.code-content {
  height: calc(100% - 45px);
  overflow: auto;
  padding: 16px;
  background: #fff;
}

.code-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-content code {
  background: none;
  padding: 0;
  border-radius: 0;
}

/* 差异高亮样式 */
.diff-added {
  background-color: #e6ffed;
  color: #52c41a;
}

.diff-removed {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.diff-modified {
  background-color: #fff7e6;
  color: #fa8c16;
}
</style>