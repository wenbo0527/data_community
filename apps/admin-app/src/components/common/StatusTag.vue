<template>
  <a-tag :color="colorMap[status] || 'default'">
    {{ label || status }}
  </a-tag>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
  label?: string
}>()

const colorMap: Record<string, string> = {
  active: 'green',
  inactive: 'gray',
  pending: 'orange',
  error: 'red',
  success: 'blue'
}
</script>
