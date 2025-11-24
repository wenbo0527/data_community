<template>
  <div class="table-registration">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">标签表注册</h2>
        <p class="page-description">导入标签表并配置主键和IDMapping规则</p>
      </div>
      <div class="header-actions">
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-arrow-left /></template>
            返回
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 注册向导 -->
    <div class="registration-wizard">
      <a-card>
        <a-steps v-model:current="currentStep" type="dot" class="wizard-steps">
          <a-step title="导入标签表" description="上传或连接标签表数据" />
          <a-step title="配置主键" description="选择身份标识字段" />
          <a-step title="IDMapping规则" description="配置身份映射规则" />
          <a-step title="完成注册" description="确认并完成注册" />
        </a-steps>

        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 步骤1: 导入标签表 -->
          <div v-if="currentStep === 0" class="step-panel">
            <div class="import-methods">
              <a-radio-group v-model="importMethod" type="button" class="import-method-group">
                <a-radio value="file">文件上传</a-radio>
                <a-radio value="database">数据库连接</a-radio>
                <a-radio value="api">API接口</a-radio>
              </a-radio-group>
            </div>

            <!-- 文件上传 -->
            <div v-if="importMethod === 'file'" class="import-content">
              <a-upload
                drag
                :file-list="fileList"
                :auto-upload="false"
                accept=".csv,.xlsx,.xls,.json"
                @change="handleFileChange"
                class="file-upload-area"
              >
                <template #upload-button>
                  <div class="upload-area">
                    <icon-plus style="font-size: 48px; color: #165dff;" />
                    <div style="margin-top: 16px; font-size: 16px; color: #1d2129;">
                      点击或拖拽文件到此处上传
                    </div>
                    <div style="margin-top: 8px; color: #86909c; font-size: 14px;">
                      支持 CSV、Excel、JSON 格式，最大支持 100MB
                    </div>
                  </div>
                </template>
              </a-upload>

              <!-- 文件预览 -->
              <div v-if="fileList.length > 0" class="file-preview">
                <a-card title="文件预览" size="small">
                  <div class="preview-content">
                    <a-table
                      :data="previewData"
                      :columns="previewColumns"
                      :pagination="false"
                      size="small"
                      style="max-height: 300px; overflow: auto;"
                    />
                  </div>
                </a-card>
              </div>
            </div>

            <!-- 数据库连接 -->
            <div v-else-if="importMethod === 'database'" class="import-content">
              <a-form :model="dbConfig" layout="vertical" class="db-form">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="数据源类型" required>
                      <a-select v-model="dbConfig.type" placeholder="请选择数据源类型">
                        <a-option value="mysql">MySQL</a-option>
                        <a-option value="postgresql">PostgreSQL</a-option>
                        <a-option value="oracle">Oracle</a-option>
                        <a-option value="sqlserver">SQL Server</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="连接地址" required>
                      <a-input v-model="dbConfig.host" placeholder="例如: localhost:3306" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="数据库名" required>
                      <a-input v-model="dbConfig.database" placeholder="请输入数据库名称" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="数据表名" required>
                      <a-input v-model="dbConfig.table" placeholder="请输入数据表名称" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="用户名">
                      <a-input v-model="dbConfig.username" placeholder="请输入用户名" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="密码">
                      <a-input-password v-model="dbConfig.password" placeholder="请输入密码" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="查询条件">
                  <a-textarea
                    v-model="dbConfig.query"
                    placeholder="请输入SQL查询条件（可选）"
                    :rows="3"
                  />
                </a-form-item>
              </a-form>

              <!-- 连接测试 -->
              <div class="connection-test">
                <a-button
                  type="primary"
                  :loading="testingConnection"
                  @click="testConnection"
                >
                  测试连接
                </a-button>
                <span v-if="connectionStatus" class="connection-status" :class="connectionStatus">
                  {{ connectionStatus === 'success' ? '连接成功' : '连接失败' }}
                </span>
              </div>
            </div>

            <!-- API接口 -->
            <div v-else-if="importMethod === 'api'" class="import-content">
              <a-form :model="apiConfig" layout="vertical" class="api-form">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="请求方法" required>
                      <a-select v-model="apiConfig.method">
                        <a-option value="GET">GET</a-option>
                        <a-option value="POST">POST</a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="16">
                    <a-form-item label="API地址" required>
                      <a-input v-model="apiConfig.url" placeholder="请输入API地址" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="请求头">
                  <a-textarea
                    v-model="apiConfig.headers"
                    placeholder='请输入请求头，JSON格式，例如：{"Authorization": "Bearer token"}'
                    :rows="3"
                  />
                </a-form-item>
                <a-form-item v-if="apiConfig.method === 'POST'" label="请求参数">
                  <a-textarea
                    v-model="apiConfig.body"
                    placeholder="请输入请求参数，JSON格式"
                    :rows="3"
                  />
                </a-form-item>
                <a-form-item label="分页配置">
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-input v-model="apiConfig.pageParam" placeholder="页码参数名" />
                    </a-col>
                    <a-col :span="12">
                      <a-input v-model="apiConfig.sizeParam" placeholder="每页数量参数名" />
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-form>
            </div>
          </div>

          <!-- 步骤2: 配置主键 -->
          <div v-if="currentStep === 1" class="step-panel">
            <div class="primary-key-config">
              <div class="config-header">
                <h3>选择身份标识字段</h3>
                <p class="config-desc">请选择用于身份识别的字段，支持选择多个字段组合作为主键</p>
              </div>

              <!-- 字段列表 -->
              <div class="field-selection">
                <a-card title="可用字段" size="small">
                  <div class="field-list">
                    <a-checkbox-group v-model="selectedFields" class="field-checkbox-group">
                      <div v-for="field in availableFields" :key="field.name" class="field-item">
                        <a-checkbox :value="field.name">
                          <div class="field-info">
                            <span class="field-name">{{ field.name }}</span>
                            <a-tag size="small" :color="getFieldTypeColor(field.type)">
                              {{ field.type }}
                            </a-tag>
                            <span class="field-desc">{{ field.description }}</span>
                          </div>
                        </a-checkbox>
                      </div>
                    </a-checkbox-group>
                  </div>
                </a-card>
              </div>

              <!-- 主键预览 -->
              <div v-if="selectedFields.length > 0" class="key-preview">
                <a-card title="主键配置预览" size="small">
                  <div class="preview-content">
                    <div class="selected-fields">
                      <h4>已选择的字段：</h4>
                      <div class="field-tags">
                        <a-tag
                          v-for="field in selectedFields"
                          :key="field"
                          closable
                          @close="removeField(field)"
                        >
                          {{ field }}
                        </a-tag>
                      </div>
                    </div>
                    <div class="key-format">
                      <h4>主键格式：</h4>
                      <a-input
                        v-model="primaryKeyFormat"
                        placeholder="例如: {field1}_{field2}"
                        class="format-input"
                      />
                      <div class="format-preview">
                        预览: {{ generateKeyPreview() }}
                      </div>
                    </div>
                    <div class="identity-type">
                      <h4>身份类型：</h4>
                      <a-radio-group v-model="identityType">
                        <a-radio value="person">个人</a-radio>
                        <a-radio value="device">设备</a-radio>
                        <a-radio value="enterprise">企业</a-radio>
                        <a-radio value="family">家庭</a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                </a-card>
              </div>
            </div>
          </div>

          <!-- 步骤3: IDMapping规则 -->
          <div v-if="currentStep === 2" class="step-panel">
            <div class="mapping-rules-config">
              <div class="config-header">
                <h3>配置IDMapping规则</h3>
                <p class="config-desc">设置身份映射规则，支持多字段匹配和相似度算法</p>
              </div>

              <!-- 映射规则列表 -->
              <div class="mapping-rules">
                <div class="rules-header">
                  <h4>映射规则</h4>
                  <a-button type="primary" @click="addMappingRule">
                    <template #icon><icon-plus /></template>
                    添加规则
                  </a-button>
                </div>

                <div class="rules-list">
                  <div
                    v-for="(rule, index) in mappingRules"
                    :key="index"
                    class="rule-item"
                  >
                    <a-card size="small">
                      <template #title>
                        <div class="rule-header">
                          <span class="rule-title">规则 {{ index + 1 }}</span>
                          <a-space>
                            <a-switch
                              v-model="rule.enabled"
                              size="small"
                            />
                            <a-button
                              type="text"
                              size="small"
                              status="danger"
                              @click="removeMappingRule(index)"
                            >
                              <template #icon><icon-delete /></template>
                            </a-button>
                          </a-space>
                        </div>
                      </template>
                      
                      <div class="rule-content">
                        <a-row :gutter="16">
                          <a-col :span="12">
                            <a-form-item label="源字段">
                              <a-select
                                v-model="rule.sourceField"
                                placeholder="选择源字段"
                              >
                                <a-option
                                  v-for="field in availableFields"
                                  :key="field.name"
                                  :value="field.name"
                                >
                                  {{ field.name }}
                                </a-option>
                              </a-select>
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="目标字段">
                              <a-select
                                v-model="rule.targetField"
                                placeholder="选择目标字段"
                              >
                                <a-option
                                  v-for="field in availableFields"
                                  :key="field.name"
                                  :value="field.name"
                                >
                                  {{ field.name }}
                                </a-option>
                              </a-select>
                            </a-form-item>
                          </a-col>
                        </a-row>
                        
                        <a-form-item label="匹配算法">
                          <a-radio-group v-model="rule.algorithm">
                            <a-radio value="exact">精确匹配</a-radio>
                            <a-radio value="fuzzy">模糊匹配</a-radio>
                            <a-radio value="similarity">相似度匹配</a-radio>
                          </a-radio-group>
                        </a-form-item>
                        
                        <div v-if="rule.algorithm === 'similarity'" class="similarity-config">
                          <a-row :gutter="16">
                            <a-col :span="12">
                              <a-form-item label="相似度阈值">
                                <a-slider
                                  v-model="rule.similarityThreshold"
                                  :min="0"
                                  :max="100"
                                  :step="1"
                                  show-input
                                />
                              </a-form-item>
                            </a-col>
                            <a-col :span="12">
                              <a-form-item label="算法类型">
                                <a-select v-model="rule.similarityType">
                                  <a-option value="cosine">余弦相似度</a-option>
                                  <a-option value="jaccard">Jaccard相似度</a-option>
                                  <a-option value="levenshtein">编辑距离</a-option>
                                </a-select>
                              </a-form-item>
                            </a-col>
                          </a-row>
                        </div>
                        
                        <a-form-item label="权重">
                          <a-slider
                            v-model="rule.weight"
                            :min="0"
                            :max="100"
                            :step="1"
                            show-input
                          />
                        </a-form-item>
                      </div>
                    </a-card>
                  </div>
                </div>

                <div v-if="mappingRules.length === 0" class="empty-rules">
                  <icon-plus style="font-size: 48px; color: #c9cdd4;" />
                  <p>暂无映射规则，请添加第一条规则</p>
                </div>
              </div>

              <!-- 高级配置 -->
              <div class="advanced-config">
                <a-card title="高级配置" size="small">
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item label="冲突解决策略">
                        <a-select v-model="conflictResolution">
                          <a-option value="first">优先保留</a-option>
                          <a-option value="last">后覆盖前</a-option>
                          <a-option value="weight">权重优先</a-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item label="匹配超时时间（秒）">
                        <a-input-number
                          v-model="matchTimeout"
                          :min="1"
                          :max="3600"
                          placeholder="30"
                        />
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-form-item label="数据质量检查">
                    <a-checkbox v-model="enableQualityCheck">
                      启用数据质量检查
                    </a-checkbox>
                  </a-form-item>
                  <div v-if="enableQualityCheck" class="quality-config">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="最小匹配率（%）">
                          <a-input-number
                            v-model="minMatchRate"
                            :min="0"
                            :max="100"
                            placeholder="95"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="最大错误率（%）">
                          <a-input-number
                            v-model="maxErrorRate"
                            :min="0"
                            :max="100"
                            placeholder="5"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </a-card>
              </div>
            </div>
          </div>

          <!-- 步骤4: 完成注册 -->
          <div v-if="currentStep === 3" class="step-panel">
            <div class="registration-summary">
              <div class="summary-header">
                <h3>注册信息确认</h3>
                <p class="summary-desc">请确认以下配置信息，确认无误后提交注册</p>
              </div>

              <!-- 配置摘要 -->
              <div class="config-summary">
                <a-card title="数据源信息" size="small">
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="导入方式">
                      {{ getImportMethodText() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="数据源">
                      {{ getDataSourceSummary() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="字段数量">
                      {{ availableFields.length }} 个
                    </a-descriptions-item>
                    <a-descriptions-item label="预估数据量">
                      {{ estimatedRecords }} 条
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>

                <a-card title="主键配置" size="small" style="margin-top: 16px;">
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="主键字段">
                      {{ selectedFields.join(', ') }}
                    </a-descriptions-item>
                    <a-descriptions-item label="身份类型">
                      {{ getIdentityTypeText() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主键格式">
                      {{ primaryKeyFormat || '默认格式' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="唯一性检查">
                      已启用
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>

                <a-card title="IDMapping配置" size="small" style="margin-top: 16px;">
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="映射规则数">
                      {{ mappingRules.length }} 条
                    </a-descriptions-item>
                    <a-descriptions-item label="启用规则数">
                      {{ enabledRulesCount }} 条
                    </a-descriptions-item>
                    <a-descriptions-item label="冲突解决策略">
                      {{ getConflictResolutionText() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="数据质量检查">
                      {{ enableQualityCheck ? '已启用' : '未启用' }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </div>

              <!-- 注册结果 -->
              <div v-if="registrationResult" class="registration-result">
                <a-result
                  :status="registrationResult.status"
                  :title="registrationResult.title"
                  :sub-title="registrationResult.subTitle"
                >
                  <template #extra v-if="registrationResult.status === 'success'">
                    <a-space>
                      <a-button type="primary" @click="viewRegisteredTable">
                        查看注册的表
                      </a-button>
                      <a-button @click="registerAnother">
                        注册新表
                      </a-button>
                    </a-space>
                  </template>
                </a-result>
              </div>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="step-navigation" v-if="!registrationResult">
          <a-space>
            <a-button
              v-if="currentStep > 0"
              @click="previousStep"
            >
              上一步
            </a-button>
            <a-button
              v-if="currentStep < 3"
              type="primary"
              :disabled="!canProceed"
              @click="nextStep"
            >
              下一步
            </a-button>
            <a-button
              v-if="currentStep === 3"
              type="primary"
              :loading="submitting"
              @click="submitRegistration"
            >
              提交注册
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconDelete,
  IconArrowLeft,
  IconCheck
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 步骤控制
const currentStep = ref(0)

// 导入方式
const importMethod = ref<'file' | 'database' | 'api'>('file')

// 文件上传
const fileList = ref<any[]>([])
const previewData = ref<any[]>([])
const previewColumns = ref<any[]>([])

// 数据库配置
const dbConfig = reactive({
  type: 'mysql',
  host: '',
  database: '',
  table: '',
  username: '',
  password: '',
  query: ''
})

// API配置
const apiConfig = reactive({
  method: 'GET',
  url: '',
  headers: '',
  body: '',
  pageParam: 'page',
  sizeParam: 'size'
})

// 连接测试
const testingConnection = ref(false)
const connectionStatus = ref<'success' | 'error' | ''>('')

// 字段选择
const availableFields = ref<any[]>([])
const selectedFields = ref<string[]>([])
const primaryKeyFormat = ref('')
const identityType = ref<'person' | 'device' | 'enterprise' | 'family'>('person')

// IDMapping规则
const mappingRules = ref<any[]>([])
const conflictResolution = ref<'first' | 'last' | 'weight'>('first')
const matchTimeout = ref(30)
const enableQualityCheck = ref(true)
const minMatchRate = ref(95)
const maxErrorRate = ref(5)

// 注册结果
const registrationResult = ref<any>(null)
const submitting = ref(false)

// 计算属性
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: // 导入步骤
      if (importMethod.value === 'file') {
        return fileList.value.length > 0
      } else if (importMethod.value === 'database') {
        return dbConfig.host && dbConfig.database && dbConfig.table
      } else if (importMethod.value === 'api') {
        return apiConfig.url
      }
      return false
    case 1: // 主键配置
      return selectedFields.value.length > 0
    case 2: // IDMapping规则
      return true // 可以为空
    case 3: // 确认步骤
      return true
    default:
      return false
  }
})

const enabledRulesCount = computed(() => {
  return mappingRules.value.filter(rule => rule.enabled).length
})

const estimatedRecords = computed(() => {
  // 模拟估算
  return Math.floor(Math.random() * 100000) + 1000
})

// 方法
const goBack = () => {
  router.push({ name: 'tag-management' })
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    // 加载下一步的数据
    if (currentStep.value === 0) {
      loadAvailableFields()
    } else if (currentStep.value === 1) {
      loadMappingRules()
    }
    currentStep.value++
  }
}

const handleFileChange = (fileList: any[]) => {
  fileList.value = fileList
  if (fileList.length > 0) {
    // 模拟文件解析
    setTimeout(() => {
      previewColumns.value = [
        { title: '用户ID', dataIndex: 'userId' },
        { title: '标签名称', dataIndex: 'tagName' },
        { title: '标签值', dataIndex: 'tagValue' },
        { title: '创建时间', dataIndex: 'createTime' }
      ]
      previewData.value = [
        { userId: 'user_001', tagName: 'age', tagValue: '25', createTime: '2024-01-01' },
        { userId: 'user_002', tagName: 'gender', tagValue: 'male', createTime: '2024-01-01' },
        { userId: 'user_003', tagName: 'city', tagValue: '北京', createTime: '2024-01-01' }
      ]
      Message.success('文件解析成功')
    }, 1000)
  }
}

const testConnection = () => {
  testingConnection.value = true
  connectionStatus.value = ''
  
  setTimeout(() => {
    testingConnection.value = false
    connectionStatus.value = Math.random() > 0.3 ? 'success' : 'error'
    Message.info(connectionStatus.value === 'success' ? '连接成功' : '连接失败')
  }, 2000)
}

const loadAvailableFields = () => {
  // 模拟加载字段
  availableFields.value = [
    { name: 'user_id', type: 'string', description: '用户唯一标识' },
    { name: 'mobile', type: 'string', description: '手机号码' },
    { name: 'email', type: 'string', description: '邮箱地址' },
    { name: 'id_card', type: 'string', description: '身份证号' },
    { name: 'device_id', type: 'string', description: '设备ID' },
    { name: 'age', type: 'number', description: '年龄' },
    { name: 'gender', type: 'string', description: '性别' },
    { name: 'city', type: 'string', description: '城市' }
  ]
}

const loadMappingRules = () => {
  // 如果还没有规则，创建默认规则
  if (mappingRules.value.length === 0) {
    mappingRules.value = [
      {
        enabled: true,
        sourceField: 'user_id',
        targetField: 'user_id',
        algorithm: 'exact',
        weight: 100,
        similarityThreshold: 80,
        similarityType: 'cosine'
      }
    ]
  }
}

const removeField = (field: string) => {
  const index = selectedFields.value.indexOf(field)
  if (index > -1) {
    selectedFields.value.splice(index, 1)
  }
}

const generateKeyPreview = () => {
  if (selectedFields.value.length === 0) return ''
  
  let format = primaryKeyFormat.value
  if (!format) {
    format = selectedFields.value.join('_')
  }
  
  // 简单的预览生成
  const sampleValues: Record<string, string> = {
    'user_id': 'user123',
    'mobile': '13800138000',
    'email': 'user@example.com',
    'id_card': '123456789012345678',
    'device_id': 'device123',
    'age': '25',
    'gender': 'male',
    'city': '北京'
  }
  
  let preview = format
  selectedFields.value.forEach(field => {
    const regex = new RegExp(`{${field}}`, 'g')
    preview = preview.replace(regex, sampleValues[field] || field)
  })
  
  return preview
}

const addMappingRule = () => {
  const newRule = {
    enabled: true,
    sourceField: '',
    targetField: '',
    algorithm: 'exact',
    weight: 50,
    similarityThreshold: 80,
    similarityType: 'cosine'
  }
  mappingRules.value.push(newRule)
}

const removeMappingRule = (index: number) => {
  mappingRules.value.splice(index, 1)
}

const getFieldTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    string: 'green',
    number: 'blue',
    date: 'orange',
    boolean: 'purple'
  }
  return colors[type] || 'gray'
}

const getImportMethodText = () => {
  const texts = {
    file: '文件上传',
    database: '数据库连接',
    api: 'API接口'
  }
  return texts[importMethod.value]
}

const getDataSourceSummary = () => {
  if (importMethod.value === 'file') {
    return fileList.value.map(f => f.name).join(', ')
  } else if (importMethod.value === 'database') {
    return `${dbConfig.type}://${dbConfig.host}/${dbConfig.database}/${dbConfig.table}`
  } else if (importMethod.value === 'api') {
    return `${apiConfig.method} ${apiConfig.url}`
  }
  return ''
}

const getIdentityTypeText = () => {
  const texts = {
    person: '个人',
    device: '设备',
    enterprise: '企业',
    family: '家庭'
  }
  return texts[identityType.value]
}

const getConflictResolutionText = () => {
  const texts = {
    first: '优先保留',
    last: '后覆盖前',
    weight: '权重优先'
  }
  return texts[conflictResolution.value]
}

const submitRegistration = async () => {
  submitting.value = true
  
  try {
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟结果
    const success = Math.random() > 0.2
    
    if (success) {
      registrationResult.value = {
        status: 'success',
        title: '注册成功',
        subTitle: '标签表已成功注册，IDMapping规则已生效'
      }
      Message.success('标签表注册成功')
    } else {
      registrationResult.value = {
        status: 'error',
        title: '注册失败',
        subTitle: '注册过程中出现错误，请检查配置后重试'
      }
      Message.error('标签表注册失败')
    }
  } catch (error) {
    registrationResult.value = {
      status: 'error',
      title: '注册失败',
      subTitle: '网络错误或服务器异常'
    }
    Message.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const viewRegisteredTable = () => {
  router.push({ name: 'tag-management' })
}

const registerAnother = () => {
  // 重置所有数据
  currentStep.value = 0
  fileList.value = []
  previewData.value = []
  previewColumns.value = []
  selectedFields.value = []
  mappingRules.value = []
  registrationResult.value = null
  
  // 重置表单
  Object.assign(dbConfig, {
    type: 'mysql',
    host: '',
    database: '',
    table: '',
    username: '',
    password: '',
    query: ''
  })
  
  Object.assign(apiConfig, {
    method: 'GET',
    url: '',
    headers: '',
    body: '',
    pageParam: 'page',
    sizeParam: 'size'
  })
}

onMounted(() => {
  // 初始化数据
  loadAvailableFields()
})
</script>

<style scoped lang="less">
.table-registration {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.registration-wizard {
  max-width: 1200px;
  margin: 0 auto;
}

.wizard-steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 500px;
  padding: 24px 0;
}

.step-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.import-methods {
  margin-bottom: 24px;
  text-align: center;
}

.import-method-group {
  display: inline-flex;
}

.import-content {
  max-width: 800px;
  margin: 0 auto;
}

.file-upload-area {
  width: 100%;
}

.upload-area {
  width: 100%;
  padding: 40px;
  text-align: center;
  border: 2px dashed #e5e6eb;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f0f7ff;
}

.file-preview {
  margin-top: 24px;
}

.preview-content {
  max-height: 300px;
  overflow: auto;
}

.db-form,
.api-form {
  max-width: 600px;
  margin: 0 auto;
}

.connection-test {
  margin-top: 24px;
  text-align: center;
}

.connection-status {
  margin-left: 16px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.connection-status.success {
  background: #e8f7f0;
  color: #00b96b;
}

.connection-status.error {
  background: #ffece8;
  color: #f53f3f;
}

.primary-key-config {
  max-width: 800px;
  margin: 0 auto;
}

.config-header {
  text-align: center;
  margin-bottom: 32px;
}

.config-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1d2129;
}

.config-desc {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.field-selection {
  margin-bottom: 24px;
}

.field-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item {
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  transition: all 0.2s;
}

.field-item:hover {
  border-color: #165dff;
  background: #f0f7ff;
}

.field-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-name {
  font-weight: 500;
  color: #1d2129;
}

.field-desc {
  color: #86909c;
  font-size: 12px;
}

.key-preview {
  margin-top: 24px;
}

.preview-content {
  padding: 16px;
}

.selected-fields,
.key-format,
.identity-type {
  margin-bottom: 20px;
}

.selected-fields h4,
.key-format h4,
.identity-type h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1d2129;
}

.field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-input {
  margin-bottom: 8px;
}

.format-preview {
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  color: #165dff;
}

.mapping-rules-config {
  max-width: 800px;
  margin: 0 auto;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rules-header h4 {
  margin: 0;
  font-size: 16px;
  color: #1d2129;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-item {
  transition: all 0.2s;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-title {
  font-weight: 500;
  color: #1d2129;
}

.rule-content {
  padding: 16px 0;
}

.similarity-config {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 4px;
}

.empty-rules {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #86909c;
}

.empty-rules p {
  margin: 16px 0 0 0;
  font-size: 14px;
}

.advanced-config {
  margin-top: 24px;
}

.quality-config {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 4px;
}

.registration-summary {
  max-width: 800px;
  margin: 0 auto;
}

.summary-header {
  text-align: center;
  margin-bottom: 32px;
}

.summary-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1d2129;
}

.summary-desc {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.config-summary {
  margin-bottom: 24px;
}

.step-navigation {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}

.registration-result {
  margin-top: 32px;
}

// 响应式设计
@media (max-width: 768px) {
  .table-registration {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .import-method-group {
    flex-direction: column;
    width: 100%;
  }
  
  .field-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .rules-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>