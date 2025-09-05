<template>
  <div class="metric-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-button type="text" @click="goBack">
        <template #icon><icon-left /></template>
        返回
      </a-button>
      <h2>{{ isEditMode ? '编辑指标' : (isViewMode ? '指标详情' : '新建指标') }}</h2>
      <div v-if="!isViewMode">
        <a-button type="outline" @click="handleSaveDraft" style="margin-right: 12px">
          保存草稿
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          {{ isEditMode ? '更新指标' : '创建指标' }}
        </a-button>
        <a-button v-if="formData.versionStatus === 'draft'" type="primary" @click="handleGoOnline" style="margin-left: 12px">
          上线
        </a-button>
      </div>
      <div v-else>
        <a-button type="outline" @click="handleEdit" style="margin-right: 12px">
          编辑
        </a-button>
        <a-button type="primary" @click="goBack">
          返回列表
        </a-button>
      </div>
    </div>



    <!-- 指标表单 -->
    <div class="form-container" :class="{ 'scrollable': enableScroll }">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        :disabled="isViewMode"
      >
        <!-- 基本信息 -->
        <a-card title="基本信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="指标名称" field="name">
                <a-input v-model="formData.name" placeholder="请输入指标名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="指标编码" field="code">
                <a-input v-model="formData.code" placeholder="请输入指标编码" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="指标类型" field="type">
                <a-select v-model="formData.type" placeholder="请选择指标类型" @change="handleTypeChange">
                  <a-option :value="MetricType.BUSINESS_CORE">业务核心指标</a-option>
                  <a-option :value="MetricType.REGULATORY">监管指标</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="指标分类" field="category">
                <a-select v-model="formData.category" placeholder="请选择指标分类">
                  <a-option value="用户指标">用户指标</a-option>
                  <a-option value="业务域">业务域</a-option>
                  <a-option value="技术指标">技术指标</a-option>
                  <a-option value="财务指标">财务指标</a-option>
                  <a-option value="风险指标">风险指标</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item 
                v-if="formData.type === MetricType.BUSINESS_CORE" 
                label="业务域" 
                field="businessDomain"
              >
                <a-select v-model="formData.businessDomain" placeholder="请选择业务域">
                  <a-option value="留存域">留存域</a-option>
                  <a-option value="转化域">转化域</a-option>
                  <a-option value="业务规模">业务规模</a-option>
                  <a-option value="风控域">风控域</a-option>
                </a-select>
              </a-form-item>
              <a-form-item 
                v-else-if="formData.type === MetricType.REGULATORY" 
                label="监管报表大类" 
                field="regulatoryCategory"
              >
                <a-select v-model="formData.regulatoryCategory" placeholder="请选择监管报表大类">
                  <a-option :value="RegulatoryCategory.CBIRC_BANKING">银保监会-银监报表</a-option>
                  <a-option :value="RegulatoryCategory.PBOC_CENTRALIZED">人行-大集中报表</a-option>
                  <a-option :value="RegulatoryCategory.PBOC_FINANCIAL_BASE">人行-金融基础数据</a-option>
                  <a-option :value="RegulatoryCategory.PBOC_INTEREST_RATE">人行-利率报备检测分析</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item 
                v-if="formData.type === MetricType.REGULATORY" 
                label="报表名称" 
                field="reportName"
              >
                <a-input v-model="formData.reportName" placeholder="请输入报表名称" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item 
                v-if="formData.type === MetricType.BUSINESS_CORE" 
                label="技术负责人" 
                field="owner"
              >
                <a-input v-model="formData.owner" placeholder="请输入技术负责人" />
              </a-form-item>
              <a-form-item 
                v-else-if="formData.type === MetricType.REGULATORY" 
                label="业务负责人" 
                field="businessOwner"
              >
                <a-input v-model="formData.businessOwner" placeholder="请输入业务负责人" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item 
                v-if="formData.type === MetricType.REGULATORY" 
                label="技术负责人" 
                field="technicalOwner"
              >
                <a-input v-model="formData.technicalOwner" placeholder="请输入技术负责人" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="业务口径" field="businessDefinition">
                <a-textarea 
                  v-model="formData.businessDefinition" 
                  placeholder="请输入业务口径" 
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="使用场景" field="useCase">
                <a-textarea 
                  v-model="formData.useCase" 
                  placeholder="请输入使用场景" 
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 技术信息 -->
        <a-card title="技术信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="统计周期" field="statisticalPeriod">
                <a-select v-model="formData.statisticalPeriod" placeholder="请选择统计周期">
                  <a-option value="实时">实时</a-option>
                  <a-option value="分钟级">分钟级</a-option>
                  <a-option value="小时级">小时级</a-option>
                  <a-option value="日更新">日更新</a-option>
                  <a-option value="周更新">周更新</a-option>
                  <a-option value="月更新">月更新</a-option>
                  <a-option value="季度">季度</a-option>
                  <a-option value="年度">年度</a-option>
                  <a-option value="离线T+1">离线T+1</a-option>
                  <a-option value="离线T+2">离线T+2</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="来源表" field="sourceTable">
                <a-input v-model="formData.sourceTable" placeholder="请输入来源表" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="加工逻辑" field="processingLogic">
                <a-textarea 
                  v-model="formData.processingLogic" 
                  placeholder="请输入加工逻辑（SQL语句或处理流程）" 
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="字段说明" field="fieldDescription">
                <a-textarea 
                  v-model="formData.fieldDescription" 
                  placeholder="请输入字段说明（格式：字段名:描述）" 
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="结果表" field="storageLocation">
                <a-input v-model="formData.storageLocation" placeholder="请输入结果表" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="查询代码" field="queryCode">
                <a-input v-model="formData.queryCode" placeholder="请输入查询代码" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 版本信息 -->
        <a-card title="版本信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="版本号" field="version">
                <a-input v-model="formData.version" placeholder="请输入版本号" :disabled="!isCreateMode" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="版本状态" field="versionStatus">
                <a-select v-model="formData.versionStatus" :disabled="true">
                  <a-option value="draft">草稿</a-option>
                  <a-option value="active">生效</a-option>
                  <a-option value="history">历史</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-alert v-if="formData.versionStatus === 'draft'" type="info" style="margin-bottom: 16px">
                当前版本为草稿状态，需要点击"上线"按钮后才能生效
              </a-alert>
              <a-alert v-else-if="formData.versionStatus === 'active'" type="success" style="margin-bottom: 16px">
                当前版本已生效
              </a-alert>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="版本说明" field="versionDescription">
                <a-textarea 
                  v-model="formData.versionDescription" 
                  placeholder="请输入版本说明" 
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 报表信息 -->
        <a-card title="报表信息" class="form-section">
          <div v-for="(report, index) in formData.reports" :key="index" class="report-item">
            <a-row :gutter="16">
              <a-col :span="10">
                <a-form-item :label="`报表名称 ${index + 1}`" :field="`reports[${index}].name`">
                  <a-input v-model="report.name" placeholder="请输入报表名称" />
                </a-form-item>
              </a-col>
              <a-col :span="10">
                <a-form-item :label="`报表链接 ${index + 1}`" :field="`reports[${index}].url`">
                  <a-input v-model="report.url" placeholder="请输入报表链接" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-button 
                  type="outline" 
                  status="danger" 
                  @click="removeReport(index)"
                  style="margin-top: 30px"
                  :disabled="formData.reports.length <= 1"
                >
                  删除
                </a-button>
              </a-col>
            </a-row>
          </div>
          
          <a-button type="outline" @click="addReport" class="add-report-btn">
            <template #icon><icon-plus /></template>
            添加报表
          </a-button>
        </a-card>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconPlus } from '@arco-design/web-vue/es/icon'
import { MetricType, RegulatoryCategory } from '@/types/metrics'

const route = useRoute()
const router = useRouter()
const formRef = ref()

// 页面滚动相关状态
const enableScroll = ref(true)

// 页面模式判断
const isEditMode = computed(() => route.params.id && route.params.id !== 'create')
const isViewMode = computed(() => route.params.mode === 'view')
const isCreateMode = computed(() => !isEditMode.value && !isViewMode.value)

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  type: MetricType.BUSINESS_CORE,
  category: '',
  businessDomain: '',
  regulatoryCategory: '',
  reportName: '',
  owner: '',
  businessOwner: '',
  technicalOwner: '',
  version: 'v1.0.0',
  versionDescription: '',
  versionStatus: 'draft',
  businessDefinition: '',
  useCase: '',
  statisticalPeriod: '',
  sourceTable: '',
  processingLogic: '',
  fieldDescription: '',
  reports: [{ name: '', url: '' }],
  storageLocation: '',
  queryCode: ''
})

// 表单验证规则
const getFormRules = (type: MetricType) => {
  const baseRules = {
    name: [{ required: true, message: '请输入指标名称' }],
    code: [{ required: true, message: '请输入指标编码' }],
    type: [{ required: true, message: '请选择指标类型' }],
    category: [{ required: true, message: '请选择指标分类' }],
    version: [{ required: true, message: '请输入版本号' }],
    businessDefinition: [{ required: true, message: '请输入业务口径' }],
    statisticalPeriod: [{ required: true, message: '请选择统计周期' }],
    sourceTable: [{ required: true, message: '请输入来源表' }]
  }

  if (type === MetricType.BUSINESS_CORE) {
    return {
      ...baseRules,
      businessDomain: [{ required: true, message: '请选择业务域' }],
      owner: [{ required: true, message: '请输入技术负责人' }]
    }
  } else if (type === MetricType.REGULATORY) {
    return {
      ...baseRules,
      regulatoryCategory: [{ required: true, message: '请选择监管报表大类' }],
      reportName: [{ required: true, message: '请输入报表名称' }],
      businessOwner: [{ required: true, message: '请输入业务负责人' }],
      technicalOwner: [{ required: true, message: '请输入技术负责人' }]
    }
  }

  return baseRules
}

const formRules = computed(() => getFormRules(formData.type))

// 方法
const goBack = () => {
  router.push('/discovery/asset-management/metric-management')
}

const handleEdit = () => {
  router.push({
    name: 'MetricDetail',
    params: { id: route.params.id, mode: 'edit' }
  })
}

const handleTypeChange = (type: MetricType) => {
  // 清空相关字段
  if (type === MetricType.BUSINESS_CORE) {
    formData.regulatoryCategory = ''
    formData.reportName = ''
    formData.businessOwner = ''
    formData.technicalOwner = ''
  } else if (type === MetricType.REGULATORY) {
    formData.businessDomain = ''
    formData.owner = ''
  }
}

const addReport = () => {
  formData.reports.push({ name: '', url: '' })
}

const removeReport = (index: number) => {
  if (formData.reports.length > 1) {
    formData.reports.splice(index, 1)
  }
}

const handleSaveDraft = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      formData.versionStatus = 'draft'
      // 调用保存草稿API
      console.log('保存草稿:', formData)
      Message.success('草稿保存成功')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      // 创建或更新时保持草稿状态
      if (isCreateMode.value) {
        formData.versionStatus = 'draft'
      }
      
      if (isEditMode.value) {
        // 调用编辑API
        console.log('更新指标:', formData)
        Message.success('指标更新成功')
      } else {
        // 调用创建API
        console.log('创建指标:', formData)
        Message.success('指标创建成功')
      }
      
      // 返回列表页
      goBack()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 上线功能
const handleGoOnline = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      formData.versionStatus = 'active'
      // 调用上线API
      console.log('指标上线:', formData)
      Message.success('指标已成功上线')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}



// 加载指标数据
const loadMetricData = async (id: string) => {
  try {
    // 模拟API调用
    const mockData = {
      id: 1,
      name: 'DAU',
      code: 'USER_001',
      type: MetricType.BUSINESS_CORE,
      category: '用户指标',
      businessDomain: '留存域',
      businessDefinition: '日活跃用户数',
      owner: '张三',
      version: 'v1.2.0',
      versionStatus: isViewMode.value ? 'active' : 'draft',
      versionDescription: '优化计算逻辑，提升数据准确性',
      useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
      statisticalPeriod: '日更新',
      sourceTable: 'dwd.user_login_detail',
      processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau FROM dwd.user_login_detail WHERE dt = ${date} GROUP BY dt',
      fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
      reports: [{ name: '用户分析报表', url: '/reports/user-analysis' }, { name: '核心指标报表', url: '/reports/core-metrics' }],
      storageLocation: 'adm.ads_user_core_metrics',
      queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}'
    }
    
    Object.assign(formData, mockData)
  } catch (error) {
    console.error('加载指标数据失败:', error)
    Message.error('加载指标数据失败')
  }
}

onMounted(() => {
  if (isEditMode.value || isViewMode.value) {
    loadMetricData(route.params.id as string)
  }
})
</script>

<style scoped>
.metric-detail-page {
  padding: 20px;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
  flex-shrink: 0;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.form-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.form-container.scrollable {
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.form-section {
  margin-bottom: 24px;
}

.report-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.add-report-btn {
  width: 100%;
  margin-top: 16px;
  border-style: dashed;
}


</style>