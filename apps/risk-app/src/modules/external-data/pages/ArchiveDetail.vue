<template>
  <div class="archive-detail">
    <div class="page-header">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>外数档案</a-breadcrumb-item>
        <a-breadcrumb-item>产品详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">{{ header.name }}</h1>
          <a-descriptions :column="2" class="header-info" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="产品编码">{{ header.code || '—' }}</a-descriptions-item>
            <a-descriptions-item label="供应商"><a-tag>{{ header.supplier || '—' }}</a-tag></a-descriptions-item>
            <a-descriptions-item label="状态"><a-tag :status="statusTag(header.status)">{{ statusLabel(header.status) }}</a-tag></a-descriptions-item>
            <a-descriptions-item label="上线时间">{{ header.onlineTime || '—' }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ header.manager || '—' }}</a-descriptions-item>
            <a-descriptions-item label="接口标签">{{ header.interfaceTag || '—' }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="actions">
          <a-button @click="goBackList"><template #icon><IconArrowLeft /></template>返回档案</a-button>
          <a-button type="primary" @click="editVisible = true"><template #icon><IconEdit /></template>编辑档案</a-button>
        </div>
      </div>
    </div>
    <div class="detail-content">
      <a-tabs v-model:active-key="activeTab" class="detail-tabs">
        <a-tab-pane key="product" title="产品信息">
          <a-card class="detail-card"><a-descriptions :column="2" :data="productBasic" /><a-divider style="margin: 16px 0" /><a-descriptions :column="2" :data="productExtra" /></a-card>
        </a-tab-pane>
        <a-tab-pane key="contract" title="商务合同">
          <a-card class="detail-card">
            <div style="margin-bottom: 16px; font-weight: 600; font-size: 16px;">合同概览</div>
            <a-descriptions :column="2">
              <a-descriptions-item label="累计补充金额">{{ formatCurrency(contractInfo.totalSupplementAmount) }}</a-descriptions-item>
              <a-descriptions-item label="关联框架协议数">{{ contractInfo.frameworkAgreements.length }}</a-descriptions-item>
            </a-descriptions>
            <a-divider style="margin: 16px 0" />
            <div style="margin-bottom: 16px; font-weight: 600; font-size: 16px;">框架协议列表</div>
            <a-table :data="contractInfo.frameworkAgreements" :pagination="false">
              <template #columns>
                <a-table-column title="协议编号" data-index="id" />
                <a-table-column title="协议名称" data-index="name" />
                <a-table-column title="签署日期" data-index="signDate" />
                <a-table-column title="合同金额">
                  <template #cell="{ record }">{{ formatCurrency(record.amount) }}</template>
                </a-table-column>
                <a-table-column title="免费量" data-index="freeQuota" />
                <a-table-column title="免费量有效期" data-index="validPeriod" />
                <a-table-column title="已减免量" data-index="deductedAmount" />
                <a-table-column title="备注" data-index="remark" />
              </template>
              <template #empty><a-empty description="暂无关联框架协议" /></template>
            </a-table>
            <a-divider style="margin: 16px 0" />
            <div style="margin-bottom: 16px; font-weight: 600; font-size: 16px;">补充合同列表</div>
            <a-table :data="contractInfo.supplementaryAgreements" :pagination="false">
              <template #columns>
                <a-table-column title="合同编号" data-index="id" />
                <a-table-column title="合同名称" data-index="name" />
                <a-table-column title="签署日期" data-index="signDate" />
                <a-table-column title="免费量" data-index="freeQuota" />
                <a-table-column title="免费量有效期" data-index="validPeriod" />
                <a-table-column title="已减免量" data-index="deductedAmount" />
                <a-table-column title="备注" data-index="remark" />
              </template>
              <template #empty><a-empty description="暂无关联补充合同" /></template>
            </a-table>
            <a-divider style="margin: 16px 0" />
            <div style="margin-bottom: 16px; font-weight: 600; font-size: 16px;">核销列表</div>
            <a-table :data="contractInfo.writeoffs" :pagination="false">
              <template #columns>
                <a-table-column title="账单月" data-index="month" />
                <a-table-column title="核销金额">
                  <template #cell="{ record }">{{ formatCurrency(record.amount) }}</template>
                </a-table-column>
                <a-table-column title="核销减免量" data-index="discountAmount" />
                <a-table-column title="关联合同" data-index="contractName" />
                <a-table-column title="备注信息" data-index="remark" />
              </template>
              <template #empty><a-empty description="暂无核销记录" /></template>
            </a-table>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="monitor" title="效果监控">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="effectSummary" />
            <a-divider style="margin: 12px 0" />
            <a-table :data="monitorRows" :pagination="false">
              <template #columns>
                <a-table-column title="月份" data-index="month" :width="120" />
                <a-table-column title="预算剩余(%)" data-index="budgetPct" :width="140" />
                <a-table-column title="实际剩余(%)" data-index="actualPct" :width="140" />
              </template>
              <template #empty><a-empty description="暂无监控数据" /></template>
            </a-table>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="lifecycle" title="生命周期阶段">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="lifecycleHeader" />
            <a-divider style="margin: 12px 0" />
            <a-table :data="lifecycleStages" :pagination="false">
              <template #columns>
                <a-table-column title="阶段" data-index="stage" :width="160" />
                <a-table-column title="状态" :width="120">
                  <template #cell="{ record }"><a-tag :status="record.status==='completed'?'success':(record.status==='in_progress'?'warning':'default')">{{ record.status }}</a-tag></template>
                </a-table-column>
                <a-table-column title="开始时间" data-index="startDate" :width="160" />
                <a-table-column title="结束时间" data-index="endDate" :width="160" />
                <a-table-column title="描述" data-index="description" />
              </template>
              <template #empty><a-empty description="暂无阶段数据" /></template>
            </a-table>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="tech" title="接口技术">
          <a-card class="detail-card"><a-descriptions :column="2" :data="techInfo" /></a-card>
        </a-tab-pane>
        <a-tab-pane key="inputs" title="产品入参"><a-card class="detail-card"><a-table :columns="inputColumns" :data="inputParams" :pagination="false" /></a-card></a-tab-pane>
        <a-tab-pane key="outputs" title="产品出参"><a-card class="detail-card"><a-table :columns="outputColumns" :data="outputParams" :pagination="false" /></a-card></a-tab-pane>
      </a-tabs>
    </div>
    <a-modal v-model:visible="editVisible" title="编辑档案" :width="800" :footer="false" :mask-closable="false">
      <a-steps :current="currentStep" style="margin-bottom: 24px" small>
        <a-step title="基础信息" />
        <a-step title="接口配置" />
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
              <a-form-item field="description" label="描述" required>
                <a-textarea v-model="editForm.description" placeholder="请详细描述该数据" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item field="tags" label="标签">
                <a-input-tag v-model="editForm.tags" placeholder="输入后回车添加标签" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- 步骤2：接口配置 -->
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
            <a-button v-if="currentStep === 3" type="primary" @click="saveEdit">保存并完成</a-button>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExternalDataStore } from '@/modules/external-data/stores'
import { useContractStore } from '../../budget/stores/contract'
import { useSettlementFlowStore } from '../../budget/stores/settlementFlow'
import { IconArrowLeft, IconEdit } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import DateUtils from '@/utils/dateUtils'

const route = useRoute()
const router = useRouter()
const store = useExternalDataStore()
const contractStore = useContractStore()
const settlementFlowStore = useSettlementFlowStore()

const activeTab = ref('product')
const dataId = computed(() => String(route.params.id || ''))
const header = ref<any>({})
const editVisible = ref(false)
const currentStep = ref(1)

const editForm = ref({ 
  name: '', supplier: '', status: 'importing', description: '', usageScene: '', tags: [] as string[], manager: '',
  apiUrl: '', requestMethod: 'POST',
  inputParams: [{ name: '', type: 'string', required: true, isElement: false }],
  outputParams: [{ name: '', type: 'string', description: '' }],
  targetTables: [{ name: '' }]
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
  Message.info(`即将跳转至表 ${tableName || ''} 的血缘图谱页面...`)
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!editForm.value.name) {
      Message.warning('请填写外数名称')
      return
    }
  } else if (currentStep.value === 2) {
    if (!editForm.value.apiUrl) {
      Message.warning('请填写接口地址')
      return
    }
  }
  currentStep.value++
}

const addTargetTable = () => {
  editForm.value.targetTables.push({ name: '' })
}
const removeTargetTable = (index: number) => {
  editForm.value.targetTables.splice(index, 1)
}

const openEdit = () => { 
  currentStep.value = 1
  editForm.value.name = header.value.name || ''
  editForm.value.supplier = header.value.supplier || ''
  editForm.value.status = 'online'
  editForm.value.description = header.value.description
  editForm.value.usageScene = header.value.usageScene || ''
  editForm.value.tags = [...(header.value.tags || [])]
  editForm.value.apiUrl = 'https://api.provider.com/v1/query'
  editForm.value.requestMethod = 'POST'
  editForm.value.targetTables = [{ name: header.value.targetTable || 'dwd_external_data_detail' }]
  editForm.value.inputParams = [{ name: 'id_card', type: 'string', required: true, isElement: true }]
  editForm.value.outputParams = [{ name: 'risk_score', type: 'number', description: '风险评分' }]
  editVisible.value = true 
}

// 添加/删除入参
const addInputParam = () => {
  editForm.value.inputParams.push({ name: '', type: 'string', required: true, isElement: false })
}
const removeInputParam = (index: number) => {
  editForm.value.inputParams.splice(index, 1)
}

// 添加/删除出参
const addOutputParam = () => {
  editForm.value.outputParams.push({ name: '', type: 'string', description: '' })
}
const removeOutputParam = (index: number) => {
  editForm.value.outputParams.splice(index, 1)
}

const contractInfo = ref<{
  totalSupplementAmount: number;
  frameworkAgreements: Array<{ id: string; name: string; signDate: string; amount: number; freeQuota: number; validPeriod: string; remark: string; deductedAmount: number }>;
  supplementaryAgreements: Array<{ id: string; name: string; signDate: string; freeQuota: number; validPeriod: string; remark: string; deductedAmount: number }>;
  writeoffs: Array<{ month: string; amount: number; discountAmount: number; remark: string; contractName: string }>;
}>({
  totalSupplementAmount: 0,
  frameworkAgreements: [],
  supplementaryAgreements: [],
  writeoffs: []
})
const effectSummary = computed(() => [
  { label: '覆盖率', value: `${coverage.value}%` },
  { label: '命中率', value: `${hitRate.value}%` },
  { label: '提升度', value: `${lift.value}%` },
  { label: '平均延迟(ms)', value: avgLatency.value }
])
const lifecycleHeader = computed(() => [
  { label: '当前阶段', value: store.lifecycle?.currentStage || '—' },
  { label: '当前状态', value: store.lifecycle?.currentStatus || '—' }
])
const lifecycleStages = computed(() => store.lifecycleStages || [])
const monitorRows = computed(() => {
  const arr = Array.isArray(store.burndown) ? store.burndown : []
  return arr.slice(-6).map((p: any) => ({
    month: p.month || p.period || '—',
    budgetPct: p.initialBudget ? Number(((p.budget / p.initialBudget) * 100).toFixed(2)) : 0,
    actualPct: p.initialBudget ? Number(((p.actual / p.initialBudget) * 100).toFixed(2)) : 0
  }))
})
const coverage = ref(85)
const hitRate = ref(62)
const lift = ref(18)
const avgLatency = ref(120)

const goBackList = () => { router.push({ path: '/external-data/archive' }) }
const statusLabel = (s?: string) => s === 'importing' ? '引入中' : s === 'online' ? '已上线' : s === 'pending_evaluation' ? '待评估' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'pending_evaluation' ? 'warning' : s === 'importing' ? 'warning' : 'default'
const formatDate = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n == null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }

const productBasic = computed(() => [
  { label: '接口编号', value: header.value.interfaceId || '—' },
  { label: '供应商', value: header.value.supplier || '—' },
  { label: '单价', value: header.value.price ? `${header.value.price}元/次` : '—' },
  { label: '管理人员', value: header.value.manager || '—' },
  { label: '上线时间', value: header.value.onlineTime || '—' },
  { label: '接口状态', value: header.value.status || '—' },
  { label: '接口标签', value: header.value.interfaceTag || '—' },
  { label: '更新频率', value: header.value.updateFrequency || '—' },
  { label: '数据来源', value: header.value.dataSource || '—' }
])
const productExtra = computed(() => [{ label: '描述信息', value: header.value.description || '—' },{ label: '标签', value: (header.value.tags || []).join('、') || '—' }])
const techInfo = computed(() => [{ label: '请求方式', value: header.value.requestMethod || '—' },{ label: '请求地址', value: header.value.apiUrl || '—' },{ label: 'Headers', value: header.value.headers || '—' },{ label: '请求超时', value: header.value.timeout ? `${header.value.timeout}秒` : '—' },{ label: 'QPS限制', value: header.value.qpsLimit ? `${header.value.qpsLimit}次/秒` : '—' },{ label: '目标表', value: header.value.targetTable || '—' }])
const inputParams = ref<any[]>([])
const outputParams = ref<any[]>([])

const inputColumns = [{ title: '参数名称', dataIndex: 'name' },{ title: '参数类型', dataIndex: 'type' },{ title: '是否必填', dataIndex: 'required', render: ({ record }: any) => record.required ? '是' : '否' },{ title: '参数说明', dataIndex: 'description' }]
const outputColumns = [{ title: '参数名称', dataIndex: 'name' },{ title: '参数类型', dataIndex: 'type' },{ title: '参数说明', dataIndex: 'description' }]

const loadDetail = async () => {
  try {
    await store.fetchProducts()
    await store.fetchBurndown({ range: 'month', productId: dataId.value })
    await store.fetchLifecycleData({ productId: dataId.value })
    const fromStore = (store.products || []).find((p: any) => String(p.id) === dataId.value) as any
    const base = fromStore || { id: dataId.value, name: '外数产品', supplier: '供应商', status: 'online' }
    header.value = { 
      name: base.name || '—',
      code: base.code || `ED-${base.id}`,
      supplier: base.supplier || '—',
      status: base.status || 'importing',
      manager: '档案负责人',
      interfaceTag: '主接口',
      onlineTime: new Date().toISOString(),
      description: base.description || '',
      tags: Array.isArray(base.tags) ? base.tags : ['外数','风控'],
      price: base.unitPrice || 0,
      updateFrequency: '日',
      dataSource: '外部API',
      requestMethod: 'POST',
      apiUrl: '/api/external/call',
      headers: 'Authorization, Content-Type',
      timeout: 30,
      qpsLimit: 100,
      targetTable: base.bottomTable || base.dbTable || base.tableName || 'dwd.external_table',
      interfaceId: `EXT${String(base.id).padStart(3,'0')}`
    }
    inputParams.value = [{ name: 'id_card', type: 'string', required: true, description: '身份证号' },{ name: 'phone', type: 'string', required: false, description: '手机号' }]
    outputParams.value = [{ name: 'score', type: 'number', description: '风险评分' },{ name: 'risk_level', type: 'string', description: '风险等级' }]
    
    // Load Contracts
    await contractStore.fetchContractList({ supplier: header.value.supplier })
    const contracts = contractStore.list.filter(c => c.supplier === header.value.supplier)
    const frameworks = contracts.filter(c => c.contractType === 'framework')
    const supplements = contracts.filter(c => c.contractType === 'supplement')
    
    contractInfo.value.frameworkAgreements = frameworks.map(c => ({
      id: c.id,
      name: c.contractName,
      signDate: c.startDate.split('T')[0],
      amount: c.amount,
      freeQuota: c.productCount ? c.productCount * 1000 : 0, // Mock free quota logic
      validPeriod: `${c.startDate.split('T')[0]} ~ ${c.endDate.split('T')[0]}`,
      remark: '无',
      deductedAmount: c.writtenOffAmount || 0
    }))
    contractInfo.value.supplementaryAgreements = supplements.map(c => ({
      id: c.id,
      name: c.contractName,
      signDate: c.startDate.split('T')[0],
      freeQuota: c.productCount ? c.productCount * 500 : 0, // Mock free quota logic
      validPeriod: `${c.startDate.split('T')[0]} ~ ${c.endDate.split('T')[0]}`,
      remark: '无',
      deductedAmount: c.writtenOffAmount || 0
    }))
    contractInfo.value.totalSupplementAmount = supplements.reduce((sum, c) => sum + (c.amount || 0), 0)
    
    // Load Writeoffs
    const writeoffList = []
    const prefix = `${header.value.supplier}-`
    for (const [key, snapshot] of Object.entries(settlementFlowStore.writeoffByKey)) {
      if (key.startsWith(prefix)) {
        const month = key.replace(prefix, '')
        if (snapshot && snapshot.records) {
          for (const record of snapshot.records) {
            const contract = contracts.find(c => c.id === record.contractId)
            writeoffList.push({
              month,
              amount: record.amount,
              discountAmount: record.discountAmount || 0,
              remark: record.remark || '',
              contractName: contract ? contract.contractName : record.contractId
            })
          }
        }
      }
    }
    contractInfo.value.writeoffs = writeoffList.sort((a, b) => b.month.localeCompare(a.month))
  } catch { Message.error('加载详情失败') }
}
onMounted(loadDetail)

const saveEdit = () => { editVisible.value = false; Message.success('档案已更新') }
</script>

<style scoped>
.archive-detail { padding: 24px; min-height: calc(100vh - 64px); }
.breadcrumb { margin-bottom: 16px; }
.page-header { background: #f8f9fa; padding: 16px; border: 1px solid #e5e6eb; border-radius: 8px; margin-bottom: 16px; }
.header-content { display: flex; justify-content: space-between; align-items: flex-start; }
.title { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
.actions :deep(.arco-btn) { margin-left: 8px; }
.detail-content { background: #fff; border: 1px solid #e5e6eb; border-radius: 8px; padding: 16px; }
.detail-card { margin-bottom: 16px; }
</style>
