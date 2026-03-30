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
          <a-button type="primary" @click="openCreate">新建外数</a-button>
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
            <a-radio value="pending_tech_profile">待完善技术档案</a-radio>
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

    <!-- 档案编辑弹窗 (分步表单) -->
    <a-modal v-model:visible="editVisible" :title="editTarget ? '编辑档案' : '新建外数档案'" :width="800" :footer="false" :mask-closable="false">
      <a-steps :current="currentStep" style="margin-bottom: 24px" small>
        <a-step title="基础信息" />
        <a-step title="接口信息" />
        <a-step title="数据存储与血缘" />
      </a-steps>

      <a-form :model="editForm" layout="vertical">
        <!-- 步骤1：基础信息 -->
        <div v-show="currentStep === 1">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="name" label="外数名称" required>
                <a-input v-model="editForm.name" placeholder="请输入外数名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="supplier" label="供应商">
                <a-input v-model="editForm.supplier" placeholder="请输入供应商名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="status" label="当前状态" required>
                <a-select v-model="editForm.status" placeholder="选择当前状态">
                  <a-option value="importing">引入中</a-option>
                  <a-option value="pending_tech_profile">待完善技术档案</a-option>
                  <a-option value="online">已上线</a-option>
                  <a-option value="pending_evaluation">待评估</a-option>
                  <a-option value="archived">已归档</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item field="usageScene" label="使用场景" required>
                <a-textarea v-model="editForm.usageScene" placeholder="请详细描述该数据的使用场景" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item field="tags" label="标签">
                <a-input-tag v-model="editForm.tags" placeholder="输入后回车添加标签" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 步骤2：接口信息 -->
        <div v-show="currentStep === 2">
          <a-row :gutter="16">
            <a-col :span="16">
              <a-form-item field="apiUrl" label="接口地址" required>
                <a-select v-model="editForm.apiUrl" placeholder="请选择或输入 API 接口地址" allow-create allow-search>
                  <a-option value="https://api.provider.com/v1/query">https://api.provider.com/v1/query (默认查询)</a-option>
                  <a-option value="https://api.provider.com/v2/auth">https://api.provider.com/v2/auth (身份核验)</a-option>
                  <a-option value="https://api.provider.com/v1/batch">https://api.provider.com/v1/batch (批量接口)</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="requestMethod" label="请求方式" required>
                <a-select v-model="editForm.requestMethod" placeholder="选择请求方式">
                  <a-option value="GET">GET</a-option>
                  <a-option value="POST">POST</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-divider orientation="left" style="margin-top: 0">数据要素模型</a-divider>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span><strong>入参定义</strong></span>
              <a-button type="outline" size="small" @click="addInputParam">添加参数</a-button>
            </div>
            <a-table :data="editForm.inputParams" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="参数名">
                  <template #cell="{ record }"><a-input v-model="record.name" size="small" /></template>
                </a-table-column>
                <a-table-column title="类型">
                  <template #cell="{ record }">
                    <a-select v-model="record.type" size="small">
                      <a-option value="string">String</a-option>
                      <a-option value="number">Number</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="必填">
                  <template #cell="{ record }"><a-switch v-model="record.required" size="small" /></template>
                </a-table-column>
                <a-table-column title="是否为要素">
                  <template #cell="{ record }"><a-switch v-model="record.isElement" size="small" /></template>
                </a-table-column>
                <a-table-column title="操作" :width="80">
                  <template #cell="{ rowIndex }"><a-button type="text" status="danger" size="small" @click="removeInputParam(rowIndex)">删除</a-button></template>
                </a-table-column>
              </template>
            </a-table>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span><strong>出参定义</strong></span>
              <a-button type="outline" size="small" @click="addOutputParam">添加参数</a-button>
            </div>
            <a-table :data="editForm.outputParams" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="参数名">
                  <template #cell="{ record }"><a-input v-model="record.name" size="small" /></template>
                </a-table-column>
                <a-table-column title="类型">
                  <template #cell="{ record }">
                    <a-select v-model="record.type" size="small">
                      <a-option value="string">String</a-option>
                      <a-option value="number">Number</a-option>
                      <a-option value="boolean">Boolean</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="描述">
                  <template #cell="{ record }"><a-input v-model="record.description" size="small" /></template>
                </a-table-column>
                <a-table-column title="操作" :width="80">
                  <template #cell="{ rowIndex }"><a-button type="text" status="danger" size="small" @click="removeOutputParam(rowIndex)">删除</a-button></template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>

        <!-- 步骤3：数据存储与血缘 -->
        <div v-show="currentStep === 3">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span><strong>落库表配置 (支持多个)</strong></span>
            <a-button type="primary" size="small" @click="addTargetTable">新增落库表</a-button>
          </div>
          
          <a-card v-for="(table, index) in editForm.targetTables" :key="index" style="margin-bottom: 16px; background: var(--color-fill-2);" :bordered="false">
            <a-row :gutter="16" align="center">
              <a-col :span="14">
                <a-form-item :label="`落库表名 ${index + 1}`" style="margin-bottom: 0;">
                  <a-input v-model="table.name" placeholder="请输入落库表名，如 dwd_external_data_detail" />
                </a-form-item>
              </a-col>
              <a-col :span="10" style="text-align: right; padding-top: 28px;">
                <a-space>
                  <a-button type="outline" size="small" @click="viewTableFields(table.name)" :disabled="!table.name">查看字段</a-button>
                  <a-button type="outline" size="small" @click="viewDataLineage(table.name)" :disabled="!table.name">查看血缘</a-button>
                  <a-button type="text" status="danger" @click="removeTargetTable(index)" v-if="editForm.targetTables.length > 1">删除</a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <!-- 底部导航按钮 -->
        <div style="text-align: right; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-neutral-3);">
          <a-space>
            <a-button @click="editVisible = false">取消</a-button>
            <a-button v-if="currentStep > 1" @click="currentStep--">上一步</a-button>
            <a-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</a-button>
            <a-button v-if="currentStep === 3" type="primary" :loading="saving" @click="saveEdit">保存并完成</a-button>
          </a-space>
        </div>

      </a-form>
    </a-modal>

    <!-- 查看表字段抽屉 -->
    <a-drawer v-model:visible="tableFieldsVisible" :width="500" title="表字段详情">
      <a-table :data="mockTableFields" :pagination="false">
        <template #columns>
          <a-table-column title="字段名" data-index="name" />
          <a-table-column title="类型" data-index="type" />
          <a-table-column title="注释" data-index="comment" />
        </template>
      </a-table>
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
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!editForm.name || !editForm.usageScene) {
      Message.warning('请填写必填的基础信息')
      return
    }
  } else if (currentStep.value === 2) {
    if (!editForm.apiUrl) {
      Message.warning('请填写接口地址')
      return
    }
  }
  currentStep.value++
}

const addTargetTable = () => {
  editForm.targetTables.push({ name: '' })
}
const removeTargetTable = (index: number) => {
  editForm.targetTables.splice(index, 1)
}

const editForm = reactive({ 
  name: '', supplier: '', status: 'importing', apiUrl: '', requestMethod: 'POST', 
  inputParams: [{ name: '', type: 'string', required: true, isElement: false }],
  outputParams: [{ name: '', type: 'string', description: '' }],
  targetTables: [{ name: '' }],
  businessGoal: '', expectedBenefit: '', usageScene: '', billingMode: 'per_call', unitPrice: 0, billingCycle: 'month', currency: 'CNY', effectiveDate: '', expireDate: '', tags: [] as string[], businessImpact: '', alternativeSolution: '', businessRisk: '', remark: '' 
})

const tableFieldsVisible = ref(false)
const mockTableFields = ref([
  { name: 'id', type: 'bigint', comment: '主键ID' },
  { name: 'user_name', type: 'varchar', comment: '用户姓名' },
  { name: 'id_card', type: 'varchar', comment: '身份证号' },
  { name: 'risk_score', type: 'int', comment: '风险评分' },
  { name: 'create_time', type: 'timestamp', comment: '创建时间' }
])

const viewTableFields = (tableName?: string) => {
  tableFieldsVisible.value = true
}

const viewDataLineage = (tableName?: string) => {
  Message.info(`即将跳转至表 ${tableName} 的血缘图谱页面...`)
}

const openCreate = () => { 
  editTarget.value = null; 
  currentStep.value = 1;
  editForm.name = ''; editForm.supplier = ''; editForm.status = 'importing'; editForm.apiUrl = ''; editForm.requestMethod = 'POST'; 
  editForm.inputParams = [{ name: '', type: 'string', required: true, isElement: false }];
  editForm.outputParams = [{ name: '', type: 'string', description: '' }];
  editForm.targetTables = [{ name: '' }];
  editForm.businessGoal = ''; editForm.expectedBenefit = ''; editForm.usageScene = ''; editForm.billingMode = 'per_call'; editForm.unitPrice = 0; editForm.billingCycle = 'month'; editForm.currency = 'CNY'; editForm.effectiveDate = ''; editForm.expireDate = ''; editForm.tags = []; editForm.businessImpact = ''; editForm.alternativeSolution = ''; editForm.businessRisk = ''; editForm.remark = ''; editVisible.value = true 
}

const openEdit = (record: any) => { 
  editTarget.value = record; 
  currentStep.value = 1;
  editForm.name = record.name || '';
  editForm.supplier = record.supplier || '';
  editForm.status = record.status || 'importing';
  editForm.usageScene = record.usageScene; 
  editForm.targetTables = record.targetTables || [{ name: record.targetTable || '' }];
  editForm.billingMode = record.billingMode; 
  editForm.unitPrice = record.unitPrice; 
  editForm.billingCycle = record.billingCycle; 
  editForm.currency = record.currency; 
  editForm.effectiveDate = record.effectiveDate; 
  editForm.expireDate = record.expireDate; 
  editForm.tags = Array.isArray(record.tags) ? [...record.tags] : []; 
  editVisible.value = true; 
}
// 添加/删除入参
const addInputParam = () => {
  editForm.inputParams.push({ name: '', type: 'string', required: true, isElement: false })
}
const removeInputParam = (index: number) => {
  editForm.inputParams.splice(index, 1)
}

// 添加/删除出参
const addOutputParam = () => {
  editForm.outputParams.push({ name: '', type: 'string', description: '' })
}
const removeOutputParam = (index: number) => {
  editForm.outputParams.splice(index, 1)
}

const openDetail = (record: any) => { detailTarget.value = record; detailVisible.value = true }
const goDetailPage = (record: any) => { router.push({ path: `/external-data/archive/${String(record.id)}`, query: { from: 'archive', archiveId: archiveId.value } }) }
const saveEdit = async () => { if (!editForm.usageScene) { Message.error('请填写使用场景'); return } saving.value = true; try { if (editTarget.value) { editTarget.value.usageScene = editForm.usageScene; editTarget.value.billingMode = editForm.billingMode; editTarget.value.unitPrice = editForm.unitPrice; editTarget.value.billingCycle = editForm.billingCycle; editTarget.value.currency = editForm.currency; editTarget.value.effectiveDate = editForm.effectiveDate; editTarget.value.expireDate = editForm.expireDate; editTarget.value.tags = Array.isArray(editForm.tags) ? [...editForm.tags] : []; if (editTarget.value.status === 'pending_tech_profile') { editTarget.value.status = 'online'; Message.success('技术档案完善成功，状态已更新为【已上线】'); } else { Message.success('档案更新成功'); } } else { Message.success('档案新建成功'); } editVisible.value = false; } finally { saving.value = false } }
const formatDate = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }
const billingModeLabel = (m?: string) => m === 'per_call' ? '按次' : m === 'monthly' ? '按月' : m === 'tier' ? '阶梯' : '—'
const statusLabel = (s?: string) => {
  switch(s) {
    case 'online': return '已上线'
    case 'importing': return '引入中'
    case 'pending_evaluation': return '待评估'
    case 'pending_tech_profile': return '待完善技术档案'
    case 'archived': return '已归档'
    default: return s || '—'
  }
}
const statusTag = (s?: string) => {
  switch(s) {
    case 'online': return 'success'
    case 'importing': return 'processing'
    case 'pending_evaluation': return 'warning'
    case 'pending_tech_profile': return 'warning'
    case 'archived': return 'normal'
    default: return 'normal'
  }
}

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
