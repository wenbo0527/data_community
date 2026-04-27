<template>
  <div class="customer-detail-container">
    
    <!-- 优化后的顶部信息区域 -->
    <div class="customer-header-container">
      <!-- 左侧：客户基本信息卡片 -->
      <div class="customer-basic-card">
        <div class="customer-avatar">
          <a-avatar :size="64" :style="{ backgroundColor: 'var(--subapp-primary)' }">
            {{ userInfo?.basicInfo?.name?.charAt(0) || '客' }}
          </a-avatar>
        </div>
        <div class="customer-info">
          <div class="customer-name-row">
            <span class="customer-name">{{ userInfo?.basicInfo?.name || '未知用户' }}</span>
            <a-tag :color="getStatusColor(userInfo?.basicInfo?.status)" size="small">
              {{ userInfo?.basicInfo?.status || '正常' }}
            </a-tag>
          </div>
          <div class="customer-meta">
            <span>{{ userInfo?.basicInfo?.age || '28' }}岁</span>
            <a-divider direction="vertical" />
            <span>{{ userInfo?.basicInfo?.gender || '男' }}</span>
            <a-divider direction="vertical" />
            <span>统一客户ID：{{ userInfo?.userId || userId }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：关键指标卡片 -->
      <div class="key-metrics-card">
        <div class="metric-item">
          <div class="metric-label">总授信金额</div>
          <div class="metric-value">¥ {{ (userInfo?.totalCredit || 0).toLocaleString() }}</div>
        </div>
        <div class="metric-item highlight">
          <div class="metric-label">总在贷余额</div>
          <div class="metric-value">¥ {{ (userInfo?.usedCredit || 0).toLocaleString() }}</div>
        </div>
      </div>

      <!-- 快捷操作栏 -->
      <div class="quick-actions">
        <HistoryQueryButton :user-id="userId" />
        <a-tooltip content="查看征信">
          <a-button type="text" size="small" @click="handleViewCredit">
            <template #icon><IconSafe /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="查看用信">
          <a-button type="text" size="small" @click="handleViewLoans">
            <template #icon><IconStorage /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip :content="isFavorite ? '取消收藏' : '收藏客户'">
          <a-button type="text" size="small" @click="handleToggleFavorite">
            <template #icon>
              <IconStar :style="{ color: isFavorite ? '#FFB800' : '#86909C' }" />
            </template>
          </a-button>
        </a-tooltip>
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
    <a-skeleton v-if="loading" animation class="skeleton-loader">
      <a-space direction="vertical" :style="{width:'100%'}" size="large">
        <a-skeleton-line :rows="3" :widths="['40%', '80%', '60%']" />
        <a-skeleton-line :rows="2" :widths="['100%', '100%']" />
        <div style="display:flex; gap:16px">
          <a-skeleton-shape shape="square" :style="{width:'200px', height:'100vh'}" />
          <a-skeleton-shape shape="square" :style="{flex:1, height:'100vh'}" />
        </div>
      </a-space>
    </a-skeleton>

    <!-- 错误状态 -->
    <div v-else-if="userInfo && userInfo.error" class="error-container">
      <a-result status="error" :title="userInfo.error" />
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!userInfo && !loading" class="empty-container">
      <a-empty>
        <template #image>
          <IconUserGroup :style="{ fontSize: '48px', color: '#C9CDD4' }" />
        </template>
        暂无客户数据，请检查客户ID是否正确
      </a-empty>
    </div>

    <!-- 主要内容 -->
    <div v-else-if="userInfo && !userInfo.error" class="content">
        
        <!-- 主要内容区域 - 新的两级Tab架构 -->
        <div class="main-content">
          <MainTabs
          :user-info="userInfo"
          :products="userOwnedProducts"
          :credit-info="creditData"
          :collection-records="collectionRecords"
          :loading="loading"
          :show-debug-panel="showDebugPanel"
          @main-tab-change="handleMainTabChange"
          @module-change="handleModuleChange"
        />
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
  </div>
</template>

<script setup lang="ts">
console.log('🔥🔥🔥 DETAIL.VUE SCRIPT SETUP 开始执行 🔥🔥🔥')
console.log('🔥 当前时间:', new Date().toLocaleString())
console.log('🔥 window.location.href:', window.location.href)
console.log('🔥 document.title:', document.title)

// 在页面标题中添加标识
document.title = '🔥 Customer360 Detail - ' + new Date().toLocaleTimeString()

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUserGroup, IconSafe, IconStorage, IconStar, IconRight } from '@arco-design/web-vue/es/icon'
// 删除了不再需要的图标导入
import { fetchUserInfo } from '../../mock/customer360'
import { formatAmount, formatPercent } from '../../utils/formatUtils'
import { useProductStore } from '../../stores/productStore'
import BasicInfo from './components/BasicInfo.vue'
import UserOwnedProducts from './components/UserOwnedProducts.vue'
import CreditList from './components/CreditList.vue'
import LoanList from './components/LoanList.vue'
import AdjustmentHistory from './components/AdjustmentHistory.vue'
import CollectionRecords from './components/CollectionRecords.vue'
import CreditReports from './components/CreditRecords.vue'
import HistoryQueryButton from './components/HistoryQueryButton.vue'
import UserProfile from './components/UserProfile.vue'
import MainTabs from './components/MainTabs.vue'

// 基础响应式变量
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userInfo = ref(null)
const loading = ref(true)
const showDebugPanel = ref(false)
// Tab切换控制
const activeInfoTab = ref('basic') // 默认显示基本信息Tab
const selectedProduct = ref(null)
const isFavorite = ref(false)
const detailExpanded = ref(false)
// 移除了selectedProductType，不再使用产品类型切换

// 移除了调试系统相关的状态变量

// 移除了数据流跟踪相关的函数

// 移除了组件状态更新和调试日志相关的函数

// 移除了手动刷新和调试处理相关的函数

// 用户拥有的产品数据（所有产品都是信贷产品）
const userOwnedProducts = computed(() => {
  if (!userInfo.value || userInfo.value.error) {return []}
  
  const products = []
  const userProducts = userInfo.value.products || []
  
  // 所有产品都是信贷产品
  userProducts.forEach(product => {
    products.push({
      ...product,
      category: '信贷产品',
      type: 'loan'
    })
  })
  
  return products
})

// 产品选项（已简化，不再区分自营和助贷）
const productOptions = ref([
  { label: '全部产品', value: '全部产品' }
])

// 获取用户ID
const userId = computed(() => {
  console.log('📍 详情页获取用户ID，route.params:', route.params)
  console.log('📍 详情页获取用户ID，route.query:', route.query)
  return route.params.userId || route.query.userId
})

// 移除了selfProductData和loanProductData计算属性，改为直接使用userOwnedProducts

const creditData = computed(() => {
  console.log('🔍 creditData计算属性被调用');
  // 优先返回征信报告汇总信息
  if (userInfo.value?.creditReports && userInfo.value.creditReports.length > 0) {
    return userInfo.value.creditReports[0]
  }
  return {}
})
const loanData = computed(() => {
  console.log('🔍 loanData计算属性被调用，使用productStore数据');
  return productStore.loanRecords
})
const adjustmentData = computed(() => {
  console.log('🔍 adjustmentData计算属性被调用，使用productStore数据');
  return productStore.quotaAdjustHistory
})

// 催收记录数据
const collectionRecords = computed(() => {
  if (!userInfo.value || userInfo.value.error) {return []}
  return userInfo.value.collectionRecords || []
})

// 处理主Tab切换
const handleMainTabChange = (tabKey) => {
  console.log('🔄🔥🔥🔥 [MAIN-TAB] 主Tab切换:', tabKey, '!!! 新版本 2026-04-21-10:04 !!!')
}

// 处理模块切换
const handleModuleChange = (moduleKey) => {
  console.log('🔄🔥🔥🔥 [MODULE] 模块切换:', moduleKey, '!!! 新版本 2026-04-21-10:04 !!!')
}

const getStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '逾期': 'red',
    '关闭': 'gray',
    '冻结': 'orange'
  }
  return colorMap[status] || 'blue'
}

const handleViewCredit = () => {
  Message.info('跳转到征信详情')
}

const handleViewLoans = () => {
  Message.info('跳转到用信记录')
}

const handleToggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  Message.success(isFavorite.value ? '已收藏客户' : '已取消收藏')
}

// 数据完整性检查（只检查信贷产品）
const hasDataInconsistency = computed(() => {
  if (!userInfo.value || userInfo.value.error) {return false}
  
  // 检查基本信息是否缺失
  if (!userInfo.value.basicInfo) {return true}
  
  // 检查必要字段是否存在
  const basicInfo = userInfo.value.basicInfo
  if (!basicInfo.name || !basicInfo.idCard || !basicInfo.phone) {return true}
  
  // 检查信贷产品数据一致性
  const products = userInfo.value.products || []
  
  // 如果有信贷产品但没有对应的记录，可能存在不一致
  if (products.length > 0 && (!userInfo.value.loanRecords || userInfo.value.loanRecords.length === 0)) {
    return true
  }
  
  return false
})

// 删除了不再需要的计算属性（creditUtilizationRate, totalAssets, totalLiabilities, riskLevel）

// 获取数据
const fetchData = async () => {
  console.log('🔍 [DEBUG] 开始获取用户数据', { userId: userId.value })
  if (!userId.value) {
    console.log('❌ [DEBUG] 用户ID为空，无法获取数据')
    return
  }
  
  console.log('📡 [DEBUG] 调用fetchUserInfo API', { userId: userId.value })
  loading.value = true
  console.log('⏳ [DEBUG] 设置loading状态为true')
  
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
    
    // 验证响应数据结构
    if (!response) {
      console.log('⚠️ [DEBUG] API返回空数据')
      Message.error('API 返回数据为空')
      return
    }
    
    // 检查API是否返回错误
    if (response.error) {
      console.log('❌ [DEBUG] API返回错误', { error: response.error })
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
    
    // 强制检查渲染条件
    console.log('🎯 [RENDER DEBUG] 渲染条件检查:', {
      userInfoExists: !!userInfo.value,
      userInfoError: userInfo.value?.error,
      shouldRenderMain: !!(userInfo.value && !userInfo.value.error),
      loadingState: loading.value
    })
    
    // 检查关键数据字段
    if (userInfo.value) {
      const products = userInfo.value.products || []
      // 所有产品都是信贷产品
      console.log('📊 关键数据字段检查:', {
        totalProducts: products.length,
        creditRecords: userInfo.value.creditsList?.length || 0,
        loanRecords: userInfo.value.loanRecords?.length || 0,
        adjustmentRecords: userInfo.value.quotaAdjustHistory?.length || 0
      })
    }
    
    // 检查计算属性
    console.log('🧮 计算属性检查:', {
      userOwnedProducts: userOwnedProducts.value?.length || 0,
      creditData: creditData.value?.length || 0,
      loanData: loanData.value?.length || 0,
      adjustmentData: adjustmentData.value?.length || 0
    })
    
    // 验证计算属性是否正确计算
    if (!userOwnedProducts.value || userOwnedProducts.value.length === 0) {
      console.log('⚠️ 用户拥有产品数据为空，可能存在数据结构问题')
    }
    
    // 再次使用nextTick确保所有组件状态更新完成
    await nextTick()
    console.log('🔄 [DEBUG] 组件状态更新后nextTick完成')
    
  } catch (error) {
    console.error('💥 [DEBUG] 获取数据失败', { error: error.message, stack: error.stack })
    Message.error(`获取用户数据失败: ${error.message}`)
  } finally {
    loading.value = false
    console.log('🏁 [DEBUG] 数据获取完成', { 
      loading: loading.value, 
      hasUserInfo: !!userInfo.value,
      userInfoValue: userInfo.value
    })
  }
}

// goBack函数已删除，不再需要返回功能





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

// 处理产品选择
const handleProductSelect = (product) => {
  selectedProduct.value = product
  console.log('选中产品:', product)
}

// 产品统计数据计算属性
const productStats = computed(() => {
  // 所有产品都是信贷产品
  const totalCount = userOwnedProducts.value.length
  
  return {
    total: totalCount,
    creditProducts: {
      count: totalCount,
      label: '信贷产品', 
      hasData: totalCount > 0
    }
  }
})

// 监听路由变化
watch(() => userId.value, (newUserId, oldUserId) => {
  console.log('🔄 路由userId变化:', { oldUserId, newUserId })
  if (newUserId && newUserId !== oldUserId) {
    console.log('🔄 检测到userId变化，重新获取数据')
    fetchData()
  }
})

// 移除userInfo监听器以避免重复刷新
// userInfo的变化会自动触发相关计算属性更新，无需额外监听

// 移除loading状态监听器以避免重复刷新
// loading状态变化不需要额外的监听处理

// 监听计算属性变化
watch(() => userOwnedProducts.value, (newProducts, oldProducts) => {
  console.log('🧮 userOwnedProducts计算属性变化:', {
    hasData: !!newProducts,
    totalCount: newProducts?.length || 0,
    creditProductsCount: newProducts?.length || 0 // 所有产品都是信贷产品
  })
  
  // 只在产品数据真正变化时自动选择第一个产品
  // 避免重复触发导致无限循环
  if (newProducts && newProducts.length > 0 && 
      (!oldProducts || oldProducts.length === 0) && 
      !selectedProduct.value) {
    const firstProduct = newProducts[0]
    selectedProduct.value = firstProduct.productKey
    console.log('🔄 自动选择第一个产品:', firstProduct.productKey, firstProduct.productName)
  }
}, { immediate: false })

// 移除userId变化监听器以避免重复刷新
// 数据获取已在onMounted中处理，无需重复监听userId变化

// 移除路由参数监听器以避免重复刷新
// 路由变化时组件会重新挂载，onMounted会自动处理数据获取

onMounted(async () => {
  // 检查userId是否存在
  if (!userId.value) {
    Message.error('用户ID不存在，请检查URL参数')
    return
  }
  
  try {
    await fetchData()
  } catch (error) {
    console.error('数据获取失败:', error)
    Message.error(`初始化失败: ${error.message}`)
  }
})

onUnmounted(() => {
  // 组件卸载清理
})
</script>

<style scoped>
.customer-detail-container {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 12px;
  background: var(--subapp-bg-secondary);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 优化后的顶部信息区域样式 */
.customer-header-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
}

.customer-basic-card {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.customer-avatar {
  flex-shrink: 0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.customer-meta {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--subapp-text-secondary);
}

.key-metrics-card {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.metric-item.highlight {
  border-left: 3px solid var(--subapp-primary);
  padding-left: 12px;
}

.metric-label {
  font-size: 13px;
  color: var(--subapp-text-tertiary);
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 1px solid #e5e6eb;
}

.detail-collapse {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.detail-collapse :deep(.arco-collapse-item-header) {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 500;
}

.detail-collapse :deep(.arco-collapse-item-content) {
  background: #fff;
  border-radius: 0 0 8px 8px;
  padding: 16px;
  margin-top: 2px;
}

.content {
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子项小于内容高度，从而触发滚动 */
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  width: 100%;
  max-width: 100%;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  gap: 16px;
}

.detail-section {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e6eb;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--subapp-text-primary);
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
  padding: 16px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content {
    padding: 20px;
  }
  
  .main-content {
    padding: 0 20px;
  }
  
  .page-header {
    padding: 16px 20px;
  }
}

@media (max-width: 768px) {
  .customer-detail-container {
    padding: 8px;
  }
  
  .content {
    padding: 12px;
    flex-direction: column;
    gap: 12px;
  }
  
  .main-content {
    padding: 0 12px;
  }
  
  .page-header {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .detail-section {
    padding: 12px;
  }
  
  .detail-sections {
    gap: 12px;
  }
  
  .product-tabs-container {
    padding: 0 12px;
  }
  
  .section-title {
    padding: 12px 16px 6px 16px;
  }
  
  .detail-section > *:not(.section-title) {
    padding: 16px;
  }
  
  .tab-content {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 12px;
  }
  
  .main-content {
    padding: 0 12px;
    gap: 16px;
  }
  
  .page-header {
    padding: 12px;
  }
  
  .card-content {
    gap: 8px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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
  color: var(--subapp-text-primary);
}

.debug-controls {
  display: flex;
  gap: 8px;
}

.debug-content {
  /* 移除内部滚动，使用页面级滚动 */
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
  color: var(--subapp-info);
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
  color: var(--subapp-text-primary);
  font-family: 'Monaco', 'Menlo', monospace;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-flow {
  /* 移除内部滚动，使用页面级滚动 */
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
  color: var(--subapp-info);
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
  color: var(--subapp-info);
}

.component-AdjustmentHistory {
  background-color: #f6ffed;
  color: #52c41a;
}

.debug-message {
  flex: 1;
  color: var(--subapp-text-primary);
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
  color: var(--subapp-info);
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
  color: var(--subapp-info) !important;
  font-weight: 600;
}

.debug-json {
  font-size: 11px;
  /* 移除内部滚动，使用页面级滚动 */
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
}

.computed-data {
  font-size: 11px;
  /* 移除内部滚动，使用页面级滚动 */
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
  border-left: 4px solid var(--subapp-info);
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
  color: var(--subapp-text-primary);
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
  color: var(--subapp-info);
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

/* Tab切换样式 */
.customer-info-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.customer-info-tabs .arco-tabs-nav {
  background: #f8f9fa;
  margin: 0;
  padding: 0 16px;
}

.customer-info-tabs .arco-tabs-tab {
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.customer-info-tabs .arco-tabs-tab:hover {
  color: var(--subapp-info);
}

.customer-info-tabs .arco-tabs-tab-active {
  color: var(--subapp-info);
  font-weight: 600;
}

.customer-info-tabs .arco-tabs-content {
  padding: 0;
}

.tab-content {
  padding: 16px;
  min-height: 300px;
}

.tab-content .section-subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

/* Tab内容区域样式优化 */
.tab-content .basic-info-section,
.tab-content .credit-reports-section,
.tab-content .collection-records-section {
  background: transparent;
}

.tab-content .basic-info-grid {
  margin-top: 0;
}

.tab-content .basic-info-card {
  border: none;
  box-shadow: none;
  background: transparent;
}

.tab-content .credit-reports-container,
.tab-content .collection-records-container {
  background: #fafafa;
  border-radius: 6px;
  padding: 16px;
}

/* 页面标题和操作按钮布局 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
  max-width: 100%;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customer-info-tabs .arco-tabs-nav {
    padding: 0 8px;
  }
  
  .tab-content {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>