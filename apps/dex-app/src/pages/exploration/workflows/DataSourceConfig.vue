<template>
  <div class="datasource-config">
    <!-- 页面头部 -->
    <div class="config-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon>
            <IconArrowLeft />
          </template>
          返回
        </a-button>
        <div class="header-title">
          <h2>数据源配置</h2>
          <p>管理文件数据源和数据库连接配置</p>
        </div>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          添加数据源
        </a-button>
      </div>
    </div>

    <!-- 数据源列表 -->
    <div class="config-content">
      <a-tabs v-model:active-key="activeTab" type="card">
        <!-- 文件数据源 -->
        <a-tab-pane key="files" title="文件数据源">
          <div class="datasource-section">
            <div v-if="fileDataSources.length === 0" class="empty-state">
              <a-empty description="暂无文件数据源">
                <a-button type="primary" @click="addFileDataSource">
                  上传文件
                </a-button>
              </a-empty>
            </div>
            
            <div v-else class="datasource-grid">
              <div
                v-for="file in fileDataSources"
                :key="file.id"
                class="datasource-card"
              >
                <div class="card-header">
                  <div class="file-icon">
                    <IconFile :style="{ color: getFileTypeColor(file.fileType) }" />
                  </div>
                  <div class="file-info">
                    <h4 class="file-name">{{ file.fileName }}</h4>
                    <p class="file-meta">
                      {{ formatFileSize(file.size) }} • {{ file.fileType }}
                    </p>
                  </div>
                  <div class="card-actions">
                    <a-dropdown>
                      <a-button type="text" size="small">
                        <template #icon>
                          <IconMore />
                        </template>
                      </a-button>
                      <template #content>
                        <a-doption @click="previewFileData(file)">
                          <template #icon>
                            <IconEye />
                          </template>
                          预览
                        </a-doption>
                        <a-doption @click="downloadFile(file)">
                          <template #icon>
                            <IconDownload />
                          </template>
                          下载
                        </a-doption>
                        <a-doption @click="deleteDataSource(file.id, 'file')" class="danger-option">
                          <template #icon>
                            <IconDelete />
                          </template>
                          删除
                        </a-doption>
                      </template>
                    </a-dropdown>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="file-stats">
                    <div class="stat-item">
                      <span class="stat-label">上传时间:</span>
                      <span class="stat-value">{{ formatDate(file.uploadTime) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">状态:</span>
                      <a-tag :color="file.status === 'ready' ? 'green' : 'orange'" size="small">
                        {{ file.status === 'ready' ? '就绪' : '处理中' }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 数据库连接 -->
        <a-tab-pane key="databases" title="数据库连接">
          <div class="datasource-section">
            <div v-if="databaseConnections.length === 0" class="empty-state">
              <a-empty description="暂无数据库连接">
                <a-button type="primary" @click="addDatabaseConnection">
                  添加连接
                </a-button>
              </a-empty>
            </div>
            
            <div v-else class="datasource-grid">
              <div
                v-for="db in databaseConnections"
                :key="db.id"
                class="datasource-card"
              >
                <div class="card-header">
                  <div class="db-icon">
                    <IconStorage :style="{ color: getDatabaseTypeColor(db.type) }" />
                  </div>
                  <div class="db-info">
                    <h4 class="db-name">{{ db.name }}</h4>
                    <p class="db-meta">
                      {{ db.type.toUpperCase() }} • {{ db.host }}:{{ db.port }}
                    </p>
                  </div>
                  <div class="card-actions">
                    <a-dropdown>
                      <a-button type="text" size="small">
                        <template #icon>
                          <IconMore />
                        </template>
                      </a-button>
                      <template #content>
                        <a-doption @click="testConnection(db)">
                          <template #icon>
                            <IconWifi />
                          </template>
                          测试连接
                        </a-doption>
                        <a-doption @click="editDatabase(db)">
                          <template #icon>
                            <IconEdit />
                          </template>
                          编辑
                        </a-doption>
                        <a-doption @click="deleteDataSource(db.id, 'database')" class="danger-option">
                          <template #icon>
                            <IconDelete />
                          </template>
                          删除
                        </a-doption>
                      </template>
                    </a-dropdown>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="db-stats">
                    <div class="stat-item">
                      <span class="stat-label">数据库:</span>
                      <span class="stat-value">{{ db.database }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">状态:</span>
                      <a-tag :color="getConnectionStatusColor(db.isConnected ? 'connected' : 'disconnected')" size="small">
                        {{ getConnectionStatusText(db.isConnected ? 'connected' : 'disconnected') }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 添加数据源模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      title="添加数据源"
      width="600px"
      @ok="handleAddDataSource"
      @cancel="resetAddForm"
    >
      <a-tabs v-model:active-key="addType">
        <a-tab-pane key="file" title="文件上传">
          <div class="add-file-section">
            <a-upload
              ref="uploadRef"
              :file-list="uploadFileList"
              :auto-upload="false"
              :show-file-list="true"
              :accept="'.csv,.xlsx,.xls,.json,.txt'"
              @change="handleFileChange"
            >
              <template #upload-button>
                <div class="upload-area">
                  <IconUpload class="upload-icon" />
                  <div class="upload-text">
                    <p>点击或拖拽文件到此区域上传</p>
                    <p class="upload-hint">支持 CSV、Excel、JSON、TXT 格式</p>
                  </div>
                </div>
              </template>
            </a-upload>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="database" title="数据库连接">
          <a-form
            ref="dbFormRef"
            :model="dbForm"
            :rules="dbFormRules"
            layout="vertical"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="name" label="连接名称" required>
                  <a-input v-model="dbForm.name" placeholder="请输入连接名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="type" label="数据库类型" required>
                  <a-select v-model="dbForm.type" placeholder="选择数据库类型">
                    <a-option value="mysql">MySQL</a-option>
                    <a-option value="postgresql">PostgreSQL</a-option>
                    <a-option value="sqlite">SQLite</a-option>
                    <a-option value="oracle">Oracle</a-option>
                    <a-option value="sqlserver">SQL Server</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="host" label="主机地址" required>
                  <a-input v-model="dbForm.host" placeholder="localhost" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="port" label="端口" required>
                  <a-input-number
                    v-model="dbForm.port"
                    placeholder="3306"
                    :min="1"
                    :max="65535"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item field="database" label="数据库名" required>
              <a-input v-model="dbForm.database" placeholder="请输入数据库名" />
            </a-form-item>
            
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="username" label="用户名" required>
                  <a-input v-model="dbForm.username" placeholder="请输入用户名" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="password" label="密码" required>
                  <a-input-password v-model="dbForm.password" placeholder="请输入密码" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 文件预览模态框 -->
    <a-modal
      v-model:visible="showPreviewModal"
      :title="`预览 - ${previewFileRef?.name}`"
      width="80%"
      :footer="false"
    >
      <div class="file-preview">
        <div v-if="previewLoading" class="preview-loading">
          <a-spin :size="32" />
        </div>
        <div v-else-if="previewData" class="preview-content">
          <!-- CSV/Excel 表格预览 -->
          <div v-if="isTableFile(previewFileRef?.type)" class="table-preview">
            <a-table
              :data="previewData.rows"
              :columns="previewData.columns"
              :pagination="{ pageSize: 10 }"
              size="small"
            />
          </div>
          <!-- JSON 预览 -->
          <div v-else-if="previewFileRef?.type === 'json'" class="json-preview">
            <pre>{{ JSON.stringify(previewData, null, 2) }}</pre>
          </div>
          <!-- 文本预览 -->
          <div v-else class="text-preview">
            <pre>{{ previewData }}</pre>
          </div>
        </div>
        <div v-else class="preview-error">
          <a-result status="error" title="预览失败" sub-title="无法预览此文件" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import {
  IconArrowLeft,
  IconPlus,
  IconFile,
  IconMore,
  IconEye,
  IconDownload,
  IconDelete,
  IconStorage,
  IconWifi,
  IconEdit,
  IconUpload
} from '@arco-design/web-vue/es/icon';
import { WorkflowStorage } from '../../../utils/workflowStorage';
// import type { FileDataSource, DatabaseConnection } from '../../../types/workflow';

const router = useRouter();
const uploadRef = ref();
const dbFormRef = ref();

// 响应式数据
const activeTab = ref('files');
const fileDataSources = ref([]);
const databaseConnections = ref([]);
const showAddModal = ref(false);
const addType = ref('file');
const uploadFileList = ref([]);
const showPreviewModal = ref(false);
const previewFileRef = ref(null);
const previewData = ref(null);
const previewLoading = ref(false);

// 数据库表单
const dbForm = reactive({
  name: '',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: '',
  username: '',
  password: ''
});

const dbFormRules = {
  name: [{ required: true, message: '请输入连接名称' }],
  type: [{ required: true, message: '请选择数据库类型' }],
  host: [{ required: true, message: '请输入主机地址' }],
  port: [{ required: true, message: '请输入端口' }],
  database: [{ required: true, message: '请输入数据库名' }],
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
};

// 方法
const loadDataSources = () => {
  const dataSources = WorkflowStorage.getDataSources();
  fileDataSources.value = dataSources.files;
  databaseConnections.value = dataSources.databases;
};

const goBack = () => {
  router.push('/exploration/workflows');
};

const addFileDataSource = () => {
  showAddModal.value = true;
  addType.value = 'file';
};

const addDatabaseConnection = () => {
  showAddModal.value = true;
  addType.value = 'database';
};

const handleFileChange = (fileList) => {
  uploadFileList.value = fileList;
};

const handleAddDataSource = async () => {
  if (addType.value === 'file') {
    await handleFileUpload();
  } else {
    await handleDatabaseAdd();
  }
};

const handleFileUpload = async () => {
  if (uploadFileList.value.length === 0) {
    Message.warning('请选择要上传的文件');
    return;
  }
  
  try {
    for (const fileItem of uploadFileList.value) {
      const file = fileItem.file;
      
      // 读取文件内容
      const content = await readFileContent(file);
      
      const fileDataSource = {
        id: WorkflowStorage.generateId(),
        fileName: file.name,
        fileType: getFileType(file.name),
        size: file.size,
        content,
        uploadTime: new Date()
      };
      
      WorkflowStorage.saveFileDataSource(fileDataSource);
    }
    
    Message.success('文件上传成功');
    showAddModal.value = false;
    resetAddForm();
    loadDataSources();
  } catch (error) {
    console.error('文件上传失败:', error);
    Message.error('文件上传失败');
  }
};

const handleDatabaseAdd = async () => {
  try {
    const valid = await dbFormRef.value?.validate();
    if (!valid) return;
    
    const dbConnection = {
      id: WorkflowStorage.generateId(),
      name: dbForm.name,
      type: dbForm.type,
      host: dbForm.host,
      port: dbForm.port,
      database: dbForm.database,
      username: dbForm.username,
      password: dbForm.password,
      isConnected: false
    };
    
    WorkflowStorage.saveDatabaseConnection(dbConnection);
    
    Message.success('数据库连接添加成功');
    showAddModal.value = false;
    resetAddForm();
    loadDataSources();
  } catch (error) {
    console.error('添加数据库连接失败:', error);
    Message.error('添加数据库连接失败');
  }
};

const resetAddForm = () => {
  uploadFileList.value = [];
  Object.assign(dbForm, {
    name: '',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: ''
  });
};

const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'csv': return 'csv';
    case 'xlsx':
    case 'xls': return 'excel';
    case 'json': return 'json';
    case 'txt': return 'text';
    default: return 'unknown';
  }
};

const previewFileData = async (file) => {
  previewFileRef.value = file;
  showPreviewModal.value = true;
  previewLoading.value = true;
  
  try {
    // 模拟文件预览数据处理
    if (isTableFile(file.fileType)) {
      // CSV/Excel 表格数据
      const lines = file.content.split('\n').slice(0, 100); // 只预览前100行
      const headers = lines[0].split(',').map((h, i) => ({
        title: h.trim(),
        dataIndex: `col_${i}`,
        key: `col_${i}`
      }));
      
      const rows = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        const row = { key: index };
        values.forEach((value, i) => {
          row[`col_${i}`] = value.trim();
        });
        return row;
      });
      
      previewData.value = { columns: headers, rows };
    } else if (file.fileType === 'json') {
      previewData.value = JSON.parse(file.content);
    } else {
      previewData.value = file.content.substring(0, 5000); // 只预览前5000字符
    }
  } catch (error) {
    console.error('文件预览失败:', error);
    previewData.value = null;
  } finally {
    previewLoading.value = false;
  }
};

const downloadFile = (file) => {
  try {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
    Message.success('文件下载成功');
  } catch (error) {
    console.error('文件下载失败:', error);
    Message.error('文件下载失败');
  }
};

const testConnection = async (db) => {
  try {
    Message.info('正在测试连接...');
    
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新连接状态
    db.isConnected = true;
    WorkflowStorage.saveDatabaseConnection(db);
    
    Message.success('连接测试成功');
    loadDataSources();
  } catch (error) {
    console.error('连接测试失败:', error);
    Message.error('连接测试失败');
  }
};

const editDatabase = (db) => {
  Object.assign(dbForm, db);
  addType.value = 'database';
  showAddModal.value = true;
};

const deleteDataSource = (id, type) => {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这个数据源吗？',
    onOk: () => {
      if (WorkflowStorage.deleteDataSource(id, type)) {
        Message.success('删除成功');
        loadDataSources();
      } else {
        Message.error('删除失败');
      }
    }
  });
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

const isTableFile = (type) => {
  return type === 'csv' || type === 'excel';
};

// 生命周期
onMounted(() => {
  loadDataSources();
});
</script>

<style scoped>
.datasource-config {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.config-header {
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

.config-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.datasource-section {
  padding: 24px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.datasource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.datasource-card {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
}

.datasource-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.file-icon,
.db-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
  border-radius: 6px;
  margin-right: 12px;
  font-size: 20px;
}

.file-info,
.db-info {
  flex: 1;
  min-width: 0;
}

.file-name,
.db-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta,
.db-meta {
  margin: 0;
  font-size: 12px;
  color: #86909c;
}

.card-actions {
  flex-shrink: 0;
}

.card-content {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.file-stats,
.db-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.stat-label {
  color: #86909c;
}

.stat-value {
  color: #1d2129;
  font-weight: 500;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f2f6ff;
}

.upload-icon {
  font-size: 48px;
  color: #165dff;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-text p {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1d2129;
}

.upload-hint {
  font-size: 14px !important;
  color: #86909c !important;
}

.file-preview {
  max-height: 60vh;
  overflow: auto;
}

.preview-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.table-preview {
  width: 100%;
}

.json-preview,
.text-preview {
  background: #f2f3f5;
  border-radius: 6px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 400px;
  overflow: auto;
}

.preview-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.danger-option {
  color: #f53f3f !important;
}
</style>