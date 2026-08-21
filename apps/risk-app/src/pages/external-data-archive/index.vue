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
          <!-- PRD A2 R07: 空白卡片注册入口 -->
          <a-button type="primary" @click="openBlankCreate">
            <template #icon><IconPlus /></template>
            新建空白卡片
          </a-button>
          <a-button type="outline" @click="exportList">
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
        <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择供应商" style="width: 200px">
          <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
        </a-select>
      </a-form-item>
      <!-- PRD A1 R01: 合作机构字段放在供应商前面 -->
      <a-form-item field="partnerOrgs" label="合作机构">
        <a-select v-model="filters.partnerOrgs" multiple allow-clear placeholder="选择合作机构" style="width: 220px">
          <a-option v-for="p in partnerOrgOptions" :key="p" :value="p">{{ p }}</a-option>
        </a-select>
      </a-form-item>
      <!-- PRD A1 R03: 接口号字段 -->
      <a-form-item field="interfaceNo" label="接口号">
        <a-input v-model="filters.interfaceNo" allow-clear placeholder="接口号关键字" style="width: 160px" />
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
            <span>{{ record.name }}</span>
            <!-- PRD A2 R07: 空白卡片标记 -->
            <a-tag v-if="record.isBlankCard" size="small" color="orange" style="margin-left:6px">空白卡片</a-tag>
          </template>
        </a-table-column>
        <!-- PRD A1 R01+R05: 合作机构字段放在供应商字段前面 -->
        <a-table-column title="合作机构" data-index="partnerOrg" :width="220">
          <template #cell="{ record }">{{ record.partnerOrg || '—' }}</template>
        </a-table-column>
        <a-table-column title="供应商" data-index="supplier" :width="160" />
        <!-- PRD A1 R03: 接口号字段 -->
        <a-table-column title="接口号" data-index="interfaceNo" :width="140">
          <template #cell="{ record }">
            <span :class="{ 'muted-cell': !record.interfaceNo }">{{ record.interfaceNo || '未配置' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="120">
          <template #cell="{ record }">
            <StatusTag :status="record.status" dictKey="externalDataStatus" />
          </template>
        </a-table-column>
        <a-table-column title="接入时间" :width="180">
          <template #cell="{ record }">{{ DateUtils.formatDateTime(record.createdAt) }}</template>
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

  <a-drawer v-model:visible="editVisible" :width="720" :title="editTitle">
    <a-form :model="editForm" layout="vertical">
      <!-- PRD A1 R05: 字段排序 - 合作机构 → 供应商 → 接口号 → 落库表名 -->
      <a-row :gutter="12">
        <a-col :span="12">
          <!-- PRD A1 R01: 合作机构（选项列表） -->
          <a-form-item field="partnerOrg" label="合作机构">
            <a-select v-model="editForm.partnerOrg" placeholder="选择合作机构" allow-clear>
              <a-option v-for="p in partnerOrgOptions" :key="p" :value="p">{{ p }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <!-- PRD A1 R02: 供应商（选项列表，枚举待补） -->
          <a-form-item field="supplier" label="供应商">
            <a-select v-model="editForm.supplier" placeholder="选择供应商" allow-search allow-clear>
              <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="12">
        <a-col :span="12">
          <!-- PRD A1 R03: 接口号字段，非必填，可后期补充 -->
          <a-form-item field="interfaceNo" label="接口号" extra="非必填，可后期补充">
            <a-input v-model="editForm.interfaceNo" placeholder="例如 IF-0001" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <!-- PRD A1 R04: 落库表名由必填改为非必填，可后期补充 -->
          <a-form-item field="bottomTable" label="落库表名" extra="非必填，可后期补充">
            <a-input v-model="editForm.bottomTable" placeholder="例如 dwd_xxx_detail" allow-clear />
          </a-form-item>
        </a-col>
      </a-row>
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
import { IconDownload, IconPlus } from '@arco-design/web-vue/es/icon'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()

const store = useExternalDataStore()
const contractStore = useContractStore()
const archiveId = ref(sessionStorage.getItem('archiveId') || 'ARCH-001')
const stats = reactive({
  archive: {
    products: 0,
    interfaces: 0,
    suppliers: 0
  }
})

const overview = reactive([
  { label: '上线产品数', value: 0 },
  { label: '维护中产品数', value: 0 },
  { label: '待评估产品数', value: 0 },
  { label: '预算使用率', value: '—' }
])

const goArchiveList = () => {
  router.push('/external-data-v1/list')
}

const products = computed(() => store.products)
const loading = ref(false)
const productsView = ref<any[]>([])
const saving = ref(false)
let __supplierFallbackList: string[] = []
const supplierOptions = computed(() => {
  const set = new Set<string>(__supplierFallbackList || [])
  for (const p of productsView.value) {
    const s = p?.supplier
    if (s) set.add(String(s))
  }
  return Array.from(set)
})
// PRD R01: 合作机构枚举（与模块 budget 同步，使用 supplierDictionary 中的合作机构字段）
const partnerOrgOptions = computed(() => {
  const set = new Set<string>()
  for (const p of productsView.value) {
    const v = p?.partnerOrg || p?.partner_org || p?.channel || p?.provider
    if (v) set.add(String(v))
  }
  return Array.from(set)
})

const filters = reactive<{ suppliers: string[]; partnerOrgs: string[]; interfaceNo?: string; status?: string; statusQuick?: string; usageScene?: string; keyword?: string }>({ suppliers: [], partnerOrgs: [], interfaceNo: '', statusQuick: '' })
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const displayedList = computed(() => productsView.value.filter(p => {
  if (filters.statusQuick && !filters.status) filters.status = filters.statusQuick
  if (filters.suppliers.length && !filters.suppliers.includes(p.supplier)) return false
  // PRD A1: 合作机构多选筛选
  if (filters.partnerOrgs.length && !filters.partnerOrgs.includes(p.partnerOrg)) return false
  // PRD A1: 接口号关键字筛选
  if (filters.interfaceNo && !String(p.interfaceNo || '').toLowerCase().includes(filters.interfaceNo.toLowerCase())) return false
  if (filters.status && p.status !== filters.status) return false
  if (filters.usageScene && !String(p.usageScene || '').includes(filters.usageScene)) return false
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    const name = String(p.name || '').toLowerCase()
    const code = String(p.code || '').toLowerCase()
    if (!name.includes(k) && !code.includes(k)) return false
  }
  return true
}))

const applyFilter = () => { pagination.current = 1; Message.success('筛选已更新') }
const resetFilter = () => { filters.suppliers = []; filters.partnerOrgs = []; filters.interfaceNo = ''; filters.status = undefined; filters.usageScene = undefined; filters.keyword = undefined }
const onPageChange = (page: number) => { pagination.current = page }

const randBetween = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1))
const randomDateWithinYear = () => { const now = Date.now(); const delta = randBetween(0, 365) * 24 * 60 * 60 * 1000; return new Date(now - delta).toISOString() }

const buildProductsView = () => {
  const list = Array.isArray(products.value) ? products.value : []
  const mapStatus = (s?: string) => {
    if (s === 'active') return 'online'
    if (s === 'inactive') return 'archived'
    if (s === 'pending_evaluation') return 'pending_evaluation'
    if (s === 'importing') return 'importing'
    return (s || 'online')
  }
  // PRD R01: 合作机构按 supplier/关键字智能映射到 12 家枚举
  const partnerOrgPool = [
    '朴道征信有限公司', '百行征信有限公司', '上海数据集团金融科技有限公司',
    '钱塘征信有限公司', '厦门信息集团大数据运营有限公司', '中国银行保险信息技术管理有限公司',
    '北京融七牛信息技术有限公司', '上海理想信息产业(集团)有限公司', '北京移动系统集成有限公司',
    '原力金智(北京)科技有限公司', '中国人民银行征信中心', '学信网'
  ]
  const guessPartnerOrg = (p: any, idx: number) => {
    if (p.partnerOrg) return p.partnerOrg
    if (p.partner_org) return p.partner_org
    if (p.channel && partnerOrgPool.includes(p.channel)) return p.channel
    const hay = `${p.name || ''} | ${p.code || ''} | ${p.supplier || ''} | ${p.provider || ''}`
    if (/朴道|百行|钱塘|厦门|保信|保险|融七牛|理想|移动|原力|征信|学信/.test(hay)) {
      const m = hay.match(/朴道|百行|钱塘|厦门|保信|保险|融七牛|理想|移动|原力|征信|学信/)
      const map: Record<string, string> = {
        朴道: '朴道征信有限公司', 百行: '百行征信有限公司', 钱塘: '钱塘征信有限公司',
        厦门: '厦门信息集团大数据运营有限公司', 保信: '中国银行保险信息技术管理有限公司',
        保险: '中国银行保险信息技术管理有限公司', 融七牛: '北京融七牛信息技术有限公司',
        理想: '上海理想信息产业(集团)有限公司', 移动: '北京移动系统集成有限公司',
        原力: '原力金智(北京)科技有限公司', 征信: '中国人民银行征信中心', 学信: '学信网'
      }
      if (m && map[m[0]]) return map[m[0]]
    }
    // 兜底：按 idx 取，避免"—"
    return partnerOrgPool[idx % partnerOrgPool.length]
  }
  const guessInterfaceNo = (p: any, idx: number) => {
    return p.interfaceNo || `IF-${String(idx + 1).padStart(4, '0')}`
  }
  productsView.value = list.map((p: any, idx: number) => ({
    id: String(p.id ?? idx + 1),
    name: p.name || p.productName || p.code || `外数产品-${idx+1}`,
    code: p.code || `ED-${String(idx + 1).padStart(4, '0')}`,
    supplier: p.supplier || p.provider || '—',
    // PRD A1: 合作机构/接口号/落库表名（智能补齐，避免"—"）
    partnerOrg: guessPartnerOrg(p, idx),
    interfaceNo: guessInterfaceNo(p, idx),
    bottomTable: p.bottomTable || p.dbTable || p.tableName || (p.code ? `dwd_${String(p.code).toLowerCase()}_detail` : ''),
    isBlankCard: !!p.isBlankCard,
    status: mapStatus(p.status),
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
    monitorStatus: p.monitorStatus || (Math.random() > 0.15 ? '正常' : '异常')
  }))
  if (!productsView.value.length) {
    // PRD R01: 合作机构枚举（与模块 budget 联动，初始化 12 家）
    const partnerOrgList = [
      '朴道征信有限公司',
      '百行征信有限公司',
      '上海数据集团金融科技有限公司',
      '钱塘征信有限公司',
      '厦门信息集团大数据运营有限公司',
      '中国银行保险信息技术管理有限公司',
      '北京融七牛信息技术有限公司',
      '上海理想信息产业(集团)有限公司',
      '北京移动系统集成有限公司',
      '原力金智(北京)科技有限公司',
      '中国人民银行征信中心',
      '学信网'
    ]
    // PRD R02: 供应商选项列表（枚举值待白曦补充，先用代表性供应商）
    const supplierList = [
      '恒普科技', '海纳数据', '内部研发', '朴道直连', '百行接口',
      '理想产业线', '原力金智', '北移动集成', '厦门大数据', '保信信息'
    ]
    // PRD R07: 空白卡片注册样本（接口号/落库表名为空）
    const seed = [
      // 空白卡片 2 条（A2）
      { id: 'BLANK-1', name: '待引入-外部数据卡片1', provider: '—', partnerOrg: partnerOrgList[0], status: 'importing', isBlankCard: true, usageScene: '贷前评分' },
      { id: 'BLANK-2', name: '待引入-外部数据卡片2', provider: '—', partnerOrg: partnerOrgList[2], status: 'importing', isBlankCard: true, usageScene: '贷后资产管理' },
      // 正常产品 8 条（A1 各字段齐全）
      { id: 'EXT001', name: '朴道低利率客群风险前筛', provider: '恒普科技', partnerOrg: '朴道征信有限公司', interfaceNo: 'IF-0001', bottomTable: 'dwd_pdc_loanrisk_detail', status: 'active', usageScene: '贷前评分/贷中监控' },
      { id: 'EXT002', name: '百行多头借贷风险画像', provider: '海纳数据', partnerOrg: '百行征信有限公司', interfaceNo: 'IF-0002', bottomTable: 'dwd_bx_loanrisk_detail', status: 'active', usageScene: '贷前评分' },
      { id: 'EXT003', name: '上海数据集团企业工商画像', provider: '朴道直连', partnerOrg: '上海数据集团金融科技有限公司', interfaceNo: 'IF-0003', bottomTable: 'dwd_sdg_bizdetail', status: 'active', usageScene: '企业尽调' },
      { id: 'EXT004', name: '钱塘反欺诈黑名单服务', provider: '内部研发', partnerOrg: '钱塘征信有限公司', interfaceNo: 'IF-0004', bottomTable: 'dwd_qt_blacklist_detail', status: 'active', usageScene: '反欺诈' },
      { id: 'EXT005', name: '厦门大数据消费能力画像', provider: '厦门大数据', partnerOrg: '厦门信息集团大数据运营有限公司', interfaceNo: 'IF-0005', bottomTable: 'dwd_xm_consume_detail', status: 'pending_evaluation', usageScene: '贷前评分' },
      { id: 'EXT006', name: '保信保险理赔风险评分', provider: '保信信息', partnerOrg: '中国银行保险信息技术管理有限公司', interfaceNo: 'IF-0006', bottomTable: 'dwd_bx_claimrisk_detail', status: 'active', usageScene: '保险理赔' },
      { id: 'EXT007', name: '理想集团失信被执行人查询', provider: '理想产业线', partnerOrg: '上海理想信息产业(集团)有限公司', interfaceNo: 'IF-0007', bottomTable: 'dwd_lx_dishonest_detail', status: 'active', usageScene: '贷前尽调' },
      { id: 'EXT008', name: '北移动运营商三要素', provider: '北移动集成', partnerOrg: '北京移动系统集成有限公司', interfaceNo: 'IF-0008', bottomTable: 'dwd_bj_mobile_triplet', status: 'active', usageScene: '身份核验' }
    ]
    productsView.value = seed.map((p: any, idx: number) => ({
      id: String(p.id),
      name: p.name,
      code: `ED-${String(idx + 1).padStart(4, '0')}`,
      // PRD R02: 供应商改为选项列表
      supplier: p.isBlankCard ? '' : p.provider,
      // PRD R01: 合作机构选项列表
      partnerOrg: p.partnerOrg,
      // PRD R03: 接口号字段（空白卡片为空）
      interfaceNo: p.interfaceNo || '',
      // PRD R04: 落库表名（空白卡片为空）
      bottomTable: p.bottomTable || '',
      // PRD R07: 空白卡片标记
      isBlankCard: !!p.isBlankCard,
      status: mapStatus(p.status),
      createdAt: randomDateWithinYear(),
      usageScene: p.usageScene || '贷前评分/贷中监控',
      billingMode: 'per_call',
      unitPrice: p.isBlankCard ? 0 : randBetween(1, 10),
      billingCycle: 'month',
      currency: 'CNY',
      effectiveDate: p.isBlankCard ? '' : new Date(Date.now() - 30 * 86400000).toISOString(),
      expireDate: p.isBlankCard ? '' : new Date(Date.now() + 335 * 86400000).toISOString(),
      tags: p.isBlankCard ? ['待引入', '空白卡片'] : ['外数', '风控'],
      evaluationScore: p.isBlankCard ? null : randBetween(60, 95),
      monitorStatus: p.isBlankCard ? '—' : (Math.random() > 0.15 ? '正常' : '异常')
    }))
    // 仅在 fallback 路径下，把枚举挂到 supplierOptions（供编辑表单可选项）
      __supplierFallbackList = [...supplierList]
    }
  pagination.total = productsView.value.length
}

const refreshProducts = async () => {
  loading.value = true
  await store.fetchProducts().catch(() => { Message.error('刷新失败') })
  buildProductsView()
  loading.value = false
  Message.success('已刷新档案数据')
}

onMounted(async () => {
  await store.fetchProducts()
  await contractStore.fetchContractList({ page: 1, pageSize: 50 })
  sessionStorage.setItem('archiveId', archiveId.value)
  const listRaw = products.value
  const list = Array.isArray(listRaw) ? listRaw : []
  stats.archive.products = list.length
  stats.archive.interfaces = list.reduce((sum, p) => {
    const interfaces = typeof p.interfaces === 'number' ? p.interfaces : 1
    return sum + interfaces
  }, 0)
  const suppliers = new Set(list.map((p) => p?.supplier).filter(Boolean))
  stats.archive.suppliers = suppliers.size

  const onlineCount = list.filter((p) => p?.status === 'online').length
  const maintainingCount = list.filter((p) => p?.status === 'maintaining').length
  const pendingEvalCount = list.filter((p) => p?.status === 'pending_evaluation').length
  if (onlineCount || maintainingCount || pendingEvalCount) {
    overview[0].value = onlineCount
    overview[1].value = maintainingCount
    overview[2].value = pendingEvalCount
  }
  buildProductsView()
  const q = router.currentRoute.value.query as any
  const product = q?.product
  const status = q?.status
  const supplier = q?.supplier
  if (product) { filters.keyword = String(product) }
  if (status) { filters.status = String(status) }
  if (supplier) { filters.suppliers = [String(supplier)] }
  if (product || status || supplier) applyFilter()
})

const goWithQuery = (path, extra = {}) => {
  router.push({ path, query: { archiveId: archiveId.value, from: 'archive', ...extra } }).then(() => {
    Message.info('已跳转')
  }).catch(() => { Message.error('跳转失败') })
}

const businessValue = reactive({
  businessGoal: '提升风控命中与转化',
  expectedBenefit: '年化ROI 120%',
  useScenario: '贷前评分、贷中监控、贷后资产管理',
  businessImpact: '提升通过率并降低坏账率',
  alternativeSolution: '内部风控模型与三方替代接口',
  businessRisk: '数据时效与合规风险'
})
const businessValueData = computed(() => [
  { label: '业务目标', value: businessValue.businessGoal },
  { label: '预期收益', value: businessValue.expectedBenefit },
  { label: '使用场景', value: businessValue.useScenario },
  { label: '业务影响', value: businessValue.businessImpact },
  { label: '替代方案', value: businessValue.alternativeSolution },
  { label: '业务风险', value: businessValue.businessRisk }
])

const usageGuidanceList = reactive([
  { title: '快速入门', desc: '统一接入流程与样例' },
  { title: '最佳实践', desc: '高效调用与参数选择策略' },
  { title: 'FAQ', desc: '常见问题与解法' },
  { title: '成功案例', desc: '应用场景与效果对比' }
])

const lifecycleStatus = ref('maintaining')
const lifecycleStatusLabel = computed(() => lifecycleStatus.value === 'online' ? '在线' : lifecycleStatus.value === 'maintaining' ? '维护中' : '待上线')
const lifecycleStatusTag = computed(() => lifecycleStatus.value === 'online' ? 'success' : lifecycleStatus.value === 'maintaining' ? 'warning' : 'default')
const lifecycleHistory = reactive(['2024-12 接入评估完成', '2025-01 正式上线', '2025-06 版本升级'])

const supplierInfo = reactive({ name: '示例供应商', creditRating: 4.5 })
const supplierInfoData = computed(() => [
  { label: '供应商名称', value: supplierInfo.name },
  { label: '信用评级', value: supplierInfo.creditRating }
])

const daysToExpire = (end) => {
  try { const now = new Date(); const target = new Date(end || ''); return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) } catch { return NaN }
}
const expireTagStatus = (end) => { const d = daysToExpire(end); if (isNaN(d)) return 'default'; if (d < 0) return 'danger'; if (d <= 7) return 'danger'; if (d <= 30) return 'warning'; return 'success' }
const topExpiringContracts = computed(() => {
  const arr = contractStore.list.slice().filter(i => { const d = daysToExpire(i.endDate); return !isNaN(d) && d >= 0 }).sort((a, b) => daysToExpire(a.endDate) - daysToExpire(b.endDate))
  return arr.slice(0, 5)
})

const evaluationSummaryData = computed(() => {
  const latest = (store.evaluationList || []).slice().pop() || null
  const valueA = latest ? latest.result?.score ?? '—' : '—'
  const valueB = latest ? latest.createdAt ?? '—' : '—'
  return [
    { label: '最新评估得分', value: valueA },
    { label: '评估时间', value: valueB }
  ]
})

const techIndexData = reactive([
  { label: '接口健康', value: '正常' },
  { label: '数据更新', value: '及时' },
  { label: '问题记录', value: '0条' },
  { label: '性能指标', value: '响应 120ms' }
])

const editVisible = ref(false)
const editTarget = ref<any>(null)
const editTitle = computed(() => editTarget.value?.isBlankCard ? '新建空白卡片（接口号/落库表名可后期补充）' : '编辑档案')
const editForm = reactive({
  partnerOrg: '', supplier: '', interfaceNo: '', bottomTable: '',
  businessGoal: '', expectedBenefit: '', usageScene: '', billingMode: 'per_call', unitPrice: 0, billingCycle: 'month', currency: 'CNY', effectiveDate: '', expireDate: '', tags: [] as string[], businessImpact: '', alternativeSolution: '', businessRisk: '', remark: ''
})
const resetEditForm = () => {
  editForm.partnerOrg = ''; editForm.supplier = ''; editForm.interfaceNo = ''; editForm.bottomTable = ''
  editForm.businessGoal = ''; editForm.expectedBenefit = ''; editForm.usageScene = ''; editForm.billingMode = 'per_call'; editForm.unitPrice = 0; editForm.billingCycle = 'month'; editForm.currency = 'CNY'; editForm.effectiveDate = ''; editForm.expireDate = ''; editForm.tags = []; editForm.businessImpact = ''; editForm.alternativeSolution = ''; editForm.businessRisk = ''; editForm.remark = ''
}
const openEdit = (record: any) => {
  editTarget.value = record
  // PRD A1: 编辑时回填四字段
  editForm.partnerOrg = record.partnerOrg && record.partnerOrg !== '—' ? record.partnerOrg : ''
  editForm.supplier = record.supplier || ''
  editForm.interfaceNo = record.interfaceNo || ''
  editForm.bottomTable = record.bottomTable || ''
  editForm.businessGoal = businessValue.businessGoal
  editForm.expectedBenefit = businessValue.expectedBenefit
  editForm.usageScene = record.usageScene
  editForm.billingMode = record.billingMode
  editForm.unitPrice = record.unitPrice
  editForm.billingCycle = record.billingCycle
  editForm.currency = record.currency
  editForm.effectiveDate = record.effectiveDate
  editForm.expireDate = record.expireDate
  editForm.tags = Array.isArray(record.tags) ? [...record.tags] : []
  editForm.businessImpact = businessValue.businessImpact
  editForm.alternativeSolution = businessValue.alternativeSolution
  editForm.businessRisk = businessValue.businessRisk
  editForm.remark = ''
  editVisible.value = true
}
// PRD A2 R07: 空白卡片注册入口
const openBlankCreate = () => {
  editTarget.value = { id: 'BLANK-' + Date.now(), name: '新空白外数卡片', code: 'ED-BLANK', isBlankCard: true, status: 'importing', usageScene: '', tags: [], partnerOrg: '', supplier: '', interfaceNo: '', bottomTable: '', createdAt: new Date().toISOString() }
  resetEditForm()
  // 仅填写基础信息留空（接口号/落库表名允许留空）
  editForm.usageScene = ''
  editVisible.value = true
}
const saveEdit = async () => {
  // PRD A1 R01+R02: 合作机构/供应商选项列表要求从枚举选（非空校验可放宽到使用场景）
  if (!editForm.partnerOrg && !editTarget.value?.isBlankCard) { Message.warning('请选择合作机构'); return }
  if (!editForm.supplier && !editTarget.value?.isBlankCard) { Message.warning('请选择供应商'); return }
  saving.value = true
  try {
    if (editTarget.value) {
      editTarget.value.partnerOrg = editForm.partnerOrg
      editTarget.value.supplier = editForm.supplier
      editTarget.value.interfaceNo = editForm.interfaceNo
      editTarget.value.bottomTable = editForm.bottomTable
      editTarget.value.usageScene = editForm.usageScene
      editTarget.value.billingMode = editForm.billingMode
      editTarget.value.unitPrice = editForm.unitPrice
      editTarget.value.billingCycle = editForm.billingCycle
      editTarget.value.currency = editForm.currency
      editTarget.value.effectiveDate = editForm.effectiveDate
      editTarget.value.expireDate = editForm.expireDate
      editTarget.value.tags = Array.isArray(editForm.tags) ? [...editForm.tags] : []
      // 空白卡片首次保存后加入到列表
      if (editTarget.value.isBlankCard && !productsView.value.find(x => x.id === editTarget.value.id)) {
        productsView.value.unshift({ ...editTarget.value })
        pagination.total = productsView.value.length
      }
      editVisible.value = false
      Message.success(editTarget.value.isBlankCard ? '空白卡片创建成功，接口号/落库表名可后期补充' : '保存成功')
    }
  } finally { saving.value = false }
}

const handleImportChange = () => {}
const confirmImport = async () => { importing.value = true; setTimeout(() => { importing.value = false; importVisible.value = false; Message.success('导入完成'); refreshProducts() }, 1000) }

const exportList = () => {
  const headers = ['产品名称','编码','供应商','状态','计费模式','单价','接入时间','使用场景','评估得分','监控状态']
  const rows = productsView.value.map(p => [p.name,p.code,p.supplier,p.status,(p.billingMode||''),p.unitPrice,p.createdAt,p.usageScene,p.evaluationScore,p.monitorStatus])
  const csv = [headers.join(','), ...rows.map(r => r.map(v => String(v ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'external-data-archive.csv'
  a.click()
  URL.revokeObjectURL(url)
  Message.success('已导出')
}

const formatDate = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => s === 'importing' ? '引入中' : s === 'online' ? '已上线' : s === 'pending_evaluation' ? '待评估' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'pending_evaluation' ? 'warning' : s === 'importing' ? 'warning' : 'default'

const importing = ref(false)
const importVisible = ref(false)
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-info h2 {
  margin: 0 0 8px;
}
.page-description {
  color: var(--color-text-2);
}
.toolbar { margin-top: 12px; }
.muted-cell { color: var(--color-text-3); font-style: italic; }
</style>
