<template>
  <div class="forbidden-page">
    <a-result status="403" title="无权限访问">
      <template #subtitle>
        当前账号无访问权限，请联系管理员授权。
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="goHome">返回首页</a-button>
          <a-button @click="goBack">返回上一页</a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  const from = route.query?.from
  if (from && typeof from === 'string') {
    router.push(from)
    return
  }
  router.back()
}
</script>

<style scoped>
.forbidden-page {
  padding: 24px;
  display: flex;
  justify-content: center;
}
</style>
