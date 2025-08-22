<template>
  <div class="sql-node-config">
    <a-form :model="localConfig" layout="vertical" size="small">
      <!-- SQL查询编辑器 -->
      <a-form-item label="SQL查询">
        <div class="sql-editor-container">
          <div class="editor-toolbar">
            <a-button-group size="mini">
              <a-button @click="formatSql">
                <template #icon>
                  <icon-code />
                </template>
                格式化
              </a-button>
              <a-button @click="validateSql">
                <template #icon>
                  <icon-check-circle />
                </template>
                验证
              </a-button>
              <a-button @click="showSqlTemplates">
                <template #icon>
                  <icon-file />
                </template>
                模板
              </a-button>
            </a-button-group>
            <a-button type="primary" size="mini" @click="testSqlQuery">
              <template #icon>
                <icon-play-arrow />
              </template>
              测试运行
            </a-button>
          </div>
          <a-textarea
            v-model="localConfig.query"
            placeholder="请输入SQL查询语句..."
            :rows="8"
            class="sql-editor"
            @change="handleConfigChange"
          />
          <div v-if="sqlValidation.error" class="sql-error">
            <icon-exclamation-circle-fill />
            <span>{{ sqlValidation.error }}</span>
          </div>
        </div>
      </a-form-item>

      <!-- 查询参数 -->
      <a-form-item label="查询参数">
        <div class="parameters-section">
          <div class="parameters-header">
            <span>参数列表</span>
            <a-button type="text" size="mini" @click="addParameter">
              <template #icon>
                <icon-plus />
              </template>
              添加参数
            </a-button>
          </div>
          <div v-if="localConfig.parameters.length" class="parameters-list">
            <div
              v-for="(param, index) in localConfig.parameters"
              :key="index"
              class="parameter-item"
            >
              <a-input
                v-model="param.name"
                placeholder="参数名"
                size="small"
                @change="handleConfigChange"
              />
              <a-select
                v-model="param.type"
                placeholder="类型"
                size="small"
                @change="handleConfigChange"
              >
                <a-option value="string">字符串</a-option>
                <a-option value="number">数字</a-option>
                <a-option value="date">日期</a-option>
                <a-option value="boolean">布尔值</a-option>
              </a-select>
              <a-input
                v-model="param.defaultValue"
                placeholder="默认值"
                size="small"
                @change="handleConfigChange"
              />
              <a-button
                type="text"
                size="mini"
                status="danger"
                @click="removeParameter(index)"
              >
                <template #icon>
                  <icon-delete />
                </template>
              </a-button>
            </div>
          </div>
          <div v-else class="no-parameters">
            <a-empty description="暂无参数" :image-style="{ height: '60px' }" />
          </div>
        </div>
      </a-form-item>

      <!-- 查询选项 -->
      <a-collapse>
        <a-collapse-item header="查询选项" key="options">
          <a-form-item label="结果限制">
            <a-input-number
              v-model="localConfig.limit"
              :min="1"
              :max="10000"
              placeholder="查询结果行数限制"
              @change="handleConfigChange"
            />
            <div class="form-help">限制查询返回的最大行数，避免内存溢出</div>
          </a-form-item>
          
          <a-form-item label="超时设置">
            <a-input-number
              v-model="localConfig.timeout"
              :min="1"
              :max="300"
              placeholder="查询超时时间(秒)"
              @change="handleConfigChange"
            />
            <div class="form-help">查询执行的最大等待时间</div>
          </a-form-item>
          
          <a-form-item label="缓存结果">
            <a-switch
              v-model="localConfig.enableCache"
              @change="handleConfigChange"
            />
            <div class="form-help">缓存查询结果以提高重复查询性能</div>
          </a-form-item>
          
          <a-form-item label="事务模式">
            <a-switch
              v-model="localConfig.useTransaction"
              @change="handleConfigChange"
            />
            <div class="form-help">在事务中执行查询，确保数据一致性</div>
          </a-form-item>
        </a-collapse-item>
      </a-collapse>
    </a-form>

    <!-- SQL模板选择模态框 -->
    <a-modal
      v-model:visible="showTemplateModal"
      title="SQL模板"
      width="60%"
      @ok="applySqlTemplate"
    >
      <div class="template-list">
        <div
          v-for="template in sqlTemplates"
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectedTemplate = template"
        >
          <div class="template-header">
            <span class="template-name">{{ template.name }}</span>
            <a-tag :color="template.category === 'basic' ? 'blue' : 'green'" size="small">
              {{ template.category === 'basic' ? '基础' : '高级' }}
            </a-tag>
          </div>
          <div class="template-description">{{ template.description }}</div>
          <pre class="template-sql">{{ template.sql }}</pre>
        </div>
      </div>
    </a-modal>

    <!-- 测试结果模态框 -->
    <a-modal
      v-model:visible="showTestModal"
      title="SQL测试结果"
      width="80%"
      :footer="false"
    >
      <div class="test-result">
        <div v-if="testLoading" class="test-loading">
          <a-spin :size="32" />
          <p>正在执行SQL查询...</p>
        </div>
        <div v-else-if="testData" class="test-success">
          <a-result status="success" title="查询执行成功">
            <template #subtitle>
              <div class="query-stats">
                <span>执行时间: {{ testData.executionTime }}ms</span>
                <span>返回行数: {{ testData.rowCount }}</span>
                <span>影响行数: {{ testData.affectedRows }}</span>
              </div>
            </template>
            <template #extra>
              <div class="test-data-preview">
                <h4>查询结果预览</h4>
                <a-table
                  v-if="testData.columns"
                  :data="testData.rows"
                  :columns="testData.columns"
                  :pagination="{ pageSize: 10 }"
                  size="small"
                  :scroll="{ x: 'max-content' }"
                />
                <div v-else class="no-result">
                  <a-empty description="查询无返回结果" />
                </div>
              </div>
            </template>
          </a-result>
        </div>
        <div v-else class="test-error">
          <a-result
            status="error"
            title="查询执行失败"
            :sub-title="testError || 'SQL查询执行出错'"
          >
            <template #extra>
              <div v-if="testErrorDetails" class="error-details">
                <h4>错误详情</h4>
                <pre class="error-message">{{ testErrorDetails }}</pre>
              </div>
            </template>
          </a-result>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconCode,
  IconCheckCircle,
  IconFile,
  IconPlayArrow,
  IconExclamationCircleFill,
  IconPlus,
  IconDelete
} from '@arco-design/web-vue/es/icon';
// import type { SqlConfig } from '../../../../types/workflow';

// interface Props {
//   config: SqlConfig;
// }

// interface Emits {
//   (e: 'update', config: SqlConfig): void;
// }

const props = defineProps(['config']);
const emit = defineEmits(['update']);

// 响应式数据
const showTemplateModal = ref(false);
const showTestModal = ref(false);
const testLoading = ref(false);
const testData = ref(null);
const testError = ref('');
const testErrorDetails = ref('');
const selectedTemplate = ref(null);
const sqlValidation = ref({ valid: true, error: '' });

// 本地配置副本
const localConfig = ref({
  query: '',
  parameters: [],
  limit: 1000,
  timeout: 30,
  enableCache: true,
  useTransaction: false,
  ...props.config
});

// SQL模板数据
const sqlTemplates = ref([
  {
    id: 'select_all',
    name: '查询所有数据',
    category: 'basic',
    description: '查询表中的所有数据',
    sql: 'SELECT * FROM table_name;'
  },
  {
    id: 'select_with_condition',
    name: '条件查询',
    category: 'basic',
    description: '根据条件查询数据',
    sql: 'SELECT * FROM table_name WHERE column_name = \'value\';'
  },
  {
    id: 'select_with_join',
    name: '关联查询',
    category: 'advanced',
    description: '多表关联查询',
    sql: `SELECT a.*, b.*
FROM table_a a
JOIN table_b b ON a.id = b.a_id
WHERE a.status = 'active';`
  },
  {
    id: 'aggregate_query',
    name: '聚合查询',
    category: 'advanced',
    description: '统计分析查询',
    sql: `SELECT 
  category,
  COUNT(*) as count,
  AVG(price) as avg_price,
  SUM(amount) as total_amount
FROM products
GROUP BY category
ORDER BY count DESC;`
  },
  {
    id: 'window_function',
    name: '窗口函数',
    category: 'advanced',
    description: '使用窗口函数进行分析',
    sql: `SELECT 
  *,
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rank,
  LAG(price) OVER (ORDER BY created_at) as prev_price
FROM products;`
  }
]);

// 方法
const handleConfigChange = () => {
  emit('update', { ...localConfig.value });
};

const addParameter = () => {
  localConfig.value.parameters.push({
    name: '',
    type: 'string',
    defaultValue: ''
  });
  handleConfigChange();
};

const removeParameter = (index) => {
  localConfig.value.parameters.splice(index, 1);
  handleConfigChange();
};

const formatSql = () => {
  if (!localConfig.value.query.trim()) {
    Message.warning('请先输入SQL语句');
    return;
  }
  
  // 简单的SQL格式化
  let formatted = localConfig.value.query
    .replace(/\s+/g, ' ')
    .replace(/,/g, ',\n  ')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bLIMIT\b/gi, '\nLIMIT');
  
  localConfig.value.query = formatted.trim();
  handleConfigChange();
  Message.success('SQL格式化完成');
};

const validateSql = () => {
  const query = localConfig.value.query.trim();
  
  if (!query) {
    sqlValidation.value = { valid: false, error: 'SQL语句不能为空' };
    return;
  }
  
  // 基本的SQL语法检查
  const errors = [];
  
  // 检查是否包含基本的SQL关键字
  if (!/\b(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(query)) {
    errors.push('缺少有效的SQL操作关键字');
  }
  
  // 检查括号匹配
  const openParens = (query.match(/\(/g) || []).length;
  const closeParens = (query.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('括号不匹配');
  }
  
  // 检查引号匹配
  const singleQuotes = (query.match(/'/g) || []).length;
  const doubleQuotes = (query.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('单引号不匹配');
  }
  if (doubleQuotes % 2 !== 0) {
    errors.push('双引号不匹配');
  }
  
  if (errors.length > 0) {
    sqlValidation.value = { valid: false, error: errors.join('; ') };
    Message.error('SQL语法验证失败');
  } else {
    sqlValidation.value = { valid: true, error: '' };
    Message.success('SQL语法验证通过');
  }
};

const showSqlTemplates = () => {
  showTemplateModal.value = true;
  selectedTemplate.value = null;
};

const applySqlTemplate = () => {
  if (!selectedTemplate.value) {
    Message.warning('请选择一个模板');
    return;
  }
  
  localConfig.value.query = selectedTemplate.value.sql;
  handleConfigChange();
  showTemplateModal.value = false;
  Message.success('模板应用成功');
};

const testSqlQuery = async () => {
  if (!localConfig.value.query.trim()) {
    Message.warning('请先输入SQL查询语句');
    return;
  }
  
  showTestModal.value = true;
  testLoading.value = true;
  testData.value = null;
  testError.value = '';
  testErrorDetails.value = '';
  
  try {
    // 模拟SQL查询执行
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟查询结果
    const mockColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
      { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
      { title: '价格', dataIndex: 'price', key: 'price', width: 100 },
      { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 150 }
    ];
    
    const mockRows = Array.from({ length: 15 }, (_, i) => ({
      key: i,
      id: i + 1,
      name: `产品 ${i + 1}`,
      category: ['电子产品', '服装', '食品', '图书'][i % 4],
      price: (Math.random() * 1000).toFixed(2),
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    
    testData.value = {
      columns: mockColumns,
      rows: mockRows,
      executionTime: Math.floor(Math.random() * 500) + 100,
      rowCount: mockRows.length,
      affectedRows: 0
    };
    
    Message.success('SQL查询执行成功');
  } catch (error) {
    console.error('SQL查询执行失败:', error);
    testError.value = 'SQL查询执行失败';
    testErrorDetails.value = error.message || '未知错误';
    Message.error('SQL查询执行失败');
  } finally {
    testLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 初始化时验证SQL
  if (localConfig.value.query) {
    validateSql();
  }
});
</script>

<style scoped>
.sql-node-config {
  width: 100%;
}

.sql-editor-container {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f2f3f5;
  border-bottom: 1px solid #e5e6eb;
}

.sql-editor {
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.sql-editor:focus {
  box-shadow: none;
}

.sql-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffece8;
  color: #f53f3f;
  font-size: 12px;
  border-top: 1px solid #ffccc7;
}

.parameters-section {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.parameters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f2f3f5;
  border-bottom: 1px solid #e5e6eb;
  font-size: 13px;
  font-weight: 500;
}

.parameters-list {
  padding: 12px;
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

.no-parameters {
  padding: 20px;
  text-align: center;
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #165dff;
  background: #f2f7ff;
}

.template-item.active {
  border-color: #165dff;
  background: #e8f3ff;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-name {
  font-weight: 500;
  color: #1d2129;
}

.template-description {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.template-sql {
  background: #f2f3f5;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
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

.query-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
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

.no-result {
  padding: 20px;
}

.error-details {
  width: 100%;
  margin-top: 20px;
}

.error-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1d2129;
}

.error-message {
  background: #ffece8;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  color: #f53f3f;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>