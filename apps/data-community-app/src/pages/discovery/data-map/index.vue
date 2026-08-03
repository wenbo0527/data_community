<template>
  <div class="data-map-page">
    <a-page-header title="数据地图" sub-title="浏览所有数据资产、表结构、字段血缘">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>
    <a-card>
      <a-empty description="数据地图正在迁移中,请关注工作台入口。" />
      <a-button type="primary" @click="goWorkbench" style="margin-top: 16px">
        返回工作台
      </a-button>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.data-map-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
</style>