<template>
  <div class="table-registration">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">标签表注册</h2>
        <p class="page-description">选择数据源与表，并配置身份标识与IDMapping规则</p>
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
          <a-step title="导入与主键" description="选择数据源并配置主键" />
          <a-step title="IDMapping规则" description="配置身份映射规则" />
          <a-step title="完成注册" description="确认并完成注册" />
        </a-steps>

        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 步骤1: 导入与主键 -->
          <div v-if="currentStep === 0" class="step-panel">
            <div class="import-methods">
              <a-tag color="blue">数据库连接</a-tag>
            </div>

            <!-- 数据库连接 -->
            <div class="import-content">
              <a-alert type="info" content="请先在数据源管理中注册数据库连接，然后在此选择数据源进行标签表注册" style="margin-bottom:8px" />
              <a-form :model="dsForm" layout="vertical">
                <a-form-item label="选择数据源" field="dataSourceId" required>
                  <a-select v-model="dsForm.dataSourceId" placeholder="请选择已注册的数据源" allow-search>
                    <a-option v-for="ds in dataSources" :key="ds.id" :value="ds.id">{{ ds.name }}（{{ ds.type }}）- {{ ds.database }}/{{ ds.table }}</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="选择数据表" field="tableName" required>
                  <a-select v-model="dsForm.tableName" :disabled="!dsForm.dataSourceId" placeholder="请选择数据表">
                    <a-option v-for="t in tableOptions" :key="t" :value="t">{{ t }}</a-option>
                  </a-select>
                </a-form-item>
                <a-divider />
                <a-card title="基础信息">
                  <a-row :gutter="16">
                    <a-col :span="12"><a-form-item label="表名称" field="basic.tableAlias" required><a-input v-model="basicForm.tableAlias" placeholder="显示名称（可与实际表名不同）" /></a-form-item></a-col>
                    <a-col :span="12"><a-form-item label="表分类标签" field="basic.categories"><a-select v-model="basicForm.categories" multiple allow-search :options="categoryOptions" placeholder="选择或输入分类标签" /></a-form-item></a-col>
                  </a-row>
                  <a-form-item label="表描述" field="basic.description"><a-textarea v-model="basicForm.description" :rows="3" placeholder="用于说明该标签表的用途、来源与维护人" /></a-form-item>
                </a-card>
              </a-form>
              
            </div>
            <!-- API 接入已移除，仅支持数据库连接 -->

            <!-- 主键配置（合并到第1步） -->
            <div class="primary-key-config" v-if="availableFields.length > 0">
              <div class="config-header">
                <h3>选择身份标识字段</h3>
                <p class="config-desc">请选择用于身份识别的字段，支持选择多个字段组合作为主键</p>
              </div>

              <div class="field-selection">
                <a-card title="身份标识字段" size="small">
                  <a-form-item label="选择身份标识字段">
                    <a-select v-model="selectedIdentityField" allow-search placeholder="请选择身份标识字段">
                      <a-option v-for="field in availableFields" :key="field.name" :value="field.name">
                        {{ field.name }}（{{ field.type }}）
                      </a-option>
                    </a-select>
                  </a-form-item>
                  <div class="candidate-keys" v-if="candidateKeys.length">
                    <h4>推荐字段</h4>
                    <a-space wrap>
                      <a-tag v-for="k in candidateKeys" :key="k" @click="toggleKey(k)" :color="selectedIdentityField===k?'blue':'gray'">{{ k }}</a-tag>
                    </a-space>
                  </div>
                </a-card>
              </div>

              <div v-if="selectedIdentityField" class="key-preview">
                <a-card title="主键配置预览" size="small">
                  <div class="preview-content">
                    <div class="selected-fields">
                      <h4>已选择的字段：</h4>
                      <div class="field-tags">
                        <a-tag>{{ selectedIdentityField }}</a-tag>
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
                      <div class="uniqueness-bar" v-if="uniquenessScore>=0">
                        唯一性评分：<a-progress :percent="uniquenessScore" />
                      </div>
                    </div>
                    <div class="identity-type">
                      <h4>身份类型：</h4>
                      <a-radio-group v-model="identityType">
                        <a-radio value="mobile">手机号</a-radio>
                        <a-radio value="device_id">设备号</a-radio>
                        <a-radio value="id_card">身份证号</a-radio>
                        <a-radio value="card_no">卡号</a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                </a-card>
              </div>
            </div>
          </div>

          <!-- 步骤2: IDMapping规则（基础模式） -->
          <div v-if="currentStep === 1" class="step-panel">
            <div class="mapping-rules-config">
              <div class="config-header">
                <h3>配置IDMapping规则</h3>
                <p class="config-desc">规则固定为精确匹配，源/目标均为所选身份字段</p>
              </div>
              <a-card size="small">
                <a-descriptions :column="2" bordered>
                  <a-descriptions-item label="源字段">{{ selectedIdentityField || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="目标字段">{{ selectedIdentityField || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="匹配算法">精确匹配</a-descriptions-item>
                  <a-descriptions-item label="启用">
                    <a-switch v-model="enableMapping" />
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </div>
          </div>

          <!-- 步骤3: 完成注册 -->
          <div v-if="currentStep === 2" class="step-panel">
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
                      {{ selectedIdentityField || '-' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="身份类型">
                      {{ getIdentityTypeText() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="主键格式">
                      {{ primaryKeyFormat || selectedIdentityField || '默认格式' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="唯一性检查">
                      已启用
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>

            <a-card title="IDMapping配置" size="small" style="margin-top: 16px;">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="算法">精确匹配</a-descriptions-item>
                <a-descriptions-item label="启用规则数">{{ enabledRulesCount }} 条</a-descriptions-item>
                <a-descriptions-item label="源字段">{{ selectedIdentityField || '-' }}</a-descriptions-item>
                <a-descriptions-item label="目标字段">{{ selectedIdentityField || '-' }}</a-descriptions-item>
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
              v-if="currentStep < 2"
              type="primary"
              :disabled="!canProceed"
              @click="nextStep"
            >
              下一步
            </a-button>
            <a-button
              v-if="currentStep === 2"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconPlus,
  IconDelete,
  IconArrowLeft,
  IconCheck
} from '@arco-design/web-vue/es/icon'
import { useTableRegistration } from '@/composables/useTableRegistration'
import { useDataSourceStore } from '@/stores/datasource'
import { usePrimaryKeyAnalysis } from '@/composables/usePrimaryKeyAnalysis'

const router = useRouter()

// 步骤控制
const currentStep = ref(0)

// 导入方式
const importMethod = ref<'database'>('database')
const dsStore = useDataSourceStore()
const dataSources = dsStore.list
const dsForm = reactive<{ dataSourceId: string; tableName: string }>({ dataSourceId: '', tableName: '' })
const tableOptions = computed(() => dsForm.dataSourceId ? dsStore.getTables(dsForm.dataSourceId) : [])
const basicForm = reactive<{ tableAlias: string; categories: string[]; description: string }>({ tableAlias: '', categories: [], description: '' })
const categoryOptions = computed(() => ['行为', '画像', '交易', '风险', '会员', '营销'])

// API配置
// API 接入已移除

// 自动加载字段：当数据源与数据表同时选定时

// 字段选择
const availableFields = ref<any[]>([])
const selectedIdentityField = ref<string>('')
const candidateKeys = computed(() => suggestCandidateKeys(availableFields.value))
const uniquenessScore = ref<number>(-1)
const primaryKeyFormat = ref('')
const identityType = ref<'mobile' | 'device_id' | 'id_card' | 'card_no'>('mobile')

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
    case 0: // 导入与主键
      return !!dsForm.dataSourceId && availableFields.value.length > 0 && !!selectedIdentityField.value
    case 1: // IDMapping规则
      return true
    case 2: // 完成注册
      return true
    default:
      return false
  }
})

const enableMapping = ref(true)
const enabledRulesCount = computed(() => enableMapping.value ? 1 : 0)

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

const { tableSchema, checkPrimaryKey, registerTable, loadTableSchema } = useTableRegistration()
const goManage = () => { router.push({ name: 'datasource-management' }) }
watch([() => dsForm.dataSourceId, () => dsForm.tableName], async ([dsId, tbl]) => {
  if (dsId && tbl) {
    const ds = dataSources.find((x: any) => x.id === dsId)
    try {
      await loadTableSchema(ds.id, tbl)
      availableFields.value = (tableSchema.value as any) || []
      Message.success('已加载字段')
    } catch {
      availableFields.value = []
      Message.error('字段加载失败，请检查数据源配置')
    }
  } else {
    availableFields.value = []
  }
})
const nextStep = async () => {
  if (currentStep.value < 2) {
    if (currentStep.value === 0) {
      const res = await checkPrimaryKey(selectedIdentityField.value ? [selectedIdentityField.value] : [])
      if (res) {
        Message.info(`唯一性评分 ${res.score}%`)
        uniquenessScore.value = Number(res.score || 0)
      }
      loadMappingRules()
    }
    currentStep.value++
  }
}

// 文件上传相关逻辑已移除

// 移除初始模拟加载，改为根据数据源与表自动加载字段

const suggestCandidateKeys = (fields: Array<any>): string[] => {
  const names = fields.map(f => String(f.name).toLowerCase())
  const picks = [] as string[]
  const priority = ['id_card','mobile','device_id','card_no']
  priority.forEach(p => { const hit = fields.find(f => String(f.name).toLowerCase() === p); if (hit) picks.push(hit.name) })
  // 追加包含关键字的字段
  names.forEach((n,i)=>{
    if ((/mobile|phone/.test(n) || /id_card|idcard/.test(n) || /device_id|imei|idfa/.test(n) || /card_no|bank_card|card/.test(n)) && !picks.includes(fields[i].name)) {
      picks.push(fields[i].name)
    }
  })
  return picks.slice(0,5)
}

const toggleKey = (k: string) => { selectedIdentityField.value = k }

const loadMappingRules = () => {}

// 已不支持多选主键，移除字段删除逻辑

const generateKeyPreview = () => {
  if (!selectedIdentityField.value) return ''
  let format = primaryKeyFormat.value
  if (!format) {
    format = selectedIdentityField.value
  }
  const sampleValues: Record<string, string> = {
    'user_id': 'user123',
    'mobile': '13800138000',
    'email': 'user@example.com',
    'id_card': '123456789012345678',
    'device_id': 'device123',
    'card_no': '6222************',
    'age': '25',
    'gender': 'male',
    'city': '北京'
  }
  return format.replace(new RegExp(`{${selectedIdentityField.value}}`, 'g'), sampleValues[selectedIdentityField.value] || selectedIdentityField.value)
}

const addMappingRule = () => {}
const removeMappingRule = (_index: number) => {}

const getFieldTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    string: 'green',
    number: 'blue',
    date: 'orange',
    boolean: 'purple'
  }
  return colors[type] || 'gray'
}

const getImportMethodText = () => '数据库连接'

const getDataSourceSummary = () => {
  const ds = dataSources.find((x: any) => x.id === dsForm.dataSourceId)
  return ds && dsForm.tableName ? `${ds.type}://${ds.host}/${ds.database}/${dsForm.tableName}` : ''
}

const getIdentityTypeText = () => {
  const texts = {
    mobile: '手机号',
    device_id: '设备号',
    id_card: '身份证号',
    card_no: '卡号'
  }
  return texts[identityType.value]
}

const getConflictResolutionText = () => '优先保留'

const submitRegistration = async () => {
  submitting.value = true
  
  try {
    const payload = {
      importMethod: 'database',
      dataSource: getDataSourceSummary(),
      fields: availableFields.value,
      primaryKeys: selectedIdentityField.value ? [selectedIdentityField.value] : [],
      identityType: identityType.value,
      primaryKeyFormat: primaryKeyFormat.value,
      mappingRules: enableMapping.value && selectedIdentityField.value ? [{ sourceField: selectedIdentityField.value, targetField: selectedIdentityField.value, algorithm: 'exact', enabled: true }] : [],
      conflictResolution: 'first',
      matchTimeout: 30,
      quality: { enableQualityCheck: false, minMatchRate: 0, maxErrorRate: 100 },
      basic: { tableAlias: basicForm.tableAlias, categories: basicForm.categories, description: basicForm.description }
    }
    const res = await registerTable(payload)
    if (res.status === 'SUCCESS') {
      registrationResult.value = { status: 'success', title: '注册成功', subTitle: '标签表已成功注册，IDMapping规则已生效' }
      Message.success('标签表注册成功')
    } else {
      registrationResult.value = { status: 'error', title: '注册失败', subTitle: '注册过程中出现错误，请检查配置后重试' }
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
  // 文件上传状态重置已移除
  selectedIdentityField.value = ''
  mappingRules.value = []
  registrationResult.value = null
  
  // 重置表单
  Object.assign(dsForm, { dataSourceId: '', tableName: '' })
  Object.assign(basicForm, { tableAlias: '', categories: [], description: '' })
  
  // API 配置重置已移除
}

// 初始化无需预加载字段

// 下拉已支持搜索，移除额外的字段过滤逻辑
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
