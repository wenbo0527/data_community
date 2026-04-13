<template>
  <a-table :columns="columns" :data="data" :loading="loading" />
</template>
<script setup>
defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
</script>
