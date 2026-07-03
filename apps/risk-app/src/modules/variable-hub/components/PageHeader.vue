<template>
  <a-page-header
    class="dmt-page-header"
    :title="title"
    :subtitle="subtitle"
    :show-back="showBack"
    :breadcrumb="breadcrumb"
  >
    <template #extra>
      <a-space :size="8" wrap>
        <slot name="extra" />
      </a-space>
    </template>
  </a-page-header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  breadcrumb: { type: Array, default: () => [] }
})
</script>

<style scoped>
.dmt-page-header {
  padding: 0 0 16px 0;
  border-bottom: 1px solid var(--color-border-2);
  margin-bottom: 16px;
}
</style>
