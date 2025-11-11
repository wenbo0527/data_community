<template>
  <div class="budget-create">
    <a-card title="新建预算">
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="budgetName" label="预算名称" required>
          <a-input v-model="form.budgetName" placeholder="请输入预算名称" />
        </a-form-item>
        <a-form-item field="budgetYear" label="预算年度" required>
          <a-input-number v-model="form.budgetYear" :min="2000" :max="2100" />
        </a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">提交</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
 </template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { budgetApiService } from '../../api/budget'

const router = useRouter()
const form = reactive({ budgetName: '', budgetYear: new Date().getFullYear() })

const handleSubmit = async () => {
  try {
    await budgetApiService.createBudget({ budgetName: form.budgetName, budgetYear: form.budgetYear })
    Message.success('创建成功')
    router.push('/budget/index')
  } catch (err) {
    console.error('创建预算失败', err)
    Message.error('创建失败')
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.budget-create { max-width: 560px; }
</style>