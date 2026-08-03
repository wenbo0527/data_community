<template>
  <div class="exploration-page">
    <a-page-header title="数据探索" sub-title="客群中心 / 标签体系 / 指标看板">
      <template #extra>
        <a-button type="primary" @click="goWorkbench">
          <template #icon><icon-home /></template>
          返回工作台
        </a-button>
      </template>
    </a-page-header>
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      客群中心、标签体系、指标看板正在迁移中,请关注工作台入口。
    </a-alert>
    <a-button type="primary" @click="goWorkbench">返回工作台</a-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goWorkbench = () => router.push('/dca/workbench')
</script>

<style lang="scss" scoped>
.exploration-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>