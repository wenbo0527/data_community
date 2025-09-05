<template>
  <div class="audience-create">
    <!-- 面包屑导航 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item>
        <router-link to="/exploration/customer-center">客户中心</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/exploration/customer-center/audience-system/audience-management">人群管理</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ getPageTitle() }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
        <p class="page-description">{{ getPageDescription() }}</p>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="content-section">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">基本信息</span>
        </template>
        <a-form :model="audienceForm.basic" layout="vertical" class="basic-form">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="人群名称" required>
                <a-input v-model="audienceForm.basic.name" placeholder="请输入人群名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="人群类型" required>
                <a-select v-model="audienceForm.basic.audienceType" placeholder="请选择人群类型">
                  <a-option value="static">静态人群</a-option>
                  <a-option value="dynamic">动态人群</a-option>
                  <a-option value="computed">计算人群</a-option>
                  <a-option value="rule">规则人群</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="共享级别" required>
                <a-select v-model="audienceForm.basic.shareLevel" placeholder="请选择共享级别">
                  <a-option value="public">公开</a-option>
                  <a-option value="private">私有</a-option>
                  <a-option value="team">团队</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="更新频率">
                <a-select v-model="audienceForm.basic.updateFrequency" placeholder="请选择更新频率">
                  <a-option value="realtime">实时</a-option>
                  <a-option value="daily">每日</a-option>
                  <a-option value="weekly">每周</a-option>
                  <a-option value="monthly">每月</a-option>
                  <a-option value="manual">手动</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="有效期">
                <a-date-picker 
                  v-model="audienceForm.basic.expireDate" 
                  placeholder="请选择有效期"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="人群描述">
            <a-textarea 
              v-model="audienceForm.basic.description" 
              placeholder="请输入人群描述"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 规则配置 -->
    <div class="content-section" v-if="createMode === 'rule'">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">人群圈选规则</span>
        </template>
        <template #extra>
          <span class="card-description">通过设置条件规则来定义人群范围，支持标签、事件、明细数据三种类型</span>
        </template>
        <div class="rules-config-section">
          <ConditionConfig
            :condition-groups="audienceForm.conditionGroups"
            :cross-group-logic="audienceForm.crossGroupLogic || 'or'"
            :editable="true"
            :data-source-type-options="dataSourceTypeOptions"
            :date-type-options="dateTypeOptions"
            :dynamic-unit-options="dynamicUnitOptions"
            :get-field-options="getFieldOptions"
            :get-aggregation-options="getAggregationOptions"
            :get-operator-options="getOperatorOptions"
            :need-value-input="needValueInput"
            :get-value-placeholder="getValuePlaceholder"
            :on-data-source-type-change="onDataSourceTypeChange"
            :on-date-type-change="onDateTypeChange"
            :get-tag-options="getTagOptions"
            :get-tag-operator-options="getTagOperatorOptions"
            :need-tag-value-input="needTagValueInput"
            :get-tag-value-placeholder="getTagValuePlaceholder"
            :get-event-options="getEventOptions"
            :get-event-property-options="getEventPropertyOptions"
            :get-property-operator-options="getPropertyOperatorOptions"
            @add-condition-group="addConditionGroup"
            @add-exclude-condition-group="addExcludeConditionGroup"
            @delete-exclude-condition-group="deleteExcludeConditionGroup"
            @delete-condition-group="deleteConditionGroup"
            @toggle-group-logic="toggleGroupLogic"
            @toggle-cross-group-logic="toggleCrossGroupLogic"
            @add-condition-by-type="addConditionByType"
            @remove-condition="removeCondition"
          />
        </div>
      </a-card>
    </div>

    <!-- 数据导入 -->
    <div class="content-section" v-if="createMode === 'import'">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">数据导入配置</span>
        </template>
        <template #extra>
          <span class="card-description">通过文件上传、数据库导入或API接口导入人群数据</span>
        </template>
        <div class="import-config-section">
          <a-form :model="audienceForm.import" layout="vertical">
            <a-form-item label="导入方式">
              <a-radio-group v-model="audienceForm.import.method">
                <a-radio value="file">文件上传</a-radio>
                <a-radio value="database">数据库导入</a-radio>
                <a-radio value="api">API接口</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <!-- 文件上传 -->
            <div v-if="audienceForm.import.method === 'file'">
              <a-form-item label="上传文件">
                <a-upload
                  :file-list="audienceForm.import.fileList"
                  :show-file-list="true"
                  :auto-upload="false"
                  accept=".csv,.xlsx,.json"
                  @change="handleFileChange"
                >
                  <template #upload-button>
                    <div class="upload-area">
                      <icon-upload style="font-size: 48px; color: #c9cdd4;" />
                      <div style="margin-top: 8px;">点击或拖拽文件到此处上传</div>
                      <div style="color: #86909c; font-size: 12px; margin-top: 4px;">支持 CSV、Excel、JSON 格式</div>
                    </div>
                  </template>
                </a-upload>
              </a-form-item>
            </div>
          </a-form>
        </div>
      </a-card>
    </div>

    <!-- 预览结果区域 -->
    <div v-if="showPreviewResult" class="preview-result-section">
      <a-card>
        <div class="preview-result-header">
          <h3>预计算结果</h3>
          <p class="section-description">根据当前配置的规则预计算出的人群规模和统计信息</p>
        </div>
        
        <div class="preview-result-content">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-statistic title="预估人群规模" :value="previewStats.totalCount" suffix="人" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="规则条件数" :value="previewStats.ruleCount" suffix="个" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="数据覆盖率" :value="previewStats.coverage" suffix="%" :precision="2" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="预计执行时间" :value="previewStats.estimatedTime" suffix="分钟" />
            </a-col>
          </a-row>
        </div>
      </a-card>
    </div>

    <!-- 页面底部按钮 -->
    <div class="page-footer">
      <a-space>
        <a-button @click="goBack">取消</a-button>
        <a-button 
          v-if="!showPreviewResult" 
          type="primary" 
          @click="preCalculate" 
          :loading="preCalculating"
          :disabled="!canPreCalculate"
        >
          预计算
        </a-button>
        <a-button 
          v-if="showPreviewResult" 
          type="primary" 
          @click="saveAudience" 
          :loading="saving"
        >
          {{ isEditMode ? '保存' : '创建' }}
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconDelete, IconSettings, IconTags, IconUpload } from '@arco-design/web-vue/es/icon'
import ConditionConfig from '@/components/common/ConditionConfig.vue'

const router = useRouter()
const route = useRoute()

// 获取创建模式和编辑状态
const createMode = ref(route.query.mode as string || 'rule') // rule | import
const isEditMode = ref(!!route.params.id)
const saving = ref(false)
const preCalculating = ref(false)
const showPreviewResult = ref(false)

// 人群表单数据
const audienceForm = reactive({
  basic: {
    name: '',
    audienceType: 'rule',
    shareLevel: 'public',
    updateFrequency: 'daily',
    expireDate: null,
    description: ''
  },
  conditionGroups: [] as Array<{
    id?: string
    logic?: string
    isExclude?: boolean
    conditions: Array<{
      id?: string
      type?: string
      dataSourceType?: string
      fieldName?: string
      aggregationType?: string
      operator?: string
      value?: string
      dateType?: string
      dynamicValue?: number
      dynamicUnit?: string
      dateRange?: [string, string]
      isExclude?: boolean
    }>
  }>,
  crossGroupLogic: 'or',
  import: {
    method: 'file',
    fileList: [] as any[]
  }
})

// 预览统计数据
const previewStats = reactive({
  totalCount: 0,
  ruleCount: 0,
  coverage: 0,
  estimatedTime: 0
})

// 页面标题和描述
const getPageTitle = () => {
  if (isEditMode.value) {
    return '编辑人群'
  }
  return createMode.value === 'rule' ? '自定义规则创建人群' : '数据导入创建人群'
}

const getPageDescription = () => {
  if (isEditMode.value) {
    return '修改人群配置信息'
  }
  return createMode.value === 'rule' 
    ? '通过配置条件规则来定义人群范围，支持标签、事件、明细数据三种类型'
    : '通过文件上传、数据库导入或API接口导入人群数据'
}

// 计算属性：是否可以进行预计算
const canPreCalculate = computed(() => {
  // 基本信息必须填写完整
  if (!audienceForm.basic.name || !audienceForm.basic.audienceType) {
    return false
  }
  
  // 规则创建模式需要至少一个条件组
  if (createMode.value === 'rule' && audienceForm.conditionGroups.length === 0) {
    return false
  }
  
  // 导入模式需要上传文件
  if (createMode.value === 'import' && audienceForm.import.method === 'file' && audienceForm.import.fileList.length === 0) {
    return false
  }
  
  return true
})

// 条件配置相关函数
const addConditionGroup = () => {
  audienceForm.conditionGroups.push({
    id: Date.now().toString(),
    logic: 'and',
    conditions: [{
      id: Date.now().toString() + '_1',
      type: 'tag',
      dataSourceType: 'tag',
      fieldName: '',
      aggregationType: '',
      operator: '',
      value: '',
      dateType: 'dynamic',
      dynamicValue: 1,
      dynamicUnit: 'days',
      dateRange: undefined as [string, string] | undefined,
      isExclude: false
    }]
  })
}

const addExcludeConditionGroup = () => {
  audienceForm.conditionGroups.push({
    id: Date.now().toString(),
    logic: 'and',
    isExclude: true,
    conditions: [{
      id: Date.now().toString() + '_1',
      type: 'tag',
      dataSourceType: 'tag',
      fieldName: '',
      aggregationType: '',
      operator: '',
      value: '',
      dateType: 'dynamic',
      dynamicValue: 1,
      dynamicUnit: 'days',
      dateRange: undefined as [string, string] | undefined,
      isExclude: false
    }]
  })
}

const deleteConditionGroup = (groupIndex: number) => {
  // 找到常规条件组中的索引
  const regularGroups = audienceForm.conditionGroups.filter(group => !group.isExclude)
  if (groupIndex >= 0 && groupIndex < regularGroups.length) {
    const targetGroup = regularGroups[groupIndex]
    const actualIndex = audienceForm.conditionGroups.indexOf(targetGroup)
    audienceForm.conditionGroups.splice(actualIndex, 1)
  }
}

const deleteExcludeConditionGroup = (groupIndex: number) => {
  // 找到排除条件组中的索引
  const excludeGroups = audienceForm.conditionGroups.filter(group => group.isExclude)
  if (groupIndex >= 0 && groupIndex < excludeGroups.length) {
    const targetGroup = excludeGroups[groupIndex]
    const actualIndex = audienceForm.conditionGroups.indexOf(targetGroup)
    audienceForm.conditionGroups.splice(actualIndex, 1)
  }
}

const toggleCrossGroupLogic = () => {
  audienceForm.crossGroupLogic = audienceForm.crossGroupLogic === 'and' ? 'or' : 'and'
}

const toggleGroupLogic = (group: any) => {
  group.logic = group.logic === 'and' ? 'or' : 'and'
}

const addConditionByType = (group: any, type: string) => {
  // 映射类型到正确的dataSourceType
  let dataSourceType = type
  if (type === 'tag') {
    dataSourceType = 'attribute'
  } else if (type === 'behavior') {
    dataSourceType = 'behavior'
  } else if (type === 'detail') {
    dataSourceType = 'detail'
  }
  
  group.conditions.push({
    id: Date.now().toString() + '_' + group.conditions.length,
    type: type,
    dataSourceType: dataSourceType,
    fieldName: '',
    aggregationType: '',
    operator: '',
    value: '',
    dateType: 'dynamic',
    dynamicValue: 1,
    dynamicUnit: 'days',
    dateRange: undefined as [string, string] | undefined,
    isExclude: false
  })
}

const removeCondition = (group: any, conditionIndex: number) => {
  if (group.conditions && conditionIndex >= 0 && conditionIndex < group.conditions.length) {
    group.conditions.splice(conditionIndex, 1)
  }
}

// ConditionConfig组件所需的数据选项
const dataSourceTypeOptions = [
  { label: '标签', value: 'tag' },
  { label: '事件', value: 'event' },
  { label: '明细数据', value: 'detail' }
]

const dateTypeOptions = [
  { label: '动态时间', value: 'dynamic' },
  { label: '固定时间', value: 'fixed' }
]

const dynamicUnitOptions = [
  { label: '天', value: 'days' },
  { label: '周', value: 'weeks' },
  { label: '月', value: 'months' }
]

// 获取字段选项
const getFieldOptions = (dataSourceType: string) => {
  const fieldMap: Record<string, Array<{label: string, value: string}>> = {
    attribute: [
      { label: '年龄', value: 'age' },
      { label: '性别', value: 'gender' },
      { label: '城市', value: 'city' },
      { label: '收入', value: 'income' },
      { label: '职业', value: 'occupation' },
      { label: '教育程度', value: 'education' },
      // 消费金融相关标签
      { label: '信用评级', value: 'credit_rating' },
      { label: '收入水平', value: 'income_level' },
      { label: '职业类型', value: 'occupation_type' },
      { label: '婚姻状况', value: 'marital_status' },
      { label: '年龄段', value: 'age_group' },
      { label: '资产规模', value: 'asset_scale' },
      { label: '负债情况', value: 'debt_status' },
      { label: '风险等级', value: 'risk_level' },
      { label: '征信记录', value: 'credit_history' },
      { label: '居住状况', value: 'residence_status' }
    ],
    tag: [
      { label: '年龄', value: 'age' },
      { label: '性别', value: 'gender' },
      { label: '城市', value: 'city' },
      { label: '收入', value: 'income' },
      { label: '职业', value: 'occupation' },
      { label: '教育程度', value: 'education' },
      // 消费金融相关标签
      { label: '信用评级', value: 'credit_rating' },
      { label: '收入水平', value: 'income_level' },
      { label: '职业类型', value: 'occupation_type' },
      { label: '婚姻状况', value: 'marital_status' },
      { label: '年龄段', value: 'age_group' },
      { label: '资产规模', value: 'asset_scale' },
      { label: '负债情况', value: 'debt_status' },
      { label: '风险等级', value: 'risk_level' },
      { label: '征信记录', value: 'credit_history' },
      { label: '居住状况', value: 'residence_status' }
    ],
    behavior: [
      { label: '登录行为', value: 'login_behavior' },
      { label: '购买行为', value: 'purchase_behavior' },
      { label: '浏览行为', value: 'view_behavior' },
      { label: '点击行为', value: 'click_behavior' },
      { label: '分享行为', value: 'share_behavior' },
      // 消费金融相关行为
      { label: '贷款申请行为', value: 'loan_application_behavior' },
      { label: '还款行为', value: 'repayment_behavior' },
      { label: '逾期行为', value: 'overdue_behavior' },
      { label: '提前还款行为', value: 'early_repayment_behavior' },
      { label: '额度调整行为', value: 'credit_limit_adjustment_behavior' },
      { label: '风险评估行为', value: 'risk_assessment_behavior' },
      { label: '征信查询行为', value: 'credit_inquiry_behavior' },
      { label: '产品咨询行为', value: 'product_consultation_behavior' },
      { label: '合同签署行为', value: 'contract_signing_behavior' },
      { label: '账户开通行为', value: 'account_opening_behavior' }
    ],
    event: [
      { label: '登录事件', value: 'login_event' },
      { label: '购买事件', value: 'purchase_event' },
      { label: '浏览事件', value: 'view_event' },
      { label: '点击事件', value: 'click_event' },
      { label: '分享事件', value: 'share_event' },
      // 消费金融相关事件
      { label: '贷款申请事件', value: 'loan_application_event' },
      { label: '还款事件', value: 'repayment_event' },
      { label: '逾期事件', value: 'overdue_event' },
      { label: '提前还款事件', value: 'early_repayment_event' },
      { label: '额度调整事件', value: 'credit_limit_adjustment_event' },
      { label: '风险评估事件', value: 'risk_assessment_event' },
      { label: '征信查询事件', value: 'credit_inquiry_event' },
      { label: '产品咨询事件', value: 'product_consultation_event' },
      { label: '合同签署事件', value: 'contract_signing_event' },
      { label: '账户开通事件', value: 'account_opening_event' }
    ],
    detail: [
      { label: '用户ID', value: 'user_id' },
      { label: '订单金额', value: 'order_amount' },
      { label: '订单时间', value: 'order_time' },
      { label: '商品类别', value: 'product_category' },
      { label: '支付方式', value: 'payment_method' },
      // 消费金融相关明细数据
      { label: '贷款金额', value: 'loan_amount' },
      { label: '还款金额', value: 'repayment_amount' },
      { label: '逾期天数', value: 'overdue_days' },
      { label: '信用分数', value: 'credit_score' },
      { label: '月收入', value: 'monthly_income' },
      { label: '负债率', value: 'debt_ratio' },
      { label: '担保方式', value: 'guarantee_type' },
      { label: '贷款期限', value: 'loan_term' },
      { label: '利率', value: 'interest_rate' },
      { label: '还款方式', value: 'repayment_method' },
      { label: '贷款用途', value: 'loan_purpose' },
      { label: '抵押物价值', value: 'collateral_value' },
      { label: '账户余额', value: 'account_balance' },
      { label: '交易金额', value: 'transaction_amount' }
    ]
  }
  return fieldMap[dataSourceType] || []
}

// 获取聚合选项
const getAggregationOptions = (dataSourceType: string) => {
  const aggregationMap: Record<string, Array<{label: string, value: string}>> = {
    behavior: [
      { label: '次数', value: 'count' },
      { label: '总和', value: 'sum' },
      { label: '平均值', value: 'avg' },
      { label: '最大值', value: 'max' },
      { label: '最小值', value: 'min' },
      { label: '去重计数', value: 'distinct_count' }
    ],
    event: [
      { label: '次数', value: 'count' },
      { label: '总和', value: 'sum' },
      { label: '平均值', value: 'avg' },
      { label: '最大值', value: 'max' },
      { label: '最小值', value: 'min' },
      { label: '去重计数', value: 'distinct_count' }
    ],
    detail: [
      { label: '计数', value: 'count' },
      { label: '求和', value: 'sum' },
      { label: '平均值', value: 'avg' },
      { label: '最大值', value: 'max' },
      { label: '最小值', value: 'min' },
      { label: '去重计数', value: 'distinct_count' }
    ]
  }
  
  if (dataSourceType === 'tag' || dataSourceType === 'attribute') {
    return []
  }
  
  return aggregationMap[dataSourceType] || [
    { label: '计数', value: 'count' },
    { label: '求和', value: 'sum' },
    { label: '平均值', value: 'avg' },
    { label: '最大值', value: 'max' },
    { label: '最小值', value: 'min' },
    { label: '去重计数', value: 'distinct_count' }
  ]
}

// 获取操作符选项
const getOperatorOptions = (condition: any) => {
  return [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于等于', value: 'lte' },
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' },
    { label: '模糊匹配', value: 'like' }
  ]
}

// 判断是否需要值输入
const needValueInput = (condition: any) => {
  return true
}

// 获取值输入占位符
const getValuePlaceholder = (condition: any) => {
  return '请输入值'
}

// 数据源类型变化处理
const onDataSourceTypeChange = (condition: any) => {
  condition.fieldName = ''
  condition.aggregationType = ''
}

// 日期类型变化处理
const onDateTypeChange = (condition: any) => {
  if (condition.dateType === 'dynamic') {
    condition.dateRange = undefined
    condition.dynamicValue = 1
    condition.dynamicUnit = 'days'
  } else {
    condition.dynamicValue = undefined
    condition.dynamicUnit = undefined
    condition.dateRange = ['', ''] as [string, string]
  }
}

// 获取标签选项
const getTagOptions = () => {
  return [
    // 基础属性
    { label: '年龄', value: 'age' },
    { label: '性别', value: 'gender' },
    { label: '城市', value: 'city' },
    { label: '婚姻状况', value: 'marital_status' },
    { label: '教育程度', value: 'education' },
    { label: '职业类型', value: 'occupation_type' },
    { label: '居住状况', value: 'residence_status' },
    
    // 金融属性
    { label: '收入水平', value: 'income_level' },
    { label: '信用评级', value: 'credit_rating' },
    { label: '风险等级', value: 'risk_level' },
    { label: '信用分数', value: 'credit_score' },
    { label: '资产规模', value: 'asset_scale' },
    { label: '负债情况', value: 'debt_status' },
    { label: '征信记录', value: 'credit_history' },
    { label: '月收入', value: 'monthly_income' },
    { label: '负债率', value: 'debt_ratio' },
    
    // 行为特征
    { label: '活跃度', value: 'activity_level' },
    { label: '响应层级', value: 'response_level' },
    { label: '产品使用频率', value: 'product_usage_frequency' },
    { label: '客户价值等级', value: 'customer_value_level' },
    { label: '风险偏好', value: 'risk_preference' }
  ]
}

// 获取标签操作符选项
const getTagOperatorOptions = () => {
  return [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' }
  ]
}

// 判断标签是否需要值输入
const needTagValueInput = (condition: any) => {
  return true
}

// 获取标签值输入占位符
const getTagValuePlaceholder = (condition: any) => {
  return '请选择或输入标签值'
}

// 获取事件选项
const getEventOptions = () => {
  return [
    // 贷款相关事件
    { label: '贷款申请', value: 'loan_application' },
    { label: '贷款审批', value: 'loan_approval' },
    { label: '贷款放款', value: 'loan_disbursement' },
    { label: '还款', value: 'repayment' },
    { label: '提前还款', value: 'early_repayment' },
    { label: '逾期还款', value: 'overdue_repayment' },
    { label: '贷款结清', value: 'loan_settlement' },
    
    // 风险相关事件
    { label: '风险评估', value: 'risk_assessment' },
    { label: '征信查询', value: 'credit_inquiry' },
    { label: '风险预警', value: 'risk_warning' },
    { label: '逾期提醒', value: 'overdue_reminder' },
    { label: '催收记录', value: 'collection_record' },
    
    // 业务相关事件
    { label: '产品咨询', value: 'product_consultation' },
    { label: '合同签署', value: 'contract_signing' },
    { label: '账户开通', value: 'account_opening' },
    { label: '额度调整', value: 'credit_limit_adjustment' },
    { label: '产品升级', value: 'product_upgrade' },
    { label: '服务申请', value: 'service_application' },
    
    // 用户行为事件
    { label: '登录', value: 'login' },
    { label: '页面访问', value: 'page_visit' },
    { label: '功能使用', value: 'feature_usage' },
    { label: '文档下载', value: 'document_download' },
    { label: '客服咨询', value: 'customer_service_inquiry' }
  ]
}

// 获取事件属性选项
const getEventPropertyOptions = (eventName: string) => {
  const propertyMap: Record<string, Array<{label: string, value: string}>> = {
    loan_events: [
      { label: '贷款金额', value: 'loan_amount' },
      { label: '贷款期限', value: 'loan_term' },
      { label: '利率', value: 'interest_rate' },
      { label: '贷款用途', value: 'loan_purpose' }
    ],
    risk_events: [
      { label: '风险等级', value: 'risk_level' },
      { label: '信用分数', value: 'credit_score' },
      { label: '逾期天数', value: 'overdue_days' },
      { label: '违约概率', value: 'default_probability' }
    ],
    business_events: [
      { label: '产品类型', value: 'product_type' },
      { label: '渠道来源', value: 'channel_source' },
      { label: '业务状态', value: 'business_status' },
      { label: '处理结果', value: 'process_result' }
    ],
    user_behavior_events: [
      { label: '访问页面', value: 'page_visit' },
      { label: '点击按钮', value: 'button_click' },
      { label: '停留时长', value: 'stay_duration' },
      { label: '操作类型', value: 'operation_type' }
    ],
    system_events: [
      { label: '系统模块', value: 'system_module' },
      { label: '操作类型', value: 'operation_type' },
      { label: '执行状态', value: 'execution_status' },
      { label: '响应时间', value: 'response_time' }
    ]
  }
  return propertyMap[eventName] || []
}

// 获取属性操作符选项
const getPropertyOperatorOptions = () => {
  return [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于等于', value: 'lte' },
    { label: '包含', value: 'in' },
    { label: '不包含', value: 'not_in' },
    { label: '模糊匹配', value: 'like' }
  ]
}



// 文件上传处理
const handleFileChange = (fileList: any[]) => {
  audienceForm.import.fileList = fileList
}

// 预计算
const preCalculate = async () => {
  preCalculating.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新预览统计
    previewStats.totalCount = Math.floor(Math.random() * 100000) + 10000
    previewStats.ruleCount = audienceForm.conditionGroups.length
    previewStats.coverage = Math.floor(Math.random() * 30) + 70
    previewStats.estimatedTime = Math.floor(Math.random() * 10) + 1
    
    // 显示预览结果
    showPreviewResult.value = true
    
    Message.success('预计算完成')
  } catch (error) {
    Message.error('预计算失败')
  } finally {
    preCalculating.value = false
  }
}



// 保存人群
const saveAudience = async () => {
  // 如果还没有预计算，先进行预计算
  if (!showPreviewResult.value) {
    Message.warning('请先进行预计算')
    return
  }
  
  saving.value = true
  try {
    // 生成人群ID（如果是新建模式）
    const audienceId = isEditMode.value ? route.params.id : `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // 构建完整的人群数据
    const audienceData = {
      id: audienceId,
      ...audienceForm.basic,
      createMode: createMode.value,
      conditionGroups: audienceForm.conditionGroups,
      crossGroupLogic: audienceForm.crossGroupLogic,
      importConfig: audienceForm.import,
      createUser: '当前用户',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: 'active'
    }
    
    console.log('保存人群数据:', audienceData)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    Message.success(isEditMode.value ? '人群更新成功' : '人群创建成功')
    
    // 返回人群管理页面
    goBack()
  } catch (error) {
    Message.error(isEditMode.value ? '人群更新失败' : '人群创建失败')
  } finally {
    saving.value = false
  }
}

// 返回人群管理页面
const goBack = () => {
  router.push({ name: 'audience-management' })
}
</script>

<style scoped>
/* 页面容器 */
.audience-create {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb :deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  text-decoration: none;
}

.breadcrumb :deep(.arco-breadcrumb-item-link:hover) {
  text-decoration: underline;
}

/* 页面头部 */
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

.breadcrumb {
  margin-bottom: 12px;
}

.breadcrumb :deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  cursor: pointer;
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

.header-actions {
  flex-shrink: 0;
}

/* 内容区域 */
.content-section {
  margin-bottom: 20px;
}

.form-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.basic-form {
  padding: 20px;
}

/* 规则配置区域 */
.rules-config-section {
  padding: 20px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

/* 导入配置区域 */
.import-config-section {
  padding: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #c9cdd4;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f0f5ff;
}

/* 预览区域 */
.preview-section {
  padding: 20px;
}

.preview-stats {
  margin: 24px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
}

/* 卡片标题样式 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.card-description {
  font-size: 14px;
  color: #86909c;
  margin-left: 8px;
}

.form-card {
  margin-bottom: 20px;
}

/* 统计卡片样式 */
.preview-stats :deep(.arco-statistic) {
  text-align: center;
}

.preview-stats :deep(.arco-statistic-title) {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.preview-stats :deep(.arco-statistic-value) {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .audience-create {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .basic-form,
  .rules-config-section,
  .import-config-section,
  .preview-section {
    padding: 16px;
  }
  
  .preview-stats {
    padding: 16px;
  }
  
  .upload-area {
    padding: 30px 15px;
  }
}

/* 预览结果区域 */
.preview-result-section {
  margin-top: 20px;
}

.preview-result-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.preview-result-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.preview-result-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 页面底部按钮 */
.page-footer {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}
</style>