<template>
  <div class="data-models-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <IconArrowLeft />
          </template>
          返回
        </a-button>
        <h2 class="page-title">{{ isEdit ? '编辑数据模型' : '新增数据模型' }}</h2>
        <a-space v-if="isEdit">
          <StatusTag :status="formData.status" dictKey="dataModelStatus" />
          <span class="meta-text">更新时间：{{ formData.updatedAt ? DateUtils.formatDateTime(formData.updatedAt) : '-' }}</span>
        </a-space>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleSaveDraft" :loading="saving">
            保存草稿
          </a-button>
          <a-button type="primary" @click="handleSave" :loading="saving">
            {{ isEdit ? '更新模型' : '创建模型' }}
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        @submit="handleSave"
      >
        <!-- 基本信息 -->
        <a-card title="基本信息" class="form-section">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="模型名称" field="name" required>
                <a-input
                  v-model="formData.name"
                  placeholder="请输入模型名称"
                  :max-length="50"
                  show-word-limit
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="使用场景" field="useCase" required>
                <a-select
                  v-model="formData.useCase"
                  placeholder="请选择使用场景"
                >
                  <a-option value="download">明细数据下载</a-option>
                  <a-option value="report">分析报告模板</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="语言类型" field="language" required>
                <a-select
                  v-model="formData.language"
                  placeholder="请选择语言类型"
                  @change="handleLanguageChange"
                >
                  <a-option value="sql">SQL</a-option>
                  <a-option value="python">Python</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="管理人" field="manager" required>
                <a-input
                  v-model="formData.manager"
                  placeholder="请输入管理人"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="模型描述" field="description">
            <a-textarea
              v-model="formData.description"
              placeholder="请输入模型描述"
              :max-length="200"
              show-word-limit
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
        </a-card>

        <!-- 入参定义 -->
        <a-card title="入参定义" class="form-section">
          <div class="params-definition">
            <div class="params-header">
              <span>定义模型的输入参数</span>
              <a-button size="small" @click="addInputParameter">
                <template #icon>
                  <IconPlus />
                </template>
                添加入参
              </a-button>
            </div>
            
            <div class="params-list">
              <div
                v-for="(param, index) in formData.inputParams"
                :key="index"
                class="param-definition-item"
              >
                <a-row :gutter="12">
                  <a-col :span="4">
                    <a-input
                      v-model="param.name"
                      placeholder="参数名"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="3">
                    <a-select
                      v-model="param.type"
                      placeholder="类型"
                      size="small"
                    >
                      <a-option value="string">字符串</a-option>
                      <a-option value="number">数字</a-option>
                      <a-option value="date">日期</a-option>
                      <a-option value="boolean">布尔值</a-option>
                      <a-option value="array">数组</a-option>
                      <a-option value="object">对象</a-option>
                    </a-select>
                  </a-col>
                  <a-col :span="2">
                    <a-checkbox v-model="param.required">必填</a-checkbox>
                  </a-col>
                  <a-col :span="4">
                    <a-input
                      v-model="param.defaultValue"
                      placeholder="默认值"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-input
                      v-model="param.description"
                      placeholder="参数描述"
                      size="small"
                    />
                  </a-col>
                  <a-col :span="3">
                    <a-space>
                      <a-button
                        size="small"
                        @click="moveInputParameter(index, 'up')"
                        :disabled="index === 0"
                      >
                        <template #icon><IconUp /></template>
                      </a-button>
                      <a-button
                        size="small"
                        @click="moveInputParameter(index, 'down')"
                        :disabled="index === formData.inputParams.length - 1"
                      >
                        <template #icon><IconDown /></template>
                      </a-button>
                      <a-button
                        size="small"
                        status="danger"
                        @click="removeInputParameter(index)"
                      >
                        <template #icon><IconDelete /></template>
                      </a-button>
                    </a-space>
                  </a-col>
                </a-row>
              </div>
              
              <div v-if="formData.inputParams.length === 0" class="empty-params">
                <IconInfoCircle />
                <span>暂无入参定义，点击上方按钮添加</span>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 代码编辑 -->
        <a-card title="代码编辑" class="form-section">
          <div class="code-editor-container">
            <div class="editor-toolbar">
              <a-space>
                <a-button size="small" @click="formatCode">
                   <template #icon><IconCode /></template>
                   格式化
                 </a-button>
                 <a-button size="small" @click="validateCode">
                   <template #icon><IconCheckCircle /></template>
                   语法检查
                 </a-button>
                <a-divider direction="vertical" />
                <span class="editor-info">{{ formData.languageType }} 编辑器</span>
              </a-space>
            </div>
            <!-- Monaco Editor -->
            <div class="monaco-editor-wrapper">
              <MonacoEditor
                v-model="formData.code"
                :language="editorLanguage"
                :height="'400px'"
                :theme="'vs-dark'"
                :options="editorOptions"
                @change="onCodeChange"
              />
            </div>
          </div>
        </a-card>



        <!-- 出参定义 -->
        <a-card title="出参定义" class="form-section">
          <div class="output-params-info">
            <div class="info-content">
              <IconInfoCircle class="info-icon" />
              <div class="info-text">
                <h4>自动解析说明</h4>
                <p>出参将根据代码执行结果自动解析，无需手动定义。系统会在模型执行时自动识别返回数据的结构和类型。</p>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 执行配置 -->
        <a-card title="执行配置" class="form-section">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="超时时间(秒)" field="timeout">
                <a-input-number
                  v-model="formData.timeout"
                  :min="1"
                  :max="3600"
                  placeholder="默认300秒"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="最大内存(MB)" field="maxMemory">
                <a-input-number
                  v-model="formData.maxMemory"
                  :min="128"
                  :max="8192"
                  placeholder="默认1024MB"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="参数配置">
            <div class="params-config">
              <div class="params-header">
                <span>参数列表</span>
                <a-button size="small" @click="addParameter">
                  <template #icon>
                    <IconPlus />
                  </template>
                  添加参数
                </a-button>
              </div>
              
              <div class="params-list">
                <div
                  v-for="(param, index) in formData.parameters"
                  :key="index"
                  class="param-item"
                >
                  <a-input
                    v-model="param.name"
                    placeholder="参数名"
                    style="width: 30%"
                  />
                  <a-select
                    v-model="param.type"
                    placeholder="类型"
                    style="width: 20%; margin: 0 8px"
                  >
                    <a-option value="string">字符串</a-option>
                    <a-option value="number">数字</a-option>
                    <a-option value="date">日期</a-option>
                    <a-option value="boolean">布尔值</a-option>
                  </a-select>
                  <a-input
                    v-model="param.defaultValue"
                    placeholder="默认值"
                    style="width: 30%"
                  />
                  <a-button
                    size="small"
                    status="danger"
                    @click="removeParameter(index)"
                    style="margin-left: 8px"
                  >
                    <template #icon>
                      <IconDelete />
                    </template>
                  </a-button>
                </div>
                
                <div v-if="formData.parameters.length === 0" class="empty-params">
                  <IconInfoCircle />
                  <span>暂无参数配置</span>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-card>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { goBack } from '@/router/utils'
import { Message } from '@arco-design/web-vue'
import {
  IconArrowLeft,
  IconSave,
  IconCode,
  IconCheckCircle,
  IconPlus,
  IconDelete,
  IconUp,
  IconDown,
  IconInfoCircle
} from '@arco-design/web-vue/es/icon'
import MonacoEditor from '@/components/MonacoEditor.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'
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

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// Monaco Editor 相关计算属性
const editorLanguage = computed(() => {
  return formData.languageType === 'SQL' ? 'sql' : 'python'
})

const editorOptions = computed(() => {
  return {
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true
  }
})

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  useCase: '',
  language: '',
  manager: '',
  code: '',
  timeout: 300,
  maxMemory: 1024,
  parameters: [],
  inputParams: [],
  outputParams: []
})

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
  goBack(router, '/management/data-models')
}

const handleLanguageChange = (language) => {
  // 切换语言时更新代码模板
  if (language === 'sql') {
    formData.code = formData.code || 'SELECT * FROM table_name WHERE condition;'
  } else if (language === 'python') {
    formData.code = formData.code || 'import pandas as pd\n\n# 数据处理代码\ndf = pd.read_csv("data.csv")\nprint(df.head())'
  }
}

// Monaco Editor 相关方法
const onCodeChange = (value) => {
  formData.code = value
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
    type: 'string',
    required: false,
    defaultValue: '',
    description: ''
  })
}

// 删除入参
const removeInputParameter = (index) => {
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
    description: ''
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

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    const response = await saveDraft(isEdit.value ? route.params.id : null, formData)
    
    if (response.code === 200) {
      Message.success('草稿保存成功')
      if (!isEdit.value) {
        // 新建模式下保存草稿后跳转到编辑页面
        router.replace(`/management/data-models/edit/${response.data.id}`)
      }
    } else {
      Message.error(response.message || '保存失败')
    }
  } catch (error) {
    if (error.length) {
      Message.error('请检查表单填写')
    } else {
      console.error('保存草稿失败:', error)
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
        status: 'published'
      })
    } else {
      response = await createDataModel({
        ...formData,
        status: 'published'
      })
    }
    
    if (response.code === 200) {
      Message.success(isEdit.value ? '模型更新成功' : '模型创建成功')
      router.push('/management/data-models')
    } else {
      Message.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error.length) {
      Message.error('请检查表单填写')
    } else {
      console.error('保存失败:', error)
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
      goBack(router, '/management/data-models')
    }
  } catch (error) {
    console.error('加载模型数据失败:', error)
    Message.error('加载模型数据失败')
    goBack(router, '/management/data-models')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadModelData()
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

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left {
    margin-bottom: 16px;
  }
  
  .param-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .param-item > * {
    margin: 4px 0;
    width: 100% !important;
  }
}
</style>
