<template>
  <a-tag :color="meta.color">
    <slot>{{ meta.label }}</slot>
  </a-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getStatusMeta } from '@/constants/status'

const props = defineProps<{ status: string; dictKey: string }>()
const meta = computed(() => getStatusMeta(props.dictKey, props.status))
</script>
