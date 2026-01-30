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
          <a-button type="outline" @click="goWithQuery('/risk/external-data/evaluation')">查看评估</a-button>
          <a-button type="outline" @click="goWithQuery('/risk/budget-overview')">预算信息</a-button>
          <a-button type="outline" @click="goWithQuery('/risk/external-data/service')">服务状态</a-button>
          <a-button type="outline">
            <template #icon><IconDownload /></template>
            导出数据
          </a-button>
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
              <a-space>
                <a-button type="text" @click="openDetail(record)">{{ record.name }}</a-button>
                <a-button type="text" @click="goDetailPage(record)">打开详情页</a-button>
              </a-space>
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
        <template #empty>
          <a-empty description="没有匹配的档案" />
        </template>
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
          <a-col :span="12">
            <a-form-item field="businessGoal" label="业务目标"><a-input v-model="editForm.businessGoal" /></a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="expectedBenefit" label="预期收益"><a-input v-model="editForm.expectedBenefit" /></a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="usageScene" label="使用场景"><a-textarea v-model="editForm.usageScene" :rows="3" /></a-form-item>
        <a-row :gutter="12">
          <a-col :span="24">
            <a-form-item field="tags" label="标签">
              <a-input-tag v-model="editForm.tags" allow-clear placeholder="输入标签后回车添加" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="businessImpact" label="业务影响"><a-input v-model="editForm.businessImpact" /></a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="alternativeSolution" label="替代方案"><a-input v-model="editForm.alternativeSolution" /></a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="businessRisk" label="业务风险"><a-input v-model="editForm.businessRisk" /></a-form-item>
        <a-form-item field="remark" label="备注"><a-textarea v-model="editForm.remark" :rows="3" /></a-form-item>
        <div style="text-align: right">
          <a-space>
            <a-button type="primary" :loading="saving" @click="saveEdit">保存</a-button>
            <a-button type="outline" @click="editVisible = false">取消</a-button>
          </a-space>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import { useContractStore } from '@/modules/budget/stores/contract'
import { IconDownload } from '@arco-design/web-vue/es/icon'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()
const store = useExternalDataStore()
const contractStore = useContractStore()
const archiveId = ref(sessionStorage.getItem('archiveId') || 'ARCH-001')
const stats = reactive({ archive: { products: 0, interfaces: 0, suppliers: 0 } })
const overview = reactive([{ label: '上线产品数', value: 0 },{ label: '维护中产品数', value: 0 },{ label: '待评估产品数', value: 0 },{ label: '预算使用率', value: '—' }])
const goArchiveList = () => { router.push('/external-data-v1/list') }
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
    const supplier = p.supplier || p.provider || '—'
    const hasContract = Boolean(contractStore.pricingMap[id]) || contractStore.list.some((c: any) => c.supplier === supplier)
    const hasInterfaces = Number(p.interfaces || 0) > 0
    const hasBottomTable = Boolean(p.bottomTable || p.dbTable || p.tableName)
    const baseStatus = normalizeStatus(p.status)
    const derivedStatus = (hasContract && hasInterfaces && hasBottomTable) ? 'online' : (baseStatus || 'importing')
    return { id, name, code, supplier, status: derivedStatus, createdAt: p.createdAt || randomDateWithinYear(), usageScene: p.usageScene || '贷前评分/贷中监控', billingMode: p.billingMode || 'per_call', unitPrice: typeof p.unitPrice === 'number' ? p.unitPrice : randBetween(1, 10), billingCycle: p.billingCycle || 'month', currency: p.currency || 'CNY', effectiveDate: p.effectiveDate || new Date(Date.now() - 30 * 86400000).toISOString(), expireDate: p.expireDate || new Date(Date.now() + 335 * 86400000).toISOString(), tags: Array.isArray(p.tags) ? p.tags : ['外数','风控'], evaluationScore: p.evaluationScore ?? randBetween(60, 95), monitorStatus: p.monitorStatus || (Math.random() > 0.15 ? '正常' : '异常'), hasContract, hasInterfaces, hasBottomTable }
  })
  if (!productsView.value.length) {
    const seed = [{ id: 1, name: '产品A', provider: '数据提供商A', status: 'active', interfaces: 2, bottomTable: 'tbl_a' },{ id: 2, name: '产品B', provider: '数据提供商B', status: 'active', interfaces: 0 },{ id: 3, name: '产品C', provider: '数据提供商C', status: 'inactive', interfaces: 1 },{ id: 4, name: '产品D', provider: '数据提供商D', status: 'active', interfaces: 3, bottomTable: 'tbl_d' }]
    productsView.value = seed.map((p: any, idx: number) => {
      const id = String(p.id ?? idx + 1)
      const supplier = p.provider
      const hasContract = Boolean(contractStore.pricingMap[id]) || contractStore.list.some((c: any) => c.supplier === supplier)
      const hasInterfaces = Number(p.interfaces || 0) > 0
      const hasBottomTable = Boolean(p.bottomTable)
      const derivedStatus = (hasContract && hasInterfaces && hasBottomTable) ? 'online' : 'importing'
      return { id, name: p.name, code: `ED-${idx+1}`, supplier, status: derivedStatus, createdAt: randomDateWithinYear(), usageScene: '贷前评分/贷中监控', billingMode: 'per_call', unitPrice: randBetween(1, 10), billingCycle: 'month', currency: 'CNY', effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(), expireDate: new Date(Date.now() + 335 * 86400000).toISOString(), tags: ['外数','风控'], evaluationScore: randBetween(60, 95), monitorStatus: Math.random() > 0.15 ? '正常' : '异常', hasContract, hasInterfaces, hasBottomTable }
    })
  }
  pagination.total = productsView.value.length
}
const refreshProducts = async () => { loading.value = true; await store.fetchProducts().catch(() => { Message.error('刷新失败') }); buildProductsView(); loading.value = false; Message.success('已刷新档案数据') }
onMounted(async () => { await store.fetchProducts(); await contractStore.fetchContractList({ page: 1, pageSize: 50 }); sessionStorage.setItem('archiveId', archiveId.value); const listRaw = products.value; const list = Array.isArray(listRaw) ? listRaw : []; stats.archive.products = list.length; stats.archive.interfaces = list.reduce((sum, p) => { const interfaces = typeof p.interfaces === 'number' ? p.interfaces : 1; return sum + interfaces }, 0); const suppliers = new Set(list.map((p) => p?.supplier).filter(Boolean)); stats.archive.suppliers = suppliers.size; const onlineCount = list.filter((p) => p?.status === 'online').length; const maintainingCount = list.filter((p) => p?.status === 'maintaining').length; const pendingEvalCount = list.filter((p) => p?.status === 'pending_evaluation').length; if (onlineCount || maintainingCount || pendingEvalCount) { overview[0].value = onlineCount; overview[1].value = maintainingCount; overview[2].value = pendingEvalCount } buildProductsView(); const q = router.currentRoute.value.query as any; const product = q?.product; const status = q?.status; const supplier = q?.supplier; if (product) { filters.keyword = String(product) } if (status) { filters.status = String(status) } if (supplier) { filters.suppliers = [String(supplier)] } if (product || status || supplier) applyFilter() })
const goWithQuery = (path: string, extra: Record<string, any> = {}) => { router.push({ path, query: { archiveId: archiveId.value, from: 'archive', ...extra } }).then(() => { Message.info('已跳转') }).catch(() => { Message.error('跳转失败') }) }
const businessValue = reactive({ businessGoal: '提升风控命中与转化', expectedBenefit: '年化ROI 120%', useScenario: '贷前评分、贷中监控、贷后资产管理', businessImpact: '提升通过率并降低坏账率', alternativeSolution: '内部风控模型与三方替代接口', businessRisk: '数据时效与合规风险' })
const businessValueData = computed(() => [{ label: '业务目标', value: businessValue.businessGoal },{ label: '预期收益', value: businessValue.expectedBenefit },{ label: '使用场景', value: businessValue.useScenario },{ label: '业务影响', value: businessValue.businessImpact },{ label: '替代方案', value: businessValue.alternativeSolution },{ label: '业务风险', value: businessValue.businessRisk }])
const usageGuidanceList = reactive([{ title: '快速入门', desc: '统一接入流程与样例' },{ title: '最佳实践', desc: '高效调用与参数选择策略' },{ title: 'FAQ', desc: '常见问题与解法' },{ title: '成功案例', desc: '应用场景与效果对比' }])
const lifecycleStatus = ref('maintaining')
const lifecycleStatusLabel = computed(() => lifecycleStatus.value === 'online' ? '在线' : lifecycleStatus.value === 'maintaining' ? '维护中' : '待上线')
const lifecycleStatusTag = computed(() => lifecycleStatus.value === 'online' ? 'success' : lifecycleStatus.value === 'maintaining' ? 'warning' : 'default')
const lifecycleHistory = reactive(['2024-12 接入评估完成', '2025-01 正式上线', '2025-06 版本升级'])
const supplierInfo = reactive({ name: '示例供应商', creditRating: 4.5 })
const supplierInfoData = computed(() => [{ label: '供应商名称', value: supplierInfo.name },{ label: '信用评级', value: supplierInfo.creditRating }])
const daysToExpire = (end: any) => { try { const now = new Date(); const target = new Date(end || ''); return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) } catch { return NaN } }
const expireTagStatus = (end: any) => { const d = daysToExpire(end); if (isNaN(d)) return 'default'; if (d < 0) return 'danger'; if (d <= 7) return 'danger'; if (d <= 30) return 'warning'; return 'success' }
const topExpiringContracts = computed(() => { const arr = contractStore.list.slice().filter((i: any) => { const d = daysToExpire(i.endDate); return !isNaN(d) && d >= 0 }).sort((a: any, b: any) => daysToExpire(a.endDate) - daysToExpire(b.endDate)); return arr.slice(0, 5) })
const evaluationSummaryData = computed(() => { const latest = (store.evaluationList || []).slice().pop() || null; const valueA = latest ? latest.result?.score ?? '—' : '—'; const valueB = latest ? latest.createdAt ?? '—' : '—'; return [{ label: '最新评估得分', value: valueA },{ label: '评估时间', value: valueB }] })
const techIndexData = reactive([{ label: '接口健康', value: '正常' },{ label: '数据更新', value: '及时' },{ label: '问题记录', value: '0条' },{ label: '性能指标', value: '响应 120ms' }])
const editVisible = ref(false)
const detailVisible = ref(false)
const editTarget = ref<any>(null)
const detailTarget = ref<any>(null)
const editForm = reactive({ businessGoal: '', expectedBenefit: '', usageScene: '', billingMode: 'per_call', unitPrice: 0, billingCycle: 'month', currency: 'CNY', effectiveDate: '', expireDate: '', tags: [] as string[], businessImpact: '', alternativeSolution: '', businessRisk: '', remark: '' })
const openEdit = (record: any) => { editTarget.value = record; editForm.businessGoal = businessValue.businessGoal; editForm.expectedBenefit = businessValue.expectedBenefit; editForm.usageScene = record.usageScene; editForm.billingMode = record.billingMode; editForm.unitPrice = record.unitPrice; editForm.billingCycle = record.billingCycle; editForm.currency = record.currency; editForm.effectiveDate = record.effectiveDate; editForm.expireDate = record.expireDate; editForm.tags = Array.isArray(record.tags) ? [...record.tags] : []; editForm.businessImpact = businessValue.businessImpact; editForm.alternativeSolution = businessValue.alternativeSolution; editForm.businessRisk = businessValue.businessRisk; editForm.remark = ''; editVisible.value = true }
const openDetail = (record: any) => { detailTarget.value = record; detailVisible.value = true }
const goDetailPage = (record: any) => { router.push({ path: `/risk/external-data/archive/${String(record.id)}`, query: { from: 'archive', archiveId: archiveId.value } }) }
const saveEdit = async () => { if (!editForm.usageScene) { Message.error('请填写使用场景'); return } saving.value = true; try { if (editTarget.value) { editTarget.value.usageScene = editForm.usageScene; editTarget.value.billingMode = editForm.billingMode; editTarget.value.unitPrice = editForm.unitPrice; editTarget.value.billingCycle = editForm.billingCycle; editTarget.value.currency = editForm.currency; editTarget.value.effectiveDate = editForm.effectiveDate; editTarget.value.expireDate = editForm.expireDate; editTarget.value.tags = Array.isArray(editForm.tags) ? [...editForm.tags] : []; editVisible.value = false; Message.success('保存成功') } } finally { saving.value = false } }
const handleImportChange = () => {}
const importing = ref(false)
const importVisible = ref(false)
const confirmImport = async () => { importing.value = true; setTimeout(() => { importing.value = false; importVisible.value = false; Message.success('导入完成'); refreshProducts() }, 1000) }
const exportList = () => { const headers = ['产品名称','编码','供应商','状态','计费模式','单价','接入时间','使用场景','评估得分','监控状态']; const rows = productsView.value.map((p: any) => [p.name,p.code,p.supplier,p.status,(p.billingMode||''),p.unitPrice,p.createdAt,p.usageScene,p.evaluationScore,p.monitorStatus]); const csv = [headers.join(','), ...rows.map((r: any) => r.map((v: any) => String(v ?? '')).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'external-data-archive.csv'; a.click(); URL.revokeObjectURL(url); Message.success('已导出') }
const formatDate = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => s === 'importing' ? '引入中' : s === 'online' ? '已上线' : s === 'pending_evaluation' ? '待评估' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'pending_evaluation' ? 'warning' : s === 'importing' ? 'warning' : 'default'

// 详情基础信息
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

// 定价信息取自合同管理的外数产品定价
const pricingData = computed(() => contractStore.getPricing(String(detailTarget.value?.id || '')))
const pricingSummary = computed(() => {
  const p: any = pricingData.value
  if (!p) return []
  return [
    { label: '计费方式', value: p.billingMode || '—' },
    { label: '计费类型', value: p.billingType === 'fixed' ? '固定单价' : p.billingType === 'tiered' ? '阶梯条件' : p.billingType === 'special' ? '特殊计费' : '—' }
  ]
})

const monthlySnapshots = computed(() => {
  const supplier = detailTarget.value?.supplier
  if (!supplier) return []
  const contracts = contractStore.list.filter((c: any) => c.supplier === supplier)
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
  contracts.forEach((c: any) => {
    const months = genMonths(c.startDate, c.endDate)
    const monthlyAmount = (() => {
      try {
        const s = new Date(c.startDate)
        const e = new Date(c.endDate)
        const monthsCount = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth() + 1)
        return monthsCount > 0 ? Math.round(Number(c.amount || 0) / monthsCount) : Number(c.amount || 0)
      } catch { return Number(c.amount || 0) }
    })()
    months.slice(-6).forEach((m) => {
      rows.push({ month: m, supplier: c.supplier, contractNo: c.contractNo, monthlyAmount, status: c.status })
    })
  })
  return rows.sort((a, b) => a.month.localeCompare(b.month))
})

// 关联采购项目：按供应商匹配
const relatedContracts = computed(() => {
  const supplier = detailTarget.value?.supplier
  if (!supplier) return []
  return contractStore.list.filter((c: any) => c.supplier === supplier)
})
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.header-content { display: flex; align-items: center; justify-content: space-between; }
.header-info h2 { margin: 0 0 8px; }
.page-description { color: var(--color-text-2); }
.module-header { display: flex; align-items: center; gap: 8px; }
.module-icon { font-size: 18px; }
.module-stats { display: flex; gap: 24px; margin-top: 8px; }
.stat-item { display: flex; flex-direction: column; }
.stat-label { color: var(--color-text-2); }
.stat-value { font-weight: 600; }
.toolbar { margin-top: 12px; }
.list-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.list-title { font-weight: 500; }
.list-sub { color: var(--color-text-2); font-size: 12px; }
.section-title { font-weight: 600; margin-bottom: 8px; }
.lifecycle-top { display: flex; align-items: center; }
</style>
