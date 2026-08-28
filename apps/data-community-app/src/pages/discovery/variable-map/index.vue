<template>
  <div class="variable-map-redirect">
    <!--
      兼容老链接 /discovery/variable-map:统一跳转到特征字典
      (字典页已合并字典视图 + 地图视图,无需独立页面)
    -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => {
  router.replace('discovery/variable-dict')
})
</script>