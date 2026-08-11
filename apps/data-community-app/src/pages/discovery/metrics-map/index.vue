<template>
  <div class="metrics-map-redirect">
    <!--
      兼容老链接 /discovery/metrics-map:统一跳转到指标字典
      (字典页已合并字典视图 + 地图视图,无需独立页面)
    -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => {
  router.replace('discovery/indicator-dict')
})
</script>