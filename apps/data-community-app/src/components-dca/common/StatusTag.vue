<template>
  <a-tag>{{ status }}</a-tag>
</template>
<script setup lang="ts">
defineProps<{ status: string; dictKey?: string }>()
</script>
