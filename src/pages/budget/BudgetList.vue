<template>
  <div class="budget-list">
    <a-table :data="budgetList" :loading="loading" :pagination="pagination" @page-change="onPageChange" row-key="id">
      <a-table-column title="预算编号" data-index="budgetNo" width="140" />
      <a-table-column title="预算名称" data-index="budgetName" :width="220">
        <template #cell="{ record }">
          <a-link @click="handleViewDetail(record)">{{ record.budgetName }}</a-link>
        </template>
      </a-table-column>
      <a-table-column title="预算年度" data-index="budgetYear" width="100" />
      <a-table-column title="状态" data-index="status" width="100" />
      <a-table-column title="剩余金额" :width="120">
        <template #cell="{ record }">¥{{ formatAmount(record.remainingAmount) }}</template>
      </a-table-column>
      <a-table-column title="操作" :width="240">
        <template #cell="{ record }">
          <a-space>
            <a-button size="small" type="text" @click="handleViewDetail(record)">详情</a-button>
            <a-button size="small" type="text" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm content="确认删除该预算？" @ok="() => handleDelete(record)">
              <a-button size="small" status="danger" type="text">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '../../api/budget'

interface BudgetItem {
  id: string
  budgetNo: string
  budgetName: string
  budgetYear: number
  status?: string
  remainingAmount?: number
}

const props = defineProps<{ reloadToken?: number }>()

const router = useRouter()
const loading = ref(false)
const budgetList = ref<BudgetItem[]>([])
const pagination = ref({ current: 1, pageSize: 10, total: 0 })

const formatAmount = (val?: number) => {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString()
}

const loadBudgetList = async () => {
  loading.value = true
  try {
    const resp = await budgetApiService.getBudgets({ page: pagination.value.current, pageSize: pagination.value.pageSize })
    budgetList.value = resp.list || []
    pagination.value.total = (resp as any).total || resp.list?.length || 0
  } catch (err) {
    console.error('加载预算列表失败', err)
    Message.error('预算列表加载失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (page: number) => {
  pagination.value.current = page
  loadBudgetList()
}

const handleViewDetail = (record: BudgetItem) => {
  router.push(`/budget/detail/${record.id}`)
}

const handleEdit = (record: BudgetItem) => {
  router.push(`/budget/edit/${record.id}`)
}

const handleDelete = async (record: BudgetItem) => {
  try {
    await budgetApiService.deleteBudget(record.id)
    Message.success('删除成功')
    loadBudgetList()
  } catch (err) {
    console.error('删除失败', err)
    Message.error('删除失败')
  }
}

watch(() => props.reloadToken, () => {
  loadBudgetList()
})

loadBudgetList()
</script>

<style scoped>
.budget-list { min-height: 200px; }
</style>