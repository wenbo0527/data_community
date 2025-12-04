<template>
  <div class="page-header">
    <div class="page-title">
      <h2>{{ title }}</h2>
    </div>
    <div class="page-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 500;
}
.page-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>

