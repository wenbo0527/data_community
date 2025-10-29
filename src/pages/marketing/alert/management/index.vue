<template>
  <div class="alert-management-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">预警管理</h1>
      <p class="page-description">实时监控系统预警状态，管理预警规则配置</p>
    </div>

    <!-- 仪表板式布局 -->
    <div class="dashboard-layout">
      <!-- 预警概览仪表板 -->
      <div class="dashboard-section overview-section">
        <OverviewDashboard
          :overview-data="overviewData"
          :loading="overviewLoading"
          @refresh="handleRefreshOverview"
        />
      </div>

      <!-- 最近预警时间线 -->
      <div class="dashboard-section timeline-section">
        <RecentAlertTimeline
          :alerts="recentAlerts"
          :loading="timelineLoading"
          @process-alert="handleProcessAlert"
          @view-detail="handleViewAlertDetail"
          @resolve-alert="handleResolveAlert"
          @load-more="handleLoadMoreAlerts"
          @view-all-history="handleViewAllHistory"
        />
      </div>

      <!-- 规则管理区域 - 只显示激活的预警规则 -->
      <div class="dashboard-section rules-section">
        <RuleManagement
          :rules="activeAlertRules"
          :loading="rulesLoading"
          @add-rule="handleAddRule"
          @edit-rule="handleEditRule"
          @delete-rule="handleDeleteRule"
          @toggle-rule="handleToggleRule"
          @copy-rule="handleCopyRule"
          @batch-enable="handleBatchEnable"
          @batch-disable="handleBatchDisable"
          @batch-delete="handleBatchDelete"
          @rule-click="handleRuleClick"
        />
      </div>
    </div>

    <!-- 预警历史抽屉 -->
    <AlertHistoryDrawer
      v-model:visible="historyDrawerVisible"
      @alert-click="handleViewAlertDetail"
      @process-alert="handleProcessAlert"
      @view-detail="handleViewAlertDetail"
      @resolve-alert="handleResolveAlert"
    />

    <!-- 预警详情模态框 -->
    <a-modal
      v-model:visible="alertDetailVisible"
      title="预警详情"
      :width="600"
      :footer="false"
    >
      <div v-if="currentAlertDetail" class="alert-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="预警时间">
              {{ currentAlertDetail.alert_time }}
            </a-descriptions-item>
            <a-descriptions-item label="预警类型">
              <a-tag :color="currentAlertDetail.alert_type === 'inventory' ? 'blue' : currentAlertDetail.alert_type === 'expiry' ? 'orange' : 'red'">
                {{ currentAlertDetail.alert_type === 'inventory' ? '库存预警' : currentAlertDetail.alert_type === 'expiry' ? '过期预警' : '失败率预警' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="触发规则">
              <a-button
                type="text"
                size="mini"
                @click="handleViewRuleDetail(currentAlertDetail.rule_id)"
              >
                {{ currentAlertDetail.rule_name }}
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="预警内容" :span="2">
              <div class="alert-message">
                {{ currentAlertDetail.message }}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 通知渠道 -->
        <div class="detail-section">
          <h4>通知渠道</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="规则名称">
              {{ currentAlertDetail.rule_name }}
            </a-descriptions-item>
            <a-descriptions-item label="监控类型">
              <a-tag :color="currentAlertDetail.alert_type === 'inventory' ? 'blue' : currentAlertDetail.alert_type === 'expiry' ? 'orange' : 'red'">
                {{ currentAlertDetail.alert_type === 'inventory' ? '库存预警' : currentAlertDetail.alert_type === 'expiry' ? '过期预警' : '失败率预警' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag color="green">已发送</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ currentAlertDetail.alert_time }}
            </a-descriptions-item>
            <a-descriptions-item label="规则描述" :span="2">
              {{ currentAlertDetail.description || '暂无描述' }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 条件详情 -->
          <div v-if="currentAlertDetail.alert_type === 'inventory'" class="condition-detail">
            <h5>库存监控条件</h5>
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="库存阈值">
                {{ currentAlertDetail.threshold || '100' }}
                {{ currentAlertDetail.thresholdType === 'percentage' ? '%' : '张' }}
              </a-descriptions-item>
              <a-descriptions-item label="阈值类型">
                {{ currentAlertDetail.thresholdType === 'percentage' ? '百分比' : '绝对数量' }}
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                当库存低于设定阈值时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <div v-else-if="currentAlertDetail.alert_type === 'expiry'" class="condition-detail">
            <h5>过期监控条件</h5>
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="提前预警天数">
                {{ currentAlertDetail.advanceDays || '7' }} 天
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                优惠券即将在指定天数内过期时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <div v-else-if="currentAlertDetail.alert_type === 'failure'" class="condition-detail">
            <h5>失败率监控条件</h5>
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="失败率阈值">
                {{ currentAlertDetail.failureRate || '10' }}%
              </a-descriptions-item>
              <a-descriptions-item label="时间窗口">
                {{ currentAlertDetail.timeWindow || '30' }} 分钟
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                在指定时间窗口内失败率超过阈值时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 通知渠道信息 -->
          <div class="channels-section">
            <h5>通知渠道</h5>
            <div class="channels-list">
              <div
                v-for="channel in currentAlertDetail.channels || ['email', 'sms']"
                :key="channel"
                class="channel-item"
              >
                <a-tag :color="channel === 'email' ? 'blue' : channel === 'sms' ? 'green' : 'orange'" size="large">
                  {{ channel === 'email' ? '邮件' : channel === 'sms' ? '短信' : '微信' }}
                </a-tag>
              </div>
            </div>
            <div class="channels-description">
              <p>预警信息已通过以上渠道发送给相关人员</p>
            </div>
          </div>

          <!-- 触发原因分析 -->
          <div class="analysis-section">
            <h5>触发原因分析</h5>
            <a-alert
              type="warning"
              title="预警触发分析"
              show-icon
            >
              <div class="analysis-description">{{ currentAlertDetail.message }}</div>
              <div class="analysis-suggestion">
                <strong>建议：</strong>请及时处理相关问题，避免影响业务正常运行
              </div>
            </a-alert>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 规则详情模态框 -->
    <a-modal
      v-model:visible="ruleDetailVisible"
      title="规则详情"
      :width="600"
      :footer="false"
    >
      <div v-if="currentRuleDetail" class="rule-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="规则名称">
              {{ currentRuleDetail.name }}
            </a-descriptions-item>
            <a-descriptions-item label="监控类型">
              <a-tag :color="getTypeColor(currentRuleDetail.type)">
                {{ getTypeText(currentRuleDetail.type) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="currentRuleDetail.status === 'active' ? 'green' : 'gray'">
                {{ currentRuleDetail.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatDetailTime(currentRuleDetail.created_at) }}
            </a-descriptions-item>
            <a-descriptions-item label="规则描述" :span="2">
              {{ currentRuleDetail.description || '暂无描述' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 监控条件 -->
        <div class="detail-section">
          <h4>监控条件</h4>
          <div v-if="currentRuleDetail.type === 'inventory'" class="condition-detail">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="库存阈值">
                {{ currentRuleDetail.conditions?.threshold }}
                {{ currentRuleDetail.conditions?.thresholdType === 'percentage' ? '%' : '张' }}
              </a-descriptions-item>
              <a-descriptions-item label="阈值类型">
                {{ currentRuleDetail.conditions?.thresholdType === 'percentage' ? '百分比' : '绝对数量' }}
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                当库存低于设定阈值时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <div v-else-if="currentRuleDetail.type === 'expiry'" class="condition-detail">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="提前预警天数">
                {{ currentRuleDetail.conditions?.advanceDays }} 天
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                优惠券即将在指定天数内过期时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <div v-else-if="currentRuleDetail.type === 'failure'" class="condition-detail">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="失败率阈值">
                {{ currentRuleDetail.conditions?.failureRate }}%
              </a-descriptions-item>
              <a-descriptions-item label="时间窗口">
                {{ currentRuleDetail.conditions?.timeWindow }} 分钟
              </a-descriptions-item>
              <a-descriptions-item label="触发条件" :span="2">
                在指定时间窗口内失败率超过阈值时触发预警
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="detail-section">
          <h4>通知设置</h4>
          <div class="channels-list">
            <div
              v-for="channel in currentRuleDetail.channels"
              :key="channel"
              class="channel-item"
            >
              <a-tag :color="getChannelColor(channel)" size="large">
                <template #icon>
                  <component :is="getChannelIcon(channel)" />
                </template>
                {{ getChannelText(channel) }}
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="handleEditRuleFromDetail">
              编辑规则
            </a-button>
            <a-button @click="ruleDetailVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 新建/编辑规则模态框 -->
    <a-modal
      v-model:visible="ruleModalVisible"
      :title="isEditingRule ? '编辑规则' : '新建规则'"
      :width="700"
      @ok="handleRuleSubmit"
      @cancel="handleRuleCancel"
    >
      <a-form :model="ruleFormData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="规则名称" required>
              <a-input
                v-model="ruleFormData.name"
                placeholder="请输入规则名称"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="监控类型" required>
              <a-select
                v-model="ruleFormData.type"
                placeholder="请选择监控类型"
                style="width: 100%"
                @change="handleRuleTypeChange"
              >
                <a-option
                  v-for="option in monitoringTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  <div class="option-content">
                    <div class="option-label">{{ option.label }}</div>
                    <div class="option-description">{{ option.description }}</div>
                  </div>
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 监控配置 -->
        <div v-if="ruleFormData.type" class="condition-form">
          <h4>监控配置</h4>
          
          <!-- 监控粒度 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="监控粒度" required>
                <a-select
                  v-model="ruleFormData.conditions.granularity"
                  placeholder="请选择监控粒度"
                  style="width: 100%"
                  @change="handleGranularityChange"
                >
                  <a-option
                    v-for="granularity in availableGranularities"
                    :key="granularity.value"
                    :value="granularity.value"
                  >
                    {{ granularity.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 监控指标 -->
          <a-row :gutter="16" v-if="ruleFormData.conditions.granularity">
            <a-col :span="24">
              <a-form-item label="监控指标" required>
                <a-select
                  v-model="ruleFormData.conditions.metric"
                  placeholder="请选择监控指标"
                  style="width: 100%"
                  @change="handleMetricChange"
                >
                  <a-option
                    v-for="metric in availableMetrics"
                    :key="metric.value"
                    :value="metric.value"
                  >
                    <div class="option-content">
                      <div class="option-label">{{ metric.label }}</div>
                      <div class="option-description">{{ metric.description }}</div>
                    </div>
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 阈值配置 - 优化为包含默认建议和业务含义 -->
          <a-row :gutter="16" v-if="ruleFormData.conditions.metric">
            <a-col :span="24">
              <a-form-item label="阈值配置" required>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <a-tag color="blue" style="margin-right: 8px;">默认建议</a-tag>
                    <span style="font-weight: 500;">{{ getSelectedMetricInfo()?.defaultThreshold || '请选择指标' }}</span>
                  </div>
                  <div style="color: #666; font-size: 13px; line-height: 1.4;">
                    <strong>业务含义：</strong>{{ getSelectedMetricInfo()?.businessMeaning || '请先选择监控指标以查看业务含义' }}
                  </div>
                </div>
                <a-row :gutter="12">
                  <a-col :span="8">
                    <a-input-number
                      v-model="ruleFormData.conditions.threshold"
                      :placeholder="getSelectedMetricInfo()?.defaultThreshold || '请输入阈值'"
                      style="width: 100%"
                      :min="0"
                    />
                  </a-col>
                  <a-col :span="8">
                    <a-select
                      v-model="ruleFormData.conditions.operator"
                      placeholder="请选择操作"
                      style="width: 100%"
                    >
                      <a-option value="greater_than">大于</a-option>
                      <a-option value="less_than">小于</a-option>
                      <a-option value="equal">等于</a-option>
                      <a-option value="greater_equal">大于等于</a-option>
                      <a-option value="less_equal">小于等于</a-option>
                    </a-select>
                  </a-col>
                  <a-col :span="8">
                    <a-select
                      v-model="ruleFormData.conditions.unit"
                      placeholder="请选择单位"
                      style="width: 100%"
                    >
                      <a-option value="count">个数</a-option>
                      <a-option value="percentage">百分比(%)</a-option>
                      <a-option value="amount">金额(元)</a-option>
                      <a-option value="time">时间(分钟)</a-option>
                      <a-option value="days">天数</a-option>
                      <a-option value="hours">小时</a-option>
                    </a-select>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 监控范围 -->
          <a-row :gutter="16" v-if="ruleFormData.conditions.metric">
            <a-col :span="24">
              <a-form-item label="监控范围" required>
                <!-- 券库存粒度选择 -->
                <div v-if="ruleFormData.type === 'coupon_stock_granularity' && ruleFormData.conditions.granularity === 'coupon_type'">
                  <a-select
                    v-model="ruleFormData.conditions.selectedInventories"
                    placeholder="请选择要监控的券库存"
                    style="width: 100%"
                    mode="multiple"
                    :loading="loadingInventory"
                    allow-search
                  >
                    <a-option
                      v-for="inventory in couponInventoryList"
                      :key="inventory.id"
                      :value="inventory.id"
                    >
                      <div class="option-content">
                        <div class="option-label">{{ inventory.couponName }}</div>
                        <div class="option-description">
                          类型: {{ inventory.couponType }} | 状态: {{ inventory.status }} | 模板ID: {{ inventory.templateId }}
                        </div>
                      </div>
                    </a-option>
                  </a-select>
                  <div class="form-tip">
                    <icon-info-circle />
                    选择要监控的具体券库存，支持多选
                  </div>
                </div>
                
                <!-- 券包粒度选择 -->
                <div v-else-if="ruleFormData.type === 'coupon_package_granularity' && ruleFormData.conditions.granularity === 'package'">
                  <a-select
                    v-model="ruleFormData.conditions.selectedPackages"
                    placeholder="请选择要监控的券包"
                    style="width: 100%"
                    mode="multiple"
                    :loading="loadingPackages"
                    allow-search
                  >
                    <a-option
                      v-for="pkg in couponPackageList"
                      :key="pkg.id"
                      :value="pkg.id"
                    >
                      <div class="option-content">
                        <div class="option-label">{{ pkg.name }}</div>
                        <div class="option-description">
                          类型: {{ pkg.type }} | 状态: {{ pkg.status }} | 总数: {{ pkg.totalCount }} | 库存: {{ pkg.stock }}
                        </div>
                      </div>
                    </a-option>
                  </a-select>
                  <div class="form-tip">
                    <icon-info-circle />
                    选择要监控的具体券包，支持多选
                  </div>
                </div>
                
                <!-- 券实例生命周期通用配置 -->
                <div v-else-if="ruleFormData.type === 'coupon_instance_lifecycle'">
                  <a-select
                    v-model="ruleFormData.conditions.instanceConfig"
                    placeholder="券实例生命周期配置"
                    style="width: 100%"
                    disabled
                  >
                    <a-option value="general">
                      <div class="option-content">
                        <div class="option-label">通用配置</div>
                        <div class="option-description">适用于所有券实例的生命周期监控</div>
                      </div>
                    </a-option>
                  </a-select>
                  <div class="form-tip">
                    <icon-info-circle />
                    券实例生命周期使用通用配置，无需选择具体实例
                  </div>
                </div>
                
                <!-- 其他监控类型的范围选择 -->
                <div v-else>
                  <a-select
                    v-model="ruleFormData.conditions.scope"
                    placeholder="请选择监控范围"
                    style="width: 100%"
                    mode="multiple"
                  >
                    <a-option
                      v-for="scope in availableScopes"
                      :key="scope.value"
                      :value="scope.value"
                    >
                      <div class="option-content" v-if="scope.description">
                        <div class="option-label">{{ scope.label }}</div>
                        <div class="option-description">{{ scope.description }}</div>
                      </div>
                      <span v-else>{{ scope.label }}</span>
                    </a-option>
                  </a-select>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 过期监控条件 -->
        <div v-else-if="ruleFormData.type === 'expiry'" class="condition-form">
          <h4>过期监控条件</h4>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="提前预警天数" required>
                <a-input-number
                  v-model="ruleFormData.conditions.advanceDays"
                  placeholder="请输入天数"
                  style="width: 100%"
                  :min="1"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 失败率监控条件 -->
        <div v-else-if="ruleFormData.type === 'failure'" class="condition-form">
          <h4>失败率监控条件</h4>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="失败率阈值(%)" required>
                <a-input-number
                  v-model="ruleFormData.conditions.failureRate"
                  placeholder="请输入失败率"
                  style="width: 100%"
                  :min="0"
                  :max="100"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="时间窗口(分钟)" required>
                <a-input-number
                  v-model="ruleFormData.conditions.timeWindow"
                  placeholder="请输入时间窗口"
                  style="width: 100%"
                  :min="1"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 通知渠道 -->
        <a-form-item label="通知渠道" required>
          <a-checkbox-group v-model="ruleFormData.channels">
            <a-checkbox value="wechat">企业微信</a-checkbox>
            <a-checkbox value="sms">短信</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <!-- 规则描述 -->
        <a-form-item label="规则描述">
          <a-textarea
            v-model="ruleFormData.description"
            placeholder="请输入规则描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="handleRuleCancel">取消</a-button>
        <a-button type="primary" @click="handleRuleSubmit" :loading="false">
          {{ isEditingRule ? '更新' : '创建' }}
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconInfoCircle } from '@arco-design/web-vue/es/icon'
import OverviewDashboard from '@/components/marketing/alert/OverviewDashboard.vue'
import RecentAlertTimeline from '@/components/marketing/alert/RecentAlertTimeline.vue'
import RuleManagement from '@/components/marketing/alert/RuleManagement.vue'
import AlertHistoryDrawer from '@/components/marketing/alert/AlertHistoryDrawer.vue'
import { getAllAlertRules, getActiveAlertRules, updateAlertRule, deleteAlertRule, toggleAlertRuleStatus, addAlertRule } from '@/api/alertRules'
import { alertAPI } from '@/api/alert'

// 组件注册
const components = {
  IconInfoCircle
}

// 响应式数据
const overviewLoading = ref(false)
const timelineLoading = ref(false)
const rulesLoading = ref(false)
const historyDrawerVisible = ref(false)

// 模态框和详情数据
const alertDetailVisible = ref(false)
const ruleDetailVisible = ref(false)
const ruleModalVisible = ref(false)
const currentAlertDetail = ref(null)
const currentRuleDetail = ref(null)
const isEditingRule = ref(false)

// 规则表单数据
const ruleFormData = ref({
  name: '',
  type: '',
  description: '',
  conditions: {
    granularity: '',
    metric: '',
    threshold: null,
    operator: '',
    unit: '',
    scope: [],
    selectedInventories: [],
    selectedPackages: [],
    instanceConfig: 'general'
  },
  channels: []
})

// 券库存和券包数据
const couponInventoryList = ref([])
const couponPackageList = ref([])
const loadingInventory = ref(false)
const loadingPackages = ref(false)

// 概览数据
const overviewData = ref({
  activeRules: 8,
  todayAlerts: 12,
  inventoryAlerts: 6,
  expiryAlerts: 4
})



// 最近预警数据 - 使用API获取
const recentAlerts = ref([])

// 预警规则数据 - 整合全局规则管理中的预警规则
const alertRules = ref([])

// 获取预警规则数据
const fetchAlertRules = async () => {
  try {
    const rules = await getAllAlertRules()
    alertRules.value = rules
  } catch (error) {
    console.error('获取预警规则失败:', error)
    Message.error('获取预警规则失败')
  }
}

// 计算激活的预警规则（只显示激活的规则）
const activeAlertRules = computed(() => {
  return alertRules.value.filter(rule => rule.enabled)
})

// 监控类型选项配置 - 简化为三种基础类型
const monitoringTypeOptions = ref([
  {
    value: 'inventory',
    label: '库存监控',
    description: '监控优惠券库存数量变化，包括券类型、券包、批次等维度'
  },
  {
    value: 'expiry',
    label: '过期监控',
    description: '监控优惠券即将过期情况，支持多种粒度和时间维度'
  },
  {
    value: 'failure',
    label: '失败率监控',
    description: '监控系统操作失败率，包括发放、核销、系统等各类失败'
  }
])

// 监控粒度选项 - 根据用户要求重新设计为三种具体业务粒度
const availableGranularities = computed(() => {
  const granularityMap = {
    'inventory': [
      { value: 'coupon_stock', label: '券库存粒度', description: '支持选择不同券库存配置，支持全部或指定券库存独立配置' },
      { value: 'coupon_package', label: '券包粒度', description: '支持选择不同券包配置，支持全部或指定券包独立配置' },
      { value: 'coupon_instance_lifecycle', label: '券实例生命周期粒度', description: '监控券从发放到核销的完整生命周期' }
    ],
    'expiry': [
      { value: 'coupon_stock', label: '券库存粒度', description: '监控券库存中未发放券的剩余有效期' },
      { value: 'coupon_package', label: '券包粒度', description: '监控整个券包的有效期状态' }
    ],
    'failure': [
      { value: 'coupon_instance_lifecycle', label: '券实例生命周期粒度', description: '监控券核销失败和转化漏斗' }
    ]
  }
  return granularityMap[ruleFormData.value?.type] || []
})

// 监控指标选项 - 根据用户详细要求配置具体业务指标
const availableMetrics = computed(() => {
  const type = ruleFormData.value?.type
  const granularity = ruleFormData.value?.conditions?.granularity
  
  // 库存监控指标
  if (type === 'inventory') {
    const inventoryMetrics = {
      // 券库存粒度指标
      'coupon_stock': [
        { 
          value: 'remaining_stock_count', 
          label: '剩余有效库存量', 
          description: '监控当前可下发的有效券库存数量，避免超发或库存枯竭',
          defaultThreshold: '100',
          businessMeaning: '当库存数量低于设定值时触发预警'
        },
        { 
          value: 'remaining_stock_ratio', 
          label: '剩余有效库存比例', 
          description: '监控剩余库存占总库存的比例，当比例过低时预警',
          defaultThreshold: '10%',
          businessMeaning: '当剩余比例低于预设阈值时触发预警，提示补充库存或调整发放策略'
        },
        { 
          value: 'remaining_valid_days', 
          label: '剩余有效天数', 
          description: '跟踪库存中未发放券的剩余有效期（距离失效日期的天数）',
          defaultThreshold: '7天',
          businessMeaning: '针对临期库存启动自动促发机制或回收处理，减少资源浪费'
        }
      ],
      // 券包粒度指标
      'coupon_package': [
        { 
          value: 'package_remaining_days', 
          label: '券包剩余有效期天数', 
          description: '监控整个券包的有效期状态，确保包内券的可用性',
          defaultThreshold: '3天',
          businessMeaning: '当券包剩余有效期≤3天时，限制新用户领取并推送到期提醒'
        },
        { 
          value: 'package_valid_stock', 
          label: '券包下有效库存量', 
          description: '统计券包内尚未被领取的券数量，结合领取速率预测库存消耗趋势',
          defaultThreshold: '50',
          businessMeaning: '动态调整投放渠道或频率，确保库存合理分配'
        },
        { 
          value: 'daily_distribution_success_rate', 
          label: '当日下发成功率', 
          description: '计算券包当日成功发放的券数量占尝试发放总量的比例',
          defaultThreshold: '90%',
          businessMeaning: '若成功率骤降，需排查系统接口异常或用户触达障碍'
        }
      ],
      // 券实例生命周期粒度指标（库存相关）
      'coupon_instance_lifecycle': [
        { 
          value: 'lifecycle_stock_trend', 
          label: '生命周期库存趋势', 
          description: '监控券从发放到核销过程中的库存变化趋势',
          defaultThreshold: '异常波动20%',
          businessMeaning: '识别库存异常消耗模式，优化发放策略'
        }
      ]
    }
    return inventoryMetrics[granularity] || []
  }
  
  // 过期监控指标
  if (type === 'expiry') {
    const expiryMetrics = {
      // 券库存粒度过期指标
      'coupon_stock': [
        { 
          value: 'stock_remaining_days', 
          label: '库存剩余有效天数', 
          description: '监控券库存中未发放券的剩余有效期',
          defaultThreshold: '7天',
          businessMeaning: '提前预警临期库存，避免券过期浪费'
        },
        { 
          value: 'stock_expiry_risk', 
          label: '库存过期风险', 
          description: '评估库存中券的过期风险等级',
          defaultThreshold: '高风险',
          businessMeaning: '根据风险等级调整发放策略'
        }
      ],
      // 券包粒度过期指标
      'coupon_package': [
        { 
          value: 'package_expiry_days', 
          label: '券包剩余有效期天数', 
          description: '监控整个券包的有效期状态',
          defaultThreshold: '3天',
          businessMeaning: '确保券包在有效期内被充分利用'
        },
        { 
          value: 'package_expiry_warning', 
          label: '券包过期预警', 
          description: '券包即将过期时的预警机制',
          defaultThreshold: '24小时',
          businessMeaning: '提前通知相关人员处理即将过期的券包'
        }
      ]
    }
    return expiryMetrics[granularity] || []
  }
  
  // 失败率监控指标
  if (type === 'failure') {
    const failureMetrics = {
      // 券实例生命周期失败率指标
      'coupon_instance_lifecycle': [
        { 
          value: 'redemption_failure_ratio', 
          label: '券核销失败占比', 
          description: '统计周期内核销失败的次数占全部核销尝试的比例',
          defaultThreshold: '5%',
          businessMeaning: '失败率异常升高可能表明系统对接问题、规则冲突或用户操作障碍'
        },
        { 
          value: 'conversion_funnel_rate', 
          label: '核销率与转化漏斗', 
          description: '监控从领券到核销的完整转化路径，包括领取量、核销量、核销时效',
          defaultThreshold: '24小时内核销占比60%',
          businessMeaning: '识别环节流失并优化用户引导策略，提升券使用效率'
        },
        { 
          value: 'lifecycle_failure_trend', 
          label: '生命周期失败趋势', 
          description: '监控券在各个生命周期阶段的失败率变化',
          defaultThreshold: '趋势异常上升',
          businessMeaning: '及时发现并解决生命周期各阶段的问题'
        }
      ]
    }
    return failureMetrics[granularity] || []
  }
  
  return []
})

// 监控范围选项 - 根据用户要求配置具体业务范围
const availableScopes = computed(() => {
  const type = ruleFormData.value?.type
  const granularity = ruleFormData.value?.conditions?.granularity
  
  // 库存监控范围
  if (type === 'inventory') {
    const inventoryScopes = {
      // 券库存粒度范围 - 支持选择不同券库存配置，支持全部或指定券库存独立配置
      'coupon_stock': [
        { value: 'all_stock', label: '全部券库存', description: '监控所有券库存配置' },
        { value: 'interest_free_stock', label: '免息券库存', description: '专门监控免息券库存' },
        { value: 'discount_stock', label: '折扣券库存', description: '专门监控折扣券库存' },
        { value: 'reduction_stock', label: '立减券库存', description: '专门监控立减券库存' },
        { value: 'cashback_stock', label: '返现券库存', description: '专门监控返现券库存' },
        { value: 'custom_stock', label: '指定券库存', description: '自定义选择特定券库存进行独立配置' }
      ],
      // 券包粒度范围 - 支持选择不同券包配置，支持全部或指定券包独立配置
      'coupon_package': [
        { value: 'all_packages', label: '全部券包', description: '监控所有券包配置' },
        ...couponPackageList.value.map(item => ({
          value: item.id,
          label: `${item.name} (${item.type})`,
          description: `状态: ${item.status}, 总数: ${item.totalCount}, 库存: ${item.stock}`
        })),
        { value: 'custom_packages', label: '指定券包', description: '自定义选择特定券包进行独立配置' }
      ],
      // 券实例生命周期粒度范围
      'coupon_instance_lifecycle': [
        { value: 'all_instances', label: '全部券实例', description: '监控所有券实例的生命周期' },
        { value: 'active_instances', label: '活跃券实例', description: '监控当前活跃的券实例' },
        { value: 'pending_instances', label: '待使用券实例', description: '监控已发放但未使用的券实例' },
        { value: 'expired_instances', label: '过期券实例', description: '监控已过期的券实例' }
      ]
    }
    return inventoryScopes[granularity] || []
  }
  
  // 过期监控范围
  if (type === 'expiry') {
    const expiryScopes = {
      // 券库存粒度过期范围
      'coupon_stock': [
        { value: 'all_stock', label: '全部券库存', description: '监控所有券库存的过期情况' },
        { value: 'high_risk_stock', label: '高风险库存', description: '监控即将过期的高风险库存' },
        { value: 'medium_risk_stock', label: '中风险库存', description: '监控中等过期风险的库存' },
        { value: 'low_risk_stock', label: '低风险库存', description: '监控低过期风险的库存' }
      ],
      // 券包粒度过期范围
      'coupon_package': [
        { value: 'all_packages', label: '全部券包', description: '监控所有券包的过期情况' },
        ...couponPackageList.value.map(item => ({
          value: item.id,
          label: `${item.name} (${item.type})`,
          description: `监控券包过期状态: ${item.status}, 剩余: ${item.stock}`
        })),
        { value: 'expiring_packages', label: '即将过期券包', description: '重点监控即将过期的券包' }
      ]
    }
    return expiryScopes[granularity] || []
  }
  
  // 失败率监控范围
  if (type === 'failure') {
    const failureScopes = {
      // 券实例生命周期失败率范围
      'coupon_instance_lifecycle': [
        { value: 'all_lifecycle', label: '全部生命周期', description: '监控券实例完整生命周期的失败情况' },
        { value: 'distribution_phase', label: '发放阶段', description: '监控券发放阶段的失败率' },
        { value: 'activation_phase', label: '激活阶段', description: '监控券激活阶段的失败率' },
        { value: 'redemption_phase', label: '核销阶段', description: '监控券核销阶段的失败率' },
        { value: 'validation_phase', label: '验证阶段', description: '监控券验证阶段的失败率' },
        { value: 'expiry_phase', label: '过期处理阶段', description: '监控券过期处理的失败率' }
      ]
    }
    return failureScopes[granularity] || []
  }
  
  // 默认返回空数组
  return []
})

// 加载券库存列表
const loadCouponInventories = async () => {
  if (loadingInventory.value) return
  
  loadingInventory.value = true
  try {
    // 模拟API调用，实际应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 使用现有mock数据结构
    couponInventoryList.value = [
      {
        id: '1',
        userId: 'U001',
        couponId: 'CPN001',
        templateId: 'TPL001',
        couponName: '新用户专享免息券',
        couponType: 'interest_free',
        status: 'received'
      },
      {
        id: '2',
        userId: 'U002',
        couponId: 'CPN002',
        templateId: 'TPL002',
        couponName: '老用户回馈折扣券',
        couponType: 'discount',
        status: 'received'
      },
      {
        id: '3',
        userId: 'U003',
        couponId: 'CPN003',
        templateId: 'TPL003',
        couponName: '节日特惠券',
        couponType: 'reduction',
        status: 'expired'
      },
      {
        id: '4',
        userId: 'U004',
        couponId: 'CPN004',
        templateId: 'TPL004',
        couponName: '生日专属券',
        couponType: 'interest_free',
        status: 'received'
      }
    ]
  } catch (error) {
    console.error('加载券库存列表失败:', error)
    Message.error('加载券库存列表失败')
  } finally {
    loadingInventory.value = false
  }
}

// 加载券包列表
const loadCouponPackages = async () => {
  if (loadingPackages.value) return
  
  loadingPackages.value = true
  try {
    // 模拟API调用，实际应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 使用现有mock数据结构
    couponPackageList.value = [
      {
        id: 1,
        name: '新春礼包',
        type: '组合券包',
        status: '生效中',
        totalCount: 1000,
        stock: 800,
        rules: '包含30天免息券和8折优惠券'
      },
      {
        id: 2,
        name: '周年庆礼包',
        type: '组合券包',
        status: '待审核',
        totalCount: 500,
        stock: 500,
        rules: '包含90天免息券和7折优惠券'
      }
    ]
  } catch (error) {
    console.error('加载券包列表失败:', error)
    Message.error('加载券包列表失败')
  } finally {
    loadingPackages.value = false
  }
}

// 处理监控类型变化
const handleRuleTypeChange = (value) => {
  // 重置条件配置
  ruleFormData.value.conditions = {
    granularity: '',
    metric: '',
    threshold: null,
    operator: '',
    unit: '',
    scope: [],
    selectedInventories: [],
    selectedPackages: [],
    instanceConfig: 'general'
  }
  
  // 根据监控类型加载相应数据
  if (value === 'coupon_stock_granularity') {
    loadCouponInventories()
  } else if (value === 'coupon_package_granularity') {
    loadCouponPackages()
  }
}

// 处理粒度变化
const handleGranularityChange = (value) => {
  // 重置相关字段
  ruleFormData.value.conditions.metric = ''
  ruleFormData.value.conditions.scope = []
  ruleFormData.value.conditions.selectedInventories = []
  ruleFormData.value.conditions.selectedPackages = []
  
  // 根据粒度类型加载相应数据
  const ruleType = ruleFormData.value.type
  if (ruleType === 'coupon_stock_granularity' && value === 'coupon_type') {
    loadCouponInventories()
  } else if (ruleType === 'coupon_package_granularity' && value === 'package') {
    loadCouponPackages()
  }
}

// 处理监控指标变更
const handleMetricChange = (value) => {
  console.log('监控指标变更:', value)
  
  // 根据指标类型设置默认单位和操作符
  const metricDefaults = {
    'stock_count': { unit: 'count', operator: 'less_than' },
    'usage_count': { unit: 'count', operator: 'greater_than' },
    'expiry_count': { unit: 'count', operator: 'greater_than' },
    'usage_rate': { unit: 'percentage', operator: 'less_than' },
    'total_stock': { unit: 'count', operator: 'less_than' },
    'participation_rate': { unit: 'percentage', operator: 'less_than' },
    'conversion_rate': { unit: 'percentage', operator: 'less_than' },
    'package_stock': { unit: 'count', operator: 'less_than' },
    'package_usage': { unit: 'percentage', operator: 'greater_than' },
    'package_expiry': { unit: 'percentage', operator: 'greater_than' },
    'lifecycle_stage': { unit: 'time', operator: 'greater_than' },
    'stage_duration': { unit: 'time', operator: 'greater_than' },
    'transition_success': { unit: 'percentage', operator: 'less_than' },
    'distribution_count': { unit: 'count', operator: 'less_than' },
    'distribution_success_rate': { unit: 'percentage', operator: 'less_than' },
    'channel_conversion': { unit: 'percentage', operator: 'less_than' },
    'hourly_usage': { unit: 'count', operator: 'greater_than' },
    'daily_distribution': { unit: 'count', operator: 'less_than' },
    'peak_usage_time': { unit: 'time', operator: 'greater_than' }
  }
  
  const defaults = metricDefaults[value]
  if (defaults) {
    ruleFormData.value.conditions.unit = defaults.unit
    ruleFormData.value.conditions.operator = defaults.operator
  }
}

// 获取最近预警数据
const fetchRecentAlerts = async () => {
  timelineLoading.value = true
  try {
    const response = await alertAPI.getRecentAlerts({ pageSize: 10 })
    if (response.success) {
      recentAlerts.value = response.data.list
    }
  } catch (error) {
    console.error('获取最近预警失败:', error)
    Message.error('获取最近预警失败')
  } finally {
    timelineLoading.value = false
  }
}

// 事件处理函数
const handleViewAllHistory = () => {
  historyDrawerVisible.value = true
}

const handleRefreshOverview = async () => {
  overviewLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新概览数据
    overviewData.value = {
      todayAlerts: Math.floor(Math.random() * 20) + 5,
      activeRules: alertRules.value.filter(rule => rule.enabled).length,
      levelDistribution: {
        high: Math.floor(Math.random() * 5) + 1,
        medium: Math.floor(Math.random() * 8) + 2,
        low: Math.floor(Math.random() * 6) + 1
      },
      triggerFrequency: {
        inventory: Math.floor(Math.random() * 10) + 2,
        expiry: Math.floor(Math.random() * 8) + 1,
        failure: Math.floor(Math.random() * 5) + 1
      }
    }
    
    Message.success('数据刷新成功')
  } catch (error) {
    Message.error('数据刷新失败')
  } finally {
    overviewLoading.value = false
  }
}

const handleProcessAlert = (alert) => {
  const index = recentAlerts.value.findIndex(a => a.id === alert.id)
  if (index > -1) {
    recentAlerts.value[index].status = 'processing'
    Message.success('预警已标记为处理中')
  }
}

const handleResolveAlert = (alert) => {
  const index = recentAlerts.value.findIndex(a => a.id === alert.id)
  if (index > -1) {
    recentAlerts.value[index].status = 'resolved'
    Message.success('预警已解决')
  }
}

const handleLoadMoreAlerts = async () => {
  timelineLoading.value = true
  try {
    // 模拟加载更多数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const moreAlerts = [
      {
        id: recentAlerts.value.length + 1,
        ruleName: '库存监控',
        type: 'inventory',
        message: '优惠券"限时特惠"库存充足',
        time: '2024-01-13 18:30:00',
        status: 'resolved',
        channels: ['email']
      }
    ]
    
    recentAlerts.value.push(...moreAlerts)
    Message.success('加载更多预警成功')
  } catch (error) {
    Message.error('加载失败')
  } finally {
    timelineLoading.value = false
  }
}

const handleViewAlertDetail = (alert) => {
  currentAlertDetail.value = alert
  alertDetailVisible.value = true
}

const handleViewRuleDetail = (rule) => {
  currentRuleDetail.value = rule
  ruleDetailVisible.value = true
}

// 获取当前选中指标的详细信息（包含默认阈值和业务含义）
const getSelectedMetricInfo = () => {
  const type = ruleFormData.value?.type
  const granularity = ruleFormData.value?.conditions?.granularity
  const metric = ruleFormData.value?.conditions?.metric
  
  if (!type || !granularity || !metric) {
    return null
  }
  
  const metrics = availableMetrics.value
  return metrics.find(m => m.value === metric) || null
}

const handleAddRule = () => {
  isEditingRule.value = false
  ruleFormData.value = {
    name: '',
    type: '',
    description: '',
    conditions: {
      granularity: '',
      metric: '',
      threshold: null,
      operator: '',
      unit: '',
      scope: [],
      // 新增券相关配置
      selectedInventories: [], // 选择的券库存
      selectedPackages: [], // 选择的券包
      instanceConfig: 'general' // 券实例配置，默认为通用配置
    },
    channels: [],
    enabled: true
  }
  ruleModalVisible.value = true
}

const handleEditRule = (rule) => {
  isEditingRule.value = true
  ruleFormData.value = {
    ...rule,
    conditions: { 
      ...rule.conditions,
      // 确保券相关配置字段存在
      selectedInventories: rule.conditions?.selectedInventories || [],
      selectedPackages: rule.conditions?.selectedPackages || [],
      instanceConfig: rule.conditions?.instanceConfig || 'general'
    }
  }
  ruleModalVisible.value = true
}

// 规则提交处理
const handleRuleSubmit = async () => {
  try {
    // 表单验证
    if (!ruleFormData.value.name) {
      Message.error('请输入规则名称')
      return
    }
    if (!ruleFormData.value.type) {
      Message.error('请选择监控类型')
      return
    }
    if (!ruleFormData.value.conditions.granularity) {
      Message.error('请选择监控粒度')
      return
    }
    if (!ruleFormData.value.conditions.metric) {
      Message.error('请选择监控指标')
      return
    }
    if (ruleFormData.value.channels.length === 0) {
      Message.error('请选择至少一个通知渠道')
      return
    }

    // 券库存粒度验证
    if (ruleFormData.value.type === 'coupon_stock_granularity' && 
        ruleFormData.value.conditions.granularity === 'coupon_type' &&
        ruleFormData.value.conditions.selectedInventories.length === 0) {
      Message.error('请选择要监控的券库存')
      return
    }

    // 券包粒度验证
    if (ruleFormData.value.type === 'coupon_package_granularity' && 
        ruleFormData.value.conditions.granularity === 'package' &&
        ruleFormData.value.conditions.selectedPackages.length === 0) {
      Message.error('请选择要监控的券包')
      return
    }

    if (isEditingRule.value) {
      await updateAlertRule(ruleFormData.value.id, ruleFormData.value)
      Message.success('规则更新成功')
    } else {
      const newRule = {
        ...ruleFormData.value,
        id: Date.now(),
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        triggerCount: 0,
        lastTriggerTime: null
      }
      await addAlertRule(newRule)
      Message.success('规则创建成功')
    }
    
    await fetchAlertRules() // 重新获取数据
    ruleModalVisible.value = false
  } catch (error) {
    console.error('保存规则失败:', error)
    Message.error('保存规则失败')
  }
}

const handleRuleCancel = () => {
  ruleModalVisible.value = false
}

// 生命周期
onMounted(async () => {
  console.log('预警管理页面已加载')
  await fetchAlertRules() // 初始化时获取预警规则数据
  await fetchRecentAlerts() // 初始化时获取最近预警数据
})

// 规则操作处理函数
const handleDeleteRule = async (rule) => {
  try {
    await deleteAlertRule(rule.id)
    await fetchAlertRules() // 重新获取数据
    Message.success('规则删除成功')
  } catch (error) {
    console.error('删除规则失败:', error)
    Message.error('删除规则失败')
  }
}

const handleToggleRule = async (rule) => {
  try {
    await toggleAlertRuleStatus(rule.id)
    await fetchAlertRules() // 重新获取数据
    Message.success(`规则已${rule.enabled ? '禁用' : '启用'}`)
  } catch (error) {
    console.error('切换规则状态失败:', error)
    Message.error('切换规则状态失败')
  }
}

const handleBatchEnable = async (ruleIds) => {
  try {
    for (const id of ruleIds) {
      const rule = alertRules.value.find(r => r.id === id)
      if (rule && !rule.enabled) {
        await toggleAlertRuleStatus(id)
      }
    }
    await fetchAlertRules()
    Message.success('批量启用成功')
  } catch (error) {
    console.error('批量启用失败:', error)
    Message.error('批量启用失败')
  }
}

const handleBatchDisable = async (ruleIds) => {
  try {
    for (const id of ruleIds) {
      const rule = alertRules.value.find(r => r.id === id)
      if (rule && rule.enabled) {
        await toggleAlertRuleStatus(id)
      }
    }
    await fetchAlertRules()
    Message.success('批量禁用成功')
  } catch (error) {
    console.error('批量禁用失败:', error)
    Message.error('批量禁用失败')
  }
}

const handleBatchDelete = async (ruleIds) => {
  try {
    for (const id of ruleIds) {
      await deleteAlertRule(id)
    }
    await fetchAlertRules()
    Message.success('批量删除成功')
  } catch (error) {
    console.error('批量删除失败:', error)
    Message.error('批量删除失败')
  }
}

const handleRuleClick = (rule) => {
  handleViewRuleDetail(rule)
}

const handleCopyRule = (rule) => {
  // 复制规则逻辑
  const copiedRule = {
    ...rule,
    id: Date.now(),
    name: `${rule.name} - 副本`,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    triggerCount: 0,
    lastTriggerTime: null
  }
  
  // 添加到规则列表
  alertRules.value.push(copiedRule)
  Message.success('规则复制成功')
}
</script>

<script>
export default {
  components: {
    IconInfoCircle
  }
}
</script>

<style scoped>
.alert-management-container {
  min-height: 100vh;
  padding: 24px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.overview-section {
  /* 概览区域样式由组件内部控制 */
}

.timeline-section {
  /* 时间线区域样式由组件内部控制 */
}

.rules-section {
  /* 规则管理区域样式由组件内部控制 */
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .alert-management-container {
    padding: 20px;
  }
}

@media (max-width: 1200px) {
  .alert-management-container {
    padding: 16px;
  }
  
  .dashboard-layout {
    gap: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .dashboard-section {
    border-radius: 6px;
  }
}

@media (max-width: 768px) {
  .alert-management-container {
    padding: 12px;
    min-height: auto;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 18px;
    margin-bottom: 6px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .dashboard-layout {
    gap: 12px;
  }
  
  .dashboard-section {
    border-radius: 4px;
  }
}

@media (max-width: 480px) {
  .alert-management-container {
    padding: 8px;
  }
  
  .page-header {
    margin-bottom: 12px;
  }
  
  .page-title {
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .page-description {
    font-size: 12px;
  }
  
  .dashboard-layout {
    gap: 8px;
  }
}

/* 样式部分 */
.alert-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.content-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 120px);
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-section,
.timeline-section,
.rules-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-section {
  flex: 0 0 auto;
}

.timeline-section {
  flex: 1;
  min-height: 0;
}

.rules-section {
  flex: 1;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

/* 预警详情模态框样式 */
.alert-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e6eb;
  }

  .detail-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 8px 0;
  }

  .detail-time {
    color: #86909c;
    font-size: 14px;
  }

  .detail-level {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .detail-section {
    margin-bottom: 24px;

    .section-label {
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 8px;
    }

    .section-content {
      color: #4e5969;
      line-height: 1.6;
    }
  }

  .channels-section {
    .channel-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .detail-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e6eb;
    text-align: right;
  }
}

/* 规则详情模态框样式 */
.rule-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e6eb;
  }

  .detail-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 8px 0;
  }

  .detail-subtitle {
    color: #86909c;
    font-size: 14px;
  }

  .detail-status {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .detail-section {
    margin-bottom: 24px;

    .section-label {
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 8px;
    }

    .section-content {
      color: #4e5969;
      line-height: 1.6;
    }
  }

  .channels-section {
    .channel-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .detail-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e5e6eb;
    text-align: right;
  }
}

/* 条件表单样式 */
.condition-form {
  margin: 16px 0;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

.condition-form h4 {
  margin: 0 0 16px 0;
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
}

.option-content {
  .option-label {
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }

  .option-description {
    font-size: 12px;
    color: #86909c;
    line-height: 1.4;
  }
}

/* 表单提示样式 */
.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-layout {
    flex-direction: column;
    height: auto;
  }

  .right-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .alert-management {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>