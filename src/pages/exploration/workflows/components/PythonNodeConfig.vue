<template>
  <div class="python-node-config">
    <a-form :model="localConfig" layout="vertical" size="small">
      <!-- Python代码编辑器 -->
      <a-form-item label="Python代码">
        <div class="code-editor-container">
          <div class="editor-toolbar">
            <a-button-group size="mini">
              <a-button @click="formatCode">
                <template #icon>
                  <icon-code />
                </template>
                格式化
              </a-button>
              <a-button @click="validateCode">
                <template #icon>
                  <icon-check-circle />
                </template>
                语法检查
              </a-button>
              <a-button @click="showCodeTemplates">
                <template #icon>
                  <icon-file />
                </template>
                代码模板
              </a-button>
              <a-button @click="showPackageManager">
                <template #icon>
                  <icon-folder />
                </template>
                包管理
              </a-button>
            </a-button-group>
            <a-button type="primary" size="mini" @click="testPythonCode">
              <template #icon>
                <icon-play-arrow />
              </template>
              测试运行
            </a-button>
          </div>
          <a-textarea
            v-model="localConfig.code"
            placeholder="请输入Python代码...\n\n# 可用变量:\n# - input_data: 上游节点的输出数据\n# - params: 节点参数\n\n# 示例:\nimport pandas as pd\n\n# 处理数据\nresult = input_data.copy()\nresult['new_column'] = result['existing_column'] * 2\n\n# 返回结果\noutput_data = result"
            :rows="12"
            class="code-editor"
            @change="handleConfigChange"
          />
          <div v-if="codeValidation.error" class="code-error">
            <icon-exclamation-circle-fill />
            <span>{{ codeValidation.error }}</span>
          </div>
        </div>
      </a-form-item>

      <!-- 输入参数 -->
      <a-form-item label="输入参数">
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
                <a-option value="boolean">布尔值</a-option>
                <a-option value="list">列表</a-option>
                <a-option value="dict">字典</a-option>
              </a-select>
              <a-input
                v-model="param.defaultValue"
                placeholder="默认值"
                size="small"
                @change="handleConfigChange"
              />
              <a-input
                v-model="param.description"
                placeholder="描述"
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

      <!-- 依赖包管理 -->
      <a-form-item label="依赖包">
        <div class="packages-section">
          <div class="packages-header">
            <span>已安装的包</span>
            <a-button type="text" size="mini" @click="addPackage">
              <template #icon>
                <icon-plus />
              </template>
              添加包
            </a-button>
          </div>
          <div v-if="localConfig.packages.length" class="packages-list">
            <a-tag
              v-for="(pkg, index) in localConfig.packages"
              :key="index"
              closable
              @close="removePackage(index)"
            >
              {{ pkg }}
            </a-tag>
          </div>
          <div v-else class="no-packages">
            <span class="empty-text">暂无依赖包</span>
          </div>
        </div>
      </a-form-item>

      <!-- 执行选项 -->
      <a-collapse>
        <a-collapse-item header="执行选项" key="options">
          <a-form-item label="执行超时">
            <a-input-number
              v-model="localConfig.timeout"
              :min="1"
              :max="300"
              placeholder="执行超时时间(秒)"
              @change="handleConfigChange"
            />
            <div class="form-help">代码执行的最大等待时间</div>
          </a-form-item>
          
          <a-form-item label="内存限制">
            <a-input-number
              v-model="localConfig.memoryLimit"
              :min="64"
              :max="2048"
              placeholder="内存限制(MB)"
              @change="handleConfigChange"
            />
            <div class="form-help">代码执行时的最大内存使用量</div>
          </a-form-item>
          
          <a-form-item label="调试模式">
            <a-switch
              v-model="localConfig.debugMode"
              @change="handleConfigChange"
            />
            <div class="form-help">开启后将输出详细的调试信息</div>
          </a-form-item>
          
          <a-form-item label="缓存结果">
            <a-switch
              v-model="localConfig.enableCache"
              @change="handleConfigChange"
            />
            <div class="form-help">缓存执行结果以提高重复执行性能</div>
          </a-form-item>
        </a-collapse-item>
      </a-collapse>
    </a-form>

    <!-- 代码模板选择模态框 -->
    <a-modal
      v-model:visible="showTemplateModal"
      title="Python代码模板"
      width="70%"
      @ok="applyCodeTemplate"
    >
      <div class="template-list">
        <div
          v-for="template in codeTemplates"
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectedTemplate = template"
        >
          <div class="template-header">
            <span class="template-name">{{ template.name }}</span>
            <a-tag :color="getTemplateCategoryColor(template.category)" size="small">
              {{ getTemplateCategoryText(template.category) }}
            </a-tag>
          </div>
          <div class="template-description">{{ template.description }}</div>
          <pre class="template-code">{{ template.code }}</pre>
        </div>
      </div>
    </a-modal>

    <!-- 包管理模态框 -->
    <a-modal
      v-model:visible="showPackageModal"
      title="包管理"
      width="50%"
      @ok="installPackage"
    >
      <div class="package-manager">
        <a-form :model="packageForm" layout="vertical">
          <a-form-item label="安装新包">
            <a-input-group>
              <a-input
                v-model="newPackageName"
                placeholder="输入包名，如: pandas, numpy, matplotlib"
                @press-enter="installPackage"
              />
              <a-button type="primary" @click="installPackage">
                安装
              </a-button>
            </a-input-group>
          </a-form-item>
        </a-form>
        
        <div class="common-packages">
          <h4>常用包</h4>
          <div class="package-grid">
            <a-button
              v-for="pkg in commonPackages"
              :key="pkg.name"
              size="small"
              @click="quickInstallPackage(pkg.name)"
            >
              {{ pkg.name }}
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 测试结果模态框 -->
    <a-modal
      v-model:visible="showTestModal"
      title="Python代码测试结果"
      width="80%"
      :footer="false"
    >
      <div class="test-result">
        <div v-if="testLoading" class="test-loading">
          <a-spin :size="32" />
          <p>正在执行Python代码...</p>
        </div>
        <div v-else-if="testData" class="test-success">
          <a-result status="success" title="代码执行成功">
            <template #subtitle>
              <div class="execution-stats">
                <span>执行时间: {{ testData.executionTime }}ms</span>
                <span>内存使用: {{ testData.memoryUsage }}MB</span>
                <span>输出行数: {{ testData.outputRows }}</span>
              </div>
            </template>
            <template #extra>
              <div class="test-output">
                <a-tabs>
                  <a-tab-pane key="result" title="执行结果">
                    <div v-if="testData.output" class="output-content">
                      <pre class="output-text">{{ testData.output }}</pre>
                    </div>
                    <div v-else class="no-output">
                      <a-empty description="无输出结果" />
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="data" title="数据预览">
                    <div v-if="testData.dataPreview" class="data-preview">
                      <a-table
                        :data="testData.dataPreview.rows"
                        :columns="testData.dataPreview.columns"
                        :pagination="{ pageSize: 10 }"
                        size="small"
                        :scroll="{ x: 'max-content' }"
                      />
                    </div>
                    <div v-else class="no-data">
                      <a-empty description="无数据输出" />
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="logs" title="执行日志">
                    <div class="logs-content">
                      <pre class="logs-text">{{ testData.logs || '无日志输出' }}</pre>
                    </div>
                  </a-tab-pane>
                </a-tabs>
              </div>
            </template>
          </a-result>
        </div>
        <div v-else class="test-error">
          <a-result
            status="error"
            title="代码执行失败"
            :sub-title="testError || 'Python代码执行出错'"
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
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconCode,
  IconCheckCircle,
  IconFile,
  IconFolder,
  IconPlayArrow,
  IconExclamationCircleFill,
  IconPlus,
  IconDelete
} from '@arco-design/web-vue/es/icon';
// import type { PythonConfig } from '../../../../types/workflow';

// interface Props {
//   config: PythonConfig;
// }

// interface Emits {
//   (e: 'update', config: PythonConfig): void;
// }

const props = defineProps(['config']);
const emit = defineEmits(['update']);

// 响应式数据
const showTemplateModal = ref(false);
const showPackageModal = ref(false);
const showTestModal = ref(false);
const testLoading = ref(false);
const testData = ref(null);
const testError = ref('');
const testErrorDetails = ref('');
const selectedTemplate = ref(null);
const codeValidation = ref({ valid: true, error: '' });
const newPackageName = ref('');

// 包管理表单数据
const packageForm = ref({
  packageName: ''
});

// 本地配置副本
const localConfig = ref({
  code: '',
  parameters: [],
  packages: ['pandas', 'numpy'],
  timeout: 60,
  memoryLimit: 512,
  debugMode: false,
  enableCache: true,
  ...props.config
});

// 常用包列表
const commonPackages = ref([
  { name: 'pandas', description: '数据分析库' },
  { name: 'numpy', description: '数值计算库' },
  { name: 'matplotlib', description: '绘图库' },
  { name: 'seaborn', description: '统计绘图库' },
  { name: 'scikit-learn', description: '机器学习库' },
  { name: 'requests', description: 'HTTP请求库' },
  { name: 'beautifulsoup4', description: '网页解析库' },
  { name: 'openpyxl', description: 'Excel处理库' }
]);

// 代码模板数据
const codeTemplates = ref([
  {
    id: 'data_processing',
    name: '数据处理',
    category: 'basic',
    description: '基本的数据处理操作',
    code: `import pandas as pd
import numpy as np

# 获取输入数据
df = input_data

# 数据处理示例
# 1. 数据清洗
df = df.dropna()  # 删除空值
df = df.drop_duplicates()  # 删除重复值

# 2. 数据转换
df['new_column'] = df['existing_column'].apply(lambda x: x * 2)

# 3. 数据筛选
filtered_df = df[df['column'] > 0]

# 输出结果
output_data = filtered_df`
  },
  {
    id: 'statistical_analysis',
    name: '统计分析',
    category: 'analysis',
    description: '数据统计分析',
    code: `import pandas as pd
import numpy as np

# 获取输入数据
df = input_data

# 统计分析
stats = {
    'count': len(df),
    'mean': df.select_dtypes(include=[np.number]).mean().to_dict(),
    'std': df.select_dtypes(include=[np.number]).std().to_dict(),
    'min': df.select_dtypes(include=[np.number]).min().to_dict(),
    'max': df.select_dtypes(include=[np.number]).max().to_dict()
}

print("数据统计信息:")
for key, value in stats.items():
    print(f"{key}: {value}")

# 输出结果
output_data = df`
  },
  {
    id: 'data_visualization',
    name: '数据可视化',
    category: 'visualization',
    description: '创建数据图表',
    code: `import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 获取输入数据
df = input_data

# 设置图表样式
plt.style.use('default')
sns.set_palette("husl")

# 创建图表
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 直方图
df.hist(ax=axes[0, 0])
axes[0, 0].set_title('数据分布')

# 相关性热力图
numeric_df = df.select_dtypes(include=[np.number])
if len(numeric_df.columns) > 1:
    sns.heatmap(numeric_df.corr(), annot=True, ax=axes[0, 1])
    axes[0, 1].set_title('相关性矩阵')

# 箱线图
if len(numeric_df.columns) > 0:
    numeric_df.boxplot(ax=axes[1, 0])
    axes[1, 0].set_title('箱线图')

plt.tight_layout()
plt.show()

# 输出结果
output_data = df`
  },
  {
    id: 'machine_learning',
    name: '机器学习',
    category: 'ml',
    description: '简单的机器学习模型',
    code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 获取输入数据
df = input_data

# 假设最后一列是目标变量
X = df.iloc[:, :-1]
y = df.iloc[:, -1]

# 分割数据
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 训练模型
model = LinearRegression()
model.fit(X_train, y_train)

# 预测
y_pred = model.predict(X_test)

# 评估
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"均方误差: {mse:.4f}")
print(f"R²分数: {r2:.4f}")

# 输出结果
result_df = df.copy()
result_df['predicted'] = model.predict(X)
output_data = result_df`
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
    defaultValue: '',
    description: ''
  });
  handleConfigChange();
};

const removeParameter = (index) => {
  localConfig.value.parameters.splice(index, 1);
  handleConfigChange();
};

const addPackage = () => {
  showPackageModal.value = true;
  newPackageName.value = '';
};

const removePackage = (index) => {
  localConfig.value.packages.splice(index, 1);
  handleConfigChange();
};

const installPackage = () => {
  const packageName = newPackageName.value.trim();
  if (!packageName) {
    Message.warning('请输入包名');
    return;
  }
  
  if (localConfig.value.packages.includes(packageName)) {
    Message.warning('包已存在');
    return;
  }
  
  localConfig.value.packages.push(packageName);
  handleConfigChange();
  newPackageName.value = '';
  Message.success(`包 ${packageName} 添加成功`);
};

const quickInstallPackage = (packageName) => {
  if (localConfig.value.packages.includes(packageName)) {
    Message.warning('包已存在');
    return;
  }
  
  localConfig.value.packages.push(packageName);
  handleConfigChange();
  Message.success(`包 ${packageName} 添加成功`);
};

const formatCode = () => {
  if (!localConfig.value.code.trim()) {
    Message.warning('请先输入Python代码');
    return;
  }
  
  // 简单的代码格式化（实际项目中可以使用更专业的格式化工具）
  let formatted = localConfig.value.code
    .split('\n')
    .map(line => line.trimRight())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  
  localConfig.value.code = formatted;
  handleConfigChange();
  Message.success('代码格式化完成');
};

const validateCode = () => {
  const code = localConfig.value.code.trim();
  
  if (!code) {
    codeValidation.value = { valid: false, error: 'Python代码不能为空' };
    return;
  }
  
  // 基本的Python语法检查
  const errors = [];
  
  // 检查缩进
  const lines = code.split('\n');
  let indentLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    
    const currentIndent = line.length - line.trimLeft().length;
    if (currentIndent % 4 !== 0) {
      errors.push(`第${i + 1}行: 缩进不正确，应使用4个空格`);
      break;
    }
  }
  
  // 检查括号匹配
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('括号不匹配');
  }
  
  // 检查引号匹配
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('单引号不匹配');
  }
  if (doubleQuotes % 2 !== 0) {
    errors.push('双引号不匹配');
  }
  
  if (errors.length > 0) {
    codeValidation.value = { valid: false, error: errors.join('; ') };
    Message.error('代码语法验证失败');
  } else {
    codeValidation.value = { valid: true, error: '' };
    Message.success('代码语法验证通过');
  }
};

const showCodeTemplates = () => {
  showTemplateModal.value = true;
  selectedTemplate.value = null;
};

const showPackageManager = () => {
  showPackageModal.value = true;
};

const applyCodeTemplate = () => {
  if (!selectedTemplate.value) {
    Message.warning('请选择一个模板');
    return;
  }
  
  localConfig.value.code = selectedTemplate.value.code;
  handleConfigChange();
  showTemplateModal.value = false;
  Message.success('模板应用成功');
};

const testPythonCode = async () => {
  if (!localConfig.value.code.trim()) {
    Message.warning('请先输入Python代码');
    return;
  }
  
  showTestModal.value = true;
  testLoading.value = true;
  testData.value = null;
  testError.value = '';
  testErrorDetails.value = '';
  
  try {
    // 模拟Python代码执行
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 模拟执行结果
    const mockOutput = `代码执行成功！

处理了 100 行数据
生成了 5 个新特征
数据质量检查通过

执行完成。`;
    
    const mockDataPreview = {
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '原始值', dataIndex: 'original', key: 'original', width: 100 },
        { title: '处理后值', dataIndex: 'processed', key: 'processed', width: 100 },
        { title: '新特征', dataIndex: 'new_feature', key: 'new_feature', width: 100 }
      ],
      rows: Array.from({ length: 10 }, (_, i) => ({
        key: i,
        id: i + 1,
        original: (Math.random() * 100).toFixed(2),
        processed: (Math.random() * 200).toFixed(2),
        new_feature: (Math.random() * 50).toFixed(2)
      }))
    };
    
    const mockLogs = `[INFO] 开始执行Python代码
[INFO] 导入依赖包: pandas, numpy
[INFO] 读取输入数据: 100 行 x 5 列
[INFO] 执行数据处理逻辑
[INFO] 生成输出数据: 100 行 x 8 列
[INFO] 代码执行完成`;
    
    testData.value = {
      output: mockOutput,
      dataPreview: mockDataPreview,
      logs: mockLogs,
      executionTime: Math.floor(Math.random() * 2000) + 500,
      memoryUsage: Math.floor(Math.random() * 200) + 50,
      outputRows: 100
    };
    
    Message.success('Python代码执行成功');
  } catch (error) {
    console.error('Python代码执行失败:', error);
    testError.value = 'Python代码执行失败';
    testErrorDetails.value = error.message || '未知错误';
    Message.error('Python代码执行失败');
  } finally {
    testLoading.value = false;
  }
};

const getTemplateCategoryColor = (category) => {
  const colors = {
    basic: 'blue',
    analysis: 'green',
    visualization: 'orange',
    ml: 'purple'
  };
  return colors[category] || 'gray';
};

const getTemplateCategoryText = (category) => {
  const texts = {
    basic: '基础',
    analysis: '分析',
    visualization: '可视化',
    ml: '机器学习'
  };
  return texts[category] || '其他';
};

// 生命周期
onMounted(() => {
  // 初始化时验证代码
  if (localConfig.value.code) {
    validateCode();
  }
});
</script>

<style scoped>
.python-node-config {
  width: 100%;
}

.code-editor-container {
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

.code-editor {
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-editor:focus {
  box-shadow: none;
}

.code-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffece8;
  color: #f53f3f;
  font-size: 12px;
  border-top: 1px solid #ffccc7;
}

.parameters-section,
.packages-section {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.parameters-header,
.packages-header {
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

.packages-list {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-parameters,
.no-packages {
  padding: 20px;
  text-align: center;
}

.empty-text {
  color: #86909c;
  font-size: 12px;
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.template-list {
  max-height: 500px;
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

.template-code {
  background: #f2f3f5;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.package-manager {
  margin-bottom: 16px;
}

.common-packages h4 {
  margin: 16px 0 8px 0;
  font-size: 14px;
  color: #1d2129;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.test-result {
  min-height: 300px;
}

.test-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.test-loading p {
  margin: 0;
  color: #86909c;
}

.execution-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86909c;
}

.test-output {
  width: 100%;
  margin-top: 20px;
}

.output-content,
.data-preview,
.logs-content {
  min-height: 200px;
}

.output-text,
.logs-text {
  background: #f2f3f5;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}

.no-output,
.no-data {
  padding: 40px;
  text-align: center;
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