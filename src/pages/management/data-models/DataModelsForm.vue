<template>
  <div class="data-models-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回
        </a-button>
        <h2 class="page-title">{{ isEdit ? '编辑模型' : '新增模型' }}</h2>
      </div>
      <div class="header-right">
        <a-button @click="handleSaveDraft" :loading="saving" style="margin-right: 12px;">
          保存草稿
        </a-button>
        <a-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '更新模型' : '创建模型' }}
        </a-button>
      </div>
    </div>

    <!-- 左右分栏布局 -->
    <div class="form-layout">
      <!-- 左侧：基本信息和执行配置 -->
      <div class="form-left">
        <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical" size="large">
          <!-- 基本信息 -->
          <div class="form-section">
            <a-card title="基本信息">
              <a-form-item label="模型名称" field="name">
                <a-input v-model="formData.name" placeholder="请输入模型名称" />
              </a-form-item>
              <a-form-item label="使用场景" field="useCase">
                <a-select v-model="formData.useCase" placeholder="请选择使用场景">
                  <a-option value="CREDIT_ANALYSIS">信贷分析</a-option>
                  <a-option value="EXPERIMENT_REVIEW">实验复盘</a-option>
                  <a-option value="RISK_ASSESSMENT">风险评估</a-option>
                  <a-option value="FRAUD_DETECTION">欺诈检测</a-option>
                  <a-option value="CUSTOMER_SEGMENTATION">客户分群</a-option>
                  <a-option value="PORTFOLIO_ANALYSIS">投资组合分析</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="应用系统" field="applicationSystem">
                <a-select v-model="formData.applicationSystem" placeholder="请选择应用系统" @change="handleApplicationSystemChange">
                  <a-option value="CUSTOMER_360">客户360</a-option>
                  <a-option value="RISK_MANAGEMENT">风险管理</a-option>
                  <a-option value="MARKETING_SYSTEM">营销系统</a-option>
                  <a-option value="CREDIT_SYSTEM">信贷系统</a-option>
                  <a-option value="OTHER">其他</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="开发语言" field="language">
                <a-select v-model="formData.language" placeholder="请选择开发语言" @change="handleLanguageChange">
                  <a-option value="SQL">SQL</a-option>
                  <a-option value="Python">Python</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="管理人" field="manager">
                <a-input v-model="formData.manager" placeholder="请输入管理人" />
              </a-form-item>
              <a-form-item label="描述" field="description">
                <a-textarea v-model="formData.description" placeholder="请输入模型描述" :rows="3" />
              </a-form-item>
            </a-card>
          </div>

          <!-- 执行配置 -->
          <div class="form-section">
            <a-card title="执行配置">
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="超时时间(秒)" field="executionConfig.timeout">
                    <a-input-number v-model="formData.executionConfig.timeout" :min="1" :max="3600" placeholder="请输入超时时间" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :span="24" v-if="formData.language === 'SQL'">
                  <a-form-item label="执行器" field="executionConfig.executor">
                    <a-select v-model="formData.executionConfig.executor" placeholder="请选择执行器" style="width: 100%">
                      <a-option value="Hive">Hive</a-option>
                      <a-option value="Inceptor">Inceptor</a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="24" v-if="formData.language === 'Python'">
                  <a-form-item label="最大内存(MB)" field="executionConfig.maxMemory">
                    <a-input-number v-model="formData.executionConfig.maxMemory" :min="64" :max="8192" placeholder="请输入最大内存" style="width: 100%" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-card>
          </div>
        </a-form>
      </div>
      
      <!-- 右侧：入参定义、代码编辑、出参定义 -->
      <div class="form-right">
        <!-- 入参定义 -->
        <div class="form-section">
          <a-card title="入参定义">
            <div class="params-definition">
              <div class="params-header">
                <span>参数列表</span>
                <a-button type="primary" size="small" @click="addInputParameter">
                  <template #icon>
                    <icon-plus />
                  </template>
                  添加参数
                </a-button>
              </div>
              <div class="params-list">
                <div v-if="formData.inputParams.length === 0" class="empty-params">
                  <icon-info-circle />
                  暂无入参，点击上方按钮添加
                </div>
                <div v-else>
                  <!-- 入参表头 -->
                  <div class="param-table-header">
                    <a-row :gutter="8">
                      <a-col :span="6">
                        <span class="header-label">参数名称</span>
                      </a-col>
                      <a-col :span="5">
                        <span class="header-label">参数中文名</span>
                      </a-col>
                      <a-col :span="4" v-if="formData.language !== 'SQL'">
                        <span class="header-label">类型</span>
                      </a-col>
                      <a-col :span="2">
                        <span class="header-label">必填</span>
                      </a-col>
                      <a-col :span="3">
                        <span class="header-label">默认值</span>
                      </a-col>
                      <a-col :span="formData.language === 'SQL' ? 6 : 3">
                        <span class="header-label">{{ formData.language === 'SQL' ? '描述' : '描述' }}</span>
                      </a-col>
                      <a-col :span="2" v-if="formData.language !== 'SQL'">
                        <span class="header-label">样例</span>
                      </a-col>
                      <a-col :span="2">
                        <span class="header-label">操作</span>
                      </a-col>
                    </a-row>
                  </div>
                  
                  <!-- 入参数据行 -->
                  <div v-for="(param, index) in formData.inputParams" :key="index" class="param-definition-item">
                    <a-row :gutter="8">
                      <a-col :span="6">
                        <a-form-item :field="`inputParams.${index}.name`" :rules="[{ required: true, message: '参数名不能为空' }]">
                          <a-input v-model="param.name" placeholder="参数名" @change="updateParameterHints" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="5">
                        <a-form-item :field="`inputParams.${index}.chineseName`">
                          <a-input v-model="param.chineseName" placeholder="参数中文名" @change="onParameterChange" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="4" v-if="formData.language !== 'SQL'">
                        <a-form-item :field="`inputParams.${index}.type`" :rules="[{ required: true, message: '参数类型不能为空' }]">
                          <a-select v-model="param.type" placeholder="类型" @change="onParameterChange">
                            <a-option value="string">字符串</a-option>
                            <a-option value="number">数字</a-option>
                            <a-option value="boolean">布尔值</a-option>
                            <a-option value="array">数组</a-option>
                            <a-option value="object">对象</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="2">
                        <a-form-item>
                          <a-checkbox v-model="param.required" @change="onParameterChange">必填</a-checkbox>
                        </a-form-item>
                      </a-col>
                      <a-col :span="3">
                        <a-form-item>
                          <a-input v-model="param.defaultValue" placeholder="默认值" @change="onParameterChange" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="formData.language === 'SQL' ? 6 : 3">
                        <a-form-item>
                          <a-input 
                            v-model="param.description" 
                            :placeholder="formData.language === 'SQL' ? '参数描述（可包含样例）' : '参数描述'" 
                            @change="onParameterChange" 
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="2" v-if="formData.language !== 'SQL'">
                        <a-form-item>
                          <a-input v-model="param.example" placeholder="参数样例" @change="onParameterChange" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="2">
                        <a-button 
                          type="text" 
                          :status="param.isFixed ? 'normal' : 'danger'" 
                          :disabled="param.isFixed"
                          @click="removeInputParameter(index)"
                          :title="param.isFixed ? '系统固定参数，不可删除' : '删除参数'"
                        >
                          <template #icon>
                            <icon-delete />
                          </template>
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 代码编辑 -->
        <div class="form-section">
          <div class="code-section" :class="{ 'fullscreen': isFullscreen }">
            <a-card title="代码编辑" class="code-card">
            <!-- 模板选择 -->
            <div class="template-selector">
              <a-select v-model="selectedTemplate" placeholder="选择模板" style="width: 200px; margin-right: 12px;" @change="applyTemplate" allow-clear>
                <a-option value="">无模板</a-option>
                <a-optgroup v-if="formData.language === 'SQL'" label="SQL模板">
                  <a-option value="sql-select">基础查询</a-option>
                  <a-option value="sql-insert">数据插入</a-option>
                  <a-option value="sql-update">数据更新</a-option>
                  <a-option value="sql-analysis">数据分析</a-option>
                </a-optgroup>
                <a-optgroup v-if="formData.language === 'Python'" label="Python模板">
                  <a-option value="python-basic">基础脚本</a-option>
                  <a-option value="python-pandas">数据处理</a-option>
                  <a-option value="python-ml">机器学习</a-option>
                  <a-option value="python-api">API接口</a-option>
                </a-optgroup>
              </a-select>
            </div>
            
            <div class="code-editor-container">
              <div class="editor-toolbar">
                <div class="toolbar-left">
                  <a-select v-model="formData.language" size="small" style="width: 120px; margin-right: 12px;" @change="handleLanguageChange">
                    <a-option value="SQL">SQL</a-option>
                    <a-option value="Python">Python</a-option>
                  </a-select>
                  <a-button size="small" @click="formatCode" style="margin-right: 8px;">
                    <template #icon>
                      <icon-code />
                    </template>
                    格式化
                  </a-button>
                  <a-button size="small" @click="validateCode" style="margin-right: 8px;">
                    <template #icon>
                      <IconCheckCircle />
                    </template>
                    验证
                  </a-button>
                  <a-button size="small" @click="handleRunTest" style="margin-right: 8px;">
                    <template #icon>
                      <IconPlayArrow />
                    </template>
                    测试运行
                  </a-button>
                  <a-button size="small" @click="toggleFullscreen" :type="isFullscreen ? 'primary' : 'outline'">
                    <template #icon>
                      <IconFullscreen v-if="!isFullscreen" />
                      <IconFullscreenExit v-else />
                    </template>
                    {{ isFullscreen ? '退出全屏' : '全屏编辑' }}
                  </a-button>
                </div>
                <div class="toolbar-right">
                  <span class="editor-info">{{ monacoLanguage }} | 行: {{ formData.code.split('\n').length }} | 自动保存: {{ autoSaveStatus }}</span>
                </div>
              </div>
              <div class="monaco-editor-wrapper" :class="{ 'fullscreen': isFullscreen }">
                <MonacoEditor
                  v-model="formData.code"
                  :language="monacoLanguage"
                  :options="enhancedEditorOptions"
                  :height="isFullscreen ? '80vh' : '400px'"
                  @change="handleCodeChange"
                  @keydown="handleKeyDown"
                  class="enhanced-editor"
                />
                
                <!-- 查找替换面板 -->
                <div v-if="findReplaceState.isOpen" class="find-replace-panel">
                  <div class="find-replace-header">
                    <span class="panel-title">{{ findReplaceState.showReplace ? '查找和替换' : '查找' }}</span>
                    <a-button type="text" size="small" @click="closeFindReplace">
                      <IconClose />
                    </a-button>
                  </div>
                  
                  <div class="find-replace-content">
                    <!-- 查找输入框 -->
                    <div class="find-input-row">
                      <a-input
                        v-model="findReplaceState.findText"
                        placeholder="查找内容"
                        size="small"
                        @input="performFind"
                        @keydown.enter="findNext"
                        class="find-input"
                      />
                      <div class="find-controls">
                        <a-button type="text" size="small" @click="findPrevious" title="查找上一个 (Shift+F3)">
                          <IconUp />
                        </a-button>
                        <a-button type="text" size="small" @click="findNext" title="查找下一个 (F3)">
                          <IconDown />
                        </a-button>
                        <span class="match-count" v-if="findReplaceState.totalMatches > 0">
                          {{ findReplaceState.currentMatch }}/{{ findReplaceState.totalMatches }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- 替换输入框 -->
                    <div v-if="findReplaceState.showReplace" class="replace-input-row">
                      <a-input
                        v-model="findReplaceState.replaceText"
                        placeholder="替换内容"
                        size="small"
                        @keydown.enter="replaceCurrent"
                        class="replace-input"
                      />
                      <div class="replace-controls">
                        <a-button type="text" size="small" @click="replaceCurrent" title="替换当前">
                          <IconCode />
                        </a-button>
                        <a-button type="text" size="small" @click="replaceAll" title="替换全部">
                          <IconSave />
                        </a-button>
                      </div>
                    </div>
                    
                    <!-- 选项开关 -->
                    <div class="find-options">
                      <a-checkbox v-model="findReplaceState.matchCase" size="small" @change="performFind">
                        区分大小写
                      </a-checkbox>
                      <a-checkbox v-model="findReplaceState.wholeWord" size="small" @change="performFind">
                        全字匹配
                      </a-checkbox>
                      <a-checkbox v-model="findReplaceState.isRegex" size="small" @change="performFind">
                        正则表达式
                      </a-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
          </div>
        </div>

        <!-- 出参定义 -->
        <div class="form-section">
          <a-card title="出参定义">
            <div class="params-definition">
              <div class="params-header">
                <span>参数列表</span>
                <div class="params-header-buttons">
                  <a-button 
                    v-if="formData.language === 'SQL'" 
                    type="outline" 
                    size="small" 
                    @click="parseSqlFields"
                    style="margin-right: 8px;"
                  >
                    <template #icon>
                      <IconCode />
                    </template>
                    解析SQL字段
                  </a-button>
                  <a-button type="primary" size="small" @click="addOutputParameter">
                    <template #icon>
                      <icon-plus />
                    </template>
                    添加参数
                  </a-button>
                </div>
              </div>
              <div class="params-list">
                <div v-if="formData.outputParams.length === 0" class="empty-params">
                  <icon-info-circle />
                  暂无出参，点击上方按钮添加
                </div>
                <div v-else>
                  <!-- 出参表头 -->
                  <div class="param-table-header">
                    <a-row :gutter="8">
                      <a-col :span="formData.language === 'SQL' ? 10 : 6">
                        <span class="header-label">{{ formData.language === 'SQL' ? '原字段名' : '参数名' }}</span>
                      </a-col>
                      <a-col :span="formData.language === 'SQL' ? 12 : 5">
                        <span class="header-label">{{ formData.language === 'SQL' ? '别名' : '中文名称' }}</span>
                      </a-col>
                      <a-col :span="4" v-if="formData.language !== 'SQL'">
                        <span class="header-label">类型</span>
                      </a-col>
                      <a-col :span="2" v-if="formData.language !== 'SQL'">
                        <span class="header-label">必填</span>
                      </a-col>
                      <a-col :span="5" v-if="formData.language !== 'SQL'">
                        <span class="header-label">描述</span>
                      </a-col>
                      <a-col :span="2">
                        <span class="header-label">操作</span>
                      </a-col>
                    </a-row>
                  </div>
                  
                  <!-- 出参数据行 -->
                  <div v-for="(param, index) in formData.outputParams" :key="index" class="param-definition-item">
                    <a-row :gutter="8">
                      <a-col :span="formData.language === 'SQL' ? 10 : 6">
                        <a-form-item :field="`outputParams.${index}.name`" :rules="[{ required: true, message: '参数名不能为空' }]">
                          <a-input 
                            v-model="param.name" 
                            :placeholder="formData.language === 'SQL' ? '原字段名' : '参数名'" 
                            @change="updateParameterHints" 
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="formData.language === 'SQL' ? 12 : 5">
                        <a-form-item>
                          <a-input 
                            v-model="param.chineseName" 
                            :placeholder="formData.language === 'SQL' ? '别名' : '中文名称'" 
                            @change="onParameterChange" 
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="4" v-if="formData.language !== 'SQL'">
                        <a-form-item :field="`outputParams.${index}.type`" :rules="[{ required: true, message: '参数类型不能为空' }]">
                          <a-select v-model="param.type" placeholder="类型" @change="onParameterChange">
                            <a-option value="string">字符串</a-option>
                            <a-option value="number">数字</a-option>
                            <a-option value="boolean">布尔值</a-option>
                            <a-option value="array">数组</a-option>
                            <a-option value="object">对象</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="2" v-if="formData.language !== 'SQL'">
                        <a-form-item>
                          <a-checkbox v-model="param.required" @change="onParameterChange">必填</a-checkbox>
                        </a-form-item>
                      </a-col>
                      <a-col :span="5" v-if="formData.language !== 'SQL'">
                        <a-form-item>
                          <a-input v-model="param.description" placeholder="参数描述" @change="onParameterChange" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="2">
                        <a-button 
                          type="text" 
                          status="danger" 
                          @click="removeOutputParameter(index)"
                          title="删除参数"
                        >
                          <template #icon>
                            <icon-delete />
                          </template>
                        </a-button>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconArrowLeft,
  IconSave,
  IconPlus,
  IconDelete,
  IconCode,
  IconUp,
  IconDown,
  IconInfoCircle,
  IconFullscreen,
  IconFullscreenExit,
  IconPlayArrow,
  IconCheck,
  IconCheckCircle,
  IconExclamationCircle,
  IconClose
} from '@arco-design/web-vue/es/icon'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { 
  getDataModelDetail, 
  createDataModel, 
  updateDataModel, 
  saveDraft 
} from '@/api/dataModels'

const router = useRouter()
const route = useRoute()

// 响应式数据
const formRef = ref()
const saving = ref(false)
const selectedTemplate = ref('')
const isFullscreen = ref(false)
const autoSaveTimer = ref(null)
const autoSaveStatus = ref('已保存')

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// Monaco Editor 相关计算属性
const monacoLanguage = computed(() => {
  return formData.language === 'SQL' ? 'sql' : 'python'
})

const enhancedEditorOptions = computed(() => {
  return {
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    lineNumbers: 'on',
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'always',
    foldingHighlight: true,
    bracketPairColorization: {
      enabled: true
    },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggest: {
      enabled: true,
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showVariables: true
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: {
      enabled: true
    },
    hover: {
      enabled: true
    },
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'always'
    },
    // 智能缩进
    autoIndent: 'full',
    // 错误提示
    glyphMargin: true,
    renderValidationDecorations: 'on',
    // 其他增强功能
    renderWhitespace: 'selection',
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: true,
    smoothScrolling: true
  }
})

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  useCase: '',
  applicationSystem: '',
  language: 'SQL',
  manager: '',
  code: '',
  inputParams: [],
  outputParams: [],
  parameters: [],
  executionConfig: {
    timeout: 300,
    maxMemory: 1024,
    executor: 'Hive'
  }
})

// 代码模板
const codeTemplates = {
  'sql-select': `-- 基础查询模板
SELECT 
    column1,
    column2,
    COUNT(*) as count
FROM 
    table_name
WHERE 
    condition = 'value'
GROUP BY 
    column1, column2
ORDER BY 
    count DESC
LIMIT 100;`,
  'sql-insert': `-- 数据插入模板
INSERT INTO table_name (
    column1,
    column2,
    column3
) VALUES (
    'value1',
    'value2',
    'value3'
);`,
  'sql-update': `-- 数据更新模板
UPDATE table_name 
SET 
    column1 = 'new_value1',
    column2 = 'new_value2',
    updated_at = NOW()
WHERE 
    id = 1;`,
  'sql-analysis': `-- 数据分析模板
WITH monthly_stats AS (
    SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_count,
        AVG(amount) as avg_amount
    FROM 
        transactions
    WHERE 
        created_at >= '2024-01-01'
    GROUP BY 
        DATE_TRUNC('month', created_at)
)
SELECT 
    month,
    total_count,
    ROUND(avg_amount, 2) as avg_amount,
    LAG(total_count) OVER (ORDER BY month) as prev_month_count
FROM 
    monthly_stats
ORDER BY 
    month;`,
  'sql-etl': `-- ETL数据处理模板
-- 1. 数据提取 (Extract)
CREATE TEMPORARY TABLE temp_raw_data AS
SELECT *
FROM source_table
WHERE created_date >= CURRENT_DATE - INTERVAL '7' DAY;

-- 2. 数据转换 (Transform)
CREATE TEMPORARY TABLE temp_cleaned_data AS
SELECT 
    id,
    TRIM(UPPER(name)) as clean_name,
    CASE 
        WHEN status = 'A' THEN 'Active'
        WHEN status = 'I' THEN 'Inactive'
        ELSE 'Unknown'
    END as status_desc,
    CAST(amount AS DECIMAL(10,2)) as amount,
    DATE(created_date) as process_date
FROM temp_raw_data
WHERE name IS NOT NULL
    AND amount > 0;

-- 3. 数据加载 (Load)
INSERT INTO target_table
SELECT * FROM temp_cleaned_data;

-- 清理临时表
DROP TABLE temp_raw_data;
DROP TABLE temp_cleaned_data;`,
  'python-basic': `# 基础Python脚本模板
def main():
    """
    主函数
    """
    # 在这里编写你的代码
    result = process_data()
    return result

def process_data():
    """
    数据处理函数
    """
    # 处理逻辑
    data = []
    
    # 返回处理结果
    return {
        'status': 'success',
        'data': data,
        'count': len(data)
    }

if __name__ == '__main__':
    result = main()
    print(result)`,
  'python-pandas': `# 数据处理模板
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_data(input_data):
    """
    数据处理函数
    
    Args:
        input_data: 输入数据
    
    Returns:
        处理后的数据
    """
    try:
        # 数据清洗
        df = pd.DataFrame(input_data)
        logger.info(f"原始数据行数: {len(df)}")
        
        # 删除空值和重复值
        df = df.dropna()
        df = df.drop_duplicates()
        logger.info(f"清洗后数据行数: {len(df)}")
        
        # 数据类型转换
        if 'date_column' in df.columns:
            df['date_column'] = pd.to_datetime(df['date_column'])
        
        # 数据验证
        if 'amount' in df.columns:
            df = df[df['amount'] > 0]  # 过滤负值
        
        # 数据聚合
        if 'category' in df.columns:
            result = df.groupby('category').agg({
                'amount': ['sum', 'mean', 'count', 'std']
            }).round(2)
            result.columns = ['total', 'average', 'count', 'std_dev']
            result = result.reset_index()
        else:
            result = df
        
        return result.to_dict('records')
        
    except Exception as e:
        logger.error(f"数据处理错误: {str(e)}")
        raise

# 主函数
if __name__ == "__main__":
    # 示例数据
    sample_data = [
        {'category': 'A', 'amount': 100, 'date_column': '2024-01-01'},
        {'category': 'B', 'amount': 200, 'date_column': '2024-01-02'},
        {'category': 'A', 'amount': 150, 'date_column': '2024-01-03'}
    ]
    
    result = process_data(sample_data)
    print("处理结果:")
    for item in result:
        print(item)`,
  'python-ml': `# 机器学习模板
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

def train_model(data, target_column, test_size=0.2):
    """
    机器学习模型训练
    
    Args:
        data: 训练数据
        target_column: 目标列名
        test_size: 测试集比例
    
    Returns:
        训练好的模型和评估结果
    """
    try:
        df = pd.DataFrame(data)
        print(f"数据集大小: {df.shape}")
        
        # 特征和目标分离
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # 数据预处理
        # 处理分类特征
        categorical_columns = X.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
        
        # 特征标准化
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # 数据分割
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # 模型训练
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # 模型评估
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # 交叉验证
        cv_scores = cross_val_score(model, X_scaled, y, cv=5)
        
        # 特征重要性
        feature_importance = dict(zip(X.columns, model.feature_importances_))
        
        return {
            'model': model,
            'scaler': scaler,
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance,
            'classification_report': classification_report(y_test, y_pred)
        }
        
    except Exception as e:
        print(f"模型训练错误: {str(e)}")
        raise

def predict_new_data(model, scaler, new_data):
    """
    使用训练好的模型进行预测
    """
    X_new = pd.DataFrame(new_data)
    X_new_scaled = scaler.transform(X_new)
    predictions = model.predict(X_new_scaled)
    probabilities = model.predict_proba(X_new_scaled)
    
    return {
        'predictions': predictions.tolist(),
        'probabilities': probabilities.tolist()
    }

# 使用示例
if __name__ == "__main__":
    # 示例数据
    sample_data = [
        {'feature1': 1.0, 'feature2': 2.0, 'category': 'A', 'target': 0},
        {'feature1': 2.0, 'feature2': 3.0, 'category': 'B', 'target': 1},
        {'feature1': 1.5, 'feature2': 2.5, 'category': 'A', 'target': 0},
        {'feature1': 2.5, 'feature2': 3.5, 'category': 'B', 'target': 1}
    ]
    
    result = train_model(sample_data, 'target')
    print(f"模型准确率: {result['accuracy']:.3f}")
    print(f"交叉验证得分: {result['cv_mean']:.3f} (+/- {result['cv_std']*2:.3f})")
    print("特征重要性:")
    for feature, importance in result['feature_importance'].items():
        print(f"  {feature}: {importance:.3f}")`,
  'python-api': `# API数据获取模板
import requests
import pandas as pd
import json
from datetime import datetime
import time

def fetch_api_data(api_url, headers=None, params=None, retry_times=3):
    """
    从API获取数据
    
    Args:
        api_url: API地址
        headers: 请求头
        params: 请求参数
        retry_times: 重试次数
    
    Returns:
        API响应数据
    """
    if headers is None:
        headers = {'Content-Type': 'application/json'}
    
    for attempt in range(retry_times):
        try:
            response = requests.get(
                api_url, 
                headers=headers, 
                params=params, 
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            print(f"成功获取数据，记录数: {len(data) if isinstance(data, list) else 1}")
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"请求失败 (尝试 {attempt + 1}/{retry_times}): {str(e)}")
            if attempt < retry_times - 1:
                time.sleep(2 ** attempt)  # 指数退避
            else:
                raise

def process_api_response(data, date_column=None):
    """
    处理API响应数据
    """
    try:
        # 转换为DataFrame
        if isinstance(data, dict) and 'data' in data:
            df = pd.DataFrame(data['data'])
        else:
            df = pd.DataFrame(data)
        
        # 日期处理
        if date_column and date_column in df.columns:
            df[date_column] = pd.to_datetime(df[date_column])
            df = df.sort_values(date_column)
        
        # 数据清洗
        df = df.dropna()
        
        # 添加处理时间戳
        df['processed_at'] = datetime.now()
        
        return df
        
    except Exception as e:
        print(f"数据处理错误: {str(e)}")
        raise

# 主函数
if __name__ == "__main__":
    # 配置
    API_URL = "https://api.example.com/data"
    HEADERS = {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    }
    PARAMS = {
        'limit': 100,
        'start_date': '2024-01-01'
    }
    
    try:
        # 获取数据
        raw_data = fetch_api_data(API_URL, HEADERS, PARAMS)
        
        # 处理数据
        processed_df = process_api_response(raw_data, 'created_date')
        
        # 保存结果
        output_file = f"api_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        processed_df.to_csv(output_file, index=False)
        print(f"数据已保存到: {output_file}")
        
        # 显示统计信息
        print(f"\n数据统计:")
        print(f"总记录数: {len(processed_df)}")
        print(f"列数: {len(processed_df.columns)}")
        print(f"数据列: {list(processed_df.columns)}")
        
    except Exception as e:
        print(f"执行失败: {str(e)}")`
}

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入模型名称' },
    { minLength: 2, message: '模型名称至少2个字符' },
    { maxLength: 50, message: '模型名称不能超过50个字符' }
  ],
  description: [
    { required: true, message: '请输入模型描述' },
    { maxLength: 200, message: '模型描述不能超过200个字符' }
  ],
  useCase: [
    { required: true, message: '请选择使用场景' }
  ],
  applicationSystem: [
    { required: true, message: '请选择应用系统' }
  ],
  language: [
    { required: true, message: '请选择语言类型' }
  ],
  manager: [
    { required: true, message: '请输入管理人' }
  ],
  code: [
    { required: true, message: '请输入代码内容' }
  ],
  timeout: [
    { required: true, message: '请输入超时时间' },
    { type: 'number', min: 1, max: 3600, message: '超时时间必须在1-3600秒之间' }
  ],
  maxMemory: [
    { required: true, message: '请输入最大内存' },
    { type: 'number', min: 128, max: 8192, message: '最大内存必须在128-8192MB之间' }
  ],
  inputParams: [
    {
      validator: (value, callback) => {
        if (value && value.length > 0) {
          for (let i = 0; i < value.length; i++) {
            const param = value[i]
            if (!param.name || param.name.trim() === '') {
              callback(new Error(`第${i + 1}个入参的参数名不能为空`))
              return
            }
            if (!param.type) {
              callback(new Error(`第${i + 1}个入参的参数类型不能为空`))
              return
            }
            // 验证参数中文名长度
            if (param.chineseName && param.chineseName.length > 50) {
              callback(new Error(`第${i + 1}个入参的参数中文名不能超过50个字符`))
              return
            }
            // 检查参数名是否重复
            const duplicateIndex = value.findIndex((p, index) => index !== i && p.name === param.name)
            if (duplicateIndex !== -1) {
              callback(new Error(`入参中存在重复的参数名: ${param.name}`))
              return
            }
          }
        }
        callback()
      }
    }
  ],
  outputParams: [
    {
      validator: (value, callback) => {
        if (value && value.length > 0) {
          for (let i = 0; i < value.length; i++) {
            const param = value[i]
            if (!param.name || param.name.trim() === '') {
              callback(new Error(`第${i + 1}个出参的参数名不能为空`))
              return
            }
            if (!param.type) {
              callback(new Error(`第${i + 1}个出参的参数类型不能为空`))
              return
            }
            // 检查参数名是否重复
            const duplicateIndex = value.findIndex((p, index) => index !== i && p.name === param.name)
            if (duplicateIndex !== -1) {
              callback(new Error(`出参中存在重复的参数名: ${param.name}`))
              return
            }
          }
        }
        callback()
      }
    }
  ]
}

// 事件处理函数
const handleBack = () => {
  router.back()
}

const handleLanguageChange = (language) => {
  // 切换语言时更新代码模板
  if (language === 'sql') {
    formData.code = formData.code || 'SELECT * FROM table_name WHERE condition;'
  } else if (language === 'python') {
    formData.code = formData.code || 'import pandas as pd\n\n# 数据处理代码\ndf = pd.read_csv("data.csv")\nprint(df.head())'
  }
  // 清空模板选择
  selectedTemplate.value = ''
}

// 应用系统变化处理
const handleApplicationSystemChange = (applicationSystem) => {
  if (applicationSystem === 'CUSTOMER_360') {
    // 检查是否已存在cust_no参数
    const existingParam = formData.inputParams.find(param => param.name === 'cust_no')
    
    if (!existingParam) {
      // 添加固定入参cust_no
      formData.inputParams.unshift({
        name: 'cust_no',
        type: 'string',
        required: true,
        description: '用户身份证号',
        isFixed: true // 标记为固定参数，不可删除
      })
      Message.success('已自动添加客户360系统必需的入参：cust_no（用户身份证号）')
    }
  } else {
    // 切换到其他应用系统时，询问是否保留cust_no参数
    const custNoParam = formData.inputParams.find(param => param.name === 'cust_no' && param.isFixed)
    if (custNoParam) {
      Modal.confirm({
        title: '参数保留确认',
        content: '检测到客户360系统的固定参数"cust_no"，是否保留该参数？',
        okText: '保留',
        cancelText: '删除',
        onOk: () => {
          // 保留参数但移除固定标记
          custNoParam.isFixed = false
          Message.info('已保留cust_no参数，现在可以手动编辑或删除')
        },
        onCancel: () => {
          // 删除参数
          const index = formData.inputParams.findIndex(param => param.name === 'cust_no' && param.isFixed)
          if (index !== -1) {
            formData.inputParams.splice(index, 1)
            Message.info('已删除cust_no参数')
          }
        }
      })
    }
  }
}

// 运行测试
const handleRunTest = async () => {
  if (!formData.code.trim()) {
    Message.warning('请先编写代码')
    return
  }
  
  try {
    Message.info('正在运行测试...')
    // 这里可以添加实际的测试逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('测试运行完成')
  } catch (error) {
    // 🔧 修复：改进错误处理逻辑，避免Vue组件事件处理器错误
    const errorMessage = error && error.message ? error.message : '未知错误'
    Message.error('测试运行失败: ' + errorMessage)
  }
}

// Monaco Editor 相关方法
const handleCodeChange = (value) => {
  formData.code = value
  // 代码变更时重置自动保存状态
  autoSaveStatus.value = '未保存'
  // 重新启动自动保存定时器
  startAutoSave()
  
  // 生成参数提示
  generateParameterHints()
  
  // 语法验证
  validateSyntax(value)
}

const handleKeyDown = (event) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleSave()
  }
  // Ctrl+Shift+F 格式化
  else if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    event.preventDefault()
    formatCode()
  }
  // Ctrl+F 查找
  else if (event.ctrlKey && event.key === 'f') {
    event.preventDefault()
    openFindReplace()
  }
  // Ctrl+H 替换
  else if (event.ctrlKey && event.key === 'h') {
    event.preventDefault()
    openFindReplace(true)
  }
  // Ctrl+R 测试运行
  else if (event.ctrlKey && event.key === 'r') {
    event.preventDefault()
    handleRunTest()
  }
  // F11 全屏
  else if (event.key === 'F11') {
    event.preventDefault()
    toggleFullscreen()
  }
  // F3 查找下一个
  else if (event.key === 'F3') {
    event.preventDefault()
    findNext()
  }
  // Shift+F3 查找上一个
  else if (event.shiftKey && event.key === 'F3') {
    event.preventDefault()
    findPrevious()
  }
}

const formatCode = () => {
  // 这里可以添加代码格式化逻辑
  Message.info('代码格式化功能开发中...')
}

const validateCode = () => {
  if (!formData.code.trim()) {
    Message.warning('请先输入代码内容')
    return
  }
  
  // 简单的语法检查
  if (formData.languageType === 'SQL') {
    const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE']
    const hasKeyword = sqlKeywords.some(keyword => 
      formData.code.toUpperCase().includes(keyword)
    )
    if (hasKeyword) {
      Message.success('SQL语法检查通过')
    } else {
      Message.warning('未检测到有效的SQL关键字')
    }
  } else if (formData.languageType === 'Python') {
    const pythonKeywords = ['def', 'import', 'if', 'for', 'while', 'class']
    const hasKeyword = pythonKeywords.some(keyword => 
      formData.code.includes(keyword)
    )
    if (hasKeyword) {
      Message.success('Python语法检查通过')
    } else {
      Message.warning('未检测到有效的Python关键字')
    }
  }
}

// 模板相关方法
const applyTemplate = (templateKey) => {
  if (templateKey && codeTemplates[templateKey]) {
    formData.code = codeTemplates[templateKey]
    Message.success('模板已应用')
  }
}

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 自动保存功能
const startAutoSave = () => {
  // 清除现有定时器
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
  }
  
  // 设置30秒自动保存
  autoSaveTimer.value = setInterval(() => {
    if (autoSaveStatus.value === '未保存' && formData.code.trim()) {
      autoSaveStatus.value = '保存中...'
      // 这里可以调用自动保存逻辑
      setTimeout(() => {
        autoSaveStatus.value = '已保存'
      }, 1000)
    }
  }, 30000)
}

// 停止自动保存
const stopAutoSave = () => {
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
    autoSaveTimer.value = null
  }
}

// 更新参数提示
const updateParameterHints = () => {
  // 当参数发生变化时，可以更新编辑器的智能提示
  const hints = generateParameterHints()
  
  // 如果代码为空或只包含注释，自动添加参数提示
  const currentCode = formData.code || ''
  const codeWithoutComments = currentCode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/#.*$/gm, '').trim()
  
  if (!codeWithoutComments && hints.length > 0) {
    const hintComment = generateParameterComment()
    const templateCode = formData.languageType === 'SQL' ? 
      'SELECT * FROM your_table;' : 
      '# 在这里编写你的代码'
    
    formData.code = hintComment + '\n\n' + templateCode
    autoSaveStatus.value = '未保存'
  }
  
  // 触发Monaco编辑器的智能提示更新
  nextTick(() => {
    // 这里可以通过Monaco编辑器的API来注册自定义的代码补全提供者
    console.log('参数提示已更新:', hints)
  })
}

// 生成参数提示
const generateParameterHints = () => {
  const inputParams = formData.inputParams || []
  const outputParams = formData.outputParams || []
  const parameters = formData.parameters || []
  
  const hints = []
  
  // 入参提示
  inputParams.forEach(param => {
    if (param.name && param.type) {
      hints.push({
        name: param.name,
        type: param.type,
        description: param.description || '',
        category: 'input',
        required: param.required || false
      })
    }
  })
  
  // 出参提示
  outputParams.forEach(param => {
    if (param.name && param.type) {
      hints.push({
        name: param.name,
        type: param.type,
        description: param.description || '',
        category: 'output',
        required: param.required || false
      })
    }
  })
  
  // 普通参数提示
  parameters.forEach(param => {
    if (param.name && param.type) {
      hints.push({
        name: param.name,
        type: param.type,
        description: param.description || '',
        category: 'parameter',
        required: param.required || false
      })
    }
  })
  
  return hints
}

// 生成参数注释
const generateParameterComment = () => {
  const hints = generateParameterHints()
  
  if (hints.length === 0) return ''
  
  const isSQL = formData.languageType === 'SQL'
  const commentStart = isSQL ? '/*' : '"""'
  const commentEnd = isSQL ? '*/' : '"""'
  const linePrefix = isSQL ? ' * ' : ''
  
  let comment = commentStart + '\n'
  comment += linePrefix + '可用参数:\n'
  
  const categories = {
    input: '入参',
    output: '出参', 
    parameter: '参数'
  }
  
  Object.keys(categories).forEach(category => {
    const categoryHints = hints.filter(h => h.category === category)
    if (categoryHints.length > 0) {
      comment += linePrefix + `${categories[category]}:\n`
      categoryHints.forEach(hint => {
        const required = hint.required ? ' (必填)' : ''
        const desc = hint.description ? ` - ${hint.description}` : ''
        comment += linePrefix + `  ${hint.name} (${hint.type})${required}${desc}\n`
      })
    }
  })
  
  comment += commentEnd
  
  return comment
}

// 参数变更处理
const onParameterChange = () => {
  updateParameterHints()
}

// 语法验证
const validateSyntax = (code) => {
  if (!code || !code.trim()) return
  
  const language = formData.languageType
  const errors = []
  
  try {
    if (language === 'SQL') {
      // SQL语法基础检查
      const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'INSERT', 'UPDATE', 'DELETE']
      const lines = code.split('\n')
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim().toUpperCase()
        
        // 检查SQL语句是否以分号结尾（对于多语句）
        if (trimmedLine && !trimmedLine.startsWith('--') && 
            (trimmedLine.includes('SELECT') || trimmedLine.includes('INSERT') || 
             trimmedLine.includes('UPDATE') || trimmedLine.includes('DELETE')) &&
            !trimmedLine.endsWith(';') && index < lines.length - 1) {
          errors.push({
            line: index + 1,
            column: line.length,
            message: 'SQL语句建议以分号结尾',
            severity: 'warning'
          })
        }
        
        // 检查括号匹配
        const openParens = (line.match(/\(/g) || []).length
        const closeParens = (line.match(/\)/g) || []).length
        if (openParens !== closeParens) {
          errors.push({
            line: index + 1,
            column: 1,
            message: '括号不匹配',
            severity: 'error'
          })
        }
      })
    } else if (language === 'Python') {
      // Python语法基础检查
      const lines = code.split('\n')
      let indentLevel = 0
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine.startsWith('#')) return
        
        // 检查缩进
        const currentIndent = line.length - line.trimStart().length
        
        // 检查冒号后的缩进
        if (trimmedLine.endsWith(':')) {
          indentLevel = currentIndent + 4
        } else if (currentIndent < indentLevel && trimmedLine) {
          indentLevel = currentIndent
        }
        
        // 检查括号匹配
        const openBrackets = (line.match(/[\(\[\{]/g) || []).length
        const closeBrackets = (line.match(/[\)\]\}]/g) || []).length
        if (openBrackets !== closeBrackets) {
          errors.push({
            line: index + 1,
            column: 1,
            message: '括号不匹配',
            severity: 'error'
          })
        }
        
        // 检查常见语法错误
        if (trimmedLine.includes('=') && !trimmedLine.includes('==') && 
            (trimmedLine.includes('if ') || trimmedLine.includes('elif ') || trimmedLine.includes('while '))) {
          errors.push({
            line: index + 1,
            column: line.indexOf('=') + 1,
            message: '条件语句中可能需要使用 == 而不是 =',
            severity: 'warning'
          })
        }
      })
    }
    
    // 更新编辑器标记
    updateEditorMarkers(errors)
    
  } catch (error) {
    console.error('语法验证错误:', error)
  }
}

// 更新编辑器错误标记
const updateEditorMarkers = (errors) => {
  // 这里需要Monaco编辑器实例来设置标记
  // 在实际应用中，需要获取编辑器实例并调用setModelMarkers方法
  console.log('语法错误:', errors)
  
  // 示例：如果有Monaco编辑器实例
  // if (editorInstance) {
  //   const markers = errors.map(error => ({
  //     startLineNumber: error.line,
  //     startColumn: error.column,
  //     endLineNumber: error.line,
  //     endColumn: error.column + 1,
  //     message: error.message,
  //     severity: error.severity === 'error' ? 8 : 4 // Error: 8, Warning: 4
  //   }))
  //   window.monaco.editor.setModelMarkers(editorInstance.getModel(), 'syntax', markers)
  // }
}

// 查找替换功能
const findReplaceState = ref({
  isOpen: false,
  findText: '',
  replaceText: '',
  isRegex: false,
  matchCase: false,
  wholeWord: false,
  currentMatch: 0,
  totalMatches: 0
})

// 打开查找替换面板
const openFindReplace = (showReplace = false) => {
  findReplaceState.value.isOpen = true
  findReplaceState.value.showReplace = showReplace
  
  // 如果有选中文本，自动填入查找框
  // 这里需要Monaco编辑器实例来获取选中文本
  // if (editorInstance) {
  //   const selection = editorInstance.getSelection()
  //   const selectedText = editorInstance.getModel().getValueInRange(selection)
  //   if (selectedText) {
  //     findReplaceState.value.findText = selectedText
  //   }
  // }
}

// 关闭查找替换面板
const closeFindReplace = () => {
  findReplaceState.value.isOpen = false
  // 清除高亮
  clearFindHighlights()
}

// 执行查找
const performFind = () => {
  const { findText, isRegex, matchCase, wholeWord } = findReplaceState.value
  if (!findText) return

  try {
    let searchRegex
    if (isRegex) {
      const flags = matchCase ? 'g' : 'gi'
      searchRegex = new RegExp(findText, flags)
    } else {
      const escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = wholeWord ? `\\b${escapedText}\\b` : escapedText
      const flags = matchCase ? 'g' : 'gi'
      searchRegex = new RegExp(pattern, flags)
    }

    const code = formData.code || ''
    const matches = [...code.matchAll(searchRegex)]
    
    findReplaceState.value.totalMatches = matches.length
    findReplaceState.value.currentMatch = matches.length > 0 ? 1 : 0

    // 高亮显示匹配项
    highlightMatches(matches)
    
    return matches
  } catch (error) {
    console.error('查找错误:', error)
    Message.error('查找表达式有误')
    return []
  }
}

// 查找下一个
const findNext = () => {
  const matches = performFind()
  if (matches.length > 0) {
    findReplaceState.value.currentMatch = 
      findReplaceState.value.currentMatch < matches.length ? 
      findReplaceState.value.currentMatch + 1 : 1
    
    // 跳转到匹配位置
    jumpToMatch(matches[findReplaceState.value.currentMatch - 1])
  }
}

// 查找上一个
const findPrevious = () => {
  const matches = performFind()
  if (matches.length > 0) {
    findReplaceState.value.currentMatch = 
      findReplaceState.value.currentMatch > 1 ? 
      findReplaceState.value.currentMatch - 1 : matches.length
    
    // 跳转到匹配位置
    jumpToMatch(matches[findReplaceState.value.currentMatch - 1])
  }
}

// 替换当前匹配项
const replaceCurrent = () => {
  const matches = performFind()
  if (matches.length > 0 && findReplaceState.value.currentMatch > 0) {
    const match = matches[findReplaceState.value.currentMatch - 1]
    const { replaceText } = findReplaceState.value
    
    // 执行替换
    const code = formData.code || ''
    const beforeMatch = code.substring(0, match.index)
    const afterMatch = code.substring(match.index + match[0].length)
    
    formData.code = beforeMatch + replaceText + afterMatch
    
    // 重新查找以更新匹配项
    setTimeout(() => {
      performFind()
    }, 100)
  }
}

// 替换所有匹配项
const replaceAll = () => {
  const { findText, replaceText, isRegex, matchCase, wholeWord } = findReplaceState.value
  if (!findText) return

  try {
    let searchRegex
    if (isRegex) {
      const flags = matchCase ? 'g' : 'gi'
      searchRegex = new RegExp(findText, flags)
    } else {
      const escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = wholeWord ? `\\b${escapedText}\\b` : escapedText
      const flags = matchCase ? 'g' : 'gi'
      searchRegex = new RegExp(pattern, flags)
    }

    const originalCode = formData.code || ''
    const newCode = originalCode.replace(searchRegex, replaceText)
    
    const replacedCount = (originalCode.match(searchRegex) || []).length
    formData.code = newCode
    
    Message.success(`已替换 ${replacedCount} 处匹配项`)
    
    // 重新查找以更新匹配项
    setTimeout(() => {
      performFind()
    }, 100)
    
  } catch (error) {
    console.error('替换错误:', error)
    Message.error('替换表达式有误')
  }
}

// 高亮显示匹配项
const highlightMatches = (matches) => {
  // 这里需要Monaco编辑器实例来设置高亮
  console.log('高亮匹配项:', matches.length)
  
  // 示例：如果有Monaco编辑器实例
  // if (editorInstance && matches.length > 0) {
  //   const decorations = matches.map((match, index) => ({
  //     range: getMatchRange(match),
  //     options: {
  //       className: index === findReplaceState.value.currentMatch - 1 ? 
  //         'find-match-current' : 'find-match',
  //       stickiness: 1
  //     }
  //   }))
  //   editorInstance.deltaDecorations([], decorations)
  // }
}

// 清除查找高亮
const clearFindHighlights = () => {
  // 这里需要Monaco编辑器实例来清除高亮
  // if (editorInstance) {
  //   editorInstance.deltaDecorations(editorInstance.getModel().getAllDecorations(), [])
  // }
}

// 跳转到匹配位置
const jumpToMatch = (match) => {
  // 这里需要Monaco编辑器实例来跳转
  console.log('跳转到匹配位置:', match.index)
  
  // 示例：如果有Monaco编辑器实例
  // if (editorInstance) {
  //   const position = editorInstance.getModel().getPositionAt(match.index)
  //   editorInstance.setPosition(position)
  //   editorInstance.revealPositionInCenter(position)
  // }
}

const addParameter = () => {
  formData.parameters.push({
    name: '',
    type: 'string',
    defaultValue: '',
    description: ''
  })
}

const removeParameter = (index) => {
  formData.parameters.splice(index, 1)
}

// 添加入参
const addInputParameter = () => {
  formData.inputParams.push({
    name: '',
    chineseName: '',
    type: 'string',
    required: false,
    defaultValue: '',
    description: '',
    example: ''
  })
}

// 删除入参
const removeInputParameter = (index) => {
  const param = formData.inputParams[index]
  
  // 检查是否为固定参数（客户360系统的cust_no参数）
  if (param && param.isFixed) {
    Message.warning('该参数为应用系统固定参数，不可删除')
    return
  }
  
  formData.inputParams.splice(index, 1)
}

// 移动入参位置
const moveInputParameter = (index, direction) => {
  const params = formData.inputParams
  if (direction === 'up' && index > 0) {
    [params[index], params[index - 1]] = [params[index - 1], params[index]]
  } else if (direction === 'down' && index < params.length - 1) {
    [params[index], params[index + 1]] = [params[index + 1], params[index]]
  }
}

// 添加出参
const addOutputParameter = () => {
  formData.outputParams.push({
    name: '',
    type: 'string',
    required: false,
    defaultValue: '',
    description: '',
    chineseName: ''
  })
}

// 删除出参
const removeOutputParameter = (index) => {
  formData.outputParams.splice(index, 1)
}

// 移动出参位置
const moveOutputParameter = (index, direction) => {
  const params = formData.outputParams
  if (direction === 'up' && index > 0) {
    [params[index], params[index - 1]] = [params[index - 1], params[index]]
  } else if (direction === 'down' && index < params.length - 1) {
    [params[index], params[index + 1]] = [params[index + 1], params[index]]
  }
}

// 解析SQL字段
const parseSqlFields = () => {
  if (!formData.code || formData.language !== 'SQL') {
    Message.warning('请先输入SQL代码')
    return
  }

  try {
    const fields = extractSqlFields(formData.code)
    if (fields.length === 0) {
      Message.warning('未找到SELECT字段，请检查SQL语法')
      return
    }

    // 清空现有出参配置
    formData.outputParams = []
    
    // 添加解析出的字段
    fields.forEach(field => {
      formData.outputParams.push({
        name: field.originalName || field.name, // 原字段名
        type: 'string', // 默认类型为字符串
        required: false,
        defaultValue: '',
        description: field.description || '',
        chineseName: field.alias || '' // 别名，如果没有别名则为空
      })
    })

    Message.success(`成功解析${fields.length}个字段`)
    
    // 更新参数提示
    updateParameterHints()
  } catch (error) {
    console.error('SQL解析错误:', error)
    Message.error('SQL解析失败：' + error.message)
  }
}

// 提取SQL字段的函数
const extractSqlFields = (sql) => {
  const fields = []
  
  // 移除注释和多余空格
  let cleanSql = sql
    .replace(/--.*$/gm, '') // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()

  // 查找SELECT语句
  const selectRegex = /SELECT\s+(.*?)\s+FROM/i
  const match = cleanSql.match(selectRegex)
  
  if (!match) {
    throw new Error('未找到有效的SELECT语句')
  }

  const selectClause = match[1]
  
  // 分割字段，考虑函数调用中的逗号
  const fieldStrings = splitSelectFields(selectClause)
  
  fieldStrings.forEach(fieldStr => {
    const field = parseSelectField(fieldStr.trim())
    if (field) {
      fields.push(field)
    }
  })

  return fields
}

// 分割SELECT字段，处理函数中的逗号
const splitSelectFields = (selectClause) => {
  const fields = []
  let current = ''
  let parenthesesCount = 0
  let inQuotes = false
  let quoteChar = ''
  
  for (let i = 0; i < selectClause.length; i++) {
    const char = selectClause[i]
    
    if (!inQuotes && (char === '\'' || char === '"')) {
      inQuotes = true
      quoteChar = char
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false
      quoteChar = ''
    } else if (!inQuotes) {
      if (char === '(') {
        parenthesesCount++
      } else if (char === ')') {
        parenthesesCount--
      } else if (char === ',' && parenthesesCount === 0) {
        fields.push(current.trim())
        current = ''
        continue
      }
    }
    
    current += char
  }
  
  if (current.trim()) {
    fields.push(current.trim())
  }
  
  return fields
}

// 解析单个SELECT字段
const parseSelectField = (fieldStr) => {
  // 处理 AS 别名
  const asRegex = /^(.+?)\s+AS\s+([\w_]+)$/i
  const asMatch = fieldStr.match(asRegex)
  
  if (asMatch) {
    const originalExpr = asMatch[1].trim()
    let originalName = originalExpr
    
    // 如果原表达式是 table.field 格式，提取字段名作为原字段名
    if (originalExpr.includes('.') && !originalExpr.includes('(')) {
      const parts = originalExpr.split('.')
      originalName = parts[parts.length - 1]
    }
    
    return {
      name: originalName, // 原字段名
      originalName: originalName,
      alias: asMatch[2], // 别名
      originalExpression: originalExpr,
      description: `来源: ${originalExpr}`
    }
  }
  
  // 处理直接别名（空格分隔）
  const spaceAliasRegex = /^(.+?)\s+([\w_]+)$/
  const spaceMatch = fieldStr.match(spaceAliasRegex)
  
  if (spaceMatch && !spaceMatch[1].match(/\b(COUNT|SUM|AVG|MAX|MIN|DISTINCT)\b/i)) {
    // 确保不是函数调用
    const parts = fieldStr.split(/\s+/)
    if (parts.length === 2) {
      let originalName = parts[0]
      
      // 如果原表达式是 table.field 格式，提取字段名作为原字段名
      if (originalName.includes('.')) {
        const nameParts = originalName.split('.')
        originalName = nameParts[nameParts.length - 1]
      }
      
      return {
        name: originalName, // 原字段名
        originalName: originalName,
        alias: parts[1], // 别名
        originalExpression: parts[0],
        description: `来源: ${parts[0]}`
      }
    }
  }
  
  // 处理简单字段名或表达式
  let fieldName = fieldStr
  let originalName = fieldStr
  
  // 如果是 table.field 格式，提取字段名
  if (fieldName.includes('.') && !fieldName.includes('(')) {
    const parts = fieldName.split('.')
    fieldName = parts[parts.length - 1]
    originalName = fieldName // 原字段名就是提取出的字段名
  }
  
  // 处理函数调用
  const functionRegex = /^(COUNT|SUM|AVG|MAX|MIN|DISTINCT)\s*\(/i
  if (functionRegex.test(fieldStr)) {
    // 为函数生成合适的字段名
    const funcMatch = fieldStr.match(/^(\w+)\s*\(/i)
    if (funcMatch) {
      fieldName = funcMatch[1].toLowerCase() + '_result'
      originalName = fieldStr // 函数表达式作为原字段名
    }
  }
  
  // 处理 * 通配符
  if (fieldStr.trim() === '*') {
    return null // 跳过通配符，因为无法确定具体字段
  }
  
  return {
    name: originalName, // 原字段名
    originalName: originalName,
    alias: null, // 没有别名
    originalExpression: fieldStr,
    description: fieldStr !== originalName ? `来源: ${fieldStr}` : ''
  }
}

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    const response = await saveDraft(isEdit.value ? route.params.id : null, formData)
    
    if (response.code === 200) {
      Message.success('草稿保存成功')
      if (!isEdit.value) {
        // 新建模式下保存草稿后跳转到编辑页面
        router.replace(`/management/data-models/${response.data.id}/edit`)
      }
    } else {
      Message.error(response.message || '保存失败')
    }
  } catch (error) {
    // 🔧 修复：改进错误处理逻辑，避免Vue组件事件处理器错误
    console.error('保存草稿失败:', error)
    
    // 检查是否是表单验证错误
    if (error && typeof error === 'object' && error.errors && Array.isArray(error.errors)) {
      Message.error('请检查表单填写')
    } else if (error && error.message) {
      Message.error(error.message)
    } else {
      Message.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    let response
    if (isEdit.value) {
      response = await updateDataModel(route.params.id, {
        ...formData,
        status: 'active'
      })
    } else {
      response = await createDataModel({
        ...formData,
        status: 'active'
      })
    }
    
    if (response.code === 200) {
      Message.success(isEdit.value ? '模型更新成功' : '模型创建成功')
      router.push('/management/data-models')
    } else {
      Message.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    // 🔧 修复：改进错误处理逻辑，避免Vue组件事件处理器错误
    console.error('保存失败:', error)
    
    // 检查是否是表单验证错误
    if (error && typeof error === 'object' && error.errors && Array.isArray(error.errors)) {
      Message.error('请检查表单填写')
    } else if (error && error.message) {
      Message.error(error.message)
    } else {
      Message.error(isEdit.value ? '更新失败' : '创建失败')
    }
  } finally {
    saving.value = false
  }
}

const saveModel = async (status) => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const modelData = {
      ...formData,
      status,
      version: isEdit.value ? '2.0' : '1.0',
      updatedAt: new Date().toISOString().split('T')[0]
    }
    
    console.log('保存模型数据:', modelData)
    
    Message.success(isEdit.value ? '模型更新成功' : '模型创建成功')
    router.push('/management/data-models')
  } catch (error) {
    Message.error('保存失败，请重试')
    console.error('Save model error:', error)
  } finally {
    saving.value = false
  }
}

// 加载数据（编辑模式）
const loadModelData = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await getDataModelDetail(route.params.id)
    
    if (response.code === 200) {
      Object.assign(formData, response.data)
    } else {
      Message.error(response.message || '加载模型数据失败')
      router.back()
    }
  } catch (error) {
    console.error('加载模型数据失败:', error)
    Message.error('加载模型数据失败')
    router.back()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadModelData()
  startAutoSave()
})

// 组件卸载时清理
onUnmounted(() => {
  stopAutoSave()
})
</script>

<style scoped>
.data-models-form {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.form-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  width: 100%;
}

.form-left {
  flex: 0 0 400px;
  min-width: 400px;
}

.form-right {
  flex: 1;
  min-width: 600px;
}

.form-content {
  max-width: 1200px;
  /* 确保内容可以正常滚动 */
  width: 100%;
}

.form-section {
  margin-bottom: 24px;
}

.form-section :deep(.arco-card-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 20px;
}

.form-section :deep(.arco-card-body) {
  padding: 20px;
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
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.monaco-editor-wrapper {
  margin-top: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  overflow: hidden;
}

.editor-info {
  color: var(--color-text-2);
  font-size: 12px;
}

.params-config {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  font-weight: 500;
}

.params-list {
  padding: 16px;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.param-item:last-child {
  margin-bottom: 0;
}

/* 参数定义样式 */
.params-definition {
  width: 100%;
}

.params-definition .params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
  background: none;
}

.params-definition .params-header span {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.params-header-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.params-definition .params-list {
  width: 100%;
  padding: 0;
}

.param-definition-item {
  margin-bottom: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
}

.param-definition-item:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}

.param-definition-item:last-child {
  margin-bottom: 0;
}

.empty-params {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #86909c;
  font-size: 14px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #e5e6eb;
}

.empty-params .arco-icon {
  font-size: 16px;
}

.output-params-info {
  padding: 20px;
}

.info-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
}

.info-icon {
  color: #0ea5e9;
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
  flex-shrink: 0;
}

.info-text h4 {
  margin: 0 0 8px 0;
  color: #0c4a6e;
  font-size: 14px;
  font-weight: 600;
}

.info-text p {
  margin: 0;
  color: #075985;
  font-size: 13px;
  line-height: 1.5;
}

/* 全屏模式样式 */
.code-section.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #1e1e1e;
  padding: 20px;
}

.code-section.fullscreen .code-card {
  height: 100%;
  border: none;
}

.code-section.fullscreen .enhanced-editor {
  height: calc(100vh - 120px) !important;
}

/* 自动保存状态样式 */
.auto-save-status {
  display: inline-flex;
  align-items: center;
  margin-left: 12px;
  font-size: 12px;
}

.status-saved {
  color: #00b42a;
}

.status-saving {
  color: #ff7d00;
}

.status-unsaved {
  color: #f53f3f;
}

/* 增强编辑器样式 */
.enhanced-editor {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  overflow: hidden;
}

.enhanced-editor:focus-within {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 查找替换面板样式 */
.find-replace-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 350px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.find-replace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-2);
  background: var(--color-bg-1);
}

.panel-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-1);
}

.find-replace-content {
  padding: 12px;
}

.find-input-row,
.replace-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.find-input,
.replace-input {
  flex: 1;
}

.find-controls,
.replace-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-count {
  font-size: 11px;
  color: var(--color-text-3);
  margin-left: 8px;
  min-width: 40px;
}

.find-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.find-options .arco-checkbox {
  font-size: 11px;
}

/* 查找匹配高亮样式 */
.find-match {
  background-color: rgba(255, 255, 0, 0.3);
  border: 1px solid rgba(255, 255, 0, 0.8);
}

.find-match-current {
  background-color: rgba(255, 165, 0, 0.5);
  border: 1px solid rgba(255, 165, 0, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-layout {
    flex-direction: column;
  }
  
  .form-left,
  .form-right {
    flex: none;
    width: 100%;
    min-width: auto;
  }
  
  .param-item .arco-row {
    flex-direction: column;
  }
  
  .param-item .arco-col {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  .code-section.fullscreen {
    padding: 10px;
  }
  
  .find-replace-panel {
    width: 300px;
    right: 5px;
  }
}
</style>