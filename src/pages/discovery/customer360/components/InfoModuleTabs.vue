<template>
  <div class="info-module-tabs">
    <!-- 实时数据区 -->
    <div class="data-zone realtime-zone" v-if="isSudaiProduct">
      <div class="zone-header">
        <div class="zone-title">
          <icon-thunderbolt />
          <span>实时监控</span>
          <a-tag color="green" size="small" class="live-tag">Live</a-tag>
        </div>
        <div class="zone-actions">
          <a-tooltip content="数据反馈">
            <a-button type="text" size="mini" @click="handleFeedback('realtime')">
              <template #icon><icon-bug /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      <div class="zone-content">
        <RealTimeData 
          :product-key="productKey"
          :product-data="productData"
          :user-real-time-data="realTimeData"
          :loading="loading"
        />
      </div>
    </div>

    <!-- 离线数据区 -->
    <div class="data-zone offline-zone">
      <div class="zone-header">
        <div class="zone-title">
          <icon-bar-chart />
          <span>历史经营分析</span>
          <span class="update-time">数据更新于 T-1</span>
        </div>
        <div class="zone-actions">
          <a-tooltip content="数据反馈">
            <a-button type="text" size="mini" @click="handleFeedback('offline')">
              <template #icon><icon-bug /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      
      <a-tabs 
        v-model:active-key="selectedInfoModule" 
        type="line" 
        size="default"
        @change="handleModuleChange"
      >
        <a-tab-pane key="overview" title="客户概览">
          <div class="module-content">
            <CustomerOverview 
              :product-key="productKey"
              :product-data="productData"
              :user-info="userInfo"
              :loading="loading"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="business" title="业务核心明细">
          <div class="module-content">
            <BusinessCoreDetails 
              :product-key="productKey"
              :business-data="businessData"
              :user-info="userInfo"
              :loading="loading"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="marketing" title="营销记录">
          <div class="module-content">
            <MarketingRecords 
              :product-key="productKey"
              :marketing-data="marketingData"
              :user-info="userInfo"
              :loading="loading"
            />
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="product" title="产品信息">
          <div class="module-content">
            <ProductInfo 
              :product-key="productKey"
              :product-data="productData"
              :user-info="userInfo"
              :loading="loading"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 数据反馈抽屉 -->
    <a-drawer 
      v-model:visible="feedbackVisible" 
      title="数据问题反馈" 
      width="400"
      unmount-on-close
      @ok="submitFeedback"
    >
      <a-form :model="feedbackForm" layout="vertical">
        <a-form-item label="反馈来源">
          <a-tag color="blue">{{ feedbackForm.source === 'realtime' ? '实时监控区' : '历史分析区' }}</a-tag>
        </a-form-item>
        <a-form-item label="问题类型" required>
          <a-select v-model="feedbackForm.type" placeholder="请选择问题类型">
            <a-option value="data_error">数据准确性错误</a-option>
            <a-option value="data_missing">数据缺失/未展示</a-option>
            <a-option value="data_outdated">数据更新不及时</a-option>
            <a-option value="other">其他问题</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="问题描述" required>
          <a-textarea 
            v-model="feedbackForm.description" 
            placeholder="请详细描述您发现的数据问题，以便我们快速排查..." 
            :auto-size="{ minRows: 4, maxRows: 8 }"
          />
        </a-form-item>
        <a-form-item label="上传截图 (可选)">
          <a-upload draggable />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="feedbackVisible = false">取消</a-button>
        <a-button type="primary" @click="submitFeedback">提交反馈</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconThunderbolt, IconBarChart, IconBug } from '@arco-design/web-vue/es/icon'
import CustomerOverview from './CustomerOverview.vue'
import BusinessCoreDetails from './BusinessCoreDetails.vue'
import MarketingRecords from './MarketingRecords.vue'
import ProductInfo from './ProductInfo.vue'
import RealTimeData from './RealTimeData.vue'


interface Props {
  productKey: string
  productData?: any
  userInfo?: any
  loading?: boolean
  defaultModule?: string
  showDebugPanel?: boolean
}

interface Emits {
  (e: 'module-change', moduleKey: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  defaultModule: 'overview',
  showDebugPanel: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectedInfoModule = ref<string>(props.defaultModule)

// 计算属性
const currentProductName = computed(() => {
  return props.productData?.productName || '未知产品'
})

const businessData = computed(() => {
  if (!props.userInfo || !props.productKey) return {}
  
  return {
    creditList: props.userInfo.creditsList?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    loanList: props.userInfo.loanRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    adjustmentHistory: props.userInfo.quotaAdjustHistory?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    paymentProcess: props.userInfo.paymentProcessRecords || {}
  }
})

const marketingData = computed(() => {
  if (!props.userInfo || !props.productKey) return {}
  
  return {
    touchRecords: props.userInfo.marketingRecords?.touchRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    benefitRecords: props.userInfo.marketingRecords?.benefitRecords?.filter((item: any) => 
      item.productKey === props.productKey
    ) || [],
    effectAnalysis: props.userInfo.marketingRecords?.effectAnalysis || {}
  }
})

// 检查是否为Su贷产品
const isSudaiProduct = computed(() => {
  return props.productData?.productName?.includes('Su贷') || false;
});

// 实时数据（仅用于Su贷产品）
const realTimeData = computed(() => {
  if (!isSudaiProduct.value) return {};
  
  // 从用户数据中获取实时数据
  const suDaiLoanRecord = props.userInfo.loanRecords?.find((record: any) => 
    record.productName === 'Su贷'
  );
  
  const suDaiCreditRecord = props.userInfo.creditsList?.find((record: any) => 
    record.productName === 'Su贷'
  );
  
  return {
    currentBalance: suDaiLoanRecord?.realTimeBalance || suDaiLoanRecord?.balance || 150000,
    dailyDisbursement: suDaiLoanRecord?.dailyDisbursement || 250000,
    dailyRepayment: suDaiLoanRecord?.dailyRepayment || 180000,
    currentRate: suDaiLoanRecord?.loanRate || 3.9,
    riskScore: suDaiCreditRecord?.riskScore || suDaiLoanRecord?.riskScore || 785,
    overdueDays: suDaiLoanRecord?.overdueDays || 0,
    warningLevel: suDaiCreditRecord?.warningLevel || suDaiLoanRecord?.warningLevel || '低风险',
    availableCredit: suDaiCreditRecord?.availableCredit || suDaiLoanRecord?.availableCredit || 50000
  };
});

// 监听模块变化
watch(
  selectedInfoModule,
  (newModule: string, oldModule: string) => {
    emit('module-change', newModule)
  }
)

// 监听产品变化，重置到概览模块
watch(
  () => props.productKey,
  (newKey: string, oldKey: string) => {
    selectedInfoModule.value = 'overview'
  }
)

// 监听用户信息变化
watch(
  () => props.userInfo,
  (newUserInfo: any, oldUserInfo: any) => {
    // 简化逻辑，移除调试代码
  },
  { deep: true, immediate: true }
)

// 监听loading状态变化
watch(
  () => props.loading,
  (newLoading: boolean, oldLoading: boolean) => {
    // 简化逻辑，移除调试代码
  }
)

// 方法
const handleModuleChange = (moduleKey: string) => {
  selectedInfoModule.value = moduleKey
  emit('module-change', moduleKey)
}

// 数据反馈相关
const feedbackVisible = ref(false)
const feedbackForm = reactive({
  type: '',
  description: '',
  source: ''
})

const handleFeedback = (source: string) => {
  feedbackForm.source = source
  feedbackForm.type = ''
  feedbackForm.description = ''
  feedbackVisible.value = true
}

const submitFeedback = () => {
  Message.success(`反馈提交成功！来源：${feedbackForm.source === 'realtime' ? '实时区' : '离线区'}`)
  feedbackVisible.value = false
}
</script>

<style scoped>
.info-module-tabs {
  background: transparent;
  width: 100%;
}

.data-zone {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
}

.realtime-zone {
  border: 1px solid #e8ffea;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.zone-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.zone-title .arco-icon {
  margin-right: 8px;
  font-size: 18px;
}

.live-tag {
  margin-left: 8px;
  animation: pulse 2s infinite;
}

.update-time {
  font-size: 12px;
  color: #86909c;
  font-weight: normal;
  margin-left: 12px;
}

.zone-content {
  padding: 16px;
}

.module-content {
  padding: 16px;
  min-height: 300px;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* Tab样式优化 - 使用Arco Design */

:deep(.arco-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.arco-tabs .arco-tabs-content-holder) {
  flex: 1;
  overflow: hidden;
}

:deep(.arco-tabs .arco-tabs-content) {
  height: 100%;
}

:deep(.arco-tabs .arco-tabs-tabpane) {
  height: 100%;
  overflow: auto;
}

:deep(.arco-tabs .arco-tabs-nav) {
  margin-bottom: 0;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
}

:deep(.arco-tabs .arco-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  background: transparent;
}

:deep(.arco-tabs .arco-tabs-tab:hover) {
  color: #1890ff;
}

:deep(.arco-tabs .arco-tabs-tab.arco-tabs-tab-active) {
  color: #1890ff;
  font-weight: 600;
}

:deep(.arco-tabs .arco-tabs-nav-ink) {
  background: #1890ff;
  height: 2px;
}
</style>