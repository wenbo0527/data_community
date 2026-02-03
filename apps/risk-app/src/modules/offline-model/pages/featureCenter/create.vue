<template>
  <div class="feature-create-page">
    <a-page-header title="新建特征" @back="goBack" />
    <div class="content">
      <a-empty description="新建特征功能开发中..." />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.feature-create-page {
  padding: 16px;
  background: #fff;
  min-height: 100%;
}
.content {
  padding: 48px;
  display: flex;
  justify-content: center;
}
</style>
