<template>
  <div class="budget-detail">
    <a-page-header title="预算详情" @back="goBack" />
    <a-card>
      <a-descriptions :data="descData" :column="2" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '@/api/budget'

const route = useRoute()
const router = useRouter()
const detail = ref<any>({})

onMounted(async () => {
  try {
    const id = String(route.params.id)
    detail.value = await budgetApiService.getBudget(id)
  } catch (err) {
    console.error('加载预算详情失败', err)
    Message.error('加载失败')
  }
})

const descData = computed(() => [
  { label: '预算编号', value: detail.value?.budgetNo || '—' },
  { label: '预算名称', value: detail.value?.budgetName || '—' },
  { label: '预算年度', value: detail.value?.budgetYear || '—' },
  { label: '状态', value: detail.value?.status || '—' },
  { label: '总额', value: formatAmount(detail.value?.totalAmount) },
  { label: '剩余金额', value: formatAmount(detail.value?.remainingAmount) }
])

const formatAmount = (val?: number) => {
  if (!val && val !== 0) return '—'
  return `¥${Number(val).toLocaleString()}`
}

const goBack = () => router.back()
</script>

<style scoped>
.budget-detail { padding: 8px; }
</style>
