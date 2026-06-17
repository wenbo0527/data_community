<template>
  <div class="coupon-detail-container">
    <a-card class="form-card">
      <div class="page-header">
        <h2 class="page-title">优惠券详情</h2>
        <a-button type="outline" @click="goBackAction" style="margin-left: auto">
          <template #icon><IconLeft /></template>
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
          <TemplateDetail :id="templateId" :readonly="true" disable-operations :hide-back-button="true" />
        </a-tab-pane>
        
        <a-tab-pane key="instance" title="库存参数">
          <a-spin :loading="loading" style="width: 100%">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="券名称">
                {{ instanceFormData.name }}
              </a-descriptions-item>
              <a-descriptions-item label="券状态">
                <a-space>
                  <a-tag :color="getStatusColor(instanceFormData.status)">
                    {{ getStatusText(instanceFormData.status) }}
                  </a-tag>
                  <!-- v1.2.8 文博拍板: 临价折扣券无「主动作废」入口(原 detail.vue:49-51 已删)
                       作废=MA 节点重新触发一次新发 → 自动触发 Story-004-2 存量作废(被动作废) -->
                </a-space>
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
                  <template #icon><IconRefresh /></template>
                  刷新预览
                </a-button>
              </a-space>
            </div>
            <div class="preview-content">
              <CouponPreview
                :key="previewKey"
                :coupon-data="previewData"
                :usage-description="templateData.usageDescription"
                :device-type="previewDevice"
                :is-rendered="true"
              />
            </div>
          </div>
        </a-tab-pane>

        <!-- v1.2.6 PRD §11.3 5 状态 + Story-004-2 验收 #9: 发放详情页可查存量作废明细 + 失败原因码
             v1.2.8 文博拍板: 临价折扣券作废=被动作废(MA 节点重新触发新发),
             本 tab 显示「被作废的券实例 ID + 作废时间」明细
             5/26 教训链: failure_code 字段缺失会导致列渲染空白,此处 1:1 对齐 PRD §11.3.1 -->
        <a-tab-pane key="invalidation" title="存量作废明细">
          <a-spin :loading="loading" style="width: 100%">
            <!-- 失败信息区(仅 failed_* 状态显示) -->
            <a-alert
              v-if="isFailedStatus"
              :type="failureAlertType"
              style="margin-bottom: 16px"
            >
              <template #title>
                <span style="font-weight: 500">{{ failureCodeText }} (错误码: {{ instanceFormData.failure_code }})</span>
              </template>
              <div>失败原因: {{ instanceFormData.failure_reason || '系统异常,请联系客服' }}</div>
              <div v-if="instanceFormData.timeout_time" style="margin-top: 4px">
                超时时间: {{ instanceFormData.timeout_time }}
              </div>
            </a-alert>

            <!-- 存量作废明细列表(仅临价折扣券显示) -->
            <a-empty v-if="!isPricedDiscount" description="仅临价折扣券(PRICED_DISCOUNT)展示存量作废明细" />
            <div v-else>
              <h4 style="margin-bottom: 12px">被作废的券实例(同用户同产品)</h4>
              <a-table
                :columns="invalidationColumns"
                :data="invalidationRecords"
                :pagination="false"
                size="small"
                row-key="instance_id"
              />
            </div>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import { IconLeft, IconRefresh } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import TemplateDetail from '../template/detail.vue'
import CouponPreview from '../template/components/CouponPreview.vue'
// import { inventoryAPI, templateAPI } from '@/api/coupon.ts'

const route = useRoute()
const router = useRouter()
const goBackAction = () => goBack(router, '/marketing/benefit/management')

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

// ==================== v1.2.6 PRD §11.3 5 失败态显示 (P0-#3 + P0-#5 + P1-#9 + P1-#11) ====================
//
// PRD v1.2.8 §11.3.1 失败码 1001-1005 + 文案(Q47 拍板中,先用 PRD §11.3.1 占位文案)
//   1001 -> 资质审核未通过
//   1002 -> 系统繁忙,请稍后重试
//   1003 -> 系统异常,已自动回滚
//   1004 -> 系统异常,请联系客服
//   1005 -> 系统异常,请联系客服
// 5/26 教训链: status 与 failure_code 都是字符串 enum,列渲染 1:1
const failureReasonTextMap: Record<number, string> = {
  1001: '资质审核未通过',
  1002: '系统繁忙,请稍后重试',
  1003: '系统异常,已自动回滚',
  1004: '系统异常,请联系客服',
  1005: '系统异常,请联系客服',
}

/** 是否为失败状态(5 个 failed_*) */
const isFailedStatus = computed(() => {
  const s = instanceFormData.value.status
  return typeof s === 'string' && s.startsWith('failed_')
})

/** 失败码文案(用于顶部 alert) */
const failureCodeText = computed(() => {
  const code = instanceFormData.value.failure_code
  if (typeof code === 'number' && failureReasonTextMap[code]) {
    return failureReasonTextMap[code]
  }
  // 备用: 从 status 字符串取尾段作默认文案
  const s = instanceFormData.value.status
  if (typeof s === 'string' && s.startsWith('failed_')) {
    const tail = s.split('_').pop()
    return `失败码 ${tail || '未知'}`
  }
  return '发放失败'
})

/** Alert type: 所有失败都是 red */
const failureAlertType = computed<'error' | 'warning'>(() => {
  // 1002(超时)和 1003(回滚)是 warning(可重试), 其余 error(不可重试)
  const code = instanceFormData.value.failure_code
  return code === 1002 || code === 1003 ? 'warning' : 'error'
})

/** 是否为临价折扣券(决定是否显示存量作废明细) */
const isPricedDiscount = computed(() => {
  return instanceFormData.value.couponType === 'PRICED_DISCOUNT'
})

/** 存量作废明细列定义 (PRD Story-004-2 验收 #9) */
const invalidationColumns = [
  { title: '被作废的券实例 ID', dataIndex: 'instance_id', width: 220 },
  { title: '作废时间', dataIndex: 'invalidated_time', width: 200 },
  { title: '原状态', dataIndex: 'from_status', width: 120 },
  { title: '作废原因', dataIndex: 'reason', slotName: 'reason' },
]

/** 存量作废明细数据 (mock — 实际应从 API 拉取 Story-004-2 同事务产生的作废记录)
 *  5/26 教训链: 字段名与 PRD §11.3 「已作废时间」(`invalidated_time`) 1:1 对齐 */
const invalidationRecords = ref<Array<{
  instance_id: string
  invalidated_time: string
  from_status: string
  reason: string
}>>([])

// 页面加载时拉取存量作废明细(mock 临时数据,真实接 API 后替换)
onMounted(() => {
  // mock: 仅当状态 = 'invalidated' 时展示记录
  if (instanceFormData.value.status === 'invalidated') {
    invalidationRecords.value = [
      {
        instance_id: 'COUPON-INST-20260622-002',
        invalidated_time: instanceFormData.value.invalidated_time || '2026-06-22 11:00:00',
        from_status: '未使用',
        reason: '同用户同产品重新新发,被动作废(Story-004-2 同事务)',
      },
    ]
  } else {
    invalidationRecords.value = []
  }
})

// 获取状态颜色
// v1.2.8 PRD §11.3 用户券状态 (9 态):
//   pending(待确认) / received(未使用) / invalidated(已作废) / expired(已过期)
//   failed_1001_core_rejected(核心拒收) / failed_1002_timeout(超时)
//   failed_1003_invalidation(存量作废) / failed_1004_kafka_push(推送失败)
//   failed_1005_kafka_consume(消费失败)
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'active': 'green',
    'inactive': 'red',
    'expired': 'gray',
    'used': 'blue',
    'received': 'green',
    'invalidated': 'red',
    // v1.2.8 §11.3 扩展 (PRD v1.2.6 失败状态机 + v1.2.7 中文化)
    'pending': 'orange',
    'failed_1001_core_rejected': 'red',
    'failed_1002_timeout': 'red',
    'failed_1003_invalidation': 'red',
    'failed_1004_kafka_push': 'red',
    'failed_1005_kafka_consume': 'red',
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '有效',
    'inactive': '无效',
    'expired': '已过期',
    'used': '已使用',
    'received': '未使用',
    'invalidated': '已作废',
    // v1.2.8 §11.3 扩展 (PRD v1.2.6 失败状态机 + v1.2.7 中文化)
    'pending': '待确认',
    'failed_1001_core_rejected': '核心拒收失败',
    'failed_1002_timeout': '超时失败',
    'failed_1003_invalidation': '存量作废失败',
    'failed_1004_kafka_push': '推送失败',
    'failed_1005_kafka_consume': '消费失败',
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

// v1.2.8 文博拍板: 临价折扣券无「主动作废」入口
// 作废 = MA 节点重新触发一次新发 → 自动触发 Story-004-2 存量作废(被动作废)
// 原 handleInvalidate 函数已删(原 detail.vue:272-289),保留注释占位防止误加回
function _v128_removeHandleInvalidate_NOTE(): void {
  // 占位 - v1.2.8 PRD 拍板: 临价折扣券的「作废」是被动作废,无主动入口
  // 存量作废详见 Story-004-2 (PRD-大额低息临价折扣v1.2.8 §6 / §11.3)
  /* 原实现: Modal.warning({...作废确认弹窗, onOk: instanceFormData.value.status = 'invalidated'}) */
}

// 原 handleInvalidate 的 catch 块占位 (防止上方空 function 引起编译警告)
function _v128_removeHandleInvalidate_catchPlaceholder(_error: unknown): void {
  // v1.2.8 移除 - 原 console.error('作废失败:', error) 走原 catch 分支
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
  color: var(--subapp-text-secondary);
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
