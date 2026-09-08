<template>
  <div class="settlement-management">
    <div class="page-header">
      <h3>结算管理</h3>
      <!-- PRD I10: 流程顺序说明 -->
      <p class="desc">流程：上传外部账单 → 费用核算（系统自动匹配产品） → 确认核销 → 待报销</p>
    </div>

    <a-card class="flow-overview" :bordered="true" style="margin-bottom: 12px">
      <a-steps :current="flowStageIndex" size="small">
        <a-step title="上传外部账单" description="先上传对账单" />
        <a-step title="费用核算" description="系统解析匹配" />
        <a-step title="确认核销" description="按合同扣减" />
        <a-step title="待报销" description="提交报销" />
      </a-steps>
    </a-card>

    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="suppliers" label="合作机构">
          <a-select v-model="filters.suppliers" multiple allow-clear placeholder="选择合作机构" style="width: 260px">
            <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="contracts" label="合同">
          <a-select v-model="filters.contracts" multiple allow-clear placeholder="选择合同" style="width: 300px">
            <a-option v-for="c in contractOptions" :key="c.id" :value="c.id">{{ c.contractName }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="timeLabel" label="结算周期">
          <a-select v-model="filters.timeLabel" allow-clear placeholder="选择月份" style="width: 160px">
            <a-option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.value.replace('-', '') }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 140px">
            <a-option value="reconcile">待对账</a-option>
            <a-option value="costing">待核算</a-option>
            <a-option value="writeoff">待核销</a-option>
            <a-option value="pending_reimbursement">待报销</a-option>
            <a-option value="done">已完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-space>
            <a-button type="primary" @click="applyFilter">查询</a-button>
            <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
            <a-button style="margin-left: 8px" type="primary" @click="showCreate = true">
              <template #icon><IconPlus /></template>
              发起结算
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="结算任务列表" :bordered="true" :loading="loading">
      <a-table :data="displayedTasks" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="任务名称" :width="180">
            <template #cell="{ record }">
              <a-link @click="openDetail(record)">{{ record.taskName || record.id }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="合作机构" :width="140">
            <template #cell="{ record }">{{ record.supplierIds[0] || '—' }}</template>
          </a-table-column>
          <a-table-column title="合同数" :width="100">
            <template #cell="{ record }">{{ record.contractIds.length }}</template>
          </a-table-column>
          <a-table-column title="结算周期" :width="200">
            <template #cell="{ record }">{{ granularityLabel(record.granularity) }} · {{ rangeLabel(record.timeLabel) }}</template>
          </a-table-column>
          <a-table-column title="实际金额" :width="140">
            <template #cell="{ record }">{{ formatAmount(record.summary.actualAmount) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }">
              <StatusTag :status="record.stage || 'reconcile'" dictKey="budgetTask" />
            </template>
          </a-table-column>
          <a-table-column title="创建人" :width="120">
            <template #cell="{ record }">{{ record.createdBy }}</template>
          </a-table-column>
          <a-table-column title="创建时间" :width="180">
            <template #cell="{ record }">{{ DateUtils.formatDateTime(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="400" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button v-if="record.stage==='reconcile'" size="small" type="text" @click="startReconcile(record)">发起对账</a-button>
                <a-button v-if="record.stage==='costing'" size="small" type="text" @click="startCosting(record)">发起核算</a-button>
                <a-button v-if="record.stage==='writeoff'" size="small" type="text" @click="startWriteoff(record)">发起核销</a-button>
                <a-button v-if="record.stage==='pending_reimbursement'" size="small" type="text" @click="startReimbursement(record)">发起报销</a-button>
                <a-dropdown>
                  <a-button size="small" type="text">下载数据</a-button>
                  <template #content>
                    <a-doption @click="exportReconcile(record)">导出对账数据</a-doption>
                    <a-doption @click="exportCosting(record)">导出核算数据</a-doption>
                    <a-doption @click="exportWriteoff(record)">导出核销数据</a-doption>
                  </template>
                </a-dropdown>
                <a-button v-if="record.stage!=='done'" size="small" type="text" status="danger" @click="deleteTask(record)">删除</a-button>
                <a-button v-if="record.stage==='done'" size="small" type="text" @click="cancelTask(record)">撤销</a-button>
                <a-button v-if="record.stage==='done' && !record.archived" size="small" type="text" @click="archiveTask(record)">归档</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="showCreate" title="发起结算（先上传外部账单）" :width="800" ok-text="创建并进入对账" cancel-text="取消" @ok="submitCreate">
      <a-alert type="info" style="margin-bottom: 12px" message="流程调整：先上传外部账单，系统自动基于码表匹配产品，未匹配项可在下一步手动选择。" show-icon />
      <a-form ref="createFormRef" :model="createForm" :rules="createRules" layout="vertical">
        <!-- PRD I10: 流程顺序调换：第1步上传外部账单 -->
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="taskName" label="任务名称" required>
              <a-input v-model="createForm.taskName" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="supplierId" label="合作机构" required>
              <a-select v-model="createForm.supplierId" allow-clear allow-search placeholder="选择合作机构" @change="onSupplierOrPeriodChange">
                <a-option v-for="s in supplierOptions" :key="s" :value="s">{{ s }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item field="timeLabel" label="结算周期" required>
              <a-select v-model="createForm.timeLabel" placeholder="选择月份" @change="onSupplierOrPeriodChange">
                <a-option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <!-- PRD R27: 多次结算提醒 -->
            <a-alert v-if="settlementCount > 0" type="warning" style="margin-top: 30px" :message="`${createForm.supplierId}+${settlementPeriodStr}已经结算${settlementCount}次，本次为第${settlementCount + 1}次结算`" />
          </a-col>
        </a-row>
        <!-- PRD I10: 第1步——上传外部账单（暂存） + I14 前端暂存 -->
        <a-row :gutter="12">
          <a-col :span="24">
            <a-form-item label="上传外部账单（暂存，不立即提交后端）" required>
              <a-upload
                :auto-upload="false"
                :show-file-list="true"
                :file-list="createForm.billFileList"
                @change="onBillFileChange"
                accept=".csv,.xlsx,.xls"
                @before-upload="(file: any) => { billFileSizeCheck(file); return true }"
              >
                <a-button type="primary">
                  <template #icon><icon-upload /></template>
                  选择外部账单文件
                </a-button>
              </a-upload>
              <div style="margin-top: 8px; color: var(--color-text-3); font-size: 12px">
                支持 CSV / Excel；上传后仅在前端暂存，所有信息填完后一次性提交后端。
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- PRD I13: 映射记录展示位置调整到此处 -->
        <a-row :gutter="12">
          <a-col :span="24">
            <a-form-item label="映射记录（暂存）">
              <a-space>
                <a-button @click="downloadReconciliationTemplate">下载对账单模板</a-button>
                <a-button @click="downloadMappingRecord">下载历史映射记录</a-button>
                <a-upload :auto-upload="false" accept=".xlsx,.xls" :before-upload="onMappingUpload" :show-file-list="false">
                  <a-button>上传映射记录</a-button>
                </a-upload>
                <a-button type="outline" :disabled="!createForm.mappingList.length" @click="downloadStagedMapping">下载已暂存映射</a-button>
              </a-space>
              <div v-if="createForm.mappingList.length" style="margin-top: 8px">
                <a-tag v-for="m in createForm.mappingList" :key="m.__id" closable @close="removeStagedMapping(m)">{{ m.interfaceNo || '—' }} → {{ m.externalProductCode || m.externalProductName || '未匹配' }}</a-tag>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- PRD I12: 匹配页面6字段预览（从账单暂存数据解析展示） -->
        <a-row :gutter="12">
          <a-col :span="24">
            <a-form-item label="匹配预览（暂存解析结果，未点击保存前不持久化）">
              <a-table :data="previewRows" :pagination="false" size="small" :bordered="{ wrapper: true, cell: false }">
                <template #columns>
                  <a-table-column title="产品名称" data-index="productName" :width="160" />
                  <a-table-column title="内部账单金额" :width="140">
                    <template #cell="{ record }">{{ formatAmount(record.systemAmount) }}</template>
                  </a-table-column>
                  <a-table-column title="外部账单金额" :width="140">
                    <template #cell="{ record }">{{ formatAmount(record.externalAmount) }}</template>
                  </a-table-column>
                  <a-table-column title="内部单价" :width="120">
                    <template #cell="{ record }">{{ formatPrice(record.systemUnitPrice) }}</template>
                  </a-table-column>
                  <a-table-column title="外部单价" :width="120">
                    <template #cell="{ record }">{{ formatPrice(record.externalUnitPrice) }}</template>
                  </a-table-column>
                  <a-table-column title="内部免费量" :width="110">
                    <template #cell="{ record }">{{ record.systemDiscount || 0 }}</template>
                  </a-table-column>
                  <a-table-column title="外部免费量" :width="110">
                    <template #cell="{ record }">{{ record.externalDiscount || 0 }}</template>
                  </a-table-column>
                </template>
                <template #empty>
                  <a-empty description="上传账单后将自动解析展示，未匹配条目可在下一步手动选择" />
                </template>
              </a-table>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="callMethod" label="付款账目类型">
              <a-select v-model="createForm.callMethod" allow-clear placeholder="上传账单后自动读取" disabled>
                <a-option value="线上">线上</a-option>
                <a-option value="线下">线下</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="createdBy" label="创建人">
              <a-input v-model="createForm.createdBy" placeholder="输入创建人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="createForm.remark" :rows="3" placeholder="填写备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="detailVisible" :width="900" title="任务详情">
      <a-steps :current="detailStep" style="margin-bottom: 12px">
        <a-step title="上传账单" description="已完成" />
        <a-step title="费用核算" description="系统聚合" />
        <a-step title="确认核销" description="按合同扣减" />
        <a-step title="待报销" description="提交报销" />
      </a-steps>
      <a-alert v-if="writeoffLockHint" type="warning" :message="writeoffLockHint" show-icon style="margin-bottom: 12px" />

      <a-card title="费用核算（按内部产品聚合）" :bordered="true" style="margin-bottom: 12px">
        <a-table :data="costingAggregatedRows" :pagination="false" size="small" :bordered="{ wrapper: true, cell: true }">
          <template #columns>
            <a-table-column title="内部产品" data-index="productName" :width="180" />
            <a-table-column title="计费量（求和）" :width="120">
              <template #cell="{ record }">{{ record.callCount || 0 }}</template>
            </a-table-column>
            <a-table-column title="减免量（求和）" :width="120">
              <template #cell="{ record }">{{ record.discount || 0 }}</template>
            </a-table-column>
            <a-table-column title="内部账单金额" :width="150">
              <template #cell="{ record }">{{ formatAmount(record.systemAmount) }}</template>
            </a-table-column>
            <a-table-column title="外部账单金额" :width="150">
              <template #cell="{ record }">{{ formatAmount(record.externalAmount) }}</template>
            </a-table-column>
            <a-table-column title="内部单价" :width="120">
              <template #cell="{ record }">{{ formatPrice(record.systemUnitPrice) }}</template>
            </a-table-column>
            <a-table-column title="外部单价（AVG）" :width="130">
              <template #cell="{ record }">{{ formatPrice(record.externalUnitPrice) }}</template>
            </a-table-column>
            <a-table-column title="费用（求和）" :width="120">
              <template #cell="{ record }">{{ formatAmount(record.fee) }}</template>
            </a-table-column>
            <a-table-column title="类型" :width="100">
              <template #cell="{ record }"><a-tag :status="record.type === '线上' ? 'arcoblue' : 'orange'">{{ record.type }}</a-tag></template>
            </a-table-column>
          </template>
          <template #empty><a-empty description="暂无核算数据" /></template>
        </a-table>
      </a-card>

      <a-card title="确认核销（按外部账单原始条目，不聚合）" :bordered="true" style="margin-bottom: 12px">
        <a-table :data="writeoffRawRows" :pagination="false" size="small" :bordered="{ wrapper: true, cell: true }">
          <template #columns>
            <a-table-column title="接口号" data-index="interfaceNo" :width="160" />
            <a-table-column title="产品名称" data-index="productName" :width="160" />
            <a-table-column title="计费量" :width="100">
              <template #cell="{ record }">{{ record.callCount || 0 }}</template>
            </a-table-column>
            <a-table-column title="外部账单金额" :width="150">
              <template #cell="{ record }">{{ formatAmount(record.externalAmount) }}</template>
            </a-table-column>
            <a-table-column title="扣减合同" data-index="contractName" :width="200" />
            <a-table-column title="操作" :width="180">
              <template #cell="{ record }">
                <a-space>
                  <a-button size="small" type="text" :disabled="!!writeoffLocks[`${currentTask?.supplierIds?.[0]}-${currentTask?.timeLabel}`]" @click="confirmWriteoffRow(record)">确认核销</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
          <template #empty><a-empty description="暂无核销条目" /></template>
        </a-table>
      </a-card>

      <div style="text-align: right">
        <a-space>
          <a-button type="primary" :disabled="!currentTask || !!writeoffLocks[`${currentTask?.supplierIds?.[0]}-${currentTask?.timeLabel}`]" @click="confirmAllWriteoff">确认全部核销</a-button>
          <a-button type="outline" @click="detailVisible = false">关闭</a-button>
        </a-space>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useContractStore } from '@/modules/budget/stores/contract'
import { useSettlementFlowStore } from '../stores/settlementFlow'
import StatusTag from '@/components/common/StatusTag.vue'
import DateUtils from '@/utils/dateUtils'
import { getSupplierProductsMock } from '@/modules/external-data/mock/supplierProducts'

type Granularity = 'year'|'quarter'|'month'
type TaskStatus = 'pending'|'running'|'succeeded'|'failed'|'canceled'|'reconcile'|'costing'|'writeoff'|'pending_reimbursement'|'done'
type Stage = 'reconcile'|'costing'|'writeoff'|'pending_reimbursement'|'done'

interface SettlementSummary { budgetAmount: number; actualAmount: number; diffAmount: number; diffRate: number }
interface SettlementSubTask { id: string; taskId: string; supplierId: string; status: TaskStatus; progress: number; contracts: string[]; summary: SettlementSummary }
interface SettlementTask { id: string; taskName?: string; supplierIds: string[]; contractIds: string[]; granularity: Granularity; timeLabel: string; status: TaskStatus; stage?: Stage; archived?: boolean; progress: number; createdBy: string; createdAt: string; summary: SettlementSummary }

const store = useContractStore()
const flowStore = useSettlementFlowStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const tasks = ref<SettlementTask[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })

const filters = reactive<{ suppliers: string[]; contracts: string[]; granularity?: Granularity; timeLabel?: string; status?: TaskStatus }>({ suppliers: [], contracts: [] })

const supplierOptions = computed(() => Array.from(new Set(store.list.map((i: any) => i.supplier).filter(Boolean))))
const contractOptions = computed(() => store.list.map((i: any) => ({ id: String(i.id), contractName: String(i.contractName || i.id), supplier: i.supplier || '—', amount: Number(i.amount) || 0, writtenOffAmount: Number(i.writtenOffAmount) || 0 })))
const filteredContractOptions = computed(() => {
  if (!createForm.supplierId) return contractOptions.value
  return contractOptions.value.filter(c => c.supplier === createForm.supplierId)
})

const displayedTasks = computed(() => tasks.value.filter(t => {
  if (filters.suppliers.length && !filters.suppliers.some(s => t.supplierIds.includes(s))) return false
  if (filters.contracts.length && !filters.contracts.some(c => t.contractIds.includes(c))) return false
  if (filters.granularity && t.granularity !== filters.granularity) return false
  if (filters.timeLabel && t.timeLabel !== filters.timeLabel) return false
  if (filters.status && t.stage !== filters.status) return false
  return true
}))

// PRD I10: 当前结算任务处于流程的哪一步（用于头部 Steps 高亮）
const flowStageIndex = computed(() => {
  // 1=上传账单，2=核算，3=核销，4=报销
  if (displayedTasks.value.length === 0) return 0
  const counts = displayedTasks.value.reduce(
    (acc, t) => {
      if (t.stage === 'reconcile') acc[0] += 1
      else if (t.stage === 'costing') acc[1] += 1
      else if (t.stage === 'writeoff') acc[2] += 1
      else if (t.stage === 'pending_reimbursement' || t.stage === 'done') acc[3] += 1
      return acc
    },
    [0, 0, 0, 0]
  )
  const maxIdx = counts.indexOf(Math.max(...counts))
  return Math.min(3, Math.max(0, maxIdx))
})

// PRD I15: 合作机构维度并发锁集合（同一合作机构同一账期只允许一个核销进行中）
const writeoffLocks = ref<Record<string, number>>({}) // key: supplierId-month
const tryAcquireWriteoffLock = (supplierId: string, month: string): boolean => {
  const key = `${supplierId}-${month}`
  if (writeoffLocks.value[key]) { Message.warning('该机构结算任务正在处理中，请稍后重试'); return false }
  writeoffLocks.value[key] = Date.now()
  return true
}
const releaseWriteoffLock = (supplierId: string, month: string) => { delete writeoffLocks.value[`${supplierId}-${month}`] }

const writeoffLockHint = computed(() => {
  if (!currentTask.value) return ''
  const k = `${currentTask.value.supplierIds?.[0]}-${currentTask.value.timeLabel}`
  return writeoffLocks.value[k] ? '该机构结算任务正在处理中，请稍后重试' : ''
})

// PRD I10: 任务详情步骤面板索引
const detailStep = computed(() => {
  const stage = currentTask.value?.stage
  if (stage === 'reconcile') return 0
  if (stage === 'costing') return 1
  if (stage === 'writeoff') return 2
  if (stage === 'pending_reimbursement' || stage === 'done') return 3
  return 0
})

// PRD I11: 费用核算按内部产品聚合（计费量/减免量/费用求和，外部单价 AVG）
const costingAggregatedRows = computed(() => {
  const lines = (flowStore as any).costingSnapshots?.[`${currentTask.value?.supplierIds?.[0]}-${currentTask.value?.timeLabel}`] || []
  const map = new Map<string, any>()
  for (const l of lines) {
    const key = `${l.productName || l.externalProductCode || '—'}-${l.callMethod || l.type || '线上'}`
    if (!map.has(key)) {
      map.set(key, {
        productName: l.productName || l.externalProductCode || '—',
        type: l.callMethod || l.type || '线上',
        callCount: 0, discount: 0,
        systemAmount: 0, externalAmount: 0,
        systemUnitPrice: l.systemUnitPrice || 0,
        externalPriceSum: 0, externalPriceCount: 0,
        fee: 0
      })
    }
    const it = map.get(key)
    it.callCount += Number(l.callCount || 0)
    it.discount += Number(l.discount || l.discountCount || 0)
    it.systemAmount += Number(l.systemAmount || 0)
    it.externalAmount += Number(l.externalAmount || 0)
    it.fee += Number(l.fee || 0)
    if (Number(l.externalUnitPrice) > 0) {
      it.externalPriceSum += Number(l.externalUnitPrice)
      it.externalPriceCount += 1
    }
  }
  return Array.from(map.values()).map(it => ({
    ...it,
    externalUnitPrice: it.externalPriceCount ? it.externalPriceSum / it.externalPriceCount : 0
  }))
})

// PRD I16: 核销不聚合，按外部账单原始条目
const writeoffRawRows = computed(() => {
  const lines = (flowStore as any).costingSnapshots?.[`${currentTask.value?.supplierIds?.[0]}-${currentTask.value?.timeLabel}`] || []
  return lines.map((l: any) => ({
    interfaceNo: l.interfaceNo || l.externalProductCode || '—',
    productName: l.productName || l.externalProductCode || '—',
    callCount: l.callCount || 0,
    externalAmount: l.externalAmount || 0,
    contractName: currentTask.value?.contractIds?.[0] || '—'
  }))
})

const confirmWriteoffRow = (record: any) => {
  if (!currentTask.value) return
  const sid = currentTask.value.supplierIds?.[0]
  const month = currentTask.value.timeLabel
  if (!sid || !tryAcquireWriteoffLock(sid, month)) return
  Message.success(`已扣减：${record.productName} - ${formatAmount(record.externalAmount)}`)
  setTimeout(() => releaseWriteoffLock(sid, month), 800)
}
const confirmAllWriteoff = () => {
  if (!currentTask.value) return
  const sid = currentTask.value.supplierIds?.[0]
  const month = currentTask.value.timeLabel
  if (!sid || !tryAcquireWriteoffLock(sid, month)) return
  Message.success(`已全部核销 ${writeoffRawRows.value.length} 条`)
  setTimeout(() => releaseWriteoffLock(sid, month), 800)
}

const showCreate = ref(false)
const createFormRef = ref()
// PRD I14: 前端暂存所有字段 + 账单文件
const createForm = reactive<{
  taskName: string; supplierId: string; granularity: Granularity; timeLabel: string; createdBy: string; remark?: string; callMethod?: string
  billFileList: any[]; mappingList: any[]
}>({
  taskName: '', supplierId: '', granularity: 'month',
  timeLabel: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
  createdBy: '管理员', callMethod: '',
  billFileList: [], mappingList: []
})

// PRD I14/I12: 暂存账单解析结果用于 6 字段预览
const previewRows = ref<any[]>([])

const billFileSizeCheck = (file: any) => {
  if (file.size > 20 * 1024 * 1024) { Message.error('账单文件应不超过 20MB'); return false }
  return true
}
const onBillFileChange = (files: any) => {
  // Arco v2.50+ Upload 的 change 事件：fileList
  createForm.billFileList = Array.isArray(files) ? files : (files?.fileList || [])
  const first = createForm.billFileList[0]
  if (!first || !first.file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length <= 1) { previewRows.value = []; return }
    const header = lines[0].split(',').map(h => h.trim())
    const idx = (k: string) => header.findIndex(h => new RegExp(k, 'i').test(h))
    const getIdx = (k: string, fallback: number) => {
      const i = idx(k)
      return i >= 0 ? i : fallback
    }
    const codeIdx = getIdx('productCode|产品编码', 0)
    const nameIdx = getIdx('productName|产品名称', 1)
    const sysAmtIdx = getIdx('systemAmount|系统金额', 4)
    const billAmtIdx = getIdx('amount|账单金额|externalAmount', 5)
    const sysPriceIdx = getIdx('unitPrice|系统单价', -1)
    const extPriceIdx = getIdx('externalUnitPrice|外部单价', 6)
    const sysFreeIdx = getIdx('systemDiscount|内部免费量', -1)
    const extFreeIdx = getIdx('externalDiscount|外部免费量|discountCount|减免次数', 7)
    previewRows.value = lines.slice(1).map((line, i) => {
      const cells = line.split(',')
      return {
        __key: `${i}-${cells[codeIdx]}`,
        productName: cells[nameIdx] || cells[codeIdx] || `条目${i + 1}`,
        systemAmount: Number(cells[sysAmtIdx]) || 0,
        externalAmount: Number(cells[billAmtIdx]) || 0,
        systemUnitPrice: sysPriceIdx >= 0 ? Number(cells[sysPriceIdx]) || 0 : 0,
        externalUnitPrice: extPriceIdx >= 0 ? Number(cells[extPriceIdx]) || 0 : 0,
        systemDiscount: sysFreeIdx >= 0 ? Number(cells[sysFreeIdx]) || 0 : 0,
        externalDiscount: extFreeIdx >= 0 ? Number(cells[extFreeIdx]) || 0 : 0
      }
    })
    // 解析付款账目类型
    const callIdx = header.findIndex(h => /callMethod|付款账目类型|调用方式/i.test(h))
    if (callIdx >= 0) {
      const methods = new Set<string>()
      lines.slice(1).forEach(line => { const v = line.split(',')[callIdx]?.trim(); if (v === '线上' || v === '线下') methods.add(v) })
      if (methods.size === 2) createForm.callMethod = '线上 + 线下'
      else if (methods.size === 1) createForm.callMethod = Array.from(methods)[0]
    }
    Message.success(`已解析 ${previewRows.value.length} 条对账记录（暂存，未持久化）`)
  }
  reader.readAsText(first.file as File)
}

const formatPrice = (n?: number) => { if (n === undefined || n === null) return '—'; return `¥${Number(n).toFixed(4)}` }

const downloadStagedMapping = () => {
  const header = ['接口号', '产品编码', '产品名称', '合作机构']
  const rows = createForm.mappingList.map((m: any) => [m.interfaceNo || '', m.externalProductCode || '', m.externalProductName || '', createForm.supplierId || ''])
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = '已暂存映射.csv'; a.click(); URL.revokeObjectURL(url)
}
const removeStagedMapping = (m: any) => {
  createForm.mappingList = createForm.mappingList.filter((x: any) => x.__id !== m.__id)
}
const createRules = {
  taskName: [{ required: true, message: '请输入任务名称' }],
  supplierId: [{ required: true, message: '请选择合作机构' }],
  timeLabel: [{ required: true, message: '请选择结算周期' }]
}

const currentTask = ref<SettlementTask | null>(null)
const detailVisible = ref(false)
const subtasks = ref<SettlementSubTask[]>([])
const currentStep = ref(0)
const timers = ref<Record<string, number>>({})

const formatAmount = (n?: number) => { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) }
const formatPercent = (n?: number) => { if (n === undefined || n === null) return '—'; return `${(n * 100).toFixed(2)}%` }
const granularityLabel = (g?: Granularity) => g === 'year' ? '年' : g === 'quarter' ? '季' : g === 'month' ? '月' : '—'
const rangeLabel = (monthStr?: string) => {
  if (!monthStr) return '—'
  const [y, m] = monthStr.split('-').map(x => Number(x))
  if (!y || !m) return '—'
  const start = `${y}${String(m).padStart(2,'0')}01`
  const endDate = new Date(y, m, 0)
  const end = `${endDate.getFullYear()}${String(endDate.getMonth()+1).padStart(2,'0')}${String(endDate.getDate()).padStart(2,'0')}`
  return `${start} - ${end}`
}
const pad = (n: number) => String(n).padStart(2,'0')
const monthOptions = computed(() => {
  const arr: Array<{ value: string; label: string }> = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${pad(d.getMonth()+1)}`
    arr.push({ value: v, label: `${d.getFullYear()}${pad(d.getMonth()+1)}` })
  }
  return arr
})
const statusLabel = (s: TaskStatus) => {
  const map: Record<string, string> = { pending: '待执行', running: '执行中', succeeded: '已完成', failed: '失败', canceled: '已取消', reconcile: '待对账', costing: '待核算', writeoff: '待核销', pending_reimbursement: '待报销', done: '已完成' }
  return map[s] || s
}
const statusTag = (s: TaskStatus) => {
  const map: Record<string, string> = { pending: 'default', running: 'warning', succeeded: 'success', failed: 'danger', canceled: 'gray', reconcile: 'primary', costing: 'warning', writeoff: 'purple', pending_reimbursement: 'cyan', done: 'success' }
  return map[s] || 'default'
}

const calcSummaryForContracts = (ids: string[]) => {
  const items = contractOptions.value.filter(c => ids.includes(c.id))
  const budgetAmount = items.reduce((sum, i) => sum + i.amount, 0)
  const actualAmount = items.reduce((sum, i) => sum + i.writtenOffAmount, 0)
  const diffAmount = actualAmount - budgetAmount
  const diffRate = budgetAmount > 0 ? diffAmount / budgetAmount : 0
  return { budgetAmount, actualAmount, diffAmount, diffRate }
}

// PRD R27/R28: 多次结算提醒 + YYYYMM-n 格式
const settlementPeriodStr = computed(() => {
  if (!createForm.timeLabel) return ''
  return createForm.timeLabel.replace('-', '')
})
const settlementCount = computed(() => {
  if (!createForm.supplierId || !createForm.timeLabel) return 0
  return tasks.value.filter(t => t.supplierIds.includes(createForm.supplierId) && t.timeLabel === createForm.timeLabel).length
})
const onSupplierOrPeriodChange = () => { /* 触发 settlementCount 重算 */ }

// PRD R30: 对账单模板下载（含付款账目类型和外部单价字段）
const downloadReconciliationTemplate = () => {
  const header = ['产品编码', '产品名称', '付款账目类型', '调用量', '系统金额', '账单金额', '外部单价', '差异原因']
  const csv = [header.join(','), '示例,示例产品,线上,1000,80.00,80.00,0.0800,'].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = '对账单模板.csv'; a.click(); URL.revokeObjectURL(url)
  Message.success('对账单模板已下载（含付款账目类型和外部单价）')
}
// PRD R31: 历史映射记录下载（含接口号字段）
const downloadMappingRecord = () => {
  const header = ['接口号', '产品编码', '产品名称', '合作机构', '映射字段', '备注']
  const csv = [header.join(','), 'IF-001,XUEXIN_ID_VERIFY,学籍身份核验,学信网,id_no→身份证号,'].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = '历史映射记录.csv'; a.click(); URL.revokeObjectURL(url)
  Message.success('历史映射记录已下载（含接口号字段）')
}
// PRD R31: 映射记录上传
const onMappingUpload = (option: any) => {
  const okType = /\.xlsx?$|\.csv$/i.test(option?.file?.name || option?.name || '')
  if (!okType) { Message.error('请上传 Excel 或 CSV 文件'); return false }
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length <= 1) { Message.success('映射记录为空'); return }
    const header = lines[0].split(',').map(h => h.trim())
    const idx = (k: string) => header.findIndex(h => new RegExp(k, 'i').test(h))
    const iNo = idx('interface|接口号')
    const iCode = idx('productCode|产品编码')
    const iName = idx('productName|产品名称')
    let added = 0
    lines.slice(1).forEach((line, idxRow) => {
      const cells = line.split(',')
      if (iNo < 0 || !cells[iNo]) return
      const interfaceNo = String(cells[iNo] || '').trim()
      if (!interfaceNo) return
      if (createForm.mappingList.some((m: any) => m.interfaceNo === interfaceNo)) return
      createForm.mappingList.push({
        __id: `${Date.now()}-${idxRow}`,
        interfaceNo,
        externalProductCode: iCode >= 0 ? cells[iCode] : '',
        externalProductName: iName >= 0 ? cells[iName] : ''
      })
      added++
    })
    Message.success(`已加载 ${added} 条映射记录到暂存区`)
  }
  const file = option?.file || option
  reader.readAsText(file as File)
  return false
}

const submitCreate = async () => {
  try { await (createFormRef.value as any)?.validate() } catch { Message.error('请完整填写必填项'); return }
  if (!createForm.supplierId || !createForm.timeLabel) { Message.error('请选择合作机构与结算周期'); return }
  // PRD I14: 账单文件必填，未上传直接禁止提交
  if (!createForm.billFileList.length) { Message.error('请先上传外部账单文件'); return }
  // PRD I15: 合作机构 + 账期并发锁
  if (!tryAcquireWriteoffLock(createForm.supplierId, createForm.timeLabel)) return
  releaseWriteoffLock(createForm.supplierId, createForm.timeLabel)
  // PRD R28: 结算周期格式 YYYYMM-n
  const period = createForm.timeLabel.replace('-', '')
  const seq = settlementCount.value + 1
  const periodLabel = `${period}-${seq}`
  const id = `ST-${periodLabel}`
  const summary = { budgetAmount: 0, actualAmount: 0, diffAmount: 0, diffRate: 0 }
  const taskName = createForm.taskName || `结算任务-${createForm.supplierId}-${periodLabel}`
  const task: SettlementTask = { id, taskName, supplierIds: [createForm.supplierId].filter(Boolean), contractIds: [], granularity: createForm.granularity, timeLabel: createForm.timeLabel, status: 'pending', stage: 'reconcile', progress: 0, createdBy: createForm.createdBy, createdAt: new Date().toISOString(), summary }
  tasks.value.unshift(task)
  pagination.total = tasks.value.length
  showCreate.value = false
  // PRD I14: 提交后清理暂存
  createForm.billFileList = []
  createForm.mappingList = []
  previewRows.value = []
  await fillMockSnapshots(task)
  // PRD R34: 4步流程 - 默认从外部对账(step 0)开始
  router.push(`/budget/settlement/task/${id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=0`)
  Message.success('结算任务已创建')
}

const startTask = (task: SettlementTask) => {
  const suppliers = Array.from(new Set(contractOptions.value.filter(c => task.contractIds.includes(c.id)).map(c => c.supplier)))
  subtasks.value = suppliers.map((s, idx) => ({ id: `${task.id}-S${idx+1}`, taskId: task.id, supplierId: s, status: 'running', progress: 0, contracts: contractOptions.value.filter(c => c.supplier === s && task.contractIds.includes(c.id)).map(c => c.id), summary: calcSummaryForContracts(contractOptions.value.filter(c => c.supplier === s && task.contractIds.includes(c.id)).map(c => c.id)) }))
  detailVisible.value = true
  currentTask.value = task
  currentStep.value = 1
  const t = window.setInterval(() => {
    let done = 0
    subtasks.value = subtasks.value.map(st => {
      if (st.status === 'running') {
        const p = Math.min(100, st.progress + Math.floor(10 + Math.random() * 20))
        const status: TaskStatus = p >= 100 ? 'succeeded' : 'running'
        if (status === 'succeeded') done += 1
        return { ...st, progress: p, status }
      }
      if (st.status === 'succeeded') done += 1
      return st
    })
    const percent = Math.floor((done / subtasks.value.length) * 100)
    task.progress = percent
    if (percent >= 100) {
      task.status = 'succeeded'
      currentStep.value = 4
      window.clearInterval(t)
      delete timers.value[task.id]
      Message.success('结算任务已完成，可生成报告')
    }
  }, 1000)
  timers.value[task.id] = t
}

const openDetail = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}`) }
const retrySubtask = (st: SettlementSubTask) => { st.status = 'running'; st.progress = 0 }
const skipSubtask = (st: SettlementSubTask) => { st.status = 'succeeded'; st.progress = 100 }
const generateReport = (task: SettlementTask) => {
  const merged = { id: `SR-${Date.now()}`, taskId: task.id, type: 'merged', summary: task.summary, suppliers: subtasks.value.map(st => ({ supplierId: st.supplierId, summary: st.summary })) }
  const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${merged.id}.json`; a.click(); URL.revokeObjectURL(url)
  Message.success('结算报告已生成并下载')
}
const downloadReport = (task: SettlementTask) => generateReport(task)
const updateData = (task: SettlementTask) => { Message.info('数据更新为占位行为，待后端联调后写回合同域与预算域') }
const cancelTask = (task: SettlementTask) => { task.status = 'canceled'; Message.success('已撤销') }
const archiveTask = (task: SettlementTask) => { task.archived = true; Message.success('已归档') }
const deleteTask = (task: SettlementTask) => { tasks.value = tasks.value.filter(t => t.id !== task.id); pagination.total = tasks.value.length; Message.success('任务已删除') }
const startReconcile = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=0`) }
const startCosting = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=1`) }
const startWriteoff = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=2`) }
const startReimbursement = (task: SettlementTask) => { router.push(`/budget/settlement/task/${task.id}?supplierId=${encodeURIComponent(task.supplierIds[0]||'')}&month=${encodeURIComponent(task.timeLabel)}&taskName=${encodeURIComponent(task.taskName||'')}&step=3`) }
const applyFilter = () => {}
const resetFilter = () => { filters.suppliers = []; filters.contracts = []; filters.granularity = undefined; filters.timeLabel = undefined; filters.status = undefined }
const exportCsv = (filename: string, header: string[], rows: Array<Array<string|number>>) => {
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
const exportCosting = (task: SettlementTask) => {
  const header = ['任务ID','合作机构','产品编码','产品名称','付款账目类型','单价','外部单价','外部对账调用量','最终减免量','对账最终费用','系统费用','差异','状态','行ID']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getCosting(sid, task.timeLabel)
    if (snap?.lines?.length) {
      for (const l of snap.lines) {
        rows.push([task.id, sid, l.productCode, l.productName, l.paymentType || '—', l.unitPrice, (l as any).externalUnitPrice ?? 0, l.usageQty, l.freeDeducted ?? 0, l.amountInclTax, (l as any).systemAmount ?? 0, (Number(l.amountInclTax || 0) - Number((l as any).systemAmount || 0)).toFixed(2), '', l.lineId])
      }
    }
  }
  exportCsv(`costing-detail-${task.id}.csv`, header, rows)
  Message.success('已导出核算明细数据')
}
const exportReconcile = (task: SettlementTask) => {
  const header = ['任务ID','合作机构','产品编码','产品名称','付款账目类型','外部单价','系统金额','账单金额','最终金额','差异原因']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getReconcile(sid, task.timeLabel)
    if (snap?.items?.length) {
      for (const it of snap.items) {
        rows.push([task.id, sid, it.productCode, it.productName || it.productCode, it.callMethod || '—', it.externalUnitPrice ?? 0, it.systemAmount, it.externalAmount, it.finalAmount, it.reason || ''])
      }
    }
  }
  exportCsv(`reconcile-detail-${task.id}.csv`, header, rows)
  Message.success('已导出对账明细数据')
}
const exportWriteoff = (task: SettlementTask) => {
  const header = ['任务ID','合作机构','产品编码','合同ID','核销金额','核销后剩余','时间']
  const rows: Array<Array<string|number>> = []
  for (const sid of task.supplierIds) {
    const snap = flowStore.getWriteoff(sid, task.timeLabel)
    if (snap?.records?.length) {
      for (const r of snap.records) {
        rows.push([task.id, sid, r.productCode, r.contractId, r.amount, r.remainingAfter, r.createdAt])
      }
    }
  }
  exportCsv(`writeoff-detail-${task.id}.csv`, header, rows)
  Message.success('已导出核销明细数据')
}
const enterFlow = (record: any) => { router.push(`/budget/settlement/task/${record.id}`) }
const onPageChange = (page: number) => { pagination.current = page }
onMounted(async () => { await store.fetchContractList({ page: 1, pageSize: 100 }); seedMockTasks() })
const goCreatePage = () => { router.push('/budget/settlement/task/new') }
// PRD R34: 4步流程 - 先生成对账快照，再基于对账快照生成费用核算快照
const fillMockSnapshots = async (task: SettlementTask) => {
  const { getActivePricingMap } = await import('@/modules/budget/api/pricingArchive')
  for (const sid of task.supplierIds) {
    // R4: 伪随机种子生成器（基于 taskId+sid 保证刷新稳定）
    const seeded = (seed: number) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xfffffff) / 0xfffffff } }
    const seedBase = Array.from(`${task.id}-${sid}`).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const seedFn = seeded(seedBase)
    const pricingMap = await getActivePricingMap(sid)
    const supplierProducts = await getSupplierProductsMock(sid)
    const productNameByCode = new Map(supplierProducts.map((p: any) => [p.productCode, p.productName]))
    // 1) 生成外部对账快照
    const productCodes = Object.keys(pricingMap || {})
    const reconItems = productCodes.map((code, index) => {
      const sysPricing = pricingMap[code]
      const systemUsage = Math.floor(seedFn() * 5000) + 500
      const unitPrice = Number(sysPricing?.unitPrice || (sysPricing as any)?.basePrice || 0)
      const system = Number((systemUsage * unitPrice).toFixed(2))
      const factor = 0.98 + seedFn() * 0.06
      const external = Number((system * factor).toFixed(2))
      const final = external
      const externalUnitPrice = unitPrice > 0 ? Number((unitPrice * factor).toFixed(4)) : 0
      const drift = external - system
      const reasonPool = drift < -0.01 ? ['账单优惠', '促销折扣', '协议价变更'] : drift > 0.01 ? ['额外服务', '超出配额', '临时加开'] : ['口径差异', '账期不一致']
      const reason = reasonPool[Math.floor(seedFn() * reasonPool.length)]
      const callMethod = index % 2 === 0 ? '线上' : '线下'
      return { productCode: code, productName: productNameByCode.get(code) || code, systemAmount: system, externalAmount: external, externalUnitPrice, finalAmount: final, finalDiscount: Math.floor(systemUsage * 0.05), callMethod, reason }
    })
    flowStore.setReconcileSnapshot(sid, task.timeLabel, reconItems)
    // 2) 基于对账快照生成费用核算快照
    const costingLines = reconItems.map(item => {
      const code = item.productCode
      const productName = item.productName || productNameByCode.get(code) || code
      const pricing = pricingMap[code]
      const finalPaid = Number(item.finalAmount || 0)
      const freeDeducted = Number(item.finalDiscount || 0)
      const unitPrice = Number(pricing?.unitPrice || (pricing as any)?.basePrice || 0)
      const chargeQty = unitPrice > 0 ? Number((finalPaid / unitPrice).toFixed(0)) : 0
      const systemAmount = Number((chargeQty * unitPrice).toFixed(2))
      const taxRate = pricing?.taxRate ?? 0.06
      const amountExclTax = taxRate > 0 ? Number((finalPaid / (1 + taxRate)).toFixed(2)) : finalPaid
      const taxAmount = Number((finalPaid - amountExclTax).toFixed(2))
      return {
        lineId: `${sid}-${productName}-${task.timeLabel}-costing`,
        supplierId: sid,
        productCode: code,
        productName,
        unit: pricing?.unit,
        unitPrice,
        usageQty: chargeQty,
        chargeQty,
        freeQuota: 0,
        freeDeducted,
        paymentType: item.callMethod,
        externalUnitPrice: item.externalUnitPrice || 0,
        amountExclTax,
        taxRate,
        taxAmount,
        amountInclTax: Number(finalPaid.toFixed(2)),
        systemAmount,
        currency: pricing?.currency || 'CNY',
        verifyStatus: 'pending' as any,
        source: 'reconcile.snapshot'
      } as any
    })
    flowStore.setCostingSnapshot(sid, task.timeLabel, costingLines, {}, {})
    const candidateContracts = contractOptions.value.filter(c => c.supplier === sid)
    const pickContract = (candidateContracts[0]?.id) || (contractOptions.value.find(c => c.supplier === sid)?.id) || (contractOptions.value[0]?.id) || 'C-0001'
    const pendingByProduct = flowStore.pendingAmountByProduct(sid, task.timeLabel)
    const products = Object.keys(pendingByProduct)
    // R4: 伪随机种子基于 taskId+productCode，保证数据稳定
    const seededByProduct = (seed: number) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xfffffff) / 0xfffffff } }
    const productSeedBase = Array.from(`${task.id}`).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    for (const pcode of products.slice(0, Math.min(3, products.length))) {
      const total = pendingByProduct[pcode] || 0
      const seedFn = seededByProduct(productSeedBase + Array.from(`${pcode}`).reduce((a, c) => a + c.charCodeAt(0), 0))
      const firstPct = 0.3 + seedFn() * 0.2
      const firstAmt = Number((total * firstPct).toFixed(2))
      let remaining = Math.max(0, Number((total - firstAmt).toFixed(2)))
      flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: firstAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
      if (remaining > 0) {
        const secondPct = 0.2 + seedFn() * 0.3
        const secondAmt = Number((remaining * secondPct).toFixed(2))
        remaining = Math.max(0, Number((remaining - secondAmt).toFixed(2)))
        flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: secondAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
        // R4: 只有当剩余 > 0 且 < 10% 时写最终一笔，确保写满
        if (remaining > 0) {
          const finalAmt = remaining
          remaining = 0
          flowStore.addWriteoffRecord(sid, task.timeLabel, { productCode: pcode, contractId: pickContract, amount: finalAmt, remainingAfter: remaining, createdAt: new Date().toISOString() })
        }
      }
    }

    // 如果任务阶段在核销之后，标记核销完成
    if (['pending_reimbursement', 'done'].includes(task.stage || '')) {
      flowStore.markWriteoffCompleted(sid, task.timeLabel, true)
    }

    // 如果任务已完成，或处于待报销状态
    if (task.stage === 'done' || task.stage === 'pending_reimbursement') {
      flowStore.setReimbursementSnapshot(sid, task.timeLabel, {
        reimbursementNo: `RB-${task.id}-${sid.slice(-4)}`,
        paymentDate: new Date().toISOString().split('T')[0]
      })
      if (task.stage === 'done') {
        flowStore.markReimbursementCompleted(sid, task.timeLabel, true)
      }
    }
  }
}
const seedMockTasks = () => {
  const allContracts = contractOptions.value
  if (!allContracts.length) return
  const sampleContracts = allContracts.slice(0, Math.min(5, allContracts.length)).map(c => c.id)
  const sampleSuppliers = Array.from(new Set(allContracts.slice(0, 5).map(c => c.supplier))).filter(Boolean)
  const ym = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`
  const yyyymm = ym.replace('-', '')
  const nameFor = (arr: string[]) => arr.length > 1 ? `${arr[0]}等${arr.length}家` : (arr[0] || '未知合作机构')
  // R1: progress必须与stage对应 - reconcile[0,25] costing[25,50] writeoff[50,75] pending_reimbursement[75,100] done[100]
const t1: SettlementTask = { id: `ST-${yyyymm}-1`, taskName: `结算任务-${nameFor(sampleSuppliers)}-${yyyymm}-1`, supplierIds: sampleSuppliers, contractIds: sampleContracts, granularity: 'month', timeLabel: ym, status: 'pending', stage: 'reconcile', progress: 10, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts) }
  const t2: SettlementTask = { id: `ST-${yyyymm}-2`, taskName: `结算任务-${nameFor(sampleSuppliers.slice(0,2))}-${yyyymm}-2`, supplierIds: sampleSuppliers.slice(0,2), contractIds: sampleContracts.slice(0,3), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'costing', progress: 40, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,3)) }
  const t3: SettlementTask = { id: `ST-${yyyymm}-3`, taskName: `结算任务-${nameFor(sampleSuppliers.slice(0,1))}-${yyyymm}-3`, supplierIds: sampleSuppliers.slice(0,1), contractIds: sampleContracts.slice(0,2), granularity: 'month', timeLabel: ym, status: 'succeeded', stage: 'done', progress: 100, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(0,2)) }
  const t4: SettlementTask = { id: `ST-${yyyymm}-4`, taskName: `结算任务-待报销-${nameFor(sampleSuppliers.slice(1,2))}-${yyyymm}-4`, supplierIds: sampleSuppliers.slice(1,2), contractIds: sampleContracts.slice(1,2), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'pending_reimbursement', progress: 80, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(1,2)) }
  const t5: SettlementTask = { id: `ST-${yyyymm}-5`, taskName: `结算任务-待报销2-${nameFor(sampleSuppliers.slice(2,3))}-${yyyymm}-5`, supplierIds: sampleSuppliers.slice(2,3), contractIds: sampleContracts.slice(2,3), granularity: 'month', timeLabel: ym, status: 'pending', stage: 'writeoff', progress: 65, createdBy: '系统', createdAt: new Date().toISOString(), summary: calcSummaryForContracts(sampleContracts.slice(2,3)) }
  tasks.value = [t2, t3, t4, t5, t1]
  pagination.total = tasks.value.length
  // R4: 使用 await 让 snapshot 写完再继续（避免异步竞争）
  Promise.resolve().then(async () => {
    for (const t of tasks.value) { await fillMockSnapshots(t) }
  })
}
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
