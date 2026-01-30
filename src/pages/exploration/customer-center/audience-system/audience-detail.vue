<template>
  <div class="audience-detail">
    <!-- 面包屑导航 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item>
        <IconHome />
      </a-breadcrumb-item>
      <a-breadcrumb-item>客户中心</a-breadcrumb-item>
      <a-breadcrumb-item>人群管理</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">人群详情</h2>
        <div class="audience-info">
          <span class="audience-id">人群ID：{{ audienceDetail.id }}</span>
          <span class="audience-name">{{ audienceDetail.name }}</span>
          <a-tag :color="getStatusColor(audienceDetail.status)">
            {{ getStatusText(audienceDetail.status) }}
          </a-tag>
        </div>
      </div>
      <div class="header-actions">
        <a-button type="primary">刷新人群</a-button>
        <a-button>导出人群</a-button>
      </div>
    </div>

    <!-- 人群基本信息 -->
    <div class="content-section">
      <a-card class="info-card">
        <template #title>
          <span class="card-title">人群基本信息</span>
        </template>

        <div class="info-grid">
          <div class="info-row">
            <div class="info-item">
              <span class="label">人群类型：</span>
              <a-tag :color="getTypeColor(audienceDetail.type)">
                {{ getTypeText(audienceDetail.type) }}
              </a-tag>
            </div>
            <div class="info-item">
              <span class="label">创建方式：</span>
              <span class="value">{{ getCreateMethodText(audienceDetail.createMethod) }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <span class="label">更新频率：</span>
              <span class="value">{{ audienceDetail.updateFrequency }}</span>
            </div>
            <div class="info-item">
              <span class="label">有效期：</span>
              <span class="value">{{ audienceDetail.validPeriod }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <span class="label">共享级别：</span>
              <a-tag :color="getShareLevelColor(audienceDetail.shareLevel)">
                {{ getShareLevelText(audienceDetail.shareLevel) }}
              </a-tag>
            </div>
            <div class="info-item">
              <span class="label">创建人：</span>
              <span class="value">{{ audienceDetail.createUser }}</span>
            </div>
          </div>

          <div class="info-row full-width">
            <div class="info-item">
              <span class="label">人群描述：</span>
              <span class="value description">{{ audienceDetail.description }}</span>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 人群统计 -->
    <div class="content-section">
      <a-card class="subject-card">
        <template #title>
          <div class="card-header">
            <span class="card-title">人群统计</span>
          </div>
        </template>

        <div class="subject-content">
          <div class="subject-stats">
            <div class="stat-item">
              <div class="stat-label">人群规模：</div>
              <div class="stat-value primary">{{ formatNumber(audienceStats.totalCount) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">覆盖率：</div>
              <div class="stat-value">{{ audienceStats.coverageRate }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">活跃用户数：</div>
              <div class="stat-value">{{ formatNumber(audienceStats.activeCount) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">数据质量评分：</div>
              <div class="stat-value">{{ audienceStats.qualityScore }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">平均信用评分：</div>
              <div class="stat-value">{{ audienceStats.avgCreditScore }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">平均年收入：</div>
              <div class="stat-value">{{ formatNumber(audienceStats.avgIncome) }}元</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">平均贷款金额：</div>
              <div class="stat-value">{{ formatNumber(audienceStats.avgLoanAmount) }}元</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">违约率：</div>
              <div class="stat-value">{{ audienceStats.defaultRate }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">最后更新时间：</div>
              <div class="stat-value">{{ audienceStats.updateTime }}</div>
            </div>
          </div>

          <!-- 数据分布图表 -->
          <div class="chart-section">
            <div class="chart-tabs">
              <a-radio-group v-model="activeTab" type="button">
                <a-radio value="age">年龄分布</a-radio>
                <a-radio value="income">收入分布</a-radio>
                <a-radio value="credit">信用评级</a-radio>
                <a-radio value="occupation">职业分布</a-radio>
                <a-radio value="education">教育程度</a-radio>
                <a-radio value="loan">贷款金额</a-radio>
                <a-radio value="repayment">还款行为</a-radio>
                <a-radio value="consumption">消费偏好</a-radio>
                <a-radio value="risk">风险等级</a-radio>
                <a-radio value="activity">账户活跃度</a-radio>
                <a-radio value="lineage">血缘查询</a-radio>
              </a-radio-group>
            </div>

            <div class="chart-content" style="max-height: 500px; overflow-y: auto;">
              <!-- 年龄分布 -->
              <div v-if="activeTab === 'age'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">年龄分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.ageDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}岁</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 收入分布 -->
              <div v-if="activeTab === 'income'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">收入分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.incomeDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 信用评级分布 -->
              <div v-if="activeTab === 'credit'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">信用评级分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.creditRatingDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}级</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 职业分布 -->
              <div v-if="activeTab === 'occupation'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">职业分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.occupationDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 教育程度分布 -->
              <div v-if="activeTab === 'education'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">教育程度分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.educationDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 贷款金额分布 -->
              <div v-if="activeTab === 'loan'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">贷款金额分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.loanAmountDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 还款行为分布 -->
              <div v-if="activeTab === 'repayment'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">还款行为分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.repaymentBehaviorDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 消费偏好分布 -->
              <div v-if="activeTab === 'consumption'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">消费偏好分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.consumptionPreferenceDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 风险等级分布 -->
              <div v-if="activeTab === 'risk'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">风险等级分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.riskLevelDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <!-- 账户活跃度分布 -->
              <div v-if="activeTab === 'activity'" class="distribution-chart">
                <div class="total-count">
                  <span class="count-number">{{ formatNumber(audienceStats.totalCount) }}</span>
                  <span class="count-label">人</span>
                  <span class="count-desc">账户活跃度分布数据更新于 {{ audienceStats.dataDate }} 02:38:12</span>
                </div>
                <div class="distribution-bars">
                  <div v-for="(item, index) in distributionData.accountActivityDistribution" :key="index" class="bar-item">
                    <div class="bar-label">{{ item.name }}</div>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: (item.value / audienceStats.totalCount * 100) + '%', backgroundColor: getDistributionColor(index) }">
                      </div>
                    </div>
                    <div class="bar-value">{{ formatNumber(item.value) }}人</div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'lineage'" class="lineage-chart">
                <div class="lineage-header">
                  <div class="lineage-title">
                    <span class="title-text">人群血缘关系</span>
                    <span class="title-desc">展示人群引用的标签、属性及对应数据表的血缘关系</span>
                  </div>
                  <div class="lineage-legend">
                    <div class="legend-item">
                      <span class="legend-color audience"></span>
                      <span class="legend-text">人群</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color tag"></span>
                      <span class="legend-text">标签</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color attribute"></span>
                      <span class="legend-text">属性</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color table"></span>
                      <span class="legend-text">数据表</span>
                    </div>
                  </div>
                </div>
                <div ref="lineageChartRef" class="lineage-chart-container"></div>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 人群规则配置 -->
    <div class="content-section">
      <a-card class="rule-config-card">
        <template #title>
          <span class="card-title">人群规则配置</span>
        </template>

        <div class="rule-config-content" style="max-height: 600px; overflow-y: auto;">
          <!-- 条件配置区域 -->
          <div class="conditions-workspace">
            <ConditionConfig :condition-groups="audienceRules.conditionGroups"
              :cross-group-logic="audienceRules.crossGroupLogic" :editable="false"
              :data-source-type-options="dataSourceTypeOptions" :date-type-options="dateTypeOptions"
              :dynamic-unit-options="dynamicUnitOptions" :get-field-options="getFieldOptions"
              :get-aggregation-options="getAggregationOptions" :get-operator-options="getOperatorOptions"
              :need-value-input="needValueInput" :get-value-placeholder="getValuePlaceholder"
              :on-data-source-type-change="onDataSourceTypeChange" :on-date-type-change="onDateTypeChange" />
          </div>
        </div>
      </a-card>
    </div>

    <!-- 消费金融明细数据 -->
    <div class="content-section">
      <a-card class="detail-data-card">
        <template #title>
          <span class="card-title">消费金融明细数据</span>
        </template>

        <div class="detail-data-content">
          <!-- 明细数据标签页 -->
          <div class="detail-tabs">
            <a-radio-group v-model="detailActiveTab" type="button">
              <a-radio value="transactions">交易记录</a-radio>
              <a-radio value="accounts">账户信息</a-radio>
              <a-radio value="products">产品使用</a-radio>
              <a-radio value="risk">风险评估</a-radio>
            </a-radio-group>
          </div>

          <div class="detail-content" style="max-height: 400px; overflow-y: auto;">
            <!-- 交易记录明细 -->
            <div v-if="detailActiveTab === 'transactions'" class="detail-section">
              <div class="detail-header">
                <span class="detail-title">近期交易记录</span>
                <span class="detail-desc">展示客户最近的金融交易明细</span>
              </div>
              <a-table :columns="transactionColumns" :data-source="detailData.transactions" :pagination="false" size="small" :bordered="false" class="table-borderless table-compact">
                <template #status="{ record }">
                  <a-tag :color="getTransactionStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template #amount="{ record }">
                  <span class="amount-text">¥{{ formatNumber(record.amount) }}</span>
                </template>
              </a-table>
            </div>

            <!-- 账户信息明细 -->
            <div v-if="detailActiveTab === 'accounts'" class="detail-section">
              <div class="detail-header">
                <span class="detail-title">账户信息概览</span>
                <span class="detail-desc">客户在各金融产品的账户状态</span>
              </div>
              <a-table :columns="accountColumns" :data-source="detailData.accounts" :pagination="false" size="small" :bordered="false" class="table-borderless table-compact">
                <template #status="{ record }">
                  <a-tag :color="getAccountStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template #balance="{ record }">
                  <span class="amount-text">¥{{ formatNumber(record.balance) }}</span>
                </template>
              </a-table>
            </div>

            <!-- 产品使用明细 -->
            <div v-if="detailActiveTab === 'products'" class="detail-section">
              <div class="detail-header">
                <span class="detail-title">产品使用情况</span>
                <span class="detail-desc">客户使用的金融产品及使用频率</span>
              </div>
              <a-table :columns="productColumns" :data-source="detailData.products" :pagination="false" size="small" :bordered="false" class="table-borderless table-compact">
                <template #status="{ record }">
                  <a-tag :color="getProductStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template #usage="{ record }">
                  <div class="usage-bar">
                    <div class="usage-fill" :style="{ width: record.usageRate + '%' }"></div>
                    <span class="usage-text">{{ record.usageRate }}%</span>
                  </div>
                </template>
              </a-table>
            </div>

            <!-- 风险评估明细 -->
            <div v-if="detailActiveTab === 'risk'" class="detail-section">
              <div class="detail-header">
                <span class="detail-title">风险评估详情</span>
                <span class="detail-desc">客户的风险评估指标和历史变化</span>
              </div>
              <a-table :columns="riskColumns" :data-source="detailData.risks" :pagination="false" size="small" :bordered="false" class="table-borderless table-compact">
                <template #level="{ record }">
                  <a-tag :color="getRiskLevelColor(record.level)">{{ record.level }}</a-tag>
                </template>
                <template #score="{ record }">
                  <span class="score-text">{{ record.score }}</span>
                </template>
                <template #trend="{ record }">
                  <span :class="['trend-text', record.trend === '上升' ? 'trend-up' : record.trend === '下降' ? 'trend-down' : 'trend-stable']">
                    {{ record.trend }}
                  </span>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { safeInitECharts, safeDisposeChart } from '@/utils/echartsUtils'
import {
  IconHome,
  IconSettings,
  IconTag,
  IconEye,
  IconDashboard,
  IconBarChart,
  IconMore,
  IconPlus,
  IconDown,
  IconDelete,
  IconCheckCircle,
  IconExclamationCircle,
  IconInfoCircle,
  IconCopy,
  IconMinus,
  IconEdit,
  IconCheck,
  IconClose
} from '@arco-design/web-vue/es/icon'
import ConditionConfig from '@/components/common/ConditionConfig.vue'

const route = useRoute()
const router = useRouter()

// 当前选中的标签页
const activeTab = ref('age')

// 明细数据当前选中的标签页
const detailActiveTab = ref('transactions')

// 人群详情数据
const audienceDetail = reactive({
  id: 'AUD_20231019_001',
  name: '消费金融优质客户群体',
  type: 'custom',
  status: 'active',
  createMethod: 'rule',
  updateFrequency: '每日',
  validPeriod: '长期有效',
  shareLevel: 'public',
  createUser: '张力',
  description: '基于消费金融业务场景筛选的优质客户群体，包含信用评级良好、收入稳定、还款记录优秀的客户。'
})

// 人群统计数据
const audienceStats = reactive({
  totalCount: 156789,
  coverageRate: 12.5,
  activeCount: 142356,
  qualityScore: 95.8,
  updateTime: '2023-10-19 14:23:12',
  dataDate: '2023-10-19',
  // 消费金融相关统计
  avgCreditScore: 785,
  avgIncome: 125000,
  avgLoanAmount: 85000,
  defaultRate: 1.2
})

// 人群规则配置
const audienceRules = reactive({
  ruleType: 'custom',
  crossGroupLogic: 'and',
  estimatedCount: 156789,
  conditionGroups: [
    {
      id: 'group_1',
      name: '客户基本属性条件',
      logic: 'and',
      conditions: [
        {
          id: 'condition_1',
          dataSourceType: 'attribute',
          fieldName: '年龄',
          operator: 'between',
          value: '25,55',
          description: '年龄在25-55岁之间'
        },
        {
          id: 'condition_2',
          dataSourceType: 'attribute',
          fieldName: '月收入',
          operator: 'gte',
          value: '8000',
          description: '月收入不低于8000元'
        },
        {
          id: 'condition_3',
          dataSourceType: 'attribute',
          fieldName: '信用评级',
          operator: 'in',
          value: 'A,AA,AAA',
          description: '信用评级为A级及以上'
        }
      ]
    },
    {
      id: 'group_2',
      name: '职业与教育背景',
      logic: 'and',
      conditions: [
        {
          id: 'condition_4',
          dataSourceType: 'attribute',
          fieldName: '职业类型',
          operator: 'in',
          value: '公务员,教师,医生,工程师,金融从业者,企业管理者',
          description: '稳定职业类型'
        },
        {
          id: 'condition_5',
          dataSourceType: 'attribute',
          fieldName: '教育程度',
          operator: 'in',
          value: '本科,硕士,博士',
          description: '本科及以上学历'
        }
      ]
    },
    {
      id: 'group_3',
      name: '金融行为条件',
      logic: 'and',
      conditions: [
        {
          id: 'condition_6',
          dataSourceType: 'behavior',
          fieldName: '贷款申请次数',
          aggregationType: 'count',
          operator: 'lte',
          value: '3',
          dateType: 'dynamic',
          dynamicValue: 12,
          dynamicUnit: 'months',
          description: '近12个月贷款申请不超过3次'
        },
        {
          id: 'condition_7',
          dataSourceType: 'behavior',
          fieldName: '逾期次数',
          aggregationType: 'count',
          operator: 'eq',
          value: '0',
          dateType: 'dynamic',
          dynamicValue: 24,
          dynamicUnit: 'months',
          description: '近24个月无逾期记录'
        }
      ]
    },
    {
      id: 'group_4',
      name: '还款行为分析',
      logic: 'and',
      conditions: [
        {
          id: 'condition_8',
          dataSourceType: 'behavior',
          fieldName: '提前还款次数',
          aggregationType: 'count',
          operator: 'gte',
          value: '2',
          dateType: 'dynamic',
          dynamicValue: 12,
          dynamicUnit: 'months',
          description: '近12个月提前还款至少2次'
        },
        {
          id: 'condition_9',
          dataSourceType: 'behavior',
          fieldName: '按时还款率',
          aggregationType: 'avg',
          operator: 'gte',
          value: '95',
          dateType: 'dynamic',
          dynamicValue: 24,
          dynamicUnit: 'months',
          description: '近24个月按时还款率不低于95%'
        }
      ]
    },
    {
      id: 'group_5',
      name: '消费偏好特征',
      logic: 'or',
      conditions: [
        {
          id: 'condition_10',
          dataSourceType: 'behavior',
          fieldName: '月均消费金额',
          aggregationType: 'avg',
          operator: 'between',
          value: '3000,15000',
          dateType: 'dynamic',
          dynamicValue: 6,
          dynamicUnit: 'months',
          description: '近6个月月均消费3000-15000元'
        },
        {
          id: 'condition_11',
          dataSourceType: 'behavior',
          fieldName: '理财产品购买次数',
          aggregationType: 'count',
          operator: 'gte',
          value: '1',
          dateType: 'dynamic',
          dynamicValue: 12,
          dynamicUnit: 'months',
          description: '近12个月购买过理财产品'
        }
      ]
    },
    {
      id: 'group_6',
      name: '风险评估指标',
      logic: 'and',
      conditions: [
        {
          id: 'condition_12',
          dataSourceType: 'attribute',
          fieldName: '风险等级',
          operator: 'in',
          value: '低风险,中低风险',
          description: '风险等级为低风险或中低风险'
        },
        {
          id: 'condition_13',
          dataSourceType: 'behavior',
          fieldName: '账户活跃度',
          aggregationType: 'avg',
          operator: 'gte',
          value: '80',
          dateType: 'dynamic',
          dynamicValue: 3,
          dynamicUnit: 'months',
          description: '近3个月账户活跃度不低于80%'
        }
      ]
    }
  ]
})

// 数据分布数据
const distributionData = reactive({
  ageDistribution: [
    { name: '25-30', value: 25234 },
    { name: '31-35', value: 45678 },
    { name: '36-40', value: 38900 },
    { name: '41-45', value: 28456 },
    { name: '46-55', value: 18521 }
  ],
  incomeDistribution: [
    { name: '8K-12K', value: 32456 },
    { name: '12K-20K', value: 45678 },
    { name: '20K-30K', value: 38900 },
    { name: '30K-50K', value: 25234 },
    { name: '50K+', value: 14521 }
  ],
  creditRatingDistribution: [
    { name: 'AAA', value: 45678 },
    { name: 'AA', value: 67890 },
    { name: 'A', value: 43221 }
  ],
  occupationDistribution: [
    { name: '公务员', value: 23456 },
    { name: '教师', value: 18900 },
    { name: '医生', value: 15678 },
    { name: '工程师', value: 34567 },
    { name: '金融从业者', value: 28900 },
    { name: '企业管理者', value: 35288 }
  ],
  educationDistribution: [
    { name: '本科', value: 89234 },
    { name: '硕士', value: 55678 },
    { name: '博士', value: 11877 }
  ],
  loanAmountDistribution: [
    { name: '5万以下', value: 28456 },
    { name: '5-10万', value: 45678 },
    { name: '10-20万', value: 38900 },
    { name: '20-50万', value: 32234 },
    { name: '50万以上', value: 11521 }
  ],
  // 行为数据分布
  repaymentBehaviorDistribution: [
    { name: '提前还款', value: 89234 },
    { name: '按时还款', value: 55678 },
    { name: '延期还款', value: 8900 },
    { name: '逾期还款', value: 2977 }
  ],
  consumptionPreferenceDistribution: [
    { name: '日常消费', value: 67890 },
    { name: '投资理财', value: 45678 },
    { name: '教育培训', value: 23456 },
    { name: '旅游娱乐', value: 12345 },
    { name: '医疗健康', value: 7420 }
  ],
  riskLevelDistribution: [
    { name: '低风险', value: 89234 },
    { name: '中低风险', value: 45678 },
    { name: '中风险', value: 18900 },
    { name: '中高风险', value: 2977 }
  ],
  accountActivityDistribution: [
    { name: '90-100%', value: 78900 },
    { name: '80-90%', value: 45678 },
    { name: '70-80%', value: 23456 },
    { name: '60-70%', value: 6755 },
    { name: '60%以下', value: 2000 }
  ]
})

// 血缘查询相关
const lineageChartRef = ref(null)
let lineageChart = null

// 血缘关系数据
const lineageData = ref({
  name: '消费金融优质客户群体',
  category: 'audience',
  children: [
    {
      name: '客户基本属性标签',
      category: 'tag',
      children: [
        {
          name: '年龄',
          category: 'attribute',
          children: [
            {
              name: 'customer_info_table',
              category: 'table',
              value: '客户信息表'
            }
          ]
        },
        {
          name: '月收入',
          category: 'attribute',
          children: [
            {
              name: 'customer_income_table',
              category: 'table',
              value: '客户收入表'
            }
          ]
        },
        {
          name: '信用评级',
          category: 'attribute',
          children: [
            {
              name: 'credit_rating_table',
              category: 'table',
              value: '信用评级表'
            }
          ]
        }
      ]
    },
    {
      name: '职业教育标签',
      category: 'tag',
      children: [
        {
          name: '职业类型',
          category: 'attribute',
          children: [
            {
              name: 'customer_info_table',
              category: 'table',
              value: '客户信息表'
            }
          ]
        },
        {
          name: '教育程度',
          category: 'attribute',
          children: [
            {
              name: 'customer_info_table',
              category: 'table',
              value: '客户信息表'
            }
          ]
        }
      ]
    },
    {
      name: '金融行为标签',
      category: 'tag',
      children: [
        {
          name: '贷款申请次数',
          category: 'attribute',
          children: [
            {
              name: 'loan_application_table',
              category: 'table',
              value: '贷款申请表'
            }
          ]
        },
        {
          name: '逾期次数',
          category: 'attribute',
          children: [
            {
              name: 'repayment_record_table',
              category: 'table',
              value: '还款记录表'
            }
          ]
        },
        {
          name: '还款记录',
          category: 'attribute',
          children: [
            {
              name: 'repayment_record_table',
              category: 'table',
              value: '还款记录表'
            }
          ]
        }
      ]
    },
    {
      name: '风险评估标签',
      category: 'tag',
      children: [
        {
          name: '风险等级',
          category: 'attribute',
          children: [
            {
              name: 'risk_assessment_table',
              category: 'table',
              value: '风险评估表'
            }
          ]
        },
        {
          name: '违约概率',
          category: 'attribute',
          children: [
            {
              name: 'risk_model_table',
              category: 'table',
              value: '风险模型表'
            }
          ]
        }
      ]
    }
  ]
})

// 规则配置相关数据
const conditionGroups = ref([]) // 条件组数组
const estimatedCount = ref(12843) // 预估覆盖人数
const availabilityRate = ref(98.2) // 标签可用率
const crossGroupLogic = ref('or') // 跨条件组逻辑，默认为或
const configType = ref('tag') // 当前配置类型，默认为标签
const logicType = ref('and') // 标签逻辑关系，默认为且

// 数据源类型选项
const dataSourceTypeOptions = [
  { label: '明细数据', value: 'detail' },
  { label: '行为数据', value: 'behavior' },
  { label: '属性数据', value: 'attribute' }
]

// 日期类型选项
const dateTypeOptions = [
  { label: '动态日期', value: 'dynamic' },
  { label: '固定日期', value: 'fixed' },
  { label: '单个日期', value: 'single' }
]

// 动态日期单位选项
const dynamicUnitOptions = [
  { label: '天', value: 'days' },
  { label: '周', value: 'weeks' },
  { label: '月', value: 'months' },
  { label: '年', value: 'years' }
]



// 获取人群类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    custom: 'blue',
    imported: 'green',
    system: 'orange'
  }
  return colorMap[type] || 'gray'
}

// 获取人群类型文本
const getTypeText = (type) => {
  const textMap = {
    custom: '自定义人群',
    imported: '导入人群',
    system: '系统人群'
  }
  return textMap[type] || type
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    processing: 'orange',
    pending: 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '活跃',
    inactive: '停用',
    processing: '计算中',
    pending: '待处理'
  }
  return textMap[status] || status
}

// 获取创建方式文本
const getCreateMethodText = (method) => {
  const textMap = {
    rule: '规则创建',
    import: '数据导入',
    api: 'API接口'
  }
  return textMap[method] || method
}

// 获取规则类型文本
const getRuleTypeText = (type) => {
  const textMap = {
    custom: '自定义规则',
    template: '模板规则',
    imported: '导入规则'
  }
  return textMap[type] || type
}

// 获取规则复杂度
const getRuleComplexity = () => {
  const totalConditions = audienceRules.conditionGroups.reduce((sum, group) => {
    return sum + group.conditions.length
  }, 0)

  if (totalConditions <= 3) return '简单'
  if (totalConditions <= 8) return '中等'
  return '复杂'
}

// 获取共享级别颜色
const getShareLevelColor = (shareLevel) => {
  const colorMap = {
    public: 'green',
    private: 'orange'
  }
  return colorMap[shareLevel] || 'gray'
}

// 获取共享级别文本
const getShareLevelText = (shareLevel) => {
  const textMap = {
    public: '公开',
    private: '私有'
  }
  return textMap[shareLevel] || shareLevel
}

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString()
}

// 获取分布图表颜色
const getDistributionColor = (index) => {
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
  ]
  return colors[index % colors.length]
}

// 明细数据相关辅助函数
// 获取交易状态颜色
const getTransactionStatusColor = (status) => {
  const colorMap = {
    '成功': 'green',
    '失败': 'red',
    '处理中': 'orange',
    '待确认': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 获取账户状态颜色
const getAccountStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '冻结': 'red',
    '限制': 'orange',
    '注销': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取产品状态颜色
const getProductStatusColor = (status) => {
  const colorMap = {
    '已放款': 'green',
    '审批中': 'orange',
    '已拒绝': 'red',
    '持有中': 'blue',
    '已结清': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 获取风险等级颜色
const getRiskLevelColor = (level) => {
  const colorMap = {
    '低风险': 'green',
    '中低风险': 'lime',
    '中风险': 'orange',
    '中高风险': 'red',
    '高风险': 'magenta'
  }
  return colorMap[level] || 'gray'
}

// 明细数据表格列定义
const transactionColumns = [
  { title: '交易ID', dataIndex: 'transactionId', width: 120 },
  { title: '交易时间', dataIndex: 'transactionTime', width: 160 },
  { title: '交易类型', dataIndex: 'transactionType', width: 100 },
  { title: '交易金额', dataIndex: 'amount', width: 120 },
  { title: '交易状态', dataIndex: 'status', width: 100 },
  { title: '商户名称', dataIndex: 'merchantName', width: 150 },
  { title: '备注', dataIndex: 'remark', width: 200 }
]

const accountColumns = [
  { title: '账户ID', dataIndex: 'accountId', width: 120 },
  { title: '账户类型', dataIndex: 'accountType', width: 100 },
  { title: '开户时间', dataIndex: 'openTime', width: 160 },
  { title: '账户余额', dataIndex: 'balance', width: 120 },
  { title: '信用额度', dataIndex: 'creditLimit', width: 120 },
  { title: '账户状态', dataIndex: 'status', width: 100 },
  { title: '最后活跃时间', dataIndex: 'lastActiveTime', width: 160 }
]

const productColumns = [
  { title: '产品ID', dataIndex: 'productId', width: 120 },
  { title: '产品名称', dataIndex: 'productName', width: 150 },
  { title: '产品类型', dataIndex: 'productType', width: 100 },
  { title: '申请时间', dataIndex: 'applyTime', width: 160 },
  { title: '审批状态', dataIndex: 'approvalStatus', width: 100 },
  { title: '产品金额', dataIndex: 'amount', width: 120 },
  { title: '利率', dataIndex: 'interestRate', width: 80 },
  { title: '期限', dataIndex: 'term', width: 80 }
]

const riskColumns = [
  { title: '评估时间', dataIndex: 'assessmentTime', width: 160 },
  { title: '风险等级', dataIndex: 'riskLevel', width: 100 },
  { title: '风险分数', dataIndex: 'riskScore', width: 100 },
  { title: '评估模型', dataIndex: 'model', width: 120 },
  { title: '主要风险因子', dataIndex: 'riskFactors', width: 200 },
  { title: '建议措施', dataIndex: 'recommendation', width: 200 }
]

// 明细数据
const detailData = reactive({
  transactions: [
    {
      transactionId: 'TXN202401001',
      transactionTime: '2024-01-15 14:30:25',
      transactionType: '消费',
      amount: '¥2,580.00',
      status: '成功',
      merchantName: '京东商城',
      remark: '电子产品购买'
    },
    {
      transactionId: 'TXN202401002',
      transactionTime: '2024-01-14 09:15:42',
      transactionType: '还款',
      amount: '¥5,000.00',
      status: '成功',
      merchantName: '银行系统',
      remark: '信用卡还款'
    },
    {
      transactionId: 'TXN202401003',
      transactionTime: '2024-01-12 16:22:18',
      transactionType: '转账',
      amount: '¥1,200.00',
      status: '成功',
      merchantName: '支付宝',
      remark: '朋友转账'
    }
  ],
  accounts: [
    {
      accountId: 'ACC001',
      accountType: '储蓄账户',
      openTime: '2020-03-15 10:30:00',
      balance: '¥45,680.50',
      creditLimit: '-',
      status: '正常',
      lastActiveTime: '2024-01-15 14:30:25'
    },
    {
      accountId: 'ACC002',
      accountType: '信用卡',
      openTime: '2021-06-20 14:15:30',
      balance: '¥8,520.00',
      creditLimit: '¥50,000.00',
      status: '正常',
      lastActiveTime: '2024-01-14 09:15:42'
    }
  ],
  products: [
    {
      productId: 'PRD001',
      productName: '个人消费贷',
      productType: '贷款产品',
      applyTime: '2023-08-15 11:20:30',
      approvalStatus: '已放款',
      amount: '¥200,000.00',
      interestRate: '6.8%',
      term: '36个月'
    },
    {
      productId: 'PRD002',
      productName: '理财通',
      productType: '理财产品',
      applyTime: '2023-12-10 15:45:20',
      approvalStatus: '持有中',
      amount: '¥50,000.00',
      interestRate: '4.2%',
      term: '12个月'
    }
  ],
  risks: [
    {
      assessmentTime: '2024-01-01 00:00:00',
      riskLevel: '低风险',
      riskScore: '85',
      model: 'RiskModel_V2.1',
      riskFactors: '收入稳定，信用记录良好',
      recommendation: '可适当提高信用额度'
    },
    {
      assessmentTime: '2023-10-01 00:00:00',
      riskLevel: '中低风险',
      riskScore: '78',
      model: 'RiskModel_V2.0',
      riskFactors: '负债率略高，但还款能力强',
      recommendation: '保持现有额度，关注负债变化'
    }
  ]
})

// 血缘图表相关方法
// 初始化血缘图表
const initLineageChart = async () => {
  if (!lineageChartRef.value) return

  try {
    lineageChart = await safeInitECharts(lineageChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: function (params) {
        const data = params.data
        let content = `<div style="padding: 8px;">`
        content += `<div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>`

        if (data.category === 'audience') {
          content += `<div style="color: #666;">类型: 人群</div>`
          content += `<div style="color: #666;">规模: ${formatNumber(audienceStats.totalCount)}</div>`
          content += `<div style="color: #666;">更新时间: ${new Date(audienceStats.updateTime).toLocaleString()}</div>`
        } else if (data.category === 'tag') {
          content += `<div style="color: #666;">类型: 标签</div>`
          content += `<div style="color: #666;">最后更新: ${data.tagUpdatedTime || '无记录'}</div>`
        } else if (data.category === 'attribute') {
          content += `<div style="color: #666;">类型: 属性</div>`
          content += `<div style="color: #666;">同步时间: ${data.lastSynced || '未同步'}</div>`
          content += `<div style="color: #666;margin-top:4px;">更新时间: ${new Date(data.audienceStats?.updateTime || data.updatedAt).toLocaleString()}</div>`
        } else if (data.category === 'table') {
          content += `<div style="color: #666;">类型: 数据表</div>`
          content += `<div style="color: #666;">表名: ${data.value || data.name}</div>`
          content += `<div style="color: #666;">分区更新: ${data.partitionTime || '无分区'}</div>`
          content += `<div style="color: #666;margin-top:4px;">最后更新: ${new Date(data.tableUpdatedAt).toLocaleString()}</div>`
        }

        content += `</div>`
        return content
      }
    },
    series: [
      {
        type: 'tree',
        data: [lineageData.value],
        top: '5%',
        left: '15%',
        bottom: '5%',
        right: '15%',
        symbolSize: 12,
        orient: 'LR',
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12,
          color: '#333',
          formatter: function (params) {
            return params.data.name
          }
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
        itemStyle: {
          color: function (params) {
            const colorMap = {
              'audience': '#1890ff',
              'tag': '#52c41a',
              'attribute': '#faad14',
              'table': '#f5222d'
            }
            return colorMap[params.data.category] || '#666'
          },
          borderColor: '#fff',
          borderWidth: 2
        },
        lineStyle: {
          color: '#ccc',
          width: 1.5,
          curveness: 0.3
        }
      }
    ]
  }

    lineageChart.setOption(option)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (lineageChart) {
        lineageChart.resize()
      }
    })
  } catch (error) {
    console.error('初始化血缘图表失败:', error)
  }
}

// 监听 activeTab 变化，初始化血缘图表
watch(activeTab, async (newTab) => {
  if (newTab === 'lineage') {
    await nextTick()
    initLineageChart()
  }
})

// 规则配置相关方法

// 生成唯一ID
const generateId = () => {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 添加条件组
const addConditionGroup = () => {
  const currentTagValue = getCurrentTagValue()
  if (currentTagValue) {
    const newGroup = {
      id: generateId(),
      name: `条件组${currentTagValue.conditionGroups.length + 1}`,
      collapsed: false,
      logic: 'and', // 默认为且逻辑
      conditions: []
    }
    currentTagValue.conditionGroups.push(newGroup)
    return newGroup
  }
}

// 复制条件组
const duplicateGroup = (group) => {
  const newGroup = {
    ...group,
    id: generateId(),
    name: group.name + ' 副本',
    logic: group.logic || 'and',
    conditions: group.conditions.map(condition => ({
      ...condition,
      id: generateId()
    }))
  }
  conditionGroups.value.push(newGroup)
}


// 删除条件组
const removeGroup = (groupIndex) => {
  conditionGroups.value.splice(groupIndex, 1)
}

// 删除条件组
const deleteConditionGroup = (groupIndex) => {
  const currentTagValue = getCurrentTagValue()
  if (currentTagValue) {
    currentTagValue.conditionGroups.splice(groupIndex, 1)
  }
}

// 切换条件组内的逻辑关系
const toggleGroupLogic = (group) => {
  group.logic = group.logic === 'and' ? 'or' : 'and'
}

// 人群管理相关方法
// 刷新人群数据
const refreshAudience = async () => {
  try {
    // 这里可以添加刷新人群的API调用
    console.log('刷新人群数据:', audienceDetail.id)
    // 模拟刷新成功
    audienceStats.updateTime = new Date().toLocaleString()
  } catch (error) {
    console.error('刷新人群失败:', error)
  }
}

// 导出人群数据
const exportAudience = () => {
  const exportData = {
    audienceId: audienceDetail.id,
    audienceName: audienceDetail.name,
    totalCount: audienceStats.totalCount,
    rules: audienceRules,
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audience-${audienceDetail.name || 'unnamed'}-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 编辑人群
const editAudience = () => {
  router.push({
    name: 'AudienceCreate',
    params: { id: audienceDetail.id },
    query: { mode: 'edit' }
  })
}

// 返回人群管理页面
const goBack = () => {
  router.push({ name: 'AudienceManagement' })
}

// 添加条件
const addCondition = (group) => {
  const newCondition = {
    id: generateId(),
    dataSourceType: 'detail',
    fieldName: '',
    aggregationType: 'sum',
    operator: 'gt',
    value: '',
    dateType: 'dynamic',
    dynamicValue: 7,
    dynamicUnit: 'days',
    dateRange: null,
    singleDate: null,
    isExclude: false,
    enableSequence: false,
    sequenceSteps: []
  }
  group.conditions.push(newCondition)
}

// 根据类型添加条件
const addConditionByType = (group, type) => {
  const typeMapping = {
    'tag': 'attribute',
    'behavior': 'behavior',
    'detail': 'detail',
    'user': 'attribute'
  }

  const dataSourceType = typeMapping[type] || 'detail'

  const newCondition = {
    id: generateId(),
    dataSourceType: dataSourceType,
    fieldName: '',
    aggregationType: getDefaultAggregationType(dataSourceType),
    operator: getDefaultOperator(dataSourceType),
    value: '',
    dateType: dataSourceType === 'attribute' ? null : 'dynamic',
    dynamicValue: 7,
    dynamicUnit: 'days',
    dateRange: null,
    singleDate: null,
    isExclude: false,
    enableSequence: false,
    sequenceSteps: []
  }
  group.conditions.push(newCondition)
}

// 添加排除条件
const addExcludeCondition = (group) => {
  const newCondition = {
    id: generateId(),
    dataSourceType: 'detail',
    fieldName: '',
    aggregationType: 'sum',
    operator: 'gt',
    value: '',
    dateType: 'dynamic',
    dynamicValue: 7,
    dynamicUnit: 'days',
    dateRange: null,
    singleDate: null,
    isExclude: true,
    enableSequence: false,
    sequenceSteps: []
  }
  group.conditions.push(newCondition)
}

// 复制条件
const duplicateCondition = (group, condition) => {
  const newCondition = {
    ...condition,
    id: generateId()
  }
  group.conditions.push(newCondition)
}

// 切换排除条件
const toggleExcludeCondition = (condition) => {
  condition.isExclude = !condition.isExclude
}

// 清空画布
const clearCanvas = () => {
  conditionGroups.value = []
  estimatedCount.value = 0
}

// 导出规则
const exportRules = () => {
  const rules = {
    tagId: route.params.id,
    tagName: tagDetail.name,
    logic: 'or', // 条件组间固定为OR关系
    conditionGroups: conditionGroups.value.map(group => ({
      id: group.id,
      name: group.name,
      logic: group.logic,
      conditions: group.conditions.map(condition => ({
        id: condition.id,
        dataSourceType: condition.dataSourceType,
        fieldName: condition.fieldName,
        aggregationType: condition.aggregationType,
        operator: condition.operator,
        value: condition.value,
        dateType: condition.dateType,
        dateRange: condition.dateRange,
        dynamicValue: condition.dynamicValue,
        dynamicUnit: condition.dynamicUnit,
        isExclude: condition.isExclude
      }))
    })),
    estimatedCount: estimatedCount.value,
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tag-rules-${tagDetail.name || 'unnamed'}-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 编辑条件组名称
const editGroupName = (group) => {
  // 这里可以弹出编辑对话框
  const newName = prompt('请输入新的条件组名称:', group.name)
  if (newName && newName.trim()) {
    group.name = newName.trim()
  }
}

// 删除条件
const removeCondition = (group, conditionIndex) => {
  group.conditions.splice(conditionIndex, 1)

  // 如果条件组为空，可以选择删除条件组
  if (group.conditions.length === 0) {
    // 这里可以提示用户是否删除空的条件组
  }
}



// 数据源类型变化处理
const onDataSourceTypeChange = (condition) => {
  // 重置相关字段
  condition.aggregationType = getDefaultAggregationType(condition.dataSourceType)
  condition.operator = getDefaultOperator(condition.dataSourceType)
  condition.value = ''

  // 属性数据不需要日期范围
  if (condition.dataSourceType === 'attribute') {
    condition.dateType = null
  } else if (!condition.dateType) {
    condition.dateType = 'dynamic'
    condition.dynamicValue = 7
    condition.dynamicUnit = 'days'
  }
}

// 日期类型变化处理
const onDateTypeChange = (condition) => {
  // 重置日期相关字段
  condition.dateRange = null
  condition.singleDate = null
  condition.dynamicValue = 7
  condition.dynamicUnit = 'days'
}

// 配置行为路径
const configureSequence = (condition) => {
  // 这里可以打开行为路径配置对话框
  console.log('配置行为路径:', condition)
}

// 获取聚合类型选项
const getAggregationOptions = (dataSourceType) => {
  if (dataSourceType === 'detail') {
    return [
      { label: '求和', value: 'sum' },
      { label: '平均值', value: 'avg' },
      { label: '最大值', value: 'max' },
      { label: '最小值', value: 'min' },
      { label: '去重计数', value: 'distinct_count' },
      { label: '计数', value: 'count' }
    ]
  } else if (dataSourceType === 'behavior') {
    return [
      { label: '次数', value: 'count' },
      { label: '天数', value: 'days' },
      { label: '连续天数', value: 'consecutive_days' },
      { label: '去重计数', value: 'distinct_count' }
    ]
  }
  return []
}

// 获取默认聚合类型
const getDefaultAggregationType = (dataSourceType) => {
  if (dataSourceType === 'detail') {
    return 'sum'
  } else if (dataSourceType === 'behavior') {
    return 'count'
  }
  return null
}

// 获取默认操作符
const getDefaultOperator = (dataSourceType) => {
  if (dataSourceType === 'detail' || dataSourceType === 'behavior') {
    return 'gt'
  } else if (dataSourceType === 'attribute') {
    return 'eq'
  }
  return 'eq'
}

// 获取操作符选项
const getOperatorOptions = (condition) => {
  const commonOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' }
  ]

  const numericOptions = [
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' }
  ]

  const stringOptions = [
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '开始于', value: 'starts_with' },
    { label: '结束于', value: 'ends_with' }
  ]

  const existsOptions = [
    { label: '存在', value: 'exists' },
    { label: '不存在', value: 'not_exists' }
  ]

  if (condition.dataSourceType === 'detail' || condition.dataSourceType === 'behavior') {
    return [...commonOptions, ...numericOptions, ...existsOptions]
  } else if (condition.dataSourceType === 'attribute') {
    return [...commonOptions, ...stringOptions, ...existsOptions]
  }

  return commonOptions
}

// 是否需要值输入
const needValueInput = (condition) => {
  return condition.operator !== 'exists' && condition.operator !== 'not_exists'
}

// 获取值输入提示
const getValuePlaceholder = (condition) => {
  if (condition.dataSourceType === 'detail') {
    if (condition.aggregationType === 'sum' || condition.aggregationType === 'avg') {
      return '请输入金额'
    } else if (condition.aggregationType === 'count' || condition.aggregationType === 'distinct_count') {
      return '请输入数量'
    }
    return '请输入数值'
  } else if (condition.dataSourceType === 'behavior') {
    if (condition.aggregationType === 'count') {
      return '请输入次数'
    } else if (condition.aggregationType === 'days' || condition.aggregationType === 'consecutive_days') {
      return '请输入天数'
    }
    return '请输入数值'
  } else if (condition.dataSourceType === 'attribute') {
    return '请输入属性值'
  }
  return '请输入值'
}

// 获取字段选项
const getFieldOptions = (dataSourceType) => {
  if (dataSourceType === 'detail') {
    return [
      { label: '交易金额', value: 'transaction_amount' },
      { label: '交易笔数', value: 'transaction_count' },
      { label: '商品数量', value: 'product_quantity' },
      { label: '优惠金额', value: 'discount_amount' }
    ]
  } else if (dataSourceType === 'behavior') {
    return [
      { label: '页面访问', value: 'page_view' },
      { label: '商品点击', value: 'product_click' },
      { label: '加购行为', value: 'add_to_cart' },
      { label: '下单行为', value: 'place_order' },
      { label: '支付行为', value: 'payment' }
    ]
  } else if (dataSourceType === 'attribute') {
    return [
      { label: '性别', value: 'gender' },
      { label: '年龄', value: 'age' },
      { label: '城市', value: 'city' },
      { label: '职业', value: 'occupation' },
      { label: '会员等级', value: 'member_level' }
    ]
  }
  return []
}



// 组件挂载时获取标签详情
onMounted(() => {
  const tagId = route.params.id
  if (tagId) {
    // 这里可以根据tagId获取具体的标签详情
    console.log('获取标签详情:', tagId)
  }
})


</script>

<style scoped>
.audience-detail {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
}

.breadcrumb {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 6px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: #1d2129;
}

.audience-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.audience-id {
  color: #86909c;
  font-size: 14px;
}

.audience-name {
  color: #1d2129;
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.content-section {
  margin-bottom: 16px;
}

.info-card,
.subject-card {
  border-radius: 6px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 32px;
}

.info-row.full-width {
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.info-item .label {
  color: #86909c;
  margin-right: 8px;
  min-width: 80px;
}

.info-item .value {
  color: #1d2129;
}

.info-item .description {
  line-height: 1.6;
  text-align: justify;
}

.subject-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.subject-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8f4ff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e8f4ff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
  border-color: #165dff;
}

.stat-label {
  color: #86909c;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #1d2129;
  font-size: 20px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.stat-value.primary {
  color: #165dff;
  font-size: 24px;
}

.stat-value.success {
  color: #00b42a;
}

.stat-value.warning {
  color: #ff7d00;
}

.stat-value.danger {
  color: #f53f3f;
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-tabs {
  display: flex;
  justify-content: flex-start;
}

.chart-content {
  min-height: 300px;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.total-count {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8f4ff 100%);
  border-radius: 8px;
  border: 1px solid #e8f4ff;
}

.count-number {
  font-size: 36px;
  font-weight: 700;
  color: #165dff;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.count-label {
  font-size: 18px;
  color: #1d2129;
  font-weight: 600;
}

.count-desc {
  font-size: 14px;
  color: #86909c;
  margin-left: 16px;
  font-style: italic;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.bar-item:hover {
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
  border-color: #165dff;
}

.bar-label {
  min-width: 120px;
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  height: 24px;
  background-color: #f2f3f5;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.bar-value {
  min-width: 60px;
  text-align: right;
  font-size: 14px;
  color: #1d2129;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.trend-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.trend-placeholder {
  color: #86909c;
  font-size: 16px;
}

/* 规则配置区域样式 */
.rule-config-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.logic-switch {
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f2f3f5 100%);
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logic-label {
  font-size: 14px;
  color: #86909c;
}

.rule-config-content {
  padding: 24px;
}

/* 条件配置区域样式 */
.conditions-workspace {
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.tag-values-management .section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.tag-values-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-value-item {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag-value-item:hover {
  border-color: #165dff;
  background: #f2f7ff;
}

.tag-value-item.active {
  border-color: #165dff;
  background: #e8f4ff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

.tag-value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.tag-value-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-value-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.tag-value-desc {
  font-size: 12px;
  color: #86909c;
}

.tag-value-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #86909c;
  text-align: center;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

/* 标签值配置区域 */
.tag-value-config-section {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.config-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.condition-groups-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.condition-groups-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.condition-groups-section .section-header .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.condition-groups-section .section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-groups-section .condition-count {
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 配置选项卡样式 */
.config-tabs {
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

/* 标签值配置样式 */
.tag-value-config {
  padding: 16px 0;
}

.config-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.config-item {
  flex: 1;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.config-input {
  width: 100%;
}

/* 规则配置头部 */
.rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f2f3f5 100%);
  border-radius: 12px;
  border: 1px solid #e5e6eb;
}

.rule-summary {
  display: flex;
  align-items: center;
  gap: 32px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logic-flow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logic-text {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.logic-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logic-badge.or {
  background: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc80;
}

.estimated-result {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.result-count {
  font-size: 18px;
  font-weight: 600;
  color: #00b42a;
}

.result-unit {
  font-size: 12px;
  color: #86909c;
}

.rule-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 条件组工作区 */
.conditions-workspace {
  min-height: 300px;
}

/* 空状态样式 */
.empty-workspace {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px 20px;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f2f3f5 0%, #e5e6eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-illustration .arco-icon {
  font-size: 32px;
  color: #86909c;
}

.empty-content {
  max-width: 400px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

/* 条件组工作区 */
.condition-groups-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workspace-container {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding-left: 60px;
}

/* 垂直逻辑连接线 */
.vertical-logic-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.logic-line-vertical {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 3px;
  background: linear-gradient(to bottom, transparent 0%, #e8f4ff 20%, #1890ff 50%, #e8f4ff 80%, transparent 100%);
  border-radius: 2px;
  transform: translateX(-50%);
}

.vertical-logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 2px solid #1890ff;
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 2;
  transition: all 0.2s ease;
  cursor: pointer;
}

.vertical-logic-indicator:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.vertical-logic-indicator.and {
  border-color: #52c41a;
  background: #f6ffed;
}

.vertical-logic-indicator.and .vertical-logic-text {
  color: #52c41a;
}

.vertical-logic-indicator.or {
  border-color: #fa8c16;
  background: #fff7e6;
}

.vertical-logic-indicator.or .vertical-logic-text {
  color: #fa8c16;
}

.vertical-logic-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

/* 条件配置区域 */
.conditions-config-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 配置类型选择器 */
.config-type-selector {
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.config-type-tabs {
  display: flex;
  gap: 8px;
}

.config-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: white;
  color: #86909c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-tab:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #f8faff;
}

.config-tab.active {
  border-color: #1890ff;
  background: #1890ff;
  color: white;
}

.config-tab.active:hover {
  background: #1890ff;
}

/* 条件组列表 */
.condition-groups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.condition-group-card {
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.condition-group-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #d4edda;
}







/* 条件列表样式 */
.conditions-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

/* 组逻辑连接线 */
.group-logic-line {
  position: absolute;
  left: 44px;
  top: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logic-line {
  width: 3px;
  flex: 1;
  background: linear-gradient(to bottom, #e8f4ff 0%, #fff7e6 50%, #e8f4ff 100%);
  border-radius: 2px;
  position: relative;
}

.logic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 2px solid #e5e6eb;
  border-radius: 20px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
  transition: all 0.2s ease;
}

.logic-indicator.clickable {
  cursor: pointer;
}

.logic-indicator.clickable:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logic-indicator.and {
  border-color: #1890ff;
  background: #e8f4ff;
}

.logic-indicator.and .logic-text {
  color: #1890ff;
  font-weight: 600;
}

.logic-indicator.or {
  border-color: #ff7d00;
  background: #fff7e6;
}

.logic-indicator.or .logic-text {
  color: #ff7d00;
  font-weight: 600;
}



.logic-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.condition-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 3;
}

.condition-item.excluded {
  opacity: 0.7;
}

.condition-item.excluded .condition-config {
  background: #fff2f0;
  border-left: 3px solid #ff4d4f;
}

/* 简化的条件连接器 */
.condition-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding-top: 8px;
}

.condition-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 3px solid #165dff;
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
  position: relative;
  z-index: 4;
}

/* 条件配置区域 */
.condition-config {
  flex: 1;
  background: white;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.condition-config:hover {
  border-color: #d4edda;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.exclude-indicator {
  margin-bottom: 12px;
}

.exclude-label {
  display: inline-block;
  padding: 4px 8px;
  background: #fff2f0;
  color: #ff4d4f;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 条件配置表单 */
.condition-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.form-row.primary {
  border-bottom: 1px solid #f2f3f5;
  padding-bottom: 12px;
}

.form-row.secondary {
  padding-top: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.form-group.wide {
  min-width: 200px;
}

.form-group.dynamic-time {
  min-width: 240px;
}

.form-label {
  font-size: 12px;
  color: #86909c;
  font-weight: 500;
  white-space: nowrap;
}

.form-control {
  min-width: 120px;
}

.form-control.wide {
  min-width: 180px;
}

.dynamic-time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dynamic-prefix {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
}

.dynamic-value {
  width: 60px;
}

.dynamic-unit {
  width: 60px;
}

/* 条件操作按钮 */
.condition-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e6eb;
  background: white;
  color: #86909c;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  border-color: #165dff;
  color: #165dff;
  background: #f2f3ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.2);
}

.action-btn.exclude-active {
  background: #fff7e6;
  border-color: #ff7d00;
  color: #ff7d00;
}

.action-btn.exclude-active:hover {
  background: #fff3e0;
  border-color: #f57c00;
  color: #f57c00;
}

.action-btn.danger {
  border-color: #ffccc7;
  color: #ff4d4f;
}

.action-btn.danger:hover {
  background: #fff2f0;
  border-color: #ff4d4f;
  color: #cb272d;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.2);
}

/* 添加条件区域 */
.add-condition-area {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px dashed #e5e6eb;
  margin-top: 8px;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.add-condition-btn {
  border: 1px dashed #d4edda;
  background: #f6ffed;
  color: #52c41a;
  transition: all 0.3s ease;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  min-width: 90px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.add-condition-btn:hover {
  border-color: #52c41a;
  background: #f6ffed;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(82, 196, 26, 0.2);
  color: #389e0d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
}

/* 条件组间分隔器 */
.group-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}

.separator-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e6eb, transparent);
}

/* 添加条件组区域 */
.add-condition-group-area {
  display: flex;
  justify-content: flex-start;
  padding: 20px 0;
  margin-top: 16px;
  border-top: 1px dashed #e5e6eb;
}

.add-condition-group-area .add-condition-group-btn {
  border: 1px dashed #d4edda;
  background: #f6ffed;
  color: #52c41a;
  transition: all 0.3s ease;
  padding: 8px 16px;
  font-weight: 500;
}

.add-condition-group-area .add-condition-group-btn:hover {
  border-color: #52c41a;
  background: #f6ffed;
  color: #389e0d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
}

/* 危险操作样式 */
.danger {
  color: #f53f3f !important;
}

.danger:hover {
  background: #fff2f0 !important;
}

/* 可点击逻辑连接器样式 */
.logic-connector {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  z-index: 2;
}

.logic-connector.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.logic-connector.clickable:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #f6ffed;
}

/* 条件组标题样式 */
.condition-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 6px 6px 0 0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.group-count {
  color: #666;
  font-size: 12px;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 删除条件组按钮样式 */
.delete-group-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #86909c;
  transition: all 0.2s ease;
}

.delete-group-btn:hover {
  color: #ff4d4f;
  background: #fff2f0;
}

/* 折叠按钮样式 */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* 标签值条件配置样式 */
.tag-value-conditions {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-count {
  font-size: 12px;
  color: #86909c;
}

/* 编辑控制区域样式 */
.edit-control-area {
  margin: 16px 0;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
}

.edit-actions {
  display: flex;
  justify-content: center;
}

.edit-btn {
  min-width: 120px;
}

.edit-mode-actions {
  display: flex;
  gap: 12px;
}

.save-btn {
  min-width: 100px;
}

.cancel-btn {
  min-width: 100px;
}

/* 禁用状态样式 */
.vertical-logic-indicator:not(.clickable) {
  cursor: default;
  opacity: 0.6;
}

.logic-indicator:not(.clickable) {
  cursor: default;
  opacity: 0.6;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 血缘查询样式 */
.lineage-chart {
  padding: 16px 0;
}

.lineage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0 16px;
}

.lineage-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.title-desc {
  font-size: 12px;
  color: #86909c;
}

.lineage-legend {
  display: flex;
  gap: 16px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.legend-color.audience {
  background-color: #1890ff;
}

.legend-color.tag {
  background-color: #52c41a;
}

.legend-color.attribute {
  background-color: #faad14;
}

.legend-color.table {
  background-color: #f5222d;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

.lineage-chart-container {
  width: 100%;
  height: 500px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
  overflow: auto;
}

/* 趋势分析占位样式 */
.trend-chart {
  padding: 16px;
}

.trend-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
  color: #6c757d;
  font-size: 14px;
}

/* 消费金融明细数据样式优化 */
.detail-data-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.detail-data-content {
  padding: 24px;
}

.detail-tabs {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8eaed;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8eaed;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.detail-desc {
  font-size: 12px;
  color: #86909c;
  margin: 0;
}

.amount-text {
  font-weight: 600;
  color: #165dff;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.score-text {
  font-weight: 600;
  color: #00b42a;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.usage-bar {
  position: relative;
  width: 100px;
  height: 20px;
  background: #f2f3f5;
  border-radius: 10px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b42a 0%, #52c41a 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.usage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.trend-text {
  font-weight: 500;
  font-size: 12px;
}

.trend-up {
  color: #f53f3f;
}

.trend-down {
  color: #00b42a;
}

.trend-stable {
  color: #86909c;
}
</style>