<template>
  <div class="sql-node-config">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="节点名称" field="name">
        <a-input 
          v-model="formData.name" 
          placeholder="请输入节点名称"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="SQL查询" field="sqlQuery">
        <a-textarea 
          v-model="formData.sqlQuery" 
          placeholder="请输入SQL查询语句"
          :rows="8"
          @change="handleFormChange"
        />
      </a-form-item>
      
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
      
      <a-form-item label="查询类型" field="queryType">
        <a-select 
          v-model="formData.queryType" 
          placeholder="请选择查询类型"
          @change="handleFormChange"
        >
          <a-option value="select">查询(SELECT)</a-option>
          <a-option value="insert">插入(INSERT)</a-option>
          <a-option value="update">更新(UPDATE)</a-option>
          <a-option value="delete">删除(DELETE)</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="参数配置">
        <div class="parameter-list">
          <div 
            v-for="(param, index) in formData.parameters" 
            :key="index"
            class="parameter-item"
          >
            <a-input 
              v-model="param.name" 
              placeholder="参数名"
              class="param-name"
              @change="handleFormChange"
            />
            <a-select 
              v-model="param.type" 
              placeholder="类型"
              class="param-type"
              @change="handleFormChange"
            >
              <a-option value="string">字符串</a-option>
              <a-option value="number">数字</a-option>
              <a-option value="date">日期</a-option>
              <a-option value="boolean">布尔值</a-option>
            </a-select>
            <a-input 
              v-model="param.defaultValue" 
              placeholder="默认值"
              class="param-default"
              @change="handleFormChange"
            />
            <a-button 
              type="text" 
              status="danger" 
              @click="removeParameter(index)"
            >
              删除
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addParameter"
            class="add-param-btn"
          >
            + 添加参数
          </a-button>
        </div>
      </a-form-item>
      
      <a-form-item label="执行选项">
        <a-space direction="vertical" class="execution-options">
          <a-checkbox 
            v-model="formData.enableCache" 
            @change="handleFormChange"
          >
            启用查询缓存
          </a-checkbox>
          <a-checkbox 
            v-model="formData.enableTransaction" 
            @change="handleFormChange"
          >
            启用事务
          </a-checkbox>
          <a-checkbox 
            v-model="formData.enableTimeout" 
            @change="handleFormChange"
          >
            启用超时控制
          </a-checkbox>
        </a-space>
      </a-form-item>
      
      <template v-if="formData.enableTimeout">
        <a-form-item label="超时时间(秒)" field="timeout">
          <a-input-number 
            v-model="formData.timeout" 
            :min="1"
            :max="3600"
            placeholder="请输入超时时间"
            @change="handleFormChange"
          />
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
      
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="validateSql">
            验证SQL
          </a-button>
          <a-button @click="formatSql">
            格式化
          </a-button>
          <a-button @click="testQuery">
            测试查询
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

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
  sqlQuery: '',
  connection: '',
  queryType: 'select',
  parameters: [],
  enableCache: false,
  enableTransaction: false,
  enableTimeout: false,
  timeout: 30,
  description: ''
});

// 方法
const handleFormChange = () => {
  emit('update', {
    nodeId: props.node?.id,
    config: { ...formData.value }
  });
};

const addParameter = () => {
  formData.value.parameters.push({
    name: '',
    type: 'string',
    defaultValue: ''
  });
  handleFormChange();
};

const removeParameter = (index) => {
  formData.value.parameters.splice(index, 1);
  handleFormChange();
};

const validateSql = () => {
  if (!formData.value.sqlQuery.trim()) {
    Message.warning('请输入SQL查询语句');
    return;
  }
  
  // 简单的SQL语法验证
  const sql = formData.value.sqlQuery.trim().toLowerCase();
  const validKeywords = ['select', 'insert', 'update', 'delete', 'with'];
  const hasValidKeyword = validKeywords.some(keyword => sql.startsWith(keyword));
  
  if (hasValidKeyword) {
    Message.success('SQL语法验证通过');
  } else {
    Message.error('SQL语法可能存在问题，请检查');
  }
};

const formatSql = () => {
  if (!formData.value.sqlQuery.trim()) {
    Message.warning('请输入SQL查询语句');
    return;
  }
  
  // 简单的SQL格式化
  const formatted = formData.value.sqlQuery
    .replace(/\s+/g, ' ')
    .replace(/,/g, ',\n  ')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN');
  
  formData.value.sqlQuery = formatted;
  handleFormChange();
  Message.success('SQL格式化完成');
};

const testQuery = () => {
  if (!formData.value.sqlQuery.trim()) {
    Message.warning('请输入SQL查询语句');
    return;
  }
  
  if (!formData.value.connection) {
    Message.warning('请选择数据库连接');
    return;
  }
  
  // 模拟测试查询
  Message.info('正在测试查询...');
  setTimeout(() => {
    Message.success('查询测试成功，返回10条记录');
  }, 1000);
};

// 初始化表单数据
const initFormData = () => {
  if (props.node?.config) {
    Object.assign(formData.value, props.node.config);
  } else {
    formData.value.name = props.node?.label || 'SQL查询';
    formData.value.sqlQuery = 'SELECT * FROM table_name WHERE condition = ?';
  }
};

// 监听节点变化
watch(() => props.node, initFormData, { immediate: true });

onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.sql-node-config {
  padding: 16px;
}

.parameter-list {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  background: #f7f8fa;
}

.parameter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.parameter-item:last-child {
  margin-bottom: 0;
}

.param-name {
  flex: 2;
}

.param-type {
  flex: 1;
}

.param-default {
  flex: 2;
}

.add-param-btn {
  width: 100%;
  margin-top: 8px;
}

.execution-options {
  width: 100%;
}
</style>