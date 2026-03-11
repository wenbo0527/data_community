<template>
  <div class="risk-external-data-lifecycle">
    <div class="page-header">
      <h2>外数生命周期（风险）</h2>
      <p class="page-description">在风险模块下还原采购、评估、接入、监控与归档的端到端总览</p>
    </div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="采购阶段" hoverable>
          <p>供应商比选、合同管理、预算审批</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="评估阶段" hoverable>
          <p>效果评估、风险评估、质量评估</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="监控与归档" hoverable>
          <p>运行监控、接口状态、档案管理</p>
        </a-card>
      </a-col>
    </a-row>
    <a-divider />
    <a-space>
      <a-button type="primary" @click="go('/risk/external-data/budget-management')">预算管理</a-button>
      <a-button @click="go('/risk/external-data/evaluation')">外部数据评估</a-button>
      <a-button @click="go('/risk/external-data/monitor')">外部数据监控</a-button>
      <a-button @click="go('/risk/external-data/archive')">档案管理</a-button>
      <a-button @click="go('/risk/external-data/service')">外数数据服务</a-button>
    </a-space>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (path) => router.push(path)
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.page-description { color: var(--color-text-2); }
</style>