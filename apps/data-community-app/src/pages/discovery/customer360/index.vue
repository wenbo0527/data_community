<template>
  <div class="customer360-page">
    <a-page-header title="客户 360" sub-title="客户全景视图、字段可见性">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>
    <a-card>
      <a-empty description="客户 360 正在迁移中,请关注工作台入口。" />
      <a-button type="primary" @click="goWorkbench" style="margin-top: 16px">
        返回工作台
      </a-button>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goWorkbench = () => router.push('/dca/workbench')
</script>

<style lang="scss" scoped>
.customer360-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
</style>