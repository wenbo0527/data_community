<template>
  <div class="budget-settlement">
    <a-page-header title="结算管理" />
    <a-card>
      <a-steps :current="currentIndex" style="margin-bottom:12px">
        <a-step title="费用核算" />
        <a-step title="外部对账" />
        <a-step title="确认核销" />
      </a-steps>
      <component :is="currentPanel" :rows="rows" />
      <div style="margin-top:12px">
        <a-space>
          <a-button @click="prev" :disabled="currentIndex===0">上一步</a-button>
          <a-button type="primary" @click="next" :disabled="currentIndex===2">下一步</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getContracts } from '../api/contract'
import { useSettlementFlowStore } from '../stores/settlementFlow'
import CostingPanel from '../pages/settlement/CostingPanel.vue'
import ReconcilePanel from '../pages/settlement/ReconcilePanel.vue'
import WriteoffPanel from '../pages/settlement/WriteoffPanel.vue'

const rows = ref<any[]>([])
const flow = useSettlementFlowStore()
const currentIndex = computed(() => flow.currentStepIndex)
const currentPanel = computed(() => currentIndex.value === 0 ? CostingPanel : currentIndex.value === 1 ? ReconcilePanel : WriteoffPanel)
const formatCurrency = (n?: number) => { try { if (n === undefined || n === null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }
const formatDate = (d?: string | Date) => { try { return new Date(d || '').toLocaleDateString() } catch { return '—' } }
const remaining = (r: any) => Math.max(0, Number(r.amount || 0) - Number(r.writtenOffAmount || 0))

const load = async () => {
  const res = await getContracts({ page: 1, pageSize: 100 })
  rows.value = (res.list || []).map((c: any, idx: number) => ({ ...c, writtenOffAmount: Math.round((c.amount || 0) * (0.2 + (idx % 3) * 0.2)) }))
}
const next = () => flow.next()
const prev = () => flow.prev()
onMounted(load)
</script>

<style scoped>
</style>
