<template>
  <div class="budget-edit">
    <a-card title="编辑预算">
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="budgetName" label="预算名称" required>
          <a-input v-model="form.budgetName" />
        </a-form-item>
        <a-form-item field="budgetYear" label="预算年度" required>
          <a-input-number v-model="form.budgetYear" :min="2000" :max="2100" />
        </a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">保存</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
 </template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '../../api/budget'

const route = useRoute()
const router = useRouter()
const form = reactive({ budgetName: '', budgetYear: new Date().getFullYear() })

onMounted(async () => {
  try {
    const id = String(route.params.id)
    const data = await budgetApiService.getBudget(id)
    form.budgetName = (data as any).budgetName
    form.budgetYear = Number((data as any).budgetYear) || new Date().getFullYear()
  } catch (err) {
    console.error('加载预算失败', err)
    Message.error('加载预算失败')
  }
})

const handleSubmit = async () => {
  try {
    const id = String(route.params.id)
    await budgetApiService.updateBudget(id, { budgetName: form.budgetName, budgetYear: form.budgetYear })
    Message.success('保存成功')
    router.push('/budget/index')
  } catch (err) {
    console.error('保存失败', err)
    Message.error('保存失败')
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.budget-edit { max-width: 560px; }
</style>