<template>
  <div class="common-table">
    <a-table
      :data="data"
      :columns="columns"
      :pagination="showPagination ? { pageSize: 10 } : false"
      :bordered="true"
      :stripe="true"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any[]
  columns: any[]
  showPagination?: boolean
}>()
</script>

<style scoped>
.common-table {
  width: 100%;
}
</style>