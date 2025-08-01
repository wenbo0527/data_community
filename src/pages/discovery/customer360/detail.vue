<template>
  <div class="customer-detail-container">
    <!-- 顶部操作栏 -->
    <div class="header">
      <div class="header-left">
        <a-button @click="goBack" class="back-button" type="text">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回搜索
        </a-button>
        <div class="breadcrumb">
          <span>客户360</span>
          <icon-right />
          <span>客户详情</span>
        </div>
      </div>
      <div class="header-right">
        <a-button @click="exportData" type="outline">
          <template #icon>
            <icon-download />
          </template>
          导出报告
        </a-button>
        <a-button @click="fetchData" type="primary">
          <template #icon>
            <icon-refresh />
          </template>
          刷新数据
        </a-button>
      </div>
    </div>
    
    <!-- 产品切换器 -->
    <div class="product-tabs-container">
      <a-tabs 
        v-model:active-key="selectedProductType" 
        type="line"
        @change="handleProductChange"
        class="product-tabs"
      >
        <a-tab-pane 
          v-for="option in productOptions" 
          :key="option.value" 
          :title="option.label"
        />
      </a-tabs>
    </div>
    
    <div v-if="loading" class="loading-container">
      <a-spin size="large" tip="正在加载客户信息..." />
    </div>
    
    <div v-else-if="userInfo" class="content">
      
      <!-- 详细信息垂直展示 -->
      <div class="detail-sections">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">
            <h3>基本信息</h3>
          </div>
          <BasicInfo :user-info="userInfo" />
        </div>
        
        <!-- 产品信息 -->
        <div class="detail-section">
          <div class="section-title">
            <h3>产品信息</h3>
          </div>
          <ProductInfo :user-info="userInfo" :selected-product="selectedProduct" />
        </div>
        
        <!-- 授信记录 -->
        <div class="detail-section">
          <div class="section-title">
            <h3>授信记录</h3>
          </div>
          <CreditList :credits="userInfo.creditsList" :key="`credits-${userId}-${userInfo.creditsList?.length || 0}`" />
        </div>
        
        <!-- 用信记录 -->
        <div class="detail-section">
          <div class="section-title">
            <h3>用信记录</h3>
          </div>
          <LoanList :loans="userInfo.loanRecords" :key="`loans-${userId}-${userInfo.loanRecords?.length || 0}`" />
        </div>
        
        <!-- 调额历史 -->
        <div class="detail-section">
          <div class="section-title">
            <h3>调额历史</h3>
          </div>
          <AdjustmentHistory :history="userInfo.quotaAdjustHistory" :key="`history-${userId}-${userInfo.quotaAdjustHistory?.length || 0}`" />
        </div>
      </div>
    </div>
    
    <div v-else class="error-container">
      <a-result status="404" title="未找到用户信息">
        <template #subtitle>
          请检查用户ID是否正确，或联系系统管理员
        </template>
        <template #extra>
          <a-button type="primary" @click="goBack">返回搜索</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconArrowLeft, 
  IconRight, 
  IconDownload, 
  IconRefresh,
  IconUser,
  IconStorage,
  IconSafe
} from '@arco-design/web-vue/es/icon'
import { fetchUserInfo } from '../../../mock/customer360'
import { formatAmount, formatPercent } from '../../../utils/calculations'
import BasicInfo from './components/BasicInfo.vue'
import ProductInfo from './components/ProductInfo.vue'
import CreditList from './components/CreditList.vue'
import LoanList from './components/LoanList.vue'
import AdjustmentHistory from './components/AdjustmentHistory.vue'

// 基础响应式变量
const route = useRoute()
const router = useRouter()
const userInfo = ref(null)
const loading = ref(true)
// activeTab 已移除，改为垂直展示
const selectedProduct = ref('')
const selectedProductType = ref('全部产品')

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

// 计算属性
const creditUtilizationRate = computed(() => {
  if (!userInfo.value) return 0
  const { totalCredit, usedCredit } = userInfo.value
  return totalCredit > 0 ? (usedCredit / totalCredit * 100).toFixed(2) : 0
})

const totalAssets = computed(() => {
  if (!userInfo.value) return 0
  const depositTotal = userInfo.value.depositProducts?.reduce((sum, product) => sum + product.balance, 0) || 0
  return depositTotal
})

const totalLiabilities = computed(() => {
  if (!userInfo.value) return 0
  const loanTotal = userInfo.value.loanProducts?.reduce((sum, product) => sum + product.balance, 0) || 0
  return loanTotal
})

const riskLevel = computed(() => {
  if (!userInfo.value) return '未知'
  const { currentOverdueDays, repaymentRate } = userInfo.value
  if (currentOverdueDays > 90) return '高风险'
  if (currentOverdueDays > 30) return '中风险'
  if (repaymentRate < 80) return '中风险'
  return '低风险'
})

// 获取用户数据
const fetchData = async () => {
  console.log('🔥🔥🔥 fetchData函数被调用了！')
  console.log('📊 详情页开始获取数据')
  const currentUserId = userId.value
  console.log('📊 当前用户ID:', currentUserId)
  
  if (!currentUserId) {
    console.log('❌ 缺少用户ID参数，准备跳转回首页')
    Message.error('缺少用户ID参数')
    router.push('/discovery/customer360')
    return
  }
  
  console.log('⏳ 详情页设置loading状态为true')
  loading.value = true
  try {
    console.log('📡 详情页开始调用fetchUserInfo API，用户ID:', currentUserId)
    const data = await fetchUserInfo(currentUserId)
    console.log('📡 详情页API响应结果:', data)
    
    if (data.error) {
      console.log('❌ 详情页API返回错误:', data.message)
      Message.error(data.message || '查询失败')
      return
    }
    
    console.log('✅ 详情页数据获取成功，设置userInfo')
    userInfo.value = data
    console.log('📊 详情页获取到的用户信息:', userInfo.value)
  } catch (error) {
    console.error('❌ 详情页获取用户信息失败:', error)
    console.error('❌ 详情页错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    Message.error('获取用户信息失败')
  } finally {
    console.log('🔄 详情页设置loading状态为false')
    loading.value = false
  }
}

const goBack = () => {
  router.push('/discovery/customer360')
}

const exportData = () => {
  if (!userInfo.value) return
  Message.success('导出功能开发中...')
}

// 处理产品切换
const handleProductChange = (value) => {
  console.log('产品切换:', value)
  selectedProductType.value = value
  // 这里可以根据选择的产品类型过滤显示的数据
  Message.info(`已切换到: ${value}`)
}

// 监听路由变化
watch(() => userId.value, (newUserId, oldUserId) => {
  console.log('🔄 路由userId变化:', { oldUserId, newUserId })
  if (newUserId && newUserId !== oldUserId) {
    console.log('🔄 检测到userId变化，重新获取数据')
    fetchData()
  }
})

// 同时监听params和query的变化
watch(() => [route.params.userId, route.query.userId], ([newParamsId, newQueryId], [oldParamsId, oldQueryId]) => {
  console.log('🔄 路由参数变化:', {
    params: { old: oldParamsId, new: newParamsId },
    query: { old: oldQueryId, new: newQueryId }
  })
})

onMounted(() => {
  console.log('🚀 详情页组件已挂载，开始获取数据')
  console.log('🚀 挂载时的路由信息:', {
    params: route.params,
    query: route.query,
    path: route.path,
    name: route.name
  })
  
  // 默认选中第一个产品
  if (productOptions.value.length > 0) {
    selectedProductType.value = productOptions.value[0].value
  }
  
  console.log('🚀 准备调用fetchData函数')
  try {
    fetchData()
    console.log('🚀 fetchData函数调用成功')
  } catch (error) {
    console.error('🚀 fetchData函数调用失败:', error)
  }
})
</script>

<style scoped>
.customer-detail-container {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
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
}

.product-tabs {
  border-bottom: none;
}

.product-tabs :deep(.arco-tabs-header) {
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 0;
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
  padding: 20px 24px 0 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e6eb;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding-bottom: 16px;
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
  .product-tabs-container {
    padding: 0 16px;
  }
}
</style>