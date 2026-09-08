<template>
  <div class="budget-verification-panel">
    <a-form :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item field="budgetId" label="选择预算" required>
        <a-select v-model="form.budgetId" placeholder="请选择预算" allow-clear>
          <a-option v-for="b in budgets" :key="b.id" :value="b.id" :label="`${b.budgetName} (剩余: ¥${formatAmount(b.remainingAmount)})`" />
        </a-select>
      </a-form-item>
      <a-form-item field="projectId" label="关联项目" required>
        <a-input v-model="form.projectId" placeholder="输入项目ID" />
      </a-form-item>
      <a-form-item field="amount" label="核销金额" required>
        <a-input-number v-model="form.amount" :min="0" :precision="2" />
      </a-form-item>
      <a-space>
        <a-button type="primary" html-type="submit">提交核销</a-button>
        <a-button @click="reset">重置</a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '../../../api/budget'

const budgets = ref<any[]>([])
const form = ref({ budgetId: '', projectId: '', amount: 0 })

onMounted(async () => {
  try {
    const resp = await budgetApiService.getBudgets({ page: 1, pageSize: 100 })
    budgets.value = resp.list || []
  } catch (err) {
    console.error('加载预算列表失败', err)
  }
})

const formatAmount = (val?: number) => {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString()
}

const handleSubmit = async () => {
  try {
    await budgetApiService.createVerification({
      budgetId: String(form.value.budgetId),
      projectId: String(form.value.projectId),
      verificationAmount: Number(form.value.amount)
    } as any)
    Message.success('核销提交成功')
    reset()
  } catch (err) {
    console.error('核销失败', err)
    Message.error('核销失败')
  }
}

const reset = () => {
  form.value = { budgetId: '', projectId: '', amount: 0 }
}
</script>

<style scoped>
.budget-verification-panel { max-width: 640px; }
</style>