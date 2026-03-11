<template>
  <div class="data-source-node-config">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="节点名称" field="name">
        <a-input 
          v-model="formData.name" 
          placeholder="请输入节点名称"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="数据源类型" field="sourceType">
        <a-select 
          v-model="formData.sourceType" 
          placeholder="请选择数据源类型"
          @change="handleFormChange"
        >
          <a-option value="database">数据库</a-option>
          <a-option value="file">文件</a-option>
          <a-option value="api">API接口</a-option>
          <a-option value="stream">数据流</a-option>
        </a-select>
      </a-form-item>
      
      <template v-if="formData.sourceType === 'database'">
        <a-form-item label="数据库连接" field="connection">
          <a-select 
            v-model="formData.connection" 
            placeholder="请选择数据库连接"
            @change="handleFormChange"
          >
            <a-option value="mysql_prod">MySQL生产库</a-option>
            <a-option value="postgres_dev">PostgreSQL开发库</a-option>
            <a-option value="oracle_warehouse">Oracle数据仓库</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="表名" field="tableName">
          <a-input 
            v-model="formData.tableName" 
            placeholder="请输入表名"
            @change="handleFormChange"
          />
        </a-form-item>
      </template>
      
      <template v-if="formData.sourceType === 'file'">
        <a-form-item label="文件路径" field="filePath">
          <a-input 
            v-model="formData.filePath" 
            placeholder="请输入文件路径"
            @change="handleFormChange"
          />
        </a-form-item>
        
        <a-form-item label="文件格式" field="fileFormat">
          <a-select 
            v-model="formData.fileFormat" 
            placeholder="请选择文件格式"
            @change="handleFormChange"
          >
            <a-option value="csv">CSV</a-option>
            <a-option value="json">JSON</a-option>
            <a-option value="excel">Excel</a-option>
            <a-option value="parquet">Parquet</a-option>
          </a-select>
        </a-form-item>
      </template>
      
      <template v-if="formData.sourceType === 'api'">
        <a-form-item label="API地址" field="apiUrl">
          <a-input 
            v-model="formData.apiUrl" 
            placeholder="请输入API地址"
            @change="handleFormChange"
          />
        </a-form-item>
        
        <a-form-item label="请求方法" field="method">
          <a-select 
            v-model="formData.method" 
            placeholder="请选择请求方法"
            @change="handleFormChange"
          >
            <a-option value="GET">GET</a-option>
            <a-option value="POST">POST</a-option>
          </a-select>
        </a-form-item>
      </template>
      
      <a-form-item label="描述" field="description">
        <a-textarea 
          v-model="formData.description" 
          placeholder="请输入节点描述"
          :rows="3"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="输出字段">
        <div class="field-list">
          <div 
            v-for="(field, index) in formData.outputFields" 
            :key="index"
            class="field-item"
          >
            <a-input 
              v-model="field.name" 
              placeholder="字段名"
              class="field-name"
              @change="handleFormChange"
            />
            <a-select 
              v-model="field.type" 
              placeholder="类型"
              class="field-type"
              @change="handleFormChange"
            >
              <a-option value="string">字符串</a-option>
              <a-option value="number">数字</a-option>
              <a-option value="date">日期</a-option>
              <a-option value="boolean">布尔值</a-option>
            </a-select>
            <a-button 
              type="text" 
              status="danger" 
              @click="removeField(index)"
              :disabled="formData.outputFields.length <= 1"
            >
              删除
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addField"
            class="add-field-btn"
          >
            + 添加字段
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

// Props
const props = defineProps({
  node: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update']);

// 表单数据
const formData = ref({
  name: '',
  sourceType: '',
  connection: '',
  tableName: '',
  filePath: '',
  fileFormat: '',
  apiUrl: '',
  method: 'GET',
  description: '',
  outputFields: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' }
  ]
});

// 方法
const handleFormChange = () => {
  emit('update', {
    nodeId: props.node?.id,
    config: { ...formData.value }
  });
};

const addField = () => {
  formData.value.outputFields.push({
    name: '',
    type: 'string'
  });
  handleFormChange();
};

const removeField = (index) => {
  formData.value.outputFields.splice(index, 1);
  handleFormChange();
};

// 初始化表单数据
const initFormData = () => {
  if (props.node?.config) {
    Object.assign(formData.value, props.node.config);
  } else {
    formData.value.name = props.node?.label || '数据源';
  }
};

// 监听节点变化
watch(() => props.node, initFormData, { immediate: true });

onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.data-source-node-config {
  padding: 16px;
}

.field-list {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  background: #f7f8fa;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.field-item:last-child {
  margin-bottom: 0;
}

.field-name {
  flex: 2;
}

.field-type {
  flex: 1;
}

.add-field-btn {
  width: 100%;
  margin-top: 8px;
}
</style>