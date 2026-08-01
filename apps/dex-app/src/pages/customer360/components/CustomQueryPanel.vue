<template>
  <div class="custom-query-panel">
    <!-- 字段池选择 -->
    <div class="cq-section">
      <div class="cq-section-title">
        <span>字段池范围</span>
        <a-select
          v-model="fieldPoolScope"
          size="small"
          style="width: 200px; margin-left: 8px"
        >
          <a-option value="all">全部字段</a-option>
          <a-option value="customer">客户基本信息</a-option>
          <a-option value="credit">授信信息</a-option>
          <a-option value="loan">用信信息</a-option>
          <a-option value="creditReport">征信信息</a-option>
        </a-select>
      </div>

      <div class="cq-field-pool">
        <a-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </a-checkbox>
        <a-divider direction="vertical" />
        <a-checkbox-group
          v-model="selectedFields"
          @change="handleFieldChange"
        >
          <a-checkbox
            v-for="f in filteredFieldPool"
            :key="f.fieldKey"
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

    <!-- 嵌套路径示例 -->
    <div class="cq-section">
      <div class="cq-section-title">
        <IconLink class="cq-title-icon" />
        <span>嵌套路径示例</span>
      </div>
      <div class="cq-nested-path">
        <a-tag
          v-for="key in selectedFields.slice(0, 3)"
          :key="key"
          color="arcoblue"
          size="small"
        >
          {{ formatPath(key) }}
        </a-tag>
        <a-tag
          v-if="selectedFields.length > 3"
          color="gray"
          size="small"
        >
          +{{ selectedFields.length - 3 }}
        </a-tag>
      </div>
    </div>

    <!-- 摘要 + 操作 -->
    <div class="cq-summary-bar">
      <div class="cq-summary-info">
        <span>已选 <strong>{{ selectedFields.length }}</strong> 字段</span>
        <a-divider direction="vertical" />
        <span>
          预计：
          <a-tag v-if="isAsync" color="orange" size="small">异步（30s 内）</a-tag>
          <a-tag v-else color="green" size="small">同步返回</a-tag>
        </span>
        <a-divider direction="vertical" />
        <span class="cq-cache-info">
          <IconStorage />
          缓存命中：<strong>{{ cacheHit ? '是' : '否' }}</strong>
        </span>
      </div>
      <div class="cq-actions">
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :loading="submitting"
          @click="handleCopy"
        >
          <template #icon><IconCopy /></template>
          一键复制（{{ copyableCount }} 字段）
        </a-button>
      </div>
    </div>

    <!-- 复制结果预览 -->
    <div v-if="previewText" class="cq-preview">
      <div class="cq-preview-title">
        <IconEye />
        复制预览（Tab 分隔 · {{ previewRows.length }} 行）
      </div>
      <pre class="cq-preview-content">{{ previewText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconLink, IconCopy, IconStorage, IconEye } from '@arco-design/web-vue/es/icon'
import { useFieldPermissionStore } from '../stores/fieldPermission'

const props = defineProps<{
  userInfo?: any
  sessionId?: string
}>()

const emit = defineEmits<{
  'audit-copy': [payload: {
    userId: string
    customerId: string
    fieldList: string[]
    sessionId: string
    auditLogId: string
  }]
}>()

const fieldStore = useFieldPermissionStore()

// 字段池范围
const fieldPoolScope = ref<string>('all')

// 已选字段
const selectedFields = ref<string[]>([])

const isIndeterminate = computed(() =>
  selectedFields.value.length > 0 &&
  selectedFields.value.length < filteredFieldPool.value.length
)

// 过滤后的字段池
const filteredFieldPool = computed(() => {
  const all = fieldStore.availableFieldPool
  if (fieldPoolScope.value === 'all') {return all}
  return all.filter(f => f.fieldKey.startsWith(fieldPoolScope.value + '.'))
})

const selectAll = computed({
  get: () => filteredFieldPool.value.length > 0 &&
            filteredFieldPool.value.every(f => selectedFields.value.includes(f.fieldKey)),
  set: (val: boolean) => {
    if (val) {
      selectedFields.value = filteredFieldPool.value.map(f => f.fieldKey)
    } else {
      selectedFields.value = []
    }
  }
})

const handleSelectAllChange = (val: boolean) => {
  if (val) {
    selectedFields.value = filteredFieldPool.value.map(f => f.fieldKey)
  } else {
    selectedFields.value = []
  }
}

const handleFieldChange = (val: string[]) => {
  selectedFields.value = val
}

// 已选字段中可复制的数量（R06：仅 copyable=true 的字段进入剪贴板）
const copyableCount = computed(() => {
  return selectedFields.value.filter(key => fieldStore.isCopyable(key)).length
})

// 是否走异步任务（PRD §4.4 R03：> 30 字段走异步 worker）
const isAsync = computed(() => selectedFields.value.length > 30)

// 5 分钟缓存命中（PRD §4.4 R05）
const cacheHit = computed(() => {
  const key = `cache_${props.userInfo?.id || 'unknown'}_${selectedFields.value.sort().join(',')}`
  const cached = sessionStorage.getItem(key)
  return !!cached
})

const formatPath = (key: string) => {
  // customer.idCard → 客户.基本信息.身份证号
  // creditReport.creditOverview.totalCreditLimit → 征信.信用总览.总授信额度
  const map: Record<string, string> = {}
  fieldStore.fields.forEach(f => { map[f.fieldKey] = f.fieldLabel })

  // 顶层映射
  const topMap: Record<string, string> = {
    customer: '客户',
    credit: '授信',
    loan: '用信',
    creditReport: '征信'
  }

  // 嵌套段映射（creditReport.* 的第二段）
  const subMap: Record<string, string> = {
    creditOverview: '信用总览',
    overdueInfo: '逾期信息',
    queryRecords: '查询记录'
  }

  // 优先取完整 fieldLabel（如「征信报告-额度使用率」）
  if (map[key]) {return map[key]}

  // 降级拼接：topMap[顶层] + 段名 + 末段
  const parts = key.split('.')
  const top = parts[0]
  const topLabel = topMap[top] || top
  if (parts.length === 2) {
    return `${topLabel}.${parts[1]}`
  }
  if (parts.length >= 3) {
    const mid = parts[1]
    const last = parts[parts.length - 1]
    const midLabel = subMap[mid] || mid
    return `${topLabel}.${midLabel}.${last}`
  }
  return key
}

const submitting = ref(false)
const previewText = ref('')
const previewRows = computed(() => previewText.value.split('\n').filter(Boolean))

const handleCancel = () => {
  selectedFields.value = []
  previewText.value = ''
}

// 实际从 userInfo 抽取字段值（PRD §视图 3 Tab 2）
const extractFieldValue = (key: string): string => {
  const info = props.userInfo || {}
  const cr = info.creditsList?.[0] || {}           // 第一份征信报告
  const overview = cr.creditOverview || {}
  const overdue = cr.overdueInfo || {}
  const queryRec = cr.queryRecords || {}

  const map: Record<string, string> = {
    // ===== 客户基本信息 =====
    'customer.name':          info.name || '',
    'customer.idCard':        info.idCard || '',
    'customer.phone':         info.phone || '',
    'customer.gender':        info.gender || '',
    'customer.birthDate':     info.birthDate || '',
    'customer.email':         info.email || '',
    'customer.address':       info.address || '',
    'customer.company':       info.company || '',
    'customer.customerLevel': info.customerLevel || info.customerLevelName || '',
    'customer.occupation':    info.occupation || '',
    'customer.annualIncome':  info.annualIncome ? `¥${info.annualIncome}` : '',
    'customer.marriage':      info.marriage || '',

    // ===== 授信信息 =====
    'credit.creditProductId':     info.creditProductId || '',
    'credit.creditApplicationId': info.creditApplicationId || '',
    'credit.amount':              String(info.totalCredit || ''),
    'credit.balance':             String(info.usedCredit || ''),
    'credit.interestRate':        '4.35%',
    'credit.startDate':           info.startDate || '',
    'credit.maturityDate':        info.maturityDate || '',
    'credit.productName':         info.productName || '',
    'credit.creditTime':          info.creditTime || '',
    'credit.bank':                info.bank || '',
    'credit.creditStatus':        info.creditStatus || '',

    // ===== 用信信息（默认从第一条 loanRecord 取值；实际可由表格循环注入） =====
    'loan.id':                   info.id || '',
    'loan.loanNo':               info.loanNo || '',
    'loan.loanProductId':        info.loanProductId || '',
    'loan.loanProductName':      info.loanProductName || '',
    'loan.amount':               String(info.amount || ''),
    'loan.balance':              String(info.balance || ''),
    'loan.loanDate':             info.loanDate || '',
    'loan.status':               info.status || '',
    'loan.contractNo':           info.contractNo || '',
    'loan.channel':              info.channel || '',
    'loan.installments':         String(info.installments || ''),
    'loan.currentPeriod':        String(info.currentPeriod || ''),
    'loan.overdueDays':          String(info.overdueDays || 0),
    'loan.maxOverdueDays':       String(info.maxOverdueDays || 0),
    'loan.settlementDate':       info.settlementDate || '',
    'loan.remainingPrincipal':   String(info.remainingPrincipal || ''),
    'loan.remainingInterest':    String(info.remainingInterest || ''),
    'loan.remainingPenalty':     String(info.remainingPenalty || ''),
    'loan.remainingTotal':       String(info.remainingTotal || ''),
    'loan.result':               info.result || '',
    'loan.rejectReason':         info.rejectReason || '',
    'loan.thirdPartyCustomerId': info.thirdPartyCustomerId || '',
    'loan.productKey':           info.productKey || '',

    // ===== 征信信息 =====
    'creditReport.score':       String(info.creditScore || ''),
    'creditReport.level':       info.creditLevel || '',
    'creditReport.queryDate':   cr.queryDate || '',
    'creditReport.utilization': String(info.creditUtilizationRate || ''),
    'creditReport.reportId':    cr.reportId || '',
    'creditReport.source':      cr.source || '',
    'creditReport.reportStatus': cr.reportStatus || '',
    'creditReport.creditOverview.creditCardAccounts':   String(overview.creditCardAccounts || ''),
    'creditReport.creditOverview.loanAccounts':         String(overview.loanAccounts || ''),
    'creditReport.creditOverview.totalCreditLimit':     String(overview.totalCreditLimit || ''),
    'creditReport.creditOverview.usedCredit':           String(overview.usedCredit || ''),
    'creditReport.creditOverview.creditUtilizationRate': String(overview.creditUtilizationRate || ''),
    'creditReport.overdueInfo.overdueCount':          String(overdue.overdueCount || ''),
    'creditReport.overdueInfo.maxOverdueDays':        String(overdue.maxOverdueDays || ''),
    'creditReport.overdueInfo.overdueAmount':         String(overdue.overdueAmount || ''),
    'creditReport.overdueInfo.currentOverdueCount':   String(overdue.currentOverdueCount || 0),
    'creditReport.queryRecords.totalQueryCount':      String(queryRec.totalQueryCount || ''),
    'creditReport.queryRecords.queriesLast3Months':    String(queryRec.queriesLast3Months || '')
  }
  return map[key] || '-'
}

// 一键复制（R06：Tab 分隔纯文本 + R10：审计追溯）
const handleCopy = async () => {
  if (selectedFields.value.length === 0) {
    Message.warning('请先选择字段')
    return
  }
  submitting.value = true
  try {
    // 模拟异步任务（>30 字段走异步）
    if (isAsync.value) {
      await new Promise(r => setTimeout(r, 800))
    }

    // 过滤：仅 copyable=true 的字段进入剪贴板（R06）
    const copyableFields = selectedFields.value.filter(k => fieldStore.isCopyable(k))

    // 构造表头 + 数据行
    const header = copyableFields.map(k => formatPath(k)).join('\t')
    const values = copyableFields.map(k => extractFieldValue(k)).join('\t')
    const text = `${header}\n${values}`

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

    // R10: 审计追溯
    const auditLogId = `AUD-${Date.now()}`
    emit('audit-copy', {
      userId: 'CS-001',  // mock 当前用户
      customerId: props.userInfo?.idCard || 'unknown',
      fieldList: copyableFields,
      sessionId: props.sessionId || 'session-001',
      auditLogId
    })

    previewText.value = text
    Message.success(`已复制 ${copyableFields.length} 个字段到剪贴板 · 审计 ${auditLogId}`)
  } catch (e: any) {
    Message.error(`复制失败：${e.message}`)
  } finally {
    submitting.value = false
  }
}

// 默认勾选前 8 个字段（演示：覆盖客户+授信+用信+征信）
watch(filteredFieldPool, (pool) => {
  if (selectedFields.value.length === 0 && pool.length > 0) {
    // 优先勾选核心字段
    const priority = [
      'customer.name', 'customer.phone', 'customer.idCard',
      'credit.creditProductId', 'credit.amount', 'credit.balance',
      'loan.loanNo', 'loan.balance', 'loan.status',
      'creditReport.score', 'creditReport.level'
    ]
    selectedFields.value = priority.filter(k => pool.some(f => f.fieldKey === k))
    if (selectedFields.value.length === 0) {
      selectedFields.value = pool.slice(0, 8).map(f => f.fieldKey)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.custom-query-panel {
  padding: 4px 0;
}

.cq-section {
  margin-bottom: 16px;
}

.cq-section-title {
  display: flex;
  align-items: center;
  gap: 4px;
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

.cq-nested-path {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
}

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

.cq-cache-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cq-actions {
  display: flex;
  gap: 8px;
}

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
  max-height: 200px;
  overflow-y: auto;
}
</style>