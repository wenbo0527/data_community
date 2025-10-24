<template>
  <div class="coupon-detail-container">
    <a-card class="form-card">
      <div class="page-header">
        <h2 class="page-title">优惠券详情</h2>
        <a-button type="outline" @click="router.back()" style="margin-left: auto">
          <template #icon><icon-left /></template>
          返回
        </a-button>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <a-card class="stat-card">
          <a-statistic title="总发放数量" :value="instanceFormData.totalCount" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="已发放" :value="instanceFormData.issuedCount" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="已使用" :value="instanceFormData.usedCount" />
        </a-card>
        <a-card class="stat-card">
          <a-statistic title="剩余数量" :value="instanceFormData.remainingCount" />
        </a-card>
      </div>

      <a-tabs>
        <a-tab-pane key="template" title="模板参数">
          <template-detail :id="templateId" :readonly="true" disable-operations :hide-back-button="true" />
        </a-tab-pane>
        
        <a-tab-pane key="instance" title="库存参数">
          <a-spin :loading="loading" style="width: 100%">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="券名称">
                {{ instanceFormData.name }}
              </a-descriptions-item>
              <a-descriptions-item label="券状态">
                <a-tag :color="getStatusColor(instanceFormData.status)">
                  {{ getStatusText(instanceFormData.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="审批状态">
                <a-tag :color="getApprovalStatusColor(instanceFormData.approvalStatus)">
                  {{ getApprovalStatusText(instanceFormData.approvalStatus) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="券类型">
                {{ getCouponTypeText(instanceFormData.couponType) }}
              </a-descriptions-item>
              <a-descriptions-item label="发放数量">
                {{ instanceFormData.totalCount }}
              </a-descriptions-item>
              <a-descriptions-item label="已发放">
                {{ instanceFormData.issuedCount }}
              </a-descriptions-item>
              <a-descriptions-item label="已使用">
                {{ instanceFormData.usedCount }}
              </a-descriptions-item>
              <a-descriptions-item label="剩余数量">
                {{ instanceFormData.remainingCount }}
              </a-descriptions-item>
              <a-descriptions-item label="有效期" :span="2">
                {{ formatDateRange(instanceFormData.startTime, instanceFormData.endTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="单日发放上限">
                {{ instanceFormData.dailyLimit }}
              </a-descriptions-item>
              <a-descriptions-item label="单周发放上限">
                {{ instanceFormData.weeklyLimit }}
              </a-descriptions-item>
              <a-descriptions-item label="单月发放上限">
                {{ instanceFormData.monthlyLimit }}
              </a-descriptions-item>
              <a-descriptions-item label="申请人">
                {{ instanceFormData.applicant }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ instanceFormData.createTime }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                {{ instanceFormData.updateTime }}
              </a-descriptions-item>
              <a-descriptions-item label="使用规则" :span="2">
                <div class="rules-content">{{ instanceFormData.rules }}</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="preview" title="券预览">
          <div class="preview-section">
            <div class="preview-header">
              <h3>券预览效果</h3>
              <a-space>
                <a-select v-model="previewDevice" style="width: 120px">
                  <a-option value="mobile">移动端</a-option>
                  <a-option value="desktop">桌面端</a-option>
                </a-select>
                <a-button @click="refreshPreview">
                  <template #icon><icon-refresh /></template>
                  刷新预览
                </a-button>
              </a-space>
            </div>
            <div class="preview-content">
              <coupon-preview 
                :key="previewKey"
                :coupon-data="previewData"
                :usage-description="templateData.usageDescription"
                :device-type="previewDevice"
                :is-rendered="true"
              />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconLeft, IconRefresh } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import TemplateDetail from '../template/detail.vue'
import CouponPreview from '../template/components/CouponPreview.vue'
// import { inventoryAPI, templateAPI } from '@/api/coupon.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const templateId = ref('')
const instanceId = ref('')
const previewKey = ref(0)
const previewDevice = ref('mobile')

// 券库存详情数据
const instanceFormData = ref({
  id: '',
  name: '',
  couponId: '',
  templateId: '',
  couponType: '',
  status: '',
  approvalStatus: '',
  applicant: '',
  totalCount: 0,
  issuedCount: 0,
  usedCount: 0,
  remainingCount: 0,
  startTime: '',
  endTime: '',
  rules: '',
  dailyLimit: 0,
  weeklyLimit: 0,
  monthlyLimit: 0,
  createTime: '',
  updateTime: ''
})

// 券模板数据
const templateData = ref({
  id: '',
  name: '',
  type: '',
  displayName: '',
  usageDescription: '',
  cornerText: '',
  reductionValue: '',
  categoryText: ''
})

// 预览数据
const previewData = computed(() => {
  return {
    id: instanceFormData.value.id,
    name: instanceFormData.value.name,
    displayName: templateData.value.displayName || instanceFormData.value.name,
    type: instanceFormData.value.couponType,
    cornerText: templateData.value.cornerText,
    reductionValue: templateData.value.reductionValue,
    categoryText: templateData.value.categoryText,
    validityPeriod: [instanceFormData.value.startTime, instanceFormData.value.endTime]
  }
})

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'active': 'green',
    'inactive': 'red',
    'expired': 'gray',
    'used': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '有效',
    'inactive': '无效',
    'expired': '已过期',
    'used': '已使用'
  }
  return textMap[status] || '未知'
}

// 获取审批状态颜色
const getApprovalStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colorMap[status] || 'gray'
}

// 获取审批状态文本
const getApprovalStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待审批',
    'approved': '已审批',
    'rejected': '已拒绝'
  }
  return textMap[status] || '未知'
}

// 获取券类型文本
const getCouponTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'interest_free': '免息券',
    'discount': '折扣券',
    'cash': '现金券'
  }
  return textMap[type] || '未知类型'
}

// 格式化日期范围
const formatDateRange = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return '未设置'
  return `${startTime} 至 ${endTime}`
}

// 刷新预览
const refreshPreview = () => {
  previewKey.value++
}

// 获取券库存详情
const fetchInstanceDetail = async () => {
  if (!instanceId.value) return
  
  try {
    loading.value = true
    // 这里使用mock数据，实际应该调用API
    // const response = await inventoryAPI.getInventoryDetail(instanceId.value)
    
    // Mock数据
    instanceFormData.value = {
      id: instanceId.value,
      name: '新用户专享免息券',
      couponId: 'CPN001',
      templateId: templateId.value,
      couponType: 'interest_free',
      status: 'active',
      approvalStatus: 'approved',
      applicant: '张三',
      totalCount: 10000,
      issuedCount: 3500,
      usedCount: 1200,
      remainingCount: 6500,
      startTime: '2024-01-15 00:00:00',
      endTime: '2024-12-31 23:59:59',
      rules: '1. 仅限新用户使用\n2. 每人限用一次\n3. 不可与其他优惠叠加使用\n4. 适用于全平台商品',
      dailyLimit: 100,
      weeklyLimit: 500,
      monthlyLimit: 2000,
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00'
    }
  } catch (error) {
    console.error('获取券库存详情失败:', error)
    Message.error('获取券库存详情失败')
  } finally {
    loading.value = false
  }
}

// 获取券模板详情
const fetchTemplateDetail = async () => {
  if (!templateId.value) return
  
  try {
    // Mock数据
    templateData.value = {
      id: templateId.value,
      name: '新用户专享免息券模板',
      type: 'interest_free',
      displayName: '借6期免前3期优惠券',
      usageDescription: '新用户专享优惠，借款6期免前3期利息，让您轻松享受优质服务。',
      cornerText: '新人专享',
      reductionValue: '3期',
      categoryText: '免息'
    }
  } catch (error) {
    console.error('获取券模板详情失败:', error)
  }
}

onMounted(async () => {
  // 从路由参数获取ID
  templateId.value = route.query.templateId as string || ''
  instanceId.value = route.query.instanceId as string || ''
  
  // 获取数据
  await Promise.all([
    fetchInstanceDetail(),
    fetchTemplateDetail()
  ])
})
</script>

<style scoped>
.coupon-detail-container {
  padding: 20px;
}

.form-card {
  margin-top: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.rules-content {
  white-space: pre-line;
  line-height: 1.6;
  color: #4e5969;
}

.preview-section {
  padding: 20px 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.preview-content {
  background: #f7f8fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preview-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>