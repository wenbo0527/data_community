<template>
  <div class="external-data-archive">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h2>外数档案管理</h2>
          <p class="page-description">外部数据的生命周期档案管理，统一管理数据产品、接口信息和供应商信息</p>
        </div>
      <div class="header-actions">
        <a-space>
          <a-button type="outline" @click="goWithQuery('/external-data-v1/list')">技术详情</a-button>
          <a-button type="outline" @click="goWithQuery('/discovery/asset-management/external-data-management')">元数据管理</a-button>
          <a-button type="outline" @click="goWithQuery('/external-data/evaluation')">查看评估</a-button>
          <a-button type="outline" @click="goWithQuery('/budget/overview')">预算信息</a-button>
          <a-button type="outline" @click="goWithQuery('/external-data/service')">服务状态</a-button>
          <a-button type="outline"><template #icon><IconDownload /></template>导出数据</a-button>
        </a-space>
      </div>
      </div>
    </div>

    <a-card class="toolbar" :bordered="true" style="margin-top: 12px">
      <a-form :model="filters" layout="inline">
        <a-form-item label="快速状态">
          <a-radio-group v-model="filters.statusQuick">
            <a-radio value="">全部</a-radio>
            <a-radio value="importing">引入中</a-radio>
            <a-radio value="online">已上线</a-radio>
            <a-radio value="pending_evaluation">待评估</a-radio>
            <a-radio value="archived">已归档</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="suppliers" label="供应商">
          <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择供应商" style="width: 260px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 160px">
            <a-option value="importing">引入中</a-option>
            <a-option value="online">已上线</a-option>
            <a-option value="pending_evaluation">待评估</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="usageScene" label="使用场景">
          <a-input v-model="filters.usageScene" allow-clear placeholder="文本匹配" style="width: 200px" />
        </a-form-item>
        <a-form-item field="keyword" label="关键词">
          <a-input v-model="filters.keyword" allow-clear placeholder="名称/编码" style="width: 200px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button @click="refreshProducts">刷新</a-button>
            <a-button type="outline" @click="exportList">导出列表</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="档案列表" :bordered="true" :loading="loading">
      <a-table :data="displayedList" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="产品名称" :width="220">
            <template #cell="{ record }">
              <a-button type="text" @click="goDetailPage(record)">{{ record.name }}</a-button>
            </template>
          </a-table-column>
          <a-table-column title="供应商" data-index="supplier" :width="160" />
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="接入时间" :width="180">
            <template #cell="{ record }">{{ formatDate(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="使用场景" :width="240">
            <template #cell="{ record }">{{ record.usageScene || '—' }}</template>
          </a-table-column>
          <a-table-column title="标签" :width="200">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="t in (record.tags||[])" :key="t">{{ t }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="评估得分" :width="120">
            <template #cell="{ record }">{{ record.evaluationScore ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="监控状态" :width="120">
            <template #cell="{ record }">{{ record.monitorStatus ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="260" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" type="text" @click="openEdit(record)">编辑档案</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
        <template #empty><a-empty description="没有匹配的档案" /></template>
      </a-table>
  </a-card>

    <a-drawer v-model:visible="detailVisible" :width="780" title="外数档案详情">
      <a-space direction="vertical" style="width:100%">
        <a-card title="基础信息">
          <a-descriptions :column="2" :data="detailBaseItems" bordered />
        </a-card>
        <a-card title="定价信息">
          <template #extra><span v-if="!pricingData">未配置（以档案单价为准）</span></template>
          <div v-if="pricingData">
            <a-descriptions :column="2" :data="pricingSummary" bordered />
            <div v-if="pricingData.billingType==='fixed'" style="margin-top:8px">基础单价：{{ pricingData.basePrice ?? '—' }}</div>
            <div v-else-if="pricingData.billingType==='tiered'" style="margin-top:8px">
              <a-table :data="pricingData.tiers || []" :pagination="false">
                <template #columns>
                  <a-table-column title="下限" data-index="lower" :width="160" />
                  <a-table-column title="上限" data-index="upper" :width="160" />
                  <a-table-column title="单价" data-index="price" :width="160" />
                </template>
              </a-table>
            </div>
            <div v-else style="margin-top:8px">备注：{{ pricingData.remark || '—' }}</div>
          </div>
          <div v-else>
            <a-descriptions :column="2" :data="[{label:'档案单价',value: formatCurrency(detailTarget?.unitPrice)},{label:'计费模式',value: billingModeLabel(detailTarget?.billingMode)}]" bordered />
          </div>
        </a-card>
        <a-card title="月度计价快照" style="margin-top:12px">
          <a-table :data="monthlySnapshots" :pagination="false">
            <template #columns>
              <a-table-column title="月份" data-index="month" :width="120" />
              <a-table-column title="供应商" data-index="supplier" :width="160" />
              <a-table-column title="合同编号" data-index="contractNo" :width="140" />
              <a-table-column title="月度金额" :width="140">
                <template #cell="{ record }">{{ formatCurrency(record.monthlyAmount) }}</template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="120" />
            </template>
            <template #empty><a-empty description="暂无月度快照" /></template>
          </a-table>
        </a-card>
        <a-card title="关联采购项目">
          <a-table :data="relatedContracts" :pagination="false">
            <template #columns>
              <a-table-column title="合同名称" data-index="contractName" :width="240" />
              <a-table-column title="合同编号" data-index="contractNo" :width="160" />
              <a-table-column title="类型" :width="120">
                <template #cell="{ record }">{{ record.contractType==='supplement'?'补充合同':'框架协议' }}</template>
              </a-table-column>
              <a-table-column title="金额" :width="160">
                <template #cell="{ record }">{{ formatCurrency(record.amount) }}</template>
              </a-table-column>
              <a-table-column title="到期" :width="160">
                <template #cell="{ record }">{{ formatDate(record.endDate) }}</template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="120" />
            </template>
            <template #empty><a-empty description="暂无关联项目" /></template>
          </a-table>
        </a-card>
      </a-space>
    </a-drawer>

    <a-drawer v-model:visible="editVisible" :width="720" title="编辑档案">
      <a-form :model="editForm" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item field="businessGoal" label="业务目标"><a-input v-model="editForm.businessGoal" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item field="expectedBenefit" label="预期收益"><a-input v-model="editForm.expectedBenefit" /></a-form-item></a-col>
        </a-row>
        <a-form-item field="usageScene" label="使用场景"><a-textarea v-model="editForm.usageScene" :rows="3" /></a-form-item>
        <a-row :gutter="12">
          <a-col :span="24">
            <a-form-item field="tags" label="标签"><a-input-tag v-model="editForm.tags" allow-clear placeholder="输入标签后回车添加" /></a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item field="businessImpact" label="业务影响"><a-input v-model="editForm.businessImpact" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item field="alternativeSolution" label="替代方案"><a-input v-model="editForm.alternativeSolution" /></a-form-item></a-col>
        </a-row>
        <a-form-item field="businessRisk" label="业务风险"><a-input v-model="editForm.businessRisk" /></a-form-item>
        <a-form-item field="remark" label="备注"><a-textarea v-model="editForm.remark" :rows="3" /></a-form-item>
        <div style="text-align: right">
          <a-space><a-button type="primary" :loading="saving" @click="saveEdit">保存</a-button><a-button type="outline" @click="editVisible = false">取消</a-button></a-space>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useExternalDataStore } from '@/modules/external-data/stores'
import { IconDownload } from '@arco-design/web-vue/es/icon'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()
const store = useExternalDataStore()
const archiveId = ref(sessionStorage.getItem('archiveId') || 'ARCH-001')
const products = computed(() => store.products)
const loading = ref(false)
const productsView = ref<any[]>([])
const saving = ref(false)
const supplierOptions = computed(() => Array.from(new Set(productsView.value.map((p: any) => p.supplier).filter(Boolean))))
const filters = reactive<{ suppliers: string[]; status?: string; statusQuick?: string; usageScene?: string; keyword?: string }>({ suppliers: [], statusQuick: '' })
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const displayedList = computed(() => productsView.value.filter((p: any) => { if (filters.statusQuick && !filters.status) filters.status = filters.statusQuick; if (filters.suppliers.length && !filters.suppliers.includes(p.supplier)) return false; if (filters.status && p.status !== filters.status) return false; if (filters.usageScene && !String(p.usageScene || '').includes(filters.usageScene)) return false; if (filters.keyword) { const k = filters.keyword.toLowerCase(); const name = String(p.name || '').toLowerCase(); const code = String(p.code || '').toLowerCase(); if (!name.includes(k) && !code.includes(k)) return false } return true }))
const applyFilter = () => { pagination.current = 1; Message.success('筛选已更新') }
const resetFilter = () => { filters.suppliers = []; filters.status = undefined; filters.usageScene = undefined; filters.keyword = undefined }
const onPageChange = (page: number) => { pagination.current = page }
const randBetween = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1))
const randomDateWithinYear = () => { const now = Date.now(); const delta = randBetween(0, 365) * 24 * 60 * 60 * 1000; return new Date(now - delta).toISOString() }
const buildProductsView = () => {
  const list = Array.isArray(products.value) ? products.value : []
  const normalizeStatus = (s?: string) => { if (s === 'active') return 'online'; if (s === 'inactive') return 'archived'; if (s === 'pending_evaluation') return 'pending_evaluation'; if (s === 'importing') return 'importing'; return (s || '') }
  productsView.value = list.map((p: any, idx: number) => {
    const id = String(p.id ?? idx + 1)
    const name = p.name || p.productName || p.code || `外数产品-${idx+1}`
    const code = p.code || `ED-${idx+1}`
    const supplier = p.supplier || '—'
    const hasInterfaces = Number(p.interfaces || 0) > 0
    const hasBottomTable = Boolean(p.bottomTable || p.dbTable || p.tableName)
    const baseStatus = normalizeStatus(p.status)
    const derivedStatus = (hasInterfaces && hasBottomTable) ? 'online' : (baseStatus || 'importing')
    return { 
      id, name, code, supplier, status: derivedStatus, 
      createdAt: p.createdAt || randomDateWithinYear(), 
      usageScene: p.usageScene || '贷前评分/贷中监控', 
      billingMode: p.billingMode || 'per_call', 
      unitPrice: typeof p.unitPrice === 'number' ? p.unitPrice : randBetween(1, 10), 
      billingCycle: p.billingCycle || 'month', 
      currency: p.currency || 'CNY', 
      effectiveDate: p.effectiveDate || new Date(Date.now() - 30 * 86400000).toISOString(), 
      expireDate: p.expireDate || new Date(Date.now() + 335 * 86400000).toISOString(), 
      tags: Array.isArray(p.tags) ? p.tags : ['外数','风控'], 
      evaluationScore: p.evaluationScore ?? randBetween(60, 95), 
      monitorStatus: p.monitorStatus || (Math.random() > 0.15 ? '正常' : '异常'), 
      hasInterfaces, hasBottomTable,
      frameworkAgreements: p.frameworkAgreements || [],
      totalSupplementAmount: p.totalSupplementAmount || 0
    }
  })
  if (!productsView.value.length && !loading.value) {
    // 移除本地 Seed 数据，强制依赖 Store/API 数据，保持全局数据一致性
    // 如果 Store 为空，页面应显示 Empty 状态，提示用户去配置或检查 Mock 数据
    productsView.value = [] 
  }
  pagination.total = productsView.value.length
}
const refreshProducts = async () => { loading.value = true; await store.fetchProducts().catch(() => { Message.error('刷新失败') }); buildProductsView(); loading.value = false; Message.success('已刷新档案数据') }
const exportList = () => { Message.success('导出任务已创建') }
onMounted(async () => { await store.fetchProducts(); sessionStorage.setItem('archiveId', archiveId.value); buildProductsView(); const q = router.currentRoute.value.query as any; const status = q?.status; const supplier = q?.supplier; if (status) { filters.status = String(status) } if (supplier) { filters.suppliers = [String(supplier)] } if (status || supplier) applyFilter() })
const goWithQuery = (path: string, extra: Record<string, any> = {}) => { router.push({ path, query: { archiveId: archiveId.value, from: 'archive', ...extra } }).then(() => { Message.info('已跳转') }).catch(() => { Message.error('跳转失败') }) }
const editVisible = ref(false)
const detailVisible = ref(false)
const editTarget = ref<any>(null)
const detailTarget = ref<any>(null)
const editForm = reactive({ businessGoal: '', expectedBenefit: '', usageScene: '', billingMode: 'per_call', unitPrice: 0, billingCycle: 'month', currency: 'CNY', effectiveDate: '', expireDate: '', tags: [] as string[], businessImpact: '', alternativeSolution: '', businessRisk: '', remark: '' })
const openEdit = (record: any) => { editTarget.value = record; editForm.usageScene = record.usageScene; editForm.billingMode = record.billingMode; editForm.unitPrice = record.unitPrice; editForm.billingCycle = record.billingCycle; editForm.currency = record.currency; editForm.effectiveDate = record.effectiveDate; editForm.expireDate = record.expireDate; editForm.tags = Array.isArray(record.tags) ? [...record.tags] : []; editVisible.value = true }
const openDetail = (record: any) => { detailTarget.value = record; detailVisible.value = true }
const goDetailPage = (record: any) => { router.push({ path: `/external-data/archive/${String(record.id)}`, query: { from: 'archive', archiveId: archiveId.value } }) }
const saveEdit = async () => { if (!editForm.usageScene) { Message.error('请填写使用场景'); return } saving.value = true; try { if (editTarget.value) { editTarget.value.usageScene = editForm.usageScene; editTarget.value.billingMode = editForm.billingMode; editTarget.value.unitPrice = editForm.unitPrice; editTarget.value.billingCycle = editForm.billingCycle; editTarget.value.currency = editForm.currency; editTarget.value.effectiveDate = editForm.effectiveDate; editTarget.value.expireDate = editForm.expireDate; editTarget.value.tags = Array.isArray(editForm.tags) ? [...editForm.tags] : []; editVisible.value = false; Message.success('保存成功') } } finally { saving.value = false } }
const formatDate = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => s === 'importing' ? '引入中' : s === 'online' ? '已上线' : s === 'pending_evaluation' ? '待评估' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'pending_evaluation' ? 'warning' : s === 'importing' ? 'warning' : 'default'

const detailBaseItems = computed(() => {
  const r: any = detailTarget.value || {}
  return [
    { label: '名称', value: r.name || '—' },
    { label: '编码', value: r.code || '—' },
    { label: '供应商', value: r.supplier || '—' },
    { label: '状态', value: statusLabel(r.status) },
    { label: '接入时间', value: formatDate(r.createdAt) },
    { label: '使用场景', value: r.usageScene || '—' },
    { label: '计费模式', value: billingModeLabel(r.billingMode) },
    { label: '档案单价', value: formatCurrency(r.unitPrice) }
  ]
})

const pricingData = computed<any>(() => null)
const pricingSummary = computed(() => [])

const monthlySnapshots = computed(() => {
  const supplier = detailTarget.value?.supplier
  if (!supplier) return []
  const genMonths = (start: string, end: string) => {
    try {
      const s = new Date(start)
      const e = new Date(end)
      const arr: string[] = []
      const cur = new Date(s.getFullYear(), s.getMonth(), 1)
      const last = new Date(e.getFullYear(), e.getMonth(), 1)
      while (cur <= last) {
        const m = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
        arr.push(m)
        cur.setMonth(cur.getMonth() + 1)
      }
      return arr
    } catch { return [] }
  }
  const rows: any[] = []
  const months = genMonths(new Date().toISOString(), new Date(Date.now() + 180 * 86400000).toISOString())
  months.slice(-6).forEach((m) => {
    rows.push({ month: m, supplier: supplier, contractNo: 'ED-001', monthlyAmount: 5000, status: 'active' })
  })
  return rows.sort((a, b) => a.month.localeCompare(b.month))
})

const relatedContracts = computed(() => {
  const target = detailTarget.value
  if (!target) return []
  
  if (Array.isArray(target.frameworkAgreements) && target.frameworkAgreements.length > 0) {
    return target.frameworkAgreements.map((fa: any) => ({
      supplier: target.supplier,
      contractName: fa.name,
      contractNo: fa.id,
      amount: fa.amount,
      endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      status: 'active',
      contractType: 'framework'
    }))
  }

  const supplier = target.supplier
  if (!supplier) return []
  return [{ supplier, contractName: '框架协议', contractNo: 'FA-001', amount: 120000, endDate: new Date(Date.now() + 90 * 86400000).toISOString(), status: 'active', contractType: 'framework' }]
})
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.header-content { display: flex; align-items: center; justify-content: space-between; }
.header-info h2 { margin: 0 0 8px; }
.page-description { color: var(--color-text-2); }
.toolbar { margin-top: 12px; }
</style>
