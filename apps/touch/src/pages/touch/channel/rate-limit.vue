<template>
  <a-card title="全局频控">
    <a-descriptions :data="items" layout="inline" bordered />
  </a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getRateLimit } from '@/services/channelService'
const items = ref<any[]>([])
async function load() {
  const d = await getRateLimit()
  items.value = [
    { label: '每分钟上限', value: d.perMinute },
    { label: '每小时上限', value: d.perHour },
    { label: '每天上限', value: d.perDay }
  ]
}
load()
</script>
