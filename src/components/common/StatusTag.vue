<template>
  <a-tag :color="meta.color">
    <slot>{{ meta.label }}</slot>
  </a-tag>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusMeta } from '@/constants/status'

const props = defineProps({
  status: { type: String, required: true },
  dictKey: { type: String, required: true }
})

const meta = computed(() => getStatusMeta(props.dictKey, props.status))
</script>
