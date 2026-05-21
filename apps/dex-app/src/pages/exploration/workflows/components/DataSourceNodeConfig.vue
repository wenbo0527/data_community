<template>
  <div class="datasource-node-config">
    <a-form :model="localConfig" layout="vertical" size="small">
      <!-- 数据源类型选择 -->
      <a-form-item label="数据源类型">
        <a-radio-group v-model="localConfig.sourceType" @change="handleConfigChange">
          <a-radio value="file">文件数据源</a-radio>
          <a-radio value="database">数据库连接</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 文件数据源配置 -->
      <div v-if="localConfig.sourceType === 'file'" class="file-config">
        <a-form-item label="选择文件">
          <a-select
            v-model="localConfig.fileId"
            placeholder="选择已上传的文件"
            @change="handleConfigChange"
          >
            <a-option
              v-for="file in fileDataSources"
              :key="file.id"
              :value="file.id"
            >
              <div class="file-option">
                <IconFile :style="{ color: getFileTypeColor(file.fileType) }" />
                <span class="file-name">{{ file.fileName }}</span>
                <span class="file-size">({{ formatFileSize(file.size) }})</span>
              </div>
            </a-option>
          </a-select>
        </a-form-item>
        
        <div v-if="selectedFile" class="file-preview">
          <div class="preview-header">
            <span class="preview-title">文件信息</span>
            <a-button type="text" size="small" @click="testFileData">
              <template #icon>
                <IconPlayArrow />
              </template>
              测试数据
            </a-button>
          </div>
          <div class="file-info">
            <div class="info-item">
              <span class="label">文件名:</span>
              <span class="value">{{ selectedFile.fileName }}</span>
            </div>
            <div class="info-item">
              <span class="label">文件类型:</span>
              <span class="value">{{ selectedFile.fileType.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <span class="label">文件大小:</span>
              <span class="value">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <div class="info-item">
              <span class="label">上传时间:</span>
              <span class="value">{{ formatDate(selectedFile.uploadTime) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="!fileDataSources.length" class="no-files">
          <a-empty description="暂无可用文件">
            <a-button type="primary" size="small" @click="goToDataSourceConfig">
              上传文件
            </a-button>
          </a-empty>
        </div>
      </div>

      <!-- 数据库连接配置 -->
      <div v-if="localConfig.sourceType === 'database'" class="database-config">
        <a-form-item label="选择连接">
          <a-select
            v-model="localConfig.connectionId"
            placeholder="选择数据库连接"
            @change="handleConfigChange"
          >
            <a-option
              v-for="db in databaseConnections"
              :key="db.id"
              :value="db.id"
            >
              <div class="db-option">
                <IconStorage :style="{ color: getDatabaseTypeColor(db.type) }" />
                <span class="db-name">{{ db.name }}</span>
                <span class="db-type">({{ db.type.toUpperCase() }})</span>
                <a-tag
                  :color="getConnectionStatusColor(db.isConnected ? 'connected' : 'disconnected')"
                  size="small"
                  class="db-status"
                >
                  {{ getConnectionStatusText(db.isConnected ? 'connected' : 'disconnected') }}
                </a-tag>
              </div>
            </a-option>
          </a-select>
        </a-form-item>
        
        <div v-if="selectedDatabase" class="database-preview">
          <div class="preview-header">
            <span class="preview-title">连接信息</span>
            <a-button type="text" size="small" @click="testDatabaseConnection">
              <template #icon>
                <IconWifi />
              </template>
              测试连接
            </a-button>
          </div>
          <div class="db-info">
            <div class="info-item">
              <span class="label">连接名称:</span>
              <span class="value">{{ selectedDatabase.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">数据库类型:</span>
              <span class="value">{{ selectedDatabase.type.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <span class="label">主机地址:</span>
              <span class="value">{{ selectedDatabase.host }}:{{ selectedDatabase.port }}</span>
            </div>
            <div class="info-item">
              <span class="label">数据库名:</span>
              <span class="value">{{ selectedDatabase.database }}</span>
            </div>
            <div class="info-item">
              <span class="label">连接状态:</span>
              <a-tag :color="getConnectionStatusColor(selectedDatabase.isConnected ? 'connected' : 'disconnected')" size="small">
                {{ getConnectionStatusText(selectedDatabase.isConnected ? 'connected' : 'disconnected') }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <div v-if="!databaseConnections.length" class="no-databases">
          <a-empty description="暂无可用连接">
            <a-button type="primary" size="small" @click="goToDataSourceConfig">
              添加连接
            </a-button>
          </a-empty>
        </div>
      </div>

      <!-- 高级配置 -->
      <a-collapse>
        <a-collapse-item header="高级配置" key="advanced">
          <a-form-item label="数据预览行数">
            <a-input-number
              v-model="localConfig.previewRows"
              :min="1"
              :max="1000"
              placeholder="默认100行"
              @change="handleConfigChange"
            />
          </a-form-item>
          
          <a-form-item label="缓存设置">
            <a-switch
              v-model="localConfig.enableCache"
              @change="handleConfigChange"
            />
            <div class="form-help">开启后将缓存数据以提高性能</div>
          </a-form-item>
          
          <a-form-item label="数据编码">
            <a-select
              v-model="localConfig.encoding"
              placeholder="选择数据编码"
              @change="handleConfigChange"
            >
              <a-option value="utf-8">UTF-8</a-option>
              <a-option value="gbk">GBK</a-option>
              <a-option value="gb2312">GB2312</a-option>
              <a-option value="ascii">ASCII</a-option>
            </a-select>
          </a-form-item>
        </a-collapse-item>
      </a-collapse>
    </a-form>

    <!-- 测试结果模态框 -->
    <a-modal
      v-model:visible="showTestModal"
      title="数据测试结果"
      width="80%"
      :footer="false"
    >
      <div class="test-result">
        <div v-if="testLoading" class="test-loading">
          <a-spin :size="32" />
          <p>正在测试数据连接...</p>
        </div>
        <div v-else-if="testData" class="test-success">
          <a-result status="success" title="测试成功" sub-title="数据源连接正常">
            <template #extra>
              <div class="test-data-preview">
                <h4>数据预览 (前{{ testData.rows?.length || 0 }}行)</h4>
                <a-table
                  v-if="testData.columns"
                  :data="testData.rows"
                  :columns="testData.columns"
                  :pagination="false"
                  size="small"
                  :scroll="{ x: 'max-content' }"
                />
                <pre v-else class="raw-data">{{ JSON.stringify(testData, null, 2) }}</pre>
              </div>
            </template>
          </a-result>
        </div>
        <div v-else class="test-error">
          <a-result
            status="error"
            title="测试失败"
            :sub-title="testError || '数据源连接失败'"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconFile,
  IconStorage,
  IconPlayArrow,
  IconWifi
} from '@arco-design/web-vue/es/icon';
import { WorkflowStorage } from '../../../../utils/workflowStorage';
// import type { FileDataSource, DatabaseConnection, DataSourceConfig } from '../../../../types/workflow';

// interface Props {
//   config: DataSourceConfig;
// }

// interface Emits {
//   (e: 'update', config: DataSourceConfig): void;
// }

const props = defineProps(['config']);
const emit = defineEmits(['update']);
const router = useRouter();

// 响应式数据
const fileDataSources = ref([]);
const databaseConnections = ref([]);
const showTestModal = ref(false);
const testLoading = ref(false);
const testData = ref(null);
const testError = ref('');

// 本地配置副本
const localConfig = ref({
  sourceType: 'file',
  fileId: '',
  connectionId: '',
  previewRows: 100,
  enableCache: true,
  encoding: 'utf-8',
  ...props.config
});

// 计算属性
const selectedFile = computed(() => {
  if (!localConfig.value.fileId) return null;
  return fileDataSources.value.find(f => f.id === localConfig.value.fileId) || null;
});

const selectedDatabase = computed(() => {
  if (!localConfig.value.connectionId) return null;
  return databaseConnections.value.find(db => db.id === localConfig.value.connectionId) || null;
});

// 方法
const loadDataSources = () => {
  const dataSources = WorkflowStorage.getDataSources();
  fileDataSources.value = dataSources.files;
  databaseConnections.value = dataSources.databases;
};

const handleConfigChange = () => {
  emit('update', { ...localConfig.value });
};

const testFileData = async () => {
  if (!selectedFile.value) {
    Message.warning('请先选择文件');
    return;
  }
  
  showTestModal.value = true;
  testLoading.value = true;
  testData.value = null;
  testError.value = '';
  
  try {
    // 模拟文件数据测试
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const file = selectedFile.value;
    if (file.fileType === 'csv' || file.fileType === 'excel') {
      // 解析表格数据
      const lines = file.content.split('\n').slice(0, localConfig.value.previewRows || 10);
      const headers = lines[0].split(',').map((h, i) => ({
        title: h.trim(),
        dataIndex: `col_${i}`,
        key: `col_${i}`,
        width: 120
      }));
      
      const rows = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        const row = { key: index };
        values.forEach((value, i) => {
          row[`col_${i}`] = value.trim();
        });
        return row;
      });
      
      testData.value = { columns: headers, rows };
    } else {
      // 其他格式数据
      testData.value = {
        content: file.content.substring(0, 1000),
        size: file.size,
        fileType: file.fileType
      };
    }
    
    Message.success('文件数据测试成功');
  } catch (error) {
    console.error('文件数据测试失败:', error);
    testError.value = '文件数据读取失败';
    Message.error('文件数据测试失败');
  } finally {
    testLoading.value = false;
  }
};

const testDatabaseConnection = async () => {
  if (!selectedDatabase.value) {
    Message.warning('请先选择数据库连接');
    return;
  }
  
  showTestModal.value = true;
  testLoading.value = true;
  testData.value = null;
  testError.value = '';
  
  try {
    // 模拟数据库连接测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟查询结果
    const mockColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
      { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 150 }
    ];
    
    const mockRows = Array.from({ length: 5 }, (_, i) => ({
      key: i,
      id: i + 1,
      name: `示例数据 ${i + 1}`,
      created_at: new Date().toISOString().split('T')[0]
    }));
    
    testData.value = { columns: mockColumns, rows: mockRows };
    
    Message.success('数据库连接测试成功');
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    testError.value = '数据库连接失败，请检查连接配置';
    Message.error('数据库连接测试失败');
  } finally {
    testLoading.value = false;
  }
};

const goToDataSourceConfig = () => {
  router.push('/exploration/workflows/datasources');
};

const getFileTypeColor = (type) => {
  const colors = {
    csv: '#52c41a',
    excel: '#1890ff',
    json: '#fa8c16',
    text: '#722ed1',
    unknown: '#8c8c8c'
  };
  return colors[type] || colors.unknown;
};

const getDatabaseTypeColor = (type) => {
  const colors = {
    mysql: '#1890ff',
    postgresql: '#722ed1',
    sqlite: '#52c41a',
    oracle: '#fa8c16',
    sqlserver: '#f5222d'
  };
  return colors[type] || '#8c8c8c';
};

const getConnectionStatusColor = (status) => {
  const colors = {
    connected: 'green',
    disconnected: 'red',
    connecting: 'orange'
  };
  return colors[status] || 'gray';
};

const getConnectionStatusText = (status) => {
  const texts = {
    connected: '已连接',
    disconnected: '未连接',
    connecting: '连接中'
  };
  return texts[status] || '未知';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

// 监听配置变化
watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...localConfig.value, ...newConfig };
  },
  { deep: true }
);

// 生命周期
onMounted(() => {
  loadDataSources();
});
</script>

<style scoped>
.datasource-node-config {
  width: 100%;
}

.file-config,
.database-config {
  margin-top: 16px;
}

.file-option,
.db-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.file-name,
.db-name {
  flex: 1;
  font-weight: 500;
}

.file-size,
.db-type {
  font-size: 12px;
  color: #86909c;
}

.db-status {
  margin-left: auto;
}

.file-preview,
.database-preview {
  margin-top: 12px;
  padding: 12px;
  background: #f2f3f5;
  border-radius: 6px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.file-info,
.db-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.info-item .label {
  color: #86909c;
  min-width: 80px;
}

.info-item .value {
  color: #1d2129;
  font-weight: 500;
  text-align: right;
}

.no-files,
.no-databases {
  margin-top: 16px;
  padding: 20px;
  text-align: center;
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.test-result {
  min-height: 200px;
}

.test-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.test-loading p {
  margin: 0;
  color: #86909c;
}

.test-data-preview {
  width: 100%;
  margin-top: 20px;
}

.test-data-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1d2129;
}

.raw-data {
  background: #f2f3f5;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow: auto;
}
</style>