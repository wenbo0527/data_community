<template>
  <div class="sign-report-management">
    <div class="page-header">
      <h3>签报管理</h3>
      <p class="desc">签报信息登记与附件管理，纯登记功能，无审批流程</p>
    </div>

    <a-card class="toolbar" :bordered="true">
      <a-form :model="filters" layout="inline">
        <a-form-item field="keyword" label="搜索">
          <a-input v-model="filters.keyword" allow-clear placeholder="签报号/标题" style="width: 240px" @press-enter="applyFilter" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-button type="primary" @click="openCreate">
            <template #icon><IconPlus /></template>
            新增签报
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="签报列表" :bordered="true" :loading="loading">
      <a-table :data="filteredList" row-key="id" :pagination="pagination" @page-change="onPageChange" @row-click="openDetail">
        <template #columns>
          <a-table-column title="签报号" :width="200">
            <template #cell="{ record }"><a-link>{{ record.reportNo }}</a-link></template>
          </a-table-column>
          <a-table-column title="签报标题" :width="300" data-index="title" />
          <a-table-column title="签报金额（元）" :width="160">
            <template #cell="{ record }">{{ formatAmount(record.totalAmount) }}</template>
          </a-table-column>
          <a-table-column title="剩余未占用金额（元）" :width="200">
            <template #cell="{ record }">
              <span :style="{ color: remainingOf(record) < 0 ? 'var(--color-danger-6)' : 'var(--color-success-6)' }">
                {{ formatAmount(remainingOf(record)) }}
              </span>
              <div style="font-size: 12px; color: var(--color-text-3)">
                占用 {{ formatAmount(occupiedOf(record)) }} / 合同 {{ formatAmount(boundContractOf(record)) }}
              </div>
            </template>
          </a-table-column>
          <a-table-column title="签报日期" :width="140">
            <template #cell="{ record }">{{ record.reportDate || '—' }}</template>
          </a-table-column>
          <a-table-column title="签报发起人" :width="120">
            <template #cell="{ record }">{{ record.initiator || '—' }}</template>
          </a-table-column>
          <a-table-column title="关联合作机构" :width="280">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag v-for="org in (record.partnerOrgs || [])" :key="org.partnerOrg" color="arcoblue">{{ org.partnerOrg }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" :width="180">
            <template #cell="{ record }">{{ formatDate(record.createdAt) }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="140" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click.stop="openDetail(record)">查看</a-button>
              <a-popconfirm content="确定删除此签报？" @ok="deleteReport(record)">
                <a-button type="text" size="small" status="danger" @click.stop>删除</a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
        <template #empty><a-empty description="暂无签报记录" /></template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useSignReportStore } from '../stores/signReport'
import { useContractStore } from '../stores/contract'
import DateUtils from '@/utils/dateUtils'

const router = useRouter()
const store = useSignReportStore()
const contractStore = useContractStore()
const loading = computed(() => store.loading)
const list = computed(() => store.list)
const contractList = computed(() => contractStore.list || [])

const filters = reactive<{ keyword: string }>({ keyword: '' })
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })

const filteredList = computed(() => {
  if (!filters.keyword) return list.value
  const k = filters.keyword.toLowerCase()
  return list.value.filter((r: any) =>
    String(r.reportNo || '').toLowerCase().includes(k) ||
    String(r.title || '').toLowerCase().includes(k)
  )
})

const applyFilter = () => { pagination.current = 1 }
const resetFilter = () => { filters.keyword = '' }
const onPageChange = (page: number) => { pagination.current = page }

const openCreate = () => { router.push('/budget/sign-reports/new') }
const openDetail = (record: any) => { router.push(`/budget/sign-reports/${record.id}`) }

const deleteReport = async (record: any) => {
  const ok = await store.delete(record.id)
  if (ok) {
    Message.success('签报已删除')
    pagination.total = store.total
  } else {
    Message.error('删除失败')
  }
}

const formatAmount = (n?: number) => {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
}
const formatDate = (d?: string) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }

// PRD: 签报剩余未占用金额 = 签报总金额 - 各合作机构初始占用之和 - 已绑定该签报的合同金额之和
const initialOccupiedOf = (record: any) => (record?.partnerOrgs || []).reduce((sum: number, p: any) => sum + (Number(p?.initialOccupiedAmount) || 0), 0)
const occupiedOf = (record: any) => initialOccupiedOf(record)
const boundContractOf = (record: any) => {
  const rno = String(record?.reportNo || '')
  if (!rno) return 0
  return contractList.value.filter((c: any) => String(c?.signReportNo || '') === rno).reduce((sum: number, c: any) => sum + (Number(c?.amount) || 0), 0)
}
const remainingOf = (record: any) => {
  const total = Number(record?.totalAmount || 0)
  return Number((total - initialOccupiedOf(record) - boundContractOf(record)).toFixed(2))
}

onMounted(async () => {
  await store.fetchList()
  // PRD: 同步加载合同列表，用于展示"已绑定合同"金额
  if (!contractStore.list || contractStore.list.length === 0) {
    try { await contractStore.fetchContractList({ page: 1, pageSize: 1000 }) } catch {}
  }
  pagination.total = store.total
})
</script>

<style scoped>
.page-header { margin-bottom: 12px; }
.desc { color: var(--color-text-2); }
.toolbar { margin-bottom: 12px; }
</style>
