<template>
  <div class="customer-detail-container">
    <!-- 🚨 明显的页面加载标识 🚨 -->
    <div style="background: red; color: white; padding: 10px; font-size: 20px; text-align: center; margin-bottom: 10px;">
      🔥 DETAIL.VUE 页面已加载！用户ID: {{ userId }} 🔥
    </div>
    <!-- 调试面板开关按钮 -->
    <a-button 
      class="debug-toggle-btn"
      type="primary" 
      size="small"
      @click="showDebugPanel = !showDebugPanel"
    >
      {{ showDebugPanel ? '隐藏调试' : '显示调试' }}
    </a-button>
    
    <!-- 强制状态显示已移除 -->
    
    <!-- 统一调试面板 -->
    <div v-if="showDebugPanel" class="unified-debug-panel">
      <div class="debug-header">
        <h4>🔍 统一调试日志面板</h4>
        <div class="debug-controls">
          <a-button size="mini" @click="clearDebugLogs">清空日志</a-button>
          <a-button size="mini" @click="exportDebugLogs">导出日志</a-button>
          <a-button size="mini" @click="manualRefreshData" type="primary">手动刷新数据</a-button>
          <a-button size="mini" @click="showDebugPanel = false">隐藏面板</a-button>
        </div>
      </div>
      
      <div class="debug-content">
        <!-- 主页面状态 -->
        <div class="debug-section">
          <h5>📄 主页面状态</h5>
          <div class="debug-item">
            <span class="debug-label">时间戳:</span>
            <span class="debug-value">{{ currentTimestamp }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Loading状态:</span>
            <span class="debug-value" :class="{ 'status-loading': loading }">{{ loading }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">用户ID:</span>
            <span class="debug-value">{{ userId }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">UserInfo存在:</span>
            <span class="debug-value" :class="{ 'status-success': !!userInfo, 'status-error': !userInfo }">{{ !!userInfo }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">路由参数:</span>
            <span class="debug-value">{{ JSON.stringify(route.params) }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">路由查询:</span>
            <span class="debug-value">{{ JSON.stringify(route.query) }}</span>
          </div>
        </div>

        <!-- 数据流跟踪 -->
        <div class="debug-section">
          <h5>🔄 数据流跟踪</h5>
          <div class="debug-flow">
            <div v-for="(log, index) in debugLogs" :key="index" class="debug-log-item">
              <span class="debug-timestamp">{{ log.timestamp }}</span>
              <span class="debug-component" :class="`component-${log.component}`">{{ log.component }}</span>
              <span class="debug-message">{{ log.message }}</span>
              <span v-if="log.data" class="debug-data">{{ formatDebugData(log.data) }}</span>
            </div>
          </div>
        </div>

        <!-- 组件状态汇总 -->
        <div class="debug-section">
          <h5>🧩 组件状态汇总</h5>
          <div class="component-status-grid">
            <div class="component-status-item">
              <h6>BasicInfo</h6>
              <div class="status-details">
                <div>数据状态: {{ componentStatus.basicInfo.hasData ? '✅' : '❌' }}</div>
                <div>渲染状态: {{ componentStatus.basicInfo.rendered ? '✅' : '❌' }}</div>
                <div>最后更新: {{ componentStatus.basicInfo.lastUpdate }}</div>
              </div>
            </div>
            <div class="component-status-item">
              <h6>ProductModules</h6>
              <div class="status-details">
                <div>自营产品: {{ selfProductData?.products?.length || 0 }}个</div>
                <div>助贷产品: {{ loanProductData?.products?.length || 0 }}个</div>
                <div>当前模块: {{ selectedProductType }}</div>
              </div>
            </div>
            <div class="component-status-item">
              <h6>LoanList</h6>
              <div class="status-details">
                <div>数据状态: {{ componentStatus.loanList.hasData ? '✅' : '❌' }}</div>
                <div>记录数量: {{ loanData?.length || 0 }}条</div>
                <div>最后更新: {{ componentStatus.loanList.lastUpdate }}</div>
              </div>
            </div>
            <div class="component-status-item">
              <h6>CreditList</h6>
              <div class="status-details">
                <div>数据状态: {{ componentStatus.creditList.hasData ? '✅' : '❌' }}</div>
                <div>记录数量: {{ creditData?.length || 0 }}条</div>
                <div>最后更新: {{ componentStatus.creditList.lastUpdate }}</div>
              </div>
            </div>
            <div class="component-status-item">
              <h6>AdjustmentHistory</h6>
              <div class="status-details">
                <div>数据状态: {{ componentStatus.adjustmentHistory.hasData ? '✅' : '❌' }}</div>
                <div>记录数量: {{ adjustmentData?.length || 0 }}条</div>
                <div>最后更新: {{ componentStatus.adjustmentHistory.lastUpdate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据流跟踪 -->
        <div class="debug-section">
          <h5>🔄 数据流跟踪详情</h5>
          <a-tabs size="small">
            <a-tab-pane key="api" title="API调用">
              <div class="data-flow-list">
                <div 
                  v-for="(call, index) in dataFlowTracker.apiCalls" 
                  :key="index"
                  class="data-flow-item"
                  :class="`status-${call.status}`"
                >
                  <div class="flow-header">
                    <span class="flow-name">{{ call.apiName }}</span>
                    <span class="flow-status">{{ call.status }}</span>
                    <span class="flow-time">{{ call.timestamp }}</span>
                  </div>
                  <div class="flow-data" v-if="call.data">
                    {{ typeof call.data === 'object' ? JSON.stringify(call.data, null, 2) : call.data }}
                  </div>
                </div>
              </div>
            </a-tab-pane>
            
            <a-tab-pane key="transfer" title="数据传递">
              <div class="data-flow-list">
                <div 
                  v-for="(transfer, index) in dataFlowTracker.dataTransfers" 
                  :key="index"
                  class="data-flow-item"
                >
                  <div class="flow-header">
                    <span class="flow-path">{{ transfer.from }} → {{ transfer.to }}</span>
                    <span class="flow-count">{{ transfer.dataCount }}条</span>
                    <span class="flow-time">{{ transfer.timestamp }}</span>
                  </div>
                  <div class="flow-data">{{ transfer.dataType }}</div>
                </div>
              </div>
            </a-tab-pane>
            
            <a-tab-pane key="component" title="组件更新">
              <div class="data-flow-list">
                <div 
                  v-for="(update, index) in dataFlowTracker.componentUpdates" 
                  :key="index"
                  class="data-flow-item"
                >
                  <div class="flow-header">
                    <span class="flow-name">{{ update.component }}</span>
                    <span class="flow-action">{{ update.updateType }}</span>
                    <span class="flow-time">{{ update.timestamp }}</span>
                  </div>
                  <div class="flow-data" v-if="update.details">
                    {{ typeof update.details === 'object' ? JSON.stringify(update.details, null, 2) : update.details }}
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <!-- 数据详情 -->
        <div class="debug-section">
          <h5>📊 数据详情</h5>
          <a-collapse>
            <a-collapse-item header="UserInfo 原始数据" key="userInfo">
              <pre class="debug-json">{{ JSON.stringify(userInfo, null, 2) }}</pre>
            </a-collapse-item>
            <a-collapse-item header="计算属性数据" key="computed">
              <div class="computed-data">
                <div><strong>selfProductData:</strong> {{ JSON.stringify(selfProductData, null, 2) }}</div>
                <div><strong>loanProductData:</strong> {{ JSON.stringify(loanProductData, null, 2) }}</div>
                <div><strong>creditData:</strong> {{ JSON.stringify(creditData, null, 2) }}</div>
                <div><strong>loanData:</strong> {{ JSON.stringify(loanData, null, 2) }}</div>
                <div><strong>adjustmentData:</strong> {{ JSON.stringify(adjustmentData, null, 2) }}</div>
              </div>
            </a-collapse-item>
          </a-collapse>
        </div>
      </div>
    </div>
    
    <!-- 调试面板切换按钮 -->
    <div class="debug-toggle" v-if="!showDebugPanel">
      <a-button type="primary" size="small" @click="showDebugPanel = true">
        🔍 显示调试面板
      </a-button>
    </div>
    
    <!-- 顶部操作栏 -->
    <div class="header">
      <div class="header-left">
        <a-button type="text" class="back-button" @click="goBack">
          <template #icon><icon-arrow-left /></template>
          返回搜索
        </a-button>
        <div class="breadcrumb">
          <span>客户360视图</span>
          <icon-right />
          <span>{{ userInfo?.name || '客户详情' }}</span>
        </div>
      </div>
      <div class="header-right">
        <HistoryQueryButton :user-info="userInfo" />
        <a-button type="primary" @click="fetchData">
          <template #icon><icon-refresh /></template>
          刷新数据
        </a-button>
      </div>
    </div>

    <!-- 数据不一致警告 -->
    <div v-if="hasDataInconsistency" class="data-inconsistency-warning">
      <a-alert
        type="warning"
        title="数据不一致警告"
        description="检测到部分数据可能存在不一致，请注意核实相关信息。"
        show-icon
        closable
      />
    </div>

    <!-- 加载状态 -->
      <a-spin :loading="loading" style="width: 100%">
        <!-- 加载中显示 -->
        <div v-if="loading" class="loading-container">
          <a-spin :size="32" />
          <div class="loading-text">正在加载客户数据...</div>
          <!-- 调试：加载状态 -->
          <div v-if="showDebugPanel" style="background: #fff7e6; padding: 8px; margin-top: 16px; border-radius: 4px; font-size: 12px;">
            <strong>⏳ 加载状态调试:</strong>
            <div>loading: {{ loading }}</div>
            <div>userId: {{ userId }}</div>
            <div>userInfo: {{ !!userInfo }}</div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="userInfo && userInfo.error" class="error-container">
          <a-result status="error" :title="userInfo.error" />
          <!-- 调试：错误状态 -->
          <div v-if="showDebugPanel" style="background: #fff2f0; padding: 8px; margin-top: 16px; border-radius: 4px; font-size: 12px;">
            <strong>❌ 错误状态调试:</strong>
            <div>userInfo.error: {{ userInfo.error }}</div>
            <div>完整userInfo: {{ JSON.stringify(userInfo, null, 2) }}</div>
          </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="!userInfo && !loading" class="empty-container">
          <a-result status="info" title="暂无数据" sub-title="未找到用户信息" />
          <!-- 调试：无数据状态 -->
          <div v-if="showDebugPanel" style="background: #f6ffed; padding: 8px; margin-top: 16px; border-radius: 4px; font-size: 12px;">
            <strong>📭 无数据状态调试:</strong>
            <div>userInfo: {{ userInfo }}</div>
            <div>loading: {{ loading }}</div>
            <div>userId: {{ userId }}</div>
            <div>fetchData是否被调用: 检查上方调试日志</div>
          </div>
        </div>

        <!-- 主要内容 -->
        <div v-else-if="userInfo && !userInfo.error" class="content">
        <!-- 调试：渲染条件检查 -->
        <div v-if="showDebugPanel" style="background: #e6f7ff; padding: 8px; margin-bottom: 16px; border-radius: 4px; font-size: 12px;">
          <strong>🎯 主要内容渲染条件检查:</strong>
          <div>userInfo存在: {{ !!userInfo }}</div>
          <div>userInfo.error: {{ userInfo?.error }}</div>
          <div>条件结果: {{ !!(userInfo && !userInfo.error) }}</div>
          <div>userInfo类型: {{ typeof userInfo }}</div>
          <div v-if="userInfo">userInfo键: {{ Object.keys(userInfo).join(', ') }}</div>
        </div>

        <!-- 客户概览卡片 -->
        <div class="overview-cards">
          <div class="overview-card">
            <div class="card-header">
              <icon-user class="card-icon" />
              <span class="card-title">客户信息</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">姓名</span>
                <span class="value">{{ userInfo?.basicInfo?.name || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号</span>
                <span class="value">{{ userInfo?.basicInfo?.phone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">风险等级</span>
                <a-tag :color="getRiskLevelColor(riskLevel)">{{ riskLevel }}</a-tag>
              </div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-header">
              <icon-storage class="card-icon" />
              <span class="card-title">资产负债</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">总资产</span>
                <span class="value amount">{{ formatAmount(totalAssets) }}</span>
              </div>
              <div class="info-item">
                <span class="label">总负债</span>
                <span class="value amount">{{ formatAmount(totalLiabilities) }}</span>
              </div>
              <div class="info-item">
                <span class="label">净资产</span>
                <span class="value amount" :class="{ 'negative': totalAssets - totalLiabilities < 0 }">
                  {{ formatAmount(totalAssets - totalLiabilities) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-header">
              <icon-safe class="card-icon" />
              <span class="card-title">授信情况</span>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">总授信额度</span>
                <span class="value amount">{{ formatAmount(userInfo?.totalCredit || 0) }}</span>
              </div>
              <div class="info-item">
                <span class="label">已用额度</span>
                <span class="value amount">{{ formatAmount(userInfo?.usedCredit || 0) }}</span>
              </div>
              <div class="info-item">
                <span class="label">额度使用率</span>
                <span class="value">{{ creditUtilizationRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <!-- 左侧内容 -->
          <div class="left-content">
            <!-- 基本信息区域 -->
            <div class="basic-info-section">
              <div class="section-title">
                <h3><icon-user /> 基本信息</h3>
              </div>
              
              <!-- 基本信息网格布局 -->
              <div class="basic-info-grid">
                <!-- 客户基本信息 -->
                <div class="basic-info-card">
                  <BasicInfo :user-info="userInfo" @debug-info="handleDebugInfo" />
                </div>
                
                <!-- 催收记录 -->
                <div class="basic-info-card">
                  <div class="card-header">
                    <h4><icon-safe /> 催收记录</h4>
                  </div>
                  <CollectionRecords 
                    :collection-data="productStore.getCurrentCollectionRecords" 
                    :loading="loading"
                    @debug-info="handleDebugInfo" 
                  />
                </div>
                
                <!-- 征信记录 -->
                <div class="basic-info-card">
                  <div class="card-header">
                    <h4><icon-storage /> 征信记录</h4>
                  </div>
                  <CreditReports 
                    :credit-reports="productStore.getCurrentCreditReports" 
                    :loading="loading"
                    @debug-info="handleDebugInfo" 
                  />
                </div>
              </div>
            </div>

            <!-- 产品信息 -->
            <div class="detail-section">
              <div class="section-title">
                <h3><icon-storage /> 产品信息</h3>
              </div>
              
              <!-- 产品选择器调试信息 -->
              <div v-if="showDebugPanel" class="product-debug-info" style="background: #fff7e6; border: 2px solid #fa8c16; padding: 16px; margin: 16px 24px; border-radius: 6px;">
                <h4 style="color: #fa8c16; margin: 0 0 12px 0;">🔍 产品选择器调试信息</h4>
                <div style="font-size: 12px; line-height: 1.5;">
                  <div><strong>当前选中类型:</strong> {{ productStore.selectedProductType }}</div>
                  <div><strong>selfProductData:</strong> {{ selfProductData ? `有数据(${selfProductData.products?.length || 0}个产品)` : '无数据' }}</div>
                  <div><strong>loanProductData:</strong> {{ loanProductData ? `有数据(${loanProductData.products?.length || 0}个产品)` : '无数据' }}</div>
                  <div><strong>userInfo状态:</strong> {{ userInfo ? '已加载' : '未加载' }}</div>
                  <div><strong>loading状态:</strong> {{ loading }}</div>
                  <div><strong>产品统计:</strong> {{ JSON.stringify(productStats) }}</div>
                </div>
              </div>
              
              <!-- 新的产品切换器 -->
              <div class="product-switcher-container">
                <ProductSwitcher 
                  :active-product="productStore.selectedProductType"
                  :product-stats="productStats"
                  :loading="loading"
                  @product-change="handleProductTypeChange"
                />
                
                <!-- 产品模块内容 -->
                <div class="product-modules-container">
                  <ProductModules 
                    :product-type="productStore.selectedProductType"
                    :user-info="userInfo"
                    :product-data="currentProductData"
                    :loading="loading"
                    :show-debug-panel="showDebugPanel"
                    :remember-state="true"
                    :lazy-load="true"
                    :animated="true"
                    @debug-info="handleDebugInfo"
                    @tab-change="handleModuleTabChange"
                    @module-loaded="handleModuleLoaded"
                    @retry="manualRefreshData"
                  />
                </div>
              </div>
            </div>


          </div>

          <!-- 右侧内容 -->
          <div class="right-content">
            <!-- 授信记录 -->
            <div class="detail-section">
              <div class="section-title">
                <h3><icon-safe /> 授信记录</h3>
                <span class="product-indicator">{{ productStore.selectedProductType === 'self' ? '自营产品' : '助贷产品' }}</span>
              </div>
              <CreditList 
                :credits="productStore.getCurrentCreditRecords" 
                :loading="loading"
                @debug-info="handleDebugInfo" 
              />
            </div>

            <!-- 用信记录 -->
            <div class="detail-section">
              <div class="section-title">
                <h3><icon-storage /> 用信记录</h3>
                <span class="product-indicator">{{ productStore.selectedProductType === 'self' ? '自营产品' : '助贷产品' }}</span>
              </div>
              <LoanList 
                :loans="productStore.getCurrentLoanRecords" 
                :loading="loading"
                @debug-info="handleDebugInfo" 
              />
            </div>

            <!-- 调额历史 -->
            <div class="detail-section">
              <div class="section-title">
                <h3><icon-safe /> 调额历史</h3>
                <span class="product-indicator">{{ productStore.selectedProductType === 'self' ? '自营产品' : '助贷产品' }}</span>
              </div>
              <AdjustmentHistory 
                :adjustments="productStore.getCurrentAdjustmentHistory" 
                :loading="loading"
                @debug-info="handleDebugInfo" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="!loading && (userInfo?.error || !userInfo)" class="error-container">
        <a-result 
          :status="userInfo?.error ? '404' : '500'" 
          :title="userInfo?.error ? userInfo.errorMessage : '未找到用户信息'"
        >
          <template #subtitle>
            <div v-if="userInfo?.error">
              错误类型: {{ userInfo.errorType }}<br>
              用户ID: {{ userInfo.userId }}<br>
              请检查用户ID是否正确，或联系系统管理员
            </div>
            <div v-else>
              请检查用户ID是否正确，或联系系统管理员
            </div>
          </template>
          <template #extra>
            <a-button type="primary" @click="goBack">返回搜索</a-button>
          </template>
        </a-result>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
console.log('🔥🔥🔥 DETAIL.VUE SCRIPT SETUP 开始执行 🔥🔥🔥')
console.log('🔥 当前时间:', new Date().toLocaleString())
console.log('🔥 window.location.href:', window.location.href)
console.log('🔥 document.title:', document.title)

// 在页面标题中添加标识
document.title = '🔥 Customer360 Detail - ' + new Date().toLocaleTimeString()

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconArrowLeft, 
  IconRight, 
  IconRefresh,
  IconUser,
  IconStorage,
  IconSafe
} from '@arco-design/web-vue/es/icon'
import { fetchUserInfo } from '../../../mock/customer360'
import { formatAmount, formatPercent } from '../../../utils/formatUtils'
import { useProductStore } from '../../../stores/productStore'
import BasicInfo from './components/BasicInfo.vue'
import ProductModules from './components/ProductModules.vue'
import ProductSwitcher from './components/ProductSwitcher.vue'
import CreditList from './components/CreditList.vue'
import LoanList from './components/LoanList.vue'
import AdjustmentHistory from './components/AdjustmentHistory.vue'
import CollectionRecords from './components/CollectionRecords.vue'
import CreditReports from './components/CreditRecords.vue'
import HistoryQueryButton from './components/HistoryQueryButton.vue'

// 基础响应式变量
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userInfo = ref(null)
const loading = ref(true)
// activeTab 已移除，改为垂直展示
const selectedProduct = ref('')

// 调试系统状态管理
const debugLogs = ref([])
const showDebugPanel = ref(true) // 调试面板显示控制
const currentTimestamp = ref(new Date().toLocaleString())
const componentStatus = ref({
  basicInfo: { status: 'loading', timestamp: '', info: null, hasData: false, rendered: false },
  productModules: { status: 'loading', timestamp: '', info: null, hasData: false, rendered: false },
  loanList: { status: 'loading', timestamp: '', info: null, hasData: false, rendered: false },
  creditList: { status: 'loading', timestamp: '', info: null, hasData: false, rendered: false },
  adjustmentHistory: { status: 'loading', timestamp: '', info: null, hasData: false, rendered: false }
})

// 数据流跟踪
const dataFlowTracker = ref({
  apiCalls: [],
  dataTransfers: [],
  componentUpdates: []
})

// 跟踪API调用
const trackApiCall = (apiName, status, data = null) => {
  const apiCall = {
    id: Date.now(),
    apiName,
    status, // 'start', 'success', 'error'
    timestamp: new Date().toISOString(),
    data: data ? { count: Array.isArray(data) ? data.length : 1, type: typeof data } : null
  }
  dataFlowTracker.value.apiCalls.unshift(apiCall)
  if (dataFlowTracker.value.apiCalls.length > 20) {
    dataFlowTracker.value.apiCalls.pop()
  }
}

// 跟踪数据传递
const trackDataTransfer = (from, to, dataType, dataCount) => {
  const transfer = {
    id: Date.now(),
    from,
    to,
    dataType,
    dataCount,
    timestamp: new Date().toISOString()
  }
  dataFlowTracker.value.dataTransfers.unshift(transfer)
  if (dataFlowTracker.value.dataTransfers.length > 30) {
    dataFlowTracker.value.dataTransfers.pop()
  }
}

// 跟踪组件更新
const trackComponentUpdate = (component, updateType, details) => {
  const update = {
    id: Date.now(),
    component,
    updateType, // 'mounted', 'props-change', 'data-update'
    details,
    timestamp: new Date().toISOString()
  }
  dataFlowTracker.value.componentUpdates.unshift(update)
  if (dataFlowTracker.value.componentUpdates.length > 50) {
    dataFlowTracker.value.componentUpdates.pop()
  }
}

// 调试日志方法
const addDebugLog = (component, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString()
  debugLogs.value.unshift({
    timestamp,
    component,
    message,
    data
  })
  
  // 限制日志数量，保留最新的100条
  if (debugLogs.value.length > 100) {
    debugLogs.value = debugLogs.value.slice(0, 100)
  }
  
  console.log(`[${timestamp}] ${component}: ${message}`, data)
}

// 更新组件状态
const updateComponentStatus = (component, status) => {
  if (componentStatus.value[component]) {
    componentStatus.value[component] = {
      ...componentStatus.value[component],
      ...status,
      lastUpdate: new Date().toLocaleTimeString()
    }
    addDebugLog(component, `状态更新: ${JSON.stringify(status)}`)
  }
}

// 格式化调试数据
const formatDebugData = (data) => {
  if (!data) return ''
  const str = JSON.stringify(data)
  return str.length > 100 ? str.substring(0, 100) + '...' : str
}

// 清空调试日志
const clearDebugLogs = () => {
  debugLogs.value = []
  addDebugLog('system', '调试日志已清空')
}

// 导出调试日志
const exportDebugLogs = () => {
  const logData = {
    timestamp: new Date().toISOString(),
    userId: userId.value,
    componentStatus: componentStatus.value,
    logs: debugLogs.value,
    userInfo: userInfo.value,
    computedData: {
      selfProductData: selfProductData.value,
      loanProductData: loanProductData.value,
      creditData: creditData.value,
      loanData: loanData.value,
      adjustmentData: adjustmentData.value
    }
  }
  
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `customer360-debug-${userId.value}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  addDebugLog('system', '调试日志已导出')
}

// 手动刷新数据
const manualRefreshData = async () => {
  console.log('🔄 [MANUAL] 手动刷新数据开始')
  addDebugLog('manual', '用户手动触发数据刷新')
  
  // 重置状态
  userInfo.value = null
  loading.value = true
  
  console.log('🔄 [MANUAL] 状态已重置，开始获取数据')
  addDebugLog('manual', '状态已重置，准备重新获取数据')
  
  try {
    await fetchData()
    console.log('🔄 [MANUAL] 手动刷新完成')
    addDebugLog('manual', '手动刷新数据完成')
    Message.success('数据刷新成功')
  } catch (error) {
    console.error('🔄 [MANUAL] 手动刷新失败:', error)
    addDebugLog('manual', '手动刷新数据失败', { error: error.message })
    Message.error(`数据刷新失败: ${error.message}`)
  }
}

// 更新时间戳
const updateTimestamp = () => {
  currentTimestamp.value = new Date().toLocaleString()
}

// 定时更新时间戳
let timestampTimer = null

// 定时器将在主onMounted中启动

// 处理子组件调试信息
const handleDebugInfo = (debugInfo) => {
  addDebugLog(debugInfo.type, `[${debugInfo.component}] ${debugInfo.message}`, debugInfo.data)
  
  // 跟踪组件更新
  trackComponentUpdate(debugInfo.component, debugInfo.type, debugInfo.data)
  
  // 如果是数据相关的操作，记录数据传递
  if (debugInfo.message.includes('数据') || debugInfo.message.includes('更新') || debugInfo.message.includes('变化')) {
    const dataCount = debugInfo.data && typeof debugInfo.data === 'object' ? 
      (Array.isArray(debugInfo.data) ? debugInfo.data.length : Object.keys(debugInfo.data).length) : 1
    trackDataTransfer('Component', debugInfo.component, debugInfo.type, dataCount)
  }
  
  // 更新对应组件的状态
  if (debugInfo.component === 'LoanList') {
    updateComponentStatus('loanList', {
      hasData: debugInfo.data?.hasLoans || debugInfo.data?.length > 0,
      rendered: true,
      lastUpdate: debugInfo.timestamp
    })
  }
}
updateTimestamp()

// 模块状态管理
const activeModules = ref({
  self: 'basic', // 自营产品默认显示基础信息
  loan: 'basic'  // 助贷产品默认显示基础信息
})

// 产品选项
const productOptions = ref([
  { label: '全部产品', value: '全部产品' },
  { label: '自营产品', value: '自营产品' },
  { label: '助贷产品', value: '助贷产品' }
])

// 获取用户ID
const userId = computed(() => {
  console.log('📍 详情页获取用户ID，route.params:', route.params)
  console.log('📍 详情页获取用户ID，route.query:', route.query)
  return route.params.userId || route.query.userId
})

// 计算属性：根据产品类型获取对应数据
const selfProductData = computed(() => {
  console.log('🧮 计算selfProductData，使用productStore数据')
  
  return {
    products: productStore.selfProducts,
    collections: productStore.collectionRecords,
    credits: productStore.creditRecords,
    marketing: productStore.userData?.marketingRecords?.touchRecords || []
  }
})

const loanProductData = computed(() => {
  console.log('🧮 计算loanProductData，使用productStore数据')
  
  return {
    products: productStore.loanProducts,
    collections: productStore.collectionRecords,
    credits: productStore.creditRecords,
    marketing: productStore.userData?.marketingRecords?.benefitRecords || []
  }
})

const creditData = computed(() => {
  console.log('🔍 creditData计算属性被调用，使用productStore数据');
  return productStore.creditRecords
})
const loanData = computed(() => {
  console.log('🔍 loanData计算属性被调用，使用productStore数据');
  return productStore.loanRecords
})
const adjustmentData = computed(() => {
  console.log('🔍 adjustmentData计算属性被调用，使用productStore数据');
  return productStore.quotaAdjustHistory
})

// 数据完整性检查
const hasDataInconsistency = computed(() => {
  if (!userInfo.value || userInfo.value.error) return false
  
  // 检查基本信息是否缺失
  if (!userInfo.value.basicInfo) return true
  
  // 检查必要字段是否存在
  const basicInfo = userInfo.value.basicInfo
  if (!basicInfo.name || !basicInfo.idCard || !basicInfo.phone) return true
  
  // 检查产品数据一致性
  const depositProducts = userInfo.value.depositProducts || [] // 修复：使用depositProducts
  const loanProducts = userInfo.value.loanProducts || []
  
  // 如果有产品但没有对应的记录，可能存在不一致
  if (depositProducts.length > 0 && (!userInfo.value.creditsList || userInfo.value.creditsList.length === 0)) {
    return true
  }
  
  if (loanProducts.length > 0 && (!userInfo.value.loanRecords || userInfo.value.loanRecords.length === 0)) {
    return true
  }
  
  return false
})

// 计算属性
const creditUtilizationRate = computed(() => {
  if (!userInfo.value || userInfo.value.error) return 0
  const { totalCredit, usedCredit } = userInfo.value
  return totalCredit > 0 ? (usedCredit / totalCredit * 100).toFixed(2) : 0
})

const totalAssets = computed(() => {
  if (!userInfo.value || userInfo.value.error) return 0
  const depositTotal = userInfo.value.depositProducts?.reduce((sum, product) => sum + product.balance, 0) || 0
  return depositTotal
})

const totalLiabilities = computed(() => {
  if (!userInfo.value || userInfo.value.error) return 0
  const loanTotal = userInfo.value.loanProducts?.reduce((sum, product) => sum + product.balance, 0) || 0
  return loanTotal
})

const riskLevel = computed(() => {
  if (!userInfo.value || userInfo.value.error) return '未知'
  const { currentOverdueDays, repaymentRate } = userInfo.value
  if (currentOverdueDays > 90) return '高风险'
  if (currentOverdueDays > 30) return '中风险'
  if (repaymentRate < 80) return '中风险'
  return '低风险'
})

// 获取数据
const fetchData = async () => {
  console.log('🔍 [DEBUG] 开始获取用户数据', { userId: userId.value })
  if (!userId.value) {
    console.log('❌ [DEBUG] 用户ID为空，无法获取数据')
    addDebugLog('main', 'userId 为空，无法获取数据')
    return
  }
  
  console.log('📡 [DEBUG] 调用fetchUserInfo API', { userId: userId.value })
  addDebugLog('main', `开始获取用户数据，userId: ${userId.value}`)
  loading.value = true
  console.log('⏳ [DEBUG] 设置loading状态为true')
  trackApiCall('fetchUserData', 'start')
  
  try {
    // 添加延迟确保API调用完成
    console.log('🔄 [DEBUG] 准备调用 fetchUserInfo...')
    console.log('🔍 [DEBUG] fetchUserInfo函数类型:', typeof fetchUserInfo)
    console.log('🔍 [DEBUG] fetchUserInfo函数:', fetchUserInfo)
    console.log('🔍 [DEBUG] 调用参数userId:', userId.value)
    
    const response = await fetchUserInfo(userId.value)
    
    console.log('🎯 [DEBUG] fetchUserInfo调用完成，立即检查response:')
    console.log('🎯 [DEBUG] response类型:', typeof response)
    console.log('🎯 [DEBUG] response是否为null:', response === null)
    console.log('🎯 [DEBUG] response是否为undefined:', response === undefined)
    console.log('🎯 [DEBUG] response值:', response)
    console.log('📥 [DEBUG] API响应原始数据', { 
      response, 
      hasData: !!response,
      dataKeys: response ? Object.keys(response) : [],
      responseType: typeof response,
      stringified: JSON.stringify(response, null, 2)
    })
    addDebugLog('api', '用户数据获取成功', { dataKeys: response ? Object.keys(response) : null })
    trackApiCall('fetchUserData', 'success', response)
    
    // 验证响应数据结构
    if (!response) {
      console.log('⚠️ [DEBUG] API返回空数据')
      addDebugLog('api', 'API 返回数据为空', null)
      Message.error('API 返回数据为空')
      return
    }
    
    // 检查API是否返回错误
    if (response.error) {
      console.log('❌ [DEBUG] API返回错误', { error: response.error })
      addDebugLog('api', 'API 返回错误', { error: response.error, message: response.message })
      Message.error(response.message || '用户不存在')
      // 设置错误状态而不是null，这样页面可以显示错误信息
      userInfo.value = {
        error: true,
        errorType: response.error,
        errorMessage: response.message || '用户不存在',
        userId: userId.value
      }
      return
    }
    
    // 强制设置 userInfo 并验证
    userInfo.value = response
    // 设置数据到全局store
    productStore.setUserData(response)
    console.log('✅ [DEBUG] 用户数据设置成功', { 
      userInfo: userInfo.value,
      basicInfoExists: !!userInfo.value?.basicInfo,
      userInfoKeys: Object.keys(userInfo.value || {}),
      hasError: !!userInfo.value?.error,
      renderCondition: !!(userInfo.value && !userInfo.value.error)
    })
    
    // 立即验证 userInfo 是否正确设置
    console.log('🔍 [VERIFY] userInfo.value 验证:', {
      isNull: userInfo.value === null,
      isUndefined: userInfo.value === undefined,
      type: typeof userInfo.value,
      value: userInfo.value
    })
    
    // 强制触发响应式更新
    await nextTick()
    console.log('🔄 [VERIFY] nextTick后 userInfo.value:', userInfo.value)
    
    // 使用nextTick确保DOM更新
    await nextTick()
    console.log('🔄 [DEBUG] nextTick完成，DOM已更新')
    addDebugLog('main', 'nextTick完成，DOM已更新')
    
    // 强制检查渲染条件
    console.log('🎯 [RENDER DEBUG] 渲染条件检查:', {
      userInfoExists: !!userInfo.value,
      userInfoError: userInfo.value?.error,
      shouldRenderMain: !!(userInfo.value && !userInfo.value.error),
      loadingState: loading.value
    })
    trackDataTransfer('API', 'BasicInfo', 'userInfo', 1)
    addDebugLog('main', 'userInfo 数据已设置', { 
      hasData: !!userInfo.value,
      dataType: typeof userInfo.value,
      keys: userInfo.value ? Object.keys(userInfo.value) : null
    })
    
    // 更新组件状态 - BasicInfo
    updateComponentStatus('basicInfo', {
      hasData: !!(userInfo.value?.basicInfo),
      rendered: true
    })
    
    // 更新组件状态 - ProductModules
    updateComponentStatus('productModules', {
      hasData: !!(userInfo.value?.depositProducts || userInfo.value?.loanProducts), // 修复：使用depositProducts
      rendered: true
    })
    
    // 更新组件状态 - LoanList
    updateComponentStatus('loanList', {
      hasData: !!(userInfo.value?.loanRecords && userInfo.value.loanRecords.length > 0),
      rendered: true
    })
    trackDataTransfer('API', 'LoanList', 'loanData', userInfo.value?.loanRecords?.length || 0)
    
    // 更新组件状态 - CreditList
    updateComponentStatus('creditList', {
      hasData: !!(userInfo.value?.creditsList && userInfo.value.creditsList.length > 0),
      rendered: true
    })
    trackDataTransfer('API', 'CreditList', 'creditData', userInfo.value?.creditsList?.length || 0)
    
    // 更新组件状态 - AdjustmentHistory
    updateComponentStatus('adjustmentHistory', {
      hasData: !!(userInfo.value?.quotaAdjustHistory && userInfo.value.quotaAdjustHistory.length > 0),
      rendered: true
    })
    trackDataTransfer('API', 'AdjustmentHistory', 'adjustmentData', userInfo.value?.quotaAdjustHistory?.length || 0)
    
    // 检查关键数据字段
    if (userInfo.value) {
      addDebugLog('data', '关键数据字段检查', {
        depositProducts: userInfo.value.depositProducts?.length || 0, // 修复：使用depositProducts
        loanProducts: userInfo.value.loanProducts?.length || 0,
        creditRecords: userInfo.value.creditsList?.length || 0,
        loanRecords: userInfo.value.loanRecords?.length || 0,
        adjustmentRecords: userInfo.value.quotaAdjustHistory?.length || 0
      })
    }
    
    // 检查计算属性
    addDebugLog('computed', '计算属性检查', {
      selfProductData: selfProductData.value?.products?.length || 0,
      loanProductData: loanProductData.value?.products?.length || 0,
      creditData: creditData.value?.length || 0,
      loanData: loanData.value?.length || 0,
      adjustmentData: adjustmentData.value?.length || 0
    })
    
    // 验证计算属性是否正确计算
    if (!selfProductData.value && !loanProductData.value) {
      addDebugLog('warning', '所有产品数据都为空，可能存在数据结构问题')
    }
    
    // 再次使用nextTick确保所有组件状态更新完成
    await nextTick()
    console.log('🔄 [DEBUG] 组件状态更新后nextTick完成')
    addDebugLog('main', '组件状态更新后nextTick完成，所有数据传递应已生效')
    
  } catch (error) {
    console.error('💥 [DEBUG] 获取数据失败', { error: error.message, stack: error.stack })
    trackApiCall('fetchUserData', 'error', { error: error.message })
    addDebugLog('error', '获取用户数据失败', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    Message.error(`获取用户数据失败: ${error.message}`)
  } finally {
    loading.value = false
    console.log('🏁 [DEBUG] 数据获取完成', { 
      loading: loading.value, 
      hasUserInfo: !!userInfo.value,
      userInfoValue: userInfo.value
    })
    addDebugLog('main', `数据获取流程结束，loading: ${loading.value}`)
  }
}

const goBack = () => {
  router.push('/discovery/customer360')
}





// 获取风险等级颜色
const getRiskLevelColor = (level) => {
  const colorMap = {
    '低风险': 'green',
    '中风险': 'orange',
    '高风险': 'red',
    '极高风险': 'red'
  }
  return colorMap[level] || 'blue'
}

// 处理产品类型切换
const handleProductTypeChange = (productType) => {
  selectedProductType.value = productType
  console.log('切换产品类型:', productType)
}

// 处理模块切换
const handleModuleChange = (productType, module) => {
  activeModules.value[productType] = module
  console.log(`${productType}产品切换到模块:`, module)
}

// 处理产品切换
const handleProductChange = (value) => {
  console.log('产品切换:', value)
  selectedProductType.value = value
  // 这里可以根据选择的产品类型过滤显示的数据
  Message.info(`已切换到: ${value}`)
}

// 当前产品数据计算属性
const currentProductData = computed(() => {
  return selectedProductType.value === 'self' ? selfProductData.value : loanProductData.value
})

// 产品统计数据计算属性
const productStats = computed(() => {
  const selfCount = selfProductData.value?.products?.length || 0
  const loanCount = loanProductData.value?.products?.length || 0
  
  return {
    self: {
      count: selfCount,
      label: '自营产品',
      hasData: selfCount > 0
    },
    loan: {
      count: loanCount,
      label: '助贷产品', 
      hasData: loanCount > 0
    }
  }
})

// 处理模块Tab切换
const handleModuleTabChange = (productType, moduleKey) => {
  console.log('模块Tab切换:', { productType, moduleKey })
  activeModules.value[productType] = moduleKey
  addDebugLog('interaction', `${productType}产品模块切换到: ${moduleKey}`)
}

// 处理模块加载完成
const handleModuleLoaded = (productType, moduleKey, data) => {
  console.log('模块加载完成:', { productType, moduleKey, data })
  addDebugLog('module', `${productType}产品${moduleKey}模块加载完成`, {
    hasData: !!data,
    dataCount: Array.isArray(data) ? data.length : 0
  })
}

// 监听路由变化
watch(() => userId.value, (newUserId, oldUserId) => {
  console.log('🔄 路由userId变化:', { oldUserId, newUserId })
  addDebugLog('route', `userId变化: ${oldUserId} → ${newUserId}`)
  if (newUserId && newUserId !== oldUserId) {
    console.log('🔄 检测到userId变化，重新获取数据')
    addDebugLog('route', '检测到userId变化，重新获取数据')
    fetchData()
  }
})

// 监听userInfo变化
watch(() => userInfo.value, (newUserInfo, oldUserInfo) => {
  addDebugLog('data', 'userInfo数据变化', {
    hasOldData: !!oldUserInfo,
    hasNewData: !!newUserInfo,
    isError: newUserInfo?.error,
    dataKeys: newUserInfo ? Object.keys(newUserInfo) : null
  })
  
  // 检查关键数据字段的变化
  if (newUserInfo && !newUserInfo.error) {
    addDebugLog('data', '用户数据结构检查', {
      hasBasicInfo: !!newUserInfo.basicInfo,
      hasDepositProducts: !!(newUserInfo.depositProducts && newUserInfo.depositProducts.length > 0), // 修复：使用depositProducts
      hasLoanProducts: !!(newUserInfo.loanProducts && newUserInfo.loanProducts.length > 0),
      hasCreditsList: !!(newUserInfo.creditsList && newUserInfo.creditsList.length > 0),
      hasLoanRecords: !!(newUserInfo.loanRecords && newUserInfo.loanRecords.length > 0),
      hasQuotaAdjustHistory: !!(newUserInfo.quotaAdjustHistory && newUserInfo.quotaAdjustHistory.length > 0)
    })
  }
}, { deep: true })

// 监听loading状态变化
watch(() => loading.value, (newLoading, oldLoading) => {
  addDebugLog('state', `Loading状态变化: ${oldLoading} → ${newLoading}`)
})

// 监听计算属性变化
watch(() => selfProductData.value, (newData) => {
  addDebugLog('computed', 'selfProductData计算属性变化', {
    hasData: !!newData,
    productsCount: newData?.products?.length || 0
  })
})

watch(() => loanProductData.value, (newData) => {
  addDebugLog('computed', 'loanProductData计算属性变化', {
    hasData: !!newData,
    productsCount: newData?.products?.length || 0
  })
})

// 同时监听params和query的变化
watch(() => [route.params.userId, route.query.userId], ([newParamsId, newQueryId], [oldParamsId, oldQueryId]) => {
  console.log('🔄 路由参数变化:', {
    params: { old: oldParamsId, new: newParamsId },
    query: { old: oldQueryId, new: newQueryId }
  })
})

onMounted(async () => {
  console.log('🚀🚀🚀 详情页组件已挂载，开始获取数据 🚀🚀🚀')
  console.log('🚀 当前时间:', new Date().toLocaleString())
  addDebugLog('lifecycle', '组件已挂载，开始初始化')
  
  console.log('🚀 挂载时的路由信息:', {
    params: route.params,
    query: route.query,
    path: route.path,
    name: route.name
  })
  
  console.log('🚀 计算的userId值:', userId.value)
  console.log('🚀 route.params.userId:', route.params.userId)
  console.log('🚀 route.query.userId:', route.query.userId)
  
  addDebugLog('lifecycle', '路由信息检查', {
    params: route.params,
    query: route.query,
    path: route.path,
    userId: userId.value
  })
  
  // 检查初始状态
  addDebugLog('lifecycle', '初始状态检查', {
    userInfo: !!userInfo.value,
    loading: loading.value,
    userId: userId.value,
    showDebugPanel: showDebugPanel.value
  })
  
  // 默认选中自营产品（与a-tabs的key匹配）
  selectedProductType.value = 'self'
  addDebugLog('lifecycle', `默认选中产品类型: ${selectedProductType.value}`)
  
  // 检查userId是否存在
  if (!userId.value) {
    addDebugLog('error', 'userId为空，无法获取数据', {
      params: route.params,
      query: route.query
    })
    Message.error('用户ID不存在，请检查URL参数')
    return
  }
  
  console.log('🚀 准备调用fetchData函数')
  addDebugLog('lifecycle', `准备获取用户数据，userId: ${userId.value}`)
  
  // 启动定时器更新时间戳
  timestampTimer = setInterval(updateTimestamp, 1000)
  addDebugLog('lifecycle', '定时器已启动')
  
  try {
    await fetchData()
    console.log('🚀 fetchData函数调用成功')
    addDebugLog('lifecycle', 'fetchData函数调用成功')
  } catch (error) {
    console.error('🚀 fetchData函数调用失败:', error)
    addDebugLog('error', 'fetchData函数调用失败', {
      message: error.message,
      stack: error.stack
    })
    Message.error(`初始化失败: ${error.message}`)
  }
})

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (timestampTimer) {
    clearInterval(timestampTimer)
    timestampTimer = null
    addDebugLog('lifecycle', '定时器已清理，防止内存泄漏')
  }
})
</script>

<style scoped>
.customer-detail-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* Webkit浏览器滚动条样式 */
.customer-detail-container::-webkit-scrollbar {
  width: 8px;
}

.customer-detail-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.customer-detail-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.customer-detail-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-weight: 500;
}

.back-button:hover {
  color: #165dff;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-size: 14px;
}

.breadcrumb span:last-child {
  color: #1d2129;
  font-weight: 500;
}

.product-tabs-container {
  background: white;
  padding: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  /* 强制显示调试 */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  min-height: 200px;
  border: 3px solid #ff0000 !important;
}

.product-tabs {
  border-bottom: none;
  /* 强制显示调试 */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.product-tabs :deep(.arco-tabs-header) {
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 0;
  /* 强制显示调试 */
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: #f0f0f0 !important;
  min-height: 50px !important;
}

.product-tabs :deep(.arco-tabs-header-title-text) {
  font-size: 14px;
  font-weight: 500;
  color: #86909c;
  transition: all 0.3s ease;
}

.product-tabs :deep(.arco-tabs-header-title.arco-tabs-header-title-active .arco-tabs-header-title-text) {
  color: #165dff;
  font-weight: 600;
}

.product-tabs :deep(.arco-tabs-header-ink) {
  background-color: #165dff;
  height: 2px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 12px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 概览卡片样式 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.overview-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  font-size: 18px;
  color: #1890ff;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.info-item .value.amount {
  color: #1890ff;
  font-family: 'Monaco', 'Menlo', monospace;
}

.info-item .value.negative {
  color: #ff4d4f;
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.left-content,
.right-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e6eb;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-indicator {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--color-primary-light-1);
  color: var(--color-primary-6);
  font-weight: 500;
  white-space: nowrap;
}

.detail-section :deep(.arco-card),
.detail-section :deep(.arco-table),
.detail-section :deep(.arco-list) {
  margin: 0;
  border: none;
  box-shadow: none;
}

.detail-section > *:not(.section-title) {
  padding: 24px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .customer-detail-container {
    max-width: 1200px;
  }
}

@media (max-width: 1200px) {
  .customer-detail-container {
    max-width: 100%;
    padding: 20px;
  }
  
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .overview-cards {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .customer-detail-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .overview-card,
  .detail-section {
    padding: 16px;
  }
  
  .product-tabs-container {
    padding: 0 16px;
  }
  
  .section-title {
    padding: 16px 20px 0 20px;
  }
  
  .detail-section > *:not(.section-title) {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .customer-detail-container {
    padding: 12px;
  }
  
  .header {
    padding: 16px;
  }
  
  .overview-card {
    padding: 16px;
  }
  
  .card-content {
    gap: 8px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .main-content {
    gap: 16px;
  }
  
  .left-content,
  .right-content {
    gap: 16px;
  }
}

/* 统一调试面板样式 */
.unified-debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 600px;
  max-height: 80vh;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
  color: #262626;
}

.debug-controls {
  display: flex;
  gap: 8px;
}

.debug-content {
  max-height: calc(80vh - 60px);
  overflow-y: auto;
  padding: 16px;
}

.debug-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.debug-section:last-child {
  border-bottom: none;
}

.debug-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #1890ff;
  font-weight: 600;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.debug-label {
  color: #8c8c8c;
  min-width: 80px;
}

.debug-value {
  color: #262626;
  font-family: 'Monaco', 'Menlo', monospace;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-flow {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.debug-log-item {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 11px;
  align-items: flex-start;
}

.debug-log-item:last-child {
  border-bottom: none;
}

.debug-timestamp {
  color: #8c8c8c;
  min-width: 60px;
  font-size: 10px;
}

.debug-component {
  min-width: 80px;
  font-weight: 500;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
}

.component-main {
  background-color: #e6f7ff;
  color: #1890ff;
}

.component-api {
  background-color: #f6ffed;
  color: #52c41a;
}

.component-BasicInfo {
  background-color: #fff7e6;
  color: #fa8c16;
}

.component-ProductModules {
  background-color: #f9f0ff;
  color: #722ed1;
}

.component-LoanList {
  background-color: #fff2f0;
  color: #f5222d;
}

.component-CreditList {
  background-color: #f0f9ff;
  color: #1890ff;
}

.component-AdjustmentHistory {
  background-color: #f6ffed;
  color: #52c41a;
}

.debug-message {
  flex: 1;
  color: #262626;
}

.debug-data {
  color: #8c8c8c;
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.component-status-item {
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fafafa;
}

.component-status-item h6 {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: #1890ff;
  font-weight: 600;
}

.status-details {
  font-size: 11px;
  color: #595959;
}

.status-details > div {
  margin-bottom: 2px;
}

.status-success {
  color: #52c41a !important;
  font-weight: 600;
}

.status-error {
  color: #f5222d !important;
  font-weight: 600;
}

.status-loading {
  color: #1890ff !important;
  font-weight: 600;
}

.debug-json {
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
}

.computed-data {
  font-size: 11px;
  max-height: 300px;
  overflow-y: auto;
}

.computed-data > div {
  margin-bottom: 8px;
  padding: 6px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.debug-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.data-inconsistency-warning {
  margin-bottom: 16px;
}

/* 数据流跟踪样式 */
.data-flow-list {
  max-height: 300px;
  overflow-y: auto;
}

.data-flow-item {
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
}

.data-flow-item.status-start {
  border-left: 4px solid #1890ff;
  background-color: #f0f9ff;
}

.data-flow-item.status-success {
  border-left: 4px solid #52c41a;
  background-color: #f6ffed;
}

.data-flow-item.status-error {
  border-left: 4px solid #f5222d;
  background-color: #fff2f0;
}

.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.flow-name, .flow-path {
  font-weight: 500;
  color: #262626;
}

.flow-status {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  color: white;
}

.flow-count, .flow-action {
  padding: 2px 6px;
  background-color: #e6f7ff;
  border-radius: 2px;
  font-size: 12px;
  color: #1890ff;
}

.flow-time {
  font-size: 12px;
  color: #8c8c8c;
}

.flow-data {
  font-size: 12px;
  color: #595959;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 2px;
  white-space: pre-wrap;
  max-height: 100px;
  overflow-y: auto;
}
</style>