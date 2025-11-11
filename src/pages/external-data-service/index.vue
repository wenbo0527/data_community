<template>
  <div class="external-data-service">
    <div class="page-header">
      <h2>外数数据服务</h2>
      <p class="page-description">包含服务申请、任务查询、结果展示、陪伴服务等能力</p>
    </div>
    <a-row :gutter="16">
      <a-col :span="12">
        <ServiceApplication />
      </a-col>
      <a-col :span="12">
        <TaskQuery />
      </a-col>
      <a-col :span="12">
        <ResultDisplay />
      </a-col>
      <a-col :span="12">
        <AccompanyService />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import ServiceApplication from './components/ServiceApplication.vue'
import TaskQuery from './components/TaskQuery.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import AccompanyService from './components/AccompanyService.vue'
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.page-description { color: var(--color-text-2); }
</style>