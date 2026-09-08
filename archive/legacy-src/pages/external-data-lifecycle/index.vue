<template>
  <div class="external-data-lifecycle">
    <div class="page-header">
      <h2>外数生命周期总览</h2>
      <p class="page-description">覆盖采购、评估、接入、监控与归档的端到端流程总览</p>
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
  </div>
</template>

<script setup>
// 页面为总览展示，后续可补充统计与跳转入口
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.page-description { color: var(--color-text-2); }
</style>