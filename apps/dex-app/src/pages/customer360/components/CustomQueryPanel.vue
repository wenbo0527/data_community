<template>
  <div class="custom-query-panel">
    <!-- 维度选择 · 4 个 Tab -->
    <a-tabs
      v-model:active-key="activeDimension"
      type="rounded"
      size="small"
      class="dimension-tabs"
    >
      <a-tab-pane key="customer" title="客户维度">
        <template #title>
          <span class="dim-tab-title">
            <IconUser class="dim-tab-icon" />
            客户维度
            <a-tag size="mini" color="gray">{{ dimensionCounts.customer }}</a-tag>
          </span>
        </template>
      </a-tab-pane>
      <a-tab-pane key="customer-product" title="客户-产品维度">
        <template #title>
          <span class="dim-tab-title">
            <IconLink class="dim-tab-icon" />
            客户-产品维度
            <a-tag size="mini" color="arcoblue">{{ dimensionCounts['customer-product'] }}</a-tag>
          </span>
        </template>
      </a-tab-pane>
      <a-tab-pane key="credit-application" title="授信维度">
        <template #title>
          <span class="dim-tab-title">
            <IconBookmark class="dim-tab-icon" />
            授信维度
            <a-tag size="mini" color="purple">{{ dimensionCounts['credit-application'] }}</a-tag>
          </span>
        </template>
      </a-tab-pane>
      <a-tab-pane key="loan-product" title="借据维度">
        <template #title>
          <span class="dim-tab-title">
            <IconStorage class="dim-tab-icon" />
            借据维度
            <a-tag size="mini" color="green">{{ dimensionCounts['loan-product'] }}</a-tag>
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>

    <!-- 当前维度的字段池 -->
    <div class="cq-section">
      <div class="cq-section-title">
        <span>{{ dimensionTitle(activeDimension) }}字段池</span>
        <a-tag v-if="scopeHint" color="gray" size="mini">{{ scopeHint }}</a-tag>
      </div>

      <div class="cq-field-pool">
        <a-checkbox
          :model-value="allSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </a-checkbox>
        <a-divider direction="vertical" />
        <a-checkbox-group
          :model-value="selectedFields[activeDimension]"
          @change="(val: any) => handleFieldChange(val as string[])"
        >
          <a-checkbox
            v-for="f in currentDimensionFields"
            :key="`${activeDimension}-${f.fieldKey}`"
            :value="f.fieldKey"
            :disabled="!f.visible"
          >
            <span class="cq-field-label">
              {{ f.fieldLabel }}
              <a-tag v-if="!f.copyable" color="red" size="mini">不可复制</a-tag>
              <a-tag v-if="!f.searchable" color="orange" size="mini">不可搜索</a-tag>
            </span>
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </div>

    <!-- 借据多行模式（仅借据维度） -->
    <div v-if="activeDimension === 'loan-product' && loanProductScope.length > 0" class="cq-section">
      <div class="cq-section-title">
        <IconLink class="cq-title-icon" />
        <span>选择用信产品（每个产品输出一行）</span>
        <a-tag color="green" size="mini">多行复制</a-tag>
      </div>
      <div class="cq-scope-list">
        <a-checkbox-group
          :model-value="selectedLoanProductIds"
          @change="(val: any) => (selectedLoanProductIds = val as string[])"
        >
          <a-checkbox
            v-for="lp in loanProductScope"
            :key="lp.loanProductId"
            :value="lp.loanProductId"
          >
            <a-tag color="arcoblue" size="mini">{{ lp.loanProductId }}</a-tag>
            <span>{{ lp.loanProductName }}</span>
            <a-tag color="green" size="mini">{{ lp.loans?.length || 0 }} 笔借据</a-tag>
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </div>

    <!-- 摘要 + 操作 -->
    <div class="cq-summary-bar">
      <div class="cq-summary-info">
        <span>
          当前维度 <a-tag size="mini" :color="dimensionTagColor(activeDimension)">
            {{ dimensionTitle(activeDimension) }}
          </a-tag>
        </span>
        <a-divider direction="vertical" />
        <span>已选 <strong>{{ currentSelectedCount }}</strong> 字段</span>
        <a-divider direction="vertical" />
        <span>
          <a-tag v-if="isAsync" color="orange" size="small">异步（30s 内）</a-tag>
          <a-tag v-else color="green" size="small">同步返回</a-tag>
        </span>
        <a-divider direction="vertical" />
        <span v-if="activeDimension === 'loan-product'">
          预计 <strong>{{ totalRows }}</strong> 行（每个用信产品 1 行）
        </span>
      </div>
      <div class="cq-actions">
        <a-button @click="handleClear">清空</a-button>
        <a-button
          type="primary"
          :loading="submitting"
          @click="handleCopy"
        >
          <template #icon><IconCopy /></template>
          一键复制（{{ copyableCount }} 字段 · {{ totalRows }} 行）
        </a-button>
      </div>
    </div>

    <!-- 复制结果预览 -->
    <div v-if="previewText" class="cq-preview">
      <div class="cq-preview-title">
        <IconEye />
        复制预览（Tab 分隔 · {{ previewRows }} 行）
      </div>
      <pre class="cq-preview-content">{{ previewText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconLink,
  IconCopy,
  IconEye,
  IconUser,
  IconBookmark,
  IconStorage
} from '@arco-design/web-vue/es/icon'
import { useFieldPermissionStore, type FieldDimension } from '../stores/fieldPermission'

const props = defineProps<{
  userInfo?: any
  sessionId?: string
}>()

const emit = defineEmits<{
  'audit-copy': [payload: any]
}>()

const fieldStore = useFieldPermissionStore()

// 当前维度（默认 customer）
const activeDimension = ref<FieldDimension>('customer')

// 维度标签映射
const dimensionTitle = (dim: FieldDimension): string => {
  const map: Record<FieldDimension, string> = {
    customer: '客户',
    'customer-product': '客户-产品',
    'credit-application': '授信',
    'loan-product': '借据'
  }
  return map[dim]
}

const dimensionTagColor = (dim: FieldDimension) => {
  const map: Record<FieldDimension, string> = {
    customer: 'gray',
    'customer-product': 'arcoblue',
    'credit-application': 'purple',
    'loan-product': 'green'
  }
  return map[dim]
}

// 各维度字段数
const dimensionCounts = computed(() => {
  const out: Record<FieldDimension, number> = {
    customer: 0,
    'customer-product': 0,
    'credit-application': 0,
    'loan-product': 0
  }
  ;(Object.keys(fieldStore.availableFieldPool) as FieldDimension[]).forEach(d => {
    out[d] = fieldStore.availableFieldPool[d].length
  })
  return out
})

// 当前维度的可用字段
const currentDimensionFields = computed(() =>
  fieldStore.availableFieldPool[activeDimension.value] || []
)

// 已选字段（按维度分组）
const selectedFields = ref<Record<FieldDimension, string[]>>({
  customer: [],
  'customer-product': [],
  'credit-application': [],
  'loan-product': []
})

// 全选 / 半选
const allSelected = computed(() => {
  const total = currentDimensionFields.value.length
  const cur = selectedFields.value[activeDimension.value]
  return total > 0 && cur.length === total
})

const isIndeterminate = computed(() => {
  const total = currentDimensionFields.value.length
  const cur = selectedFields.value[activeDimension.value]
  return cur.length > 0 && cur.length < total
})

const handleSelectAllChange = (val: boolean | string | number) => {
  const boolVal = Boolean(val)
  if (boolVal) {
    selectedFields.value[activeDimension.value] = currentDimensionFields.value.map(f => f.fieldKey)
  } else {
    selectedFields.value[activeDimension.value] = []
  }
}

const handleFieldChange = (val: string[]) => {
  selectedFields.value[activeDimension.value] = val
}

// 当前维度已选数
const currentSelectedCount = computed(() =>
  selectedFields.value[activeDimension.value].length
)

// 借据维度：可选的用信产品（loanProducts）
const loanProductScope = computed(() => {
  return props.userInfo?.loanProducts || []
})

// 借据维度：当前选中的用信产品 ID（多选）
const selectedLoanProductIds = ref<string[]>([])

// 默认勾选所有用信产品
watch(loanProductScope, (list) => {
  if (selectedLoanProductIds.value.length === 0 && list.length > 0) {
    selectedLoanProductIds.value = list.map((lp: any) => lp.loanProductId)
  }
}, { immediate: true })

// 当前维度的 scope hint（基于 mock 数据动态计算）
const scopeHint = computed(() => {
  if (activeDimension.value === 'customer') {
    return '当前客户'
  }
  if (activeDimension.value === 'customer-product') {
    const products = props.userInfo?.products || []
    return `共 ${products.length} 个产品`
  }
  if (activeDimension.value === 'credit-application') {
    const apps = props.userInfo?.creditApplications || []
    return `共 ${apps.length} 个授信申请`
  }
  if (activeDimension.value === 'loan-product') {
    const lps = props.userInfo?.loanProducts || []
    return `共 ${lps.length} 个用信产品`
  }
  return ''
})

// 当前维度可复制的字段数
const copyableCount = computed(() =>
  selectedFields.value[activeDimension.value].filter(k =>
    fieldStore.isCopyable(k)
  ).length
)

// 异步任务（> 30 字段）
const isAsync = computed(() =>
  selectedFields.value[activeDimension.value].length > 30
)

// 借据维度：总行数（用信产品数）
const totalRows = computed(() => {
  if (activeDimension.value === 'loan-product') {
    return selectedLoanProductIds.value.length || 1
  }
  return 1
})

const submitting = ref(false)
const previewText = ref('')
const previewRows = computed(() => previewText.value.split('\n').filter(Boolean).length)

const handleClear = () => {
  selectedFields.value[activeDimension.value] = []
  previewText.value = ''
}

// ============== 字段值提取（按维度） ==============
// 客户维度
const extractCustomerValue = (key: string): string => {
  const info = props.userInfo || {}
  const cr = info.creditsList?.[0] || {}
  const map: Record<string, string> = {
    name: info.name || '',
    idCard: info.idCard || '',
    phone: info.phone || '',
    gender: info.gender || '',
    birthDate: info.birthDate || '',
    email: info.email || '',
    address: info.address || '',
    company: info.company || '',
    customerLevel: info.customerLevel || info.customerLevelName || '',
    occupation: info.occupation || '',
    annualIncome: info.annualIncome ? `¥${info.annualIncome}` : '',
    marriage: info.marriage || '',
    creditScore: String(info.creditScore || ''),
    creditLevel: info.creditLevel || '',
    totalCredit: String(info.totalCredit || ''),
    usedCredit: String(info.usedCredit || '')
  }
  return map[key] || '-'
}

// 客户-产品维度（基于当前选中授信产品）
const extractCustomerProductValue = (key: string): string => {
  const info = props.userInfo || {}
  // 默认取当前选中的产品（detail.vue 中 currentSelectedProduct）
  const currentProduct = info.currentSelectedProduct
  const product = currentProduct || (info.products || [])[0] || {}
  const map: Record<string, string> = {
    productName: product.productName || '',
    productCode: product.productCode || '',
    creditProductId: product.creditProductId || '',
    amount: String(product.amount || ''),
    balance: String(product.balance || ''),
    interestRate: product.interestRate || product.rate ? `${product.interestRate || product.rate}%` : '',
    startDate: product.startDate || '',
    maturityDate: product.maturityDate || '',
    creditTime: product.creditTime || '',
    creditStatus: product.creditStatus || '',
    bank: product.bank || '',
    productType: product.productType || '',
    thirdPartyLoanId: product.thirdPartyLoanId || ''
  }
  return map[key] || '-'
}

// 授信维度（基于授信申请 ID · 单行）
const extractCreditAppValue = (key: string): string => {
  const info = props.userInfo || {}
  const apps = info.creditApplications || []
  const loans = info.loanRecords || []
  // 当前选中的授信申请（如未选，取第一个）
  const currentApp = apps[0] || {}
  // 该授信申请下的用信产品
  const myLoans = loans.filter((l: any) =>
    l.creditApplicationId === currentApp.creditApplicationId
  )
  const totalLoanAmount = myLoans.reduce((s: number, l: any) => s + Number(l.amount || 0), 0)
  const overdue = myLoans.filter((l: any) => l.overdueDays > 0)
  const overdueAmount = overdue.reduce((s: number, l: any) =>
    s + Number(l.remainingPenalty || 0), 0)
  // 用信产品数（去重 loanProductId）
  const loanProductSet = new Set(myLoans.map((l: any) => l.loanProductId).filter(Boolean))

  const map: Record<string, string> = {
    creditApplicationId: currentApp.creditApplicationId || '',
    creditProductId: currentApp.creditProductId || '',
    productName: info.products?.find((p: any) => p.creditProductId === currentApp.creditProductId)?.productName || '',
    appliedAt: currentApp.appliedAt || '',
    approvedBy: currentApp.approvedBy || '',
    status: currentApp.status || '',
    loanProductCount: String(loanProductSet.size),
    totalLoanAmount: String(totalLoanAmount),
    totalLoanCount: String(myLoans.length),
    overdueCount: String(overdue.length),
    overdueAmount: String(overdueAmount)
  }
  return map[key] || '-'
}

// 借据维度（每个用信产品一行）
const extractLoanProductValue = (key: string, loanProductId?: string): string => {
  const info = props.userInfo || {}
  const lp = (info.loanProducts || []).find((p: any) => p.loanProductId === loanProductId) || {}
  const loans = (info.loanRecords || []).filter((l: any) => l.loanProductId === loanProductId)
  const firstLoan = loans[0] || {}

  const map: Record<string, string> = {
    // 用信产品维度
    loanProductId: lp.loanProductId || '',
    loanProductName: lp.loanProductName || '',
    creditApplicationId: lp.creditApplicationId || '',
    createdAt: lp.createdAt || '',
    // 借据维度（每个 loanRecord 一行）
    id: firstLoan.id || '',
    loanNo: firstLoan.loanNo || '',
    productName: firstLoan.productName || '',
    amount: String(firstLoan.amount || ''),
    balance: String(firstLoan.balance || ''),
    loanDate: firstLoan.loanDate || '',
    status: firstLoan.status || '',
    contractNo: firstLoan.contractNo || '',
    channel: firstLoan.channel || '',
    installments: String(firstLoan.installments || ''),
    currentPeriod: String(firstLoan.currentPeriod || ''),
    overdueDays: String(firstLoan.overdueDays || 0),
    maxOverdueDays: String(firstLoan.maxOverdueDays || 0),
    settlementDate: firstLoan.settlementDate || '',
    remainingPrincipal: String(firstLoan.remainingPrincipal || ''),
    remainingInterest: String(firstLoan.remainingInterest || ''),
    remainingPenalty: String(firstLoan.remainingPenalty || ''),
    remainingTotal: String(firstLoan.remainingTotal || ''),
    result: firstLoan.result || '',
    rejectReason: firstLoan.rejectReason || '',
    thirdPartyCustomerId: firstLoan.thirdPartyCustomerId || '',
    productKey: firstLoan.productKey || '',
    interestRate: firstLoan.interestRate ? `${firstLoan.interestRate}%` : ''
  }
  return map[key] || '-'
}

const extractFieldValue = (key: string, rowContext?: { loanProductId?: string }): string => {
  switch (activeDimension.value) {
    case 'customer':
      return extractCustomerValue(key)
    case 'customer-product':
      return extractCustomerProductValue(key)
    case 'credit-application':
      return extractCreditAppValue(key)
    case 'loan-product':
      return extractLoanProductValue(key, rowContext?.loanProductId)
  }
}

// ============== 复制（R06：Tab 分隔 + R10：审计） ==============
const handleCopy = async () => {
  const fields = selectedFields.value[activeDimension.value]
  if (fields.length === 0) {
    Message.warning('请先选择字段')
    return
  }
  submitting.value = true
  try {
    if (isAsync.value) {
      await new Promise(r => setTimeout(r, 600))
    }

    // 过滤 copyable=true 的字段
    const copyableFields = fields.filter(k => fieldStore.isCopyable(k))
    const header = copyableFields.map(k => fieldStore.getField(k)?.fieldLabel || k).join('\t')

    const lines: string[] = [header]

    // 各维度的行模式
    if (activeDimension.value === 'loan-product' && selectedLoanProductIds.value.length > 0) {
      // 借据维度：每个用信产品一行
      for (const lpId of selectedLoanProductIds.value) {
        const row = copyableFields.map(k => extractFieldValue(k, { loanProductId: lpId })).join('\t')
        lines.push(row)
      }
    } else if (activeDimension.value === 'credit-application') {
      // 授信维度：每个授信申请一行
      const apps = props.userInfo?.creditApplications || []
      const targets = apps.length > 0 ? apps : [null]
      for (const app of targets) {
        const row = copyableFields.map(k => extractCreditAppValue(k)).join('\t')
        lines.push(row)
      }
    } else if (activeDimension.value === 'customer-product') {
      // 客户-产品维度：每个产品一行
      const products = props.userInfo?.products || []
      for (const p of products) {
        const row = copyableFields.map(k => extractCustomerProductValue(k)).join('\t')
        lines.push(row)
      }
    } else {
      // 客户维度：单行
      const row = copyableFields.map(k => extractFieldValue(k)).join('\t')
      lines.push(row)
    }

    const text = lines.join('\n')

    // 写入剪贴板
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }

    const auditLogId = `AUD-${Date.now()}`
    emit('audit-copy', {
      userId: 'CS-001',
      customerId: props.userInfo?.idCard || 'unknown',
      fieldList: copyableFields,
      sessionId: props.sessionId || 'session-001',
      dimension: activeDimension.value,
      rowCount: lines.length - 1,
      auditLogId
    })

    previewText.value = text
    Message.success(`已复制 ${copyableFields.length} 字段 · ${lines.length - 1} 行 · 审计 ${auditLogId}`)
  } catch (e: any) {
    Message.error(`复制失败：${e.message}`)
  } finally {
    submitting.value = false
  }
}

// 默认勾选当前维度的核心字段
watch(activeDimension, (dim) => {
  if (selectedFields.value[dim].length > 0) {return}
  const pool = fieldStore.availableFieldPool[dim]
  const priorityMap: Record<FieldDimension, string[]> = {
    customer: ['name', 'phone', 'creditScore', 'totalCredit', 'usedCredit'],
    'customer-product': ['productName', 'creditProductId', 'amount', 'balance', 'interestRate'],
    'credit-application': ['creditApplicationId', 'creditProductId', 'totalLoanCount', 'totalLoanAmount', 'overdueCount'],
    'loan-product': ['loanProductId', 'loanProductName', 'loanNo', 'amount', 'balance', 'status']
  }
  const priority = priorityMap[dim] || []
  selectedFields.value[dim] = priority.filter(k => pool.some(f => f.fieldKey === k))
  if (selectedFields.value[dim].length === 0) {
    selectedFields.value[dim] = pool.slice(0, 5).map(f => f.fieldKey)
  }
}, { immediate: true })
</script>

<style scoped>
.custom-query-panel {
  padding: 4px 0;
}

/* 维度 Tab */
.dimension-tabs {
  margin-bottom: 16px;
}

.dim-tab-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dim-tab-icon {
  font-size: 14px;
}

/* 字段池 section */
.cq-section {
  margin-bottom: 16px;
}

.cq-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--subapp-text-primary);
  margin-bottom: 8px;
}

.cq-title-icon {
  font-size: 14px;
  color: var(--subapp-info);
}

.cq-field-pool {
  padding: 12px;
  background: #fafbfc;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  max-height: 200px;
  overflow-y: auto;
}

.cq-field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

/* 借据多行 scope */
.cq-scope-list {
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

/* 摘要 + 操作 */
.cq-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(180deg, rgba(24, 144, 255, 0.04) 0%, transparent 100%);
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.cq-summary-info {
  font-size: 13px;
  color: var(--subapp-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.cq-actions {
  display: flex;
  gap: 8px;
}

/* 复制预览 */
.cq-preview {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.cq-preview-title {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #fafbfc;
  font-size: 12px;
  font-weight: 500;
  color: var(--subapp-text-secondary);
  border-bottom: 1px solid #f0f0f0;
}

.cq-preview-content {
  margin: 0;
  padding: 12px;
  background: #f7f8fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--subapp-text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}
</style>